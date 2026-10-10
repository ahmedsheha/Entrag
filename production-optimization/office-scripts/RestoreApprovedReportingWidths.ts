/** Restore ONLY the 15 observed width differences; run on the reporting COPY. */
function main(workbook: ExcelScript.Workbook, sheetPassword: string): string {
  const expectedSheets = ["Master Sheet", "Dashboard", "Helper_Pivots", "Customer_List", "Lists"];
  if (JSON.stringify(workbook.getWorksheets().map(s => s.getName())) !== JSON.stringify(expectedSheets)) {
    throw new Error("Unexpected workbook structure; no widths changed.");
  }
  const specs: [string, string, number, string, number, number][] = [
    ["SalesTracker", "Master Sheet", 2, "Country", 97.5, 96.75],
    ["SalesTracker", "Master Sheet", 6, "Industry", 134.25, 133.5],
    ["SalesTracker", "Master Sheet", 18, "Technical Contact", 150, 149.25],
    ["SalesTracker", "Master Sheet", 19, "Opportunity_date", 150, 149.25],
    ["SalesTracker", "Master Sheet", 25, "Specs or Model", 255, 254.25],
    ["SalesTracker", "Master Sheet", 26, "Lead Type", 160.5, 159.75],
    ["SalesTracker", "Master Sheet", 30, "Discount", 129, 128.25],
    ["SalesTracker", "Master Sheet", 34, "No. of Tags", 87, 86.25],
    ["SalesTracker", "Master Sheet", 35, "EMERSON Ref#", 118.5, 117.75],
    ["Table3", "Lists", 1, "Column1", 48, 46.5],
    ["Table4", "Lists", 0, "YesNo", 48, 46.5],
    ["Table5", "Lists", 0, "Presales", 48, 46.5],
    ["Table11", "Lists", 0, "Action By", 123.75, 123],
    ["Table12", "Lists", 1, "__PowerAppsId__", 48, 46.5],
    ["Table14", "Lists", 1, "Column1", 48, 46.5]
  ];
  // Validate every target before pausing protection or writing anything.
  const targets = specs.map(spec => {
    const table = workbook.getTable(spec[0]);
    if (!table || table.getWorksheet().getName() !== spec[1] ||
        table.getHeaderRowRange().getTexts()[0][spec[2]] !== spec[3]) {
      throw new Error("Unexpected width target; no widths changed.");
    }
    const format = table.getColumns()[spec[2]].getRange().getFormat();
    const before = format.getColumnWidth();
    if (Math.abs(before - spec[4]) > 0.001 && Math.abs(before - spec[5]) > 0.001) {
      throw new Error("Width changed since comparison; no widths changed.");
    }
    return { format, before, approved: spec[4] };
  });
  const protection = workbook.getWorksheet("Master Sheet").getProtection();
  const listsProtection = workbook.getWorksheet("Lists").getProtection();
  if (!protection.getProtected() || protection.getIsPaused() ||
      !protection.getCanPauseProtection() || !protection.checkPassword(sheetPassword) ||
      listsProtection.getProtected() || listsProtection.getIsPaused()) {
    throw new Error("Protection verification failed; no widths changed.");
  }
  let changed = 0;
  try {
    protection.pauseProtection(sheetPassword);
    targets.forEach(target => {
      if (Math.abs(target.before - target.approved) > 0.001) {
        target.format.setColumnWidth(target.approved);
        changed++;
      }
    });
    if (targets.some(target => Math.abs(target.format.getColumnWidth() - target.approved) > 0.001)) {
      throw new Error("Approved width read-back failed.");
    }
  } catch (error) {
    // Restore pre-run widths after partial failure while the script lease is held.
    if (protection.getIsPaused()) {
      targets.forEach(target => target.format.setColumnWidth(target.before));
    }
    throw new Error("Width restoration failed; verify rollback and rerun the contract.");
  } finally {
    if (protection.getIsPaused()) protection.resumeProtection();
  }
  if (!protection.getProtected() || protection.getIsPaused()) {
    throw new Error("Protection verification failed after restoration.");
  }
  const result = JSON.stringify({ status: "widthsRestored", checked: 15, changed,
    protected: true, protectionPaused: false, contractComparisonRequired: true });
  console.log(result);
  return result;
}
