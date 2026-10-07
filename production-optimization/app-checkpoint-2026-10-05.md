# Development app checkpoint — 5 October 2026

App: `Sales_Screen1`, ID `f89224af-018d-4038-a322-d6d5eb8436ac`.
The last observed Studio state was saved and unpublished. Do not publish before
acceptance. Reporting synchronization remains disabled pending completion.

## Verified in Studio

- Startup loads only the two small SharePoint reference lists concurrently.
- Startup shapes customers with `CutomerName = Title` and options with the
  existing control field names (`BU`, `SubBU`, `BookPeriod`, `Prob`,
  `Scope Of Supply`, `Lead Type`, `Specs or Model`). The added column names are
  Power Fx identifiers, not double-quoted strings.
- BU Items: `Filter(colSalesOptions, Category = "BU")`.
- Reconnected after the desktop interruption and verified Sub BU Items.
- Completed all reference bindings below, ran OnStart, and previewed the new
  form. Customer choices and all option dropdown values were present.
- App checker displayed `No errors found` after cleanup.
- Earlier preview verified delayed SharePoint search for `MSOL261`, result
  selection into the existing edit form, and the editable PO reference control.
- Create and update payloads use `txtPOReference.Text`.
- No create/update business-record submission was performed in these previews.

## Completed reference bindings

Set each control's Items property after confirming the startup cache has the
legacy field names. Preserve its current display-field/value property and
default selection until preview confirms compatibility.

| Control | Items |
| --- | --- |
| ComboBox1 | `colSalesCustomers` |
| ComboBox1_1 | `colSalesCustomers` |
| BU | `Filter(colSalesOptions, Category = "BU")` (verified) |
| Dropdown2 | `Filter(colSalesOptions, Category = "SubBU")` |
| Dropdown3 | `Filter(colSalesOptions, Category = "BookPeriod")` |
| Prob | `Filter(colSalesOptions, Category = "Prob")` |
| Sales Recommendation | `Filter(colSalesOptions, Category = "Scope Of Supply")` |
| Dropdown1 | `Filter(colSalesOptions, Category = "Lead Type")` |
| Dropdown6 | `Filter(colSalesOptions, Category = "Specs or Model")` |

- Customer default previously read `varCurrentRecord.'Customer Name'`, while
  the gallery maps `Customer_Name`. It now reads
  `Coalesce(varCurrentRecord.Customer_Name, varCurrentRecord.EndUser_Name)`.
- Copy toggle Default now uses
  `varIsNewMode || IsBlank(varCurrentSPRecord.CustomerName) || varCurrentSPRecord.CustomerName = varCurrentSPRecord.EndUserName`
  instead of always true, preserving separate saved customer values.
- Button4 RESET no longer calls `Refresh(SalesTracker)`; it resets the smart
  search and PO field and clears varRequestId instead.
- Removed all Excel data sources and Office365Outlook from the app. This does
  not remove or alter the workbook. The last Table2 generated SearchItems
  dependency was cleared by toggling ComboBox1.IsSearchable false then true.
- Connections now shown in Data are SalesCustomers, SalesOpportunities,
  SalesOptions, and the two local collections. App-facing flows remain attached.
- One unused-flow warning remains; performance warnings remain four and require
  audit. No formula errors remain. Saved unpublished after these changes.
- Still verify independent customer values through a real create/edit/reload
  and reporting synchronization; read-only preview is not acceptance testing.

## Release work still required

- `SyncSalesReporting` was saved with Flow Checker at zero errors and zero
  warnings. Its trigger concurrency is 1, the protected-workbook script has
  secure inputs/outputs, and the create-only email branch is configured for
  `ahmed.adel@entrag.com`. The flow was verified **Off** after saving; no test
  email was sent.
- Complete reporting-worker failure handling and verify that the notification
  recipient is supplied through the intended solution environment variable
  rather than remaining a direct action value.
- Test actual create/update, request retries, six parallel creates, and stale
  edits; these have not been established by read-only preview.
- Reconcile migrated business values and workbook contract after sync tests.
- Measure startup/search/save latency with Live Monitor.
- Obtain acceptance and management sign-off before publishing.

