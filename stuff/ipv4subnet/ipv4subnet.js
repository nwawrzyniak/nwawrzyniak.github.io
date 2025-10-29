function ipToInt(ip) {
  const parts = ip.split('.').map(Number);
  return (parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3];
}

function intToIp(int) {
  return [
    (int >>> 24) & 0xFF,
    (int >>> 16) & 0xFF,
    (int >>> 8) & 0xFF,
    int & 0xFF
  ].join('.');
}

function ipToBinary(ip) {
  return ip.split('.').map(octet => {
    return parseInt(octet).toString(2).padStart(8, '0');
  }).join('.');
}

function isValidIp(ip) {
  const parts = ip.split('.');
  if (parts.length !== 4) return false;
  return parts.every(part => {
    const num = Number(part);
    return num >= 0 && num <= 255 && part === num.toString();
  });
}

function calculate() {
  const ipInput = document.getElementById('ipAddress').value.trim();
  const maskInput = document.getElementById('subnetMask').value.trim();
  const resultsDiv = document.getElementById('results');

  if (!isValidIp(ipInput)) {
    resultsDiv.innerHTML = '<div class="result-item error">Invalid IPv4 address format</div>';
    resultsDiv.classList.add('show');
    return;
  }

  if (!isValidIp(maskInput)) {
    resultsDiv.innerHTML = '<div class="result-item error">Invalid subnet mask format</div>';
    resultsDiv.classList.add('show');
    return;
  }

  const ipInt = ipToInt(ipInput);
  const maskInt = ipToInt(maskInput);

  const networkInt = ipInt & maskInt;
  const hostInt = ipInt & ~maskInt;

  const networkIp = intToIp(networkInt);
  const hostPart = intToIp(hostInt);

  resultsDiv.innerHTML = `
                <div class="result-item">
                    <div class="result-label">IP Address:</div>
                    <div class="result-value">${ipInput}</div>
                    <div class="binary">${ipToBinary(ipInput)}</div>
                </div>
                <div class="result-item">
                    <div class="result-label">Subnet Mask:</div>
                    <div class="result-value">${maskInput}</div>
                    <div class="binary">${ipToBinary(maskInput)}</div>
                </div>
                <div class="result-item">
                    <div class="result-label">Network Part:</div>
                    <div class="result-value">${networkIp}</div>
                    <div class="binary">${ipToBinary(networkIp)}</div>
                </div>
                <div class="result-item">
                    <div class="result-label">Host Part:</div>
                    <div class="result-value">${hostPart}</div>
                    <div class="binary">${ipToBinary(hostPart)}</div>
                </div>
            `;
  resultsDiv.classList.add('show');
}
