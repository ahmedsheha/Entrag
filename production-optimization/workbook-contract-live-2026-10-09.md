# Post-pilot live workbook contract verification

Target: Final_Sales_Master_Rev12_11 (Uploaded)(xlsx) - Copy.xlsx.
Approved reference: baselines/management-workbook-baseline.json.

Status: CAPTURED STRUCTURAL CONTRACT PASSED after repair. The final browser comparison returned zero differences. This is not full visual acceptance or a production release pass.

## Post-reconciled-revision-3 sync — 10 October 2026

Guarded no-email worker run `08584099614029557506603419291CU12` at 18:18
Cairo succeeded in 14 seconds, processing the missing-event reconciler's
synthetic `163-3` job. Independent queue read verified Succeeded/AttemptCount 1/
CompletedRevision 3, older receipts unchanged and lease/retry/error blank.
Worker Off verified after launch. Existing read-only CompareWorkbookContract
on exact COPY sourcedoc `2eb994dd-a0cb-4cc5-a3b4-ede017bf0977` returned actual
Output `{"status":"pass","differenceCount":0,"differences":[]}` against the
unchanged 10,099-character baseline, FNV-1a 1,754,044,479. No script/baseline or
manual workbook edits. Manual Refresh Required remained visible; Refresh All
not invoked. Production reporting Off, app unpublished. This confirms only
the captured contract, not all visual/report/business-value acceptance gates.

## Post-revision-2 sync — 10 October 2026

The guarded no-email worker synchronized synthetic item 163 revision 2 to this
COPY. Run `08584100078210717914290151572CU03` completed in 15 seconds; independent
queue read showed `163-2` Succeeded/AttemptCount 1/CompletedRevision 2 and the
older job unchanged. Worker switched Off and Status Off verified.

Ran existing CompareWorkbookContract read-only on the same COPY sourcedoc
`2eb994dd-a0cb-4cc5-a3b4-ede017bf0977`. The initial details view provided only an
execution banner; reran from its editor to verify actual Output JSON:
`{"status":"pass","differenceCount":0,"differences":[]}`. Used the unchanged
approved baseline, 10,099 characters and FNV-1a 1,754,044,479. No script, baseline,
cell, width or protection settings were edited during this comparison.

The captured structure/protection gate passed after this isolated upsert. Full
visual acceptance, refresh behaviour and business-value reconciliation remain
outstanding. Manual Refresh Required was visible; Refresh All was not invoked.
Production reporting remains Off and the app remains unpublished.

## Browser follow-up — 9 October 2026

At the user's explicit direction, switched back to the existing Excel browser/Office Script workflow on the same reporting copy. Ran the existing read-only CompareWorkbookContract from its editor. Supplied the approved baseline exactly: serialized length 10,099, FNV-1a checksum 1,754,044,479, matching the local baseline. Neither the baseline nor comparison script was edited.

The actual output (not just the successful-execution banner) returned status blocked and differenceCount 15. Expanded and scrolled the output to inspect all entries. All reported differences are column widths:

| Table | Column (zero-based) | Approved width | Browser reading |
| --- | --- | --- | --- |
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

The browser-based gate confirms these differences on the original comparison surface. The larger desktop readings cannot be treated as a trustworthy direct replacement for browser measurements. The cause of the 15 smaller differences is not established. No widths were restored or normalized, and no workbook write or protection change was performed by this browser verification.

Next: investigate/restore only the exact approved widths with appropriate backup and protected-workbook handling, then re-run the browser gate. Do not replace the approved baseline to make this test pass. Full visual acceptance, business reconciliation, and the other production requirements remain open even after a structural pass.

The following section records the earlier desktop-only evidence and limitations.

## Width repair staged — awaiting private user execution

User approved restoring the 15 approved widths. Created and verified an online backup named `SalesReporting_COPY_PreWidthRepair_20261009.xlsx`, saved in the existing Documents location, sourcedoc `506b5a8d-44de-4715-81a8-63bf03cc6cac`. The backup was visibly Saved. Returned to the original reporting copy, sourcedoc `2eb994dd-a0cb-4cc5-a3b4-ede017bf0977`, before staging repair.

Saved a NEW Office Script named `RestoreApprovedReportingWidths_20261009`; did not replace the comparison or reporting scripts. Source is `office-scripts/RestoreApprovedReportingWidths.ts`. Exact staged source length/checksum matched the offline-tested source before editor formatting (3,798 characters; FNV-1a 3,625,761,583). Eight mock tests passed with `node production-optimization/test-restore-widths.mjs`.

