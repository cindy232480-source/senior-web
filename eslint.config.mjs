// eslint.config.mjs
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  // ⭐ 我們加的自訂規則，避免 Vercel build 失敗 ⭐
  {
    rules: {
      // 你專案目前大量使用 any，先放過
      "@typescript-eslint/no-explicit-any": "off",

      // Next 15 新增的 "避免在 effect 裡直接 setState()" 先關掉
      "react-hooks/set-state-in-effect": "off",

      // useEffect 缺少 dependency 不要升級成錯誤
      "react-hooks/exhaustive-deps": "warn",

      // 你很多地方用 <img>，先允許，不然會一直擋
      "@next/next/no-img-element": "off",

      // 圖片 alt 規則 → 降為警告
      "jsx-a11y/alt-text": "warn",
    },
  },

  // 保留原本的 ignore 設定
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
