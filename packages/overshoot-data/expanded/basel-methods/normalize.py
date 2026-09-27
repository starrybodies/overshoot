"""Offline Basel declared-operation research adapter. NOT approved for publication.

Use the 2023–24 input snapshot already acquired by OVERSHOOT. This adds operation
semantics; it never changes, splits, or duplicates a reported waste quantity.
"""
from __future__ import annotations

import argparse
from collections import defaultdict
from decimal import Decimal
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SOURCE_ID = "basel-national-reporting"
CLASSIFICATION_SOURCE_ID = "basel-annex-iv-legacy"

# Short descriptions are editorial paraphrases of the pre-2030 Annex IV.
DEFINITIONS = [
    ("D1", "Land deposit", "land_disposal", "non_intermediate"),
    ("D2", "Soil treatment", "other_disposal", "non_intermediate"),
    ("D3", "Deep injection", "other_disposal", "non_intermediate"),
    ("D4", "Surface impoundment", "other_disposal", "non_intermediate"),
    ("D5", "Engineered landfill", "land_disposal", "non_intermediate"),
    ("D6", "Inland-water release", "other_disposal", "non_intermediate"),
    ("D7", "Marine release", "other_disposal", "non_intermediate"),
    ("D8", "Biological treatment before disposal", "pre_disposal_treatment", "pre_treatment"),
    ("D9", "Physicochemical treatment before disposal", "pre_disposal_treatment", "pre_treatment"),
    ("D10", "Land-based incineration", "incineration", "non_intermediate"),
    ("D11", "Marine incineration", "incineration", "non_intermediate"),
    ("D12", "Permanent storage", "other_disposal", "non_intermediate"),
    ("D13", "Mixing before disposal", "intermediate", "intermediate"),
    ("D14", "Repackaging before disposal", "intermediate", "intermediate"),
    ("D15", "Storage awaiting disposal", "intermediate", "intermediate"),
    ("R1", "Fuel or energy use", "energy_recovery", "non_intermediate"),
    ("R2", "Solvent recovery", "material_recovery", "non_intermediate"),
    ("R3", "Organic-material recovery", "material_recovery", "non_intermediate"),
    ("R4", "Metal recovery", "material_recovery", "non_intermediate"),
    ("R5", "Inorganic-material recovery", "material_recovery", "non_intermediate"),
    ("R6", "Acid or base regeneration", "material_recovery", "non_intermediate"),
    ("R7", "Pollution-control component recovery", "material_recovery", "non_intermediate"),
    ("R8", "Catalyst-component recovery", "material_recovery", "non_intermediate"),
    ("R9", "Used-oil recovery", "material_recovery", "non_intermediate"),
    ("R10", "Beneficial land treatment", "land_treatment_recovery", "non_intermediate"),
    ("R11", "Use of recovery residues", "material_recovery", "non_intermediate"),
    ("R12", "Exchange before recovery", "intermediate", "intermediate"),
    ("R13", "Accumulation awaiting recovery", "intermediate", "intermediate"),
]
OPERATIONS = {
    code: {
        "code": code, "label": label, "category": category, "stage": stage,
        "annex_section": "A" if code.startswith("D") else "B",
        "source_id": CLASSIFICATION_SOURCE_ID,
    }
    for code, label, category, stage in DEFINITIONS
}

CATEGORIES = {
    "material_recovery": "Declared material recovery",
    "energy_recovery": "Declared energy recovery",
    "land_treatment_recovery": "Declared beneficial land treatment",
    "land_disposal": "Declared land disposal",
    "incineration": "Declared incineration",
    "other_disposal": "Other declared disposal",
    "pre_disposal_treatment": "Treatment before further disposal",
    "intermediate": "Intermediate operation only",
    "multiple_operations": "Multiple operations; mass not allocated",
    "unspecified": "Missing or unresolved operation",
}


def classify(record: dict) -> dict:
    """Classify each record once, retaining raw fields in the caller's record.

    Pipe is the actual source delimiter. We normalize only case/whitespace. A
    placeholder such as R_ or D_ is unknown, never silently a recovery/disposal
    quantity. More than one valid code remains unallocated, even if all are in
    one broad category. Source order is not interpreted as process sequence.
    """
    tokens = [
        token.strip().upper()
        for field in ("disposal_code", "recovery_code")
        for token in (record.get(field) or "").split("|")
        if token.strip()
    ]
    codes = sorted(set(token for token in tokens if token in OPERATIONS),
                   key=lambda c: (c[0], int(c[1:])))
    unknown = sorted(set(token for token in tokens if token not in OPERATIONS))
    if unknown or not codes:
        category, stage = "unspecified", "unresolved"
    elif len(codes) > 1:
        category, stage = "multiple_operations", "unallocated_multiple"
    else:
        category, stage = OPERATIONS[codes[0]]["category"], OPERATIONS[codes[0]]["stage"]
    return {
        "operation_codes": codes,
        "unknown_operation_tokens": unknown,
        "operation_category": category,
        "operation_stage": stage,
        "operation_sequence_known": False,
        "treatment_completion_verified": False,
        "classification_source_id": CLASSIFICATION_SOURCE_ID,
    }


