-- ============================================================================
-- MIGRATION: añade soft-delete a users + tabla de notifications
-- Fecha:    2026-05
-- Run with: psql -h <host> -U <user> -d <db> -f migrations/2026-05-add-profile-and-notifications.sql
-- ============================================================================

BEGIN;

-- 1. Soft delete en users ----------------------------------------------------
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ NULL;

-- Índice para acelerar filtros tipo "WHERE deleted_at IS NULL"
CREATE INDEX IF NOT EXISTS idx_users_deleted_at
    ON users (deleted_at)
    WHERE deleted_at IS NULL;

-- 2. Notifications -----------------------------------------------------------
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notifications_type_enum') THEN
        CREATE TYPE notifications_type_enum AS ENUM (
            'APPLICATION_RECEIVED',
            'APPLICATION_ACCEPTED',
            'APPLICATION_REJECTED'
        );
    END IF;
END$$;

CREATE TABLE IF NOT EXISTS notifications (
    id              UUID                    PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID                    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type            notifications_type_enum NOT NULL,
    title           VARCHAR(255)            NOT NULL,
    message         TEXT                    NOT NULL,
    post_id         UUID                    NULL,
    application_id  UUID                    NULL,
    read_at         TIMESTAMPTZ             NULL,
    created_at      TIMESTAMPTZ             NOT NULL DEFAULT NOW()
);

-- Índices: queries comunes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id
    ON notifications (user_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
    ON notifications (user_id, created_at DESC)
    WHERE read_at IS NULL;

COMMIT;

-- ============================================================================
-- Para revertir (rollback manual):
--   DROP TABLE IF EXISTS notifications;
--   DROP TYPE IF EXISTS notifications_type_enum;
--   ALTER TABLE users DROP COLUMN IF EXISTS deleted_at;
-- ============================================================================
