const defaults = {
  projectName: '',
  projectAddress: '',
  drawingCode: 'JPK-SENAT',
  preparedBy: '',
  finishedCeiling: 2.400,
  showerOffset: 0,
  mixerHeight: 1.150,
  holderHeight: 1.200,
  holderOffset: 0.100,
  hoseLow: 0.470,
  humanHeight: 1.800,
  humanOffset: -0.240,
  showHuman: 'yes',
  showWater: 'yes'
};

const fixed = {
  structuralMin: 2.700,
  structuralMax: 2.900,
  showerDrop: 0.159,
  showerArmVisible: 0.139,
  showerArmFlange: 0.064,
  showerArmStem: 0.021,
  rainHeadWidth: 0.250,
  rainHeadBody: 0.007,
  rainHeadConnector: 0.013,
  mixerWidth: 0.154,
  mixerHeight: 0.211,
  mixerProjection: 0.052,
  mixerDiverterDelta: 0.074,
  mixerMainFromBottom: 0.087,
  concealedBodyHeight: 0.137,
  concealedBodyDepth: 0.123,
  handShowerLength: 0.258,
  handShowerHeadWidth: 0.100,
  hoseLength: 1.539,
  holderProjection: 0.098,
  holderFlange: 0.060,
  holderBody: 0.030
};

const state = {...defaults};
const inputIds = Object.keys(defaults);
const outputMap = {
  finishedCeiling: 'finishedCeilingOut',
  showerOffset: 'showerOffsetOut',
  mixerHeight: 'mixerHeightOut',
  holderHeight: 'holderHeightOut',
  holderOffset: 'holderOffsetOut',
  hoseLow: 'hoseLowOut',
  humanHeight: 'humanHeightOut',
  humanOffset: 'humanOffsetOut'
};

const $ = (selector) => document.querySelector(selector);
const svg = $('#sheetSvg');

function esc(value = '') {
  return String(value).replace(/[&<>"']/g, (ch) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
}

function formatMeter(value) {
  const number = Number(value);
  return `${number.toLocaleString('vi-VN', {minimumFractionDigits: 0, maximumFractionDigits: 3})} m`;
}

function signedMeter(value) {
  const number = Number(value);
  const sign = number > 0 ? '+' : '';
  return `${sign}${number.toLocaleString('vi-VN', {minimumFractionDigits: 0, maximumFractionDigits: 3})} m`;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function readInputs() {
  inputIds.forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    state[id] = ['range', 'number'].includes(el.type) ? Number(el.value) : el.value;
  });
  state.hoseLow = Math.min(state.hoseLow, state.holderHeight - 0.180);
  return state;
}

function writeInputs(data) {
  Object.assign(state, defaults, data || {});
  inputIds.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = state[id];
  });
  updateOutputs();
}

function updateOutputs() {
  Object.entries(outputMap).forEach(([inputId, outputId]) => {
    const output = document.getElementById(outputId);
    if (!output) return;
    output.textContent = ['showerOffset', 'humanOffset'].includes(inputId)
      ? signedMeter(state[inputId])
      : formatMeter(state[inputId]);
  });
}

function productData() {
  return [
    {no:'01', code:'151153', name:'Đầu nối sen trần', brand:'MOEN', spec:'spec/151153.pdf', thumb:'assets/thumbs/151153.webp', detail:'0,149 × 0,064 × 0,064 m · đoạn lộ 0,139 m'},
    {no:'02', code:'D2130CP-ENG', name:'Đầu sen vuông 0,25 m', brand:'BRAVAT', spec:'spec/D2130CP-ENG.pdf', thumb:'assets/thumbs/D2130CP-ENG.webp', detail:'0,25 × 0,25 m · thân dày 0,007 m'},
    {no:'03', code:'PB8173218CP-2-ENG', name:'Mặt nạ sen tắm 2F xoay', brand:'BRAVAT', spec:'spec/PB8173218CP-2-ENG.png', thumb:'assets/thumbs/PB8173218CP-2-ENG.webp', detail:'0,154 × 0,211 m · nhô khỏi tường 0,052 m'},
    {no:'04', code:'D982CP-B-ENG', name:'Bộ chôn âm trong tường', brand:'BRAVAT', spec:'spec/D982CP-B-ENG.pdf', thumb:'assets/thumbs/D982CP-B-ENG.webp', detail:'cao 0,137 m · sâu 0,123 m'},
    {no:'05', code:'HK30012', name:'Tay sen 3 chức năng', brand:'MOEN', spec:'spec/HK30012.pdf', thumb:'assets/thumbs/HK30012.webp', detail:'dài 0,258 m · đầu rộng 0,1 m'},
    {no:'06', code:'P7210N-ENG', name:'Dây sen', brand:'BRAVAT', spec:'spec/P7210N-ENG.png', thumb:'assets/thumbs/P7210N-ENG.webp', detail:'tổng chiều dài 1,539 m'},
    {no:'07', code:'P7304C-ENG', name:'Khớp nối + gác tay sen', brand:'BRAVAT', spec:'spec/P7304C-ENG.png', thumb:'assets/thumbs/P7304C-ENG.webp', detail:'dài 0,098 m · mặt tròn Ø0,06 m'}
  ];
}

