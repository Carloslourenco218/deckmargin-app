-- ============================================================
-- DeckMargin Phase 5 Migration
-- P0 fix: assembly-based stair model + per-project region
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor)
-- Safe to run multiple times (IF NOT EXISTS guards)
-- ============================================================

ALTER TABLE projects
  -- Number of stair flights (replaces the old stair_count used as "steps")
  ADD COLUMN IF NOT EXISTS staircase_count  INTEGER DEFAULT 0,
  -- Number of risers per flight (drives stringer length, tread area, labor)
  ADD COLUMN IF NOT EXISTS riser_count      INTEGER DEFAULT 0,
  -- Per-project region override — stored at quote time so global Settings
  -- changes never silently reprice an existing estimate
  ADD COLUMN IF NOT EXISTS project_region   TEXT;

-- ============================================================
-- Notes:
--   • stair_count is kept for backward compat (existing quotes
--     display a migration notice to update to the new model)
--   • project_region = NULL means "use settings.region" at read time
--   • staircase_count = 0 means no stairs quoted
--   • riser_count uses IRC standard 7.5" per riser for geometry
-- ============================================================

-- Verify (optional)
-- SELECT column_name, data_type, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'projects' AND column_name IN (
--   'staircase_count', 'riser_count', 'project_region', 'stair_count',
--   'stair_width', 'has_landing', 'stair_config', 'stair_railing'
-- )
-- ORDER BY column_name;
