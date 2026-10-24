#!/usr/bin/env bash
# Local deploy: build, smoke-test, and mirror dist/ to the host over FTP.
# Same host and approach as Yard Report and Tailgate (the host firewall
# blocks GitHub Actions runner IPs, so CI only builds).
#
# Requires lftp (brew install lftp). FTP_SERVER, FTP_USERNAME and
# FTP_PASSWORD come from .env or the macOS Keychain (service
# "fanbase-ftp"). Anything missing is prompted for once and saved to
# the Keychain after a successful upload, so later runs don't ask.
#
# REMOTE_DEPLOY_PATH defaults to "./public_html/fanbase/"; override it in
# .env if the FTP account is rooted elsewhere.
#
# Usage: npm run deploy                 # build, verify, upload
#        npm run deploy -- --dry-run    # show what would change, upload nothing
#        npm run deploy -- --forget     # remove saved Keychain credentials
set -euo pipefail

cd "$(dirname "$0")/.."

KEYCHAIN_SERVICE="fanbase-ftp"
LIVE_URL="https://www.briancsmith.org/fanbase/"
DRY_RUN=""

kc_get() { security find-generic-password -s "$KEYCHAIN_SERVICE" -a "$1" -w 2>/dev/null || true; }
kc_set() { security add-generic-password -U -s "$KEYCHAIN_SERVICE" -a "$1" -w "$2" >/dev/null; }

case "${1:-}" in
  --dry-run) DRY_RUN="--dry-run" ;;
  --forget)
    for a in server username password; do
      security delete-generic-password -s "$KEYCHAIN_SERVICE" -a "$a" >/dev/null 2>&1 || true
    done
    echo "Removed saved FTP credentials from Keychain."
    exit 0 ;;
esac

command -v lftp >/dev/null || { echo "lftp not found — brew install lftp" >&2; exit 1; }

if [[ -f .env ]]; then
  set -a; source .env; set +a
fi
REMOTE_DEPLOY_PATH="${REMOTE_DEPLOY_PATH:-./public_html/fanbase/}"
FTP_SERVER="${FTP_SERVER:-$(kc_get server)}"
FTP_USERNAME="${FTP_USERNAME:-$(kc_get username)}"
FTP_PASSWORD="${FTP_PASSWORD:-$(kc_get password)}"

# Prompt for anything still missing (password input is hidden).
PROMPTED=""
[[ -n "$FTP_SERVER" ]]   || { read -rp "FTP server: " FTP_SERVER; PROMPTED=1; }
[[ -n "$FTP_USERNAME" ]] || { read -rp "FTP username: " FTP_USERNAME; PROMPTED=1; }
if [[ -z "$FTP_PASSWORD" ]]; then
  read -rsp "FTP password: " FTP_PASSWORD; echo; PROMPTED=1
fi
for v in FTP_SERVER FTP_USERNAME FTP_PASSWORD; do
  [[ -n "${!v:-}" ]] || { echo "Missing $v" >&2; exit 1; }
done

# smoke runs the build first, then verifies the output.
npm run smoke

# iCloud Documents sync can make "name 2.ext" copies in dist/ while the
# build rewrites it, so the mirror skips any file named that way.
# Password goes through LFTP_PASSWORD so it never appears in lftp's args.
export LFTP_PASSWORD="$FTP_PASSWORD"
lftp -u "$FTP_USERNAME" --env-password "$FTP_SERVER" <<LFTP_EOF
  set ssl:verify-certificate false
  set ftp:ssl-allow true
  set net:timeout 30
  set net:max-retries 2
  mirror --reverse --delete --verbose $DRY_RUN \
    --exclude-glob .ftpquota --exclude-glob .DS_Store \
    --exclude-glob '* [0-9].*' \
    ./dist/ ${REMOTE_DEPLOY_PATH}
  quit
LFTP_EOF

# Only reached if lftp succeeded, so typos never get saved.
if [[ -n "$PROMPTED" ]]; then
  kc_set server "$FTP_SERVER"
  kc_set username "$FTP_USERNAME"
  kc_set password "$FTP_PASSWORD"
  echo "Saved FTP credentials to Keychain (\"$KEYCHAIN_SERVICE\"). Future deploys won't prompt."
fi

if [[ -z "$DRY_RUN" ]]; then
  echo "Deployed. Checking live site..."
  STATUS="$(curl -sS -o /dev/null -w '%{http_code}' "$LIVE_URL")"
  echo "$LIVE_URL -> $STATUS"
  [[ "$STATUS" == "200" ]] || { echo "Live site did not return 200" >&2; exit 1; }
fi
