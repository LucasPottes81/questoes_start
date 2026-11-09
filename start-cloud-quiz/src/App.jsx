
import { useEffect, useState } from "react";

// Lista de quadros disponíveis
const quadros = [
  {
    id: 1,
    titulo: "Quadro 1",
    arquivo: "quadro1.json",
  },
  {
    id: 2,
    titulo: "Quadro 2",
    arquivo: "quadro2.json",
  },
];

function App() {
  const [questoes, setQuestoes] = useState([]);
  const [questaoAtual, setQuestaoAtual] = useState(0);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [respostaSelecionada, setRespostaSelecionada] = useState(null);
  const [quadroSelecionado, setQuadroSelecionado] = useState(null);

  // Carrega o JSON correspondente ao quadro escolhido
  useEffect(() => {
    if (!quadroSelecionado) return;

    const controller = new AbortController();

    async function carregarQuestoes() {
      setCarregando(true);
      setErro("");

      try {
        const resposta = await fetch(
          `/questoes/${quadroSelecionado.arquivo}`,
          { signal: controller.signal }
        );

        if (!resposta.ok) {
          throw new Error("Não foi possível carregar o quadro.");
        }

        const dados = await resposta.json();

        if (!Array.isArray(dados)) {
          throw new Error("O JSON precisa conter uma lista de questões.");
        }

        setQuestoes(dados);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error(error);
          setErro(error.message);
          setQuestoes([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setCarregando(false);
        }
      }
    }

    carregarQuestoes();

    return () => controller.abort();
  }, [quadroSelecionado]);

  // Abre o quadro selecionado
  function abrirQuadro(quadro) {
    setQuestoes([]);
    setQuestaoAtual(0);
    setRespostaSelecionada(null);
    setErro("");
    setCarregando(true);
    setQuadroSelecionado(quadro);
  }

  // Volta para a página inicial
  function voltarAosQuadros() {
    setQuadroSelecionado(null);
    setQuestoes([]);
    setQuestaoAtual(0);
    setRespostaSelecionada(null);
    setErro("");
    setCarregando(false);
  }

  // Registra a alternativa selecionada
  function selecionarResposta(index) {
    if (respostaSelecionada !== null) return;

    setRespostaSelecionada(index);
  }

  // Avança para a próxima questão
  function proximaQuestao() {
    if (questaoAtual < questoes.length - 1) {
      setQuestaoAtual(questaoAtual + 1);
      setRespostaSelecionada(null);
    }
  }

  // Retorna à questão anterior
  function questaoAnterior() {
    if (questaoAtual > 0) {
      setQuestaoAtual(questaoAtual - 1);
      setRespostaSelecionada(null);
    }
  }

  // PÁGINA INICIAL: seleção dos quadros
  if (!quadroSelecionado) {
    return (
      <main className="container">
        <header>
          <h1>☁️ Start Quiz AWS</h1>
          <p>Selecione o quadro da monitoria</p>
        </header>

        <section className="lista-quadros">
          {quadros.map((quadro) => (
            <button
              key={quadro.id}
              className="card-quadro"
              onClick={() => abrirQuadro(quadro)}
            >
              <h2>{quadro.titulo}</h2>
              <p>Questões AWS Cloud Practitioner</p>
              <span>Abrir quadro →</span>
            </button>
          ))}
        </section>
      </main>
    );
  }

  // CARREGAMENTO
  if (carregando) {
    return (
      <main className="container">
        <p>Carregando questões...</p>
      </main>
    );
  }

  // TRATAMENTO DE ERRO
  if (erro || questoes.length === 0) {
    return (
      <main className="container">
        <h2>{erro || "Nenhuma questão encontrada."}</h2>

        <button onClick={voltarAosQuadros}>
          ← Voltar aos quadros
        </button>
      </main>
    );
  }

  const questao = questoes[questaoAtual];

  // PÁGINA DE QUESTÕES
  return (
    <main className="container">
      <header>
        <h1>☁️ Start Quiz AWS</h1>
        <p>Monitoria AWS Cloud Practitioner</p>
      </header>

      <section className="quiz">
        <button
          className="voltar-quadros"
          onClick={voltarAosQuadros}
        >
          ← Voltar aos quadros
        </button>

        <span className="contador">
          {quadroSelecionado.titulo} | Questão {questaoAtual + 1} de{" "}
          {questoes.length}
        </span>

        <h2>{questao.pergunta}</h2>

        <div className="alternativas">
          {questao.alternativas.map((alternativa, index) => {
            const correta = index === questao.correta;
            const selecionada = index === respostaSelecionada;

            let classe = "alternativa";

            if (respostaSelecionada !== null) {
              if (correta) {
                classe += " correta";
              } else if (selecionada) {
                classe += " incorreta";
              }
            }

            return (
              <button
                key={index}
                className={classe}
                onClick={() => selecionarResposta(index)}
                disabled={respostaSelecionada !== null}
              >
                <strong>
                  {String.fromCharCode(65 + index)}
                </strong>
                {alternativa}
              </button>
            );
          })}
        </div>

        {respostaSelecionada !== null && (
          <div
            className={
              respostaSelecionada === questao.correta
                ? "resultado acerto"
                : "resultado erro"
            }
          >
            <h3>
              {respostaSelecionada === questao.correta
                ? "✅ Resposta correta!"
                : "❌ Resposta incorreta!"}
            </h3>

            <p>{questao.explicacao}</p>
          </div>
        )}

        <div className="navegacao">
          <button
            onClick={questaoAnterior}
            disabled={questaoAtual === 0}
          >
            ← Anterior
          </button>

          <button
            onClick={proximaQuestao}
            disabled={questaoAtual === questoes.length - 1}
          >
            Próxima →
          </button>
        </div>
      </section>
    </main>
  );
}

export default App;
