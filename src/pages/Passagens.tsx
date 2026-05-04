import { useMemo, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from "recharts";

import StatCard from "../components/ui/StatCard";
import CardMain from "../components/ui/CardMain";
import Table from "../components/ui/Table";
import Pagination from "../components/ui/Pagination";
import Modal from "../components/ui/Modal";
import ModalTabs from "../components/ui/ModalTabs";
import DetailSection from "../components/ui/DetailSection";
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
    sentido?: string;
    marca?: string;
    cargaDeclarada?: string;
    confiancaOcr?: string;
    imagemOcr?: string;
    relatorio?: {
        numero: string;
        situacao: string;
        observacao: string;
        baseLegal: string;
    };
    eixos?: {
        eixo: number;
        peso: string;
        limite: string;
    }[];
};

type VisualizacaoModal = "detalhes" | "relatorio" | "ocr";

type ChartItem = {
    name: string;
    value: number;
};

const REGISTROS_POR_PAGINA = 25;

const CHART_COLORS = ["#2563eb", "#16a34a", "#f59e0b", "#dc2626", "#7c3aed", "#0891b2", "#475569"];

function parseToneladas(value: string): number {
    if (!value || value === "-") return 0;
    return Number(value.replace("t", "").replace("+", "").trim()) || 0;
}

function getNumeroPassagem(id: string): number {
    return Number(id.replace(/\D/g, "")) || 0;
}

function formatarDataInput(date: Date): string {
    const ano = date.getFullYear();
    const mes = String(date.getMonth() + 1).padStart(2, "0");
    const dia = String(date.getDate()).padStart(2, "0");

    return `${ano}-${mes}-${dia}`;
}

function getInicioMesAtual(): string {
    const hoje = new Date();
    return formatarDataInput(new Date(hoje.getFullYear(), hoje.getMonth(), 1));
}

function getDataAtual(): string {
    return formatarDataInput(new Date());
}

function parseDataPassagem(data: string): Date | null {
    const [dataParte, horaParte = "00:00"] = data.split(" ");
    const [dia, mes, ano] = dataParte.split("/").map(Number);
    const [hora, minuto] = horaParte.split(":").map(Number);

    if (!dia || !mes || !ano) return null;

    return new Date(ano, mes - 1, dia, hora || 0, minuto || 0);
}

function getDataFimComHora(dataFim: string): Date {
    const fim = new Date(`${dataFim}T23:59:59`);
    return fim;
}

function agruparPorCampo(passagens: Passagem[], campo: keyof Passagem): ChartItem[] {
    const agrupado = passagens.reduce<Record<string, number>>((acc, item) => {
        const chave = String(item[campo] || "Não informado");
        acc[chave] = (acc[chave] || 0) + 1;
        return acc;
    }, {});

    return Object.entries(agrupado)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);
}

function agruparPassagensPorHora(passagens: Passagem[]): ChartItem[] {
    const agrupado = passagens.reduce<Record<string, number>>((acc, item) => {
        const data = parseDataPassagem(item.data);
        const hora = data ? `${String(data.getHours()).padStart(2, "0")}:00` : "Não informado";
        acc[hora] = (acc[hora] || 0) + 1;
        return acc;
    }, {});

    return Object.entries(agrupado)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => a.name.localeCompare(b.name));
}

function getPercentual(valor: number, total: number): string {
    if (!total) return "0%";
    return `${((valor / total) * 100).toFixed(1)}%`;
}

