import { KeyAction } from "@elgato/streamdeck";

export class Cotizacion {
  constructor(
    private valorDeCompra: number,
    private valorDeVenta: number,
    private color: string,
  ) {
  }

  async dibujarEn(accion: KeyAction) {
    const svg = `
			<svg width="144" height="144" xmlns="http://www.w3.org/2000/svg">
				<text x="72" y="32" font-size="17" fill="#888" text-anchor="middle" font-weight="bold">
					COMPRA
				</text>

				<text x="72" y="60" font-size="26" fill="${this.color}" text-anchor="middle" font-weight="bold">
					$${this.formatearNumero(this.valorDeCompra)}
				</text>

				<line x1="20" y1="72" x2="124" y2="72" stroke="${this.color}" stroke-width="2" opacity="0.3"/>

				<text x="72" y="95" font-size="17" fill="#888" text-anchor="middle" font-weight="bold">
					VENTA
				</text>

				<text x="72" y="123" font-size="26" fill="${this.color}" text-anchor="middle" font-weight="bold">
					$${this.formatearNumero(this.valorDeVenta)}
				</text>
			</svg>
		`;

    const svgBase64 = Buffer.from(svg).toString("base64");

    await accion.setImage(`data:image/svg+xml;base64,${svgBase64}`);
  }

  private formatearNumero(numero: number): string {
    return numero.toLocaleString("es-AR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  }
}
