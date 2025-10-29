const ipInput = document.getElementById('ipAddress');
const errorMessage = document.getElementById('errorMessage');
const result = document.getElementById('result');
const octetsContainer = document.getElementById('octetsContainer');
const fullBinary = document.getElementById('fullBinary');

function validateIPv4(ip) {
  const ipRegex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  const match = ip.match(ipRegex);

  if (!match) return false;

  for (let i = 1; i <= 4; i++) {
    const octet = parseInt(match[i]);
    if (octet < 0 || octet > 255) return false;
  }

  return true;
}

function decimalToBinary(decimal) {
  return decimal.toString(2).padStart(8, '0');
}

function convertIPToBinary(ip) {
  const octets = ip.split('.').map(Number);
  return octets.map(octet => decimalToBinary(octet));
}

function displayResult(ip) {
  const binaryOctets = convertIPToBinary(ip);
  const decimalOctets = ip.split('.');

  octetsContainer.innerHTML = '';

  binaryOctets.forEach((binary, index) => {
    const octetDiv = document.createElement('div');
    octetDiv.className = 'octet-group';
    octetDiv.innerHTML = `
                    <div class="octet-label">Octet ${index + 1} (${decimalOctets[index]}):</div>
                    <div class="binary-value">${binary}</div>
                `;
    octetsContainer.appendChild(octetDiv);
  });

  fullBinary.textContent = binaryOctets.join('.');
  result.classList.add('show');
}

ipInput.addEventListener('input', function () {
  const ip = this.value.trim();

  if (ip === '') {
    this.classList.remove('error');
    errorMessage.classList.remove('show');
    result.classList.remove('show');
    return;
  }

  if (validateIPv4(ip)) {
    this.classList.remove('error');
    errorMessage.classList.remove('show');
    displayResult(ip);
  } else {
    this.classList.add('error');
    errorMessage.classList.add('show');
    result.classList.remove('show');
  }
});

// Example IP on load
ipInput.value = '192.168.1.1';
ipInput.dispatchEvent(new Event('input'));
