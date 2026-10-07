import { readFile, writeFile } from "node:fs/promises";

const source = JSON.parse(await readFile(new URL("./reference-sheets.json", import.meta.url), "utf8"));
const customerValues = source.Customer_List.values;
const customerRows = customerValues.slice(1);
const text = (value) => value == null ? "" : String(value).trim();

const customers = [];
const seenCustomers = new Set();
for (const row of customerRows) {
  const title = text(row[2]);
  if (!title || seenCustomers.has(title)) continue;
  seenCustomers.add(title);
  customers.push({
    Title: title,
    AccountManager: text(row[5]) || null,
    Active: "Yes",
    SortOrder: customers.length + 1,
  });
}

// The first 90 records were already verified in SharePoint in the same source order.
const existingCustomerCount = 90;
const remainingCustomers = customers.slice(existingCustomerCount);
const tsvCell = (value) => value == null ? "" : String(value).replace(/[\t\r\n]+/g, " ").trim();
const customerColumns = ["Title", "AccountManager", "Active", "SortOrder"];

const optionValues = source.Lists.values;
const optionColumns = [0, 3, 4, 5, 6, 7, 8, 9, 10, 12, 14, 16];
const options = optionColumns.flatMap((column) => {
  const category = text(optionValues[0][column]);
  return optionValues.slice(1)
    .map((row) => text(row[column]))
    .filter(Boolean)
    .map((title, index) => ({ Title: title, Category: category, ParentValue: null, Active: "Yes", SortOrder: index + 1 }));
});

const report = {
  generatedAt: new Date().toISOString(),
  customerSourceRows: customerRows.length,
  uniqueCustomers: customers.length,
  existingCustomersVerified: existingCustomerCount,
  remainingCustomers: remainingCustomers.length,
  optionCount: options.length,
  optionCategoryCounts: Object.fromEntries([...new Set(options.map((row) => row.Category))].map((category) => [
    category,
    options.filter((row) => row.Category === category).length,
  ])),
};

await writeFile(new URL("./sales-customers-all.json", import.meta.url), `${JSON.stringify(customers, null, 2)}\n`);
await writeFile(new URL("./sales-customers-remaining.tsv", import.meta.url), `${remainingCustomers.map((row) => customerColumns.map((column) => tsvCell(row[column])).join("\t")).join("\n")}\n`);
await writeFile(new URL("./sales-options-expected.json", import.meta.url), `${JSON.stringify(options, null, 2)}\n`);
await writeFile(new URL("./reference-staging-report.json", import.meta.url), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
