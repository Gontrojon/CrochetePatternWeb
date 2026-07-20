const STITCH_SVGS = {
    cadeneta: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
  <rect width="100" height="100" fill="#000000"/>
  <ellipse cx="50" cy="50" rx="38" ry="21" fill="none" stroke="#ffffff" stroke-width="7"/>
</svg>`,
    punto_deslizado: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
  <rect width="100" height="100" fill="#000000"/>
  <ellipse cx="50" cy="50" rx="43" ry="26" fill="#ffffff" stroke="none"/>
</svg>`,
    punto_bajo: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
  <rect width="100" height="100" fill="#000000"/>
  <g fill="none" stroke="#ffffff" stroke-width="12" stroke-linecap="round">
    <line x1="25" y1="25" x2="75" y2="75" />
    <line x1="25" y1="75" x2="75" y2="25" />
  </g>
</svg>`,
    punto_medio: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 200" width="100%" height="100%">
  <rect width="100" height="200" fill="#000000"/>
  <g fill="none" stroke="#ffffff" stroke-width="12" stroke-linecap="round" stroke-linejoin="round">
    <line x1="20" y1="25" x2="80" y2="25" />
    <line x1="50" y1="25" x2="50" y2="175" />
  </g>
</svg>`,
    punto_alto: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 300" width="100%" height="100%">
  <rect width="100" height="300" fill="#000000"/>
  <g fill="none" stroke="#ffffff" stroke-width="12" stroke-linecap="round" stroke-linejoin="round">
    <line x1="20" y1="25" x2="80" y2="25" />
    <line x1="50" y1="25" x2="50" y2="275" />
    <line x1="25" y1="120" x2="75" y2="180" />
  </g>
</svg>`,
    punto_alto_doble: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 300" width="100%" height="100%">
  <rect width="100" height="300" fill="#000000"/>
  <g fill="none" stroke="#ffffff" stroke-width="12" stroke-linecap="round" stroke-linejoin="round">
    <line x1="20" y1="25" x2="80" y2="25" />
    <line x1="50" y1="25" x2="50" y2="275" />
    <line x1="23" y1="110" x2="77" y2="170" />
    <line x1="23" y1="165" x2="77" y2="225" />
  </g>
</svg>`,
    punto_alto_triple: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 300" width="100%" height="100%">
  <rect width="100" height="300" fill="#000000"/>
  <g fill="none" stroke="#ffffff" stroke-width="12" stroke-linecap="round" stroke-linejoin="round">
    <line x1="20" y1="25" x2="80" y2="25" />
    <line x1="50" y1="25" x2="50" y2="275" />
    <line x1="23" y1="85" x2="77" y2="145" />
    <line x1="23" y1="140" x2="77" y2="200" />
    <line x1="23" y1="195" x2="77" y2="255" />
  </g>
</svg>`
};

const SYMBOLS = [
    { id: 'cadeneta', name: 'Cadeneta', heightInCells: 1 },
    { id: 'punto_deslizado', name: 'Punto deslizado', heightInCells: 1 },
    { id: 'punto_bajo', name: 'Punto bajo', heightInCells: 1 },
    { id: 'punto_medio', name: 'Medio punto', heightInCells: 2 },
    { id: 'punto_alto', name: 'Punto alto', heightInCells: 3 },
    { id: 'punto_alto_doble', name: 'Punto alto doble', heightInCells: 4 },
    { id: 'punto_alto_triple', name: 'Punto alto triple', heightInCells: 5 }
];
// Variables del Grid
let gridCols = 20;
let gridRows = 15;
let grid = []; // Matriz 2D de celdas
const DEFAULT_CELL_BG = '#FFFFFF';

// Variables de Interacción y Zoom
let zoom = 1.0;
let offsetX = 50; // Margen inicial
let offsetY = 50;
const CELL_SIZE = 48; // Tamaño base de celda
let isPanning = false;
let isDrawing = false;
let panStartX = 0;
let panStartY = 0;
let isSpacePressed = false;

// Estado del Pincel / Herramientas
let activeTool = 'pencil'; // 'pencil', 'eraser', 'bucket', 'hand'
let activeSymbolIndex = 0; // Índice de SYMBOLS (0-14)
let activeColor = '#2C3531'; // Color del símbolo
let activeCellBgColor = '#FFFFFF'; // Color de fondo de celda
let activeRotation = 0; // 0, 90, 180, 270

// Elementos de Canvas
let canvas = null;
let ctx = null;
const imageCache = {}; // Caché de imágenes SVG coloreadas
// Paleta de colores preestablecidos (Lana/Stitches)
const COLOR_PRESETS = [
    '#2C3531', // Carbón
    '#C86B52', // Terracota
    '#7D9D85', // Salvia
    '#E8A87C', // Melocotón
    '#E27D60', // Coral
    '#85DCB0', // Menta
    '#41B3A3', // Turquesa
    '#C38D9E', // Rosa palo
    '#E8A87C'
];

// Inicialización de la aplicación
window.addEventListener('DOMContentLoaded', () => {
    canvas = document.getElementById('gridCanvas');
    ctx = canvas.getContext('2d', { willReadFrequently: true });
    
    initUI();
    initStitches();
    
    // Ajustar tamaño del canvas
    window.addEventListener('resize', resizeCanvas);
});

// Inicializar la interfaz (UI)
function initUI() {
    // Generar presets de color para símbolo
    const symbolPresetsContainer = document.getElementById('symbolColorPresets');
    COLOR_PRESETS.forEach(color => {
        const div = document.createElement('div');
        div.className = 'preset-color';
        div.style.backgroundColor = color;
        if (color === activeColor) div.classList.add('active');
        div.addEventListener('click', () => {
            document.querySelectorAll('#symbolColorPresets .preset-color').forEach(el => el.classList.remove('active'));
            div.classList.add('active');
            activeColor = color;
            document.getElementById('pickerSymbolColor').value = color;
            preloadSvgsForColor(activeColor);
        });
        symbolPresetsContainer.appendChild(div);
    });
    
    // Sincronizar input color de símbolo
    document.getElementById('pickerSymbolColor').addEventListener('input', (e) => {
        activeColor = e.target.value;
        document.querySelectorAll('#symbolColorPresets .preset-color').forEach(el => el.classList.remove('active'));
        preloadSvgsForColor(activeColor);
    });
    
    // Generar presets de color para fondo (Lana)
    const bgPresetsContainer = document.getElementById('bgColorPresets');
    ['#FFFFFF', '#F5EFEB', '#E4DCD3', '#F3D2C1', '#C6DEC6', '#D6E5FA', '#FCF1D2'].forEach(color => {
        const div = document.createElement('div');
        div.className = 'preset-color';
        div.style.backgroundColor = color;
        if (color === activeCellBgColor) div.classList.add('active');
        div.addEventListener('click', () => {
            document.querySelectorAll('#bgColorPresets .preset-color').forEach(el => el.classList.remove('active'));
            div.classList.add('active');
            activeCellBgColor = color;
            document.getElementById('pickerBgColor').value = color;
        });
        bgPresetsContainer.appendChild(div);
    });
    
    // Sincronizar input color de fondo
    document.getElementById('pickerBgColor').addEventListener('input', (e) => {
        activeCellBgColor = e.target.value;
        document.querySelectorAll('#bgColorPresets .preset-color').forEach(el => el.classList.remove('active'));
    });
    
    // Configurar botones de Rotación
    document.querySelectorAll('.rotate-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.rotate-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeRotation = parseInt(btn.dataset.rot);
        });
    });
    
    // Configurar botones de Herramientas
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeTool = btn.dataset.tool;
            if (activeTool === 'hand') {
                canvas.style.cursor = 'grab';
            } else {
                canvas.style.cursor = '';
            }
        });
    });
    
    // Configurar entradas de Redimensionamiento
    document.getElementById('inputCols').value = gridCols;
    document.getElementById('inputRows').value = gridRows;
    document.getElementById('btnResize').addEventListener('click', () => {
        const cols = parseInt(document.getElementById('inputCols').value);
        const rows = parseInt(document.getElementById('inputRows').value);
        resizeGrid(cols, rows);
    });
    
    // Configurar acciones globales
    document.getElementById('btnExport').addEventListener('click', exportPatternAsPNG);
    document.getElementById('btnSaveJSON').addEventListener('click', savePatternAsJSON);
    document.getElementById('btnLoadJSON').addEventListener('click', () => {
        document.getElementById('modalLoad').classList.add('active');
    });
    
    // Controles de zoom flotantes
    document.getElementById('btnZoomIn').addEventListener('click', () => adjustZoom(1.2));
    document.getElementById('btnZoomOut').addEventListener('click', () => adjustZoom(1 / 1.2));
    document.getElementById('btnZoomReset').addEventListener('click', () => {
        zoom = 1.0;
        offsetX = 50;
        offsetY = 50;
        document.getElementById('zoomVal').innerText = '100%';
        draw();
    });
    
    // Botón borrar grid completo
    document.getElementById('btnClearGrid').addEventListener('click', () => {
        if (confirm('¿Estás seguro de que deseas limpiar todo el patrón? Se perderán todos los cambios.')) {
            clearGrid();
        }
    });
    
    // Configurar modal
    document.getElementById('btnCloseModal').addEventListener('click', closeModal);
    document.getElementById('modalLoad').addEventListener('click', (e) => {
        if (e.target.id === 'modalLoad') closeModal();
    });
    
    // Carga de archivo drag and drop / click
    const fileDropArea = document.getElementById('fileDropArea');
    const fileInput = document.getElementById('fileInput');
    
    fileDropArea.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleJSONFile(e.target.files[0]);
        }
    });
    
    fileDropArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        fileDropArea.style.borderColor = 'var(--primary)';
    });
    
    fileDropArea.addEventListener('dragleave', () => {
        fileDropArea.style.borderColor = 'var(--border)';
    });
    
    fileDropArea.addEventListener('drop', (e) => {
        e.preventDefault();
        fileDropArea.style.borderColor = 'var(--border)';
        if (e.dataTransfer.files.length > 0) {
            handleJSONFile(e.dataTransfer.files[0]);
        }
    });
    
    // Pestañas Responsivas para Móvil
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const targetTab = btn.dataset.tab;
            document.querySelectorAll('.panel').forEach(p => p.classList.remove('active-tab'));
            document.getElementById(targetTab).classList.add('active-tab');
            
            if (targetTab === 'workspacePanel') {
                resizeCanvas();
            }
        });
    });
    
    // Registrar eventos de teclado para paneo
    window.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            isSpacePressed = true;
            if (activeTool !== 'hand') {
                canvas.style.cursor = 'grab';
            }
        }
    });
    
    window.addEventListener('keyup', (e) => {
        if (e.code === 'Space') {
            isSpacePressed = false;
            if (activeTool !== 'hand') {
                canvas.style.cursor = '';
            }
        }
    });
    
    // Inicializar matriz de la cuadrícula
    initializeGridData();
    
    // Desactivar menú contextual del botón derecho en el Canvas
    canvas.addEventListener('contextmenu', e => e.preventDefault());
    
    // Eventos del Mouse en el Canvas
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('wheel', handleWheel, { passive: false });
}

// Inicializa o recrea los datos del grid en blanco
function initializeGridData() {
    grid = [];
    for (let c = 0; c < gridCols; c++) {
        grid[c] = [];
        for (let r = 0; r < gridRows; r++) {
            grid[c][r] = {
                symbolIndex: -1,
                rotation: 0,
                color: activeColor,
                bgColor: DEFAULT_CELL_BG
            };
        }
    }
}

// Limpiar cuadrícula completa
function clearGrid() {
    initializeGridData();
    updateLegendAndInstructions();
    draw();
}

// Cerrar el modal de carga
function closeModal() {
    document.getElementById('modalLoad').classList.remove('active');
    document.getElementById('fileInput').value = '';
}

// Procesar el archivo JSON cargado
function handleJSONFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        loadPatternFromJSON(e.target.result);
    };
    reader.readAsText(file);
}

// Inicializa la configuración de puntos con SVG
function initStitches() {
    preloadSvgsForColor(activeColor);
    COLOR_PRESETS.forEach(color => preloadSvgsForColor(color));
    buildSymbolSelectorHTML();
    resizeCanvas();
}

// Genera un Data URL con el SVG coloreado y transparente
function getSvgDataUrl(svgText, color) {
    let processed = svgText.replace(/<rect[^>]+fill="#000000"[^>]*\/>/g, '');
    processed = processed.replace(/stroke="#ffffff"/g, `stroke="${color}"`);
    processed = processed.replace(/fill="#ffffff"/g, `fill="${color}"`);
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(processed);
}

// Precarga los SVG de todos los símbolos para un color específico
function preloadSvgsForColor(color) {
    SYMBOLS.forEach(symbol => {
        const cacheKey = `${symbol.id}_${color}`;
        if (!imageCache[cacheKey]) {
            const img = new Image();
            img.src = getSvgDataUrl(STITCH_SVGS[symbol.id], color);
            imageCache[cacheKey] = img;
            img.onload = () => {
                draw();
            };
        }
    });
}

// Crea los elementos de la interfaz para seleccionar los símbolos
function buildSymbolSelectorHTML() {
    const listContainer = document.getElementById('symbolsList');
    listContainer.innerHTML = '';
    
    SYMBOLS.forEach((symbol, index) => {
        const item = document.createElement('button');
        item.className = 'symbol-item';
        if (index === activeSymbolIndex) item.classList.add('active');
        
        const iconWrapper = document.createElement('div');
        iconWrapper.className = 'symbol-preview-icon';
        iconWrapper.style.backgroundColor = 'transparent';
        
        const svgText = STITCH_SVGS[symbol.id];
        const processedSvg = svgText
            .replace(/<rect[^>]+fill="#000000"[^>]*\/>/g, '')
            .replace(/stroke="#ffffff"/g, 'stroke="currentColor"')
            .replace(/fill="#ffffff"/g, 'fill="currentColor"');
            
        iconWrapper.innerHTML = processedSvg;
        
        const label = document.createElement('span');
        label.className = 'symbol-label';
        label.innerText = symbol.name;
        
        item.appendChild(iconWrapper);
        item.appendChild(label);
        
        item.addEventListener('click', () => {
            document.querySelectorAll('.symbol-item').forEach(el => el.classList.remove('active'));
            item.classList.add('active');
            activeSymbolIndex = index;
            
            if (activeTool === 'eraser' || activeTool === 'hand') {
                document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
                const pencilBtn = document.querySelector('[data-tool="pencil"]');
                pencilBtn.classList.add('active');
                activeTool = 'pencil';
                canvas.style.cursor = '';
            }
        });
        
        listContainer.appendChild(item);
    });
}

// Redimensionar el canvas y redibujar
function resizeCanvas() {
    if (!canvas) return;
    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    draw();
}

// Redimensionar la rejilla de datos
function resizeGrid(newCols, newRows) {
    if (newCols < 1) newCols = 1;
    if (newRows < 1) newRows = 1;
    
    let newGrid = [];
    for (let c = 0; c < newCols; c++) {
        newGrid[c] = [];
        for (let r = 0; r < newRows; r++) {
            if (c < gridCols && r < gridRows && grid[c] && grid[c][r]) {
                newGrid[c][r] = grid[c][r];
            } else {
                newGrid[c][r] = {
                    symbolIndex: -1,
                    rotation: 0,
                    color: activeColor,
                    bgColor: DEFAULT_CELL_BG
                };
            }
        }
    }
    
    grid = newGrid;
    gridCols = newCols;
    gridRows = newRows;
    
    document.getElementById('inputCols').value = gridCols;
    document.getElementById('inputRows').value = gridRows;
    
    updateLegendAndInstructions();
    draw();
}

// Ajuste del zoom por controles de botón
function adjustZoom(factor) {
    const prevZoom = zoom;
    zoom = Math.max(0.3, Math.min(3.0, zoom * factor));
    
    // Zoom centrado en el canvas
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    const worldX = (centerX - offsetX) / prevZoom;
    const worldY = (centerY - offsetY) / prevZoom;
    
    offsetX = centerX - worldX * zoom;
    offsetY = centerY - worldY * zoom;
    
    document.getElementById('zoomVal').innerText = Math.round(zoom * 100) + '%';
    draw();
}

// Renderiza un símbolo en el lienzo del contexto especificado
function drawSymbolInCell(targetCtx, symbolIndex, color, rotation, x, y, width, height) {
    if (symbolIndex < 0 || symbolIndex >= SYMBOLS.length) return;
    const symbol = SYMBOLS[symbolIndex];
    const cacheKey = `${symbol.id}_${color}`;
    
    let img = imageCache[cacheKey];
    if (!img) {
        img = new Image();
        img.src = getSvgDataUrl(STITCH_SVGS[symbol.id], color);
        imageCache[cacheKey] = img;
        img.onload = () => {
            draw();
        };
    }
    
    if (!img.complete) return;
    
    targetCtx.save();
    targetCtx.translate(x + width / 2, y + height / 2);
    targetCtx.rotate((rotation * Math.PI) / 180);
    
    const paddingX = width * 0.15;
    const paddingY = height * 0.15;
    const targetW = width - paddingX;
    const targetH = height - paddingY;
    
    targetCtx.drawImage(img, -targetW / 2, -targetH / 2, targetW, targetH);
    targetCtx.restore();
}

// Genera una cadena para las columnas estilo Excel (A, B, C... Z, AA, AB...)
function getColLabel(colIndex) {
    let label = '';
    let temp = colIndex;
    while (temp >= 0) {
        label = String.fromCharCode((temp % 26) + 65) + label;
        temp = Math.floor(temp / 26) - 1;
    }
    return label;
}

// Dibuja la cuadrícula y las celdas en el Canvas principal
function draw() {
    if (!canvas || !ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const cellSize = CELL_SIZE * zoom;
    const headerW = Math.max(34, cellSize * 0.7);
    const headerH = Math.max(28, cellSize * 0.55);
    
    // 1. Dibujar fondos de celdas
    for (let c = 0; c < gridCols; c++) {
        for (let r = 0; r < gridRows; r++) {
            const cell = grid[c][r];
            const cellX = offsetX + c * cellSize;
            const cellY = offsetY + r * cellSize;
            
            if (cellX + cellSize > headerW && cellX < canvas.width &&
                cellY + cellSize > headerH && cellY < canvas.height) {
                
                ctx.fillStyle = cell.bgColor || DEFAULT_CELL_BG;
                ctx.fillRect(cellX, cellY, cellSize, cellSize);
            }
        }
    }
    
    // 2. Dibujar líneas de cuadrícula
    ctx.strokeStyle = 'rgba(44, 53, 49, 0.15)'; 
    ctx.lineWidth = 1;
    
    for (let c = 0; c <= gridCols; c++) {
        const x = offsetX + c * cellSize;
        if (x >= headerW && x <= canvas.width) {
            ctx.beginPath();
            ctx.moveTo(x, Math.max(headerH, offsetY));
            ctx.lineTo(x, Math.min(canvas.height, offsetY + gridRows * cellSize));
            ctx.stroke();
        }
    }
    
    for (let r = 0; r <= gridRows; r++) {
        const y = offsetY + r * cellSize;
        if (y >= headerH && y <= canvas.height) {
            ctx.beginPath();
            ctx.moveTo(Math.max(headerW, offsetX), y);
            ctx.lineTo(Math.min(canvas.width, offsetX + gridCols * cellSize), y);
            ctx.stroke();
        }
    }
    
    // 3. Dibujar símbolos de crochet (AQUÍ ESTÁ LA MAGIA CORREGIDA)
    for (let c = 0; c < gridCols; c++) {
        for (let r = 0; r < gridRows; r++) {
            const cell = grid[c][r];
            const cellX = offsetX + c * cellSize;
            const cellY = offsetY + r * cellSize;
            
            if (cell.symbolIndex >= 0 && !cell.isCovered) {
                const H = SYMBOLS[cell.symbolIndex].heightInCells || 1;
                
                // Encontrar el centro exacto de las celdas ocupadas según la rotación
                let centerX = cellX + cellSize / 2;
                let centerY = cellY + cellSize / 2;
                
                if (cell.rotation === 0) {
                    centerY -= ((H - 1) * cellSize) / 2; // Crece hacia arriba
                } else if (cell.rotation === 90) {
                    centerX += ((H - 1) * cellSize) / 2; // Crece hacia la derecha
                } else if (cell.rotation === 180) {
                    centerY += ((H - 1) * cellSize) / 2; // Crece hacia abajo
                } else if (cell.rotation === 270) {
                    centerX -= ((H - 1) * cellSize) / 2; // Crece hacia la izquierda
                }
                
                // El ancho y alto que se manda a dibujar es el original (como si estuviera de pie)
                const originalW = cellSize;
                const originalH = cellSize * H;
                
                // Ajustamos X e Y para que coincida con el centro que hemos calculado
                const drawX = centerX - originalW / 2;
                const drawY = centerY - originalH / 2;
                
                // Dibujar si está dentro de la pantalla
                const maxDim = Math.max(originalW, originalH);
                if (centerX + maxDim / 2 > headerW && centerX - maxDim / 2 < canvas.width &&
                    centerY + maxDim / 2 > headerH && centerY - maxDim / 2 < canvas.height) {
                    
                    drawSymbolInCell(ctx, cell.symbolIndex, cell.color, cell.rotation, drawX, drawY, originalW, originalH);
                }
            }
        }
    }
    
    // 4. Dibujar CABECERAS CONGELADAS (Excel Style)
    ctx.fillStyle = '#E4DCD3';
    ctx.fillRect(0, 0, canvas.width, headerH); 
    ctx.fillRect(0, 0, headerW, canvas.height); 
    
    ctx.fillStyle = 'var(--primary)';
    ctx.fillRect(0, 0, headerW, headerH);
    
    ctx.strokeStyle = 'var(--text-main)';
    ctx.lineWidth = 1.5;
    
    ctx.beginPath();
    ctx.moveTo(headerW, 0);
    ctx.lineTo(headerW, canvas.height);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(0, headerH);
    ctx.lineTo(canvas.width, headerH);
    ctx.stroke();
    
    ctx.fillStyle = 'var(--text-main)';
    ctx.font = `bold ${Math.max(10, Math.floor(12 * Math.min(1.2, zoom)))}px Inter, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    ctx.strokeStyle = 'rgba(44, 53, 49, 0.2)';
    ctx.lineWidth = 1;
    
    for (let c = 0; c < gridCols; c++) {
        const x = offsetX + c * cellSize;
        const nextX = x + cellSize;
        
        if (nextX > headerW && x < canvas.width) {
            const labelX = x + cellSize / 2;
            if (labelX > headerW) {
                ctx.fillText(getColLabel(c), labelX, headerH / 2);
            }
            if (nextX > headerW) {
                ctx.beginPath();
                ctx.moveTo(nextX, 0);
                ctx.lineTo(nextX, headerH);
                ctx.stroke();
            }
        }
    }
    
    for (let r = 0; r < gridRows; r++) {
        const y = offsetY + r * cellSize;
        const nextY = y + cellSize;
        
        if (nextY > headerH && y < canvas.height) {
            const labelY = y + cellSize / 2;
            if (labelY > headerH) {
                ctx.fillText(r + 1, headerW / 2, labelY);
            }
            if (nextY > headerH) {
                ctx.beginPath();
                ctx.moveTo(0, nextY);
                ctx.lineTo(headerW, nextY);
                ctx.stroke();
            }
        }
    }
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `${Math.max(12, Math.floor(14 * Math.min(1.2, zoom)))}px sans-serif`;
    ctx.fillText('🧶', headerW / 2, headerH / 2);
}

