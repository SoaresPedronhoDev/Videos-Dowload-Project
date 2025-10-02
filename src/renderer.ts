

interface Window {
  electronAPI: {
    escolherPasta: () => Promise<string | null>;
    baixarVideo: (link: string, pasta: string) => Promise<{ sucesso: boolean; mensagem: string }>;
    onDownloadProgress: (callback: (progress: { percentage: number; speed: string; eta: string; status: string }) => void) => void;
    obterVideosBaixados: () => Promise<Array<{ titulo: string; caminho: string; data: string; tamanho: string }>>;
  };
}

//elementos da secao de inicio
const botaoStart = document.querySelector('#start-button') as HTMLButtonElement;
const botaoPasta = document.querySelector(".button") as HTMLButtonElement;
const caminhoPastaEl = document.getElementById("caminho-pasta") as HTMLParagraphElement;

//elementos da secao de dowload
const inputLink = document.getElementById("video-link-input") as HTMLInputElement;
const btnEnviar = document.getElementById("enviar-link") as HTMLButtonElement;

//elementos da secao de videos
const btnVerVideos = document.getElementById("btn-ver-videos") as HTMLButtonElement;
const videosContainer = document.getElementById("videos-container") as HTMLDivElement;
const videosList = document.getElementById("videos-list") as HTMLDivElement;
const btnFecharVideos = document.getElementById("btn-fechar-videos") as HTMLButtonElement;

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

// cnfigurar listener de progresso
window.electronAPI.onDownloadProgress(updateProgress);

// ===== Funções para gerenciar vídeos =====

// Função para mostrar/ocultar a lista de vídeos
function toggleVideosContainer() {
  if (videosContainer.style.display === 'none' || videosContainer.style.display === '') {
    videosContainer.style.display = 'block';
    carregarVideosBaixados();
  } else {
    videosContainer.style.display = 'none';
  }
}

// função para carregar e exibir os vídeos baixados
async function carregarVideosBaixados() {
  try {
    videosList.innerHTML = '<div class="empty-videos">Carregando vídeos...</div>';
    
    const videos = await window.electronAPI.obterVideosBaixados();
    
    if (videos.length === 0) {
      videosList.innerHTML = '<div class="empty-videos">Nenhum vídeo baixado ainda</div>';
      return;
    }

    videosList.innerHTML = '';
    
    videos.forEach(video => {
      const videoItem = document.createElement('div');
      videoItem.className = 'video-item';
      
      const dataFormatada = new Date(video.data).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      videoItem.innerHTML = `
        <div class="video-title">${video.titulo}</div>
        <div class="video-info">
          <span class="video-date">${dataFormatada}</span>
          <span class="video-size">${video.tamanho}</span>
        </div>
      `;
      
      // adicionar evento de clique para abrir o arquivo
      videoItem.addEventListener('click', () => {
        // Aqui você pode implementar a abertura do arquivo
        console.log('Abrir vídeo:', video.caminho);
      });
      
      videosList.appendChild(videoItem);
    });
    
  } catch (error) {
    console.error('Erro ao carregar vídeos:', error);
    videosList.innerHTML = '<div class="empty-videos">Erro ao carregar vídeos</div>';
  }
}

// event listeners para os botões de vídeos
btnVerVideos?.addEventListener('click', toggleVideosContainer);
btnFecharVideos?.addEventListener('click', () => {
  videosContainer.style.display = 'none';
});

// baixar video do youtube
btnEnviar?.addEventListener("click", async () => {
  const link = inputLink.value.trim();
  const pastaTexto = caminhoPastaEl.textContent || "";
  const pasta = pastaTexto.replace("📂 Pasta selecionada: ", "").trim();

  if (!link || !pasta) {
    alert("Escolha uma pasta e insira um link válido.");
    return;
  }

  // mostrar barra de progresso
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
        // Recarregar lista de vídeos se estiver visível
        if (videosContainer.style.display === 'block') {
          carregarVideosBaixados();
        }
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
