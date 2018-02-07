var button = document.querySelector(".button-start");
var spinner = document.querySelector(".content-spinner");
var result = document.querySelector(".content-result");
var card = document.querySelector(".content-welcome");
var wolfgang = document.querySelector(".costume-wolfgang");
var robert = document.querySelector(".costume-robert");
var patrick = document.querySelector(".costume-patrick");
var lena = document.querySelector(".costume-lena");
var costumes = ["Melone", "Orange", "Ananas"];

button.addEventListener("click", function(event) {
    event.preventDefault();

    spinner.style.display = "block";
    button.style.display = "none";
    result.style.display = "none";
    card.style.display = "none";

    setTimeout(function() {
        spinner.style.display = "none";
        result.style.display = "block";
        button.style.display = "block";

        shuffle(costumes);
        robert.textContent = "Kiwi";
        lena.textContent = costumes[0];
        wolfgang.textContent = costumes[1];
        patrick.textContent = costumes[2];
        
        button.textContent = "Nochmal! Nochmal!";
    }, 3000);
})

/**
 * Shuffles array in place.
 * @param {Array} a items An array containing the items.
 */
function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
}