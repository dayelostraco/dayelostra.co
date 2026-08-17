#!/usr/bin/env bash
# Recruiter panel eval — see docs/prompts/recruiter-panel.md
#
# Builds the 3-source corpus (LinkedIn + site/essays + resume), runs N samples of the
# Morgan Reyes rubric through `codex exec`, and prints per-dimension medians.
#
# Usage: scripts/recruiter-panel.sh [samples] [persona-file]
#   samples      default 3
#   persona-file default docs/prompts/recruiter-panel.md
#                (also: docs/prompts/ai-engineer-panel-{commercial,defense}.md)
set -euo pipefail

SAMPLES="${1:-3}"
PERSONA="${2:-docs/prompts/recruiter-panel.md}"
MODEL="${RECRUITER_PANEL_MODEL:-gpt-5.4}"
REPO="$(cd "$(dirname "$0")/.." && pwd)"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

command -v codex >/dev/null || { echo "codex CLI not found" >&2; exit 1; }

cd "$REPO"
echo "building site..."
npm run build >/dev/null

python3 - "$REPO" "$WORK" "$PERSONA" <<'PYEOF'
import sys, re, os, glob, html
repo, work, persona = sys.argv[1], sys.argv[2], sys.argv[3]

def strip(p):
    h = open(p, encoding='utf-8').read()
    h = re.sub(r'<(script|style|svg|noscript)\b.*?</\1>', '', h, flags=re.S | re.I)
    h = re.sub(r'<!--.*?-->', '', h, flags=re.S)
    h = re.sub(r'<[^>]+>', '\n', h)
    out = []
    for line in (l.strip() for l in h.split('\n')):
        if line and (not out or out[-1] != line):
            out.append(line)
    return html.unescape('\n'.join(out))

prompt = open(f'{repo}/{persona}' if not persona.startswith('/') else persona, encoding='utf-8').read()
# everything from the "# PROMPT" marker down is the actual prompt; the rest is runbook
prompt = prompt[prompt.index('# PROMPT'):].replace('# PROMPT\n', '', 1)

parts = [prompt, open(f'{repo}/docs/prompts/recruiter-panel-linkedin.md', encoding='utf-8').read()]
parts.append("\n\n# SOURCE — dayelostra.co home page (rendered text)\n\n" + strip(f'{repo}/dist/index.html'))
for f in sorted(glob.glob(f'{repo}/dist/insights/*/index.html')):
    parts.append(f"\n\n# SOURCE — essay: {f.split('/')[-2]}\n\n" + strip(f))
parts.append("\n\n# SOURCE — resume (source of truth, published as PDF/DOCX)\n\n"
             + open(f'{repo}/resume/Dayel_Ostraco_Resume_CAIO.md', encoding='utf-8').read())
if os.path.exists(f'{repo}/dist/llms.txt'):
    parts.append("\n\n# SOURCE — llms.txt\n\n" + open(f'{repo}/dist/llms.txt', encoding='utf-8').read())

open(f'{work}/run.md', 'w', encoding='utf-8').write('\n'.join(parts))
PYEOF

echo "running $SAMPLES samples on $MODEL ($PERSONA)..."
for i in $(seq 1 "$SAMPLES"); do
  ( cd /tmp && codex exec -m "$MODEL" --skip-git-repo-check -s read-only \
      < "$WORK/run.md" > "$WORK/out-$i.txt" 2>&1 ) &
done
wait

python3 - "$WORK" "$SAMPLES" <<'PYEOF'
import sys, json, glob, statistics as st
work, n = sys.argv[1], int(sys.argv[2])

def parse(p):
    t = open(p, encoding='utf-8', errors='replace').read()
    dec, i, objs = json.JSONDecoder(), 0, []
    while i < len(t):
        while i < len(t) and t[i] != '{':
            i += 1
        if i >= len(t):
            break
        try:
            o, j = dec.raw_decode(t, i)
        except Exception:
            i += 1
            continue
        if isinstance(o, dict) and 'scores' in o:
            objs.append(o)
        i = j
    return objs[-1] if objs else None

runs = [r for r in (parse(p) for p in sorted(glob.glob(f'{work}/out-*.txt'))) if r]
if not runs:
    print("no parseable results; inspect", work)
    raise SystemExit(1)

dims = list(runs[0]['scores'])
print(f"\n{'dimension':<28}{'median':>8}  samples")
for d in dims:
    v = [r['scores'][d]['score'] for r in runs]
    print(f"{d:<28}{st.median(v):>8}  {v}")
ov = [r['overall'] for r in runs]
print(f"{'OVERALL':<28}{st.median(ov):>8}  {ov}")
print("verdicts:", [r['verdict'] for r in runs])

worst = min(dims, key=lambda d: st.median([r['scores'][d]['score'] for r in runs]))
print(f"\nweakest dimension: {worst}")
print(runs[0]['scores'][worst]['why'])
print("\ntop fixes (first sample):")
for f in runs[0].get('highest_leverage_fixes', []):
    print(f"  +{f['estimated_points']} [{f['dimension_moved']}] {f['fix']}")
PYEOF
