# DATABASE TYPES UPDATE — PJ Stage 3
# File: src/infrastructure/supabase/database.types.ts
#
# After applying the migration to Supabase, regenerate types:
#
#   npx supabase gen types typescript --project-id qaslsjyxjwvdoiczmhgq --schema public > src/infrastructure/supabase/database.types.ts
#
# If manual update is required, add these fields to the clinic_procedures table definition:
#
# In Row type, add after "category":
#   specialty: string | null
#   service_type: string | null
#   provider_type: string | null
#   display_order: number
#
# In Insert type, add after "category":
#   specialty?: string | null
#   service_type?: string | null
#   provider_type?: string | null
#   display_order?: number
#
# In Update type, add after "category":
#   specialty?: string | null
#   service_type?: string | null
#   provider_type?: string | null
#   display_order?: number
