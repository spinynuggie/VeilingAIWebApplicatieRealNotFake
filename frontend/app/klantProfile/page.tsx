"use client";
import { useEffect, useState } from "react";
import GebruikerDisplay from "@/components/GebruikerDisplay";
import { getGebruiker } from "@/services/gebruikerService";


export default function klantProfile() {
  const [gebruikers, setGebruikers] = useState<any[]>([]);

  useEffect(() => {
    getGebruiker()
      .then(setGebruikers)
      .catch(console.error);
  }, []);

  return (


    <div>
        <h1>thuis pagina voor de klant</h1>
        <GebruikerDisplay gebruikers={gebruikers}/>
    </div>
  );
}
