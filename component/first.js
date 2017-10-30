module.exports=require("./first.html")({
  data(){
    return {

    }
  },
  methods:{
    start(){
      this.$emit("push",require("./question.js"))
    }
  },
  mounted(){
    
  }
})