function renderProductCards() {
  $('#productCards').innerHTML = productData().map((p) => `
    <article class="product-card">
      <figure><img src="${p.thumb}" alt="${esc(p.name)}"></figure>
      <div>
        <b>${p.no}. ${esc(p.code)}</b>
        <strong>${esc(p.name)}</strong>
        <small>${esc(p.brand)} · ${esc(p.detail)}</small>
      </div>
      <a href="${p.spec}" target="_blank" rel="noopener">SPEC</a>
    </article>
  `).join('');
}

function yAt(heightM, floorY, scale) {
  return floorY - heightM * scale;
}

function verticalDimension(x, y1, y2, value, label, side = 'right') {
  const mid = (y1 + y2) / 2;
  const textX = side === 'right' ? x + 10 : x - 10;
  const anchor = side === 'right' ? 'start' : 'end';
  return `
    <g class="dimension">
      <line x1="${x}" y1="${y1}" x2="${x}" y2="${y2}" marker-start="url(#dimArrow)" marker-end="url(#dimArrow)"/>
      <line x1="${x-8}" y1="${y1}" x2="${x+8}" y2="${y1}"/>
      <line x1="${x-8}" y1="${y2}" x2="${x+8}" y2="${y2}"/>
      <text x="${textX}" y="${mid-5}" text-anchor="${anchor}" class="dim-value">${esc(value)}</text>
      <text x="${textX}" y="${mid+10}" text-anchor="${anchor}" class="dim-label">${esc(label)}</text>
    </g>`;
}

function leaderLabel(x1, y1, x2, y2, title, value, align = 'start') {
  const textX = align === 'start' ? x2 + 8 : x2 - 8;
  return `
    <g>
      <circle cx="${x1}" cy="${y1}" r="3.3" fill="#c38a14"/>
      <path d="M ${x1} ${y1} L ${x2} ${y2}" class="leader"/>
      <text x="${textX}" y="${y2-3}" text-anchor="${align}" class="label-title">${esc(title)}</text>
      <text x="${textX}" y="${y2+11}" text-anchor="${align}" class="label-value">${esc(value)}</text>
    </g>`;
}

function accurateRainShower(headX, ceilingY, scale) {
  const flangeD = fixed.showerArmFlange * scale;
  const stemW = Math.max(3.8, fixed.showerArmStem * scale);
  const armVisible = fixed.showerArmVisible * scale;
  const headW = fixed.rainHeadWidth * scale;
  const headBody = Math.max(2.3, fixed.rainHeadBody * scale);
  const connectorH = Math.max(3, fixed.rainHeadConnector * scale);
  const flangeY = ceilingY + 1;
  const stemTop = ceilingY + flangeD * 0.16;
  const stemBottom = ceilingY + armVisible;
  const connectorTop = stemBottom - connectorH;
  const headTop = stemBottom;
  const faceY = headTop + headBody;
  const nozzleCount = 13;
  return {
    faceY,
    svg: `
      <g aria-label="Đầu nối 151153 và đầu sen D2130CP-ENG">
        <ellipse cx="${headX}" cy="${flangeY}" rx="${flangeD/2}" ry="${Math.max(4, flangeD*0.16)}" class="chrome"/>
        <rect x="${headX-stemW/2}" y="${stemTop}" width="${stemW}" height="${Math.max(8, stemBottom-stemTop)}" rx="${stemW/2}" class="chrome"/>
        <rect x="${headX-stemW*0.85}" y="${connectorTop}" width="${stemW*1.7}" height="${connectorH}" rx="2" class="chrome-dark"/>
        <path d="M ${headX-headW/2} ${headTop} H ${headX+headW/2} L ${headX+headW/2-2} ${faceY} H ${headX-headW/2+2} Z" class="chrome"/>
        ${Array.from({length:nozzleCount},(_,i)=>`<circle cx="${headX-headW*0.42 + (i/(nozzleCount-1))*headW*0.84}" cy="${faceY+1.2}" r="1.05" class="nozzle"/>`).join('')}
      </g>`
  };
}

