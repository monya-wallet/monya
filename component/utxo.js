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
const coinUtil = require("../js/coinUtil")
const bcLib = require('bitcoinjs-lib')
const BigNumber = require('bignumber.js')

module.exports=require("../js/lang.js")({ja:require("./ja/utxo.html"),en:require("./en/utxo.html")})({
  data(){
    return {
      utxos:[],
      currency:this.$store.state.detail.coinId||"mona",
      currencyIndex:0,
      txs:[],
      state:"initial",
      error:false,
      noData:false,
      hasMore:false,
      json:"",
      threshold:0,
      totalItems:0,
      enablePullHook:true
    }
  },
  store:require("../js/store.js"),
  methods:{
    load(done){
      this.noData=false
      this.error=false
      const cur =currencyList.get(this.currency)
      const recv=cur.getReceiveAddr();
      const chng=cur.getChangeAddr();
      cur.getUtxos(Array.prototype.concat.call(recv,chng),true).then(data=>{
        if(!data.utxos.length){
          this.noData=true
          typeof(done)==='function'&&done()
          return;
        }
        this.utxos=data.utxos.map(a=>{
          a.balance=(new BigNumber(a.value)).dividedBy(100000000).toNumber();
          // immature?
          a.inmatureConfirmation=!a.confirmations||a.confirmations<cur.confirmations;
          a.isChange=recv.indexOf(a.address)>=0;
          return a;
        });
        typeof(done)==='function'&&done()
      }).catch(()=>{
        this.error=true
        typeof(done)==='function'&&done()
      });
    },
    pullToLoad(done){
      this.reset()
      this.load(done)
    },
    reset(){
      this.utxos=[]
      this.hasMore=false
    },
    txDetail(txId){
      if(!txId){return }
      this.$store.commit("setTxDetail",{
        txId,coinId:this.coinId
      })
      this.$emit("push",require("./txDetail.js"))
    }
  },
  mounted(){
    this.load()
  },
  computed:{
    coinId(){
      return this.currency
    }
  }
})
