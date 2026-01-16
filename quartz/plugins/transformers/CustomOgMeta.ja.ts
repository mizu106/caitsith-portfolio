import type { QuartzTransformerPlugin } from "../types"

export const CustomOgMetaJA: QuartzTransformerPlugin = () => {
  return {
    name: "CustomOgMetaJA",

    async transform(_ctx, files) {
      for (const file of files) {
        if (!file.slug) continue

        file.frontmatter = file.frontmatter ?? {}
        file.frontmatter.ogImage = `/og/${file.slug}.png`
      }

      return files
    },
  }
}
