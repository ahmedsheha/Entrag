# Durable reporting recovery

## Deployment checkpoint — 2026-10-08

Created the empty `SalesReportingQueue` on InsideSalesTeam, list ID
`7e7792f9-8896-4e92-b1c6-3e2391140edc`, inheriting site permissions.
No opportunity, workbook or email was changed during this setup.

| Field | Persisted configuration |
| --- | --- |
| Title | Required unique single-line text; job key `OpportunityId-TargetRevision`; indexed |
| OpportunityId | Required number, 0 decimals, minimum 1; indexed |
| TargetRevision | Required number, 0 decimals, minimum 1 |
| AttemptCount | Required number, 0 decimals, minimum 0, default 0 |
| CompletedRevision | Optional number, 0 decimals, minimum 1 |
| LeaseToken | Optional single-line text |
| NextAttemptAt | Optional date/time, Include Time Yes; indexed |
| LeaseExpiresAt | Optional date/time, Include Time Yes; indexed |
| State | Required single-choice Pending/Running/Retry/Succeeded/DeadLetter/Superseded; default Pending; indexed |
| LastError | Optional multiline plain text, append disabled |

The five indexes were verified on the Indexed Columns page. Required flags were
verified in List Settings after correcting State there. The site still displays
Pacific time; store scheduler dates in UTC, and retain Cairo regional-settings
verification as an unresolved deployment requirement.

## Next implementation — not yet live

1. Build an enqueue-only opportunity trigger with unique Title. On duplicate-key
   creation, read and verify the existing job; do not reset completed jobs.
2. Replace the current event-driven Excel writer with ONE scheduled serialized
   writer. Do not enable another Excel writer alongside it. Both remain off until
   the COPY pilot passes. Trigger concurrency and each job loop must be 1.
3. Query pending/retry jobs due in UTC. Claim with an ETag-conditional queue update,
   increment attempts and persist a run identifier in LeaseToken before work.
   Expired Running leases require confirmation that the previous run is terminal;
   expiry alone is not safe evidence that an Excel request has stopped.
4. Fetch the latest complete opportunity just before upsert. Persist the actual
   synchronized revision, not the older queued revision. Keep original create
   notification eligibility separately; superseding an older create event must
   not lose its one notification.
5. Use the existing secure protected-workbook script. On failure persist a safe
   error code/run ID and a future retry time (1, 2, 4, 8, 16, 32, 60 minutes).
   After eight worker attempts, DeadLetter requires administrator investigation.
   Connector-action retries are separate and do not replace durable retries.
6. Use an immutable unique per-opportunity create email receipt. Reserve Sending
   before sending. Succeeded means no resend; Sending/Unknown require manual
   delivery review, never automatic resend. Updates and migrations never notify.
7. Add periodic paginated reconciliation for opportunities without a queued latest
   revision, including missed triggers. Exclude synthetic fixtures from production
   backfill; migration jobs must retain email suppression.
8. Force COPY script failure and verify due retry after a later scheduled run,
   restart recovery, duplicate enqueues, revision ordering and email safeguards.
   Re-run the workbook contract; reconcile migrated business values; obtain
   management visual sign-off and six-user performance acceptance before enabling.

`reporting-recovery-policy.mjs` and its tests are an offline reference for the
Power Automate conditions. They do not execute SharePoint or Excel work and are
not a substitute for deploying and testing the flow.

## Native designer checkpoint — 2026-10-08, partial/unsaved

Opened a new scheduled draft named
`SyncSalesReporting_Queue_Pilot_NoEmail_20261008` (new-flow URL, no saved flow ID).
Start time was verified as `2099-10-08T07:00:00Z`; recurrence concurrency was
enabled and the slider set to 1, but its persisted code still needs verification.
The draft contains:

- `Get_items`, display name Get due reporting jobs: InsideSalesTeam,
  SalesReportingQueue, Top Count 1, Order By ID asc, filter restricted to
  OpportunityId 163, AttemptCount below 8 and due Pending/Retry states.
