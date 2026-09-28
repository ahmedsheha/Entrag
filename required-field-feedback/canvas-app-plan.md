# Canvas App Plan

## Mode
EDIT

## Requirements
Implement the orchestrator-owned canvas-app-requirements.md exactly. Add red stars to empty required fields and red borders after an invalid Submit. Preserve business rules and existing layout. The user has authorized this scoped edit.

## Original Request Capability Inventory
| Requirement key | Original request clause | Capability family | Required outcome / scope | Required action(s) | Observer(s) | Scenario(s) | Specialized contract mappings |
|---|---|---|---|---|---|---|---|
| REQ-STAR | add * for fields empty | Validation feedback | Six required fields only, red star visible when new mode and exact existing IsBlank expression | A-NEW,A-FILL | lblReqProjectName/lblReqApplication/lblReqBU/lblReqEndUser/lblReqOrderValue/lblReqDiscount.Visible | T-NEW,T-FILL,T-OPTIONAL | Current input observer |
| REQ-RED | make it red | Validation feedback | Red border only after invalid Submit, clear as corrected | A-INVALID,A-FILL | ProjName/Application/BU/ComboBox1/DataCardValue10/DataCardValue15.BorderColor | T-INVALID,T-FILL | One attempt flag |
| REQ-PRESERVE | do not change business logic | Regression preservation | Same required predicate, data operations, email arguments, layout, valid submission behavior | A-RESET,A-EXIST,A-SAVE | Exact original handler comparison; six normal-border fallback expressions; original hierarchy and positions | T-RESET,T-EXIST,T-PRESERVE | Static business-formula equivalence; no live valid Submit |

## Requirement Coverage
| Requirement | Planned affordance | Fidelity |
|---|---|---|
| Asterisk for empty fields | Six Label.Text="*" controls beside existing required-field labels; new-mode blank guards | Exact approved required-only interpretation |
| Red indication | Dark red RGBA(184,0,0,1) stars and post-attempt invalid borders including hover/focus | Exact |
| Preserve behavior | Local feedback state only; input/default/data/email/control identity unchanged | Exact; existing defects retained outside scope |

## Required Record Fields
No record list/card/detail presentation changes. The six existing input values, labels, defaults and bindings remain unchanged; see Data Entry Label Contracts.

## Action Contracts
| Requested action | Preconditions | Entry point | Owner screen | Control and event | Source and stable ID | Transition and postcondition | Mutation write set | Receipt proof set | Observer and evidence |
|---|---|---|---|---|---|---|---|---|---|
| A-NEW | Existing reachable landing New control | New | Screen1 | btnModeNew.OnSelect | Screen context, N/A record ID | Add varSubmitAttempted:false to existing initialization; retain all current actions | N/A, local feedback only | N/A | Required blanks show red *; original borders |
| A-INVALID | varIsNewMode and exact existing invalid predicate | Submit | Screen1 | Button1.OnSelect invalid branch | Six current inputs; no data operation | UpdateContext({varSubmitAttempted:true}); existing Notify unchanged | N/A | N/A | Each blank required input BorderColor red |
| A-FILL | New form shown | Six existing inputs | Screen1 | Current Text/Selected outputs; no new OnChange | Live input values, N/A record ID | Derived marker/border state updates as inputs change | N/A | N/A | Six star Visible and BorderColor expressions read same live value as validation |
| A-RESET | Existing reachable RESET control | RESET | Screen1 | Button4.OnSelect; Screen1.OnVisible initialization | Screen context | Add false flag to existing context initialization; retain resets/refreshes | N/A | N/A | Landing preserved and subsequent New has original borders |
| A-EXIST | Existing reachable Exist control | Exist | Screen1 | btnModeExist.OnSelect | Screen context; varCurrentRecord untouched | Add false flag to existing context update | N/A | N/A | All stars hidden and normal borders when varIsNewMode=false |
| A-SAVE | Existing valid-submit branch, unchanged | Submit/Update | Screen1 | Button1.OnSelect valid branch cleanup only | Existing SalesTracker target and varCurrentRecord preserved | Add false flag to cleanup; business handler byte-equivalent after stripping that assignment | Existing write set preserved exactly; no changed data fields | Existing evidence preserved; no new receipt scope | Static comparison of original Patch/connector/Refresh/Notify and guard, flag false in cleanup |

## Mutation Lifecycle Evidence
N/A to added feedback: it does not create a data mutation, nor change an existing mutation source, identity, destination, synchronization, focus or proof. A-SAVE is a regression contract for local cleanup only. Do not introduce CRUD receipts or change the existing business handler.

## Mutation Field Ledger
No changed business fields. Preserve the complete existing submission record, create quote fields, update omission of quote fields, email and refresh operations exactly. Local context varSubmitAttempted is not a persisted field.

