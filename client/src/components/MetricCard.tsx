// components/MetricCard.tsx
interface MetricCardProps {
  title: string;
  value: string | number;
}

export default function MetricCard({ title, value }: MetricCardProps) {
  return (
    <div className="bg-white rounded-xl shadow p-4 text-center">
      <h3 className="text-gray-500 text-sm">{title}</h3>
      <p className="text-xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
