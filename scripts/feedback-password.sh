#!/usr/bin/env bash
# Set the password for the feedback page (public/feedback-admin.php).
# Asks for a password, hashes it locally with PBKDF2, and uploads only the
# hash to feedback-data/admin.json on the host, next to the feedback log.
# Uses the same FTP credentials as deploy.sh (.env or Keychain "fanbase-ftp");
# run `npm run deploy` once first so they're saved. Run it again to change
# the password.
#
# Usage: npm run feedback-password
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

read -rsp "New feedback page password: " PAGE_PASSWORD; echo
read -rsp "Same password again: " PAGE_PASSWORD_2; echo
[[ "$PAGE_PASSWORD" == "$PAGE_PASSWORD_2" ]] || { echo "Passwords don't match" >&2; exit 1; }
(( ${#PAGE_PASSWORD} >= 10 )) || { echo "Use at least 10 characters" >&2; exit 1; }

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
# The password reaches node through the environment, never its arguments
PAGE_PASSWORD="$PAGE_PASSWORD" node -e '
const crypto = require("crypto");
const salt = crypto.randomBytes(16);
const iterations = 210000;
const hash = crypto.pbkdf2Sync(process.env.PAGE_PASSWORD, salt, iterations, 32, "sha256");
process.stdout.write(JSON.stringify({ salt: salt.toString("base64"), iterations, hash: hash.toString("base64") }));
' > "$TMP/admin.json"
printf 'Require all denied\nDeny from all\n' > "$TMP/.htaccess"

export LFTP_PASSWORD="$FTP_PASSWORD"
lftp -u "$FTP_USERNAME" --env-password "$FTP_SERVER" <<LFTP_EOF
  set ssl:verify-certificate false
  set ftp:ssl-allow true
  set net:timeout 30
  mkdir -pf ${REMOTE_DEPLOY_PATH%/}/feedback-data
  put -O ${REMOTE_DEPLOY_PATH%/}/feedback-data $TMP/.htaccess
  put -O ${REMOTE_DEPLOY_PATH%/}/feedback-data $TMP/admin.json
  quit
LFTP_EOF

echo "Password set. Log in at https://www.briancsmith.org/fanbase/feedback-admin.php"
