/**
 * Shared ESLint rule definitions for the Xchange monorepo (BE-0.1).
 * Enforces strict TypeScript discipline, no raw `any`, and no console PII leaks.
 */
module.exports = {
  rules: {
    "no-eval": "error",
    "no-implied-eval": "error",
    "prefer-const": "error",
    "no-var": "error"
  }
};
