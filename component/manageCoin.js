/*
 MIT License

 Copyright (c) 2018 monya-wallet zenypota

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.
*/
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
      

      let entropy;
      coinUtil.shortWait()
        .then(()=>storage.get("keyPairs"))
        .then((cipher)=>{
          entropy=coinUtil.decrypt(cipher.entropy,this.password)
          return coinUtil.makePairsAndEncrypt({
            entropy,
            password:this.password,
            makeCur:curs
          })
        })
        .then((data)=>storage.set("keyPairs",data))
        .then((cipher)=>{
          this.password=""
          return storage.get("settings")        
        }).then(s=>{
          s.enabledExts=[]
          let addProm=Promise.resolve()
          this.extensions.forEach(v=>{
            if(v.usable){
              s.enabledExts.push(v.id)
              const ex=ext.get(v.id)
              if(ex&&ex.onAdd){
                addProm=addProm.then(()=>ex.onAdd(entropy,ext.extStorage(v.id)))
              }
            }
          })
          
          this.$store.commit("setSettings",s)
          
          return storage.set("settings",s)
        }).then(()=>this.$emit("replace",require("./login.js"))).catch(()=>{
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
