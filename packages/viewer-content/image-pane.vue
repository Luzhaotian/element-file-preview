<template>
  <img
    class="el-image-viewer__img viewer-content__img"
    :src="url"
    alt=""
    @click.stop
    @error="onError"
  />
</template>

<script>
export default {
  name: "ViewerImagePane",
  props: {
    url: {
      type: String,
      required: true,
    },
  },
  methods: {
    pause() {
      /* 与视频/音频统一接口，图片无需暂停 */
    },
    onError(e) {
      if (e.target) e.target.alt = "加载失败";
    },
  },
};
</script>

<style scoped>
.viewer-content__img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}
</style>
