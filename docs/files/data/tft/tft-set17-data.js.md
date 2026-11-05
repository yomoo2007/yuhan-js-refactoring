# `data/tft/tft-set17-data.js`

파일 역할: TFT 세트 17 챔피언·특성·아이템·전설이 정적 데이터.

[소스 보기](../../../../data/tft/tft-set17-data.js) · [파일 목록](../../../FILES.md)

## 주요 기능

- TFT_SET17에 champions, traits, items, companions와 샘플 조합 데이터를 제공합니다.
- 챔피언 baseId와 스킨 경로, 특성 조건과 설명, 아이템 이름·아이콘을 연결합니다.

## 사용처와 수정 시 확인할 점

자동 생성된 큰 데이터 파일입니다. 값 전체를 수동 번역하거나 재정렬하지 않습니다. 기본 초상화 경로는 shared/assets.js에서 관리합니다. 이미지·메타데이터 교체 시 tft-sw.js 캐시 버전도 검토합니다.

프로젝트에 포함해 배포하는 원본 정적 데이터이므로 `data/tft/`에서 관리합니다. `.tft-cache/`는 실행 중 서버가 생성하는 응답·집계 캐시이며 이 데이터 파일의 보관 위치로 사용하지 않습니다. 현재 화면은 `defer` 스크립트 순서에 의존하므로 `TFT_SET17`을 제공하는 JavaScript 형식을 유지합니다.

로컬 이미지 이름은 소문자·하이픈을 사용하며 `champion-teemo.png`, `trait-space-groove.png`, `item-infinity-edge.png`처럼 종류를 구분합니다. Riot 데이터의 키는 원문을 유지합니다. [에셋 이름과 변경표](../../../ASSETS.md)를 참고하세요.
