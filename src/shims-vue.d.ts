declare module '*.vue' {
  import Vue from 'vue'
  export default Vue
}

// 扩展 Vue 接口
declare module 'vue/types/vue' {
  interface Vue {
    handleSizeChange: (val: number) => void
    handleCurrentChange: (val: number) => void
    getClassList: () => void
    searchForm: {
      pageNo: number
      pageSize: number
      name: string
    }
    $message: {
      success(message: string): void
      warning(message: string): void
      error(message: string): void
      info(message: string): void
    }
    $router: {
      push(location: { path: string, query?: any }): void
      replace(location: { path: string, query?: any }): void
      go(n: number): void
      back(): void
      forward(): void
    }
  }
}
