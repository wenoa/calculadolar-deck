import { Temporizador } from "../../modelo/temporizador";

export class TemporizadorDeMentira implements Temporizador {
  private callback?: () => Promise<void>;

  activo(): boolean {
    return !!this.callback;
  }

  iniciar(callback: () => Promise<void>) {
    this.callback = callback;
  }

  detener() {
    this.callback = undefined;
  }

  async tick() {
    if (this.callback) {
      await this.callback();
    }
  }
}
