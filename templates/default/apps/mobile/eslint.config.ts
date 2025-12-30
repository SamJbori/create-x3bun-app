// https://docs.expo.dev/guides/using-eslint/
import { defineConfig } from "eslint/config";
//@ts-expect-error
import expoConfig from "eslint-config-expo/flat";
import { config } from "@hwa/eslint/base";

export default defineConfig([
  config,
  expoConfig,
  {
    ignores: ["dist/*"],
  },
  {
    rules: {
      "react/react-in-jsx-scope": "off",
      "react/display-name": "off",
    },
  },
]);
