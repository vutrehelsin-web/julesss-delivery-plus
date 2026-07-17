-- ==========================================
-- PROYECTO: DELIVERYPLUS - DATABASE SCHEMA
-- MOTOR: MariaDB / MySQL (Local)
-- ==========================================

CREATE DATABASE IF NOT EXISTS `deliveryplus` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `deliveryplus`;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `calificaciones`;
DROP TABLE IF EXISTS `mensajes`;
DROP TABLE IF EXISTS `conversaciones`;
DROP TABLE IF EXISTS `ia_sugerencias`;
DROP TABLE IF EXISTS `clima_registros`;
DROP TABLE IF EXISTS `zonas_calientes`;
DROP TABLE IF EXISTS `productos_emprendedor`;
DROP TABLE IF EXISTS `categorias_emprendedor`;
DROP TABLE IF EXISTS `transacciones`;
DROP TABLE IF EXISTS `billeteras`;
DROP TABLE IF EXISTS `entregas_unicas`;
DROP TABLE IF EXISTS `turnos`;
DROP TABLE IF EXISTS `emprendedores`;
DROP TABLE IF EXISTS `comercios`;
DROP TABLE IF EXISTS `perfil_repartidor`;
DROP TABLE IF EXISTS `repartidores`;
DROP TABLE IF EXISTS `usuarios`;
DROP TABLE IF EXISTS `roles`;

