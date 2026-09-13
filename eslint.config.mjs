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
  {
    files: ["src/features/workspace/GlobalChatHeaderControl.tsx"],
    rules: {
      "react-hooks/set-state-in-effect": "off",
    },
  },
  {
    files: ["tools/**/*.mjs"],
    rules: {
      "no-console": "off",
    },
  },
];

export default config;
