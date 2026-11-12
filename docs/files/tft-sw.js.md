# `tft-sw.js`

파일 역할: TFT 이미지와 정적 메타데이터의 브라우저 캐시.

[소스 보기](../../tft-sw.js) · [파일 목록](../FILES.md)

## 주요 기능

- 설치 직후 활성화를 요청하고 activate에서 이전 tft-set17-assets-* 캐시를 제거합니다.
- 로컬 assets/tft·assets/shared·세트 메타데이터와 CommunityDragon 이미지를 캐시 우선으로 제공합니다.
- 세트 메타데이터의 캐시 경로는 /data/tft/tft-set17-data.js입니다.
- 현재 캐시 버전은 `tft-set17-assets-16.9-v6`입니다.
- 캐시 열기·읽기·쓰기 실패 시에도 정상 네트워크 응답을 제공합니다. 이전 캐시 정리 실패도 워커 활성화를 막지 않습니다.

## 사용처와 수정 시 확인할 점

tft-rank.js에서 등록합니다. Riot API 응답은 대상이 아닙니다. 정적 자산 교체 시 NAME을 변경해 이전 캐시가 남지 않게 합니다.
