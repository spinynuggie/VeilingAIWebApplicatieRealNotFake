"use client";

import  AppNavBar  from "@/features/(NavBar)/AppNavBar"
import { FloraLogo } from "@/components/FloraLogo";
import { Background } from "@/components/Background"
export default function Landing() {
return (
  <Background> 
    <AppNavBar/>
    {/* min-h-screen accounts for the full height minus the NavBar if it's fixed */}
    <main className="flex flex-col items-center justify-center min-h-[calc(100vh)] text-center">
    </main>
  </Background>
);
}