// Flood Fill para rellenar fondos de celdas adyacentes del mismo color
function floodFillBg(startCol, startRow, targetBg, replacementBg) {
    if (targetBg === replacementBg) return;
    
    const queue = [[startCol, startRow]];
    while (queue.length > 0) {
        const [c, r] = queue.shift();
        
        if (c < 0 || c >= gridCols || r < 0 || r >= gridRows) continue;
        if (grid[c][r].bgColor !== targetBg) continue;
        
        grid[c][r].bgColor = replacementBg;
        
        queue.push([c + 1, r]);
        queue.push([c - 1, r]);
        queue.push([c, r + 1]);
        queue.push([c, r - 1]);
    }
}

// Limpia los datos de una celda y libera las celdas cubiertas asociadas
function clearCellData(c, r) {
    if (c < 0 || c >= gridCols || r < 0 || r >= gridRows) return;
    const cell = grid[c][r];
    if (cell.isCovered && cell.coverParent) {
        // Limpiar el padre
        const pCol = cell.coverParent.col;
        const pRow = cell.coverParent.row;
        clearCellData(pCol, pRow);
    } else if (cell.symbolIndex >= 0) {
        const H = SYMBOLS[cell.symbolIndex].heightInCells || 1;
        // Limpiar celdas cubiertas arriba
        for (let i = 1; i < H; i++) {
            const targetR = r - i;
            if (targetR >= 0) {
                grid[c][targetR] = {
                    symbolIndex: -1,
                    rotation: 0,
                    color: activeColor,
                    bgColor: DEFAULT_CELL_BG
                };
            }
        }
        // Limpiar base
        grid[c][r] = {
            symbolIndex: -1,
            rotation: 0,
            color: activeColor,
            bgColor: DEFAULT_CELL_BG
        };
    } else {
        // Es una celda vacía normal, la reseteamos
        grid[c][r] = {
            symbolIndex: -1,
            rotation: 0,
            color: activeColor,
            bgColor: DEFAULT_CELL_BG
        };
    }
}

