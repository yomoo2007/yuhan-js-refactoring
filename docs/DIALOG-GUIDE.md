# dialog 사용 가이드

[문서 목차](README.md) · [파일별 기능](FILES.md)

## 현재 사용하는 창

| 창 | 페이지 | 구현 | 제어 코드 |
| --- | --- | --- | --- |
| 공통 로딩창 `#loading-dialog` | 메인, TFT | `<dialog>`와 `showModal()` | `js/shared/loading.js` |
| 오류·플레이어 없음 `#feedback-dialog` | TFT | `<dialog>`와 `showModal()` | `js/tft/tft-feedback.js` |
| 전체 시너지 `#trait-all-card` | TFT | `<div role="dialog" aria-modal="false" hidden>` | `js/tft/tft-traits.js` |

네이티브 모달은 배경과의 상호작용을 막습니다. 전체 시너지 패널은 비모달이므로 배경을 가리지 않고 외부 클릭·초점 이동으로 닫힙니다. 메인의 예전 검색창 `#search-dialog`는 현재 HTML에 없습니다. LoL은 검색 폼과 프로필 영역에 안내하며 이 dialog 모듈들을 불러오지 않습니다.

## 공통 로딩창

### 준비할 파일과 요소

`css/tft-loading.css`를 불러오고 `index.html` 또는 `tft.html`의 로딩창 마크업 전체를 사용합니다. 마크업이 준비된 뒤 `js/shared/loading.js`를 실행합니다. `defer`를 사용하거나 `</body>` 앞에서 불러오면 됩니다.

| 필수 요소 | 용도 |
| --- | --- |
| `#loading-dialog` | 네이티브 dialog |
| `#loader-stage` | 애니메이션 영역과 CSS 변수 |
| `.teemo-sprite` | 2D Canvas. 기존 width·height 유지 |
| `.flying-mushroom` | 비행 이미지와 CSS 재생 시계 |
| `#loading-title`, `#loading-description` | 접근성 제목·설명 |
| `.loader-demo-note` | 실제 로딩·미리보기 안내 |
| `#loading-close` | 닫기·취소 버튼 |

그림은 `assets/tft/loading/`에 있습니다. 모듈은 필수 DOM이 존재한다고 가정하므로 창 마크업 없이 스크립트만 불러오면 오류가 발생합니다.

### 공개 API

| 호출 | 동작·반환값 |
| --- | --- |
| `TFT_LOADING.show(title)` | 창을 열고 재생합니다. 기본 제목은 “전적을 정찰하고 있어요”. 반환값 없음 |
| `TFT_LOADING.hide()` 또는 `hide(true)` | 정상 종료하고 미리보기 Promise를 `true`로 완료합니다 |
| `TFT_LOADING.hide(false)` | 취소 종료하고 Promise를 `false`로 완료한 뒤 `tft-loading-cancel` 이벤트를 발생시킵니다 |
| `TFT_LOADING.preview(title, { duration: 4000 })` | 4초 후 정상 종료합니다. `Promise<boolean>` 반환 |
| `TFT_LOADING.preview(title, { duration: 0 })` | 닫기·Escape까지 반복합니다 |

이미 열려 있을 때 `show()`는 아무 작업도 하지 않고, `preview()`는 즉시 `false`를 반환합니다. `preview()`의 옵션을 생략하면 4초입니다. 닫기 버튼과 Escape는 `hide(false)`로 연결됩니다. 배경 클릭으로는 닫히지 않습니다.

`show()`는 실제 요청이 끝날 때까지 자동으로 닫히지 않습니다. 요청 종료 시 반드시 `finally`에서 `hide()`를 호출합니다. 네이티브 `dialog.close()`만 직접 호출하면 취소 이벤트가 전달되지 않으므로 공개 API를 사용합니다.

### 요청과 취소 연결 예제

다음 예제는 필수 마크업과 모듈이 준비된 TFT 페이지에서 실행하는 코드입니다. 현재 실제 화면에서는 `js/tft/tft.js`의 내부 `loading()` 함수가 중복 실행 방지와 버튼 복구까지 함께 처리합니다.

```js
async function requestWithLoading() {
  const controller = new AbortController();
  const cancel = () => controller.abort();
  let failure;

  window.addEventListener("tft-loading-cancel", cancel);
  TFT_LOADING.show("전적을 불러오고 있어요");
  try {
    return await TFT_API.loadProfile({
      gameName: "플레이어 이름",
      tagLine: "KR1",
      options: { region: "KR", signal: controller.signal },
    });
  } catch (error) {
    if (error.name !== "AbortError") failure = error;
  } finally {
    TFT_LOADING.hide();
    window.removeEventListener("tft-loading-cancel", cancel);
    if (failure) {
      TFT_FEEDBACK.show(failure, { retry: requestWithLoading });
    }
  }
}
```

로딩창 자체는 `fetch`를 중단하지 않습니다. 이벤트를 받은 호출부가 `AbortController.abort()`를 실행하고 동일한 `signal`을 요청에 전달해야 합니다. 정상 완료는 취소 이벤트를 발생시키지 않습니다.

```js
const completed = await TFT_LOADING.preview("로딩 미리보기", {
  duration: 4000,
});
// 시간 경과 또는 hide(true)는 true, 닫기·Escape는 false입니다.
```

메인은 영상이 모두 준비되면 최소 3초 뒤 창을 닫고 최대 8초까지 기다립니다. 닫기·Escape는 영상 준비를 건너뛰어 메인 선택 화면을 표시합니다. TFT의 ‘로딩 미리보기’ 버튼은 `duration: 0`으로 수동 종료할 때까지 반복합니다.

