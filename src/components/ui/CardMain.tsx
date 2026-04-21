import { ReactNode } from "react";
import Card from "./Card";

interface ChartCardProps {
  title: string;
  children: ReactNode;
}

export default function ChartCard({
  title,
  children
}: ChartCardProps) {
  return (
    <Card className="chart-card">

      <h3>{title}</h3>

      {children}

    </Card>
  );
}