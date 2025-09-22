interface Window {
  electronAPI: {
    escolherPasta: () => Promise<string | null>;
  };
}

const botaoStart = document.querySelector('#start-button');
const botao = document.querySelector(".button");
const caminhoPasta = document.getElementById("caminho-pasta");

// eventro pra abrir outra janela
botaoStart?.addEventListener('click', () => {
  window.location.href = './VideosDowloader.html';
});

// evento de escolher pasta de download
botao?.addEventListener("click", async () => {
  const pasta = await window.electronAPI.escolherPasta();
  console.log('deu certo')

  if (pasta) {
    caminhoPasta!.textContent = " Pasta selecionada: " + pasta;
  } else {
    caminhoPasta!.textContent = "Escolha sua pasta de Download";
  }
});
