/* 요청 취소·캐시·서버 식별 회귀 검사. 파일 설명: docs/TESTING.md */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { createRequire } = require("node:module");
const { projectId } = require("../assets/js/server/project-id.js");
const root = path.resolve(__dirname, "../assets");
const read = (name) => fs.readFileSync(path.join(root, name), "utf8");

test("본문 수신 도중의 취소는 AbortError를 유지한다", async () => {
  const controller = new AbortController();
  const context = {
    window: {},
    URLSearchParams, REGIONDATA: { KR: { platform: "kr", regional: "asia" } }, API_KEYS: { tft: "test" },
    fetch: async () => ({
      json: async () => {
        controller.abort();
        throw controller.signal.reason;
      },
    }),
  };
  vm.runInNewContext(read("js/tft/tft-api.js"), context);
  await assert.rejects(context.window.TFT_API.fetch("/test", {
    region: "KR", signal: controller.signal,
  }), { name: "AbortError" });
});

test("취소와 무관한 잘못된 JSON에는 실행 주소 안내를 유지한다", async () => {
  const context = {
    window: {},
    URLSearchParams, REGIONDATA: { KR: { platform: "kr", regional: "asia" } }, API_KEYS: { tft: "test" },
    fetch: async () => ({
      json: async () => {
        throw new SyntaxError("invalid JSON");
      },
    }),
  };
  vm.runInNewContext(read("js/tft/tft-api.js"), context);
  await assert.rejects(
    context.window.TFT_API.fetch("/test"),
    /start-local\.bat/,
  );
});

test("프로필 조회가 지역과 취소 신호를 모든 API 요청에 전달한다", async () => {
  const controller = new AbortController();
  const calls = [];
  const context = { window: {}, URLSearchParams, REGIONDATA: { JP: { platform: "jp1", regional: "asia" } }, API_KEYS: { tft: "test" }, fetch: async (url, options) => {
    calls.push({ url, signal: options.signal, headers: options.headers });
    const path = new URL(url).pathname + new URL(url).search;
    const data = path.startsWith("/riot/account/") ? { puuid: "player" } :
      path.includes("/ids?") || path.includes("/league/") ? [] : {};
    return { ok: true, json: async () => data };
  }};
  vm.runInNewContext(read("js/tft/tft-api.js"), context);
  const result = await context.window.TFT_API.loadProfile({ gameName: "name", tagLine: "tag", options: { region: "JP", signal: controller.signal } });
  assert.equal(result.account.puuid, "player");
  assert.equal(calls.length, 4);
  assert.ok(calls.every(({ url, signal, headers }) => url.startsWith("http://prestigelulu.com:3000/") && signal === controller.signal && headers["X-Riot-Token"] === "test"));
  assert.deepEqual(calls.map(({ url, headers }) => [new URL(url).pathname.includes("/match/") || new URL(url).pathname.startsWith("/riot/") ? "asia" : "jp1", headers.region]).map(([expected, actual]) => expected === actual), [true, true, true, true]);
});

function worker({ failure, hit = false, offline = false } = {}) {
  const handlers = {};
  const response = {
    ok: true,
    type: "basic",
    clone() {
      return this;
    },
  };
  let networkCalls = 0;
  const fail = () => {
    throw new DOMException("unavailable", "QuotaExceededError");
  };
  vm.runInNewContext(read("../tests/tft-sw.js"), {
    URL,
    self: {
      location: { origin: "http://localhost" },
      addEventListener(type, handler) {
        handlers[type] = handler;
      },
      clients: { async claim() {} },
    },
    caches: {
      async keys() {
        if (failure === "keys") fail();
        return [];
      },
      async open() {
        if (failure === "open") fail();
        return {
          async match() {
            if (failure === "match") fail();
            return hit ? response : undefined;
          },
          async put() {
            if (failure === "put") fail();
          },
        };
      },
    },
    fetch: async () => {
      networkCalls++;
      if (offline) throw new TypeError("offline");
      return response;
    },
  });
  return {
    response,
    get networkCalls() {
      return networkCalls;
    },
    load() {
      let pending;
      handlers.fetch({
        request: {
          method: "GET",
          url: "http://localhost/assets/data/tft/tft-set17-data.js",
          destination: "script",
        },
        respondWith(value) {
          pending = value;
        },
      });
      return pending;
    },
    activate() {
      let pending;
      handlers.activate({
        waitUntil(value) {
          pending = value;
        },
      });
      return pending;
    },
  };
}

