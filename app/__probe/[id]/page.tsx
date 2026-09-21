import { notFound } from "next/navigation";

export default async function Probe({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (id !== "ok") notFound();
  return <p>ok</p>;
}
