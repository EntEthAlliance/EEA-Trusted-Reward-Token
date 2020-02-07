require('dotenv').config({ path: '../server.env' });

module.exports = {
  testEnvironment: 'node',
  testRegex: './tests/.*.spec.ts$',
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
};
