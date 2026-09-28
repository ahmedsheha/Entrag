# Sales_Screen1 review

## Scope and baseline

The live app `f89224af-018d-4038-a322-d6d5eb8436ac` was synchronized before review. All three exported files were inspected: App.pa.yaml, Screen1.pa.yaml, and _EditorState.pa.yaml. Coverage: one screen, 44 controls, 603 property formulas, nine connected data-source schemas, and the Office365Outlook connector reference. The synced original is preserved in `synced-original/`; the previous local export is preserved separately in `local-before-sync/`.

Baseline compiler result: **0 errors, 1 delegation warning**. The tool labels this result `Validation FAILED`, even though its only diagnostic is a warning. General App Checker: no issues. Accessibility checker: 73 findings (52 errors, 21 suggestions). These are different checks; a clean general App Checker result does not establish delegation or accessibility correctness.

## Findings and recommendations recorded before edits

| Severity | Location | Finding | Recommendation and disposition |
| --- | --- | --- | --- |
| High | Button1.OnSelect | `Max(SalesTracker, Quote_Seq)` is explicitly nondelegable for the connected source. The maximum may be calculated over only the configured client row limit. Schema reports Quote_Seq as String. Two simultaneous submissions can independently choose the same next number. | Use a server-side atomic sequence backed by an appropriate source/flow, with a numeric sequence column and an agreed migration. Deferred: changing the numbering mechanism, source schema, row limit, or sorting a text sequence is not a behavior-preserving formula cleanup. |
| High | Button1.OnSelect | Patch, email, refresh, reset, and success notification are chained without explicit error handling. The success message claims email was sent on the update path, although only the create path sends mail. | Agree on failure/retry behavior, add success/failure handling, and use outcome-specific messages. Deferred to preserve existing submission and failure behavior. No valid submission or email will be triggered during review. |
| High | Button1 and Container1 | The Submit/Update control is visible on the landing screen; the update path has no blank-current-record guard and required-field validation applies only in new mode. | Define expected invalid-update behavior and gate update on a selected source record. Deferred because it changes action eligibility. |
| Medium | ComboBox1_1 and Button1.OnSelect | Customer Name is displayed and editable when the sync toggle is off, but neither create nor update writes `'Customer Name'`. The toggle defaults to true, which makes the selected customer follow End User on entry/reset. | Confirm intended customer persistence and prepopulation, then update the write set and toggle default together. Deferred: adding a field to Patch changes business data. |
| Medium | ComboBox1_1.SearchFields | Visible options show CutomerName, but typing searches `Account  Manger`. Both columns exist; this is a semantic mismatch, not a broken reference. | Confirm whether customer or account-manager search is intended. Deferred to preserve current search behavior. Preserve source-column spellings; do not rename CutomerName or Account  Manger in isolation. |
| Medium | Button2.OnSelect | Search prefers quote, then project, then PO. LookUp returns the first match by these display/business fields. Duplicate project names or PO references may select a different record than a dropdown selection. | Establish uniqueness/stable identity before changing lookup targets. Preserve current priority, first-match behavior, and refresh-before-search. Replacing LookUp with Selected would change duplicate and freshness behavior. |
| Medium | cmbSearchQuote.Reset and cmbSearchRFQ.Reset | Reset is a constant true, alongside explicit Reset calls. | Verify selection/reset behavior interactively before changing. Deferred because removing the binding can alter selection persistence. |
| Medium | Screen1 and three ManualLayout containers | Fixed widths (1303 and 1211), fixed three-column inputs, and absolute positions offer no narrow-width reflow. Container1 reaches x=1333; its bottom is y=668 in new mode or y=758 in edit mode. Buttons at y=713 need another 40 pixels using the classic button default. Actual small-screen appearance also depends on app scale-to-fit settings. | Test target device sizes and agree on a responsive layout. Deferred: reparenting controls or resizing can affect references, tab order, and behavior. Source inspection establishes fixed geometry, not a claim that every runtime viewport clips. |
| Medium | Input controls and labels | Accessibility checker reports 52 errors, including 20 missing accessible labels and focus/tab-stop findings on 16 labels; 21 suggestions concern tab order, screen naming, and toggle states. The toggle is only 75x18 and overlaps the customer-label region. Several long labels have narrow no-wrap widths. | Add semantic accessible labels and assess whether static-label focus warnings are applicable; do not blindly make all labels keyboard stops. Test label fit and toggle affordance during a UI/accessibility pass. Deferred from the targeted formula cleanup. |
| Low | Button1.OnSelect | The same 16 field mappings are repeated in create/update branches; `varAdjustedTime` is a global with no consumer outside this event. | Share the change record within the event and use a local timestamp. Keep create-only quote fields out of the update write set. Planned safe change. |
| Low | Button2.OnSelect | Three branches repeat UpdateContext for varCurrentRecord. | Use one assignment around the existing conditional LookUp branches. Keep the current refresh, predicates, priority, and notifications. Planned safe change. |
| Low | Button1.OnSelect and Button2.OnSelect | Four obsolete block-commented implementations obscure the active formulas. Old references to Form1 and DataCardKey15 occur only in comments. | Remove the dead comments and store the live formulas as readable YAML literal blocks. Planned safe change; the old versions remain in the backup. |
| Low | Screen and control names | Screen1, Button1/2/4, Dropdown1/2/3/6, DataCardValue10/14/15, ComboBox1/1_1, and several label names are generic or inconsistent. Some visible text has spelling errors. | Rename through Studio with reference-aware verification in a separate maintainability/UI pass. Keep existing control identities in this patch. |
| Review note | Data loading | No App.OnStart data load; OnVisible initializes five used context variables only. Three event-driven Refresh calls can incur latency, including one before empty-search validation. Combo boxes directly bind to SalesTracker/Table2. No measured latency is available. | Preserve refresh points because they affect freshness. Measure connector requests with Monitor before moving/caching calls. Avoid speculative ClearCollect or nondelegable materialization. |
| Review note | Active function/reference audit | 3 LookUp sites in mutually exclusive branches, 2 Patch branches, 3 Refresh calls, 1 Max, 1 global Set. No active Filter, ForAll, Collect, ClearCollect, or cross-screen reference. The five context variables are all used. | No collection/loop removal is warranted. The three LookUp sites do not mean three queries execute for one search. Empty exported formulas and Parent.DisplayMode references do not produce baseline compile errors. |

