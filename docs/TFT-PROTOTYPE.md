# TFT 세트 17 전적검색

현재 파일별 사용법은 [파일별 기능 안내](FILES.md), 창의 호출 방법은 [dialog 사용 가이드](DIALOG-GUIDE.md)를 참고하세요. 아래 검증 일자는 과거 작업 기록이며 이번 문서 정리에서 실제 Riot 조회를 다시 실행한 결과는 아닙니다.

정적 세트 데이터는 `data/tft/`에서 관리하며 이미지 파일명은 소문자·하이픈으로 통일했습니다. 현재 규칙과 변경 전후 경로는 [에셋 안내](ASSETS.md), 로컬 검색 설정은 [로컬 실행과 API 사용법](LOCAL-DEVELOPMENT.md)에 정리했습니다.

HTML/CSS/Vanilla JavaScript로 구현했습니다. React나 npm 패키지는 사용하지 않습니다. 사용자 요청으로 Downloads/v3 메인페이지를 통합하고 LOL 결과 페이지의 검색 연결을 맞췄습니다.

## 실행

프로젝트 폴더에서 `node assets/js/server/server.js` 실행 → http://127.0.0.1:5174/ (메인), /tft.html (TFT)
Node 20 이상이 필요합니다. 일반 정적 서버(5173)에서도 샘플 UI를 볼 수 있지만 실제 검색에는 5174 서버가 필요합니다.

실제 전적 검색 키는 서버 전용 `assets/js/server/config.js`에 설정합니다. 팀원은 `assets/js/server/config.example.js`를 복사해 파일명을 `config.js`로 바꾸고 Riot 키를 입력하면 됩니다. 실제 설정 파일은 Git과 정적 제공에서 제외되며, 키는 브라우저로 보내지 않습니다. LOL 페이지는 키가 없는 js/lol/riot-public.js와 서버 프록시를 사용하는 riotFetch.js를 로드합니다.

2026-10-01 실제 검증: TFT 계정·소환사·리그·최근 매치 20개 조회 성공, 매치 실패 0개. 테스트 계정의 세트 17 매치는 1개로 필터링됐습니다. LOL 계정·소환사 조회도 HTTP 200을 확인했습니다. 샘플과 실제 데이터를 구분하며 실패한 검색 이름으로 샘플 전적을 바꾸지 않습니다. 개발 키가 만료되면 로컬 설정 파일의 키를 갱신해야 합니다.

## 메인 통합과 백업

- 작업 전 전체 백업: C:/Users/qazx8/Desktop/yuhan-js-main-backup (193개 파일, 실행 로그를 제외한 파일 해시 일치 확인).
- 원본: C:/Users/qazx8/Downloads/v3. index.html, css/main.css, js/main.js, assets/main의 영상 2개를 통합했습니다. 원본 폴더는 변경하지 않았습니다.
- 게임 선택 → 각 게임 페이지로 이동 → 해당 페이지에서 서버와 이름#태그를 입력합니다. TFT 검색 URL은 tft.html?name=…&tag=…&region=…, LoL은 lolIndex.html?gameName=…&tag=…&region=…입니다.
- 메인의 v3 로딩 화면·진행률·버섯 물리 애니메이션을 제거했습니다. 메인과 TFT 모두 css/tft-loading.css, js/shared/loading.js를 공유하며 기존 5컷 티모·다색 버섯·점멸 안내를 사용합니다. 메인 영상 준비가 끝나면 최소 3초 후 닫고, 로딩 지연 시 최대 8초 또는 닫기/ESC로 메인에 진입합니다.
- 서버는 MP4 MIME, HEAD 및 Range(206/416)를 지원하여 메인 영상을 스트리밍합니다.
- 메인 헤더는 TFT 스타일을 사용합니다. 영상 위 흰색 선택 카드와 버튼은 제거하고, 원래 v3의 큰 영문 제목과 설명을 복원했습니다. 모바일은 한 번 탭해 게임 페이지로 이동합니다. LoL 영상은 독립 CSS scale 1.3으로 원본의 상하 레터박스를 잘라내고, JS 시차 이동과 분리해 확대가 풀리지 않게 했습니다.

