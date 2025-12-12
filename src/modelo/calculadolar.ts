import { Cotizacion } from "./cotizacion";
import { Logger } from "./logger";

export interface Cotizaciones {
  oficial: Cotizacion;
  blue: Cotizacion;
  digital: Cotizacion;
}

export class CalculaDolar {
  private readonly API_URL = "https://wenoa.studio/calculadolar/api/cotizacion";

  constructor(private logger: Logger) {
  }

  async cotizaciones(): Promise<Cotizaciones> {
    const respuesta = await fetch(this.API_URL);
    let datos = {
      oficial: {
        compra: 0,
        venta: 0,
      },
      blue: {
        compra: 0,
        venta: 0,
      },
      digital: {
        compra: 0,
        venta: 0,
      },
    };

    if (respuesta.ok) {
      datos = await respuesta.json() as any;
    } else {
      this.logger.error(`Error HTTP! status: ${respuesta.status}`);
    }

    return {
      oficial: new Cotizacion(datos.oficial.compra, datos.oficial.venta, "#81e800"),
      blue: new Cotizacion(datos.blue.compra, datos.blue.venta, "#3199ff"),
      digital: new Cotizacion(datos.digital.compra, datos.digital.venta, "#ff9130"),
    };
  }
}
