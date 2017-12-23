const storage = require("../js/storage.js")

module.exports=require("./navigator.html")({
  data(){
    return {
      pageStack:[],
      openSide:false,
      pageParam:null
    }
  },
  store:require("../js/store.js"),
  methods:{
    home(){
      this.openSide=false;this.$set(this,"pageStack",[require("./home.js")])
    },
    receive(){
      this.openSide=false;this.$set(this,"pageStack",[require("./receive.js")])
    },
    send(){
      this.openSide=false;this.$set(this,"pageStack",[require("./send.js")])
    },
    history(){
      this.openSide=false;this.$set(this,"pageStack",[require("./history.js")])
    },
    settings(){
      this.openSide=false;this.$set(this,"pageStack",[require("./settings.js")])
    },
    help(){
      this.openSide=false;this.$set(this,"pageStack",[require("./help.js")])
    },
    zaifPay(){
      this.openSide=false;this.$set(this,"pageStack",[require("./zaifPay.js")])
    },
  },
  created(){
    storage.get("keyPairs").then((data)=>{
      if(data){
        
        this.pageStack.push(require("./login.js"))
      }else{
        this.pageStack.push(require("./first.js"))
      }
    })
  }
})
