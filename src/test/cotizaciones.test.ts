import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Arbolito } from "../modelo/arbolito";
import { CalculaDolar } from "../modelo/calculadolar";
import { TemporizadorDeMentira } from "./support/temporizador-de-mentira";
import { FakeKeyAction } from "./support/fake-key-action";
import { CotizacionBlue, CotizacionDigital, CotizacionOficial } from "../acciones/cotizaciones";
import { SingletonAction } from "@elgato/streamdeck";
import { QuietLogger } from "./support/quiet-logger";

describe("Acciones de Cotización", () => {
  const fetchOriginal = global.fetch;
  let logger: QuietLogger;
  let temporizador: TemporizadorDeMentira;
  let arbolito: Arbolito;
  let fetchMock: ReturnType<typeof vi.fn>;
  let singletonDeCotizacionBlue: SingletonAction;
  let singletonDeCotizacionDigital: SingletonAction;
  let singletonDeCotizacionOficial: SingletonAction;

  beforeEach(() => {
    global.fetch = fetchMock = vi.fn() as any;

    logger = new QuietLogger();
    temporizador = new TemporizadorDeMentira();
    arbolito = new Arbolito(new CalculaDolar(logger), temporizador, logger);
    singletonDeCotizacionBlue = new CotizacionBlue(arbolito);
    singletonDeCotizacionDigital = new CotizacionDigital(arbolito);
    singletonDeCotizacionOficial = new CotizacionOficial(arbolito);
  });

  afterEach(() => {
    global.fetch = fetchOriginal;
  });

  describe("si no hay acciones de tecla", () => {
    it("el temporizador está inactivo", () => {
      expect(temporizador.activo()).toBe(false);
    });
  });

  describe("al agregar una acción de tecla", () => {
    let accionDeTecla: FakeKeyAction;

    beforeEach(async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => ({
          blue: {},
          digital: {},
          oficial: {
            compra: 1000,
            venta: 1300,
          },
        }),
      });

      accionDeTecla = new FakeKeyAction("1");
      expect(accionDeTecla.ultimoSVG()).not.toContain("$1.000");
      expect(accionDeTecla.ultimoSVG()).not.toContain("$1.300");

      await singletonDeCotizacionOficial.onWillAppear!({ action: accionDeTecla } as any);
    });

    it("la API se consulta una única vez", () => {
      expect(fetchMock).toHaveBeenCalledOnce();
    });

    it("se dibujan las cotizaciones en la tecla", async () => {
      expect(accionDeTecla.ultimoSVG()).toContain("$1.000");
      expect(accionDeTecla.ultimoSVG()).toContain("$1.300");
    });

    it("el temporizador se activa", () => {
      expect(temporizador.activo()).toBe(true);
    });
  });

  describe("al agregar múltiples acciones de tecla", () => {
    let accionDeTecla1: FakeKeyAction;
    let accionDeTecla2: FakeKeyAction;

    beforeEach(async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => ({
          blue: {},
          digital: {},
          oficial: {
            compra: 1000,
            venta: 1300,
          },
        }),
      });

      accionDeTecla1 = new FakeKeyAction("1");
      accionDeTecla2 = new FakeKeyAction("2");

      await singletonDeCotizacionOficial.onWillAppear!({ action: accionDeTecla1 } as any);
      await singletonDeCotizacionOficial.onWillAppear!({ action: accionDeTecla2 } as any);
    });

    it("la API se consulta una única vez", () => {
      expect(fetchMock).toHaveBeenCalledOnce();
    });

    it("se dibujan las cotizaciones en las acciones de tecla", async () => {
      expect(accionDeTecla1.ultimoSVG()).toContain("$1.000");
      expect(accionDeTecla1.ultimoSVG()).toContain("$1.300");
      expect(accionDeTecla2.ultimoSVG()).toContain("$1.000");
      expect(accionDeTecla2.ultimoSVG()).toContain("$1.300");
    });

    it("el temporizador se mantiene activo", () => {
      expect(temporizador.activo()).toBe(true);
    });

    describe("cuando se completa un ciclo del temporizador", () => {
      beforeEach(async () => {
        fetchMock.mockResolvedValue({
          ok: true,
          json: async () => ({
            blue: {},
            digital: {},
            oficial: {
              compra: 2000,
              venta: 2300,
            },
          }),
        });

        await temporizador.tick();
      });

      it("la API se consulta por segunda vez", () => {
        expect(fetchMock).toHaveBeenCalledTimes(2);
      });

      it("se redibujan las cotizaciones en las acciones de tecla", async () => {
        expect(accionDeTecla1.ultimoSVG()).toContain("$2.000");
        expect(accionDeTecla1.ultimoSVG()).toContain("$2.300");
        expect(accionDeTecla2.ultimoSVG()).toContain("$2.000");
        expect(accionDeTecla2.ultimoSVG()).toContain("$2.300");
      });
    });

    describe("cuando se elimina una acción de tecla", () => {
      beforeEach(async () => {
        await singletonDeCotizacionOficial.onWillDisappear!({ action: accionDeTecla1 } as any);
      });

      describe("y se completa un ciclo del temporizador", () => {
        beforeEach(async () => {
          fetchMock.mockResolvedValue({
            ok: true,
            json: async () => ({
              blue: {},
              digital: {},
              oficial: {
                compra: 2000,
                venta: 2300,
              },
            }),
          });

          await temporizador.tick();
        });

        it("solo se redibujan las cotizaciones en las acciones de tecla remanentes", async () => {
          expect(accionDeTecla1.ultimoSVG()).toContain("$1.000");
          expect(accionDeTecla1.ultimoSVG()).toContain("$1.300");
          expect(accionDeTecla2.ultimoSVG()).toContain("$2.000");
          expect(accionDeTecla2.ultimoSVG()).toContain("$2.300");
        });
      });
    });

    describe("cuando se eliminan todas las acciones de tecla", () => {
      beforeEach(async () => {
        await singletonDeCotizacionOficial.onWillDisappear!({ action: accionDeTecla1 } as any);
        await singletonDeCotizacionOficial.onWillDisappear!({ action: accionDeTecla2 } as any);
      });

      it("el temporizador se desactiva", async () => {
        expect(temporizador.activo()).toBe(false);
      });
    });
  });

  describe("al agregar una acción de tecla por cada acción de cotización", () => {
    let accionDeTeclaBlue: FakeKeyAction;
    let accionDeTeclaDigital: FakeKeyAction;
    let accionDeTeclaOficial: FakeKeyAction;

    beforeEach(async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => ({
          blue: {
            compra: 1400,
            venta: 1500,
          },
          digital: {
            compra: 1600,
            venta: 1700,
          },
          oficial: {
            compra: 1000,
            venta: 1300,
          },
        }),
      });

      accionDeTeclaBlue = new FakeKeyAction("1");
      accionDeTeclaDigital = new FakeKeyAction("2");
      accionDeTeclaOficial = new FakeKeyAction("3");

      await singletonDeCotizacionBlue.onWillAppear!({ action: accionDeTeclaBlue } as any);
      await singletonDeCotizacionDigital.onWillAppear!({ action: accionDeTeclaDigital } as any);
      await singletonDeCotizacionOficial.onWillAppear!({ action: accionDeTeclaOficial } as any);
    });

    it("la API se consulta una única vez", () => {
      expect(fetchMock).toHaveBeenCalledOnce();
    });

    it("cada acción de tecla se dibuja con los valores correspondientes", () => {
      expect(accionDeTeclaBlue.ultimoSVG()).toContain("$1.400");
      expect(accionDeTeclaBlue.ultimoSVG()).toContain("$1.500");
      expect(accionDeTeclaDigital.ultimoSVG()).toContain("$1.600");
      expect(accionDeTeclaDigital.ultimoSVG()).toContain("$1.700");
      expect(accionDeTeclaOficial.ultimoSVG()).toContain("$1.000");
      expect(accionDeTeclaOficial.ultimoSVG()).toContain("$1.300");
    });
  });

  describe("si hay algún problema con la API", () => {
    let accionDeTeclaBlue: FakeKeyAction;
    let accionDeTeclaDigital: FakeKeyAction;
    let accionDeTeclaOficial: FakeKeyAction;

    beforeEach(async () => {
      fetchMock.mockResolvedValue({
        ok: false,
      });

      accionDeTeclaBlue = new FakeKeyAction("1");
      accionDeTeclaDigital = new FakeKeyAction("2");
      accionDeTeclaOficial = new FakeKeyAction("3");

      await singletonDeCotizacionBlue.onWillAppear!({ action: accionDeTeclaBlue } as any);
      await singletonDeCotizacionDigital.onWillAppear!({ action: accionDeTeclaDigital } as any);
      await singletonDeCotizacionOficial.onWillAppear!({ action: accionDeTeclaOficial } as any);
    });

    it("las cotizaciones están en 0 por defecto", async () => {
      expect(accionDeTeclaBlue.ultimoSVG()).toContain("$0");
      expect(accionDeTeclaBlue.ultimoSVG()).toContain("$0");
      expect(accionDeTeclaDigital.ultimoSVG()).toContain("$0");
      expect(accionDeTeclaDigital.ultimoSVG()).toContain("$0");
      expect(accionDeTeclaOficial.ultimoSVG()).toContain("$0");
      expect(accionDeTeclaOficial.ultimoSVG()).toContain("$0");
    });
  });
});
