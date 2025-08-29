import { Gnomo } from './gnomo.js';

export class GnomoAzarado extends Gnomo {
  constructor(nome, chapeu) {
    super(nome, 5, chapeu);
  }

  avancar() {
    const movimento = this.velocidadeBase + this.chapeu.modificadorSorte;
    
    this.posicao += movimento > 0 ? movimento : 0;
  }
}

