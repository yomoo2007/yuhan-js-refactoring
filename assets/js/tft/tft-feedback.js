/* 검색 실패나 플레이어 없음 안내창 */
/* 오류 종류에 맞는 그림을 보여주고 재시도할 작업을 보관 */
(() => {
  "use strict";
  const dialog = document.getElementById("feedback-dialog");
  const action = document.getElementById("feedback-action");
  let retryRequest,
    notFound = false,
    previousFocus;

  function close() {
    dialog.close();
  }

  // 유저를 못 찾았으면 검색어 수정 안내, 그 외에는 오류 안내
  function show(error, { retry } = {}) {
    notFound = error.kind === "not-found";
    retryRequest = retry;
    previousFocus = document.activeElement;

    dialog.dataset.kind = notFound ? "not-found" : "error";

    const art = document.getElementById("feedback-art");

    art.src = `${document.baseURI}assets/images/tft/feedback/teemo-${notFound ? "not-found" : "error"}.png`;
    art.alt = notFound
      ? "돋보기로 플레이어를 찾는 티모"
      : "지도를 들고 난감해하는 티모";

    document.getElementById("feedback-title").textContent = notFound
      ? "플레이어를 찾지 못했어요"
      : "정찰 중 잠시 길을 잃었어요";
    document.getElementById("feedback-description").textContent = notFound
      ? "Riot ID의 이름#태그와 선택한 서버를 확인해 주세요."
      : "전적을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.";

    const detail = document.getElementById("feedback-detail");

    detail.textContent = error.message || "";

    detail.hidden = !detail.textContent;
    action.textContent = notFound
        ? "검색어 수정"
        : retry
          ? "다시 시도"
          : "확인";

    dialog.showModal();
    action.focus();
  }

  action.addEventListener("click", () => {
    const retry = retryRequest,
      edit = notFound,
      shouldRetry = !notFound && retry;

    close();

    if (edit) {
      const input = document.getElementById("riot-id");

      input.focus();
      input.select();
    } else if (shouldRetry) retry();
  });

  document.getElementById("feedback-close").addEventListener("click", close);
  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();

    close();
  });

  dialog.addEventListener("close", () => {
    // 다시 검색 중이거나 ID를 수정 중이면 현재 선택 위치 유지
    if (
      !document.querySelector("dialog[open]") &&
      document.activeElement === document.body &&
      previousFocus?.isConnected
    )
      previousFocus.focus();
  });

  window.TFT_FEEDBACK = { show, hide: close };
})();
