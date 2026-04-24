<template>
  <div class="excel-pane" @click.stop>
    <div v-if="loading" class="excel-pane__status">Excel 加载中...</div>
    <div v-else-if="error" class="excel-pane__status excel-pane__status--error">
      Excel 加载失败：{{ errorMessage || "未知错误" }}
    </div>
    <template v-else>
      <div v-if="sheets.length > 1" class="excel-pane__tabs">
        <button
          v-for="(sheet, idx) in sheets"
          :key="sheet.name + idx"
          type="button"
          class="excel-pane__tab"
          :class="{ 'is-active': idx === activeSheetIndex }"
          @click="activeSheetIndex = idx"
        >
          {{ sheet.name || `Sheet ${idx + 1}` }}
        </button>
      </div>
      <div class="excel-pane__table-wrap">
        <table v-if="activeRows.length" class="excel-pane__table">
          <tbody>
            <tr v-for="(row, rowIdx) in activeRows" :key="rowIdx">
              <td v-for="(cell, colIdx) in row" :key="`${rowIdx}-${colIdx}`">
                {{ cell }}
              </td>
            </tr>
          </tbody>
        </table>
        <div v-else class="excel-pane__empty">该 Sheet 暂无数据</div>
      </div>
    </template>
  </div>
</template>

<script>
import { parseExcelSheets } from "../../utils/excel-render";

export default {
  name: "ViewerExcelPane",
  props: {
    url: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      loading: false,
      error: false,
      errorMessage: "",
      sheets: [],
      activeSheetIndex: 0,
      loadingId: 0,
    };
  },
  computed: {
    activeRows() {
      const sheet = this.sheets[this.activeSheetIndex];
      return sheet && Array.isArray(sheet.rows) ? sheet.rows : [];
    },
  },
  watch: {
    url: {
      immediate: true,
      handler() {
        this.loadWorkbook();
      },
    },
  },
  methods: {
    pause() {},
    resetPlayback() {},
    async loadWorkbook() {
      const id = ++this.loadingId;
      this.loading = true;
      this.error = false;
      this.errorMessage = "";
      this.sheets = [];
      this.activeSheetIndex = 0;
      try {
        const sheets = await parseExcelSheets(this.url);
        if (id !== this.loadingId) return;
        this.sheets = sheets;
      } catch (err) {
        if (id !== this.loadingId) return;
        this.error = true;
        this.errorMessage = err && err.message ? err.message : String(err || "");
      } finally {
        if (id === this.loadingId) this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.excel-pane {
  width: min(1200px, 100%);
  height: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  padding: 20px 0;
  box-sizing: border-box;
}

.excel-pane__tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.excel-pane__tab {
  border: 1px solid #dcdfe6;
  background: #fff;
  color: #606266;
  border-radius: 4px;
  padding: 6px 10px;
  cursor: pointer;
}

.excel-pane__tab.is-active {
  border-color: #409eff;
  color: #409eff;
}

.excel-pane__table-wrap {
  overflow: auto;
  background: #fff;
  border-radius: 6px;
}

.excel-pane__table {
  width: 100%;
  border-collapse: collapse;
  color: #303133;
}

.excel-pane__table td {
  border: 1px solid #ebeef5;
  padding: 8px;
  min-width: 80px;
  font-size: 13px;
}

.excel-pane__status,
.excel-pane__empty {
  color: #dcdfe6;
  text-align: center;
  margin-top: 40px;
}

.excel-pane__status--error {
  color: #f56c6c;
}
</style>
