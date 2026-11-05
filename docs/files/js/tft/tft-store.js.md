# `js/tft/tft-store.js`

파일 역할: 브라우저별 날짜별 랭크 기록 저장과 서비스 워커 등록.

[소스 보기](../../../../js/tft/tft-store.js) · [파일 목록](../../../FILES.md)

## 주요 기능

- TFT_STORE.readRanks(puuid): 현재 키 또는 예전 current 키의 랭크 기록을 읽습니다.
- recordRank(puuid, rank): 한국 시간으로 같은 날짜의 값을 최신 조회값으로 교체합니다.
- file: 이외 환경에서 ./tft-sw.js 등록을 시도합니다.

## 사용처와 수정 시 확인할 점

TFT_RANK가 먼저 필요합니다. 키는 tft:set17:rank:{puuid}이며 현재 코드에는 120개 제한이 없습니다. 조회하지 않은 날짜의 기록은 생성하지 않습니다.
