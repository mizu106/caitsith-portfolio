import fs from "fs/promises"
import path from "path"
import { createCanvas, registerFont } from "canvas"
import type { QuartzEmitterPlugin } from "../types"

const FONT_PATH = "assets/fonts/NotoSansJP-Regular.ttf"

export const CustomOgImagesJA: QuartzEmitterPlugin = () => {
  return {
    name: "CustomOgImagesJA",

    async emit(ctx) {
      console.log("[OG] ===== emitter start =====")

      const outDir = path.join(ctx.argv.output, "og")
      console.log("[OG] outDir:", outDir)

      await fs.mkdir(outDir, { recursive: true })

      try {
        registerFont(FONT_PATH, { family: "NotoSansJP" })
        console.log("[OG] Font registered:", FONT_PATH)
      } catch (e) {
        console.error("[OG] Font register failed:", e)
      }

      console.log("[OG] allFiles length:", ctx.allFiles.length)

      let count = 0

      for (const file of ctx.allFiles) {
        if (typeof file === "string") {
          console.log("[OG] skip string file:", file)
          continue
        }

        if (!file.slug) {
          console.log("[OG] skip: no slug", file.filePath)
          continue
        }

        const title =
          file.frontmatter?.title ??
          file.slug.replace(/-/g, " ")

        console.log(`[OG] Generating: slug=${file.slug}, title=${title}`)

        const canvas = createCanvas(1200, 630)
        const c = canvas.getContext("2d")

        c.fillStyle = "#0f172a"
        c.fillRect(0, 0, 1200, 630)

        c.fillStyle = "#ffffff"
        c.font = "bold 60px NotoSansJP"
        c.textBaseline = "top"

        drawMultilineText(c, title, 100, 200, 1000, 80)

        const buffer = canvas.toBuffer("image/png")
        const outPath = path.join(outDir, `${file.slug}.png`)

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

function drawMultilineText(ctx, text, x, y, maxWidth, lineHeight) {
  const chars = text.split("")
  let line = ""
  let yy = y

  for (const ch of chars) {
    const testLine = line + ch
    const w = ctx.measureText(testLine).width

    if (w > maxWidth) {
      ctx.fillText(line, x, yy)
      line = ch
      yy += lineHeight
    } else {
      line = testLine
    }
  }

  if (line) ctx.fillText(line, x, yy)
}
