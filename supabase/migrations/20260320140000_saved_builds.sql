SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;

CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";

CREATE TABLE IF NOT EXISTS "public"."saved_builds" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "created_at" timestamp with time zone DEFAULT timezone('utc'::text, now()),
    "updated_at" timestamp with time zone DEFAULT timezone('utc'::text, now()),
    "budget" numeric NOT NULL,
    "platform" text NOT NULL,
    "total_price" numeric,
    "build_data" jsonb NOT NULL,
    CONSTRAINT "saved_builds_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "public"."saved_builds" OWNER TO "postgres";

ALTER TABLE "public"."saved_builds" ENABLE ROW LEVEL SECURITY;

-- Public (anon) read access for demo mode.
CREATE POLICY "saved_builds_select_all" ON "public"."saved_builds"
    FOR SELECT
    USING (true);

-- Allow saving builds from the client (anon key).
CREATE POLICY "saved_builds_insert_all" ON "public"."saved_builds"
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "saved_builds_update_all" ON "public"."saved_builds"
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

