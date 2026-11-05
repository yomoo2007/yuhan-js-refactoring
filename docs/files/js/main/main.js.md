# `js/main/main.js`

파일 역할: 메인 영상 준비, 게임 선택과 페이지 전환 제어.

[소스 보기](../../../../js/main/main.js) · [파일 목록](../../../FILES.md)

## 주요 기능

- CONFIG: 이동 경로, 로딩 최소 3초·최대 8초, 시차 이동량과 전환 시간을 관리합니다.
- initLoader(): 영상 준비·실패·건너뛰기를 처리하고 공통 로딩창을 닫습니다.
- setState(), enter(): 호버·초점 상태와 중복 이동 방지, 화면 전환을 처리합니다.
- ResizeObserver와 pageshow: 화면 비율과 뒤로가기 복귀 상태를 보정합니다.

## 사용처와 수정 시 확인할 점

index.html에서 TFT_LOADING이 준비된 뒤 실행합니다. ?game=lol 또는 ?game=tft는 해당 게임 페이지로 이동합니다.