function accurateMixer(mixerX, mainY, scale) {
  const width = fixed.mixerWidth * scale;
  const height = fixed.mixerHeight * scale;
  const bottomY = mainY + fixed.mixerMainFromBottom * scale;
  const topY = bottomY - height;
  const left = mixerX - width / 2;
  const corner = Math.max(5, 0.016 * scale);
  const diverterY = mainY - fixed.mixerDiverterDelta * scale;
  const diverterSize = 0.044 * scale;
  const mainD = 0.052 * scale;
  const leverW = 0.036 * scale;
  const leverH = 0.092 * scale;
  return `
    <g aria-label="Mặt nạ sen tắm 2F xoay PB8173218CP-2-ENG">
      <rect x="${left}" y="${topY}" width="${width}" height="${height}" rx="${corner}" class="chrome"/>
      <rect x="${mixerX-diverterSize/2}" y="${diverterY-diverterSize/2}" width="${diverterSize}" height="${diverterSize}" rx="${diverterSize*0.34}" class="chrome-dark"/>
      <circle cx="${mixerX}" cy="${mainY}" r="${mainD/2}" class="chrome-dark"/>
      <path d="M ${mixerX-mainD*0.18} ${mainY+mainD*0.20}
               C ${mixerX-mainD*0.12} ${mainY+mainD*0.42}, ${mixerX-leverW*0.46} ${mainY+leverH*0.74}, ${mixerX-leverW*0.34} ${mainY+leverH}
               Q ${mixerX} ${mainY+leverH+4} ${mixerX+leverW*0.34} ${mainY+leverH}
               C ${mixerX+leverW*0.46} ${mainY+leverH*0.74}, ${mixerX+mainD*0.12} ${mainY+mainD*0.42}, ${mixerX+mainD*0.18} ${mainY+mainD*0.20} Z" class="chrome-dark"/>
      <circle cx="${mixerX}" cy="${mainY}" r="${mainD*0.10}" fill="#69747a"/>
    </g>`;
}

function accurateHandShower(x, bottomY, scale) {
  const totalH = fixed.handShowerLength * scale;
  const headW = fixed.handShowerHeadWidth * scale;
  const headH = 0.105 * scale;
  const neckH = 0.040 * scale;
  const handleH = totalH - headH - neckH;
  const topY = bottomY - totalH;
  const headX = x - headW / 2;
  const headY = topY;
  const neckY = headY + headH;
  const handleY = neckY + neckH;
  const handleTopW = 0.035 * scale;
  const handleBottomW = 0.025 * scale;
  const holes = [];
  const cols = 6;
  const rows = 7;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const px = headX + headW*0.18 + c*(headW*0.64/(cols-1));
      const py = headY + headH*0.18 + r*(headH*0.64/(rows-1));
      holes.push(`<circle cx="${px}" cy="${py}" r="0.85" class="nozzle"/>`);
    }
  }
  return {
    topY,
    bottomY,
    hoseX: x,
    hoseY: bottomY,
    svg: `
      <g aria-label="Tay sen MOEN HK30012">
        <path d="M ${headX+headW*0.12} ${headY}
                 H ${headX+headW*0.80}
                 Q ${headX+headW} ${headY+headH*0.10} ${headX+headW} ${headY+headH*0.32}
                 V ${headY+headH*0.78}
                 Q ${headX+headW*0.96} ${headY+headH} ${headX+headW*0.73} ${headY+headH}
                 H ${headX+headW*0.24}
                 Q ${headX} ${headY+headH*0.96} ${headX} ${headY+headH*0.73}
                 V ${headY+headH*0.22}
                 Q ${headX+headW*0.02} ${headY+headH*0.04} ${headX+headW*0.12} ${headY} Z" class="chrome"/>
        ${holes.join('')}
        <circle cx="${x}" cy="${headY+headH*0.50}" r="${Math.max(2.2,0.009*scale)}" fill="#e8ecee" stroke="#596269" stroke-width="1"/>
        <path d="M ${x-handleTopW/2} ${neckY}
                 Q ${x-handleTopW*0.40} ${neckY+neckH*0.48} ${x-handleTopW*0.32} ${handleY}
                 L ${x-handleBottomW/2} ${bottomY}
                 H ${x+handleBottomW/2}
                 L ${x+handleTopW*0.32} ${handleY}
                 Q ${x+handleTopW*0.40} ${neckY+neckH*0.48} ${x+handleTopW/2} ${neckY} Z" class="chrome-dark"/>
        <rect x="${x-0.022*scale}" y="${neckY+neckH*0.22}" width="${0.044*scale}" height="${0.022*scale}" rx="${0.010*scale}" fill="#f4f6f7" stroke="#566169" stroke-width="1"/>
        <rect x="${x-handleBottomW*0.56}" y="${bottomY-3}" width="${handleBottomW*1.12}" height="4" rx="1" class="chrome-dark"/>
      </g>`
  };
}

function accurateHolder(outletX, centerY, scale) {
  const flangeD = fixed.holderFlange * scale;
  const projection = fixed.holderProjection * scale;
  const bodyD = fixed.holderBody * scale;
  const wallPlateX = outletX;
  const bodyLeft = wallPlateX - projection;
  const holderCenterX = bodyLeft + 0.020 * scale;
  const waterPortX = wallPlateX - 0.020 * scale;
  const waterPortY = centerY + bodyD * 0.95;
  return {
    handX: holderCenterX,
    handBottomY: centerY + 0.040 * scale,
    waterPortX,
    waterPortY,
    svg: `
      <g aria-label="Khớp nối và gác tay sen P7304C-ENG">
        <circle cx="${wallPlateX}" cy="${centerY}" r="${flangeD/2}" class="chrome"/>
        <rect x="${bodyLeft}" y="${centerY-bodyD/2}" width="${projection-flangeD*0.20}" height="${bodyD}" rx="${bodyD/2}" class="chrome-dark"/>
        <path d="M ${holderCenterX-bodyD*0.62} ${centerY-bodyD*0.76}
                 Q ${holderCenterX-bodyD*1.02} ${centerY} ${holderCenterX-bodyD*0.62} ${centerY+bodyD*0.76}" class="holder-cradle"/>
        <circle cx="${waterPortX}" cy="${waterPortY}" r="${Math.max(3,0.012*scale)}" class="chrome"/>
        <circle cx="${waterPortX}" cy="${waterPortY}" r="${Math.max(1.6,0.006*scale)}" fill="#fff" stroke="#4c565c" stroke-width="1"/>
      </g>`
  };
}

