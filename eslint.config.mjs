import eslintConfigPrettier from "eslint-config-prettier";
import pluginVue from "eslint-plugin-vue";
import js from "@eslint/js";

export default [
  js.configs.recommended,

  ...pluginVue.configs["flat/recommended"],
  eslintConfigPrettier,
  {
    ignores: ["src/assets/", "public/", "dist/"],
  },
];