## 오류 안내창

### 준비와 호출

`tft.html`의 오류창 마크업, `css/tft-extras.css`, `js/tft/tft-feedback.js`가 필요합니다. 필수 ID는 `feedback-dialog`, `feedback-action`, `feedback-close`, `feedback-art`, `feedback-title`, `feedback-description`, `feedback-detail`입니다. 플레이어 없음 상태에서 검색어를 수정할 `#riot-id` 입력창도 필요합니다.

```js
TFT_FEEDBACK.show(
  { kind: "not-found", message: "해당 서버에서 플레이어를 찾지 못했습니다." },
);

TFT_FEEDBACK.show(
  { kind: "error", message: "잠시 후 다시 시도해 주세요." },
  { retry: () => requestWithLoading() },
);

// 화면만 확인하며 실제 검색·재시도는 실행하지 않습니다.
TFT_FEEDBACK.show({ kind: "error" }, { preview: true });
TFT_FEEDBACK.show({ kind: "not-found" }, { preview: true });
```

| 상태 | 주요 버튼 | 클릭 결과 |
| --- | --- | --- |
| `error.kind === "not-found"` | 검색어 수정 | 창을 닫고 Riot ID 입력값 전체 선택 |
| 일반 오류 + `retry` 함수 | 다시 시도 | 창을 닫고 해당 함수 실행 |
| 일반 오류, 재시도 없음 | 확인 | 창 닫기 |
| `{ preview: true }` | 미리보기 닫기 | 창만 닫기 |

`show()`는 값을 반환하지 않습니다. 닫기 버튼·Escape·주요 버튼 또는 공개 `TFT_FEEDBACK.hide()`로 닫습니다. hide()는 탐색 시 이전 오류 안내를 닫는 데 사용합니다. 배경 클릭으로 닫는 처리는 없습니다. 재시도 함수는 전달받은 그대로 호출하므로 동일한 이름·태그·지역으로 다시 검색할 함수와 로딩·예외 처리를 전달해야 합니다.

`tft-api.js`는 계정·TFT 소환사 조회 404만 `not-found`로 분류합니다. 매치 조회 404를 플레이어 없음으로 표시하지 않습니다. 요청 취소는 오류 안내에서 제외합니다. 로딩창을 먼저 닫은 뒤 오류 안내창을 열어 두 모달이 겹치지 않도록 합니다.

### 버튼 정렬

공통 `.primary-button`은 `display: flex`를 사용합니다. 오류창에서는 `.feedback-dialog .primary-button`에 `display: inline-flex; justify-content: center`를 적용해 창의 `text-align: center`로 버튼 자체를 가운데 배치하고 버튼 문구도 가운데에 둡니다. 프로필의 갱신 버튼 등 다른 사용처는 공통 스타일을 유지합니다.

## 전체 시너지 패널

`#trait-all-card`는 네이티브 `<dialog>`가 아니므로 `showModal()`과 `close()`를 호출하지 않습니다. 모듈이 `hidden`으로 표시 상태를 바꿉니다.

1. `TFT_TRAIT_UI.renderGroup(match)`가 활성 시너지 최대 4개를 만듭니다.
2. 활성 시너지가 4개보다 많으면 `data-traits-more="매치 ID"` 버튼을 추가합니다.
3. `#match-list` 안의 해당 버튼을 누르면 내부 `showAll()`이 `TFT_DATA.matches`에서 매치를 찾아 패널을 채웁니다.
4. 활성·비활성 시너지를 나누어 표시하고 패널의 닫기 버튼으로 초점을 옮깁니다.

```js
// 기존 #match-list 영역에 렌더링할 때 사용합니다.
const html = TFT_TRAIT_UI.renderGroup(match);

// 외부에서 전체 시너지 패널과 관련 툴팁을 닫을 때 사용합니다.
TFT_TRAIT_UI.hide();
```

`allContent(match)`는 내용 HTML만 반환하며 창을 열지는 않습니다. `showAll()`은 공개 API가 아닙니다. 버튼을 새 영역에 옮기면 해당 영역에도 이벤트 위임이 필요합니다. 매치 ID는 공유 `TFT_DATA.matches`에 존재해야 합니다.

닫기 버튼, 같은 더보기 버튼 재클릭, Escape는 열기 버튼으로 초점을 되돌립니다. 외부 클릭·패널 밖 초점 이동·창 크기 변경·외부 스크롤은 패널을 닫습니다. 패널 내부 스크롤은 유지합니다. `TFT_TRAIT_UI.hide()`의 호출은 초점을 강제로 복원하지 않습니다.

관련 툴팁 `#trait-tooltip`, `#champion-traits-tooltip`, `#rank-chart-tooltip`는 `role="tooltip"`이며 모달이 아닙니다. 앞의 두 개는 `tft-traits.js`, 랭크 툴팁은 `tft-rank-ui.js`에서 관리합니다.

## 동작 확인 순서

- TFT 프로필의 ‘로딩 미리보기’를 눌러 반복 재생과 닫기·Escape를 확인합니다.
- ‘실패 화면’, ‘유저 없음’에서 문구·주요 버튼의 중앙 정렬·초점 이동을 확인합니다.
- 실제 요청 취소 시 오류창이 뜨지 않고 비활성 버튼이 복구되는지 확인합니다.
- 시너지가 많은 매치에서 더보기·닫기·외부 클릭과 키보드 이동을 확인합니다.
- 다크 테마와 좁은 화면에서 창이 화면을 벗어나지 않는지 확인합니다.
