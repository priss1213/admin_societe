export function ReservationItem({ code, status }) {
  return (
    <div className="flex justify-between border-b pb-2">
      <span>{code}</span>
      <span className="text-blue-600">{status}</span>
    </div>
  );
}