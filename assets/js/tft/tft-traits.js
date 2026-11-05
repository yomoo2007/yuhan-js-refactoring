/* 시너지와 챔피언 설명창, 아이템 통계 표시 */
/* 마우스뿐 아니라 키보드와 터치로도 설명 확인 가능 */
(() => {
  "use strict";
  const definitions = window.TFT_TRAITS;
  const championsByName = new Map(
    Object.values(window.TFT_SET17.champions).map((champion) => [
      champion.name,
      champion,
    ]),
  );
  const tooltip = document.getElementById("trait-tooltip");
  const championTooltip = document.getElementById("champion-traits-tooltip");
  let championTarget = null;
  let itemStats = null,
    itemStatsFailed = false,
    itemRequest;

  // 같은 요청이 겹치지 않게 하고 서버의 아이템 통계를 가져옴
  function loadItemStats() {
    if (itemRequest) return itemRequest;

    itemRequest = fetch("/assets/js/server/item-stats")
      .then((response) => {
        if (!response.ok) throw new Error();

        return response.json();
      })
      .then((value) => {
        itemStats = value;
        itemStatsFailed = false;
      })
      .catch(() => {
        itemStatsFailed = true;
      })
      .finally(() => {
        itemRequest = null;
        if (championTarget?.dataset.itemStats) {
          championTooltip.innerHTML = championContent(
            championTarget.dataset.championName,
            true,
          );

          position(championTarget, championTooltip);
        }
      });

    return itemRequest;
  }

  window.addEventListener("tft-profile-updated", loadItemStats);

  const allCard = document.getElementById("trait-all-card");
  let moreButton = null;
  const escape = (value) =>
    String(value).replace(
      /[&<>"']/g,
      (char) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[char],
    );
  let activeButton = null;
  let timer;

  // API 특성 정보를 우선 사용하고 없으면 챔피언으로 계산
  function traitState(name, units, apiTrait) {
    const definition = definitions[name];

    if (!definition) return null;

    const members = units.filter((unit) =>
      definition.champions.includes(unit.name),
    );

    // 같은 챔피언이 여러 개여도 특성 수는 한 번만 셈
    const count =
      apiTrait?.count ?? new Set(members.map((unit) => unit.id)).size;
    const level = apiTrait
      ? apiTrait.tierCurrent - 1
      : definition.levels.findIndex(
          (effect) => count >= effect.min && count <= effect.max,
        );
    const next = definition.levels.find((effect) => effect.min > count);

    return {
      definition,
      members,
      count,
      level,
      next,
      style: apiTrait?.style ?? definition.levels[level]?.style ?? 0,
    };
  }

  function render(name, match) {
    const current = traitState(
      name,
      match.units,
      match.traits.find((t) => t.name === name),
    );

    if (!current) return "";

    const { definition, count, level } = current;
    const style =
      level < 0
        ? "inactive"
        : current.style >= 4
          ? "gold"
          : current.style >= 3
            ? "silver"
            : "bronze";

    return `
      <button
        class="synergy-token ${style}"
        type="button"
        data-trait-name="${escape(name)}"
        data-trait-match="${escape(match.id)}"
        aria-label="${escape(name)} ${count}명, ${level < 0 ? "미활성" : `${level + 1}단계 활성`}. 시너지 설명 보기"
      >
        <span class="synergy-icon-wrap">
          <span class="synergy-hex">
            <img src="${escape(definition.icon)}" alt="" loading="lazy">
          </span>
          <b class="synergy-count">${count}</b>
        </span>
        <small>${escape(name)}</small>
      </button>`;
  }

  // 활성 시너지 4개까지 보여주고 더 있으면 전체 보기 표시
  function renderGroup(match) {
    const active = match.traits.filter((t) => t.count > 0 && t.tierCurrent > 0);
    const extra = match.traits.length - 4;

    return (
      active
        .slice(0, 4)
        .map((t) => render(t.name, match))
        .join("") +
      (active.length > 4
        ? `<button
            type="button"
            class="synergy-more"
            data-traits-more="${escape(match.id)}"
            aria-expanded="false"
            aria-controls="trait-all-card"
            aria-haspopup="dialog"
            aria-label="시너지 ${extra}개 더 보기, 비활성 포함 전체 시너지"
          >
            +${extra}개 더보기
          </button>`
        : "")
    );
  }

  function renderMembers(definition, units, base = false, markAbsent = true) {
    const used = new Set(units.map((unit) => unit.name));

    return [...new Set(definition.champions)]
      .map((name) => {
        const champion =
          championsByName.get(name) || units.find((unit) => unit.name === name);
        const src = base
          ? window.GAME_ASSETS.championPortrait(champion?.baseId) ||
            champion?.baseImage ||
            champion?.tftImage
          : champion?.tftImage;
        const present = !markAbsent || used.has(name),
          label = markAbsent
            ? `${name} · ${present ? "사용한 챔피언" : "사용하지 않은 챔피언"}`
            : name;

        return `
          <button
            type="button"
            class="trait-member${present ? "" : " is-absent"}"
            data-champion-name="${escape(name)}"
            aria-label="${escape(label)}. 보유 시너지 보기"
          >
            <span class="trait-member-portrait">
              ${
                src
                  ? `<img src="${escape(src)}" alt="" loading="lazy">`
                  : `<span class="asset-missing" aria-hidden="true">?</span>`
              }
            </span>
            <small>${escape(name)}</small>
          </button>`;
      })
      .join("");
  }

  // 전체 시너지와 설명창을 닫고 필요하면 버튼으로 초점 이동
  function hideAll(restoreFocus = false) {
    const previous = moreButton;

    moreButton?.setAttribute("aria-expanded", "false");
    moreButton = null;
    allCard.hidden = true;

    hide();

    if (restoreFocus && previous?.isConnected)
      previous.focus({ preventScroll: true });
  }

  function allContent(match) {
    const active = match.traits.filter((t) => t.count > 0 && t.tierCurrent > 0);
    const inactive = match.traits.filter(
      (t) => !(t.count > 0 && t.tierCurrent > 0),
    );
    const group = (traits, label) =>
      `<section>
        <h4>${label} <span>${traits.length}</span></h4>
        <div class="trait-all-grid">
          ${
            traits
              .map(
                (t) => `
            <div class="trait-all-entry">
              ${render(t.name, match) || `<span>${escape(t.name)}</span>`}
              <small>${t.count}명 · ${t.tierCurrent > 0 ? `${t.tierCurrent}단계 활성` : "비활성"}</small>
            </div>
          `,
              )
              .join("") || '<p class="trait-all-empty">없음</p>'
          }
        </div>
      </section>`;

    return `
      <div class="trait-all-heading">
        <h3 id="trait-all-title">이 게임의 전체 시너지</h3>
        <button type="button" data-traits-close aria-label="전체 시너지 닫기">×</button>
      </div>
      ${group(active, "활성")}
      ${group(inactive, "비활성")}
      <p class="trait-source-note">시너지에 마우스를 올리거나 선택하면 상세 설명을 볼 수 있어요.</p>`;
  }

  // 같은 경기는 창을 닫고 다른 경기면 해당 내용으로 바꿈
  function showAll(button) {
    if (moreButton === button && !allCard.hidden) {
      hideAll(true);

      return;
    }

    const match = window.TFT_DATA.matches.find(
      (item) => item.id === button.dataset.traitsMore,
    );

    if (!match) return;

    hideAll();

    moreButton = button;

    allCard.innerHTML = allContent(match);
    allCard.hidden = false;

    button.setAttribute("aria-expanded", "true");

    position(button, allCard);

    allCard.querySelector("[data-traits-close]").focus({ preventScroll: true });
  }

  function hide() {
    hideChampion();
    clearTimeout(timer);

    activeButton?.removeAttribute("aria-describedby");
    activeButton = null;

    tooltip.hidden = true;
  }
  function position(button, panel = tooltip) {
    const target = button.getBoundingClientRect();
    const box = panel.getBoundingClientRect();
    const left = Math.max(
      10,
      Math.min(
        window.innerWidth - box.width - 10,
        target.left + target.width / 2 - box.width / 2,
      ),
    );
    let top = target.top - box.height - 12;

    if (top < 10) top = target.bottom + 12;

    panel.style.left = `${left}px`;
    panel.style.top = `${Math.max(10, Math.min(window.innerHeight - box.height - 10, top))}px`;
  }

  // 챔피언 시너지를 보여주고 필요할 때 아이템 TOP 5도 표시
  function championContent(name, withItems = false) {
    const champion = championsByName.get(name);
    const traits = [...new Set(champion?.traits || [])];
    const championId = Object.keys(window.TFT_SET17.champions).find(
      (id) => window.TFT_SET17.champions[id].name === name,
    );
    const row = itemStats?.champions?.[championId];
    const items = Object.entries(row?.items || {})
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 5);
    const itemContent = withItems
      ? `<div class="champion-item-stats"><h4>많이 장착한 아이템 TOP 5</h4>${
          items.length
            ? items
                .map(([id, count]) => {
                  const item = window.TFT_SET17.items[id];
                  return `
                    <div class="item-stat-row">
                      ${item?.icon ? `<img src="${escape(item.icon)}" alt="">` : ""}
                      <span>${escape(item?.name || id)}</span>
                      <b>${((count / row.boards) * 100).toFixed(1).replace(/\.0$/, "")}%</b>
                    </div>`;
                })
                .join("")
            : `<p>${itemStatsFailed ? "통계를 불러오지 못했어요." : !itemStats ? "통계를 불러오는 중이에요." : "수집된 아이템 기록이 없습니다."}</p>`
        }
          <small>조회된 세트 17 랭크 경기 · 해당 챔피언 ${row?.boards || 0}개 보드<br>장착 보드 비율 · 여러 아이템을 장착해 합계는 100%를 넘을 수 있어요.</small>
        </div>`
      : "";

    return `
        <strong>${escape(name)}</strong>
        <div class="champion-traits-list">
          ${
            traits
              .map(
                (trait) => `
            <span>${definitions[trait]?.icon ? `<img src="${escape(definitions[trait].icon)}" alt="">` : ""}${escape(trait)}</span>`,
              )
              .join("") || "<span>시너지 정보 없음</span>"
          }
        </div>
        ${itemContent}`;
  }

  function hideChampion() {
    championTarget?.removeAttribute("aria-describedby");
    championTarget = null;
    championTooltip.hidden = true;
  }

  function showChampion(target) {
    if (tooltip.contains(target)) clearTimeout(timer);
    else hide();

    if (championTarget === target && !championTooltip.hidden) return;

    hideChampion();

    championTarget = target;
    championTooltip.innerHTML = championContent(
      target.dataset.championName,
      Boolean(target.dataset.itemStats),
    );

    if (target.dataset.itemStats && !itemStats) loadItemStats();

    championTooltip.hidden = false;

    target.setAttribute("aria-describedby", "champion-traits-tooltip");

    position(target, championTooltip);
  }

  function renderEffects(definition, active = -1) {
    return `
      <p class="trait-description">
        ${escape(definition.description)}
      </p>
      <div class="trait-levels">
        ${definition.levels
          .map(
            (effect, i) => `
          <p class="${i === active ? "is-current" : ""}">
            <span class="trait-level-check">${i === active ? "✓" : "·"}</span>
            ${escape(effect.text)}${i === active ? "<b>활성</b>" : ""}
          </p>`,
          )
          .join("")}
      </div>`;
  }

  function show(button) {
    clearTimeout(timer);

    if (button === activeButton && !tooltip.hidden) return;
    if (button.dataset.traitUsage) {
      const name = button.dataset.traitName;
      const definition = definitions[name];

      if (!definition) return;

      hide();

      activeButton = button;

      const base =
        document
          .querySelector('[data-portrait-mode="base"]')
          ?.getAttribute("aria-pressed") === "true";

      tooltip.innerHTML = `
        <div class="trait-tooltip-heading">
          <img src="${escape(definition.icon)}" alt="">
          <strong>${escape(name)}</strong>
        </div>
        ${renderEffects(definition)}
        <div class="trait-count-summary">
          <strong>소속 챔피언 ${new Set(definition.champions).size}명</strong>
        </div>
        <div class="trait-members">
          ${renderMembers(definition, [], base, false)}
        </div>`;

      tooltip.hidden = false;

      button.setAttribute("aria-describedby", "trait-tooltip");

      position(button);

      return;
    }

    const match = window.TFT_DATA.matches.find(
      (item) => item.id === button.dataset.traitMatch,
    );

    if (!match) return;

    const name = button.dataset.traitName;
    const current = traitState(
      name,
      match.units,
      match.traits.find((t) => t.name === name),
    );

    if (!current) return;

    activeButton?.removeAttribute("aria-describedby");
    activeButton = button;

    const { definition, count, level } = current;
    const base =
      document
        .querySelector('[data-portrait-mode="base"]')
        ?.getAttribute("aria-pressed") === "true";

    tooltip.innerHTML = `
      <div class="trait-tooltip-heading">
        <img src="${definition.icon}" alt="">
        <strong>${escape(name)}</strong>
      </div>
      ${renderEffects(definition, level)}
      <div class="trait-count-summary"><strong>현재 ${count}명</strong></div>
      <div class="trait-members">${renderMembers(definition, match.units, base)}</div>`;

    tooltip.hidden = false;

    button.setAttribute("aria-describedby", "trait-tooltip");

    position(button);
  }

  const list = document.getElementById("match-list");

  for (const surface of [
    list,
    allCard,
    document.getElementById("trait-usage"),
  ]) {
    surface.addEventListener("pointerover", (event) => {
      const button = event.target.closest("[data-trait-name]");

      if (button && event.pointerType !== "touch") show(button);
    });
    surface.addEventListener("pointerout", (event) => {
      const button = event.target.closest("[data-trait-name]");

      if (button && !button.contains(event.relatedTarget))
        timer = setTimeout(hide, 140);
    });
    surface.addEventListener("focusin", (event) => {
      const button = event.target.closest("[data-trait-name]");

      if (button) show(button);
    });
    surface.addEventListener("focusout", (event) => {
      if (event.target.closest("[data-trait-name]"))
        timer = setTimeout(hide, 140);
    });
    surface.addEventListener("click", (event) => {
      const button = event.target.closest("[data-trait-name]");

      if (button) show(button);
    });
  }

  list.addEventListener("click", (event) => {
    const button = event.target.closest("[data-traits-more]");

    if (button) showAll(button);
  });

  allCard.addEventListener("click", (event) => {
    if (event.target.closest("[data-traits-close]")) hideAll(true);
  });

  tooltip.addEventListener("pointerenter", () => clearTimeout(timer));
  tooltip.addEventListener("pointerleave", hide);

  // 나중에 만들어지는 챔피언 버튼도 여기서 같이 처리
  document.addEventListener("pointerover", (event) => {
    const target = event.target.closest("[data-champion-name]");

    if (target && event.pointerType !== "touch") showChampion(target);
  });

  document.addEventListener("pointerout", (event) => {
    if (
      championTarget?.contains(event.target) &&
      !championTarget.contains(event.relatedTarget)
    )
      hideChampion();
  });

  document.addEventListener("focusin", (event) => {
    const target = event.target.closest("[data-champion-name]");

    if (target) showChampion(target);
  });

  document.addEventListener("focusout", (event) => {
    if (championTarget?.contains(event.target)) hideChampion();
  });

  document.addEventListener("click", (event) => {
    const target = event.target.closest("[data-champion-name]");

    if (target) showChampion(target);
  });

  tooltip.addEventListener("focusout", (event) => {
    if (!tooltip.contains(event.relatedTarget)) timer = setTimeout(hide, 140);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      if (!allCard.hidden) {
        event.preventDefault();

        hideAll(true);
      } else {
        hide();
      }
    }
  });

  document.addEventListener("pointerdown", (event) => {
    if (
      !event.target.closest("[data-trait-name]") &&
      !tooltip.contains(event.target)
    )
      hide();

    if (
      !event.target.closest("[data-traits-more]") &&
      !allCard.contains(event.target) &&
      !tooltip.contains(event.target)
    )
      hideAll();
  });
  document.addEventListener("focusin", (event) => {
    if (
      moreButton &&
      event.target !== moreButton &&
      !allCard.contains(event.target) &&
      !tooltip.contains(event.target)
    )
      hideAll();
  });

  window.addEventListener("resize", () => hideAll());
  window.addEventListener(
    "scroll",
    (event) => {
      if (event.target instanceof Node && tooltip.contains(event.target))
        return;

      hide();

      if (!(event.target instanceof Node) || !allCard.contains(event.target))
        hideAll();
    },
    true,
  );
  window.TFT_TRAIT_UI = {
    render,
    renderGroup,
    renderMembers,
    championContent,
    allContent,
    hide: hideAll,
    traitState,
  };
})();
