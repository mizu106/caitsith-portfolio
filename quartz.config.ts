import { defineConfig } from "./quartz.config.def"
import * as Plugin from "./quartz/plugins"

export default defineConfig({
  configuration: {
    pageTitle: "caitsith-portfolio",
    enableSPA: true,
    enablePopovers: true,
    analytics: null,
    locale: "ja-JP",
  },

  markdown: {
    wikilinks: true,
    resolveAliases: true,
    defaultLinkType: "wiki",
    frontmatterAliases: true,
  },

  // Obsidian互換 slug 生成
  slugify: "obsidian",

  plugins: {
    transformers: [
      Plugin.FrontMatter(),
      Plugin.GitHubFlavoredMarkdown(),
      Plugin.TableOfContents(),
      Plugin.CreatedModifiedDate(),
      Plugin.ObsidianFlavoredMarkdown(), // ← 重要
      Plugin.SyntaxHighlighting(),
    ],
    filters: [Plugin.RemoveDrafts()],
    emitters: [
      Plugin.AliasRedirects(), // ← 404回避に必須
      Plugin.ComponentResources(),
      Plugin.ContentPage(),
      Plugin.FolderPage(),
      Plugin.TagPage(),
      Plugin.ContentIndex(),
      Plugin.Assets(),
      Plugin.Static(),
      Plugin.NotFoundPage(),
    ],
  },
})
