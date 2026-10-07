# Runtime acceptance — 6 October 2026

Development only. Reporting remained Off; the app remained unpublished.
These observations are not full release acceptance.

## Verified

- Existing-create retry returned success, ID 153, MSOL264, revision 1,
  `Already processed`, without running allocation/create. Run tracking ID:
  `08584103221878710791541250502CU04`.
- Repaired create returned ID 154, MSOL265, revision 1. Stored quoted ProjectName,
  quoted POReference, separate EndUserName and CustomerName were read from the
  successful SharePoint response. Run tracking ID:
  `08584103219451446245351396334cU14`.
- Initial correction test failed before writing because the SharePoint GET had
  no Accept header and returned an OData verbose `d` envelope. Fixed by adding
  `Accept: application/json;odata=nometadata`.
- Rerun correction succeeded: ID 154, MSOL265, revision 2, `Updated`.
  Run tracking ID: `08584103214195959873099871343CU27`.
- Six calls issued together using Power Fx Concurrent in an unlinked test screen.
  All returned success with six distinct consecutive sequence values:

| Request suffix | SharePoint ID | QuoteNo | Revision |
| --- | --- | --- | --- |
| six-1 | 159 | MSOL2610 | 1 |
| six-2 | 155 | MSOL266 | 1 |
| six-3 | 158 | MSOL269 | 1 |
| six-4 | 160 | MSOL2611 | 1 |
| six-5 | 157 | MSOL268 | 1 |
| six-6 | 156 | MSOL267 | 1 |

Full request prefix: `performance-test-20261006-`.
All seven test records are labelled TEST ONLY, zero order value, zero probability,
zero discount. They must not enter management reporting or notification backfill.
Do not reuse their issued sequence numbers when cleaning them up.

## App response and edit collision — 7 October

Power Apps replay exposed `JSON parsing error, expected 'number' but got
'string'`. CreateOpportunity's existing-record response used `@{int(...)}`
string interpolation for ID/revision despite numeric schema. Both were replaced
using fresh whole-value expression insertion (`@int(...)`) and save success was
verified. App replay retest passed: all six same IDs/quotes/revisions returned
success with `Already processed`. Audit all other numeric response
branches for the same issue. Manual flow success alone did not prove the app
response contract.

UpdateOpportunity's numeric ID/revision responses were also reinserted as
whole-value expressions in both save and stale-edit branches and saved.
Three simultaneous app calls targeted test ID 154: two expected revision 2,
and one expected revision 1. Results observed in app preview:

- Editor 1: conflict, ID 154, MSOL265, revision 2, `Another user saved this
  opportunity. Reload before editing.` (ETag/CAS failure response).
- Editor 2: success, ID 154, MSOL265, revision 3, `Updated`.
- Stale editor: conflict, ID 154, MSOL265, revision 2, `This record was changed
  by another user. Reload and try again.` (revision precheck response).

The conflict responses describe the version read by that run, not necessarily
the latest version after competing commits. The app must reload on conflict.
No reporting flow was enabled and no workbook/email test was performed.
An indexed single-item app read-back (`LookUp(SalesOpportunities, ID=154)`)
confirmed revision 3, ProjectName `TEST ONLY — concurrent edit 2`, EndUserName
`TEST End User`, CustomerName `TEST Editor 2`, and POReference
`TEST-PO-CORRECTED`. The temporary test button now only performs this read;
the completed create/edit batch is no longer bound to its OnSelect.

## Pending

Local reporting-source hardening completed on 7 October (not deployed): removed
QuoteNo fallback, reject duplicate stable identifiers, preserve blank legacy
date/sequence and native date serials, reject invalid field values, refuse formula
overwrite in input cells, and only remove an added row during rollback when it
was actually added. `test-reporting-script.mjs` passed 27 validator/source-guard
checks; `validate-package.mjs` passed its 60 offline checks. These do not verify
Excel styles, runtime protection, formula propagation, or the deployed script.

- Concurrent identical new create requests and historical update-request recovery.
- Reservation fault classification, durable request reservation/recovery,
  and update-request idempotency.
- Durable reporting retries, email ambiguity recovery, protection/failure tests.
- Migrated count/business-value reconciliation and workbook-contract acceptance.
- Six real sessions and p95 latency measurements; Concurrent calls are a backend
  collision test, not six full-session performance acceptance.
