-- Migrasi: pindahkan tabel monitoring-pembayaran dari `public` ke schema `monitoring_pembayaran`
-- Project Supabase: CGA (ref: mgxdvnnvruoyhnzgrtur) — project ini dipakai bersama banyak aplikasi.
-- Tanggal: 2026-06-17
--
-- Konteks: `public` berbagi dengan app lain (view monitoring-hsse, dll). 11 tabel app ini
-- dipindah ke schema sendiri agar konsisten dengan app lain (agro, appsheet_galangan, ...).
-- Sekaligus memperbaiki 2 bug RLS: (1) user_profiles RLS nonaktif, (2) privilege escalation,
-- dan (3) rekursi policy yang muncul setelah RLS user_profiles diaktifkan.

BEGIN;

CREATE SCHEMA IF NOT EXISTS monitoring_pembayaran;

ALTER TABLE public.attachments    SET SCHEMA monitoring_pembayaran;
ALTER TABLE public.audit_logs     SET SCHEMA monitoring_pembayaran;
ALTER TABLE public.budget_codes   SET SCHEMA monitoring_pembayaran;
ALTER TABLE public.business_units SET SCHEMA monitoring_pembayaran;
ALTER TABLE public.companies      SET SCHEMA monitoring_pembayaran;
ALTER TABLE public.departments    SET SCHEMA monitoring_pembayaran;
ALTER TABLE public.payment_forms  SET SCHEMA monitoring_pembayaran;
ALTER TABLE public.payment_items  SET SCHEMA monitoring_pembayaran;
ALTER TABLE public.user_profiles  SET SCHEMA monitoring_pembayaran;
ALTER TABLE public.vendors        SET SCHEMA monitoring_pembayaran;
ALTER TABLE public.vessels        SET SCHEMA monitoring_pembayaran;

-- BUG FIX #1: aktifkan RLS pada user_profiles (sebelumnya nonaktif -> data terbuka via Data API)
ALTER TABLE monitoring_pembayaran.user_profiles ENABLE ROW LEVEL SECURITY;

GRANT USAGE ON SCHEMA monitoring_pembayaran TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA monitoring_pembayaran TO authenticated, service_role;
GRANT SELECT ON ALL TABLES IN SCHEMA monitoring_pembayaran TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA monitoring_pembayaran TO authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA monitoring_pembayaran GRANT ALL ON TABLES TO authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA monitoring_pembayaran GRANT ALL ON SEQUENCES TO authenticated, service_role;

-- Helper SECURITY DEFINER (bypass RLS -> mencegah rekursi policy)
CREATE OR REPLACE FUNCTION monitoring_pembayaran.uid_role()
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO '' AS $$
  SELECT role FROM monitoring_pembayaran.user_profiles WHERE id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION monitoring_pembayaran.uid_is_active_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO '' AS $$
  SELECT EXISTS (
    SELECT 1 FROM monitoring_pembayaran.user_profiles
    WHERE id = auth.uid() AND role = 'admin' AND is_active = true
  )
$$;

REVOKE EXECUTE ON FUNCTION monitoring_pembayaran.uid_role(), monitoring_pembayaran.uid_is_active_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION monitoring_pembayaran.uid_role(), monitoring_pembayaran.uid_is_active_admin() TO authenticated;

-- BUG FIX #3: ganti subquery rekursif di policy dengan fungsi di atas
DROP POLICY admin_full_access_profiles ON monitoring_pembayaran.user_profiles;
CREATE POLICY admin_full_access_profiles ON monitoring_pembayaran.user_profiles
  FOR ALL TO authenticated USING ( monitoring_pembayaran.uid_is_active_admin() );

DROP POLICY user_can_update_own_profile ON monitoring_pembayaran.user_profiles;
CREATE POLICY user_can_update_own_profile ON monitoring_pembayaran.user_profiles
  FOR UPDATE TO authenticated USING ( id = auth.uid() ) WITH CHECK ( id = auth.uid() );

DROP POLICY admin_manage_budget_codes   ON monitoring_pembayaran.budget_codes;
CREATE POLICY admin_manage_budget_codes ON monitoring_pembayaran.budget_codes
  FOR ALL TO authenticated USING ( monitoring_pembayaran.uid_role() = 'admin' );
DROP POLICY admin_manage_business_units ON monitoring_pembayaran.business_units;
CREATE POLICY admin_manage_business_units ON monitoring_pembayaran.business_units
  FOR ALL TO authenticated USING ( monitoring_pembayaran.uid_role() = 'admin' );
DROP POLICY admin_manage_companies      ON monitoring_pembayaran.companies;
CREATE POLICY admin_manage_companies    ON monitoring_pembayaran.companies
  FOR ALL TO authenticated USING ( monitoring_pembayaran.uid_role() = 'admin' );
DROP POLICY admin_manage_departments    ON monitoring_pembayaran.departments;
CREATE POLICY admin_manage_departments  ON monitoring_pembayaran.departments
  FOR ALL TO authenticated USING ( monitoring_pembayaran.uid_role() = 'admin' );
DROP POLICY admin_manage_vendors        ON monitoring_pembayaran.vendors;
CREATE POLICY admin_manage_vendors      ON monitoring_pembayaran.vendors
  FOR ALL TO authenticated USING ( monitoring_pembayaran.uid_role() = 'admin' );
