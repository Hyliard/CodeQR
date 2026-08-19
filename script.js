const form = document.querySelector('#qrForm');
const linkInput = document.querySelector('#linkInput');
const formMessage = document.querySelector('#formMessage');
const qrResult = document.querySelector('#qrResult');
const qrCode = document.querySelector('#qrCode');
const themeToggle = document.querySelector('#themeToggle');
const themeText = document.querySelector('#themeText');

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

        linkInput.value = url.href;
        qrCode.replaceChildren();
        new QRCode(qrCode, {
            text: url.href,
            width: 192,
            height: 192,
            colorDark: '#111827',
            colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel.H
        });
        qrResult.hidden = false;
        formMessage.textContent = 'Código QR generado correctamente.';
        formMessage.classList.add('success');
    } catch {
        showError('Escribe un enlace válido, por ejemplo: https://ejemplo.com');
        linkInput.focus();
    }
});

linkInput.addEventListener('input', clearMessage);

function applyTheme(isDark) {
    document.body.classList.toggle('dark', isDark);
    themeText.textContent = isDark ? 'Modo claro' : 'Modo oscuro';
    themeToggle.setAttribute('aria-label', isDark ? 'Activar modo claro' : 'Activar modo oscuro');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

const storedTheme = localStorage.getItem('theme');
applyTheme(storedTheme ? storedTheme === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches);
themeToggle.addEventListener('click', () => applyTheme(!document.body.classList.contains('dark')));
