# Deployment state

## Production worker identity guard saved — 10 October 2026

Continuation: reloaded the worker and confirmed the new Compose token persisted.
Also discovered and replaced a second synthetic-163 restriction in the fresh
queue claim Condition. It now checks positive source ID/target revision, excludes
the same fixture IDs, verifies the job key, attempts below eight, Pending/Retry
state and UTC due time. Expanded Get items to all eligible due jobs excluding
fixture IDs, preserved its utcNow expression token and ID ascending order.
Renamed this existing flow SyncSalesReportingWorker. Raised Top Count to 20 for
bounded backlog throughput; independently verified Apply to each concurrency Off
(sequential by default). Recurrence remains every one minute with concurrency On,
degree one; removed the artificial 2040 start-time delay. These edits saved with
ready banner and checker Errors 0 / Warnings 0. No enable/run action was taken.
Independent flow details confirmed SyncSalesReportingWorker, Off, Modified
10 October 2026 22:25 Cairo after the final save.
Added offline claim/filter builders and 11 passing claim cases; existing 15
source/job cases still pass, trigger eligibility tests pass, reconciliation policy
28 checks pass. Live queue throughput and failure acceptance remain pending.

Replaced the synthetic-only Compose predicate in existing worker
`5998de92-8e3a-47a2-b434-a71a9f4f1829` with productionWorkerGuard. Selective
accessibility selection changed the editor visually but did not update its model;
the successful method was native keyboard Select All and native paste of the
complete expression, retaining the 18 existing field mappings and seven payload
properties. Code view then showed the new real-record predicate. Saved with ready
banner, Flow checker Errors 0 / Warnings 0. Independent details confirmed Off,
Modified 10 October 2026 22:19 Cairo. Offline guard tests: 15 passing scenarios.

No worker execution, Excel write, notification, new copy or Power App publication
occurred. Other reporting flows remain disabled. This supersedes the failed
guard-edit checkpoint below, not the remaining rollout/acceptance requirements.

## Enqueue generalized in place; worker conversion not saved — 10 October 2026

User replied go after the site-owner blocker. Proceeding with Cairo site-setting
deferred and UTC queue/lease timestamps; no permission change or workaround.
Existing password retained per user instruction. COPY remains intended live
report; original unchanged; Power App unpublished.

Edited existing enqueue flow `82499d0a-4068-4be6-9eee-5d1074701e45` in place,
renamed EnqueueSalesReporting, and replaced its synthetic-163 trigger restriction
with productionQueueCondition from production-reporting-trigger.mjs. Requires
nonempty stable key/request and positive Revision, excludes known fixture IDs
154/155/156/157/158/159/160/163, performance-test request/key prefixes and TEST ONLY
project/title labels. Existing queue create/read-back idempotency implementation
unchanged; no Excel/mail action. Save success banner confirmed; checker Errors 0
and Warnings 0. Details independently confirmed Off, Modified 21:58 Cairo.
No queue creation or runtime replay was executed for the generalized scope.

Added production-worker-guard.mjs and 15 passing offline source/job guard cases.
It requires source ID equal queue OpportunityId, latest Revision >= target,
correct job key, real-record scope and nonempty QuoteNo. Attempted selective
Compose guard replacement in the existing disabled worker, preserving field
mapping. Native selection and editor text showed an attempted edit, but Apply
followed by Compose Code view still showed the original synthetic guard. Did NOT
broaden Get items, rename, save or run the worker. Exited the designer; details
independently confirmed worker Off and unchanged Modified 18:33 Cairo. Do not
claim the production worker guard is deployed. Run script Parameters/definition
were not opened or exported during this continuation.

Enqueue MUST stay Off until worker and notification/reconciliation handling are
ready. Current direct production SyncSalesReporting also remains Off at its last
verified checkpoint, to avoid two workbook writers. No workbook/business-data
write, email, app publish or new copy was performed. Reconciliation reference
policy now shares production exclusions; runtime sweep remains undeployed.

