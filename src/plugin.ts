import streamDeck from "@elgato/streamdeck";
import { CotizacionBlue, CotizacionDigital, CotizacionOficial } from "./acciones/cotizaciones";
import { TemporizadorDeIntervalo } from "./modelo/temporizador";
import { CalculaDolar } from "./modelo/calculadolar";
import { Arbolito } from "./modelo/arbolito";

const logger = streamDeck.logger;
const calculaDolar = new CalculaDolar(logger);
const temporizador = new TemporizadorDeIntervalo(5 * 60 /* 5 minutos */);
const arbolito = new Arbolito(calculaDolar, temporizador, logger);

streamDeck.actions.registerAction(new CotizacionOficial(arbolito));
streamDeck.actions.registerAction(new CotizacionBlue(arbolito));
streamDeck.actions.registerAction(new CotizacionDigital(arbolito));

streamDeck.actions.onKeyDown(async () => {
  await streamDeck.system.openUrl("https://calculadolar.wenoa.studio");
});

await streamDeck.connect();
