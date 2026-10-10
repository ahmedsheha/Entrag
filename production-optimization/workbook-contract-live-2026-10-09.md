# Post-pilot live workbook contract verification

Target: Final_Sales_Master_Rev12_11 (Uploaded)(xlsx) - Copy.xlsx.
Approved reference: baselines/management-workbook-baseline.json.

Status: HOLD. This is a partial read-only verification, not a release pass.

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
