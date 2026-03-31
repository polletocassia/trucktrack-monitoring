export default function Dashboard() {

  const stats = [
    { title: "Total Passagens", value: 8 },
    { title: "Aprovados", value: 3 },
    { title: "Infrações", value: 4 },
    { title: "Conformidade", value: "37.5%" }
  ];

  return (

    <div className="dashboard">

      <h1 className="page-title">Dashboard</h1>

      <div className="stats">

        {stats.map((s, i) => (
          <div key={i} className="stat-card">
            <h2>{s.value}</h2>
            <p>{s.title}</p>
          </div>
        ))}

      </div>

      <div className="dashboard-grid">

        <div className="recent">

          <h3>Passagens Recentes</h3>

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

        </div>

        <div className="infractions">

          <h3>Últimas Infrações</h3>

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

        </div>

      </div>

    </div>

  );
}