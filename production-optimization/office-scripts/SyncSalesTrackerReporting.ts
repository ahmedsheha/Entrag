interface ReportingRequest {
  opportunityId: number;
  revision: number;
  excelRowKey: string;
  quoteNo: string;
  quoteSeq: number;
  excelDateSystem: "1900" | "1904";
  fields: { [name: string]: string | number | boolean | null };
}

const BUSINESS_COLUMNS = [
  "Opportunity_date", "Project_Name", "Application", "BU", "EndUser_Name",
  "Customer Name", "Sub_BU", "Prob %", "Scope Of Supply Sales Recommendation",
  "Scope of Supply Details", "Specs or Model", "Order Value", "Book Period",
  "Discount", "Lead Type", "Technical Contact", "Commercial Contact",
  "PO_Reference"
];

/**
 * Upserts one SharePoint opportunity into the existing protected SalesTracker table.
 * It never adds, removes, renames, or reorders workbook columns or worksheets.
 */
function main(workbook: ExcelScript.Workbook, sheetPassword: string,
  requestJson: string): string {
  const request = JSON.parse(requestJson) as ReportingRequest;
  validateRequest(request);

  const table = workbook.getTable("SalesTracker");
  if (!table || table.getWorksheet().getName() !== "Master Sheet") {
    throw new Error("SalesTracker must remain on Master Sheet.");
  }
  const headers = table.getHeaderRowRange().getTexts()[0];
  const writable = BUSINESS_COLUMNS.concat(["Quote_No", "Quote_Seq", "__PowerAppsId__"]);
  writable.forEach(name => {
    if (headers.filter(header => header === name).length !== 1) {
      throw new Error("Missing or duplicate fixed-format column: " + name);
    }
  });

  const protection = table.getWorksheet().getProtection();
  if (!protection.getProtected() || !protection.getCanPauseProtection() ||
      protection.getIsPaused() || !protection.checkPassword(sheetPassword)) {
    throw new Error("Worksheet protection or password check failed.");
  }

  const body = table.getRangeBetweenHeaderAndTotal();
  const keyColumn = headers.indexOf("__PowerAppsId__");
  const quoteColumn = headers.indexOf("Quote_No");
  let rowIndex = -1;
  if (table.getRowCount() > 0) {
    const keys = body.getColumn(keyColumn).getTexts();
    rowIndex = keys.findIndex(value => value[0] === request.excelRowKey);
    if (rowIndex < 0) {
      const quotes = body.getColumn(quoteColumn).getTexts();
      rowIndex = quotes.findIndex(value => value[0] === request.quoteNo);
    }
  }

  const values = BUSINESS_COLUMNS.map(name => request.fields[name]);
  const names = BUSINESS_COLUMNS.concat(["Quote_No", "Quote_Seq", "__PowerAppsId__"]);
  values.push(request.quoteNo, request.quoteSeq, request.excelRowKey);
  const columns = names.map(name => headers.indexOf(name));
  const inserted = rowIndex < 0;
  const existingCount = table.getRowCount();
  if (inserted) rowIndex = existingCount;

  let oldValues: (string | number | boolean)[] = [];
  let oldFormulas: (string | number | boolean)[] = [];
  let touched = false;
  try {
    protection.pauseProtection(sheetPassword);
    if (inserted) table.addRow(-1);
    const row = table.getRangeBetweenHeaderAndTotal().getRow(rowIndex);
    oldValues = columns.map(column => row.getCell(0, column).getValue());
    oldFormulas = columns.map(column => row.getCell(0, column).getFormula());

    // Excel normally propagates calculated columns when a table row is added.
    // Restore any missing propagation explicitly without touching input columns.
    if (inserted && existingCount > 0) {
      const previous = table.getRangeBetweenHeaderAndTotal().getRow(existingCount - 1);
      const previousFormulas = previous.getFormulasR1C1()[0];
      for (let column = 0; column < headers.length; column++) {
        const previousFormula = previousFormulas[column];
        const currentFormula = row.getCell(0, column).getFormula();
        if (!columns.includes(column) &&
            typeof previousFormula === "string" && previousFormula.startsWith("=") &&
            !(typeof currentFormula === "string" && currentFormula.startsWith("="))) {
          row.getCell(0, column).setFormulaR1C1(previousFormula);
        }
      }
    }
    touched = true;

    for (let index = 0; index < columns.length; index++) {
      const cell = row.getCell(0, columns[index]);
      const name = names[index];
      const value = values[index];
      if (name === "Opportunity_date") {
        const timestamp = String(value);
        const serial = Date.parse(timestamp) / 86400000 +
          (request.excelDateSystem === "1904" ? 24107 : 25569);
        cell.setValue(serial);
      } else {
        setLiteral(cell, value === null ? "" : value);
      }
    }
  } catch (error) {
    try {
      if (inserted) {
        table.deleteRowsAt(rowIndex, 1);
      } else if (touched) {
        const row = table.getRangeBetweenHeaderAndTotal().getRow(rowIndex);
        for (let index = 0; index < columns.length; index++) {
          const cell = row.getCell(0, columns[index]);
          const oldFormula = oldFormulas[index];
          if (typeof oldFormula === "string" && oldFormula.startsWith("=")) {
            cell.setFormula(oldFormula);
          } else {
            setLiteral(cell, oldValues[index]);
          }
        }
      }
    } catch {
      throw new Error("Reporting sync and rollback failed; inspect " + request.quoteNo + ".");
    }
    throw new Error("Reporting sync failed; no approved format changes were retained.");
  } finally {
    if (protection.getIsPaused()) protection.resumeProtection();
  }

  if (!protection.getProtected() || protection.getIsPaused()) {
    throw new Error("Data was written but worksheet protection requires inspection.");
  }
  return JSON.stringify({ status: "synced", opportunityId: request.opportunityId,
    revision: request.revision, quoteNo: request.quoteNo, inserted });
}

function validateRequest(request: ReportingRequest) {
  if (!request || !Number.isInteger(request.opportunityId) || request.opportunityId < 1 ||
      !Number.isInteger(request.revision) || request.revision < 1 ||
      !request.excelRowKey || !request.quoteNo || !Number.isInteger(request.quoteSeq) ||
      !["1900", "1904"].includes(request.excelDateSystem) || !request.fields) {
    throw new Error("Invalid reporting request.");
  }
  BUSINESS_COLUMNS.forEach(name => {
    if (!Object.prototype.hasOwnProperty.call(request.fields, name)) {
      throw new Error("Missing business field: " + name);
    }
  });
  const timestamp = request.fields["Opportunity_date"];
  if (typeof timestamp !== "string" || !Number.isFinite(Date.parse(timestamp))) {
    throw new Error("Opportunity_date must be an ISO timestamp.");
  }
}

function setLiteral(cell: ExcelScript.Range, value: string | number | boolean) {
  cell.setValue(typeof value === "string" && /^[=+\-']/.test(value) ? "'" + value : value);
}
