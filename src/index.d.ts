declare module "truemed-zebra-printer" {
  export interface Device {
    name: string;
    deviceType: string;
    connection: string;
    uid: string;
    provider: string;
    manufacturer: string;
    version: number;
  }

  export default class ZebraBrowserPrintWrapper {
    device: Device;

    constructor();

    fetchWithRetry(
      endpoint: string,
      config: RequestInit,
      retries?: number
    ): Promise<Response>;

    getAvailablePrinters(): Promise<Device[] | null>;

    getDefaultPrinter(): Promise<Device>;

    setPrinter(device: Device): void;

    getPrinter(): Device;

    checkPrinterStatus(): Promise<{
      isReadyToPrint: boolean;
      errors: string[];
    }>;

    write(data: string): Promise<void>;

    read(): Promise<string>;

    print(text: string): Promise<void>;

    printLabel(labelData: string): Promise<void>;
  }
}
