import { useEffect, useMemo, useRef, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

import StatCard from "../components/ui/StatCard";
import CardMain from "../components/ui/CardMain";
import dashboardData from "../data/dashboard.json";

type StatItem = {
  title: string;
  value: string | number;
  description: string;
};

type PassagemHora = {
  hora: string;
  passagens: number;
};

type InfracaoTipo = {
  name: string;
  value: number;
};

type PassagemRecente = {
  id: string;
  placa: string;
  data: string;
  tipoVeiculo: string;
  pbt: string;
  limite: string;
  excesso: string;
  status: string;
  statusClass: string;
};

type UltimaInfracao = {
  placa: string;
  descricao: string;
  tipoVeiculo: string;
  local: string;
};

type DashboardConfig = {
  limitePassagensDia: number;
  intervalosEntrada: number[];
  maxUltimasInfracoes: number;
  localPadraoInfracao: string;
};

type DashboardJson = {
  config: DashboardConfig;
  colors: string[];
  tooltip: {
    backgroundColor: string;
    border: string;
    borderRadius: string;
    color: string;
    fontSize: string;
  };
  stats: StatItem[];
  passagensHora: PassagemHora[];
  infracoesTipo: InfracaoTipo[];
  passagensRecentes: PassagemRecente[];
  ultimasInfracoes: UltimaInfracao[];
  novosRegistros: PassagemRecente[];
};

function parseToneladas(value: string): number {
  if (value === "-") return 0;
  return Number(value.replace("t", "").replace("+", "").trim()) || 0;
}

function parsePbt(value: string): number {
  return Number(value.replace("t", "").trim()) || 0;
}

function calcularInfracaoTipo(passagens: PassagemRecente[]): InfracaoTipo[] {
  const contagem = {
    "Eixo Individual": 0,
    "Eixo Tandem": 0,
    "Excesso de PBT": 0,
    "Carga Irregular": 0
  };

  passagens.forEach((item) => {
    if (item.status === "Excesso Eixo") {
      contagem["Eixo Individual"] += 1;
    } else if (item.status === "Excesso PBT") {
      contagem["Excesso de PBT"] += 1;
    }
  });

  return Object.entries(contagem).map(([name, value]) => ({
    name,
    value
  }));
}

function calcularUltimasInfracoes(
  passagens: PassagemRecente[],
  localPadraoInfracao: string,
  maxUltimasInfracoes: number
): UltimaInfracao[] {
  return passagens
    .filter((item) => item.statusClass !== "ok")
    .slice(0, maxUltimasInfracoes)
    .map((item) => ({
      placa: item.placa,
      descricao:
        item.status === "Excesso Eixo"
          ? `Excesso de ${item.excesso} no conjunto de eixos`
          : `Excesso de ${item.excesso} no PBT`,
      tipoVeiculo: item.tipoVeiculo,
      local: localPadraoInfracao
    }));
}

function atualizarPassagensHora(
  base: PassagemHora[],
  indiceRegistro: number
): PassagemHora[] {
  const copia = [...base];
  const posicao = indiceRegistro % copia.length;

  copia[posicao] = {
    ...copia[posicao],
    passagens: copia[posicao].passagens + 1
  };

  return copia;
}

export default function Dashboard() {
  const dados = dashboardData as DashboardJson;

  const [passagensDia, setPassagensDia] = useState<number>(
    Math.min(
      Number(
        dados.stats.find((item) => item.title === "Passagens Hoje")?.value
      ) || 0,
      dados.config.limitePassagensDia
    )
  );

  const [passagensRecentes, setPassagensRecentes] = useState<PassagemRecente[]>(
    dados.passagensRecentes
  );

  const [passagensHora, setPassagensHora] = useState<PassagemHora[]>(
    dados.passagensHora
  );

  const indiceAtual = useRef(0);
  const indiceIntervalo = useRef(0);
  const timeoutRef = useRef<number | null>(null);

  const tooltipStyle = dados.tooltip;
  const labelStyle = {
    color: "#ffffff",
    fontWeight: 500 as const
  };
  const itemStyle = {
    color: "#e5e7eb"
  };

  useEffect(() => {
    if (passagensDia >= dados.config.limitePassagensDia) {
      return;
    }

    const tempo =
      dados.config.intervalosEntrada[
        indiceIntervalo.current % dados.config.intervalosEntrada.length
      ];

    timeoutRef.current = window.setTimeout(() => {
      const proximoRegistro =
        dados.novosRegistros[indiceAtual.current % dados.novosRegistros.length];

      setPassagensRecentes((anterior) => [proximoRegistro, ...anterior]);
      setPassagensHora((anterior) =>
        atualizarPassagensHora(anterior, indiceAtual.current)
      );
      setPassagensDia((valorAtual) =>
        Math.min(valorAtual + 1, dados.config.limitePassagensDia)
      );

      indiceAtual.current += 1;
      indiceIntervalo.current += 1;
    }, tempo);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [passagensDia, dados]);

  const aprovados = useMemo(
    () => passagensRecentes.filter((item) => item.statusClass === "ok").length,
    [passagensRecentes]
  );

  const infracoes = useMemo(
    () => passagensRecentes.filter((item) => item.statusClass !== "ok").length,
    [passagensRecentes]
  );

  const conformidade = useMemo(() => {
    if (!passagensRecentes.length) return "0%";
    return `${Math.round((aprovados / passagensRecentes.length) * 100)}%`;
  }, [aprovados, passagensRecentes]);

  const pesoMedio = useMemo(() => {
    if (!passagensRecentes.length) return "0.0t";

    const soma = passagensRecentes.reduce(
      (acc, item) => acc + parsePbt(item.pbt),
      0
    );

    return `${(soma / passagensRecentes.length).toFixed(1)}t`;
  }, [passagensRecentes]);

  const maiorExcesso = useMemo(() => {
    const maior = Math.max(
      ...passagensRecentes.map((item) => parseToneladas(item.excesso))
    );
    return `${maior.toFixed(1)}t`;
  }, [passagensRecentes]);

  const stats: StatItem[] = useMemo(
    () =>
      dados.stats.map((item) => {
        switch (item.title) {
          case "Passagens Hoje":
            return {
              ...item,
              value: passagensDia,
              description:
                passagensDia >= dados.config.limitePassagensDia
                  ? "Limite diário atingido"
                  : "Atualização automática"
            };

          case "Aprovados":
            return {
              ...item,
              value: aprovados
            };

          case "Infrações":
            return {
              ...item,
              value: infracoes
            };

          case "Conformidade":
            return {
              ...item,
              value: conformidade
            };

          case "Peso Médio":
            return {
              ...item,
              value: pesoMedio
            };

          case "Maior Excesso":
            return {
              ...item,
              value: maiorExcesso
            };

          default:
            return item;
        }
      }),
    [
      dados.stats,
      dados.config.limitePassagensDia,
      passagensDia,
      aprovados,
      infracoes,
      conformidade,
      pesoMedio,
      maiorExcesso
    ]
  );

  const infracoesTipo = useMemo(
    () => calcularInfracaoTipo(passagensRecentes),
    [passagensRecentes]
  );

  const ultimasInfracoes = useMemo(
    () =>
      calcularUltimasInfracoes(
        passagensRecentes,
        dados.config.localPadraoInfracao,
        dados.config.maxUltimasInfracoes
      ),
    [
      passagensRecentes,
      dados.config.localPadraoInfracao,
      dados.config.maxUltimasInfracoes
    ]
  );

  return (
    <div className="dashboard mt-3">
      <h1 className="page-title">Dashboard</h1>

      <div className="row g-3 mb-4">
        {stats.map((s, i) => (
          <div key={i} className="col-12 col-sm-6 col-md-4 col-xl-2">
            <StatCard {...s} />
          </div>
        ))}
      </div>

      <div className="row g-3 mb-4">
        <div className="col-12 col-lg-7">
          <CardMain title="Passagens por Hora">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={passagensHora}>
                <XAxis dataKey="hora" />
                <YAxis />
                <Tooltip
                  contentStyle={tooltipStyle}
                  labelStyle={labelStyle}
                  itemStyle={itemStyle}
                  cursor={{ stroke: "#374151", strokeWidth: 1 }}
                />
                <Line
                  type="monotone"
                  dataKey="passagens"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  isAnimationActive={true}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardMain>
        </div>

        <div className="col-12 col-lg-5">
          <CardMain title="Infrações por Tipo">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={infracoesTipo}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={85}
                  label
                  isAnimationActive={true}
                >
                  {infracoesTipo.map((_, index) => (
                    <Cell
                      key={index}
                      fill={dados.colors[index % dados.colors.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={tooltipStyle}
                  labelStyle={labelStyle}
                  itemStyle={itemStyle}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardMain>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-12 col-xl-9">
          <CardMain title="Passagens Recentes">
            <div className="table-responsive recent-table-container">
              <table className="w-100 recent-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Placa</th>
                    <th>Data</th>
                    <th>Tipo</th>
                    <th>PBT</th>
                    <th>Limite</th>
                    <th>Excesso</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {passagensRecentes.map((item, index) => (
                    <tr key={`${item.id}-${index}`}>
                      <td>{item.id}</td>
                      <td>{item.placa}</td>
                      <td>{item.data}</td>
                      <td>{item.tipoVeiculo}</td>
                      <td>{item.pbt}</td>
                      <td>{item.limite}</td>
                      <td>{item.excesso}</td>
                      <td>
                        <span className={`status ${item.statusClass}`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardMain>
        </div>

        <div className="col-12 col-xl-3">
          <CardMain title="Últimas Infrações">
            <div className="recent-table-container infractions-scroll">
              {ultimasInfracoes.map((item, index) => (
                <div className="infraction" key={`${item.placa}-${index}`}>
                  <strong>{item.placa}</strong>
                  <span>{item.descricao}</span>
                  <small style={{ color: "#9ca3af", marginTop: "4px" }}>
                    {item.tipoVeiculo} • {item.local}
                  </small>
                </div>
              ))}
            </div>
          </CardMain>
        </div>
      </div>
    </div>
  );
}