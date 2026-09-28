# Screen Plan: Screen1

## Assignment
- Action: Modify
- Target file: /Users/sheha/ahmedsheha/required-field-feedback/Screen1.pa.yaml
- YAML key: Screen1
- Control name prefix: Req

## Current State
Existing sales form has six required checks only in new mode. Existing Notify mentions asterisks but no markers exist. Container1 is ManualLayout,1303x568. Preserve all44 controls and their hierarchy; add exactly six Label children. All business data operations stay unchanged.

## Changes
Add six derived red markers, six derived BorderColor/HoverBorderColor formulas, and one context flag lifecycle. Do not rename, resize, reparent, or change input defaults, Items, values, Reset, DelayOutput, TabIndex, DisplayMode or events. No optional accessibility additions in this bounded change.

## Controls to Add
Create each below with exact creation keyword Control: Label, no Variant. Common properties: Text: ="*", Color: =RGBA(184,0,0,1), Fill: =RGBA(0,0,0,0), Font: =Font.'Open Sans', FontWeight: =FontWeight.Bold, Size: =14, Width: =18, Wrap: =false, PaddingTop/Bottom/Left/Right: =0, TabIndex: =-1. No OnSelect or AccessibleLabel. Use existing sibling label references for geometry.

| New control | Reference label | Visible formula | X | Y | Height | Rectangle |
|---|---|---|---|---|---|---|
| lblReqProjectName | 'ProjName Value_1' | =varIsNewMode && IsBlank(ProjName.Text) | ='ProjName Value_1'.X + 'ProjName Value_1'.Width + 2 | ='ProjName Value_1'.Y | ='ProjName Value_1'.Height | (162,17) 18x28 |
| lblReqApplication | Application_DataCardk | =varIsNewMode && IsBlank(Application.Text) | =Application_DataCardk.X + Application_DataCardk.Width + 2 | =Application_DataCardk.Y | =Application_DataCardk.Height | (200,272) 18x28 |
| lblReqBU | BUCardKey1 | =varIsNewMode && IsBlank(BU.Selected.BU) | =BUCardKey1.X + BUCardKey1.Width + 2 | =BUCardKey1.Y | =BUCardKey1.Height - 1 | (77,103) 18x27 |
| lblReqEndUser | EndUser | =varIsNewMode && IsBlank(ComboBox1.Selected.CutomerName) | =EndUser.X + EndUser.Width + 2 | =EndUser.Y | =EndUser.Height | (606,17) 18x28 |
| lblReqOrderValue | 'Order Value' | =varIsNewMode && IsBlank(DataCardValue10.Text) | ='Order Value'.X + 'Order Value'.Width + 2 | ='Order Value'.Y | ='Order Value'.Height - 1 | (593,187) 18x28 |
| lblReqDiscount | Discount | =varIsNewMode && IsBlank(DataCardValue15.Text) | =Discount.X + Discount.Width + 2 | =Discount.Y | =Discount.Height | (1033,187) 18x28 |

## Controls to Remove
None.

## Properties to Update
Each listed input receives exactly these two properties; all other input properties remain unchanged. FocusedBorderColor already defaults to Self.BorderColor, so do not add it. The normal empty-expression border fallback is Blank(), not a guessed theme color. Combo/dropdown normal hover preserves discovered default ColorFade(Self.BorderColor,15%).

| Input | BorderColor | HoverBorderColor |
|---|---|---|
| ProjName | =If(varIsNewMode && varSubmitAttempted && IsBlank(ProjName.Text), RGBA(184,0,0,1), Blank()) | =If(varIsNewMode && varSubmitAttempted && IsBlank(ProjName.Text), RGBA(184,0,0,1), RGBA(0, 18, 107, 1)) |
| Application | =If(varIsNewMode && varSubmitAttempted && IsBlank(Application.Text), RGBA(184,0,0,1), Blank()) | =If(varIsNewMode && varSubmitAttempted && IsBlank(Application.Text), RGBA(184,0,0,1), RGBA(0, 18, 107, 1)) |
| BU | =If(varIsNewMode && varSubmitAttempted && IsBlank(BU.Selected.BU), RGBA(184,0,0,1), RGBA(0, 18, 107, 1)) | =If(varIsNewMode && varSubmitAttempted && IsBlank(BU.Selected.BU), RGBA(184,0,0,1), ColorFade(Self.BorderColor, 15%)) |
| ComboBox1 | =If(varIsNewMode && varSubmitAttempted && IsBlank(ComboBox1.Selected.CutomerName), RGBA(184,0,0,1), RGBA(0, 18, 107, 1)) | =If(varIsNewMode && varSubmitAttempted && IsBlank(ComboBox1.Selected.CutomerName), RGBA(184,0,0,1), ColorFade(Self.BorderColor, 15%)) |
| DataCardValue10 | =If(varIsNewMode && varSubmitAttempted && IsBlank(DataCardValue10.Text), RGBA(184,0,0,1), Blank()) | =If(varIsNewMode && varSubmitAttempted && IsBlank(DataCardValue10.Text), RGBA(184,0,0,1), RGBA(0, 18, 107, 1)) |
| DataCardValue15 | =If(varIsNewMode && varSubmitAttempted && IsBlank(DataCardValue15.Text), RGBA(184,0,0,1), Blank()) | =If(varIsNewMode && varSubmitAttempted && IsBlank(DataCardValue15.Text), RGBA(184,0,0,1), RGBA(56, 96, 178, 1)) |