## Resolved connection failure

The native desktop tool returned `native pipe closed before response`, then
`native pipe startup failed` on retries and after resetting the tool session.
No alternate browser connection was available initially. After the user reopened
Studio, the native app connection recovered; Dropdown2.Items was verified.

## Reporting-flow checkpoint — 6 October 2026

- Fixed the Save failure caused by an expired SharePoint refresh token by
  selecting the newer existing connection for the same account on the trigger,
  Get items, both Create item actions, and Update item.
- Save completed with the designer confirmation “Your flow is ready to go”.
  Flow Checker showed 0 errors and 0 warnings before Save. The details page
  confirmed Status Off afterward; no runs or test emails were initiated.
- Added a top-1 lookup by the unique `OpportunityId-Revision` correlation key
  before Run script. An existing key currently terminates the run successfully.
- Added failure logging after the email condition for failed, timed-out, or
  skipped outcomes. Failure correlation IDs include the flow run name to avoid
  collisions with the success key. LastError contains sanitized guidance only.
- **Not production-ready:** the existing-key branch must distinguish completed
  work from Pending email and recover pending work. Durable automatic retry,
  migration-email suppression, environment-variable recipient configuration,
  and runtime failure/concurrency/workbook-contract tests remain outstanding.
- The fixed Excel reporting format was not changed during these flow edits.

### Completion guard saved later on 6 October

- Added `Existing reporting completed` within the existing-correlation branch.
  It accepts only ExcelStatus Succeeded plus EmailStatus Succeeded or
  NotApplicable. Only completed work reaches the existing successful Terminate.
- Added `Stop unresolved reporting` (Failed) with code
  `ReportingRecoveryRequired` for all other existing-record statuses. Its
  message instructs administration to inspect the original run and delivery,
  without asking app users to resubmit the business entry.
- Both predicate and failure fields were checked in the designer. Flow Checker
  displayed 0 errors and 0 warnings, and Save returned the success banner.
- This replaces the earlier unconditional existing-key success behavior.
  It does **not** implement automatic pending-email recovery. Ambiguous delivery
  remains a release blocker, along with the outstanding acceptance work above.

### Send-state and Excel retry hardening

- Verified pre-send Create item code now writes `Sending` for Revision 1,
  otherwise `NotApplicable`. The existing success update is unchanged.
- Changed email retries from Default to None to avoid blind resend after
  ambiguous failures. Failure EmailStatus is Succeeded, NotSent for Skipped,
  Unknown for other attempted outcomes, or NotApplicable for updates.
- LastError records sanitized run name and action statuses, not connector
  inputs, credentials, or raw error payloads.
- Run script uses explicit exponential transient-connector retry policy:
  count 6, interval PT10S, minimum PT10S, maximum PT1M. Secure inputs and outputs
  were verified On. Script-level business/protection errors are not necessarily
  covered by connector transient retries; durable recovery remains outstanding.
- Added `Fail reporting after logging`, Failed with code
  `ReportingSynchronizationFailed`, running after failure-log creation succeeds.
- Designer Flow Checker returned 0 errors and 0 warnings for these changes.
- Save success was verified; details show Modified 6 October 2026, 01:09 PM
  and Status Off. The details-page warning is only `This flow is off`.
  No flow runs, workbook writes, or test emails were initiated.

### Migration notification suppression saved at 01:23 PM

- Confirmed all 152 prepared migration records have a `MIGRATION:` request-ID
  prefix and none has a missing ClientRequestId.
- Email condition now requires Revision 1, a present ClientRequestId, and no
  case-insensitive `MIGRATION:` prefix. Condition code was verified comparing
  the predicate's `Send` result to the string `Send` (not numeric 1).
- The pre-send and failure-log EmailStatus use the identical guard. Migration
  and update records are NotApplicable; Excel synchronization remains outside
  the email condition.
- Save succeeded and details show Modified 6 October 2026, 01:23 PM and Off.
  Designer checker was 0 errors / 0 warnings. The details-page warning remains
  only that the flow is off. No live flow runs or emails were initiated.
