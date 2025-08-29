export class Pocao {
  constructor(tipo) {
    this.tipo = tipo; // 'buf' ou 'debuf'
  }

  aplicarEfeito(gnomo, itens, linhaDeChegada, outrosGnomos) {
    // Lógica para aplicar o efeito da poção
    // Implementar teletransporte, congelamento, etc.
    // Isso será feito na fase de integração.
  }
}

export class PocaoTeletransporte extends Pocao {
  constructor(tipo) {
    super(tipo);
  }

  aplicarEfeito(gnomo, itens, linhaDeChegada, outrosGnomos) {
    if (this.tipo === 'buf') {
      // Teletransporta o jogador para perto de um dos itens
      const itemMaisProximo = itens.reduce((prev, curr) => {
        const distPrev = Math.abs(gnomo.posicao.x - prev.x) + Math.abs(gnomo.posicao.y - prev.y);
        const distCurr = Math.abs(gnomo.posicao.x - curr.x) + Math.abs(gnomo.posicao.y - curr.y);
        return (distPrev < distCurr) ? prev : curr;
      });
      gnomo.posicao = { x: itemMaisProximo.x, y: itemMaisProximo.y };
      console.log(`${gnomo.nome} foi teletransportado para perto de um item!`);
    } else {
      // Teletransporta o jogador para muito longe dos itens
      // Lógica para mover o gnomo para uma posição aleatória distante
      gnomo.posicao = { x: Math.floor(Math.random() * 200), y: Math.floor(Math.random() * 200) }; // Exemplo
      console.log(`${gnomo.nome} foi teletransportado para longe dos itens!`);
    }
  }
}

export class PocaoCongelamento extends Pocao {
  constructor(tipo) {
    super(tipo);
  }

  aplicarEfeito(gnomo, itens, linhaDeChegada, outrosGnomos) {
    if (this.tipo === 'buf') {
      // Congela todos os outros gnomos por 7 segundos
      outrosGnomos.forEach(outroGnomo => {
        outroGnomo.congelar(7000); // 7 segundos em milissegundos
        console.log(`${outroGnomo.nome} foi congelado por 7 segundos!`);
      });
    } else {
      // Congela o jogador por 7 segundos
      gnomo.congelar(7000); // 7 segundos em milissegundos
      console.log(`${gnomo.nome} foi congelado por 7 segundos!`);
    }
  }
}