Event edits:
- Screen1.OnVisible: add varSubmitAttempted:false to existing initialization UpdateContext.
- btnModeNew.OnSelect: add varSubmitAttempted:false to initial UpdateContext.
- btnModeExist.OnSelect: add varSubmitAttempted:false to initial UpdateContext.
- Button4.OnSelect: add varSubmitAttempted:false to initial UpdateContext.
- Button1.OnSelect: retain exact existing varIsNewMode && (six IsBlank tests) guard. In true/invalid branch insert UpdateContext({varSubmitAttempted:true}); immediately before existing error Notify. Leave comma separating false branch intact.
- Button1.OnSelect: add varSubmitAttempted:false to existing post-submission cleanup UpdateContext alongside varShowForm, varShowSearch, varCurrentRecord,varIsNewMode.
Only these six flag assignments are permitted: one true and five false. No changes to With payload, Patch, email, Refresh, Reset, Notify or evaluation order.

## Layout and Visual Impact
Existing geometry is preserved. New markers fit in unused space immediately right of their labels. Their right edges are180,218,95,624,611,1051, all inside Container1.Width1303 and corresponding350px input columns. Their bottom edges45,300,130,45,215,215 are within568. BU and Order Value stars are one pixel shorter than their labels so their rectangles stop at the input top border. Stars do not intercept input because they sit after labels and above inputs. Width18 and height>=27 fit one14px asterisk at1.5line budget21px plus0padding. Preserve original primary action bounds. No responsive breakpoint is introduced; preexisting fixed-layout limitations remain outside scope. No new root/scroll container or mutation receipt is authorized.

## Required Record Fields
No record presentation change; preserve all input values/default bindings and existing visible labels.

## Data Entry Label Contracts
| Required input | Persistent visible label | Shared field region |
|---|---|---|
| ProjName | 'ProjName Value_1'.Text = "Project Name" (BU existing newline retained) | Container1; preserve original position; add lblReqProjectName beside label |
| Application | Application_DataCardk.Text = "Application (TSF)" (BU existing newline retained) | Container1; preserve original position; add lblReqApplication beside label |
| BU | BUCardKey1.Text = "BU" (BU existing newline retained) | Container1; preserve original position; add lblReqBU beside label |
| ComboBox1 | EndUser.Text = "End User Name" (BU existing newline retained) | Container1; preserve original position; add lblReqEndUser beside label |
| DataCardValue10 | 'Order Value'.Text = "Order Value" (BU existing newline retained) | Container1; preserve original position; add lblReqOrderValue beside label |
| DataCardValue15 | Discount.Text = "Discount" (BU existing newline retained) | Container1; preserve original position; add lblReqDiscount beside label |

