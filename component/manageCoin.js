const currencyList = require("../js/currencyList")
const storage = require("../js/storage.js")
const coinUtil = require("../js/coinUtil")
const ext = require("../js/extension.js")
module.exports=require("../js/lang.js")({ja:require("./ja/manageCoin.html"),en:require("./en/manageCoin.html")})({
  data:()=>({
    coins:[],
    loading:false,
    requirePassword:false,
    password:"",
    incorrect:false,
    infoDlg:false,
    info:{
      blocks:[],
      coinId:"",
      unit:"",
      apiEndpoint:""
    },
    extensions:[],
    unsaved:false
  }),
  methods:{
    push(){
      this.$emit("push",require("./send.js"))
    },
    
    
    operateCoins(){
      const curs=[]
      this.loading=true
      this.coins.forEach(v=>{
        if(v.usable){
          curs.push(v.coinId)
        }
      })
      this.requirePassword=false
      

      
      coinUtil.shortWait()
        .then(()=>storage.get("keyPairs"))
        .then((cipher)=>coinUtil.makePairsAndEncrypt({
          entropy:coinUtil.decrypt(cipher.entropy,this.password),
          password:this.password,
          makeCur:curs
        }))
        .then((data)=>storage.set("keyPairs",data))
        .then((cipher)=>{
          this.password=""
          this.$emit("replace",require("./login.js"))

          storage.get("settings").then(s=>{
            if (!s.enabledExts) {
              s.enabledExts=[]
            }
            this.extensions.forEach(v=>{
              v.usable&&s.enabledExts.push(v.id)
            })
            storage.set("settings",s)
            this.$store.commit("setSettings",s)
          })
        }).catch(()=>{
          this.password=""
          this.requirePassword=true
          this.loading=false
          this.incorrect=true
          setTimeout(()=>{
            this.incorrect=false
          },3000)
        })
    },
    showInfo(coinId){
      this.infoDlg=true
      const cur=currencyList.get(coinId)
      Object.assign(this.info,{
        blocks:[],
        coinId:cur.coinId,
        unit:cur.unit,
        apiEndpoint:cur.apiEndpoint
      })
      cur.getBlocks().then(r=>{
        this.info.blocks=r
      })
    },
    changeServer(){
      const cur=currencyList.get(this.info.coinId)
      cur.changeApiEndpoint()
      this.showInfo(this.info.coinId)
    },
    openBlock(h){
      currencyList.get(this.info.coinId).openExplorer({blockHash:h})
    },
    edited(){
      this.unsaved=true
    }
  },
  
  store:require("../js/store.js"),
  created(){
    this.curs=[]
      this.fiatConv=0
      currencyList.each(cur=>{
        this.coins.push({
          coinId:cur.coinId,
          screenName:cur.coinScreenName,
          icon:cur.icon,
          usable:!!cur.hdPubNode
        })
      })

    storage.get("settings").then(d=>{
      if (!d.enabledExts) {
        d.enabledExts=[]
      }
      ext.each(x=>{
        this.extensions.push({
          id:x.id,
          name:x.name,
          icon:x.icon,
          usable:!!~d.enabledExts.indexOf(x.id)
        })
      })
      this.unsaved=false
    })
  }
});






