<?php
session_start();
require_once 'conexion.php';

header('Content-Type: application/json');

file_put_contents('debug.log', "edit_user Session: " . print_r($_SESSION, true) . "\n", FILE_APPEND);

if (!isset($_SESSION['usuario']) || !isset($_SESSION['usuario']['ID']) || !isset($_SESSION['usuario']['Ocupacion']) || $_SESSION['usuario']['Ocupacion'] != 1) {
    file_put_contents('debug.log', "edit_user: Fallo en verificación de sesión\n", FILE_APPEND);
    echo json_encode(['success' => false, 'message' => 'No autorizado']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['id']) || !isset($input['Nombre']) || !isset($input['Apellido']) || 
    !isset($input['Usuario']) || !isset($input['Correo']) || !isset($input['Ocupacion'])) {
    echo json_encode(['success' => false, 'message' => 'Faltan datos requeridos']);
    exit;
}

$id = $input['id'];
$nombre = $input['Nombre'];
$apellido = $input['Apellido'];
$usuario = $input['Usuario'];
$correo = $input['Correo'];
$contrasena = isset($input['Contrasena']) ? $input['Contrasena'] : null;
$ocupacion = $input['Ocupacion'];

try {
    global $pdo; // Acceder a $pdo definido en conexion.php
    if (!$pdo) {
        throw new PDOException("No se pudo obtener la conexión PDO");
    }
    
    file_put_contents('debug.log', "edit_user: Conexión PDO obtenida\n", FILE_APPEND);

    // Validar correo único (excluyendo el usuario actual)
    $query = "SELECT ID FROM registro WHERE Correo = :correo AND ID != :id";
    $stmt = $pdo->prepare($query);
    $stmt->bindParam(':correo', $correo);
    $stmt->bindParam(':id', $id);
    $stmt->execute();
    if ($stmt->fetch()) {
        echo json_encode(['success' => false, 'message' => 'El correo ya está registrado']);
        exit;
    }

    // Validar usuario único (excluyendo el usuario actual)
    $query = "SELECT ID FROM registro WHERE Usuario = :usuario AND ID != :id";
    $stmt = $pdo->prepare($query);
    $stmt->bindParam(':usuario', $usuario);
    $stmt->bindParam(':id', $id);
    $stmt->execute();
    if ($stmt->fetch()) {
        echo json_encode(['success' => false, 'message' => 'El usuario ya está registrado']);
        exit;
    }

    // Preparar la consulta según si se proporciona contraseña
    if ($contrasena) {
        $query = "UPDATE registro SET Nombre = :nombre, Apellido = :apellido, Usuario = :usuario, 
                  Correo = :correo, Contrasena = :contrasena, Ocupacion = :ocupacion 
                  WHERE ID = :id";
        $stmt = $pdo->prepare($query);
        $stmt->bindParam(':contrasena', $contrasena); // En producción, usar password_hash()
    } else {
        $query = "UPDATE registro SET Nombre = :nombre, Apellido = :apellido, Usuario = :usuario, 
                  Correo = :correo, Ocupacion = :ocupacion 
                  WHERE ID = :id";
        $stmt = $pdo->prepare($query);
    }

    // Vincular parámetros comunes
    $stmt->bindParam(':nombre', $nombre);
    $stmt->bindParam(':apellido', $apellido);
    $stmt->bindParam(':usuario', $usuario);
    $stmt->bindParam(':correo', $correo);
    $stmt->bindParam(':ocupacion', $ocupacion, PDO::PARAM_INT);
    $stmt->bindParam(':id', $id, PDO::PARAM_INT);

    // Ejecutar la consulta
    $stmt->execute();

    // Verificar si se actualizó alguna fila
    if ($stmt->rowCount() > 0) {
        echo json_encode(['success' => true, 'message' => 'Usuario actualizado correctamente']);
    } else {
        echo json_encode(['success' => false, 'message' => 'No se encontró el usuario o no hubo cambios']);
    }
} catch (PDOException $e) {
    file_put_contents('debug.log', "edit_user: Error PDO: " . $e->getMessage() . "\n", FILE_APPEND);
    echo json_encode(['success' => false, 'message' => 'Error en la base de datos: ' . $e->getMessage()]);
} catch (Throwable $e) {
    file_put_contents('debug.log', "edit_user: Excepción general: " . $e->getMessage() . "\n", FILE_APPEND);
    echo json_encode(['success' => false, 'message' => 'Excepción: ' . $e->getMessage()]);
} finally {
    $pdo = null;
}
?>