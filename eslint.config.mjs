import nextConfig from "eslint-config-next/core-web-vitals";

const config = [
  ...nextConfig,
  {
    rules: {
      "react-hooks/exhaustive-deps": "warn",
      "no-console": ["warn", { allow: ["error", "warn"] }],
      "no-debugger": "error",
    },
  },
];

export default config;
