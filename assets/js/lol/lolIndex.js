/* LoL 검색 검증과 실제 프로필 표시. 파일 설명: docs/files/js/lol/lolIndex.js.md */
const params = new URLSearchParams(document.location.search);
const region = params.get("region") || "KR";
const gameName = params.get("gameName");
const tag = params.get("tag");

const searchInput = document.querySelector("#lol-riot-id");
const regionInput = document.querySelector("#lol-region");

if (
  regionInput &&
  [...regionInput?.options].some(
    (option) => option.value === region.toUpperCase(),
  )
)
  regionInput.value = region.toUpperCase();

if (searchInput && gameName && tag) searchInput.value = `${gameName}#${tag}`;

searchInput.addEventListener("input", () => searchInput.setCustomValidity(""));
document.querySelector("#lol-search").addEventListener("submit", (event) => {
  event.preventDefault();

  const parts = searchInput.value.trim().split("#");

  if (parts.length !== 2 || !parts[0].trim() || !parts[1].trim()) {
    searchInput.setCustomValidity("이름#태그 형식으로 입력해 주세요.");
    searchInput.reportValidity();

    return;
  }

  location.href =
    "./pages/lol/lolResult.html?" +
    new URLSearchParams({
      region: regionInput.value,
      gameName: parts[0].trim(),
      tag: parts[1].trim(),
    });
});

// 검색값이 있을 때만 API를 호출합니다. 입력 없이 방문한 경우 검색 폼을 유지합니다.
if (gameName && tag) {
  const contentHeader = document.querySelector(".content-header");
  const profileTitle = document.querySelector(".profile-title");

  if (contentHeader) contentHeader.hidden = false;
  if (profileTitle) {
    profileTitle.textContent = "전적을 불러오는 중입니다";
  }

  const loadPuuid = async () => {
    const { puuid } = await lolFetch(
      `/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tag)}`,
    );

    return puuid;
  };

  // 계정 PUUID로 소환사 정보를 조회하고 공개 버전을 사용해 프로필 아이콘 주소를 만듭니다.
  const loadProfile = async (puuid) => {
    if (!puuid) {
      alert("전적을 불러오지 못했습니다.");

      return;
    }

    try {
      const profileTitle = document.querySelector("#player-name");
      const profileTag = document.querySelector("#player-tag");
      const profileImage = document.querySelector(".profile-avatar");
      const profileLevel = document.querySelector(".avatar-level");
      const regionWrapper = document.querySelector("#player-region");
      const { profileIconId, summonerLevel } = await lolFetch(
        `/lol/summoner/v4/summoners/by-puuid/${puuid}`,
      );
      const profileImg = `https://ddragon.leagueoflegends.com/cdn/${await getVersion()}/img/profileicon/${profileIconId}.png`;

      profileTitle.textContent = `${gameName} `;
      profileTag.textContent = `#${tag}`;

      profileImage.src = profileImg;
      profileImage.classList.remove("hidden");
      profileLevel.textContent = summonerLevel;
      regionWrapper.textContent = region.toUpperCase();
    } catch (error) {
      alert("전적을 불러오지 못했습니다.");

      console.error(error);
    }
  };

  const loadTier = async (puuid) => {
    if (!puuid) {
      alert("전적을 불러오지 못했습니다.");

      return;
    }

    try {
      const res = await lolFetch(`/lol/league/v4/entries/by-puuid/${puuid}`);
      const data =
        res.find(({ queueType }) => queueType === "RANKED_SOLO_5x5") || null;

      if (data) {
        const { leaguePoints, wins, losses, tier, rank } = data;
        const rankElement = document.querySelector(".rank-emblem > img");
        const rankLabel = document.querySelector(".rank-label");
        const rankPoint = document.querySelector(".rank-points");
        const rankTotal = document.querySelector(".rank-total");
        const winRate = (wins / (wins + losses)) * 100;

        rankElement.classList.add("rank-emblem-img");
        rankElement.src = `./assets/images/tier/lol_${tier.toLowerCase()}.png`;
        rankLabel.textContent = `${tier} ${rank}`;
        rankPoint.innerHTML = `${leaguePoints} <span>LP</span>`;
        rankTotal.textContent = `${wins}승 ${losses}패 (총 ${wins + losses}게임)`;

        document.querySelector(".rank-footer span strong").textContent =
          `${winRate.toFixed(1)}%`;
      }
    } catch (error) {
      alert("전적을 불러오지 못했습니다.");
    }
  };

  window.onload = () => {
    (async () => {
      window.TFT_LOADING?.show("전적을 정찰하고 있어요");
      try {
        const puuid = await loadPuuid();
        await Promise.all([loadProfile(puuid), loadTier(puuid)]);
      } catch (error) {
        console.error(error);
      } finally {
        window.TFT_LOADING?.hide();
      }
    })();
  };
}
