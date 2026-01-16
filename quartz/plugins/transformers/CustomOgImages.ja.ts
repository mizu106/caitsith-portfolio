import fs from "fs/promises"
import path from "path"
import { createCanvas, registerFont } from "canvas"
import type { QuartzTransformerPlugin } from "../types"

const FONT_PATH = "assets/fonts/NotoSansJP-Regular.ttf"

export const CustomOgImagesJA: QuartzTransformerPlugin = () => {
  return {
    name: "CustomOgImagesJA",

    async transform(ctx, files) {
      const outDir = path.join(ctx.argv.output, "og")
      await fs.mkdir(outDir, { recursive: true })

      // フォント登録
      registerFont(FONT_PATH, { family: "NotoSansJP" })

      for (const file of files) {
        console.log("[OG] Processing:", file.slug)
        if (!file.slug) continue

        const title =
          file.frontmatter?.title ??
          file.slug.replace(/-/g, " ")
          const outPath = path.join(outDir, `${safeSlug}.png`)


        const canvas = createCanvas(1200, 630)
        const c = canvas.getContext("2d")

        // 背景
        c.fillStyle = "#0f172a"
        c.fillRect(0, 0, 1200, 630)

        // テキスト
        c.fillStyle = "#ffffff"
        c.font = "bold 60px NotoSansJP"
        c.textBaseline = "top"

        drawMultilineText(c, title, 100, 200, 1000, 80)

        const buffer = canvas.toBuffer("image/png")

        const outPath = path.join(outDir, `${file.slug}.png`)
        await fs.writeFile(outPath, buffer)

        // デバッグログ（Actionsに出る）
        console.log(`[OG] Generated: ${outPath}`)
        console.log("[OG] Plugin started")
        console.log("[OG] Output dir:", outDir)
        console.log("[OG] Files:", files.length)

        // frontmatter 注入
        file.frontmatter = file.frontmatter ?? {}
        file.frontmatter.ogImage = `/og/${file.slug}.png`
      }

      return files
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
