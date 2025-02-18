import ZebraBrowserPrintWrapper from "../index";

jest.mock("../constants", () => ({
  API_URL: "https://mockapi.com/",
}));

const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  key: jest.fn(),
  length: 0,
};

// Mock fetch
beforeEach(() => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: jest.fn().mockResolvedValue({ printer: ["printer1", "printer2"] }),
    text: jest
      .fn()
      .mockResolvedValue("Device: SomeDevice\nType: PrinterType\n"),
  });
});

describe("ZebraBrowserPrintWrapper", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.localStorage = mockLocalStorage;
  });

  it("should fetch available printers", async () => {
    const mockData = { printer: ["Printer1", "Printer2"] };
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockData),
    });

    const printWrapper = new ZebraBrowserPrintWrapper();
    const printers = await printWrapper.getAvailablePrinters();

    expect(fetch).toHaveBeenCalledWith(
      "https://mockapi.com/available",
      expect.any(Object)
    );
    expect(printers).toEqual(mockData.printer);
  });

  it("should throw an error when no printers are available", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ printer: [] }), // Simulating no printers
    });

    const zebra = new ZebraBrowserPrintWrapper();
    await expect(zebra.getAvailablePrinters()).rejects.toThrow(
      "No printers available or network error"
    );
  });

  it("should fetch the default printer and set it in localStorage", async () => {
    // Mock the response to simulate available printer data
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      text: jest
        .fn()
        .mockResolvedValue(
          "Device: PrinterName\nType: PrinterType\nConnection: USB\nUID: 1234\nProvider: Zebra\nManufacturer: Zebra\nVersion: 1.0"
        ),
    });

    const zebra = new ZebraBrowserPrintWrapper();
    const device = await zebra.getDefaultPrinter();

    // Ensure the correct device is returned and set in localStorage
    expect(device).toHaveProperty("name", "PrinterName");
    expect(localStorage.setItem).toHaveBeenCalledWith(
      "selectedPrinter",
      JSON.stringify(device)
    );
  });

  it("should throw an error if default printer format is invalid", async () => {
    // Simulate invalid format response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      text: jest.fn().mockResolvedValue("Invalid data format"), // Invalid format mock
    });

    const zebra = new ZebraBrowserPrintWrapper();

    // Adding more robust error message matching
    await expect(zebra.getDefaultPrinter()).rejects.toThrow(
      new Error("Invalid printer data format") // Expected error message
    );
  });

  it("should check printer status and return readiness", async () => {
    // Simulate a valid printer status response (no issues)
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      text: jest.fn().mockResolvedValue("0 0 0 0 0 0 0 0"), // No issues in the status
    });

    const zebra = new ZebraBrowserPrintWrapper();
    const status = await zebra.checkPrinterStatus();

    // Ensure the printer is ready to print
    expect(status.isReadyToPrint).toBe(true);
    expect(status.errors.length).toBe(0);
  });

  it("should return errors if printer has issues", async () => {
    // Mock the fetch response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      text: jest.fn().mockResolvedValue("1 0 0 0 0 0 0 0"), // Simulating "Paper Out" error at index 0
    });

    const zebra = new ZebraBrowserPrintWrapper();
    const status = await zebra.checkPrinterStatus();

    // Ensure errors are returned
    expect(status.isReadyToPrint).toBe(false);
    expect(status.errors).toContain("Paper Out");
  });

  it("should write data to the printer", async () => {
    const mockWriteResponse = { ok: true };
    (global.fetch as jest.Mock).mockResolvedValueOnce(mockWriteResponse);

    const printWrapper = new ZebraBrowserPrintWrapper();
    await printWrapper.write("Test Data");

    expect(fetch).toHaveBeenCalledWith(
      "https://mockapi.com/write",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          device: printWrapper.device,
          data: "Test Data",
        }),
      })
    );
  });

  it("should print label with correct formatting", async () => {
    const mockWriteResponse = { ok: true };
    (global.fetch as jest.Mock).mockResolvedValueOnce(mockWriteResponse);

    const printWrapper = new ZebraBrowserPrintWrapper();
    const labelData = "Test Label";
    await printWrapper.printLabel(labelData);

    expect(fetch).toHaveBeenCalledWith(
      "https://mockapi.com/write",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          device: printWrapper.device,
          data: `^XA^FO50,50^ADN,36,20^FDTest Label^FS^XZ`,
        }),
      })
    );
  });
});