## Functional Test Matrix
| Scenario | Given | When | Then | Evidence surface | Boundary or negative case |
|---|---|---|---|---|---|
| T-NEW | Landing or previous attempted form | Click New | varSubmitAttempted=false; required blanks show stars with original borders | Six star Visible bindings and six BorderColor bindings | BU may have a nonblank default; do not force it blank |
| T-INVALID | New mode and at least one required blank | Click Submit | varSubmitAttempted=true; original error Notify; red borders on required blanks; no writes | Button1 invalid branch and six BorderColor bindings | Safely test only verified invalid input; never valid Submit |
| T-FILL | New mode after invalid attempt | Fill Project Name with Test then clear it; repeat remaining five inputs statically or safely in preview | Filled field's star/red border clear; other blanks remain; clearing restores both | Live values, star Visible and input BorderColor | Text input DelayOutput remains true; numeric 0 is nonblank under original rule |
| T-OPTIONAL | Optional field such as Book Period blank | Open New / invalid Submit | Optional field retains original properties with no new marker | Dropdown3 and absent corresponding new star | Requiredness stays exactly the six original IsBlank checks |
| T-RESET | New mode after invalid attempt | Click RESET then New; repeat New without RESET | Flag false; original reset/landing behavior remains; new blanks show stars without red borders | Button4.OnSelect, btnModeNew.OnSelect, six border formulas | Screen OnVisible also clears flag |
| T-EXIST | Invalid attempted new form | Click Exist and inspect or search existing record | Flag false, varIsNewMode=false; no new stars or red borders | btnModeExist.OnSelect and six marker/border guards | Even blank existing values remain under original rules |
| T-PRESERVE | Original snapshot and edited YAML | Static formula comparison, compile, round-trip sync | Original validation predicate, data operations, email arguments, input defaults/Items/resets and layout identical; only feedback delta | Diff against ../required-field-review/before.json and compiler result | No valid Submit runtime test; one preexisting Max delegation warning may remain |

## Data Entry Label Contracts
| Required input | Persistent visible label | Shared field region |
|---|---|---|
| ProjName | 'ProjName Value_1'.Text = "Project Name" (BU existing newline retained) | Container1; preserve original position; add lblReqProjectName beside label |
| Application | Application_DataCardk.Text = "Application (TSF)" (BU existing newline retained) | Container1; preserve original position; add lblReqApplication beside label |
| BU | BUCardKey1.Text = "BU" (BU existing newline retained) | Container1; preserve original position; add lblReqBU beside label |
| ComboBox1 | EndUser.Text = "End User Name" (BU existing newline retained) | Container1; preserve original position; add lblReqEndUser beside label |
| DataCardValue10 | 'Order Value'.Text = "Order Value" (BU existing newline retained) | Container1; preserve original position; add lblReqOrderValue beside label |
| DataCardValue15 | Discount.Text = "Discount" (BU existing newline retained) | Container1; preserve original position; add lblReqDiscount beside label |

## Layout Budget Contracts
Existing ManualLayout is retained by authorized edit scope. Stars occupy unused label-row space, without resizing/reparenting controls: fixed width18, height27/28, zero padding. Largest star right edge1051 < Container1.Width1303; largest bottom300 < height568. All labels remain in existing field columns whose inputs are350 wide. Exact rectangles in Screen1 brief. No new overlays on interactive areas.

## Viewport Containment Contracts
No new responsive root: this is an existing fixed composition and the approved task preserves layout. Existing narrow-width/scrolling defects remain documented and out of scope; no claim of responsive remediation.

## Working Directory
/Users/sheha/ahmedsheha/required-field-feedback

## Discovery Summary
Fresh sync has App, Screen1 and _EditorState; one screen,44 existing controls,603 explicit properties. Authoritative discovery for Label, Classic/TextInput, Classic/DropDown, Classic/ComboBox in control-discovery.md. New Label has no Variant; existing ManualLayout variants remain. No new API/data-source/component resources. Six required tests mirror Button1.OnSelect exactly. QA guide at immutable plugin root includes QACHK-SHARED-SOURCE-DERIVATION. Baseline compiler has one Max(SalesTracker,Quote_Seq) delegation warning and no compile errors.

## Dispatch
| Action | Screen | Target File | YAML Key | Name Prefix | Screen Brief |
|---|---|---|---|---|---|
| Modify | Screen1 | /Users/sheha/ahmedsheha/required-field-feedback/Screen1.pa.yaml | Screen1 | Req | /Users/sheha/ahmedsheha/required-field-feedback/Screen1.screen-plan.md |

## App Changes
### Before builders
None
### After builders
None

## Editor State Changes
None. Preserve ScreensOrder [Screen1].

## Deferred Existing Issues
Preserve existing fixed widths, missing responsive root and existing accessibility findings outside six touched inputs. Preserve Max delegation warning/sequence race, data handling and existing customer bindings. Do not expand this visual edit into a business-rule or layout redesign.

