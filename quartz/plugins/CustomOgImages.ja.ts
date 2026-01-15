import fs from "fs/promises"
import path from "path"
import { createCanvas, registerFont } from "canvas"
import type { QuartzEmitterPlugin } from "../types"

const FONT_PATH = "assets/fonts/NotoSansJP-Regular.ttf"

export const CustomOgImagesJA: QuartzEmitterPlugin = () => {
  return {
    name: "CustomOgImagesJA",

    async emit(ctx) {
      const outDir = path.join(ctx.argv.output, "og")
      const absOutDir = path.resolve(outDir)

      console.log("::notice::[OG] Output directory:", absOutDir)

      await fs.mkdir(outDir, { recursive: true })

      // フォント登録
      try {
        const absFontPath = path.resolve(FONT_PATH)
        console.log("::notice::[OG] Registering font:", absFontPath)
        registerFont(absFontPath, { family: "NotoSansJP" })
      } catch (e) {
        console.error("::error::[OG] Font register failed", e)
        throw e
      }

      console.log("::notice::[OG] Total input files:", ctx.allFiles.length)

      for (const file of ctx.allFiles) {
        try {
          if (typeof file === "string") {
            console.log("[OG] Skipped (string):", file)
            continue
          }

          if (!file.slug) {
            console.log("[OG] Skipped (no slug):", file.filePath)
            continue
          }

          const title =
            file.frontmatter?.title ??
            file.slug.replace(/-/g, " ")

          console.log("::notice::[OG] Generating for:", file.slug)

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
          const absOutPath = path.resolve(outPath)

          await fs.writeFile(outPath, buffer)

          console.log("::notice::[OG GENERATED]:", absOutPath)

          // frontmatter 注入
          file.frontmatter = file.frontmatter ?? {}
          file.frontmatter.ogImage = `/og/${file.slug}.png`

        } catch (err) {
          console.error("::error::[OG] Failed for file:", file)
          console.error(err)
          throw err
        }
      }

      console.log("::notice::[OG] Generation finished")

      return []
    },
  }
}

// 自動改行
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
