interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
}

export default function StatCard({
  title,
  value,
  description
}: StatCardProps) {
  return (
    <div className="stat-card">

      <p className="stat-title">{title}</p>

      <h2 className="stat-value">{value}</h2>

      <span className="stat-description">
        {description}
      </span>

    </div>
  );
}