<template>
  <div class="media-pane__audio" @click.stop>
    <i class="el-icon-headset media-pane__audio-icon" />
    <audio
      ref="media"
      class="media-pane__audio-el"
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
.media-pane__audio {
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

.media-pane__audio-icon {
  font-size: 48px;
  color: #fff;
}

.media-pane__audio-el {
  width: 100%;
  min-width: 260px;
}
</style>