## All-steps continuation: site-owner regional-settings blocker — 10 October 2026

User authorized proceeding with all remaining steps, retaining COPY as the live
report and keeping Power App unpublished. User explicitly declined password
rotation after exposure notification; retain the existing password. Rotation is
a recommendation, not a current cutover blocker. Do not repeatedly request it,
change it, or record its value. This supersedes earlier mandatory-rotation notes.

Read-only current production SyncSalesReporting details verified Off, modified
10 October 21:43 Cairo, no run history. Navigated normally in Arc to SharePoint
InsideSalesTeam `/_layouts/15/regionalsetng.aspx` for the requested Cairo setting.
SharePoint redirected to AccessDenied.aspx, Type=web. Current account cannot
perform that site-setting step. No regional-setting change, access request,
permission grant, alternate-account sign-in, or bypass was attempted. Site owner
must set Cairo; do not claim configuration complete. Queue/flow lease timestamps
continue to use UTC independent of the site's display timezone.

Stopped at this new-authority blocker. No reporting enable, Excel/source write,
email, new workbook copy, flow mutation, or app publication occurred in this
continuation. General production recovery/reconciliation, final data/workbook/
notification acceptance and real-session performance checks remain unfinished.

## Production reporting retargeted to COPY and saved — 10 October 2026

Owner replied done after the private binding handoff. Reconnection unexpectedly
found Run script Parameters still open and File still pointing to the ORIGINAL.
The password field was exposed by the accessibility state; owner was notified
without repeating its value. Do not store the credential in documentation,
exports, source, or chat. Private password rotation remains required before live
activation; agent must not enter/change the credential.

Used the existing Excel file picker to select
`/Final_Sales_Master_Rev12_11 (Uploaded)(xlsx) - Copy.xlsx`; actual File field
confirmed that path and Script remained SyncSalesTrackerReporting_Pilot_20261007.
Closed Parameters by moving to Settings. Secure Inputs/Outputs On; exponential
retry Count 6, Interval/Minimum PT10S, Maximum PT1M. An accidental action-picker
open was closed without selecting/adding an action. Saved the existing
production flow `0c4fc75e-f756-4110-85b1-e6be8c8bd81c`; ready-to-test banner
confirmed save. Checker Errors 0 / Warnings 0. Details independently confirmed
Modified 10 October 21:43 Cairo, Off, no run history. No workbook/SharePoint
business write, email, pilot enable or app publish occurred. This verifies the
selected file path, not a live write or connector file-ID comparison.

Offline production-trigger eligibility and migration-email predicates rerun:
152 prepared rows eligible for Excel, all 152 suppressed for notifications,
11 trigger scenarios and 12 notification scenarios passed. These tests do not
replace runtime acceptance. General durable reporting recovery/reconciliation
is not production-ready; original workbook remains unchanged. Current blockers:
private COPY protection-password rotation/update, production recovery readiness,
and final live-target contract/data/notification acceptance.

## Live destination changed to the tested COPY — 10 October 2026

User explicitly superseded the original-workbook selection: use the COPY because
its settings have already been prepared. Live destination is now
`Final_Sales_Master_Rev12_11 (Uploaded)(xlsx) - Copy.xlsx`, document ID
`2eb994dd-a0cb-4cc5-a3b4-ede017bf0977`. Leave original
`7b4457ad-a15f-4600-a2be-b7a3f95e0061` unchanged. No original width repair or
new original-specific baseline is authorized/needed for this route. Retain the
original comparison evidence and approved baseline. App remains unpublished.

This destination choice does not make the synthetic-only COPY worker production
ready. Existing production SyncSalesReporting previously retained the original
file binding; retarget that existing flow, do not simply enable a pilot. Its
Run script Parameters expose the password: owner must privately choose the COPY,
complete any required password rotation/entry, Save, and close Parameters before
agent inspection resumes. Do not inspect/export the password-bearing definition.
Production reporting remains Off pending verified binding and remaining safety
checks. No file binding, workbook write, source edit, email, or activation is
claimed by this documentation checkpoint.

