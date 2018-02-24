var STATIC_CACHE_NAME = "lottery-static-cache-v2";
var DYNAMIC_CACHE_NAME = "lottery-dynamic-cache-v1";
var allCaches = [
    STATIC_CACHE_NAME,
    DYNAMIC_CACHE_NAME
]
var APP_SHELL = [
    "/",
    "/index.html",
    "/css/app.css",
    "/js/app.js",
    "/vendor/css/bootstrap-vue.css",
    "/vendor/css/bootstrap.min.css",
    "/vendor/css/toastify.min.css",
    "/vendor/js/vue.min.js",
    "/vendor/js/bootstrap-vue.js",
    "/vendor/js/fontawesome.js",
    "/vendor/js/toastify-js.js",
    "/images/icons/icon-48x48.png",
    "/images/icons/icon-192x192.png"
];

function sendMessageToClient(client, message) {
    client.postMessage(message);
}

self.addEventListener("install", function (event) {
    console.log("[Service Worker] Installing service worker");

    event.waitUntil(
        caches.open(STATIC_CACHE_NAME).then(function (cache) {
            return cache.addAll(APP_SHELL);
        }),
    );
});

self.addEventListener("activate", function (event) {
    console.log("[Service Worker] Activating service worker");

    event.waitUntil(
        caches.keys().then(function (cacheNames) {
            return Promise.all(
                cacheNames.filter(function (cacheName) {
                    return cacheName.startsWith('lottery-') &&
                        !allCaches.includes(cacheName);
                }).map(function (cacheName) {
                    console.log("[Service Worker] Deleting old cache", cacheName);
                    return caches.delete(cacheName);
                }),
            );
        })
    );
});

function sendToAllClients(message) {
    self.clients.matchAll({
            includeUncontrolled: true,
            type: 'window'
        })
        .then(function (clients) {
            clients.map(function (client) {
                sendMessageToClient(client, message);
            })
        });
}

self.addEventListener("fetch", function (event) {
    var requestUrl = new URL(event.request.url);

    if (requestUrl.origin === location.origin) {
        event.respondWith(
            caches.match(event.request)
            .then(function (response) {
                if (response) {
                    console.log("[Service Worker] -> Cache", requestUrl.pathname);                    
                    return response;
                } else {
                    console.log("[Service Worker] -> Web", requestUrl.pathname);
                    return fetch(event.request);
                }
            })
        )
    }

    // event.waitUntil(
    //     update(event.request)
    // );
})

self.addEventListener("message", function (event) {
    if (event.data.action === "skipWaiting") {
        console.log("[Service Worker] Skipping waiting");
        self.skipWaiting()
            .then(function () {
                sendToAllClients("Update successful. You may need to refresh the pages to see updates!")
            });
    } else if (event.data.action === "addOfflineTestToCache") {
        caches.open(DYNAMIC_CACHE_NAME)
            .then(function (dynamic_cache) {
                dynamic_cache.match("/offline-test")
                    .then(function (response) {
                        if (response) {
                            sendToAllClients("Offline-test already added to cache");
                        } else {
                            fetch("offline-test")
                                .then(function (networkResponse) {
                                    dynamic_cache.put("offline-test", networkResponse);
                                }).catch(function(err) {
                                    console.log("[Service Worker] Error retreiving offline-test", err)
                                });
                            fetch("js/offline-test.js")
                                .then(function (networkResponse) {
                                    dynamic_cache.put("/js/offline-test.js", networkResponse);
                                }).catch(function(err) {
                                    console.log("[Service Worker] Error retreiving offline-test.js", err)
                                });;
                            sendToAllClients("Offline-test added to cache");
                        }
                    })

            })
    } else if (event.data.action === "removeOfflineTestToCache") {
        caches.open(DYNAMIC_CACHE_NAME)
            .then(function (dynamic_cache) {
                dynamic_cache.match("/offline-test")
                    .then(function (response) {
                        if (response) {
                            dynamic_cache.delete("offline-test");
                            dynamic_cache.delete("/js/offline-test.js");
                            sendToAllClients("Offline-test removed from cache");
                        } else {
                            sendToAllClients("Offline-test not cached");
                        }
                    })

            })
    }
});

function fromCache(request) {
    //we pull files from the cache first thing so we can show them fast
    return caches.match(request).then(function (matching) {
        return matching || Promise.reject('no-match');
    });
}


function update(request) {
    //this is where we call the server to get the newest version of the 
    //file to use the next time we show view
    return caches.open(STATIC_CACHE_NAME).then(function (cache) {
        return fetch(request).then(function (response) {
            return cache.put(request, response);
        });
    });
}

function fromServer(request) {
    //this is the fallback if it is not in the cahche to go to the server and get it
    return fetch(request).then(function (response) {
        return response
    })
}