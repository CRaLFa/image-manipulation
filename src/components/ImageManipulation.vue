<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import util from '../assets/ts/util'

const images = ref<File[]>()
const red = ref(0)
const green = ref(0)
const blue = ref(0)
const picking = ref(false)
const downloadUrl = ref('#')
const fileName = ref('')
const isGray = ref(false)
const tmpData = ref<ImageData>()

const colorCode = computed(() => util.getColorCode(red.value, green.value, blue.value))
const colorDetail = computed(() => `R:${red.value}　G:${green.value}　B:${blue.value}`)
const colorFontClass = computed(() => util.getFontClass(red.value, green.value, blue.value))
const imgLoaded = computed(() => images.value !== undefined && 0 < images.value.length)

let canvas: HTMLCanvasElement
let context: CanvasRenderingContext2D

onMounted(() => {
  canvas = document.getElementById('canvas') as HTMLCanvasElement
  context = canvas.getContext('2d', { willReadFrequently: true })!
})

const loadImage = () => {
  if (!images.value || images.value.length < 1)
    return
  const reader = new FileReader()
  reader.onload = () => {
    const img = new Image()
    img.onload = () => drawImage(img)
    img.src = reader.result as string
  }
  reader.readAsDataURL(images.value[0])
}

const drawImage = (img: HTMLImageElement) => {
  const imgWidth = img.naturalWidth, imgHeight = img.naturalHeight
  const { canvasWidth, canvasHeight } = util.calcCanvasSize(imgWidth, imgHeight)
  ;[canvas.width, canvas.height] = [canvasWidth, canvasHeight]
  context.drawImage(img, 0, 0, imgWidth, imgHeight, 0, 0, canvasWidth, canvasHeight)
  enablePicker()
}

const enablePicker = () => {
  canvas.addEventListener('mousemove', pickColor)
  canvas.style.cursor = 'pointer'
  picking.value = true
}

const disablePicker = () => {
  canvas.removeEventListener('mousemove', pickColor)
  canvas.style.cursor = 'default'
  picking.value = false
}

const pickColor = (e: MouseEvent) => {
  const pixel = context.getImageData(e.offsetX, e.offsetY, 1, 1)
  ;[red.value, green.value, blue.value] = [pixel.data[0], pixel.data[1], pixel.data[2]]
}

const flip = () => {
  const imageData = getImageData()
  const data = imageData.data
  const copyData = data.slice()
  let i, j
  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      i = (canvas.width * y + x) * 4
      j = (canvas.width * (y + 1) - (x + 1)) * 4
      ;[data[i], data[i + 1], data[i + 2], data[i + 3]] = [copyData[j], copyData[j + 1], copyData[j + 2], copyData[j + 3]]
    }
  }
  putImageData(imageData)
}

const rotate180 = () => {
  const imageData = getImageData()
  const data = imageData.data
  const copyData = data.slice()
  let j
  for (let i = 0; i < data.length; i += 4) {
    j = (canvas.width * canvas.height - 1) * 4 - i
    ;[data[i], data[i + 1], data[i + 2], data[i + 3]] = [copyData[j], copyData[j + 1], copyData[j + 2], copyData[j + 3]]
  }
  putImageData(imageData)
}

const invert = () => {
  const imageData = getImageData()
  const data = imageData.data
  for (let i = 0; i < data.length; i += 4) {
    [data[i], data[i + 1], data[i + 2]] = [255 - data[i], 255 - data[i + 1], 255 - data[i + 2]]
  }
  putImageData(imageData)
}

const grayscale = () => {
  if (isGray.value && tmpData.value) {
    putImageData(tmpData.value)
    isGray.value = false
    return
  }
  const imageData = getImageData()
  const data = imageData.data
  tmpData.value = getImageData()
  for (let i = 0; i < data.length; i += 4) {
    const average = (data[i] + data[i + 1] + data[i + 2]) / 3
    ;[data[i], data[i + 1], data[i + 2]] = [average, average, average]
  }
  putImageData(imageData)
  isGray.value = true
}

const download = () => {
  if (!images.value || images.value.length < 1)
    return
  fileName.value = images.value[0].name.replace(/\.\w+$/, `_${util.getYmdhms()}.png`)
  downloadUrl.value = canvas.toDataURL()
}

const clear = () => {
  context.clearRect(0, 0, canvas.width, canvas.height)
  images.value = undefined
  ;[red.value, green.value, blue.value] = [0, 0, 0]
  downloadUrl.value = '#'
  fileName.value = ''
  tmpData.value = undefined
}

const getImageData = () => context.getImageData(0, 0, canvas.width, canvas.height)

const putImageData = (imageData: ImageData) => {
  context.putImageData(imageData, 0, 0)
  enablePicker()
}
</script>

<template>
  <v-app-bar color="#202124">
    <v-app-bar-title class="text-white text-h4 font-weight-bold">
      Image Manipulation
    </v-app-bar-title>
  </v-app-bar>
  <v-container>
    <v-row class="mt-0">
      <v-col cols="12">
        <v-file-input
          variant="outlined"
          label="画像を選択"
          accept="image/*"
          show-size
          prepend-icon="mdi-camera"
          v-model="images"
          @change="loadImage"
        />
      </v-col>
    </v-row>
    <v-row class="mt-0">
      <v-col cols="6">
        <v-btn
          theme="dark"
          class="text-white font-weight-bold"
          block
          prepend-icon="mdi-flip-horizontal"
          @click="flip"
        >
          左右反転
        </v-btn>
      </v-col>
      <v-col cols="6">
        <v-btn
          theme="dark"
          class="text-white font-weight-bold"
          block
          prepend-icon="mdi-rotate-3d-variant"
          @click="rotate180"
        >
          180°回転
        </v-btn>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="6">
        <v-btn
          theme="dark"
          class="text-white font-weight-bold"
          block
          prepend-icon="mdi-invert-colors"
          @click="invert"
        >
          色反転
        </v-btn>
      </v-col>
      <v-col cols="6">
        <v-btn
          theme="dark"
          class="text-white font-weight-bold"
          block
          prepend-icon="mdi-invert-colors-off"
          @click="grayscale"
        >
          カラー ⇔ モノクロ
        </v-btn>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="6">
        <v-btn
          color="#0000a8"
          class="text-white font-weight-bold"
          block
          prepend-icon="mdi-download"
          :href="downloadUrl"
          :download="fileName"
          :disabled="!imgLoaded"
          @click="download"
        >
          ダウンロード
        </v-btn>
      </v-col>
      <v-col cols="6">
        <v-btn
          color="#a80000"
          class="text-white font-weight-bold"
          block
          prepend-icon="mdi-delete"
          @click="clear"
        >
          クリア
        </v-btn>
      </v-col>
    </v-row>
    <v-row :class="imgLoaded ? '' : 'hidden'">
      <v-col cols="12">
        <v-card :color="colorCode" :class="colorFontClass" width="200">
          <template v-slot:title>
            {{ colorCode }}
          </template>
          <v-card-text class="font-weight-bold">
            {{ colorDetail }}
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-row :class="imgLoaded ? '' : 'hidden'">
      <v-col cols="12">
        <canvas id="canvas" @click="picking ? disablePicker() : enablePicker()"></canvas>
      </v-col>
    </v-row>
  </v-container>
</template>

<style lang="scss">
main {
  background-color: #e9e4c5;
}

#canvas {
  border: 1px #808080 solid;
}

.v-card-title {
  font-weight: bold !important;
}

.hidden {
  display: none !important;
}
</style>
