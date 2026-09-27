"""Pinned Eurostat destination/treatment snapshots for OVERSHOOT.

Run without arguments to reproduce normalized artifacts from retained bytes.
Use --refresh only to acquire a new release (the manifest is then replaced).
Python 3.10+, pycountry, duckdb. No upstream API needed by the application.
"""
from __future__ import annotations

import argparse
import collections
import datetime as dt
import hashlib
import gzip
import json
import math
from pathlib import Path
import urllib.request

import duckdb
import pycountry

ROOT = Path(__file__).resolve().parent
RAW = ROOT / "raw"
OUT = ROOT / "normalized"
RETRIEVED = "2026-09-19"
API = "https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/"
URLS = {
    "env_wastrt_totals.json": API + "env_wastrt?lang=EN&unit=T&hazard=HAZ_NHAZ&waste=TOTAL&waste=TOT_X_MIN",
    "env_waseleeos.json": API + "env_waseleeos?lang=EN&unit=T",
    "env_wasgt_metadata.html": "https://ec.europa.eu/eurostat/cache/metadata/en/env_wasgt_esms.htm",
    "env_waselee_metadata.html": "https://ec.europa.eu/eurostat/cache/metadata/en/env_waselee_esms.htm",
    "eurostat_copyright.html": "https://ec.europa.eu/eurostat/web/main/help/copyright-notice",
    "weee-country-notes-april-2026.pdf": "https://ec.europa.eu/eurostat/cache/metadata/Annexes/env_waselee_esms_an_WEEE_Country_specific_notes.pdf",
}
SOURCE_IDS = {"env_wastrt": "eurostat-waste-treatment", "env_waseleeos": "eurostat-weee"}
# Eurostat permits commercial statistical reuse for EU, EFTA, and official
# acceding/candidate countries. UK is no longer in these groups; Kosovo is a
# potential candidate, not an official candidate. Do not publish these rows.
WITHHELD = {"UK", "XK"}
TREATMENT_LEAVES = ["RCV_R", "RCV_B", "RCV_E", "DSP_L", "DSP_I", "DSP_OTH"]
WEEE_DESTINATIONS = ["TRT_NAT", "TRT_EU_FOR", "TRT_NEU"]
WEEE_COUNTRY_NOTES = {
    "DEU": "Germany includes treatment abroad in its national-treatment cell for confidentiality. This cell cannot establish domestic treatment geography. Direct exports for primary treatment are excluded.",
    "HUN": "Since 2018 Hungary reports first treatment, such as dismantling or shredding, rather than the ultimate recovery or disposal location.",
    "POL": "Poland excludes whole appliances exported for further treatment from its report. These data do not cover all exported WEEE.",
    "IRL": "Ireland uses estimates for WEEE in mixed metal streams and, where treatment rates are missing, information from similar operators.",
    "LVA": "Latvia cannot separate preparation for reuse from recycling; its reported zero for preparation for reuse is imputed.",
}


def write_json(path: Path, value: object):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, separators=(",", ":")) + "\n")


def iso3(code: str):
    if code.startswith("EU"):
        return code  # An EU aggregate is never silently relabelled WORLD.
    if code == "EL":
        return "GRC"
    if code == "UK":
        return "GBR"
    if code == "XK":
        return "XKX"  # Local explicit code; withheld from the public artifact.
    country = pycountry.countries.get(alpha_2=code)
    if not country:
        raise ValueError(f"Unmapped Eurostat geography: {code}")
    return country.alpha_3


def jsonstat_cells(data: dict):
    """Decode sparse JSON-stat with source cell identity and missing flags."""
    dims, sizes = data["id"], data["size"]
    categories = {
        dim: sorted(data["dimension"][dim]["category"]["index"],
                    key=data["dimension"][dim]["category"]["index"].get)
        for dim in dims
    }
    values, flags = data.get("value", {}), data.get("status", {})
    if isinstance(values, list):
        values = {str(i): v for i, v in enumerate(values) if v is not None}
    if isinstance(flags, list):
        flags = {str(i): v for i, v in enumerate(flags) if v}
    for key in sorted(set(values) | set(flags), key=int):
        index = int(key)
        cell = {}
        for dim, size in reversed(list(zip(dims, sizes))):
            cell[dim] = categories[dim][index % size]
            index //= size
        if index:
            raise ValueError(f"JSON-stat cell {key} is out of bounds")
        yield cell, values.get(key), flags.get(key, ""), int(key)


