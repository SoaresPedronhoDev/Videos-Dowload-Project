

interface Window {
  electronAPI: {
    escolherPasta: () => Promise<string | null>;
    baixarVideo: (link: string, pasta: string) => Promise<{ sucesso: boolean; mensagem: string }>;
    onDownloadProgress: (callback: (progress: { percentage: number; speed: string; eta: string; status: string }) => void) => void;
    obterVideosBaixados: () => Promise<Array<{ titulo: string; caminho: string; data: string; tamanho: string }>>;
  };
}

// Elementos DOM
const elements = {
  botaoStart: document.querySelector('#start-button') as HTMLButtonElement,
  botaoPasta: document.querySelector(".button") as HTMLButtonElement,
  caminhoPastaEl: document.getElementById("caminho-pasta") as HTMLParagraphElement,
  inputLink: document.getElementById("video-link-input") as HTMLInputElement,
  btnEnviar: document.getElementById("enviar-link") as HTMLButtonElement,
  btnVerVideos: document.getElementById("btn-ver-videos") as HTMLButtonElement,
  videosContainer: document.getElementById("videos-container") as HTMLDivElement,
  videosList: document.getElementById("videos-list") as HTMLDivElement,
  btnFecharVideos: document.getElementById("btn-fechar-videos") as HTMLButtonElement,
  progressContainer: document.getElementById("progress-container") as HTMLDivElement,
  progressText: document.getElementById("progress-text") as HTMLSpanElement,
  progressPercentage: document.getElementById("progress-percentage") as HTMLSpanElement,
  progressFill: document.getElementById("progress-fill") as HTMLDivElement,
  downloadSpeed: document.getElementById("download-speed") as HTMLSpanElement,
  timeRemaining: document.getElementById("time-remaining") as HTMLSpanElement
}

//para abrir a outra pagina
elements.botaoStart?.addEventListener('click', () => {
  window.location.href = './VideosDowloader.html';
});

// para escolher a pasta de dowload
elements.botaoPasta?.addEventListener("click", async () => {
  const pasta = await window.electronAPI.escolherPasta();

  if (pasta) {
    elements.caminhoPastaEl.textContent = "📂 Pasta selecionada: " + pasta;
  } else {
    elements.caminhoPastaEl.textContent = "Escolha sua pasta de Download";
  }
});

// funcao para atualizar a barra de progresso
function updateProgress(progress: { percentage: number; speed: string; eta: string; status: string }) {
  elements.progressText.textContent = progress.status;
  elements.progressPercentage.textContent = `${Math.round(progress.percentage)}%`;
  elements.progressFill.style.width = `${progress.percentage}%`;
  elements.downloadSpeed.textContent = `Velocidade: ${progress.speed}`;
  elements.timeRemaining.textContent = `Tempo restante: ${progress.eta}`;
}

// funcao para mostrar/esconder a barra de progresso
function showProgress(show: boolean) {
  elements.progressContainer.style.display = show ? 'block' : 'none';
  if (show) {
    updateProgress({ percentage: 0, speed: '--', eta: '--', status: 'Preparando download...' });
  }
}

// cnfigurar listener de progresso
window.electronAPI.onDownloadProgress(updateProgress);

// ===== Funções para gerenciar vídeos =====

// Função para mostrar/ocultar a lista de vídeos
function toggleVideosContainer() {
  if (elements.videosContainer.style.display === 'none' || elements.videosContainer.style.display === '') {
    elements.videosContainer.style.display = 'block';
    carregarVideosBaixados();
  } else {
    elements.videosContainer.style.display = 'none';
  }
}

// função para carregar e exibir os vídeos baixados
async function carregarVideosBaixados() {
  try {
    elements.videosList.innerHTML = '<div class="empty-videos">Carregando vídeos...</div>';
    
    const videos = await window.electronAPI.obterVideosBaixados();
    
    if (videos.length === 0) {
      elements.videosList.innerHTML = '<div class="empty-videos">Nenhum vídeo baixado ainda</div>';
      return;
    }

    elements.videosList.innerHTML = '';
    
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
      
      elements.videosList.appendChild(videoItem);
    });
    
  } catch (error) {
    console.error('Erro ao carregar vídeos:', error);
    elements.videosList.innerHTML = '<div class="empty-videos">Erro ao carregar vídeos</div>';
  }
}

// event listeners para os botões de vídeos
elements.btnVerVideos?.addEventListener('click', toggleVideosContainer);
elements.btnFecharVideos?.addEventListener('click', () => {
  elements.videosContainer.style.display = 'none';
});

// baixar video do youtube
elements.btnEnviar?.addEventListener("click", async () => {
  const link = elements.inputLink.value.trim();
  const pastaTexto = elements.caminhoPastaEl.textContent || "";
  const pasta = pastaTexto.replace("📂 Pasta selecionada: ", "").trim();

  if (!link || !pasta) {
    alert("Escolha uma pasta e insira um link válido.");
    return;
  }

  // mostrar barra de progresso
  showProgress(true);
  elements.btnEnviar.disabled = true;
  elements.btnEnviar.textContent = "Baixando...";

  try {
    const resultado = await window.electronAPI.baixarVideo(link, pasta);

    if (resultado.sucesso) {
      updateProgress({ percentage: 100, speed: 'Concluído', eta: '0s', status: 'Download concluído!' });
      setTimeout(() => {
        showProgress(false);
        alert("✅ " + resultado.mensagem);
        elements.inputLink.value = "";
        // Recarregar lista de vídeos se estiver visível
        if (elements.videosContainer.style.display === 'block') {
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
    elements.btnEnviar.disabled = false;
    elements.btnEnviar.textContent = "Baixar";
  }
});
