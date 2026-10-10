# Deployment state

## Live resources created

- SharePoint site: `https://entrag.sharepoint.com/sites/InsideSalesTeam`
- `SalesOpportunities` list ID:
  `111359ec-dcc4-495e-9922-77d4518b5093`
- `SalesOpportunities` contains every field in `sharepoint-schema.md`.
- Active indexes: ClientRequestId, ExcelRowKey, Modified, OpportunityDate,
  POReference, ProjectName, QuoteNo, QuoteSeq, and Revision.
- Support lists created and configured: SalesSequence, SalesCustomers,
  SalesOptions, and SalesIntegrationLog.
- SalesSequence has required whole-number `NextNumber` and required whole-number
  `Revision` (default 1). It is seeded with `MSOL26`, NextNumber `4`, Revision
  `1`, based on the highest source QuoteSeq of 3.
- The approved legacy-compatibility rules are live: QuoteNo remains indexed but
  is not column-level unique; Application, OpportunityDate, and Discount allow
  legacy blanks at the list level. QuoteSeq is optional for legacy rows, uses
  zero decimals, and remains unique when populated. New records remain subject
  to app/flow validation.
- SalesCustomers has unique Title plus AccountManager, Active, and SortOrder.
- SalesOptions has indexed Category plus ParentValue, Active, and SortOrder.
- SalesIntegrationLog has OpportunityId, Revision, Operation, ExcelStatus,
  EmailStatus, AttemptCount, plain-text LastError, ProcessedAt, and unique
  CorrelationId.
- A 152-record migration package was generated and validated at
  `migration/sales-opportunities.json`. It has 152 unique ExcelRowKey values and
  no missing values in the fields that remain required during import.

## Deliberately not changed

- The published canvas app still uses its existing Excel connection.
- The management workbook has not been edited, unprotected, or structurally
  changed.
- No flow has sent an email.
- Live inspection on 6 October found existing migrated records with
  `ClientRequestId=migration-<stable-id>`. The exact migrated count and business
  reconciliation remain unverified. Do not reimport the prepared package blindly.
- One explicitly labelled zero-value acceptance record was created on 6 October:
  ID 154, QuoteNo `MSOL265`, request ID `performance-test-20261006-create-001`.
  It has not been synchronized to Excel or emailed. Keep it out of cutover reporting.
- No production cutover has occurred.

## Required before cutover

## Latest development checkpoint — 6 October

- All three flows exist. The optimized current app is saved as an unpublished
  draft with SharePoint search and create/update flow connections.
- CreateOpportunity was repaired after a historical run exposed invalid CAS JSON
  and an unsafe path that created ID 153 despite failed sequence reservation.
- The sequence was reconciled to NextNumber 5 / Revision 2 before the test.
  The successful new-create test allocated sequence 5 and returned ID 154,
  `MSOL265`, revision 1. Do not use the original seed of 4 again.
- Existing request retry returned ID 153 / `MSOL264` / revision 1 and skipped
  allocation and creation. Six distinct concurrent calls all succeeded with
  consecutive quotes MSOL266 through MSOL2611 (IDs 155–160). Parallel identical
  new requests and full-session performance acceptance remain untested.
- New-create serialization retained quoted text, separate Customer/End User,
  and POReference. The run's Condition duration was 1.8 seconds, with an additional
  0.4-second initial lookup; this is not a p95 performance acceptance result.
- UpdateOpportunity now uses safe object serialization, explicit JSON response
  format for reads, and returns success/conflict/error after conditional-update
  outcomes. A correction of test ID 154 succeeded and returned revision 2.
  Stale/concurrent-edit runtime testing is pending.
- Reporting is Off. Recipient environment variable is bound. Both legacy
  migration prefixes are suppressed. Durable reporting retry/recovery is pending.
- Maintenance freeze, Cairo site timezone, complete reconciliation, workbook
  compatibility, six-user measurements, and management approval still gate release.

## Original rollout checklist (not evidence of completion)

### 7 October follow-up