// Ejecuta la pintura o borrado de una celda según las coordenadas del ratón
function paintCellAt(mx, my) {
    const cellSize = CELL_SIZE * zoom;
    const col = Math.floor((mx - offsetX) / cellSize);
    const row = Math.floor((my - offsetY) / cellSize);
    
    // Evitar pintar si las coordenadas caen en el área de cabecera congelada
    const headerW = Math.max(34, cellSize * 0.7);
    const headerH = Math.max(28, cellSize * 0.55);
    if (mx < headerW || my < headerH) return;
    
    if (col >= 0 && col < gridCols && row >= 0 && row < gridRows) {
        if (activeTool === 'pencil') {
            const symbol = SYMBOLS[activeSymbolIndex];
            const H = symbol.heightInCells || 1;
            
            // 1. Definir hacia dónde "crece" la figura dependiendo de la rotación
            let dCol = 0;
            let dRow = -1; // Por defecto (0 grados): hacia arriba

            if (activeRotation === 90) {
                dCol = 1;  dRow = 0;  // 90 grados: hacia la derecha
            } else if (activeRotation === 180) {
                dCol = 0;  dRow = 1;  // 180 grados: hacia abajo
            } else if (activeRotation === 270) {
                dCol = -1; dRow = 0;  // 270 grados: hacia la izquierda
            }
            
            // Limpiar celdas en el nuevo rango para evitar colisiones
            for (let i = 0; i < H; i++) {
                const targetC = col + (i * dCol);
                const targetR = row + (i * dRow);
                
                // Comprobar que no nos salimos de los límites de la cuadrícula
                if (targetC >= 0 && targetC < gridCols && targetR >= 0 && targetR < gridRows) {
                    clearCellData(targetC, targetR);
                }
            }
            
            // Establecer celda base
            grid[col][row] = {
                symbolIndex: activeSymbolIndex,
                rotation: activeRotation,
                color: activeColor,
                bgColor: activeCellBgColor,
                isBase: true,
                spanH: H
            };
            
            // Establecer celdas cubiertas (las que ocupa el resto del tamaño de la figura)
            for (let i = 1; i < H; i++) {
                const targetC = col + (i * dCol);
                const targetR = row + (i * dRow);
                
                if (targetC >= 0 && targetC < gridCols && targetR >= 0 && targetR < gridRows) {
                    grid[targetC][targetR] = {
                        symbolIndex: -1,
                        rotation: 0,
                        color: activeColor,
                        bgColor: activeCellBgColor,
                        isCovered: true,
                        coverParent: { col: col, row: row }
                    };
                }
            }
        } else if (activeTool === 'eraser') {
            clearCellData(col, row);
        } else if (activeTool === 'bucket') {
            const cell = grid[col][row];
            const targetBg = cell.bgColor;
            floodFillBg(col, row, targetBg, activeCellBgColor);
        }
        
        updateLegendAndInstructions();
        draw();
    }
}

