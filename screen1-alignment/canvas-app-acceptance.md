# Sales_Screen1 formula-cleanup acceptance

Scope: two existing OnSelect formulas. One screen, 44 controls, 603 property formulas inspected. Original synchronized source and review evidence are in `../canvas-review/`.

Runtime evaluation: **NOT COMPLETED**. Desktop preview was visually inspected; interaction was interrupted by changes in the active window. No data-writing submission or email was executed. The rows below describe static preservation of the existing contracts, not successful live transactions or absence of pre-existing defects.

## Action contracts and static evidence

| Action | Entry/event | Existing source/state transition | Bound UI/evidence | Static preservation |
| --- | --- | --- | --- | --- |
| New | btnModeNew.OnSelect | Clear current record; set new mode; hide search/show form; pulse resets | Container1.Visible and input defaults; Button1.Text is Submit | PASS: event and observers byte-equivalent |
| Existing | btnModeExist.OnSelect | Select existing mode; show search/hide form; reset three search controls | ContainerSearch.Visible | PASS: event and observers byte-equivalent |
| Search | Button2.OnSelect | Refresh SalesTracker; validate any selection; first matching quote/project/PO branch sets source-backed varCurrentRecord; reveal form when found | Input defaults bind varCurrentRecord; existing empty/not-found notifications | PASS: exact predicates, priority, refresh, and observers preserved |
| Create | Button1.OnSelect, new mode | Validate same six required fields; compute same timestamp and sequence; Patch Defaults(SalesTracker) with 18 identical field expressions; call same email; refresh/clear/reset | Existing notification and return-to-landing state; no new persisted receipt added | PASS for structural preservation; real persistence/email not executed |
| Update | Button1.OnSelect, existing mode | Patch same source-backed varCurrentRecord with 16 identical field expressions; omit quote/customer/other fields; same refresh/clear/reset | Existing notification and return-to-landing state | PASS for structural preservation; real persistence not executed |
| Reset | Button4.OnSelect | Clear record/mode/visibility; reset search; refresh source; pulse input resets | Form/search hidden; same input defaults | PASS: event and observers byte-equivalent |
| Customer sync | tglSyncCustomer.Value | Select Customer Name default from End User while on, otherwise saved customer; same disabled/edit mode | ComboBox1_1.DefaultSelectedItems/DisplayMode | PASS: formulas byte-equivalent; existing missing customer write documented |

## Regression scenarios checked statically

- New mode with any required blank: same validation predicate and error notification; save branch not selected.
- Valid new submission: same source/default base, sequence fallback/prefix, timestamp calculation, 18 write fields, and create-only email arguments.
- Existing submission: same base record and 16 write fields; no Max query and no email branch; quote fields remain omitted.
- Create/update mode changes while the sequence request is running: local isNewSubmission preserves the dispatch mode selected before that request.
- Empty search: refresh still happens first, followed by the same warning.
- Quote alone; project alone; PO alone: identical respective lookup and state result.
- Quote/project/PO combinations: quote wins, then project, then PO, preserving the original first-match query semantics.
- Found vs missing source record: same visibility assignment or error notification.
- Submit completion: identical Refresh, visibility/current-record clear, reset pulse, three search resets, and success notification order.
- Existing source columns not in the write set: still omitted from Patch; customer persistence, failure handling, and blank-update eligibility remain the documented pre-existing issues.

## Evidence and limits

`../canvas-review/refactor-validation.json`: 22/22 checks passed **static structural conformance**. Runtime transaction tests: NOT RUN.

`../canvas-review/final-validation.json`: final compiler and live coauthoring round-trip evidence. Initial and edited compiler results contain zero errors and one pre-existing unsupported-Max delegation warning. General App Checker reported no issues; accessibility reported 52 errors and 21 suggestions. No warning-free compile or fully accessible/responsive runtime is claimed.

All other control properties, names, hierarchy, layout, App configuration, and editor ordering are unchanged. The existing UI and business-data gaps are listed in `../canvas-review/review.md` and were not silently redesigned to satisfy generic generation checks.
