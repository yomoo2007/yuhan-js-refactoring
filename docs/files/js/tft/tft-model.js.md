# `js/tft/tft-model.js`

파일 역할: Riot 응답을 TFT 화면용 데이터로 변환.

[소스 보기](../../../../js/tft/tft-model.js) · [파일 목록](../../../FILES.md)

## 주요 기능

- TFT_MODEL.normalize(result, { isDemo }): 세트 17만 추리고 챔피언·아이템·특성·참가자를 표시 형태로 바꿉니다.
- profileImage(), companion(): 프로필과 전설이 메타데이터를 연결합니다.
- statistics(): 랭크 챔피언·활성 시너지 사용 횟수와 평균 등수를 계산합니다.
- distribution(): 유효한 세트 17 랭크 기록을 매치 ID로 중복 제거해 등수 분포와 축 눈금을 계산합니다.
- roundLabel(): 원시 라운드를 스테이지-라운드 형태로 표시합니다.

## 사용처와 수정 시 확인할 점

TFT_SET17과 GAME_ASSETS가 먼저 필요합니다. 특성 수·활성 단계는 API 값을 유지합니다. statistics와 distribution은 집계 범위가 다르므로 호출부에서 전달하는 표본을 확인합니다.

로컬 예시 프로필은 `assets/tft/profiles/profile-29.jpg`입니다. 기본 초상화는 GAME_ASSETS, 세트 스킨·전설이 이미지는 `data/tft/tft-set17-data.js`의 경로를 사용합니다.
