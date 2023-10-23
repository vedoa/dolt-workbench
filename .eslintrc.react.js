const { settings, parser, parserOptions, rules } = require("./.eslintrc");

module.exports = {
  parser,
  parserOptions,
  settings,
  env: {
    browser: true,
    node: true,
    "jest/globals": true,
  },
  extends: [
    "airbnb",
    "airbnb-typescript",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "prettier",
    "plugin:jest-dom/recommended",
    "plugin:testing-library/dom",
    "plugin:react/jsx-runtime",
    "plugin:@next/next/recommended",
  ],
  plugins: [
    "@typescript-eslint",
    "jest",
    "jest-dom",
    "testing-library",
    "react",
    "react-hooks",
  ],
  rules: {
    ...rules,
    "testing-library/no-node-access": [
      "error",
      { allowContainerFirstChild: true },
    ],
    "jsx-a11y/control-has-associated-label": "warn",
    "jsx-a11y/anchor-is-valid": "off",
    "react-hooks/exhaustive-deps": "warn",
    "react-hooks/rules-of-hooks": "error",
    "react/destructuring-assignment": "off",
    "react/jsx-curly-brace-presence": [
      "error",
      { children: "ignore", props: "never" },
    ],
    "react/jsx-no-constructed-context-values": "warn",
    "react/jsx-filename-extension": "off",
    "react/jsx-props-no-spreading": "off",
    "react/state-in-constructor": ["error", "never"],
    "react/require-default-props": "off",
    "react/no-unused-prop-types": "error",
    "react/prop-types": "off",
    "react/function-component-definition": [
      2,
      { namedComponents: ["function-declaration", "arrow-function"] },
    ],
  },
  overrides: [
    {
      files: ["*.js?(x)", "*test.ts?(x)"],
      rules: {
        "@typescript-eslint/no-var-requires": "off",
      },
    },
  ],
};
