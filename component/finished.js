module.exports=require("./finished.html")({
  data(){
    return {

    }
  },
  store:require("../js/store.js"),
  methods:{
    start(){
      this.$emit("replace",this.$store.state.finishNextPage.page)
      
    }
  },
  computed:{
    infoId(){
      return this.$store.state.finishNextPage.infoId
    },
    payload(){
      return this.$store.state.finishNextPage.payload
    }
  }
})
