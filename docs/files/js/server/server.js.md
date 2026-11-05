# `js/server/server.js`

파일 역할: 정적 파일 제공, Riot 프록시와 응답 캐시 서버.

[소스 보기](../../../../js/server/server.js) · [파일 목록](../../../FILES.md)

## 주요 기능

- riot(): 허용 경로와 지역을 검사하고 서버에서 X-Riot-Token을 추가합니다.
- 동일 요청은 pending으로 합치고 SHA-256 파일명으로 .tft-cache에 저장합니다.
- main(): 아이템 통계를 복원하고 API·정적 파일·영상 Range 요청을 처리합니다.
- 상태 조회 /api/tft/status, 통계 /api/tft/item-stats, 프록시 /api/tft/riot 및 /api/lol/riot를 제공합니다.
- 상태 응답의 projectId는 실제 프로젝트 폴더의 해시이며 실행기의 서버 재사용 판정에 사용합니다.

## 사용처와 수정 시 확인할 점

Node.js 20 이상 내장 모듈만 사용합니다. 기본 포트 5174, 환경 변수 TFT_PORT로 변경하며 127.0.0.1에 바인딩합니다. 매치 상세 7일, 리그·페이지 매치 목록 60초, 나머지 1시간 캐시입니다. force=1도 매치 상세 캐시는 우회하지 않습니다.
