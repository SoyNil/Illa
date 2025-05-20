<?php
header('Content-Type: application/json; charset=utf-8');
require_once 'conexion.php';

error_log("Iniciando add_notice.php");

try {
    $data = json_decode(file_get_contents('php://input'), true);

    if (json_last_error() !== JSON_ERROR_NONE) {
        error_log("Error al decodificar JSON: " . json_last_error_msg());
        echo json_encode(['success' => false, 'message' => 'JSON inválido']);
        http_response_code(400);
        exit;
    }

    error_log("Datos recibidos: " . print_r($data, true));

    if (!isset($data['Usuario_ID']) || !isset($data['usuario_nombre']) || !isset($data['aviso'])) {
        error_log("Datos incompletos: " . print_r($data, true));
        echo json_encode(['success' => false, 'message' => 'Datos incompletos']);
        http_response_code(400);
        exit;
    }

    $usuario_id = $data['Usuario_ID'];
    $usuario_nombre = $data['usuario_nombre'];
    $aviso = trim($data['aviso']);

    if (empty($usuario_id) || empty($usuario_nombre) || empty($aviso)) {
        error_log("Campos vacíos: Usuario_ID=$usuario_id, usuario_nombre=$usuario_nombre, aviso=$aviso");
        echo json_encode(['success' => false, 'message' => 'Todos los campos son requeridos']);
        http_response_code(400);
        exit;
    }

    if (!is_numeric($usuario_id)) {
        error_log("Usuario_ID no es numérico: $usuario_id");
        echo json_encode(['success' => false, 'message' => 'Usuario_ID debe ser un número']);
        http_response_code(400);
        exit;
    }

    $sql = "INSERT INTO avisos (Usuario_ID, usuario_nombre, aviso, fecha) VALUES (:usuario_id, :usuario_nombre, :aviso, NOW())";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':usuario_id' => $usuario_id,
        ':usuario_nombre' => $usuario_nombre,
        ':aviso' => $aviso
    ]);

    if ($stmt->rowCount() > 0) {
        error_log("Aviso insertado correctamente: Usuario_ID=$usuario_id, usuario_nombre=$usuario_nombre");
        echo json_encode(['success' => true, 'message' => 'Aviso agregado correctamente']);
        http_response_code(200);
    } else {
        error_log("No se insertó el aviso: Usuario_ID=$usuario_id");
        echo json_encode(['success' => false, 'message' => 'No se pudo agregar el aviso']);
        http_response_code(500);
    }
} catch (PDOException $e) {
    error_log("Error de base de datos: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Error en la base de datos: ' . $e->getMessage()]);
    http_response_code(500);
} catch (Exception $e) {
    error_log("Error general: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Error del servidor: ' . $e->getMessage()]);
    http_response_code(500);
}
?>