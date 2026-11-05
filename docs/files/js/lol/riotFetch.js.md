# `js/lol/riotFetch.js`

파일 역할: LoL 페이지의 로컬 Riot API 프록시 호출.

[소스 보기](../../../../js/lol/riotFetch.js) · [파일 목록](../../../FILES.md)

## 주요 기능

- riotFetch(path, game = "lol"): URL의 region 값을 읽고 /api/lol/riot 또는 /api/tft/riot를 호출합니다.
- 실패 응답의 message를 Error로 전달합니다.

## 사용처와 수정 시 확인할 점

lolIndex.js에서 사용합니다. API 키를 받지 않으며 서버의 허용 경로만 호출할 수 있습니다.
