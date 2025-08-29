import { Gnomo } from './gnomo.js';

class Corrida {
  competidores = [];
  distanciaTotal;
  vencedor;

  constructor(distanciaTotal) {
    this.distanciaTotal = distanciaTotal;
  }

  adicionarCompetidor(gnomo) {
    this.competidores.push(gnomo);
  }

  proximoTurno() {
    this.competidores.forEach(gnomo => gnomo.avancar());
    this.verificarVencedor();
  }

  verificarVencedor() {
    this.competidores.forEach(gnomo => {
      if (gnomo.posicao >= this.distanciaTotal && !this.vencedor) {
        this.vencedor = gnomo;
        console.log(`Vencedor: ${gnomo.nome}`);
      }
    });
  }

  iniciarSimulacao() {
    let turno = 0;
    while (!this.vencedor) {
      console.log(`Turno ${turno + 1}:`);
      this.proximoTurno();
      turno++;
    }
  }
}

export default Corrida;
