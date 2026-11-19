"""Create a new admin in the deployed database. Run on the VM with sudo."""
import getpass
import hashlib
from pathlib import Path
import subprocess


def sql_text(value):
    return "CONVERT(0x" + value.encode("utf-8").hex() + " USING utf8mb4)"


def main():
    email = input("Admin email: ").strip().lower()
    name = input("Full name: ").strip()
    if not email or "@" not in email or len(email) > 150 or not name or len(name) > 150:
        raise SystemExit("Invalid email or name.")
    password = getpass.getpass("New password (at least 12 characters): ")
    if len(password) < 12:
        raise SystemExit("Password must contain at least 12 characters.")
    if password != getpass.getpass("Confirm password: "):
        raise SystemExit("Passwords do not match.")
    # Match AccountService's existing SHA-256 representation.
    password_hash = hashlib.sha256(password.encode("utf-8")).hexdigest()
    sql = (
        "START TRANSACTION;\n"
        "INSERT INTO users (email,password_hash,full_name,role,status) VALUES ("
        f"{sql_text(email)},'{password_hash}',{sql_text(name)},'ADMIN','ACTIVE');\n"
        "SET @admin_id=LAST_INSERT_ID();\n"
        "INSERT INTO admins (id) VALUES (@admin_id);\n"
        "INSERT INTO personal_profiles (user_id) VALUES (@admin_id);\n"
        "COMMIT;\nSELECT @admin_id;\n"
    )
    wrapper = str(Path(__file__).resolve().parent / "dc.sh")
    result = subprocess.run(
        ["bash", wrapper, "exec", "-T", "db", "sh", "-c",
         'MYSQL_PWD="$MYSQL_ROOT_PASSWORD" exec mysql --default-character-set=utf8mb4 --batch --skip-column-names -u root troday'],
        input=sql, text=True, encoding="utf-8", capture_output=True,
    )
    if result.returncode:
        # MySQL errors can echo SQL containing the password hash: do not print them.
        raise SystemExit("Admin creation failed. Check database health and whether the email already exists.")
    print("Created admin with id=" + result.stdout.strip() + ". Sign in on the website.")


if __name__ == "__main__":
    main()
