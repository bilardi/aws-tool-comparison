module.exports = {
  verbose: true,
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.(ts|tsx)?$': 'ts-jest'
  },
  testPathIgnorePatterns: [
    "/node_modules/",
    "/bin/",
    "/lib/"
  ],
  moduleFileExtensions: [
    "ts",
    "tsx",
    "js",
    "jsx",
    "node"
  ],
  setupFilesAfterEnv: [
    "jest-extended"
  ]
};
