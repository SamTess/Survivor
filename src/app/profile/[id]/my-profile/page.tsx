// src/app/users/[id]/page.tsx
type Props = { params: { id: string } };

export default async function UserPage({ params }: Props) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/users/${params.id}`, {
    cache: "no-store"
  });

  if (!res.ok) {
    return <div>Utilisateur introuvable</div>;
  }

  const user = await res.json() as { id: number; name: string; email: string };
  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold mb-2">Utilisateur #{user.id}</h1>
      <p>Nom : {user.name}</p>
      <p>Email : {user.email}</p>
    </main>
  );
}
