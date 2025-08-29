import Jogo from './jogo.js';

class App {
  constructor() {
    this.jogo = null;
    this.gameRunning = false;
    this.gamePaused = false;
    
    this.initEventListeners();
  }

  initEventListeners() {
    // Formulário de configuração
    const setupForm = document.getElementById('setupForm');
    setupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.iniciarJogo();
    });

    // Botões de controle
    document.getElementById('pauseBtn').addEventListener('click', () => {
      this.pausarJogo();
    });

    document.getElementById('restartBtn').addEventListener('click', () => {
      this.reiniciarJogo();
    });

    document.getElementById('newGameBtn').addEventListener('click', () => {
      this.novoJogo();
    });

    // Validação em tempo real do formulário
    this.setupFormValidation();
  }

  setupFormValidation() {
    const nomeInput = document.getElementById('nomeJogador');
    const tipoSelect = document.getElementById('tipoGnomo');
    const corRadios = document.querySelectorAll('input[name="corChapeu"]');
    const startBtn = document.querySelector('.start-btn');

    const validateForm = () => {
      const nome = nomeInput.value.trim();
      const tipo = tipoSelect.value;
      const cor = document.querySelector('input[name="corChapeu"]:checked');

      const isValid = nome.length > 0 && tipo && cor;
      
      startBtn.disabled = !isValid;
      startBtn.style.opacity = isValid ? '1' : '0.6';
      startBtn.style.cursor = isValid ? 'pointer' : 'not-allowed';
    };

    nomeInput.addEventListener('input', validateForm);
    tipoSelect.addEventListener('change', validateForm);
    corRadios.forEach(radio => {
      radio.addEventListener('change', validateForm);
    });

    // Validação inicial
    validateForm();
  }

  iniciarJogo() {
    const formData = new FormData(document.getElementById('setupForm'));
    const nomeJogador = formData.get('nomeJogador').trim();
    const tipoGnomo = formData.get('tipoGnomo');
    const corChapeu = formData.get('corChapeu');

    if (!nomeJogador || !tipoGnomo || !corChapeu) {
      this.showMessage('Por favor, preencha todos os campos!', 'error');
      return;
    }

    // Validar nome
    if (nomeJogador.length < 2) {
      this.showMessage('O nome deve ter pelo menos 2 caracteres!', 'error');
      return;
    }

    // Esconder configuração e mostrar jogo
    document.getElementById('gameSetup').style.display = 'none';
    document.getElementById('gameArea').style.display = 'grid';

    // Atualizar informações do jogador
    document.getElementById('playerName').textContent = nomeJogador;
    document.getElementById('playerType').textContent = tipoGnomo;
    document.getElementById('playerColor').textContent = corChapeu;
    document.getElementById('itensColetados').textContent = '0';
    document.getElementById('status').textContent = 'Jogando...';
    document.getElementById('status').style.color = '#4a5568';

    // Criar e iniciar o jogo
    try {
      this.jogo = new Jogo();
      this.jogo.iniciarJogo(tipoGnomo, nomeJogador, corChapeu);
      this.gameRunning = true;
      this.gamePaused = false;
      
      this.showMessage(`Jogo iniciado! Boa sorte, ${nomeJogador}!`, 'success');
    } catch (error) {
      console.error('Erro ao iniciar o jogo:', error);
      this.showMessage('Erro ao iniciar o jogo. Tente novamente.', 'error');
      this.novoJogo();
    }
  }

  pausarJogo() {
    if (!this.jogo || !this.gameRunning) return;

    const pauseBtn = document.getElementById('pauseBtn');
    
    if (this.gamePaused) {
      // Despausar
      this.jogo.gameRunning = true;
      this.jogo.gameLoop();
      this.gamePaused = false;
      pauseBtn.textContent = '⏸️ Pausar';
      document.getElementById('status').textContent = 'Jogando...';
      this.showMessage('Jogo despausado!', 'info');
    } else {
      // Pausar
      this.jogo.gameRunning = false;
      this.gamePaused = true;
      pauseBtn.textContent = '▶️ Continuar';
      document.getElementById('status').textContent = 'Pausado';
      this.showMessage('Jogo pausado!', 'info');
    }
  }

  reiniciarJogo() {
    if (!this.jogo) return;

    const confirmRestart = confirm('Tem certeza que deseja reiniciar o jogo? Todo o progresso será perdido.');
    
    if (confirmRestart) {
      // Obter dados do jogador atual
      const nomeJogador = document.getElementById('playerName').textContent;
      const tipoGnomo = document.getElementById('playerType').textContent;
      const corChapeu = document.getElementById('playerColor').textContent;

      // Reiniciar o jogo
      try {
        this.jogo = new Jogo();
        this.jogo.iniciarJogo(tipoGnomo, nomeJogador, corChapeu);
        this.gameRunning = true;
        this.gamePaused = false;
        
        // Resetar UI
        document.getElementById('itensColetados').textContent = '0';
        document.getElementById('status').textContent = 'Jogando...';
        document.getElementById('status').style.color = '#4a5568';
        document.getElementById('pauseBtn').textContent = '⏸️ Pausar';
        
        this.showMessage('Jogo reiniciado!', 'success');
      } catch (error) {
        console.error('Erro ao reiniciar o jogo:', error);
        this.showMessage('Erro ao reiniciar o jogo.', 'error');
      }
    }
  }

  novoJogo() {
    const confirmNew = this.gameRunning ? 
      confirm('Tem certeza que deseja iniciar um novo jogo? Todo o progresso será perdido.') : 
      true;
    
    if (confirmNew) {
      // Parar jogo atual se existir
      if (this.jogo) {
        this.jogo.gameRunning = false;
        this.jogo = null;
      }

      this.gameRunning = false;
      this.gamePaused = false;

      // Mostrar configuração e esconder jogo
      document.getElementById('gameSetup').style.display = 'grid';
      document.getElementById('gameArea').style.display = 'none';

      // Limpar formulário
      document.getElementById('setupForm').reset();
      
      // Revalidar formulário
      const startBtn = document.querySelector('.start-btn');
      startBtn.disabled = true;
      startBtn.style.opacity = '0.6';
      startBtn.style.cursor = 'not-allowed';

      this.showMessage('Pronto para um novo jogo!', 'info');
    }
  }

  showMessage(message, type = 'info') {
    // Criar elemento de mensagem
    const messageEl = document.createElement('div');
    messageEl.className = `message message-${type}`;
    messageEl.textContent = message;

    // Estilos da mensagem
    Object.assign(messageEl.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      padding: '15px 20px',
      borderRadius: '10px',
      color: 'white',
      fontWeight: '600',
      zIndex: '10000',
      maxWidth: '300px',
      boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)',
      transform: 'translateX(100%)',
      transition: 'transform 0.3s ease'
    });

    // Cores por tipo
    const colors = {
      success: '#38a169',
      error: '#e53e3e',
      info: '#3182ce',
      warning: '#d69e2e'
    };

    messageEl.style.backgroundColor = colors[type] || colors.info;

    // Adicionar ao DOM
    document.body.appendChild(messageEl);

    // Animar entrada
    setTimeout(() => {
      messageEl.style.transform = 'translateX(0)';
    }, 100);

    // Remover após 3 segundos
    setTimeout(() => {
      messageEl.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (messageEl.parentNode) {
          messageEl.parentNode.removeChild(messageEl);
        }
      }, 300);
    }, 3000);
  }
}