for (const failure of ["open", "match", "put"]) {
  test(`캐시 ${failure} 실패에도 네트워크 응답을 반환한다`, async () => {
    const instance = worker({ failure });
    assert.equal(await instance.load(), instance.response);
    assert.equal(instance.networkCalls, 1);
  });
}
test("캐시 정리 실패가 워커 활성화를 막지 않는다", async () => {
  await worker({ failure: "keys" }).activate();
});
test("오프라인에서도 저장된 응답을 사용한다", async () => {
  const instance = worker({ hit: true, offline: true });
  assert.equal(await instance.load(), instance.response);
  assert.equal(instance.networkCalls, 0);
});
test("저장된 값 없이 네트워크까지 실패하면 오류를 전달한다", async () => {
  await assert.rejects(worker({ offline: true }).load(), /offline/);
});

test("실제 같은 폴더만 같은 프로젝트 식별값을 갖는다", () => {
  assert.equal(projectId(root), projectId(path.join(root, "js", "..")));
  assert.notEqual(projectId(root), projectId(path.join(root, "js")));
});
for (const [label, identity, expected] of [
  ["현재 폴더", projectId(path.dirname(root)), true],
  ["다른 폴더", projectId(path.join(root, "js")), false],
  ["이전 서버", undefined, false],
]) {
  test(`실행기의 서버 재사용 판정: ${label}`, async () => {
    const filename = path.join(root, "js/server/start-local.js");
    const context = vm.createContext({
      require: createRequire(filename),
      module: { exports: {} },
      __dirname: path.dirname(filename),
      process,
      AbortSignal,
      fetch: async () => ({
        ok: true,
        json: async () => ({ set: 17, configured: true, projectId: identity }),
      }),
    });
    vm.runInContext(read("js/server/start-local.js"), context);
    assert.equal(
      await vm.runInContext("isProjectServerReady()", context),
      expected,
    );
  });
}

test("서버 상태는 실제 프로젝트 식별값을 반환하고 서버 소스는 숨긴다", async () => {
  let handler;
  const filename = path.join(root, "js/server/server.js");
  const originalRequire = createRequire(filename);
  const context = vm.createContext({
    __dirname: path.dirname(filename),
    process,
    URL,
    console: { log() {}, error() {} },
    require(name) {
      if (name === "node:http")
        return {
          createServer(callback) {
            handler = callback;
            return { listen() {} };
          },
        };
      if (name === "node:fs/promises")
        return {
          async readdir() {
            return [];
          },
        };
      if (name === "./config.js") return {};
      if (name === "./item-stats.js")
        return {
          ItemStats: class {
            async load() {}
          },
        };
      return originalRequire(name);
    },
  });
  vm.runInContext(read("js/server/server.js"), context);
  await new Promise(setImmediate);
  assert.equal(typeof handler, "function");
  async function request(url) {
    let status, body;
    await handler(
      { url, method: "GET" },
      {
        writeHead(value) {
          status = value;
        },
        end(value) {
          body = JSON.parse(value);
        },
      },
    );
    return { status, body };
  }
  const result = await request("/api/tft/status");
  assert.equal(result.status, 200);
  assert.equal(result.body.projectId, projectId(path.dirname(root)));
  assert.equal(result.body.configured, false);
  assert.deepEqual(Object.keys(result.body).sort(), [
    "configured",
    "projectId",
    "set",
  ]);
  assert.equal((await request("/assets/js/server/project-id.js")).status, 404);
});
