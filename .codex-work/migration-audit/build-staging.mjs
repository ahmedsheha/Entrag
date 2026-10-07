import { createHash } from "node:crypto";
import { writeFile } from "node:fs/promises";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const workbookPath = "/Users/sheha/Library/CloudStorage/OneDrive-entrag.com/Final_Sales_Master_Rev12_11 (Uploaded)(xlsx) - Copy.xlsx";
const outputPath = new URL("./sales-opportunities-staging.json", import.meta.url);
const reportPath = new URL("./sales-opportunities-staging-report.json", import.meta.url);
const tsvPath = new URL("./sales-opportunities-grid-import.tsv", import.meta.url);

const input = await FileBlob.load(workbookPath);
const workbook = await SpreadsheetFile.importXlsx(input);
const sheet = workbook.worksheets.getItem("Master Sheet");
const values = sheet.getUsedRange().values;
const headers = values[1];
const index = Object.fromEntries(headers.map((header, column) => [header, column]));

const text = (value) => value == null ? "" : String(value).trim();
const nullableText = (value) => text(value) || null;
const finiteNumber = (value) => {
  if (value == null || text(value) === "") return null;
  const cleaned = typeof value === "string" ? value.replaceAll(",", "").replace(/%$/, "") : value;
  const number = Number(cleaned);
  return Number.isFinite(number) ? number : null;
};
const excelDateToIso = (value) => {
  if (value == null || text(value) === "") return null;
  if (typeof value === "number" && Number.isFinite(value)) {
    const cairoWallClockAsUtc = Date.UTC(1899, 11, 30) + value * 86400000;
    const approximate = new Date(cairoWallClockAsUtc);
    const parts = Object.fromEntries(new Intl.DateTimeFormat("en-CA", {
      timeZone: "Africa/Cairo",
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23",
    }).formatToParts(approximate).filter((part) => part.type !== "literal").map((part) => [part.type, Number(part.value)]));
    const cairoOffset = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second) - approximate.getTime();
    return new Date(cairoWallClockAsUtc - cairoOffset).toISOString();
  }
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? null : date.toISOString();
};
const deterministicGuid = (seed) => {
  const bytes = Buffer.from(createHash("sha256").update(seed).digest().subarray(0, 16));
  bytes[6] = (bytes[6] & 0x0f) | 0x50;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = bytes.toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
};

const records = [];
const warnings = [];
for (let rowIndex = 2; rowIndex < values.length; rowIndex += 1) {
  const row = values[rowIndex];
  const quoteNo = text(row[index.Quote_No]);
  if (!quoteNo) continue;

  const sheetRow = rowIndex + 1;
  const projectName = text(row[index.Project_Name]);
  const endUserName = text(row[index.EndUser_Name]);
  const customerName = text(row[index["Customer Name"]]) || endUserName;
  const existingId = text(row[index.__PowerAppsId__]);
  const excelRowKey = existingId || deterministicGuid([
    "SalesTracker",
    sheetRow,
    quoteNo,
    projectName,
    text(row[index.Opportunity_date]),
  ].join("|"));
  const quoteSeq = finiteNumber(row[index.Quote_Seq]);
  const opportunityDate = excelDateToIso(row[index.Opportunity_date]);
  const probability = finiteNumber(row[index["Prob %"]]);
  const orderValue = finiteNumber(row[index["Order Value"]]);
  const discountRaw = row[index.Discount];
  let discount = finiteNumber(discountRaw);
  if (typeof discountRaw === "string" && discountRaw.trim().endsWith("%") && discount != null) {
    discount /= 100;
  }

  const record = {
    sourceSheet: "Master Sheet",
    sourceTable: "SalesTracker",
    sourceRow: sheetRow,
    Title: `${quoteNo} - ${projectName || "Opportunity"}`.slice(0, 255),
    QuoteNo: quoteNo,
    QuoteSeq: quoteSeq,
    ClientRequestId: `migration-${excelRowKey}`,
    ExcelRowKey: excelRowKey,
    ProjectName: projectName.slice(0, 255),
    ProjectNameRaw: projectName.length > 255 ? projectName : null,
    POReference: nullableText(row[index.PO_Reference]),
    Revision: 1,
    Application: nullableText(row[index.Application]),
    BU: text(row[index.BU]),
    EndUserName: endUserName,
    CustomerName: customerName,
    SubBU: nullableText(row[index.Sub_BU]),
    ScopeRecommendation: nullableText(row[index["Scope Of Supply Sales Recommendation"]]),
    SpecsModel: nullableText(row[index["Specs or Model"]]),
    BookPeriod: nullableText(row[index["Book Period"]]),
    LeadType: nullableText(row[index["Lead Type"]]),
    TechnicalContact: nullableText(row[index["Technical Contact"]]),
    CommercialContact: nullableText(row[index["Commercial Contact"]]),
    OpportunityDate: opportunityDate,
    Probability: probability,
    ScopeDetails: nullableText(row[index["Scope of Supply Details"]]),
    OrderValue: orderValue,
    OrderValueRaw: text(row[index["Order Value"]]) && orderValue == null ? text(row[index["Order Value"]]) : null,
    Discount: discount,
    DiscountRaw: text(discountRaw) && discount == null ? text(discountRaw) : null,
  };

  for (const field of ["ProjectName", "BU", "EndUserName", "CustomerName"]) {
    if (!record[field]) warnings.push({ sourceRow: sheetRow, field, issue: "required source value is blank" });
  }
  for (const [field, source] of [["OpportunityDate", row[index.Opportunity_date]], ["OrderValue", row[index["Order Value"]]], ["Probability", row[index["Prob %"]]], ["Discount", discountRaw]]) {
    if (text(source) && record[field] == null) warnings.push({ sourceRow: sheetRow, field, issue: `could not convert value: ${text(source)}` });
  }
  records.push(record);
}

