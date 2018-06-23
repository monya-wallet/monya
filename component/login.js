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
const storage = require("../js/storage.js")
const currencyList = require("../js/currencyList")
const coinUtil = require("../js/coinUtil.js")
module.exports=require("../js/lang.js")({ja:require("./ja/login.html"),en:require("./en/login.html")})({
  data(){
    return {
      showPassword:false,
      password:"",
      incorrect:false,
      loading:true,
      mistaken:false,
      helpMe:false,
      resetDialog:false
    }
  },
  methods:{
    
    start(){
      storage.setPassword(this.password).then(()=>{
        this.next()
      })
      .catch(()=>{
        this.loading=false
        this.mistaken=true
        this.incorrect=true;
        setTimeout(()=>{
          this.incorrect=false;
        },1000)
      })
    },
    
    next(){
      Promise.all([storage.get("keyPairs"),storage.get("addresses"),storage.get("customCoins"),storage.get("settings")]).then(res=>{
        const data=res[0]
        const addrs=res[1]||{}
        const customCoins = res[2]||[]
        const settings=res[3]||{}
        this.$store.commit("setKeyPairsExistence",!!data)
        currencyList.init(customCoins)
        if(!data||!data.pubs){
          this.loading=false
          return true
        }
        currencyList.each(cur=>{
          cur.hdPubNode=null
          if(data.pubs[cur.coinId]){
            cur.setPubSeedB58(data.pubs[cur.coinId])
            if(!addrs[cur.coinId]){
              addrs[cur.coinId]={}
            }
            cur.addresses=addrs[cur.coinId]
            cur.pregenerateAddress()
          }
        })
        this.$emit("replace",require("./home.js"))
        this.$store.commit("setSettings",settings)
        coinUtil.setInitialized(true)
        return storage.set("addresses",addrs)
      }).catch(e=>{
        this.$store.commit("setError",e.message)
      })
    },
    erase(){
      storage.erase().then(()=>{
        this.$store.commit("deleteEntropy")
        this.$store.commit("setFinishNextPage",{page:require("./restorePassphrase.js"),infoId:"reset"})
        this.$emit("replace",require("./finished.js"))
      })
    }
  },
  watch:{
    password(){
      storage.setPassword(this.password).then(()=>{
        this.next()
      }).catch(()=>{
        return true
      })
    }
  },
  
  mounted(){
    this.loading=true
    this.$store.commit("setKeyPairsExistence",false)
    storage.dataState().then(state=>{
      if(state===2){
        this.loading=false
        storage.verifyBiometric().then(pwd=>{
          this.password=pwd
        }).catch(()=>{
          return true
        })
      }else if(state===1){
        this.next()
      }else{
        return
      }
    })
  }
})
