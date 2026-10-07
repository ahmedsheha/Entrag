interface Difference {
  path: string;
  expected: string;
  actual: string;
}

/**
 * Read-only release gate. Supply the JSON returned by CaptureWorkbookContract.
 * Row counts and data-body values are intentionally excluded from the contract;
 * management-facing structure and reporting objects must match exactly.
 */
function main(workbook: ExcelScript.Workbook, baselineJson: string): string {
  const baseline = JSON.parse(baselineJson) as { [key: string]: unknown };
  const actual = capture(workbook);
  const differences: Difference[] = [];
  compare("$", baseline, actual, differences);
  const result = JSON.stringify({
    status: differences.length === 0 ? "pass" : "blocked",
    differenceCount: differences.length,
    differences: differences.slice(0, 200)
  });
  console.log(result);
  return result;
}

function capture(workbook: ExcelScript.Workbook): { [key: string]: unknown } {
  return {
    sheetNames: workbook.getWorksheets().map(sheet => sheet.getName()),
    sheets: workbook.getWorksheets().map((sheet, position) => {
      const used = sheet.getUsedRange();
      const page = sheet.getPageLayout();
      return {
        name: sheet.getName(),
        position,
        protected: sheet.getProtection().getProtected(),
        protectionPaused: sheet.getProtection().getIsPaused(),
        usedColumns: used ? used.getColumnCount() : 0,
        charts: sheet.getCharts().map(chart => ({
          name: chart.getName(), type: String(chart.getChartType())
        })),
        pivotTables: sheet.getPivotTables().map(pivot => pivot.getName()),
        conditionalFormatCount: used ? used.getConditionalFormats().length : 0,
        print: {
          area: page.getPrintArea(),
          orientation: String(page.getOrientation()),
          paperSize: String(page.getPaperSize()),
          printGridlines: page.getPrintGridlines(),
          printHeadings: page.getPrintHeadings()
        }
      };
    }),
    tables: workbook.getTables().map(table => {
      const body = table.getRangeBetweenHeaderAndTotal();
      const formulas = body.getFormulasR1C1();
      const numberFormats = body.getNumberFormats();
      return {
        name: table.getName(),
        worksheet: table.getWorksheet().getName(),
        headers: table.getHeaderRowRange().getTexts()[0],
        columnCount: table.getColumns().length,
        formulaPatterns: columnPatterns(formulas, true),
        numberFormatPatterns: columnPatterns(numberFormats, false),
        columnWidths: table.getColumns().map(column =>
          column.getRange().getFormat().getColumnWidth()),
        tableStyle: table.getPredefinedTableStyle(),
        showBandedRows: table.getShowBandedRows(),
        showBandedColumns: table.getShowBandedColumns(),
        showFilterButton: table.getShowFilterButton(),
        showTotals: table.getShowTotals()
      };
    }),
    names: workbook.getNames().map(item => ({
      name: item.getName(), formula: item.getFormula(), type: String(item.getType())
    })),
    slicers: workbook.getSlicers().map(slicer => ({
      name: slicer.getName(), caption: slicer.getCaption()
    }))
  };
}

function columnPatterns(
  matrix: (string | number | boolean)[][],
  formulasOnly: boolean
): string[][] {
  if (matrix.length === 0) return [];
  const output: string[][] = [];
  for (let column = 0; column < matrix[0].length; column++) {
    const values = matrix.map(row => row[column])
      .filter(value => !formulasOnly ||
        (typeof value === "string" && value.startsWith("=")))
      .map(value => String(value));
    output.push(Array.from(new Set(values)).sort());
  }
  return output;
}

function compare(path: string, expected: unknown, actual: unknown,
  differences: Difference[]) {
  if (differences.length >= 200) return;
  if (Array.isArray(expected)) {
    if (!Array.isArray(actual) || expected.length !== actual.length) {
      differences.push({ path, expected: short(expected), actual: short(actual) });
      return;
    }
    // Pivot-table names are an object inventory, not a report layout sequence.
    // Compare that inventory by name (including multiplicity). Sheet order,
    // table headers, formula patterns and every other array remain positional.
    // This does NOT verify pivot positions/layout; those need visual acceptance
    // or a separate approved layout baseline.
    const pivotInventory = /^\$\.sheets\[\d+\]\.pivotTables$/.test(path) &&
      expected.every(value => typeof value === "string") &&
      actual.every(value => typeof value === "string");
    const expectedValues: unknown[] = pivotInventory ? expected.slice().sort() : expected;
    const actualValues: unknown[] = pivotInventory ? actual.slice().sort() : actual;
    expectedValues.forEach((value, index) => compare(path + "[" + index + "]",
      value, actualValues[index], differences));
    return;
  }
  if (expected !== null && typeof expected === "object") {
    if (actual === null || typeof actual !== "object" || Array.isArray(actual)) {
      differences.push({ path, expected: short(expected), actual: short(actual) });
      return;
    }
    const expectedObject = expected as { [key: string]: unknown };
    const actualObject = actual as { [key: string]: unknown };
    Object.keys(expectedObject).sort().forEach(key => {
      compare(path + "." + key, expectedObject[key], actualObject[key], differences);
    });
    // JSON.stringify omits properties whose value is undefined. Office Scripts
    // returns undefined for an unset print area, so treat that as absent rather
    // than as a structural workbook change.
    Object.keys(actualObject)
      .filter(key => !(key in expectedObject) && actualObject[key] !== undefined)
      .sort()
      .forEach(key => differences.push({
        path: path + "." + key, expected: "<missing>", actual: short(actualObject[key])
      }));
    return;
  }
  if (expected !== actual) {
    differences.push({ path, expected: short(expected), actual: short(actual) });
  }
}

function short(value: unknown): string {
  const text = JSON.stringify(value);
  return text && text.length > 300 ? text.slice(0, 297) + "..." : text;
}
