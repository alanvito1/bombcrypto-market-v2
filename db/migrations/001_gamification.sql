-- Migration to add user_gamification table for Merchant Tycoon gamification system
-- Supports both bsc and polygon schemas

-- BSC Schema
CREATE TABLE IF NOT EXISTS bsc.user_gamification (
    wallet_address VARCHAR(42) PRIMARY KEY,
    current_xp BIGINT NOT NULL DEFAULT 0,
    current_rank INTEGER NOT NULL DEFAULT 0,
    total_fees_saved NUMERIC(78, 0) DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Polygon Schema
CREATE TABLE IF NOT EXISTS polygon.user_gamification (
    wallet_address VARCHAR(42) PRIMARY KEY,
    current_xp BIGINT NOT NULL DEFAULT 0,
    current_rank INTEGER NOT NULL DEFAULT 0,
    total_fees_saved NUMERIC(78, 0) DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes (Implicitly created by PRIMARY KEY, but adding explicit if needed for non-PK lookups or future changes)
-- Note: Primary Key already creates a unique index on wallet_address.
-- We can add an index on current_rank for leaderboards if needed, but not requested.

-- Trigger to update updated_at (Optional but good practice)
-- Assuming a function update_updated_at_column exists or we handle it in application code.
-- The existing schema uses DEFAULT CURRENT_TIMESTAMP but doesn't show triggers for update.
-- We will handle updated_at in the application code (Repo).