## Required Actions
| Requested action | Preconditions | Entry point | Owner screen | Control and event | Source and stable ID | Transition and postcondition | Mutation write set | Receipt proof set | Observer and evidence |
|---|---|---|---|---|---|---|---|---|---|
| A-NEW | Existing reachable landing New control | New | Screen1 | btnModeNew.OnSelect | Screen context, N/A record ID | Add varSubmitAttempted:false to existing initialization; retain all current actions | N/A, local feedback only | N/A | Required blanks show red *; original borders |
| A-INVALID | varIsNewMode and exact existing invalid predicate | Submit | Screen1 | Button1.OnSelect invalid branch | Six current inputs; no data operation | UpdateContext({varSubmitAttempted:true}); existing Notify unchanged | N/A | N/A | Each blank required input BorderColor red |
| A-FILL | New form shown | Six existing inputs | Screen1 | Current Text/Selected outputs; no new OnChange | Live input values, N/A record ID | Derived marker/border state updates as inputs change | N/A | N/A | Six star Visible and BorderColor expressions read same live value as validation |
| A-RESET | Existing reachable RESET control | RESET | Screen1 | Button4.OnSelect; Screen1.OnVisible initialization | Screen context | Add false flag to existing context initialization; retain resets/refreshes | N/A | N/A | Landing preserved and subsequent New has original borders |
| A-EXIST | Existing reachable Exist control | Exist | Screen1 | btnModeExist.OnSelect | Screen context; varCurrentRecord untouched | Add false flag to existing context update | N/A | N/A | All stars hidden and normal borders when varIsNewMode=false |
| A-SAVE | Existing valid-submit branch, unchanged | Submit/Update | Screen1 | Button1.OnSelect valid branch cleanup only | Existing SalesTracker target and varCurrentRecord preserved | Add false flag to cleanup; business handler byte-equivalent after stripping that assignment | Existing write set preserved exactly; no changed data fields | Existing evidence preserved; no new receipt scope | Static comparison of original Patch/connector/Refresh/Notify and guard, flag false in cleanup |

## State-Driven Surface Visibility
No changed whole-surface gating. Container1.Visible remains =varShowForm. Markers only use the specified new-mode blank predicates; they inherit parent visibility.

## Mutation Lifecycle Evidence
No new or changed persisted mutation. Existing data source, stable record target, payload, email, refresh and post-action evidence are preserved. No receipt redesign.

## Mutation Field Ledger
No changed data fields. Keep all original submission fields and create-only quote fields byte-equivalent. Flag is local UI state only.

## Functional Test Scenarios
| Scenario | Given | When | Then | Evidence surface | Boundary or negative case |
|---|---|---|---|---|---|
| T-NEW | Landing or previous attempted form | Click New | varSubmitAttempted=false; required blanks show stars with original borders | Six star Visible bindings and six BorderColor bindings | BU may have a nonblank default; do not force it blank |
| T-INVALID | New mode and at least one required blank | Click Submit | varSubmitAttempted=true; original error Notify; red borders on required blanks; no writes | Button1 invalid branch and six BorderColor bindings | Safely test only verified invalid input; never valid Submit |
| T-FILL | New mode after invalid attempt | Fill Project Name with Test then clear it; repeat remaining five inputs statically or safely in preview | Filled field's star/red border clear; other blanks remain; clearing restores both | Live values, star Visible and input BorderColor | Text input DelayOutput remains true; numeric 0 is nonblank under original rule |
| T-OPTIONAL | Optional field such as Book Period blank | Open New / invalid Submit | Optional field retains original properties with no new marker | Dropdown3 and absent corresponding new star | Requiredness stays exactly the six original IsBlank checks |
| T-RESET | New mode after invalid attempt | Click RESET then New; repeat New without RESET | Flag false; original reset/landing behavior remains; new blanks show stars without red borders | Button4.OnSelect, btnModeNew.OnSelect, six border formulas | Screen OnVisible also clears flag |
| T-EXIST | Invalid attempted new form | Click Exist and inspect or search existing record | Flag false, varIsNewMode=false; no new stars or red borders | btnModeExist.OnSelect and six marker/border guards | Even blank existing values remain under original rules |
| T-PRESERVE | Original snapshot and edited YAML | Static formula comparison, compile, round-trip sync | Original validation predicate, data operations, email arguments, input defaults/Items/resets and layout identical; only feedback delta | Diff against ../required-field-review/before.json and compiler result | No valid Submit runtime test; one preexisting Max delegation warning may remain |

## Relevant Data Source Schemas
None needed for this edit: no source accesses added or altered. Read current control Text/Selected expressions exactly, including existing CutomerName spelling. Existing BU default may already be selected and should not be forced blank.

## Relevant API Details
No new connector operation. Preserve existing Office365Outlook.SendEmailV2 text and arguments exactly. Do not invoke a valid Submit to test.

## Required Variants
No added control has variants. Existing GroupContainer Variant: ManualLayout remains unchanged.

## Changed or Added Control Definitions
The following complete valid input-name lists are from supplied discovery; parent-specific layout additions are listed separately below. Only the subset explicitly specified above is to be written.