// Inicializar aplicação quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
  new App();
});

// Adicionar algumas funcionalidades extras
document.addEventListener('keydown', (e) => {
  // Atalhos de teclado
  if (e.ctrlKey || e.metaKey) {
    switch (e.key) {
      case 'r':
        e.preventDefault();
        // Reiniciar jogo com Ctrl+R
        const restartBtn = document.getElementById('restartBtn');
        if (restartBtn && !restartBtn.disabled) {
          restartBtn.click();
        }
        break;
      case 'n':
        e.preventDefault();
        // Novo jogo com Ctrl+N
        const newGameBtn = document.getElementById('newGameBtn');
        if (newGameBtn) {
          newGameBtn.click();
        }
        break;
    }
  }
  
  // Pausar com Espaço
  if (e.code === 'Space') {
    e.preventDefault();
    const pauseBtn = document.getElementById('pauseBtn');
    if (pauseBtn && !pauseBtn.disabled) {
      pauseBtn.click();
    }
  }
});

// Prevenir zoom acidental
document.addEventListener('wheel', (e) => {
  if (e.ctrlKey) {
    e.preventDefault();
  }
}, { passive: false });

// Adicionar informações de debug no console
console.log('🧙‍♂️ A Fuga dos Gnomos de Jardim - Jogo carregado!');
console.log('Atalhos disponíveis:');
console.log('- Espaço: Pausar/Despausar');
console.log('- Ctrl+R: Reiniciar jogo');
console.log('- Ctrl+N: Novo jogo');
console.log('- WASD ou Setas: Mover gnomo');

