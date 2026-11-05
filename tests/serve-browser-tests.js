/* 브라우저 회귀 검사 전용 서버. 실제 Riot API·개인 설정은 사용하지 않습니다. docs/TESTING.md */
const http = require("node:http");
const fs = require("node:fs/promises");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const port = Number(process.env.TEST_PORT || 5185);
const types = { ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml" };
http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, "http://localhost");
    res.setHeader("Cache-Control", "no-store");
    if (url.pathname === "/") {
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      return res.end('<!doctype html><html lang="ko"><meta charset="utf-8"><title>TFT 회귀 검사</title><style>body{font:16px/1.7 system-ui;padding:30px;max-width:900px}iframe{position:fixed;left:-10000px;width:1200px;height:900px}li{margin:12px 0}h1{font-size:24px}</style><h1>TFT 브라우저 회귀 검사</h1><p id="status">검사 중…</p><ul id="results"></ul><iframe id="app" title="검사 대상 TFT 화면"></iframe><script src="/tests/browser-regressions.js"></script></html>');
    }
    if (url.pathname === "/api/tft/item-stats") {
      res.setHeader("Content-Type", "application/json");
      return res.end(JSON.stringify({ set: 17, matches: 0, champions: {} }));
    }
    if (url.pathname === "/tests/tft.html") {
      const html = (await fs.readFile(path.join(root, "pages/tft/tft.html"), "utf8"))
        .replace("<head>", '<head><base href="/">')
        .replace('<script src="./assets/js/tft/tft.js"', '<script src="/tests/tft-sample.js" defer></script><script src="/tests/tft-fixture.js" defer></script><script src="./assets/js/tft/tft.js"');
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      return res.end(html);
    }
    const file = path.resolve(root, "." + decodeURIComponent(url.pathname));
    const relative = path.relative(root, file).replaceAll("\\", "/");
    if (relative.startsWith("..") || path.isAbsolute(relative) || relative.split("/").some((p) => p.startsWith(".")) || relative.startsWith("js/server/") || !types[path.extname(file)]) {
      res.writeHead(404); return res.end();
    }
    res.setHeader("Content-Type", types[path.extname(file)]);
    return res.end(await fs.readFile(file));
  } catch {
    res.writeHead(404); res.end();
  }
}).listen(port, "127.0.0.1", () => console.log(`Browser regression tests: http://localhost:${port}/`));
