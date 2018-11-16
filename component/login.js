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
