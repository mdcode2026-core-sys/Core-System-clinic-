-- I18N: English is the global platform default; Arabic remains fully supported.
-- Existing tenant preferences are intentionally unchanged.
ALTER TABLE public.master_tenants
  ALTER COLUMN language SET DEFAULT 'en',
  ALTER COLUMN direction SET DEFAULT 'ltr';
