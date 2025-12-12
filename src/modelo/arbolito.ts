import { CalculaDolar, Cotizaciones } from "./calculadolar";
import { Temporizador } from "./temporizador";
import { Logger } from "./logger";

export type Oyente = {
  recibirCotizaciones: (cotizaciones: Cotizaciones) => Promise<void>;
};

export class Arbolito {
  private oyentes: Oyente[] = [];
  private ultimasCotizaciones!: Cotizaciones;

  constructor(
    private calculaDolar: CalculaDolar,
    private temporizador: Temporizador,
    private logger: Logger,
  ) {
  }

  async serEscuchadoPor(nuevoOyente: Oyente) {
    this.oyentes.push(nuevoOyente);

    await this.murmurar();
    await this.seguirCotizaciones();
  }

  dejarDeSerEscuchadoPor(unOyente: Oyente) {
    this.oyentes = this.oyentes.filter(oyente => oyente !== unOyente);
    this.dejarDeSeguirCotizacionesSiNoHayMasOyentes();
  }

  private hayOyentes() {
    return this.oyentes.length > 0;
  }

  private async consultarYMurmurar() {
    await this.consultarCotizacionesActualizadas();
    await this.murmurar();
  }

  private async seguirCotizaciones() {
    if (this.temporizador.activo()) {
      return;
    }

    this.temporizador.iniciar(async () => await this.consultarYMurmurar());

    await this.consultarYMurmurar();
  }

  private dejarDeSeguirCotizacionesSiNoHayMasOyentes() {
    if (!this.hayOyentes()) {
      this.dejarDeSeguirCotizaciones();
    }
  }

  private dejarDeSeguirCotizaciones() {
    this.temporizador.detener();
    this.logger.info("Seguimiento detenido");
  }

  private async consultarCotizacionesActualizadas() {
    this.logger.info("Consultando cotizaciones");
    this.ultimasCotizaciones = await this.calculaDolar.cotizaciones();
  }

  private async murmurar() {
    if (this.ultimasCotizaciones) {
      this.logger.info(`Murmurando a ${this.oyentes.length} oyentes`);

      for (const oyente of this.oyentes) {
        await oyente.recibirCotizaciones(this.ultimasCotizaciones);
      }
    }
  }
}
