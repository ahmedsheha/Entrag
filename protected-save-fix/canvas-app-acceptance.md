# Protected worksheet save: partial repair

Implemented only Button1.OnSelect. All50 controls, layout, existing validation, data payload, Patch targets, quote numbering, and email arguments remain unchanged. Backup and regression evidence are in ../protected-save-evidence.

## App behavior repair
- IfError encloses the create/update Patch directly. Its error branch only notifies with FirstError.Message and returns Blank. It performs no cleanup, refresh or email, preserving form values and selected record.
- Only the success branch invokes the existing new-record email and resets/hides the form.
- Email failure after a successful save produces a saved-but-email-failed warning and tells the user not to submit again. Existing-record updates report update success without claiming an email was sent.
- Refresh failures after saving are caught and identified separately, without describing a successful write as failed.
- No new context/global variables, controls, connectors or data sources.

## Verification
- Structural regression PASS: exactly one property changed; original Patch calls/payload, email arguments, required checks and Reset targets match.
- Fresh server round-trip exactly matches all three app YAML files.
- Compiler: zero errors, one preexisting Max(SalesTracker,Quote_Seq) delegation warning. The tool's overall Validation FAILED label includes this warning; not claimed warning-free.
- Symbolic cases PASS: invalid required input stops before save; Patch failure preserves form and skips email/cleanup; new save success emails then cleans up; update success cleans up without email; email failure reports partial success; refresh failure reports successful save with refresh warning.
- Live save/error scenarios NOT RUN: no test record or email created. Native Arc automation could select the Excel browser tab but could not activate worksheet or Automate ribbon controls reliably. Connected-document discovery found no connected sessions.
- Existing layout/accessibility and sequence/delegation defects unchanged. QA checks1-44 considered for this behavior-only edit; no new layout/control constructs introduced and no unrelated repairs made.

## Remaining blocker
Excel UI confirms Master Sheet is protected. User requires it to remain protected and has its password. This repair does not remove the underlying AccessDenied restriction and does not implement a protected-sheet writer.

A separate Power Automate/Office Script save path must be configured and verified. Microsoft documents session-scoped pauseProtection/password support and resumeProtection. The write must occur within the same script session with protection resumed in finally, not by pausing in one request and calling the existing Power Apps Patch in another. Do not store the password in the Canvas app or source files.

Read-only setup script ../protected-save-evidence/InspectSalesTracker.ts is prepared to confirm the actual table headers, owner worksheet and pause capability before implementing a writer. It has not been uploaded or executed. Browser access to the Automate code editor is the next prerequisite; password entry is not needed for this diagnostic.

No worksheet protection, workbook data, flow, or published app version was changed.