function hosePath(handX, handY, portX, portY, lowY) {
  const midX = (handX + portX) / 2;
  const leftC = handX - 0.06 * 170;
  const rightC = portX + 0.05 * 170;
  return `M ${handX} ${handY}
          C ${leftC} ${handY+50}, ${midX-34} ${lowY}, ${midX} ${lowY}
          C ${midX+36} ${lowY}, ${rightC} ${portY+45}, ${portX} ${portY}`;
}

function webtoonManImage(cx, floorY, heightPx) {
  const aspect = 477 / 974;
  const width = heightPx * aspect;
  return `<image href="1.png" x="${cx-width/2}" y="${floorY-heightPx}" width="${width}" height="${heightPx}" preserveAspectRatio="xMidYMax meet" aria-label="Chàng trai webtoon tham chiếu đang trải nghiệm tắm"/>`;
}

function rainWater(headX, startY, endY, width) {
  const lines = [];
  const count = 13;
  for (let i = 0; i < count; i++) {
    const px = headX - width/2 + (i/(count-1))*width;
    const bend = (i % 3 - 1) * 3;
    const shorten = (i % 4) * 8;
    lines.push(`<path d="M ${px} ${startY} C ${px+bend} ${startY+75}, ${px-bend} ${endY-65}, ${px+bend/2} ${endY-shorten}" class="water-line"/>`);
  }
  return `<g>${lines.join('')}<circle cx="${headX-width*.42}" cy="${endY-12}" r="2.3" class="drop"/><circle cx="${headX+width*.38}" cy="${endY-30}" r="2" class="drop"/></g>`;
}

