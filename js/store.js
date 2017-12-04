const Vuex = require("vuex")

module.exports = new Vuex.Store({
  state: {
    entropy:null,
    confPayload:null,
    finishNextPage:null
  },
  mutations: {
    setEntropy(state,ent) {
      state.entropy=ent;
    },
    setConfirmation(state,payload){
      state.confPayload=payload
    },
    setFinishNextPage(state,pageData){
      state.finishNextPage={
        page:pageData.page,
        infoId:pageData.infoId
      };
    }
  }
})