## Original report verified; layout decision blocks cutover — 10 October 2026

User supplied the original online workbook link. Opened original named
Final_Sales_Master_Rev12_11 (Uploaded)(xlsx).xlsx in Arc; document/WOPI identity
`7b4457ad-a15f-4600-a2be-b7a3f95e0061` matches that link, distinct from COPY.
Master Sheet visibly protected. Ran existing read-only CompareWorkbookContract
with the unchanged approved baseline (10,099 characters; FNV-1a 1,754,044,479,
verified before parameter entry). Actual completed output: status blocked,
differenceCount 15. Expanded output and scroll verified all differences are
column widths; details are in original-workbook-cutover.md. No other captured
contract differences were reported. Do not equate script-success banner with
contract pass. No original business/formula/layout/protection changes, new copy,
reporting activation, email, source mutation, or Power App publish occurred.

Need explicit user choice: preserve the current original layout as a separately
approved original-specific contract, retaining the prior baseline and difference
evidence, or restore the 15 earlier widths. Do not silently normalize either.
Existing production flow remains Off at its independently verified checkpoint.

## Original workbook selected; production trigger hardened — 10 October 2026

User confirmed the ORIGINAL management workbook is the live-report destination,
not the tested COPY. Power App must remain unpublished; no further test copies
requested. Exact original online workbook identity/link and its current contract
still need verification before any reporting activation or write. Do not assume
the COPY document GUID identifies the original.

Inspected existing production SyncSalesReporting
`0c4fc75e-f756-4110-85b1-e6be8c8bd81c`. Source is SalesOpportunities on
InsideSalesTeam; saved trigger concurrency is 1. Added a trigger condition
requiring nonempty ClientRequestId/ExcelRowKey and excluding performance-test-
request IDs, ProjectName starting TEST ONLY, and Title containing TEST ONLY
(case-insensitive). Migration records remain eligible for Excel; existing
migration-email suppression is separate. Reference condition and offline model
are in production-reporting-trigger.mjs. All 152 prepared migration rows and
11 eligibility scenarios passed offline; this is not a live trigger test.

Save visibly succeeded with "Your flow is ready to go" and checker Errors 0 /
Warnings 0. Details independently verified Modified 10 October 21:24 Cairo,
Status Off and no run history. No Run script card, password-bearing definition,
or credential was opened. No workbook write, notification, source mutation,
pilot activation, or app publication occurred. Production retry/reconciliation
limitations remain; this checkpoint is configuration preparation, not cutover.

## Direct live cutover requested — 10 October 2026

User requested proceeding with the current version directly, without further
test copies, while explicitly keeping the Power App unpublished. This changes
the rollout approach; it does not establish acceptance of incomplete integration
or authorize publishing. Retain existing backups for rollback. Do not create the
planned synthetic revision-4 interruption fixture or run its Excel recovery test
against the live report during this transition.

The authoritative live workbook must be confirmed: the currently tested reporting
COPY or the original management workbook. Until that decision, do not retarget
Excel writes, enable production reporting, or synchronize synthetic records into
either workbook. Existing pilot workers are synthetic-only, not production-wide
workers; enabling a pilot is not a production cutover. General reporting,
notification/migration suppression, reconciliation, and production safety checks
remain required. No Dataverse connector; Power App remains unpublished.

This entry records the requested rollout change only. No live flow, workbook,
SharePoint business record, notification, or app publication was changed here.

## SharePoint-only manual recovery pilot deployed; rejection passed — 10 October 2026