- Remove temporary Screen2/Button3 test harness before publication.
- Audit the deployed reporting script against the hardened local source; deploy
  only after testing stable-ID-only matching and blank preservation on the pilot.
- Confirm maintenance freeze, Cairo site timezone and management sign-off.

## 7 October: update retry receipt acceptance

Added optional operational-only `LastUpdateRequestId` to SalesOpportunities.
UpdateOpportunity reads it, rejects blank request IDs and reused IDs with a new
expected revision, and writes the receipt atomically with the business fields
and revision through its existing ETag-conditional MERGE. The no-write branch
acknowledges an identical latest request only at expectedRevision + 1.

An initial test exposed that the designer had not retained the modified body:
ID 154 advanced from revision 3 to 4, retries conflicted, and the reused-ID test
advanced it to 5. Only the zero-value synthetic record was affected. The body was
then corrected, reopened to verify persistence, and saved.

Retest request `performance-test-20261007-receipt-002`, ID 154, expected revision 5:

- Initial save: success, MSOL265, revision 6, Updated.
- Two concurrent identical retries: success, revision 6, Already processed.
- Same request ID with expected revision 6: conflict, revision 6.
- Blank request ID with expected revision 6: conflict, revision 6.
- Different request ID with stale expected revision 5: conflict, revision 6.

Results were observed in Power Apps preview. Temporary Button3 write calls were
removed and replaced with a notification and static acceptance text. App remains
unpublished; reporting remains off. This proves latest-receipt retry behavior,
not payload-fingerprint validation or full historical request-ledger recovery.

CreateOpportunity also had its redundant post-reservation sequence read removed
and its reservation loop changed to retry only HTTP 412 conflicts. These changes
were saved but still require runtime regression testing.

## 7 October: create recovery and normal-path regression

Added `Recover Committed Request` after the opportunity POST. It runs only when
that POST fails or times out, querying the unique ClientRequestId. Parse JSON
runs after recovery succeeds or is skipped, using the successful POST object or
the recovered item. An empty recovery result yields ID 0 and an explicit error
telling the caller to retain the same request ID. The main response now takes
revision from the saved item as a whole-value numeric expression.

Saved configuration was reopened. Flow checker: 0 errors, 0 warnings.

- New zero-value request `performance-test-20261007-create-recovery-001`:
  run `08584102313045031003777228106CU29` succeeded; SharePoint ID 163,
  QuoteNo MSOL2614, QuoteSeq 14, revision 1. POST succeeded and recovery was
  skipped. Rounded run duration was 2 seconds; this is not p95 evidence.
- Identical manual resubmission:
  run `08584102312261903014709642249CU13` succeeded. Initial lookup found the
  existing item; allocation, POST and recovery were skipped. Response inputs
  contained success, numeric ID 163, MSOL2614, numeric revision 1 and
  `Already processed`. The response action itself was skipped because manual
  resubmission has no waiting Power Apps client; actual client delivery is not
  proved by this test.
- Independent Customer and End User, PO Reference and zero financial values
  appeared correctly in the new item's POST output.

This is limited failed-POST recovery, not a durable request/reservation ledger.
Parallel identical NEW requests, forced POST ambiguity, failed recovery lookup,
payload-fingerprint checks and crash-between-reservation-and-create behavior
remain untested/unresolved. Unique request IDs prevent duplicate items, but
quote-number gaps are still possible. Never decrement or reuse issued numbers.

Reporting remained Off and no workbook write or email occurred. Preserve the two
user-created records MSOL2612 and MSOL2613; they are not disposable test data.
ID 163 is labelled TEST ONLY and must be excluded from reporting/email backfill.

### Reporting compatibility findings

The new test's ScopeDetails output contains SharePoint rich-text HTML and its
original newline was collapsed. OpportunityDate input `2026-10-07` appeared as
`2026-10-07T07:00:00Z`; the site still uses Pacific rather than Cairo timezone.
Do not blindly convert existing rich-text business data or normalize dates
without a preserved source and reconciliation. Plain-text/newline handling,
Cairo regional settings, and date-only round-trip behavior gate report testing.

## 7 October: isolated reporting pilot started

Owner entered the workbook password in the flow UI. The pilot was saved and
checker showed 0 errors / 0 warnings; details show modified 7 October 16:24.
Enabled ONLY `SyncSalesReporting_Pilot_NoEmail_20261007`, ID
`e9b9e5f8-4dc2-f111-aaaf-70a8a581110f`, restricted to synthetic item 163 and its
exact test ClientRequestId. It targets the workbook copy and has only trigger
and Run script. Email and production integration-log actions are absent.

