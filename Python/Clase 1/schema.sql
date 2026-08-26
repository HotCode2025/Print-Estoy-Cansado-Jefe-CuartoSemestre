-- Script para crear la base de datos y tabla de usuarios
-- Ejecutar en PostgreSQL antes de usar el sistema

-- Crear la base de datos (si no existe)
-- FROM TERMINAL: createdb laboratorio_usuarios

-- Conectar a la base de datos y crear la tabla:
CREATE TABLE IF NOT EXISTS usuario (
    id_usuario SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL
);

-- Datos de prueba (opcional)
INSERT INTO usuario (username, password) VALUES
    ('admin', 'admin123'),
    ('juan', 'pass123'),
    ('maria', 'clave456')
ON CONFLICT (username) DO NOTHING;
