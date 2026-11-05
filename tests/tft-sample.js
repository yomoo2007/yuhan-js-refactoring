/* 화면 확인용 TFT 샘플 데이터 */
/* Riot 응답과 비슷한 형태의 예시 데이터라 실제 전적은 아님 */
(() => {
  const pack = window.TFT_SET17;
  const account = {
    puuid: "sample-player-set17",
    gameName: "협곡의 산책자",
    tagLine: "DEMO",
  };
  const summoner = { profileIconId: 29, summonerLevel: 128 };
  const rank = {
    queueType: "RANKED_TFT",
    tier: "DIAMOND",
    rank: "II",
    leaguePoints: 72,
    wins: 68,
    losses: 148,
  };
  const placements = [
    1, 2, 4, 1, 6, 3, 2, 5, 1, 4, 3, 7, 2, 1, 4, 3, 6, 2, 1, 5,
  ];
  const names = [
    "협곡의 산책자",
    "티모는정찰중",
    "오늘도리롤",
    "포로에게간식을",
    "요들원정대",
    "별빛산책",
    "골드아껴쓰기",
    "한판더할까",
  ];
  const matches = placements.map((placement, index) => {
    const team = pack.sampleTeams[index % pack.sampleTeams.length];
    const units = team.map((id, i) => ({
      character_id: "TFT17_" + id,
      tier: i === 0 && index % 4 === 0 ? 3 : i === 7 && placement > 4 ? 1 : 2,
      itemNames:
        i === 5
          ? [
              "TFT_Item_GuinsoosRageblade",
              "TFT_Item_InfinityEdge",
              "TFT_Item_MadredsBloodrazor",
            ]
          : i === 4
            ? ["TFT_Item_WarmogsArmor", "TFT_Item_GargoyleStoneplate"]
            : [],
    }));
    const counts = {};

    units.forEach((u) =>
      pack.champions[u.character_id].traits.forEach(
        (name) => (counts[name] = (counts[name] || 0) + 1),
      ),
    );

    const traits = Object.entries(counts).map(([name, count]) => {
      const t = pack.traits[name];
      const i = t.levels.findIndex((e) => count >= e.min && count <= e.max);

      return {
        name: t.id,
        num_units: count,
        tier_current: i + 1,
        tier_total: t.levels.length,
        style: i < 0 ? 0 : t.levels[i].style,
      };
    });

    const companion = {
      content_ID:
        pack.sampleCompanionIds[index % pack.sampleCompanionIds.length],
    };
    const participant = {
      puuid: account.puuid,
      riotIdGameName: account.gameName,
      riotIdTagline: account.tagLine,
      placement,
      units,
      traits,
      companion,
      level: placement < 3 ? 9 : 8,
      last_round: placement < 3 ? 35 : 31,
      time_eliminated: (29 + ((index * 3) % 10)) * 60 + 26,
      total_damage_to_players: 94 + ((index * 17 + 68) % 126),
      gold_left: (index * 7 + 4) % 39,
    };
    const participants = [
      participant,
      ...names.slice(1).map((name, i) => ({
        puuid: `sample-opponent-${i}`,
        riotIdGameName: name,
        riotIdTagline: "DEMO",
        companion: {
          content_ID:
            pack.sampleCompanionIds[
              (index + i + 1) % pack.sampleCompanionIds.length
            ],
        },
      })),
    ];
    const match = {
      metadata: { match_id: `SAMPLE_SET17_${index + 1}` },
      info: {
        tft_set_number: 17,
        game_version: "Version 16.9",
        queue_id: index % 6 === 5 ? 1090 : 1100,
        game_datetime: Date.now() - (32 + index * 97) * 60000,
        participants,
      },
    };

    return { match, participant };
  });
  const result = {
    account,
    summoner,
    rank,
    matches,
    hasMore: false,
    failedMatchIds: [],
  };
  const scores = [
    2428, 2466, 2448, 2497, 2535, 2518, 2557, 2536, 2599, 2642, 2616, 2661,
    2634, 2672,
  ];

  // 샘플 랭크 기록을 포함한 프로필을 새로 만듦
  function sample() {
    const profile = window.TFT_MODEL.normalize(result, { isDemo: true });

    profile.rankHistory = scores.map((score, index) => ({
      at: new Date(
        Date.now() - (scores.length - 1 - index) * 86400000,
      ).toISOString(),
      season: "set17",
      queue: "RANKED_TFT",
      tier: "DIAMOND",
      rank: ["IV", "III", "II", "I"][Math.floor((score - 2400) / 100)],
      leaguePoints: score % 100,
    }));

    return profile;
  }

  window.TFT_SAMPLE = sample;
  window.TFT_TRAITS = pack.traits;
})();