## 구현

- 세트 17 Space Gods만 표시. CommunityDragon 16.9의 한국어 데이터와 에셋에 고정.
- OP.GG 형태의 검색/프로필과 LoLCHESS 형태의 넓은 매치 행. 챔피언의 작은 이름, 성급, 실제 아이템 이미지.
- Riot 랭크 문양 10종, 저장된 세트 17 날짜별 기록 전체의 그래프와 LP 말풍선. 전날 대비 표시 줄은 사용자 요청으로 삭제했습니다. League API는 현재 랭크이며 과거 세트의 최종 랭크로 간주하지 않습니다.
- 프로필은 profileIconId, 전설이는 companion.content_ID/contentId 또는 skin_ID/itemId로 매핑. 정보가 없으면 임의 캐릭터로 대체하지 않습니다.
- TFT 스킨/기본 챔피언 전환. 특수 유닛처럼 기본 이미지가 없으면 TFT 이미지를 유지합니다.
- **활성 시너지만** 매치 행에 표시. hover/키보드 초점/터치로 효과 구간, 적용 수, 활성 단계, 배치 챔피언 확인.
- 활성 단계/적용 수는 traits.tier_current/num_units를 우선합니다. 상징·변형 보너스를 초상화 수로 덮어쓰지 않습니다.
- 최근 챔피언/활성 시너지 사용 횟수, 사용률, 평균 등수, TOP 4 비율. 솔로 랭크만 집계하고 중복 배치 챔피언은 매치마다 1회로 셉니다.
- 모드/순위 필터, 5개씩 더 보기, 이전 20매치 추가 조회, 일부 매치 실패 상태.

## 파일 역할

| 파일                                      | 역할                                                  |
| ----------------------------------------- | ----------------------------------------------------- |
| tft.html, css/tft.css, css/tft-extras.css | TFT 전용 UI와 애니메이션                              |
| js/tft/tft.js                             | 화면 렌더링과 이벤트                                  |
| js/tft/tft-api.js                         | Account → Summoner/League/Match IDs → Match 상세 요청 |
| js/tft/tft-model.js                       | Riot 응답 정규화, 세트 필터, 이미지와 사용 통계       |
| data/tft/tft-set17-data.js                | 한국어 정적 메타데이터 인덱스 (자동 생성)             |
| js/tft/tft-traits.js                      | 특성 아이콘과 툴팁                                    |
| js/tft/tft-rank.js, js/tft/tft-rank-ui.js | 승급을 포함한 LP 차이와 그래프                        |
| js/tft/tft-store.js                       | 사용자별 날짜별 랭크 기록                             |
| js/shared/loading.js                      | 메인과 TFT의 공용 로딩 애니메이션                     |
| js/server/server.js                       | Node 내장 모듈로 만든 Riot 프록시/응답 캐시           |
| tft-sw.js                                 | 이미지와 정적 메타데이터 캐시                         |
| js/shared/assets.js                       | LoL/TFT 공용 기본 챔피언 이미지 설정                  |
| assets/shared/champions/                  | Riot 챔피언 ID로 공유하는 기본 초상화                 |
| js/server/start-local.js                  | BAT에서 호출하는 로컬 서버 실행과 브라우저 열기       |
| js/server/item-stats.js                   | 수집한 매치의 아이템 통계                             |

검색 경로는 /api/tft/riot?region=KR&path=... 이며 서버만 X-Riot-Token을 추가합니다. KR/JP/NA/EUW를 지원합니다.
매치의 info.tft_set_number === 17을 필터링하고 puuid가 같은 participant를 사용합니다.
units.character_id/tier/itemNames, traits.name/num_units/tier_current/style, time_eliminated, level, gold_left, total_damage_to_players를 화면에 연결합니다. last_round는 스테이지-라운드 형식으로 변환해 표시합니다.

