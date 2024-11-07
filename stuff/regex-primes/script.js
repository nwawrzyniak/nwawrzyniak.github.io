const noJavascript = document.querySelector(".no-javascript");
const requiresJavascript = document.querySelector(".requires-javascript");
const regex = /^.?$|^(..+?)\1+$/; /* The magic regex. Explanation here: https://www.youtube.com/watch?v=5vbk0TwkokM */
const colorCodedRegexInnerHTML = "<div class=\"colored-regex-box\"><span class=\"red\">/</span><span class=\"yellow\">^</span><span class=\"red\">.</span><span class=\"orange\">?</span><span class=\"yellow\">$</span><span>|</span><span class=\"yellow\">^</span><span class=\"brown\">(</span><span class=\"red\">..</span><span class=\"orange\">+</span><span class=\"orange\">?</span><span class=\"brown\">)</span><span class=\"blue\">\\1</span><span class=\"orange\">+</span><span class=\"yellow\">$</span><span class=\"red\">/</span></div>";
const inputField = document.querySelector("#input");
const outputRegexPre = document.querySelector("#output-regex-pre");
const outputRegex = document.querySelector("#output-regex");
const outputRegexPost = document.querySelector("#output-regex-post");
const outputHuman = document.querySelector("#output-human-readable-text");
let number, lastDigit;
do {
    number = Math.ceil(Math.random() * 1000); /* Sets a random initial number between 1 and 1000 to check */
    lastDigit = number % 10;
} while (lastDigit != 1 && lastDigit != 3 && lastDigit != 7 && lastDigit != 9); /* Ensures that the number is "interesting" (that it ends in 1, 3, 7 or 9) */
inputField.value = number;

noJavascript.style.display = "none";
requiresJavascript.style.display = "flex";

function checkPrime() {
    let n = inputField.value;
    if (n == "") n = 0;
    const comparator = '0'.repeat(n); /* Creates a string that contains any character exactly n times. We use '0', but it does not matter. */
    outputRegex.innerHTML = comparator;
    outputRegexPost.innerHTML = "or any other string that consists of " + n + " times the same character.";
    if (regex.test(comparator)) { /* Compares the regex against the comparator string */
        outputRegexPre.innerHTML = "The regular expression " + colorCodedRegexInnerHTML + " <span class=\"composite\">does match</span> the string";
        outputHuman.innerHTML = "Therefore, " + n + " is a <span class=\"composite\">composite</span> number.";
    } else {
        outputRegexPre.innerHTML = "The regular expression " + colorCodedRegexInnerHTML + " <span class=\"prime\">does not match</span> the string";
        outputHuman.innerHTML = "Therefore, " + n + " is a <span class=\"prime\">prime</span> number.";
    }
}

inputField.addEventListener('input', checkPrime);

checkPrime();
