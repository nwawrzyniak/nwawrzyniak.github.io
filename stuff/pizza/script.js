let pizzenA = [26, 26];
let pizzenB = [36];

function addPizza(side) {
  if (side === 'A') {
    pizzenA.push(30);
  } else {
    pizzenB.push(30);
  }
  render();
}

function removePizza(side, index) {
  if (side === 'A' && pizzenA.length > 1) {
    pizzenA.splice(index, 1);
  } else if (side === 'B' && pizzenB.length > 1) {
    pizzenB.splice(index, 1);
  }
  render();
}

function updatePizza(side, index, value) {
  const val = parseFloat(value) || 0;
  if (side === 'A') {
    pizzenA[index] = val;
  } else {
    pizzenB[index] = val;
  }
  calculate();
}

function render() {
  const sideADiv = document.getElementById('sideA-pizzen');
  const sideBDiv = document.getElementById('sideB-pizzen');

  sideADiv.innerHTML = pizzenA.map((diameter, i) => `
                <div class="pizza-input">
                    <input type="number" 
                           value="${diameter}" 
                           min="1" 
                           max="100" 
                           placeholder="Durchmesser (cm)"
                           oninput="updatePizza('A', ${i}, this.value)">
                    <span>cm</span>
                    ${pizzenA.length > 1 ? `<button class="remove-btn" onclick="removePizza('A', ${i})">×</button>` : ''}
                </div>
            `).join('');

  sideBDiv.innerHTML = pizzenB.map((diameter, i) => `
                <div class="pizza-input">
                    <input type="number" 
                           value="${diameter}" 
                           min="1" 
                           max="100" 
                           placeholder="Durchmesser (cm)"
                           oninput="updatePizza('B', ${i}, this.value)">
                    <span>cm</span>
                    ${pizzenB.length > 1 ? `<button class="remove-btn" onclick="removePizza('B', ${i})">×</button>` : ''}
                </div>
            `).join('');

  calculate();
}

function calculate() {
  const calculateArea = (diameter) => Math.PI * Math.pow(diameter / 2, 2);

  const areasA = pizzenA.map(d => calculateArea(d));
  const areasB = pizzenB.map(d => calculateArea(d));
  const totalA = areasA.reduce((sum, area) => sum + area, 0);
  const totalB = areasB.reduce((sum, area) => sum + area, 0);

  const priceA = parseFloat(document.getElementById('priceA').value) || 0;
  const priceB = parseFloat(document.getElementById('priceB').value) || 0;

  const pricePerCm2A = priceA / totalA;
  const pricePerCm2B = priceB / totalB;

  // Visualisierung
  const allDiameters = [...pizzenA, ...pizzenB];
  const maxDiameter = Math.max(...allDiameters);
  const scale = Math.min(120 / maxDiameter, 1.5);

  const displayA = document.getElementById('displayA');
  const displayB = document.getElementById('displayB');

  displayA.innerHTML = pizzenA.map((d, i) => `
                <div style="position: relative;">
                    <div class="pizza" style="width: ${d * scale}px; height: ${d * scale}px;">
                        <div class="pizza-label">${d}cm</div>
                    </div>
                </div>
            `).join('');

  displayB.innerHTML = pizzenB.map((d, i) => `
                <div style="position: relative;">
                    <div class="pizza" style="width: ${d * scale}px; height: ${d * scale}px;">
                        <div class="pizza-label">${d}cm</div>
                    </div>
                </div>
            `).join('');

  // Info anzeigen
  document.getElementById('infoA').innerHTML = `
                <div>${pizzenA.length} Pizz${pizzenA.length > 1 ? 'en' : 'a'}</div>
                <div class="total">${totalA.toFixed(0)} cm²</div>
                <div style="margin-top: 10px; font-size: 0.9em;">
                    ${priceA.toFixed(2)}€ → ${pricePerCm2A.toFixed(3)}€/cm²
                </div>
            `;

  document.getElementById('infoB').innerHTML = `
                <div>${pizzenB.length} Pizz${pizzenB.length > 1 ? 'en' : 'a'}</div>
                <div class="total">${totalB.toFixed(0)} cm²</div>
                <div style="margin-top: 10px; font-size: 0.9em;">
                    ${priceB.toFixed(2)}€ → ${pricePerCm2B.toFixed(3)}€/cm²
                </div>
            `;

  // Ergebnis
  const resultDiv = document.getElementById('result');
  const difference = Math.abs(totalA - totalB);
  const percentDiff = ((difference / Math.min(totalA, totalB)) * 100).toFixed(1);

  let resultText = '';
  let areaWinner = '';
  let priceWinner = '';

  // Flächenvergleich
  if (totalA > totalB) {
    areaWinner = `<div>🍕 <strong>Seite A</strong> hat ${percentDiff}% mehr Pizza (${difference.toFixed(0)} cm² mehr)</div>`;
  } else if (totalB > totalA) {
    areaWinner = `<div>🍕 <strong>Seite B</strong> hat ${percentDiff}% mehr Pizza (${difference.toFixed(0)} cm² mehr)</div>`;
  } else {
    areaWinner = `<div>🍕 Beide Seiten haben gleich viel Pizza (${totalA.toFixed(0)} cm²)</div>`;
  }

  // Preis-Leistungs-Verhältnis
  if (pricePerCm2A < pricePerCm2B) {
    const saving = ((pricePerCm2B - pricePerCm2A) / pricePerCm2B * 100).toFixed(1);
    priceWinner = `<div>💰 <strong>Seite A</strong> ist ${saving}% günstiger pro cm²</div>`;
  } else if (pricePerCm2B < pricePerCm2A) {
    const saving = ((pricePerCm2A - pricePerCm2B) / pricePerCm2A * 100).toFixed(1);
    priceWinner = `<div>💰 <strong>Seite B</strong> ist ${saving}% günstiger pro cm²</div>`;
  } else {
    priceWinner = `<div>💰 Beide Seiten haben das gleiche Preis-Leistungs-Verhältnis</div>`;
  }

  resultText = `
                <div style="margin-bottom: 15px;">
                    <div><strong>Seite A:</strong> ${totalA.toFixed(0)} cm² für ${priceA.toFixed(2)}€</div>
                    <div><strong>Seite B:</strong> ${totalB.toFixed(0)} cm² für ${priceB.toFixed(2)}€</div>
                </div>
                <div class="winner">
                    ${areaWinner}
                    ${priceWinner}
                </div>
            `;

  resultDiv.innerHTML = resultText;
}

// Initial rendern
render();