- Offline `test-notification-guard.mjs` passed all 152 migration rows and ten
  scenario checks. This is not live Power Automate acceptance testing.

### Solution recipient configuration

- Created and verified `new_SalesNotificationRecipient` (Text) in Sales
  Production Optimization, solution ID `86684d6c-ddbb-f111-aaaf-70a8a581110f`.
  Current value is the approved recipient; default is empty and Export value No.
- Added existing SyncSalesReporting to that solution. It was verified Off in
  the object list; Excel and Outlook connection references were added by the
  platform. CreateOpportunity and UpdateOpportunity remain the existing flows.
- Recipient action binding is **not yet done**. Browser observation timed out
  opening the solution-aware flow, and inventory calls also timed out twice,
  including after reset. Saved components are confirmed, but no new flow edit
  or publication was performed in this configuration phase.

### Recipient binding completed — 6 October, 01:39 PM

- Recovered access using native Arc controls and opened the solution-aware
  editor for the same SyncSalesReporting flow.
- Replaced the direct To address with the UI-selected Sales Notification
  Recipient parameter. Code view verified
  `@parameters('Sales Notification Recipient (new_SalesNotificationRecipient)')`.
- Save success banner verified; designer checker 0 errors / 0 warnings.
  Details confirm Modified 01:39 PM, Status Off, and no run history.
- No emails, workbook writes, live tests, or app publication were initiated.
  Runtime resolution/delivery, durable reporting recovery, migration, and
  six-user acceptance remain outstanding.

### Live-create audit and repairs — 6 October

- Historical run `08584103730718001393837560635CU12` took about 20 seconds.
  Its reservation action returned HTTP 400 (invalid JSON) ten times and was
  incorrectly pointed at SalesOpportunities. Despite this, the downstream
  create succeeded, returning item 153, MSOL264. A successful run label alone
  is therefore not acceptance evidence.
- Repaired Reserve Sequence CAS to POST SalesSequence/items(1), with MERGE
  override and IF-MATCH from the sequence read's ETag; body updates NextNumber
  and Revision using numeric expressions. No wildcard ETag is used.
- Replaced interpolated business JSON with a whitelist-based setProperty object
  expression to safely serialize quotes/newlines. Empty CustomerName defaults
  to EndUserName.
- Added Quote reservation confirmed after all loop outcomes; false responds
  with the existing five-field app schema and then terminates Failed. Creation
  cannot intentionally fall through from a false reservation. Save succeeded
  after copying the existing response schema to resolve ActionSchemaInvalid.
- Live SharePoint descending QuoteSeq inspection showed highest issued value 4.
  SalesSequence still held NextNumber 4 / Revision 1. Corrected and verified
  NextNumber 5 / Revision 2. No business records were deleted or newly created
  by these repairs.
- Live imported rows use `migration-` request IDs, whereas the prepared file
  uses `MIGRATION:`. Reporting condition and both log EmailStatus predicates
  now suppress both case-insensitive prefixes. Reporting save succeeded.
- Do not reimport on the assumption SharePoint is empty. Existing migration
  rows were observed, but all-record reconciliation is still required.
- Offline notification predicate checks now cover 152 prepared rows and twelve
  scenarios. These are not live reporting/email tests.
# 7 October continuation

- Update numeric response fields corrected in both save/conflict branches.
- Simultaneous edit test: ID 154 advanced from revision 2 to 3 once; competing
  ETag update and stale revision 1 were rejected. App read-back verified the
  winning ProjectName/CustomerName and independent EndUserName.
- Gallery OnSelect changed from global `Set(varCurrentSPRecord, ThisItem)` to
  screen-local `UpdateContext({varCurrentSPRecord: ThisItem})`, matching the
  existing edit form state and eliminating the shadowed unused global variable.
- Removed unused `PowerAppV2->Runscript` attachment from the draft only; original
  flow retained. Saved unpublished; refreshed data-source checker: no errors.
- Three performance warnings remain: cross-screen OnStart reference and two
  initialized/reference collections; these still require careful audit.
- Temporary test button now performs an ID-filtered read only. Remove Screen2
  before publishing. Full performance/reporting/cutover acceptance remains pending.
