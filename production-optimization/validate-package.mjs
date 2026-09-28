import { readFile } from "node:fs/promises";

const files = {
  schema: "production-optimization/sharepoint-schema.md",
  flows: "production-optimization/power-automate-build.md",
  fx: "production-optimization/power-fx.md",
  sync: "production-optimization/office-scripts/SyncSalesTrackerReporting.ts",
  capture: "production-optimization/office-scripts/CaptureWorkbookContract.ts",
  compare: "production-optimization/office-scripts/CompareWorkbookContract.ts"
};

const text = Object.fromEntries(await Promise.all(Object.entries(files).map(
  async ([key, path]) => [key, await readFile(path, "utf8")]
)));

const requiredColumns = [
  "QuoteNo", "QuoteSeq", "ClientRequestId", "Revision", "ExcelRowKey",
  "OpportunityDate", "ProjectName", "Application", "BU", "EndUserName",
  "CustomerName", "SubBU", "Probability", "ScopeRecommendation",
  "ScopeDetails", "SpecsModel", "OrderValue", "BookPeriod", "Discount",
  "LeadType", "TechnicalContact", "CommercialContact", "POReference"
];

const failures = [];
for (const column of requiredColumns) {
  if (!text.schema.includes(`| ${column} |`)) failures.push(`schema: ${column}`);
}
for (const token of ["IF-MATCH", "412", "degree `1`", "ClientRequestId"]) {
  if (!text.flows.includes(token)) failures.push(`flow contract: ${token}`);
}
for (const forbidden of ["Max(SalesTracker", "Refresh(SalesTracker)",
  "Patch(SalesTracker", "Office365Outlook.SendEmailV2"] ) {
  if (!text.fx.includes(forbidden)) {
    failures.push(`Power Fx removal rule: ${forbidden}`);
  }
}
for (const token of ["finally", "resumeProtection", "setFormulaR1C1",
  "__PowerAppsId__", "Customer Name", "PO_Reference"]) {
  if (!text.sync.includes(token)) failures.push(`Excel sync guard: ${token}`);
}
for (const token of ["sheetNames", "formulaPatterns", "numberFormatPatterns",
  "getSlicers", "getPrintArea", "getProtected"]) {
  if (!text.capture.includes(token) || !text.compare.includes(token)) {
    failures.push(`workbook contract: ${token}`);
  }
}

if (failures.length) {
  console.error(JSON.stringify({ status: "failed", failures }, null, 2));
  process.exit(1);
}
console.log(JSON.stringify({ status: "passed", checks: 49 }, null, 2));
