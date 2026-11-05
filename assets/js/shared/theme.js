/* 라이트·다크 테마 적용과 브라우저 저장. 파일 설명: docs/files/js/shared/theme.js.md */
(() => {
  "use strict";
  let theme;
  try {
    theme = localStorage.getItem("poro-theme");
  } catch {}
  if (!["light", "dark"].includes(theme))
    theme = matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  // 문서의 테마 값과 선택 버튼의 접근성 상태를 함께 맞춥니다.
  function apply(value) {
    document.documentElement.dataset.theme = value;
    document
      .querySelectorAll("[data-theme-choice]")
      .forEach((button) =>
        button.setAttribute(
          "aria-pressed",
          String(button.dataset.themeChoice === value),
        ),
      );
  }
  apply(theme);
  document.addEventListener("DOMContentLoaded", () => apply(theme));
  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-theme-choice]");
    if (!button) return;
    theme = button.dataset.themeChoice;
    apply(theme);
    try {
      localStorage.setItem("poro-theme", theme);
    } catch {}
  });
  window.addEventListener("storage", (event) => {
    if (
      event.key === "poro-theme" &&
      ["light", "dark"].includes(event.newValue)
    ) {
      theme = event.newValue;
      apply(theme);
    }
  });
})();
