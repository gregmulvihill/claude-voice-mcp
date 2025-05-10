// jest.config.js
export default {
  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: false,
  
  // The directory where Jest should output its coverage files
  coverageDirectory: "coverage",
  
  // An array of glob patterns indicating a set of files for which coverage should be collected
  collectCoverageFrom: [
    "src/**/*.js",
    "!src/index.js",
    "!**/node_modules/**"
  ],
  
  // The test environment that will be used for testing
  testEnvironment: "node",
  
  // Required for ES modules
  transform: {},
  extensionsToTreatAsEsm: [".js"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1"
  },
  
  // A list of paths to directories that Jest should use to search for test files
  testMatch: ["**/__tests__/**/*.js", "**/?(*.)+(spec|test).js"],
  
  // An array of regexp pattern strings that are matched against all test paths
  testPathIgnorePatterns: ["/node_modules/"],
  
  // A map from regular expressions to paths to transformers
  transformIgnorePatterns: []
};
