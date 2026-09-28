interface TableContract {
  name: string;
  worksheet: string;
  headers: string[];
  columnCount: number;
  formulaPatterns: string[][];
  numberFormatPatterns: string[][];
  columnWidths: number[];
  tableStyle: string;
  showBandedRows: boolean;
  showBandedColumns: boolean;
  showFilterButton: boolean;
  showTotals: boolean;
}

interface SheetContract {
  name: string;
  position: number;
  protected: boolean;
  protectionPaused: boolean;
  usedColumns: number;
  charts: { name: string; type: string }[];
  pivotTables: string[];
  conditionalFormatCount: number;
  print: {
    area: string;
    orientation: string;
    paperSize: string;
    printGridlines: boolean;
    printHeadings: boolean;
  };
}

/** Read-only. Returns the management workbook's structural compatibility contract. */
function main(workbook: ExcelScript.Workbook): string {
  const sheets: SheetContract[] = workbook.getWorksheets().map((sheet, position) => {
    const used = sheet.getUsedRange();
    const protection = sheet.getProtection();
    const page = sheet.getPageLayout();
    return {
      name: sheet.getName(),
      position,
      protected: protection.getProtected(),
      protectionPaused: protection.getIsPaused(),
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
  });

  const tables: TableContract[] = workbook.getTables().map(table => {
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
  });

  const result = JSON.stringify({
    sheetNames: workbook.getWorksheets().map(sheet => sheet.getName()),
    sheets,
    tables,
    names: workbook.getNames().map(item => ({
      name: item.getName(),
      formula: item.getFormula(),
      type: String(item.getType())
    })),
    slicers: workbook.getSlicers().map(slicer => ({
      name: slicer.getName(), caption: slicer.getCaption()
    }))
  });
  console.log(result);
  return result;
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
