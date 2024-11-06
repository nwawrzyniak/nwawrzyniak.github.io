const noJavascript = document.querySelector(".no-javascript");
const requiresJavascript = document.querySelector(".requires-javascript");
const regex = /^.?$|^(..+?)\1+$/;
const colorCodedRegexInnerHTML = "<span class=\"red\">/</span><span class=\"yellow\">^</span><span class=\"red\">.</span><span class=\"orange\">?</span><span class=\"yellow\">$</span><span>|</span><span class=\"yellow\">^</span><span class=\"brown\">(</span><span class=\"red\">..</span><span class=\"orange\">+</span><span class=\"orange\">?</span><span class=\"brown\">)</span><span class=\"blue\">\\1</span><span class=\"orange\">+</span><span class=\"yellow\">$</span><span class=\"red\">/</span>";
const inputField = document.querySelector("#input");
const outputRegexPre = document.querySelector("#output-regex-pre");
const outputRegex = document.querySelector("#output-regex");
const outputRegexPost = document.querySelector("#output-regex-post");
const outputHuman = document.querySelector("#output-human-readable-text");
inputField.value = Math.ceil(Math.random() * 1000);

function checkPrime() {
    noJavascript.style.display = "none";
    requiresJavascript.style.display = "block";
    let n = inputField.value;
    if (n == "") n = 0;
    const comparator = '0'.repeat(n);
    outputRegex.innerHTML = comparator;
    outputRegexPost.innerHTML = "or any other string that consists of " + n + " times the same character.";
    if (!regex.test(comparator)) {
        outputRegexPre.innerHTML = "The regular expression " + colorCodedRegexInnerHTML + " does <span class=\"red\">not</span> match the string";
        outputHuman.innerHTML = "Therefore, " + n + " is a <span class=\"prime\">prime</span> number.";
    } else {
        outputRegexPre.innerHTML = "The regular expression " + colorCodedRegexInnerHTML + " does match the string";
        outputHuman.innerHTML = "Therefore, " + n + " is a <span class=\"composite\">composite</span> number.";
    }
}

inputField.addEventListener('input', checkPrime);

checkPrime();
