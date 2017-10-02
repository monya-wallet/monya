
module.exports=require("./home.html")({
  data(){
    return {
      balanceToShow:4545,
      unitToShow:"mona"
    }
  },
  methods:{
    push(){
      this.$emit("push",require("./send.js"))
    }
  }
})
