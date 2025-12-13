import { KeyAction } from "@elgato/streamdeck";

export class FakeKeyAction implements Partial<KeyAction> {
  public ultimaImagen: string = "";

  constructor(public id: string) {
  }

  async setImage(imagen: string) {
    this.ultimaImagen = imagen;
  }

  ultimoSVG() {
    if (!this.ultimaImagen) {
      return "";
    }

    const base64Match = this.ultimaImagen.match(/^data:image\/svg\+xml;base64,(.+)$/)!;

    return Buffer.from(base64Match[1], "base64").toString("utf-8");
  }
}
