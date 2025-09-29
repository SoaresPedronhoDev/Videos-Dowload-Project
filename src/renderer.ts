

interface Window {
  electronAPI: {
    escolherPasta: () => Promise<string | null>;
    baixarVideo: (link: string, pasta: string) => Promise<{ sucesso: boolean; mensagem: string }>;
    onDownloadProgress: (callback: (progress: { percentage: number; speed: string; eta: string; status: string }) => void) => void;
  };
}


const botaoStart = document.querySelector('#start-button') as HTMLButtonElement;
const botaoPasta = document.querySelector(".button") as HTMLButtonElement;
const caminhoPastaEl = document.getElementById("caminho-pasta") as HTMLParagraphElement;

const inputLink = document.getElementById("video-link-input") as HTMLInputElement;
const btnEnviar = document.getElementById("enviar-link") as HTMLButtonElement;

// elementos da barra de progresso
const progressContainer = document.getElementById("progress-container") as HTMLDivElement;
const progressText = document.getElementById("progress-text") as HTMLSpanElement;
const progressPercentage = document.getElementById("progress-percentage") as HTMLSpanElement;
const progressFill = document.getElementById("progress-fill") as HTMLDivElement;
const downloadSpeed = document.getElementById("download-speed") as HTMLSpanElement;
const timeRemaining = document.getElementById("time-remaining") as HTMLSpanElement;

//para abrir a outra pagina
botaoStart?.addEventListener('click', () => {
  window.location.href = './VideosDowloader.html';
});

// para escolher a pasta de dowload
botaoPasta?.addEventListener("click", async () => {
  const pasta = await window.electronAPI.escolherPasta();

  if (pasta) {
    caminhoPastaEl.textContent = "📂 Pasta selecionada: " + pasta;
  } else {
    caminhoPastaEl.textContent = "Escolha sua pasta de Download";
  }
});

// funcao para atualizar a barra de progresso
function updateProgress(progress: { percentage: number; speed: string; eta: string; status: string }) {
  progressText.textContent = progress.status;
  progressPercentage.textContent = `${Math.round(progress.percentage)}%`;
  progressFill.style.width = `${progress.percentage}%`;
  downloadSpeed.textContent = `Velocidade: ${progress.speed}`;
  timeRemaining.textContent = `Tempo restante: ${progress.eta}`;
}

// funcao para mostrar/esconder a barra de progresso
function showProgress(show: boolean) {
  progressContainer.style.display = show ? 'block' : 'none';
  if (show) {
    updateProgress({ percentage: 0, speed: '--', eta: '--', status: 'Preparando download...' });
  }
}

// Configurar listener de progresso
window.electronAPI.onDownloadProgress(updateProgress);

// baixar video do youtube
btnEnviar?.addEventListener("click", async () => {
  const link = inputLink.value.trim();
  const pastaTexto = caminhoPastaEl.textContent || "";
  const pasta = pastaTexto.replace("📂 Pasta selecionada: ", "").trim();

  if (!link || !pasta) {
    alert("Escolha uma pasta e insira um link válido.");
    return;
  }

  // Mostrar barra de progresso
  showProgress(true);
  btnEnviar.disabled = true;
  btnEnviar.textContent = "Baixando...";

  try {
    const resultado = await window.electronAPI.baixarVideo(link, pasta);

    if (resultado.sucesso) {
      updateProgress({ percentage: 100, speed: 'Concluído', eta: '0s', status: 'Download concluído!' });
      setTimeout(() => {
        showProgress(false);
        alert("✅ " + resultado.mensagem);
        inputLink.value = "";
      }, 2000);
    } else {
      showProgress(false);
      alert("❌ " + resultado.mensagem);
    }
  } catch (error) {
    showProgress(false);
    alert("❌ Erro inesperado: " + error);
  } finally {
    btnEnviar.disabled = false;
    btnEnviar.textContent = "Baixar";
  }
});
