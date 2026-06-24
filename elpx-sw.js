self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (!request || request.method !== "GET") return;
  const url = new URL(request.url);
  const scopeUrl = new URL(self.registration.scope);
  const scopePath = scopeUrl.pathname.endsWith("/") ? scopeUrl.pathname : `${scopeUrl.pathname}/`;
  const elpxPrefix = `${scopePath}__elpx/`;
  if (!url.pathname.startsWith(elpxPrefix)) return;

  event.respondWith(
    caches.match(request, { ignoreSearch: true }).then((cached) => {
      if (cached) return cached;
      // Fallback for themes that ship icons in a different image format than
      // the one the runtime requests (e.g. vector themes like flux/nova only
      // provide .svg while eXe asks for .png). Try equivalent extensions
      // before giving up, so the preview matches real eXeLearning rendering.
      return matchAlternateExtension(url, request).then((alternate) => {
        if (alternate) return alternate;
        return new Response("ELPX resource not found", { status: 404, statusText: "Not Found" });
      });
    })
  );
});

const IMAGE_EXTENSION_FALLBACKS = [".png", ".svg", ".webp", ".jpg", ".jpeg", ".gif"];

function matchAlternateExtension(url, request) {
  const dot = url.pathname.lastIndexOf(".");
  const slash = url.pathname.lastIndexOf("/");
  if (dot <= slash) return Promise.resolve(null);
  const currentExt = url.pathname.slice(dot).toLowerCase();
  if (!IMAGE_EXTENSION_FALLBACKS.includes(currentExt)) return Promise.resolve(null);

  const candidates = IMAGE_EXTENSION_FALLBACKS.filter((ext) => ext !== currentExt);

  return candidates.reduce((chain, ext) => {
    return chain.then((found) => {
      if (found) return found;
      const altUrl = new URL(url.href);
      altUrl.pathname = url.pathname.slice(0, dot) + ext;
      const altRequest = new Request(altUrl.href, { method: "GET" });
      return caches.match(altRequest, { ignoreSearch: true }).then((cached) => cached || null);
    });
  }, Promise.resolve(null));
}
