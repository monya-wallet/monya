const storage = require("../js/storage.js")
const coinUtil = require("../js/coinUtil.js")
const ext = require("../js/extension.js")

// Error message translation Start 
const translationTable={
  "insufficient":"不足",
  "fund":"お金",
  "priority":"手数料",
  "unable to decrypt data":"パスワードが間違っています",
  "unconfirmed": "まだ処理されていない",

  "passwordfailureerror":"パスワードが間違っています",
  "hdnodenotfounderror":"公開鍵が登録されていません。コインを追加してください。",
  "invalidindexerror":"アドレスを生成できませんでした",
  "monappyerror":"Monappyに関するエラー",
  "labelnotfounderror":"該当するラベルがありません"
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
      this.openSide=false;this.pageStack.push(require("./receive.js"))
    },
    send(){
      this.openSide=false;this.pageStack.push(require("./send.js"))
    },
    history(){
      this.openSide=false;this.pageStack.push(require("./history.js"))
    },
    settings(){
      this.openSide=false;this.pageStack.push(require("./settings.js"))
    },
    help(){
      this.openSide=false;this.pageStack.push(require("./help.js"))
    },
    monaparty(){
      this.openSide=false;this.pageStack.push(require("./monaparty.js"))
    },
    openExt(extId){
      this.openSide=false;this.pageStack.push(ext.get(extId).component)
    }
  },
  created(){
    storage.hasData().then((data)=>{
      if(data){
        this.pageStack.push(require("./login.js"))
      }else{
        this.pageStack.push(require("./first.js"))
      }
      this.$store.commit("setKeyPairsExistence",!!data)
      this.dataLoaded=true
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
    },
    extensions(){
      const ret =[]
      ext.each(x=>{
        this.$store.state.enabledExts&&(~this.$store.state.enabledExts.indexOf(x.id))&&ret.push({id:x.id,name:x.name})
      })
      return ret
    }
  },
  mounted(){
    coinUtil.setAPICallback((name,param)=>{
      this.$store.commit("setAPICall",{name,param})
      this.pageStack.push(require("./api.js"))
    })
    coinUtil.setUrlCallback(url=>{
      coinUtil.parseUrl(url).then(res=>{
        if(res.isCoinAddress&&res.isValidAddress){
          this.$store.commit("setSendUrl",res.url)
          this.pageStack.push(require("./send.js"))
        }else if(res.extension){
          this.$store.commit("setExtensionSend",{
            memo:res.message,
            address:res.address,
            amount:res.amount,
            label:res.label
          })
          this.$emit("pop")
          this.$emit("push",res.extension.component)
        }else if(res.apiName){
          coinUtil.callAPI(res.apiName,res.apiParam)
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
      if(!v){
        return
      }
      if(typeof(v)==="object"){
        v=JSON.stringify(v)
      }else{
        v=v.toString()
      }
      return v.replace(regexp,(match)=>{
        return match+"("+translationTable[match.toLowerCase()]+")"
      })
    }
  }
})
