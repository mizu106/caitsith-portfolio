import { QuartzEmitterPlugin } from "../types"
import { createCanvas, registerFont } from "canvas"
import fs from "fs"
import path from "path"

registerFont(path.resolve("assets/fonts/NotoSansJP-Regular.otf"), {
  family: "NotoSansJP",
})

export const CustomOgImagesJA: QuartzEmitterPlugin = () => {
  return {
    name: "CustomOgImagesJA",
    emit: async (ctx) => {
      const outDir = path.join(ctx.argv.output, "og")

      if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true })
      }

      for (const page of ctx.pages) {
        const title = page.frontmatter?.title ?? page.title
        const desc = page.frontmatter?.description ?? ""

        const canvas = createCanvas(1200, 630)
        const c = canvas.getContext("2d")

        // 背景
        c.fillStyle = "#0f172a"
        c.fillRect(0, 0, 1200, 630)

        // タイトル
        c.fillStyle = "#ffffff"
        c.font = "bold 64px NotoSansJP"
        wrapText(c, title, 80, 180, 1040, 72)

        // description
        c.font = "32px NotoSansJP"
        c.fillStyle = "#cbd5f5"
        wrapText(c, desc, 80, 360, 1040, 44)

        const buffer = canvas.toBuffer("image/png")
        const fileName = page.slug.replace(/\//g, "_") + ".png"
        fs.writeFileSync(path.join(outDir, fileName), buffer)
      }
    },
  }
}

function wrapText(
  ctx,
  text,
  x,
  y,
  maxWidth,
  lineHeight
) {
  const words = text.split("")
  let line = ""

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i]
    const metrics = ctx.measureText(testLine)
    if (metrics.width > maxWidth && i > 0) {
      ctx.fillText(line, x, y)
      line = words[i]
      y += lineHeight
    } else {
      line = testLine
    }
  }
  ctx.fillText(line, x, y)
}
