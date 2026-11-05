# `js/shared/header.js`

파일 역할: 공통 게임 메뉴와 테마 선택 버튼 생성.

[소스 보기](../../../../js/shared/header.js) · [파일 목록](../../../FILES.md)

## 주요 기능

- #site-header의 data-page 값(home/lol/tft)으로 현재 메뉴를 표시합니다.
- 게임별 링크와 data-theme-choice 버튼을 생성합니다.

## 사용처와 수정 시 확인할 점

세 HTML 모두 #site-header 바로 다음에서 실행합니다. 실제 테마 변경 이벤트는 theme.js에서 처리합니다.