function renderSheet() {
  const d = state;
  const floorY = 710;
  const top2900Y = 225;
  const scale = (floorY - top2900Y) / fixed.structuralMax;
  const top2700Y = yAt(fixed.structuralMin, floorY, scale);
  const ceilingY = yAt(d.finishedCeiling, floorY, scale);
  const showerFaceHeight = d.finishedCeiling - fixed.showerDrop;
  const headX = 690 + d.showerOffset * scale;
  const humanX = 675 + d.humanOffset * scale;
  const mixerX = clamp(headX, 690, 760);
  const mixerY = yAt(d.mixerHeight, floorY, scale);
  const holderX = clamp(mixerX + d.holderOffset * scale, mixerX + 36, 812);
  const holderY = yAt(d.holderHeight, floorY, scale);
  const hoseLowY = yAt(d.hoseLow, floorY, scale);
  const personHeightPx = d.humanHeight * scale;
  const roomLeft = 90;
  const roomRight = 1310;
  const dateText = new Date().toLocaleDateString('vi-VN');
  const rain = accurateRainShower(headX, ceilingY, scale);
  const holder = accurateHolder(holderX, holderY, scale);
  const hand = accurateHandShower(holder.handX, holder.handBottomY, scale);
  const productRows = productData().map((p) => [p.no, p.code, p.name, p.brand]);
  const detailedLabels = d.showHuman === 'no';

  svg.innerHTML = `
    <defs>
      <linearGradient id="chromeGradient" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".45" stop-color="#d6dcdf"/><stop offset="1" stop-color="#929da3"/></linearGradient>
      <linearGradient id="chromeDarkGradient" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f1f4f5"/><stop offset="1" stop-color="#a4adb2"/></linearGradient>
      <linearGradient id="wallGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fffefb"/><stop offset="1" stop-color="#f5efe4"/></linearGradient>
      <marker id="dimArrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#8b5b0e"/></marker>
      <style>
        text{font-family:Inter,'Segoe UI',Arial,sans-serif;fill:#342c24}
        .sheet-border{fill:#fffdf8;stroke:#d8cdbd;stroke-width:1.4}
        .meta-box{fill:#fff;stroke:#d8c9ad;stroke-width:1}
        .meta-label{font-size:9px;font-weight:800;fill:#7c705e;letter-spacing:.04em}
        .meta-value{font-size:13px;font-weight:700;fill:#3d2c17}
        .section-title{font-size:17px;font-weight:850;fill:#573506;letter-spacing:.035em}
        .section-sub{font-size:9px;fill:#81766a}
        .structural-range{fill:#e8e0d3;stroke:#8e8275;stroke-width:1.2}
        .ceiling{stroke:#75500f;stroke-width:3}
        .floor{stroke:#392f25;stroke-width:3}
        .wall{fill:url(#wallGradient);stroke:#d2c4af;stroke-width:1.2}
        .tile{stroke:#eadfce;stroke-width:.8}
        .chrome{fill:url(#chromeGradient);stroke:#485157;stroke-width:1.35}
        .chrome-dark{fill:url(#chromeDarkGradient);stroke:#485157;stroke-width:1.25}
        .nozzle{fill:#566169}
        .holder-cradle{fill:none;stroke:#485157;stroke-width:3.2;stroke-linecap:round}
        .hose{fill:none;stroke:#3e474c;stroke-width:3.5;stroke-linecap:round}
        .dimension line,.dimension path{stroke:#8b5b0e;stroke-width:1.2;fill:none}
        .dim-value{font-size:11px;font-weight:850;fill:#6d4506}
        .dim-label{font-size:8px;fill:#7b7064}
        .leader{stroke:#b1832d;stroke-width:1.1;fill:none}
        .label-title{font-size:9px;font-weight:750;fill:#5c3a08}
        .label-value{font-size:8px;fill:#766b5e}
        .water-line{fill:none;stroke:#64a9ca;stroke-width:1.8;stroke-linecap:round;opacity:.70}
        .drop{fill:#64a9ca;opacity:.72}
        .summary-box{fill:#fff;stroke:#d7c9b5;stroke-width:1.2}
        .summary-head{fill:#f8edcb;stroke:#d7c9b5;stroke-width:1.2}
        .summary-title{font-size:10px;font-weight:850;fill:#62400b;letter-spacing:.04em}
        .summary-label{font-size:8px;fill:#766b60}
        .summary-value{font-size:13px;font-weight:800;fill:#432703}
        .table-head{font-size:7.5px;font-weight:850;fill:#62400b}
        .table-cell{font-size:7.5px;fill:#3e342c}
        .notice{font-size:8.5px;fill:#6f655b}
        .footer-main{font-size:8px;font-weight:850;fill:#62400b}
        .footer-sub{font-size:6.5px;fill:#7b7166}
      </style>
    </defs>

    <rect x="12" y="12" width="1376" height="966" rx="20" class="sheet-border"/>

    <image href="assets/logos/jpkvo.png" x="50" y="38" width="178" height="48" preserveAspectRatio="xMinYMid meet"/>
    <text x="700" y="40" text-anchor="middle" font-size="10" font-weight="850" fill="#7b4e08" letter-spacing="2">SƠ ĐỒ MINH HỌA LẮP ĐẶT 2D</text>
    <text x="700" y="76" text-anchor="middle" font-size="33" font-weight="850" fill="#432703">SEN TẮM ÂM TRẦN</text>
    <text x="700" y="98" text-anchor="middle" font-size="10" fill="#7c7166" letter-spacing="1">BRAVAT × MOEN · MẶT ĐỨNG THAM KHẢO</text>
    <image href="assets/logos/bravat.png" x="1136" y="47" width="96" height="34" preserveAspectRatio="xMidYMid meet"/>
    <image href="assets/logos/moen.png" x="1245" y="44" width="91" height="41" preserveAspectRatio="xMidYMid meet"/>

    <g>
      <rect x="50" y="116" width="390" height="53" class="meta-box"/><rect x="440" y="116" width="435" height="53" class="meta-box"/><rect x="875" y="116" width="235" height="53" class="meta-box"/><rect x="1110" y="116" width="226" height="53" class="meta-box"/>
      <text x="64" y="136" class="meta-label">KHÁCH HÀNG / CÔNG TRÌNH</text><text x="64" y="157" class="meta-value">${esc(d.projectName || '—')}</text>
      <text x="454" y="136" class="meta-label">ĐỊA CHỈ</text><text x="454" y="157" class="meta-value">${esc(d.projectAddress || '—')}</text>
      <text x="889" y="136" class="meta-label">MÃ BẢN VẼ</text><text x="889" y="157" class="meta-value">${esc(d.drawingCode || '—')}</text>
      <text x="1124" y="136" class="meta-label">NGÀY LẬP</text><text x="1124" y="157" class="meta-value">${esc(dateText)}</text>
    </g>

    <text x="55" y="198" class="section-title">MẶT ĐỨNG KHU TẮM</text>
    <text x="55" y="214" class="section-sub">Mô phỏng đúng tỷ lệ tương đối và giữ nguyên cấu trúc của từng sản phẩm theo tài liệu nhà cung cấp</text>

    <rect x="${roomLeft}" y="${ceilingY}" width="${roomRight-roomLeft}" height="${floorY-ceilingY}" class="wall"/>
    ${Array.from({length:8},(_,i)=>{const yy=ceilingY+(floorY-ceilingY)*(i+1)/9;return `<line x1="${roomLeft}" y1="${yy}" x2="${roomRight}" y2="${yy}" class="tile"/>`;}).join('')}
    ${Array.from({length:12},(_,i)=>{const xx=roomLeft+(roomRight-roomLeft)*(i+1)/13;return `<line x1="${xx}" y1="${ceilingY}" x2="${xx}" y2="${floorY}" class="tile"/>`;}).join('')}

    <rect x="${roomLeft}" y="${top2900Y}" width="${roomRight-roomLeft}" height="${top2700Y-top2900Y}" class="structural-range"/>
    <text x="${roomLeft+16}" y="${top2900Y+20}" font-size="10" font-weight="850" fill="#5b3b0a">CHIỀU CAO TRẦN THẬT: 2,7 - 2,9 m</text>
    <line x1="${roomLeft}" y1="${ceilingY}" x2="${roomRight}" y2="${ceilingY}" class="ceiling"/>
    <line x1="${roomLeft}" y1="${floorY}" x2="${roomRight}" y2="${floorY}" class="floor"/>
    <text x="${roomLeft+12}" y="${ceilingY-9}" font-size="9" font-weight="800" fill="#62400b">TRẦN HOÀN THIỆN: ${formatMeter(d.finishedCeiling)}</text>
    <text x="${roomLeft+12}" y="${floorY-9}" font-size="9" font-weight="800" fill="#49351b">SÀN HOÀN THIỆN</text>

    ${rain.svg}
    ${d.showHuman === 'yes' ? webtoonManImage(humanX, floorY, personHeightPx) : ''}
    ${accurateMixer(mixerX, mixerY, scale)}
    ${holder.svg}
    ${hand.svg}
    <path d="${hosePath(hand.hoseX, hand.hoseY, holder.waterPortX, holder.waterPortY, hoseLowY)}" class="hose"/>
    ${d.showWater === 'yes' ? rainWater(headX, rain.faceY+3, floorY-48, fixed.rainHeadWidth*scale*0.82) : ''}

    ${verticalDimension(roomLeft-18, top2900Y, floorY, '2,7 - 2,9 m', 'Chiều cao trần thật', 'right')}
    ${verticalDimension(roomRight+22, ceilingY, floorY, formatMeter(d.finishedCeiling), 'Trần hoàn thiện đến sàn', 'left')}
    <g class="dimension">
      <line x1="${headX+84}" y1="${ceilingY+7}" x2="${headX+84}" y2="${rain.faceY}" marker-start="url(#dimArrow)" marker-end="url(#dimArrow)"/>
      <line x1="${headX+76}" y1="${ceilingY+7}" x2="${headX+92}" y2="${ceilingY+7}"/>
      <line x1="${headX+76}" y1="${rain.faceY}" x2="${headX+92}" y2="${rain.faceY}"/>
      <rect x="${headX+96}" y="${ceilingY+12}" width="178" height="34" rx="5" fill="#fffdf8" opacity="0.98"/>
      <text x="${headX+106}" y="${ceilingY+25}" text-anchor="start" class="dim-value">${esc(formatMeter(fixed.showerDrop))}</text>
      <text x="${headX+106}" y="${ceilingY+38}" text-anchor="start" class="dim-label">Trần xuống mặt dưới đầu sen</text>
    </g>
    ${verticalDimension(d.showHuman === 'no' ? clamp(holderX + 320, 1160, roomRight - 48) : clamp(holderX + 110, 930, roomRight - 78), rain.faceY, floorY, formatMeter(showerFaceHeight), 'Đầu sen đến sàn', 'right')}
    ${d.showHuman === 'yes' ? verticalDimension(humanX-105, yAt(d.humanHeight, floorY, scale), floorY, formatMeter(d.humanHeight), 'Chiều cao người tham chiếu', 'left') : ''}

    ${detailedLabels ? leaderLabel(headX, rain.faceY, 790, rain.faceY+30, 'Đầu nối 151153 + đầu sen D2130CP-ENG', `Cách sàn ${formatMeter(showerFaceHeight)}`, 'start') : ''}
    ${detailedLabels ? leaderLabel(mixerX, mixerY, mixerX-82, mixerY-40, 'Mặt nạ sen tắm 2F xoay PB8173218CP-2-ENG', `Cách sàn ${formatMeter(d.mixerHeight)}`, 'end') : ''}
    ${detailedLabels ? leaderLabel(mixerX, mixerY+12, mixerX-88, mixerY+42, 'Bộ chôn âm trong tường D982CP-B-ENG', `Cách sàn ${formatMeter(d.mixerHeight)}`, 'end') : ''}
    ${detailedLabels ? leaderLabel(holderX, holderY, holderX+92, holderY-8, 'Khớp nối + gác P7304C-ENG', `Cách sàn ${formatMeter(d.holderHeight)}`, 'start') : ''}
    ${detailedLabels ? leaderLabel(hand.hoseX, hand.topY+18, hand.hoseX+116, hand.topY-24, 'Tay sen MOEN HK30012', `Cách sàn ${formatMeter((floorY - (hand.topY + 18)) / scale)}`, 'start') : ''}
    ${detailedLabels ? leaderLabel((hand.hoseX+holder.waterPortX)/2, hoseLowY, hand.hoseX+116, hoseLowY+18, 'Dây sen P7210N-ENG', `Cách sàn ${formatMeter(d.hoseLow)}`, 'start') : ''}

    <g transform="translate(50 748)">
      <rect x="0" y="0" width="438" height="176" rx="11" class="summary-box"/><rect x="0" y="0" width="438" height="34" rx="11" class="summary-head"/>
      <text x="15" y="22" class="summary-title">CHIỀU CAO ĐÃ CHỌN</text>
      ${[
        ['Trần hoàn thiện',formatMeter(d.finishedCeiling),0,0],
        ['Trần xuống đầu sen',formatMeter(fixed.showerDrop),1,0],
        ['Đầu sen đến sàn',formatMeter(showerFaceHeight),0,1],
        ['Tay gạt',formatMeter(d.mixerHeight),1,1],
        ['Khớp nối + gác tay sen',formatMeter(d.holderHeight),0,2],
        ['Điểm thấp nhất dây sen',formatMeter(d.hoseLow),1,2],
        ['Người tham chiếu',formatMeter(d.humanHeight),0,3],
        ['Đơn vị dùng trên bản vẽ','mét (m)',1,3]
      ].map(([label,value,col,row])=>{const x=col*219;const y=34+row*35.5;return `<rect x="${x}" y="${y}" width="219" height="35.5" fill="#fff" stroke="#eee4d4"/><text x="${x+10}" y="${y+13}" class="summary-label">${esc(label)}</text><text x="${x+10}" y="${y+29}" class="summary-value">${esc(value)}</text>`;}).join('')}
    </g>

    <g transform="translate(505 748)">
      <rect x="0" y="0" width="831" height="176" rx="11" class="summary-box"/><rect x="0" y="0" width="831" height="34" rx="11" class="summary-head"/>
      <text x="15" y="22" class="summary-title">DANH MỤC THIẾT BỊ</text>
      <g><rect x="0" y="34" width="831" height="23" fill="#fffaf0" stroke="#eee4d4"/><text x="14" y="49" class="table-head">STT</text><text x="58" y="49" class="table-head">MÃ HÀNG</text><text x="250" y="49" class="table-head">THIẾT BỊ</text><text x="748" y="49" class="table-head">HÃNG</text></g>
      ${productRows.map((row,i)=>{const y=57+i*16.7;return `<line x1="0" y1="${y+16.7}" x2="831" y2="${y+16.7}" stroke="#eee4d4"/><text x="16" y="${y+11}" class="table-cell">${esc(row[0])}</text><text x="58" y="${y+11}" class="table-cell">${esc(row[1])}</text><text x="250" y="${y+11}" class="table-cell">${esc(row[2])}</text><text x="748" y="${y+11}" class="table-cell">${esc(row[3])}</text>`;}).join('')}
    </g>

    <rect x="330" y="933" width="740" height="18" fill="#fffdf8"/>
    <text x="700" y="945" text-anchor="middle" class="notice">Bản vẽ, vị trí và kích thước chỉ mang tính tham khảo; cần kiểm tra thực tế công trình và tài liệu chính thức của nhà cung cấp trước khi lắp đặt.</text>
    <rect x="50" y="950" width="1286" height="30" fill="#fffdf8"/>
    <line x1="50" y1="950" x2="1336" y2="950" stroke="#d4c4aa"/>
    <image href="assets/logos/jpkvo.png" x="50" y="956" width="104" height="20" preserveAspectRatio="xMinYMid meet"/>
    <text x="168" y="964" class="footer-main">CÔNG TY TNHH JPK VÕ</text><text x="168" y="975" class="footer-sub">382 Nguyễn Tri Phương, P. Hòa Cường, TP. Đà Nẵng · jpkvo.com</text>
    <text x="1070" y="972" class="footer-sub">Người lập: ${esc(d.preparedBy || '________________')}</text><text x="1288" y="972" class="footer-sub">Trang 1/1</text>
  `;
}

