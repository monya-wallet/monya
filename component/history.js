module.exports=require("./history.html")({
  data(){
    return {
      curFilter:"all",
      filterDlg:false,
      dirFilter:"all"
    }
  },
  methods:{
    setFilter(){
      this.filterDlg=false
    }
    
  },
  mounted(){
    
  }
})
