import { useMemo, useState } from "react";

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

const REGISTROS_POR_PAGINA = 50;

function parseToneladas(value: string): number {
    if (value === "-") return 0;
    return Number(value.replace("t", "").replace("+", "").trim()) || 0;
}

function getNumeroPassagem(id: string): number {
    return Number(id.replace(/\D/g, "")) || 0;
}

export default function Passagens() {
    const todasPassagens: Passagem[] = passagensData.passagens;

    const [busca, setBusca] = useState("");
    const [status, setStatus] = useState("todos");
    const [tipoVeiculo, setTipoVeiculo] = useState("todos");
    const [paginaAtual, setPaginaAtual] = useState(1);
    const [passagemSelecionada, setPassagemSelecionada] =
        useState<Passagem | null>(null);

    const [visualizacaoModal, setVisualizacaoModal] =
        useState<VisualizacaoModal>("detalhes");

    const tiposVeiculo = useMemo(() => {
        return Array.from(new Set(todasPassagens.map((item) => item.tipoVeiculo)));
    }, [todasPassagens]);

    const passagensFiltradas = useMemo(() => {
        return todasPassagens
            .filter((item) => {
                const buscaFormatada = busca.toLowerCase();

                const correspondeBusca =
                    item.placa.toLowerCase().includes(buscaFormatada) ||
                    item.id.toLowerCase().includes(buscaFormatada);

                const correspondeStatus = status === "todos" || item.status === status;

                const correspondeTipo =
                    tipoVeiculo === "todos" || item.tipoVeiculo === tipoVeiculo;

                return correspondeBusca && correspondeStatus && correspondeTipo;
            })
            .sort((a, b) => getNumeroPassagem(b.id) - getNumeroPassagem(a.id));
    }, [todasPassagens, busca, status, tipoVeiculo]);

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

    const maiorExcesso = useMemo(() => {
        if (!passagensFiltradas.length) return "0.0t";

        const maior = Math.max(
            ...passagensFiltradas.map((item) => parseToneladas(item.excesso))
        );

        return `${maior.toFixed(1)}t`;
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
            description: "Dentro do limite permitido"
        },
        {
            title: "Infrações",
            value: totalInfracoes,
            description: "Com excesso identificado"
        },
        {
            title: "Maior Excesso",
            value: maiorExcesso,
            description: "Maior excesso da consulta"
        }
    ];

    return (
        <div className="passagens-page mt-3">
            <h1 className="page-title">Passagens</h1>

            <div className="row g-3 mb-4">
                {stats.map((item, index) => (
                    <div key={index} className="col-12 col-sm-6 col-xl-3">
                        <StatCard {...item} />
                    </div>
                ))}
            </div>

            <CardMain title="Filtros de Consulta">
                <div className="row g-3 passagens-filters">

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

                    <div className="col-12 col-md-4">
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

                    <div className="col-12 col-md-4">
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

                    <div className="col-12 d-flex justify-content-end mt-4">
                        <button className="filter-clear-button" onClick={limparFiltros}>
                            Limpar filtros
                        </button>
                    </div>

                </div>
            </CardMain>

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