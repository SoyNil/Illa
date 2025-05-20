-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 20-05-2025 a las 06:11:07
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `base_sueldo`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `registro`
--

CREATE TABLE `registro` (
  `Nombre` text NOT NULL,
  `Apellido` text NOT NULL,
  `Usuario` varchar(10) NOT NULL,
  `Correo` varchar(50) NOT NULL,
  `Contrasena` varchar(255) NOT NULL,
  `ID` int(8) NOT NULL,
  `Ocupacion` int(1) NOT NULL,
  `token` varchar(32) DEFAULT NULL,
  `verificado` tinyint(1) DEFAULT 0,
  `fecha_registro` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `registro`
--

INSERT INTO `registro` (`Nombre`, `Apellido`, `Usuario`, `Correo`, `Contrasena`, `ID`, `Ocupacion`, `token`, `verificado`, `fecha_registro`) VALUES
('Nilton', 'Tolentino Rojas', 'Nil_14', 'nilton@gmail.com', 'nilton123', 1, 1, NULL, 0, '2024-12-16 17:55:59'),
('Angel', 'Lucas Andres', 'Angel_1', 'angel@gmail.com', 'angel123', 2, 2, NULL, 0, '2024-12-16 17:55:59'),
('Luis', 'Casemiro Duran', 'Luis_1', 'luis@gmail.com', '', 3, 2, NULL, 0, '2024-12-16 17:55:59'),
('Diego', 'Palomino Vargas', 'Diego_1', 'diego@gmail.com', 'diego123', 4, 2, NULL, 0, '2024-12-16 17:55:59'),
('Carlos', 'Villanueva Rojas', 'Carlos_12', 'carlos@gmail.com', '', 5, 2, NULL, 0, '2024-12-16 17:55:59'),
('Roberto', 'Lopez', 'Lucho', 'niltontolentinorojas41@gmail.com', 'nilton123', 10, 2, 'a5600eeff8319b6deb3b36c07af9c100', 0, '2024-12-16 17:56:28'),
('Carlos', 'Pepe', 'Carlitos_1', 'carlos123@gmail.com', '$2y$10$MNG3/i4sWYcx0eSOaDt6a.i0apzhfKRS7WMYYTO2JzKq.MGmn7Viu', 11, 2, '985cae50b42b01bb8905ad07699b0f6c', 0, '2025-05-19 23:04:29');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `registro`
--
ALTER TABLE `registro`
  ADD PRIMARY KEY (`ID`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `registro`
--
ALTER TABLE `registro`
  MODIFY `ID` int(8) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
