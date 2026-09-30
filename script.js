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
let logo = null;

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

function wrap(ctx, text, max) {
    const lines = [];
    let line = '';

    for (const word of text.split(/\s+/)) {
        const next = line ? `${line} ${word}` : word;
        if (line && ctx.measureText(next).width > max) {
            lines.push(line);
            line = word;
        } else {
            line = next;
        }
    }

    if (line) lines.push(line);
    return lines;
}

function corners(ctx, x, y, size, color) {
    const l = 90;
    const end = x + size;
    const bottom = y + size;

    ctx.strokeStyle = color;
    ctx.lineWidth = 10;
    ctx.lineCap = 'square';
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
    const name = $('#name').value.trim();
    const title = $('#title').value.trim();
    const text = $('#text').value.trim();

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = '#f1f2f6';
    ctx.beginPath();
    ctx.roundRect(60, 0, W - 120, 200, [0, 0, 60, 60]);
    ctx.fill();

    ctx.textBaseline = 'middle';

    if (logo) {
        const s = Math.min(110 / logo.height, 600 / logo.width);
        ctx.drawImage(logo, 120, 100 - logo.height * s / 2, logo.width * s, logo.height * s);
    } else if (name) {
        ctx.fillStyle = color;
        ctx.font = `bold 64px ${FONT}`;
        ctx.textAlign = 'left';
        ctx.fillText(name, 120, 100, W - 240);
    }

    ctx.fillStyle = '#1a1b26';
    ctx.font = `bold 72px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.fillText(title, W / 2, 310, W - 160);

    const size = 560;
    const x = (W - size) / 2;
    const y = 420;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(src, x, y, size, size);
    corners(ctx, x - 40, y - 40, size + 80, color);

    const top = 1100;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(60, top, W - 120, H - top, [60, 60, 0, 0]);
    ctx.fill();

    ctx.fillStyle = ink(color);
    ctx.font = `bold 52px ${FONT}`;
    wrap(ctx, text, W - 280).slice(0, 3).forEach((line, i) => {
        ctx.fillText(line, W / 2, top + 130 + i * 72);
    });

    ctx.globalAlpha = .8;
    ctx.font = `32px ${FONT}`;
    ctx.fillText(link, W / 2, H - 90, W - 240);
    ctx.globalAlpha = 1;
}

$('#fields').addEventListener('input', drawPoster);

$('#logo').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) {
        logo = null;
        return drawPoster();
    }

    const img = new Image();
    img.onload = () => {
        URL.revokeObjectURL(img.src);
        logo = img;
        drawPoster();
    };
    img.src = URL.createObjectURL(file);
});

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
