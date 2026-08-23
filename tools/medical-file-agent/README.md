# CORE SYSTEM Medical File Agent

Runs on the clinic's central/local storage computer and keeps authorized Medical Files available locally.

## Configuration

Set:

- `CORE_SYSTEM_URL` — CORE SYSTEM application URL.
- `CORE_MEDICAL_FILE_AGENT_TOKEN` — token returned by the Clinic Admin `registerMedicalFileAgent` server action.
- `CORE_MEDICAL_FILE_STORAGE_ROOT` — local folder for medical files.
- `CORE_MEDICAL_FILE_POLL_MS` — optional polling interval (default 60000).

Install and run:

```bash
npm install
npm start
```

The agent uses the tenant-scoped token, never exposes the Supabase service-role key, downloads only files returned for that registered device, writes them to the configured local storage, and acknowledges local availability back to CORE SYSTEM.