- A separate disabled pilot flow was created: `SyncSalesReporting_Pilot_NoEmail_20261007`,
  ID `e9b9e5f8-4dc2-f111-aaaf-70a8a581110f`. It targets the OneDrive workbook
  `Final_Sales_Master_Rev12_11 (Uploaded)(xlsx) - Copy.xlsx`, not the live report.
  Only the SharePoint trigger and Run script remain. Email and integration-log
  actions were removed from this clone only. Its trigger condition allows only
  ID 163 with ClientRequestId `performance-test-20261007-create-recovery-001`.
  Pilot concurrency was set to 1, existing SharePoint/Excel connections were
  bound, and save validation returned `Your flow is ready to go`. No pilot write
  has been performed yet. The production reporting flow was not changed/enabled.
  The clone initially displayed concurrency 20; re-verify the ORIGINAL flow's
  saved concurrency before release rather than relying on earlier notes.
- Pilot follow-up: read-only CaptureWorkbookContract ran successfully on the
  workbook copy. Visible output confirms five worksheets including hidden
  Helper_Pivots, and Master Sheet protected with protectionPaused=false. The UI
  truncates the logged JSON, so a full post-write structural comparison is still
  required, not proved by this capture alone.
- The deployed legacy SaveSalesTrackerProtected expects mode/recordId, unlike
  the reporting flow payload. A NEW separate script,
  `SyncSalesTrackerReporting_Pilot_20261007`, was created from the hardened
  reporting implementation and the editor showed Script saved. The legacy
  script was not modified. The pilot flow's UNSAVED draft now selects this new
  script and maps the fixed business headers, preserving separate Customer and
  End User and formatting OpportunityDate as yyyy-MM-dd. Its Secure inputs and
  Secure outputs settings are On. Rebinding the script cleared sheetPassword;
  owner entry in the flow UI and Save are required before testing. Never enter
  the password in chat or documentation. ScopeDetails still needs rich-text
  normalization and newline reconciliation before production acceptance.
- Owner supplied the pilot password and saved. The pilot draft is now saved
  with the compatible script and numeric-null expression correction. Two
  controlled runs failed safely: first before Excel invocation (empty on Float),
  then before workbook mutation (Customer Name is a calculated column).
  Pilot is Off again, verified. The baseline's Customer Name VLOOKUP must remain
  intact until the user resolves the reporting-contract conflict. See runtime
  acceptance log for run IDs and exact limitation. No full post-test contract
  comparison or successful Excel synchronization is claimed.
- User-approved rule (7 October): automatic sync writes the other approved
  inputs, but never writes Customer Name. Excel keeps its existing calculation;
  when Customer Name differs from End User, only that Customer Name cell is
  corrected manually. Existing manual overrides must survive later syncs.
  Local source and the separate pilot script now use INPUT_COLUMNS excluding
  Customer Name, while still validating the complete business payload. The
  script returns manualCustomerUpdateRequired. Local tests pass 31 checks.
  The production flow and legacy app script have NOT been changed to this rule.
  The request must be reflected in the release contract as an explicitly
  authorized per-row manual formula exception, not a general formula redesign.

- Update retry receipt tests passed at revision 6 for synthetic ID 154; see the
  runtime acceptance log for the initial failed test and final corrected result.
- Create failed-POST recovery is saved, with 0 checker errors and warnings.
  A normal create produced synthetic ID 163 / MSOL2614 / revision 1, and its
  identical manual replay found that same item without allocating another quote.
  Concurrent identical new requests and durable reservation recovery remain open.
- MSOL2612 and MSOL2613 are user submissions and must be preserved. Do not reset
  the sequence to its original seed or reuse any issued quote numbers.
- Reporting is still Off; the optimized app remains unpublished. ScopeDetails
  rich-text/newline handling and Pacific-to-Cairo/date-only compatibility now
  explicitly gate reporting acceptance. Only the workbook COPY has been written
  by the isolated test; no live-report changes or emails were made.
