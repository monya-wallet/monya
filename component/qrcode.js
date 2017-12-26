const Instascan = require('instascan');
const coinUtil=require("../js/coinUtil")
module.exports=require("./qrcode.html")({
  data:()=>({
    cameras:[],
    loading:false,
    error:false,
    scanner:null,
    cameraIndex:0
  }),
  store:require("../js/store.js"),
  methods:{
    scan(cam,mirror){
      this.loading=true
      const scn =this.scanner= new Instascan.Scanner({
        video: this.$refs.qrPreview,
        backgroundScan:false,
        mirror,
        scanPeriod:6
      })
      scn.addListener('scan',content=>{
        scn.stop()
        coinUtil.parseUrl(content).then(res=>{
          if(res.isCoinAddress&&res.isPrefixOk&&res.isValidAddress){
            this.$store.commit("setSendUrl",res.url)
            this.$emit("pop")
            this.$emit("push",require("./send.js"))
          }else{
            window.open(res.url)
          }
        })
      });
      scn.addListener('active',()=>{
        this.loading=false
      });
      scn.start(cam)
      
    },
    back(){
      this.scanner.stop().then(()=>{
        this.$emit("pop")
      })
    },
    changeCam(){
      this.loading=true
      this.scanner.stop().then(()=>{
        this.cameraIndex++
        
        this.scan(this.cameras[this.cameraIndex%this.cameras.length])
      })
    }
  },
  mounted(){
    this.loading=true
    Instascan.Camera.getCameras().then( cameras=>{
      if (cameras.length > 0) {
        this.cameras=cameras
        this.scan(cameras[0])
      } else {
        this.loading=false        
      }
    }).catch(function (e) {
      this.loading=false
      this.error=true
    });
  }
})
