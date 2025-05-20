<?php
header('Content-Type: application/json');

// Iniciar buffer para evitar salidas no deseadas
ob_start();

// Configurar logging de errores
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/php_errors.log');

try {
    // Incluir conexión
    if (!file_exists('conexion.php')) {
        throw new Exception('Archivo conexion.php no encontrado');
    }
    require_once 'conexion.php';

    // Obtener datos
    $data = json_decode(file_get_contents('php://input'), true);
    if (!isset($data['id'])) {
        ob_end_clean();
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'ID del aviso no proporcionado']);
        exit;
    }

    $id = intval($data['id']);

    // Verificar si el aviso existe
    $stmt = $pdo->prepare("SELECT id FROM avisos WHERE id = ?");
    $stmt->execute([$id]);
    if ($stmt->rowCount() === 0) {
        ob_end_clean();
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Aviso no encontrado']);
        exit;
    }

    // Eliminar aviso
    $stmt = $pdo->prepare("DELETE FROM avisos WHERE id = ?");
    $stmt->execute([$id]);

    ob_end_clean();
    echo json_encode(['success' => true]);

} catch (Exception $e) {
    ob_end_clean();
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error en el servidor: ' . $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine()
    ]);
}
?>