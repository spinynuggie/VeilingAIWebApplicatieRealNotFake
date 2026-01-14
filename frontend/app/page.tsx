"use client";

import AppNavBar from "@/features/(NavBar)/AppNavBar"
import { FloraLogo } from "@/components/FloraLogo";
import { Background } from "@/components/Background"

export default function Home() {
  return (
    <Background>
      <AppNavBar />
      {/* min-h-screen accounts for the full height minus the NavBar if it's fixed */}
      <main className="flex flex-col items-center justify-center min-h-[calc(100vh)] text-center">
        <div>
          <FloraLogo mode="large" />
        </div>

        <h1 className="mt-8 text-8xl font-bold leading-tight">
          De grootste<br />
          internationale<br />
          sierteeltmarktplaats
        </h1>
      </main>
    </Background>
  );
}
