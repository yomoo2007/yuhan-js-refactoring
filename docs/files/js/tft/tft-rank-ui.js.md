# `js/tft/tft-rank-ui.js`

파일 역할: 현재 랭크 요약과 날짜별 LP 그래프 표시.

[소스 보기](../../../../js/tft/tft-rank-ui.js) · [파일 목록](../../../FILES.md)

## 주요 기능

- update(): 공유 프로필에서 현재 티어·문양·LP와 일별 기록을 읽습니다.
- renderChart(): 보관된 세트 17 기록 전체를 SVG 그래프로 그립니다.
- readPoint(), hidePoint(): 선택 지점의 날짜·티어·LP 안내와 초점 연결을 관리합니다.
- 마우스 근접 선택, 클릭·초점, 좌우 방향키와 Enter·Space·Escape를 처리합니다.

## 사용처와 수정 시 확인할 점

tft-profile-updated 이벤트로 갱신합니다. 표시 이력은 실제 조회·저장한 날짜부터 시작하며 시즌 시작까지 소급하지 않습니다.

랭크 문양은 `assets/tft/ranks/rank-{tier}.png` 규칙이며 tier는 소문자로 변환합니다.
