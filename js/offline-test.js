function addToCache() {
    navigator.serviceWorker.controller.postMessage({
        action: 'addOfflineTestToCache'
    });
}

function removeFromCache() {
    navigator.serviceWorker.controller.postMessage({
        action: 'removeOfflineTestFromCache'
    });
}