## 캐시와 랭크 기록

- .tft-cache의 서버 캐시: 매치 상세 7일, League/매치 목록 60초, 계정/Summoner 1시간. 동시 동일 요청을 합칩니다.
- 전적 갱신은 변경 가능한 응답의 TTL을 우회합니다.
- Service Worker와 HTTP 캐시로 이미지를 재사용합니다. 이미지/메타데이터 교체 시 tft-sw.js의 버전을 올립니다.
- 사용 통계는 실제 불러온 매치의 표본만 집계합니다. 시즌 전체 통계로 표시하지 않습니다.
- 조회한 현재 랭크를 puuid별로 localStorage에 저장합니다. 한국 시간 날짜별 마지막 값을 유지하며 현재 120개 제한은 없습니다. 오늘·전날 기록이 모두 없으면 일별 차이를 계산하지 않습니다.
- 샘플의 세트 17 이력과 실제 현재 랭크 이력은 별도 공간에 저장합니다. 운영 시에는 시즌 전환 키와 리셋 정책을 추가해야 합니다.
- API 매치만으로 과거 LP를 복원하지 않습니다. 사용자가 방문하지 않은 날짜까지 제공하려면 서버의 정기 수집이 필요합니다.

## 티모 로딩

내장 image_gen으로 제작한 5컷(꺼내기/두 손으로 잡기/들어 올리기/던지기/팔 내리기)을 1.8초 주기로 반복합니다. 던진 자세를 짧게 유지한 뒤 바로 팔을 내려 다음 버섯을 꺼냅니다. 1536×1024 PNG에서 각 포즈의 실제 source 좌표를 지정해 Canvas drawImage로 재생합니다. 균등 격자 경계를 넘은 손이 옆 컷에 섞이지 않도록 포즈별 영역을 분리하고 발 위치를 고정했습니다. 버섯 CSS 애니메이션과 같은 재생 시계를 사용합니다. 4번째 컷의 양손 손가락을 수정했습니다.
버섯은 초록색 바탕과 자홍색 점박이이며, 시계 방향으로 첫 착지 180° → 둘째 360° → 셋째 540° → 퇴장 720° 회전합니다.
설치된 버섯과 날아가는 버섯을 각각 기존의 1.3배로 키웠습니다. 설치된 버섯은 초록색을 유지하고, 날아가는 버섯은 초록 → 빨강 → 파랑 → 노랑으로 매 발사 시 변경합니다. 색상 이미지를 미리 로드하고 비행 중에는 색을 바꾸지 않습니다.
버섯 비행은 1.8초 전체 주기를 사용하고 첫 발사만 396ms 지연합니다. 이전 버섯이 사라지는 시점에 다음 버섯이 출발하며 착지 효과도 비행 시계에 맞춥니다. 실제 로딩은 요청 완료까지, 미리보기는 닫기/ESC까지 반복합니다. 취소 시 브라우저 요청을 중단합니다. reduced-motion에서는 정지 그림을 사용합니다.
최종 파일: assets/tft/loading/teemo-throw-five.png. 프롬프트/생성 원본은 TFT-IMAGE-PROMPTS.md에 기록했습니다.

## 오류 안내

첨부 그림체를 참고한 티모 그림을 상황에 맞게 표시합니다. 계정 또는 TFT 소환사 조회 404는 돋보기 티모와 검색어 수정, 네트워크·인증·요청 제한 등 조회 실패는 지도 티모와 다시 시도를 제공합니다. 매치 조회 404를 플레이어 없음으로 잘못 분류하지 않습니다. 로딩 취소 시 오류 안내를 띄우지 않습니다. 기존 화면 데이터는 유지합니다.
프로필의 ‘실패 화면’, ‘유저 없음’ 버튼으로 두 화면을 미리 볼 수 있습니다. 미리보기는 API를 호출하지 않으며 실제 오류와 구별되는 안내를 표시합니다.

