const Vuex = require("vuex")
module.exports = new Vuex.Store({
  state: {
    entropy:null,
    confPayload:null,
    finishNextPage:null,
    easyUnit:false,
    fiat:"jpy",
    showLabelPayload:{},
    tsMode:"relative",
    detail:{},
    zaifPayEnabled:true
  },
  mutations: {
    setEntropy(state,ent) {
      state.entropy=ent;
    },
    deleteEntropy(state){
      state.entropy=null
    },
    setConfirmation(state,payload){
      state.confPayload={
        address:payload.address,
        amount:parseFloat(payload.amount),
        fiat:parseFloat(payload.fiat),
        feePerByte:parseInt(payload.feePerByte,10),
        message:payload.message,
        coinType:payload.coinType
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
    }
  }
})
