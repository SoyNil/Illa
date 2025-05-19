<?php
header('Content-Type: application/json');

// Asegurar zona horaria correcta
date_default_timezone_set('America/Lima');

// Iniciar buffer para evitar salidas no deseadas
ob_start();

// Configurar logging de errores
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/php_errors.log');

try {
    // Incluir conexión con verificación
    $conexion_path = __DIR__ . '/conexion.php';
    if (!file_exists($conexion_path)) {
        throw new Exception('Archivo conexion.php no encontrado en: ' . $conexion_path);
    }
    require_once $conexion_path;

    if (!isset($pdo)) {
        throw new Exception("No se pudo establecer la conexión con la base de datos.");
    }

    // Obtener datos
    $data = json_decode(file_get_contents('php://input'), true);
    if (!isset($data['dni']) || !isset($data['Nombre']) || !isset($data['Fecha']) || 
        !isset($data['Precio']) || !isset($data['Descuento']) || !isset($data['Usuario_ID'])) {
        ob_end_clean();
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Datos incompletos']);
        exit;
    }

    $dni = $data['dni'];
    $nombre = $data['Nombre'];
    $fecha = $data['Fecha'];
    $precio = floatval($data['Precio']);
    $descuento = floatval($data['Descuento']);
    $usuario_id = intval($data['Usuario_ID']);
    $fecha_actual = date('Y-m-d');
    $precio_descuento = $precio * (1 - $descuento / 100);

    // Validar DNI
    if (!preg_match('/^\d{8}$/', $dni)) {
        ob_end_clean();
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'El DNI debe tener 8 dígitos numéricos']);
        exit;
    }

    // Verificar si el psicólogo existe
    $stmt = $pdo->prepare("SELECT ID FROM registro WHERE ID = ? AND Ocupacion IN (1, 2)");
    $stmt->execute([$usuario_id]);
    if ($stmt->rowCount() === 0) {
        ob_end_clean();
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Psicólogo no encontrado']);
        exit;
    }

    // Insertar paciente
    $stmt = $pdo->prepare("INSERT INTO pacientes (DNI, Nombre, Fecha, fecha_actual, Precio, Descuento, Precio_Descuento, Usuario_ID, Atendido, Historial_Clinico) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 0)");
    $stmt->execute([$dni, $nombre, $fecha, $fecha_actual, $precio, $descuento, $precio_descuento, $usuario_id]);

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