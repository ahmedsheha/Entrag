# Production acceptance gate

Release is blocked until every item is evidenced.

## Data and concurrency

- Record count, quote numbers, sequence values, and business totals reconcile
  between the source workbook and SharePoint.
- Six simultaneous creates produce exactly six unique sequential quotes.
- Identical request retries create no duplicate SharePoint item, Excel row, or
  email.
- A stale revision returns conflict and does not overwrite the newer item.
- Different Customer and End User values survive create, update, sync, and reload.

## Fixed workbook contract

- `CaptureWorkbookContract` is stored before migration.
- `CompareWorkbookContract` returns `status=pass` after migration and after the
  integration test suite.
- Sheet order/names, SalesTracker headers/order, formula patterns, number-format
  patterns, table style, column widths, chart/pivot/slicer identities, named
  ranges, conditional-format counts, print configuration, and protection state
  match the baseline.
- A forced script error leaves protection active and the test row rolled back.
- Formula columns remain formulas after create and update tests.
- Management confirms the pilot copy is visually identical.

## Performance

- Six Live Monitor sessions; warm open p95 under 3 seconds.
- Delegated quote/project/PO search p95 under 1 second, including records beyond
  the non-delegation row limit.
- SharePoint commit p95 under 2 seconds.
- No Excel connector action occurs on open, search, create, or update before the
  SharePoint response.
- Zero production delegation warnings.

## Rollback

- Original app version and workbook version are retained and identified.
- Direct workbook data entry is frozen only for the final migration window.
- Cutover is reversed if any contract comparison, count, total, concurrency, or
  protection check fails.
