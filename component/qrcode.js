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
    back(){
      if (!this.scanner) {
        this.$emit("pop")
      }
      this.scanner.stop().then(()=>{
        this.$emit("pop")
      })
    },
    changeCam(){
      this.scanner.start(this.camera[(++this.cameraIndex)%this.camera.length]);
    }
  },
  mounted(){
    const scn =this.scanner= new Instascan.Scanner({
      video: this.$refs.qrPreview,
      backgroundScan:false,
      scanPeriod:6
    })
    scn.addListener('scan',content=>{
      scn.stop()
      coinUtil.parseUrl(content).then(res=>{
        if(res.isCoinAddress&&res.isPrefixOk&&res.isValidAddress){
          this.$store.commit("setSendUrl",res.url)
          this.$emit("pop")
          this.$emit("push",require("./send.js"))
        }else if(res.protocol==="http"||res.protocol==="https"){
          window.open(res.url)
        }else{
          this.$ons.notification.alert(res.url)
        }
      })
    });

    Instascan.Camera.getCameras().then(cameras=>{
      this.cameras = cameras;
      if (cameras.length > 0) {
        let index=0
        cameras.forEach((v,i)=>{
          if(v.name&&v.name.toLowerCase().indexOf("back")>0){
            index=i
          }
        })
        scn.start(cameras[index]);
      } else {
        this.$ons.notification.alert('No cameras found.');
      }
    }).catch(function (e) {
      console.error(e);
    });
  }
})
