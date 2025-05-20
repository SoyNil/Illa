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

    // Obtener avisos
    $stmt = $pdo->query("SELECT id, Usuario_ID, usuario_nombre, aviso, fecha FROM avisos ORDER BY fecha DESC");
    $notices = $stmt->fetchAll(PDO::FETCH_ASSOC);

    ob_end_clean();
    echo json_encode($notices);

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