import { Chapeu } from './chapeu.js';

export class Gnomo {
  #nome;
  #velocidadeBase;
  #posicao;
  chapeu;

  constructor(nome, velocidadeBase, chapeu) {
    this.#nome = nome;
    this.#velocidadeBase = velocidadeBase;
    this.#posicao = 0;
    this.chapeu = chapeu;
  }

  get nome() {
    return this.#nome;
  }

  get posicao() {
    return this.#posicao;
  }

  get velocidadeBase() {
    return this.#velocidadeBase;
  }

  set posicao(valor) {
    if (valor >= 0) {
      this.#posicao = valor;
    }
  }

  avancar() {
    throw new Error("Método 'avancar()' deve ser implementado nas classes filhas.");
  }

  resetarPosicao() {
    this.#posicao = 0;
  }
}


