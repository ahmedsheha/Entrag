interface ReportingRequest {
  opportunityId: number;
  revision: number;
  excelRowKey: string;
  quoteNo: string;
  quoteSeq: number | null;
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

// Customer Name is calculated in the fixed report. Preserve its formula or a
// manager's manual exception on existing rows; never synchronize this cell.
const INPUT_COLUMNS = BUSINESS_COLUMNS.filter(name => name !== "Customer Name");

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
  let rowIndex = -1;
  if (table.getRowCount() > 0) {
    const keys = body.getColumn(keyColumn).getTexts();
    const matches = keys.map((value, index) => value[0] === request.excelRowKey ? index : -1)
      .filter(index => index >= 0);
    if (matches.length > 1) throw new Error("Duplicate stable Excel row identifier; no cells changed.");
    rowIndex = matches.length === 1 ? matches[0] : -1;
  }

  const values = INPUT_COLUMNS.map(name => request.fields[name]);
  const names = INPUT_COLUMNS.concat(["Quote_No", "Quote_Seq", "__PowerAppsId__"]);
  values.push(request.quoteNo, request.quoteSeq, request.excelRowKey);
  const columns = names.map(name => headers.indexOf(name));
  const inserted = rowIndex < 0;
  const existingCount = table.getRowCount();
  if (inserted) rowIndex = existingCount;

  // A manager may have replaced the preceding Customer Name formula manually.
  // Find the nearest surviving calculated-column template in a single bulk read,
  // rather than relying exclusively on the immediately preceding row.
  const calculatedTemplates: string[] = headers.map(() => "");
  if (inserted && existingCount > 0) {
    const formulas = body.getFormulasR1C1();
    for (let column = 0; column < headers.length; column++) {
      if (columns.includes(column)) continue;
      for (let index = existingCount - 1; index >= 0; index--) {
        const formula = formulas[index][column];
        if (typeof formula === "string" && formula.startsWith("=")) {
          calculatedTemplates[column] = formula;
          break;
        }
      }
    }
  }

  let oldValues: (string | number | boolean)[] = [];
  let oldFormulas: (string | number | boolean)[] = [];
  let touched = false;
  let rowAdded = false;
  // Fail closed before pausing protection if a supposed input column is calculated.
  if (existingCount > 0) {
    const referenceRow = body.getRow(inserted ? existingCount - 1 : rowIndex);
    columns.forEach(column => {
      const formula = referenceRow.getCell(0, column).getFormula();
      if (typeof formula === "string" && formula.startsWith("=")) {
        throw new Error("Approved input column contains a formula: " + headers[column]);
      }
    });
  }
  try {
    protection.pauseProtection(sheetPassword);
    if (inserted) {
      table.addRow(-1);
      rowAdded = true;
    }
    const row = table.getRangeBetweenHeaderAndTotal().getRow(rowIndex);
    oldValues = columns.map(column => row.getCell(0, column).getValue());
    oldFormulas = columns.map(column => row.getCell(0, column).getFormula());

    // Excel normally propagates calculated columns when a table row is added.
    // Restore any missing propagation explicitly without touching input columns.
    if (inserted && existingCount > 0) {
      for (let column = 0; column < headers.length; column++) {
        const template = calculatedTemplates[column];
        const currentFormula = row.getCell(0, column).getFormula();
        if (!columns.includes(column) &&
            template.startsWith("=") &&
            !(typeof currentFormula === "string" && currentFormula.startsWith("="))) {
          row.getCell(0, column).setFormulaR1C1(template);
        }
      }
    }
    touched = true;

    for (let index = 0; index < columns.length; index++) {
      const cell = row.getCell(0, columns[index]);
      const name = names[index];
      const value = values[index];
      const formula = cell.getFormula();
      if (typeof formula === "string" && formula.startsWith("=")) {
        throw new Error("Refusing to replace a formula in input column: " + name);
      }
      if (name === "Opportunity_date") {
        if (value === null || value === "") {
          cell.setValue("");
        } else if (typeof value === "number") {
          cell.setValue(value); // Native legacy serial, already in the workbook's date system.
        } else {
          const serial = Date.parse(String(value)) / 86400000 +
            (request.excelDateSystem === "1904" ? 24107 : 25569);
          cell.setValue(serial);
        }
      } else {
        setLiteral(cell, value === null ? "" : value);
      }
    }
  } catch (error) {
    try {
      if (inserted && rowAdded) {
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
  const manualCustomerUpdateRequired =
    String(request.fields["Customer Name"] ?? "").trim().toLowerCase() !==
    String(request.fields["EndUser_Name"] ?? "").trim().toLowerCase();
  return JSON.stringify({ status: "synced", opportunityId: request.opportunityId,
    revision: request.revision, quoteNo: request.quoteNo, inserted,
    manualCustomerUpdateRequired });
}

function validateRequest(request: ReportingRequest) {
  if (!request || !Number.isInteger(request.opportunityId) || request.opportunityId < 1 ||
      !Number.isInteger(request.revision) || request.revision < 1 ||
      typeof request.excelRowKey !== "string" || !request.excelRowKey.trim() ||
      typeof request.quoteNo !== "string" || !request.quoteNo.trim() ||
      !(request.quoteSeq === null || (typeof request.quoteSeq === "number" &&
        Number.isInteger(request.quoteSeq) && request.quoteSeq >= 1)) ||
      !["1900", "1904"].includes(request.excelDateSystem) || !request.fields) {
    throw new Error("Invalid reporting request.");
  }
  BUSINESS_COLUMNS.forEach(name => {
    if (!Object.prototype.hasOwnProperty.call(request.fields, name)) {
      throw new Error("Missing business field: " + name);
    }
    const value = request.fields[name];
    if (!(value === null || typeof value === "string" || typeof value === "boolean" ||
        (typeof value === "number" && Number.isFinite(value)))) {
      throw new Error("Invalid business field value: " + name);
    }
  });
  const timestamp = request.fields["Opportunity_date"];
  if (!(timestamp === null || timestamp === "" ||
      (typeof timestamp === "number" && Number.isFinite(timestamp)) ||
      (typeof timestamp === "string" && /^\d{4}-\d{2}-\d{2}(?:T|$)/.test(timestamp) &&
        Number.isFinite(Date.parse(timestamp))))) {
    throw new Error("Opportunity_date must be blank, a native serial, or an ISO date.");
  }
}

function setLiteral(cell: ExcelScript.Range, value: string | number | boolean) {
  cell.setValue(typeof value === "string" && /^[=+\-']/.test(value) ? "'" + value : value);
}
