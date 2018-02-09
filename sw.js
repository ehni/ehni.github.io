var STATIC_CACHE_NAME = "lottery-static-cache-v1";
var DYNAMIC_CACHE_NAME = "lottery-dynamic-cache-v1";
var APP_SHELL = [
    "/",
    "/index.html",
    "/src/css/app.css",
    "/src/css/spinner.css",
    "/src/css/bootstrap-vue.css",
    "/src/css/bootstrap.min.css",
    "/src/js/app.js",
    "/src/js/vue.js",
    "/src/js/bootstrap-vue.js",
    "/src/js/polyfill.min.js",
    "/src/js/fontawesome.js",
];

self.addEventListener("install", function (event) {
    event.waitUntil(
        caches.open(STATIC_CACHE_NAME)
            .then(function (cache) {
                cache.addAll(APP_SHELL);
                console.log("[Service Worker] Cache initialized & service worker installed");
            })
    )
})

self.addEventListener("fetch", function (event) {
    event.respondWith(
        fromCache(event.request)
            .catch(fromServer(
                event.request))
    );

    event.waitUntil(
        update(event.request)
    );
})

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