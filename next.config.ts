import type { NextConfig } from "next";
import path from "path";

// Définir explicitement la racine Turbopack pour éviter l'avertissement
// "Next.js inferred your workspace root" lorsqu'il trouve un autre package-lock.json
// en dehors du dossier du projet (ex: /home/mael/package-lock.json).
const nextConfig: NextConfig = {
  turbopack: {
    // Utilise le dossier courant du projet comme racine.
    root: path.join(__dirname),
  },
};

export default nextConfig;
