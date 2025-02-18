import { API_URL } from "./constants";
import { Device } from "./types";

export default class ZebraBrowserPrintWrapper {
  device: Device = JSON.parse(localStorage.getItem("selectedPrinter") || "{}");

  async fetchWithRetry(endpoint: string, config: RequestInit, retries = 3) {
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const res = await fetch(endpoint, config);
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        return res;
      } catch (error: unknown) {
        // Type assertion here
        if (error instanceof Error) {
          if (attempt === retries - 1)
            throw new Error(error.message || "Unknown error");
        } else {
          if (attempt === retries - 1) throw new Error("Unknown error");
        }
      }
    }
  }

  async getAvailablePrinters() {
    const endpoint = API_URL + "available";
    const config = {
      method: "GET",
      headers: { "Content-Type": "text/plain;charset=UTF-8" },
    };

    try {
      const res = await this.fetchWithRetry(endpoint, config);
      if (!res) throw new Error("Response is undefined");
      const data = await res.json();

      if (!data?.printer?.length) {
        throw new Error("No printers available or network error");
      }

      return data?.printer?.length ? data.printer : null;
    } catch (error) {
      throw new Error("No printers available or network error");
    }
  }

  async getDefaultPrinter(): Promise<Device> {
    const endpoint = API_URL + "default";
    const config = {
      method: "GET",
      headers: { "Content-Type": "text/plain;charset=UTF-8" },
    };

    try {
      const res = await this.fetchWithRetry(endpoint, config);
      if (!res) throw new Error("Response is undefined");
      const data = await res.text();
      const lines = data.split("\n");

      if (lines.length < 7) {
        throw new Error("Invalid printer data format"); // Change the error message here
      }

      const device = {
        name: lines[0].split(":")[1].trim(),
        deviceType: lines[1].split(":")[1].trim(),
        connection: lines[2].split(":")[1].trim(),
        uid: lines[3].split(":")[1].trim(),
        provider: lines[4].split(":")[1].trim(),
        manufacturer: lines[5].split(":")[1].trim(),
        version: 0,
      };

      this.setPrinter(device);
      return device;
    } catch (error) {
      // Ensure we catch the format error specifically and throw with the right message
      if (error.message === "Invalid printer data format") {
        throw new Error("Invalid printer data format");
      }
      throw new Error("No default printer found"); // Keep the default error message for other issues
    }
  }

  setPrinter(device: Device) {
    this.device = device;
    localStorage.setItem("selectedPrinter", JSON.stringify(device));
  }

  getPrinter(): Device {
    return this.device;
  }

  async checkPrinterStatus() {
    await this.write("~HQES");
    const result = await this.read();
  
    const errors: string[] = [];
    const statusCodes = {
      "1": "Paper Out",
      "2": "Printhead Issue",
      "3": "Printer Paused",
      "4": "Low Ink/Toner",
      "5": "Paper Jam",
      "6": "General Error",
    };
  
    // Strip non-numeric parts (like 'Status:' or other extraneous text)
    const cleanedResult = result.replace(/[^\d\s]/g, "").trim();
    console.log("Cleaned Result:", cleanedResult); // Debugging
  
    // Split the result by spaces to match each status code
    const statusArray = cleanedResult.split(" ");
    console.log("Status Array:", statusArray); // Debugging
  
    // Loop through each status code and check if any errors exist
    statusArray.forEach((status) => {
      console.log("Checking Status:", status); // Debugging
      // Check for error status codes (from "1" to "5")
      if (statusCodes[status]) {
        errors.push(statusCodes[status]);
      }
    });
  
    console.log("Errors:", errors); // Debugging
    return { isReadyToPrint: errors.length === 0, errors };
  }

  async write(data: string) {
    const endpoint = API_URL + "write";
    const config = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ device: this.device, data }),
    };
    await this.fetchWithRetry(endpoint, config);
  }

  async read() {
    const endpoint = API_URL + "read";
    const config = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ device: this.device }),
    };
    const res = await this.fetchWithRetry(endpoint, config);
    if (!res) throw new Error("Response is undefined");
    return await res.text();
  }

  async print(text: string) {
    await this.write(text);
  }

  async printLabel(labelData: string) {
    await this.write(`^XA^FO50,50^ADN,36,20^FD${labelData}^FS^XZ`);
  }
}
