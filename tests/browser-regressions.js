/* 실제 DOM에서 탐색·상세 펼침·초점 보존을 검사합니다. docs/TESTING.md */
(async () => {
  const report = document.getElementById("results");
  const assert = (condition, message) => { if (!condition) throw new Error(message); };
  const settle = () => new Promise((resolve) => setTimeout(resolve, 50));
  async function check(name, run) {
    await run();
    const line = document.createElement("li");
    line.textContent = `통과: ${name}`;
    report.append(line);
  }
  try {
    const frame = document.getElementById("app");
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error("검사 화면 로딩 시간 초과")), 15000);
      frame.onload = () => { clearTimeout(timeout); resolve(); };
      frame.src = "/tests/tft.html?name=Initial&tag=KR1&region=KR";
    });
    const w = frame.contentWindow;
    const doc = w.document;
    assert(w.fixture?.requests.length === 1, "TFT 초기화 실패");
    await check("직접 접속·갱신 시 방문 기록 중복 방지", async () => {
      const count = w.history.length;
      w.fixture.requests[0].resolve();
      await settle();
      assert(w.history.length === count, "초기 조회가 방문 기록을 추가했습니다");
      doc.getElementById("refresh").click();
      w.fixture.requests.at(-1).resolve();
      await settle();
      assert(w.history.length === count, "같은 프로필 갱신이 방문 기록을 추가했습니다");
    });
    await check("뒤로가기 후 이전 응답·finally가 새 검색에 영향 없음", async () => {
      const old = w.fixture.search("Old");
      w.fixture.navigate("");
      assert(old.signal.aborted && !doc.getElementById("search-empty").hidden, "뒤로가기에서 요청이 취소되지 않았습니다");
      const next = w.fixture.search("New");
      old.resolve();
      await settle();
      assert(doc.getElementById("refresh").disabled, "이전 finally가 새 검색 버튼을 복구했습니다");
      assert(doc.getElementById("loading-dialog").open, "이전 요청이 새 로딩을 닫았습니다");
      assert(doc.getElementById("loader-stage").classList.contains("is-playing"), "이전 close 이벤트가 새 로딩 재생을 중단했습니다");
      assert(!doc.getElementById("search-empty").hidden, "이전 응답이 검색 안내를 덮어썼습니다");
      next.resolve();
      await settle();
      assert(w.TFT_DATA.account.gameName === "New", "새 검색 결과가 반영되지 않았습니다");
      assert(!doc.getElementById("feedback-dialog").open, "취소가 오류 안내를 표시했습니다");
    });
    await check("연속 탐색에서 마지막 URL의 결과만 반영", async () => {
      w.fixture.navigate("?name=First&tag=KR1&region=KR");
      const first = w.fixture.requests.at(-1);
      w.fixture.navigate("?name=Last&tag=KR1&region=KR");
      const last = w.fixture.requests.at(-1);
      assert(first !== last && first.signal.aborted, "연속 탐색이 무시되었습니다");
      last.resolve();
      await settle();
      first.resolve();
      await settle();
      assert(w.TFT_DATA.account.gameName === "Last", "늦은 응답이 마지막 검색을 덮어썼습니다");
      assert(doc.getElementById("riot-id").value === "Last#KR1", "검색 입력값이 복원되지 않았습니다");
    });
    await check("추가 수집 중 매치 상세·초점·시너지 패널 유지", async () => {
      w.fixture.search("History").resolve(true);
      await settle();
      const season = w.fixture.seasons.at(-1);
      const card = doc.querySelector("#match-list > [data-match-id]");
      const button = card.querySelector("[data-match]");
      button.click();
      button.focus({ preventScroll: true });
      season.options.onPage(w.fixture.page(1));
      assert(doc.querySelector("#match-list > [data-match-id]") === card, "기존 카드를 교체했습니다");
      assert(!card.querySelector(".match-detail").hidden, "매치 상세를 닫았습니다");
      assert(doc.activeElement === button, "키보드 초점이 유실되었습니다");
      const more = doc.querySelector("[data-traits-more]");
      more.click();
      const close = doc.querySelector("[data-traits-close]");
      season.options.onPage(w.fixture.page(2));
      assert(!doc.getElementById("trait-all-card").hidden, "시너지 패널을 닫았습니다");
      assert(doc.activeElement === close, "패널 초점이 유실되었습니다");
      season.resolve({ nextStart: 22, hasMore: false, failedMatchIds: [] });
      await settle();
      assert(!doc.getElementById("trait-all-card").hidden, "수집 완료 시 패널을 닫았습니다");
      assert(!card.querySelector(".match-detail").hidden, "수집 완료 시 상세를 닫았습니다");
    });
    await check("초상화 변경 시 펼친 상세 상태 유지", async () => {
      doc.querySelector("[data-traits-close]").click();
      const matchId = doc.querySelector("#match-list > [data-match-id]").dataset.matchId;
      doc.querySelector('[data-portrait-mode="base"]').click();
      const card = [...doc.querySelectorAll("#match-list > [data-match-id]")].find((entry) => entry.dataset.matchId === matchId);
      assert(!card.querySelector(".match-detail").hidden, "초상화 변경으로 펼친 상세를 잃었습니다");
    });
    document.getElementById("status").textContent = "전체 통과 (5개 브라우저 회귀 검사)";
    document.documentElement.dataset.result = "passed";
  } catch (error) {
    document.getElementById("status").textContent = `실패: ${error.message}`;
    document.documentElement.dataset.result = "failed";
    console.error(error);
  }
})();
