#!/usr/bin/env bash
# Deploy Front Office to briancsmith.org/fanbase/frontoffice/ via FTP.
# Lives in the Fanbase repo's frontoffice/ folder and shares its FTP
# credentials (Keychain service "fanbase-ftp"). Fanbase's own deploy skips
# frontoffice/ on the host, so the two sites deploy independently.
# Reads frontoffice/.env only, never the Fanbase root .env.
# Usage: npm run frontoffice:deploy [-- --dry-run]   (from the repo root)
#        npm run deploy [-- --dry-run]               (from frontoffice/)
set -euo pipefail
cd "$(dirname "$0")/.."

KEYCHAIN_SERVICE="fanbase-ftp"
LIVE_URL="https://www.briancsmith.org/fanbase/frontoffice/"
DRY_RUN=""

kc_get() { security find-generic-password -s "$KEYCHAIN_SERVICE" -a "$1" -w 2>/dev/null || true; }
kc_set() { security add-generic-password -U -s "$KEYCHAIN_SERVICE" -a "$1" -w "$2" >/dev/null; }

case "${1:-}" in
  --dry-run) DRY_RUN="--dry-run" ;;
esac

command -v lftp >/dev/null || { echo "lftp not found — brew install lftp" >&2; exit 1; }

[[ -f .env ]] && { set -a; source .env; set +a; }
REMOTE_DEPLOY_PATH="${REMOTE_DEPLOY_PATH:-./frontoffice/}"
FTP_SERVER="${FTP_SERVER:-$(kc_get server)}"
FTP_USERNAME="${FTP_USERNAME:-$(kc_get username)}"
FTP_PASSWORD="${FTP_PASSWORD:-$(kc_get password)}"

PROMPTED=""
[[ -n "$FTP_SERVER" ]]   || { read -rp "FTP server: " FTP_SERVER; PROMPTED=1; }
[[ -n "$FTP_USERNAME" ]] || { read -rp "FTP username: " FTP_USERNAME; PROMPTED=1; }
[[ -z "$FTP_PASSWORD" ]] && { read -rsp "FTP password: " FTP_PASSWORD; echo; PROMPTED=1; }

npm run smoke

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

[[ -n "$PROMPTED" ]] && {
  kc_set server "$FTP_SERVER"
  kc_set username "$FTP_USERNAME"
  kc_set password "$FTP_PASSWORD"
  echo "Saved FTP credentials to Keychain."
}

[[ -z "$DRY_RUN" ]] && {
  echo "Deployed. Checking live site..."
  STATUS="$(curl -sS -o /dev/null -w '%{http_code}' "$LIVE_URL")"
  echo "$LIVE_URL -> $STATUS"
  [[ "$STATUS" == "200" ]] || { echo "Live site did not return 200" >&2; exit 1; }
}
