import json, re, subprocess
from pathlib import Path

root = Path(__file__).resolve().parent.parent
before = json.loads((root / 'required-field-review/before.json').read_text())
after = json.loads(subprocess.check_output(['ruby', '-ryaml', '-rjson', '-e', 'puts JSON.generate(YAML.load_file(ARGV[0]))', str(root / 'required-field-feedback/Screen1.pa.yaml')]))

def controls(node):
    result = {}
    for entry in node.get('Children', []):
        for name, body in entry.items():
            result[name] = body
            result.update(controls(body))
    return result

b, a = (controls(x['Screens']['Screen1']) for x in (before, after))
assert set(b) <= set(a), 'Existing control removed'
added = set(a) - set(b)
assert len(added) == 6 and all(a[n]['Control'] == 'Label' for n in added)
fields = {'ProjName': 'ProjName.Text', 'Application': 'Application.Text', 'BU': 'BU.Selected.BU', 'ComboBox1': 'ComboBox1.Selected.CutomerName', 'DataCardValue10': 'DataCardValue10.Text', 'DataCardValue15': 'DataCardValue15.Text'}
events = {'Button1', 'btnModeNew', 'btnModeExist', 'Button4'}
allowed = {n: {'BorderColor', 'HoverBorderColor', 'FocusedBorderColor', 'AccessibleLabel'} for n in fields}
allowed.update({n: {'OnSelect'} for n in events})
changes = []
for n in b:
    assert {k:v for k,v in b[n].items() if k not in ('Properties','Children')} == {k:v for k,v in a[n].items() if k not in ('Properties','Children')}
    for k in set(b[n].get('Properties', {})) | set(a[n].get('Properties', {})):
        old, new = b[n].get('Properties', {}).get(k), a[n].get('Properties', {}).get(k)
        if old != new:
            assert k in allowed.get(n, set()), f'Unexpected change {n}.{k}'
            changes.append(f'{n}.{k}')
    assert [next(iter(x)) for x in b[n].get('Children', [])] == [next(iter(x)) for x in a[n].get('Children', []) if next(iter(x)) not in added], f'Hierarchy changed {n}'

def strip_flag(s):
    s = re.sub(r'UpdateContext\(\{\s*varSubmitAttempted:\s*(?:true|false)\s*\}\);?', '', s)
    s = re.sub(r'varSubmitAttempted:\s*(?:true|false)\s*,?', '', s)
    s = re.sub(r',\s*}', '}', s)
    return re.sub(r'\s+', '', re.sub(r'//[^\n]*', '', s))

for n in events:
    assert strip_flag(b[n]['Properties']['OnSelect']) == strip_flag(a[n]['Properties']['OnSelect']), f'Business event changed {n}'
old_screen, new_screen = before['Screens']['Screen1']['Properties'], after['Screens']['Screen1']['Properties']
assert strip_flag(old_screen['OnVisible']) == strip_flag(new_screen['OnVisible'])
assert {k:v for k,v in old_screen.items() if k!='OnVisible'} == {k:v for k,v in new_screen.items() if k!='OnVisible'}
for n, field in fields.items():
    invalid = f'varIsNewMode&&varSubmitAttempted&&IsBlank({field})'
    border = re.sub(r'\s+', '', a[n]['Properties']['BorderColor'])
    assert border.startswith('=If('+invalid+',RGBA(184,0,0,1),'), n
    match = [x for x in added if re.sub(r'\s+', '', a[x]['Properties']['Visible']) == '=varIsNewMode&&IsBlank('+field+')']
    assert len(match) == 1, f'Star predicate mismatch {n}'
    assert a[match[0]]['Properties']['Text'] == '="*"'
assert 'varSubmitAttempted: true' in a['Button1']['Properties']['OnSelect']
for n in events:
    assert 'varSubmitAttempted: false' in a[n]['Properties']['OnSelect'], f'Flag not reset {n}'
assert 'varSubmitAttempted: false' in new_screen['OnVisible']
for f in ['App.pa.yaml', '_EditorState.pa.yaml']:
    assert (root/'required-field-feedback'/f).read_bytes() == (root/'required-field-review/synced-original'/f).read_bytes()
print(json.dumps({'result': 'PASS', 'original_controls': len(b), 'new_labels': sorted(added), 'changed_existing_properties': changes, 'business_formulas_equivalent_after_removing_feedback_flag': True}, indent=2))