DROP POLICY admin_manage_vessels        ON monitoring_pembayaran.vessels;
CREATE POLICY admin_manage_vessels      ON monitoring_pembayaran.vessels
  FOR ALL TO authenticated USING ( monitoring_pembayaran.uid_role() = 'admin' );

DROP POLICY staff_create_payment_forms  ON monitoring_pembayaran.payment_forms;
CREATE POLICY staff_create_payment_forms ON monitoring_pembayaran.payment_forms
  FOR INSERT TO authenticated
  WITH CHECK ( monitoring_pembayaran.uid_role() = ANY (ARRAY['admin','staff']) );
DROP POLICY staff_update_own_draft      ON monitoring_pembayaran.payment_forms;
CREATE POLICY staff_update_own_draft    ON monitoring_pembayaran.payment_forms
  FOR UPDATE TO authenticated
  USING ( ((created_by = auth.uid()) AND (status = 'draft'))
          OR monitoring_pembayaran.uid_role() = ANY (ARRAY['admin','finance']) );

-- BUG FIX #2: cegah privilege escalation (non-admin tak bisa ubah role/is_active sendiri)
CREATE OR REPLACE FUNCTION monitoring_pembayaran.guard_user_profile_privileges()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO '' AS $$
DECLARE caller_is_admin boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM monitoring_pembayaran.user_profiles
    WHERE id = auth.uid() AND role = 'admin' AND is_active = true
  ) INTO caller_is_admin;
  IF NOT caller_is_admin THEN
    NEW.role := OLD.role;
    NEW.is_active := OLD.is_active;
  END IF;
  RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION monitoring_pembayaran.guard_user_profile_privileges() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS trg_guard_user_profile_privileges ON monitoring_pembayaran.user_profiles;
CREATE TRIGGER trg_guard_user_profile_privileges
  BEFORE UPDATE ON monitoring_pembayaran.user_profiles
  FOR EACH ROW EXECUTE FUNCTION monitoring_pembayaran.guard_user_profile_privileges();

COMMIT;

-- ============================================================================
-- Hardening lanjutan (2026-06-17): perbaikan getAuditLogs + perketat policy
-- Catatan kode: BuatPengajuan.jsx kini selalu membuat form sebagai 'draft' lalu
-- submit terpisah (updateFormStatus) agar item ter-insert saat form masih draft.
-- ============================================================================
BEGIN;

-- FK agar PostgREST bisa embed user_profiles via actor_id (getAuditLogs)
ALTER TABLE monitoring_pembayaran.audit_logs
  ADD CONSTRAINT audit_logs_actor_id_user_profiles_fkey
  FOREIGN KEY (actor_id) REFERENCES monitoring_pembayaran.user_profiles(id);

-- audit_logs: append-only, hanya atas nama diri sendiri
DROP POLICY authenticated_write_audit_logs ON monitoring_pembayaran.audit_logs;
CREATE POLICY audit_logs_insert_self ON monitoring_pembayaran.audit_logs
  FOR INSERT TO authenticated WITH CHECK ( actor_id = auth.uid() );

-- payment_items: hanya bisa ditulis bila form induk masih editable oleh user
DROP POLICY authenticated_write_payment_items ON monitoring_pembayaran.payment_items;
CREATE POLICY payment_items_write ON monitoring_pembayaran.payment_items
  FOR ALL TO authenticated
  USING ( EXISTS ( SELECT 1 FROM monitoring_pembayaran.payment_forms pf
            WHERE pf.id = payment_items.form_id
              AND ( ((pf.created_by = auth.uid()) AND pf.status = 'draft')
                    OR monitoring_pembayaran.uid_role() = ANY (ARRAY['admin','finance']) ) ) )
  WITH CHECK ( EXISTS ( SELECT 1 FROM monitoring_pembayaran.payment_forms pf
            WHERE pf.id = payment_items.form_id
              AND ( ((pf.created_by = auth.uid()) AND pf.status = 'draft')
                    OR monitoring_pembayaran.uid_role() = ANY (ARRAY['admin','finance']) ) ) );

-- attachments: tulis hanya bila form induk editable; uploader harus diri sendiri
DROP POLICY authenticated_write_attachments ON monitoring_pembayaran.attachments;
CREATE POLICY attachments_write ON monitoring_pembayaran.attachments
  FOR ALL TO authenticated
  USING ( EXISTS ( SELECT 1 FROM monitoring_pembayaran.payment_forms pf
            WHERE pf.id = attachments.form_id
              AND ( ((pf.created_by = auth.uid()) AND pf.status = 'draft')
                    OR monitoring_pembayaran.uid_role() = ANY (ARRAY['admin','finance']) ) ) )
  WITH CHECK ( uploaded_by = auth.uid()
    AND EXISTS ( SELECT 1 FROM monitoring_pembayaran.payment_forms pf
            WHERE pf.id = attachments.form_id
              AND ( ((pf.created_by = auth.uid()) AND pf.status = 'draft')
                    OR monitoring_pembayaran.uid_role() = ANY (ARRAY['admin','finance']) ) ) );

COMMIT;

-- Expose schema baru ke Data API (PostgREST). Jalankan TERPISAH (di luar transaksi).
ALTER ROLE authenticator SET pgrst.db_schemas =
  'public, graphql_public, barokah_guestbook, daily_report_shipyard, kemala_security, agro, monitoring_pembayaran';
NOTIFY pgrst, 'reload config';
NOTIFY pgrst, 'reload schema';
