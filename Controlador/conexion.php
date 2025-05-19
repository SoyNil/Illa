<?php
$host = 'localhost';
$dbname = 'base_sueldo';
$username = 'root'; // Cambia si usas otro usuario
$password = ''; // Cambia si tienes una contraseña

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    // Podrías lanzar la excepción para capturarla luego,
    // o definir una variable global que controle el error.
    throw new Exception("Error de conexión: " . $e->getMessage());
}
?>