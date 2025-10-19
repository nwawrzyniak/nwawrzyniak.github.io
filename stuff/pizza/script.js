let pizzenA = [{ diameter: 24, price: 8.99 }, { diameter: 30, price: 10.99 }];
let pizzenB = [{ diameter: 36, price: 12.99 }];
let priceMode = { A: 'combo', B: 'combo' };

function addPizzaA() {
  pizzenA.push(createNewPizza());
  render();
}

function addPizzaB() {
  pizzenB.push(createNewPizza());
  render();
}

function createNewPizza() {
  return { diameter: 30, price: 10.99 };
}

function removePizza(side, index) {
  if (side === 'A' && pizzenA.length > 1) {
    pizzenA.splice(index, 1);
  } else if (side === 'B' && pizzenB.length > 1) {
    pizzenB.splice(index, 1);
  }
  render();
}

function updatePizza(side, index, field, value) {
  const val = parseFloat(value) || 0;
  if (side === 'A') {
    pizzenA[index][field] = val;
  } else {
    pizzenB[index][field] = val;
  }
  calculate();
}

function togglePriceMode(side) {
  const selected = document.querySelector(`input[name="priceMode${side}"]:checked`).value;
  priceMode[side] = selected;
  render();
}

function render() {
  const sideADiv = document.getElementById('sideA-pizzen');
  const sideBDiv = document.getElementById('sideB-pizzen');

  const createPizzaInputs = (pizzas, side) => {
    return pizzas.map((p, i) => `
      <div class="pizza-input">
        <input type="number" value="${p.diameter}" min="1" max="100" placeholder="Durchmesser (cm)" 
               oninput="updatePizza('${side}', ${i}, 'diameter', this.value)">
        <span>cm</span>
        ${priceMode[side] === 'individual'
          ? `<input type="number" value="${p.price}" min="0" step="0.01" placeholder="Preis (€)" 
                     oninput="updatePizza('${side}', ${i}, 'price', this.value)">€`
          : ''}
        ${pizzas.length > 1 ? `<button class="remove-btn" onclick="removePizza('${side}', ${i})">×</button>` : ''}
      </div>
    `).join('');
  };

  sideADiv.innerHTML = createPizzaInputs(pizzenA, 'A');
  sideBDiv.innerHTML = createPizzaInputs(pizzenB, 'B');

  // Toggle visibility of combo price inputs
  document.querySelector('.side:nth-child(1) .combo-price').style.display =
    priceMode.A === 'combo' ? 'flex' : 'none';
  document.querySelector('.side:nth-child(3) .combo-price').style.display =
    priceMode.B === 'combo' ? 'flex' : 'none';

  calculate();
}

function calculate() {
  const calcArea = d => Math.PI * (d / 2) ** 2;

  const totalA = pizzenA.reduce((sum, p) => sum + calcArea(p.diameter), 0);
  const totalB = pizzenB.reduce((sum, p) => sum + calcArea(p.diameter), 0);

  let priceA, priceB;

  if (priceMode.A === 'combo') {
    priceA = parseFloat(document.getElementById('priceA').value) || 0;
  } else {
    priceA = pizzenA.reduce((sum, p) => sum + (p.price || 0), 0);
  }

  if (priceMode.B === 'combo') {
    priceB = parseFloat(document.getElementById('priceB').value) || 0;
  } else {
    priceB = pizzenB.reduce((sum, p) => sum + (p.price || 0), 0);
  }

  const pricePerCm2A = priceA / totalA;
  const pricePerCm2B = priceB / totalB;

  // Visualization
  const allDiameters = [...pizzenA.map(p => p.diameter), ...pizzenB.map(p => p.diameter)];
  const maxD = Math.max(...allDiameters);
  const scale = Math.min(120 / maxD, 1.5);

  const displayA = document.getElementById('displayA');
  const displayB = document.getElementById('displayB');

  displayA.innerHTML = pizzenA.map(p =>
    `<div><div class="pizza" style="width:${p.diameter * scale * 2}px;height:${p.diameter * scale * 2}px;">
      <div class="pizza-label">${p.diameter}cm</div></div></div>`).join('');

  displayB.innerHTML = pizzenB.map(p =>
    `<div><div class="pizza" style="width:${p.diameter * scale * 2}px;height:${p.diameter * scale * 2}px;">
      <div class="pizza-label">${p.diameter}cm</div></div></div>`).join('');

  document.getElementById('infoA').innerHTML = `
    <div>${pizzenA.length} Pizz${pizzenA.length > 1 ? 'en' : 'a'}</div>
    <div class="total">${totalA.toFixed(0)} cm²</div>
    <div style="margin-top:10px;font-size:0.9em;">
      ${priceA.toFixed(2)}€ → ${pricePerCm2A.toFixed(3)}€/cm²
    </div>`;

  document.getElementById('infoB').innerHTML = `
    <div>${pizzenB.length} Pizz${pizzenB.length > 1 ? 'en' : 'a'}</div>
    <div class="total">${totalB.toFixed(0)} cm²</div>
    <div style="margin-top:10px;font-size:0.9em;">
      ${priceB.toFixed(2)}€ → ${pricePerCm2B.toFixed(3)}€/cm²
    </div>`;

  // Results
  const diff = Math.abs(totalA - totalB);
  const percentDiff = ((diff / Math.min(totalA, totalB)) * 100).toFixed(1);

  let areaText = '';
  if (totalA > totalB)
    areaText = `<div>🍕 <strong>Kombination 1</strong> hat ${percentDiff}% mehr Pizza (${diff.toFixed(0)} cm² mehr)</div>`;
  else if (totalB > totalA)
    areaText = `<div>🍕 <strong>Kombination 2</strong> hat ${percentDiff}% mehr Pizza (${diff.toFixed(0)} cm² mehr)</div>`;
  else
    areaText = `<div>🍕 Beide Kombinationen haben gleich viel Pizza (${totalA.toFixed(0)} cm²)</div>`;

  let priceText = '';
  if (pricePerCm2A < pricePerCm2B) {
    const saving = ((pricePerCm2B - pricePerCm2A) / pricePerCm2B * 100).toFixed(1);
    priceText = `<div>💰 <strong>Kombination 1</strong> ist ${saving}% günstiger pro cm²</div>`;
  } else if (pricePerCm2B < pricePerCm2A) {
    const saving = ((pricePerCm2A - pricePerCm2B) / pricePerCm2A * 100).toFixed(1);
    priceText = `<div>💰 <strong>Kombination 2</strong> ist ${saving}% günstiger pro cm²</div>`;
  } else {
    priceText = `<div>💰 Gleiches Preis-Leistungs-Verhältnis</div>`;
  }

  document.getElementById('result').innerHTML = `
    <div style="margin-bottom:15px;">
      <div><strong>Kombination 1:</strong> ${totalA.toFixed(0)} cm² für ${priceA.toFixed(2)}€</div>
      <div><strong>Kombination 2:</strong> ${totalB.toFixed(0)} cm² für ${priceB.toFixed(2)}€</div>
    </div>
    <div class="winner">${areaText}${priceText}</div>`;
}

// Initial render
render();
