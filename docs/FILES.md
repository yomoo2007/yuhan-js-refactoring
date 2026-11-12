# 파일별 기능 안내

[문서 목차](README.md) · [에셋 안내](ASSETS.md) · [로컬 API 사용법](LOCAL-DEVELOPMENT.md) · [dialog 가이드](DIALOG-GUIDE.md)

기능별 카테고리로 파일을 모았습니다. 파일명을 누르면 주요 함수·사용처·수정 시 확인할 점을 설명하는 개별 MD로 이동합니다.

## 카테고리

- [메인](#메인)
- [공통](#공통)
- [LoL](#lol)
- [TFT](#tft)
- [서버와 로컬 실행](#서버와-로컬-실행)
- [개발 설정](#개발-설정)
- [회귀 검사](#회귀-검사)

## 메인

게임 선택과 메인 영상·이동 효과를 담당합니다.

| 파일                                        | 기능                                         |
| ------------------------------------------- | -------------------------------------------- |
| [index.html](files/index.html.md)           | LoL·TFT 게임 선택 메인 화면                  |
| [js/main/main.js](files/js/main/main.js.md) | 메인 영상 준비, 게임 선택과 페이지 전환 제어 |
| [css/main.css](files/css/main.css.md)       | 메인 게임 선택 영상과 전환 효과 스타일       |

`assets/main/`에 LoL·TFT 메인 영상을 보관합니다.

## 공통

여러 화면에서 함께 사용하는 헤더·테마·기본 초상화·로딩입니다.

| 파일                                                  | 기능                                           |
| ----------------------------------------------------- | ---------------------------------------------- |
| [js/shared/assets.js](files/js/shared/assets.js.md)   | LoL·TFT 공통 기본 챔피언 초상화 경로 관리      |
| [js/shared/header.js](files/js/shared/header.js.md)   | 공통 게임 메뉴와 테마 선택 버튼 생성           |
| [js/shared/footer.js](files/js/shared/footer.js.md)   | 공통 하단 저작권 영역 생성                     |
| [js/shared/theme.js](files/js/shared/theme.js.md)     | 라이트·다크 테마 적용과 브라우저 저장          |
| [js/shared/loading.js](files/js/shared/loading.js.md) | 메인·TFT 공통 로딩 dialog와 티모 애니메이션    |
| [css/header.css](files/css/header.css.md)             | 세 페이지 공통 헤더·게임 메뉴·테마 버튼 스타일 |
| [css/theme.css](files/css/theme.css.md)               | 공통 라이트·다크 테마 보정                     |
| [css/tft-loading.css](files/css/tft-loading.css.md)   | 메인·TFT 공통 로딩창과 버섯 애니메이션 스타일  |

기본 초상화는 `assets/shared/champions/`, 게임 아이콘은 `assets/branding/`, 메인·TFT 공용 로딩 이미지는 `assets/tft/loading/`에 있습니다. `tft-loading.css`는 이름과 달리 메인에서도 사용합니다. `footer.js`는 현재 페이지에서 불러오지 않습니다. [에셋 이름·assets.js 안내](ASSETS.md)와 [dialog 사용법](DIALOG-GUIDE.md)을 참고하세요.

## LoL

LoL 검색 폼과 소환사 프로필 조회에 사용하는 파일입니다.

| 파일                                                    | 기능                                        |
| ------------------------------------------------------- | ------------------------------------------- |
| [lolIndex.html](files/lolIndex.html.md)                 | LoL 검색 폼과 소환사 프로필 화면            |
| [js/lol/lolIndex.js](files/js/lol/lolIndex.js.md)       | LoL 검색 검증과 실제 프로필 표시            |
| [js/lol/riotFetch.js](files/js/lol/riotFetch.js.md)     | LoL 페이지의 로컬 Riot API 프록시 호출      |
| [js/lol/riot-public.js](files/js/lol/riot-public.js.md) | LoL 서버 메타데이터와 Data Dragon 버전 조회 |
| [css/common.css](files/css/common.css.md)               | LoL 페이지 기본 초기화와 공통 레이아웃      |
| [css/lolFetch.css](files/css/lolFetch.css.md)           | LoL 소환사 프로필 표시 스타일               |
| [css/lol-entry.css](files/css/lol-entry.css.md)         | LoL 진입 화면 검색 폼 스타일                |

`common.css`는 현재 LoL 페이지에서만 사용합니다. 실제 구현 범위는 계정·소환사 프로필 조회입니다.

## TFT

TFT 화면·검색·통계·세트 데이터·브라우저 캐시를 함께 모았습니다.

| 파일                                                              | 기능                                                |
| ----------------------------------------------------------------- | --------------------------------------------------- |
| [tft.html](files/tft.html.md)                                     | TFT 검색·전적·통계 화면의 HTML 진입점               |
| [js/tft/tft.js](files/js/tft/tft.js.md)                           | TFT 화면 상태·검색·렌더링·사용자 이벤트 통합        |
| [js/tft/tft-api.js](files/js/tft/tft-api.js.md)                   | TFT 프로필·매치 페이지·시즌 기록 조회               |
| [js/tft/tft-model.js](files/js/tft/tft-model.js.md)               | Riot 응답을 TFT 화면용 데이터로 변환                |
| [data/tft/tft-set17-data.js](files/data/tft/tft-set17-data.js.md) | TFT 세트 17 챔피언·특성·아이템·전설이 정적 데이터   |
| [js/tft/tft-rank.js](files/js/tft/tft-rank.js.md)                 | 랭크 계산·브라우저 기록 저장·LP 그래프 표시        |
| [js/tft/tft-feedback.js](files/js/tft/tft-feedback.js.md)         | TFT 검색 실패·플레이어 없음 dialog 표시             |
| [js/tft/tft-traits.js](files/js/tft/tft-traits.js.md)             | 시너지·챔피언 툴팁과 전체 시너지 패널  |
| [css/tft.css](files/css/tft.css.md)                               | TFT 기본 레이아웃·프로필·통계·매치 화면 스타일      |
| [css/tft-extras.css](files/css/tft-extras.css.md)                 | TFT 오류창·랭크·시너지·아이템 상세 보완 스타일      |
| [tft-sw.js](files/tft-sw.js.md)                                   | TFT 이미지와 정적 메타데이터의 브라우저 캐시        |

정적 메타데이터는 `data/tft/`, 실행 로직과 샘플 생성은 `js/tft/`에 있습니다. 전용 이미지는 `assets/tft/set17/`, `companions/`, `profiles/`, `ranks/`, `traits/`, `feedback/`에 보관합니다. [TFT 구현 기록](TFT-PROTOTYPE.md)과 [이미지 제작 기록](TFT-IMAGE-PROMPTS.md)도 참고하세요.

## 서버와 로컬 실행

로컬 실행, Riot 프록시, 인증 키 설정과 서버 캐시를 담당합니다.

| 파일                                                                | 기능                                          |
| ------------------------------------------------------------------- | --------------------------------------------- |
| [start-local.bat](files/start-local.bat.md)                         | Windows에서 로컬 서버 실행기를 여는 시작 파일 |
| [js/server/start-local.js](files/js/server/start-local.js.md)       | 로컬 서버 준비 확인과 브라우저 실행           |
| [js/server/server.js](files/js/server/server.js.md)                 | 정적 파일 제공, Riot 프록시와 응답 캐시 서버  |
| [js/server/project-id.js](files/js/server/project-id.js.md)         | 실제 프로젝트 폴더의 공통 식별값 계산         |
| [js/server/config.example.js](files/js/server/config.example.js.md) | 서버 전용 Riot API 키 설정 예시               |
| [js/server/item-stats.js](files/js/server/item-stats.js.md)         | 서버에서 수집한 세트 17 랭크 아이템 통계 누적 |

개인 `js/server/config.js`, `.tft-cache/`와 실행 로그는 Git에서 제외합니다. 실제 키를 문서에 기록하지 않습니다. [로컬 실행과 API 사용법](LOCAL-DEVELOPMENT.md)을 참고하세요.

## 개발 설정

편집기·코드 정렬·버전 관리 설정입니다.

| 파일                                                    | 기능                                         |
| ------------------------------------------------------- | -------------------------------------------- |
| [.gitignore](files/.gitignore.md)                       | 개인 API 설정·캐시·실행 로그의 Git 제외 규칙 |
| [.prettierrc.json](files/.prettierrc.json.md)           | 프로젝트 코드 자동 정렬 규칙                 |
| [.vscode/settings.json](files/.vscode/settings.json.md) | VS Code 작업 폴더 편집 설정                  |

JSON 설정에는 주석을 추가하지 않고 개별 MD에서 역할을 설명합니다.

## 회귀 검사

실행 방법과 검증 범위는 [회귀 검사 안내](TESTING.md)에 정리했습니다. 실제 Riot API를 호출하지 않습니다.

| 파일                                                            | 기능                                              |
| --------------------------------------------------------------- | ------------------------------------------------- |
| [tests/regressions.test.js](../tests/regressions.test.js)       | 요청 취소·캐시 실패·프로젝트 식별의 Node.js 검사  |
| [tests/serve-browser-tests.js](../tests/serve-browser-tests.js) | 실제 TFT HTML과 모듈을 제공하는 검사 전용 서버    |
| [tests/tft-fixture.js](../tests/tft-fixture.js)                 | 지연된 프로필·시즌 응답을 만드는 검사 전용 데이터 |
| [tests/browser-regressions.js](../tests/browser-regressions.js) | 방문 기록·취소 경합·DOM 상태·초점의 브라우저 검사 |

바이너리 파일의 명명 규칙과 변경 전후 경로는 [에셋 안내](ASSETS.md)에서 확인할 수 있습니다. `.git/`, 서버 캐시와 실행 로그는 개별 소스 문서에서 제외합니다.
