module.exports=require("./help.html")({
  data(){
    return {

    }
  },
  methods:{
    about(){
      this.$emit("push",require("./about.js"))
    },
    openLink(url){
       window.open(url,this.$store.state.openInAppBrowser?"_blank":"_system")
    }
  },
  mounted(){
    
  }
})