const duplicateValues = (items) => [...new Set(items.filter((item, i) => items.indexOf(item) !== i))];
const report = {
  generatedAt: new Date().toISOString(),
  workbookPath,
  recordCount: records.length,
  existingExcelRowKeyCount: records.filter((record) => !record.ClientRequestId.startsWith("migration-") ? true : values[record.sourceRow - 1][index.__PowerAppsId__]).length,
  generatedExcelRowKeyCount: records.filter((record) => !text(values[record.sourceRow - 1][index.__PowerAppsId__])).length,
  uniqueQuoteNoCount: new Set(records.map((record) => record.QuoteNo)).size,
  duplicateQuoteNos: duplicateValues(records.map((record) => record.QuoteNo)),
  duplicateExcelRowKeys: duplicateValues(records.map((record) => record.ExcelRowKey)),
  duplicateClientRequestIds: duplicateValues(records.map((record) => record.ClientRequestId)),
  msol26Records: records.filter((record) => record.QuoteNo.startsWith("MSOL26")).map((record) => ({ sourceRow: record.sourceRow, quoteNo: record.QuoteNo, quoteSeq: record.QuoteSeq })),
  maxQuoteSeq: Math.max(0, ...records.map((record) => record.QuoteSeq).filter(Number.isFinite)),
  overlengthProjectNames: records.filter((record) => record.ProjectNameRaw).map((record) => ({
    sourceRow: record.sourceRow,
    excelRowKey: record.ExcelRowKey,
    indexedLength: record.ProjectName.length,
    fullLength: record.ProjectNameRaw.length,
  })),
  warnings,
};

await writeFile(outputPath, `${JSON.stringify(records, null, 2)}\n`);
await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);
const gridColumns = [
  "Title", "QuoteNo", "QuoteSeq", "ClientRequestId", "ExcelRowKey", "ProjectName", "POReference", "Revision",
  "Application", "BU", "ScopeDetails", "EndUserName", "CustomerName", "SubBU", "ScopeRecommendation", "SpecsModel",
  "BookPeriod", "LeadType", "TechnicalContact", "CommercialContact", "OpportunityDate", "Probability", "OrderValue",
  "Discount", "OrderValueRaw", "DiscountRaw", "ProjectNameRaw",
];
const tsvCell = (value) => value == null ? "" : String(value).replace(/[\t\r\n]+/g, " ").trim();
await writeFile(tsvPath, `${records.map((record) => gridColumns.map((column) => tsvCell(record[column])).join("\t")).join("\n")}\n`);
console.log(JSON.stringify(report, null, 2));
