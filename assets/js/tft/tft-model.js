/* Riot 응답을 화면에서 쓰기 편한 형태로 정리 */
(() => {
  "use strict";
  const pack = window.TFT_SET17;
  const companionByContent = new Map(
    pack.companions.map((c) => [c.contentId.toLowerCase(), c]),
  );
  const companionBySkin = new Map(pack.companions.map((c) => [c.skinId, c]));
  const traitsById = new Map(
    Object.entries(pack.traits).map(([name, t]) => [t.id, { ...t, name }]),
  );

  let assetRequest;
  const imageFallbacks = new Map();
  // 검색할 때 한 번만 이미지 메타데이터를 받아 기존 세트 정보에 연결합니다.
  function loadAssets() {
    if (assetRequest) return assetRequest;
    assetRequest = fetch("/api/tft/assets", { signal: AbortSignal.timeout(6000) })
      .then((response) => { if (!response.ok) throw new Error("asset metadata unavailable"); return response.json(); })
      .then((data) => {
        for (const [id, url] of Object.entries(data["tft-champion"] || {}))
          if (pack.champions[id]) {
            imageFallbacks.set(url, pack.champions[id].tftImage);
            pack.champions[id].tftImage = url;
          }
        for (const [id, url] of Object.entries(data["tft-item"] || {}))
          if (pack.items[id]) {
            imageFallbacks.set(url, pack.items[id].icon);
            pack.items[id].icon = url;
          }
      })
      .catch(() => { assetRequest = null; });
    return assetRequest;
  }

  // 프로필 29번은 로컬 이미지, 나머지는 외부 이미지 사용
  function profileImage(id) {
    if (!Number.isInteger(id) || id < 0) return null;

    return id === 29
      ? `${document.baseURI}assets/images/tft/profiles/profile-29.jpg`
      : `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/${id}.jpg`;
  }

  function companion(value) {
    const found =
      companionByContent.get(String(value?.content_ID || "").toLowerCase()) ||
      companionBySkin.get(value?.skin_ID);

    return found
      ? { name: found.name, image: found.icon, contentId: found.contentId }
      : { name: "전설이 정보 없음", image: null };
  }

  // 경기의 챔피언 ID를 이름, 이미지, 아이템 정보와 연결
  function unit(value) {
    const metadata = pack.champions[value.character_id];

    return {
      id: value.character_id,
      name: metadata?.name || value.character_id,
      cost: metadata?.cost || 1,
      tier: value.tier || 1,
      tftImage: metadata?.tftImage || null,
      baseImage: window.GAME_ASSETS.championPortrait(metadata?.baseId),
      traitNames: metadata?.traits || [],
      items: (value.itemNames || []).map((id) => ({
        id,
        name: pack.items[id]?.name || id,
        image: pack.items[id]?.icon || null,
      })),
    };
  }

  // 세트 17 화면에 필요한 값만 정리하고 샘플인지 구분
  function normalize(result, { isDemo = false } = {}) {
    const matches = result.matches
      .filter(({ match }) => Number(match.info.tft_set_number) === 17)
      .map(({ match, participant: p }) => {
        const units = (p.units || []).map(unit);
        const traits = (p.traits || [])
          .map((t) => {
            const metadata = traitsById.get(t.name);

            return {
              name: metadata?.name || t.name,
              id: t.name,
              count: t.num_units,
              tierCurrent: t.tier_current,
              style: t.style,
            };
          })
          .sort((a, b) => b.style - a.style || b.count - a.count);
        const active = traits.filter((t) => t.tierCurrent > 0);
        // 장착 아이템이 많고 비용이 높은 챔피언을 대표로 선택
        const carry = [...units].sort(
          (a, b) => b.items.length - a.items.length || b.cost - a.cost,
        )[0];
        const mode =
          match.info.queue_id === 1100
            ? "ranked"
            : match.info.queue_id === 1160
              ? "double"
              : match.info.queue_id === 1090
                ? "normal"
                : "other";

        return {
          id: match.metadata.match_id,
          placement: p.placement,
          mode,
          queueId: match.info.queue_id,
          set: 17,
          playedAt: match.info.game_datetime,
          minutesAgo: Math.max(
            0,
            Math.floor((Date.now() - match.info.game_datetime) / 60000),
          ),
          duration: Math.floor(p.time_eliminated / 60),
          durationSeconds: Math.floor(p.time_eliminated),
          level: p.level,
          round: p.last_round,
          damage: p.total_damage_to_players,
          gold: p.gold_left,
          composition: `${active[0]?.name || "혼합 조합"} ${carry?.name || ""}`,
          units,
          traits,
          companion: companion(p.companion),
          players: match.info.participants.map((player) => ({
            name: player.riotIdGameName || "이름 정보 없음",
            tag: player.riotIdTagline || "",
            puuid: player.puuid,
            image: companion(player.companion).image,
            isMe: player.puuid === result.account.puuid,
          })),
          raw: match,
        };
      });

    return {
      isDemo,
      seasonHistoryState: "idle",
      account: result.account,
      summoner: result.summoner,
      profileImage: profileImage(result.summoner?.profileIconId),
      rank: result.rank,
      season: "set17",
      matches,
      rankHistory: [],
      failedMatchIds: result.failedMatchIds || [],
      nextStart: result.nextStart || 0,
      hasMore: Boolean(result.hasMore),
    };
  }

  // 솔로 랭크만 집계하고 같은 경기의 같은 챔피언은 한 번만 셈
  function statistics(matches) {
    const ranked = matches.filter((m) => m.mode === "ranked");
    const champions = new Map();
    const traits = new Map();

    function add(map, key, meta, placement) {
      const old = map.get(key) || { ...meta, count: 0, total: 0, top: 0 };

      old.count++;
      old.total += placement;

      if (placement <= 4) old.top++;

      map.set(key, old);
    }

    for (const match of ranked) {
      const seen = new Set();

      for (const u of match.units)
        if (!seen.has(u.id)) {
          add(champions, u.id, u, match.placement);

          seen.add(u.id);
        }

      for (const t of match.traits.filter((t) => t.tierCurrent > 0))
        add(
          traits,
          t.id,
          { ...t, image: pack.traits[t.name]?.icon },
          match.placement,
        );
    }

    const finish = (map) =>
      [...map.values()]
        .map((row) => ({
          ...row,
          average: row.total / row.count,
          usage: ranked.length ? (row.count / ranked.length) * 100 : 0,
        }))
        .sort((a, b) => b.count - a.count || a.average - b.average);

    return {
      sample: ranked.length,
      champions: finish(champions),
      traits: finish(traits),
    };
  }

  // 숫자로 받은 라운드를 화면용 스테이지-라운드로 바꿈
  function roundLabel(round) {
    if (!Number.isInteger(round) || round < 1) return "–";

    return round <= 4
      ? `1-${round}`
      : `${2 + Math.floor((round - 5) / 7)}-${1 + ((round - 5) % 7)}`;
  }

  // 세트 17 랭크 경기를 중복 없이 모아서 등수별 그래프 값 계산
  function distribution(matches) {
    const ranked = [
      ...new Map(
        matches
          .filter(
            (m) =>
              m.set === 17 &&
              m.mode === "ranked" &&
              Number.isInteger(m.placement) &&
              m.placement >= 1 &&
              m.placement <= 8,
          )
          .map((m) => [m.id, m]),
      ).values(),
    ];
    const counts = Array.from(
      { length: 8 },
      (_, i) => ranked.filter((m) => m.placement === i + 1).length,
    );
    const peak = Math.max(5, ...counts);
    const rawStep = peak / 5;
    const magnitude = 10 ** Math.floor(Math.log10(rawStep));
    const step = [1, 2, 5, 10]
      .map((n) => n * magnitude)
      .find((n) => n >= rawStep);
    const max = Math.ceil(peak / step) * step;

    return {
      counts,
      total: ranked.length,
      max,
      step,
      ticks: Array.from({ length: max / step + 1 }, (_, i) => max - i * step),
    };
  }

  window.TFT_DATA = normalize({ account: {}, summoner: {}, rank: null, matches: [] });
  window.TFT_TRAITS = pack.traits;

  window.TFT_MODEL = {
    normalize,
    loadAssets,
    imageFallbacks,
    profileImage,
    companion,
    statistics,
    roundLabel,
    distribution,
  };
})();
