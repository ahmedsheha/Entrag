# Sales Tracker production optimization

This directory contains the deployable contracts and Office Scripts for moving the
interactive Power Apps workload from Excel to SharePoint while retaining the
existing workbook as a protected reporting copy.

## Deployment order

1. Run `office-scripts/CaptureWorkbookContract.ts` against the production workbook
   and save the returned JSON as the immutable baseline.
2. Create the SharePoint lists and columns in `sharepoint-schema.md` on the approved
   team site. Do not use a personal "My lists" location for the six-user app.
3. Import existing `SalesTracker` rows into `SalesOpportunities`, preserving
   `Quote_No`, `Quote_Seq`, and `__PowerAppsId__` in `ExcelRowKey`.
4. Initialize the single `SalesSequence` row to the highest imported sequence plus
   one.
5. Create the flows described in `flow-contracts.md` and install
   `office-scripts/SyncSalesTrackerReporting.ts` in the workbook.
6. Update the canvas app using the formulas in `power-fx.md` only after the list and
   flows pass their isolated tests.
7. Pilot against a copy of the workbook. Run the contract capture again and compare
   it with the baseline using `CompareWorkbookContract.ts` before management
   sign-off and production cutover. A `blocked` result prevents release.

The current published app and workbook remain rollback assets until all acceptance
tests pass. Publishing or switching production connections is deliberately the last
step.

`power-automate-build.md` contains the exact flow actions and conflict/idempotency
rules. `acceptance.md` is the release gate. Run `node
production-optimization/validate-package.mjs` for a fast package-level safety
check before deployment.

`deployment-state.md` records which live resources exist and which release gates
remain, so staging cannot be mistaken for a completed production cutover.