Built a separate legacy import package from the audited enqueue export; ONLY
existing SharePoint connection reused. First package rejected before deployment
because nested Reject names were duplicated. Corrected globally unique keys in
v2 and added an audit. Accepted package
`RecoverSalesReporting_Manual_Pilot_NoEmail_20261010_v2.zip`, SHA-256
`2be7f3aea8b19fafa0c313c11088c226b089fb4ad8bc3309c00addbfa792e699`.
21 package audits and 51 manual-policy checks passed offline; existing recovery
39 checks passed. Do not import the rejected unversioned package.

Importer confirmed all resources successfully imported as NEW flow
`RecoverSalesReporting_Manual_Pilot_NoEmail_20261010`, live ID
`fb626660-ba00-47bd-ae8a-fdf01dafadb3` (different from package GUID).
Manual trigger only; parsed strict review input; queue identity fixed to 163-4,
source fixed to synthetic 163/Revision 4/stable row key/request/quote. It contains
no Excel, email, Dataverse, source mutation or queue create. The only write is
a fresh-snapshot exact-ETag conditional MERGE to Retry, with action retries None,
preserving attempts/completion/business identity. This relies on operator
attestation, not automated proof of run or workbook execution settlement.

Designer checker showed Errors 0 / Warnings 0. Details verified SharePoint only,
owner Ahmed Adel, no run-only sharing and no associated app. Imported Off.
Initial test blocked because Off. Temporarily enabled ONLY this instant pilot
and submitted a synthetic Running-status request with all four safety approvals
false (explicitly marked not an approval). Run
`08584099585412675192028297477CU03` at 19:05 Cairo failed as intended in 315 ms.
Live history: manual trigger and Parse review Succeeded; Read queue and Confirm
job Skipped; Reject ReviewRejected Succeeded. No SharePoint action executed.
Switched pilot Off and verified saved Status Off before inspecting this run.
Production/COPY/reconcile/enqueue were independently Disabled in My flows before
import and were not enabled. No source/Excel/email/app publication changes.

This accepts deployment and the rejection path only. Positive conditional retry,
ETag conflict and interrupted-worker/COPY upsert tests require a new isolated
163-4 fixture; do not reset completed 163-1/2/3. General production recovery is
not enabled and not accepted. The management workbook remains unchanged.
Post-test independent SharePoint All Items read confirmed exactly the unchanged
three receipts: 163-1/2/3 Succeeded, attempts 2/1/1, completed revisions 1/2/3.
No 163-4 fixture was created in this deployment/rejection turn.

## Non-Dataverse recovery checks implemented — 10 October 2026

Exited the incomplete Dataverse designer using Back, without Save or Sign in.
Fresh solution view showed exactly four flows, five connection references and
one environment variable (10 objects), with production SyncSalesReporting and
COPY worker Off. No Dataverse flow or connection was added.

Implemented offline operator-reviewed `manual-reporting-recovery.mjs`, its
51-check test suite and `manual-reporting-recovery.md`. The plan fails closed
on active/unknown or mismatched run evidence, uncertain workbook execution,
unquiesced writers, stale review, unexpired lease, attempt exhaustion, missing
exact ETag and changed queue snapshot. It does not make any external writes;
SharePoint conditional recovery deployment/interruption acceptance remains next.
Existing recovery 39 and reconciliation 26 tests also passed; total 116 offline
checks, not live-flow acceptance. Read live queue All Items: exactly 163-1/2/3
Succeeded, attempts 2/1/1, completed revisions 1/2/3, no Running job displayed.
No queue reset, source edit, Excel write, email, production enable or app publish.
The site still displays Pacific time; Cairo regional-settings gate remains open.

## Cost constraint — Dataverse connector rejected by user, 10 October 2026

User instructed not to use Dataverse if it is not free. Microsoft licensing
guidance identifies premium connectors as requiring premium entitlement; the
selected Dataverse List rows action is also visibly PREMIUM. Do not sign in,
save/deploy/run this Dataverse probe, start a trial, or buy a license. The probe
remains incomplete and unsaved at the last UI checkpoint. Continue with the
SharePoint-based architecture and standard connectors within existing licensed
entitlements; no zero-cost entitlement has been established for this account.
Automatic interrupted-job reclaim remains disabled until a safe non-premium
proof mechanism is verified. Pending that, require administrator confirmation
of the exact previous worker run's terminal state before manual recovery;
lease expiry alone must never authorize another Excel write.

