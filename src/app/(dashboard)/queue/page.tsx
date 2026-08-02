02:41:07.062 Running build in Washington, D.C., USA (East) – iad1
02:41:07.063 Build machine configuration: 2 cores, 8 GB
02:41:07.191 Cloning github.com/mdcode2026-core-sys/Core-System-clinic- (Branch: main, Commit: 0a9596c)
02:41:07.506 Cloning completed: 315.000ms
02:41:08.402 Restored build cache from previous deployment (C5xkWeG233N9dbdwTJA8EFpT7M7m)
02:41:08.627 Running "vercel build"
02:41:08.641 Vercel CLI 58.1.0
02:41:08.839 Installing dependencies...
02:41:15.375 npm warn ERESOLVE overriding peer dependency
02:41:15.376 npm warn While resolving: clinic-saas@1.0.0
02:41:15.377 npm warn Found: @types/react@18.3.31
02:41:15.378 npm warn node_modules/@types/react
02:41:15.378 npm warn   dev @types/react@"^19.1.2" from the root project
02:41:15.378 npm warn   25 more (@radix-ui/react-avatar, ...)
02:41:15.379 npm warn
02:41:15.379 npm warn Could not resolve dependency:
02:41:15.379 npm warn peer @types/react@"^18.0.0" from @types/react-dom@18.3.7
02:41:15.379 npm warn node_modules/@types/react-dom
02:41:15.379 npm warn   dev @types/react-dom@"^19.1.3" from the root project
02:41:15.380 npm warn   9 more (@radix-ui/react-avatar, @radix-ui/react-dialog, ...)
02:41:15.394 npm warn ERESOLVE overriding peer dependency
02:41:15.394 npm warn While resolving: clinic-saas@1.0.0
02:41:15.395 npm warn Found: @types/react@18.3.31
02:41:15.395 npm warn node_modules/@types/react
02:41:15.395 npm warn   dev @types/react@"^19.1.2" from the root project
02:41:15.395 npm warn   25 more (@radix-ui/react-avatar, ...)
02:41:15.395 npm warn
02:41:15.395 npm warn Could not resolve dependency:
02:41:15.395 npm warn peer @types/react@"^18.0.0" from @types/react-dom@18.3.7
02:41:15.395 npm warn node_modules/@types/react-dom
02:41:15.395 npm warn   dev @types/react-dom@"^19.1.3" from the root project
02:41:15.396 npm warn   9 more (@radix-ui/react-avatar, @radix-ui/react-dialog, ...)
02:41:15.396 npm warn ERESOLVE overriding peer dependency
02:41:15.396 npm warn While resolving: clinic-saas@1.0.0
02:41:15.396 npm warn Found: @types/react@18.3.31
02:41:15.396 npm warn node_modules/@types/react
02:41:15.396 npm warn   dev @types/react@"^19.1.2" from the root project
02:41:15.396 npm warn   25 more (@radix-ui/react-avatar, ...)
02:41:15.396 npm warn
02:41:15.396 npm warn Could not resolve dependency:
02:41:15.396 npm warn peer @types/react@"^18.0.0" from @types/react-dom@18.3.7
02:41:15.396 npm warn node_modules/@types/react-dom
02:41:15.396 npm warn   dev @types/react-dom@"^19.1.3" from the root project
02:41:15.397 npm warn   9 more (@radix-ui/react-avatar, @radix-ui/react-dialog, ...)
02:41:15.397 npm warn ERESOLVE overriding peer dependency
02:41:15.397 npm warn While resolving: clinic-saas@1.0.0
02:41:15.397 npm warn Found: @types/react@18.3.31
02:41:15.397 npm warn node_modules/@types/react
02:41:15.397 npm warn   dev @types/react@"^19.1.2" from the root project
02:41:15.397 npm warn   25 more (@radix-ui/react-avatar, ...)
02:41:15.397 npm warn
02:41:15.397 npm warn Could not resolve dependency:
02:41:15.397 npm warn peer @types/react@"^18.0.0" from @types/react-dom@18.3.7
02:41:15.397 npm warn node_modules/@types/react-dom
02:41:15.397 npm warn   dev @types/react-dom@"^19.1.3" from the root project
02:41:15.397 npm warn   9 more (@radix-ui/react-avatar, @radix-ui/react-dialog, ...)
02:41:18.146 
02:41:18.147 up to date in 9s
02:41:18.147 
02:41:18.147 161 packages are looking for funding
02:41:18.147   run `npm fund` for details
02:41:18.184 Detected Next.js version: 16.2.10
02:41:18.190 Running "npm run build"
02:41:18.316 
02:41:18.316 > clinic-saas@1.0.0 build
02:41:18.316 > next build --webpack
02:41:18.317 
02:41:18.993   Applying modifyConfig from Vercel
02:41:19.015 ▲ Next.js 16.2.10 (webpack)
02:41:19.019 - Environments: .env.local
02:41:19.019 
02:41:19.046   Creating an optimized production build ...
02:41:29.001 ✓ Compiled successfully in 7.2s
02:41:29.004   Running TypeScript ...
02:41:36.657 Failed to type check.
02:41:36.658 
02:41:36.659 ./src/app/(dashboard)/queue/page.tsx:68:22
02:41:36.659 Type error: Type '{ initialData: EnrichedSession[]; }' is not assignable to type 'IntrinsicAttributes & MyQueueViewProps'.
02:41:36.659   Property 'initialData' does not exist on type 'IntrinsicAttributes & MyQueueViewProps'.
02:41:36.659 
02:41:36.659   66 |       <div className="space-y-6 p-6">
02:41:36.659   67 |         <h1 className="text-2xl font-bold">قائمة الانتظار — الطبيب</h1>
02:41:36.659 > 68 |         <MyQueueView initialData={queueData} />
02:41:36.659      |                      ^
02:41:36.659   69 |       </div>
02:41:36.659   70 |     );
02:41:36.659   71 |   }
02:41:36.694 Next.js build worker exited with code: 1 and signal: null
02:41:36.728 Error: Command "npm run build" exited with 1