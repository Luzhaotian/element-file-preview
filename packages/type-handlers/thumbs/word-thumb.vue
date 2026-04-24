<template>
  <div class="word-thumb" aria-label="Word">
    <span class="word-thumb__badge">DOC</span>
  </div>
</template>

<script>
export default {
  name: "WordPreviewThumb",
};
</script>

<style scoped>
.word-thumb {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, #2b6cb0, #2c5282);
}

.word-thumb__badge {
  font-weight: 700;
  font-size: 18px;
  letter-spacing: 1px;
  color: #fff;
}
</style>
