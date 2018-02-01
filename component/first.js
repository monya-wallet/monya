const storage = require("../js/storage")
module.exports=require("./first.html")({
  data(){
    return {

    }
  },
  methods:{
    start(){
      this.$emit("push",require("./question.js"))
    },
    changeLang(ln){
      storage.changeLang(ln)
    }
  },
  mounted(){
    
  }
})
