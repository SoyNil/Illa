<?php
session_start();
require_once 'conexion.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $nombre = $_POST['nombre'] ?? '';
    $usuario = $_POST['usuario'] ?? '';
    $correo = $_POST['correo'] ?? '';
    $contrasena = $_POST['contrasena'] ?? '';

    try {
        $stmt = $pdo->prepare("SELECT * FROM registro WHERE Nombre = ? AND Usuario = ? AND Correo = ? AND Contrasena = ?");
        $stmt->execute([$nombre, $usuario, $correo, $contrasena]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user) {
            $_SESSION['usuario'] = [
                'ID' => $user['ID'],
                'Nombre' => $user['Nombre'],
                'Usuario' => $user['Usuario'],
                'Correo' => $user['Correo'],
                'Ocupacion' => $user['Ocupacion']
            ];
            echo json_encode([
                'success' => true,
                'message' => 'Inicio de sesión exitoso',
                'usuario' => $user['Usuario'],
                'ocupacion' => $user['Ocupacion'],
                'id' => $user['ID'],
                'nombre' => $user['Nombre']
            ]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Credenciales incorrectas']);
        }
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
}
?>