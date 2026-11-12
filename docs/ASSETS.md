# 에셋 파일명과 이미지 경로 안내

[문서 목차](README.md) · [파일별 기능](FILES.md) · [공통 이미지 코드](files/js/shared/assets.js.md)

## 폴더 역할

| 경로                       | 보관 내용                      | 파일명 예시                                                              |
| -------------------------- | ------------------------------ | ------------------------------------------------------------------------ |
| `assets/shared/champions/` | LoL·TFT 기본 챔피언 초상화     | `champion-17.png`                                                        |
| `assets/tft/set17/`        | 세트 17 스킨·특성·아이템       | `champion-teemo.png`, `trait-space-groove.png`, `item-infinity-edge.png` |
| `assets/tft/companions/`   | 전설이 초상화                  | `companion-13010.png`                                                    |
| `assets/tft/profiles/`     | 플레이어 프로필 아이콘         | `profile-29.jpg`                                                         |
| `assets/tft/ranks/`        | 티어 문양                      | `rank-diamond.png`                                                       |
| `assets/tft/traits/`       | 이전 패치의 참고용 특성 아이콘 | `trait-set9-ionia.png`                                                   |
| `assets/tft/loading/`      | 로딩 스프라이트·색상별 버섯    | `teemo-throw-five.png`, `mushroom-green.png`                             |
| `assets/tft/feedback/`     | 오류·검색 결과 없음 안내 그림  | `teemo-error.png`, `teemo-not-found.png`                                 |
| `assets/branding/`         | 게임 아이콘·출처               | `lol-icon.png`, `tft-icon.svg`                                           |
| `assets/main/`             | 메인 영상                      | `lol-cinematic.mp4`, `tft-cinematic.mp4`                                 |

파일명은 소문자 영문·숫자·하이픈을 사용합니다. 종류를 나타내는 접두사 뒤에 Riot ID 또는 원본 식별자를 읽기 쉬운 형태로 씁니다. 폴더에 이미 있는 `set17`은 파일명에서 반복하지 않습니다. 게임의 API 키(`TFT17_Teemo` 등)는 원문을 유지하고 이미지 경로만 바꿉니다.

같은 챔피언의 서로 다른 이미지 파일은 `champion-{id}-alternate.png`로 보존합니다. 바이트가 다른 이미지이므로 중복 파일로 삭제하지 않았으며 기본 초상화 API는 기존에 사용하던 버전만 선택합니다. `teemo-throw.png`는 현재 로딩에서 사용하지 않는 이전 스프라이트이며, 현재 재생 파일은 `teemo-throw-five.png`입니다.

## assets.js는 무엇인가요?

`js/shared/assets.js`는 기본 챔피언 이미지 경로를 계산하는 JavaScript 모듈입니다. 실행 시 `window.GAME_ASSETS`를 만들며 이미지 파일 자체나 세트 17 전체 데이터를 담지는 않습니다.

```js
GAME_ASSETS.championPortrait(17);
// "./assets/shared/champions/champion-17.png"

GAME_ASSETS.championPortrait(-1);
// null
```

등록된 로컬 ID는 `champion-{id}.png`를 반환하고 나머지 유효한 ID는 고정 패치(16.9) CommunityDragon 주소를 반환합니다. 이미지를 직접 요청하거나 그리는 함수는 아니며 반환된 경로를 호출부가 `<img src>`에 사용합니다. 로컬 파일의 다운로드가 실패했을 때 원격 이미지로 자동 재시도하는 기능은 없습니다.

현재 `tft-model.js`의 기본 초상화 생성과 `tft-traits.js`의 소속 챔피언 표시에 사용합니다. LoL 페이지도 이 모듈을 불러오지만 현재 소환사 프로필 아이콘은 `lolIndex.js`에서 Data Dragon 주소로 별도 구성하므로 `championPortrait()`를 직접 호출하지 않습니다.

