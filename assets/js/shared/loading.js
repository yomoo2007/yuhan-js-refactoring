/* 메인·TFT 공통 로딩 dialog와 티모 애니메이션. 파일 설명: docs/files/js/shared/loading.js.md */
/* Canvas 스프라이트와 CSS 버섯 애니메이션을 동기화하며 show()/hide()로 요청 수명에 맞춰 표시합니다. */
(() => {
  "use strict";
  const dialog = document.getElementById("loading-dialog");
  const stage = document.getElementById("loader-stage");
  const canvas = stage.querySelector(".teemo-sprite");
  const context = canvas.getContext("2d");
  const sprite = new Image();
  const flyingMushroom = stage.querySelector(".flying-mushroom");
  const mushroomColors = ["green", "red", "blue", "yellow"].map((color) => {
    const image = new Image();
    image.src = `${document.baseURI}assets/images/tft/loading/mushroom-${color}.png`;
    return { color, image };
  });
  let currentMushroomColor = -1;
  let lastThrowIndex = -1;
  function setMushroomColor(index) {
    if (index === currentMushroomColor) return;
    const variant = mushroomColors[index];
    // 이미지를 미리 불러오고 다음 색상이 준비되지 않았으면 기존 색상을 유지합니다.
    if (!variant.image.complete || !variant.image.naturalWidth) return;
    flyingMushroom.src = variant.image.src;
    flyingMushroom.dataset.color = variant.color;
    currentMushroomColor = index;
  }
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  // 1536 × 1024 시트에서 자세별 실제 영역을 지정합니다. 던지는 손이 x=512를 넘어가므로
  // 균등 격자를 사용하면 다음 자세에 손이 섞입니다. 기준점은 양발 사이와 장화 밑면입니다.
  const frames = [
    { name: "retrieve", source: [97, 56, 359, 443], anchor: [237, 493] },
    { name: "hold", source: [583, 61, 370, 437], anchor: [787, 492] },
    { name: "windup", source: [1077, 64, 429, 435], anchor: [1326, 493] },
    { name: "release", source: [63, 541, 478, 430], anchor: [287, 965] },
    { name: "recover", source: [639, 544, 340, 427], anchor: [789, 965] },
  ];
  let animationFrame;
  let currentFrame = -1;
  let startedAt = 0;
  const cycleMs = 1800;
  const releasePhase = 0.22;
  stage.style.setProperty("--loader-cycle", `${cycleMs}ms`);
  // 첫 발사에만 지연을 적용합니다. 이후 비행은 한 주기를 모두 사용하므로
  // 이전 버섯의 퇴장과 다음 발사가 빈 구간 없이 이어집니다.
  stage.style.setProperty(
    "--mushroom-release-delay",
    `${cycleMs * releasePhase}ms`,
  );
  function drawFrame(index) {
    if (!sprite.complete || !sprite.naturalWidth || currentFrame === index)
      return;
    const {
      source: [x, y, width, height],
      anchor,
    } = frames[index];
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(
      sprite,
      x,
      y,
      width,
      height,
      270 + x - anchor[0],
      485 + y - anchor[1],
      width,
      height,
    );
    currentFrame = index;
    canvas.dataset.spriteFrame = frames[index].name;
  }
  function animate(now) {
    if (!dialog.open) return;
    // 초기 지연이 포함된 CSS 재생 시각을 사용해 버섯의 매 비행 시작과
    // 티모의 던지는 자세(releasePhase)를 일치시킵니다.
    const flight = flyingMushroom.getAnimations()[0];
    const elapsed = Number(flight?.currentTime ?? now - startedAt);
    const phase = (elapsed % cycleMs) / cycleMs;
    const throwIndex = Math.floor(
      Math.max(0, elapsed - cycleMs * releasePhase) / cycleMs,
    );
    if (throwIndex !== lastThrowIndex) {
      setMushroomColor(throwIndex % mushroomColors.length);
      lastThrowIndex = throwIndex;
    }
    // 주기의 22% 지점에서 버섯을 던집니다. 던진 뒤 동작을 짧게 하고
    // 버섯이 튀는 동안 다음 버섯을 꺼내도록 자세를 전환합니다.
    drawFrame(
      reducedMotion.matches
        ? 1
        : phase < 0.12
          ? 1
          : phase < releasePhase
            ? 2
            : phase < 0.36
              ? 3
              : phase < 0.6
                ? 4
                : phase < 0.86
                  ? 0
                  : 1,
    );
    if (!reducedMotion.matches) animationFrame = requestAnimationFrame(animate);
  }
  function startSprite() {
    cancelAnimationFrame(animationFrame);
    currentFrame = -1;
    startedAt = performance.now();
    currentMushroomColor = -1;
    lastThrowIndex = -1;
    setMushroomColor(0);
    drawFrame(1);
    animationFrame = requestAnimationFrame(animate);
  }
  sprite.addEventListener("load", () => {
    cancelAnimationFrame(animationFrame);
    currentFrame = -1;
    if (dialog.open) animate(performance.now());
    else drawFrame(1);
  });
  sprite.src = `${document.baseURI}assets/images/tft/loading/teemo-throw-five.png`;
  reducedMotion.addEventListener("change", () => {
    if (dialog.open) startSprite();
  });
  let timer;
  let resolvePreview;
  let previousFocus;

  // 실제 요청을 기다리는 창을 엽니다. 이미 열려 있으면 다시 시작하지 않습니다.
  function show(title = "전적을 정찰하고 있어요") {
    if (dialog.open) return;
    previousFocus = document.activeElement;
    document.getElementById("loading-title").textContent = title;
    dialog.querySelector(".loader-demo-note").textContent =
      "전적을 불러오는 동안 계속 정찰해요.";
    dialog.showModal();
    stage.classList.add("is-playing");
    startSprite();
    document.body.classList.add("loading-open");
  }
  // 타이머·재생을 정리하고 다른 모달이 없을 때 이전 초점을 복원합니다.
  function cleanup() {
    clearTimeout(timer);
    cancelAnimationFrame(animationFrame);
    stage.classList.remove("is-playing");
    document.body.classList.remove("loading-open");
    if (
      !document.querySelector("dialog[open]:not(#loading-dialog)") &&
      previousFocus?.isConnected &&
      !previousFocus.disabled
    )
      previousFocus.focus();
  }
  // completed=false일 때만 취소 이벤트를 보냅니다. 요청 중단은 호출부가 담당합니다.
  function hide(completed = true) {
    if (!dialog.open) return;
    // close 이벤트는 비동기이므로 먼저 Promise를 완료하여 중복 해결을 막습니다.
    const resolve = resolvePreview;
    resolvePreview = null;
    cleanup();
    dialog.close();
    resolve?.(completed);
    if (!completed) window.dispatchEvent(new Event("tft-loading-cancel"));
  }
  // duration=0이면 수동으로 닫을 때까지 반복하며 완료·취소 여부를 반환합니다.
  function preview(title, { duration = 4000 } = {}) {
    if (dialog.open) return Promise.resolve(false);
    show(title);
    dialog.querySelector(".loader-demo-note").textContent = duration
      ? "로딩 미리보기"
      : "닫기 버튼을 누를 때까지 반복됩니다.";
    return new Promise((resolve) => {
      resolvePreview = resolve;
      if (duration > 0) timer = setTimeout(() => hide(true), duration);
    });
  }
  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    hide(false);
  });
  document
    .getElementById("loading-close")
    .addEventListener("click", () => hide(false));
  dialog.addEventListener("close", () => {
    // 이전 창의 비동기 close 이벤트가 새로 열린 로딩을 정리하지 않도록 합니다.
    if (dialog.open) return;
    cleanup();
    const resolve = resolvePreview;
    resolvePreview = null;
    resolve?.(false);
  });
  window.TFT_LOADING = { show, hide, preview };
})();
