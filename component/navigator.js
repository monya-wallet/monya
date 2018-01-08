const storage = require("../js/storage.js")
const coinUtil = require("../js/coinUtil.js")

module.exports=require("./navigator.html")({
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
    monappy(){
      this.openSide=false;this.$set(this,"pageStack",[require("./monappy.js")])
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
    }
  },
  mounted(){
    coinUtil.setUrlCallback(url=>{
      coinUtil.parseUrl(url).then(res=>{
        if(res.isCoinAddress&&res.isPrefixOk&&res.isValidAddress){
          this.$store.commit("setSendUrl",res.url)
          this.pageStack.push(require("./send.js"))
        }else{
          this.$ons.notification.alert(res.url)
        }
      })
    })
  },
  watch:{
    pageStack(){
      this.$store.commit("setTransparency",false)
    }
  }
})
