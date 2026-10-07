# New-quote notification configuration

User-confirmed recipient: `ahmed.adel@entrag.com`.

Store this address in a solution environment variable for the notification
recipient; do not hard-code it in the Power App. The recipient address does not
establish a shared-mailbox sender or authorize Send As permissions.

Send only future create notifications. Suppress migration and update emails.
Use integration-log idempotency to prevent duplicate notifications on retries.
This requirement is not yet proven by runtime testing.

Status: the create-only email action and its success-log update were saved in
`SyncSalesReporting`. Flow Checker reported zero errors and zero warnings. The
flow was verified **Off** after saving, and no test email has been sent. The
remaining deployment task is to replace/verify the direct recipient value with
the solution environment variable before enabling the flow.

## Recovery safety requirement

An existing integration record is complete only when `ExcelStatus` is
`Succeeded` and `EmailStatus` is `Succeeded` or `NotApplicable`. Pending or
unknown status must not silently terminate as success.

The 6 October guard stops unresolved existing records with error code
`ReportingRecoveryRequired`. This is an administrative safety stop, not an
automatic retry worker. No resend is performed by that branch.

Do not blindly resend Pending email: delivery may have succeeded while the
following SharePoint status update failed. Before production, introduce a
durable pre-send state and distinguish definitely-not-submitted notifications
from ambiguous delivery outcomes. Ambiguous outcomes require inspection of
the original run and mailbox delivery; automatic retry must not send them
again. Connector retries also need audit for ambiguous send failures.

Required acceptance cases include send failure before acceptance, send timeout,
send success followed by log-update failure, duplicate trigger delivery, and
migration suppression. Exactly-once email delivery is not established by the
current flow checker or by this completion guard.

### Send-state hardening — 6 October

- The pre-email integration record now marks future creates `Sending`, rather
  than `Pending`. Updates remain `NotApplicable`. A successful email is still
  followed by the existing success update.
- The email action's retry policy is now `None`. This avoids blind resend on
  intermittent errors where acceptance may be uncertain; it is not a guarantee
  of exactly-once delivery and does not replace delivery reconciliation.
- The failure log distinguishes a skipped email action (`NotSent`) from a
  non-successful attempted action (`Unknown`). Successful send plus failed
  status update is logged as `Succeeded` in the failure record, while the base
  record remains unresolved until an administrator reconciles it.
- Sanitized LastError now includes the run name and Excel/email action statuses.
  A failed Terminate after failure logging uses code
  `ReportingSynchronizationFailed` so logging does not hide the failed outcome.
- Runtime tests, durable retry scheduling, delivery reconciliation, recipient
  environment-variable binding, and migration suppression remain required.

### Migration suppression — 6 October

The prepared 152 records all use `ClientRequestId=MIGRATION:<stable-id>`.
The email condition and both log classifications now use the same predicate:
Revision is 1, ClientRequestId is present, and its uppercase form does not
start with `MIGRATION:` or `MIGRATION-`. Live records were found using the latter
prefix; both are now suppressed. Only matching records can reach the email action.
Migration records and updates are logged `NotApplicable` for email.

Preserve the migration prefix during import. Do not route legacy imports through
CreateOpportunity using a fresh app request ID. Excel synchronization remains
outside the email condition and still runs for migrated records.

Run `node production-optimization/test-notification-guard.mjs` for offline
coverage of all prepared records plus new-create, update, missing-ID,
case-insensitive prefix, and malformed-revision cases. This does not prove the
Power Automate trigger's runtime payload or actual email delivery; live
migration-suppression acceptance remains required before enabling the flow.

### Recipient environment variable

Created in `Sales Production Optimization` (solution ID
`86684d6c-ddbb-f111-aaaf-70a8a581110f`):

- Display name: `Sales Notification Recipient`.
- Schema name: `new_SalesNotificationRecipient`.
- Type: Text; default left empty.
- Current value: `ahmed.adel@entrag.com`.
- Export value: No, so the current address is not embedded in solution exports.

Creation was verified in the solution object list. Binding to the reporting
flow must also be verified before this configuration is considered complete.

`SyncSalesReporting` was added to the solution and verified as Off in the
solution object list. The platform also added Excel Online (Business) and
Office 365 Outlook connection references. The same reporting flow was used,
not a replacement copy.

**Binding saved — 6 October, 01:39 PM:** native Arc control recovered access.
The email action's To now uses the dynamic parameter selected from the UI:
`@parameters('Sales Notification Recipient (new_SalesNotificationRecipient)')`.
This exact reference was verified in Code view, and save success was confirmed.
Designer Flow Checker shows zero errors and zero warnings. Details confirm the
same flow ID, modified at 01:39 PM, remains Off with no run history.
The configured current value is the approved address above; runtime parameter
resolution and delivery have not been tested. No emails or workbook writes were
initiated. Keep reporting off until runtime and workbook acceptance passes.
