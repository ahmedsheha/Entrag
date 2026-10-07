import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const workbookPath = "/Users/sheha/Library/CloudStorage/OneDrive-entrag.com/Final_Sales_Master_Rev12_11 (Uploaded)(xlsx) - Copy.xlsx";
const input = await FileBlob.load(workbookPath);
const workbook = await SpreadsheetFile.importXlsx(input);

const sheet = workbook.worksheets.getItem("Master Sheet");
const used = sheet.getUsedRange();
const values = used.values;
const tables = sheet.tables.items;
const headers = values[1];
const rows = values.slice(2);
const index = Object.fromEntries(headers.map((header, i) => [header, i]));
const nonblank = rows.filter((row) => row[index["Quote_No"]] !== null && String(row[index["Quote_No"]]).trim() !== "");
const quoteNos = nonblank.map((row) => String(row[index["Quote_No"]]).trim());
const ids = nonblank.map((row) => row[index["__PowerAppsId__"]]).filter((v) => v !== null && String(v).trim() !== "");
const seqs = nonblank.map((row) => row[index["Quote_Seq"]]).filter((v) => typeof v === "number" && Number.isFinite(v));
const duplicateValues = (items) => [...new Set(items.filter((item, i) => items.indexOf(item) !== i))];
const quoteGroups = Object.fromEntries([...new Set(quoteNos)].map((quoteNo) => [
  quoteNo,
  nonblank.map((row, i) => ({ row, sheetRow: rows.indexOf(row) + 3, filteredIndex: i + 1 }))
    .filter(({ row }) => String(row[index["Quote_No"]]).trim() === quoteNo)
    .map(({ row, sheetRow }) => ({
      sheetRow,
      quoteSeq: row[index["Quote_Seq"]],
      projectName: row[index["Project_Name"]],
      endUser: row[index["EndUser_Name"]],
      customerName: row[index["Customer Name"]],
      opportunityDate: row[index["Opportunity_date"]],
      stableId: row[index["__PowerAppsId__"]],
    })),
]));
const duplicateGroups = Object.fromEntries(Object.entries(quoteGroups).filter(([, group]) => group.length > 1));
const formulas = used.formulas;
const formulaCounts = Object.fromEntries(headers.map((header, column) => [
  header,
  formulas.slice(2).filter((row) => typeof row[column] === "string" && row[column].startsWith("=")).length,
]));

console.log(JSON.stringify({
  sheetNames: workbook.worksheets.items.map((s) => s.name),
  usedRows: values.length,
  usedColumns: values[0]?.length ?? 0,
  firstThreeRows: values.slice(0, 3),
  nativeTables: tables.map((table) => ({
    name: table.name,
    headers: table.getHeaderRowRange().values,
    dataRowCount: table.getDataRows().values.length,
  })),
  migrationStats: {
    physicalDataRows: rows.length,
    nonblankQuoteRows: nonblank.length,
    blankQuoteRows: rows.length - nonblank.length,
    uniqueQuoteNos: new Set(quoteNos).size,
    duplicateQuoteNos: duplicateValues(quoteNos),
    stableIdCount: ids.length,
    uniqueStableIds: new Set(ids.map(String)).size,
    duplicateStableIds: duplicateValues(ids.map(String)),
    numericQuoteSeqCount: seqs.length,
    maxQuoteSeq: seqs.length ? Math.max(...seqs) : null,
    quoteFrequency: Object.fromEntries(Object.entries(duplicateGroups).map(([quote, group]) => [quote, group.length])),
    duplicateGroups,
    formulaCounts,
  },
}, null, 2));
