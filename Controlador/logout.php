<?php
session_start();  // Iniciamos la sesión

// Destruir todas las variables de sesión
$_SESSION = array();

// Destruir la sesión
session_destroy();

// Redirigir al login
header("Location: ../Vista/login.html");
exit;
?>