// MOUSE EVENTS: Control de arrastrar, paneo, rueda, y zoom
function handleMouseDown(e) {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    
    // Click derecho, herramienta de mano o barra espaciadora -> Iniciar paneo
    if (e.button === 2 || activeTool === 'hand' || isSpacePressed) {
        isPanning = true;
        panStartX = e.clientX - offsetX;
        panStartY = e.clientY - offsetY;
        e.preventDefault();
        return;
    }
    
    // Click izquierdo -> Iniciar pintado
    if (e.button === 0) {
        isDrawing = true;
        paintCellAt(mx, my);
    }
}

function handleMouseMove(e) {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    
    if (isPanning) {
        offsetX = e.clientX - panStartX;
        offsetY = e.clientY - panStartY;
        draw();
    } else if (isDrawing) {
        paintCellAt(mx, my);
    }
}

function handleMouseUp(e) {
    isPanning = false;
    isDrawing = false;
}

function handleWheel(e) {
    e.preventDefault();
    const zoomFactor = 1.08;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Coordenadas del mundo físico antes del zoom
    const worldX = (mouseX - offsetX) / zoom;
    const worldY = (mouseY - offsetY) / zoom;
    
    if (e.deltaY < 0) {
        zoom = Math.min(3.0, zoom * zoomFactor);
    } else {
        zoom = Math.max(0.3, zoom / zoomFactor);
    }
    
    // Ajustar offsets para que el cursor apunte al mismo punto tras zoom
    offsetX = mouseX - worldX * zoom;
    offsetY = mouseY - worldY * zoom;
    
    document.getElementById('zoomVal').innerText = Math.round(zoom * 100) + '%';
    draw();
}

