/* 로컬 서버의 프로젝트 폴더 식별값. 파일 설명: docs/files/js/server/project-id.js.md */
const { realpathSync } = require("node:fs");
const { createHash } = require("node:crypto");

// 실행기와 서버가 같은 실제 폴더를 가리키는지 경로 원문 노출 없이 비교합니다.
function projectId(directory) {
  const resolved = realpathSync(directory);
  const canonical =
    process.platform === "win32" ? resolved.toLowerCase() : resolved;
  return createHash("sha256").update(canonical).digest("hex");
}

module.exports = { projectId };
