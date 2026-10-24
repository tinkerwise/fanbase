#!/usr/bin/env bash
# Download the feedback log written by public/feedback.php and summarize it.
# Uses the same FTP credentials as deploy.sh (.env or Keychain "fanbase-ftp");
# run `npm run deploy` once first so they're saved.
#
# Usage: npm run feedback        # saves feedback/feedback.jsonl, prints a summary
set -euo pipefail

cd "$(dirname "$0")/.."

KEYCHAIN_SERVICE="fanbase-ftp"
kc_get() { security find-generic-password -s "$KEYCHAIN_SERVICE" -a "$1" -w 2>/dev/null || true; }

if [[ -f .env ]]; then
  set -a; source .env; set +a
fi
REMOTE_DEPLOY_PATH="${REMOTE_DEPLOY_PATH:-./public_html/fanbase/}"
FTP_SERVER="${FTP_SERVER:-$(kc_get server)}"
FTP_USERNAME="${FTP_USERNAME:-$(kc_get username)}"
FTP_PASSWORD="${FTP_PASSWORD:-$(kc_get password)}"
for v in FTP_SERVER FTP_USERNAME FTP_PASSWORD; do
  [[ -n "${!v:-}" ]] || { echo "Missing $v — run npm run deploy once to save credentials" >&2; exit 1; }
done

mkdir -p feedback
export LFTP_PASSWORD="$FTP_PASSWORD"
lftp -u "$FTP_USERNAME" --env-password "$FTP_SERVER" <<LFTP_EOF
  set ssl:verify-certificate false
  set ftp:ssl-allow true
  set net:timeout 30
  set xfer:clobber on
  get -O feedback ${REMOTE_DEPLOY_PATH%/}/feedback-data/feedback.jsonl
  quit
LFTP_EOF

node -e '
const lines = require("fs").readFileSync("feedback/feedback.jsonl", "utf8").trim().split("\n").filter(Boolean);
const rows = lines.map(l => JSON.parse(l));
const n = v => rows.filter(r => r.rating === v).length;
console.log(`${rows.length} entries   👍 ${n(1)}   😐 ${n(0)}   👎 ${n(-1)}\n`);
for (const r of rows.filter(r => r.comment).slice(-20)) {
  console.log(`${r.at.slice(0, 10)}  ${["👎", "😐", "👍"][r.rating + 1]}  ${r.team || "—"}  ${r.comment}`);
}'
