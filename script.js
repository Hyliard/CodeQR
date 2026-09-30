const $ = (sel) => document.querySelector(sel);

const root = document.documentElement;
const form = $('#form');
const input = $('#link');
const msg = $('#msg');
const result = $('#result');
const qr = $('#qr');
const poster = $('#poster');

const W = poster.width;
const H = poster.height;
const FONT = 'system-ui, "Segoe UI", Roboto, sans-serif';

let link = '';

function fail(text) {
    msg.textContent = text;
    msg.classList.remove('ok');
    input.setAttribute('aria-invalid', 'true');
    input.focus();
}

function notify(text) {
    msg.textContent = text;
    msg.classList.add('ok');
}

function toUrl(value) {
    let v = value.trim();
    if (!/^https?:\/\//i.test(v)) v = 'https://' + v;

    try {
        return new URL(v);
    } catch {
        return null;
    }
}

form.addEventListener('submit', (e) => {
    e.preventDefault();
    result.hidden = true;

    if (!input.value.trim()) return fail('Pega un enlace primero.');

    const url = toUrl(input.value);
    if (!url) return fail('Ese enlace no es válido. Ej: https://ejemplo.com');
    if (!window.QRCode) return fail('No cargó la librería del QR, recarga la página.');

    link = url.href;
    input.value = link;
    qr.replaceChildren();

    new QRCode(qr, {
        text: link,
        width: 512,
        height: 512,
        colorDark: '#1a1b26',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.H
    });

    drawPoster();
    result.hidden = false;
    notify('QR generado.');
});

input.addEventListener('input', () => {
    msg.textContent = '';
    input.removeAttribute('aria-invalid');
});

function fileName(suffix = '') {
    const name = $('#name').value.trim().replace(/[\\/:*?"<>|]+/g, '') || 'qr';
    return `${name}${suffix}.png`;
}

function save(canvas, name) {
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = name;
    a.click();
}

// texto oscuro o claro según qué tan claro sea el color elegido
function ink(hex) {
    const n = parseInt(hex.slice(1), 16);
    const lum = (n >> 16) * .299 + ((n >> 8) & 255) * .587 + (n & 255) * .114;
    return lum > 160 ? '#1a1b26' : '#ffffff';
}

function corners(ctx, x, y, size, color) {
    const l = 110;
    const end = x + size;
    const bottom = y + size;

    ctx.strokeStyle = color;
    ctx.lineWidth = 12;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(x, y + l); ctx.lineTo(x, y); ctx.lineTo(x + l, y);
    ctx.moveTo(end - l, y); ctx.lineTo(end, y); ctx.lineTo(end, y + l);
    ctx.moveTo(end, bottom - l); ctx.lineTo(end, bottom); ctx.lineTo(end - l, bottom);
    ctx.moveTo(x + l, bottom); ctx.lineTo(x, bottom); ctx.lineTo(x, bottom - l);
    ctx.stroke();
}

function drawPoster() {
    const src = qr.querySelector('canvas');
    if (!src) return;

    const ctx = poster.getContext('2d');
    const color = $('#color').value;
    const title = $('#title').value.trim();

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(0, 0, W, H, 80);
    ctx.fill();

    if (title) {
        ctx.font = `bold 64px ${FONT}`;
        const w = Math.min(ctx.measureText(title).width + 140, W - 120);

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.roundRect((W - w) / 2, 100, w, 130, 65);
        ctx.fill();

        ctx.fillStyle = ink(color);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(title, W / 2, 167, w - 100);
    }

    const size = 740;
    const x = (W - size) / 2;
    const y = 370;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(src, x, y, size, size);
    corners(ctx, x - 45, y - 45, size + 90, color);
}

$('#fields').addEventListener('input', drawPoster);

$('#download').addEventListener('click', () => {
    const canvas = qr.querySelector('canvas');
    if (canvas) save(canvas, fileName());
});

$('#downloadPoster').addEventListener('click', () => save(poster, fileName('-cartel')));

$('#copy').addEventListener('click', async () => {
    try {
        await navigator.clipboard.writeText(link);
        notify('Enlace copiado.');
    } catch {
        msg.classList.remove('ok');
        msg.textContent = 'No se pudo copiar.';
    }
});

$('#reset').addEventListener('click', () => {
    form.reset();
    msg.textContent = '';
    qr.replaceChildren();
    result.hidden = true;
    link = '';
    input.focus();
});

$('#theme').addEventListener('click', () => {
    const theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = theme;
    localStorage.setItem('theme', theme);
});
