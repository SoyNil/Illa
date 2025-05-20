<?php
session_start();
require_once 'conexion.php';

header('Content-Type: application/json');

// Depuración de sesión
file_put_contents('debug.log', "Session: " . print_r($_SESSION, true) . "\n", FILE_APPEND);

// Verificar sesión
if (!isset($_SESSION['usuario']) || !isset($_SESSION['usuario']['ID']) || !isset($_SESSION['usuario']['Ocupacion']) || $_SESSION['usuario']['Ocupacion'] != 1) {
    file_put_contents('debug.log', "Fallo en verificación de sesión\n", FILE_APPEND);
    echo json_encode(['success' => false, 'message' => 'No autorizado']);
    exit;
}

try {
    file_put_contents('debug.log', "Usando conexión PDO\n", FILE_APPEND);
    global $pdo; // Acceder a $pdo definido en conexion.php
    if (!$pdo) {
        throw new PDOException("No se pudo obtener la conexión PDO");
    }

    $query = "SELECT ID, Nombre, Apellido, Correo, fecha_registro, Usuario, Ocupacion FROM registro";
    file_put_contents('debug.log', "Preparando consulta: $query\n", FILE_APPEND);
    $stmt = $pdo->prepare($query);
    file_put_contents('debug.log', "Ejecutando consulta\n", FILE_APPEND);
    $stmt->execute();
    file_put_contents('debug.log', "Consulta ejecutada, obteniendo resultados\n", FILE_APPEND);
    $usuarios = $stmt->fetchAll(PDO::FETCH_ASSOC);

    file_put_contents('debug.log', "Resultados obtenidos: " . count($usuarios) . " usuarios\n", FILE_APPEND);
    echo json_encode($usuarios);
} catch (PDOException $e) {
    file_put_contents('debug.log', "Error PDO: " . $e->getMessage() . "\n", FILE_APPEND);
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error en la consulta: ' . $e->getMessage()]);
} catch (Throwable $e) {
    file_put_contents('debug.log', "Excepción general: " . $e->getMessage() . "\n", FILE_APPEND);
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Excepción: ' . $e->getMessage()]);
} finally {
    $pdo = null; // Cerrar la conexión
}
?>