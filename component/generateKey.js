function loadWordList() {
  return Promise.resolve(require("../img/bip39en.json"));
}

function indexFromSortedList(sorted,value){
  let left=0
  let right=sorted.length-1

  while(left<=right){
    const center=(left+((right-left)/2)|0)
    const centerVal=sorted[center]
    if(centerVal===value){
      return center
    }else if(centerVal<value){
      left = center+1
    }else{
      right = center-1
    }
    
  }
  return null
}

function arrayToWords(arr){
  return loadWordList().then((wordList)=>{
    const words = []
    for(let i=0;i<13;i++){
      words.push(wordList[arr[i]]);
    }
    return words
  })
}
function wordsToArray(words){
  return loadWordList().then((wordList)=>{
    const array = []
    for(let i=0;i<13;i++){
      const ret = indexFromSortedList(wordList,words[i])
      if(ret){
        array.push(ret)
      }else{
        return null
      }
    }
    return array;
  })

}



module.exports=require("./generateKey.html")({
  data(){
    return {
      cnt:0,
      next:false,
      keyArray:[],
      sensorAvailable:false
      
    }
  },
  methods:{
    complete(){
      if(!this.next){
        this.next=true;
        this.keyArray
        
      }
    }
    
  },
  mounted(){
    let detecting = true;
    let drag=false;
    let arr=[];
    const gd = this.$ons.GestureDetector(this.$refs.touchArea)
    gd.on("dragstart",()=>{
      if(!detecting){return}
      drag=true;
    })
    gd.on("drag",(e)=>{
      if(!detecting){return}
      if(((Math.random()*19)|0)===4){
        const a=((e.gesture.interimAngle*e.gesture.deltaX*e.gesture.deltaY)|0)%2048;
        if(a){
          arr.push(a>0?a:-a)
        }
      }
    });
    gd.on("dragend",()=>{
      if(!detecting){return}
      drag=false;
      if(arr.length){
        let sum=16;
        for(let i=arr.length-1;i>=0;i--){
          sum+=arr[i];
        }
        this.keyArray.push(sum%2048);
        if(++this.cnt>=13){
          detecting = false
          setInterval(()=>{this.complete()},300);
        }
      }
      arr=[];
    })
    window.addEventListener("devicemotion",(e)=>{
      if(!detecting){return}
      if(e.rotationRate.alpha){
        this.sensorAvailable=true
      }

      if(7===((Math.random()*35)|0)){
        let a=((e.acceleration.x+e.acceleration.y+e.rotationRate.alpha+e.rotationRate.beta+e.rotationRate.gamma)*810893)|0;
        a=a>0?a:-a
        if(a>30){
          this.keyArray.push(a%2048)
          if(++this.cnt>=13){
            detecting = false
            setInterval(()=>{this.complete()},300);
          }
        }
      }
    }, true);
  },
  components:{
    
  }
})
