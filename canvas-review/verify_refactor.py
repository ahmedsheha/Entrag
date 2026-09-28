"""Compare original and edited Power Fx contracts without executing connectors.

This is a bounded token/structure comparison, not a Power Fx runtime or compiler.
The live authoring compiler supplies syntax/type validation separately.
"""
import json
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent
TOKEN = re.compile(r'\s+|//[^\n]*|/\*[\s\S]*?\*/|"(?:[^"]|"")*"|\'(?:[^\']|\'\')*\'|[A-Za-z_]\w*|\d+(?:\.\d+)?|&&|\|\||[^\s]')


def tokens(text):
    return [s for s in TOKEN.findall(text) if not s.isspace() and not s.startswith(('//', '/*'))]


def split_top(seq, separator=','):
    parts, start, depth = [], 0, 0
    for i, t in enumerate(seq):
        if t in ('(', '{', '['):
            depth += 1
        elif t in (')', '}', ']'):
            depth -= 1
        elif t == separator and depth == 0:
            parts.append(seq[start:i])
            start = i + 1
    parts.append(seq[start:])
    return parts


def calls(seq, name):
    found = []
    for i in range(len(seq) - 1):
        if seq[i:i + 2] != [name, '(']:
            continue
        depth = 1
        for j in range(i + 2, len(seq)):
            depth += (seq[j] == '(') - (seq[j] == ')')
            if depth == 0:
                found.append(split_top(seq[i + 2:j]))
                break
        else:
            raise AssertionError('Unbalanced call: ' + name)
    return found


def record(seq):
    assert seq[0] == '{' and seq[-1] == '}'
    result = {}
    for field in split_top(seq[1:-1]):
        assert field[1] == ':'
        assert field[0] not in result
        result[field[0]] = field[2:]
    return result


def controls(doc):
    found = {}
    def walk(name, node):
        found[name] = node
        for child in node.get('Children', []):
            for k, v in child.items():
                walk(k, v)
    for name, node in doc['Screens'].items():
        walk(name, node)
    return found


before = controls(json.loads((ROOT / 'screen-original.json').read_text()))
after = controls(json.loads((ROOT / 'screen-after.json').read_text()))
assert before.keys() == after.keys()
old = tokens(before['Button1']['Properties']['OnSelect'])
new = tokens(after['Button1']['Properties']['OnSelect'])
proofs = []


def check(name, condition):
    assert condition, name
    proofs.append({'check': name, 'result': 'PASS'})


check('Six-field new-only validation and invalid-submit message are identical', calls(old, 'If')[0][:2] == calls(new, 'If')[0][:2])
old_set = calls(old, 'Set')
time = record(calls(new, 'With')[0][0])
check('Timestamp expression preserved once, global replaced by local scope', len(old_set) == 1 and not calls(new, 'Set') and old_set[0][1] == time['submissionTime'] and len(calls(new, 'Now')) == 1)
check('Sequence aggregation and fallback unchanged', calls(old, 'Max') == calls(new, 'Max') and calls(old, 'Coalesce') == calls(new, 'Coalesce'))
next_record = record(calls(new, 'With')[1][0])
next_if = calls(next_record['NextNumber'], 'If')[0]
check('Sequence query remains create-only', len(next_if) == 2 and next_if[0] == ['isNewSubmission'] and time['isNewSubmission'] == ['varIsNewMode'] and next_if[1] == record(calls(old, 'With')[0][0])['NextNumber'])
common = record(record(calls(new, 'With')[2][0])['submission'])
common = {k: ['varAdjustedTime' if t == 'submissionTime' else t for t in v] for k, v in common.items()}
old_patch, new_patch = calls(old, 'Patch'), calls(new, 'Patch')
check('Same two Patch branches and base-record expressions', len(old_patch) == len(new_patch) == 2 and all(a[:2] == b[:2] for a, b in zip(old_patch, new_patch)))
new_create = {**record(new_patch[0][2]), **common}
check('All 18 create fields and value expressions preserved', len(new_create) == 18 and record(old_patch[0][2]) == new_create and new_patch[0][3] == ['submission'])
check('All 16 update fields preserved; quote/customer/unrelated fields still omitted', len(common) == 16 and record(old_patch[1][2]) == common and new_patch[1][2] == ['submission'] and not {'Quote_No', 'Quote_Seq', "'Customer Name'"} & common.keys())
check('Email recipient, subject, body, and options unchanged', calls(old, 'SendEmailV2') == calls(new, 'SendEmailV2'))
new_branch = calls(new, 'If')[-1]
check('One create-only email after Patch; none on update branch', new_branch[0] == ['isNewSubmission'] and len(calls(new_branch[1], 'SendEmailV2')) == 1 and not calls(new_branch[2], 'SendEmailV2') and new_branch[1].index('Patch') < new_branch[1].index('SendEmailV2'))
check('Refresh, cleanup, reset pulse, and success notification order unchanged', old[old.index('Refresh'):] == new[new.index('Refresh'):])
check('SubmissionTime and submission names do not collide with controls', not {'submissionTime', 'submission', 'NextNumber', 'isNewSubmission'} & before.keys())

old_search = tokens(before['Button2']['Properties']['OnSelect'])
new_search = tokens(after['Button2']['Properties']['OnSelect'])
check('Search refresh remains before empty-selection guard', new_search[:7] == old_search[:7] and new_search[:7] == ['=', 'Refresh', '(', 'SalesTracker', ')', ';', 'If'])
check('Empty search guard and notification unchanged', calls(old_search, 'If')[0][:2] == calls(new_search, 'If')[0][:2])
check('All three LookUp source/predicate pairs unchanged and in same priority order', calls(old_search, 'LookUp') == calls(new_search, 'LookUp') and len(calls(new_search, 'LookUp')) == 3)
old_choice = calls(old_search, 'If')[1]
new_choice = calls(new_search, 'If')[1]
check('Quote/project/PO conditions unchanged, including all multi-selection combinations', old_choice[::2] == new_choice[::2] and len(old_choice) == len(new_choice) == 6)
for i in (1, 3, 5):
    old_assignment = record(calls(old_choice[i], 'UpdateContext')[0][0])
    check('Selected lookup result assigned without changing branch ' + str((i + 1) // 2), old_assignment['varCurrentRecord'] == new_choice[i])
check('Found/not-found behavior and messages unchanged', calls(old_search, 'If')[-1] == calls(new_search, 'If')[-1])
check('Exactly one selected-record assignment plus the existing visibility assignment', len(calls(new_search, 'UpdateContext')) == 2)
check('Obsolete block comments and their stale references removed from both events', '/*' not in after['Button1']['Properties']['OnSelect'] + after['Button2']['Properties']['OnSelect'] and 'Form1' not in new and 'DataCardKey15' not in new)
check('All other controls and properties unchanged', all(before[n] == after[n] for n in before if n not in ('Screen1', 'ContainerSearch', 'Button1', 'Button2')) and all({k: v for k, v in before[n]['Properties'].items() if k != 'OnSelect'} == {k: v for k, v in after[n]['Properties'].items() if k != 'OnSelect'} for n in ('Button1', 'Button2')))

result = {'kind': 'Static structural conformance, not runtime execution', 'passed': len(proofs), 'checks': proofs, 'runtime_mutations': 'NOT RUN'}
(ROOT / 'refactor-validation.json').write_text(json.dumps(result, indent=2) + '\n')
print(json.dumps(result, indent=2))