## 검증

기존 모델 검증 항목: 세트 필터, API 특성 수 유지, ID 이미지 매핑, 중복 유닛 제외, 랭크 모드 집계, 한국 시간 경계, 승급 LP, 로컬 파일 참조, 일부 매치 실패를 검사합니다.
브라우저에서 활성 시너지 19개/비활성 0개(첫 5매치), 초상화 전환, 툴팁과 로딩을 확인했습니다.

## 출처

- [OP.GG](https://op.gg/ko), [LoLCHESS](https://lolchess.gg/)
- [Riot 세트 17 소개](https://teamfighttactics.leagueoflegends.com/en-au/news/game-updates/teamfight-tactics-patch-17-1/)
- [한국어 TFT 데이터](https://raw.communitydragon.org/16.9/cdragon/tft/ko_kr.json)
- [전설이 메타데이터](https://raw.communitydragon.org/16.9/plugins/rcp-be-lol-game-data/global/ko_kr/v1/companions.json)
- [기본 챔피언 인덱스](https://raw.communitydragon.org/16.9/plugins/rcp-be-lol-game-data/global/ko_kr/v1/champion-summary.json)
- [랭크 이미지](https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/images/ranked-emblem/)

게임 자산 권리는 Riot Games에 있습니다. PORO.GG는 임시 이름입니다. 특성 설명은 고정한 16.9 기준으로, 다른 패치의 매치 수치와 다를 수 있습니다. 해석 불가능한 동적 변수는 조건별로 표시합니다. 포로 이미지는 장식으로만 사용합니다.

## 2026-10-06 화면과 수집 아이템 통계

- 매치 상세는 아이템을 장착한 챔피언과 아이템만 표시합니다. `last_round`는 스테이지-라운드로 변환합니다(1~4 → 1-1~1-4, 5 → 2-1, 28 → 5-3).
- 랭크 요약에 총 게임 수를 표시하며 TOP 집계는 ‘TOP 4 이내’로 표기합니다.
- 랭크 그래프는 저장된 세트 17 날짜별 기록 전체를 표시합니다. 최근 7일·30일이나 120개로 제한하지 않습니다. 이 세트 17 전용 프로토타입이 저장했던 `current` 기록도 세트 17로 변환합니다. 과거 랭크는 매치로 추정하지 않으며 그래프는 최초 조회일부터 시작합니다.
- 티어 변화는 한국어 이름, 굵은 글자와 티어 색상으로 표시합니다.
- `/api/tft/item-stats`는 서버에서 수집한 세트 17 랭크(큐 1100) 아이템 통계를 반환합니다. 매치 ID를 기준으로 모든 참가자의 최종 보드를 한 번만 반영합니다. 같은 보드의 동일 챔피언·동일 아이템은 중복 제거합니다. 분모는 아이템이 없는 경우까지 포함한 해당 챔피언 보드 수이므로 여러 아이템의 비율 합계는 100%를 넘을 수 있습니다.
- 집계와 처리한 매치 ID는 `.tft-cache/item-stats-set17.json`에 저장하며 플레이어 이름·PUUID는 집계에 넣지 않습니다. 시작 시 기존 매치 캐시를 가져오고 샘플은 제외합니다. 수집값이 없으면 빈 상태로 표시합니다. 같은 서버를 통해 조회한 표본을 공유하며 Riot 전체 이용자 통계가 아닙니다.
- 챔피언 사용 통계의 호버·초점·탭은 시너지와 장착 아이템 상위 5개, 비율, 보드 표본 수를 보여줍니다. 일반 챔피언 툴팁은 시너지만 표시합니다.
- 헤더는 로컬 게임 아이콘과 라이트·다크 버튼을 제공하며 테마는 `poro-theme`에 저장합니다.
- 메인 영상은 별도 마스크 레이어로 대각선 56px 교차 전환과 바깥쪽 24/32px 경계 효과를 적용합니다. 클릭 영역과 제목은 선명하게 유지하며 키보드로 접근할 수 있습니다. 영상은 중복 생성하지 않습니다.

## 로컬 실행기

프로젝트의 start-local.bat를 더블 클릭하면 Node 서버를 백그라운드로 실행하고 http://localhost:5174/index.html을 엽니다. 5174 포트의 프로젝트 서버가 이미 준비되어 있으면 재사용합니다. Node.js 20 이상이 필요하며 실행 오류는 실행기와 서버 로그에 표시합니다.

## 게임 페이지 직접 이동

메인 영상 패널과 헤더의 게임 링크는 lolIndex.html 또는 tft.html로 직접 이동합니다. 메인 검색 dialog는 제거했으며 예전 index.html?game= 링크도 해당 게임 페이지로 연결합니다. LoL 페이지는 자체 검색 폼을 제공하고 검색값 없이 방문하면 빈 프로필 API 요청을 보내지 않습니다.

## 2026-10-08 등수 분포와 시너지 사용 통계

등수 분포의 눈금 테두리는 라이트·다크 테마를 따릅니다. 매치 초상화를 5% 확대했습니다(데스크톱 51.45px, 모바일 44.1px). 시너지 사용 통계에 마우스를 올리거나 초점·탭으로 선택하면 소속 챔피언 전체와 중첩 챔피언 툴팁을 보여줍니다.
요약은 최근 20개 랭크 경기를 사용하고 등수 분포는 조회한 세트 17 랭크 경기 전체를 사용합니다. 백그라운드 페이지 조회로 가능한 기록을 계속 가져오고 중복 제거, 프로필 변경 시 취소, 일부·진행 중 상태와 실패 상세 재시도를 지원합니다. 가져오지 못한 과거 등수는 추정하지 않습니다.
당시 검증 기록: 모델·시즌 집계 검사와 브라우저의 눈금 색상·소속 수·중첩 호버·카드 크기 검사를 통과했습니다. 모의 45경기 집계와 최근 20경기 요약의 분리도 확인했습니다.

## Shared sticky header and synergy effects

JavaScript is grouped by page: js/main, js/tft, js/lol, and js/shared. Server-only settings live in js/server and are not served to the browser. All three HTML pages mount navigation from js/shared/header.js, using css/header.css. Desktop height is 65px and mobile height is 104px; the header stays at the top on scroll. Header links keep direct navigation, active-page highlighting, and the saved light/dark choice. Trait usage tooltips include the trait description, every breakpoint effect, and all member champions. Match-specific tooltips still highlight only the active breakpoint.

## 공용 이미지와 JavaScript 실행 구조

- 기본 챔피언 초상화는 assets/shared/champions에 보관하고, 두 게임 페이지에서 js/shared/assets.js를 로드합니다.
- GAME_ASSETS.championPortrait(Riot 챔피언 ID)는 로컬 이미지를 우선 반환합니다. 없는 ID는 고정 패치 CommunityDragon 이미지 주소를 반환하며, 기본 챔피언이 없는 TFT 전용 유닛은 TFT 스킨으로 표시합니다.
- TFT 메타데이터에는 baseId만 유지하며 기본 이미지 경로를 중복 관리하지 않습니다. TFT 스킨과 특성·아이템 이미지는 assets/tft/set17에 유지합니다.
- start-local.bat → assets/js/server/start-local.js → assets/js/server/server.js 순서로 실행합니다. 서버가 이미 실행 중이면 재사용합니다. PowerShell 없이 Node.js 20 이상으로 실행됩니다.
- 서버와 아이템 집계 코드는 js/server에 모았습니다. 이 폴더의 모든 파일은 HTTP로 제공하지 않습니다. 기존 로컬 설정과 전적 캐시는 유지됩니다.
- 개발용 생성·검증 폴더는 제거했습니다. 정적 메타데이터와 이미지가 프로젝트에 포함되어 별도 생성 작업 없이 실행할 수 있습니다.