// Actualizar leyenda e instrucciones dinámicas de crochet
function updateLegendAndInstructions() {
    updateLegend();
    generateInstructions();
}

// Actualiza el listado de símbolos utilizados actualmente en el patrón
function updateLegend() {
    const usedSymbolIndices = new Set();
    
    for (let c = 0; c < gridCols; c++) {
        for (let r = 0; r < gridRows; r++) {
            const index = grid[c][r].symbolIndex;
            if (index >= 0) {
                usedSymbolIndices.add(index);
            }
        }
    }
    
    const legendList = document.getElementById('legendList');
    legendList.innerHTML = '';
    
    if (usedSymbolIndices.size === 0) {
        legendList.innerHTML = '<div style="font-size:0.8rem; color:var(--text-muted); font-style:italic;">No hay símbolos en el patrón.</div>';
        return;
    }
    
    const sortedIndices = Array.from(usedSymbolIndices).sort((a, b) => a - b);
    
    sortedIndices.forEach(index => {
        const symbol = SYMBOLS[index];
        const legendItem = document.createElement('div');
        legendItem.className = 'legend-item';
        
        const iconWrapper = document.createElement('div');
        iconWrapper.className = 'legend-icon-wrapper';
        iconWrapper.style.backgroundColor = 'transparent';
        
        const svgText = STITCH_SVGS[symbol.id];
        const processedSvg = svgText
            .replace(/<rect[^>]+fill="#000000"[^>]*\/>/g, '')
            .replace(/stroke="#ffffff"/g, 'stroke="currentColor"')
            .replace(/fill="#ffffff"/g, 'fill="currentColor"');
            
        iconWrapper.innerHTML = processedSvg;
        
        const label = document.createElement('span');
        label.innerText = symbol.name;
        label.style.fontWeight = '500';
        
        legendItem.appendChild(iconWrapper);
        legendItem.appendChild(label);
        
        legendList.appendChild(legendItem);
    });
}

