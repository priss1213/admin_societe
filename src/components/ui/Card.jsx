export default function Card({ title, value }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <p className="text-gray-500 text-sm">{title}</p>
      <h2 className="text-xl font-bold">{value}</h2>
    </div>
  );
}