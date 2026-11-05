/* 브라우저에 랭크 기록을 저장하고 서비스 워커 등록 */
(() => {
  "use strict";
  function key(puuid) {
    return `tft:set17:rank:${puuid}`;
  }

  // 예전 저장 방식도 읽어서 현재 세트 형식으로 맞춤
  function readRanks(puuid) {
    try {
      const saved = JSON.parse(
        localStorage.getItem(key(puuid)) ||
          localStorage.getItem(`tft:current:rank:${puuid}`) ||
          "[]",
      );

      return Array.isArray(saved)
        ? saved
            .filter((r) => r.season === "set17" || r.season === "current")
            .map((r) => ({ ...r, season: "set17" }))
        : [];
    } catch {
      return [];
    }
  }

  // 같은 날짜는 마지막 조회값으로 교체하고 조회 안 한 날은 비워둠
  function recordRank(puuid, rank) {
    if (!rank) return readRanks(puuid);

    const snapshot = {
      at: new Date().toISOString(),
      season: "set17",
      queue: "RANKED_TFT",
      tier: rank.tier,
      rank: rank.rank,
      leaguePoints: rank.leaguePoints,
    };
    const current = readRanks(puuid),
      day = window.TFT_RANK.dayKey(snapshot.at);
    const records = [
      ...current.filter((item) => window.TFT_RANK.dayKey(item.at) !== day),
      snapshot,
    ];

    try {
      localStorage.setItem(key(puuid), JSON.stringify(records));
    } catch {}

    return records;
  }

  if ("serviceWorker" in navigator && location.protocol !== "file:")
    navigator.serviceWorker
      .register("../../../tests/tft-sw.js")
      .catch(() => {});

  window.TFT_STORE = { readRanks, recordRank };
})();
