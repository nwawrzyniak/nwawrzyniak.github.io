let spritesArray = [];
let originalImage = null;

// Padding values
let padding = { top: 0, right: 0, bottom: 0, left: 0 };

document.getElementById('spritesheet').addEventListener('change', function (e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const img = document.getElementById('originalImage');
      img.src = e.target.result;
      img.classList.remove('hidden');
      img.onload = function () {
        originalImage = img;
      };
    };
    reader.readAsDataURL(file);
    const dimensionsDiv = document.getElementById('dimensions');
    dimensionsDiv.classList.remove('hidden');
  }
});

function cutSprites() {
  if (!originalImage) {
    alert('Please upload a spritesheet first!');
    return;
  }

  const columns = parseInt(document.getElementById('columns').value);
  const rows = parseInt(document.getElementById('rows').value);

  if (columns < 1 || rows < 1) {
    alert('Please enter valid grid dimensions!');
    return;
  }

  // Create canvas to work with the image
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  // Set canvas size to match image
  canvas.width = originalImage.naturalWidth;
  canvas.height = originalImage.naturalHeight;

  // Draw the original image
  ctx.drawImage(originalImage, 0, 0);

  // Calculate sprite dimensions
  const spriteWidth = canvas.width / columns;
  const spriteHeight = canvas.height / rows;

  // Initialize 2D array
  spritesArray = [];

  // Clear previous sprites display
  const container = document.getElementById('spritesContainer');
  container.innerHTML = '';
  container.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;

  // Cut sprites and store in 2D array
  for (let row = 0; row < rows; row++) {
    spritesArray[row] = [];
    for (let col = 0; col < columns; col++) {
      // Create canvas for individual sprite
      const spriteCanvas = document.createElement('canvas');
      const spriteCtx = spriteCanvas.getContext('2d');

      spriteCanvas.width = spriteWidth;
      spriteCanvas.height = spriteHeight;

      // Extract sprite from original image
      spriteCtx.drawImage(
        originalImage,
        col * spriteWidth, row * spriteHeight, spriteWidth, spriteHeight,
        0, 0, spriteWidth, spriteHeight
      );

      // Store in 2D array
      spritesArray[row][col] = spriteCanvas;

      // Create display element
      const spriteImg = document.createElement('img');
      spriteImg.src = spriteCanvas.toDataURL();
      spriteImg.className = 'sprite';
      spriteImg.style.width = spriteWidth +'px';
      spriteImg.style.height = spriteHeight +'px';
      spriteImg.title = `Row ${row}, Col ${col}`;

      container.appendChild(spriteImg);
    }
  }

  // Show info
  const info = document.getElementById('info');
  info.innerHTML = `
                <strong>Sprites cut successfully!</strong><br>
                Grid: ${columns} × ${rows} (${columns * rows} sprites)<br>
                Sprite size: ${Math.round(spriteWidth)} × ${Math.round(spriteHeight)} pixels<br>
            `;
  info.classList.remove('hidden');

  // Show the Download All Sprites button
  const downloadBtn = document.getElementById('downloadAllBtn');
  if (downloadBtn) {
    downloadBtn.classList.remove('hidden');
  }

  // Show padding controls and stitched preview
  document.getElementById('paddingControls').classList.remove('hidden');
  document.getElementById('stitchedPreviewContainer').classList.remove('hidden');
  updateStitchedPreview();

  console.log('Sprites array:', spritesArray);
}

// Listen for padding input changes
['padTop', 'padRight', 'padBottom', 'padLeft'].forEach(id => {
  document.getElementById(id).addEventListener('input', function () {
    padding.top = parseInt(document.getElementById('padTop').value) || 0;
    padding.right = parseInt(document.getElementById('padRight').value) || 0;
    padding.bottom = parseInt(document.getElementById('padBottom').value) || 0;
    padding.left = parseInt(document.getElementById('padLeft').value) || 0;
    updateStitchedPreview();
  });
});

