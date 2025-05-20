<?php
session_start();
require_once 'conexion.php';

header('Content-Type: application/json');

file_put_contents('debug.log', "login: Iniciando login\n", FILE_APPEND);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $nombre = trim($_POST['nombre'] ?? '');
    $usuario = trim($_POST['usuario'] ?? '');
    $correo = trim($_POST['correo'] ?? '');
    $contrasena = $_POST['contrasena'] ?? '';

    file_put_contents('debug.log', "login: Datos recibidos - Nombre: '$nombre', Usuario: '$usuario', Correo: '$correo', Contrasena: [oculta]\n", FILE_APPEND);

    try {
        global $pdo;
        if (!$pdo) {
            throw new PDOException("No se pudo obtener la conexión PDO");
        }

        $stmt = $pdo->prepare("SELECT * FROM registro WHERE Nombre = ? AND Usuario = ? AND Correo = ?");
        $stmt->execute([$nombre, $usuario, $correo]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user) {
            $isHashed = preg_match('/^\$2y\$10\$/', $user['Contrasena']);
            $passwordMatch = $isHashed ? password_verify($contrasena, $user['Contrasena']) : ($contrasena === $user['Contrasena']);
            
            file_put_contents('debug.log', "login: Contraseña hasheada: " . ($isHashed ? 'Sí' : 'No') . ", Coincide: " . ($passwordMatch ? 'Sí' : 'No') . "\n", FILE_APPEND);

            if ($passwordMatch) {
                $_SESSION['usuario'] = [
                    'ID' => $user['ID'],
                    'Nombre' => $user['Nombre'],
                    'Apellido' => $user['Apellido'],
                    'Usuario' => $user['Usuario'],
                    'Correo' => $user['Correo'],
                    'Ocupacion' => $user['Ocupacion'],
                    'fecha_registro' => $user['fecha_registro']
                ];
                file_put_contents('debug.log', "login: Sesión configurada: " . print_r($_SESSION, true) . "\n", FILE_APPEND);
                echo json_encode([
                    'success' => true,
                    'message' => 'Inicio de sesión exitoso',
                    'usuario' => $user['Usuario'],
                    'ocupacion' => $user['Ocupacion'],
                    'id' => $user['ID'],
                    'nombre' => $user['Nombre']
                ]);
            } else {
                file_put_contents('debug.log', "login: Credenciales incorrectas\n", FILE_APPEND);
                echo json_encode(['success' => false, 'message' => 'Credenciales incorrectas']);
            }
        } else {
            file_put_contents('debug.log', "login: Usuario no encontrado\n", FILE_APPEND);
            echo json_encode(['success' => false, 'message' => 'Usuario no encontrado']);
        }
    } catch (PDOException $e) {
        file_put_contents('debug.log', "login: Error PDO: " . $e->getMessage() . "\n", FILE_APPEND);
        echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
    } catch (Throwable $e) {
        file_put_contents('debug.log', "login: Excepción general: " . $e->getMessage() . "\n", FILE_APPEND);
        echo json_encode(['success' => false, 'message' => 'Excepción: ' . $e->getMessage()]);
    }
} else {
    file_put_contents('debug.log', "login: Método no permitido\n", FILE_APPEND);
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
}
?>