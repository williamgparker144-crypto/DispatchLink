-- 011_posts_document_columns.sql
-- Add document attachment support to posts

ALTER TABLE posts ADD COLUMN IF NOT EXISTS document_url TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS document_name TEXT;
