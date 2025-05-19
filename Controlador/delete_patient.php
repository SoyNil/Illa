<?php
header('Content-Type: application/json');

// Configuración de errores
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/php_errors.log');
error_reporting(E_ALL);

require_once 'conexion.php';

try {
    $data = json_decode(file_get_contents('php://input'), true);
    if (!isset($data['id'])) {
        throw new Exception('ID de paciente no proporcionado');
    }

    $id = $data['id'];

    // Usamos PDO en lugar de MySQLi
    $stmt = $pdo->prepare("DELETE FROM pacientes WHERE ID = :id");
    $stmt->bindParam(':id', $id, PDO::PARAM_INT);

    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => 'No se pudo eliminar el paciente.']);
    }
} catch (Exception $e) {
    error_log('Error en delete_patient.php: ' . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Error interno del servidor']);
}
?>
