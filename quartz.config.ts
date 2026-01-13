import { QuartzConfig } from "./quartz/cfg"
import * as Plugin from "./quartz/plugins"

/**
 * Quartz 4 Configuration
 *
 * See https://quartz.jzhao.xyz/configuration for more information.
 */
const config: QuartzConfig = {
  configuration: {
    pageTitle: "caitsith's Learning Log",
    pageDescription: "Designing, Learning, and Thinking in Public",
    enableSPA: true,
    enablePopovers: true,
    analytics: null,
    locale: "ja-JP",
    baseUrl: "mizu106.github.io/caitsith-portfolio",
    ignorePatterns: ["private", "templates", ".obsidian"],
    defaultDateType: "modified",
    theme: {
      fontOrigin: "googleFonts",
      cdnCaching: true,
      typography: {
        header: "Inter",
        body: "Inter",
        code: "JetBrains Mono",
      },
      colors: {
        lightMode: {
          light: "#faf8f5",
          lightgray: "#e5e5e5",
          gray: "#bdbdbd",
          darkgray: "#4e4e4e",
          dark: "#1a1a1a",
          secondary: "#6b4eff",
          tertiary: "#d1c9ff",
          highlight: "rgba(107, 78, 255, 0.15)",
        },
        darkMode: {
          light: "#1a1a1a",
          lightgray: "#2a2a2a",
          gray: "#6e6e6e",
          darkgray: "#d4d4d4",
          dark: "#faf8f5",
          secondary: "#a694ff",
          tertiary: "#3b2f80",
          highlight: "rgba(166, 148, 255, 0.15)",
        },
      },
    },
  },
  plugins: {
      transformers: [
      Plugin.FrontMatter(),
      Plugin.CreatedModifiedDate({
        priority: ["frontmatter", "git", "filesystem"],
      }),
      Plugin.SyntaxHighlighting(),
      Plugin.ObsidianFlavoredMarkdown({
        resolveFileLinks: true,  // フォルダ付きリンクも解決
        linkResolver: (link) => {
          // [[Folder/File]] を /Folder/File に変換
          return "/" + link.replace(/\\/g, "/")
        },
      }),
      Plugin.GitHubFlavoredMarkdown(),
      Plugin.TableOfContents(),
      Plugin.CrawlLinks(),
      Plugin.Description(),
      Plugin.Latex({ renderEngine: "katex" }),
    ],
    filters: [Plugin.RemoveDrafts()],
    emitters: [
      Plugin.AliasRedirects(),
      Plugin.ComponentResources(),
      Plugin.ContentPage(),
      Plugin.FolderPage(),
      Plugin.TagPage(),
      Plugin.ContentIndex({
        enableSiteMap: true,
        enableRSS: true,
      }),
      Plugin.Assets(),
      Plugin.Static(),
      Plugin.Favicon(),
      Plugin.NotFoundPage(),
      // Comment out CustomOgImages to speed up build time
      Plugin.CustomOgImages(),
    ],
  },
  markdown: {
    wikilinks: true,
    resolveAliases: true,
    defaultLinkType: "wiki",
  },
  slugify: "obsidian",
}

export default config