Changed only item 163's Title from MSOL2614 to
`MSOL2614 — TEST ONLY reporting pilot`; SharePoint confirmed Saved. QuoteNo,
QuoteSeq, revision and business fields were not changed by this trigger step.
Runtime result, business round-trip and post-write workbook comparison pending.
Disable the pilot after the test; do not treat it as production synchronization.

### Pilot result: fail-closed formula compatibility blocker

- First run `08584102272366127168615411802cU14` failed during input evaluation:
  `empty()` was called on numeric QuoteSeq (Float). Excel was never called.
  Corrected to `empty(string(triggerBody()?['QuoteSeq']))` and saved.
- Retried the same event in run `08584102270401073113667393089CU03`.
  Run script failed after approximately 12.3 seconds with:
  `Approved input column contains a formula: Customer Name` (line 50).
  The guard executes before pauseProtection/addRow/cell writes, so the write
  was refused before mutation. A full post-test structural comparison is not
  yet performed and must not be claimed as passed.
- Read-only inspection of the approved local baseline confirms Customer Name
  (column 10) is calculated with:
  `=IFERROR(VLOOKUP(RC9,Customer_List!R2C3:R1000C7,1,FALSE),"NA")`.
  This contradicts treating that column as an editable input. Do not weaken
  the formula guard or silently replace the formula with SharePoint text.
- Pilot was turned Off and its Off status verified. No email actions exist in
  the pilot. The production flow was not enabled or edited during this test.
- Need user/management direction: keep Excel's Customer Name calculation and
  store the independent name only in SharePoint, or approve a changed reporting
  contract. Independent customer reporting AND identical existing formulas
  cannot both be promised under the current workbook design.

### User-approved manual customer exception

User requested unified reporting with manual Excel correction only when End
User and Customer differ. Local source and pilot script now omit Customer Name
from synchronized inputs, keep its formula propagation on new rows, and do not
touch formulas or manual Customer Name values on existing rows. The full
business payload still requires the customer value for a returned
manualCustomerUpdateRequired flag (trimmed case-insensitive name comparison).
The separate pilot script editor confirmed Script saved; local checks: 31 pass.

Resubmitted the same bounded event with the pilot remaining Off:
run `08584102225586303264021610278CU11` started. Result and protection verification
pending. No production flow activation or production workbook write authorized
by this pilot retest. Missing Customer_List lookup values can still result in NA
even when names are equal; reference completeness needs reconciliation before
promising that only different-name rows require human attention.

Retest result: run `08584102225586303264021610278CU11` succeeded. Run script
duration 21.4 seconds (asynchronous copy write, not app save latency). Excel UI
located one newly inserted test record at row 346:

- B346 = MSOL2614; I346 = TEST End User; AL346 = TEST-RECOVERY.
- T346 displays 7 October 2026, confirming date-only mapping for this fixture.
- J346 retains `=IFERROR(VLOOKUP($I346,Customer_List!$C$2:$G$1000,1,FALSE),"NA")`.
  It evaluates to NA because the synthetic End User is not in Customer_List.
- Master Sheet UI shows protected. Script completion also passes its post-write
  getProtected / !getIsPaused guard.
- AC346 contains raw SharePoint rich-text HTML. This confirms a real remaining
  normalization defect, not successful business-value acceptance.

Pilot remains Off (manual resubmission did not enable it). Live report/production
flow unchanged. No emails sent. Full workbook contract, duplicate retry,
manual-override preservation and customer exception-change scenarios remain to
test. If a manually overridden row's End User/Customer later changes, review the
override for staleness; the current pilot never restores/replaces Customer Name
automatically. The manual flag is returned by the script but is not yet wired
to the production administration/app notification workflow.

## 7 October: Scope Details HTML conversion pilot

Added Microsoft's Content Conversion `Html to text` action between the pilot
trigger and Run script. Content uses
`if(empty(triggerBody()?['ScopeDetails']),'<div></div>',triggerBody()?['ScopeDetails'])`;
the reporting request maps `Scope of Supply Details` to `body('Html_to_text')`.
No production flow or legacy script was changed. Save checker: 0 errors,
0 warnings. Blank input handling is configured but not yet runtime-tested.

