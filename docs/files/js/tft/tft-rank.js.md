# `js/tft/tft-rank.js`

파일 역할: 티어·LP 변환과 한국 시간 기준 일별 랭크 계산.

[소스 보기](../../../../js/tft/tft-rank.js) · [파일 목록](../../../FILES.md)

## 주요 기능

- TFT_RANK.score(): 티어·단계·LP를 비교 가능한 점수로 변환합니다.
- dayKey(): Asia/Seoul 기준 날짜 문자열을 만듭니다.
- dailySeries(): 시즌·큐별로 유효한 날짜의 마지막 기록을 선택합니다.
- dayChange(): 오늘·어제 기록이 모두 있을 때만 차이를 반환합니다.
- scoreLabel(), label(), colors: 그래프용 문자열과 티어 색상을 제공합니다.

## 사용처와 수정 시 확인할 점

tft-store.js와 tft-rank-ui.js에서 사용합니다. 현재 UI는 dayChange 결과를 별도 표시하지 않습니다. 매치 결과로 과거 LP를 추정하지 않습니다.