// Genera instrucciones escritas paso a paso leyendo el grid de crochet
// Como convención, el crochet se lee de abajo hacia arriba y en zigzag (ida y vuelta)
// Genera instrucciones escritas paso a paso leyendo el grid de crochet
// Como convención, el crochet se lee de abajo hacia arriba y en zigzag (ida y vuelta)
function generateInstructions() {
    let instructionsText = '';
    let rowCount = 1;
    
    // Recorrer de abajo hacia arriba en el canvas (la fila gridRows-1 es la primera)
    for (let r = gridRows - 1; r >= 0; r--) {
        const rightToLeft = (rowCount % 2 !== 0); // Fila impar: Der a Izq. Par: Izq a Der.
        let rowCells = [];
        
        if (rightToLeft) {
            for (let c = gridCols - 1; c >= 0; c--) {
                rowCells.push(grid[c][r]);
            }
        } else {
            for (let c = 0; c < gridCols; c++) {
                rowCells.push(grid[c][r]);
            }
        }
        
        // Omitir si la fila entera es de celdas vacías y no cubiertas
        const isRowEmpty = rowCells.every(cell => cell.symbolIndex === -1 && !cell.isCovered);
        if (isRowEmpty) {
            rowCount++;
            continue;
        }
        
        // Agrupar puntos consecutivos del mismo tipo
        let groups = [];
        let currentSymName = null;
        let count = 0;
        
        for (let i = 0; i < rowCells.length; i++) {
            const cell = rowCells[i];
            let name = 'Espacio libre';
            
            if (cell.symbolIndex >= 0) {
                name = SYMBOLS[cell.symbolIndex].name;
            } else if (cell.isCovered && cell.coverParent) {
                const pCol = cell.coverParent.col;
                const pRow = cell.coverParent.row;
                const parentCell = grid[pCol] && grid[pCol][pRow];
                if (parentCell && parentCell.symbolIndex >= 0) {
                    name = `Ocupado (${SYMBOLS[parentCell.symbolIndex].name})`;
                } else {
                    name = 'Ocupado';
                }
            }
            
            if (currentSymName === name) {
                count++;
            } else {
                if (currentSymName !== null) {
                    groups.push({ name: currentSymName, count: count });
                }
                currentSymName = name;
                count = 1;
            }
        }
        
        if (currentSymName !== null) {
            groups.push({ name: currentSymName, count: count });
        }
        
        const dirLabel = rightToLeft ? '→ (Ida - Der a Izq)' : '← (Vuelta - Izq a Der)';
        const details = groups.map(g => `${g.count} ${g.name}`).join(', ');
        
        instructionsText += `Fila ${rowCount} ${dirLabel}:\n  ${details}\n\n`;
        rowCount++;
    }
    
    const container = document.getElementById('instructionsContainer');
    if (instructionsText === '') {
        container.innerHTML = '<div class="no-instructions-placeholder">Dibuja algunos puntos en la cuadrícula para generar las instrucciones de crochet.</div>';
    } else {
        container.innerHTML = instructionsText;
    }
}