- `Apply_to_each`: source corrected to `body('Get_items')?['value']`.
- `Send_an_HTTP_request_to_SharePoint`, display name Read queue job: GET the queue
  item by loop ID; Accept changed to application/json;odata=verbose so the next
  claim can reference `body('Send_an_HTTP_request_to_SharePoint')?['d']?['__metadata']?['etag']`.
- Empty `Condition`; eligibility expression and all write/retry actions remain
  unfinished. No Excel or email action exists in this draft.

Card-title edits changed display names, NOT internal action keys. Use the actual
keys listed above in expressions. The zero-error checker observed before the
empty condition was configured is not acceptance of this incomplete draft.

Arc repeatedly rejected input with "The user changed '/Applications/Arc.app'"
even after fresh state reads; designer zoom/view also changed during interaction.
Work stopped without Save rather than risk a wrong-control edit. Resume only
after a stable view, inspect current draft (or recover it if lost), finish and
save the complete pilot, then explicitly turn it off and verify its status.
Production SyncSalesReporting was visibly Off before starting this draft.

## Saved pilot checkpoint and connection blocker — 2026-10-09

The earlier unsaved draft was superseded by saved flow
`SyncSalesReporting_Queue_Pilot_NoEmail_20261008`, ID
`5998de92-8e3a-47a2-b434-a71a9f4f1829`. Its status was explicitly verified Off.
The saved recurrence starts at `2040-10-08T07:00:00Z`, interval 1 minute;
persisted code verified recurrence concurrency `runs: 1`.

The saved pilot restricts due jobs to synthetic OpportunityId 163, Top Count 1,
ordered ID asc. It re-reads the queue item with verbose OData, checks due
Pending/Retry state and attempts below eight, then conditionally claims with the
fresh ETag. The POST/MERGE claim sets Running, increments AttemptCount, stores
the owning flow run in LeaseToken and a 30-minute lease, and clears LastError.
Claim action retry policy is None. A 412 cannot proceed to Excel work.
No Excel or email action exists in this pilot yet; it is not acceptance-ready.

On continuation, adding a latest-opportunity Get item action failed to load its
settings. That incomplete action was undone. A subsequent Save explicitly
reported a broken SharePoint connection for Get items:
`shared-sharepointonl-59d490af-04d4-4973-bfa6-a10a972cd40e`
(`ahmed.adel@entrag.com`). Thus that subsequent Save did not succeed; the
previous successful claim checkpoint remains the saved implementation. Opened
the connection repair page. Repair the existing connection before further live
editing/testing. Never enable this incomplete worker or production writer.

The exact connection's details page subsequently reported Connected, despite
the designer's broken-connection save error. Another existing SharePoint
connection (`shared-sharepointonl-c971a3cf-2815-40e7-8d8a-c232602b439c`) also
reported Connected and is used by the earlier flows. No account/permission/
credential changes were made. Reopen the pilot and revalidate the existing
connection; the error may be transient, but that has not been established.
Re-ran offline recovery checks: 27 passed; no live queue test was performed.

## Classic designer recovery — 2026-10-09

After the owner reported reconnection complete, the new designer still failed
new-action setup with `connections list not yet initialized` and Invalid
connection. Switched only this pilot to the classic designer. Site/list metadata
loaded successfully and Save returned the ready-to-test success banner.
Verified the eligibility right operand is the Boolean expression `true`.

Added and successfully saved `Get_item` after the ETag claim: InsideSalesTeam,
SalesOpportunities (`111359ec-dcc4-495e-9922-77d4518b5093`), Id expression
`int(body('Send_an_HTTP_request_to_SharePoint')?['d']?['OpportunityId'])`.
Added and successfully saved `Html_to_text` Content Conversion with expression
`if(empty(body('Get_item')?['ScopeDetails']),'<div></div>',body('Get_item')?['ScopeDetails'])`.
The latest successful save showed the ready-to-test banner; no live run was
started. No Excel/email action exists yet. Production/app remain disabled/
unpublished. Do not recover an older browser draft over this saved checkpoint.

