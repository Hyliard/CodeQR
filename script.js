

$(document).ready(function() {
    $('#generateBtn').click(function() {
        const link = $('#linkInput').val();
        $('#qrCode').empty(); // Limpiar el contenedor de código QR

        if (link) {
            $('#qrCode').qrcode({
                text: link,
                width: 128,
                height: 128
            });
        } else {
            alert('Por favor, ingresa un enlace.');
        }
    });
});
