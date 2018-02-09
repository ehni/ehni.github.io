// Register service worker
if ("serviceWorker" in navigator) {
    navigator.serviceWorker
        .register("/sw.js")
        .then(function (event) {
            console.log("[APP] Service worker registered", event);
        })
        .catch(function (err) {
            console.log("[APP] Error registering the service worker", err)
        })
}

var list_keys = [];
var list_values = [];

function removeItemByIdFromArray(list, itemId) {
    return list = list.filter(key => key.id !== itemId)
}

function addItemToArray(list, content) {
    list.push({ id: new Date().toISOString(), name: content });
}

window.app = new Vue({
    el: "#app",
    data: {
        appState: "welcome",
        valueInputTooltipText: "Please enter something",
        keyInputTooltipText: "Please enter something",
        nonsense: false,
        newKey: "",
        newValue: "",
        keys: list_keys,
        values: list_values
    },
    methods: {
        addKey: function () {
            if (this.newKey.length && this.newKey) {
                addItemToArray(this.keys, this.newKey);
                this.newKey = "";
                this.$refs.keyInputTooltip.$emit('close');
                this.$refs.keyInputTooltip.$emit('disable');
            } else {
                this.$refs.keyInputTooltip.$emit('enable');
                this.$refs.keyInputTooltip.$emit('open');
            }
        },
        addValue: function () {
            if (this.newValue.length && this.newValue) {
                addItemToArray(this.values, this.newValue)
                this.newValue = "";
                this.$refs.valueInputTooltip.$emit('close');
                this.$refs.valueInputTooltip.$emit('disable');
            } else {
                this.$refs.valueInputTooltip.$emit('enable');
                this.$refs.valueInputTooltip.$emit('open');
            }
        },
        removeKey: function (id) {
            this.keys = removeItemByIdFromArray(this.keys, id);
        },
        removeValue: function (id) {
            this.values = removeItemByIdFromArray(this.values, id);
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

            if (this.values.length == this.keys.length && this.keys.length == 1) {
                if (!this.nonsense) {
                    this.$refs.startLotteryButtonTooltip.$emit('enable');
                    this.$refs.startLotteryButtonTooltip.$emit('open');
                    this.nonsense = true;
                    return;
                }
            } else {
                if (this.appState != "welcome") {
                    this.$refs.startLotteryButtonTooltip.$emit('disable');
                    this.$refs.startLotteryButtonTooltip.$emit('close');
                }
            }

            if (!isReady) {
                return;
            }

            this.nonsense = false;

            this.valueInputTooltipText = "Pleas enter something";
            this.keyInputTooltipText = "Pleas enter something";

            console.log("Starting lottery");
            this.appState = "loading";
            shuffleArray(this.values);

            var self = this;
            setTimeout(function () {
                self.appState = "result";
            }, 1500);
        },
        edit: function () {
            this.appState = "welcome";
        }

    }
})

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