- Scope Details HTML conversion is saved in the isolated pilot (0 checker
  errors/warnings). Replay `08584102084356163179629456439CU23` succeeded:
  conversion 0.6 seconds, Excel script 13.3 seconds. AC346 now has plain text,
  J346 retains its original formula, and B347 is blank after the existing-row
  retry. Previously lost line breaks, blank/multiline cases, full workbook
  contract and manual-customer-override acceptance remain open.
- Current development Power App Reset was corrected and saved unpublished:
  clears both screen-local record states, retry request ID and every business
  input, and is guarded/disabled while varIsSaving. Preview passed repeated
  unsaved-form reset and existing-record -> reset -> blank New form. Scope
  Details edit default now uses PlainText; synthetic reload confirmed no HTML.
  App checker Formulas: No errors found. Three performance issues remain.
- Post-pilot read-only CompareWorkbookContract on the COPY returned explicit
  `status=pass`, `differenceCount=0`. Captured structural/formula/format/protection
  contract passed; full visual/reporting acceptance and management sign-off
  remain required. Neither production reporting nor app publication was enabled.
- Latest production reporting inspection found saved trigger concurrency 20,
  not 1, and legacy SaveSalesTrackerProtected bound to the new request payload.
  An UNSAVED draft now sets concurrency 1, binds the tested separate
  SyncSalesTrackerReporting_Pilot_20261007 script, adds Html to text, and maps
  date-only/numeric-null/stable-ID business payloads as tested on the COPY.
  Workbook target remains the original live-report path; no run was initiated.
  Excel retry remains exponential (6, PT10S, max PT1M), secure inputs/outputs On.
  Flow checker reports exactly one error: sheetPassword is required after
  rebinding. Owner must enter it privately in Run script Parameters and Save.
  Until then, these production-draft fixes are NOT saved; existing flow remains
  Off. Do not enable it after Save until recovery/reporting acceptance passes.
- Owner supplied the private password and the production reporting compatibility
  draft was saved on 7 October. Flow checker: 0 errors, 0 warnings; details
  confirmed updated modification time and Status Off. This supersedes the
  preceding UNSAVED checkpoint. No production run or email was initiated.
- Reopened saved production reporting trigger and verified degree of
  parallelism 1. No production activation or run occurred.
- Development App.OnStart is now only Set(varIsSaving,false). The two read-only
  reference datasets moved to App.Formulas named tables under their existing
  colSalesCustomers/colSalesOptions identifiers, retaining all compatibility
  columns. Recheck showed no Performance issues and no Formulas errors.
  This removes the three previously reported startup/collection warnings.
  A preview caught BU.Value bound to Category (displaying BU three times).
  Corrected its display field to BU; preview now shows M&A/FMP/MSS. Customer
  choices also populate, and New still has blank fields/options. Saved
  unpublished. This is not measured six-session performance acceptance.
- Additional reporting runtime tests on 7 October execute the actual Office
  Script against a fault-injectable Excel API double. Fourteen checks pass:
  existing-row rollback, failed-insert cleanup, protection-session restoration,
  stable-key idempotency/duplicate rejection, calculated-input guard, literal
  values, date systems, and preservation of manual Customer Name corrections.
  These are OFFLINE tests, not live Excel failure acceptance.
- The new manual-preceding-row test initially failed: fallback propagation only
  inspected the immediately preceding row. The LOCAL script now bulk-reads
  existing R1C1 formulas and finds the nearest surviving calculated-column
  template, preserving the manager's correction. This change is NOT deployed
  to SyncSalesTrackerReporting_Pilot_20261007 yet. Deploy to the isolated COPY
  test path, verify manual-exception/new-row behavior and workbook contract,
  and only then approve its use by production reporting.
- Validator checks 31 and package checks 60 also pass after the local change.
  The pilot flow was inspected and left Off without saving configuration changes
  or running it. No live failure-injection test, production write, or email was
  performed in this checkpoint; production reporting stays Off.
