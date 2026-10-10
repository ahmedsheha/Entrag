# Original management workbook cutover

**Superseded:** user subsequently selected the tested COPY as the live report.
Leave this original unchanged; its width decision is no longer on the cutover
path. Preserve the comparison below as evidence, not an instruction to repair it.

User selected the original report on 10 October 2026 and supplied its link.

- Name: `Final_Sales_Master_Rev12_11 (Uploaded)(xlsx).xlsx`.
- SharePoint document ID: `7b4457ad-a15f-4600-a2be-b7a3f95e0061`.
- Owner location: `entrag-my.sharepoint.com/personal/ahmed_adel_entrag_com`.
- Open: https://entrag-my.sharepoint.com/personal/ahmed_adel_entrag_com/_layouts/15/Doc.aspx?sourcedoc=%7B7B4457AD-A15F-4600-A2BE-B7A3F95E0061%7D&action=edit

This is NOT the tested COPY (`2eb994dd-a0cb-4cc5-a3b4-ede017bf0977`).
The Power App must remain unpublished. No Dataverse connector. Existing backups
are retained; no new test copies requested. Do not write synthetic records into
the original report or treat enabling a synthetic-only pilot as a live cutover.

Original opened in Arc and the URL/WOPI document identity matched the user link.
Master Sheet visibly protected. Started the existing read-only
CompareWorkbookContract with the unchanged approved baseline: 10,099 characters,
FNV-1a 1,754,044,479, verified before entry. Script completed successfully,
but its actual result was `status=blocked`, `differenceCount=15`.

All 15 reported differences are column widths (zero-based indexes):

| Table | Column index | Baseline | Original now |
| --- | ---: | ---: | ---: |
| SalesTracker | 2 | 97.5 | 96.75 |
| SalesTracker | 6 | 134.25 | 133.5 |
| SalesTracker | 18 | 150 | 149.25 |
| SalesTracker | 19 | 150 | 149.25 |
| SalesTracker | 25 | 255 | 254.25 |
| SalesTracker | 26 | 160.5 | 159.75 |
| SalesTracker | 30 | 129 | 128.25 |
| SalesTracker | 34 | 87 | 86.25 |
| SalesTracker | 35 | 118.5 | 117.75 |
| Table3 | 1 | 48 | 46.5 |
| Table4 | 0 | 48 | 46.5 |
| Table5 | 0 | 48 | 46.5 |
| Table11 | 0 | 123.75 | 123 |
| Table12 | 1 | 48 | 46.5 |
| Table14 | 1 | 48 | 46.5 |

Full output inspected using the expanded Office Scripts Output panel and scroll.
No other captured contract differences were reported. This does not establish
complete visual/reporting-object layout or business-value acceptance. No widths,
cells, formulas, protection, baseline file or flow activation were changed.
The comparator is read-only; a saved indicator alone is not evidence of a data
mutation. Cutover is blocked pending explicit approval of either the current
original layout as its own documented contract or restoration of earlier widths.

Do not alter the workbook or replace the approved baseline to hide differences.
Original workbook identity, connector file binding, current data reconciliation,
fixed contract, notification controls, and reporting failure handling must be
verified before activating writes. Test exclusion was saved separately in the
existing production SyncSalesReporting flow; it remains Off.
