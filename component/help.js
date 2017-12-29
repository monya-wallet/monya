module.exports=require("./help.html")({
  data(){
    return {

    }
  },
  methods:{
    about(){
      this.$emit("push",require("./about.js"))
    }
  },
  mounted(){
    
  }
})