- Subsequent deployment checkpoint: the updated normal reporting source is now
  saved in Office Scripts as SyncSalesTrackerReporting_Pilot_20261007. A guarded
  temporary harness refused any workbook except the exact COPY filename and
  required synthetic ID 163 / MSOL2614 as its final row. Pilot replay
  08584102015801397314419117580CU30 succeeded; Run script took 26.6 seconds.
  Its assertions exercised preservation of an existing manual Customer Name,
  insertion after that manual exception, calculated Customer Name propagation,
  identical-request upsert without a second temporary row, cleanup back to the
  original row count, original Customer Name formula restoration and protection.
  Secure run inputs/outputs remain hidden; they were not disabled for inspection.
- The temporary harness has been removed from the saved Office Script and the
  normal updated reporting implementation restored (Script saved confirmed).
  The COPY's CompareWorkbookContract then returned explicit
  {"status":"pass","differenceCount":0,"differences":[]} against the approved
  10,099-character baseline. Only the temporary COPY acceptance row was removed;
  no SharePoint opportunity, real quote or production workbook row was deleted.
  No email was sent, production reporting was not activated, and the development
  app was not published. Durable recovery/reconciliation and full six-user
  latency/visual acceptance remain open.
- Live COPY failure-safety pilot replay
  08584102008874914862323023965CU02 succeeded (Run script 11.2 seconds).
  A copy-name/ID-163-gated temporary harness verified rejection of an incorrect
  protection password, an invalid request payload, and a calculated formula in
  an approved input column. Before/after table formula/value snapshots, row count
  and protected/not-paused state were asserted. The temporary input formula was
  restored in finally; a subsequent valid upsert succeeded without adding a row.
  This is live script rejection/replay acceptance, NOT action-retry exhaustion,
  durable queue recovery, live API mid-write failure, or email-delivery acceptance.
  The harness was removed; normal source is saved in Office Scripts again.
- A read-only audit reconfirmed the production worker queries only the base
  CorrelationId (ID-Revision), top count 1. Durable automatic retry after bounded
  Excel retries and latest-revision ordering remain open. Build/flow-contract
  documentation was corrected to distinguish these gaps and ambiguous-email
  safeguards from implemented behavior; production flow configuration was not
  saved or enabled during the audit.
- Post-failure COPY contract comparison initially blocked on three differences:
  only the enumeration order of the same three Helper_Pivots pivot names changed
  (90%, Weight by Period, 75%). An identical read-only repeat reproduced those
  differences. The approved baseline file was NOT changed and no pivot objects
  were edited. CompareWorkbookContract now compares only each sheet's string
  pivot-name inventory as a sorted multiset; all other arrays remain positional.
  Fifteen regression checks verify missing/renamed/duplicate pivots, sheet/header
  ordering, formula/format/protection/print/chart/named-range changes still block.
  This does not prove pivot anchor positions or visual layout, which the original
  capture never recorded; management visual sign-off remains a release gate.
- Corrected comparator is saved in Office Scripts and compiled/executed on the
  COPY. Final output: {"status":"pass","differenceCount":0,"differences":[]}.
  An initial partial editor paste and subsequent Office Scripts type-inference
  errors were repaired before this final successful run. Reporting runtime
  checks 14, comparator checks 15, and package checks 60 pass locally. No
  production activation, notification email or app publication occurred.

## Durable reporting queue checkpoint — 2026-10-08

- Created empty SalesReportingQueue on InsideSalesTeam, ID
  7e7792f9-8896-4e92-b1c6-3e2391140edc. Saved all ten queue fields, required
  unique Title, and verified five indexes (Title, State, NextAttemptAt,
  LeaseExpiresAt, OpportunityId). No opportunities or Excel data were changed.
- Saved State's required flag through classic List Settings and verified the
  required marker. LastError is multiline plain text with append disabled.
- Added the offline recovery policy and regression tests; these are not a live
  worker. Automatic retry after action exhaustion is STILL NOT DEPLOYED.
  See reporting-recovery.md for actual schema and remaining single-writer build.
