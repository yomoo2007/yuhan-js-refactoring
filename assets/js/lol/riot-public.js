const LOLKEY = "RGAPI-b28fcfdd-a8d2-4c16-b6b6-da88272a6e5d";
const TFTKEY = "RGAPI-7739b1fa-f76c-4637-aacc-44ae82bf63d8";
const API_KEYS = {
  lol: LOLKEY,
  tft: TFTKEY,
};

/* LoL 서버 메타데이터와 Data Dragon 버전 조회. 파일 설명: docs/files/js/lol/riot-public.js.md */
const REGIONDATA = {
  NA: {
    name: "북미",
    platform: "na1",
    regional: "americas",
  },
  BR: {
    name: "브라질",
    platform: "br1",
    regional: "americas",
  },
  LAN: {
    name: "라틴 아메리카 북부",
    platform: "la1",
    regional: "americas",
  },
  LAS: {
    name: "라틴 아메리카 남부",
    platform: "la2",
    regional: "americas",
  },

  KR: {
    name: "한국",
    platform: "kr",
    regional: "asia",
  },
  JP: {
    name: "일본",
    platform: "jp1",
    regional: "asia",
  },

  EUW: {
    name: "서유럽",
    platform: "euw1",
    regional: "europe",
  },
  EUNE: {
    name: "북유럽 및 동유럽",
    platform: "eun1",
    regional: "europe",
  },
  RU: {
    name: "러시아",
    platform: "ru",
    regional: "europe",
  },
  TR: {
    name: "튀르키예",
    platform: "tr1",
    regional: "europe",
  },

  OCE: {
    name: "오세아니아",
    platform: "oc1",
    regional: "sea",
  },
  SEA: {
    name: "동남아시아",
    platform: "sg2",
    regional: "sea",
  },
  TW: {
    name: "대만",
    platform: "tw2",
    regional: "sea",
  },
  VN: {
    name: "베트남",
    platform: "vn2",
    regional: "sea",
  },
};
const getVersion = async () => {
  const response = await fetch(
    "https://ddragon.leagueoflegends.com/api/versions.json",
  );

  const data = await response.json();

  return data[0];
};
