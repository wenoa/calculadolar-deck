import { action, KeyAction, SingletonAction, WillAppearEvent, WillDisappearEvent } from "@elgato/streamdeck";
import { Arbolito, Oyente } from "../modelo/arbolito";
import type { Cotizaciones } from "../modelo/calculadolar";

function crearAccionDeCotizacion(tipo: keyof Cotizaciones) {
  @action({ UUID: `studio.wenoa.calculadolar.${tipo}` })
  class Accion extends SingletonAction {
    private oyentes: { [key: string]: Oyente } = {};

    constructor(private arbolito: Arbolito) {
      super();
    }

    override async onWillAppear({ action }: WillAppearEvent) {
      this.oyentes[action.id] = {
        recibirCotizaciones: async (cotizaciones: Cotizaciones) => {
          await cotizaciones[tipo].dibujarEn(action as KeyAction);
        },
      };

      await this.arbolito.serEscuchadoPor(this.oyentes[action.id]);
    }

    override async onWillDisappear({ action }: WillDisappearEvent) {
      this.arbolito.dejarDeSerEscuchadoPor(this.oyentes[action.id]);
      delete this.oyentes[action.id];
    }
  }

  return Accion;
}

export const CotizacionBlue = crearAccionDeCotizacion("blue");
export const CotizacionDigital = crearAccionDeCotizacion("digital");
export const CotizacionOficial = crearAccionDeCotizacion("oficial");
