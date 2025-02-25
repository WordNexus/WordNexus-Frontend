"use client";

import { Suspense } from "react";
import { Providers } from "./providers";
import Footer from "@/components/footer";

export function LayoutContent({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Providers>
        <main className="w-full min-h-screen flex flex-col justify-between">
          <Suspense fallback={<div>Loading content...</div>}>
            {children}
          </Suspense>
          <Footer />
        </main>
      </Providers>
    </Suspense>
  );
}
