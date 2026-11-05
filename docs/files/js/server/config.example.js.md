# `js/server/config.example.js`

파일 역할: 서버 전용 Riot API 키 설정 예시.

[소스 보기](../../../../js/server/config.example.js) · [파일 목록](../../../FILES.md)

## 주요 기능

- module.exports의 TFT_API_KEY와 LOL_API_KEY 항목을 제공합니다.

## 사용처와 수정 시 확인할 점

같은 폴더에 config.js로 복사하고 키를 입력합니다. 실제 config.js는 Git에서 제외되며 서버 전용 파일은 HTTP로 제공하지 않습니다. 키 변경 후 서버를 재시작합니다.
