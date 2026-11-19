"""Package current deployment sources, including uncommitted edits, without local secrets."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED


def main():
    root = Path(__file__).resolve().parent.parent
    destination = root / ".cache" / "deploy" / "troday-deploy.zip"
    destination.parent.mkdir(parents=True, exist_ok=True)
    files = [root / "compose.yaml", root / ".dockerignore"]
    for relative in ("BE/pom.xml", "BE/schema.sql", "FE_Web/package.json",
                     "FE_Web/package-lock.json", "FE_Web/index.html", "FE_Web/vite.config.js"):
        files.append(root / relative)
    for relative in ("BE/src", "FE_Web/src", "FE_Web/public", "FE_Web/assets"):
        directory = root / relative
        if directory.exists():
            files.extend(p for p in directory.rglob("*") if p.is_file())
    # Explicit allowlist prevents server .env, backups and private keys entering the ZIP.
    files.extend(p for p in (root / "deploy").iterdir()
                 if p.is_file() and (p.suffix in {".py", ".sh", ".Dockerfile", ".md"}
                                    or p.name in {"Caddyfile", ".env.example"}))
    with ZipFile(destination, "w", ZIP_DEFLATED) as archive:
        for path in sorted(set(files)):
            if any(part.startswith(".env") or part in {"__pycache__", "node_modules"}
                   for part in path.relative_to(root).parts) and path.name != ".env.example":
                continue
            if path.suffix.lower() in {".pem", ".key", ".p12", ".jks"} or ".private." in path.name:
                continue
            archive.write(path, "troday/" + path.relative_to(root).as_posix())
    print(destination.relative_to(root))
    print(f"Archive size: {destination.stat().st_size / 1024 / 1024:.1f} MiB")


if __name__ == "__main__":
    main()
