<?php
session_start();
header('Content-Type: application/json');

if (isset($_SESSION['usuario'])) {
    echo json_encode(['success' => true, 'data' => [
        'ID' => $_SESSION['usuario']['ID'],
        'Nombre' => $_SESSION['usuario']['Nombre'],
        'Apellido' => $_SESSION['usuario']['Apellido'],
        'Usuario' => $_SESSION['usuario']['Usuario'],
        'Correo' => $_SESSION['usuario']['Correo'],
        'Ocupacion' => (string)$_SESSION['usuario']['Ocupacion'],
        'fecha_registro' => $_SESSION['usuario']['fecha_registro']
    ]]);
} else {
    echo json_encode(['success' => false, 'message' => 'No hay sesión activa']);
}
?>