-- 1. ROLES
CREATE TABLE `roles` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nombre` VARCHAR(50) NOT NULL UNIQUE,
  `descripcion` VARCHAR(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. USUARIOS
CREATE TABLE `usuarios` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `telefono` VARCHAR(30) DEFAULT NULL,
  `rol_id` INT NOT NULL,
  `activo` TINYINT(1) DEFAULT 1,
  FOREIGN KEY (`rol_id`) REFERENCES `roles` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. REPARTIDORES
CREATE TABLE `repartidores` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `usuario_id` INT NOT NULL UNIQUE,
  `nombre` VARCHAR(100) NOT NULL,
  `apellido` VARCHAR(100) NOT NULL,
  `tipo_vehiculo` ENUM('bicicleta', 'moto', 'auto') NOT NULL,
  `patente` VARCHAR(20) DEFAULT NULL,
  `latitud_actual` DECIMAL(10, 8) DEFAULT -34.603722,
  `longitud_actual` DECIMAL(11, 8) DEFAULT -58.381592,
  `disponible` TINYINT(1) DEFAULT 0,
  `verificado` TINYINT(1) DEFAULT 0,
  FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. PERFIL REPARTIDOR
CREATE TABLE `perfil_repartidor` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `repartidor_id` INT NOT NULL UNIQUE,
  `calificacion_promedio` DECIMAL(3, 2) DEFAULT 5.00,
  `total_entregas` INT DEFAULT 0,
  `entregas_a_tiempo` INT DEFAULT 0,
  `zona_principal` VARCHAR(150) DEFAULT 'Buenos Aires Centro',
  FOREIGN KEY (`repartidor_id`) REFERENCES `repartidores` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. COMERCIOS
CREATE TABLE `comercios` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `usuario_id` INT NOT NULL UNIQUE,
  `nombre_comercio` VARCHAR(150) NOT NULL,
  `direccion` VARCHAR(255) NOT NULL,
  `latitud` DECIMAL(10, 8) NOT NULL,
  `longitud` DECIMAL(11, 8) NOT NULL,
  `horario_apertura` TIME DEFAULT '08:00:00',
  `horario_cierre` TIME DEFAULT '23:59:00',
  FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. EMPRENDEDORES
CREATE TABLE `emprendedores` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `usuario_id` INT NOT NULL UNIQUE,
  `nombre_emprendimiento` VARCHAR(150) NOT NULL,
  `rubro` VARCHAR(100) NOT NULL,
  `descripcion` TEXT DEFAULT NULL,
  `historia_familiar` TEXT DEFAULT NULL,
  `direccion` VARCHAR(255) NOT NULL,
  `latitud` DECIMAL(10, 8) NOT NULL,
  `longitud` DECIMAL(11, 8) NOT NULL,
  FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. TURNOS
CREATE TABLE `turnos` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `comercio_id` INT NOT NULL,
  `repartidor_id` INT DEFAULT NULL,
  `fecha` DATE NOT NULL,
  `hora_inicio` TIME NOT NULL,
  `hora_fin` TIME NOT NULL,
  `monto_total` DECIMAL(10,2) NOT NULL,
  `monto_repartidor` DECIMAL(10,2) NOT NULL, -- 80%
  `monto_plataforma` DECIMAL(10,2) NOT NULL, -- 20%
  `estado` ENUM('disponible', 'confirmado', 'en_progreso', 'completado', 'cancelado') DEFAULT 'disponible',
  FOREIGN KEY (`comercio_id`) REFERENCES `comercios` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`repartidor_id`) REFERENCES `repartidores` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. ENTREGAS UNICAS
CREATE TABLE `entregas_unicas` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `emprendedor_id` INT NOT NULL,
  `repartidor_id` INT DEFAULT NULL,
  `direccion_origen` VARCHAR(255) NOT NULL,
  `direccion_destino` VARCHAR(255) NOT NULL,
  `tamano_paquete` ENUM('pequeño', 'mediano', 'grande') DEFAULT 'mediano',
  `monto_total` DECIMAL(10,2) NOT NULL,
  `monto_repartidor` DECIMAL(10,2) NOT NULL, -- 80%
  `monto_plataforma` DECIMAL(10,2) NOT NULL, -- 20%
  `estado` ENUM('disponible', 'asignado', 'recolectado', 'en_camino', 'entregado', 'fallido') DEFAULT 'disponible',
  FOREIGN KEY (`emprendedor_id`) REFERENCES `emprendedores` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`repartidor_id`) REFERENCES `repartidores` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. BILLETERAS
CREATE TABLE `billeteras` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `usuario_id` INT NOT NULL UNIQUE,
  `saldo` DECIMAL(12,2) DEFAULT 0.00,
  FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 10. TRANSACCIONES
CREATE TABLE `transacciones` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `usuario_id` INT NOT NULL,
  `tipo` ENUM('ingreso_turno', 'ingreso_entrega', 'comision_plataforma', 'retiro', 'deposito') NOT NULL,
  `monto` DECIMAL(10,2) NOT NULL,
  `saldo_anterior` DECIMAL(12,2) NOT NULL,
  `saldo_posterior` DECIMAL(12,2) NOT NULL,
  `referencia` VARCHAR(100) DEFAULT NULL,
  `fecha` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 11. CATEGORIAS EMPRENDEDOR
CREATE TABLE `categorias_emprendedor` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `emprendedor_id` INT NOT NULL,
  `nombre` VARCHAR(100) NOT NULL,
  FOREIGN KEY (`emprendedor_id`) REFERENCES `emprendedores` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 12. PRODUCTOS EMPRENDEDOR
CREATE TABLE `productos_emprendedor` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `emprendedor_id` INT NOT NULL,
  `categoria_id` INT NOT NULL,
  `nombre` VARCHAR(150) NOT NULL,
  `descripcion` TEXT DEFAULT NULL,
  `precio` DECIMAL(10,2) NOT NULL,
  `imagen_url` VARCHAR(255) DEFAULT NULL,
  `stock` INT DEFAULT 0,
  `disponible` TINYINT(1) DEFAULT 1,
  FOREIGN KEY (`emprendedor_id`) REFERENCES `emprendedores` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`categoria_id`) REFERENCES `categorias_emprendedor` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 13. ZONAS CALIENTES
CREATE TABLE `zonas_calientes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nombre_zona` VARCHAR(100) NOT NULL,
  `latitud` DECIMAL(10, 8) NOT NULL,
  `longitud` DECIMAL(11, 8) NOT NULL,
  `radio_km` DECIMAL(4,2) DEFAULT 1.5,
  `nivel_demanda` ENUM('bajo', 'medio', 'alto', 'critico') DEFAULT 'medio'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;

-- SEED DATA
INSERT INTO `roles` (`id`, `nombre`, `descripcion`) VALUES
(1, 'Administrador', 'Supervisa la plataforma'),
(2, 'Comercio', 'Contrata por bloques de 4 horas'),
(3, 'Emprendedor', 'Contrata entregas individuales'),
(4, 'Repartidor', 'Socio de reparto B2B');

INSERT INTO `usuarios` (`id`, `email`, `password_hash`, `telefono`, `rol_id`, `activo`) VALUES
(1, 'admin@deliveryplus.com', '$2a$10$vYg/Z7K.L9v67F0p8ZEn9.M8K23qYvVvjVjOQvWwA1uOn5vXvR8Z2', '+541155551111', 1, 1),
(2, 'repartidor@test.com', '$2a$10$vYg/Z7K.L9v67F0p8ZEn9.M8K23qYvVvjVjOQvWwA1uOn5vXvR8Z2', '+541177772222', 4, 1),
(3, 'trattoria@comercio.com', '$2a$10$vYg/Z7K.L9v67F0p8ZEn9.M8K23qYvVvjVjOQvWwA1uOn5vXvR8Z2', '+541133334444', 2, 1),
(4, 'nona@emprendedor.com', '$2a$10$vYg/Z7K.L9v67F0p8ZEn9.M8K23qYvVvjVjOQvWwA1uOn5vXvR8Z2', '+541144446666', 3, 1);

INSERT INTO `repartidores` (`id`, `usuario_id`, `nombre`, `apellido`, `tipo_vehiculo`, `patente`, `latitud_actual`, `longitud_actual`, `disponible`, `verificado`) VALUES
(1, 2, 'Carlos', 'Gómez', 'moto', '99A-XYZ8', -34.598200, -58.421100, 1, 1);

INSERT INTO `perfil_repartidor` (`id`, `repartidor_id`, `calificacion_promedio`, `total_entregas`, `entregas_a_tiempo`, `zona_principal`) VALUES
(1, 1, 4.92, 420, 412, 'Palermo & Recoleta');

INSERT INTO `comercios` (`id`, `usuario_id`, `nombre_comercio`, `direccion`, `latitud`, `longitud`) VALUES
(1, 3, 'La Trattoria', 'Av. Santa Fe 2345, Palermo', -34.591200, -58.411100);

INSERT INTO `emprendedores` (`id`, `usuario_id`, `nombre_emprendimiento`, `rubro`, `descripcion`, `historia_familiar`, `direccion`, `latitud`, `longitud`) VALUES
(1, 4, 'Pastas de la Nona', 'Gastronomía Artesanal', 'Pastas caseras frescas receta italiana de 1948.', 'Nuestra abuela Filomena amaba cocinar. Seguimos su legado con la misma tabla de madera.', 'Serrano 1230, Villa Crespo', -34.595600, -58.435000);

INSERT INTO `billeteras` (`id`, `usuario_id`, `saldo`) VALUES
(1, 1, 5000.00),
(2, 2, 24000.00),
(3, 3, 15000.00),
(4, 4, 6000.00);

INSERT INTO `transacciones` (`id`, `usuario_id`, `tipo`, `monto`, `saldo_anterior`, `saldo_posterior`, `referencia`) VALUES
(1, 2, 'ingreso_turno', 12000.00, 12000.00, 24000.00, 'turno_1'),
(2, 1, 'comision_plataforma', 3000.00, 2000.00, 5000.00, 'turno_1');

INSERT INTO `turnos` (`id`, `comercio_id`, `repartidor_id`, `fecha`, `hora_inicio`, `hora_fin`, `monto_total`, `monto_repartidor`, `monto_plataforma`, `estado`) VALUES
(1, 1, NULL, CURDATE(), '20:00:00', '23:59:59', 15000.00, 12000.00, 3000.00, 'disponible');

INSERT INTO `entregas_unicas` (`id`, `emprendedor_id`, `repartidor_id`, `direccion_origen`, `direccion_destino`, `tamano_paquete`, `monto_total`, `monto_repartidor`, `monto_plataforma`, `estado`) VALUES
(1, 1, NULL, 'Serrano 1230, Villa Crespo', 'Av. Scalabrini Ortiz 2800, Palermo', 'mediano', 3500.00, 2800.00, 700.00, 'disponible');

INSERT INTO `zonas_calientes` (`id`, `nombre_zona`, `latitud`, `longitud`, `radio_km`, `nivel_demanda`) VALUES
(1, 'Zona Comercial Palermo', -34.591200, -58.411100, 1.80, 'alto'),
(2, 'Área Residencial Belgrano', -34.562000, -58.456000, 2.00, 'critico');
