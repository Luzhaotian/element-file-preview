<template>
  <img
    class="el-image-viewer__img media-pane__img"
    :src="url"
    alt=""
    :style="imgStyle"
    @click.stop
    @mousedown="$emit('image-mousedown', $event)"
    @load="$emit('image-load')"
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
    imgStyle: {
      type: Object,
      default: () => ({}),
    },
  },
  methods: {
    pause() {},
    resetPlayback() {},
    onError(e) {
      if (e.target) e.target.alt = "加载失败";
      this.$emit("image-error");
    },
  },
};
</script>

<style scoped>
.media-pane__img {
  object-fit: contain;
}
</style>