### Payload saved; protected script awaiting owner input

Successfully saved `Compose` after Html_to_text. Its expression builds an object
using nested `setProperty(json('{}'),...)` and serializes with `string(...)`.
It includes latest item ID/Revision/ExcelRowKey/QuoteNo, nullable integer QuoteSeq,
1900 date system and all 18 existing business-column keys. Scope of Supply Details
uses `body('Html_to_text')`; Customer Name is included only for the script's
manual-difference flag, never as a writable cell. This avoids unsafe hand-built
JSON concatenation for quotes/newlines in business text.

Added an UNSAVED `Run_script` action after Compose. Selected OneDrive (`me`),
OneDrive library, `/Final_Sales_Master_Rev12_11 (Uploaded)(xlsx) - Copy.xlsx` via
file picker, and actual dropdown reference `SyncSalesTrackerReporting_Pilot_20261007`.
The pilot script's sheetPassword/requestJson parameters loaded. An earlier raw
display-name paste caused parse-reference error; corrected by selecting the
actual script option. `requestJson` is `outputs('Compose')`.

Secure Inputs and Outputs were visibly On in settings. Entered exponential
retry Count 6, Interval/Minimum PT10S and Maximum PT1M, then Done. Verify these
in persisted code after the owner saves. sheetPassword remains awaiting direct
owner entry. Do not inspect/print/copy the secret; no password is in this file.
Owner must enter it in this action, Save, and keep the pilot Off without running.
Queue success/retry/dead-letter/lease-recovery handlers and enqueue/reconciliation
flows remain unfinished. No Excel call or email was executed in this continuation.

### Owner-entered script configuration and completion guard — 2026-10-09

Owner reported password entry and Save complete. Run_script settings were
verified in the UI: Secure Inputs/Outputs On, exponential retry count 6,
PT10S interval/minimum and PT1M maximum. Password is not recorded here.
Accessibility output exposed the password field during reconnection; owner
was notified to rotate it before production. Avoid expanded script-card reads
and never inspect its definition or echo its inputs.

Compose now gates the pilot payload on item 163, its expected stable row key
and quote MSOL2614, and source Revision >= queue TargetRevision. Invalid
identity emits an empty object, which script validation rejects before writes.

Added Send_an_HTTP_request_to_SharePoint_2: fresh verbose queue GET, with
Run_script run-after Succeeded/Failed/Skipped/TimedOut. A valid saved checkpoint
returned the ready-to-test banner after removing an empty condition that the
designer had failed to initialize. Recreated Condition_2 and verified actual
formula tokens on both operands: State Running AND LeaseToken equals current
workflow run name, compared to Boolean true. Save completed with the
ready-to-test banner. Its branches are still empty.

Offline recovery policy tests rerun: 27 passed. No live run, Excel write,
email, production enablement, or app publication occurred. Success/retry/
dead-letter ETag finalization, terminal-run lease recovery, enqueue and
reconciliation remain unfinished.

### Saved success/retry finalization — 2026-10-09

Added Compose_2 inside Condition_2's owned-lease branch. It returns success
only when Run_script succeeded and its JSON result reports `synced` with
matching opportunity ID, current source revision, and quote number.

Added Send_an_HTTP_request_to_SharePoint_3 after Compose_2. Verified all four
run-after outcomes selected: Succeeded, Failed, Skipped, TimedOut. The action
uses the queue-item URI, POST, X-HTTP-Method MERGE, and IF-MATCH from the fresh
HTTP_2 verbose ETag; retry policy None was verified in Peek code. Method
initially reverted to GET when typed into the combo; corrected using the
actual POST menu choice and saved, then verified the UI displays POST.

