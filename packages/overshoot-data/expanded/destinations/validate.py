"""Validate lineage, units, sparse cells, geography and native treatment sums."""
import collections
import gzip
import hashlib
import json
import math
from pathlib import Path
import unittest

import duckdb
from acquire import ROOT, OUT, RAW, SOURCE_IDS, TREATMENT_LEAVES, WEEE_DESTINATIONS, jsonstat_cells

OBS = json.load(gzip.open(OUT / "observations.json.gz", "rt"))
TREATMENT = json.loads((OUT / "treatment.json").read_text())
WEEE = json.loads((OUT / "weee-treatment.json").read_text())
SOURCES = json.loads((ROOT / "sources.json").read_text())


class DestinationSnapshotTests(unittest.TestCase):
    def test_exact_lineage_and_units(self):
        """Every normalized mass reconstructs an actual pinned source cell."""
        caches = {}
        seen = set()
        for row in OBS:
            self.assertNotIn(row["record_id"], seen)
            seen.add(row["record_id"])
            self.assertIn(row["source_id"], {s["id"] for s in SOURCES})
            if row["snapshot"] not in caches:
                data = json.loads((ROOT / row["snapshot"]).read_text())
                caches[row["snapshot"]] = {
                    index: (cell, value, flag) for cell, value, flag, index in jsonstat_cells(data)
                }
            cell, value, flag = caches[row["snapshot"]][row["cell_index"]]
            self.assertEqual(row["value"], value)
            self.assertEqual(row["original_value"], value)
            self.assertEqual(row["original_unit"], "T")
            self.assertEqual(row["unit"], "tonnes")
            self.assertEqual(row["flag"], flag)
            self.assertEqual(row["year"], int(cell["time"]))
            if value is not None:
                self.assertTrue(math.isfinite(value) and value >= 0)

    def test_missing_is_not_zero_and_overlaps_are_not_added(self):
        turkey = next(r for r in TREATMENT["records"] if r["country"] == "TUR" and r["year"] == 2022 and r["scope"] == "TOT_X_MIN")
        self.assertNotIn("DSP_I", turkey["values"])
        self.assertEqual(turkey["flags"]["DSP_I"], "|C")
        self.assertGreater(sum(r["value"] is None for r in OBS), 0)
        belgium = next(r for r in TREATMENT["records"] if r["country"] == "BEL" and r["year"] == 2022 and r["scope"] == "TOTAL")
        values = belgium["values"]
        self.assertEqual(values["TRT"], sum(values[k] for k in TREATMENT_LEAVES))
        self.assertGreater(sum(values.values()), values["TRT"] * 2)
        self.assertEqual(values["RCV_R_B"], values["RCV_R"] + values["RCV_B"])

    def test_destination_examples_and_geography_exceptions(self):
        ireland = next(r for r in WEEE["records"] if r["country"] == "IRL" and r["year"] == 2023)
        self.assertEqual(ireland["values"]["TRT"], 63946)
        self.assertEqual({k: ireland["values"][k] for k in WEEE_DESTINATIONS},
                         {"TRT_NAT": 40532, "TRT_EU_FOR": 1841, "TRT_NEU": 21573})
        germany = next(r for r in WEEE["records"] if r["country"] == "DEU" and r["year"] == 2023)
        self.assertNotIn("TRT_NEU", germany["values"])
        self.assertIn("DEU", WEEE["geography_exceptions"])
        self.assertIn("confidentiality", WEEE["country_notes"]["DEU"])
        self.assertEqual(max(r["year"] for r in WEEE["records"] if r["country"] == "SWE"), 2021)
        self.assertTrue(all(r["year"] >= 2018 for r in OBS if r["source_id"] == "eurostat-weee"))
        self.assertTrue(all(r["country"] not in {"GBR", "XKX", "WORLD"} for r in OBS))

    def test_snapshots_and_parquet_reproduce(self):
        for snapshot in json.loads((ROOT / "snapshots.json").read_text()):
            data = (ROOT / snapshot["file"]).read_bytes()
            self.assertEqual(len(data), snapshot["bytes"])
            self.assertEqual(hashlib.sha256(data).hexdigest(), snapshot["sha256"])
        con = duckdb.connect()
        count, missing = con.execute(
            "SELECT count(*), count(*) FILTER (WHERE value IS NULL) FROM read_parquet(?)",
            [str(OUT / "observations.parquet")]).fetchone()
        self.assertEqual(count, len(OBS))
        self.assertEqual(missing, sum(r["value"] is None for r in OBS))


def closure_report(data, codes):
    differences, complete, incomplete = [], 0, 0
    for row in data["records"]:
        values = row["values"]
        if not all(k in values for k in ["TRT", *codes]):
            incomplete += 1
            continue
        complete += 1
        difference = values["TRT"] - sum(values[k] for k in codes)
        if difference:
            differences.append({"country": row["country"], "year": row["year"], "scope": row["scope"],
                                "reported_total_minus_components_tonnes": difference})
    return {"complete_groups": complete, "incomplete_groups": incomplete,
            "rounding_differences": differences,
            "maximum_absolute_difference": max([abs(r["reported_total_minus_components_tonnes"]) for r in differences] or [0])}


if __name__ == "__main__":
    suite = unittest.defaultTestLoader.loadTestsFromTestCase(DestinationSnapshotTests)
    result = unittest.TextTestRunner(verbosity=2).run(suite)
    if not result.wasSuccessful():
        raise SystemExit(1)
    report = {"tests_passed": result.testsRun, "canonical_observations": len(OBS),
              "non_missing_values": sum(r["value"] is not None for r in OBS),
              "missing_with_status": sum(r["value"] is None for r in OBS),
              "source_observations": dict(collections.Counter(r["source_id"] for r in OBS)),
              "treatment_closure": closure_report(TREATMENT, TREATMENT_LEAVES),
              "weee_destination_closure": closure_report(WEEE, WEEE_DESTINATIONS),
              "note": "Native totals are preserved. Rounding differences are documented, not filled into invented fates; incomplete confidential splits stay incomplete."}
    (ROOT / "validation.json").write_text(json.dumps(report, indent=2) + "\n")
    print(json.dumps({k: v for k, v in report.items() if not k.endswith("closure")}, indent=2))
