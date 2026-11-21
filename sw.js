// Service worker: abre o site sem internet depois da primeira visita.
// Estratégia "rede primeiro": busca sempre a versão mais nova (inclusive o jogos.csv) e usa a cópia guardada só se estiver offline.
const V = "brasileirao-v2";
const CORE = ["./", "./index.html", "./cookies.js", "./manifest.webmanifest", "./icons/icon-192.png", "./icons/icon-512.png"];

self.addEventListener("install", e => {
  // add() individual: se um arquivo faltar no site, os outros continuam sendo guardados.
  e.waitUntil(
    caches.open(V)
      .then(c => Promise.all(CORE.map(u => c.add(u).catch(() => {}))))
      .then(() => self.skipWaiting())
  );
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
  if (u.origin !== location.origin) return;   // anúncios e outros serviços externos não passam pelo cache
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
