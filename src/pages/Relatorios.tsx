import { useMemo, useState } from "react";
import {
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Legend
} from "recharts";

import StatCard from "../components/ui/StatCard";
import CardMain from "../components/ui/CardMain";
import passagensData from "../data/passagens.json";

type Passagem = {
    id: string;
    placa: string;
    data: string;
    tipoVeiculo: string;
    descricaoTipo?: string;
    pbt: string;
    limite: string;
    excesso: string;
    status: string;
    statusClass: string;
    local?: string;
    velocidade?: string;
    faixa?: string;
    marca?: string;
};

const colors = ["#ef4444", "#f59e0b", "#3b82f6", "#10b981", "#8b5cf6"];

function parseToneladas(value: string): number {
    if (!value || value === "-") return 0;
    return Number(value.replace("t", "").replace("+", "").trim()) || 0;
}

function extrairHora(data: string): string {
    const partes = data.split(" ");
    if (!partes[1]) return "Não informado";
    return `${partes[1].split(":")[0]}h`;
}

export default function Relatorios() {
    const todasPassagens: Passagem[] = passagensData.passagens;

    const [local, setLocal] = useState("todos");
    const [tipoVeiculo, setTipoVeiculo] = useState("todos");
    const [status, setStatus] = useState("todos");
    const [dataBusca, setDataBusca] = useState("");

    const locais = Array.from(
        new Set(todasPassagens.map((p) => p.local).filter(Boolean))
    );

    const tipos = Array.from(
        new Set(todasPassagens.map((p) => p.tipoVeiculo))
    );

    const passagensFiltradas = useMemo(() => {
        return todasPassagens.filter((p) => {
            const correspondeLocal = local === "todos" || p.local === local;
            const correspondeTipo =
                tipoVeiculo === "todos" || p.tipoVeiculo === tipoVeiculo;
            const correspondeStatus = status === "todos" || p.status === status;
            const correspondeData = !dataBusca || p.data.includes(dataBusca);

            return (
                correspondeLocal &&
                correspondeTipo &&
                correspondeStatus &&
                correspondeData
            );
        });
    }, [todasPassagens, local, tipoVeiculo, status, dataBusca]);

    function contarPorCampo(campo: keyof Passagem) {
        const contagem: Record<string, number> = {};

        passagensFiltradas.forEach((item) => {
            const chave = String(item[campo] || "Não informado");
            contagem[chave] = (contagem[chave] || 0) + 1;
        });

        return Object.entries(contagem).map(([name, value]) => ({
            name,
            value
        }));
    }

    const passagensPorHora = useMemo(() => {
        const contagem: Record<string, number> = {};

        passagensFiltradas.forEach((item) => {
            const hora = extrairHora(item.data);
            contagem[hora] = (contagem[hora] || 0) + 1;
        });

        return Object.entries(contagem)
            .map(([hora, passagens]) => ({
                hora,
                passagens
            }))
            .sort((a, b) => a.hora.localeCompare(b.hora));
    }, [passagensFiltradas]);

    const infracoesPorTipo = useMemo(() => {
        return passagensFiltradas
            .filter((p) => p.statusClass !== "ok")
            .reduce<Record<string, number>>((acc, item) => {
                acc[item.status] = (acc[item.status] || 0) + 1;
                return acc;
            }, {});
    }, [passagensFiltradas]);

    const infracoesTipoData = Object.entries(infracoesPorTipo).map(
        ([name, value]) => ({
            name,
            value
        })
    );

    const passagensPorLocal = contarPorCampo("local");
    const passagensPorVeiculo = contarPorCampo("tipoVeiculo");

    const totalPassagens = passagensFiltradas.length;

    const aprovadas = passagensFiltradas.filter(
        (p) => p.statusClass === "ok"
    ).length;

    const infracoes = passagensFiltradas.filter(
        (p) => p.statusClass !== "ok"
    ).length;

    const conformidade = totalPassagens
        ? `${Math.round((aprovadas / totalPassagens) * 100)}%`
        : "0%";

    const pesoMedio = totalPassagens
        ? `${(
            passagensFiltradas.reduce(
                (acc, p) => acc + parseToneladas(p.pbt),
                0
            ) / totalPassagens
        ).toFixed(1)}t`
        : "0.0t";

    const maiorExcesso = passagensFiltradas.length
        ? `${Math.max(
            ...passagensFiltradas.map((p) => parseToneladas(p.excesso))
        ).toFixed(1)}t`
        : "0.0t";

    const stats = [
        {
            title: "Passagens",
            value: totalPassagens,
            description: "Registros filtrados"
        },
        {
            title: "Aprovadas",
            value: aprovadas,
            description: "Dentro dos limites"
        },
        {
            title: "Infrações",
            value: infracoes,
            description: "Com irregularidade"
        },
        {
            title: "Conformidade",
            value: conformidade,
            description: "Taxa de aprovação"
        },
        {
            title: "Peso Médio",
            value: pesoMedio,
            description: "Média do período"
        },
        {
            title: "Maior Excesso",
            value: maiorExcesso,
            description: "Maior excesso identificado"
        }
    ];

    function limparFiltros() {
        setLocal("todos");
        setTipoVeiculo("todos");
        setStatus("todos");
        setDataBusca("");
    }

    const tooltipStyle = {
        backgroundColor: "#0b0d11",
        border: "1px solid #1f2937",
        borderRadius: "8px",
        color: "#e5e7eb",
        fontSize: "13px"
    };

    return (
        <div className="relatorios-page mt-3">
            <h1 className="page-title">Relatórios</h1>

            <div className="row g-3 mb-4">
                {stats.map((item, index) => (
                    <div key={index} className="col-12 col-sm-6 col-md-4 col-xl-2">
                        <StatCard {...item} />
                    </div>
                ))}
            </div>

            <CardMain title="Filtros de Análise">
                <div className="row passagens-filters relatorios-filters">

                    <div className="col-12 col-md-3">
                        <div className="filter-group">
                            <label>Data</label>
                            <input
                                type="text"
                                placeholder="Ex: 17/03/2026"
                                value={dataBusca}
                                onChange={(e) => setDataBusca(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="col-12 col-md-3">
                        <div className="filter-group">
                            <label>Local</label>
                            <select value={local} onChange={(e) => setLocal(e.target.value)}>
                                <option value="todos">Todos</option>
                                {locais.map((item) => (
                                    <option key={item} value={item}>
                                        {item}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="col-12 col-md-3">
                        <div className="filter-group">
                            <label>Tipo de veículo</label>
                            <select
                                value={tipoVeiculo}
                                onChange={(e) => setTipoVeiculo(e.target.value)}
                            >
                                <option value="todos">Todos</option>
                                {tipos.map((item) => (
                                    <option key={item} value={item}>
                                        {item}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="col-12 col-md-3">
                        <div className="filter-group">
                            <label>Status</label>
                            <select value={status} onChange={(e) => setStatus(e.target.value)}>
                                <option value="todos">Todos</option>
                                <option value="Aprovado">Aprovado</option>
                                <option value="Excesso PBT">Excesso PBT</option>
                                <option value="Excesso Eixo">Excesso Eixo</option>
                            </select>
                        </div>
                    </div>

                    <div className="col-12 d-flex justify-content-end mt-4">
                        <button className="filter-clear-button" onClick={limparFiltros}>
                            Limpar filtros
                        </button>
                    </div>

                </div>
            </CardMain>

            <div className="row g-3 mt-1">
                <div className="col-12 col-xl-6">
                    <CardMain title="Evolução de Passagens por Hora">
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={passagensPorHora}>
                                <XAxis dataKey="hora" />
                                <YAxis />
                                <Tooltip contentStyle={tooltipStyle} />
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

                <div className="col-12 col-xl-6">
                    <CardMain title="Infrações por Tipo">
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie data={infracoesTipoData} dataKey="value" nameKey="name">
                                    {infracoesTipoData.map((_, index) => (
                                        <Cell key={index} fill={colors[index % colors.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={tooltipStyle} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardMain>
                </div>

                <div className="col-12 col-xl-6">
                    <CardMain title="Passagens por Local">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={passagensPorLocal}>
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip contentStyle={tooltipStyle} />
                                <Bar dataKey="value" fill="#3b82f6" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardMain>
                </div>

                <div className="col-12 col-xl-6">
                    <CardMain title="Passagens por Tipo de Veículo">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={passagensPorVeiculo}>
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip contentStyle={tooltipStyle} />
                                <Bar dataKey="value" fill="#10b981" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardMain>
                </div>
            </div>
        </div>
    );
}