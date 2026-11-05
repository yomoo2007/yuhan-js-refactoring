# `js/server/start-local.js`

파일 역할: 로컬 서버 준비 확인과 브라우저 실행.

[소스 보기](../../../../js/server/start-local.js) · [파일 목록](../../../FILES.md)

## 주요 기능

- isProjectServerReady(): /api/tft/status의 세트·설정값 형태와 현재 폴더의 projectId를 확인합니다.
- isPortBusy(): 다른 프로세스의 포트 점유 여부를 검사합니다.
- startServer(): 서버를 숨김 백그라운드 프로세스로 실행하고 최대 30초 준비를 기다립니다.
- openBrowser(), main(): 포트·Node 버전을 검사한 뒤 기본 브라우저를 엽니다.

## 사용처와 수정 시 확인할 점

start-local.bat에서 호출합니다. .tft-preview.log와 .tft-preview-error.log에 서버 로그를 남깁니다. 이미 준비된 프로젝트 서버는 재사용합니다.

다른 폴더의 복사본 또는 projectId가 없는 이전 서버는 재사용하지 않습니다. 같은 포트를 점유하고 있으면 기존 서버 종료 또는 TFT_PORT 변경을 안내합니다. 식별값 계산은 project-id.js를 서버와 공유합니다.
