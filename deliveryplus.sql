-- DELIVEY PLUS - ESQUEMA OFICIAL PARA POSTGRESQL / SUPABASE
-- Con marcas de idempotencia (DROP IF EXISTS)

-- Habilitar extensiones necesarias si aplica
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Desactivar llaves foráneas temporalmente en Postgres
SET session_replication_role = 'replica';

DROP TABLE IF EXISTS zonas_calientes CASCADE;
DROP TABLE IF EXISTS productos_emprendedor CASCADE;
DROP TABLE IF EXISTS categorias_emprendedor CASCADE;
DROP TABLE IF EXISTS transacciones CASCADE;
DROP TABLE IF EXISTS billeteras CASCADE;
DROP TABLE IF EXISTS entregas_unicas CASCADE;
DROP TABLE IF EXISTS turnos CASCADE;
DROP TABLE IF EXISTS emprendedores CASCADE;
DROP TABLE IF EXISTS comercios CASCADE;
DROP TABLE IF EXISTS perfil_repartidor CASCADE;
DROP TABLE IF EXISTS repartidores CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

-- Reactivar llaves foráneas
SET session_replication_role = 'origin';

-- 1. ROLES
CREATE TABLE roles (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL UNIQUE,
  descripcion VARCHAR(255) DEFAULT NULL
);

-- 2. USUARIOS
CREATE TABLE usuarios (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  telefono VARCHAR(30) DEFAULT NULL,
  rol_id INT NOT NULL REFERENCES roles(id),
  activo BOOLEAN DEFAULT TRUE
);

-- 3. REPARTIDORES
CREATE TABLE repartidores (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  usuario_id INT NOT NULL UNIQUE REFERENCES usuarios(id) ON DELETE CASCADE,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  tipo_vehiculo VARCHAR(20) NOT NULL CHECK (tipo_vehiculo IN ('bicicleta', 'moto', 'auto')),
  patente VARCHAR(20) DEFAULT NULL,
  latitud_actual NUMERIC(10, 8) DEFAULT -34.603722,
  longitud_actual NUMERIC(11, 8) DEFAULT -58.381592,
  disponible BOOLEAN DEFAULT FALSE,
  verificado BOOLEAN DEFAULT FALSE
);

-- 4. PERFIL REPARTIDOR
CREATE TABLE perfil_repartidor (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  repartidor_id INT NOT NULL UNIQUE REFERENCES repartidores(id) ON DELETE CASCADE,
  calificacion_promedio NUMERIC(3, 2) DEFAULT 5.00,
  total_entregas INT DEFAULT 0,
  entregas_a_tiempo INT DEFAULT 0,
  zona_principal VARCHAR(150) DEFAULT 'Buenos Aires Centro'
);

-- 5. COMERCIOS
CREATE TABLE comercios (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  usuario_id INT NOT NULL UNIQUE REFERENCES usuarios(id) ON DELETE CASCADE,
  nombre_comercio VARCHAR(150) NOT NULL,
  direccion VARCHAR(255) NOT NULL,
  latitud NUMERIC(10, 8) NOT NULL,
  longitud NUMERIC(11, 8) NOT NULL,
  horario_apertura TIME DEFAULT '08:00:00',
  horario_cierre TIME DEFAULT '23:59:00'
);

-- 6. EMPRENDEDORES
CREATE TABLE emprendedores (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  usuario_id INT NOT NULL UNIQUE REFERENCES usuarios(id) ON DELETE CASCADE,
  nombre_emprendimiento VARCHAR(150) NOT NULL,
  rubro VARCHAR(100) NOT NULL,
  descripcion TEXT DEFAULT NULL,
  historia_familiar TEXT DEFAULT NULL,
  direccion VARCHAR(255) NOT NULL,
  latitud NUMERIC(10, 8) NOT NULL,
  longitud NUMERIC(11, 8) NOT NULL
);

-- 7. TURNOS (Bloques de 4 horas B2B)
CREATE TABLE turnos (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  comercio_id INT NOT NULL REFERENCES comercios(id) ON DELETE CASCADE,
  repartidor_id INT DEFAULT NULL REFERENCES repartidores(id) ON DELETE SET NULL,
  fecha DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  monto_total NUMERIC(10,2) NOT NULL,
  monto_repartidor NUMERIC(10,2) NOT NULL, -- 80%
  monto_plataforma NUMERIC(10,2) NOT NULL, -- 20%
  estado VARCHAR(20) DEFAULT 'disponible' CHECK (estado IN ('disponible', 'confirmado', 'en_progreso', 'completado', 'cancelado'))
);

