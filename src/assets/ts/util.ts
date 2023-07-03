const CANVAS_SIZE = 800

const getColorCode = (r: number, g: number, b: number) => {
  const toHex = (n: number) => padZero(n.toString(16), 2)
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

const getFontClass = (r: number, g: number, b: number) => {
  return (r * 299 + g * 587 + b * 114) < 128000 ? 'text-white' : 'text-black'
}

const calcCanvasSize = (imgWidth: number, imgHeight: number) => {
  const calc = (len: number, geoMean: number) => {
    return geoMean <= CANVAS_SIZE ? len : (len * CANVAS_SIZE / geoMean)
  }
  const geoMean = Math.sqrt(imgWidth * imgHeight)
  return {
    canvasWidth: calc(imgWidth, geoMean),
    canvasHeight: calc(imgHeight, geoMean),
  }
}

const getYmdhms = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = padZero(now.getMonth() + 1, 2)
  const date = padZero(now.getDate(), 2)
  const hours = padZero(now.getHours(), 2)
  const minutes = padZero(now.getMinutes(), 2)
  const seconds = padZero(now.getSeconds(), 2)
  return year + month + date + hours + minutes + seconds
}

const padZero = (v: number | string, len: number) => {
  return ('0'.repeat(len) + v).slice(len * -1)
}

export default {
  getColorCode,
  getFontClass,
  calcCanvasSize,
  getYmdhms,
}