| 위치                         | 책임                                                      |
| ---------------------------- | --------------------------------------------------------- |
| `js/shared/assets.js`        | 챔피언 ID → 기본 초상화 경로 계산                         |
| `data/tft/tft-set17-data.js` | 세트 17 이름·특성·아이템·전설이 데이터와 스킨·아이콘 경로 |
| `assets/`                    | 실제 이미지·영상 파일                                     |
| `.tft-cache/`                | 서버가 실행 중 생성한 Riot 응답·집계 캐시                 |

## 이미지를 추가하거나 바꿀 때

1. 폴더 역할과 파일명 규칙에 맞춰 이미지를 추가합니다.
2. 공통 기본 초상화라면 `assets.js`의 `localPortraitIds`에 ID를 등록합니다. 세트 17 이미지는 `data/tft/tft-set17-data.js`의 해당 경로를 수정합니다.
3. 프로필·티어·버섯처럼 동적 파일명을 구성하는 코드는 각각 `tft-model.js`, `tft-rank.js`, `shared/loading.js`도 확인합니다.
4. HTML의 초기 이미지와 preload, 기존 MD의 경로도 갱신합니다.
5. TFT 자산의 경로나 내용을 바꾸면 `tft-sw.js`의 캐시 버전을 올립니다. 현재 버전은 캐시 실패 대응을 포함한 `tft-set17-assets-16.9-v6`입니다.

## 이번 변경 전후 파일명

이미지 내용과 영상은 그대로 보존하고 아래 경로만 변경했습니다. 경로는 프로젝트 루트 기준입니다.

