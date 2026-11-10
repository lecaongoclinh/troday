const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "../dist");
const port = Number(process.env.PORT || 8082);
if (!fs.existsSync(path.join(root, "index.html")))
  throw new Error("Run npm run build:web first");
http
  .createServer((req, res) => {
    let pathname;
    try {
      pathname = decodeURIComponent(
        new URL(req.url, "http://localhost").pathname,
      );
    } catch {
      return res.writeHead(400).end();
    }
    const target = path.resolve(root, "." + pathname),
      relative = path.relative(root, target);
    if (relative.startsWith("..") || path.isAbsolute(relative))
      return res.writeHead(403).end();
    const file =
      fs.existsSync(target) && fs.statSync(target).isFile()
        ? target
        : path.join(root, "index.html");
    const mime =
      {
        ".html": "text/html; charset=utf-8",
        ".js": "text/javascript",
        ".css": "text/css",
        ".ttf": "font/ttf",
        ".png": "image/png",
        ".json": "application/json",
      }[path.extname(file)] || "application/octet-stream";
    res.setHeader("Content-Type", mime);
    fs.createReadStream(file).pipe(res);
  })
  .listen(port, "127.0.0.1", () =>
    console.log(`Trọday React Native Web preview: http://localhost:${port}`),
  );