// Guarda el patrón en un archivo JSON local
function savePatternAsJSON() {
    const data = {
        cols: gridCols,
        rows: gridRows,
        grid: grid
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.download = 'patron_crochet.json';
    link.href = URL.createObjectURL(blob);
    link.click();
}

// Carga el patrón a partir de una cadena JSON
function loadPatternFromJSON(jsonText) {
    try {
        const data = JSON.parse(jsonText);
        if (!data.cols || !data.rows || !data.grid) {
            alert('El archivo no tiene el formato de patrón de crochet válido.');
            return;
        }
        
        gridCols = data.cols;
        gridRows = data.rows;
        grid = data.grid;
        
        // Post-procesar para restaurar/asegurar celdas cubiertas (compatibilidad y auto-curación) y precargar SVGs
        for (let c = 0; c < gridCols; c++) {
            for (let r = gridRows - 1; r >= 0; r--) {
                const cell = grid[c][r];
                if (cell && cell.symbolIndex >= 0 && cell.symbolIndex < SYMBOLS.length && !cell.isCovered) {
                    const H = SYMBOLS[cell.symbolIndex].heightInCells || 1;
                    cell.isBase = true;
                    cell.spanH = H;
                    
                    // Precargar SVG para el color del patrón importado
                    const cacheKey = `${SYMBOLS[cell.symbolIndex].id}_${cell.color}`;
                    if (!imageCache[cacheKey]) {
                        const img = new Image();
                        img.src = getSvgDataUrl(STITCH_SVGS[SYMBOLS[cell.symbolIndex].id], cell.color);
                        imageCache[cacheKey] = img;
                        img.onload = () => draw();
                    }
                    
                    for (let i = 1; i < H; i++) {
                        const targetR = r - i;
                        if (targetR >= 0) {
                            grid[c][targetR] = {
                                symbolIndex: -1,
                                rotation: 0,
                                color: cell.color,
                                bgColor: cell.bgColor,
                                isCovered: true,
                                coverParent: { col: c, row: r }
                            };
                        }
                    }
                }
            }
        }
        
        document.getElementById('inputCols').value = gridCols;
        document.getElementById('inputRows').value = gridRows;
        
        // Resetear Zoom y offsets
        zoom = 1.0;
        offsetX = 50;
        offsetY = 50;
        document.getElementById('zoomVal').innerText = '100%';
        
        updateLegendAndInstructions();
        draw();
        closeModal();
    } catch (err) {
        alert('Error al leer el archivo JSON: ' + err.message);
    }
}

// Exporta la cuadrícula de crochet limpia a un archivo PNG de alta resolución
function exportPatternAsPNG() {
    const exportCellSize = 48; // Alta resolución constante
    const headerW = 40;
    const headerH = 30;
    
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = gridCols * exportCellSize + headerW;
    tempCanvas.height = gridRows * exportCellSize + headerH;
    const tCtx = tempCanvas.getContext('2d');
    
    // Rellenar fondo general
    tCtx.fillStyle = '#FAF6F0';
    tCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    
    // 1. Dibujar celdas y stencils
    for (let c = 0; c < gridCols; c++) {
        for (let r = 0; r < gridRows; r++) {
            const cell = grid[c][r];
            const cellX = headerW + c * exportCellSize;
            const cellY = headerH + r * exportCellSize;
            
            // Dibujar fondo de celda
            tCtx.fillStyle = cell.bgColor || DEFAULT_CELL_BG;
            tCtx.fillRect(cellX, cellY, exportCellSize, exportCellSize);
            
            // Dibujar símbolo si existe
            if (cell.symbolIndex >= 0 && !cell.isCovered) {
                const H = SYMBOLS[cell.symbolIndex].heightInCells || 1;
                
                // Encontrar el centro según la rotación
                let centerX = cellX + exportCellSize / 2;
                let centerY = cellY + exportCellSize / 2;
                
                if (cell.rotation === 0) {
                    centerY -= ((H - 1) * exportCellSize) / 2;
                } else if (cell.rotation === 90) {
                    centerX += ((H - 1) * exportCellSize) / 2;
                } else if (cell.rotation === 180) {
                    centerY += ((H - 1) * exportCellSize) / 2;
                } else if (cell.rotation === 270) {
                    centerX -= ((H - 1) * exportCellSize) / 2;
                }
                
                const originalW = exportCellSize;
                const originalH = exportCellSize * H;
                
                const drawX = centerX - originalW / 2;
                const drawY = centerY - originalH / 2;
                
                drawSymbolInCell(tCtx, cell.symbolIndex, cell.color, cell.rotation, drawX, drawY, originalW, originalH);
            }
        }
    }
    
    // 2. Líneas divisorias de cuadrícula
    tCtx.strokeStyle = 'rgba(44, 53, 49, 0.2)';
    tCtx.lineWidth = 1;
    
    for (let c = 0; c <= gridCols; c++) {
        const x = headerW + c * exportCellSize;
        tCtx.beginPath();
        tCtx.moveTo(x, headerH);
        tCtx.lineTo(x, tempCanvas.height);
        tCtx.stroke();
    }
    
    for (let r = 0; r <= gridRows; r++) {
        const y = headerH + r * exportCellSize;
        tCtx.beginPath();
        tCtx.moveTo(headerW, y);
        tCtx.lineTo(tempCanvas.width, y);
        tCtx.stroke();
    }
    
    // 3. Dibujar cabeceras
    tCtx.fillStyle = '#E4DCD3';
    tCtx.fillRect(0, 0, tempCanvas.width, headerH);
    tCtx.fillRect(0, 0, headerW, tempCanvas.height);
    tCtx.fillStyle = 'var(--primary)';
    tCtx.fillRect(0, 0, headerW, headerH);
    
    tCtx.strokeStyle = '#2C3531';
    tCtx.lineWidth = 1.5;
    tCtx.beginPath();
    tCtx.moveTo(headerW, 0);
    tCtx.lineTo(headerW, tempCanvas.height);
    tCtx.stroke();
    tCtx.beginPath();
    tCtx.moveTo(0, headerH);
    tCtx.lineTo(tempCanvas.width, headerH);
    tCtx.stroke();
    
    // Líneas divisorias internas en cabeceras de exportación
    tCtx.strokeStyle = 'rgba(44, 53, 49, 0.2)';
    tCtx.lineWidth = 1;
    
    // Columnas
    tCtx.fillStyle = '#2C3531';
    tCtx.font = 'bold 12px Inter, sans-serif';
    tCtx.textAlign = 'center';
    tCtx.textBaseline = 'middle';
    
    for (let c = 0; c < gridCols; c++) {
        const x = headerW + c * exportCellSize;
        tCtx.fillText(getColLabel(c), x + exportCellSize / 2, headerH / 2);
        
        tCtx.beginPath();
        tCtx.moveTo(x + exportCellSize, 0);
        tCtx.lineTo(x + exportCellSize, headerH);
        tCtx.stroke();
    }
    
    // Filas
    for (let r = 0; r < gridRows; r++) {
        const y = headerH + r * exportCellSize;
        tCtx.fillText(r + 1, headerW / 2, y + exportCellSize / 2);
        
        tCtx.beginPath();
        tCtx.moveTo(0, y + exportCellSize);
        tCtx.lineTo(headerW, y + exportCellSize);
        tCtx.stroke();
    }
    
    // Ovillo decorativo en la esquina
    tCtx.fillStyle = '#FFFFFF';
    tCtx.font = '14px sans-serif';
    tCtx.fillText('🧶', headerW / 2, headerH / 2);
    
    // Descarga directa
    const link = document.createElement('a');
    link.download = 'patron_crochet_diseño.png';
    link.href = tempCanvas.toDataURL('image/png');
    link.click();
}
