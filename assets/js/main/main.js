/* 메인 영상 준비, 게임 선택과 페이지 전환 제어. 파일 설명: docs/files/js/main/main.js.md */
"use strict";

// 설정값 (팀 프로젝트 경로 확정 시 여기만 수정)
const CONFIG = {
  lolPage: "./pages/lol/lolIndex.html",
  tftPage: "./pages/tft/tft.html",
  parallax: { x: 10, y: 6 }, // 영상 이동 최대 px
  transitionDuration: 450, // 클릭 후 페이지 이동까지 ms
};

const $ = (s) => document.querySelector(s);
const stage = $("#stage"),
  fade = $("#fade");
const panels = { lol: $("#lol"), tft: $("#tft") };
const isTouch = window.matchMedia("(hover: none)").matches;
const reduceMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;
let isTransitioning = false;
document.querySelectorAll("[data-game-link]").forEach((link) =>
  link.addEventListener("click", (event) => {
    if (
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey ||
      event.altKey ||
      event.button !== 0
    )
      return;
    event.preventDefault();
    enter(link.dataset.gameLink);
  }),
);

// 메인 화면은 바로 표시하고 영상 실패 시 배경을 유지합니다.
stage.classList.add("ready");
document.querySelectorAll(".cinematic video").forEach((video) => {
  const fail = () => video.closest(".cinematic").classList.add("no-video");
  video.addEventListener("error", fail, { once: true });
  video.querySelector("source").addEventListener("error", fail, { once: true });
  video.play()?.catch(() => {});
});
const initialGame = new URLSearchParams(location.search).get("game");
if (initialGame === "lol" || initialGame === "tft") enter(initialGame);

// 선택 / 호버
function setState(s) {
  if (!isTransitioning) stage.dataset.state = s;
}

Object.entries(panels).forEach(([game, el]) => {
  if (!isTouch) {
    el.addEventListener("mouseenter", () => {
      setState(game);
    });
    el.addEventListener("mouseleave", () => {
      setState("");
    });
  }
  el.addEventListener("focus", () => setState(game));
  el.addEventListener("blur", () => setState(""));
  el.addEventListener("click", (e) => {
    if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey || e.button !== 0)
      return;
    e.preventDefault();
    if (isTransitioning) return;

    enter(game);
  });
});

// 클릭 전환
function enter(game) {
  if (isTransitioning) return;
  isTransitioning = true;
  const url = game === "lol" ? CONFIG.lolPage : CONFIG.tftPage;
  stage.classList.add("go");
  stage.dataset.state = "go-" + game;
  setTimeout(() => fade.classList.add("on"), CONFIG.transitionDuration * 0.55);
  setTimeout(() => { window.location.href = url; }, reduceMotion ? 0 : CONFIG.transitionDuration);
}

// 마우스 이동에 따라 영상을 부드럽게 움직이는 시차 효과를 적용합니다.
if (!isTouch) {
  let mx = innerWidth / 2,
    my = innerHeight / 2,
    px = 0,
    py = 0,
    running = false;
  const medias = document.querySelectorAll(".media");

  addEventListener(
    "mousemove",
    (e) => {
      mx = e.clientX;
      my = e.clientY;
      if (!running) {
        running = true;
        requestAnimationFrame(loop);
      }
    },
    { passive: true },
  );

  function loop() {
    if (!reduceMotion) {
      const tx = -(mx / innerWidth - 0.5) * 2 * CONFIG.parallax.x;
      const ty = -(my / innerHeight - 0.5) * 2 * CONFIG.parallax.y;
      px += (tx - px) * 0.08;
      py += (ty - py) * 0.08;
      stage.style.setProperty("--px", px.toFixed(2) + "px");
      stage.style.setProperty("--py", py.toFixed(2) + "px");
      medias.forEach((m) => {
        m.firstElementChild.style.transform =
          "translate3d(" + px.toFixed(2) + "px," + py.toFixed(2) + "px,0)";
      });
    }
    const moving =
      !reduceMotion &&
      Math.abs(px + (mx / innerWidth - 0.5) * 2 * CONFIG.parallax.x) +
        Math.abs(py + (my / innerHeight - 0.5) * 2 * CONFIG.parallax.y) >
        0.05;
    if (moving) requestAnimationFrame(loop);
    else running = false;
  }
}

/* 뒤로가기(bfcache) 복귀 시 상태 초기화 */
addEventListener("pageshow", (e) => {
  if (e.persisted) {
    isTransitioning = false;
    stage.className = "stage ready";
    stage.dataset.state = "";
    fade.classList.remove("on");
  }
});

// 화면 비율이 바뀌어도 영상의 부드러운 경계와 클릭 영역의 기울기를 맞춥니다.
new ResizeObserver(([entry]) => {
  const { width, height } = entry.contentRect;
  if (!width || !height) return;
  const mobile = matchMedia("(max-width:768px)").matches;
  const angle = mobile
    ? 180 - (Math.atan((0.08 * height) / width) * 180) / Math.PI
    : 90 + (Math.atan((0.2 * width) / height) * 180) / Math.PI;
  stage.style.setProperty("--seam-angle", angle + "deg");
}).observe(stage);
