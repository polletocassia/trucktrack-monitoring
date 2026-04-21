export default function RecentPassages(){

  const data = [
    {id:"PSG-001", placa:"ABC-1234", status:"Aprovado"},
    {id:"PSG-002", placa:"DEF-5678", status:"Excesso"},
    {id:"PSG-003", placa:"GHI-9012", status:"Excesso"},
  ]

  return(

    <div className="recent">

      <h2>Passagens Recentes</h2>

      <table>

        <thead>
          <tr>
            <th>ID</th>
            <th>Placa</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>

          {data.map((row)=>(
            <tr key={row.id}>
              <td>{row.id}</td>
              <td>{row.placa}</td>
              <td>{row.status}</td>
            </tr>
          ))}

        </tbody>

      </table>

    </div>

  )

}