## Read-only run-proof probe awaiting connection approval — 10 October 2026

Opened New > Automation > Cloud flow > Instant in the existing solution and
prepared unsaved `SalesReporting_RunProof_ReadOnly_Pilot_20261010` with a manual
trigger. Selected Microsoft Dataverse List rows; the UI marks it PREMIUM and
shows OAuth Sign in rather than an existing usable connection. Stopped before
Sign in: new Dataverse connection access requires user approval and license
availability remains unverified. No connection, security role, trial or purchase
was created. No probe save/run, queue mutation, Excel write or email occurred.
The solution list independently showed production SyncSalesReporting and the
COPY worker both Off before opening the probe. The incomplete designer is not
evidence of deployed recovery or a successful Flow Runs connector query.

## Solution-aware recovery prerequisite verified — 10 October 2026

Read-only Automation Center initially showed 52 runs for three existing solution
flows. Registered ONLY disabled COPY worker
`5998de92-8e3a-47a2-b434-a71a9f4f1829` using Add existing cloud flow > Outside
Dataverse in Sales Production Optimization. Solution now has four flows and
five connection references; migration added SharePoint
`new_sharedsharepointonline_3d1f6` and Content Conversion
`new_sharedconversionservice_a2a39` using existing connections. Independently
verified worker Off and solution membership on its details page. No permission,
credential, sharing, source, workbook, email or app publication changes.

Queue pre-check showed all three jobs Succeeded. Temporarily enabled worker for
empty-queue manual run `08584099605707719437455427481CU16` at 18:31:54 Cairo,
then switched Off and verified saved Off. New run succeeded; queue claim and
condition were visibly Skipped, so no nested Excel action executed. Automation
Center Run history independently displayed exact worker/run link, Succeeded,
duration 440 ms. This establishes new-run monitoring ingestion after registration,
not connector payload fields or automatic recovery. No older history backfill
is assumed. Do not enable automatic Running-job reclaim from this UI proof alone.

Added fail-closed offline `flow-run-proof.mjs` and 26 passing tests; existing
recovery policy still passes 39. Live Dataverse read-only exact-run probe,
connector raw status/endtime mapping, licensing/access, fresh-queue ETag reclaim,
active/unknown/missing history rejection and interruption tests remain pending.
Production reporting stays Off; app unpublished. This supersedes the earlier
"worker Outside Dataverse" checkpoint without changing its recovery behavior.

## Reconciled revision-3 COPY synchronization passed — 10 October 2026

Pre-run queue independently confirmed `163-3` Pending/AttemptCount 0 and earlier
completed jobs unchanged. Temporarily enabled only guarded no-email COPY worker
`5998de92-8e3a-47a2-b434-a71a9f4f1829`; manual run
`08584099614029557506603419291CU12` at 18:18 Cairo succeeded in 14 seconds.
Worker switched Off immediately after launch; saved Off verified. Final queue
read showed exactly `163-1` Succeeded/AttemptCount 2/CompletedRevision 1,
`163-2` Succeeded/AttemptCount 1/CompletedRevision 2 and `163-3` Succeeded/
AttemptCount 1/CompletedRevision 3, with blank lease/retry/error fields.

Opened exact reporting COPY sourcedoc `2eb994dd-a0cb-4cc5-a3b4-ede017bf0977`
in the browser. Existing read-only CompareWorkbookContract ran from its editor
using the unchanged approved baseline (10,099 characters, FNV-1a 1,754,044,479).
Actual Output JSON: `{"status":"pass","differenceCount":0,"differences":[]}`.
No comparator, baseline, workbook cells, widths or protection settings were
edited manually. No email, production sync enable or app publication occurred.
Captured structural/protection gate passed, not full visual/report refresh,
business reconciliation or six-user production acceptance. Manual Refresh Required
was visible and Refresh All was not invoked. Reconciler/enqueue remain Off at
their prior verified checkpoints. General reconciliation and interrupted-worker
recovery remain undeployed.

