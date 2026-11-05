/* 서버에서 수집한 세트 17 랭크 아이템 통계 누적. 파일 설명: docs/files/js/server/item-stats.js.md */
// 서버가 가져온 Riot 응답만 집계하며 클라이언트 제출값과 샘플 통계는 사용하지 않습니다.
const fs = require("node:fs/promises");
const path = require("node:path");
class ItemStats {
  constructor(directory) {
    this.file = path.join(directory, "item-stats-set17.json");
    this.seen = new Set();
    this.champions = Object.create(null);
    this.writes = Promise.resolve();
  }
  async load() {
    try {
      const saved = JSON.parse(await fs.readFile(this.file, "utf8"));
      if (saved.version === 1 && saved.set === 17) {
        this.seen = new Set(saved.matches);
        this.champions = saved.champions;
      }
    } catch (error) {
      if (error.code !== "ENOENT")
        console.warn("Item statistics will be rebuilt from cached matches.");
    }
  }
  // 세트 17 랭크 실제 경기만 매치 ID당 한 번 집계하며 보드 내 중복 챔피언·아이템을 제거합니다.
  ingest(match) {
    const id = match?.metadata?.match_id,
      info = match?.info;
    if (
      !id ||
      id.startsWith("SAMPLE_") ||
      Number(info?.tft_set_number) !== 17 ||
      info.queue_id !== 1100 ||
      this.seen.has(id) ||
      !Array.isArray(info.participants)
    )
      return false;
    this.seen.add(id);
    for (const player of info.participants) {
      const board = new Map();
      for (const unit of player.units || []) {
        if (!/^TFT17_[\w]+$/.test(unit.character_id)) continue;
        const items = board.get(unit.character_id) || new Set();
        for (const item of unit.itemNames || [])
          if (typeof item === "string" && /^TFT[\w]+$/.test(item))
            items.add(item);
        board.set(unit.character_id, items);
      }
      for (const [champion, items] of board) {
        const row =
          this.champions[champion] ||
          (this.champions[champion] = {
            boards: 0,
            items: Object.create(null),
          });
        row.boards++;
        for (const item of items) row.items[item] = (row.items[item] || 0) + 1;
      }
    }
    return true;
  }
  save() {
    // 저장 요청을 순서대로 처리해 동시 매치 요청이 최신 누적 통계를 덮어쓰지 않도록 합니다.
    this.writes = this.writes
      .catch(() => {})
      .then(async () => {
        const body = JSON.stringify({
          version: 1,
          set: 17,
          matches: [...this.seen],
          champions: this.champions,
        });
        await fs.mkdir(path.dirname(this.file), { recursive: true });
        await fs.writeFile(this.file + ".tmp", body);
        await fs.rename(this.file + ".tmp", this.file);
      });
    return this.writes;
  }
  // 클라이언트에는 집계만 전달하며 플레이어 이름이나 PUUID를 포함하지 않습니다.
  snapshot() {
    return {
      set: 17,
      queue: 1100,
      matches: this.seen.size,
      champions: this.champions,
    };
  }
}
module.exports = { ItemStats };
