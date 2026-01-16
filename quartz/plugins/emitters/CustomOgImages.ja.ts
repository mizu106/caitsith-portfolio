import fs from "fs/promises"
import path from "path"
import { createCanvas, registerFont } from "canvas"
import type { QuartzEmitterPlugin } from "../types"
import { isFullPage } from "../../util/vfile"

const FONT_PATH = "assets/fonts/NotoSansJP-Regular.ttf"

export const CustomOgImagesJA: QuartzEmitterPlugin = () => {
  return {
    name: "CustomOgImagesJA",

    async emit(ctx) {
      console.log("[OG] ===== emitter start =====")

      const outDir = path.join(ctx.argv.output, "og")
      await fs.mkdir(outDir, { recursive: true })
      console.log("[OG] outDir:", outDir)

      registerFont(FONT_PATH, { family: "NotoSansJP" })
      console.log("[OG] Font registered:", FONT_PATH)

      let count = 0

      for (const file of ctx.allFiles) {
        if (!isFullPage(file)) continue

        const slug = file.slug
        if (!slug) continue

        const title =
          file.frontmatter?.title ??
          file.data?.title ??
          slug.replace(/-/g, " ")

        const canvas = createCanvas(1200, 630)
        const c = canvas.getContext("2d")

        c.fillStyle = "#0f172a"
        c.fillRect(0, 0, 1200, 630)

        c.fillStyle = "#ffffff"
        c.font = "bold 60px NotoSansJP"
        c.textBaseline = "top"

        drawMultilineText(c, title, 100, 200, 1000, 80)

        const buffer = canvas.toBuffer("image/png")
        const outPath = path.join(outDir, `${slug}.png`)
        await fs.writeFile(outPath, buffer)

        console.log(`[OG] Generated: ${outPath}`)
        count++
      }

      console.log(`[OG] Done. Generated ${count} images.`)
      console.log("[OG] ===== emitter end =====")

      return []
    },
  }
}
