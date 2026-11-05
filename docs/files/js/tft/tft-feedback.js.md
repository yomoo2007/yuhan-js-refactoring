# `js/tft/tft-feedback.js`

파일 역할: TFT 검색 실패·플레이어 없음 dialog 표시.

[소스 보기](../../../../js/tft/tft-feedback.js) · [파일 목록](../../../FILES.md)

## 주요 기능

- TFT_FEEDBACK.show(error, { retry, preview }): kind에 따라 그림·문구·버튼 동작을 선택합니다.
- TFT_FEEDBACK.hide(): 탐색 전환 등에서 이전 오류 안내창을 닫습니다.
- 플레이어 없음은 입력창 수정, 일반 실패는 전달받은 재시도 함수를 실행합니다.
- 미리보기는 재시도를 실행하지 않으며 닫힌 뒤 초점을 보정합니다.

## 사용처와 수정 시 확인할 점

tft.html의 feedback-dialog 및 riot-id 요소가 필요합니다. 로딩창을 닫은 뒤 show를 호출합니다. 안내창 버튼·Escape 또는 공개 hide()로 닫습니다.

창 호출 방법과 필수 요소는 [dialog 사용 가이드](../../../DIALOG-GUIDE.md)를 참고하세요.
