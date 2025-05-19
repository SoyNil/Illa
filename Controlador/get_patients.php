<?php
session_start();
require_once 'conexion.php';

header('Content-Type: application/json');

if (!isset($_SESSION['usuario'])) {
    echo json_encode([]);
    exit;
}

$ocupacion = $_GET['ocupacion'] ?? '';
$userId = $_GET['userId'] ?? '';

try {
    if ($ocupacion == '1') {
        // Administrador: todos los pacientes con nombre del psicólogo
        $stmt = $pdo->query("
            SELECT p.ID, p.DNI, p.Nombre, p.Fecha, p.fecha_actual, p.Precio, p.Descuento, p.Precio_Descuento, 
                   p.Atendido, p.Historial_Clinico, r.Nombre AS Psicologo
            FROM pacientes p
            LEFT JOIN registro r ON p.Usuario_ID = r.ID
            ORDER BY p.Fecha DESC
        ");
    } else {
        // Psicólogo: solo pacientes asignados con nombre del psicólogo
        $stmt = $pdo->prepare("
            SELECT p.ID, p.DNI, p.Nombre, p.Fecha, p.fecha_actual, p.Precio, p.Descuento, p.Precio_Descuento, 
                   p.Atendido, p.Historial_Clinico, r.Nombre AS Psicologo
            FROM pacientes p
            LEFT JOIN registro r ON p.Usuario_ID = r.ID
            WHERE p.Usuario_ID = ?
            ORDER BY p.Fecha DESC
        ");
        $stmt->execute([$userId]);
    }
    $patients = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($patients);
} catch (PDOException $e) {
    echo json_encode([]);
}
?>