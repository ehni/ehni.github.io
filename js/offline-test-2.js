function removeFromCache() {
    navigator.serviceWorker.controller.postMessage({
        action: 'removeOfflineTest2FromCache'
    });
}