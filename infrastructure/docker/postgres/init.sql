-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- For fuzzy text search

-- Create database if not exists
SELECT 'CREATE DATABASE rai_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'rai_db');

-- Set timezone
SET timezone = 'UTC';

-- Index hints for performance
-- (Prisma handles most indexes via schema, this adds extra text search capabilities)