- Site UI still displays Pacific time; Cairo regional configuration remains open.
  Production reporting was not enabled and the development app was not published.
- Started UNSAVED native scheduled draft SyncSalesReporting_Queue_Pilot_NoEmail_20261008.
  Queue read/loop/REST read are entered, but its condition, claim, Excel upsert and
  retries are not finished. No Excel/email action exists there. Repeated Arc
  concurrent-change rejections prevented safe continued editing; no flow ID or
  successful save is claimed. See reporting-recovery.md for exact resume state.

### 2026-10-09 reporting-worker continuation

- Superseded the unsaved draft with saved pilot flow
  `5998de92-8e3a-47a2-b434-a71a9f4f1829`; verified Off. Saved checkpoint contains
  due fixture-job selection, fresh queue read, eligibility check and ETag claim.
  Persisted recurrence concurrency is 1; start time is 2040-10-08T07:00:00Z.
- No Excel/email action is present yet. Durable retry processing is still not
  complete or live-tested. Production reporting remains off; app unpublished.
- Adding latest-opportunity read exposed a broken existing SharePoint connection
  for ahmed.adel@entrag.com. Undid incomplete action; subsequent Save failed on
  that connection. Previous successful checkpoint is retained. Connection repair
  is now prerequisite; see reporting-recovery.md for exact state.
- The exact connection details subsequently showed Connected, inconsistent with
  the designer error. No credentials or permissions changed. Native inventory
  timed out and Arc input reported a paste conflict; reopened the saved pilot URL
  only after confirming the address. Revalidate connectivity before editing.
- Offline regression rerun: recovery 27, request/source guards 31, script mock 14,
  contract comparator 15, notification scenarios 12 (152 migration rows
  suppressed), all pass. These do not establish live worker acceptance.
- After owner reconnection, classic designer loaded metadata and successfully
  saved latest-opportunity Get_item, Html_to_text and safely serialized Compose
  payload. Eligibility Boolean true confirmed. New designer connection-list
  initialization remains unreliable; use classic for this pilot.
- UNSAVED Run_script now targets COPY and approved pilot script, requestJson
  outputs('Compose'), secure input/output On, bounded exponential retry settings
  entered. Owner must enter workbook password directly and Save, keeping flow Off.
  No queue worker acceptance/live Excel run occurred; completion/retry handlers
  and reconciliation remain open. See reporting-recovery.md before resuming.

1. Completed: original support-list columns from `sharepoint-schema.md` are live.
2. Completed: the workbook contract was captured, validated, and stored in
   `baselines/management-workbook-baseline.json`. The unchanged pilot workbook
   returned `status=pass`, `differenceCount=0`.
3. Migrate and reconcile every current SalesTracker row.
4. Completed: SalesSequence is seeded to the highest source QuoteSeq plus one.
5. Build/test the three flows from `power-automate-build.md`.
6. Install/test the protected sync script. The workbook owner enters the password
   as a secure flow value; it is never stored in source or chat.
7. Wire the optimized Power Fx, run `acceptance.md`, obtain management sign-off,
   then publish.
# Queue worker live acceptance checkpoint — 2026-10-09

- No-email queue pilot only was enabled temporarily for manual tests and
  turned off immediately after each start; final Off verified.
- Source 163 is Revision 1 / MSOL2614 with ExcelRowKey
  APP-performance-test-20261007-create-recovery-001. Corrected pilot payload
  guard's missing APP- prefix and verified successful Save.
- One queue item 163-1: intentional fail-closed attempt recorded Retry;
  corrected retry ran the protected COPY script successfully and finalized
  Succeeded / CompletedRevision 1. Independent SharePoint receipt shows
  AttemptCount 2, cleared next-attempt/lease/error, no duplicate queue item.
- Completed-job replay succeeded in 310 ms without executing queue-loop
  actions or invoking Excel. No email action exists in this pilot.
- Post-write workbook contract, interruption recovery, enqueue/reconciliation,
  production email, full migration reconciliation and six-user acceptance
  remain release gates. Production synchronization off; app unpublished.
