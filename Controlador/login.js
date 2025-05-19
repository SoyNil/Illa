document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    
    try {
        const response = await fetch('../Controlador/login.php', {
            method: 'POST',
            body: formData
        });
        const result = await response.json();

        if (result.success) {
            if (result.success) {
            alert(result.message);
            sessionStorage.setItem('Usuario', result.usuario);
            sessionStorage.setItem('Ocupacion', result.ocupacion);
            sessionStorage.setItem('ID', result.id);
            sessionStorage.setItem('Nombre', result.nombre);
            window.location.href = 'principal.html';
        }
        } else {
            alert(result.message);
        }
    } catch (error) {
        alert('Error al conectar con el servidor');
    }
});
