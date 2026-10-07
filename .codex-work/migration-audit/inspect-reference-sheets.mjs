import { writeFile } from "node:fs/promises";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const workbookPath = "/Users/sheha/Library/CloudStorage/OneDrive-entrag.com/Final_Sales_Master_Rev12_11 (Uploaded)(xlsx) - Copy.xlsx";
const workbook = await SpreadsheetFile.importXlsx(await FileBlob.load(workbookPath));
const output = Object.fromEntries(["Customer_List", "Lists"].map((name) => {
  const values = workbook.worksheets.getItem(name).getUsedRange().values;
  return [name, { rowCount: values.length, columnCount: values[0]?.length ?? 0, values }];
}));

await writeFile(new URL("./reference-sheets.json", import.meta.url), `${JSON.stringify(output, null, 2)}\n`);
const preview = Object.fromEntries(Object.entries(output).map(([name, data]) => [name, {
  rowCount: data.rowCount,
  columnCount: data.columnCount,
  preview: data.values.slice(0, 10),
}]));
console.log(JSON.stringify(preview, null, 2));
