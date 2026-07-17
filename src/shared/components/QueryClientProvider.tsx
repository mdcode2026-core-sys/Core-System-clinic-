"use client";

import { QueryClient, QueryClientProvider as ReactQueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function QueryClientProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: { staleTime: 5 * 1000, refetchOnWindowFocus: false }
    }
  }));

  return (
    <ReactQueryClientProvider client={queryClient}>
      {children}
    </ReactQueryClientProvider>
  );
}
