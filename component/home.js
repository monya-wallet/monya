/*
    Monya - The easiest cryptocurrency wallet
    Copyright (C) 2017-2018 monya-wallet

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
const currencyList = require("../js/currencyList")
const coinUtil = require("../js/coinUtil")
const ext = require("../js/extension.js")

module.exports=require("../js/lang.js")({ja:require("./ja/home.html"),en:require("./en/home.html")})({
  data(){
    return {
      curs:[],
      fiatConv:0,
      loading:false,
      state:"initial",
      error:false,
      isSingleWallet:currencyList.isSingleWallet,
      lastUpdate:(Date.now()/1000)|0,
      outdatedWatcher:0,
      news:{}
    }
  },
  methods:{
    qr(){
      
      this.$emit("push",require("./qrcode.js"))
    },
    async load(done){
      this.curs=[]
      this.fiatConv=0
      this.loading=true;
      this.error=false
      
      const promises=[]
      currencyList.eachWithPub(cur=>{        
        promises.push((async ()=>{
          const data={
            coinId:cur.coinId,
            balance:0,
            unconfirmed:0,
            screenName: cur.coinScreenName,
            price:0,
            icon:cur.icon,
            error:false
          }
          this.curs.push(data)
          try{
            const bal = await cur.getWholeBalanceOfThisAccount()
            data.balance=bal.balance
            data.unconfirmed=bal.unconfirmed
            const price = await coinUtil.getPrice(cur.coinId,this.$store.state.fiat)
            data.price=price
            this.fiatConv += price*bal.balance
          }catch(e){
            this.error=data.error=true
          }
          return data
        })())
      })
      
      this.curs = await Promise.all(promises)
      this.loading=false
      this.lastUpdate=(Date.now()/1000)|0
      typeof(done)==='function'&&done()
      this.patchReload()
    },
    async patchReload(){
      this.loading=true
      for (let i = 0; i < this.curs.length; i++) {
        const data = this.curs[i]
        if(!data.error){
          continue
        }
        try{
          if(!data.balance){
            const cur = currencyList.get(data.coinId)
            const bal = await cur.getWholeBalanceOfThisAccount()
            data.balance = bal.balance
            data.unconfirmed = bal.unconfirmed
          }
          if(!data.price){
            const price = await coinUtil.getPrice(data.coinId,this.$store.state.fiat)
            data.price=price
            this.fiatConv += price*data.balance
          }
          data.error=false
          this.error=false
        }catch(e){
          this.error=true
          data.error=true
        }
      }
      this.loading=false
    },
    loadNews(){
      coinUtil.getNews().then(r=>{
        this.news=r[0]||{}
      }).catch(()=>{
        this.news={}
      })
    },
    openNews(){
      if(this.news.url){
        coinUtil.openUrl(this.news.url)
      }
    },
    goToManageCoin(){
      this.$emit("push",require("./manageCoin.js"))
    },
    receive(){
      this.$emit("push",require("./receive.js"))
    },
    send(){
      this.$emit("push",require("./send.js"))
    },
    history(){
      this.$emit("push",require("./history.js"))
    },
    monaparty(){
      this.$emit("push",require("./monaparty.js"))
    },
    openExt(extId){
      this.$emit("push",ext.get(extId).component)
    }
  },
  store:require("../js/store.js"),
  mounted(){
    this.load()
    this.loadNews()
    this.outdatedWatcher=setInterval(()=>{
      if((Date.now()/1000)>this.lastUpdate+60*15){
        this.load()
      }
    },1000*60*10)
  },
  beforeDestroy(){
    clearInterval(this.outdatedWatcher)
  },
  computed:{
    fiat(){
      return this.$store.state.fiat
    },
    extensions(){
      const ret =[]
      ext.each(x=>{
        this.$store.state.enabledExts&&(~this.$store.state.enabledExts.indexOf(x.id))&&ret.push({id:x.id,name:x.name,icon:x.icon})
      })
      return ret
    }
  }
})
