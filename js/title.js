const currencyList=require("./currencyList")
const axios = require("axios")
module.exports=class{
  constructor(opt){
    this.titleId=opt.titleId
    this.cpCoinId=opt.cpCoinId
    this.titleName=opt.titleName
    this.apiVer=opt.apiVer
    this.apiEndpoint=opt.apiEndpoint
    
    this.cp=currencyList.get(opt.cpCoinId)
  }
  callCP(m,p){
    return this.cp.callCP(m,p)
  }
  callCPLib(m,p){
    return this.cp.callCPLib(m,p)
  }
  getToken(token){
    token=token.toUpperCase()
    
    let promises
    if(token==='XMP'){
      promises=[
        Promise.resolve([{
            asset:"XMP",
            supply:0,
            divisible:true,
            issuer:"MMonapartyMMMMMMMMMMMMMMMMMMMUzGgh",
            owner:"MMonapartyMMMMMMMMMMMMMMMMMMMUzGgh",
            locked:true,
            description:""
          }]),Promise.resolve([]),Promise.resolve([])
      ]
    }else{
      promises=[
        this.callCP("get_assets_info",{
          assetsList:[token]
        }),this.callCP("get_asset_history",{
          asset:token
        }),this.getCardDetail(token)]
    }
    let ret
    return Promise.all(promises).then(r=>{
      return {
        asset:r[0],
        history:r[1],
        card:r[2]
      }
    })
  }
  getCardDetailV1(token){
    if(Array.isArray(token)){
      token=token.join(",")
    }
    return axios.get(this.apiEndpoint+"/card_detail.php?assets="+token).then(r=>{
      const arr=[]
      if(r.data.error){
        //error but ignore because other promise stop
      }
      r.data.details.forEach(k=>{
        arr.push({
          description:k.add_description,
          asset:k.asset,
          assetCommonName:k.asset_common_name,
          assetLongName:k.asset_longname,
          cardName:k.card_name,
          imageUrl:k.imgur_url,
          ownerName:k.owner_name,
          twitterId:k.tw_id,
          twitterScreenName:k.tw_name,
          timestamp:parseInt(k.update_time,10)
        })
      })
      return arr
    })
  }
  getCardDetailV2(token){
    if(Array.isArray(token)){
      token=token.join(",")
    }
    return axios.get(this.apiEndpoint+"/detail?assets="+token).then(r=>{
      return r.data.result
    })
  }
  getCardDetail(token){
    switch(this.apiVer){
      case 1:
        return this.getCardDetailV1(token)
      case 2:
        return this.getCardDetailV2(token)
      default:
        return this.getCardDetailV2(token)
    }
  }
}





