const $ = (sel) => document.querySelector(sel);

const root = document.documentElement;
const form = $('#form');
const input = $('#link');
const msg = $('#msg');
const result = $('#result');
const qr = $('#qr');

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
        colorDark: '#1e1e2e',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.H
    });

    $('#qrLink').textContent = link;
    result.hidden = false;
    notify('QR generado.');
});

input.addEventListener('input', () => {
    msg.textContent = '';
    input.removeAttribute('aria-invalid');
});

$('#download').addEventListener('click', () => {
    const canvas = qr.querySelector('canvas');
    if (!canvas) return;

    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = 'qr.png';
    a.click();
});

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
