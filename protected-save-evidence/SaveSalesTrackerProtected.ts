interface SaveRequest {
  mode: string;
  quoteNo?: string;
  quoteSeq?: number;
  recordId?: string;
  excelDateSystem?: string;
  fields?: { [name: string]: string | number | boolean | null };
}

// Install as a NEW Office Script. Do not put the password in this source.
// First test with requestJson = {"mode":"validate"}.
// Configure the flow's Run script retry policy to None and concurrency to 1.
function main(workbook: ExcelScript.Workbook,
  sheetPassword: string, requestJson: string): string {
  const request = JSON.parse(requestJson) as SaveRequest;
  if (!request || !["validate", "create", "update"].includes(request.mode)) {
    throw new Error("Use mode validate, create, or update.");
  }
  const table = workbook.getTable("SalesTracker");
  if (!table || table.getWorksheet().getName() !== "Master Sheet") {
    throw new Error("SalesTracker was not found on Master Sheet.");
  }
  const names = ["Opportunity_date", "Project_Name", "Application", "BU",
    "EndUser_Name", "Sub_BU", "Prob %", "Scope Of Supply Sales Recommendation",
    "Scope of Supply Details", "Specs or Model", "Order Value", "Book Period",
    "Discount", "Lead Type", "Technical Contact", "Commercial Contact"];
  const headers = table.getHeaderRowRange().getTexts()[0];
  for (const name of names.concat(["Quote_No", "Quote_Seq", "__PowerAppsId__"])) {
    if (headers.filter(h => h === name).length !== 1) {
      throw new Error("Missing or duplicate column: " + name);
    }
  }
  const protection = table.getWorksheet().getProtection();
  if (!protection.getProtected() || !protection.getCanPauseProtection() ||
      protection.getIsPaused() || !protection.checkPassword(sheetPassword)) {
    throw new Error("Check worksheet protection and its password.");
  }
  if (request.mode === "validate") {
    return JSON.stringify({ status: "validated", saved: false,
      message: "Columns and password checked. No records changed." });
  }
  const fields = request.fields;
  if (!fields || Object.keys(fields).length !== names.length ||
      names.some(n => !Object.prototype.hasOwnProperty.call(fields, n))) {
    throw new Error("All 16 app fields must be supplied, including empty values.");
  }
  const values: (string | number | boolean)[] = names.map(n => {
    const value = fields[n];
    if (value === null) return "";
    if (!["string", "number", "boolean"].includes(typeof value) ||
        (typeof value === "number" && !Number.isFinite(value))) {
      throw new Error("Invalid field: " + n);
    }
    return value;
  });
  // Power Fx JSON supplies the existing submission timestamp as ISO 8601.
  const timestamp = fields["Opportunity_date"];
  if (typeof timestamp !== "string" ||
      !/^\d{4}-\d{2}-\d{2}T.*Z$/.test(timestamp) ||
      !Number.isFinite(Date.parse(timestamp))) {
    throw new Error("Opportunity_date must be an ISO UTC timestamp.");
  }
  if (!["1900", "1904"].includes(request.excelDateSystem)) {
    throw new Error("The workbook date system must be verified before enabling saves.");
  }
  const dateSerial = Date.parse(timestamp) / 86400000 +
    (request.excelDateSystem === "1904" ? 24107 : 25569);
  const quote = request.quoteNo;
  if (typeof quote !== "string" || quote.length === 0) {
    throw new Error("A quote number is required.");
  }
  const existingCount = table.getRowCount();
  const quoteColumn = headers.indexOf("Quote_No");
  const matches: number[] = [];
  if (existingCount > 0) {
    const quotes = table.getRangeBetweenHeaderAndTotal().getColumn(quoteColumn).getTexts();
    quotes.forEach((v, i) => { if (v[0] === quote) matches.push(i); });
  }
  if (request.mode === "update" && matches.length !== 1) {
    throw new Error("Update requires exactly one matching quote. No record changed.");
  }
  if (request.mode === "create") {
    if (matches.length !== 0) throw new Error("Quote already exists. Check Excel before retrying.");
    if (!Number.isInteger(request.quoteSeq) || quote !== "MSOL26" + request.quoteSeq ||
        typeof request.recordId !== "string" ||
        !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(request.recordId)) {
      throw new Error("Invalid new quote sequence or record ID.");
    }
    for (const name of ["Project_Name", "Application", "BU", "EndUser_Name", "Order Value", "Discount"]) {
      if (fields[name] === null || fields[name] === "") throw new Error("Required field: " + name);
    }
    names.push("Quote_No", "Quote_Seq", "__PowerAppsId__");
    values.push(quote, request.quoteSeq, request.recordId);
  }
  const columns = names.map(n => headers.indexOf(n));
  let rowIndex = request.mode === "update" ? matches[0] : existingCount;
  let inserted = false;
  let touched = false;
  let oldValues: (string | number | boolean)[] = [];
  let oldFormulas: string[] = [];
  try {
    protection.pauseProtection(sheetPassword);
    if (request.mode === "create") {
      // No blank row array: allow calculated columns to inherit their formulas.
      table.addRow(-1);
      inserted = true;
    }
    const row = table.getRangeBetweenHeaderAndTotal().getRow(rowIndex);
    oldValues = columns.map(c => row.getCell(0, c).getValue());
    oldFormulas = columns.map(c => row.getCell(0, c).getFormula());
    // Preserve calculated-column formulas even if Excel did not auto-fill this row.
    if (inserted && existingCount > 0) {
      const previous = table.getRangeBetweenHeaderAndTotal().getRow(existingCount - 1);
      const formulas = previous.getFormulasR1C1()[0];
      for (let c = 0; c < headers.length; c++) {
        if (!columns.includes(c) && formulas[c].startsWith("=") &&
            !row.getCell(0, c).getFormula().startsWith("=")) {
          row.getCell(0, c).setFormulaR1C1(formulas[c]);
        }
      }
    }
    touched = true;
    for (let i = 0; i < columns.length; i++) {
      const cell = row.getCell(0, columns[i]);
      if (names[i] === "Opportunity_date") {
        cell.setValue(dateSerial);
      } else {
        setLiteral(cell, values[i]);
      }
    }
  } catch {
    try {
      if (inserted) {
        table.deleteRowsAt(rowIndex, 1);
      } else if (touched) {
        const row = table.getRangeBetweenHeaderAndTotal().getRow(rowIndex);
        for (let i = 0; i < columns.length; i++) {
          const cell = row.getCell(0, columns[i]);
          if (oldFormulas[i].startsWith("=")) cell.setFormula(oldFormulas[i]);
          else setLiteral(cell, oldValues[i]);
        }
      }
    } catch {
      throw new Error("Save and rollback failed. Inspect this quote in Excel before retrying.");
    }
    throw new Error("Save failed. Inspect this quote in Excel before retrying.");
  } finally {
    if (protection.getIsPaused()) protection.resumeProtection();
  }
  if (!protection.getProtected() || protection.getIsPaused()) {
    throw new Error("Record was written but protection needs checking. Do not submit again.");
  }
  return JSON.stringify({ status: "saved", saved: true, quoteNo: quote });
}

function setLiteral(cell: ExcelScript.Range, value: string | number | boolean) {
  // Keep user input as data, including strings that could be Excel formulas.
  cell.setValue(typeof value === "string" && /^[=+\-']/.test(value) ? "'" + value : value);
}