Resubmitted the same bounded synthetic event, run
`08584102084356163179629456439CU23`. HTML conversion succeeded in 0.6 seconds.
Run script also succeeded in 13.3 seconds; this is asynchronous reporting
latency, not the interactive app-save latency.
Excel-copy inspection after the write confirmed:

- AC346 is plain text: `Line one Line two with "quotes"`, with no HTML wrapper.
- J346 retains the same original VLOOKUP formula documented above.
- B346 remains MSOL2614 and B347 is blank: the retry updated the existing row
  rather than appending a second row at the end.
- Master Sheet still shows protected in Excel.

This fixes HTML leakage, not previously lost line breaks: the source fixture
already contains collapsed text. Full workbook-contract comparison, manual
Customer Name override tests and blank/HTML entity/multiline cases remain open.

## 7 October: current Power App Reset correction

Updated Button4 RESET in the existing development app, saved unpublished.
OnSelect now guards `!varIsSaving`, clears both screen-local record variables
(including varCurrentSPRecord), clears validation/mode/visibility state and
the global varRequestId, releases varResetControls, and explicitly resets all
business controls plus smart search/PO/copy-customer toggle. DisplayMode disables
Reset while varIsSaving. There are no Excel calls or full-table refreshes here.

Read-only preview tests passed: enter disposable unsaved text, Reset, reopen
New -> blank fields; repeat the same sequence; search/load synthetic MSOL2614,
Reset, reopen New -> previous record text and PO absent. No business submission,
email or reporting write was triggered. In-flight guard was checked as formula
logic, not tested during a real save.

Also changed DataCardValue14 Default to PlainText(Coalesce(existing scope, ""));
preview of MSOL2614 shows `Line oneLine two with "quotes"` without HTML or encoded
entities. Previously lost source line breaks are not restored by this change.
App checker Formulas: No errors found. Three pre-existing performance issues
remain. The app is still Saved (Unpublished).

## 7 October: post-pilot workbook contract comparison

Ran existing read-only CompareWorkbookContract from the Excel COPY's editor,
supplying the approved baseline. Output was explicitly observed:
`{"status":"pass","differenceCount":0,"differences":[]}`.
This is post-insert/post-upsert evidence, not merely a successful-script banner.
The captured contract covers sheet/table names and order, headers, column widths,
formula/number-format patterns, table style/filter/totals flags, chart/pivot
names/types, named ranges, slicers, print settings and protected/not-paused state.
It is not a full pixel/style equivalence check or management sign-off; per-cell
styles, all report dependencies and manual Customer Name exceptions still need
acceptance. No workbook cells were modified by this comparison.

Offline checks also passed: package 60; reporting request/source guards 31;
notification predicate 152 migration records suppressed and 12 scenarios.
These do not replace live email, failure-injection or six-session p95 testing.

## 7 October: New dropdown defaults corrected

User screenshot correctly showed nonblank dropdown defaults despite blank text
inputs; the earlier Reset preview did not establish blank dropdown acceptance.
AllowEmptySelection was false. Enabled it for BU, Sub BU, Book Period, Prob,
Lead Type, Specs/Model and Sales Recommendation. Their defaults are now blank
in New mode and retain the existing saved-record formula in edit mode.
New clears both record states/request ID and explicitly resets all inputs,
and is guarded/disabled during varIsSaving.

Preview: all eight text inputs and seven option dropdowns were empty after
New. Read-only load of MSOL2612 showed its stored PT/FY26 P12/0/Competitive
Replacement/Specs/Meet Cust. Request values; pressing New directly afterwards
again cleared all text inputs and dropdowns. No business records were saved.
Copy-customer toggle intentionally stays on; both name controls are blank until
End User is selected. Final state Saved (Unpublished), no formula errors.

## 7 October: production reporting draft compatibility repair

Production SyncSalesReporting was verified Off before editing. Saved trigger
settings actually showed concurrency 20, contradicting earlier checkpoint
claims. Draft corrected to 1. Run script was still bound to legacy
SaveSalesTrackerProtected, incompatible with the requestJson payload. Draft
now selects the separately tested SyncSalesTrackerReporting_Pilot_20261007,
adds Microsoft Html to text using the existing connection, and restores the
tested fixed-column payload with date-only and nullable numeric conversion.
The original workbook path is retained; no flow run/Excel write/email occurred.

