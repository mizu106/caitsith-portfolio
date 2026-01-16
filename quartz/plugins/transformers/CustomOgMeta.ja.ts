import type { QuartzTransformerPlugin } from "../types"

export const CustomOgMetaJA: QuartzTransformerPlugin = () => {
  return {
    name: "CustomOgMetaJA",

    htmlPlugins(ctx) {
      return [
        {
          name: "custom-og-meta-ja",
          transform: (tree, file) => {
            if (!file.slug) return

            const title =
              file.frontmatter?.title ??
              file.slug.replace(/-/g, " ")

            const description =
              file.frontmatter?.description ?? ""

            const ogImage = `/og/${file.slug}.png`
            const ogUrl = `${ctx.cfg.baseUrl}/${file.slug}`

            const head = tree.children.find(
              (n) => n.type === "element" && n.tagName === "head"
            )
            if (!head) return

            const push = (tagName, properties) => {
              head.children.push({
                type: "element",
                tagName,
                properties,
                children: [],
              })
            }

            // Open Graph
            push("meta", { property: "og:title", content: title })
            push("meta", { property: "og:description", content: description })
            push("meta", { property: "og:type", content: "website" })
            push("meta", { property: "og:url", content: ogUrl })
            push("meta", { property: "og:image", content: ogImage })

            // Twitter
            push("meta", { name: "twitter:card", content: "summary_large_image" })
            push("meta", { name: "twitter:title", content: title })
            push("meta", { name: "twitter:description", content: description })
            push("meta", { name: "twitter:image", content: ogImage })
          },
        },
      ]
    },
  }
}
