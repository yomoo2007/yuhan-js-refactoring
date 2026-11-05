/* 티어와 LP를 점수로 바꾸고 날짜별 랭크 계산 */
/* 날짜별 랭크 기록을 화면에서 쓸 수 있게 정리 */
(() => {
  "use strict";
  const tiers = [
    "IRON",
    "BRONZE",
    "SILVER",
    "GOLD",
    "PLATINUM",
    "EMERALD",
    "DIAMOND",
  ];
  const divisions = { IV: 0, III: 1, II: 2, I: 3 };
  const apex = ["MASTER", "GRANDMASTER", "CHALLENGER"];

  // 승급 전후도 비교할 수 있게 티어와 LP를 하나의 점수로 바꿈
  function score(entry) {
    if (
      !entry ||
      !Number.isFinite(entry.leaguePoints) ||
      entry.leaguePoints < 0
    )
      return null;

    if (apex.includes(entry.tier)) return 2800 + entry.leaguePoints;

    const tier = tiers.indexOf(entry.tier);

    if (tier < 0 || !(entry.rank in divisions)) return null;

    return tier * 400 + divisions[entry.rank] * 100 + entry.leaguePoints;
  }

  // 브라우저 시간대와 상관없이 한국 날짜 사용
  function dayKey(at) {
    const date = new Date(at);

    if (!Number.isFinite(date.getTime())) return null;

    const parts = new Intl.DateTimeFormat("en", {
      timeZone: "Asia/Seoul",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(date);

    const get = (type) => parts.find((part) => part.type === type).value;

    return `${get("year")}-${get("month")}-${get("day")}`;
  }
  // 같은 시즌과 모드의 기록 중 날짜별 마지막 조회값만 남김
  function dailySeries(records, season, queue = "RANKED_TFT") {
    const days = new Map();

    for (const record of records) {
      const day = dayKey(record.at);
      const value = score(record);

      if (
        !day ||
        value === null ||
        record.season !== season ||
        record.queue !== queue
      )
        continue;

      const old = days.get(day);

      if (!old || new Date(record.at) > new Date(old.at))
        days.set(day, { ...record, day, score: value });
    }

    return [...days.values()].sort((a, b) => a.day.localeCompare(b.day));
  }

  // 오늘과 어제 기록이 둘 다 있어야 LP 차이를 계산
  function dayChange(series, now = new Date()) {
    const today = dayKey(now);

    if (!today) return null;

    const yesterday = new Date(`${today}T00:00:00Z`);

    yesterday.setUTCDate(yesterday.getUTCDate() - 1);

    const priorDay = yesterday.toISOString().slice(0, 10);
    const current = series.find((record) => record.day === today);
    const previous = series.find((record) => record.day === priorDay);

    return current && previous
      ? { delta: current.score - previous.score, current, previous }
      : null;
  }

  function scoreLabel(value) {
    if (value >= 2800) return `MASTER+ ${value - 2800} LP`;

    const tier = Math.floor(value / 400);
    const division = Math.floor((value % 400) / 100);

    return `${tiers[tier] || "IRON"} ${["IV", "III", "II", "I"][division]} · ${Math.round(value % 100)} LP`;
  }

  const names = {
    IRON: "아이언",
    BRONZE: "브론즈",
    SILVER: "실버",
    GOLD: "골드",
    PLATINUM: "플래티넘",
    EMERALD: "에메랄드",
    DIAMOND: "다이아",
    MASTER: "마스터",
    GRANDMASTER: "그랜드마스터",
    CHALLENGER: "챌린저",
  };
  const colors = {
    IRON: "#85858d",
    BRONZE: "#b77c53",
    SILVER: "#8c9ba9",
    GOLD: "#ba8b29",
    PLATINUM: "#388d9d",
    EMERALD: "#23996c",
    DIAMOND: "#638be1",
    MASTER: "#a46bcd",
    GRANDMASTER: "#d75a65",
    CHALLENGER: "#bb953e",
  };

  function label(entry) {
    return `${names[entry.tier] || "언랭크"}${apex.includes(entry.tier) ? "" : " " + ({ I: 1, II: 2, III: 3, IV: 4 }[entry.rank] || "")}`.trim();
  }

  window.TFT_RANK = {
    score,
    dayKey,
    dailySeries,
    dayChange,
    scoreLabel,
    label,
    colors,
  };
})();
