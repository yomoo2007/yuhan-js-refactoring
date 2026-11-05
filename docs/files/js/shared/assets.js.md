# `js/shared/assets.js`

파일 역할: LoL·TFT 공통 기본 챔피언 초상화 경로 관리.

[소스 보기](../../../../js/shared/assets.js) · [파일 목록](../../../FILES.md)

## 주요 기능

- GAME_ASSETS.championPortrait(championId): 양의 정수 ID를 로컬 초상화 또는 고정 패치 원격 이미지 주소로 변환합니다.
- 잘못된 ID는 null을 반환합니다.
- localPortraitIds에 등록된 ID는 `assets/shared/champions/champion-{id}.png`로 연결합니다.
- 서로 다른 보존용 초상화 `champion-{id}-alternate.png`는 자동 선택하지 않습니다.

## 사용처와 수정 시 확인할 점

LoL·TFT 페이지에서 불러오며 TFT 모델과 시너지 화면에서 사용합니다. TFT 전용 스킨은 data/tft/tft-set17-data.js에서 관리합니다.

LoL의 현재 프로필 아이콘은 lolIndex.js가 별도로 구성하므로 이 함수를 직접 호출하지 않습니다. 등록되지 않은 유효 ID는 CommunityDragon 주소를 반환합니다. 이미지 요청 자체나 실패한 로컬 이미지의 자동 원격 재시도는 수행하지 않습니다.

```js
GAME_ASSETS.championPortrait(17);
// "./assets/shared/champions/champion-17.png"
```

전체 구조와 추가 방법은 [에셋 안내](../../../ASSETS.md)를 참고하세요.
