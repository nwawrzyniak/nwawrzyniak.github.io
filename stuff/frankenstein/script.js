class SpriteMerger {
  constructor() {
    this.sprites1 = [];
    this.sprites2 = [];
    this.mergedSprites = [];
    this.currentSpriteIndex = 0;
    this.selections1 = [];
    this.selections2 = [];
    this.isSelecting = false;
    this.startX = 0;
    this.startY = 0;
    this.currentCanvas = null;
    this.conflictPixels = [];
    this.currentConflictIndex = 0;
    this.scale1 = 4; // For canvas1
    this.scale2 = 4; // For canvas2
    this.defaultScale = 4;
    this.selectionMode1 = 'area'; // 'area' or 'pixel'
    this.selectionMode2 = 'area';

    this.initializeEventListeners();
  }

  initializeEventListeners() {
    // File upload handlers
    document.getElementById('upload1').addEventListener('click', () => {
      document.getElementById('file1').click();
    });

    document.getElementById('upload2').addEventListener('click', () => {
      document.getElementById('file2').click();
    });

    // Drag and drop handlers
    ['upload1', 'upload2'].forEach(id => {
      const area = document.getElementById(id);
      area.addEventListener('dragover', (e) => {
        e.preventDefault();
        area.classList.add('dragover');
      });

      area.addEventListener('dragleave', () => {
        area.classList.remove('dragover');
      });

      area.addEventListener('drop', (e) => {
        e.preventDefault();
        area.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
          const fileInput = area.querySelector('input[type="file"]');
          fileInput.files = files;
          this.handleFileUpload(fileInput);
        }
      });
    });

    // File input change handlers
    document.getElementById('file1').addEventListener('change', (e) => {
      this.handleFileUpload(e.target);
    });

    document.getElementById('file2').addEventListener('change', (e) => {
      this.handleFileUpload(e.target);
    });

    // Process button
    document.getElementById('processBtn').addEventListener('click', () => {
      this.processSprites();
    });

    // Canvas selection handlers
    document.getElementById('select1').addEventListener('click', () => {
      this.setSelectionMode('canvas1', 'area');
    });
    document.getElementById('pixel1').addEventListener('click', () => {
      this.setSelectionMode('canvas1', 'pixel');
    });
    document.getElementById('select2').addEventListener('click', () => {
      this.setSelectionMode('canvas2', 'area');
    });
    document.getElementById('pixel2').addEventListener('click', () => {
      this.setSelectionMode('canvas2', 'pixel');
    });

    document.getElementById('clear1').addEventListener('click', () => {
      this.clearSelections(1);
    });

    document.getElementById('clear2').addEventListener('click', () => {
      this.clearSelections(2);
    });

    // Zoom controls for canvas1
    document.getElementById('zoomIn1').addEventListener('click', () => {
      this.setZoom(1, this.scale1 + 1);
    });
    document.getElementById('zoomOut1').addEventListener('click', () => {
      this.setZoom(1, Math.max(1, this.scale1 - 1));
    });
    document.getElementById('zoomLevel1').addEventListener('change', (e) => {
      let val = parseInt(e.target.value);
      if (isNaN(val) || val < 1) val = 1;
      if (val > 32) val = 32;
      this.setZoom(1, val);
    });

    // Zoom controls for canvas2
    document.getElementById('zoomIn2').addEventListener('click', () => {
      this.setZoom(2, this.scale2 + 1);
    });
    document.getElementById('zoomOut2').addEventListener('click', () => {
      this.setZoom(2, Math.max(1, this.scale2 - 1));
    });
    document.getElementById('zoomLevel2').addEventListener('change', (e) => {
      let val = parseInt(e.target.value);
      if (isNaN(val) || val < 1) val = 1;
      if (val > 32) val = 32;
      this.setZoom(2, val);
    });

    // Finalize button
    document.getElementById('finalizeBtn').addEventListener('click', () => {
      this.finalizeCurrentSprite();
    });

    // Skip button
    document.getElementById('skipBtn').addEventListener('click', () => {
      this.skipCurrentSprite();
    });

    // Conflict resolution buttons (for the old conflict resolution UI - kept for backward compatibility)
    document.getElementById('useSprite1').addEventListener('click', () => {
      // This is for the old conflict resolution UI
      this.resolveConflicts(1);
    });

    document.getElementById('useSprite2').addEventListener('click', () => {
      // This is for the old conflict resolution UI
      this.resolveConflicts(2);
    });

    document.getElementById('useTransparent').addEventListener('click', () => {
      // This is for the old conflict resolution UI
      this.resolveConflicts(0);
    });
    // Conflict resolution buttons for individual pixel UI
    document.getElementById('individualUseSprite1').addEventListener('click', () => {
      this.resolveIndividualConflict(1);
    });
    document.getElementById('individualUseSprite2').addEventListener('click', () => {
      this.resolveIndividualConflict(2);
    });
    document.getElementById('individualUseTransparent').addEventListener('click', () => {
      this.resolveIndividualConflict(0);
    });
    // Color picker logic
    const pickColorBtn = document.getElementById('pickColorBtn');
    const colorPicker = document.getElementById('color-picker');
    pickColorBtn.addEventListener('click', () => {
      colorPicker.value = '#000000'; // Default
      // Position the color picker next to the preview
      const previewCanvas = document.getElementById('conflictPreviewCanvas');
      const rect = previewCanvas.getBoundingClientRect();
      colorPicker.style.position = 'absolute';
      colorPicker.style.left = (rect.right + 10) + 'px';
      colorPicker.style.top = rect.top + 'px';
      colorPicker.classList.remove('hidden');
      colorPicker.click();
    });
    colorPicker.addEventListener('input', (e) => {
      const hex = e.target.value;
      // Convert hex to RGBA
      const r = parseInt(hex.substr(1, 2), 16);
      const g = parseInt(hex.substr(3, 2), 16);
      const b = parseInt(hex.substr(5, 2), 16);
      this.resolveIndividualConflict([r, g, b, 255]);
      colorPicker.classList.add('hidden');
    });
    colorPicker.addEventListener('change', (e) => {
      colorPicker.classList.add('hidden');
    });
  }

  handleFileUpload(fileInput) {
    const file = fileInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const previewContainer = fileInput.parentElement.querySelector('div[id^="preview"]');
        previewContainer.innerHTML = `<img src="${e.target.result}" class="preview-img" alt="Preview">`;

        if (fileInput.id === 'file1') {
          this.image1 = img;
        } else {
          this.image2 = img;
        }

        this.checkProcessButton();
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  checkProcessButton() {
    const btn = document.getElementById('processBtn');
    btn.disabled = !(this.image1 && this.image2);
  }

  processSprites() {
    const columns = parseInt(document.getElementById('columns').value);
    const rows = parseInt(document.getElementById('rows').value);

    this.sprites1 = this.cutSpritesheet(this.image1, columns, rows);
    this.sprites2 = this.cutSpritesheet(this.image2, columns, rows);

    this.displaySprites();
    this.initializeEditor();

    document.getElementById('spriteGrid').style.display = 'grid';
    document.getElementById('editor-panel').style.display = 'grid';
  }

  cutSpritesheet(image, columns, rows) {
    const spriteWidth = image.width / columns;
    const spriteHeight = image.height / rows;
    const sprites = [];

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        canvas.width = spriteWidth;
        canvas.height = spriteHeight;

        ctx.drawImage(
          image,
          col * spriteWidth, row * spriteHeight,
          spriteWidth, spriteHeight,
          0, 0,
          spriteWidth, spriteHeight
        );

        const imageData = ctx.getImageData(0, 0, spriteWidth, spriteHeight);
        sprites.push({
          imageData: imageData,
          canvas: this.createSpriteCanvas(imageData)
        });
      }
    }

    return sprites;
  }

  createSpriteCanvas(imageData) {
    const canvas = document.createElement('canvas');
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.putImageData(imageData, 0, 0);
    return canvas;
  }

  displaySprites() {
    const container1 = document.getElementById('sprites1');
    const container2 = document.getElementById('sprites2');
    const columns = parseInt(document.getElementById('columns').value);

    container1.innerHTML = '';
    container2.innerHTML = '';

    // Set the grid layout to match the spritesheet configuration
    container1.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
    container2.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;

    this.sprites1.forEach((sprite, index) => {
      const spriteContainer = document.createElement('div');
      spriteContainer.className = 'sprite-container';
      
      const numberLabel = document.createElement('label');
      numberLabel.className = 'sprite-number';
      numberLabel.textContent = index + 1;
      
      const img = document.createElement('img');
      img.src = sprite.canvas.toDataURL();
      img.className = 'sprite-thumbnail';
      img.addEventListener('click', () => this.selectSprite(index));
      
      spriteContainer.appendChild(numberLabel);
      spriteContainer.appendChild(img);
      container1.appendChild(spriteContainer);
    });

    this.sprites2.forEach((sprite, index) => {
      const spriteContainer = document.createElement('div');
      spriteContainer.className = 'sprite-container';
      
      const numberLabel = document.createElement('label');
      numberLabel.className = 'sprite-number';
      numberLabel.textContent = index + 1;
      
      const img = document.createElement('img');
      img.src = sprite.canvas.toDataURL();
      img.className = 'sprite-thumbnail';
      img.addEventListener('click', () => this.selectSprite(index));
      
      spriteContainer.appendChild(numberLabel);
      spriteContainer.appendChild(img);
      container2.appendChild(spriteContainer);
    });

    // Initialize merged sprites array
    this.mergedSprites = new Array(this.sprites1.length).fill(null);
    this.selectSprite(0);
  }

  selectSprite(index) {
    this.currentSpriteIndex = index;

    // Update thumbnail selections
    document.querySelectorAll('.sprite-thumbnail').forEach(thumb => {
      thumb.classList.remove('selected');
    });

    const thumbs1 = document.querySelectorAll('#sprites1 .sprite-thumbnail');
    const thumbs2 = document.querySelectorAll('#sprites2 .sprite-thumbnail');

    if (thumbs1[index]) thumbs1[index].classList.add('selected');
    if (thumbs2[index]) thumbs2[index].classList.add('selected');

    // Show the editor panel when a sprite is selected for editing
    document.getElementById('editor-panel').classList.remove('hidden');

    this.loadSpriteIntoEditor(index);
  }

  loadSpriteIntoEditor(index) {
    const sprite1 = this.sprites1[index];
    const sprite2 = this.sprites2[index];

    // Initialize selections for this sprite if not exists
    if (!this.selections1[index]) this.selections1[index] = [];
    if (!this.selections2[index]) this.selections2[index] = [];

    this.drawSpriteOnCanvas('canvas1', sprite1.imageData);
    this.drawSpriteOnCanvas('canvas2', sprite2.imageData);

    this.updatePreview();
  }

  drawSpriteOnCanvas(canvasId, imageData) {
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext('2d');
    const scale = canvasId === 'canvas1' ? this.scale1 : this.scale2;

    canvas.width = imageData.width * scale;
    canvas.height = imageData.height * scale;

    // Create a temporary canvas to draw the original image
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = imageData.width;
    tempCanvas.height = imageData.height;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.putImageData(imageData, 0, 0);

    // Scale up the image
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(tempCanvas, 0, 0, canvas.width, canvas.height);

    // Draw selections
    this.drawSelections(canvasId);

    // Add mouse event listeners
    this.setupCanvasEvents(canvas);
  }

  setupCanvasEvents(canvas) {
    canvas.addEventListener('mousedown', (e) => {
      if (this.currentCanvas !== canvas) return;
      if (e.button !== 0) return; // Only left click
      const mode = canvas.id === 'canvas1' ? this.selectionMode1 : this.selectionMode2;
      const rect = canvas.getBoundingClientRect();
      const scale = canvas.id === 'canvas1' ? this.scale1 : this.scale2;
      const x = Math.floor((e.clientX - rect.left) / scale);
      const y = Math.floor((e.clientY - rect.top) / scale);
      if (mode === 'area') {
        this.isSelecting = true;
        this.startX = x;
        this.startY = y;
      } else if (mode === 'pixel') {
        // Add single pixel selection
        this.addSelection(canvas.id, x, y, x, y);
      }
    });

    canvas.addEventListener('mousemove', (e) => {
      if (!this.isSelecting || this.currentCanvas !== canvas) return;

      // If right mouse button is pressed while dragging, cancel selection
      if (e.buttons === 2) {
        this.isSelecting = false;
        this.currentCanvas = null;
        // Remove preview by redrawing
        this.drawSelections(canvas.id);
        document.querySelectorAll('.selection-btn').forEach(btn => {
          btn.classList.remove('active');
        });
        return;
      }

      const rect = canvas.getBoundingClientRect();
      const scale = canvas.id === 'canvas1' ? this.scale1 : this.scale2;
      const currentX = Math.floor((e.clientX - rect.left) / scale);
      const currentY = Math.floor((e.clientY - rect.top) / scale);

      this.drawSelectionPreview(canvas, this.startX, this.startY, currentX, currentY);
    });

    canvas.addEventListener('mouseup', (e) => {
      if (!this.isSelecting || this.currentCanvas !== canvas) return;

      // If right mouse button released, cancel selection and do not add
      if (e.button === 2) {
        this.isSelecting = false;
        this.currentCanvas = null;
        this.drawSelections(canvas.id);
        document.querySelectorAll('.selection-btn').forEach(btn => {
          btn.classList.remove('active');
        });
        return;
      }

      this.isSelecting = false;
      const rect = canvas.getBoundingClientRect();
      const scale = canvas.id === 'canvas1' ? this.scale1 : this.scale2;
      const endX = Math.floor((e.clientX - rect.left) / scale);
      const endY = Math.floor((e.clientY - rect.top) / scale);
      this.addSelection(canvas.id, this.startX, this.startY, endX, endY);
      // Do not exit selection mode, keep currentCanvas set

      // Update button states
      document.querySelectorAll('.selection-btn').forEach(btn => {
        btn.classList.remove('active');
      });
    });

    // Prevent context menu from appearing during selection
    canvas.addEventListener('contextmenu', (e) => {
      if (this.isSelecting) {
        e.preventDefault();
        return false;
      }
    });
  }

  setSelectionMode(canvasId, mode) {
    if (canvasId === 'canvas1') {
      this.selectionMode1 = mode;
      this.currentCanvas = document.getElementById('canvas1');
      document.getElementById('select1').classList.toggle('active', mode === 'area');
      document.getElementById('pixel1').classList.toggle('active', mode === 'pixel');
    } else {
      this.selectionMode2 = mode;
      this.currentCanvas = document.getElementById('canvas2');
      document.getElementById('select2').classList.toggle('active', mode === 'area');
      document.getElementById('pixel2').classList.toggle('active', mode === 'pixel');
    }
  }

  addSelection(canvasId, startX, startY, endX, endY) {
    const spriteIndex = this.currentSpriteIndex;
    const selection = {
      x: Math.min(startX, endX),
      y: Math.min(startY, endY),
      width: Math.abs(endX - startX) + 1,
      height: Math.abs(endY - startY) + 1
    };

    if (canvasId === 'canvas1') {
      this.selections1[spriteIndex].push(selection);
    } else {
      this.selections2[spriteIndex].push(selection);
    }

    this.drawSelections(canvasId);
    this.updatePreview();
  }

  drawSelections(canvasId) {
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext('2d');
    const spriteIndex = this.currentSpriteIndex;
    const scale = canvasId === 'canvas1' ? this.scale1 : this.scale2;

    // Clear the canvas completely
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Redraw the original sprite
    const sprite = canvasId === 'canvas1' ? this.sprites1[spriteIndex] : this.sprites2[spriteIndex];
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = sprite.imageData.width;
    tempCanvas.height = sprite.imageData.height;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.putImageData(sprite.imageData, 0, 0);

    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(tempCanvas, 0, 0, canvas.width, canvas.height);

    // Draw selections
    const selections = canvasId === 'canvas1' ? this.selections1[spriteIndex] : this.selections2[spriteIndex];
    ctx.strokeStyle = canvasId === 'canvas1' ? '#ff6b6b' : '#4ecdc4';
    ctx.lineWidth = 2;
    ctx.fillStyle = canvasId === 'canvas1' ? 'rgba(255, 107, 107, 0.3)' : 'rgba(78, 205, 196, 0.3)';

    selections.forEach(selection => {
      const x = selection.x * scale;
      const y = selection.y * scale;
      const w = selection.width * scale;
      const h = selection.height * scale;

      ctx.fillRect(x, y, w, h);
      ctx.strokeRect(x, y, w, h);
    });
  }

  drawSelectionPreview(canvas, startX, startY, currentX, currentY) {
    const ctx = canvas.getContext('2d');
    const spriteIndex = this.currentSpriteIndex;
    const scale = canvas.id === 'canvas1' ? this.scale1 : this.scale2;

    // Redraw everything
    const sprite = canvas.id === 'canvas1' ? this.sprites1[spriteIndex] : this.sprites2[spriteIndex];
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = sprite.imageData.width;
    tempCanvas.height = sprite.imageData.height;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.putImageData(sprite.imageData, 0, 0);

    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(tempCanvas, 0, 0, canvas.width, canvas.height);

    // Redraw existing selections
    this.drawSelections(canvas.id);

    // Draw preview selection
    const x = Math.min(startX, currentX) * scale;
    const y = Math.min(startY, currentY) * scale;
    const w = (Math.abs(currentX - startX) + 1) * scale;
    const h = (Math.abs(currentY - startY) + 1) * scale;

    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(x, y, w, h);
    ctx.setLineDash([]);
  }

  clearSelections(spriteNum) {
    const spriteIndex = this.currentSpriteIndex;
    if (spriteNum === 1) {
      this.selections1[spriteIndex] = [];
      this.drawSelections('canvas1');
    } else {
      this.selections2[spriteIndex] = [];
      this.drawSelections('canvas2');
    }
    this.updatePreview();
  }

  updatePreview() {
    const canvas = document.getElementById('previewCanvas');
    const ctx = canvas.getContext('2d');
    const spriteIndex = this.currentSpriteIndex;

    const sprite1 = this.sprites1[spriteIndex];
    const sprite2 = this.sprites2[spriteIndex];

    // Use the default scale for preview
    canvas.width = sprite1.imageData.width * this.defaultScale;
    canvas.height = sprite1.imageData.height * this.defaultScale;

    // Create merged image data
    const mergedData = this.createMergedImageData(sprite1.imageData, sprite2.imageData, spriteIndex);

    // Draw merged result
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = mergedData.width;
    tempCanvas.height = mergedData.height;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.putImageData(mergedData, 0, 0);

    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(tempCanvas, 0, 0, canvas.width, canvas.height);
  }

  createMergedImageData(imageData1, imageData2, spriteIndex) {
    const width = imageData1.width;
    const height = imageData1.height;
    const mergedData = new ImageData(width, height);

    const selections1 = this.selections1[spriteIndex] || [];
    const selections2 = this.selections2[spriteIndex] || [];

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;

        const inSelection1 = this.isPixelInSelections(x, y, selections1);
        const inSelection2 = this.isPixelInSelections(x, y, selections2);

        if (inSelection1 && inSelection2) {
          // Conflict - for now, use sprite1
          mergedData.data[i] = imageData1.data[i];
          mergedData.data[i + 1] = imageData1.data[i + 1];
          mergedData.data[i + 2] = imageData1.data[i + 2];
          mergedData.data[i + 3] = imageData1.data[i + 3];
        } else if (inSelection1) {
          mergedData.data[i] = imageData1.data[i];
          mergedData.data[i + 1] = imageData1.data[i + 1];
          mergedData.data[i + 2] = imageData1.data[i + 2];
          mergedData.data[i + 3] = imageData1.data[i + 3];
        } else if (inSelection2) {
          mergedData.data[i] = imageData2.data[i];
          mergedData.data[i + 1] = imageData2.data[i + 1];
          mergedData.data[i + 2] = imageData2.data[i + 2];
          mergedData.data[i + 3] = imageData2.data[i + 3];
        } else {
          // No selection - check if pixel is transparent in both
          const alpha1 = imageData1.data[i + 3];
          const alpha2 = imageData2.data[i + 3];

          if (alpha1 === 0 && alpha2 === 0) {
            // Both transparent, keep transparent
            mergedData.data[i] = 0;
            mergedData.data[i + 1] = 0;
            mergedData.data[i + 2] = 0;
            mergedData.data[i + 3] = 0;
          } else {
            // Has content but no selection - mark as conflict
            mergedData.data[i] = 255;
            mergedData.data[i + 1] = 0;
            mergedData.data[i + 2] = 255;
            mergedData.data[i + 3] = 128;
          }
        }
      }
    }

    return mergedData;
  }

  isPixelInSelections(x, y, selections) {
    return selections.some(selection => {
      return x >= selection.x && x < selection.x + selection.width &&
        y >= selection.y && y < selection.y + selection.height;
    });
  }

  finalizeCurrentSprite() {
    const spriteIndex = this.currentSpriteIndex;
    const sprite1 = this.sprites1[spriteIndex];
    const sprite2 = this.sprites2[spriteIndex];

    // Check for conflicts
    const conflicts = this.findConflicts(sprite1.imageData, sprite2.imageData, spriteIndex);

    if (conflicts.length > 0) {
      this.conflictPixels = conflicts;
      this.currentConflictIndex = 0;
      this.showIndividualConflictResolution();
    } else {
      this.completeMerge(spriteIndex);
    }
  }

  skipCurrentSprite() {
    const spriteIndex = this.currentSpriteIndex;
    const sprite1 = this.sprites1[spriteIndex];

    // Create an empty (transparent) sprite with the same dimensions
    const emptyData = new ImageData(sprite1.imageData.width, sprite1.imageData.height);
    this.mergedSprites[spriteIndex] = emptyData;

    // Show the completed sprite immediately
    this.showCompletedSprite(spriteIndex, emptyData);

    // Check if all sprites are done
    const allDone = this.mergedSprites.every(sprite => sprite !== null);
    if (allDone) {
      document.getElementById('editor-panel').classList.add('hidden');
    } else {
      this.moveToNextSprite();
    }
  }

  findConflicts(imageData1, imageData2, spriteIndex) {
    const width = imageData1.width;
    const height = imageData1.height;
    const conflicts = [];

    const selections1 = this.selections1[spriteIndex] || [];
    const selections2 = this.selections2[spriteIndex] || [];

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;

        const inSelection1 = this.isPixelInSelections(x, y, selections1);
        const inSelection2 = this.isPixelInSelections(x, y, selections2);

        if (!inSelection1 && !inSelection2) {
          const alpha1 = imageData1.data[i + 3];
          const alpha2 = imageData2.data[i + 3];

          if (alpha1 > 0 || alpha2 > 0) {
            conflicts.push({ x, y });
          }
        }
      }
    }

    return conflicts;
  }

  showConflictResolution() {
    // This method is kept for backward compatibility but is no longer used
    // The individual conflict resolution is now used instead
  }

  resolveConflicts(choice) {
    // This method is kept for backward compatibility but is no longer used
    // The individual conflict resolution is now used instead
  }

  completeMerge(spriteIndex, conflictChoice = 0) {
    const sprite1 = this.sprites1[spriteIndex];
    const sprite2 = this.sprites2[spriteIndex];
    const mergedData = this.createFinalMergedImageData(sprite1.imageData, sprite2.imageData, spriteIndex, conflictChoice);

    this.mergedSprites[spriteIndex] = mergedData;

    // Show the completed sprite immediately
    this.showCompletedSprite(spriteIndex, mergedData);

    // Update preview
    this.updatePreview();

    // Check if all sprites are done
    const allDone = this.mergedSprites.every(sprite => sprite !== null);
    if (allDone) {
      document.getElementById('editor-panel').classList.add('hidden');
    } else {
      this.moveToNextSprite();
    }
  }

  showCompletedSprite(spriteIndex, spriteData) {
    // Get the completed sprites container
    const completedContainer = document.getElementById('completedSprites');
    const completedGrid = completedContainer.querySelector('.completed-grid');

    // Check if this sprite is already displayed
    const existingSprite = completedGrid.querySelector(`[data-sprite-index="${spriteIndex}"]`);
    if (existingSprite) {
      existingSprite.remove();
    }

    // Create canvas for the sprite
    const canvas = document.createElement('canvas');
    canvas.width = spriteData.width;
    canvas.height = spriteData.height;
    const ctx = canvas.getContext('2d');
    ctx.putImageData(spriteData, 0, 0);

    // Create download item
    const downloadItem = document.createElement('div');
    downloadItem.className = 'download-item';
    downloadItem.setAttribute('data-sprite-index', spriteIndex);

    const preview = document.createElement('img');
    preview.src = canvas.toDataURL();
    preview.className = 'download-preview';

    const button = document.createElement('button');
    button.className = 'download-btn';
    button.textContent = `Download Sprite ${spriteIndex + 1}`;
    button.addEventListener('click', () => {
      this.downloadSprite(canvas, `merged_sprite_${spriteIndex + 1}.png`);
    });

    downloadItem.appendChild(preview);
    downloadItem.appendChild(button);
    
    // Insert the sprite at the correct position to maintain numeric ordering
    const existingItems = completedGrid.querySelectorAll('.download-item');
    let inserted = false;
    
    for (let i = 0; i < existingItems.length; i++) {
      const existingIndex = parseInt(existingItems[i].getAttribute('data-sprite-index'));
      if (spriteIndex < existingIndex) {
        completedGrid.insertBefore(downloadItem, existingItems[i]);
        inserted = true;
        break;
      }
    }
    
    // If not inserted (either no existing items or this sprite should be last), append to end
    if (!inserted) {
      completedGrid.appendChild(downloadItem);
    }

    // Remove hidden class when first sprite is added
    completedContainer.classList.remove('hidden');
  }

  moveToNextSprite() {
    const nextIndex = this.mergedSprites.findIndex((sprite, index) => index > this.currentSpriteIndex && sprite === null);
    if (nextIndex !== -1) {
      this.selectSprite(nextIndex);
    }
  }

  createFinalMergedImageData(imageData1, imageData2, spriteIndex, conflictChoice) {
    const width = imageData1.width;
    const height = imageData1.height;
    const mergedData = new ImageData(width, height);

    const selections1 = this.selections1[spriteIndex] || [];
    const selections2 = this.selections2[spriteIndex] || [];

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;

        const inSelection1 = this.isPixelInSelections(x, y, selections1);
        const inSelection2 = this.isPixelInSelections(x, y, selections2);

        if (inSelection1 && inSelection2) {
          // Conflict between selections - use sprite1
          mergedData.data[i] = imageData1.data[i];
          mergedData.data[i + 1] = imageData1.data[i + 1];
          mergedData.data[i + 2] = imageData1.data[i + 2];
          mergedData.data[i + 3] = imageData1.data[i + 3];
        } else if (inSelection1) {
          mergedData.data[i] = imageData1.data[i];
          mergedData.data[i + 1] = imageData1.data[i + 1];
          mergedData.data[i + 2] = imageData1.data[i + 2];
          mergedData.data[i + 3] = imageData1.data[i + 3];
        } else if (inSelection2) {
          mergedData.data[i] = imageData2.data[i];
          mergedData.data[i + 1] = imageData2.data[i + 1];
          mergedData.data[i + 2] = imageData2.data[i + 2];
          mergedData.data[i + 3] = imageData2.data[i + 3];
        } else {
          // No selection - apply conflict resolution
          const alpha1 = imageData1.data[i + 3];
          const alpha2 = imageData2.data[i + 3];

          if (alpha1 === 0 && alpha2 === 0) {
            // Both transparent
            mergedData.data[i] = 0;
            mergedData.data[i + 1] = 0;
            mergedData.data[i + 2] = 0;
            mergedData.data[i + 3] = 0;
          } else if (conflictChoice === 1) {
            // Use sprite1
            mergedData.data[i] = imageData1.data[i];
            mergedData.data[i + 1] = imageData1.data[i + 1];
            mergedData.data[i + 2] = imageData1.data[i + 2];
            mergedData.data[i + 3] = imageData1.data[i + 3];
          } else if (conflictChoice === 2) {
            // Use sprite2
            mergedData.data[i] = imageData2.data[i];
            mergedData.data[i + 1] = imageData2.data[i + 1];
            mergedData.data[i + 2] = imageData2.data[i + 2];
            mergedData.data[i + 3] = imageData2.data[i + 3];
          } else {
            // Make transparent
            mergedData.data[i] = 0;
            mergedData.data[i + 1] = 0;
            mergedData.data[i + 2] = 0;
            mergedData.data[i + 3] = 0;
          }
        }
      }
    }

    return mergedData;
  }

  downloadSprite(canvas, filename) {
    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL();
    link.click();
  }

  initializeEditor() {
    // Initialize selections arrays
    this.selections1 = new Array(this.sprites1.length).fill(null).map(() => []);
    this.selections2 = new Array(this.sprites2.length).fill(null).map(() => []);
  }

  setZoom(canvasNum, scale) {
    if (canvasNum === 1) {
      this.scale1 = scale;
      document.getElementById('zoomLevel1').value = scale;
      this.drawSpriteOnCanvas('canvas1', this.sprites1[this.currentSpriteIndex].imageData);
    } else {
      this.scale2 = scale;
      document.getElementById('zoomLevel2').value = scale;
      this.drawSpriteOnCanvas('canvas2', this.sprites2[this.currentSpriteIndex].imageData);
    }
  }

  showIndividualConflictResolution() {
    // Hide the editor panel
    document.getElementById('editor-panel').style.display = 'none';
    
    // Show the individual conflict resolution panel
    const conflictPanel = document.getElementById('individualConflictResolution');
    conflictPanel.style.display = 'block';
    
    // Update the conflict info
    this.updateConflictInfo();
    
    // Show the current pixel in the preview
    this.showCurrentConflictPixel();
  }

  updateConflictInfo() {
    const infoElement = document.getElementById('conflictInfo');
    const currentPixel = this.conflictPixels[this.currentConflictIndex];
    const totalPixels = this.conflictPixels.length;
    
    infoElement.textContent = `Pixel ${this.currentConflictIndex + 1} of ${totalPixels} (${currentPixel.x}, ${currentPixel.y})`;
  }

  showCurrentConflictPixel() {
    const spriteIndex = this.currentSpriteIndex;
    const sprite1 = this.sprites1[spriteIndex];
    const sprite2 = this.sprites2[spriteIndex];
    const currentPixel = this.conflictPixels[this.currentConflictIndex];
    // Calculate appropriate zoom based on sprite size
    const spriteWidth = sprite1.imageData.width;
    const spriteHeight = sprite1.imageData.height;
    const maxPreviewSize = 300;
    const zoom = Math.min(maxPreviewSize / spriteWidth, maxPreviewSize / spriteHeight, 16);
    const previewCanvas = document.getElementById('conflictPreviewCanvas');
    const ctx = previewCanvas.getContext('2d');
    previewCanvas.width = spriteWidth * zoom;
    previewCanvas.height = spriteHeight * zoom;
    // Create merged image data for current state (including resolved conflict pixels)
    const mergedData = this.createMergedImageDataForConflict(sprite1.imageData, sprite2.imageData, spriteIndex);
    // Draw the merged image
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = mergedData.width;
    tempCanvas.height = mergedData.height;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.putImageData(mergedData, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(tempCanvas, 0, 0, previewCanvas.width, previewCanvas.height);
    // Highlight the current pixel
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 2;
    ctx.strokeRect(
      currentPixel.x * zoom - 1, 
      currentPixel.y * zoom - 1, 
      zoom + 2, 
      zoom + 2
    );
    // Show pixel values
    const i = (currentPixel.y * spriteWidth + currentPixel.x) * 4;
    const r1 = sprite1.imageData.data[i];
    const g1 = sprite1.imageData.data[i + 1];
    const b1 = sprite1.imageData.data[i + 2];
    const a1 = sprite1.imageData.data[i + 3];
    const r2 = sprite2.imageData.data[i];
    const g2 = sprite2.imageData.data[i + 1];
    const b2 = sprite2.imageData.data[i + 2];
    const a2 = sprite2.imageData.data[i + 3];
    document.getElementById('sprite1Pixel').textContent = `RGBA(${r1}, ${g1}, ${b1}, ${a1})`;
    document.getElementById('sprite2Pixel').textContent = `RGBA(${r2}, ${g2}, ${b2}, ${a2})`;
  }

  createMergedImageDataForConflict(imageData1, imageData2, spriteIndex) {
    const width = imageData1.width;
    const height = imageData1.height;
    const mergedData = new ImageData(width, height);

    const selections1 = this.selections1[spriteIndex] || [];
    const selections2 = this.selections2[spriteIndex] || [];

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;

        const inSelection1 = this.isPixelInSelections(x, y, selections1);
        const inSelection2 = this.isPixelInSelections(x, y, selections2);

        if (inSelection1 && inSelection2) {
          // Conflict between selections - use sprite1
          mergedData.data[i] = imageData1.data[i];
          mergedData.data[i + 1] = imageData1.data[i + 1];
          mergedData.data[i + 2] = imageData1.data[i + 2];
          mergedData.data[i + 3] = imageData1.data[i + 3];
        } else if (inSelection1) {
          mergedData.data[i] = imageData1.data[i];
          mergedData.data[i + 1] = imageData1.data[i + 1];
          mergedData.data[i + 2] = imageData1.data[i + 2];
          mergedData.data[i + 3] = imageData1.data[i + 3];
        } else if (inSelection2) {
          mergedData.data[i] = imageData2.data[i];
          mergedData.data[i + 1] = imageData2.data[i + 1];
          mergedData.data[i + 2] = imageData2.data[i + 2];
          mergedData.data[i + 3] = imageData2.data[i + 3];
        } else {
          // Check if this pixel has already been resolved
          const pixelIndex = this.conflictPixels.findIndex(p => p.x === x && p.y === y);
          if (pixelIndex !== -1) {
            if (pixelIndex < this.currentConflictIndex) {
              // This pixel has been resolved, use the stored resolution
              const resolution = this.conflictResolutions[pixelIndex];
              if (Array.isArray(resolution)) {
                mergedData.data[i] = resolution[0];
                mergedData.data[i + 1] = resolution[1];
                mergedData.data[i + 2] = resolution[2];
                mergedData.data[i + 3] = resolution[3];
              } else if (resolution === 1) {
                mergedData.data[i] = imageData1.data[i];
                mergedData.data[i + 1] = imageData1.data[i + 1];
                mergedData.data[i + 2] = imageData1.data[i + 2];
                mergedData.data[i + 3] = imageData1.data[i + 3];
              } else if (resolution === 2) {
                mergedData.data[i] = imageData2.data[i];
                mergedData.data[i + 1] = imageData2.data[i + 1];
                mergedData.data[i + 2] = imageData2.data[i + 2];
                mergedData.data[i + 3] = imageData2.data[i + 3];
              } else {
                // Transparent
                mergedData.data[i] = 0;
                mergedData.data[i + 1] = 0;
                mergedData.data[i + 2] = 0;
                mergedData.data[i + 3] = 0;
              }
            } else if (pixelIndex === this.currentConflictIndex) {
              // This is the current pixel being resolved - show original sprite data
              // Check which sprite has content at this pixel
              const alpha1 = imageData1.data[i + 3];
              const alpha2 = imageData2.data[i + 3];
              
              if (alpha1 > 0 && alpha2 > 0) {
                // Both have content, show sprite1 as default
                mergedData.data[i] = imageData1.data[i];
                mergedData.data[i + 1] = imageData1.data[i + 1];
                mergedData.data[i + 2] = imageData1.data[i + 2];
                mergedData.data[i + 3] = imageData1.data[i + 3];
              } else if (alpha1 > 0) {
                mergedData.data[i] = imageData1.data[i];
                mergedData.data[i + 1] = imageData1.data[i + 1];
                mergedData.data[i + 2] = imageData1.data[i + 2];
                mergedData.data[i + 3] = imageData1.data[i + 3];
              } else if (alpha2 > 0) {
                mergedData.data[i] = imageData2.data[i];
                mergedData.data[i + 1] = imageData2.data[i + 1];
                mergedData.data[i + 2] = imageData2.data[i + 2];
                mergedData.data[i + 3] = imageData2.data[i + 3];
              } else {
                // Both transparent
                mergedData.data[i] = 0;
                mergedData.data[i + 1] = 0;
                mergedData.data[i + 2] = 0;
                mergedData.data[i + 3] = 0;
              }
            } else {
              // This pixel is still unresolved, show as conflict
              mergedData.data[i] = 255;
              mergedData.data[i + 1] = 0;
              mergedData.data[i + 2] = 255;
              mergedData.data[i + 3] = 128;
            }
          } else {
            // This pixel is not a conflict pixel, check if both transparent
            const alpha1 = imageData1.data[i + 3];
            const alpha2 = imageData2.data[i + 3];
            
            if (alpha1 === 0 && alpha2 === 0) {
              // Both transparent
              mergedData.data[i] = 0;
              mergedData.data[i + 1] = 0;
              mergedData.data[i + 2] = 0;
              mergedData.data[i + 3] = 0;
            } else {
              // Has content but no selection - this shouldn't happen in normal flow
              mergedData.data[i] = 255;
              mergedData.data[i + 1] = 0;
              mergedData.data[i + 2] = 255;
              mergedData.data[i + 3] = 128;
            }
          }
        }
      }
    }

    return mergedData;
  }

  resolveIndividualConflict(choice) {
    // Store the resolution for this pixel
    if (!this.conflictResolutions) {
      this.conflictResolutions = [];
    }
    // Support custom color as [r,g,b,a]
    if (Array.isArray(choice)) {
      this.conflictResolutions[this.currentConflictIndex] = choice;
    } else {
      this.conflictResolutions[this.currentConflictIndex] = choice;
    }
    this.currentConflictIndex++;
    if (this.currentConflictIndex >= this.conflictPixels.length) {
      // All conflicts resolved, complete the merge
      this.completeIndividualConflictResolution();
    } else {
      // Move to next pixel
      this.updateConflictInfo();
      this.showCurrentConflictPixel();
    }
  }

  completeIndividualConflictResolution() {
    const spriteIndex = this.currentSpriteIndex;
    const sprite1 = this.sprites1[spriteIndex];
    const sprite2 = this.sprites2[spriteIndex];
    
    // Create final merged image data using all the individual resolutions
    const mergedData = this.createFinalMergedImageDataWithIndividualResolutions(
      sprite1.imageData, 
      sprite2.imageData, 
      spriteIndex
    );
    
    this.mergedSprites[spriteIndex] = mergedData;
    
    // Hide the conflict resolution panel
    document.getElementById('individualConflictResolution').style.display = 'none';
    
    // Show the completed sprite
    this.showCompletedSprite(spriteIndex, mergedData);
    
    // Check if all sprites are done
    const allDone = this.mergedSprites.every(sprite => sprite !== null);
    if (allDone) {
      document.getElementById('editor-panel').classList.add('hidden');
    } else {
      // Show editor panel again and move to next sprite
      document.getElementById('editor-panel').style.display = 'grid';
      this.moveToNextSprite();
    }
  }

  createFinalMergedImageDataWithIndividualResolutions(imageData1, imageData2, spriteIndex) {
    const width = imageData1.width;
    const height = imageData1.height;
    const mergedData = new ImageData(width, height);
    const selections1 = this.selections1[spriteIndex] || [];
    const selections2 = this.selections2[spriteIndex] || [];
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const inSelection1 = this.isPixelInSelections(x, y, selections1);
        const inSelection2 = this.isPixelInSelections(x, y, selections2);
        if (inSelection1 && inSelection2) {
          mergedData.data[i] = imageData1.data[i];
          mergedData.data[i + 1] = imageData1.data[i + 1];
          mergedData.data[i + 2] = imageData1.data[i + 2];
          mergedData.data[i + 3] = imageData1.data[i + 3];
        } else if (inSelection1) {
          mergedData.data[i] = imageData1.data[i];
          mergedData.data[i + 1] = imageData1.data[i + 1];
          mergedData.data[i + 2] = imageData1.data[i + 2];
          mergedData.data[i + 3] = imageData1.data[i + 3];
        } else if (inSelection2) {
          mergedData.data[i] = imageData2.data[i];
          mergedData.data[i + 1] = imageData2.data[i + 1];
          mergedData.data[i + 2] = imageData2.data[i + 2];
          mergedData.data[i + 3] = imageData2.data[i + 3];
        } else {
          // Check if this was a conflict pixel that was resolved
          const conflictIndex = this.conflictPixels.findIndex(p => p.x === x && p.y === y);
          if (conflictIndex !== -1) {
            const resolution = this.conflictResolutions[conflictIndex];
            if (Array.isArray(resolution)) {
              mergedData.data[i] = resolution[0];
              mergedData.data[i + 1] = resolution[1];
              mergedData.data[i + 2] = resolution[2];
              mergedData.data[i + 3] = resolution[3];
            } else if (resolution === 1) {
              mergedData.data[i] = imageData1.data[i];
              mergedData.data[i + 1] = imageData1.data[i + 1];
              mergedData.data[i + 2] = imageData1.data[i + 2];
              mergedData.data[i + 3] = imageData1.data[i + 3];
            } else if (resolution === 2) {
              mergedData.data[i] = imageData2.data[i];
              mergedData.data[i + 1] = imageData2.data[i + 1];
              mergedData.data[i + 2] = imageData2.data[i + 2];
              mergedData.data[i + 3] = imageData2.data[i + 3];
            } else {
              // Transparent
              mergedData.data[i] = 0;
              mergedData.data[i + 1] = 0;
              mergedData.data[i + 2] = 0;
              mergedData.data[i + 3] = 0;
            }
          } else {
            // No conflict, both transparent
            mergedData.data[i] = 0;
            mergedData.data[i + 1] = 0;
            mergedData.data[i + 2] = 0;
            mergedData.data[i + 3] = 0;
          }
        }
      }
    }
    return mergedData;
  }
}

// Initialize the application
const spriteMerger = new SpriteMerger();
