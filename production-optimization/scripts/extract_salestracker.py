#!/usr/bin/env python3
"""Read SalesTracker directly from XLSX/OOXML without modifying the workbook."""

from __future__ import annotations

import argparse
import collections
import datetime as dt
import json
import re
import zipfile
from pathlib import Path
from xml.etree import ElementTree as ET

NS = {"m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
REL_NS = {"r": "http://schemas.openxmlformats.org/package/2006/relationships"}

MAPPING = {
    "OpportunityDate": "Opportunity_date",
    "ProjectName": "Project_Name",
    "Application": "Application",
    "BU": "BU",
    "EndUserName": "EndUser_Name",
    "CustomerName": "Customer Name",
    "SubBU": "Sub_BU",
    "Probability": "Prob %",
    "ScopeRecommendation": "Scope Of Supply Sales Recommendation",
    "ScopeDetails": "Scope of Supply Details",
    "SpecsModel": "Specs or Model",
    "OrderValue": "Order Value",
    "BookPeriod": "Book Period",
    "Discount": "Discount",
    "LeadType": "Lead Type",
    "TechnicalContact": "Technical Contact",
    "CommercialContact": "Commercial Contact",
    "POReference": "PO_Reference",
}


def column_number(cell_ref: str) -> int:
    letters = re.match(r"[A-Z]+", cell_ref).group(0)
    value = 0
    for char in letters:
        value = value * 26 + ord(char) - 64
    return value


def range_bounds(ref: str) -> tuple[int, int, int, int]:
    first, last = ref.split(":")
    first_row = int(re.search(r"\d+", first).group(0))
    last_row = int(re.search(r"\d+", last).group(0))
    return column_number(first), first_row, column_number(last), last_row


def shared_strings(archive: zipfile.ZipFile) -> list[str]:
    if "xl/sharedStrings.xml" not in archive.namelist():
        return []
    root = ET.fromstring(archive.read("xl/sharedStrings.xml"))
    return ["".join(node.text or "" for node in item.findall(".//m:t", NS))
            for item in root.findall("m:si", NS)]


def cell_value(cell: ET.Element, strings: list[str]):
    value_node = cell.find("m:v", NS)
    raw = value_node.text if value_node is not None else None
    cell_type = cell.get("t")
    if cell_type == "inlineStr":
        return "".join(node.text or "" for node in cell.findall(".//m:t", NS))
    if raw is None:
        return None
    if cell_type == "s":
        return strings[int(raw)]
    if cell_type == "b":
        return raw == "1"
    if cell_type in {"str", "e"}:
        return raw
    try:
        number = float(raw)
        return int(number) if number.is_integer() else number
    except ValueError:
        return raw


def excel_datetime(value, date_1904: bool):
    if not isinstance(value, (int, float)) or isinstance(value, bool):
        return value
    epoch = dt.datetime(1904, 1, 1) if date_1904 else dt.datetime(1899, 12, 30)
    return (epoch + dt.timedelta(days=float(value))).isoformat(timespec="seconds") + "Z"


def load_workbook(path: Path):
    with zipfile.ZipFile(path) as archive:
        strings = shared_strings(archive)
        workbook = ET.fromstring(archive.read("xl/workbook.xml"))
        workbook_pr = workbook.find("m:workbookPr", NS)
        date_1904 = workbook_pr is not None and workbook_pr.get("date1904") in {"1", "true"}
        rels = ET.fromstring(archive.read("xl/_rels/workbook.xml.rels"))
        targets = {rel.get("Id"): rel.get("Target") for rel in rels.findall("r:Relationship", REL_NS)}
        sheet_path = None
        relationship_ns = "{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id"
        for sheet in workbook.findall("m:sheets/m:sheet", NS):
            if sheet.get("name") == "Master Sheet":
                target = targets[sheet.get(relationship_ns)].lstrip("/")
                sheet_path = target if target.startswith("xl/") else "xl/" + target
                break
        if not sheet_path:
            raise ValueError("Master Sheet was not found")

        table_node = None
        for name in archive.namelist():
            if name.startswith("xl/tables/table") and name.endswith(".xml"):
                candidate = ET.fromstring(archive.read(name))
                if candidate.get("name") == "SalesTracker":
                    table_node = candidate
                    break
        if table_node is None:
            raise ValueError("SalesTracker table was not found")

        table_ref = table_node.get("ref")
        min_col, min_row, max_col, max_row = range_bounds(table_ref)
        totals = table_node.get("totalsRowShown") in {"1", "true"}
        data_last_row = max_row - 1 if totals else max_row

        sheet = ET.fromstring(archive.read(sheet_path))
        cells = {}
        formulas = set()
        for cell in sheet.findall(".//m:sheetData/m:row/m:c", NS):
            ref = cell.get("r")
            col = column_number(ref)
            row = int(re.search(r"\d+", ref).group(0))
            if min_col <= col <= max_col and min_row <= row <= max_row:
                cells[(row, col)] = cell_value(cell, strings)
                if cell.find("m:f", NS) is not None:
                    formulas.add((row, col))

        headers = [cells.get((min_row, col)) for col in range(min_col, max_col + 1)]
        records = []
        for row in range(min_row + 1, data_last_row + 1):
            values = [cells.get((row, col)) for col in range(min_col, max_col + 1)]
            record = dict(zip(headers, values))
            quote = record.get("Quote_No")
            sequence = record.get("Quote_Seq")
            if quote in (None, "") and sequence in (None, ""):
                continue
            quote = str(quote).strip() if quote is not None else ""
            sequence = int(sequence) if isinstance(sequence, (int, float)) else sequence
            existing_key = record.get("__PowerAppsId__")
            existing_key = str(existing_key).strip() if existing_key not in (None, "") else ""
            # Legacy rows often share a quote number and may not have a Power Apps
            # ID. Include the immutable Excel row number in the fallback key so
            # every source row remains independently traceable and idempotent.
            excel_key = existing_key or "MIGRATION-R" + str(row) + "-" + quote
            migrated = {
                "_sourceExcelRow": row,
                "Title": quote,
                "QuoteNo": quote,
                "QuoteSeq": sequence,
                "ClientRequestId": "MIGRATION:" + excel_key,
                "Revision": 1,
                "ExcelRowKey": excel_key,
            }
            for destination, source in MAPPING.items():
                value = record.get(source)
                if destination == "OpportunityDate":
                    value = excel_datetime(value, date_1904)
                migrated[destination] = value
            records.append(migrated)

        return {
            "sourceFile": path.name,
            "dateSystem": "1904" if date_1904 else "1900",
            "tableRef": table_ref,
            "headers": headers,
            "formulaCellCount": len(formulas),
            "records": records,
        }


def summary(data):
    records = data["records"]
    quotes = [record["QuoteNo"] for record in records]
    sequences = [record["QuoteSeq"] for record in records if isinstance(record["QuoteSeq"], int)]
    keys = [record["ExcelRowKey"] for record in records]
    required = ["QuoteNo", "QuoteSeq", "ClientRequestId", "Revision", "ExcelRowKey",
                "OpportunityDate", "ProjectName", "Application", "BU", "EndUserName",
                "CustomerName", "OrderValue", "Discount"]
    missing = {field: sum(record.get(field) in (None, "") for record in records)
               for field in required}
    invalid_prefix = [quote for quote in quotes if not quote.startswith("MSOL26")]
    sequence_mismatch = [record["QuoteNo"] for record in records
                         if isinstance(record["QuoteSeq"], int)
                         and record["QuoteNo"] != "MSOL26" + str(record["QuoteSeq"])]
    return {
        "sourceFile": data["sourceFile"],
        "dateSystem": data["dateSystem"],
        "tableRef": data["tableRef"],
        "columnCount": len(data["headers"]),
        "recordCount": len(records),
        "formulaCellCount": data["formulaCellCount"],
        "sequenceCount": len(sequences),
        "minimumSequence": min(sequences) if sequences else None,
        "maximumSequence": max(sequences) if sequences else None,
        "nextSequence": max(sequences) + 1 if sequences else None,
        "uniqueQuoteCount": len(set(quotes)),
        "duplicateQuotes": [value for value, count in collections.Counter(quotes).items()
                            if count > 1],
        "uniqueExcelRowKeyCount": len(set(keys)),
        "duplicateExcelRowKeys": [value for value, count in collections.Counter(keys).items()
                                  if count > 1],
        "generatedExcelRowKeyCount": sum(key.startswith("MIGRATION-R") for key in keys),
        "invalidQuotePrefixCount": len(invalid_prefix),
        "sequenceMismatchCount": len(sequence_mismatch),
        "missingRequired": missing,
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("workbook", type=Path)
    parser.add_argument("--records", action="store_true")
    args = parser.parse_args()
    data = load_workbook(args.workbook)
    print(json.dumps(data if args.records else summary(data), ensure_ascii=False,
                     separators=(",", ":") if args.records else None,
                     indent=None if args.records else 2))


if __name__ == "__main__":
    main()
