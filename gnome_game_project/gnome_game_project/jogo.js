import { GnomoFactory } from './gnomoFactory.js';
import { PocaoTeletransporte, PocaoCongelamento } from './poçoes.js';

class Jogo {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.maze = null;
    this.gnomos = [];
    this.jogador = null;
    this.itens = [];
    this.pocoes = [];
    this.linhaDeChegada = { x: 90, y: 90 };
    this.cellSize = 8;
    this.gameRunning = false;
    this.gameWon = false;
    this.keys = {};
    
    this.initCanvas();
    this.bindEvents();
  }

  initCanvas() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = 1600;
    this.canvas.height = 1600;
  }

  bindEvents() {
    document.addEventListener('keydown', (e) => {
      this.keys[e.key] = true;
    });

    document.addEventListener('keyup', (e) => {
      this.keys[e.key] = false;
    });
  }

  criarMaze() {
    this.maze = new Maze(100, 100);
    this.maze.generate();
  }

  iniciarJogo(tipoGnomo, nomeJogador, corChapeu) {
    this.criarMaze();
    
    // Criar jogador
    this.jogador = GnomoFactory.criarGnomo(tipoGnomo, nomeJogador, corChapeu);
    this.jogador.posicao = { x: 1, y: 1 };
    this.jogador.cor = corChapeu;
    this.jogador.congelado = false;
    this.jogador.tempoCongelamento = 0;
    this.jogador.itensColetados = 0;
    this.jogador.itensNecessarios = 5;

    // Adicionar método de congelamento
    this.jogador.congelar = function(tempo) {
      this.congelado = true;
      this.tempoCongelamento = tempo;
      setTimeout(() => {
        this.congelado = false;
        this.tempoCongelamento = 0;
      }, tempo);
    };

    // Criar gnomos inimigos
    this.gnomos = [];
    const tipos = ['Veloz', 'Azarado'];
    const cores = ['vermelho', 'azul', 'verde', 'amarelo'];
    
    for (let i = 0; i < 3; i++) {
      const tipo = tipos[Math.floor(Math.random() * tipos.length)];
      const cor = cores[Math.floor(Math.random() * cores.length)];
      const gnomo = GnomoFactory.criarGnomo(tipo, `Inimigo${i+1}`, cor);
      gnomo.posicao = this.encontrarPosicaoLivre();
      gnomo.cor = cor;
      gnomo.congelado = false;
      gnomo.tempoCongelamento = 0;
      gnomo.itensColetados = 0;
      gnomo.itensNecessarios = 5;
      
      // Adicionar método de congelamento
      gnomo.congelar = function(tempo) {
        this.congelado = true;
        this.tempoCongelamento = tempo;
        setTimeout(() => {
          this.congelado = false;
          this.tempoCongelamento = 0;
        }, tempo);
      };
      
      this.gnomos.push(gnomo);
    }

    // Criar itens espalhados pelo mapa
    this.criarItens();
    
    // Criar poções
    this.criarPocoes();

    this.gameRunning = true;
    this.gameWon = false;
    this.gameLoop();
  }

  encontrarPosicaoLivre() {
    let x, y;
    do {
      x = Math.floor(Math.random() * 98) + 1;
      y = Math.floor(Math.random() * 98) + 1;
    } while (this.maze.grid[y][x] !== ' ');
    return { x, y };
  }

  criarItens() {
    this.itens = [];
    const cores = ['vermelho', 'azul', 'verde', 'amarelo', this.jogador.cor];
    
    for (let cor of cores) {
      for (let i = 0; i < 5; i++) {
        const posicao = this.encontrarPosicaoLivre();
        this.itens.push({
          x: posicao.x,
          y: posicao.y,
          cor: cor,
          coletado: false
        });
      }
    }
  }

  criarPocoes() {
    this.pocoes = [];
    
    // Criar 2 poções de teletransporte
    for (let i = 0; i < 2; i++) {
      const posicao = this.encontrarPosicaoLivre();
      const tipo = Math.random() < 0.5 ? 'buf' : 'debuf';
      this.pocoes.push({
        x: posicao.x,
        y: posicao.y,
        tipo: 'teletransporte',
        efeito: tipo,
        usado: false,
        pocao: new PocaoTeletransporte(tipo)
      });
    }

    // Criar 2 poções de congelamento
    for (let i = 0; i < 2; i++) {
      const posicao = this.encontrarPosicaoLivre();
      const tipo = Math.random() < 0.5 ? 'buf' : 'debuf';
      this.pocoes.push({
        x: posicao.x,
        y: posicao.y,
        tipo: 'congelamento',
        efeito: tipo,
        usado: false,
        pocao: new PocaoCongelamento(tipo)
      });
    }
  }

  moverJogador() {
    if (this.jogador.congelado) return;

    let novaX = this.jogador.posicao.x;
    let novaY = this.jogador.posicao.y;

    if (this.keys['ArrowUp'] || this.keys['w']) novaY--;
    if (this.keys['ArrowDown'] || this.keys['s']) novaY++;
    if (this.keys['ArrowLeft'] || this.keys['a']) novaX--;
    if (this.keys['ArrowRight'] || this.keys['d']) novaX++;

    // Verificar se a nova posição é válida
    if (novaX >= 0 && novaX < 100 && novaY >= 0 && novaY < 100 && 
        this.maze.grid[novaY][novaX] === ' ') {
      this.jogador.posicao.x = novaX;
      this.jogador.posicao.y = novaY;
    }

    // Verificar colisões com itens
    this.verificarColisaoItens(this.jogador);
    
    // Verificar colisões com poções
    this.verificarColisaoPocoes(this.jogador);
  }

  moverInimigos() {
    this.gnomos.forEach(gnomo => {
      if (gnomo.congelado) return;

      // IA simples: mover em direção ao item mais próximo da cor do gnomo
      const itensDisponiveis = this.itens.filter(item => 
        item.cor === gnomo.cor && !item.coletado
      );

      if (itensDisponiveis.length > 0) {
        const itemMaisProximo = itensDisponiveis.reduce((prev, curr) => {
          const distPrev = Math.abs(gnomo.posicao.x - prev.x) + Math.abs(gnomo.posicao.y - prev.y);
          const distCurr = Math.abs(gnomo.posicao.x - curr.x) + Math.abs(gnomo.posicao.y - curr.y);
          return (distPrev < distCurr) ? prev : curr;
        });

        // Mover em direção ao item
        const dx = itemMaisProximo.x - gnomo.posicao.x;
        const dy = itemMaisProximo.y - gnomo.posicao.y;

        let novaX = gnomo.posicao.x;
        let novaY = gnomo.posicao.y;

        if (Math.abs(dx) > Math.abs(dy)) {
          novaX += dx > 0 ? 1 : -1;
        } else {
          novaY += dy > 0 ? 1 : -1;
        }

        // Verificar se a nova posição é válida
        if (novaX >= 0 && novaX < 100 && novaY >= 0 && novaY < 100 && 
            this.maze.grid[novaY][novaX] === ' ') {
          gnomo.posicao.x = novaX;
          gnomo.posicao.y = novaY;
        }
      }

      // Verificar colisões
      this.verificarColisaoItens(gnomo);
      this.verificarColisaoPocoes(gnomo);
    });
  }

  verificarColisaoItens(gnomo) {
    this.itens.forEach(item => {
      if (!item.coletado && 
          item.x === gnomo.posicao.x && 
          item.y === gnomo.posicao.y && 
          item.cor === gnomo.cor) {
        item.coletado = true;
        gnomo.itensColetados++;
        
        if (gnomo === this.jogador) {
          document.getElementById('itensColetados').textContent = gnomo.itensColetados;
        }
      }
    });
  }

  verificarColisaoPocoes(gnomo) {
    this.pocoes.forEach(pocao => {
      if (!pocao.usado && 
          pocao.x === gnomo.posicao.x && 
          pocao.y === gnomo.posicao.y) {
        pocao.usado = true;
        
        const outrosGnomos = gnomo === this.jogador ? 
          this.gnomos : 
          [this.jogador, ...this.gnomos.filter(g => g !== gnomo)];
        
        const itensDisponiveis = this.itens.filter(item => 
          item.cor === gnomo.cor && !item.coletado
        );
        
        pocao.pocao.aplicarEfeito(gnomo, itensDisponiveis, this.linhaDeChegada, outrosGnomos);
      }
    });
  }

  verificarVitoria() {
    // Verificar se o jogador ganhou
    if (this.jogador.itensColetados >= this.jogador.itensNecessarios &&
        this.jogador.posicao.x >= this.linhaDeChegada.x &&
        this.jogador.posicao.y >= this.linhaDeChegada.y) {
      this.gameWon = true;
      this.gameRunning = false;
      document.getElementById('status').textContent = 'Você venceu!';
      document.getElementById('status').style.color = 'green';
      return;
    }

    // Verificar se algum inimigo ganhou
    this.gnomos.forEach(gnomo => {
      if (gnomo.itensColetados >= gnomo.itensNecessarios &&
          gnomo.posicao.x >= this.linhaDeChegada.x &&
          gnomo.posicao.y >= this.linhaDeChegada.y) {
        this.gameWon = true;
        this.gameRunning = false;
        document.getElementById('status').textContent = `${gnomo.nome} venceu!`;
        document.getElementById('status').style.color = 'red';
      }
    });
  }

  desenhar() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Desenhar maze
    for (let y = 0; y < this.maze.height; y++) {
      for (let x = 0; x < this.maze.width; x++) {
        this.ctx.fillStyle = this.maze.grid[y][x] === ' ' ? 'white' : 'black';
        this.ctx.fillRect(x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize);
      }
    }

    // Desenhar linha de chegada
    this.ctx.fillStyle = 'gold';
    this.ctx.fillRect(
      this.linhaDeChegada.x * this.cellSize, 
      this.linhaDeChegada.y * this.cellSize, 
      10 * this.cellSize, 
      10 * this.cellSize
    );

    // Desenhar itens
    this.itens.forEach(item => {
      if (!item.coletado) {
        this.ctx.fillStyle = item.cor;
        this.ctx.fillRect(
          item.x * this.cellSize, 
          item.y * this.cellSize, 
          this.cellSize, 
          this.cellSize
        );
      }
    });

    // Desenhar poções
    this.pocoes.forEach(pocao => {
      if (!pocao.usado) {
        this.ctx.fillStyle = pocao.efeito === 'buf' ? 'lightgreen' : 'lightcoral';
        this.ctx.fillRect(
          pocao.x * this.cellSize, 
          pocao.y * this.cellSize, 
          this.cellSize, 
          this.cellSize
        );
      }
    });

    // Desenhar jogador
    this.ctx.fillStyle = this.jogador.congelado ? 'lightblue' : this.jogador.cor;
    this.ctx.fillRect(
      this.jogador.posicao.x * this.cellSize, 
      this.jogador.posicao.y * this.cellSize, 
      this.cellSize * 2, 
      this.cellSize * 2
    );

    // Desenhar inimigos
    this.gnomos.forEach(gnomo => {
      this.ctx.fillStyle = gnomo.congelado ? 'lightblue' : gnomo.cor;
      this.ctx.fillRect(
        gnomo.posicao.x * this.cellSize, 
        gnomo.posicao.y * this.cellSize, 
        this.cellSize * 2, 
        this.cellSize * 2
      );
    });
  }

  gameLoop() {
    if (!this.gameRunning) return;

    this.moverJogador();
    this.moverInimigos();
    this.verificarVitoria();
    this.desenhar();

    requestAnimationFrame(() => this.gameLoop());
  }
}

// Classe Maze (copiada do map.js e adaptada)
class Maze {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.grid = this.createGrid();
    this.visited = this.createGrid(true);
  }

  createGrid(fill = false) {
    let grid = [];
    for (let y = 0; y < this.height; y++) {
      grid.push([]);
      for (let x = 0; x < this.width; x++) {
        grid[y].push(fill);
      }
    }
    return grid;
  }

  generate(x = 1, y = 1) {
    const directions = [
      [0, 1], [1, 0], [0, -1], [-1, 0]
    ];

    directions.sort(() => Math.random() - 0.5);

    this.visited[y][x] = true;
    this.grid[y][x] = ' ';

    for (let i = 0; i < directions.length; i++) {
      const nx = x + directions[i][0] * 2;
      const ny = y + directions[i][1] * 2;

      if (nx > 0 && ny > 0 && nx < this.width - 1 && ny < this.height - 1 && !this.visited[ny][nx]) {
        this.grid[ny][nx] = ' ';
        this.grid[y + directions[i][1]][x + directions[i][0]] = ' ';
        this.generate(nx, ny);
      }
    }
  }
}

export default Jogo;

