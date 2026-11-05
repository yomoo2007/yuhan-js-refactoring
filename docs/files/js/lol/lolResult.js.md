# `js/lol/lolIndex.js`

파일 역할: LoL 검색 검증과 실제 프로필 표시.

[소스 보기](../../../../js/lol/lolIndex.js) · [파일 목록](../../../FILES.md)

## 주요 기능

- 이름#태그 입력을 검사하고 gameName/tag/region 쿼리로 페이지를 이동합니다.
- loadProfile(): 계정 PUUID → 소환사 → 공개 버전 순서로 프로필을 조회합니다.
- 검색값이 있을 때만 window.onload에서 조회하며 오류는 프로필 영역에 표시합니다.

## 사용처와 수정 시 확인할 점

lolIndex.html의 폼과 프로필 요소에 의존합니다. TFT dialog 모듈은 사용하지 않습니다.