| 변경 전                                                             | 변경 후                                                          |
| ------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `assets/branding/lol.png`                                           | `assets/branding/lol-icon.png`                                   |
| `assets/branding/tft.svg`                                           | `assets/branding/tft-icon.svg`                                   |
| `assets/shared/champions/114.png`                                   | `assets/shared/champions/champion-114.png`                       |
| `assets/shared/champions/127.png`                                   | `assets/shared/champions/champion-127.png`                       |
| `assets/shared/champions/145.png`                                   | `assets/shared/champions/champion-145.png`                       |
| `assets/shared/champions/17.png`                                    | `assets/shared/champions/champion-17.png`                        |
| `assets/shared/champions/200.png`                                   | `assets/shared/champions/champion-200.png`                       |
| `assets/shared/champions/202.png`                                   | `assets/shared/champions/champion-202.png`                       |
| `assets/shared/champions/203.png`                                   | `assets/shared/champions/champion-203.png`                       |
| `assets/shared/champions/222.png`                                   | `assets/shared/champions/champion-222.png`                       |
| `assets/shared/champions/233.png`                                   | `assets/shared/champions/champion-233.png`                       |
| `assets/shared/champions/266.png`                                   | `assets/shared/champions/champion-266.png`                       |
| `assets/shared/champions/267.png`                                   | `assets/shared/champions/champion-267.png`                       |
| `assets/shared/champions/31.png`                                    | `assets/shared/champions/champion-31.png`                        |
| `assets/shared/champions/33.png`                                    | `assets/shared/champions/champion-33.png`                        |
| `assets/shared/champions/360.png`                                   | `assets/shared/champions/champion-360.png`                       |
| `assets/shared/champions/37.png`                                    | `assets/shared/champions/champion-37.png`                        |
| `assets/shared/champions/420.png`                                   | `assets/shared/champions/champion-420.png`                       |
| `assets/shared/champions/43.png`                                    | `assets/shared/champions/champion-43.png`                        |
| `assets/shared/champions/432.png`                                   | `assets/shared/champions/champion-432.png`                       |
| `assets/shared/champions/51.png`                                    | `assets/shared/champions/champion-51.png`                        |
| `assets/shared/champions/516.png`                                   | `assets/shared/champions/champion-516.png`                       |
| `assets/shared/champions/53.png`                                    | `assets/shared/champions/champion-53.png`                        |
| `assets/shared/champions/57.png`                                    | `assets/shared/champions/champion-57.png`                        |
| `assets/shared/champions/75.png`                                    | `assets/shared/champions/champion-75.png`                        |
| `assets/shared/champions/82.png`                                    | `assets/shared/champions/champion-82.png`                        |
| `assets/shared/champions/84.png`                                    | `assets/shared/champions/champion-84.png`                        |
| `assets/shared/champions/887.png`                                   | `assets/shared/champions/champion-887.png`                       |
| `assets/shared/champions/893.png`                                   | `assets/shared/champions/champion-893.png`                       |
| `assets/shared/champions/92.png`                                    | `assets/shared/champions/champion-92.png`                        |
| `assets/shared/champions/98.png`                                    | `assets/shared/champions/champion-98.png`                        |
| `assets/shared/champions/Ahri.png`                                  | `assets/shared/champions/champion-103.png`                       |
| `assets/shared/champions/Ashe.png`                                  | `assets/shared/champions/champion-22.png`                        |
| `assets/shared/champions/Galio.png`                                 | `assets/shared/champions/champion-3.png`                         |
| `assets/shared/champions/Garen.png`                                 | `assets/shared/champions/champion-86.png`                        |
| `assets/shared/champions/Irelia.png`                                | `assets/shared/champions/champion-39.png`                        |
| `assets/shared/champions/JarvanIV.png`                              | `assets/shared/champions/champion-59.png`                        |
| `assets/shared/champions/Jhin.png`                                  | `assets/shared/champions/champion-202-alternate.png`             |
| `assets/shared/champions/Kaisa.png`                                 | `assets/shared/champions/champion-145-alternate.png`             |
| `assets/shared/champions/Karma.png`                                 | `assets/shared/champions/champion-43-alternate.png`              |
| `assets/shared/champions/Lux.png`                                   | `assets/shared/champions/champion-99.png`                        |
| `assets/shared/champions/Nilah.png`                                 | `assets/shared/champions/champion-895.png`                       |
| `assets/shared/champions/Poppy.png`                                 | `assets/shared/champions/champion-78.png`                        |
| `assets/shared/champions/Sett.png`                                  | `assets/shared/champions/champion-875.png`                       |
| `assets/shared/champions/Shen.png`                                  | `assets/shared/champions/champion-98-alternate.png`              |
| `assets/shared/champions/Sona.png`                                  | `assets/shared/champions/champion-37-alternate.png`              |
| `assets/shared/champions/Swain.png`                                 | `assets/shared/champions/champion-50.png`                        |
| `assets/shared/champions/Taric.png`                                 | `assets/shared/champions/champion-44.png`                        |
| `assets/shared/champions/Teemo.png`                                 | `assets/shared/champions/champion-17-alternate.png`              |
| `assets/shared/champions/Xayah.png`                                 | `assets/shared/champions/champion-498.png`                       |
| `assets/shared/champions/Yasuo.png`                                 | `assets/shared/champions/champion-157.png`                       |
| `assets/tft/companions/13010.png`                                   | `assets/tft/companions/companion-13010.png`                      |
| `assets/tft/companions/17018.png`                                   | `assets/tft/companions/companion-17018.png`                      |
| `assets/tft/companions/39020.png`                                   | `assets/tft/companions/companion-39020.png`                      |
| `assets/tft/companions/58002.png`                                   | `assets/tft/companions/companion-58002.png`                      |
| `assets/tft/loading/mushroom.png`                                   | `assets/tft/loading/mushroom-green.png`                          |
| `assets/tft/profiles/29.jpg`                                        | `assets/tft/profiles/profile-29.jpg`                             |
| `assets/tft/ranks/bronze.png`                                       | `assets/tft/ranks/rank-bronze.png`                               |
| `assets/tft/ranks/challenger.png`                                   | `assets/tft/ranks/rank-challenger.png`                           |
| `assets/tft/ranks/diamond.png`                                      | `assets/tft/ranks/rank-diamond.png`                              |
| `assets/tft/ranks/emerald.png`                                      | `assets/tft/ranks/rank-emerald.png`                              |
| `assets/tft/ranks/gold.png`                                         | `assets/tft/ranks/rank-gold.png`                                 |
| `assets/tft/ranks/grandmaster.png`                                  | `assets/tft/ranks/rank-grandmaster.png`                          |
| `assets/tft/ranks/iron.png`                                         | `assets/tft/ranks/rank-iron.png`                                 |
| `assets/tft/ranks/master.png`                                       | `assets/tft/ranks/rank-master.png`                               |
| `assets/tft/ranks/platinum.png`                                     | `assets/tft/ranks/rank-platinum.png`                             |
| `assets/tft/ranks/silver.png`                                       | `assets/tft/ranks/rank-silver.png`                               |
| `assets/tft/set17/TFT17_Aatrox.png`                                 | `assets/tft/set17/champion-aatrox.png`                           |
| `assets/tft/set17/TFT17_Akali.png`                                  | `assets/tft/set17/champion-akali.png`                            |
| `assets/tft/set17/TFT17_Aurora.png`                                 | `assets/tft/set17/champion-aurora.png`                           |
| `assets/tft/set17/TFT17_Bard.png`                                   | `assets/tft/set17/champion-bard.png`                             |
| `assets/tft/set17/TFT17_Belveth.png`                                | `assets/tft/set17/champion-belveth.png`                          |
| `assets/tft/set17/TFT17_Blitzcrank.png`                             | `assets/tft/set17/champion-blitzcrank.png`                       |
| `assets/tft/set17/TFT17_Briar.png`                                  | `assets/tft/set17/champion-briar.png`                            |
| `assets/tft/set17/TFT17_Caitlyn.png`                                | `assets/tft/set17/champion-caitlyn.png`                          |
| `assets/tft/set17/TFT17_Chogath.png`                                | `assets/tft/set17/champion-chogath.png`                          |
| `assets/tft/set17/TFT17_Fiora.png`                                  | `assets/tft/set17/champion-fiora.png`                            |
| `assets/tft/set17/TFT17_Gwen.png`                                   | `assets/tft/set17/champion-gwen.png`                             |
| `assets/tft/set17/TFT17_Illaoi.png`                                 | `assets/tft/set17/champion-illaoi.png`                           |
| `assets/tft/set17/TFT17_Jhin.png`                                   | `assets/tft/set17/champion-jhin.png`                             |
| `assets/tft/set17/TFT17_Jinx.png`                                   | `assets/tft/set17/champion-jinx.png`                             |
| `assets/tft/set17/TFT17_Kaisa.png`                                  | `assets/tft/set17/champion-kaisa.png`                            |
| `assets/tft/set17/TFT17_Karma.png`                                  | `assets/tft/set17/champion-karma.png`                            |
| `assets/tft/set17/TFT17_Kindred.png`                                | `assets/tft/set17/champion-kindred.png`                          |
| `assets/tft/set17/TFT17_Lissandra.png`                              | `assets/tft/set17/champion-lissandra.png`                        |
| `assets/tft/set17/TFT17_Maokai.png`                                 | `assets/tft/set17/champion-maokai.png`                           |
| `assets/tft/set17/TFT17_Mordekaiser.png`                            | `assets/tft/set17/champion-mordekaiser.png`                      |
| `assets/tft/set17/TFT17_Nami.png`                                   | `assets/tft/set17/champion-nami.png`                             |
| `assets/tft/set17/TFT17_Nasus.png`                                  | `assets/tft/set17/champion-nasus.png`                            |
| `assets/tft/set17/TFT17_Ornn.png`                                   | `assets/tft/set17/champion-ornn.png`                             |
| `assets/tft/set17/TFT17_Rammus.png`                                 | `assets/tft/set17/champion-rammus.png`                           |
| `assets/tft/set17/TFT17_Riven.png`                                  | `assets/tft/set17/champion-riven.png`                            |
| `assets/tft/set17/TFT17_Samira.png`                                 | `assets/tft/set17/champion-samira.png`                           |
| `assets/tft/set17/TFT17_Shen.png`                                   | `assets/tft/set17/champion-shen.png`                             |
| `assets/tft/set17/TFT17_Sona.png`                                   | `assets/tft/set17/champion-sona.png`                             |
| `assets/tft/set17/TFT17_Teemo.png`                                  | `assets/tft/set17/champion-teemo.png`                            |
| `assets/tft/set17/TFT_Item_GargoyleStoneplate.png`                  | `assets/tft/set17/item-gargoyle-stoneplate.png`                  |
| `assets/tft/set17/TFT_Item_GuinsoosRageblade.png`                   | `assets/tft/set17/item-guinsoos-rageblade.png`                   |
| `assets/tft/set17/TFT_Item_InfinityEdge.png`                        | `assets/tft/set17/item-infinity-edge.png`                        |
| `assets/tft/set17/TFT_Item_MadredsBloodrazor.png`                   | `assets/tft/set17/item-madreds-bloodrazor.png`                   |
| `assets/tft/set17/TFT_Item_WarmogsArmor.png`                        | `assets/tft/set17/item-warmogs-armor.png`                        |
| `assets/tft/set17/trait-Set17_CarouselMarket_EmpoweredHexTrait.png` | `assets/tft/set17/trait-carousel-market-empowered-hex-trait.png` |
| `assets/tft/set17/trait-TFT17_ADMIN.png`                            | `assets/tft/set17/trait-admin.png`                               |
| `assets/tft/set17/trait-TFT17_AnimaSquad.png`                       | `assets/tft/set17/trait-anima-squad.png`                         |
| `assets/tft/set17/trait-TFT17_APTrait.png`                          | `assets/tft/set17/trait-ap-trait.png`                            |
| `assets/tft/set17/trait-TFT17_AssassinTrait.png`                    | `assets/tft/set17/trait-assassin-trait.png`                      |
| `assets/tft/set17/trait-TFT17_ASTrait.png`                          | `assets/tft/set17/trait-as-trait.png`                            |
| `assets/tft/set17/trait-TFT17_Astronaut.png`                        | `assets/tft/set17/trait-astronaut.png`                           |
| `assets/tft/set17/trait-TFT17_BlitzcrankUniqueTrait.png`            | `assets/tft/set17/trait-blitzcrank-unique-trait.png`             |
| `assets/tft/set17/trait-TFT17_DarkStar.png`                         | `assets/tft/set17/trait-dark-star.png`                           |
| `assets/tft/set17/trait-TFT17_DRX.png`                              | `assets/tft/set17/trait-drx.png`                                 |
| `assets/tft/set17/trait-TFT17_Fateweaver.png`                       | `assets/tft/set17/trait-fateweaver.png`                          |
| `assets/tft/set17/trait-TFT17_FioraUniqueTrait.png`                 | `assets/tft/set17/trait-fiora-unique-trait.png`                  |
| `assets/tft/set17/trait-TFT17_FlexTrait.png`                        | `assets/tft/set17/trait-flex-trait.png`                          |
| `assets/tft/set17/trait-TFT17_GravesTrait.png`                      | `assets/tft/set17/trait-graves-trait.png`                        |
| `assets/tft/set17/trait-TFT17_HPTank.png`                           | `assets/tft/set17/trait-hp-tank.png`                             |
| `assets/tft/set17/trait-TFT17_JhinUniqueTrait.png`                  | `assets/tft/set17/trait-jhin-unique-trait.png`                   |
| `assets/tft/set17/trait-TFT17_ManaTrait.png`                        | `assets/tft/set17/trait-mana-trait.png`                          |
| `assets/tft/set17/trait-TFT17_Mecha.png`                            | `assets/tft/set17/trait-mecha.png`                               |
| `assets/tft/set17/trait-TFT17_MeleeTrait.png`                       | `assets/tft/set17/trait-melee-trait.png`                         |
| `assets/tft/set17/trait-TFT17_MissFortuneUndeterminedTrait.png`     | `assets/tft/set17/trait-miss-fortune-undetermined-trait.png`     |
| `assets/tft/set17/trait-TFT17_MissFortuneUniqueTrait.png`           | `assets/tft/set17/trait-miss-fortune-unique-trait.png`           |
| `assets/tft/set17/trait-TFT17_MorganaUniqueTrait.png`               | `assets/tft/set17/trait-morgana-unique-trait.png`                |
| `assets/tft/set17/trait-TFT17_Primordian.png`                       | `assets/tft/set17/trait-primordian.png`                          |
| `assets/tft/set17/trait-TFT17_PsyOps.png`                           | `assets/tft/set17/trait-psy-ops.png`                             |
| `assets/tft/set17/trait-TFT17_RangedTrait.png`                      | `assets/tft/set17/trait-ranged-trait.png`                        |
| `assets/tft/set17/trait-TFT17_ResistTank.png`                       | `assets/tft/set17/trait-resist-tank.png`                         |
| `assets/tft/set17/trait-TFT17_RhaastUniqueTrait.png`                | `assets/tft/set17/trait-rhaast-unique-trait.png`                 |
| `assets/tft/set17/trait-TFT17_ShenUniqueTrait.png`                  | `assets/tft/set17/trait-shen-unique-trait.png`                   |
| `assets/tft/set17/trait-TFT17_ShieldTank.png`                       | `assets/tft/set17/trait-shield-tank.png`                         |
| `assets/tft/set17/trait-TFT17_SonaUniqueTrait.png`                  | `assets/tft/set17/trait-sona-unique-trait.png`                   |
| `assets/tft/set17/trait-TFT17_SpaceGroove.png`                      | `assets/tft/set17/trait-space-groove.png`                        |
| `assets/tft/set17/trait-TFT17_Stargazer.png`                        | `assets/tft/set17/trait-stargazer.png`                           |
| `assets/tft/set17/trait-TFT17_Stargazer_Fountain.png`               | `assets/tft/set17/trait-stargazer-fountain.png`                  |
| `assets/tft/set17/trait-TFT17_Stargazer_Huntress.png`               | `assets/tft/set17/trait-stargazer-huntress.png`                  |
| `assets/tft/set17/trait-TFT17_Stargazer_Medallion.png`              | `assets/tft/set17/trait-stargazer-medallion.png`                 |
| `assets/tft/set17/trait-TFT17_Stargazer_Mountain.png`               | `assets/tft/set17/trait-stargazer-mountain.png`                  |
| `assets/tft/set17/trait-TFT17_Stargazer_Serpent.png`                | `assets/tft/set17/trait-stargazer-serpent.png`                   |
| `assets/tft/set17/trait-TFT17_Stargazer_Shield.png`                 | `assets/tft/set17/trait-stargazer-shield.png`                    |
| `assets/tft/set17/trait-TFT17_Stargazer_Wolf.png`                   | `assets/tft/set17/trait-stargazer-wolf.png`                      |
| `assets/tft/set17/trait-TFT17_SummonTrait.png`                      | `assets/tft/set17/trait-summon-trait.png`                        |
| `assets/tft/set17/trait-TFT17_TahmKenchUniqueTrait.png`             | `assets/tft/set17/trait-tahm-kench-unique-trait.png`             |
| `assets/tft/set17/trait-TFT17_Timebreaker.png`                      | `assets/tft/set17/trait-timebreaker.png`                         |
| `assets/tft/set17/trait-TFT17_VexUniqueTrait.png`                   | `assets/tft/set17/trait-vex-unique-trait.png`                    |
| `assets/tft/set17/trait-TFT17_ZedUniqueTrait.png`                   | `assets/tft/set17/trait-zed-unique-trait.png`                    |
| `assets/tft/traits/set9_bandlecity.png`                             | `assets/tft/traits/trait-set9-bandlecity.png`                    |
| `assets/tft/traits/set9_bastion.png`                                | `assets/tft/traits/trait-set9-bastion.png`                       |
| `assets/tft/traits/set9_demacia.png`                                | `assets/tft/traits/trait-set9-demacia.png`                       |
| `assets/tft/traits/set9_ionia.png`                                  | `assets/tft/traits/trait-set9-ionia.png`                         |
| `assets/tft/traits/set9_preserver.png`                              | `assets/tft/traits/trait-set9-preserver.png`                     |
| `assets/tft/traits/set9_sorcerer.png`                               | `assets/tft/traits/trait-set9-sorcerer.png`                      |
| `assets/tft/traits/set9_strategist.png`                             | `assets/tft/traits/trait-set9-strategist.png`                    |
| `assets/tft/traits/set9b_vanquisher.png`                            | `assets/tft/traits/trait-set9b-vanquisher.png`                   |
