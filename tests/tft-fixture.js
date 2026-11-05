/* 브라우저 회귀 검사용 지연 응답. 실제 Riot API는 호출하지 않습니다. docs/TESTING.md */
(() => {
  const requests = [];
  const seasons = [];
  function profile(name, hasMore = false) {
    const sample = TFT_SAMPLE();
    return {
      account: { ...sample.account, gameName: name, tagLine: "KR1" },
      summoner: sample.summoner,
      rank: sample.rank,
      matches: sample.matches.map(({ raw }) => ({
        match: raw,
        participant: raw.info.participants.find((p) => p.puuid === sample.account.puuid),
      })),
      nextStart: 20, hasMore, failedMatchIds: [],
    };
  }
  window.TFT_API = {
    loadProfile({ gameName, options }) {
      return new Promise((resolve, reject) => {
        // 취소를 무시하는 느린 응답도 화면을 덮어쓰지 않는지 검사합니다.
        requests.push({ gameName, signal: options.signal, resolve: (hasMore = false) => resolve(profile(gameName, hasMore)), reject });
      });
    },
    loadSeason(options) {
      return new Promise((resolve) => seasons.push({ options, resolve }));
    },
  };
  window.fixture = {
    requests, seasons,
    search(name) {
      document.getElementById("riot-id").value = `${name}#KR1`;
      document.getElementById("search-form").dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
      return requests.at(-1);
    },
    navigate(search) {
      history.replaceState({}, "", `/tests/tft.html${search}`);
      dispatchEvent(new PopStateEvent("popstate"));
    },
    page(index = 1) {
      const original = profile("History").matches[0];
      const match = structuredClone(original.match);
      match.metadata.match_id += `_older_${index}`;
      match.info.game_datetime -= 30 * 86400000 + index * 60000;
      const participant = match.info.participants.find((p) => p.puuid === original.participant.puuid);
      return { matches: [{ match, participant }], failedMatchIds: [], nextStart: 20 + index, hasMore: true };
    },
  };
})();
