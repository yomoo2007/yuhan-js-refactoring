# `js/shared/theme.js`

파일 역할: 라이트·다크 테마 적용과 브라우저 저장.

[소스 보기](../../../../js/shared/theme.js) · [파일 목록](../../../FILES.md)

## 주요 기능

- apply(): html의 data-theme와 테마 버튼의 aria-pressed를 갱신합니다.
- 저장값이 없으면 운영체제의 색상 선호를 사용합니다.
- 클릭과 storage 이벤트로 현재 화면 및 다른 탭의 테마를 동기화합니다.

## 사용처와 수정 시 확인할 점

세 HTML의 head에서 실행합니다. localStorage 키는 poro-theme입니다. theme.css 및 header.js와 함께 사용합니다.
