const platformPath = ["/riot/account/v1/accounts/by-riot-id"];

const lolFetch = async (path) => {
  const params = new URLSearchParams(document.location.search);
  const region = params.get("region") || "KR";
  const regionData = REGIONDATA[region.toUpperCase()];
  const isPlatformPath = platformPath.some((item) => path.startsWith(item));
  const res = await fetch(`http://prestigelulu.com:3000${path}`, {
    headers: {
      "X-Riot-Token": API_KEYS["lol"],
      region: isPlatformPath ? regionData.regional : regionData.platform,
    },
  });

  return res.json();
};
