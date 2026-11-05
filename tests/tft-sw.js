/* TFT 이미지와 정적 메타데이터의 브라우저 캐시. 파일 설명: docs/files/tft-sw.js.md */
/* 버전별 이미지·정적 메타데이터 캐시입니다. Riot API 응답과 API 키는 저장하지 않습니다. */
const NAME = "tft-set17-assets-16.9-v6";

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) =>
  event.waitUntil(
    (async () => {
      // 저장소를 사용할 수 없어도 새 워커의 활성화와 네트워크 사용은 유지합니다.
      try {
        for (const name of await caches.keys())
          if (name.startsWith("tft-set17-assets-") && name !== NAME)
            await caches.delete(name);
      } catch {}

      await self.clients.claim();
    })(),
  ),
);
// 선택한 정적 자산만 캐시 우선으로 응답하며 API와 나머지 요청은 그대로 통과시킵니다.
self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (request.method !== "GET") return;

  const local =
    url.origin === self.location.origin &&
    (url.pathname.startsWith("/assets/images/tft/") ||
      url.pathname.startsWith("/assets/shared/") ||
      url.pathname === "/assets/data/tft/tft-set17-data.js");
  const remote =
    request.destination === "image" &&
    url.hostname === "raw.communitydragon.org";

  if (!local && !remote) return;

  event.respondWith(
    (async () => {
      let cache;

      try {
        cache = await caches.open(NAME);

        const saved = await cache.match(request);

        if (saved) return saved;
      } catch {}

      const response = await fetch(request);

      // 캐시는 보조 기능입니다. 용량 부족 등 저장 실패로 정상 응답을 잃지 않습니다.
      if (cache && (response.ok || response.type === "opaque")) {
        try {
          await cache.put(request, response.clone());
        } catch {}
      }
      return response;
    })(),
  );
});
