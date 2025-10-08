# VideoDownloader 🚀

![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Electron](https://img.shields.io/badge/Electron-37.3.0-purple)
![License](https://img.shields.io/badge/License-MIT-yellow)

Aplicativo desktop para **baixar vídeos** rapidamente, desenvolvido com **Electron, Node.js e TypeScript** e empacotado com **Electron Builder**.

---

## Funcionalidades ✨

- Baixar vídeos via URL
- Interface simples e intuitiva
- Build multiplataforma (Windows, Linux, macOS)
- Instalador pronto para distribuição

---

## Tecnologias 🛠️

- **Electron** – desktop app
- **Node.js** – backend
- **TypeScript** – tipagem e segurança
- **Electron Builder** – empacotamento e instalador

---

## Pré-requisitos 💻

- Node.js >= 18  
- npm >= 9  
- Git  
- Windows (ou outro SO compatível com Electron)

---

## Instalação e Build ⚙️

bash
# Clonar o repositório
git clone https://github.com/SoaresPedronhoDev/Videos-Dowload-Project.git
cd Videos-Dowload-Project

# Instalar dependências
npm install

# Compilar TypeScript
npm run build

# Gerar instalador
npm run dist
O instalador será gerado na pasta release/ (Windows) ou dist/ (outra plataforma).

Desenvolvimento 🏃
bash
Copiar código
npm start
Abre o app diretamente no Electron para testes.

Estrutura do projeto 📁
bash
Copiar código
VideoDownloader/
├── src/          # Código fonte TypeScript
├── release/      # Builds gerados
├── node_modules/ # Dependências
├── package.json  # Scripts e configs
└── tsconfig.json # Config TS
Scripts disponíveis 📜
Comando	Descrição
npm start	Rodar app em modo desenvolvimento
npm run build	Compilar TypeScript
npm run dist	Gerar instalador com Electron Builder

Observações ⚠️
Não versionar arquivos .exe grandes no GitHub (>100MB)

Use GitHub Releases ou outro serviço para distribuir instaladores

No Windows, execute o build como administrador ou ative Modo de Desenvolvedor para evitar erros de symlinks

Licença 📄
MIT License

Autor 👤
Pedro Henrique Domingues
