<template>
  <div class="viewer-content__audio" @click.stop>
    <i class="el-icon-headset viewer-content__audio-icon" />
    <audio
      ref="media"
      class="viewer-content__audio-el"
      :src="url"
      controls
      preload="metadata"
    />
  </div>
</template>

<script>
export default {
  name: "ViewerAudioPane",
  props: {
    url: {
      type: String,
      required: true,
    },
  },
  methods: {
    pause() {
      const el = this.$refs.media;
      if (el && typeof el.pause === "function") {
        try {
          el.pause();
        } catch {
          /* ignore */
        }
      }
    },
  },
};
</script>

<style scoped>
.viewer-content__audio {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 24px;
  min-width: 280px;
  max-width: 90vw;
  background: rgba(0, 0, 0, 0.35);
  border-radius: 8px;
}

.viewer-content__audio-icon {
  font-size: 48px;
  color: #fff;
}

.viewer-content__audio-el {
  width: 100%;
  min-width: 260px;
}
</style>
