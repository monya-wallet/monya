const storage = require("../js/storage.js")
const coinUtil = require("../js/coinUtil.js")

// Error message translation Start 
const translationTable={
  "insufficient":"不足",
  "fund":"お金",
  "priority":"手数料",
  "unable to decrypt data":"パスワードが間違っています",
  "unconfirmed": "まだ処理されていない",

  "PasswordFailureError":"パスワードが間違っています",
  "HDNodeNotFoundError":"公開鍵が登録されていません。コインを追加してください。",
  "InvalidIndexError":"アドレスを生成できませんでした",
  "MonappyError":"Monappyに関するエラーが発生しました",
  "LabelNotFoundError":"該当するラベルがありません"
}
const regexp = new RegExp(Object.keys(translationTable).join("|"),"gim")
// Error message translation End

module.exports=require("../js/lang.js")({ja:require("./ja/navigator.html"),en:require("./en/navigator.html")})({
  data(){
    return {
      pageStack:[],
      pageParam:null,
      dataLoaded:false
    }
  },
  store:require("../js/store.js"),
  methods:{

    home(){
      this.openSide=false;this.$set(this,"pageStack",[require("./home.js")])
    },
    receive(){
      this.openSide=false;this.$set(this,"pageStack",[require("./receive.js")])
    },
    send(){
      this.openSide=false;this.$set(this,"pageStack",[require("./send.js")])
    },
    history(){
      this.openSide=false;this.$set(this,"pageStack",[require("./history.js")])
    },
    settings(){
      this.openSide=false;this.$set(this,"pageStack",[require("./settings.js")])
    },
    help(){
      this.openSide=false;this.$set(this,"pageStack",[require("./help.js")])
    },
    monaparty(){
      this.openSide=false;this.$set(this,"pageStack",[require("./monaparty.js")])
    },
    zaifPay(){
      this.openSide=false;this.$set(this,"pageStack",[require("./zaifPay.js")])
    },
  },
  created(){
    storage.get("keyPairs").then((data)=>{
      if(data){
        this.pageStack.push(require("./login.js"))
      }else{
        this.pageStack.push(require("./first.js"))
      }
      this.$store.commit("setKeyPairsExistence",!!data)
      this.dataLoaded=true
    })
    storage.get("settings").then((data)=>{
      this.$store.commit("setSettings",data||{})
    })
  },
  computed:{
    openSide:{
      get(){
        return this.$store.state.openSide
      },
      set(v){
        this.$store.commit("openSide",v)
        return v
      }
    },
    bgClass(){
      return this.$store.state.bgClass
    },
    error:{
      get(){
        return this.$store.state.error
      },
      set(v){
        this.$store.commit("setError",v)
        return v
      }
    }
  },
  mounted(){
    coinUtil.setUrlCallback(url=>{
      coinUtil.parseUrl(url).then(res=>{
        if(res.isCoinAddress&&res.isValidAddress){
          this.$store.commit("setSendUrl",res.url)
          this.pageStack.push(require("./send.js"))
        }
      })
    })
    if(window.cordova&&window.cordova.platformId==="android"&&window.StatusBar){
      window.StatusBar.backgroundColorByHexString("#222222")
      window.StatusBar.styleBlackTranslucent()
      }
  },
  watch:{
    pageStack(){
      if(this.$ons.platform.isIOS()&&window.StatusBar&&this.pageStack.length===1){
        window.StatusBar.styleDefault();
      }
      if(window.cordova&&window.cordova.platformId==="android"&&window.StatusBar){
        window.StatusBar.backgroundColorByHexString("#222222")
        window.StatusBar.styleBlackTranslucent()
      }
      this.$store.commit("setTransparency",false)
    }
  },
  filters:{
    translate(v){
      v=v.toString()
      return v.replace(regexp,(match)=>{
        return match+"("+translationTable[match.toLowerCase()]+")"
      })
    }
  }
})
