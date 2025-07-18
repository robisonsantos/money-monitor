-- PostgreSQL schema for Money Monitor application
-- This creates the same structure as the SQLite database but optimized for PostgreSQL

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create investments table with encrypted values (TEXT column)
CREATE TABLE IF NOT EXISTS investments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    value TEXT NOT NULL, -- Encrypted financial data
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_investments_user_date ON investments(user_id, date);
CREATE INDEX IF NOT EXISTS idx_investments_date ON investments(date);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Create unique constraint on user_id + date combination
CREATE UNIQUE INDEX IF NOT EXISTS idx_investments_user_date_unique ON investments(user_id, date);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic updated_at updates
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_investments_updated_at ON investments;
CREATE TRIGGER update_investments_updated_at 
    BEFORE UPDATE ON investments 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column(); 