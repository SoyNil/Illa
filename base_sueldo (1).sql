-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 20-05-2025 a las 08:06:17
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
-- Estructura de tabla para la tabla `avisos`
--

CREATE TABLE `avisos` (
  `id` int(11) NOT NULL,
  `Usuario_ID` int(11) NOT NULL,
  `usuario_nombre` varchar(255) NOT NULL,
  `aviso` text NOT NULL,
  `fecha` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `avisos`
--

INSERT INTO `avisos` (`id`, `Usuario_ID`, `usuario_nombre`, `aviso`, `fecha`) VALUES
(1, 1, 'Nil_14', 'Hola', '2024-11-30 18:56:28'),
(2, 1, 'Nil_14', 'Hola', '2024-11-30 18:58:30'),
(3, 1, 'Nil_14', 'Buenas noches', '2024-11-30 19:08:02'),
(10, 1, 'Nilton', 'Oña', '2025-05-19 11:01:24'),
(11, 2, 'Angel', 'Oña', '2025-05-19 11:01:43');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pacientes`
--

CREATE TABLE `pacientes` (
  `ID` int(11) NOT NULL,
  `DNI` varchar(8) NOT NULL,
  `Nombre` varchar(100) NOT NULL,
  `Fecha` date NOT NULL,
  `Precio` decimal(10,2) NOT NULL,
  `Descuento` decimal(5,2) DEFAULT 0.00,
  `Usuario_ID` int(11) NOT NULL,
  `Atendido` tinyint(1) NOT NULL DEFAULT 0,
  `Historial_Clinico` tinyint(1) NOT NULL DEFAULT 0,
  `Precio_Descuento` decimal(10,2) GENERATED ALWAYS AS (`Precio` * `Descuento` / 100) STORED,
  `fecha_actual` date DEFAULT curdate()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `pacientes`
--

INSERT INTO `pacientes` (`ID`, `DNI`, `Nombre`, `Fecha`, `Precio`, `Descuento`, `Usuario_ID`, `Atendido`, `Historial_Clinico`, `fecha_actual`) VALUES
(6, '98765432', 'Andres Caicedo', '2024-11-09', 89.50, 80.00, 3, 1, 1, '2024-11-27'),
(7, '45785948', 'Carla Andrea Barrios', '2024-12-25', 80.00, 60.00, 2, 1, 1, '2024-11-28'),
(8, '54648755', 'Eric Fabri', '2024-12-05', 155.00, 90.00, 2, 1, 1, '2024-11-30'),
(9, '96385274', 'Marcely Sanchez', '2024-12-25', 150.00, 60.00, 4, 1, 1, '2024-11-30'),
(10, '69856547', 'Lucia Sanchez', '2024-12-20', 48.00, 60.00, 1, 1, 1, '2024-12-06'),
(11, '84577487', 'Roberto Lucas', '2024-12-21', 60.00, 60.00, 5, 1, 0, '2024-12-06'),
(14, '12345678', 'Pepe Grillo', '2025-05-22', 100.00, 60.00, 1, 1, 0, '2025-05-19');

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
('Nilton', 'Tolentino Rojas', 'Nil_14', 'nilton@gmail.com', '$2y$10$gxUzeASmgbkIQwzU7lhhTONLi./RjI4tLpuet1mBLexFwRx0MVRnW', 1, 1, NULL, 0, '2024-12-16 17:55:59'),
('Angel', 'Lucas Andres', 'Angel_1', 'angel@gmail.com', '$2y$10$XWmI5mKPkJntHZx9dsEArOqxkACBCCWTWlSyeflqWC3cj2JsoRnTi', 2, 2, NULL, 0, '2024-12-16 17:55:59'),
('Luis', 'Casemiro Duran', 'Luis_1', 'luis@gmail.com', '$2y$10$cQWTULUG2Ncb/7KdvQMux.lAY7/rOLZ4pvYWt.xjua5EdumVpOzhS', 3, 2, NULL, 0, '2024-12-16 17:55:59'),
('Diego', 'Palomino Vargas', 'Diego_1', 'diego@gmail.com', '$2y$10$iKi46.aeYONHyvr3hJafcOOlEM22yZr.G3xu.8aVjfdIJseosKhcy', 4, 2, NULL, 0, '2024-12-16 17:55:59'),
('Carlos', 'Villanueva Rojas', 'Carlos_12', 'carlos@gmail.com', '$2y$10$umxK4uzNgBxG/FSpzJIFv.oF0iT2flj7K28Z03tvmpr6U8ZbTMcV2', 5, 2, NULL, 0, '2024-12-16 17:55:59'),
('Carlos', 'Pepe', 'Carlitos_1', 'carlos123@gmail.com', '$2y$10$MNG3/i4sWYcx0eSOaDt6a.i0apzhfKRS7WMYYTO2JzKq.MGmn7Viu', 11, 2, '985cae50b42b01bb8905ad07699b0f6c', 0, '2025-05-19 23:04:29');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `avisos`
--
ALTER TABLE `avisos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Usuario_ID` (`Usuario_ID`);

--
-- Indices de la tabla `pacientes`
--
ALTER TABLE `pacientes`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `fk_usuario_id` (`Usuario_ID`);

--
-- Indices de la tabla `registro`
--
ALTER TABLE `registro`
  ADD PRIMARY KEY (`ID`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `avisos`
--
ALTER TABLE `avisos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de la tabla `pacientes`
--
ALTER TABLE `pacientes`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT de la tabla `registro`
--
ALTER TABLE `registro`
  MODIFY `ID` int(8) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `avisos`
--
ALTER TABLE `avisos`
  ADD CONSTRAINT `avisos_ibfk_1` FOREIGN KEY (`Usuario_ID`) REFERENCES `registro` (`ID`) ON DELETE CASCADE;

--
-- Filtros para la tabla `pacientes`
--
ALTER TABLE `pacientes`
  ADD CONSTRAINT `fk_usuario_id` FOREIGN KEY (`Usuario_ID`) REFERENCES `registro` (`ID`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
