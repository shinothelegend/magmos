import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";

const config: Config = {
  title: "Magmos",
  tagline: "Streaming payroll with a native yield layer, built on HashKey Chain",
  favicon: "img/favicon.png",

  future: {
    v4: true,
  },

  url: "https://docs.magmos.app",
  baseUrl: "/",

  organizationName: "magmos",
  projectName: "magmos-docs",

  onBrokenLinks: "warn",

  markdown: {
    hooks: {
      onBrokenMarkdownLinks: "warn",
    },
  },

  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "classic",
      {
        docs: {
          routeBasePath: "/",
          sidebarPath: "./sidebars.ts",
        },
        blog: false,
        theme: {
          customCss: "./src/css/custom.css",
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: "img/magmos-logo.png",
    colorMode: {
      defaultMode: "dark",
      respectPrefersColorScheme: false,
    },
    navbar: {
      title: "Magmos",
      logo: {
        alt: "Magmos",
        src: "img/magmos-logo.png",
      },
      items: [
        {
          type: "docSidebar",
          sidebarId: "docsSidebar",
          position: "left",
          label: "Documentation",
        },
        {
          to: "/concepts/streaming-payroll",
          label: "Concepts",
          position: "left",
        },
        {
          to: "/sdk/overview",
          label: "Accept Payments",
          position: "left",
        },
        {
          href: "https://github.com/magmos",
          label: "GitHub",
          position: "right",
        },
      ],
    },
    footer: {
      style: "light",
      links: [
        {
          title: "Product",
          items: [
            { label: "Introduction", to: "/" },
            { label: "Concepts", to: "/concepts/streaming-payroll" },
            { label: "Fees", to: "/fees" },
          ],
        },
        {
          title: "Accept Payments",
          items: [
            { label: "Checkout SDK", to: "/sdk/overview" },
            { label: "Payment Links", to: "/sdk/payment-links" },
          ],
        },
        {
          title: "More",
          items: [
            { label: "GitHub", href: "https://github.com/magmos" },
            { label: "Arc", href: "https://arc.io" },
          ],
        },
      ],
      copyright: `Copyright ${new Date().getFullYear()} Magmos. Built on HashKey Chain.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ["bash", "json", "rust", "typescript", "tsx"],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
