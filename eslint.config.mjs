// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";
import storybook from "eslint-plugin-storybook";

const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypeScript,
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  ...storybook.configs["flat/recommended"],
  {
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "Literal[value=/(#[0-9A-Fa-f]{6}|var\\(--|rgba?\\(|hsla?\\()/]",
          message:
            "직접 색상값 사용은 금지됩니다. tailwind에 정의된 토큰 클래스를 사용하세요. 예: bg-primary, text-gray-800 (hex/var(--...)/rgb()/hsl() 등 임의값 모두 차단)",
        },
        {
          selector:
            "TemplateElement[value.raw=/(#[0-9A-Fa-f]{6}|var\\(--|rgba?\\(|hsla?\\()/]",
          message:
            "직접 색상값 사용은 금지됩니다. tailwind에 정의된 토큰 클래스를 사용하세요.",
        },
      ],
    },
  },
];

export default eslintConfig;
