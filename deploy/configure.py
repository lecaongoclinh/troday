"""Create server-only configuration without printing or replacing credentials."""
import argparse
import os
from pathlib import Path
import re
import secrets


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--domain", required=True, help="DNS hostname, without https://")
    args = parser.parse_args()
    domain = args.domain.strip().lower()
    if len(domain) > 253 or not re.fullmatch(
        r"(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+"
        r"[a-z](?:[a-z0-9-]{0,61}[a-z0-9])?", domain
    ):
        parser.error("Use a public DNS hostname, for example my-troday.duckdns.org")
    target = Path(__file__).resolve().parent / ".env"
    content = (
        f"APP_DOMAIN={domain}\n"
        f"MYSQL_ROOT_PASSWORD={secrets.token_hex(32)}\n"
        f"MYSQL_PASSWORD={secrets.token_hex(32)}\n"
        f"FILE_SIGNING_SECRET={secrets.token_hex(48)}\n"
        "PAPER_IMPORT_USER_IDS=\n"
        "VERIFICATION_DELIVERY_URL=\n"
        "VERIFICATION_DELIVERY_TOKEN=\n"
    )
    try:
        fd = os.open(target, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
    except FileExistsError:
        parser.exit(1, "deploy/.env already exists; edit it rather than replacing database credentials.\n")
    with os.fdopen(fd, "w", encoding="utf-8", newline="\n") as stream:
        stream.write(content)
    print("Created deploy/.env; credentials were not printed. Keep this file for future updates.")


if __name__ == "__main__":
    main()
