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
const Vuex = require("vuex")
module.exports = new Vuex.Store({
  state: {
    entropy:null,
    confPayload:null,
    entropySize:0,
    finishNextPage:null,
    easyUnit:false,
    fiat:"jpy",
    showLabelPayload:{},
    tsMode:"relative",
    detail:{},
    monappyEnabled:false,
    monapartyEnabled:true,
    enabledExts:[],
    sendUrl:"",
    zaifPayInvoiceId:"",
    hasKeyPairs:false,
    transparency:false,
    tokenInfo:"",
    coinId:"",
    addr:"",
    sendable:false,
    openSide:false,
    bgClass:"sand",
    monapartyTitle:"",
    divisible:false,
    includeUnconfirmedFunds:false,
    utxoStr:"",
    error:"",
    extensionSend:{},
    apiName:"",
    apiParam:null,
    answers:[]
    
  },
  mutations: {
    setAnswers(state,ent) {
      state.answers=ent;
    },
    setEntropy(state,ent) {
      state.entropy=ent;
    },
    setEntropySize(state,ent) {
      state.entropySize=ent|0;
    },
    openSide(state,v) {
      state.openSide=v;
    },
    deleteEntropy(state){
      state.entropy=null
    },
    setSettings(state,d){
      //d can be incomplete,please be careful
      state.monappyEnabled=d.monappy?d.monappy.enabled:false
      state.fiat=d.fiat||"jpy"
      state.easyUnit=d.useEasyUnit
      state.tsMode=d.absoluteTime?"absolute":"relative"
      state.bgClass=d.monaparty&&d.monaparty.bgClass||"sand"
      state.monapartyTitle=d.monaparty&&d.monaparty.title||"monacard"
      state.includeUnconfirmedFunds=d.includeUnconfirmedFunds
      state.enabledExts=d.enabledExts
    },
    setTitle(s,title){
      s.monapartyTitle=title||"monacard"
    },
    setConfirmation(state,payload){
      state.confPayload={
        address:payload.address,
        amount:parseFloat(payload.amount),
        fiat:parseFloat(payload.fiat),
        feePerByte:parseInt(payload.feePerByte,10),
        message:payload.message,
        coinType:payload.coinType,
        txLabel:payload.txLabel,
        utxoStr:payload.utxoStr,
        signOnly:payload.signOnly
      }
    },
    setFinishNextPage(state,pageData){
      state.finishNextPage={
        page:pageData.page,
        infoId:pageData.infoId,
        payload:pageData.payload
      };
    },
    setEasyUnit(state,flag){
      state.easyUnit=!!flag
    },
    setLabelToShow(state,param){
      state.showLabelPayload={
        coinId:param.coinId,
        name:param.name,
        index:param.index,
        change:param.change
      }
    },
    setTxDetail(state,d){
      state.detail.coinId=d.coinId
      state.detail.txId=d.txId
    },
    setSendUrl(state,url){
      state.sendUrl=url||""
    },
    setKeyPairsExistence(state,flag){
      state.hasKeyPairs=flag
    },
    setTransparency(state,flg) {
      state.transparency=flg
    },
    setTokenInfo(state,token){
      state.tokenInfo=token.token||""
      state.coinId=token.coinId||""
      state.addr=token.addr||""
      state.sendable=token.sendable||""
      state.divisible=token.divisible||""
    },
    setError(s,e){
      s.error=e
    },
    setExtensionSend(s,e){
      s.extensionSend=e
    },
    setAPICall(s,e){
      s.apiName=e.name
      s.apiParam=e.param
    }
  }
})
