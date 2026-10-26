// Ошибки здесь — это ключи словаря (image.err.*), переводит их вызывающий код.
// Подготовка обложки проекта на клиенте: обрезаем до 16:9 (как карточки проектов),
// уменьшаем и сжимаем в JPEG, чтобы data-URL весил ~100–300 КБ и спокойно лежал в БД.

const COVER_W = 1280
const COVER_H = 720
export const MAX_COVER_SOURCE_MB = 15

export async function fileToCoverDataUrl(file: File): Promise<string> {
  if (!/^image\/(jpeg|png|webp|gif|avif)$/.test(file.type)) {
    throw new Error('image.err.format')
  }
  if (file.size > MAX_COVER_SOURCE_MB * 1024 * 1024) {
    throw new Error('image.err.size')
  }

  const url = URL.createObjectURL(file)
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image()
      el.onload = () => resolve(el)
      el.onerror = () => reject(new Error('image.err.read'))
      el.src = url
    })

    // cover-кроп: вписываем так, чтобы заполнить весь кадр 16:9
    const scale = Math.max(COVER_W / img.naturalWidth, COVER_H / img.naturalHeight)
    const srcW = COVER_W / scale
    const srcH = COVER_H / scale
    const srcX = (img.naturalWidth - srcW) / 2
    const srcY = (img.naturalHeight - srcH) / 2

    // не растягиваем маленькие картинки: если исходник меньше кадра, оставляем его размер
    const canvas = document.createElement('canvas')
    canvas.width = Math.min(COVER_W, Math.round(srcW))
    canvas.height = Math.min(COVER_H, Math.round(srcH))
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('image.err.process')
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, canvas.width, canvas.height)

    return canvas.toDataURL('image/jpeg', 0.82)
  } finally {
    URL.revokeObjectURL(url)
  }
}

/** Рисует градиент 16:9 и возвращает маленький JPEG data-URL — «обложка из цветов» без загрузки файла */
export function gradientToDataUrl(from: string, to: string): string {
  const canvas = document.createElement('canvas')
  canvas.width = 640
  canvas.height = 360
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('projectModal.err.gradient')
  const g = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
  g.addColorStop(0, from)
  g.addColorStop(1, to)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  return canvas.toDataURL('image/jpeg', 0.85)
}