## Preservation requirements for the patch

- Same new-only six-field validation and exact notification strings.
- Same DateAdd(Now(), 3, TimeUnit.Hours) timestamp expression, evaluated once per accepted submission before sequence calculation.
- Same quote prefix, sequence fallback, and Max expression, evaluated only for create.
- Same create/update base records and exact write sets: 18 fields on create, 16 on update; all other fields omitted as before.
- Same email recipient, subject, body, options, create-only placement, and sequencing after Patch.
- Same cleanup and Refresh order, reset pulses, visibility transitions, and search reset calls.
- Same search priority, LookUp predicates, first-match selection, empty/not-found messages, and visibility rules.
- App, screen/control names, hierarchy, source bindings, layout, and other properties remain unchanged.

## References

- [Microsoft: delegation overview](https://learn.microsoft.com/power-apps/maker/canvas-apps/delegation-overview)
- [Microsoft: With](https://learn.microsoft.com/en-us/power-platform/power-fx/reference/function-with)
- [Microsoft: Patch](https://learn.microsoft.com/en-us/power-platform/power-fx/reference/function-patch)

## Applied improvements

Only `Button1.OnSelect` and `Button2.OnSelect` were changed. The save event uses one local timestamp, captures the chosen create/update mode before the potentially slow sequence query, and shares its 16 common field mappings. The create branch still adds the two quote fields; the update branch still omits them. Nested local scopes intentionally preserve timestamp → sequence lookup → payload evaluation order. Search now assigns its result once while retaining all three alternative LookUp predicates and their original priority. Four obsolete block comments were removed. Both formulas use readable YAML literal blocks.

These are maintainability improvements, not measured connector-performance gains. The existing refresh/query counts, all five used context variables, data-source schemas, visible UI, and behavior-dependent issues remain unchanged.

## Validation status

- Full YAML structural comparison: exactly the two intended property values changed; all other properties, names, hierarchy, App, and editor order are identical.
- 22 automated static structural conformance checks pass, including exact create/update write fields, mail arguments, validation, search precedence, reset order, and no new global state. See `refactor-validation.json` and `verify_refactor.py`. These checks are not runtime execution.
- Baseline and first edited compile: zero compile errors and the same single Max delegation warning. Final candidate validation and server round-trip results are recorded in `final-validation.json`.
- A server export after the first edited compile matched all 603 properties and the complete control tree, confirming the changes reached coauthoring despite the tool's warning-level `Validation FAILED` label.
- Desktop preview was visually inspected. Automated browser actions were interrupted by changes in the active window, so create/update, email delivery, connector failure paths, and phone viewport runtime tests were not executed. No test business record or email was submitted.
- The Max delegation warning remains unresolved deliberately. Eliminating it reliably requires an agreed data/numbering change; hiding the warning or moving the calculation into a local collection would not fix the underlying issue. No claim of a warning-free or fully runtime-tested app is made.
- The changes are in the authoring session; publishing was not performed.

Skill provenance: `/Users/sheha/.codex/.tmp/marketplaces/power-platform-skills/plugins/canvas-apps/skills/canvas-app/SKILL.md`, version 3.1.0, repository revision `f6cc8c56dc7241f2b1fc802e87c84b4f9ee08c60`. The edit meets the simple-edit route: two property mutations on two existing controls, one screen, no structural changes. The user's preservation requirement takes priority over generic skill advice to redesign receipts, data writes, layout, or error paths.
