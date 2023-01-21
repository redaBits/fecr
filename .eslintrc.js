module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  parserOptions: {
    ecmaVersion: 2018,
  },
  extends: [
    "eslint:recommended",
    "google",
  ],
  ignorePatterns: ["build"],
  rules: {
    quotes: ["error", "double"],
    "require-jsdoc": "off",
  },
};
