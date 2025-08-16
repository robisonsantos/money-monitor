-- Migration: Add is_default column to portfolios table
-- ID: 20241210_000001
-- Description: Add is_default boolean column with unique constraint to ensure each user has exactly one default portfolio

-- Step 1: Add is_default column with NULL initially to avoid constraint violations
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'portfolios' AND column_name = 'is_default'
    ) THEN
        ALTER TABLE portfolios ADD COLUMN is_default BOOLEAN;
    END IF;
END $$;

-- Step 2: Set default portfolio for each user
-- Priority: "Main Portfolio" first, then oldest portfolio
WITH default_candidates AS (
  SELECT
    user_id,
    id,
    name,
    ROW_NUMBER() OVER (
      PARTITION BY user_id
      ORDER BY
        CASE WHEN name = 'Main Portfolio' THEN 0 ELSE 1 END,
        created_at ASC
    ) as rn
  FROM portfolios
  WHERE is_default IS NULL
)
UPDATE portfolios
SET is_default = (portfolios.id = default_candidates.id AND default_candidates.rn = 1)
FROM default_candidates
WHERE portfolios.user_id = default_candidates.user_id;

-- Step 3: Set remaining NULL values to false
UPDATE portfolios SET is_default = false WHERE is_default IS NULL;

-- Step 4: Make the column NOT NULL
ALTER TABLE portfolios ALTER COLUMN is_default SET NOT NULL;

-- Step 5: Add unique constraint (partial index to allow multiple false values)
CREATE UNIQUE INDEX IF NOT EXISTS unique_default_portfolio_per_user
ON portfolios(user_id) WHERE is_default = true;

-- Step 6: Create index for performance
CREATE INDEX IF NOT EXISTS idx_portfolios_user_default ON portfolios(user_id, is_default);