The script checks sheet order, table locations, exact target headers, previously observed or already-approved widths, and sheet protection/password before writes. It changes only the 15 named column widths, reads them back, attempts rollback on partial failure, and resumes session-paused protection in finally. It does not edit values, formulas, headers, charts, or other columns. Offline tests are not live execution evidence.

The browser is displaying the `sheetPassword` parameter prompt. No password has been entered by the agent, no repair writes have run, and no success is claimed. User must privately enter the existing password and click Run, then close the parameter dialog before asking the agent to inspect output. After successful execution, re-run the approved browser contract; release is still blocked pending that result and all remaining acceptance requirements.

## Private execution completed — 9 October 2026

After the user reported done, inspected only the closed-dialog result. The repair returned `{"status":"widthsRestored","checked":15,"changed":15,"protected":true,"protectionPaused":false,"contractComparisonRequired":true}`. This confirms actual live execution and read-back of the 15 approved widths, not merely a saved script. No password was inspected or recorded by the agent. Opened the existing CompareWorkbookContract editor and started a new read-only comparison against the same 10,099-character approved baseline. Its final output must be recorded before declaring the structural gate passed.

The post-repair browser comparison finished successfully and its actual output was visibly inspected: `{"status":"pass","differenceCount":0,"differences":[]}`. The approved baseline was unchanged. This clears the 15 width differences and the captured structural gate for the reporting COPY. The contract covers only the properties captured by that script, not every cell style, report dependency, chart/pivot geometry, workbook-protection setting, or full visual equivalence. Management sign-off, migrated-business reconciliation, interrupted-job recovery, enqueue/reconciliation deployment, notification safeguards, six-session performance testing, credential rotation and remaining production requirements are still outstanding. Production sync remains intentionally off and the app unpublished.

The ChatGPT add-in was available on retry, opened successfully, and showed a signed-in composer. Discovery identified the exact reporting copy. All workbook commands were read-only. No workbook cells, formulas, styles, widths, protection, or settings were changed by these checks.

Verified:

- Five worksheet names, order, and used-column counts match the baseline. Helper_Pivots is hidden.
- Fourteen tables have matching headers, column counts, table styles, banding, filter-button settings, and totals settings.
- All 52 SalesTracker columns have identical unique formula patterns and number-format patterns across the current data body.
- Three dashboard charts have the expected names and chart types. Three pivots have the expected names and use SalesTracker as source.
- All five worksheet protection and protection-paused states match. Master Sheet remains protected and protection is not paused.
- Captured orientation, paper size, gridline-printing and heading-printing settings match on all five sheets.

Unresolved:

- All 52 SalesTracker column-width readings differ from the approved browser-captured baseline. Examples: Quote_Seq 54.75 expected versus 63 in desktop Excel; Quote_No 173.25 versus 198; Project_Name 439.5 versus 502. The differences are broadly proportional, but a platform measurement/rendering explanation is not proven. Do not normalize the differences, change widths, replace the baseline, or assert workbook corruption from these readings alone.
- Re-run the existing read-only CompareWorkbookContract script in the original browser workflow to distinguish a real saved-layout change from a cross-host measurement difference. Switching back from the current live route requires explicit user direction.
- Named ranges, slicers, conditional formats, every supporting-table formula/format, full cell styles, chart geometry, print areas, and full visual equivalence were not newly verified in this session. Earlier results do not replace post-write evidence.

An initial all-table Office.js read exceeded the response-size limit. No writes were present in the script. A direct header read subsequently succeeded. Smaller reads completed successfully. Do not treat the failed broad read as verification.

Evidence commands:

- Metadata: cmd_e_8cdb2fbdfa6081919a8f4a2fa39d427b
- Reporting objects: cmd_e_5573e4c8287081918746036da173663b
- Table headers/styles: cmd_e_21d9f46366fc8191b8ea34aaa08ea296
- SalesTracker columns 1–8: cmd_e_1ea49cfd561c81918a4549749b7fa250
- Columns 9–16: cmd_e_7c9a8dc44854819192818641abca5e17
- Columns 17–24: cmd_e_abb04c885fa48191a7cb60eb01689d7b
- Columns 25–32: cmd_e_1fd0e96c82508191ab3632684fb6db85
- Columns 33–40: cmd_e_a4d8ffd1015081919cdcfbf3d02d6987
- Columns 41–48: cmd_e_94aea100b85c8191bac14c8b1da4e428
- Columns 49–52: cmd_e_513a4d24e3e08191bb7be661c9ea548b
- Protection/print: cmd_e_bb49c96aecc88191b89ce6b2ec414d8e

Production reporting synchronization remains intentionally off and the development app remains unpublished. This verification does not authorize enabling either.
