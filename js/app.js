// Register service worker
if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js")
        .then(function (reg) {
            if (!navigator.serviceWorker.controller) {
                return;
            }

            // updatefound is fired if service-worker.js is new or changes.
            reg.onupdatefound = function () {
                // The updatefound event implies that reg.installing is set; see
                // https://slightlyoff.github.io/ServiceWorker/spec/service_worker/index.html#service-worker-container-updatefound-event
                var installingWorker = reg.installing;

                installingWorker.onstatechange = function () {
                    switch (installingWorker.state) {
                        case 'installed':
                            if (navigator.serviceWorker.controller) {
                                // This is an update to a previous service worker,
                                // and it's now installed.
                                Toastify({
                                    text: "New version available. Click to update",
                                    duration: 4000000,
                                    gravity: "bottom",
                                    positionLeft: true,
                                    backgroundColor: "#424242"
                                }).showToast();
    
                                let toast = document.querySelector(".toastify");
                                toast.addEventListener("click", function (event) {
                                    reg.waiting.postMessage({
                                        action: 'skipWaiting'
                                    });
                                    toast.remove();
                                });
                            } else {
                                // This is the initial service worker,
                                // and it's now installed.
                                showNotification("New service worker is installed");
                            }
                            break;

                        case 'waiting':
                            showNotification("New service worker is waiting")
                            break;

                        case 'redundant':
                            // Something went wrong and the service worked couldn't install.
                            break;
                    }
                };
            };
            console.log("[APP] Service worker registered");
        })
        .catch(function (err) {
            console.log("[APP] Error registering the service worker", err)
        });


    navigator.serviceWorker.addEventListener("message", function (event) {
        console.log("[App] Received message '" + event.data + "' from service worker");
        showNotification(event.data);
    });
}

function showNotification(message) {
    Toastify({
        text: message,
        duration: 2500,
        close: false,
        gravity: "bottom",
        positionLeft: true,
        backgroundColor: "#424242"
    }).showToast();
}

var list_keys = [];
var list_values = [];

if (localStorage.getItem("keys")) {
    list_keys = JSON.parse(localStorage.getItem("keys"));
}

if (localStorage.getItem("values")) {
    list_values = JSON.parse(localStorage.getItem("values"));
}

function removeItemByIdFromArray(list, itemId) {
    return list = list.filter(key => key.id !== itemId)
}

function addItemToArray(list, content) {
    list.push({
        id: new Date().toISOString(),
        name: content
    });
}

var App = new Vue({
    el: "#app",
    data: {
        page: "lottery",
        appState: "welcome",
        valueInputTooltipText: "Please enter something",
        keyInputTooltipText: "Please enter something",
        nonsense: false,
        newKey: "",
        newValue: "",
        keys: list_keys,
        values: list_values,
        loadingCounter: 0
    },
    methods: {
        addKey: function () {
            if (this.newKey.length && this.newKey) {
                addItemToArray(this.keys, this.newKey);
                this.newKey = "";
                this.$refs.keyInputTooltip.$emit('close');
                this.$refs.keyInputTooltip.$emit('disable');
                updateLocalStorage(this.keys, this.values);
            } else {
                this.$refs.keyInputTooltip.$emit('enable');
                this.$refs.keyInputTooltip.$emit('open');
            }
        },
        addValue: function () {
            if (this.newValue.length && this.newValue) {
                addItemToArray(this.values, this.newValue);
                this.newValue = "";
                this.$refs.valueInputTooltip.$emit('close');
                this.$refs.valueInputTooltip.$emit('disable');
                updateLocalStorage(this.keys, this.values);
            } else {
                this.$refs.valueInputTooltip.$emit('enable');
                this.$refs.valueInputTooltip.$emit('open');
            }
        },
        removeKey: function (id) {
            this.keys = removeItemByIdFromArray(this.keys, id);
            updateLocalStorage(this.keys, this.values);
        },
        removeValue: function (id) {
            this.values = removeItemByIdFromArray(this.values, id);
            updateLocalStorage(this.keys, this.values);
        },
        test_keydown_handler: function (event) {
            if (event.which === 13) {
                if (event.target.id === "keyInput") {
                    this.addKey();
                } else if (event.target.id === "valueInput") {
                    this.addValue();
                }
            }
        },
        startLottery: function () {
            let isReady = true;
            this.loadingCounter = 0;
            if (this.keys.length === 0 && !this.keys[0]) {
                this.$refs.keyInputTooltip.$emit('enable');
                this.$refs.keyInputTooltip.$emit('open');
                isReady = false;
            }

            if (this.values.length === 0 && !this.values[0]) {
                this.$refs.valueInputTooltip.$emit('enable');
                this.$refs.valueInputTooltip.$emit('open');
                isReady = false;
            }

            if (this.values.length != this.keys.length) {
                isReady = false;
                if (this.values.length > this.keys.length) {
                    this.$refs.keyInputTooltip.$emit('enable');
                    this.keyInputTooltipText = "Need more input!";
                    this.$refs.keyInputTooltip.$emit('open');
                } else {
                    this.$refs.valueInputTooltip.$emit('enable');
                    this.valueInputTooltipText = "Need more input!";
                    this.$refs.valueInputTooltip.$emit('open');
                }
            }

            if (this.values.length === this.keys.length && this.keys.length === 1) {
                if (!this.nonsense) {
                    this.$refs.startLotteryButtonTooltip.$emit('enable');
                    this.$refs.startLotteryButtonTooltip.$emit('open');
                    this.nonsense = true;
                    return;
                }
            } else {
                if (this.appState === "welcome") {
                    this.$refs.startLotteryButtonTooltip.$emit('disable');
                    this.$refs.startLotteryButtonTooltip.$emit('close');
                }
            }

            if (!isReady) {
                return;
            }

            updateLocalStorage(this.keys, this.values);

            this.valueInputTooltipText = "Pleas enter something";
            this.keyInputTooltipText = "Pleas enter something";

            this.appState = "loading";
            shuffleArray(this.values);

            var self = this;
            var loadingDuration = Math.floor(Math.random() * 3) + 1000;
            let interval = setInterval(function () {
                self.loadingCounter += 10;
            }, (loadingDuration / 10))

            setTimeout(function () {
                clearInterval(interval);
                self.appState = "result";
            }, loadingDuration + 800);
        },
        edit: function () {
            this.nonsense = false;
            this.appState = "welcome";
        }

    }
});

function updateLocalStorage(keys, values) {
    localStorage.setItem('keys', JSON.stringify(keys));
    localStorage.setItem('values', JSON.stringify(values));
}

/**
 * Shuffles array in place.
 * @param {Array} a items An array containing the items.
 */
function shuffleArray(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
}