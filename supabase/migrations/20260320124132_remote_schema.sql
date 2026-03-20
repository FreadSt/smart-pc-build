drop policy "saved_builds_insert_all" on "public"."saved_builds";

drop policy "saved_builds_select_all" on "public"."saved_builds";

drop policy "saved_builds_update_all" on "public"."saved_builds";

revoke delete on table "public"."saved_builds" from "anon";

revoke insert on table "public"."saved_builds" from "anon";

revoke references on table "public"."saved_builds" from "anon";

revoke select on table "public"."saved_builds" from "anon";

revoke trigger on table "public"."saved_builds" from "anon";

revoke truncate on table "public"."saved_builds" from "anon";

revoke update on table "public"."saved_builds" from "anon";

revoke delete on table "public"."saved_builds" from "authenticated";

revoke insert on table "public"."saved_builds" from "authenticated";

revoke references on table "public"."saved_builds" from "authenticated";

revoke select on table "public"."saved_builds" from "authenticated";

revoke trigger on table "public"."saved_builds" from "authenticated";

revoke truncate on table "public"."saved_builds" from "authenticated";

revoke update on table "public"."saved_builds" from "authenticated";

revoke delete on table "public"."saved_builds" from "service_role";

revoke insert on table "public"."saved_builds" from "service_role";

revoke references on table "public"."saved_builds" from "service_role";

revoke select on table "public"."saved_builds" from "service_role";

revoke trigger on table "public"."saved_builds" from "service_role";

revoke truncate on table "public"."saved_builds" from "service_role";

revoke update on table "public"."saved_builds" from "service_role";

alter table "public"."saved_builds" drop constraint "saved_builds_pkey";

drop index if exists "public"."saved_builds_pkey";

drop table "public"."saved_builds";


  create table "public"."hardware_benchmarks" (
    "id" uuid not null default gen_random_uuid(),
    "model_name" text not null,
    "category" text,
    "performance_score" integer not null,
    "tier" text,
    "tdp" integer,
    "base_resolution" text,
    "brand" text,
    "series" text,
    "generation" text
      );


alter table "public"."hardware_benchmarks" enable row level security;

CREATE UNIQUE INDEX hardware_benchmarks_model_name_key ON public.hardware_benchmarks USING btree (model_name);

CREATE UNIQUE INDEX hardware_benchmarks_pkey ON public.hardware_benchmarks USING btree (id);

alter table "public"."hardware_benchmarks" add constraint "hardware_benchmarks_pkey" PRIMARY KEY using index "hardware_benchmarks_pkey";

alter table "public"."hardware_benchmarks" add constraint "hardware_benchmarks_category_check" CHECK ((category = ANY (ARRAY['CPU'::text, 'GPU'::text]))) not valid;

alter table "public"."hardware_benchmarks" validate constraint "hardware_benchmarks_category_check";

alter table "public"."hardware_benchmarks" add constraint "hardware_benchmarks_model_name_key" UNIQUE using index "hardware_benchmarks_model_name_key";

grant delete on table "public"."hardware_benchmarks" to "anon";

grant insert on table "public"."hardware_benchmarks" to "anon";

grant references on table "public"."hardware_benchmarks" to "anon";

grant select on table "public"."hardware_benchmarks" to "anon";

grant trigger on table "public"."hardware_benchmarks" to "anon";

grant truncate on table "public"."hardware_benchmarks" to "anon";

grant update on table "public"."hardware_benchmarks" to "anon";

grant delete on table "public"."hardware_benchmarks" to "authenticated";

grant insert on table "public"."hardware_benchmarks" to "authenticated";

grant references on table "public"."hardware_benchmarks" to "authenticated";

grant select on table "public"."hardware_benchmarks" to "authenticated";

grant trigger on table "public"."hardware_benchmarks" to "authenticated";

grant truncate on table "public"."hardware_benchmarks" to "authenticated";

grant update on table "public"."hardware_benchmarks" to "authenticated";

grant delete on table "public"."hardware_benchmarks" to "service_role";

grant insert on table "public"."hardware_benchmarks" to "service_role";

grant references on table "public"."hardware_benchmarks" to "service_role";

grant select on table "public"."hardware_benchmarks" to "service_role";

grant trigger on table "public"."hardware_benchmarks" to "service_role";

grant truncate on table "public"."hardware_benchmarks" to "service_role";

grant update on table "public"."hardware_benchmarks" to "service_role";


