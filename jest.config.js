module.exports = {
  transform: {
    "^.+\\.[t|j]sx?$": "babel-jest", // Use babel-jest to support ES module syntax
  },
  extensionsToTreatAsEsm: [".ts", ".tsx"], // Ensure Jest treats these as ESM
  globals: {
    "ts-jest": {
      useESM: true, // Enable ES module handling in ts-jest
    },
  },
};
