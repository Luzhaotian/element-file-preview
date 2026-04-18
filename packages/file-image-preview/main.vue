<template>
  <div
    class="file-image-preview-gallery"
    :style="{
      gap: `${gap}px`,
    }"
  >
    <el-image
      v-for="(url, index) in urls"
      :key="url + index"
      class="file-image-preview-thumb"
      :style="thumbStyle"
      :src="url"
      :preview-src-list="urls"
      fit="cover"
    />
  </div>
</template>

<script>
export default {
  name: "FileImagePreview",
  props: {
    urls: {
      type: Array,
      required: true,
    },
    thumbSize: {
      type: Number,
      default: 140,
    },
    gap: {
      type: Number,
      default: 16,
    },
  },
  computed: {
    thumbStyle() {
      const s = `${this.thumbSize}px`;
      return { width: s, height: s };
    },
  },
};
</script>

<style scoped>
.file-image-preview-gallery {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}

.file-image-preview-thumb {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  background: #fff;
}
</style>
