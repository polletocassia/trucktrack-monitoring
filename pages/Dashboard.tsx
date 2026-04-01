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

export default function Dashboard() {

  const stats = [
    {
      title: "Passagens Hoje",
      value: 128,
      description: "+12% em relação a ontem"
    },
    {
      title: "Aprovados",
      value: 102,
      description: "Veículos dentro do peso"
    },
    {
      title: "Infrações",
      value: 26,
      description: "Excesso de peso detectado"
    },
    {
      title: "Conformidade",
      value: "79%",
      description: "Taxa de aprovação geral"
    }
  ];

  const passagensHora = [
    { hora: "08h", passagens: 12 },
    { hora: "09h", passagens: 18 },
    { hora: "10h", passagens: 9 },
    { hora: "11h", passagens: 14 },
    { hora: "12h", passagens: 7 },
    { hora: "13h", passagens: 11 }
  ];

  const infracoesTipo = [
    { name: "Excesso Eixo", value: 14 },
    { name: "Excesso PBT", value: 8 },
    { name: "Outros", value: 4 }
  ];

  const COLORS = ["#ef4444", "#f59e0b", "#6b7280"];

  return (

    <div className="dashboard">

      <h1 className="page-title">Dashboard</h1>

      <div className="stats">

        {stats.map((s, i) => (
          <StatCard key={i} {...s} />
        ))}

      </div>

      <div className="dashboard-grid">

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

                {infracoesTipo.map((entry, index) => (
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

      <div className="dashboard-grid">

        <CardMain title="Passagens Recentes">

          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Placa</th>
                <th>Data</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>

              <tr>
                <td>PSG-001</td>
                <td>ABC-1234</td>
                <td>17/03/2026</td>
                <td className="status ok">Aprovado</td>
              </tr>

              <tr>
                <td>PSG-002</td>
                <td>DEF-5678</td>
                <td>17/03/2026</td>
                <td className="status warn">Excesso</td>
              </tr>

              <tr>
                <td>PSG-003</td>
                <td>GHI-9012</td>
                <td>17/03/2026</td>
                <td className="status error">Eixo</td>
              </tr>

            </tbody>

          </table>

        </CardMain>

        <CardMain title="Últimas Infrações">

          <div className="infraction">
            <strong>VWX-0123</strong>
            <span>Excesso de 0.70t no Eixo 2</span>
          </div>

          <div className="infraction">
            <strong>PQR-2345</strong>
            <span>Excesso de 2.3t no PBT</span>
          </div>

          <div className="infraction">
            <strong>GHI-9012</strong>
            <span>Excesso de 0.65t no Eixo 3</span>
          </div>

        </CardMain>

      </div>

    </div>

  );
}