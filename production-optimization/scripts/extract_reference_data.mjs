import fs from "node:fs/promises";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const [inputPath, outputDir] = process.argv.slice(2);
if (!inputPath || !outputDir) {
  throw new Error("Usage: node extract_reference_data.mjs <workbook.xlsx> <output-dir>");
}

const workbook = await SpreadsheetFile.importXlsx(await FileBlob.load(inputPath));
await fs.mkdir(outputDir, { recursive: true });

function usedValues(sheetName) {
  const sheet = workbook.worksheets.getItem(sheetName);
  const used = sheet.getUsedRange(true);
  return used?.values ?? [];
}

function normalize(value) {
  return String(value ?? "").trim();
}

function uniqueRows(rows, keyFn) {
  const seen = new Set();
  return rows.filter((row) => {
    const key = keyFn(row).toLocaleLowerCase("en");
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

const customerRows = usedValues("Customer_List");
const customerHeader = customerRows.findIndex((row) =>
  row.some((value) => /cutomername|customer.?name|end.?user/i.test(normalize(value))),
);
if (customerHeader < 0) throw new Error("Customer_List header row was not found");
const normalizedCustomerHeaders = customerRows[customerHeader].map((value) =>
  normalize(value).toLocaleLowerCase("en").replaceAll(/\s+/g, ""),
);
const customerNameColumn = normalizedCustomerHeaders.findIndex((value) =>
  ["cutomername", "customername", "endusername"].includes(value),
);
const accountManagerColumn = normalizedCustomerHeaders.findIndex((value) =>
  ["accountmanger", "accountmanager"].includes(value),
);
if (customerNameColumn < 0) throw new Error("Customer name column was not found");
const customerData = customerRows.slice(customerHeader + 1);
const customers = uniqueRows(
  customerData
    .map((row) => ({
      Title: normalize(row[customerNameColumn]),
      AccountManager:
        accountManagerColumn < 0 ? "" : normalize(row[accountManagerColumn]),
      Active: true,
      SortOrder: 0,
    }))
    .filter((row) => row.Title),
  (row) => row.Title,
).map((row, index) => ({ ...row, SortOrder: index + 1 }));

const listRows = usedValues("Lists");
const headers = (listRows[0] ?? []).map(normalize);
const options = [];
headers.forEach((header, columnIndex) => {
  if (!header || /^column\d*$/i.test(header) || header === "__PowerAppsId__") return;
  let sortOrder = 0;
  listRows.slice(1).forEach((row) => {
    const value = normalize(row[columnIndex]);
    if (!value) return;
    sortOrder += 1;
    options.push({
      Title: value,
      Category: header,
      ParentValue: "",
      Active: true,
      SortOrder: sortOrder,
    });
  });
});
const uniqueOptions = uniqueRows(options, (row) => `${row.Category}\u0000${row.Title}`);

await fs.writeFile(
  `${outputDir}/sales-customers.json`,
  `${JSON.stringify(customers, null, 2)}\n`,
);
await fs.writeFile(
  `${outputDir}/sales-options.json`,
  `${JSON.stringify(uniqueOptions, null, 2)}\n`,
);
await fs.writeFile(
  `${outputDir}/reference-data-summary.json`,
  `${JSON.stringify(
    {
      customerHeaderRow: customerHeader + 1,
      customerCount: customers.length,
      optionHeaders: headers.filter(Boolean),
      optionCount: uniqueOptions.length,
    },
    null,
    2,
  )}\n`,
);

console.log(
  JSON.stringify({ customers: customers.length, options: uniqueOptions.length }),
);
