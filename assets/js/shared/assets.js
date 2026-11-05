/* LoL·TFT 공통 기본 챔피언 초상화 경로 관리. 파일 설명: docs/files/js/shared/assets.js.md */
/* LoL과 TFT에서 Riot 챔피언 ID로 기본 초상화를 공유합니다. TFT 스킨은 TFT 메타데이터에서 관리합니다. */
(() => {
  "use strict";
  const patch = "16.9";
  // 기본 초상화는 champion-{Riot ID}.png 규칙으로 저장합니다.
  // alternate 파일은 보존용이며 기본 경로로 자동 선택하지 않습니다.
  const localPortraitIds = new Set([
    3, 17, 22, 31, 33, 37, 39, 43, 44, 50, 51, 53, 57, 59, 75, 78, 82, 84, 86,
    92, 98, 99, 103, 114, 127, 145, 157, 200, 202, 203, 222, 233, 266, 267, 360,
    420, 432, 498, 516, 875, 887, 893, 895,
  ]);
  const remoteRoot = `https://raw.communitydragon.org/${patch}/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons`;

  // 로컬 초상화를 우선 사용하고 없으면 고정 패치의 원격 경로를 반환합니다.
  function championPortrait(championId) {
    const id = Number(championId);
    if (!Number.isSafeInteger(id) || id <= 0) return null;
    return localPortraitIds.has(id)
      ? `${document.baseURI}assets/shared/champions/champion-${id}.png`
      : `${remoteRoot}/${id}.png`;
  }

  window.GAME_ASSETS = Object.freeze({ championPortrait });
})();