def build(input_path: Path, output: Path) -> dict:
    payload = json.loads(input_path.read_text())
    output.mkdir(parents=True, exist_ok=True)
    (output / "records").mkdir(exist_ok=True)
    groups: dict[tuple, dict] = {}
    countries = defaultdict(list)
    total = Decimal(0)
    seen = set()
    for record in payload["records"]:
        if record["id"] in seen:
            raise ValueError("Duplicate record id: " + record["id"])
        seen.add(record["id"])
        enriched = {**record, **classify(record)}
        # Assert all source fields are byte-for-value unchanged after enrichment.
        assert all(enriched[k] == v for k, v in record.items())
        countries[record["origin"]].append(enriched)
        amount = Decimal(record["original_value"])
        assert amount > 0 and abs(float(amount) - record["tonnes"]) < 0.000001
        total += amount
        key = (record["origin"], record["destination"], record["year"], enriched["operation_category"])
        group = groups.setdefault(key, {"amount": Decimal(0), "record_ids": [], "codes": set()})
        group["amount"] += amount
        group["record_ids"].append(record["id"])
        group["codes"].update(enriched["operation_codes"])
    evidence = [{
        "origin": origin, "destination": destination, "year": year,
        "operation_category": category, "tonnes": float(group["amount"]),
        "exact_tonnes": str(group["amount"]), "record_ids": group["record_ids"],
        "operation_codes_present": sorted(group["codes"]),
        "source_id": SOURCE_ID, "classification_source_id": CLASSIFICATION_SOURCE_ID,
        "unit": "metric tonnes", "treatment_completion_verified": False,
    } for (origin, destination, year, category), group in groups.items()]
    evidence.sort(key=lambda r: (r["year"], r["origin"], r["destination"], r["operation_category"]))
    counted = [rid for r in evidence for rid in r["record_ids"]]
    assert len(counted) == len(seen) == len(set(counted))
    assert sum((g["amount"] for g in groups.values()), Decimal(0)) == total
    original_route_totals = {(r["origin"], r["destination"], r["year"]): r["tonnes"] for r in payload["flows"]}
    reconstructed = defaultdict(Decimal)
    for r in evidence:
        reconstructed[(r["origin"], r["destination"], r["year"])] += Decimal(r["exact_tonnes"])
    assert set(reconstructed) == set(original_route_totals)
    assert all(abs(float(value) - original_route_totals[key]) < 0.000001 for key, value in reconstructed.items())
    metadata = {
        "version": "1.0.0", "source_id": SOURCE_ID,
        "classification_source_id": CLASSIFICATION_SOURCE_ID,
        "status": "blocked", "public_publish_allowed": False,
        "publication_blocker": "Basel website Terms of Use do not grant rights to compile/create derivatives or commercially redistribute. Keep this research artifact offline until reuse permission is resolved.",
        "years": payload["years"], "unit": "metric tonnes",
        "records": len(seen), "route_years": len(reconstructed),
        "reporters": sorted(countries), "operation_groups": len(evidence),
        "input_sha256": hashlib.sha256(input_path.read_bytes()).hexdigest(),
        "method": "One record belongs to one category. Multiple or unresolved operations stay unallocated. Decimal sums use original reported amounts. Source fields and record IDs are unchanged. No Comtrade join, mirror filling, facility inference, or treatment verification.",
    }
    for iso3, records in countries.items():
        (output / "records" / f"{iso3}.json").write_text(json.dumps({"public_publish_allowed": False, "records": records}, separators=(",", ":"), ensure_ascii=False))
    (output / "destinations.json").write_text(json.dumps({**metadata, "evidence": evidence}, separators=(",", ":"), ensure_ascii=False))
    (output / "manifest.json").write_text(json.dumps(metadata, indent=2))
    return metadata


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True, type=Path)
    parser.add_argument("--output", default=ROOT / "offline", type=Path)
    args = parser.parse_args()
    assert classify({"recovery_code": "R12"})["operation_category"] == "intermediate"
    assert classify({"disposal_code": "D9"})["operation_category"] == "pre_disposal_treatment"
    assert classify({"recovery_code": "R4|R12"})["operation_category"] == "multiple_operations"
    assert classify({"disposal_code": "D1|D5"})["operation_category"] == "multiple_operations"
    assert classify({"recovery_code": "R4|R_"})["operation_category"] == "unspecified"
    assert classify({"recovery_code": "\u00a0r12"})["operation_codes"] == ["R12"]
    print(json.dumps(build(args.input, args.output), indent=2))
