const CACHE_NAME = "makro-offline-v1";

const archivosCache = [
    "/",
    "/HTML/MakroPL.html",
    "/CSS/MakroPL.css",
    "/JS/MakroPL.js",
    "/IMG/producto-default.png"
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(archivosCache);
        })
    );
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        })
    );
});

self.addEventListener("fetch", (event) => {

    event.respondWith(

        fetch(event.request)

            .then((response) => {

                return response;

            })

            .catch(() => {

                return caches.match(event.request)

                    .then((respuestaCache) => {

                        if (respuestaCache) {
                            return respuestaCache;
                        }

                        if (
                            event.request.destination === "document"
                        ) {
                            return caches.match("/HTML/MakroPL.html");
                        }

                    });

            })

    );

});