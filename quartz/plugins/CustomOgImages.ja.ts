import { createCanvas, registerFont } from "canvas"
import fs from "fs"
import path from "path"

registerFont("/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc", {
  family: "Noto Sans JP",
})

export function CustomOgImagesJA() {
  return {
    name: "CustomOgImagesJA",
    emit: async (ctx, content, resources) => {
      for (const page of content) {
        const title = decodeURIComponent(page.slug).replace(/-/g, " ")

        const canvas = createCanvas(1200, 630)
        const ctx2d = canvas.getContext("2d")

        ctx2d.fillStyle = "#0f172a"
        ctx2d.fillRect(0, 0, 1200, 630)

        ctx2d.font = "bold 64px 'Noto Sans JP'"
        ctx2d.fillStyle = "#ffffff"

        wrapText(ctx2d, title, 100, 200, 1000, 80)

        const buffer = canvas.toBuffer("image/png")
        const outPath = path.join("public", "og", `${page.slug}.png`)
        fs.mkdirSync(path.dirname(outPath), { recursive: true })
        fs.writeFileSync(outPath, buffer)

        page.frontmatter.ogImage = `/og/${page.slug}.png`
      }
    },
  }
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const chars = text.split("")
  let line = ""

  for (const ch of chars) {
    const testLine = line + ch
    const metrics = ctx.measureText(testLine)

    if (metrics.width > maxWidth) {
      ctx.fillText(line, x, y)
      line = ch
      y += lineHeight
    } else {
      line = testLine
    }
  }

  ctx.fillText(line, x, y)
}
