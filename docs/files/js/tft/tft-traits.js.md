# `js/tft/tft-traits.js`

파일 역할: 시너지·챔피언 툴팁과 전체 시너지 패널.

[소스 보기](../../../../js/tft/tft-traits.js) · [파일 목록](../../../FILES.md)

## 주요 기능

- TFT_TRAIT_UI.render(), renderGroup(): 매치의 활성 시너지와 더보기 버튼을 생성합니다.
- traitState(): API 수치를 우선해 활성 상태와 소속 챔피언을 계산합니다.
- allContent(), championContent(), renderMembers(): 패널·툴팁 내용 HTML을 만듭니다.
- 내부 showAll()/hideAll(): 더보기 패널의 표시·위치·초점·aria-expanded를 관리합니다.
- loadItemStats(): /api/tft/item-stats를 읽어 통계용 챔피언 툴팁을 갱신합니다.

## 사용처와 수정 시 확인할 점

전체 시너지 패널 열기·닫기에서 초점은 preventScroll 옵션으로 이동해 불필요한 스크롤과 그에 따른 패널 닫힘을 방지합니다.

TFT_TRAITS, TFT_SET17, GAME_ASSETS와 TFT_DATA가 필요합니다. TFT_TRAIT_UI.hide()는 전체 패널과 관련 툴팁을 닫습니다. showAll은 외부 공개 함수가 아니므로 data-traits-more 버튼을 통해 엽니다.

창 호출 방법과 필수 요소는 [dialog 사용 가이드](../../../DIALOG-GUIDE.md)를 참고하세요.
