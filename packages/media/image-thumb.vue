<template>
  <el-image class="image-thumb image-thumb--fill" :src="url" fit="cover" />
</template>

<script>
export default {
  name: "ImagePreviewThumb",
  props: {
    url: {
      type: String,
      required: true,
    },
  },
};
</script>

<style scoped>
.image-thumb--fill {
  width: 100%;
  height: 100%;
  display: block;
}

.image-thumb ::v-deep .el-image {
  display: block;
  width: 100%;
  height: 100%;
}

.image-thumb ::v-deep .el-image__inner {
  width: 100%;
  height: 100%;
}
</style>
