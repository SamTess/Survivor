"use client";
import { useParams } from 'next/navigation';

export default function UserPage() {
  const params = useParams<{ id: string }>();
  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold mb-2">Utilisateur #{params.id}</h1>
      <p>Détails utilisateur chargés côté client.</p>
    </main>
  );
}
