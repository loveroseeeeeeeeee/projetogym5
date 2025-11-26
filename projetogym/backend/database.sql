-- Script SQL para criar o banco de dados MySQL para o projeto NEXON Fitness
-- Execute este script no seu servidor MySQL antes de iniciar a aplicação

-- Criar banco de dados
CREATE DATABASE IF NOT EXISTS nexon_fitness CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Usar o banco de dados
USE nexon_fitness;

-- Criar tabela users
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,

  -- Profile (JSON para campos aninhados)
  profile JSON DEFAULT ('{}'),

  -- Fitness (JSON para campos aninhados)
  fitness JSON DEFAULT ('{}'),

  -- Subscription (JSON para campos aninhados)
  subscription JSON DEFAULT ('{"plan": "basico", "status": "inativo", "autoRenew": true}'),

  -- Stats (JSON para campos aninhados)
  stats JSON DEFAULT ('{"workoutsCompleted": 0, "totalTime": 0, "streak": 0}'),

  -- Preferences (JSON para campos aninhados)
  preferences JSON DEFAULT ('{"notifications": {"email": true, "push": true, "workoutReminders": true}, "privacy": {"profileVisible": true, "showStats": true}, "units": {"weight": "kg", "height": "cm"}}'),

  -- Timestamps
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  -- Índices
  INDEX idx_email (email),
  INDEX idx_fitness_level ((JSON_EXTRACT(fitness, '$.level'))),
  INDEX idx_subscription_status ((JSON_EXTRACT(subscription, '$.status'))),
  INDEX idx_created_at (createdAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inserir usuário de exemplo (opcional)
-- INSERT INTO users (name, email, password, fitness, subscription) VALUES
-- ('Admin User', 'admin@nexonfitness.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6fYzK1QZwO', '{"level": "avancado"}', '{"plan": "black", "status": "ativo"}');
