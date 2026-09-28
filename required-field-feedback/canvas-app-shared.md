# Canvas App Shared Plan

## Aesthetic Direction
Preserve the existing sales entry app. Only validation feedback changes.

## Visual Contract
Existing navy label/border RGBA(0,18,107,1), blue accent RGBA(56,96,178,1), white form, Open Sans typography remain. Error feedback uses RGBA(184,0,0,1); stars use Font.'Open Sans', FontWeight.Bold, Size14, transparent Fill, zero padding. Red stars supplement asterisk meaning; the existing error banner carries text meaning. Existing input accessibility remains unchanged.

## Layout Strategy
Preserve existing ManualLayout and all existing geometry. No responsive conversion or control reparenting. New stars are noninteractive, TabIndex=-1, width18, height inherited from adjacent label. Existing app narrow-width limitations remain outside scope.

## Named State
New screen context Boolean varSubmitAttempted, false initially and on New/Exist/Reset/save cleanup; true only in the existing invalid-submit branch. Derive validity directly from live input values with exact original IsBlank tests; do not create per-input flags, collections, named formulas, OnChange handlers, global variables or data caches.

## Control Naming
Existing names immutable. This single screen receives prefix Req after control abbreviation: lblReqProjectName, lblReqApplication, lblReqBU, lblReqEndUser, lblReqOrderValue, lblReqDiscount. Verified absent from synced source.

## Cross-Screen Contracts
None; app has one screen. App.pa.yaml and _EditorState.pa.yaml are unchanged.

## YAML Conventions
Every property formula starts =. Use |- for multiline formulas and quote scalar expressions containing colon-space. Preserve exact Control creation keywords. No Variant on Label or the three classic input types. Quote existing names containing spaces in Power Fx references. Preserve unrelated formatting and formulas as much as possible.