def normalize(data: dict, dataset: str, snapshot: str):
    rows, withheld = [], collections.Counter()
    source = SOURCE_IDS[dataset]
    label = data["dimension"]["geo"]["category"]["label"]
    for cell, value, flag, index in jsonstat_cells(data):
        assert cell["unit"] == "T"
        if dataset == "env_wastrt":
            assert cell["hazard"] == "HAZ_NHAZ"
            assert cell["waste"] in {"TOTAL", "TOT_X_MIN"}
        if cell["geo"] in WITHHELD:
            withheld[cell["geo"]] += value is not None
            continue
        if dataset == "env_waseleeos" and int(cell["time"]) < 2018:
            continue  # No splicing pre-open-scope history into this series.
        record_id = dataset + "." + ".".join(cell[dim] for dim in data["id"])
        rows.append({
            "record_id": record_id,
            "country": iso3(cell["geo"]),
            "name": label[cell["geo"]],
            "year": int(cell["time"]),
            "scope": cell["waste"],
            "operation": cell["wst_oper"],
            "value": value,
            "unit": "tonnes",
            "original_value": value,
            "original_unit": "T",
            "flag": flag,
            "source_id": source,
            "source_geo": cell["geo"],
            "hazard": cell.get("hazard"),
            "snapshot": snapshot,
            "cell_index": index,
        })
    rows.sort(key=lambda r: (r["country"], r["year"], r["scope"], r["operation"]))
    return rows, dict(withheld)


def grouped(rows: list[dict], data: dict, dataset: str):
    groups = {}
    for row in rows:
        if dataset == "env_waseleeos" and row["scope"] != "EE6":
            continue  # Detailed six-category records remain in the Parquet.
        key = row["country"], row["year"], row["scope"]
        group = groups.setdefault(key, {
            "country": row["country"], "name": row["name"],
            "year": row["year"], "scope": row["scope"],
            "source_id": row["source_id"], "values": {}, "flags": {}, "source_cells": {},
        })
        if row["value"] is not None:
            group["values"][row["operation"]] = row["value"]
        if row["flag"]:
            group["flags"][row["operation"]] = row["flag"]
        group["source_cells"][row["operation"]] = row["record_id"]
    descriptions = []
    if dataset == "env_wastrt":
        descriptions = [
            "Final treatment inside the reporting country, including imported waste and excluding exported waste. It is not the fate of that country's generated waste.",
            "Pre-treatment such as sorting and drying is excluded. Sludges and dredging spoils are measured as dry matter.",
            "TOTAL and TOT_X_MIN are separate, overlapping views. TOT_X_MIN excludes major mineral waste; never add the two scopes together.",
            "TRT is a total. RCV_R_B combines recycling and backfilling; DSP_L_OTH combines landfill and other disposal. Never add totals/combined categories to their children.",
            "Prefer the six separate operations. Where split cells are absent, use the source's combined category, or show the gap; do not derive a confidential split by subtraction.",
            "Country observations can contain rounded quantities; EU aggregates are rounded to 10,000 tonnes. Component sums may differ from the native total; totals are not adjusted.",
            "This is all-sector waste treatment, not municipal solid waste alone. The latest available reference year is 2022; no 2024 values were available in this snapshot.",
        ]
    else:
        descriptions = [
            "Open-scope WEEE reporting, six equipment categories. Only reference years 2018 onwards are included here; reporting before 2019 has a transitional scope.",
            "EE6 is the source total. Large equipment includes photovoltaic panels; never sum EE_LE with its EE_LEXPVP/EE_LE_PVP children.",
            "TRT_NAT, TRT_EU_FOR and TRT_NEU describe treatment in the reporting Member State, another EU Member State, and outside the EU. Specific receiving countries/facilities are not identified.",
            "These treatment locations are reported for WEEE associated with the reporting country's collection system. They are not inferred from UN Comtrade shipments.",
            "Recovery, recycling and preparing for reuse are overlapping performance categories. Never add RCV, RCY_PRP_REU, RCY and PRP_REU as mutually exclusive fates.",
            "Missing destination cells remain absent, including countries that report only treatment at home. Missing is not zero, and no residual is labelled informal disposal.",
            "Separate collection and treatment figures do not describe every item of e-waste generated; uncollected material is not assigned a destination.",
            "Country-specific methodological notes apply: Germany's national-treatment cell includes confidential exports, while Hungary reports first treatment. These are not verified ultimate disposal destinations.",
        ]
    descriptions.extend([
        "Native tonne values and status flags are retained. No interpolation or regional substitution.",
        "Adapted by OVERSHOOT from Eurostat. Eurostat is not responsible for these transformations or interpretations.",
    ])
    operations = data["dimension"]["wst_oper"]["category"]
    scope_labels = data["dimension"]["waste"]["category"]["label"]
    scope_codes = sorted({r["scope"] for r in groups.values()})
    artifact = {
        "schema_version": 1,
        "source_id": SOURCE_IDS[dataset], "dataset": dataset,
        "unit": "tonnes", "original_unit": "T",
        "retrieved_at": RETRIEVED, "source_updated_at": data["updated"],
        "years": sorted({r["year"] for r in groups.values()}),
        "operations": [{"code": code, "label": operations["label"][code]}
                       for code in sorted(operations["index"], key=operations["index"].get)],
        "scopes": [{"code": c, "label": scope_labels[c]} for c in scope_codes],
        "flag_labels": data.get("extension", {}).get("status", {}).get("label", {}),
        "records": list(groups.values()), "notes": descriptions,
    }
    if dataset == "env_waseleeos":
        artifact["country_notes"] = WEEE_COUNTRY_NOTES
        artifact["country_notes_url"] = URLS["weee-country-notes-april-2026.pdf"]
        artifact["geography_exceptions"] = {"DEU": "Do not render a domestic/foreign split; the source suppresses it through aggregation.",
                                             "HUN": "Location refers to first treatment, not final recovery or disposal."}
    return artifact


