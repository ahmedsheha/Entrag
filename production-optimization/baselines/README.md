# Management workbook baseline

`management-workbook-baseline.json` is the immutable structural contract captured
from the management workbook before migration. Use its complete contents as the
`baselineJson` input to `CompareWorkbookContract.ts`.

Validated baseline facts:

- Sheet order: Master Sheet, Dashboard, Helper_Pivots, Customer_List, Lists.
- SalesTracker is on Master Sheet with 52 columns.
- Master Sheet is protected and protection is not paused.
- Three dashboard charts and three helper pivot tables are present.
- The baseline contains three pre-existing invalid named items:
  `_xlfn.IFERROR`, `_xlfn.SUMIFS`, and `Y`. They are preserved as evidence and
  must not be silently repaired as part of this performance project.