## Synthetic missing-event reconciliation — 10 October 2026

Verified enqueue, COPY worker and production sync Disabled in the live flow list.
Changed only opportunity 163 Revision from 2 to 3 in SharePoint's inline editor;
quote/stable identities and business values were not edited. This deliberately
simulates a missed event, not an app/UpdateOpportunity test. Pre-run queue read
showed only completed `163-1` and `163-2`, no `163-3`.
Temporarily enabled the guarded queue-only reconciler. Run
`08584100041781888027680261266CU00` at 06:25 Cairo succeeded in 681 ms:
source/guard/read succeeded, Create item and read-back verification succeeded.
Resubmission `08584100041450753355687018443CU25` succeeded in 409 ms:
create/read-back actions skipped, existing-job verification succeeded and
rejection skipped. Switched the reconciler Off and verified saved Status Off.
Independent final queue read showed exactly three jobs: `163-1` Succeeded/
AttemptCount 2/CompletedRevision 1 and `163-2` Succeeded/AttemptCount 1/
CompletedRevision 2 unchanged; `163-3` Pending/AttemptCount 0 with blank
completion, lease, retry and error fields. Leave this new job pending for the
next guarded COPY-worker test; do not reset or delete earlier receipts.
No Excel/email actions or worker execution; app still unpublished. General
paginated reconciliation and interrupted-Running-job recovery remain undeployed.

## Reconciliation pilot — completed-job replay passed, 10 October 2026

Temporarily enabled only the new synthetic reconciler and ran it manually.
Run `08584100048317492025223131698CU08`, at 06:14 Cairo, succeeded in 906 ms.
Live action history verified source GET and identity guard succeeded, existing
job read succeeded, Create item/Get items/new-job Condition skipped, existing
job verification succeeded, and rejection skipped. This proves the no-write
completed-receipt branch, not missing-job creation or general reconciliation.
Switched the reconciler Off and independently verified saved Status Off.
Post-test SharePoint queue contained exactly the unchanged completed jobs:
`163-1` AttemptCount 2/CompletedRevision 1 and `163-2` AttemptCount 1/
CompletedRevision 2; both Succeeded, with blank lease/retry/error fields.
No Excel/email actions were executed; worker and production sync remained Off.
The app remains unpublished. Missing-event creation/replay, paginated production
sweeps and exact-run interrupted-worker recovery remain pending.

### Import evidence

Created a separate synthetic-only flow by importing a package as Create as new
with an existing ahmed.adel SharePoint connection. Portal confirmed all resources
successfully imported and created flow ID
`6584b40f-bfcd-4b31-b929-667e2cc96dc4`, display name
`ReconcileSalesReporting_Pilot_NoEmail_20261010`. The existing enqueue/worker and
production definitions were not edited. Future recurrence start is
2040-10-10T00:00:00Z, concurrency 1. Pilot GET reads only opportunity ID 163,
guards exact stable key and positive Revision, then checks latest queue Title.
Existing valid receipts are verified but never reset; only a successful empty
read permits creation, followed by read-back on create success/failure/timeout.
There are no Excel/email actions. Imported designer checker showed 0 errors and
0 warnings; details independently showed saved Status Off and no run history.
The subsequent completed-receipt replay is recorded above.

