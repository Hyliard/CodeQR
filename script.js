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
let mode = 'url';

const TITLES = {
    url: '¡Escaneá el QR!',
    wifi: 'Conectate al WiFi',
    contact: 'Guardá mi contacto',
    email: 'Escribime',
    sms: 'Mandame un SMS',
    tel: 'Llamame',
    geo: '¿Cómo llegar?',
    event: 'Agendalo'
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE = /^\+?\d{6,15}$/;

const val = (id) => $(`#${id}`).value.trim();
const digits = (s) => s.replace(/[^\d+]/g, '');
// escape de vCard / iCalendar
const escText = (s) => s.replace(/([\\,;])/g, '\\$1').replace(/\n/g, '\\n');

function fail(text, el = input) {
    msg.textContent = text;
    msg.classList.remove('ok');
    if (!el) return;
    el.setAttribute('aria-invalid', 'true');
    el.focus();
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

    if (!window.QRCode) return fail('No cargó la librería del QR, recarga la página.', null);

    const data = readers[mode]();
    if (!data) return;

    qr.replaceChildren();

    try {
        new QRCode(qr, {
            text: data,
            width: 512,
            height: 512,
            colorDark: '#1a1b26',
            colorLight: '#ffffff',
            // con textos largos (vCard, eventos) el nivel H no entra
            correctLevel: data.length > 250 ? QRCode.CorrectLevel.M : QRCode.CorrectLevel.H
        });
    } catch {
        return fail('Es demasiado texto para un QR, acortalo un poco.', null);
    }

    drawPoster();
    result.hidden = false;
    notify('QR generado.');
});

function readUrl() {
    if (!input.value.trim()) return fail('Pega un enlace primero.');

    const url = toUrl(input.value);
    if (!url) return fail('Ese enlace no es válido. Ej: https://ejemplo.com');

    link = url.href;
    input.value = link;
    return link;
}