### Label
Creation: Control: Label. Inputs: Align, AutoHeight, BorderColor, BorderStyle, BorderThickness, Color, ContentLanguage, DisabledBorderColor, DisabledColor, DisabledFill, DisplayMode, Fill, FocusedBorderColor, FocusedBorderThickness, Font, FontWeight, Height, HoverBorderColor, HoverColor, HoverFill, Italic, LineHeight, Live, OnSelect, Overflow, PaddingBottom, PaddingLeft, PaddingRight, PaddingTop, PressedBorderColor, PressedColor, PressedFill, Role, Size, Strikethrough, TabIndex, Text, Tooltip, Underline, VerticalAlign, Visible, Width, Wrap, X, Y.
Written enum properties: Enum name: Font -> Font: =Font.'Open Sans'; Enum name: FontWeight -> FontWeight: =FontWeight.Bold.
Label has no AccessibleLabel input.

### Classic/TextInput
Creation: Control: Classic/TextInput. Inputs: AccessibleLabel, Align, BorderColor, BorderStyle, BorderThickness, Clear, Color, ContentLanguage, Default, DelayOutput, DisabledBorderColor, DisabledColor, DisabledFill, DisplayMode, EnableSpellCheck, Fill, FocusedBorderColor, FocusedBorderThickness, Font, FontWeight, Format, Height, HintText, HoverBorderColor, HoverColor, HoverFill, Italic, LineHeight, MaxLength, Mode, OnChange, OnSelect, PaddingBottom, PaddingLeft, PaddingRight, PaddingTop, PressedBorderColor, PressedColor, PressedFill, RadiusBottomLeft, RadiusBottomRight, RadiusTopLeft, RadiusTopRight, Reset, Size, Strikethrough, TabIndex, Tooltip, Underline, VirtualKeyboardMode, Visible, Width, X, Y. No enum property changed.

### Classic/DropDown
Creation: Control: Classic/DropDown. Inputs: AccessibleLabel, AllowEmptySelection, BorderColor, BorderStyle, BorderThickness, ChevronBackground, ChevronDisabledBackground, ChevronDisabledFill, ChevronFill, ChevronHoverBackground, ChevronHoverFill, Color, ContentLanguage, Default, DisabledBorderColor, DisabledColor, DisabledFill, DisplayMode, Fill, FocusedBorderColor, FocusedBorderThickness, Font, FontWeight, Height, HoverBorderColor, HoverColor, HoverFill, Italic, Items, OnChange, OnSelect, PaddingBottom, PaddingLeft, PaddingRight, PaddingTop, PressedBorderColor, PressedColor, PressedFill, Reset, SelectionColor, SelectionFill, Size, Strikethrough, TabIndex, Tooltip, Underline, Visible, Width, X, Y. No enum property changed. Existing exported Items.Value retained unchanged.

### Classic/ComboBox
Creation: Control: Classic/ComboBox. Inputs: AccessibleLabel, BorderColor, BorderStyle, BorderThickness, ChevronBackground, ChevronDisabledBackground, ChevronDisabledFill, ChevronFill, ChevronHoverBackground, ChevronHoverFill, Color, ContentLanguage, Default, DefaultSelectedItems, DisabledBorderColor, DisabledColor, DisabledFill, DisplayFields, DisplayMode, Fill, FocusedBorderColor, FocusedBorderThickness, Font, FontWeight, Height, HoverBorderColor, HoverColor, HoverFill, InputTextPlaceholder, IsSearchable, Italic, Items, MultiValueDelimiter, NoSelectionText, OnChange, OnSelect, PaddingBottom, PaddingLeft, PaddingRight, PaddingTop, PressedBorderColor, PressedColor, PressedFill, Reset, SearchFields, SelectionColor, SelectionFill, SelectionTagColor, SelectionTagFill, SelectMultiple, Size, Strikethrough, TabIndex, Tooltip, Underline, Visible, Width, X, Y. No enum property changed.

All four definitions additionally permit AlignInContainer, FillPortions, LayoutMaxHeight, LayoutMaxWidth, LayoutMinHeight, LayoutMinWidth only as child of vertical/horizontal GroupContainer; LayoutGridColumnEnd, LayoutGridColumnStart, LayoutGridRowEnd, LayoutGridRowStart only as child of Grid container. None applies here. Existing buttons/screen receive only already-present OnSelect/OnVisible properties and no new enums.

## QA and Handoff
Inspect persisted file against all44 QA checks and report scope-aware evidence, repairs and N/A outcomes; do not silently redesign unrelated preexisting defects to satisfy generic creation guidance. Verify unique names, formula prefixes, exact property support, marker fit, live-input derivation and flag reset paths. Parent owns compile and live sync. Report preexisting fixed-layout/accessibility findings and Max delegation warning separately. Runtime evidence remains NOT RUN until parent tests. Preserve current user form values for visual verification; expected current stars only Order Value and Discount.

