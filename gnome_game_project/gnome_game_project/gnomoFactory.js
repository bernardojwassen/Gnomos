import { GnomoVeloz } from './gnomoVeloz.js';
import { GnomoAzarado } from './gnomoAzarado.js';
import { Chapeu } from './chapeu.js';

export class GnomoFactory {
  static criarGnomo(tipo, nome, corChapeu) {
    const chapeu = new Chapeu(corChapeu, Math.floor(Math.random() * 5));
    if (tipo === 'Veloz') {
      return new GnomoVeloz(nome, chapeu);
    } else if (tipo === 'Azarado') {
      return new GnomoAzarado(nome, chapeu);
    }
    throw new Error('Tipo de gnomo desconhecido');
  }
}
