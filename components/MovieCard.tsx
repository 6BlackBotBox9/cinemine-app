"use client";
export default function MovieCard({ title, year, poster }: { title: string; year?: number; poster?: string; }) {
  return (
    <div className="rounded overflow-hidden shadow-md bg-white/5">
      <div className="h-48 bg-gray-700" style={{ backgroundImage: poster ? `url(${poster})` : undefined, backgroundSize: 'cover' }} />
      <div className="p-2 text-sm">{title} {year ? `(${year})` : ''}</div>
    </div>
  );
}
