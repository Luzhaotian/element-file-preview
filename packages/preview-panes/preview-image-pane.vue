<template>
  <img
    class="el-image-viewer__img file-preview-pane__img"
    :src="url"
    alt=""
    @click.stop
    @error="onImgError"
  />
</template>

<script>
export default {
  name: "PreviewImagePane",
  props: {
    url: {
      type: String,
      required: true,
    },
  },
  methods: {
    pause() {},
    onImgError(e) {
      if (e.target) e.target.alt = "加载失败";
    },
  },
};
</script>

<style scoped>
.file-preview-pane__img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}
</style>
