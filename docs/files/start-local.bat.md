# `start-local.bat`

파일 역할: Windows에서 로컬 서버 실행기를 여는 시작 파일.

[소스 보기](../../start-local.bat) · [파일 목록](../FILES.md)

## 주요 기능

- 현재 폴더를 프로젝트로 맞추고 PATH 또는 기본 설치 경로에서 node.exe를 찾습니다.
- assets/js/server/start-local.js를 실행하고 실패 시 창을 유지합니다.

## 사용처와 수정 시 확인할 점

더블 클릭해 사용합니다. Node.js 20 이상이 필요합니다. BAT의 문자 인코딩 호환성을 위해 실행 내용은 유지했습니다.
