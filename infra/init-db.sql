-- Enable required PostgreSQL extensions per System Design Section 3 & 6
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "vector";
-- PostGIS is enabled in PostGIS-capable images; graceful check if using pgvector base
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_available_extensions WHERE name = 'postgis') THEN
    CREATE EXTENSION IF NOT EXISTS "postgis";
  END IF;
END
$$;