// formato estándar que leen las cámaras de Android e iOS
function readWifi() {
    const ssid = $('#ssid');
    const pass = $('#pass');
    const type = $('#security').value;
    const esc = (s) => s.replace(/([\\;,:"])/g, '\\$1');

    if (!ssid.value.trim()) return fail('Falta el nombre de la red.', ssid);
    if (type !== 'nopass' && !pass.value) return fail('Falta la contraseña.', pass);

    const p = type === 'nopass' ? '' : `P:${esc(pass.value)};`;
    const h = $('#hiddenNet').checked ? 'H:true;' : '';
    return `WIFI:T:${type};S:${esc(ssid.value)};${p}${h};`;
}

function readContact() {
    const first = val('cFirst');
    const last = val('cLast');
    if (!first && !last) return fail('Poné al menos el nombre.', $('#cFirst'));

    const email = val('cEmail');
    if (email && !EMAIL.test(email)) return fail('Revisá el email.', $('#cEmail'));

    const lines = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `N:${escText(last)};${escText(first)};;;`,
        `FN:${escText(`${first} ${last}`.trim())}`
    ];

    const add = (key, v) => v && lines.push(`${key}:${v}`);
    add('TEL;TYPE=CELL', digits(val('cPhone')));
    add('EMAIL', email);
    add('ORG', escText(val('cOrg')));
    add('TITLE', escText(val('cRole')));
    add('URL', val('cWeb'));
    add('ADR', val('cAddr') && `;;${escText(val('cAddr'))};;;;`);
    lines.push('END:VCARD');

    return lines.join('\r\n');
}

function readEmail() {
    const to = val('mTo');
    if (!EMAIL.test(to)) return fail('Revisá el email de destino.', $('#mTo'));

    const query = [['subject', val('mSubject')], ['body', val('mBody')]]
        .filter(([, v]) => v)
        .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
        .join('&');

    return `mailto:${to}${query ? `?${query}` : ''}`;
}

function readSms() {
    const num = digits(val('sPhone'));
    if (!PHONE.test(num)) return fail('Revisá el número.', $('#sPhone'));
    return `SMSTO:${num}:${val('sBody')}`;
}

function readTel() {
    const num = digits(val('tPhone'));
    if (!PHONE.test(num)) return fail('Revisá el número.', $('#tPhone'));
    return `tel:${num}`;
}

// link de Maps y no geo:, la cámara de iOS no abre geo:
function readGeo() {
    const m = val('geo').match(/^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/);
    const lat = m && +m[1];
    const lng = m && +m[2];

    if (!m || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
        return fail('Usá el formato latitud, longitud. Ej: -34.6037, -58.3816', $('#geo'));
    }

    return `https://maps.google.com/?q=${lat},${lng}`;
}

function readEvent() {
    const title = val('eTitle');
    const start = $('#eStart').value;
    const end = $('#eEnd').value;

    if (!title) return fail('Ponele un título al evento.', $('#eTitle'));
    if (!start) return fail('Falta la fecha de inicio.', $('#eStart'));

    const from = new Date(start);
    const to = end ? new Date(end) : new Date(from.getTime() + 3600000);
    if (to <= from) return fail('El fin tiene que ser después del inicio.', $('#eEnd'));

    const stamp = (d) => d.toISOString().replace(/[-:]|\.\d{3}/g, '');
    const lines = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'BEGIN:VEVENT',
        `SUMMARY:${escText(title)}`,
        `DTSTART:${stamp(from)}`,
        `DTEND:${stamp(to)}`
    ];

    if (val('ePlace')) lines.push(`LOCATION:${escText(val('ePlace'))}`);
    if (val('eNotes')) lines.push(`DESCRIPTION:${escText(val('eNotes'))}`);
    lines.push('END:VEVENT', 'END:VCALENDAR');

    return lines.join('\r\n');
}

const readers = {
    url: readUrl,
    wifi: readWifi,
    contact: readContact,
    email: readEmail,
    sms: readSms,
    tel: readTel,
    geo: readGeo,
    event: readEvent
};

function setMode(next) {
    mode = next;

    document.querySelectorAll('.tab').forEach((tab) => {
        const on = tab.dataset.mode === mode;
        tab.classList.toggle('active', on);
        tab.setAttribute('aria-selected', on);
    });

    document.querySelectorAll('.panel').forEach((panel) => {
        panel.hidden = panel.dataset.mode !== mode;
    });

    $('#copy').hidden = mode !== 'url';
    $('#title').value = TITLES[mode];
    msg.textContent = '';
    result.hidden = true;
}

document.querySelectorAll('.tab').forEach((tab) => {
    tab.addEventListener('click', () => setMode(tab.dataset.mode));
});

$('#locate').addEventListener('click', () => {
    const geo = $('#geo');
    if (!navigator.geolocation) return fail('Tu navegador no comparte la ubicación.', geo);

    msg.classList.remove('ok');
    msg.textContent = 'Buscando ubicación...';

    navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
            geo.value = `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`;
            geo.removeAttribute('aria-invalid');
            notify('Ubicación lista.');
        },
        () => fail('No se pudo obtener tu ubicación. Pegala a mano.', geo)
    );
});

$('#show').addEventListener('change', (e) => {
    $('#pass').type = e.target.checked ? 'text' : 'password';
});

$('#security').addEventListener('change', (e) => {
    $('#pass').disabled = e.target.value === 'nopass';
});

form.addEventListener('input', (e) => {
    msg.textContent = '';
    e.target.removeAttribute('aria-invalid');
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
    $('#pass').type = 'password';
    $('#pass').disabled = false;
    msg.textContent = '';
    qr.replaceChildren();
    result.hidden = true;
    link = '';
    $(`.panel[data-mode="${mode}"] input`).focus();
});

$('#theme').addEventListener('click', () => {
    const theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = theme;
    localStorage.setItem('theme', theme);
});
