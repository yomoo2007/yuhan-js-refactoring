/* TFT 프로필, 매치, 시즌 기록 요청 */
/* LoL과 동일한 개인 서버를 통해 Riot API를 호출 */
(() => {
  "use strict";
  // LoL과 같은 개인 서버에 TFT 요청을 전달합니다.
  async function tftFetch(path, { region = "KR", signal } = {}) {
      const regionData = REGIONDATA[region.toUpperCase()];
      if (!regionData) throw new Error("지원하지 않는 지역입니다.");
      const regional = path.startsWith("/riot/account/") || path.startsWith("/tft/match/");
      const response = await fetch(`http://prestigelulu.com:3000${path}`, {
        signal,
        headers: {
          "X-Riot-Token": API_KEYS.tft,
          region: regional ? regionData.regional : regionData.platform,
        },
      });
      let data;

      try {
        data = await response.json();
      } catch (error) {
        // 응답을 읽다가 취소된 경우에도 취소 오류를 그대로 전달
        signal?.throwIfAborted();

        if (error.name === "AbortError") throw error;

        throw new Error(
          "실제 전적 검색은 프로젝트의 start-local.bat 파일로 실행한 사이트에서 사용할 수 있습니다.",
        );
      }

      // 서버가 보낸 상태 코드와 재시도 시간을 오류에 담아 전달
      if (!response.ok) {
        const error = new Error(data.message || "전적을 가져오지 못했습니다.");

        error.status = response.status;
        error.retryAfter = Number(data.retryAfter) || 1;
        error.kind =
          response.status === 404 &&
          /^\/(riot\/account|tft\/summoner)\//.test(path)
            ? "not-found"
            : "error";

        throw error;
      }

      return data;
  }

  // 매치 상세는 4개씩 조회하고 실패한 매치 ID는 따로 보관
  async function details(ids, puuid, request) {
    const matches = [];
    const failedMatchIds = [];

    for (let i = 0; i < ids.length; i += 4) {
      const batch = ids.slice(i, i + 4);
      // 하나가 실패해도 나머지 경기 결과는 받기 위해 각각 확인
      const results = await Promise.allSettled(
        batch.map((id) =>
          request(`/tft/match/v1/matches/${encodeURIComponent(id)}`),
        ),
      );
      const interrupted = results.find(
        (result) =>
          result.status === "rejected" &&
          (result.reason?.name === "AbortError" ||
            result.reason?.status === 429),
      );

      if (interrupted) throw interrupted.reason;

      results.forEach((result, index) => {
        if (result.status === "fulfilled") {
          const match = result.value;
          const participant = match?.info?.participants?.find(
            (p) => p.puuid === puuid,
          );

          if (participant) matches.push({ match, participant });
          else failedMatchIds.push(batch[index]);
        } else {
          failedMatchIds.push(batch[index]);
        }
      });
    }

    return { matches, failedMatchIds };
  }

  // 매치 목록과 상세를 가져오고 다음 조회 위치를 계산
  async function loadPage({ puuid, start = 0, count = 20, options = {} }) {
    const request = (path) => tftFetch(path, options);
    if (
      !Number.isInteger(start) ||
      start < 0 ||
      !Number.isInteger(count) ||
      count < 1 ||
      count > 100
    )
      throw new Error("전적 범위를 확인해 주세요.");

    const ids = await request(
      `/tft/match/v1/matches/by-puuid/${encodeURIComponent(puuid)}/ids?start=${start}&count=${count}`,
    );

    if (!Array.isArray(ids))
      throw new Error("매치 목록 형식이 올바르지 않습니다.");

    return {
      ...(await details(ids, puuid, request)),
      nextStart: start + ids.length,
      hasMore: ids.length === count,
    };
  }

  // PUUID를 구한 뒤 소환사, 랭크, 첫 매치 목록을 같이 가져옴
  async function loadProfile({ gameName, tagLine, options = {} }) {
    const request = (path) => tftFetch(path, options);
    if (!gameName?.trim() || !tagLine?.trim())
      throw new Error("Riot ID와 태그가 필요합니다.");

    // Riot ID로 플레이어를 찾을 때 사용하는 고유 ID를 먼저 가져옴
    const account = await request(
      `/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName.trim())}/${encodeURIComponent(tagLine.trim())}`,
    );

    if (!account?.puuid)
      throw new Error(
        "플레이어 응답이 올바르지 않습니다. 잠시 후 다시 시도해 주세요.",
      );

    const puuid = encodeURIComponent(account.puuid);
    const [summoner, leagues, page] = await Promise.all([
      request(`/tft/summoner/v1/summoners/by-puuid/${puuid}`),
      request(`/tft/league/v1/by-puuid/${puuid}`),
      loadPage({ puuid: account.puuid, options }),
    ]);

    if (!Array.isArray(leagues))
      throw new Error("랭크 정보 형식이 올바르지 않습니다.");

    return {
      account,
      summoner,
      leagues,
      rank: leagues.find((entry) => entry.queueType === "RANKED_TFT") || null,
      ...page,
    };
  }

  // 다른 세트가 나와도 남은 경기 기록을 끝까지 조회
  async function loadSeason({
    puuid,
    start = 0,
    hasMore = true,
    failedMatchIds = [],
    options = {},
    signal,
    onPage = () => {},
  }) {
    const request = (path) => tftFetch(path, options);
    let nextStart = start;
    let remaining = hasMore;
    let failed = [];

    // 요청 제한에 걸리면 안내된 시간만큼 기다린 뒤 최대 2번 다시 시도
    async function retryRateLimit(task) {
      for (let attempt = 0; ; attempt++) {
        signal?.throwIfAborted();

        try {
          return await task();
        } catch (error) {
          if (error.status !== 429 || attempt >= 2) throw error;

          await new Promise((resolve, reject) => {
            const abort = () => {
              clearTimeout(timer);

              reject(
                signal.reason || new DOMException("Aborted", "AbortError"),
              );
            };
            const timer = setTimeout(
              () => {
                signal?.removeEventListener("abort", abort);

                resolve();
              },
              Math.min(120, Math.max(1, error.retryAfter || 1)) * 1000,
            );

            signal?.addEventListener("abort", abort, { once: true });

            if (signal?.aborted) abort();
          });
        }
      }
    }

    if (failedMatchIds.length) {
      const recovered = await retryRateLimit(() =>
        details([...new Set(failedMatchIds)], puuid, request),
      );

      signal?.throwIfAborted();
      failed.push(...recovered.failedMatchIds);

      onPage({ ...recovered, nextStart, hasMore: remaining });
    }

    while (remaining) {
      const page = await retryRateLimit(() =>
        loadPage({ puuid, start: nextStart, count: 20, options }),
      );

      signal?.throwIfAborted();

      nextStart = page.nextStart;
      remaining = page.hasMore;
      failed.push(...page.failedMatchIds);

      onPage(page);
    }

    return {
      nextStart,
      hasMore: remaining,
      failedMatchIds: [...new Set(failed)],
    };
  }

  window.TFT_API = { fetch: tftFetch, loadProfile, loadPage, loadSeason };
})();
