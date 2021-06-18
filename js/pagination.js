//匯出
export default {
  //將bs5 元件pagination html結構貼上
  //從外層使用 props外傳內 傳分頁資訊近來
  props:['page'],
  //建立好橋樑 使用v-for跑page來渲染頁數
  //然後使用$emit操作外層來做切換頁面 執行getProducts() 記得命名不能大寫不然要轉換
  //接著用v-bind去做樣式操作 如果item === page.current_page(當下頁碼)就動態加上active樣式 寫法:class="{'前者class名稱':判斷式true/false可在前頭+!反轉}"
  //前後頁互動 利用page.current_page 當前頁+-1 用disabled:!page.has_pre/has_next有沒有前/後一頁 反轉true/false去做判斷還能不能再往前一頁或往後一頁 再利用$emit操作getProducts() 去做前後頁移動
  template:`<nav aria-label="Page navigation example">
  <ul class="pagination">
    <li class="page-item" :class="{disabled: !page.has_pre}">
      <a class="page-link" href="#" aria-label="Previous"
      @click="$emit('go-to-products-page',page.current_page -1)">
        <span aria-hidden="true">&laquo;</span>
      </a>
    </li>
    <li class="page-item" 
    :class="{'active': item === page.current_page}" 
    v-for="item in page.total_pages" :key="item">
    <a class="page-link" href="#" @click="$emit('go-to-products-page',item)">{{ item }}</a></li>
    
    <li class="page-item" :class="{disabled: !page.has_next}">
      <a class="page-link" href="#" aria-label="Next"
      @click="$emit('go-to-products-page',page.current_page +1)">
        <span aria-hidden="true">&raquo;</span>
      </a>
    </li>
  </ul>
</nav>`,
  data(){
    return{

    }
  }
}

