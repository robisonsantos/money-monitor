-- Portfolio Migration Script
-- This script adds portfolio support while maintaining backward compatibility
-- for existing users and their investment data.

-- Step 1: Create portfolios table
CREATE TABLE IF NOT EXISTS portfolios (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Ensure unique portfolio names per user
    CONSTRAINT unique_portfolio_name_per_user UNIQUE (user_id, name)
);

-- Step 2: Add portfolio_id column to investments table (nullable for now)
ALTER TABLE investments
ADD COLUMN IF NOT EXISTS portfolio_id INTEGER REFERENCES portfolios(id) ON DELETE CASCADE;

-- Step 3: Create "Main Portfolio" for all existing users
INSERT INTO portfolios (user_id, name, created_at, updated_at)
SELECT
    id as user_id,
    'Main Portfolio' as name,
    created_at,
    updated_at
FROM users
WHERE NOT EXISTS (
    SELECT 1 FROM portfolios WHERE portfolios.user_id = users.id AND portfolios.name = 'Main Portfolio'
);

-- Step 4: Update all existing investments to reference "Main Portfolio"
UPDATE investments
SET portfolio_id = (
    SELECT portfolios.id
    FROM portfolios
    WHERE portfolios.user_id = investments.user_id
    AND portfolios.name = 'Main Portfolio'
)
WHERE portfolio_id IS NULL;

-- Step 5: Make portfolio_id NOT NULL after migration
ALTER TABLE investments
ALTER COLUMN portfolio_id SET NOT NULL;

-- Step 6: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_portfolios_user_id ON portfolios(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolios_name ON portfolios(name);
CREATE INDEX IF NOT EXISTS idx_investments_portfolio_id ON investments(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_investments_portfolio_date ON investments(portfolio_id, date);

-- Step 7: Update the unique constraint to include portfolio_id
-- Drop the old constraint and create a new one
DROP INDEX IF EXISTS idx_investments_user_date_unique;
CREATE UNIQUE INDEX IF NOT EXISTS idx_investments_portfolio_date_unique
ON investments(portfolio_id, date);

-- Step 8: Add trigger for portfolios updated_at
DROP TRIGGER IF EXISTS update_portfolios_updated_at ON portfolios;
CREATE TRIGGER update_portfolios_updated_at
    BEFORE UPDATE ON portfolios
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Step 9: Create function to automatically create "Main Portfolio" for new users
CREATE OR REPLACE FUNCTION create_default_portfolio()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO portfolios (user_id, name, created_at, updated_at)
    VALUES (NEW.id, 'Main Portfolio', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 10: Create trigger to auto-create default portfolio for new users
DROP TRIGGER IF EXISTS create_default_portfolio_trigger ON users;
CREATE TRIGGER create_default_portfolio_trigger
    AFTER INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION create_default_portfolio();

-- Verification queries (commented out - can be run manually for verification)
--
-- -- Verify all users have a "Main Portfolio"
-- SELECT
--     u.id as user_id,
--     u.email,
--     p.name as portfolio_name,
--     COUNT(i.id) as investment_count
-- FROM users u
-- LEFT JOIN portfolios p ON u.id = p.user_id AND p.name = 'Main Portfolio'
-- LEFT JOIN investments i ON p.id = i.portfolio_id
-- GROUP BY u.id, u.email, p.name
-- ORDER BY u.id;
--
-- -- Verify no investments without portfolio_id
-- SELECT COUNT(*) as orphaned_investments
-- FROM investments
-- WHERE portfolio_id IS NULL;
--
-- -- Show portfolio distribution
-- SELECT
--     p.user_id,
--     p.name,
--     COUNT(i.id) as investment_count
-- FROM portfolios p
-- LEFT JOIN investments i ON p.id = i.portfolio_id
-- GROUP BY p.user_id, p.name
-- ORDER BY p.user_id, p.name;
