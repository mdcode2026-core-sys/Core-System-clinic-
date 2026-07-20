17:33:57.338 Running build in Washington, D.C., USA (East) – iad1
17:33:57.339 Build machine configuration: 2 cores, 8 GB
17:33:57.474 Cloning github.com/mdcode2026-core-sys/Core-System-clinic- (Branch: main, Commit: 602c43a)
17:33:57.712 Cloning completed: 237.000ms
17:33:59.246 Restored build cache from previous deployment (2e9vATiuxBTggeGXgr83nNHHbZr7)
17:33:59.524 Running "vercel build"
17:33:59.546 Vercel CLI 56.2.0
17:33:59.994 Installing dependencies...
17:34:00.984 
17:34:00.984 up to date in 867ms
17:34:00.985 
17:34:00.985 158 packages are looking for funding
17:34:00.985   run `npm fund` for details
17:34:01.020 Detected Next.js version: 16.2.10
17:34:01.025 Running "npm run build"
17:34:01.131 
17:34:01.131 > clinic-saas@1.0.0 build
17:34:01.131 > next build
17:34:01.131 
17:34:01.849   Applying modifyConfig from Vercel
17:34:01.867 ▲ Next.js 16.2.10 (Turbopack)
17:34:01.868 - Environments: .env.local
17:34:01.869 
17:34:01.900   Creating an optimized production build ...
17:34:12.574 ✓ Compiled successfully in 10.3s
17:34:12.589   Running TypeScript ...
17:34:19.540 Failed to type check.
17:34:19.540 
17:34:19.541 ./src/domain/agenda/agenda.actions.ts:81:5
17:34:19.541 Type error: Object literal may only specify known properties, and 'inquiry_id' does not exist in type '{ id?: string | undefined; tenant_id: string; patient_id?: string | null | undefined; doctor_id?: string | null | undefined; room_id?: string | null | undefined; procedure_id?: string | null | undefined; ... 4 more ...; created_at?: string | undefined; }'.
17:34:19.541 
17:34:19.541   79 |     room_id: roomId,
17:34:19.541   80 |     procedure_id: procedureId,
17:34:19.542 > 81 |     inquiry_id: inquiryId,
17:34:19.542      |     ^
17:34:19.542   82 |     created_by: createdBy,
17:34:19.542   83 |     scheduled_start: scheduledStart,
17:34:19.542   84 |     scheduled_end: scheduledEnd,
17:34:19.579 Next.js build worker exited with code: 1 and signal: null
17:34:19.627 Error: Command "npm run build" exited with 1