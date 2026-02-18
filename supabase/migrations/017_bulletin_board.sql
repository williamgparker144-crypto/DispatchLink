-- Migration 017: Bulletin Board
-- Single-row table to persist admin-authored HTML bulletin content

CREATE TABLE IF NOT EXISTS bulletin_board (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL DEFAULT '',
  title TEXT DEFAULT 'Dispatching Workflow Guide',
  updated_at TIMESTAMPTZ DEFAULT now(),
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Reuse existing trigger function from migration 004
CREATE TRIGGER trg_bulletin_board_updated
  BEFORE UPDATE ON bulletin_board
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed one row
INSERT INTO bulletin_board (content, title) VALUES ('', 'Dispatching Workflow Guide');

-- Disable RLS so all users can read
ALTER TABLE bulletin_board DISABLE ROW LEVEL SECURITY;
