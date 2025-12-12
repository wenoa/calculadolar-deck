export interface Temporizador {
  iniciar(callback: () => Promise<void>): void;

  detener(): void;

  activo(): boolean;
}

export class TemporizadorDeIntervalo implements Temporizador {
  private intervalo?: NodeJS.Timeout;

  constructor(private duracion: number) {
  }

  iniciar(callback: () => Promise<void>) {
    this.intervalo = setInterval(callback, this.duracion * 1000);
  }

  detener() {
    if (this.intervalo) {
      clearInterval(this.intervalo);
      this.intervalo = undefined;
    }
  }

  activo() {
    return !!this.intervalo;
  }
}
