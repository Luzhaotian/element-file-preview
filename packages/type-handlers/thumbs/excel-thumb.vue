<template>
  <div class="excel-thumb" aria-label="Excel">
    <span class="excel-thumb__badge">XLS</span>
  </div>
</template>

<script>
export default {
  name: "ExcelPreviewThumb",
};
</script>

<style scoped>
.excel-thumb {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, #2f855a, #276749);
}

.excel-thumb__badge {
  font-weight: 700;
  font-size: 18px;
  letter-spacing: 1px;
  color: #fff;
}
</style>
