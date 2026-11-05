# `js/shared/loading.js`

파일 역할: 메인·TFT 공통 로딩 dialog와 티모 애니메이션.

[소스 보기](../../../../js/shared/loading.js) · [파일 목록](../../../FILES.md)

## 주요 기능

- TFT_LOADING.show(title): 로딩창을 열고 스프라이트를 재생합니다.
- TFT_LOADING.hide(completed = true): 창을 닫고 애니메이션·타이머를 정리합니다.
- TFT_LOADING.preview(title, { duration = 4000 }): 완료 여부를 Promise<boolean>으로 반환합니다.
- 취소 시 tft-loading-cancel 이벤트를 보내며, 모션 감소 설정에서는 정지 자세를 사용합니다.
- 이전 창의 지연된 close 이벤트는 새로 열린 로딩창을 정리하지 않습니다.

## 사용처와 수정 시 확인할 점

index.html과 tft.html에서 사용합니다. 필수 DOM ID와 API 호출 예제는 dialog 사용 가이드를 확인하세요. 이 파일 자체는 fetch를 취소하지 않습니다.

색상별 버섯은 `mushroom-green.png`, `mushroom-red.png`, `mushroom-blue.png`, `mushroom-yellow.png` 규칙으로 경로를 구성합니다.

창 호출 방법과 필수 요소는 [dialog 사용 가이드](../../../DIALOG-GUIDE.md)를 참고하세요.
