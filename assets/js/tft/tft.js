/* TFT 검색 결과 표시와 버튼 동작 처리 */
(() => {
  "use strict";
  const $ = (selector) => document.querySelector(selector);
  const data = window.TFT_DATA;
  const escape = (value) =>
    String(value ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  // 화면 필터와 표시 설정, 프로필 데이터는 TFT_DATA에 따로 보관
  const state = {
    region: "KR",
    mode: "all",
    placement: "all",
    limit: 5,
    portraits: "tft",
    statsLimit: 20,
    allStats: false,
  };
  try {
    state.portraits =
      localStorage.getItem("tft-portrait-mode") === "base" ? "base" : "tft";
  } catch {}
  const modeNames = {
    ranked: "솔로 랭크",
    normal: "일반",
    double: "더블 업",
    other: "기타 모드",
  };
  let toastTimer,
    busy = false,
    controller,
    seasonController;
  const matchMarkup = new WeakMap();
  const image = (src, alt, cls = "") =>
    src
      ? `<img src="${escape(src)}" alt="${escape(alt)}" class="${cls}" loading="lazy">`
      : `<span class="asset-missing ${cls}" title="${escape(alt)}">?</span>`;
  const portrait = (u) =>
    state.portraits === "base" ? u.baseImage || u.tftImage : u.tftImage;
  const favoriteKey = () =>
    `${state.region}:${data.account.gameName}#${data.account.tagLine}`;

  function toast(message) {
    $("#toast").textContent = message;
    $("#toast").classList.add("visible");

    clearTimeout(toastTimer);
    toastTimer = setTimeout(
      () => $("#toast").classList.remove("visible"),
      4500,
    );
  }

  function favorites() {
    try {
      const value = JSON.parse(
        localStorage.getItem("poro-tft-favorites") || "[]",
      );

      return Array.isArray(value) ? value : [];
    } catch {
      return [];
    }
  }

  function renderFavorite() {
    const saved = favorites().includes(favoriteKey());

    $("#favorite").setAttribute("aria-pressed", String(saved));
    $("#favorite").setAttribute(
      "aria-label",
      saved ? "즐겨찾기 해제" : "즐겨찾기 추가",
    );
  }

  function renderProfile() {
    $("#player-name").textContent = data.account.gameName;
    $("#player-tag").textContent = "#" + data.account.tagLine;
    $("#player-region").textContent = state.region;

    const avatar = $(".profile-avatar");

    avatar.src = data.profileImage || "";
    avatar.alt = `${data.account.gameName}의 Riot 프로필 아이콘`;

    $(".avatar-level").textContent = data.summoner.summonerLevel ?? "–";
    $(".previous-rank").textContent = data.isDemo
      ? "샘플 플레이어 · 세트 17 데이터 구조 확인용"
      : "Riot 사용자 데이터 · 세트 17 전적";
    $(".demo-badge").innerHTML = data.isDemo
      ? "<i></i> SAMPLE DATA"
      : "<i></i> RIOT DATA";
    $(".demo-disclaimer").textContent = data.isDemo
      ? "현재는 샘플 전적입니다. 상단에서 Riot ID를 검색하면 실제 사용자 데이터를 불러옵니다."
      : `세트 17만 표시합니다.${data.failedMatchIds.length ? ` 매치 ${data.failedMatchIds.length}개를 가져오지 못했습니다.` : ""}`;

    document.title = `${data.account.gameName} · TFT 세트 17 전적 | PORO.GG`;

    renderFavorite();
  }

  // 검색 중 중복 요청을 막고 로딩, 취소, 오류를 여기서 처리
  async function loading(
    task,
    { demo = false, title = "전적을 정찰하고 있어요", duration = 4000 } = {},
  ) {
    if (busy) return;

    busy = true;

    const requestController = new AbortController();

    controller = requestController;

    let failure;
    const controls = [
      $("#refresh"),
      $("#preview-loading"),
      $("#search-form button"),
      $("#load-more"),
    ];
    const focusBefore = document.activeElement;

    controls.forEach((b) => (b.disabled = true));

    $("#refresh").innerHTML = "<span>↻</span> 정찰하는 중";

    // 취소 후 새 요청이 시작되면 이전 요청이 새 화면을 건드리지 않게 확인
    const finish = () => {
      if (controller !== requestController) return;

      controller = null;
      busy = false;

      TFT_LOADING.hide();
      controls.forEach((b) => (b.disabled = false));

      $("#refresh").innerHTML = '<span aria-hidden="true">↻</span> 전적 갱신';

      if (focusBefore?.isConnected) focusBefore.focus();
    };

    requestController.signal.addEventListener("abort", finish, { once: true });

    try {
      if (demo) {
        if (!(await TFT_LOADING.preview(title, { duration }))) return;
      } else {
        TFT_LOADING.show(title);
      }

      if (requestController.signal.aborted) return;

      await task(requestController.signal);
    } catch (error) {
      if (!requestController.signal.aborted && error.name !== "AbortError") {
        failure = error;

        $("#search-message").textContent = error.message;
      }
    } finally {
      requestController.signal.removeEventListener("abort", finish);

      finish();
    }

    if (failure && !requestController.signal.aborted)
      TFT_FEEDBACK.show(failure, {
        retry: () => loading(task, { demo, title, duration }),
      });
  }

  window.addEventListener("tft-loading-cancel", () => controller?.abort());

  // 최근 20경기 요약과 수집한 전체 경기의 등수 분포 표시
  function renderSummary() {
    const matches = data.matches
      .filter((m) => m.mode === "ranked")
      .slice(0, 20);
    const n = matches.length;

    $("#summary-title").textContent = `최근 ${n}게임 등수`;
    $(".overview-note").textContent = "솔로 랭크 · 세트 17";
    $("#average").textContent = n
      ? "#" +
        (
          Math.round((matches.reduce((s, m) => s + m.placement, 0) * 10) / n) /
          10
        ).toFixed(1)
      : "–";
    $("#top-count").textContent = matches.filter(
      (m) => m.placement <= 4,
    ).length;
    $("#win-count").textContent = matches.filter(
      (m) => m.placement === 1,
    ).length;

    const { counts, total, max, step, ticks } = TFT_MODEL.distribution(
      data.matches,
    );

    $("#chart-axis").innerHTML = ticks
      .map((value) => `<span>${value}</span>`)
      .join("");
    $("#distribution").style.setProperty(
      "--grid-step",
      `${(step / max) * 100}%`,
    );

    const pending = data.seasonHistoryState === "loading";
    const partial =
      !data.isDemo && (data.hasMore || data.failedMatchIds.length > 0);

    $("#distribution-status").textContent =
      `세트 17 솔로 랭크 ${pending ? "전체 집계 중" : partial ? "일부 기록" : "전체"} · ${total}게임${data.isDemo ? " · 예시" : ""}`;
    $("#distribution-retry").hidden = pending || !partial;
    $("#distribution").setAttribute("aria-busy", String(pending));
    $("#distribution").innerHTML = counts
      .map(
        (count, i) =>
          `<div class="distribution-item" title="${i + 1}위 · ${count}게임">
            <div class="bar" style="height:${(count / max) * 100}%">
              <b>${count || ""}</b>
            </div>
            <span>#${i + 1}</span>
          </div>`,
      )
      .join("");
    $("#distribution").setAttribute(
      "aria-label",
      "세트 17 솔로 랭크 등수 분포. " +
        counts.map((c, i) => `${i + 1}위 ${c}게임`).join(", "),
    );
    $("#placement-trend").innerHTML = Array.from({ length: 20 }, (_, i) => {
      const m = matches[i];

      return `<span
                class="${!m || m.placement > 4 ? "bottom" : m.placement === 1 ? "first" : ""}"
                title="${m ? `최근 ${i + 1}번째 게임 · ${m.placement}위` : "기록 없음"}"
              >
                ${m?.placement ?? "–"}
              </span>`;
    }).join("");
  }

  // 최근 랭크 경기에서 챔피언과 시너지 사용 횟수 계산
  function renderUsage() {
    const matches = data.matches
      .filter((m) => m.mode === "ranked")
      .slice(0, state.statsLimit);
    const stats = TFT_MODEL.statistics(matches),
      limit = state.allStats ? Infinity : 5;

    $("#usage-sample").textContent =
      `불러온 솔로 랭크 중 ${stats.sample}게임 · 중복 유닛 제외`;

    const rows = (values, isTrait) =>
      values
        .slice(0, limit)
        .map(
          (row) =>
            `<tr>
              <td>
                <div
                  class="usage-name"
                  ${
                    !isTrait
                      ? `data-champion-name="${escape(row.name)}"
                    data-item-stats="true"
                    tabindex="0"
                    role="button"
                    aria-label="${escape(row.name)} 시너지와 아이템 통계"`
                      : `data-trait-name="${escape(row.name)}"
                    data-trait-usage="true"
                    tabindex="0"
                    role="button"
                    aria-label="${escape(row.name)} 소속 챔피언 보기"`
                  }
                >
                  ${image(isTrait ? row.image : portrait(row), row.name, isTrait ? "usage-trait-image" : "")}
                  <span>
                    ${escape(row.name)}
                  </span>
                </div>
              </td>
              <td>
                ${row.count}
                <small>${row.usage.toFixed(0)}%</small>
              </td>
              <td>#${row.average.toFixed(2)}</td>
              <td>${Math.round((row.top / row.count) * 100)}%</td>
            </tr>`,
        )
        .join("") ||
      '<tr><td colspan="4" class="usage-empty">불러온 랭크 전적이 없습니다.</td></tr>';

    $("#champion-usage").innerHTML = rows(stats.champions, false);
    $("#trait-usage").innerHTML = rows(stats.traits, true);
    $("#usage-expand").textContent = state.allStats
      ? "간단히 보기 ↑"
      : "전체 챔피언·시너지 통계 보기 ↓";
  }

  function renderUnit(u) {
    return `
      <div class="unit cost-${u.cost}" data-tier="${u.tier}" title="${escape(u.name)} · ${u.tier}성">
        <span class="unit-stars" aria-hidden="true">${"★".repeat(Math.min(u.tier, 4))}</span>
        <button
          type="button"
          class="unit-portrait"
          data-champion-name="${escape(u.name)}"
          aria-label="${escape(u.name)} ${u.tier}성. 보유 시너지 보기"
        >
          ${image(portrait(u), `${u.name} ${state.portraits === "base" ? "기본 초상화" : "TFT 스킨"}`)}
          <span class="unit-name">
            ${escape(u.name)}
          </span>
        </button>
        <div class="unit-items">
          ${u.items.map((item) => `<span title="${escape(item.name)}">${image(item.image, item.name)}</span>`).join("")}
        </div>
      </div>`;
  }

  function renderMatch(m) {
    const relativeTime = (minutes) =>
      minutes < 60
        ? `${minutes}분 전`
        : minutes < 1440
          ? `${Math.floor(minutes / 60)}시간 전`
          : `${Math.floor(minutes / 1440)}일 전`;
    const style =
      m.placement === 1 ? "winner top" : m.placement <= 4 ? "top" : "";

    const seconds = String(m.durationSeconds % 60).padStart(2, "0");

    return `
      <article data-match-id="${escape(m.id)}" class="match-card ${style}">
        <div class="record-header">
          <strong>#${m.placement}</strong>
          <span>${modeNames[m.mode]}</span>
          <span class="record-divider">|</span>
          <span>${m.duration}:${seconds}</span>
          <span class="record-divider">|</span>
          <span>${relativeTime(m.minutesAgo)}</span>
          <span class="record-divider">|</span>
          <span class="record-round" title="마지막 라운드">
            ${TFT_MODEL.roundLabel(m.round)}
          </span>
          <span class="record-comp">${escape(m.composition)}</span>
        </div>
        <div class="record-body">
          <div class="companion" title="${escape(m.companion.name)}">
            ${image(m.companion.image, m.companion.name)}
            <span>${m.level}</span>
          </div>
          <div class="synergy-group" aria-label="사용한 시너지">
            ${TFT_TRAIT_UI.renderGroup(m)}
          </div>
          <div class="record-team">
            <div class="unit-line">
              ${m.units.map(renderUnit).join("")}
            </div>
          </div>
          <div class="roster" aria-label="참가자">
            ${m.players
              .map(
                (p) => `
                  <span
                    class="roster-player
                    ${p.isMe ? "is-me" : ""}"
                    title="${escape(p.name)}${p.tag ? "#" + escape(p.tag) : ""}"
                  >
                    ${image(p.image, "전설이")}
                    <span>
                      ${escape(p.name)}
                    </span>
                    ${p.isMe ? "<small>나</small>" : ""}
                  </span>`,
              )
              .join("")}
          </div>
        </div>
        <button
          class="expand-match"
          data-match="${escape(m.id)}"
          aria-expanded="false"
          aria-controls="detail-${escape(m.id)}"
          aria-label="${m.placement}위 매치 상세"
        >
          <span class="chevron" aria-hidden="true">⌄</span>
        </button>
        <div class="match-detail" id="detail-${escape(m.id)}" hidden>
          <div class="detail-heading">
            <h3>챔피언별 장착 아이템</h3>
          </div>
          <div class="equipped-units">
            ${
              m.units
                .filter((u) => u.items.length)
                .map(
                  (u) =>
                    `<div class="equipped-unit">
                      <div class="equipped-champion" data-champion-name="${escape(u.name)}" tabindex="0">
                        ${image(portrait(u), u.name)}
                        <b>${escape(u.name)}</b>
                      </div>
                      <div class="equipped-items">
                        ${u.items.map((item) => `<span>${image(item.image, item.name)}<span>${escape(item.name)}</span></span>`).join("")}
                      </div>
                    </div>`,
                )
                .join("") ||
              '<p class="usage-empty-items">장착한 아이템이 없습니다.</p>'
            }
          </div>
        </div>
      </article>`;
  }

  // 모드와 등수로 경기를 걸러서 목록과 더보기 버튼 갱신
  function renderMatches() {
    const matches = data.matches.filter(
      (m) =>
        (state.mode === "all" || m.mode === state.mode) &&
        (state.placement === "all" ||
          (state.placement === "top" && m.placement <= 4) ||
          (state.placement === "win" && m.placement === 1)),
    );

    $("#match-count").textContent = matches.length;

    // 바뀌지 않은 경기는 그대로 둬서 펼친 상태와 초점을 유지
    const list = $("#match-list");
    const current = new Map(
      [...list.children].map((card) => [card.dataset.matchId, card]),
    );
    const retained = new Set();
    const focusBefore = document.activeElement;
    let restoreFocus = focusBefore;
    let anchor = list.firstElementChild;
    let invalidated = false;

    for (const match of matches.slice(0, state.limit)) {
      let card = current.get(match.id);
      const markup = renderMatch(match);

      if (!card || matchMarkup.get(card) !== markup) {
        const template = document.createElement("template");
        template.innerHTML = markup;

        const replacement = template.content.firstElementChild;

        if (card) {
          const expanded =
            card.querySelector("[data-match]").getAttribute("aria-expanded") ===
            "true";

          replacement
            .querySelector("[data-match]")
            .setAttribute("aria-expanded", String(expanded));
          replacement.querySelector(".match-detail").hidden = !expanded;

          if (card.contains(focusBefore)) {
            const index = [
              ...card.querySelectorAll("button, [tabindex]"),
            ].indexOf(focusBefore);

            restoreFocus =
              replacement.querySelectorAll("button, [tabindex]")[index];
          }

          card.replaceWith(replacement);

          if (anchor === card) anchor = replacement;

          invalidated = true;
        }

        card = replacement;

        matchMarkup.set(card, markup);
      }
      if (card === anchor) anchor = anchor.nextElementSibling;
      else list.insertBefore(card, anchor);

      retained.add(card);
    }

    for (const child of [...list.children]) {
      if (!retained.has(child)) {
        child.remove();

        invalidated = true;
      }
    }

    if (!matches.length)
      list.innerHTML =
        '<div class="empty-state"><strong>표시할 세트 17 전적이 없어요</strong><p>필터를 바꾸거나 이전 전적을 더 불러와 주세요.</p></div>';
    if (invalidated) TFT_TRAIT_UI.hide();
    if (restoreFocus?.isConnected && document.activeElement !== restoreFocus)
      restoreFocus.focus({ preventScroll: true });

    $("#load-more").hidden = matches.length <= state.limit && !data.hasMore;
    $("#load-more").textContent =
      matches.length > state.limit
        ? `전적 더 보기 · ${Math.min(state.limit, matches.length)} / ${matches.length} ⌄`
        : "이전 전적 불러오기 ⌄";

    document.querySelectorAll("[data-portrait-mode]").forEach((b) => {
      b.classList.toggle("active", b.dataset.portraitMode === state.portraits);
      b.setAttribute(
        "aria-pressed",
        String(b.dataset.portraitMode === state.portraits),
      );
    });
  }

  // 화면을 갱신하고 다른 모듈에도 프로필 변경을 알림
  function renderAll() {
    renderProfile();
    renderSummary();
    renderMatches();
    renderUsage();

    window.dispatchEvent(new Event("tft-profile-updated"));
  }

  // 뒤에서 진행 중인 경기 수집을 멈추고 일부 기록만 집계됐다고 표시
  function stopSeasonCollection() {
    seasonController?.abort();
    seasonController = null;

    if (data.seasonHistoryState === "loading") {
      data.seasonHistoryState = "partial";

      renderSummary();
    }
  }
  // 남은 경기를 뒤에서 가져오면서 중복을 빼고 통계 갱신
  async function collectSeason() {
    stopSeasonCollection();

    if (data.isDemo || (!data.hasMore && !data.failedMatchIds.length)) return;

    const collection = new AbortController();

    seasonController = collection;

    data.seasonHistoryState = "loading";

    renderSummary();

    try {
      const result = await TFT_API.loadSeason({
        puuid: data.account.puuid,
        start: data.nextStart,
        hasMore: data.hasMore,
        failedMatchIds: data.failedMatchIds,
        signal: collection.signal,
        options: { region: state.region, signal: collection.signal },
        onPage: (page) => {
          if (collection.signal.aborted) return;

          const extra = TFT_MODEL.normalize({
            account: data.account,
            summoner: data.summoner,
            rank: data.rank,
            ...page,
          });

          data.matches = [
            ...new Map(
              [...data.matches, ...extra.matches].map((m) => [m.id, m]),
            ).values(),
          ].sort((a, b) => b.playedAt - a.playedAt);

          const recovered = new Set(
            page.matches.map((entry) => entry.match.metadata.match_id),
          );

          data.failedMatchIds = [
            ...new Set([
              ...data.failedMatchIds.filter((id) => !recovered.has(id)),
              ...page.failedMatchIds,
            ]),
          ];
          data.nextStart = page.nextStart;
          data.hasMore = page.hasMore;

          renderSummary();
          renderUsage();
          renderMatches();
        },
      });

      if (collection.signal.aborted) return;

      Object.assign(data, result);

      data.seasonHistoryState = "done";
    } catch (error) {
      if (collection.signal.aborted) return;

      data.seasonHistoryState = "partial";
    } finally {
      if (seasonController === collection) {
        seasonController = null;

        renderSummary();
        renderMatches();
        renderProfile();

        window.dispatchEvent(new Event("tft-profile-updated"));
      }
    }
  }

  $("#distribution-retry").addEventListener("click", () => collectSeason());

  // 검색 성공 시 프로필과 URL을 갱신하고 남은 경기 수집 시작
  async function search(name, tag, region, force = false, writeHistory = true) {
    if (busy) return;

    stopSeasonCollection();
    await loading(async (signal) => {
      $("#search-message").textContent = "";

      const [result] = await Promise.all([TFT_API.loadProfile({
        gameName: name,
        tagLine: tag,
        options: { region, force, signal },
      }), TFT_MODEL.loadAssets()]);

      if (signal.aborted) return;

      // 서버 응답을 화면에서 사용할 형태로 바꿈
      const profile = TFT_MODEL.normalize(result);

      // 오늘 조회한 랭크를 브라우저에 저장
      profile.rankHistory = TFT_STORE.recordRank(
        profile.account.puuid,
        profile.rank,
      );

      Object.assign(data, profile);

      state.region = region;
      state.limit = 5;

      const url = new URL(location.href);

      url.search = new URLSearchParams({
        name: profile.account.gameName,
        tag: profile.account.tagLine,
        region,
      });

      if (url.href !== location.href) {
        if (writeHistory) history.pushState({}, "", url);
        else history.replaceState({}, "", url);
      }

      $("#region").value = region;
      $("#riot-id").value =
        `${profile.account.gameName}#${profile.account.tagLine}`;

      $("#search-empty").hidden = true;
      $("#search-results").hidden = false;
      renderAll();

      $("#updated").textContent = "Riot 데이터 갱신 · 방금 전";

      collectSeason();
    });
  }
  // 검색, 미리보기, 필터 버튼을 연결하고 잘못된 입력은 검색하지 않음
  $("#search-form").addEventListener("submit", (event) => {
    event.preventDefault();

    const input = $("#riot-id");
    const parts = input.value.trim().split("#");

    if (parts.length !== 2 || !parts[0].trim() || !parts[1].trim()) {
      input.setCustomValidity("이름#태그 형식으로 입력해 주세요.");
      input.reportValidity();

      return;
    }

    search(parts[0].trim(), parts[1].trim(), $("#region").value);
  });

  $("#riot-id").addEventListener("input", () =>
    $("#riot-id").setCustomValidity(""),
  );
  $("#refresh").addEventListener("click", () =>
    search(data.account.gameName, data.account.tagLine, state.region, true),
  );
  $("#preview-loading").addEventListener("click", () =>
    loading(async () => {}, {
      demo: true,
      title: "티모가 버섯을 배달하고 있어요",
      duration: 0,
    }),
  );

  document
    .querySelectorAll("[data-preview-feedback]")
    .forEach((button) =>
      button.addEventListener("click", () =>
        TFT_FEEDBACK.show(
          { kind: button.dataset.previewFeedback },
          { preview: true },
        ),
      ),
    );

  $("#favorite").addEventListener("click", () => {
    const key = favoriteKey();
    const list = favorites();
    const saved = list.includes(key);

    try {
      localStorage.setItem(
        "poro-tft-favorites",
        JSON.stringify(saved ? list.filter((v) => v !== key) : [...list, key]),
      );

      renderFavorite();
      toast(
        saved
          ? "즐겨찾기를 해제했습니다."
          : "현재 브라우저에 즐겨찾기를 저장했습니다.",
      );
    } catch {
      toast("즐겨찾기를 저장할 수 없습니다.");
    }
  });

  document.querySelectorAll("[data-mode]").forEach((button) =>
    button.addEventListener("click", () => {
      state.mode = button.dataset.mode;
      state.limit = 5;

      document.querySelectorAll("[data-mode]").forEach((b) => {
        b.classList.toggle("active", b === button);
        b.setAttribute("aria-pressed", String(b === button));
      });

      renderMatches();
    }),
  );

  $("#placement-filter").addEventListener("change", (event) => {
    state.placement = event.target.value;
    state.limit = 5;

    renderMatches();
  });

  document.querySelectorAll("[data-portrait-mode]").forEach((button) =>
    button.addEventListener("click", () => {
      state.portraits = button.dataset.portraitMode;

      try {
        localStorage.setItem("tft-portrait-mode", state.portraits);
      } catch {}

      renderMatches();
      renderUsage();
    }),
  );

  $("#stats-limit").addEventListener("change", (event) => {
    state.statsLimit = Number(event.target.value);

    renderUsage();
  });

  $("#usage-expand").addEventListener("click", () => {
    state.allStats = !state.allStats;

    renderUsage();
  });

  $("#load-more").addEventListener("click", () => {
    if (
      data.seasonHistoryState === "loading" &&
      state.limit >= data.matches.length
    ) {
      toast("전체 기록을 집계하고 있어요. 잠시만 기다려 주세요.");

      return;
    }
    if ($("#load-more").textContent.startsWith("전적 더 보기")) {
      state.limit += 5;

      renderMatches();

      return;
    }

    stopSeasonCollection();
    loading(async (signal) => {
      const page = await TFT_API.loadPage({
        puuid: data.account.puuid,
        start: data.nextStart,
        options: { region: state.region, signal },
      });

      if (signal.aborted) return;

      const extra = TFT_MODEL.normalize({
        account: data.account,
        summoner: data.summoner,
        rank: data.rank,
        ...page,
      });

      data.matches = [
        ...new Map(
          [...data.matches, ...extra.matches].map((m) => [m.id, m]),
        ).values(),
      ];

      data.nextStart = page.nextStart;
      data.hasMore = page.hasMore;
      data.failedMatchIds.push(...page.failedMatchIds);
      state.limit += 5;

      renderAll();
      collectSeason();
    });
  });

  $("#match-list").addEventListener("click", (event) => {
    const button = event.target.closest("[data-match]");

    if (!button) return;

    const open = button.getAttribute("aria-expanded") === "true";

    button.setAttribute("aria-expanded", String(!open));
    document.getElementById(button.getAttribute("aria-controls")).hidden = open;
  });

  document.addEventListener(
    "error",
    (event) => {
      const img = event.target;

      if (img.tagName !== "IMG" || img.dataset.failed) return;

      const fallback = TFT_MODEL.imageFallbacks.get(img.getAttribute("src"));
      if (fallback && !img.dataset.fallback) {
        img.dataset.fallback = "true";
        img.src = fallback;
        return;
      }
      img.dataset.failed = "true";
      img.classList.add("image-unavailable");
      img.alt = "이미지 정보 없음";
    },
    true,
  );
  // 뒤로가기나 앞으로가기 시 URL의 검색 결과를 다시 표시
  window.addEventListener("popstate", () => {
    // 이전 작업은 취소하고 이동한 URL만 반영
    controller?.abort();
    stopSeasonCollection();
    TFT_FEEDBACK.hide();

    const p = new URLSearchParams(location.search);

    if (p.has("name") && p.has("tag"))
      search(
        p.get("name"),
        p.get("tag"),
        p.get("region") || "KR",
        false,
        false,
      );
    else {
      Object.assign(data, TFT_MODEL.normalize({ account: {}, summoner: {}, rank: null, matches: [] }));
      state.region = "KR";
      state.limit = 5;
      $("#region").value = "KR";
      $("#riot-id").value = "";
      $("#search-message").textContent = "";
      $("#search-empty").hidden = false;
      $("#search-results").hidden = true;
    }
  });

  const params = new URLSearchParams(location.search);

  if (params.has("name") && params.has("tag")) {
    $("#riot-id").value = `${params.get("name")}#${params.get("tag")}`;

    search(
      params.get("name"),
      params.get("tag"),
      params.get("region") || "KR",
      false,
      false,
    );
  }
})();
