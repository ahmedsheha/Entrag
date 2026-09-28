# Required field feedback acceptance

Implemented in Screen1: six red Label stars derived from the original required-field expressions, six BorderColor and HoverBorderColor formulas, one local submit-attempt flag (one true assignment and five reset assignments). All44 existing controls, names, geometry and business behavior preserved. App and editor state unchanged. Two marker heights reduced by1px to avoid an input-border overlap.

## Evidence and limitations
- Baseline and post-edit compiler: zero errors, one preexisting Button1.OnSelect Max(SalesTracker,Quote_Seq) delegation warning. Compiler labels its overall result Validation FAILED because of that warning; this is not a warning-free app.
- Server round-trip: semantic equality for all3files after normalizing sibling order and omitted Label.TabIndex default=-1. Saved under required-field-review/server-roundtrip.
- Structural regression verifier: PASS. Exact6 new labels; existing properties limited to17 intended changes; event formulas identical after removing only feedback flag statements; all original data/connector writes and validation unchanged.
- App Checker: No app checker issues found.
- Visual observation: red stars visible in Studio beside empty End User, Application, Order Value and Discount; filled Project Name and BU have no stars. Optional blank inputs remain unmarked. Existing text-input normal borders remain black.
- Runtime click-through: NOT VERIFIED. Native browser automation produced stale/mismatched preview and screenshot state, an invalid element error, and noWindowsAvailable on coordinate fallback. No valid submit was invoked; no test record/email was deliberately sent. Reset/Existing and fill/clear behavior were symbolically checked below, not claimed as live tests.
- No publish action taken.

## Functional acceptance (symbolic final-YAML execution)
| Scenario | Result | Evidence |
|---|---|---|
| T-NEW | PASS static; partially observed visually | btnModeNew.OnSelect sets flagfalse; six Visible=newmode&&IsBlank(field); BorderColor guard additionally requires flagtrue. Defaults preserved (BU may already be nonblank). |
| T-INVALID | PASS static; live NOT VERIFIED | Exact old six-field guard retained. Invalid branch sets flagtrue then original error Notify; it has no data operations. Six borders/hover colors derive from same field emptiness. |
| T-FILL | PASS static; live NOT VERIFIED | Each marker and border reads current Text or Selected field directly; no OnChange cache. Filled nonblank/zero removes indicators; clearing restores marker and red border if attempt flagtrue. Existing DelayOutput retained. |
| T-OPTIONAL | PASS static and visual | Only six namedrequired inputs changed. BookPeriod/LeadType/other optional properties unchanged and no markers added. |
| T-RESET | PASS static; live NOT VERIFIED | Button4, New, and Screen.OnVisible clear flag. Original resets, refreshes, visibility unchanged. |
| T-EXIST | PASS static; live NOT VERIFIED | Exist clears flag and original varIsNewMode=false; all new indicators gated by newmode. |
| T-PRESERVE | PASS static and server round-trip | Original44 controls and geometry retained; original event operations equivalent after stripping feedback-only statements; App/editor unchanged; original Maxwarning unchanged. |

## Action traces
A-NEW: eligible New button -> existing context initialization plus flagfalse -> original form visible -> live blank markers and normal borders.
A-INVALID: newmode with requiredblank -> Button1.OnSelect invalid branch -> flagtrue -> existing Notify and blank-required red borders; no persistent mutation.
A-FILL: required input value changes -> same live IsBlank observation -> derived star/border updates; otherfieldstates unaffected.
A-RESET: RESET/OnVisible -> original context and resets plus flagfalse -> original landing; nextNew has normal borders.
A-EXIST: Exist -> original mode/search transition plus flagfalse -> no new required indicators in existingmode.
A-SAVE: original valid-branch guard -> unchanged Patch/email/Refresh/Reset -> original cleanup plus flagfalse -> original success behavior. Verified by formula comparison only, no live save/email test.

## Layout and QA
Builder reported checks1-44 inspected in changed scope. Six18px stars right edges180,218,95,624,611,1051<=1303 and bottom edges45,300,130,45,215,215<=568. Minimumheight27 exceeds21px textbudget. Dark red againstwhite contrast6.91:1. Preexisting fixed-layout, accessibility and data-sequence limitations are deferred rather than redesigned.
