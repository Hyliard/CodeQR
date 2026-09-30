const form = document.querySelector('#qrForm');
const linkInput = document.querySelector('#linkInput');
const formMessage = document.querySelector('#formMessage');
const qrResult = document.querySelector('#qrResult');
const qrCode = document.querySelector('#qrCode');
const qrUrl = document.querySelector('#qrUrl');
const downloadButton = document.querySelector('#downloadButton');
const copyButton = document.querySelector('#copyButton');
const resetButton = document.querySelector('#resetButton');
const themeToggle = document.querySelector('#themeToggle');
let currentLink = '';

function normalizeUrl(value) {
    const trimmed = value.trim();
    if (!trimmed) return '';
    return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function showError(message) {
    formMessage.textContent = message;
    formMessage.classList.remove('success');
    linkInput.setAttribute('aria-invalid', 'true');
    qrResult.hidden = true;
}

function clearMessage() {
    formMessage.textContent = '';
    formMessage.classList.remove('success');
    linkInput.removeAttribute('aria-invalid');
}

form.addEventListener('submit', (event) => {
    event.preventDefault();
    clearMessage();
    const link = normalizeUrl(linkInput.value);

    if (!link) {
        showError('Ingresa un enlace para generar el código QR.');
        linkInput.focus();
        return;
    }

    try {
        const url = new URL(link);
        if (!['http:', 'https:'].includes(url.protocol)) throw new Error();
        if (typeof QRCode === 'undefined') {
            showError('No se pudo cargar el generador QR. Recarga la página e inténtalo otra vez.');
            return;
        }

        currentLink = url.href;
        linkInput.value = currentLink;
        qrCode.replaceChildren();
        // Oscuro sobre blanco en ambos temas para que siempre sea escaneable
        new QRCode(qrCode, {
            text: currentLink,
            width: 512,
            height: 512,
            colorDark: '#0f172a',
            colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel.H
        });
        qrUrl.textContent = currentLink;
        qrResult.hidden = false;
        formMessage.textContent = 'Código QR generado correctamente.';
        formMessage.classList.add('success');
    } catch {
        showError('Escribe un enlace válido, por ejemplo: https://ejemplo.com');
        linkInput.focus();
    }
});

linkInput.addEventListener('input', clearMessage);

downloadButton.addEventListener('click', () => {
    const canvas = qrCode.querySelector('canvas');
    const img = qrCode.querySelector('img');
    const source = canvas ? canvas.toDataURL('image/png') : img?.src;
    if (!source) return;

    const anchor = document.createElement('a');
    anchor.href = source;
    anchor.download = 'codigo-qr.png';
    anchor.click();
});

copyButton.addEventListener('click', async () => {
    try {
        await navigator.clipboard.writeText(currentLink);
        formMessage.textContent = 'Enlace copiado al portapapeles.';
        formMessage.classList.add('success');
    } catch {
        showError('No se pudo copiar el enlace.');
        qrResult.hidden = false;
    }
});

resetButton.addEventListener('click', () => {
    form.reset();
    clearMessage();
    qrCode.replaceChildren();
    qrResult.hidden = true;
    currentLink = '';
    linkInput.focus();
});

function applyTheme(isDark) {
    document.documentElement.dataset.theme = isDark ? 'dark' : 'light';
    themeToggle.setAttribute('aria-checked', String(isDark));
    themeToggle.title = isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro';
}

applyTheme(document.documentElement.dataset.theme === 'dark');
themeToggle.addEventListener('click', () => {
    const isDark = document.documentElement.dataset.theme !== 'dark';
    applyTheme(isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
});