def source_registry(treatment: dict, weee: dict):
    license_note = (
        "Eurostat statistical-data reuse policy: commercial and non-commercial reuse permitted with attribution under Decision 2011/833/EU. "
        "Exceptions apply to third-party material and countries outside EU/EFTA/official candidates. "
        "UK and Kosovo observations are retained only in the original audit snapshot and withheld from the published normalized artifact. "
        "Adapted by OVERSHOOT; Eurostat is not responsible for the transformations or interpretations."
    )
    output = []
    for artifact in [treatment, weee]:
        dataset = artifact["dataset"]
        dates = f'{min(artifact["years"])}–{max(artifact["years"])}'
        rows = artifact["records"]
        countries = {r["country"] for r in rows if not r["country"].startswith("EU")}
        rawname = "env_wastrt_totals.json" if dataset == "env_wastrt" else "env_waseleeos.json"
        metadata = "env_wasgt_metadata.html" if dataset == "env_wastrt" else "env_waselee_metadata.html"
        output.append({
            "id": artifact["source_id"],
            "title": "Waste treatment by category and operation" if dataset == "env_wastrt" else "WEEE treatment destinations and recovery — open scope",
            "publisher": "Eurostat", "dataset": dataset,
            "edition": "JSON-stat snapshot; native update " + artifact["source_updated_at"],
            "publicationYear": int(artifact["source_updated_at"][:4]),
            "coverageYears": dates,
            "url": f"https://ec.europa.eu/eurostat/databrowser/view/{dataset}/default/table?lang=en",
            "citation": f"Eurostat, {dataset}, DOI: 10.2908/{dataset.upper()}. Accessed {RETRIEVED}. Adapted by OVERSHOOT.",
            "license": license_note,
            "licenseUrl": URLS["eurostat_copyright.html"],
            "retrievedAt": RETRIEVED,
            "method": " ".join(artifact["notes"][:-2]),
            "units": "Native unit T (metric tonne), factor 1. Original values, units, sparse missing cells and status flags retained. No conversion from money, capacity or counts.",
            "transformations": "Filter native T mass unit; map Eurostat country codes to ISO3; retain source cell IDs and raw JSON-stat indices; preserve EU aggregates under their own codes; exclude restricted geographies. " +
                ("Native hazardous + non-hazardous total only; separate TOTAL and TOT_X_MIN views; no subgroup sum or invented residual."
                 if dataset == "env_wastrt" else
                 "Restrict to 2018 onwards; publish EE6 total in the browser and retain detailed categories in Parquet. Collection, recovery and treatment totals are not summed."),
            "geographicCoverage": f"{len(countries)} national reporting geographies, plus source EU aggregates; no global total or substitution.",
            "temporalCoverage": dates + ("; biennial; TOT_X_MIN begins 2010" if dataset == "env_wastrt" else "; annual, open-scope years only"),
            "status": "available", "acquisitionStatus": "acquired",
            "downloadUrls": [URLS[rawname], URLS[metadata]] + ([URLS["weee-country-notes-april-2026.pdf"]] if dataset == "env_waseleeos" else []),
            "notes": " ".join(artifact["notes"][-2:]),
            "topics": ["waste", "treatment", "destinations"] + (["ewaste"] if dataset == "env_waseleeos" else []),
            "accessNote": "Pinned public Eurostat response, normalized without credentials. Upstream APIs are not called by the atlas.",
            "integration": f"Acquired and normalized: {len(rows)} country/year/scope groups with native treatment operation values and flags.",
        })
    return output


