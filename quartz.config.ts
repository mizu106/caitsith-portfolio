import { defineConfig } from "@jackyzha0/quartz"
import * as Plugin from "./quartz/plugins"

export default defineConfig({
  // サイト基本設定
  site: {
    title: "caitsith-portfolio",
    description: "Obsidian Vault直結の技術ポートフォリオ",
    baseUrl: "/caitsith-portfolio/",
    locale: "ja-JP",
    enableSPA: true,
    enablePopovers: true,
    analytics: null,
  },

  // Markdown 設定
  markdown: {
    wikilinks: true,           // [[wikiリンク]] を有効化
    resolveAliases: true,      // aliasを解決
    defaultLinkType: "wiki",   // Wikiリンク形式
    frontmatterAliases: true,  // frontmatterのaliasも解決
  },

  // Slug 生成方式（Obsidian互換）
  slugify: "obsidian",

  // プラグイン設定
  plugins: {
    transformers: [
      Plugin.FrontMatter(),
      Plugin.GitHubFlavoredMarkdown(),
      Plugin.TableOfContents(),
      Plugin.CreatedModifiedDate(),
      Plugin.ObsidianFlavoredMarkdown(), // フォルダリンク対応
      Plugin.SyntaxHighlighting(),
    ],
    filters: [
      Plugin.RemoveDrafts(),
    ],
    emitters: [
      Plugin.AliasRedirects(),        // 404防止
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
