<?php
header('Content-Type: application/json; charset=utf-8');
require 'conexion.php';
require '../PHPMailer/src/Exception.php';
require '../PHPMailer/src/PHPMailer.php';
require '../PHPMailer/src/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Recibir datos JSON
$data = json_decode(file_get_contents('php://input'), true);
if (!$data) {
    echo json_encode(['success' => false, 'message' => 'Datos inválidos']);
    exit;
}

$usuario = trim($data['usuario'] ?? '');
$nombre = trim($data['nombre'] ?? '');
$apellido = trim($data['apellido'] ?? '');
$correo = trim($data['correo'] ?? '');
$contrasena = $data['contrasena'] ?? '';

if (!$usuario || !$nombre || !$apellido || !$correo || !$contrasena) {
    echo json_encode(['success' => false, 'message' => 'Faltan datos obligatorios']);
    exit;
}

try {
    // Verificar que usuario o correo no existan
    $sqlCheck = "SELECT COUNT(*) FROM registro WHERE Usuario = :usuario OR Correo = :correo";
    $stmt = $pdo->prepare($sqlCheck);
    $stmt->execute(['usuario' => $usuario, 'correo' => $correo]);
    if ($stmt->fetchColumn() > 0) {
        echo json_encode(['success' => false, 'message' => 'El usuario o correo ya están registrados']);
        exit;
    }

    // Generar nuevo ID
    $sqlMaxID = "SELECT MAX(ID) FROM registro";
    $maxID = $pdo->query($sqlMaxID)->fetchColumn();
    $idNuevo = $maxID ? $maxID + 1 : 1;

    // Hashear contraseña
    $contrasenaHash = password_hash($contrasena, PASSWORD_DEFAULT);

    // Generar token
    $token = bin2hex(random_bytes(16));

    // Insertar usuario
    $sqlInsert = "INSERT INTO registro (Nombre, Apellido, Usuario, Correo, Contrasena, ID, Ocupacion, token, verificado)
                  VALUES (:nombre, :apellido, :usuario, :correo, :contrasena, :id, 2, :token, 0)";
    $stmt = $pdo->prepare($sqlInsert);
    $stmt->execute([
        'nombre' => $nombre,
        'apellido' => $apellido,
        'usuario' => $usuario,
        'correo' => $correo,
        'contrasena' => $contrasenaHash,
        'id' => $idNuevo,
        'token' => $token,
    ]);

    // Preparar PHPMailer
    $mail = new PHPMailer(true);
    $debug_output = '';
    $mail->Debugoutput = function($str, $level) use (&$debug_output) {
        $debug_output .= $str . "\n";
    };
    $mail->SMTPDebug = 2;

    $mail->isSMTP();
    $mail->Host = 'smtp.gmail.com';
    $mail->SMTPAuth = true;
    $mail->Username = 'crackferna@gmail.com'; 
    $mail->Password = 'hshf djoq jnvs keuo'; 
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port = 587;

    $mail->setFrom('no-reply@tudominio.com', 'Tu App');
    $mail->addAddress($correo, $nombre);

    $mail->isHTML(true);
    $mail->Subject = 'Verificación de correo';
    $urlVerificacion = "http://tu-dominio.com/verificar.php?token=$token";

    $mail->Body = "
        <h1>Verificación de correo</h1>
        <p>Hola $nombre, gracias por registrarte.</p>
        <p>Por favor haz clic en el enlace para verificar tu correo:</p>
        <a href='$urlVerificacion'>Verificar correo</a>
    ";

    $mail->send();

    echo json_encode(['success' => true, 'message' => 'Usuario registrado, revisa tu correo para verificar']);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error al enviar correo o al registrar usuario: ' . $e->getMessage(),
        'debug' => $debug_output ?? ''
    ]);
}
