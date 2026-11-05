/* 현재 랭크와 날짜별 LP 그래프 표시 */
(() => {
  "use strict";
  const $ = (selector) => document.querySelector(selector);
  const model = window.TFT_RANK;
  const data = window.TFT_DATA;
  let series = [];

  const signed = (value) => `${value > 0 ? "+" : ""}${value}`;
  const colorClass = (value) =>
    value > 0 ? "is-gain" : value < 0 ? "is-loss" : "is-flat";

  // 현재 랭크와 저장된 기록으로 요약과 그래프 갱신
  function update() {
    series = model.dailySeries(data.rankHistory, data.season);

    const latest = data.rank;

    if (latest) {
      $("#rank-label").textContent = `${latest.tier} ${latest.rank}`;
      $("#rank-points").innerHTML = `${latest.leaguePoints} <span>LP</span>`;
      $("#rank-emblem").src =
        `${document.baseURI}assets/images/tft/ranks/rank-${latest.tier.toLowerCase()}.png`;
      $("#rank-emblem").alt = `${latest.tier} 랭크 문양`;
      $("#rank-emblem").hidden = false;
    } else {
      $("#rank-label").textContent = "UNRANKED";
      $("#rank-points").textContent = "–";
      $("#rank-emblem").hidden = true;
    }

    const total = latest ? latest.wins + latest.losses : 0;
    const topFourRate = total
      ? `${((latest.wins / total) * 100).toFixed(1)}%`
      : "–";

    $(".rank-total").textContent = latest
      ? `총 ${total}게임`
      : "랭크 기록 없음";

    $(".rank-footer").innerHTML =
      `<span>TOP 4 비율 <strong>${topFourRate}</strong></span>` +
      "<span>현재 랭크 기록</span>";

    const progress = $(".rank-progress");

    progress.hidden =
      !latest || ["MASTER", "GRANDMASTER", "CHALLENGER"].includes(latest.tier);

    if (latest) {
      progress.querySelector("b").textContent =
        `${100 - latest.leaguePoints} LP`;
      progress.querySelector("i").style.width =
        `${Math.min(100, latest.leaguePoints)}%`;
      progress.querySelector("div > span").textContent = "다음 단계까지";
    }

    $(".rank-chart-summary > small").textContent = data.isDemo
      ? "날짜별 저장 기록 · 예시"
      : "조회일 기준 · 현재 랭크 저장 기록";

    renderChart();
  }

  let visibleRecords = [];
  let shownIndex = null;
  const chart = $("#rank-chart");
  const bubble = $("#rank-chart-tooltip");

  function hidePoint() {
    shownIndex = null;
    bubble.hidden = true;
    chart
      .querySelectorAll('[aria-describedby="rank-chart-tooltip"]')
      .forEach((point) => point.removeAttribute("aria-describedby"));
  }

  // 선택한 날짜의 안내문과 LP 말풍선 갱신
  function readPoint(index, showBubble = false) {
    const record = visibleRecords[index];

    if (!record) return;

    $("#rank-chart-readout").textContent =
      `${record.day} · ${record.tier} ${record.rank} · ${record.leaguePoints} LP`;

    if (!showBubble) return;
    if (shownIndex === index && !bubble.hidden) return;

    hidePoint();

    const point = chart.querySelector(`[data-rank-point="${index}"]`);

    if (!point) return;

    bubble.replaceChildren();

    const value = document.createElement("strong");
    const caption = document.createElement("small");

    value.textContent = `${record.leaguePoints} LP`;
    caption.textContent = `${record.day} · ${record.tier} ${record.rank}`;
    bubble.append(value, caption);
    bubble.hidden = false;

    shownIndex = index;

    point.setAttribute("aria-describedby", "rank-chart-tooltip");

    // 말풍선이 화면 밖으로 나가지 않게 위치 조정
    const anchor = point
      .querySelector(".rank-point-dot")
      .getBoundingClientRect();
    const x = anchor.left + anchor.width / 2,
      y = anchor.top + anchor.height / 2;
    const width = bubble.offsetWidth,
      height = bubble.offsetHeight;
    const left = Math.max(
      8,
      Math.min(window.innerWidth - width - 8, x - width / 2),
    );
    const below = y - height - 8 < 8;

    bubble.style.left = `${left}px`;
    bubble.style.top = `${below ? y + 8 : y - height - 8}px`;
    bubble.style.setProperty("--arrow-x", `${x - left}px`);
    bubble.dataset.placement = below ? "below" : "above";
  }

  // 저장된 랭크 기록을 날짜별 그래프로 표시
  function renderChart() {
    hidePoint();

    const today = model.dayKey(new Date());
    const from = new Date(`${today}T00:00:00Z`);
    const available = series.filter((record) => record.day <= today);

    if (available.length)
      from.setTime(Date.parse(`${available[0].day}T00:00:00Z`));

    const days = Math.max(
      2,
      Math.round(
        (Date.parse(`${today}T00:00:00Z`) - from.getTime()) / 86400000,
      ) + 1,
    );

    visibleRecords = series.filter(
      (record) =>
        record.day >= from.toISOString().slice(0, 10) && record.day <= today,
    );

    if (!visibleRecords.length) {
      $("#rank-chart").innerHTML =
        '<p class="rank-chart-empty">이 기간에 저장한 랭크 기록이 없습니다.</p>';
      $("#period-lp-change").textContent = "기록 없음";
      $("#rank-chart-range").textContent = "갱신한 날짜부터 기록됩니다.";
      $("#rank-chart-readout").textContent =
        "이 브라우저에서 조회한 날짜의 랭크가 저장됩니다.";

      return;
    }

    const first = visibleRecords[0],
      last = visibleRecords.at(-1);
    const delta = last.score - first.score;

    $("#period-lp-change").innerHTML = `${signed(delta)} <small>LP</small>`;
    $("#period-lp-change").className = colorClass(delta);
    $("#rank-chart-range").innerHTML =
      `<b style="color:${model.colors[first.tier]}">${model.label(first)}</b><span> → </span><b style="color:${model.colors[last.tier]}">${model.label(last)}</b>`;

    const minimum = Math.max(
      0,
      Math.floor(Math.min(...visibleRecords.map((r) => r.score)) / 100) * 100,
    );
    const maximum = Math.max(
      minimum + 100,
      Math.ceil(Math.max(...visibleRecords.map((r) => r.score)) / 100) * 100,
    );
    const left = 108,
      right = 740,
      top = 32,
      bottom = 185;
    const x = (record) =>
      left +
      ((Date.parse(`${record.day}T00:00:00Z`) - from.getTime()) /
        86400000 /
        (days - 1)) *
        (right - left);
    const y = (value) =>
      bottom - ((value - minimum) / (maximum - minimum)) * (bottom - top);
    const points = visibleRecords.map((record) => ({
      x: x(record),
      y: y(record.score),
    }));
    const line = points
      .map(
        (point, i) =>
          `${i ? "L" : "M"}${point.x.toFixed(2)},${point.y.toFixed(2)}`,
      )
      .join(" ");
    const area = `${line} L${points.at(-1).x},${bottom} L${points[0].x},${bottom} Z`;
    const grid = [];

    for (
      let value = minimum;
      value <= maximum;
      value += Math.max(100, Math.ceil((maximum - minimum) / 500) * 100)
    ) {
      grid.push(
        `<line x1="${left}" y1="${y(value)}" x2="${right}" y2="${y(value)}" class="rank-grid-line"/><text x="${left - 12}" y="${y(value) + 3}" text-anchor="end" class="rank-axis-label">${model.scoreLabel(value).replace(" · 0 LP", "")}</text>`,
      );
    }

    const ticks = [
      ...new Set([
        0,
        Math.round((days - 1) / 3),
        Math.round(((days - 1) * 2) / 3),
        days - 1,
      ]),
    ];
    const dateLabels = ticks
      .map((offset) => {
        const date = new Date(from);

        date.setUTCDate(date.getUTCDate() + offset);

        return `
          <text
            x="${left + (offset / (days - 1)) * (right - left)}"
            y="212"
            class="rank-axis-label"
            text-anchor="middle"
          >
            ${date.toISOString().slice(5, 10).replace("-", "/")}
          </text>`;
      })
      .join("");

    const hitWidth = Math.min(48, ((right - left) / (days - 1)) * 0.95);
    const visibleLine =
      points.length === 1 ? `M${points[0].x - 3},${points[0].y}h6` : line;

    chart.innerHTML = `
      <svg
        viewBox="0 0 760 225"
        role="group"
        aria-label="세트 17 전체 저장 기록 티어 그래프. 선의 꼭짓점에 마우스를 올리거나 선택하면 LP를 확인할 수 있습니다."
      >
        <defs>
          <linearGradient id="rank-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#5278da" stop-opacity=".2"/>
            <stop offset="100%" stop-color="#5278da" stop-opacity=".02"/>
          </linearGradient>
        </defs>
        ${grid.join("")}
        <path d="${area}" fill="url(#rank-area)"/>
        <path d="${visibleLine}" class="rank-line"/>
        ${points
          .map(
            (point, i) => `
          <g
            class="rank-point"
            data-rank-point="${i}"
            tabindex="0"
            role="button"
            aria-label="${visibleRecords[i].day} ${visibleRecords[i].tier} ${visibleRecords[i].rank} ${visibleRecords[i].leaguePoints} LP"
          >
            <rect
              class="rank-point-hit"
              x="${point.x - hitWidth / 2}"
              y="${point.y - 24}"
              width="${hitWidth}"
              height="48" rx="3"
            />
            <circle class="rank-point-dot" cx="${point.x}" cy="${point.y}" r="2.5"/>
          </g>`,
          )
          .join("")}
          ${dateLabels}
        </svg>`;

    readPoint(points.length - 1);
  }

  ["focusin", "click"].forEach((type) =>
    $("#rank-chart").addEventListener(type, (event) => {
      const point = event.target.closest("[data-rank-point]");

      if (point) readPoint(Number(point.dataset.rankPoint), true);
    }),
  );

  // 그래프가 작아도 선택할 수 있게 가장 가까운 지점을 찾음
  chart.addEventListener("pointermove", (event) => {
    if (event.pointerType === "touch") return;

    let closest = null;
    let distance = 28;

    chart.querySelectorAll("[data-rank-point]").forEach((point) => {
      const box = point
        .querySelector(".rank-point-dot")
        .getBoundingClientRect();
      const current = Math.hypot(
        event.clientX - box.left - box.width / 2,
        event.clientY - box.top - box.height / 2,
      );

      if (current <= distance) {
        distance = current;
        closest = point;
      }
    });

    if (closest) readPoint(Number(closest.dataset.rankPoint), true);
    else hidePoint();
  });

  chart.addEventListener("pointerleave", hidePoint);
  chart.addEventListener("focusout", hidePoint);
  document.addEventListener("pointerdown", (event) => {
    if (!chart.contains(event.target)) hidePoint();
  });

  window.addEventListener("resize", hidePoint);
  window.addEventListener("scroll", hidePoint, true);

  $("#rank-chart").addEventListener("keydown", (event) => {
    const point = event.target.closest("[data-rank-point]");

    if (!point) return;

    const index = Number(point.dataset.rankPoint);

    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();

      const next = Math.max(
        0,
        Math.min(
          visibleRecords.length - 1,
          index + (event.key === "ArrowLeft" ? -1 : 1),
        ),
      );

      $("#rank-chart").querySelector(`[data-rank-point="${next}"]`).focus();
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();

      readPoint(index, true);
    } else if (event.key === "Escape") hidePoint();
  });

  window.addEventListener("tft-profile-updated", update);

  update();
})();
