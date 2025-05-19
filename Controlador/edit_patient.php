<?php
header('Content-Type: application/json');
require_once 'conexion.php';

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['id']) || !isset($data['dni']) || !isset($data['Nombre']) || !isset($data['Fecha']) || !isset($data['Precio'])) {
    echo json_encode(['success' => false, 'message' => 'Datos incompletos']);
    exit;
}

$id = $data['id'];
$dni = $data['dni'];
$nombre = $data['Nombre'];
$fecha = $data['Fecha'];
$precio = floatval($data['Precio']);
$descuento = isset($data['Descuento']) ? floatval($data['Descuento']) : null;
$usuario_id = isset($data['Usuario_ID']) ? intval($data['Usuario_ID']) : null;

$precio_descuento = $precio * (1 - ($descuento !== null ? $descuento / 100 : 0));

try {
    $query = "UPDATE pacientes SET DNI = ?, Nombre = ?, Fecha = ?, Precio = ?, Precio_Descuento = ?";
    $params = [$dni, $nombre, $fecha, $precio, $precio_descuento];

    if ($descuento !== null) {
        $query .= ", Descuento = ?";
        $params[] = $descuento;
    }

    if ($usuario_id !== null) {
        $query .= ", Usuario_ID = ?";
        $params[] = $usuario_id;
    }

    $query .= " WHERE ID = ?";
    $params[] = $id;

    $stmt = $pdo->prepare($query);
    $stmt->execute($params);

    echo json_encode(['success' => true]);

} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Error en el servidor: ' . $e->getMessage()]);
}
?>