function renderAll() {
  readInputs();
  updateOutputs();
  renderProductCards();
  renderSheet();
}

function togglePanel(show) {
  const layout = $('#appLayout');
  const button = $('#togglePanelBtn');
  const shouldHide = typeof show === 'boolean' ? !show : !layout.classList.contains('is-panel-hidden');
  layout.classList.toggle('is-panel-hidden', shouldHide);
  button.textContent = shouldHide ? 'Mở bảng nhập' : 'Ẩn bảng nhập';
  button.setAttribute('aria-expanded', String(!shouldHide));
}

function saveConfig() {
  readInputs();
  const blob = new Blob([JSON.stringify(state, null, 2)], {type:'application/json'});
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${state.drawingCode || 'so-do-sen-tam'}.json`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 1500);
}

async function loadConfig(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    const parsed = JSON.parse(await file.text());
    writeInputs(parsed);
    renderAll();
  } catch (error) {
    alert('Không đọc được file cấu hình.');
  }
  event.target.value = '';
}

async function imageUrlToDataUrl(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Không tải được ${url}`);
  const blob = await response.blob();
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function serializedSheetSvg() {
  const clone = svg.cloneNode(true);
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  clone.setAttribute('width', '1400');
  clone.setAttribute('height', '990');
  const images = Array.from(clone.querySelectorAll('image'));
  for (const image of images) {
    const href = image.getAttribute('href') || image.getAttribute('xlink:href');
    if (!href || href.startsWith('data:')) continue;
    image.setAttribute('href', await imageUrlToDataUrl(href));
  }
  return new XMLSerializer().serializeToString(clone);
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = url;
  });
}

