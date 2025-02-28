# zebra-browser-print

A JavaScript wrapper for interacting with Zebra printers using the Browser Print API. This package provides functionalities to retrieve available printers, set a default printer, check printer status, and send print commands.

## Installation

```sh
npm install zebra-browser-print
```

## Usage

### Import and Initialize

```typescript
import ZebraBrowserPrintWrapper from "zebra-browser-print";

const printer = new ZebraBrowserPrintWrapper();
```

### Get Available Printers

```typescript
printer.getAvailablePrinters()
  .then(printers => console.log("Available Printers:", printers))
  .catch(error => console.error("Error fetching printers:", error));
```

### Get Default Printer

```typescript
printer.getDefaultPrinter()
  .then(device => console.log("Default Printer:", device))
  .catch(error => console.error("Error fetching default printer:", error));
```

### Set a Printer

```typescript
const myPrinter = { name: "Zebra Printer", deviceType: "USB", connection: "USB", uid: "12345", provider: "Zebra", manufacturer: "Zebra Technologies", version: 0 };
printer.setPrinter(myPrinter);
```

### Get Selected Printer

```typescript
const selectedPrinter = printer.getPrinter();
console.log("Selected Printer:", selectedPrinter);
```

### Check Printer Status

```typescript
printer.checkPrinterStatus()
  .then(status => console.log("Printer Status:", status))
  .catch(error => console.error("Error checking printer status:", error));
```

### Print Raw Text

```typescript
printer.print("Hello, Zebra!")
  .then(() => console.log("Print Successful"))
  .catch(error => console.error("Error printing:", error));
```

### Print Label

```typescript
printer.printLabel("Sample Label Text")
  .then(() => console.log("Label Printed Successfully"))
  .catch(error => console.error("Error printing label:", error));
```

## Methods

### `getAvailablePrinters(): Promise<Device[]>`
Retrieves a list of available Zebra printers.

### `getDefaultPrinter(): Promise<Device>`
Fetches the default printer settings.

### `setPrinter(device: Device): void`
Sets the active printer.

### `getPrinter(): Device`
Gets the currently selected printer.

### `checkPrinterStatus(): Promise<{ isReadyToPrint: boolean, errors: string[] }>`
Checks the printer status and returns error messages if any.

### `write(data: string): Promise<void>`
Sends raw data to the printer.

### `read(): Promise<string>`
Reads data from the printer.

### `print(text: string): Promise<void>`
Sends text to the printer for printing.

### `printLabel(labelData: string): Promise<void>`
Prints a label using Zebra label formatting.

## Error Handling
- If no printers are available, an error is thrown.
- If the default printer cannot be found, an error is thrown.
- If a printer operation fails, an error message is returned.

## License
MIT License

## Author
**[Saif Ali](https://github.com/SAIF-git903)**