export default function Passagens() {
    const todasPassagens: Passagem[] = passagensData.passagens;

    const [busca, setBusca] = useState("");
    const [status, setStatus] = useState("todos");
    const [tipoVeiculo, setTipoVeiculo] = useState("todos");
    const [dataInicio, setDataInicio] = useState(getInicioMesAtual());
    const [dataFim, setDataFim] = useState(getDataAtual());
    const [paginaAtual, setPaginaAtual] = useState(1);
    const [passagemSelecionada, setPassagemSelecionada] =
        useState<Passagem | null>(null);

    const [visualizacaoModal, setVisualizacaoModal] =
        useState<VisualizacaoModal>("detalhes");

    const tiposVeiculo = useMemo(() => {
        return Array.from(new Set(todasPassagens.map((item) => item.tipoVeiculo)));
    }, [todasPassagens]);

    const periodoConsulta = useMemo(() => {
        return {
            inicio: dataInicio || getInicioMesAtual(),
            fim: dataFim || getDataAtual()
        };
    }, [dataInicio, dataFim]);

    const passagensFiltradas = useMemo(() => {
        const inicio = new Date(`${periodoConsulta.inicio}T00:00:00`);
        const fim = getDataFimComHora(periodoConsulta.fim);

        return todasPassagens
            .filter((item) => {
                const buscaFormatada = busca.toLowerCase();
                const dataPassagem = parseDataPassagem(item.data);

                const correspondeBusca =
                    item.placa.toLowerCase().includes(buscaFormatada) ||
                    item.id.toLowerCase().includes(buscaFormatada);

                const correspondeStatus = status === "todos" || item.status === status;

                const correspondeTipo =
                    tipoVeiculo === "todos" || item.tipoVeiculo === tipoVeiculo;

                const correspondePeriodo =
                    !!dataPassagem && dataPassagem >= inicio && dataPassagem <= fim;

                return correspondeBusca && correspondeStatus && correspondeTipo && correspondePeriodo;
            })
            .sort((a, b) => getNumeroPassagem(b.id) - getNumeroPassagem(a.id));
    }, [todasPassagens, busca, status, tipoVeiculo, periodoConsulta]);

    const totalPaginas = Math.ceil(
        passagensFiltradas.length / REGISTROS_POR_PAGINA
    );

    const passagensPaginadas = useMemo(() => {
        const inicio = (paginaAtual - 1) * REGISTROS_POR_PAGINA;
        const fim = inicio + REGISTROS_POR_PAGINA;

        return passagensFiltradas.slice(inicio, fim);
    }, [passagensFiltradas, paginaAtual]);

    function limparFiltros() {
        setBusca("");
        setStatus("todos");
        setTipoVeiculo("todos");
        setDataInicio(getInicioMesAtual());
        setDataFim(getDataAtual());
        setPaginaAtual(1);
    }

    function abrirModal(passagem: Passagem) {
        setPassagemSelecionada(passagem);
        setVisualizacaoModal("detalhes");
    }

    function fecharModal() {
        setPassagemSelecionada(null);
        setVisualizacaoModal("detalhes");
    }

    const totalPassagens = passagensFiltradas.length;

    const totalAprovadas = passagensFiltradas.filter(
        (item) => item.statusClass === "ok"
    ).length;

    const totalInfracoes = passagensFiltradas.filter(
        (item) => item.statusClass !== "ok"
    ).length;

    const totalExcessoPbt = passagensFiltradas.filter(
        (item) => item.status === "Excesso PBT"
    ).length;

    const totalExcessoEixo = passagensFiltradas.filter(
        (item) => item.status === "Excesso Eixo"
    ).length;

    const maiorExcesso = useMemo(() => {
        if (!passagensFiltradas.length) return "0.0t";

        const maior = Math.max(
            ...passagensFiltradas.map((item) => parseToneladas(item.excesso))
        );

        return `${maior.toFixed(1)}t`;
    }, [passagensFiltradas]);

    const pesoTotal = useMemo(() => {
        const total = passagensFiltradas.reduce(
            (acc, item) => acc + parseToneladas(item.pbt),
            0
        );

        return `${total.toFixed(1)}t`;
    }, [passagensFiltradas]);

    const stats = [
        {
            title: "Passagens",
            value: totalPassagens,
            description: "Registros encontrados"
        },
        {
            title: "Aprovadas",
            value: totalAprovadas,
            description: `${getPercentual(totalAprovadas, totalPassagens)} da consulta`
        },
        {
            title: "Infrações",
            value: totalInfracoes,
            description: `${getPercentual(totalInfracoes, totalPassagens)} da consulta`
        },
        {
            title: "Maior Excesso",
            value: maiorExcesso,
            description: "Maior excesso da consulta"
        }
    ];

    const graficoStatus = useMemo(() => {
        return agruparPorCampo(passagensFiltradas, "status");
    }, [passagensFiltradas]);

    const graficoTipoVeiculo = useMemo(() => {
        return agruparPorCampo(passagensFiltradas, "tipoVeiculo").slice(0, 8);
    }, [passagensFiltradas]);

    const graficoCausaInfracao = useMemo(() => {
        return agruparPorCampo(
            passagensFiltradas.filter((item) => item.statusClass !== "ok"),
            "status"
        );
    }, [passagensFiltradas]);

    const graficoPassagensHora = useMemo(() => {
        return agruparPassagensPorHora(passagensFiltradas);
    }, [passagensFiltradas]);

    function gerarRelatorioPdf() {
        const doc = new jsPDF("landscape", "mm", "a4");
        const dataGeracao = new Date().toLocaleString("pt-BR");

        doc.setFontSize(16);
        doc.text("Relatório de Passagens e Infrações", 14, 15);

        doc.setFontSize(10);
        doc.text(`Período: ${periodoConsulta.inicio.split("-").reverse().join("/")} até ${periodoConsulta.fim.split("-").reverse().join("/")}`, 14, 23);
        doc.text(`Gerado em: ${dataGeracao}`, 14, 29);
        doc.text(`Filtros: Busca: ${busca || "Todos"} | Status: ${status} | Tipo: ${tipoVeiculo}`, 14, 35);

        autoTable(doc, {
            startY: 42,
            head: [["Indicador", "Valor", "Descrição"]],
            body: [
                ["Passagens", String(totalPassagens), "Registros encontrados"],
                ["Aprovadas", String(totalAprovadas), getPercentual(totalAprovadas, totalPassagens)],
                ["Infrações", String(totalInfracoes), getPercentual(totalInfracoes, totalPassagens)],
                ["Excesso PBT", String(totalExcessoPbt), getPercentual(totalExcessoPbt, totalPassagens)],
                ["Excesso por Eixo", String(totalExcessoEixo), getPercentual(totalExcessoEixo, totalPassagens)],
                ["Maior excesso", maiorExcesso, "Maior excesso identificado"],
                ["Peso total registrado", pesoTotal, "Soma do PBT das passagens filtradas"]
            ],
            styles: { fontSize: 8 },
            headStyles: { fillColor: [31, 41, 55] }
        });

        autoTable(doc, {
            startY: (doc as any).lastAutoTable.finalY + 8,
            head: [["Causa / Status", "Quantidade", "%"]],
            body: graficoStatus.length
                ? graficoStatus.map((item) => [
                    item.name,
                    String(item.value),
                    getPercentual(item.value, totalPassagens)
                ])
                : [["Não há registros encontrados.", "-", "-"]],
            styles: { fontSize: 8 },
            headStyles: { fillColor: [31, 41, 55] }
        });

        autoTable(doc, {
            startY: (doc as any).lastAutoTable.finalY + 8,
            head: [["ID", "Placa", "Data", "Tipo", "Local", "PBT", "Limite", "Excesso", "Status", "Causa / Observação"]],
            body: passagensFiltradas.length
                ? passagensFiltradas.map((item) => [
                    item.id,
                    item.placa,
                    item.data,
                    item.tipoVeiculo,
                    item.local || "-",
                    item.pbt,
                    item.limite,
                    item.excesso,
                    item.status,
                    item.relatorio?.observacao || "-"
                ])
                : [["Não há registros encontrados.", "-", "-", "-", "-", "-", "-", "-", "-", "-"]],
            styles: { fontSize: 7, cellPadding: 1.5 },
            headStyles: { fillColor: [31, 41, 55] },
            columnStyles: {
                9: { cellWidth: 55 }
            }
        });

        doc.save(`relatorio-passagens-${periodoConsulta.inicio}-${periodoConsulta.fim}.pdf`);
    }

    return (
        <div className="passagens-page mt-3">
            <h1 className="page-title">Passagens</h1>

            <div className="mb-4">
                <CardMain title="Filtros de Consulta">
                    <div className="row g-3 passagens-filters">
                        <div className="col-12 col-md-2">
                            <div className="filter-group">
                                <label>Data início</label>
                                <input
                                    type="date"
                                    value={dataInicio}
                                    onChange={(e) => {
                                        setDataInicio(e.target.value);
                                        setPaginaAtual(1);
                                    }}
                                />
                            </div>
                        </div>

                        <div className="col-12 col-md-2">
                            <div className="filter-group">
                                <label>Data fim</label>
                                <input
                                    type="date"
                                    value={dataFim}
                                    onChange={(e) => {
                                        setDataFim(e.target.value);
                                        setPaginaAtual(1);
                                    }}
                                />
                            </div>
                        </div>

                        <div className="col-12 col-md-4">
                            <div className="filter-group">
                                <label>Buscar por placa ou ID</label>
                                <input
                                    type="text"
                                    placeholder="Ex: ABC-1234 ou PSG-001"
                                    value={busca}
                                    onChange={(e) => {
                                        setBusca(e.target.value);
                                        setPaginaAtual(1);
                                    }}
                                />
                            </div>
                        </div>

                        <div className="col-12 col-md-2">
                            <div className="filter-group">
                                <label>Status</label>
                                <select
                                    value={status}
                                    onChange={(e) => {
                                        setStatus(e.target.value);
                                        setPaginaAtual(1);
                                    }}
                                >
                                    <option value="todos">Todos</option>
                                    <option value="Aprovado">Aprovado</option>
                                    <option value="Excesso PBT">Excesso PBT</option>
                                    <option value="Excesso Eixo">Excesso Eixo</option>
                                </select>
                            </div>
                        </div>

                        <div className="col-12 col-md-2">
                            <div className="filter-group">
                                <label>Tipo de veículo</label>
                                <select
                                    value={tipoVeiculo}
                                    onChange={(e) => {
                                        setTipoVeiculo(e.target.value);
                                        setPaginaAtual(1);
                                    }}
                                >
                                    <option value="todos">Todos</option>
                                    {tiposVeiculo.map((tipo) => (
                                        <option key={tipo} value={tipo}>
                                            {tipo}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="col-12 col-md-12 d-flex align-items-end justify-content-md-end gap-2 mt-4">
                            <button className="filter-clear-button" onClick={limparFiltros}>
                                Limpar filtros
                            </button>

                            <button className="filter-clear-button" onClick={gerarRelatorioPdf}>
                                Gerar PDF
                            </button>
                        </div>
                    </div>
                </CardMain>
            </div>

            <div className="row g-3">
                {stats.map((item, index) => (
                    <div key={index} className="col-12 col-sm-6 col-xl-3">
                        <StatCard {...item} />
                    </div>
                ))}
            </div>

            <div className="row g-3 mt-1">
                <div className="col-12 col-xl-3">
                    <StatCard
                        title="Excesso PBT"
                        value={totalExcessoPbt}
                        description={`${getPercentual(totalExcessoPbt, totalPassagens)} da consulta`}
                    />
                </div>

                <div className="col-12 col-xl-3">
                    <StatCard
                        title="Excesso Eixo"
                        value={totalExcessoEixo}
                        description={`${getPercentual(totalExcessoEixo, totalPassagens)} da consulta`}
                    />
                </div>

                <div className="col-12 col-xl-3">
                    <StatCard
                        title="Peso Total"
                        value={pesoTotal}
                        description="Soma do PBT filtrado"
                    />
                </div>

                <div className="col-12 col-xl-3">
                    <StatCard
                        title="Período"
                        value={totalPassagens}
                        description={`${periodoConsulta.inicio.split("-").reverse().join("/")} até ${periodoConsulta.fim.split("-").reverse().join("/")}`}
                    />
                </div>
            </div>

            <div className="row g-3 mt-1">
                <div className="col-12 col-xl-6">
                    <CardMain title="Passagens por Hora">
                        <div style={{ width: "100%", height: 280 }}>
                            <ResponsiveContainer>
                                <BarChart data={graficoPassagensHora}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis allowDecimals={false} />
                                    <Tooltip />
                                    <Bar dataKey="value" name="Passagens" fill="#2563eb" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardMain>
                </div>

                <div className="col-12 col-xl-6">
                    <CardMain title="Passagens por Status">
                        <div style={{ width: "100%", height: 280 }}>
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie
                                        data={graficoStatus}
                                        dataKey="value"
                                        nameKey="name"
                                        outerRadius={90}
                                        label
                                    >
                                        {graficoStatus.map((_, index) => (
                                            <Cell
                                                key={`status-${index}`}
                                                fill={CHART_COLORS[index % CHART_COLORS.length]}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardMain>
                </div>

                <div className="col-12 col-xl-6">
                    <CardMain title="Tipos de Veículo mais Frequentes">
                        <div style={{ width: "100%", height: 280 }}>
                            <ResponsiveContainer>
                                <BarChart data={graficoTipoVeiculo}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis allowDecimals={false} />
                                    <Tooltip />
                                    <Bar dataKey="value" name="Passagens" fill="#16a34a" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardMain>
                </div>

                <div className="col-12 col-xl-6">
                    <CardMain title="Causas de Infração">
                        <div style={{ width: "100%", height: 280 }}>
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie
                                        data={graficoCausaInfracao}
                                        dataKey="value"
                                        nameKey="name"
                                        outerRadius={90}
                                        label
                                    >
                                        {graficoCausaInfracao.map((_, index) => (
                                            <Cell
                                                key={`causa-${index}`}
                                                fill={CHART_COLORS[index % CHART_COLORS.length]}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardMain>
                </div>
            </div>

            <div className="row g-3 mt-1">
                <div className="col-12">
                    <CardMain title="Lista de Passagens">
                        <Table<Passagem>
                            data={passagensPaginadas}
                            emptyMessage="Nenhuma passagem encontrada com os filtros selecionados."
                            columns={[
                                { header: "ID", accessor: "id" },
                                { header: "Placa", accessor: "placa" },
                                { header: "Data", accessor: "data" },
                                { header: "Tipo", accessor: "tipoVeiculo" },
                                { header: "PBT", accessor: "pbt" },
                                { header: "Limite", accessor: "limite" },
                                { header: "Excesso", accessor: "excesso" },
                                {
                                    header: "Status",
                                    render: (item) => (
                                        <span className={`status ${item.statusClass}`}>
                                            {item.status}
                                        </span>
                                    )
                                },
                                {
                                    header: "Ação",
                                    render: (item) => (
                                        <button
                                            className="table-action-button"
                                            onClick={() => abrirModal(item)}
                                        >
                                            Detalhes
                                        </button>
                                    )
                                }
                            ]}
                        />

                        <Pagination
                            paginaAtual={paginaAtual}
                            totalPaginas={totalPaginas}
                            quantidadeAtual={passagensPaginadas.length}
                            totalRegistros={passagensFiltradas.length}
                            onAnterior={() => setPaginaAtual((pagina) => pagina - 1)}
                            onProxima={() => setPaginaAtual((pagina) => pagina + 1)}
                        />
                    </CardMain>
                </div>
            </div>

            <Modal
                show={!!passagemSelecionada}
                title={
                    visualizacaoModal === "detalhes"
                        ? "Detalhes da Passagem"
                        : visualizacaoModal === "relatorio"
                            ? "Relatório da Passagem"
                            : "Imagem OCR"
                }
                subtitle={passagemSelecionada?.id}
                size="xl"
                onClose={fecharModal}
            >
                {passagemSelecionada && (
                    <>
                        <ModalTabs<VisualizacaoModal>
                            tabs={[
                                { key: "detalhes", label: "Detalhes" },
                                { key: "relatorio", label: "Relatório" },
                                { key: "ocr", label: "OCR" }
                            ]}
                            activeTab={visualizacaoModal}
                            onChange={setVisualizacaoModal}
                        />

                        {visualizacaoModal === "detalhes" && (
                            <div className="passagem-details-bootstrap">
                                <DetailSection title="Dados do Veículo">
                                    <p>
                                        <strong>Placa:</strong> {passagemSelecionada.placa}
                                    </p>

                                    <p>
                                        <strong>Tipo de veículo:</strong>{" "}
                                        {passagemSelecionada.tipoVeiculo}
                                        {passagemSelecionada.descricaoTipo
                                            ? ` - ${passagemSelecionada.descricaoTipo}`
                                            : ""}
                                    </p>

                                    <p>
                                        <strong>Marca:</strong>{" "}
                                        {passagemSelecionada.marca || "Não informado"}
                                    </p>

                                    <p>
                                        <strong>Carga declarada:</strong>{" "}
                                        {passagemSelecionada.cargaDeclarada || "Não informado"}
                                    </p>
                                </DetailSection>

                                <DetailSection title="Dados da Passagem">
                                    <p>
                                        <strong>Data:</strong> {passagemSelecionada.data}
                                    </p>

                                    <p>
                                        <strong>Local:</strong>{" "}
                                        {passagemSelecionada.local || "Não informado"}
                                    </p>

                                    <p>
                                        <strong>Velocidade:</strong>{" "}
                                        {passagemSelecionada.velocidade || "Não informado"}
                                    </p>

                                    <p>
                                        <strong>Sentido / Faixa:</strong>{" "}
                                        {passagemSelecionada.sentido || "Não informado"} /{" "}
                                        {passagemSelecionada.faixa || "Não informado"}
                                    </p>
                                </DetailSection>

                                <DetailSection title="Resultado da Pesagem">
                                    <p>
                                        <strong>PBT registrado:</strong> {passagemSelecionada.pbt}
                                    </p>

                                    <p>
                                        <strong>Limite permitido:</strong>{" "}
                                        {passagemSelecionada.limite}
                                    </p>

                                    <p>
                                        <strong>Excesso:</strong> {passagemSelecionada.excesso}
                                    </p>

                                    <p>
                                        <strong>Status:</strong>{" "}
                                        <span
                                            className={`status ${passagemSelecionada.statusClass}`}
                                        >
                                            {passagemSelecionada.status}
                                        </span>
                                    </p>
                                </DetailSection>
                            </div>
                        )}

                        {visualizacaoModal === "relatorio" && (
                            <div className="passagem-details-bootstrap">
                                <DetailSection title="Relatório de Monitoramento">
                                    <p>
                                        <strong>Número:</strong>{" "}
                                        {passagemSelecionada.relatorio?.numero || "Não informado"}
                                    </p>

                                    <p>
                                        <strong>Situação:</strong>{" "}
                                        {passagemSelecionada.relatorio?.situacao ||
                                            "Não informado"}
                                    </p>

                                    <p>
                                        <strong>Base legal:</strong>{" "}
                                        {passagemSelecionada.relatorio?.baseLegal ||
                                            "Não informado"}
                                    </p>

                                    <p>
                                        <strong>Observação:</strong>{" "}
                                        {passagemSelecionada.relatorio?.observacao ||
                                            "Não informado"}
                                    </p>
                                </DetailSection>

                                <DetailSection title="Dados da Passagem">
                                    <p>
                                        <strong>Placa:</strong> {passagemSelecionada.placa}
                                    </p>

                                    <p>
                                        <strong>Veículo:</strong>{" "}
                                        {passagemSelecionada.tipoVeiculo}
                                    </p>

                                    <p>
                                        <strong>Local:</strong>{" "}
                                        {passagemSelecionada.local || "Não informado"}
                                    </p>

                                    <p>
                                        <strong>Data:</strong> {passagemSelecionada.data}
                                    </p>

                                    <p>
                                        <strong>PBT registrado:</strong> {passagemSelecionada.pbt}
                                    </p>

                                    <p>
                                        <strong>Limite permitido:</strong>{" "}
                                        {passagemSelecionada.limite}
                                    </p>

                                    <p>
                                        <strong>Excesso:</strong> {passagemSelecionada.excesso}
                                    </p>

                                    <p>
                                        <strong>Status:</strong> {passagemSelecionada.status}
                                    </p>
                                </DetailSection>

                                <DetailSection title="Pesagem por Eixo">
                                    <Table
                                        data={passagemSelecionada.eixos || []}
                                        emptyMessage="Nenhum eixo informado."
                                        columns={[
                                            {
                                                header: "Eixo",
                                                render: (eixo) => `Eixo ${eixo.eixo}`
                                            },
                                            { header: "Peso", accessor: "peso" },
                                            { header: "Limite", accessor: "limite" }
                                        ]}
                                    />
                                </DetailSection>
                            </div>
                        )}

                        {visualizacaoModal === "ocr" && (
                            <div className="passagem-details-bootstrap">
                                <DetailSection title="Visualização OCR">
                                    <div className="ocr-image-box">
                                        <div className="ocr-plate">
                                            {passagemSelecionada.placa}
                                        </div>

                                        <div className="ocr-line"></div>

                                        <span>Imagem simulada OCR</span>
                                    </div>
                                </DetailSection>

                                <DetailSection title="Dados Reconhecidos">
                                    <p>
                                        <strong>Placa reconhecida:</strong>{" "}
                                        {passagemSelecionada.placa}
                                    </p>

                                    <p>
                                        <strong>Confiança OCR:</strong>{" "}
                                        {passagemSelecionada.confiancaOcr || "Não informado"}
                                    </p>

                                    <p>
                                        <strong>Arquivo da imagem:</strong>{" "}
                                        {passagemSelecionada.imagemOcr || "Não informado"}
                                    </p>
                                </DetailSection>
                            </div>
                        )}
                    </>
                )}
            </Modal>
        </div>
    );
}