Accepted package: ReconcileSalesReporting_Pilot_NoEmail_20261010_v3.zip,
SHA-256 33846f3a30c844559359d0ebe3a397e064ac503bdcf71fd32d9807c5bca1c93d.
14 offline package audits pass. v1/v2 were rejected before flow creation with
MalformedFlowAssetFlowDefinition: builder renamed an action key using a blanket
replacement which also changed its Terminate type. Corrected key-only rename,
added type-regression audit, and v3 imported successfully. Retain earlier ZIPs
as failed-build evidence, never use them for deployment. Local policy tests alone
are not live acceptance. This pilot is not a general paginated reconciler or an
interrupted-Running-job recovery flow.

## Authorized pause completed — 10 October 2026

After the user's approval, switched both test pilots Off and verified saved
Status Off independently on each details page: worker
`5998de92-8e3a-47a2-b434-a71a9f4f1829` and enqueue
`82499d0a-4068-4be6-9eee-5d1074701e45`. Both turn-off operations completed after
asynchronous UI processing. No definition, workbook, queue, email, connection,
permissions or app publication was changed. This supersedes the On discrepancy
below, without changing the definitions that were modified since the prior test.

Added offline missed-event reconciliation policy, 26 passing tests and a detailed
enqueue-only flow contract in `reporting-reconciliation.md`. Existing recovery
policy still passes 39 tests. These are staged implementation references, not
deployed production recovery/reconciliation flows. The synthetic pilot is now
deployed with completed-job replay verified above; next verify missing-event
creation/replay and establish a
solution-aware exact-run proof source before any automatic Running-job reclaim.

## Live-state discrepancy — 10 October 2026 follow-up

Read-only follow-up found both pilots On, superseding their earlier Off
checkpoint: enqueue modified 05:37 Cairo and worker modified 05:38 Cairo.
Worker has a newer successful run at 05:42:51,
`08584100067143274294810253452CU28` (323 ms in history). No action payloads or
password-bearing script cards were opened. This run's overall success is not
new Excel-commit evidence. No flow status, definition, queue or workbook was
changed during this follow-up. Await user direction before pausing or editing
the active pilots; do not overwrite changes made since the checkpoint.

Production SyncSalesReporting was independently visible Off in the Sales
Production Optimization solution. That solution lists CreateOpportunity,
UpdateOpportunity and SyncSalesReporting only (3 flows). The worker and enqueue
pilots were listed under Add existing > Automation > Cloud flow > Outside
Dataverse; the dialog was cancelled without adding anything. The worker thus
cannot yet be assumed to have Dataverse FlowRun metadata. Automatic recovery
remains undeployed. Microsoft's documented FlowRun source requires solution
flows; ingestion/read access/retention and exact-run terminal proof still need
verification. Missing run metadata must fail closed.

## Latest checkpoint — 10 October 2026: revision-2 COPY sync passed

Temporarily enabled only the guarded no-email COPY worker and resubmitted its
recurrence run. Run `08584100078210717914290151572CU03` at 05:24:24 Cairo
succeeded in 15 seconds. Worker switched Off and saved Status Off verified.
Independent queue read: exactly `163-1` Succeeded/AttemptCount 2/CompletedRevision
1 (unchanged) and `163-2` Succeeded/AttemptCount 1/CompletedRevision 2; lease,
retry-time and error fields blank. Production sync remains Off; no email or
app publication. Existing read-only CompareWorkbookContract returned actual
Output JSON `{"status":"pass","differenceCount":0,"differences":[]}` against
the unchanged approved baseline (10,099 characters, FNV-1a 1,754,044,479).
Captured structure/protection passed; full visual/report refresh and business
reconciliation remain open. Interrupted-run recovery and missed-event
reconciliation are still not deployed. The app remains unpublished.
Earlier Pending records below are historical enqueue-phase checkpoints.

## Latest checkpoint — 10 October 2026: new-revision enqueue and replay passed

Changed only synthetic opportunity 163 Revision from 1 to 2 directly in
SharePoint, then its test-only Title after an observed skipped poll. This is
enqueue-only coverage, not an app/UpdateOpportunity acceptance test. Preserved
QuoteNo `MSOL2614`, stable key and business values. Only the restricted no-email
enqueue pilot was temporarily enabled; worker and production reporting were
verified Off and never enabled.

