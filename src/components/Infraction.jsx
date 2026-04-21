export default function Infractions(){

  const infractions = [
    { placa:"VWX-0123", desc:"Excesso de 0.70t no Eixo 2"},
    { placa:"PQR-2345", desc:"Excesso de 2.3t no PBT"},
    { placa:"GHI-9012", desc:"Excesso de 0.65t no Eixo 3"},
  ]

  return(

    <div className="infractions">

      <h2>Últimas Infrações</h2>

      {infractions.map((i,index)=>(
        <div key={index} className="infraction-item">
          <strong>{i.placa}</strong>
          <p>{i.desc}</p>
        </div>
      ))}

    </div>

  )

}