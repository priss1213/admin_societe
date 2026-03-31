export function PromoItem({ title, status }) {
  return (
    <div className="flex justify-between border-b pb-2">
      <span>{title}</span>
      <span className="text-green-600">{status}</span>
    </div>
  );
}