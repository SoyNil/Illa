<?php
session_start();
header('Content-Type: application/json');

if (isset($_SESSION['usuario'])) {
    // Asegurar que Ocupacion se devuelva como cadena
    echo json_encode(['success' => true, 'data' => [
        'ID' => $_SESSION['usuario']['ID'],
        'Nombre' => $_SESSION['usuario']['Nombre'],
        'Usuario' => $_SESSION['usuario']['Usuario'],
        'Correo' => $_SESSION['usuario']['Correo'],
        'Ocupacion' => (string)$_SESSION['usuario']['Ocupacion']
    ]]);
} else {
    echo json_encode(['success' => false, 'message' => 'No hay sesión activa']);
}
?>