-- 8. ENTREGAS UNICAS
CREATE TABLE entregas_unicas (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  emprendedor_id INT NOT NULL REFERENCES emprendedores(id) ON DELETE CASCADE,
  repartidor_id INT DEFAULT NULL REFERENCES repartidores(id) ON DELETE SET NULL,
  direccion_origen VARCHAR(255) NOT NULL,
  direccion_destino VARCHAR(255) NOT NULL,
  tamano_paquete VARCHAR(20) DEFAULT 'mediano' CHECK (tamano_paquete IN ('pequeño', 'mediano', 'grande')),
  monto_total NUMERIC(10,2) NOT NULL,
  monto_repartidor NUMERIC(10,2) NOT NULL, -- 80%
  monto_plataforma NUMERIC(10,2) NOT NULL, -- 20%
  estado VARCHAR(20) DEFAULT 'disponible' CHECK (estado IN ('disponible', 'asignado', 'recolectado', 'en_camino', 'entregado', 'fallido'))
);

-- 9. BILLETERAS
CREATE TABLE billeteras (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  usuario_id INT NOT NULL UNIQUE REFERENCES usuarios(id) ON DELETE CASCADE,
  saldo NUMERIC(12,2) DEFAULT 0.00
);

-- 10. TRANSACCIONES
CREATE TABLE transacciones (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  usuario_id INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  tipo VARCHAR(30) NOT NULL CHECK (tipo IN ('ingreso_turno', 'ingreso_entrega', 'comision_plataforma', 'retiro', 'deposito')),
  monto NUMERIC(10,2) NOT NULL,
  saldo_anterior NUMERIC(12,2) NOT NULL,
  saldo_posterior NUMERIC(12,2) NOT NULL,
  referencia VARCHAR(100) DEFAULT NULL,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. CATEGORIAS EMPRENDEDOR
CREATE TABLE categorias_emprendedor (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  emprendedor_id INT NOT NULL REFERENCES emprendedores(id) ON DELETE CASCADE,
  nombre VARCHAR(100) NOT NULL
);

-- 12. PRODUCTOS EMPRENDEDOR
CREATE TABLE productos_emprendedor (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  emprendedor_id INT NOT NULL REFERENCES emprendedores(id) ON DELETE CASCADE,
  categoria_id INT NOT NULL REFERENCES categorias_emprendedor(id) ON DELETE CASCADE,
  nombre VARCHAR(150) NOT NULL,
  descripcion TEXT DEFAULT NULL,
  precio NUMERIC(10,2) NOT NULL,
  imagen_url VARCHAR(255) DEFAULT NULL,
  stock INT DEFAULT 0,
  disponible BOOLEAN DEFAULT TRUE
);

-- 13. ZONAS CALIENTES
CREATE TABLE zonas_calientes (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre_zona VARCHAR(100) NOT NULL,
  latitud NUMERIC(10, 8) NOT NULL,
  longitud NUMERIC(11, 8) NOT NULL,
  radio_km NUMERIC(4,2) DEFAULT 1.50,
  nivel_demanda VARCHAR(20) DEFAULT 'medio' CHECK (nivel_demanda IN ('bajo', 'medio', 'alto', 'critico'))
);

-- ==========================================

-- ==========================================
-- OPTIMIZACIÓN DE ÍNDICES (Fase 8 - Closed Beta)
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_usuarios_email_rol ON usuarios (email, rol_id);
CREATE INDEX IF NOT EXISTS idx_repartidores_usuario_disp ON repartidores (usuario_id, disponible);
CREATE INDEX IF NOT EXISTS idx_turnos_comercio_rep_estado ON turnos (comercio_id, repartidor_id, estado);
CREATE INDEX IF NOT EXISTS idx_entregas_unicas_emp_rep ON entregas_unicas (emprendedor_id, repartidor_id, estado);
CREATE INDEX IF NOT EXISTS idx_transacciones_usuario_tipo ON transacciones (usuario_id, tipo);
CREATE INDEX IF NOT EXISTS idx_productos_emprendedor_cat ON productos_emprendedor (emprendedor_id, categoria_id);



-- ==========================================

-- ROLES
INSERT INTO roles (nombre, descripcion) VALUES
('Administrador', 'Supervisa la plataforma B2B'),
('Comercio', 'Contrata por bloques de 4 horas'),
('Emprendedor', 'Contrata entregas individuales'),
('Repartidor', 'Socio de reparto B2B')
ON CONFLICT (nombre) DO NOTHING;

-- USUARIOS
INSERT INTO usuarios (email, password_hash, telefono, rol_id, activo) VALUES
('admin@deliveryplus.com', '$2a$10$vYg/Z7K.L9v67F0p8ZEn9.M8K23qYvVvjVjOQvWwA1uOn5vXvR8Z2', '+541155551111', 1, TRUE),
('repartidor@test.com', '$2a$10$vYg/Z7K.L9v67F0p8ZEn9.M8K23qYvVvjVjOQvWwA1uOn5vXvR8Z2', '+541177772222', 4, TRUE),
('trattoria@comercio.com', '$2a$10$vYg/Z7K.L9v67F0p8ZEn9.M8K23qYvVvjVjOQvWwA1uOn5vXvR8Z2', '+541133334444', 2, TRUE),
('nona@emprendedor.com', '$2a$10$vYg/Z7K.L9v67F0p8ZEn9.M8K23qYvVvjVjOQvWwA1uOn5vXvR8Z2', '+541144446666', 3, TRUE)
ON CONFLICT (email) DO NOTHING;

-- REPARTIDORES
INSERT INTO repartidores (usuario_id, nombre, apellido, tipo_vehiculo, patente, latitud_actual, longitud_actual, disponible, verificado) VALUES
(2, 'Carlos', 'Gómez', 'moto', '99A-XYZ8', -34.598200, -58.421100, TRUE, TRUE)
ON CONFLICT (usuario_id) DO NOTHING;

-- PERFIL REPARTIDOR
INSERT INTO perfil_repartidor (repartidor_id, calificacion_promedio, total_entregas, entregas_a_tiempo, zona_principal) VALUES
(1, 4.92, 420, 412, 'Palermo & Recoleta')
ON CONFLICT (repartidor_id) DO NOTHING;

-- COMERCIOS
INSERT INTO comercios (usuario_id, nombre_comercio, direccion, latitud, longitud) VALUES
(3, 'La Trattoria', 'Av. Santa Fe 2345, Palermo', -34.591200, -58.411100)
ON CONFLICT (usuario_id) DO NOTHING;

-- EMPRENDEDORES
INSERT INTO emprendedores (usuario_id, nombre_emprendimiento, rubro, descripcion, historia_familiar, direccion, latitud, longitud) VALUES
(4, 'Pastas de la Nona', 'Gastronomía Artesanal', 'Pastas caseras frescas receta italiana de 1948.', 'Nuestra abuela Filomena amaba cocinar. Seguimos su legado con la misma tabla de madera.', 'Serrano 1230, Villa Crespo', -34.595600, -58.435000)
ON CONFLICT (usuario_id) DO NOTHING;

-- BILLETERAS
INSERT INTO billeteras (usuario_id, saldo) VALUES
(1, 5000.00),
(2, 24000.00),
(3, 15000.00),
(4, 6000.00)
ON CONFLICT (usuario_id) DO NOTHING;

-- TRANSACCIONES (No conflict index - direct insert)
INSERT INTO transacciones (usuario_id, tipo, monto, saldo_anterior, saldo_posterior, referencia) VALUES
(2, 'ingreso_turno', 12000.00, 12000.00, 24000.00, 'turno_1'),
(1, 'comision_plataforma', 3000.00, 2000.00, 5000.00, 'turno_1');

-- TURNOS (No conflict index - direct insert)
INSERT INTO turnos (comercio_id, repartidor_id, fecha, hora_inicio, hora_fin, monto_total, monto_repartidor, monto_plataforma, estado) VALUES
(1, NULL, CURRENT_DATE, '20:00:00', '23:59:59', 15000.00, 12000.00, 3000.00, 'disponible');

-- ENTREGAS UNICAS (No conflict index - direct insert)
INSERT INTO entregas_unicas (emprendedor_id, repartidor_id, direccion_origen, direccion_destino, tamano_paquete, monto_total, monto_repartidor, monto_plataforma, estado) VALUES
(1, NULL, 'Serrano 1230, Villa Crespo', 'Av. Scalabrini Ortiz 2800, Palermo', 'mediano', 3500.00, 2800.00, 700.00, 'disponible');

-- ZONAS CALIENTES (No conflict index - direct insert)
INSERT INTO zonas_calientes (nombre_zona, latitud, longitud, radio_km, nivel_demanda) VALUES
('Zona Comercial Palermo', -34.591200, -58.411100, 1.80, 'alto'),
('Área Residencial Belgrano', -34.562000, -58.456000, 2.00, 'critico');
