//esm cdn 
import { createApp } from 'https://cdnjs.cloudflare.com/ajax/libs/vue/3.0.11/vue.esm-browser.js';

//將 元件化的 pagination.js 匯進來
import pagination from './pagination.js';

//裝bs5 modal用
let productModal = {};
let productDeleteModal = {};


//vue起手式
const app = createApp({
  data() {//一律使用 function return
    return {
      //config
      apiUrl: 'https://vue3-course-api.hexschool.io/', // 請加入站點
      //const url = 'http://localhost:3000/admin/signin/'
      apiPath: 'eva29485577', // 請加入個人 API Path  
      productsAry: [],//產品列表
      isNew: false,//判斷打開的modal是更新還是編輯
      deleteId: '',
      productTitle: '',
      tempProduct: {//修改產品預存結構要送回後端的資料
        //imagesUrl: [],//第二層結構 須遵照後端需要的格式給予資料 以免出錯
      },
      pagination: {},//蒐集全域元件需要的頁碼data
    }
  },
  //元件區域註冊 請加s
  components: {
    pagination
  },
  mounted() {//生命週期 元件生成 必定執行的項目(呼叫函式)
    //取出token 驗證
    const token = document.cookie.replace(/(?:(?:^|.*;\s*)hexToken\s*\=\s*([^;]*).*$)|^.*$/, "$1");
    if (!token) {//token false
      alert('尚未登入');
      window.location = "login.html";
    }
    axios.defaults.headers.common['Authorization'] = token;

    //bs5 modal
    //編輯部分modal
    productModal = new bootstrap.Modal(document.getElementById('productEditModal'), {
      keyboard: false
    });
    //productEditModal.show();//驗證能否叫出productEditModal
    //刪除部分modal
    productDeleteModal = new bootstrap.Modal(document.getElementById('productDeleteModal'), {
      keyboard: false
    });
    //productDeleteModal.show();//驗證能否叫出productDeleteModal


    //this.getProducts();//this指向為此物件,使用vue會變為同層,故this.getProducts()即可指定到methods內的getProducts()

  },
  methods: {//函式擺放位置
    //取得後台產品資料
    //全域元件pagination 使用$emit操作 代入item(page)作為參數 來達成切換頁面並重新渲染 記得api補上 ?page=:${page}
    //page = 1意思是當沒有參數帶入時,參數預設1
    getProducts(page = 1) {
      // 取得 Token（Token 僅需要設定一次）已在mounted設定
      // 取得後台產品列表
      axios.get(`${this.apiUrl}api/${this.apiPath}/admin/products?page=${page}`) //資料庫每個人path是獨立的
        .then((res) => {
          //console.log(res); //驗證 取得產品列表res.data.products
          if (res.data.success) {//=true
            this.productsAry = res.data.products; //將空陣列賦與後台products資料
            this.pagination = res.data.pagination;//將頁碼res帶到data內供元件使用
            //console.log(this.productsAry);//驗證
            //alert('已取得產品');
          } else {
            //console.log(productsData);//驗證
            alert('請重新登入!即將轉移至登入頁面!');
            setTimeout(turnLoginPage, 1000); //計時器 延遲1秒執行turnLoginPage函式
            function turnLoginPage() {
              //轉移至login.html
              window.location = "login.html";
            }
          }
        })
        .catch((error) => {//接收錯誤回傳
          // handle error
          console.log(error);
        });
    },
    //打開openNewProductModal
    openProductModal(isNew, item) {
      //data的isNew狀態改為參數帶進來的狀態
      this.isNew = isNew;
      if (this.isNew) {//如果為true
        this.tempProduct = {//每次打開modal 就先將暫存 要傳回後端的產品資料清空 做個初始化
          //imagesUrl: [],
        };
        //顯示newProductModal
        productModal.show();
      };
      if (this.isNew == false) {//如果為false
        //編輯的這區小心傳參考特性,避免未確認,原始資料就被修正
        //為了避免 這邊使用淺拷貝 指向另一記憶體避免共用
        this.tempProduct = { ...item };
        //開啟productModal
        productModal.show();
      };
    },
    //打開ProductsDeleteModal 參數item為取id用
    openProductDeleteModal(item) {
      //console.log(item.id);//驗證
      this.deleteId = item.id;//將id賦予回data的deleteId
      this.productTitle = item.title;
      //console.log(this.deleteId,this.productTitle);//驗證
      productDeleteModal.show();
    },
    //新增/編輯 產品
    //管理控制台 [需驗證]-商品建立 or 修改產品
    updateProduct(tempProduct) {
      //新增 api/:api_path/admin/product
      let url = `${this.apiUrl}api/${this.apiPath}/admin/product`;
      //請求方法:利用變數來做陣列取[axiosMethod]值 帶到下方axios程式碼做改變請求方法
      let axiosMethod = 'post';
      //判斷isNew狀態
      if (!this.isNew) {//isNew反轉是false的話,代表是編輯
        //改成編輯api: /api/:api_path/admin/product/:id
        url = `${this.apiUrl}api/${this.apiPath}/admin/product/${tempProduct.id}`;
        //請求方法改為put
        axiosMethod = 'put';
      }
      //用post請求 將暫存tempProduct傳回到後端資料庫儲存 記得帶上參數為後端要求的data格式 這邊[axiosMethod]值是post
      axios[axiosMethod](url, { data: tempProduct })
        .then((res) => {
          //如果回傳true
          if (res.data.success) {
            //console.log(res);//驗證
            //重新渲染畫面
            this.getProducts();
            //關閉NewProductModal
            productModal.hide();
          }
        })
        .catch((error) => {//接收錯誤回傳
          // handle error
          console.log(error);
        });


    },
    //刪除產品 需用到id來判別選到的產品品項
    //管理控制台 [需驗證]-刪除產品
    //刪除產品 需用到id來判別選到的產品品項
    deleteProduct() {
      // 刪除一個產品
      axios
        .delete(`${this.apiUrl}api/${this.apiPath}/admin/product/${this.deleteId}`)
        .then((res) => {
          if (res.data.success) {//如果回傳為true
            //console.log(res);//驗證
            alert(res.data.message);
            this.getProducts();//呼叫取得產品資料函式 並重新渲染畫面
            //關閉Modal
            productDeleteModal.hide();
          } else {//回傳非true
            console.log(res);//驗證
            alert(res.data.message);
          }
        })
        .catch((error) => {//接收錯誤回傳
          // handle error
          console.log(error);
        });
    },
  }
})

