/*
    Monya - The easiest cryptocurrency wallet
    Copyright (C) 2017-2018 MissMonacoin

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
    load(done){
      this.curs=[]
      this.fiatConv=0
      this.loading=true;
      this.error=false
      
      const promises=[]
      currencyList.eachWithPub(cur=>{
        let obj={
          coinId:cur.coinId,
          balance:0,
          unconfirmed:0,
          screenName:cur.coinScreenName,
          price:0,
          icon:cur.icon
        }
        
        promises.push(cur.getWholeBalanceOfThisAccount()
          .then(res=>{
            obj.balance=res.balance
            obj.unconfirmed=res.unconfirmed
            this.curs.push(obj)
            return coinUtil.getPrice(cur.coinId,this.$store.state.fiat)
          }).then(res=>{
            this.fiatConv += res*obj.balance
            obj.price=res
            return obj
          }).catch(()=>{
            this.error=true
            obj.screenName=""
            return obj
          }))
      })
      Promise.all(promises).then(data=>{
        this.curs=data
        this.loading=false
        this.lastUpdate=(Date.now()/1000)|0
        typeof(done)==='function'&&done()
      })
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
