

interface Window {
  electronAPI: {
    escolherPasta: () => Promise<string | null>;
    baixarVideo: (link: string, pasta: string) => Promise<{ sucesso: boolean; mensagem: string }>;
  };
}


const botaoStart = document.querySelector('#start-button') as HTMLButtonElement;
const botaoPasta = document.querySelector(".button") as HTMLButtonElement;
const caminhoPastaEl = document.getElementById("caminho-pasta") as HTMLParagraphElement;

const inputLink = document.getElementById("video-link-input") as HTMLInputElement;
const btnEnviar = document.getElementById("enviar-link") as HTMLButtonElement;

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

// baixar video do youtube
btnEnviar?.addEventListener("click", async () => {
  const link = inputLink.value.trim();
  const pastaTexto = caminhoPastaEl.textContent || "";
  const pasta = pastaTexto.replace("📂 Pasta selecionada: ", "").trim();

  if (!link || !pasta) {
    alert("Escolha uma pasta e insira um link válido.");
    return;
  }

  const resultado = await window.electronAPI.baixarVideo(link, pasta);

  if (resultado.sucesso) {
    alert("✅ " + resultado.mensagem);
    inputLink.value = "";
  } else {
    alert("❌ " + resultado.mensagem);
  }
});
