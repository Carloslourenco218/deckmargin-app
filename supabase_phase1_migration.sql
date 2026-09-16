-- ============================================================
-- DeckMargin Phase 1 Migration
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor)
-- Safe to run multiple times (IF NOT EXISTS / IF EXISTS guards)
-- ============================================================

-- 1. New wizard fields on the projects table
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS deck_shape            TEXT    DEFAULT 'rectangle',
  ADD COLUMN IF NOT EXISTS deck_attachment       TEXT    DEFAULT 'attached',
  ADD COLUMN IF NOT EXISTS ledger_condition      TEXT,
  ADD COLUMN IF NOT EXISTS deck_height_category  TEXT,
  ADD COLUMN IF NOT EXISTS decking_pattern       TEXT    DEFAULT 'standard',
  ADD COLUMN IF NOT EXISTS railing_coverage      TEXT    DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS railing_lf            NUMERIC,
  ADD COLUMN IF NOT EXISTS stair_railing         TEXT    DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS stair_railing_lf      NUMERIC,
  ADD COLUMN IF NOT EXISTS stair_config          TEXT,
  ADD COLUMN IF NOT EXISTS stair_width           TEXT,
  ADD COLUMN IF NOT EXISTS has_landing           BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS landing_size          TEXT,
  ADD COLUMN IF NOT EXISTS site_difficulty       TEXT    DEFAULT 'easy',
  ADD COLUMN IF NOT EXISTS site_obstacles        JSONB   DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS deck_sqft_override    NUMERIC,
  ADD COLUMN IF NOT EXISTS demolition_enabled    BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS demolition_cost       NUMERIC DEFAULT 0;

-- 2. Expand status values — no change needed to the column type (TEXT already accepts any value)
--    New valid statuses: draft | open | sent | viewed | follow-up | accepted | declined | expired | on-hold
--    'won' and 'lost' remain valid for backward compat (mapped to accepted/declined in new UI)

-- 3. Ensure 'job_type' supports all spec values
--    Existing: new_build | resurface | railing_only | repair | addition
--    New: rebuild  (no schema change needed; TEXT column accepts any value)

-- ============================================================
-- Verify (optional — run this to confirm columns were added)
-- ============================================================
-- SELECT column_name, data_type, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'projects'
-- ORDER BY ordinal_position;
