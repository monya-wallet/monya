
module.exports=require("./navigator.html")({
  data(){
    return {
      pageStack:[require("./first.js")],
      openSide:false,
      pageParam:null
    }
  },
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
    }
  },
  mounted(){
    
  }
})
