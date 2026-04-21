import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

import StatCard from "../components/ui/StatCard";
import CardMain from "../components/ui/CardMain";
import dashboardData from "../data/dashboard.json";

const COLORS = ["#ef4444", "#f59e0b", "#6b7280"];

export default function Dashboard() {
  const {
    stats,
    passagensHora,
    infracoesTipo,
    passagensRecentes,
    ultimasInfracoes
  } = dashboardData;

  return (
    <div className="dashboard">
      <h1 className="page-title">Dashboard</h1>

      <div className="row g-3 mb-4">
        {stats.map((s, i) => (
          <div key={i} className="col-12 col-md-6 col-xl-3">
            <StatCard {...s} />
          </div>
        ))}
      </div>

      <div className="row g-3 mb-4">
        <div className="col-12 col-xl-8">
          <CardMain title="Passagens por Hora">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={passagensHora}>
                <XAxis dataKey="hora" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="passagens"
                  stroke="#3b82f6"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardMain>
        </div>

        <div className="col-12 col-xl-4">
          <CardMain title="Infrações por Tipo">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={infracoesTipo}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={90}
                  label
                >
                  {infracoesTipo.map((_, index) => (
                    <Cell
                      key={index}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardMain>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-12 col-xl-8">
          <CardMain title="Passagens Recentes">
            <div className="table-responsive">
              <table className="w-100">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Placa</th>
                    <th>Data</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {passagensRecentes.map((item) => (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td>{item.placa}</td>
                      <td>{item.data}</td>
                      <td className={`status ${item.statusClass}`}>
                        {item.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardMain>
        </div>

        <div className="col-12 col-xl-4">
          <CardMain title="Últimas Infrações">
            {ultimasInfracoes.map((item, index) => (
              <div className="infraction" key={index}>
                <strong>{item.placa}</strong>
                <span>{item.descricao}</span>
              </div>
            ))}
          </CardMain>
        </div>
      </div>
    </div>
  );
}