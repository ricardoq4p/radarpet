const CACHE_NAME = "radarpet-app-v20";
const APP_SHELL = [
  "./",
  "index.html",
  "termos.html",
  "privacidade.html",
  "style.css",
  "app.js?v=19",
  "auth-config.js?v=19",
  "email-auth.js",
  "manifest.json",
  "data/pets.json",
  "data/ongs.json",
  "data/matches.json",
  "assets/icon-192.svg",
  "assets/icon-512.svg"
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

function cacheSuccessfulResponse(request, response) {
  if (!response || !response.ok) {
    return response;
  }

  const copy = response.clone();
  caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
  return response;
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const requestUrl = new URL(request.url);

  // Cloudinary, Firebase and other third-party resources must keep their
  // native network/error behavior. Returning app HTML for them breaks images
  // and authentication scripts with an invalid MIME type.
  if (requestUrl.origin !== self.location.origin) {
    return;
  }

  const isFirebaseAuthHelper =
    requestUrl.pathname.startsWith("/__/auth/") ||
    requestUrl.pathname.startsWith("/__/firebase/");

  if (isFirebaseAuthHelper) {
    return;
  }

  const isApiRequest = requestUrl.pathname.startsWith("/.netlify/functions/");
  if (isApiRequest) {
    event.respondWith(fetch(request));
    return;
  }

  const isPageRequest =
    request.mode === "navigate" ||
    request.headers.get("accept")?.includes("text/html");

  if (isPageRequest) {
    event.respondWith(
      fetch(request)
        .then((response) => cacheSuccessfulResponse(request, response))
        .catch(async () => {
          const cached = await caches.match(request);
          return cached || caches.match("index.html");
        })
    );
    return;
  }

  // Network-first prevents a previous deployment from pinning old JS/CSS.
  // The cache is used only as an offline fallback for same-origin assets.
  event.respondWith(
    fetch(request)
      .then((response) => cacheSuccessfulResponse(request, response))
      .catch(() => caches.match(request))
  );
});
