import { QuartzEmitterPlugin } from "../types"
import path from "path"
import fs from "fs"
import { createCanvas, registerFont } from "canvas"

registerFont(
  path.resolve("assets/fonts/NotoSansJP-Regular.otf"),
  { family: "Noto Sans JP" }
)

function drawWrapped(ctx, text, x, y, maxWidth, lineHeight) {
  const chars = text.split("")
  let line = ""
  const lines = []

  for (const c of chars) {
    const test = line + c
    if (ctx.measureText(test).width > maxWidth) {
      lines.push(line)
      line = c
    } else {
      line = test
    }
  }
  lines.push(line)

  const startY = y - ((lines.length - 1) * lineHeight) / 2
  lines.forEach((l, i) => {
    ctx.fillText(l, x, startY + i * lineHeight)
  })
}

function generateOg(title: string, outPath: string) {
  const width = 1200
  const height = 630

  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext("2d")

  ctx.fillStyle = "#1a1a1a"
  ctx.fillRect(0, 0, width, height)

  ctx.fillStyle = "#ffffff"
  ctx.font = "48px 'Noto Sans JP'"
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"

  drawWrapped(ctx, title, width / 2, height / 2, 960, 64)

  fs.mkdirSync(path.dirname(outPath), { recursive: true })
  fs.writeFileSync(outPath, canvas.toBuffer("image/png"))
}

export const AutoOgImages: QuartzEmitterPlugin = () => {
  return {
    name: "AutoOgImages",
    async emit(ctx, content, resources) {
      for (const [slug, file] of Object.entries(content)) {
        const decoded = decodeURIComponent(slug)
          .split("/")
          .pop()
          ?.replace(/[-_]/g, " ") ?? "Untitled"

        const out = path.join(ctx.argv.output, "og", `${slug}.png`)
        generateOg(decoded, out)

        file.data.ogImage = `/og/${slug}.png`
      }
    },
  }
}