async function sheetToJpeg() {
  const source = await serializedSheetSvg();
  const blob = new Blob([source], {type:'image/svg+xml;charset=utf-8'});
  const url = URL.createObjectURL(blob);
  const image = await loadImage(url);
  const canvas = document.createElement('canvas');
  canvas.width = 2800;
  canvas.height = 1980;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#fffdf8';
  ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.drawImage(image,0,0,canvas.width,canvas.height);
  URL.revokeObjectURL(url);
  return canvas.toDataURL('image/jpeg', .96);
}

function base64Bytes(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i=0;i<binary.length;i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function jpegSize(bytes) {
  let offset = 2;
  while (offset < bytes.length) {
    if (bytes[offset] !== 0xff) { offset++; continue; }
    const marker = bytes[offset+1];
    if (marker === 0xc0 || marker === 0xc2) {
      return {height:(bytes[offset+5]<<8)+bytes[offset+6], width:(bytes[offset+7]<<8)+bytes[offset+8]};
    }
    const length = (bytes[offset+2]<<8)+bytes[offset+3];
    offset += 2 + length;
  }
  throw new Error('Không đọc được ảnh xuất PDF.');
}

function jpegPdf(dataUrl) {
  const jpeg = base64Bytes(dataUrl.split(',')[1]);
  const size = jpegSize(jpeg);
  const pageW = 841.89;
  const pageH = 595.28;
  const margin = 10;
  const scale = Math.min((pageW-margin*2)/size.width,(pageH-margin*2)/size.height);
  const drawW = size.width*scale;
  const drawH = size.height*scale;
  const x = (pageW-drawW)/2;
  const y = (pageH-drawH)/2;
  const content = `q\n${drawW.toFixed(2)} 0 0 ${drawH.toFixed(2)} ${x.toFixed(2)} ${y.toFixed(2)} cm\n/Im0 Do\nQ`;
  const encoder = new TextEncoder();
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageW} ${pageH}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>`,
    {dict:`<< /Type /XObject /Subtype /Image /Width ${size.width} /Height ${size.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>`, stream:jpeg},
    {dict:`<< /Length ${content.length} >>`, stream:encoder.encode(content)}
  ];
  const chunks = [encoder.encode('%PDF-1.4\n%âãÏÓ\n')];
  const offsets = [0];
  let pos = chunks[0].length;
  objects.forEach((object,index) => {
    offsets.push(pos);
    const start = encoder.encode(`${index+1} 0 obj\n`);
    chunks.push(start); pos += start.length;
    if (typeof object === 'string') {
      const body = encoder.encode(`${object}\nendobj\n`);
      chunks.push(body); pos += body.length;
    } else {
      const header = encoder.encode(`${object.dict}\nstream\n`);
      const end = encoder.encode('\nendstream\nendobj\n');
      chunks.push(header); pos += header.length;
      chunks.push(object.stream); pos += object.stream.length;
      chunks.push(end); pos += end.length;
    }
  });
  const xrefPos = pos;
  let xref = `xref\n0 ${objects.length+1}\n0000000000 65535 f \n`;
  for (let i=1;i<offsets.length;i++) xref += `${String(offsets[i]).padStart(10,'0')} 00000 n \n`;
  xref += `trailer\n<< /Size ${objects.length+1} /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF`;
  chunks.push(encoder.encode(xref));
  return new Blob(chunks,{type:'application/pdf'});
}

async function exportPdf() {
  const button = $('#exportPdfBtn');
  const label = button.textContent;
  button.disabled = true;
  button.textContent = 'Đang tạo PDF...';
  try {
    readInputs();
    renderSheet();
    const jpeg = await sheetToJpeg();
    const pdf = jpegPdf(jpeg);
    const suffix = state.showHuman === 'yes' ? 'co-nguoi-tham-chieu' : 'khong-nguoi-tham-chieu';
    const link = document.createElement('a');
    link.href = URL.createObjectURL(pdf);
    link.download = `${state.drawingCode || 'so-do-sen-tam'}-${suffix}.pdf`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 2000);
  } catch (error) {
    console.error(error);
    alert('Chưa thể tạo PDF. Hãy mở web bằng file MO_SO_DO_2D.bat rồi thử lại.');
  } finally {
    button.disabled = false;
    button.textContent = label;
  }
}

function bindEvents() {
  inputIds.forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', renderAll);
    el.addEventListener('change', renderAll);
  });
  $('#togglePanelBtn').addEventListener('click', () => togglePanel());
  $('#resetBtn').addEventListener('click', () => { writeInputs(defaults); renderAll(); });
  $('#saveConfigBtn').addEventListener('click', saveConfig);
  $('#loadConfigInput').addEventListener('change', loadConfig);
  $('#exportPdfBtn').addEventListener('click', exportPdf);
}

writeInputs(defaults);
bindEvents();
renderAll();