//元件註冊
//全域-單個 請註冊在createApp後方,mount前方 
//前面是名稱 後面是元件內容
//app.component('pagination',);//已完成元件抽離 改成import匯入 區域註冊到createApp內

//將productModal拉出做成全域元件
app.component('productModal', {
  //在modal新增產品或更改產品 用$emit 內傳外 來呼叫外部函式@click="$emit('update-product',tempProduct)由於內外資料是獨立的,把tempProduct資料帶回去當參數 就可以不用data內的tempProduct,用已經跑過程式碼修改過的tempProduct
  template: `<div id="productEditModal" ref="productModal" class="modal fade" tabindex="-1" aria-labelledby="productModalLabel"
    aria-hidden="true">
    <div class="modal-dialog modal-xl">
      <div class="modal-content border-0">
        <div class="modal-header bg-dark text-white">
          <h5 id="productModalLabel" class="modal-title">
            <span>新增產品</span>
            <span>編輯產品</span>
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <div class="row">
            <div class="col-sm-4">
              <div class="form-group">
                <label for="imageUrl">主要圖片</label>
                <input type="text" class="form-control" placeholder="請輸入圖片連結">
                <img class="img-fluid">
              </div>
              <div class="mb-1">多圖新增</div>
              <!-- 使用 isArray判斷tempProduct.imagesUrl是否為陣列 開頭A大寫為建構函式=new Array()-->
              <div v-if="Array.isArray(tempProduct.imagesUrl)">
                <!-- 資料建構 -->
                <!-- 使用 v-for 跑 tempProduct.imagesUrl 來對應按下新增圖片按鈕產生空欄位-->
                <div class="mb-1" v-for="(item, i) in tempProduct.imagesUrl" :key="i">
                  <div class="form-group">
                    <label for="imageUrl">圖片網址</label>
                    <input type="text" class="form-control" placeholder="請輸入圖片連結" v-model="tempProduct.imagesUrl[i]">
                  </div>
                  <img class="img-fluid" :src="item">
                </div>
                <!-- 新增欄位 -->
                <!-- 圖片陣列長度如果為0或1以上,用!false or true反轉 或 如果最後一個欄位有值才會再度顯示新增-->
                <div v-if="!tempProduct.imagesUrl.length || tempProduct.imagesUrl[tempProduct.imagesUrl.length - 1]">
                  <!-- 使用 push加入imagesUrl陣列末端-->
                  <button class="btn btn-outline-primary btn-sm d-block w-100" @click="tempProduct.imagesUrl.push('')">
                    新增圖片
                  </button>
                </div>                
                <div v-else>
                  <!-- 使用 pop 把imagesUrl陣列最末端資料刪除-->
                  <button class="btn btn-outline-danger btn-sm d-block w-100" @click="tempProduct.imagesUrl.pop()">
                    刪除圖片
                  </button>
                </div>
              </div>
              <!-- 如果tempProduct.imagesUrl不是陣列 顯示此區塊 去觸發新增陣列函式createImages -->
              <div v-else>
                <button class="btn btn-outline-primary btn-sm d-block w-100" @click="createImages">
                  新增陣列圖片
                </button>
              </div>
            </div>
            <div class="col-sm-8">
              <div class="form-group">
                <label for="title">標題</label>
                <input id="title" v-model="tempProduct.title" type="text" class="form-control" placeholder="請輸入標題">
              </div>
  
              <div class="row">
                <div class="form-group col-md-6">
                  <label for="category">分類</label>
                  <input id="category" v-model="tempProduct.category" type="text" class="form-control"
                    placeholder="請輸入分類">
                </div>
                <div class="form-group col-md-6">
                  <label for="price">單位</label>
                  <input id="unit" v-model="tempProduct.unit" type="text" class="form-control" placeholder="請輸入單位">
                </div>
              </div>
  
              <div class="row">
                <div class="form-group col-md-6">
                  <label for="origin_price">原價</label>
                  <input id="origin_price" v-model.number="tempProduct.origin_price" type="number" min="0"
                    class="form-control" placeholder="請輸入原價">
                </div>
                <div class="form-group col-md-6">
                  <label for="price">售價</label>
                  <input id="price" v-model.number="tempProduct.price" type="number" min="0" class="form-control"
                    placeholder="請輸入售價">
                </div>
              </div>
              <hr>
  
              <div class="form-group">
                <label for="description">產品描述</label>
                <textarea id="description" v-model="tempProduct.description" type="text" class="form-control"
                  placeholder="請輸入產品描述">
                    </textarea>
              </div>
              <div class="form-group">
                <label for="content">說明內容</label>
                <textarea id="description" v-model="tempProduct.content" type="text" class="form-control"
                  placeholder="請輸入說明內容">
                    </textarea>
              </div>
              <div class="form-group">
                <div class="form-check">
                  <input id="is_enabled" v-model="tempProduct.is_enabled" class="form-check-input" type="checkbox"
                    :true-value="1" :false-value="0">
                  <label class="form-check-label" for="is_enabled">是否啟用</label>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
            取消
          </button>
          <button type="button" class="btn btn-primary" @click="$emit('update-product',tempProduct)">
            確認
          </button>
        </div>
      </div>
    </div>
  </div>`,
  //將data的tempProduct資料傳進來 外傳內使用props
  props: ['tempProduct'],
  //建立methods來放createImages()
  methods: {
    //openNewProductModal內的新增陣列圖片
    createImages() {
      //新增圖片陣列
      this.tempProduct.imagesUrl = [
        ''
      ]
    },

  }
});

//將productDeleteModal拉出做成全域元件
app.component('productDeleteModal', {
  //在modal新增產品或更改產品 用$emit 內傳外 來呼叫外部函式@click="$emit('update-product')
  template: `<div id="productDeleteModal" ref="delProductModal" class="modal fade" tabindex="-1" aria-labelledby="delProductModalLabel"
    aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content border-0">
        <div class="modal-header bg-danger text-white">
          <h5 id="delProductModalLabel" class="modal-title">
            <span>刪除產品</span>
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          是否刪除
          <strong class="text-danger">{{ productTitle }}</strong> 商品(刪除後將無法恢復)。
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
            取消
          </button>
          <button type="button" class="btn btn-danger" @click="$emit('delete-product')">
            確認刪除
          </button>
        </div>
      </div>
    </div>
  </div>`,
  //將data的productTitle資料傳進來 外傳內使用props
  props: ['productTitle'],
  methods: {

  },
})

app.mount('#app');



