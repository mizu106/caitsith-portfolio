import type { QuartzTransformerPlugin } from "../types"

export const CustomOgMetaJA: QuartzTransformerPlugin = () => {
  return {
    name: "CustomOgMetaJA",

    htmlPlugins() {
      return [
        {
          name: "custom-og-meta-ja",
          transform: (tree, file) => {
            if (!file.slug) return

            const ogPath = `/og/${file.slug}.png`

            const head = tree.children.find(
              (n) => n.type === "element" && n.tagName === "head"
            )

            if (!head) return

            head.children.push(
              {
                type: "element",
                tagName: "meta",
                properties: {
                  property: "og:image",
                  content: ogPath,
                },
                children: [],
              },
              {
                type: "element",
                tagName: "meta",
                properties: {
                  name: "twitter:card",
                  content: "summary_large_image",
                },
                children: [],
              }
            )
          },
        },
      ]
    },
  }
}
