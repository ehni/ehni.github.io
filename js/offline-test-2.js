function removeFromCache() {
    navigator.serviceWorker.controller.postMessage({
        action: 'removeOfflineTest2FromCache'
    });
}

window.onload = function () {
    if ("serviceWorker" in navigator) {
        navigator.serviceWorker.controller.postMessage({
            action: "offlineTest2Ready"
        });
    }
}