const regex = /^.?$|^(..+?)\1+$/;
const inputField = document.querySelector("#input");
const output = document.querySelector("#output");
inputField.value = Math.ceil(Math.random() * 1000);

function checkPrime() {
    let n = inputField.value;
    if (n == "") n = 0;
    if (!regex.test('1'.repeat(n))) {
        output.innerHTML = n + " is a prime number.";
    } else {
        output.innerHTML = n + " is a composite number.";
    }
}

inputField.addEventListener('input', checkPrime);

checkPrime();
