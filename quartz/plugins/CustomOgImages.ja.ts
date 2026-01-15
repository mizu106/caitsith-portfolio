import { createCanvas, registerFont } from "canvas"
import path from "path"
import { fileURLToPath } from "url"
import type { QuartzEmitterPlugin } from "../types"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const fontRegular = path.resolve(__dirname, "../../assets/fonts/NotoSansJP-Regular.ttf")
const fontBold = path.resolve(__dirname, "../../assets/fonts/NotoSansJP-Bold.ttf")

registerFont(fontRegular, { family: "NotoSansJP", weight: "normal" })
registerFont(fontBold, { family: "NotoSansJP", weight: "bold" })

export const CustomOgImagesJA = (): QuartzEmitterPlugin => {
  return {
    name: "CustomOgImagesJA",
    getQuartzComponents() {
      return []
    },
    async emit({ cfg, allFiles }) {
      const width = 1200
      const height = 630

      for (const file of allFiles) {
        const title = file.frontmatter?.title ?? file.slug

        const canvas = createCanvas(width, height)
        const ctx = canvas.getContext("2d")

        ctx.fillStyle = "#0f172a"
        ctx.fillRect(0, 0, width, height)

        ctx.fillStyle = "#ffffff"
        ctx.font = "bold 64px NotoSansJP"
        ctx.fillText(title, 80, 200)

        const buffer = canvas.toBuffer("image/png")

        file.frontmatter = {
          ...file.frontmatter,
          image: `/og/${file.slug}.png`,
          "twitter:card": "summary_large_image",
        }

        file.generatedAssets.push({
          path: `og/${file.slug}.png`,
          data: buffer,
        })
      }

      return []
    },
  }
}
