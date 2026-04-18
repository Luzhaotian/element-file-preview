<template>
  <div class="audio-thumb">
    <i class="el-icon-headset audio-thumb__icon" />
    <span class="audio-thumb__label">{{ label }}</span>
  </div>
</template>

<script>
export default {
  name: "AudioPreviewThumb",
  props: {
    label: {
      type: String,
      default: "音频",
    },
  },
};
</script>

<style scoped>
.audio-thumb {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: linear-gradient(145deg, #606266 0%, #303133 100%);
  color: #fff;
}

.audio-thumb__icon {
  font-size: 36px;
  margin-bottom: 6px;
}

.audio-thumb__label {
  font-size: 12px;
  opacity: 0.9;
}
</style>