Body is one `string(setProperty(...))` expression, not hand-built JSON. On
confirmed success: State Succeeded, CompletedRevision current source revision,
NextAttemptAt/LeaseToken/LeaseExpiresAt/LastError null. Otherwise: State Retry
until attempt 8, then DeadLetter; preserve existing CompletedRevision; schedule
UTC backoff 1/2/4/8/16/32/60 minutes unless exhausted; clear lease; log only
`ReportingSyncUnconfirmed; run=<run ID>`. Classification errors themselves
take the retry path. No raw connector error or secret is copied to LastError.

During editing, a clear via setValue left old formula tokens; corrected with
select-all/delete and verified the body shows one formula token. Successful
save returned the ready-to-test banner. Final Flow checker: Errors 0, Warnings 0.
Offline recovery policy: 27 passed.

Opening Test confirmed the pilot is disabled and cannot be tested until
enabled; no test ran and no queue item, Excel row, or email was changed.
Live pilot acceptance still pending. Production remains off; app unpublished.
Terminal-run lease recovery and queue enqueue/reconciliation remain open.

### First live pilot smoke test — 2026-10-09

With explicit owner approval, temporarily enabled only the no-email queue
pilot, started one manual run, and immediately disabled the pilot again.
Verified Status Off afterward. Run
`08584101011190410488295454076CU18` succeeded in 418 ms. Recurrence and Get_items
succeeded; Apply_to_each completed without processing a work item (inner
actions unexecuted). This is an empty-queue smoke check, NOT Excel write,
ETag claim/finalization, retry or workbook-contract acceptance.

Opening the synthetic source item was interrupted by a reported native paste
conflict and subsequent user-change input guard. Active Arc page returned to
the pilot details, so no test job was created and no additional run started.
Resume with uncontested Arc input, inspect synthetic opportunity 163's latest
Revision, enqueue its unique ID-revision key, then test only that item against
the COPY. Production flow/app remained unchanged.

### Live queue failure and recovery acceptance — 2026-10-09

Inspected synthetic source item 163: Revision 1, QuoteNo MSOL2614,
ExcelRowKey `APP-performance-test-20261007-create-recovery-001`. The previous
pilot guard incorrectly omitted `APP-`; used that mismatch as a deliberate
fail-closed test before correcting it.

Created exactly one queue item, Title `163-1`, OpportunityId 163,
TargetRevision 1, AttemptCount 0, State Pending. Temporarily enabled only
the pilot for each manual test and turned it off immediately after starting.

Failure test run `08584101002347461632038229481CU09`: protected script Failed,
owner-lease guard True, classification and ETag finalization Succeeded.
Final payload State Retry, CompletedRevision null, NextAttemptAt
2026-10-09T00:45:22.8331867Z, cleared lease, generic run-ID-only LastError.
No business payload passed the mismatched guard. Overall run Succeeded
because the failure was handled, not because Excel synchronized.

Corrected Compose's guard to the inspected APP-prefixed key, preserving the
item/quote/revision gates. Verified its formula token and successful Save.
Retry run `08584101000520615040500384009CU01`: protected script Succeeded
(9 seconds), classification and ETag finalization Succeeded. Final payload
State Succeeded, CompletedRevision 1, NextAttemptAt/LeaseToken/
LeaseExpiresAt/LastError null. Independently reopened SharePoint queue:
exactly one item, AttemptCount 2, CompletedRevision 1, State Succeeded,
empty next-attempt and lease fields. No new opportunity was created and
no email action exists in this pilot. Pilot Off verified after each start.

Completed-job replay run `08584100998887460162225779635CU19` succeeded in
310 ms. Apply_to_each took 0 seconds without an executed queue iteration;
its fresh-read/condition actions showed `--. Not specified`, not executed.
Completed jobs are excluded from the worker's eligibility query. Pilot Off
was verified after this run started. This verifies a completed-job replay
does not invoke Excel again; it is not the concurrent duplicate-trigger test.

Post-write workbook-contract comparison still pending. These tests do not
establish production performance or full 152-record reconciliation.
Production stays off; app unpublished.
