/** Read-only setup check. Does not change data or worksheet protection. */
function main(workbook: ExcelScript.Workbook): string {
  const table = workbook.getTable("SalesTracker");
  if (!table) {
    return JSON.stringify({
      found: false,
      tables: workbook.getTables().map(item => item.getName())
    });
  }
  const sheet = table.getWorksheet();
  const protection = sheet.getProtection();
  return JSON.stringify({
    found: true,
    table: table.getName(),
    sheet: sheet.getName(),
    headers: table.getHeaderRowRange().getTexts()[0],
    protected: protection.getProtected(),
    passwordProtected: protection.getIsPasswordProtected(),
    canPauseProtection: protection.getCanPauseProtection(),
    protectionPaused: protection.getIsPaused(),
    protectionOptions: protection.getOptions()
  });
}
