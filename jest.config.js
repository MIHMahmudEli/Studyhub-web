// Jest config via next/jest so the `@/` alias and Next's transforms work.
const nextJest = require('next/jest');

const createJestConfig = nextJest({ dir: './' });

module.exports = createJestConfig({
  testEnvironment: 'node',
});