Run `08584100082109973678351807747CU29` at 05:17 Cairo succeeded in 411 ms:
Create item succeeded and verification was True. Exact-payload resubmission
`08584100080660400535660510657CU03` at 05:20 Cairo succeeded in 617 ms:
duplicate Title creation rejected (HTTP 400), read/verification succeeded True.
Switched the enqueue pilot Off and verified Status Off. Final live queue read
showed exactly `163-1` Succeeded/AttemptCount 2/CompletedRevision 1, unchanged,
and `163-2` Pending/AttemptCount 0 with blank completion/lease/error fields.

No Excel write, email, real-opportunity change, migration or app publication
occurred. Leave synthetic item 163 at Revision 2 and its new Pending queue job
for the next controlled reporting-COPY worker test. Full evidence and remaining
acceptance: `reporting-acceptance-2026-10-10.md`. Automatic interrupted-run
recovery and missed-event reconciliation are still not deployed.

## Latest checkpoint — 9 October 2026: reporting enqueue duplicate replay passed

Created `EnqueueSalesReporting_Pilot_NoEmail_20261009`, flow ID
`82499d0a-4068-4be6-9eee-5d1074701e45`. Checker showed 0 errors / 0 warnings.
The pilot creates a unique per-revision queue job, then verifies exactly one
matching job even after creation failure/timeout. It never resets an existing
completed job and contains no Excel/email actions. Trigger is restricted to
synthetic opportunity 163 and its exact stable ExcelRowKey. Saved state was
verified Off. Follow-up inspected the full exported definition and confirmed the
exact synthetic-only restriction (Peek code omits it). Skipped polling checks
were visible in All runs > Checks (no new data), not normal run history.
A fresh post-poll synthetic label change produced successful run
`08584100527814732389539525721CU06`, followed by successful identical-payload
resubmission `08584100525350168451995794408CU03`. Both rejected duplicate
queue Title creation, read the existing job, and evaluated verification True.
Final queue read confirmed exactly one unchanged `163-1` job: Succeeded,
AttemptCount 2, CompletedRevision 1. Pilot switched back Off and Status Off
verified. No Excel/email actions were performed; the app remains unpublished.

See `reporting-enqueue-pilot-2026-10-09.md` for actual acceptance evidence and
final activation state. Offline reporting policy tests now pass 39 checks.
The exported pilot additionally passes 14 saved-configuration audit checks.
These do not substitute for live-flow acceptance. Production reporting remains
Off; the app remains unpublished. Automatic interrupted-run recovery and missed
event reconciliation are not yet deployed. New-job creation, new-revision
delivery and queue-failure handling still require live tests; the successful
completed-job replay does not establish full production acceptance.

## Latest checkpoint — 9 October 2026: reporting COPY contract passed

The browser CompareWorkbookContract initially found 15 column-width differences.
Created and verified the Saved online backup
`SalesReporting_COPY_PreWidthRepair_20261009.xlsx`, then staged the narrowly scoped
`RestoreApprovedReportingWidths_20261009` script on the reporting COPY. The owner
privately executed it; observed result confirmed 15 widths restored and sheet
protection enabled/not paused. Re-ran the existing browser comparator with the
unchanged approved baseline and observed
`{"status":"pass","differenceCount":0,"differences":[]}`.

Details and limitations: `workbook-contract-live-2026-10-09.md`. This is the
captured structural contract only, not full visual acceptance or release
approval. Production reporting synchronization remains intentionally OFF and
the development app remains unpublished. Interrupted-job recovery,
enqueue/reconciliation, business-value reconciliation, notification safeguards,
management visual sign-off, security and six-session performance acceptance
remain outstanding. Older sections below are historical checkpoints and must
not be interpreted as current sequence values or current draft-app behavior.

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
