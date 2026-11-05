/* 공통 게임 메뉴와 테마 선택 버튼 생성. 파일 설명: docs/files/js/shared/header.js.md */
/* 공통 게임 메뉴를 생성합니다. #site-header 요소 바로 다음에서 불러옵니다. */
(() => {
  "use strict";
  const header = document.getElementById("site-header");
  if (!header) return;
  const page = header.dataset.page || "home";
  const games = [
    { id: "home", label: "홈", href: "./index.html" },
    {
      id: "lol",
      label: "리그 오브 레전드",
      href: "./pages/lol/lolIndex.html",
    },
    {
      id: "tft",
      label: "전략적 팀 전투",
      href: "./pages/tft/tft.html",
    },
  ];
  const theme = document.documentElement.dataset.theme || "light";
  header.innerHTML = `<div class="shared-header-inner">
    <a class="shared-wordmark" href="./index.html" aria-label="PORO.GG 메인">poro<span>.gg</span><i aria-hidden="true">●</i></a>
    <nav class="shared-game-nav" aria-label="게임 선택">${games.map((game) => `<a href="${game.href}"${page === game.id ? ' class="active" aria-current="page"' : ""}${page === "home" && game.id !== "home" ? ` data-game-link="${game.id}"` : ""}>${game.label}</a>`).join("")}</nav>
    <div class="theme-switch" role="group" aria-label="화면 테마"><button type="button" data-theme-choice="light" aria-pressed="${theme === "light"}">☀ 라이트</button><button type="button" data-theme-choice="dark" aria-pressed="${theme === "dark"}">☾ 다크</button></div>
  </div>`;
})();
