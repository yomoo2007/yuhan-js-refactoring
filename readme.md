# PORO.GG 프로젝트 안내

LoL·TFT 검색 화면을 HTML/CSS/JavaScript와 Node.js 로컬 서버로 구성한 프로젝트입니다.

- [개발 문서 목차](docs/README.md)
- [파일별 기능과 개별 문서](docs/FILES.md)
- [에셋 파일명·assets.js 안내](docs/ASSETS.md)
- [로컬 실행과 API 사용법](docs/LOCAL-DEVELOPMENT.md)
- [회귀 검사 실행 방법](docs/TESTING.md)
- [dialog 사용 가이드](docs/DIALOG-GUIDE.md)

## 실행 방법

Node.js 20 이상에서 `start-local.bat`를 더블 클릭하거나 아래 명령을 실행합니다.

```powershell
node assets/js/server/server.js
```

브라우저에서 `http://localhost:5174/index.html`을 엽니다. 실제 검색은 `assets/js/server/config.example.js`를 같은 폴더의 `config.js`로 복사해 게임별 키를 입력한 뒤 서버를 재시작해야 합니다. API 키가 없어도 TFT 검색 안내 화면은 확인할 수 있습니다.

LoL은 현재 계정·소환사 프로필 조회까지 구현되어 있습니다. 아래 API 메모의 모든 경로가 현재 서버에 연결된 것은 아닙니다.

---

# API 문서

## LOL

### apiKey

서버 전용 `assets/js/server/config.js`에 설정 (예시: `config.example.js`)

### 사용자 조회

GET https://{regional}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/{gameName}/{tagLine}

### 소환사 정보

GET https://{platform}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/{encryptedPUUID}

- 프로필 아이콘
- 레벨

### 소환사 랭킹 정보

GET https://{platform}.api.riotgames.com/lol/league/v4/entries/by-puuid/{encryptedPUUID}

- 티어
- 랭크
- 승리수
- 패배수
- 리그포인트

### 최근 게임 전적

GET https://{regional}.api.riotgames.com/lol/match/v5/matches/by-puuid/{puuid}/ids

### 최근 게임 전적 상세

GET https://{regional}.api.riotgames.com/lol/match/v5/matches/{matchId}

- 챔피언 명: info.participants[].championName
- 게임 언제 했는지: info.gameStartTimestamp
- 게임 경과 시간: info.gameDuration
- 결과: info.participants[].win
- 킬: info.participants[].kills
- 데스: info.participants[].deaths
- 어시: info.participants[].assists
- 챔피언 레벨: info.participants[].champLevel
- 스펠: info.participants[].summoner1Id, info.participants[].summoner2Id
- 구매 아이템: info.participants[].summoner1Id, info.participants[].item0 ~ 6
- 팀원: metadata.participants
- 처치 미니언: info.participants[].totalMinionsKilled
- 킬관여: info.challenges.killParticipation

### 이미지

#### 버전

https://ddragon.leagueoflegends.com/api/versions.json

#### 프로필 이미지

https://ddragon.leagueoflegends.com/cdn/{버전}/img/profileicon/{profileIconId}.png

#### 챔피언 이미지

https://ddragon.leagueoflegends.com/cdn/{버전}/img/champion/{championName}.png

### 스펠 이미지

https://ddragon.leagueoflegends.com/cdn/${version}/img/spell/${spell.image.full};

- https://ddragon.leagueoflegends.com/cdn/${version}/data/ko_KR/summoner.json 해당 데이터에서 summoner1Id, summoner2Id로 데이터 매칭 먼저

### 아이템 이미지

https://ddragon.leagueoflegends.com/cdn/{버전}/img/item/{아이템ID}.png

## TFT

### apiKey

서버 전용 `assets/js/server/config.js`에 설정 (예시: `config.example.js`)

### 사용자 조회

GET https://{regional}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/{gameName}/{tagLine}

### 소환사 정보

GET https://{platform}.api.riotgames.com/tft/summoner/v1/summoners/by-puuid/{encryptedPUUID}

- 프로필 아이콘
- 레벨

### 소환사 랭킹 정보

GET https://{platform}.api.riotgames.com/tft/league/v1/by-puuid/{puuid}

- 티어
- 랭크
- 승리수
- 패배수
- 리그포인트

### 최근 게임 전적

GET https://{regional}.api.riotgames.com/tft/match/v1/matches/by-puuid/{puuid}/ids

### 최근 게임 전적 상세

GET https://{regional}.api.riotgames.com/tft/match/v1/matches/{matchId}

- 팀원: info.participants
- 아이템 및 챔피언: participant.units
- 시너지: participant.units[].traits
- 다른 유저 이름과 태그: participant.riotIdGameName, participant.riotIdTagline
- 최대 라운드: participant.last_round
- 플레이 시간: participant.time_eliminated
- 아이템: participant.units[].itemNames
- 챔피언 레벨(몇성인가): participant.units[].tier
- 시너지: participant.traits

### 챔피언, 아이템 이름과 프로필

https://raw.communitydragon.org/latest/cdragon/tft/ko_kr.json

#### 이미지 가져오는 방법

1. 예시 데이터: assets/characters/tft18_aphelios/tft18_aphelios_square.tex
2. 앞에 https://raw.communitydragon.org/latest/game/ 붙이기

- 예) https://raw.communitydragon.org/latest/game/assets/characters/tft18_aphelios/tft18_aphelios_square.tex

3. 확장자 변경

- https://raw.communitydragon.org/latest/game/assets/characters/tft18_aphelios/tft18_aphelios_square.png