function updateStitchedPreview() {
  // Only show preview if sprites exist
  if (!spritesArray.length || !spritesArray[0].length) {
    document.getElementById('stitchedPreviewContainer').classList.add('hidden');
    return;
  }
  const rows = spritesArray.length;
  const cols = spritesArray[0].length;
  const spriteWidth = spritesArray[0][0].width;
  const spriteHeight = spritesArray[0][0].height;
  const padT = padding.top, padR = padding.right, padB = padding.bottom, padL = padding.left;
  // Calculate trimmed sprite area
  const trim = {
    left: Math.max(0, -padL),
    top: Math.max(0, -padT),
    right: Math.max(0, -padR),
    bottom: Math.max(0, -padB)
  };
  const drawWidth = spriteWidth - trim.left - trim.right;
  const drawHeight = spriteHeight - trim.top - trim.bottom;
  const paddedWidth = drawWidth + Math.max(0, padL) + Math.max(0, padR);
  const paddedHeight = drawHeight + Math.max(0, padT) + Math.max(0, padB);
  const sheetWidth = cols * paddedWidth;
  const sheetHeight = rows * paddedHeight;
  const canvas = document.getElementById('stitchedPreview');
  canvas.width = sheetWidth;
  canvas.height = sheetHeight;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, sheetWidth, sheetHeight);
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      ctx.drawImage(
        spritesArray[row][col],
        trim.left, trim.top, drawWidth, drawHeight,
        col * paddedWidth + Math.max(0, padL),
        row * paddedHeight + Math.max(0, padT),
        drawWidth, drawHeight
      );
    }
  }
  document.getElementById('stitchedPreviewContainer').classList.remove('hidden');
}

// Download all sprites as a zip file
async function downloadAllSprites() {
  const zip = new MinimalZip();
  
  // Determine number of digits for numbering
  const total = spritesArray.length * (spritesArray[0]?.length || 0);
  const digits = total > 0 ? Math.max(2, String(total - 1).length) : 2;
  
  const promises = [];
  let idx = 0;
  
  for (let row = 0; row < spritesArray.length; row++) {
    for (let col = 0; col < spritesArray[row].length; col++) {
      const spriteCanvas = spritesArray[row][col];
      const name = idx.toString().padStart(digits, '0') + '.png';
      
      // Create a promise for each sprite conversion
      const promise = new Promise((resolve) => {
        spriteCanvas.toBlob((blob) => {
          // Convert blob to ArrayBuffer, then to Uint8Array
          blob.arrayBuffer().then(arrayBuffer => {
            const uint8Array = new Uint8Array(arrayBuffer);
            zip.file(name, uint8Array);
            resolve();
          });
        }, 'image/png');
      });
      
      promises.push(promise);
      idx++;
    }
  }
  
  // Wait for all sprites to be processed
  await Promise.all(promises);
  
  // Generate zip and trigger download
  zip.generateAsync({ type: 'blob' }).then(function (content) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(content);
    a.download = 'sprites.zip';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => document.body.removeChild(a), 100);
  });
}

// Attach event listener to the download button
document.getElementById('downloadAllBtn').addEventListener('click', downloadAllSprites);

// Download stitched spritesheet as PNG
document.getElementById('downloadStitchedBtn').addEventListener('click', function () {
  if (!spritesArray.length || !spritesArray[0].length) return;
  const rows = spritesArray.length;
  const cols = spritesArray[0].length;
  const spriteWidth = spritesArray[0][0].width;
  const spriteHeight = spritesArray[0][0].height;
  const padT = padding.top, padR = padding.right, padB = padding.bottom, padL = padding.left;
  const trim = {
    left: Math.max(0, -padL),
    top: Math.max(0, -padT),
    right: Math.max(0, -padR),
    bottom: Math.max(0, -padB)
  };
  const drawWidth = spriteWidth - trim.left - trim.right;
  const drawHeight = spriteHeight - trim.top - trim.bottom;
  const paddedWidth = drawWidth + Math.max(0, padL) + Math.max(0, padR);
  const paddedHeight = drawHeight + Math.max(0, padT) + Math.max(0, padB);
  const sheetWidth = cols * paddedWidth;
  const sheetHeight = rows * paddedHeight;
  const canvas = document.createElement('canvas');
  canvas.width = sheetWidth;
  canvas.height = sheetHeight;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, sheetWidth, sheetHeight);
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      ctx.drawImage(
        spritesArray[row][col],
        trim.left, trim.top, drawWidth, drawHeight,
        col * paddedWidth + Math.max(0, padL),
        row * paddedHeight + Math.max(0, padT),
        drawWidth, drawHeight
      );
    }
  }
  canvas.toBlob(function(blob) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'spritesheet.png';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => document.body.removeChild(a), 100);
  }, 'image/png');
});


