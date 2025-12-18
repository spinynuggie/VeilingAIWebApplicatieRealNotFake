"use client";

import Image from "next/image";
import royalLogo from "@/public/loginAssets/royalLogo.svg";
import { NavBar } from "@/components/NavBar"
import { Background } from "@/components/Background"
export default function Landing() {
  return (
    <Background> 
      <NavBar mode="visitor"/>
      <main >
        <div>
          <Image 
            src={royalLogo} 
            alt="Royal FloraHolland Logo" 
            priority  
          />
        </div>

        <h1 >
          De grootste<br />
          internationale<br />
          sierteeltmarktplaats
        </h1>

        <button>Meer informatie</button>
      </main>
    </Background>
  );
}