Run script settings visually confirmed exponential retry count 6, PT10S
interval/minimum, PT1M maximum; secure inputs and outputs both On.
Script rebinding cleared the password input. Flow checker: Errors (1),
Warnings (0), exclusively `'ScriptParameters/sheetPassword' is required`.
These changes remain UNSAVED pending private owner password entry and Save.
UI left on Run script Parameters. Never record the password in chat/docs.
Durable recovery, manual exception notification and live failure tests are
still open; saving this compatibility fix is not production acceptance.

Owner confirmed private password entry. Save returned "Your flow is ready to
go"; Flow checker Errors (0), Warnings (0). Details page verified Modified
7 October and Status Off. Compatibility draft is now saved, not production
enabled. No production test run, workbook mutation or email was initiated.

Reopened the saved reporting flow and independently verified trigger concurrency
degree 1. Production flow remained Off.

## 7 October: startup warning removal and BU binding correction

Selected complete OnStart text before editing: only the two Concurrent
ClearCollect reference loads plus Set(varIsSaving,false) were present. There
was no opportunity-list preload or additional initialization to preserve.
App.Formulas was empty. Moved those read-only table expressions into named
formulas using the existing colSalesCustomers/colSalesOptions identifiers and
same field aliases/sort/filter behavior; OnStart retains Set(varIsSaving,false).
This follows Microsoft's named-formula startup guidance:
https://learn.microsoft.com/en-us/power-apps/maker/canvas-apps/working-with-large-apps

App checker Recheck: Performance -> No errors found; Formulas -> No errors
found. The prior three performance warnings are no longer present. This is
not a measured startup/search/save latency result.

Preview revealed BU display field was Category, yielding BU/BU/BU. Read-only
SharePoint inspection confirmed live BU Titles M&A/FMP/MSS match prepared data.
Changed BU's display-field Value from Category to BU; preview shows M&A/FMP/MSS.
Customer picker still shows real customer choices, and New begins with blank
inputs/options. No business submission was made. Saved (Unpublished) confirmed.
# Reporting logic checkpoint — 7 October 2026

Post-failure contract comparison: final PASS, zero differences after correcting
comparison of pivot-name inventory enumeration. The strict positional comparator
initially blocked only because the same three Helper_Pivots names appeared in a
different array order, reproduced by a second read-only run. Baseline unchanged;
no pivot/report layout edits. The saved comparator now canonicalizes only that
string inventory with multiplicity preserved. All other arrays remain ordered;
15 regression checks passed. Pivot anchor/visual layout is not in the original
contract and still requires independent management visual acceptance.

LIVE COPY failure-safety run `08584102008874914862323023965CU02` passed
(Run script 11.2 seconds). Guarded harness asserted rejection of incorrect
protection password, invalid request, and calculated-input formula; original
cells/row count/protection were checked, the temporary Project_Name formula was
restored in finally, and a valid upsert afterward did not add a row. The harness
was removed and normal source saved. These checks do not simulate a live Excel
API failing midway through a write or prove scheduled recovery after retries
are exhausted. Production configuration remained unchanged and reporting Off.

Follow-up LIVE COPY acceptance passed in pilot run
`08584102015801397314419117580CU30` (Run script 26.6 seconds). The temporary,
copy-name/fixture-gated harness called the updated script three times: existing
manual Customer Name preserved, new row after a manual exception had its customer
formula, and replay did not duplicate that temporary row. Cleanup asserted the
original row count and protection, restoring the original customer formula.
The harness was removed and the normal updated script saved. Read-only
`CompareWorkbookContract` subsequently returned
`{"status":"pass","differenceCount":0,"differences":[]}`. Secure inputs/outputs
were not disabled; run-result contents remain hidden. No production write/email,
SharePoint creation/deletion, or app publication occurred. This supersedes the
not-yet-installed status below, but does not satisfy all failure/recovery or
six-user performance tests.

`node production-optimization/test-reporting-runtime.mjs`: 14 checks passed
against a mock Excel API using the actual script body. Covers failed writes and
inserts, rollback/protection restoration, stable-ID retry behavior, manual
Customer Name preservation, formula guards/propagation and date/literal handling.

A regression test with a manual Customer Name exception in the immediately
preceding row failed before the local fix and passed after it. The fallback now
uses the nearest surviving R1C1 calculated-column formula from existing rows.
This local fix has not been installed in Office Scripts. Live copy-workbook
testing, post-change contract comparison, durable recovery, reconciliation and
six-session latency acceptance remain open. The pilot was left Off with no
configuration save or run; production remains Off and the app unpublished.
