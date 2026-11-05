/* 이전 패치의 특성 설명 참고 데이터 */
/* TFT 13.20 데이터라 현재 세트 17 화면에서는 사용 안 함 */
window.TFT_TRAITS = {
  아이오니아: {
    id: "Set9_Ionia",
    icon: `${document.baseURI}assets/images/tft/traits/trait-set9-ionia.png`,
    description:
      "각 아이오니아 유닛의 스킬에는 고유 추가 효과가 있습니다. 4초마다 몇몇 아이오니아 유닛이 혼령 형태로 각성합니다. 각성 시 4초 동안 마나를 20 얻고 추가 능력치가 2배로 늘어납니다.",
    levels: [
      {
        min: 3,
        max: 5,
        style: 1,
        text: "(3) 아이오니아 추가 효과 100%, 1명 각성",
      },
      {
        min: 6,
        max: 8,
        style: 4,
        text: "(6) 아이오니아 추가 효과 200%, 2명 각성",
      },
      {
        min: 9,
        max: 25000,
        style: 5,
        text: "(9) 아이오니아 추가 효과 380%, 4명 각성",
      },
    ],
    champions: [
      "이렐리아",
      "아리",
      "카르마",
      "쉔",
      "야스오",
      "제드",
      "세트",
      "진",
      "자야",
    ],
    sourcePatch: "13.20",
  },
  토벌자: {
    id: "Set9b_Vanquisher",
    icon: `${document.baseURI}assets/images/tft/traits/trait-set9b-vanquisher.png`,
    description:
      "토벌자는 추가 치명타 피해량과 확률을 획득하며, 스킬에 치명타가 적용될 수 있습니다.",
    levels: [
      {
        min: 2,
        max: 3,
        style: 1,
        text: "(2) 15% 치명타 확률, 15% 치명타 피해량",
      },
      {
        min: 4,
        max: 5,
        style: 4,
        text: "(4) 35% 치명타 확률, 35% 치명타 피해량",
      },
      {
        min: 6,
        max: 25000,
        style: 4,
        text: "(6) 55% 치명타 확률, 55% 치명타 피해량",
      },
    ],
    champions: ["애쉬", "다리우스", "진", "닐라", "자야"],
    sourcePatch: "13.20",
  },
  기원자: {
    id: "Set9_Preserver",
    icon: `${document.baseURI}assets/images/tft/traits/trait-set9-preserver.png`,
    description: "3초마다 아군 유닛의 마나가 회복됩니다.",
    levels: [
      {
        min: 2,
        max: 3,
        style: 1,
        text: "(2) 모든 유닛 5 마나",
      },
      {
        min: 4,
        max: 5,
        style: 3,
        text: "(4) 기원자는 15 추가 회복",
      },
      {
        min: 6,
        max: 7,
        style: 4,
        text: "(6) 모든 유닛 20 마나, 기원자는 추가 15",
      },
      {
        min: 8,
        max: 25000,
        style: 4,
        text: "(8) 모든 유닛 40 마나, 시작 시 추가 주문력 30",
      },
    ],
    champions: [
      "카르마",
      "리산드라",
      "쉔",
      "소라카",
      "카시오페아",
      "갈리오",
      "라이즈",
      "밀리오",
    ],
    sourcePatch: "13.20",
  },
  마법사: {
    id: "Set9_Sorcerer",
    icon: `${document.baseURI}assets/images/tft/traits/trait-set9-sorcerer.png`,
    description:
      "마법사는 추가 주문력을 얻습니다. 적이 마법사에게 피해를 입은 뒤 사망하면 자신의 최대 체력에 비례한 피해를 다른 적에게 입힙니다.",
    levels: [
      {
        min: 2,
        max: 3,
        style: 1,
        text: "(2) 주문력 25, 최대 체력의 7%",
      },
      {
        min: 4,
        max: 5,
        style: 3,
        text: "(4) 주문력 50, 최대 체력의 10%",
      },
      {
        min: 6,
        max: 7,
        style: 4,
        text: "(6) 주문력 90, 2명의 적에게 최대 체력의 12%",
      },
      {
        min: 8,
        max: 25000,
        style: 4,
        text: "(8) 주문력 135, 2명의 적에게 최대 체력의 15%",
      },
    ],
    champions: [
      "아리",
      "럭스",
      "오리아나",
      "스웨인",
      "타릭",
      "벨코즈",
      "말자하",
      "실코",
    ],
    sourcePatch: "13.20",
  },
  데마시아: {
    id: "Set9_Demacia",
    icon: `${document.baseURI}assets/images/tft/traits/trait-set9-demacia.png`,
    description:
      "가장 강한 아군 데마시아 유닛이 정예가 되어 매 전투에서 찬란한 아이템을 장착합니다. 정예 유닛은 자신과 주변 아군에게 방어력과 마법 저항력을 부여하지만, 이 효과는 중첩되지 않습니다.",
    levels: [
      {
        min: 3,
        max: 4,
        style: 1,
        text: "(3) 정예 1명, 방어력 +5, 마법 저항력 +5",
      },
      {
        min: 5,
        max: 6,
        style: 3,
        text: "(5) 정예 2명, 방어력 +25, 마법 저항력 +25",
      },
      {
        min: 7,
        max: 8,
        style: 4,
        text: "(7) 정예 3명, 방어력 +45, 마법 저항력 +45",
      },
      {
        min: 9,
        max: 25000,
        style: 5,
        text: "(9) 정예 6명, 방어력 +150, 마법 저항력 +150",
      },
    ],
    champions: [
      "가렌",
      "자르반 4세",
      "럭스",
      "뽀삐",
      "소나",
      "케일",
      "갈리오",
      "퀸",
      "피오라",
    ],
    sourcePatch: "13.20",
  },
  요새: {
    id: "Set9_Bastion",
    icon: `${document.baseURI}assets/images/tft/traits/trait-set9-bastion.png`,
    description:
      "요새 챔피언이 방어력과 마법 저항력을 얻습니다. 이 효과는 전투 시작 후 10초 동안 100%만큼 증가합니다.",
    levels: [
      {
        min: 2,
        max: 3,
        style: 1,
        text: "(2) 방어력 +20, 마법 저항력 +20",
      },
      {
        min: 4,
        max: 5,
        style: 3,
        text: "(4) 방어력 +45, 마법 저항력 +45",
      },
      {
        min: 6,
        max: 7,
        style: 4,
        text: "(6) 방어력 +75, 마법 저항력 +75",
      },
      {
        min: 8,
        max: 25000,
        style: 4,
        text: "(8) 방어력 +140, 마법 저항력 +140",
      },
    ],
    champions: [
      "크산테",
      "뽀삐",
      "쉔",
      "타릭",
      "마오카이",
      "카사딘",
      "일라오이",
      "니코",
    ],
    sourcePatch: "13.20",
  },
  요들: {
    id: "Set9_BandleCity",
    icon: `${document.baseURI}assets/images/tft/traits/trait-set9-bandlecity.png`,
    description:
      "아군이 별 레벨 하나당 공격 속도를 10% 얻습니다. 3성 챔피언이 3명 있으면 아군 요들이 4성이 되어 스킬이 기묘하게 변화합니다!",
    levels: [
      {
        min: 3,
        max: 4,
        style: 1,
        text: "(3) 가장 강한 아군 3성 요들 1명",
      },
      {
        min: 5,
        max: 25000,
        style: 4,
        text: "(5) 3성 요들 2명",
      },
    ],
    champions: ["트리스타나", "클레드", "티모"],
    sourcePatch: "13.20",
  },
  책략가: {
    id: "Set9_Strategist",
    icon: `${document.baseURI}assets/images/tft/traits/trait-set9-strategist.png`,
    description:
      "전투 시작: 전방 2열의 아군들이 15초 동안 보호막을 얻습니다. 후방 2열의 아군들이 주문력을 얻습니다.",
    levels: [
      {
        min: 2,
        max: 2,
        style: 1,
        text: "(2) 보호막 250, 주문력 15",
      },
      {
        min: 3,
        max: 3,
        style: 3,
        text: "(3) 보호막 400, 주문력 25",
      },
      {
        min: 4,
        max: 4,
        style: 4,
        text: "(4) 보호막 600, 주문력 40",
      },
      {
        min: 5,
        max: 25000,
        style: 4,
        text: "(5) 보호막 900, 주문력 60",
      },
    ],
    champions: ["아지르", "자르반 4세", "스웨인", "티모", "미스 포츈"],
    sourcePatch: "13.20",
  },
};
