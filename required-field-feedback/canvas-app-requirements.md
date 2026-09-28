# Canvas App Original Request Contract
Contract version: 1
Target device: Existing app layout preserved; responsive redesign outside this visual edit.

## Original Request
"i want to add the * for filds empty and tell me idea if it what if we make it red"
Prior constraint: Do not change business logic or expected behavior; summarize improvements before applying, validate and fix compile errors.
Authorized approach already communicated: red stars beside empty required fields, disappear when filled; red borders after unsuccessful Submit. Preserve six existing required checks and new-mode-only validation.

## Capability Inventory
| Requirement key | Original request clause | Capability family | Required outcome / scope | Required action(s) | Scenario(s) | Specialized contract mappings |
|---|---|---|---|---|---|---|
| REQ-STAR | add * for fields empty | Validation feedback | Six required fields only, red star visible when new mode and exact existing IsBlank expression | A-NEW,A-FILL | T-NEW,T-FILL,T-OPTIONAL | Current input observer |
| REQ-RED | make it red | Validation feedback | Red border only after invalid Submit, clear as corrected | A-INVALID,A-FILL | T-INVALID,T-FILL | One attempt flag |
| REQ-PRESERVE | do not change business logic | Regression preservation | Same required predicate, data operations, email arguments, layout, valid submission behavior | A-RESET,A-EXIST,A-SAVE | T-RESET,T-EXIST,T-PRESERVE | Static business-formula equivalence; no live valid Submit |

## Scope and Approved Implementation
Modify Screen1.pa.yaml only. No App changes, new sources, connectors, components, data actions, control renames, reparenting, or responsive redesign.
Six existing exact tests: IsBlank(ProjName.Text), IsBlank(Application.Text), IsBlank(BU.Selected.BU), IsBlank(ComboBox1.Selected.CutomerName), IsBlank(DataCardValue10.Text), IsBlank(DataCardValue15.Text).
Add six Label stars inside existing Container1 next to current labels. Color RGBA(184,0,0,1). Visible = varIsNewMode && field test. Set border red for varIsNewMode && varSubmitAttempted && field test; preserve previous normal/hover border values, including Blank() where original formula is empty. Focus defaults already derive Self.BorderColor.
Add single context varSubmitAttempted, initialize false, set true exclusively in invalid Submit branch before existing Notify; clear on New, Existing, Reset, normal save cleanup and Screen.OnVisible. No separate per-field validity variables or OnChange handlers.
Optional accessible input labels may identify required state using supported AccessibleLabel property; no invented Label properties.

## Functional Tests
T-NEW: new empty form: stars for exact required blanks, original borders.
T-INVALID: invalid Submit: existing message, required empty borders red, no data writes.
T-FILL: fill required field: its star and red border disappear, others stay.
T-OPTIONAL: empty optional fields unchanged.
T-RESET: reset and New clears attempt flag.
T-EXIST: existing mode has no new red indicators.
T-PRESERVE: compare original and final business writes, connector calls, original IsBlank condition, control hierarchy and layout; compile zero errors. One pre-existing Max(SalesTracker,Quote_Seq) delegation warning may remain.

## Evidence
Fresh synced sources in working directory; immutable baseline in ../required-field-review/synced-original and ../required-field-review/before.json. Authoritative control discovery in control-discovery.md.