def main():
    global RETRIEVED
    parser = argparse.ArgumentParser()
    parser.add_argument("--refresh", action="store_true")
    args = parser.parse_args()
    if args.refresh:
        RETRIEVED = dt.date.today().isoformat()
    elif (ROOT / "snapshots.json").exists():
        RETRIEVED = json.loads((ROOT / "snapshots.json").read_text())[0]["retrieved_at"]
    RAW.mkdir(exist_ok=True)
    OUT.mkdir(exist_ok=True)
    for name, url in URLS.items():
        path = RAW / name
        if args.refresh or not path.exists():
            req = urllib.request.Request(url, headers={"User-Agent": "OVERSHOOT source snapshot/1.0"})
            path.write_bytes(urllib.request.urlopen(req, timeout=60).read())
    snapshots = []
    for name, url in URLS.items():
        data = (RAW / name).read_bytes()
        snapshots.append({"file": "raw/" + name, "url": url, "retrieved_at": RETRIEVED,
                          "sha256": hashlib.sha256(data).hexdigest(), "bytes": len(data)})
    write_json(ROOT / "snapshots.json", snapshots)
    all_rows, artifacts, exclusions = [], {}, {}
    for dataset, rawname, outname in [
        ("env_wastrt", "env_wastrt_totals.json", "treatment.json"),
        ("env_waseleeos", "env_waseleeos.json", "weee-treatment.json"),
    ]:
        data = json.loads((RAW / rawname).read_bytes())
        rows, excluded = normalize(data, dataset, "raw/" + rawname)
        artifact = grouped(rows, data, dataset)
        write_json(OUT / outname, artifact)
        latest_year = collections.defaultdict(int)
        for row in artifact["records"]:
            key = row["country"], row["scope"]
            if "TRT" in row["values"]:
                latest_year[key] = max(latest_year[key], row["year"])
        latest = {**artifact, "records": [row for row in artifact["records"]
                  if row["year"] == latest_year[(row["country"], row["scope"])]]}
        write_json(OUT / outname.replace(".json", "-latest.json"), latest)
        artifacts[dataset] = artifact
        exclusions[dataset] = excluded
        all_rows.extend(rows)
    write_json(OUT / "observations.json", all_rows)
    connection = duckdb.connect()
    # Parameter binding protects paths; COPY target is separately escaped.
    connection.execute("CREATE TABLE observations AS SELECT * FROM read_json_auto(?)", [str(OUT / "observations.json")])
    parquet_path = str(OUT / "observations.parquet").replace("'", "''")
    connection.execute(f"COPY observations TO '{parquet_path}' (FORMAT PARQUET, COMPRESSION ZSTD)")
    # The canonical compact snapshot stays comfortably below repository blob
    # limits. The 7 MB expanded JSON is deterministic, temporary pipeline work.
    with (OUT / "observations.json.gz").open("wb") as target:
        with gzip.GzipFile(fileobj=target, mode="wb", mtime=0) as compressed:
            compressed.write((OUT / "observations.json").read_bytes())
    (OUT / "observations.json").unlink()
    write_json(ROOT / "sources.json", source_registry(artifacts["env_wastrt"], artifacts["env_waseleeos"]))
    write_json(ROOT / "exclusions.json", {"license_geographies": exclusions,
               "weee_year_filter": "Years before 2018 remain in raw but are not published or spliced into the open-scope time series."})
    print(json.dumps({k: {"groups": len(v["records"]), "years": v["years"],
                     "country_count": len({r["country"] for r in v["records"] if not r["country"].startswith("EU")})}
                      for k, v in artifacts.items()}, indent=2))


if __name__ == "__main__":
    main()
