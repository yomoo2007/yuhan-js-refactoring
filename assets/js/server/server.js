/* 정적 파일 제공, Riot 프록시와 응답 캐시 서버. 파일 설명: docs/files/js/server/server.js.md */
/* 실행: node assets/js/server/server.js (Node.js 20 이상, 외부 패키지 없음). Riot API 키는 서버에서만 사용합니다. */
const http = require("node:http");
const fs = require("node:fs/promises");
const { createReadStream } = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const ROOT = path.resolve(__dirname, "../../.."),
  CACHE = path.join(ROOT, ".tft-cache");
const PORT = Number(process.env.TFT_PORT || 5174);
const { projectId } = require("./project-id.js");
const PROJECT_ID = projectId(ROOT);
const REGIONS = {
  KR: { platform: "kr", regional: "asia" },
  JP: { platform: "jp1", regional: "asia" },
  NA: { platform: "na1", regional: "americas" },
  EUW: { platform: "euw1", regional: "europe" },
};
const pending = new Map();
const { ItemStats } = require("./item-stats.js");
const itemStats = new ItemStats(CACHE);

let localConfig = {};
try {
  localConfig = require("./config.js");
} catch {}
let apiKey = localConfig.TFT_API_KEY || "";
let lolApiKey = localConfig.LOL_API_KEY || "";
function send(res, status, body, headers = {}) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    ...headers,
  });
  res.end(JSON.stringify(body));
}
// 허용한 게임·지역·경로만 Riot에 전달하고 캐시 또는 합쳐진 요청 결과를 반환합니다.
async function riot(url, res, game = "tft") {
  const token = game === "lol" ? lolApiKey : apiKey;
  if (!token)
    return send(res, 503, {
      message: `${game.toUpperCase()} API 키가 설정되지 않았습니다. 서버 설정을 확인해 주세요.`,
    });
  const region = REGIONS[url.searchParams.get("region") || "KR"];
  const endpoint = url.searchParams.get("path") || "";
  const allowed =
    /^\/(?:riot\/account\/v1\/accounts\/by-riot-id\/[^/?#]+\/[^/?#]+|tft\/summoner\/v1\/summoners\/by-puuid\/[^/?#]+|tft\/league\/v1\/by-puuid\/[^/?#]+|tft\/match\/v1\/matches\/by-puuid\/[^/?#]+\/ids(?:\?start=\d+&count=\d+)?|tft\/match\/v1\/matches\/[^/?#]+)$/;
  const lolAllowed =
    /^\/(?:riot\/account\/v1\/accounts\/by-riot-id\/[^/?#]+\/[^/?#]+|lol\/summoner\/v4\/summoners\/by-puuid\/[^/?#]+)$/;
  if (!region || !(game === "lol" ? lolAllowed : allowed).test(endpoint))
    return send(res, 400, { message: "허용되지 않은 API 요청입니다." });
  const regional =
    endpoint.startsWith("/riot/") || endpoint.startsWith("/tft/match/");
  const target = `https://${regional ? region.regional : region.platform}.api.riotgames.com${endpoint}`;
  // 매치 상세는 7일 캐시하며 force=1이어도 재사용합니다. 리그·매치 목록은 60초입니다.
  const immutable = /\/tft\/match\/v1\/matches\/[^/]+$/.test(endpoint);
  const ttl = immutable
    ? 7 * 86400000
    : endpoint.includes("/league/") || endpoint.includes("/ids?")
      ? 60000
      : 3600000;
  const key = crypto
    .createHash("sha256")
    .update(game + ":" + target)
    .digest("hex");
  const file = path.join(CACHE, key + ".json");
  if (immutable || url.searchParams.get("force") !== "1") {
    try {
      const entry = JSON.parse(await fs.readFile(file, "utf8"));
      if (Date.now() - entry.savedAt < ttl) {
        if (immutable && itemStats.ingest(entry.data)) await itemStats.save();
        return send(res, 200, entry.data, { "X-TFT-Cache": "HIT" });
      }
    } catch {}
  }
  // 동일 요청은 Promise 하나를 공유하며 성공·실패 후 pending에서 제거합니다.
  if (!pending.has(key))
    pending.set(
      key,
      (async () => {
        const upstream = await fetch(target, {
          headers: { "X-Riot-Token": token },
          signal: AbortSignal.timeout(18000),
        });
        if (!upstream.ok) {
          const messages = {
            401: "Riot API 인증에 실패했습니다. 개발 키를 갱신해 주세요.",
            403: "Riot API 키가 만료되었거나 접근 권한이 없습니다.",
            404: "해당 서버에서 플레이어 또는 전적을 찾을 수 없습니다.",
            429: "Riot API 요청 한도에 도달했습니다. 잠시 후 다시 시도해 주세요.",
          };
          return {
            status: upstream.status,
            data: {
              message:
                messages[upstream.status] ||
                "Riot API 응답을 가져오지 못했습니다.",
              retryAfter: upstream.headers.get("Retry-After"),
            },
          };
        }
        const data = await upstream.json();
        if (immutable && itemStats.ingest(data)) await itemStats.save();
        await fs.mkdir(CACHE, { recursive: true });
        const temp = file + ".tmp";
        await fs.writeFile(temp, JSON.stringify({ savedAt: Date.now(), data }));
        await fs.rename(temp, file);
        return { status: 200, data };
      })().finally(() => pending.delete(key)),
    );
  const result = await pending.get(key);
  return send(res, result.status, result.data, {
    "X-TFT-Cache": "MISS",
    ...(result.data.retryAfter
      ? { "Retry-After": result.data.retryAfter }
      : {}),
  });
}
const types = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".mp4": "video/mp4",
};
// 저장된 집계와 기존 매치 캐시를 복원한 뒤 로컬 HTTP 서버를 시작합니다.
// 현재 TFT 세트에 맞는 Data Dragon 메타데이터를 공유하고 이미지 요청을 중계합니다.
const TFT_ASSET_VERSION = "16.9.1";
const TFT_ASSET_GROUPS = new Set(["tft-champion", "tft-item"]);
let assetMetadata, assetMetadataAt = 0, assetMetadataPending;
async function getTftAssets() {
  if (assetMetadata && Date.now() - assetMetadataAt < 12 * 60 * 60 * 1000) return assetMetadata;
  if (assetMetadataPending) return assetMetadataPending;
  assetMetadataPending = (async () => {
    const entries = await Promise.all([...TFT_ASSET_GROUPS].map(async (group) => {
      const response = await fetch(`https://ddragon.leagueoflegends.com/cdn/${TFT_ASSET_VERSION}/data/ko_KR/${group}.json`, { signal: AbortSignal.timeout(5000) });
      if (!response.ok) throw new Error("Data Dragon metadata unavailable");
      const json = await response.json();
      return [group, Object.fromEntries(Object.entries(json.data || {}).flatMap(([id, item]) =>
        typeof item.image?.full === "string" && /^[a-zA-Z0-9_.-]+\.png$/.test(item.image.full)
          ? [[id, `/api/tft/assets/image?${new URLSearchParams({ group, file: item.image.full })}`]] : []))];
    }));
    assetMetadata = Object.fromEntries(entries);
    assetMetadataAt = Date.now();
    return assetMetadata;
  })();
  try { return await assetMetadataPending; } finally { assetMetadataPending = null; }
}
async function sendTftImage(url, req, res) {
  const group = url.searchParams.get("group"), file = url.searchParams.get("file");
  if (!TFT_ASSET_GROUPS.has(group) || !file || !/^[a-zA-Z0-9_.-]+\.png$/.test(file))
    return send(res, 400, { message: "잘못된 이미지 요청입니다." });
  const response = await fetch(`https://ddragon.leagueoflegends.com/cdn/${TFT_ASSET_VERSION}/img/${group}/${encodeURIComponent(file)}`, { signal: AbortSignal.timeout(5000) });
  if (!response.ok) return send(res, 404, { message: "이미지를 찾을 수 없습니다." });
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length > 2 * 1024 * 1024) return send(res, 502, { message: "이미지가 너무 큽니다." });
  res.writeHead(200, { "Content-Type": "image/png", "Content-Length": bytes.length, "Cache-Control": "public, max-age=604800", "X-Content-Type-Options": "nosniff" });
  res.end(req.method === "HEAD" ? undefined : bytes);
}

async function main() {
  await itemStats.load();
  let imported = false;
  for (const file of await fs.readdir(CACHE).catch(() => [])) {
    if (!/^[a-f0-9]{64}\.json$/.test(file)) continue;
    try {
      const entry = JSON.parse(
        await fs.readFile(path.join(CACHE, file), "utf8"),
      );
      if (itemStats.ingest(entry.data)) imported = true;
    } catch {}
  }
  if (imported) await itemStats.save();
  http
    .createServer(async (req, res) => {
      try {
        const url = new URL(req.url, "http://127.0.0.1");
        if (!["GET", "HEAD"].includes(req.method))
          return send(res, 405, { message: "GET/HEAD 요청만 지원합니다." });
        if (url.pathname === "/api/tft/assets") return send(res, 200, await getTftAssets());
        if (url.pathname === "/api/tft/assets/image") return await sendTftImage(url, req, res);
        if (url.pathname === "/api/tft/item-stats")
          return send(res, 200, itemStats.snapshot());
        if (url.pathname === "/api/tft/status")
          return send(res, 200, {
            configured: Boolean(apiKey),
            set: 17,
            projectId: PROJECT_ID,
          });
        if (url.pathname === "/api/tft/riot") return await riot(url, res);
        if (url.pathname === "/api/lol/riot")
          return await riot(url, res, "lol");
        const pathname = decodeURIComponent(
          url.pathname === "/" ? "/index.html" : url.pathname,
        );
        const file = path.resolve(ROOT, "." + pathname);
        // 프로젝트 밖 경로, 숨김 파일, 서버 전용 코드와 미허용 확장자의 정적 제공을 막습니다.
        const relative = path.relative(ROOT, file);
        if (
          relative.startsWith("..") ||
          path.isAbsolute(relative) ||
          relative.split(path.sep).some((p) => p.startsWith(".")) ||
          relative
            .replaceAll("\\", "/")
            .toLowerCase()
            .startsWith("assets/js/server/") ||
          !types[path.extname(file)]
        )
          return send(res, 404, { message: "파일을 찾을 수 없습니다." });
        const stat = await fs.stat(file);
        if (!stat.isFile())
          return send(res, 404, { message: "파일을 찾을 수 없습니다." });
        const staticAsset = relative
          .replaceAll("\\", "/")
          .startsWith("assets/");
        const headers = {
          "Content-Type":
            types[path.extname(file)] +
            (path.extname(file).match(/html|css|js/) ? "; charset=utf-8" : ""),
          "Cache-Control": staticAsset ? "public, max-age=604800" : "no-cache",
          "X-Content-Type-Options": "nosniff",
          "Accept-Ranges": "bytes",
        };
        let start = 0,
          end = stat.size - 1,
          status = 200;
        // 영상 탐색을 위해 단일 바이트 범위를 지원하고 잘못된 범위는 416으로 응답합니다.
        if (req.headers.range && req.method === "GET") {
          const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
          if (!range || (!range[1] && !range[2])) {
            res.writeHead(416, { "Content-Range": `bytes */${stat.size}` });
            return res.end();
          }
          start = range[1]
            ? Number(range[1])
            : Math.max(0, stat.size - Number(range[2]));
          end =
            range[1] && range[2]
              ? Math.min(Number(range[2]), stat.size - 1)
              : stat.size - 1;
          if (
            !Number.isSafeInteger(start) ||
            !Number.isSafeInteger(end) ||
            start > end ||
            start >= stat.size
          ) {
            res.writeHead(416, { "Content-Range": `bytes */${stat.size}` });
            return res.end();
          }
          status = 206;
          headers["Content-Range"] = `bytes ${start}-${end}/${stat.size}`;
        }
        res.writeHead(status, {
          ...headers,
          "Content-Length": Math.max(0, end - start + 1),
        });
        if (req.method === "HEAD" || stat.size === 0) return res.end();
        const stream = createReadStream(file, { start, end });
        stream.on("error", () => res.destroy());
        res.on("close", () => stream.destroy());
        stream.pipe(res);
      } catch (error) {
        if (!res.headersSent)
          send(res, error.code === "ENOENT" ? 404 : 502, {
            message:
              error.code === "ENOENT"
                ? "파일을 찾을 수 없습니다."
                : "서버 연결에 실패했습니다. 잠시 후 다시 시도해 주세요.",
          });
        else res.end();
      }
    })
    .listen(PORT, "127.0.0.1", () =>
      console.log(
        `TFT Set 17 preview: http://127.0.0.1:${PORT}/pages/tft/tft.html (key configured: ${Boolean(apiKey)})`,
      ),
    );
}
main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
