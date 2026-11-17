// Service worker: abre o site sem internet depois da primeira visita.
// Estratégia "rede primeiro": busca sempre a versão mais nova (inclusive o jogos.csv) e usa a cópia guardada só se estiver offline.
const V = "brasileirao-v1";
const CORE = ["./", "./index.html", "./manifest.webmanifest", "./icons/icon-192.png", "./icons/icon-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const r = e.request;
  if (r.method !== "GET") return;
  const u = new URL(r.url);
  if (u.origin !== location.origin) return;
  e.respondWith(
    fetch(r)
      .then(res => {
        if (res && res.ok) {
          const cp = res.clone();
          caches.open(V).then(c => c.put(r, cp));
        }
        return res;
      })
      .catch(() =>
        caches.match(r).then(m => m || (r.mode === "navigate" ? caches.match("./index.html") : Response.error()))
      )
  );
});
