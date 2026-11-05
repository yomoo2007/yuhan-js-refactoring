/* 로컬 서버 준비 확인과 브라우저 실행. 파일 설명: docs/files/js/server/start-local.js.md */
/* BAT 실행기: 로컬 서버를 백그라운드로 실행하고 브라우저에서 메인 화면을 엽니다. */
const { spawn } = require("node:child_process");
const { openSync, closeSync } = require("node:fs");
const net = require("node:net");
const path = require("node:path");
const { setTimeout: delay } = require("node:timers/promises");
const { projectId } = require("./project-id.js");

const projectRoot = path.resolve(__dirname, "../../..");
const expectedProjectId = projectId(projectRoot);
const port = Number(process.env.TFT_PORT || 5174);
const siteUrl = `http://localhost:${port}/index.html`;

// 상태 응답 형식을 확인해 같은 프로젝트 서버를 재사용할 수 있는지 판단합니다.
async function isProjectServerReady() {
  try {
    const response = await fetch(`http://127.0.0.1:${port}/api/tft/status`, {
      signal: AbortSignal.timeout(1000),
    });
    if (!response.ok) return false;
    const status = await response.json();
    return (
      status.set === 17 &&
      typeof status.configured === "boolean" &&
      status.projectId === expectedProjectId
    );
  } catch {
    return false;
  }
}

function isPortBusy() {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host: "127.0.0.1", port });
    const finish = (busy) => {
      socket.destroy();
      resolve(busy);
    };
    socket.setTimeout(1000);
    socket.once("connect", () => finish(true));
    socket.once("error", () => finish(false));
    socket.once("timeout", () => finish(true));
  });
}

// 서버를 숨김 백그라운드 프로세스로 실행하고 로그를 파일에 남깁니다.
async function startServer() {
  const output = openSync(path.join(projectRoot, ".tft-preview.log"), "a");
  const errors = openSync(
    path.join(projectRoot, ".tft-preview-error.log"),
    "a",
  );
  let server;
  try {
    server = spawn(process.execPath, [path.join(__dirname, "server.js")], {
      cwd: projectRoot,
      env: { ...process.env, TFT_PORT: String(port) },
      detached: true,
      windowsHide: true,
      stdio: ["ignore", output, errors],
    });
  } finally {
    closeSync(output);
    closeSync(errors);
  }

  let startupError;
  server.once("error", (error) => {
    startupError = error;
  });
  server.unref();
  const deadline = Date.now() + 30000;
  while (Date.now() < deadline) {
    if (startupError) throw startupError;
    if (server.exitCode !== null || server.signalCode !== null) {
      throw new Error(
        "The local server stopped. Check .tft-preview-error.log.",
      );
    }
    if (await isProjectServerReady()) return;
    await delay(250);
  }
  server.kill();
  throw new Error("Server startup timed out. Check .tft-preview-error.log.");
}

function openBrowser() {
  return new Promise((resolve, reject) => {
    // 검증된 포트 번호만 고정된 localhost 주소에 넣어 브라우저를 실행합니다.
    const browser = spawn("cmd.exe", ["/d", "/c", "start", "", siteUrl], {
      windowsHide: true,
      stdio: "ignore",
    });
    browser.once("error", reject);
    browser.once("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Open ${siteUrl} in your browser.`));
    });
  });
}

async function main() {
  if (Number(process.versions.node.split(".")[0]) < 20) {
    throw new Error("Node.js 20 or newer is required.");
  }
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("TFT_PORT must be a valid port number.");
  }
  if (!(await isProjectServerReady())) {
    if (await isPortBusy()) {
      throw new Error(
        `${port} 포트에 다른 폴더 또는 이전 버전의 서버가 실행 중입니다. 기존 서버를 종료하거나 TFT_PORT를 변경해 주세요.`,
      );
    }
    await startServer();
  }
  await openBrowser();
  console.log(`Opened ${siteUrl}`);
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
