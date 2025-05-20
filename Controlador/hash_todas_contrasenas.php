<?php
require 'conexion.php';

try {
    // Obtener todos los usuarios
    $stmt = $pdo->query("SELECT ID, Nombre, Contrasena FROM registro");
    $usuarios = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($usuarios as $usuario) {
        $id = $usuario['ID'];
        $nombre = $usuario['Nombre'];
        $contrasenaActual = $usuario['Contrasena'];

        // Si ya está hasheada (empieza con $2y$) no hacemos nada
        if (str_starts_with($contrasenaActual, '$2y$')) {
            continue;
        }

        // Si está vacía, asignamos 'nombre123'
        if (empty($contrasenaActual)) {
            $nuevaContrasena = strtolower($nombre) . '123';
        } else {
            $nuevaContrasena = $contrasenaActual;
        }

        // Hasheamos la contraseña
        $contrasenaHash = password_hash($nuevaContrasena, PASSWORD_DEFAULT);

        // Actualizamos en la base de datos
        $update = $pdo->prepare("UPDATE registro SET Contrasena = :hash WHERE ID = :id");
        $update->execute(['hash' => $contrasenaHash, 'id' => $id]);

        echo "✅ Usuario ID $id actualizado.\n";
    }

    echo "✔️ Todas las contraseñas fueron hasheadas correctamente.\n";

} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage();
}
?>
