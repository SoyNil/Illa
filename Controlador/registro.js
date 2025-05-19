document.addEventListener('DOMContentLoaded', () => {
    // Verificar si hay sesión iniciada
    const sesion = sessionStorage.getItem('Usuario');
    if (!sesion) {
        window.location.href = 'login.html';
        return;
    }

    document.getElementById('registroForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const usuario = document.getElementById('usuario').value.trim();
        const nombre = document.getElementById('nombre').value.trim();
        const apellido = document.getElementById('apellido').value.trim();
        const correo = document.getElementById('correo').value.trim();
        const contrasena = document.getElementById('contrasena').value;
        const confirmar = document.getElementById('confirmarContrasena').value;

        if (contrasena !== confirmar) {
            alert('Las contraseñas no coinciden.');
            return;
        }

        try {
            const response = await fetch('../Controlador/registrar_usuario.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    usuario,
                    nombre,
                    apellido,
                    correo,
                    contrasena
                })
            });

            const text = await response.text();
            let result;
            try {
                result = JSON.parse(text);
            } catch {
                alert('Respuesta no es JSON válido del servidor:\n' + text);
                return;
            }
            if (result.success) {
                alert('Psicólogo registrado exitosamente');
                window.location.href = 'principal.html';
            } else {
                // Mostrar mensaje de error y detalles si existen
                let msg = 'Error: ' + result.message;
                if (result.exception) {
                    msg += '\nDetalles técnicos: ' + result.exception;
                }
                if (result.debug) {
                    msg += '\nDebug SMTP:\n' + result.debug;
                }
                alert(msg);
            }
        } catch (error) {
            alert('Error al conectar con el servidor: ' + error.message);
        }
    });
});
