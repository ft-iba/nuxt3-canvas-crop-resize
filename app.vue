<script setup lang="ts">
import { ref } from 'vue';
import { BASE_URL } from '~/utils/constants';

const photoPreviewUrl = ref<string>('');
const trimImage = ref<boolean>(true); // 正方形にトリミングするか
const isRunning = ref<boolean>(false); // 処理中か

const inputFileNode = ref<HTMLInputElement | null>(null);
const canvas = ref<HTMLCanvasElement | null>(null);
const activeIndex = ref<number | null>(null);
const choiceButtonNodes = ref<NodeListOf<HTMLButtonElement> | null>(null);

const targetSize = 1024; // この正方形にリサイズ
const contentType = 'image/jpeg';

const onClickChoiceIcon = (index: number) => {
  activeIndex.value = index;
};

const onClickUploadButton = () => {
  inputFileNode.value?.click();
}

const handleFileUpload = async (event: Event): Promise<void> => {
  console.log('handleFileUpload');
  if (isRunning.value) return;
  isRunning.value = true;

  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) {
    const img = await loadImage(file);
    const ctx = canvas.value?.getContext('2d');
    if (!ctx || !canvas.value) return;

    drawImageOnCanvas(img, ctx);

    isRunning.value = false;
  }
};

const loadImage = (file: File): Promise<HTMLImageElement> => {
  console.log('loadImage');
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const drawImageOnCanvas = (img: HTMLImageElement, ctx: CanvasRenderingContext2D) => {
  // trimImage.value が true の時は正方形にトリミング
  const size = trimImage.value
    ? { width: Math.min(img.width, img.height), height: Math.min(img.width, img.height) }
    : { width: img.width, height: img.height };

  // キャンバスをtargetSizeの正方形に設定
  canvas.value!.width = targetSize;
  canvas.value!.height = targetSize;

  // 画像の中央部分をトリミングして描画
  const offsetX = (img.width - size.width) / 2;
  const offsetY = (img.height - size.height) / 2;

  // トリミングした画像をtargetSizeのキャンバスにリサイズして描画
  ctx.drawImage(img, offsetX, offsetY, size.width, size.height, 0, 0, targetSize, targetSize);

  photoPreviewUrl.value = canvas.value!.toDataURL(contentType);
};

const onClickChoiceButton = () => {
  if (!choiceButtonNodes.value) return;
  const activeTarget = Array.from(choiceButtonNodes.value).find((item => item.dataset.active === 'true'));
  const child = activeTarget?.childNodes[0];
  if (!(child instanceof HTMLImageElement)) return;
  photoPreviewUrl.value = child.src;
}
</script>

<template>
  <div class="iconSetting">
    <p>1.0.0</p>
    <p>アルバムから選択・または写真を撮影</p>
    <div class="iconSetting__upload">
      <div class="iconSetting__item">
        <button
          @click="onClickUploadButton"
          class="iconSetting__button"
        >
          <span class="iconSetting__buttonLabel">画像をアップロード</span>
        </button>
        <input
          ref="inputFileNode"
          type="file"
          id="photoUpload"
          accept="image/*;capture=camera"
          @change="handleFileUpload"
          class="iconSetting__input"
        />
      </div>
      <canvas
        ref="canvas"
        style="display: none;"
      ></canvas>
    </div>

    <div class="iconSetting__choice">
      <p>アイコンを選択する</p>
      <ul class="iconSetting__choiceList">
        <li
          v-for="n in 6"
          :key="n"
          class="iconSetting__choiceItem"
        >
          <button
            @click="onClickChoiceIcon(n)"
            ref="choiceButtonNodes"
            :data-active="activeIndex === n"
            :data-id="n"
            class="iconSetting__choiceButton"
            type="button"
          >
            <img
              :src="`${BASE_URL}images/uifaces-abstract-image${n}.jpg`"
              height="1024"
              width="1024"
              class="iconSetting__choiceSrc"
              alt=""
            />
          </button>
        </li>
      </ul>
      <div class="iconSetting__item">
        <button
          @click="onClickChoiceButton"
          :disabled="activeIndex === null"
          class="iconSetting__button"
        >
          <span class="iconSetting__buttonLabel">選択する</span>
        </button>
      </div>
    </div>

    <div class="iconSetting__preview">
      <p>プロフィールアイコン</p>
      <div class="iconSetting__previewImage">
        <img
          :src="photoPreviewUrl"
          class="iconSetting__previewSrc"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.iconSetting {
  text-align: center;
}

.iconSetting__item {
  margin-top: 0.5em;
  margin-bottom: 0.5em;
}

.iconSetting__button {
  background-color: transparent;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-inline: auto;
  padding: 0.8em 3.2em;
  position: relative;
  &::before {
    background-color: #232023;
    border-radius: calc(infinity * 1px);
    content: '';
    display: block;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    transition: background-color 0.2s;
    width: 100%;
    z-index: -1;
  }
  &:hover::before {
    background-color: #0a0a0a;
  }
  &:not(:disabled) {
    cursor: pointer;
  }
  &:disabled::before {
    background-color: #777;
  }
}

.iconSetting__buttonLabel {
  color: #fff;
  user-select: none;
}

.iconSetting__input {
  display: none;
}

.iconSetting__choiceList {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 2vw;
  margin-inline: auto;
  padding: 0;
  width: 60vw;
}

.iconSetting__choiceItem {
  list-style: none;
  width: 12vw;
}

.iconSetting__choiceButton {
  background-color: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  position: relative;
  &::after {
    border: 4px solid #232023;
    border-radius: calc(infinity * 1px);
    box-sizing: border-box;
    content: '';
    display: block;
    height: 100%;
    opacity: 0;
    position: absolute;
    top: 0;
    left: 0;
    transition: opacity 0.2s;
    width: 100%;
  }
  &[data-active="true"]::after {
    opacity: 1;
  }
}

.iconSetting__choiceSrc {
  border-radius: calc(infinity * 1px);
  height: auto;
  width: 100%;
}

.iconSetting__preview {
  margin-top: 2em;
}

.iconSetting__previewImage {
  margin-inline: auto;
  width: 16vw;
}

.iconSetting__previewSrc {
  border-radius: calc(infinity * 1px);
  height: auto;
  width: 100%;
}
</style>
