/*
 MIT License

 Copyright (c) 2018 monya-wallet zenypota

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.
*/
const currencyList=require("./currencyList")
const BigNumber = require('bignumber.js');
const storage = require("../js/storage")
const axios = require("axios")

const DEFAULT_REGULAR_DUST=70000
const DEFAULT_MULTISIG_DUST=70000

module.exports=class{
  constructor(opt){
    this.titleId=opt.titleId
    this.cpCoinId=opt.cpCoinId
    this.titleName=opt.titleName
    this.apiVer=opt.apiVer
    this.apiEndpoint=opt.apiEndpoint
this.icon=opt.icon
    
    this.cp=currencyList.get(opt.cpCoinId)
  }
  callCP(m,p){
    return this.cp.callCP(m,p)
  }
  callCPLib(m,p){
    return this.cp.callCPLib(m,p)
  }
  getToken(token){
    let tokenProm,d={}
    if(token===this.cp.counterparty.nativeSymbol){
      tokenProm=Promise.resolve([{
        asset:token,
        supply:0,
        divisible:true,
        issuer:"",
        owner:"",
        locked:true,
        description:""
      }])
    }else{
      
      tokenProm=this.callCP("get_assets_info",{
          assetsList:[token]
      })
    }
    return tokenProm.then(a=>{
      d.asset=a
      if(a.length){
        return this.getCardDetail(a[0].asset_longname||a[0].asset)
      }else{
        return []
      }
    }).then(b=>{
      d.card = b
      return d
    })
  }
  getTokenHistory(token){
    if(token===this.cp.counterparty.nativeSymbol){
      return Promise.resolve([])
    }
    return this.callCP("get_asset_history",{
      asset:token
    })
  }
  getCardDetailV1(token){
    if(Array.isArray(token)){
      token=token.join(",")
    }
    return axios.get(this.apiEndpoint+"/card_detail.php?assets="+token).then(r=>{
      const arr=[]
      if(!r.data.error){
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
      }//error but ignore because other promise stop
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
      case false:
        return Promise.resolve({})
      case 1:
        return this.getCardDetailV1(token)
      case 2:
        return this.getCardDetailV2(token)
      default:
        return this.getCardDetailV2(token)
    }
  }
  createCommand(paramName,param,opt){
    const addressIndex = opt.addressIndex|0
    const includeUnconfirmedFunds = opt.includeUnconfirmedFunds
    const feePerByte=opt.feePerByte|0
    const disable_utxo_locks=!!opt.disableUtxoLocks;
    const extended_tx_info = true
    const cur = this.cp
    return cur.callCPLib("create_"+paramName,Object.assign({
      allow_unconfirmed_inputs:includeUnconfirmedFunds,
      fee_per_kb:feePerByte*1024,
      disable_utxo_locks,
      encoding:"auto",
      extended_tx_info,
      pubkey:[cur.getPubKey(0,addressIndex)],


      regular_dust_size:DEFAULT_REGULAR_DUST,
      multisig_dust_size:DEFAULT_MULTISIG_DUST
    },param))
  }
  createTx(opt){
    const divisible=opt.divisible
    const sendAmount = opt.sendAmount
    const addressIndex = opt.addressIndex|0
    const dest = opt.dest
    const token = opt.token
    const includeUnconfirmedFunds = opt.includeUnconfirmedFunds
    const password=opt.password
    const memo=opt.memo
    const feePerByte = opt.feePerByte || this.cp.defaultFeeSatPerByte
    const doNotSendTx = !!opt.doNotSendTx
    const useEnhancedSend = !!opt.useEnhancedSend
    
    const cur = this.cp
    let hex=""
    let qty=(new BigNumber(sendAmount))
    if(divisible){
      qty=qty.times(100000000)
    }

    return this.createCommand("send",{
      source:cur.getAddress(0,addressIndex),
      destination:dest,
      asset:token,
      quantity:qty.toNumber(),
      memo,
      use_enhanced_send: useEnhancedSend
    },{
      addressIndex,
      includeUnconfirmedFunds,
      feePerByte,
      disableUtxoLocks:true,
      extendedTxInfo:true

    }).then(res=>{
      hex=res.tx_hex
      return storage.get("keyPairs")
    }).then(cipher=>{
      const signedTx=cur.signTx({
        hash:hex,
        password:password,
        path:[[0,addressIndex]],
        entropyCipher:cipher.entropy
      })
      if(!doNotSendTx){
        return cur.callCP("broadcast_tx",{signed_tx_hex:signedTx.toHex()})
      }else{
        return signedTx.toHex()
      }
    })
  }
  createIssuance(opt){
    const divisible=opt.divisible
    const amount = opt.amount
    const addressIndex = opt.addressIndex|0
    const token = opt.token
    const includeUnconfirmedFunds = opt.includeUnconfirmedFunds
    const password=opt.password
    const description=opt.description
    const feePerByte = opt.feePerByte || this.cp.defaultFeeSatPerByte
    const transferDest = opt.transferDest
    
    const cur = this.cp
    let hex=""
    let qty=(new BigNumber(amount))
    if(divisible){
      qty=qty.times(100000000)
    }

    return this.createCommand("issuance",{
      source:cur.getAddress(0,addressIndex),
      asset:token,
      quantity:qty.toNumber(),
      description,
      divisible,
      transfer_destination:transferDest||null
    },{
      addressIndex,
      includeUnconfirmedFunds,
      feePerByte,disableUtxoLocks:true,
      extendedTxInfo:true
    }).then(res=>{
      hex=res.tx_hex
      return storage.get("keyPairs")
    }).then(cipher=>{
      const signedTx=cur.signTx({
        hash:hex,
        password:password,
        path:[[0,addressIndex]],
        entropyCipher:cipher.entropy
      })
      return cur.callCP("broadcast_tx",{signed_tx_hex:signedTx.toHex()})
    })
  }
  createOrder(opt){
    const addressIndex = opt.addressIndex|0
    const includeUnconfirmedFunds = opt.includeUnconfirmedFunds
    const password=opt.password
    const feePerByte = opt.feePerByte || this.cp.defaultFeeSatPerByte
    const give_quantity=(opt.giveAmt)|0
    const give_asset=opt.giveToken
    const get_quantity=(opt.getAmt)|0
    const get_asset=opt.getToken
    const expiration=opt.expiration||5000// Blocks
    
    const cur = this.cp
    let hex=""

    return this.createCommand("order",{
      source:cur.getAddress(0,addressIndex),
      give_quantity,
      give_asset,
      get_quantity,
      get_asset,
      expiration,
      fee_provided:0,fee_required:0
    },{
      addressIndex,
      includeUnconfirmedFunds,
      feePerByte,disableUtxoLocks:true,
      extendedTxInfo:true,
      
    }).then(res=>{
      hex=res.tx_hex
      return storage.get("keyPairs")
    }).then(cipher=>{
      const signedTx=cur.signTx({
        hash:hex,
        password:password,
        path:[[0,addressIndex]],
        entropyCipher:cipher.entropy
      })
      return cur.callCP("broadcast_tx",{signed_tx_hex:signedTx.toHex()})
    })
  }
  createCancel(opt){
    const addressIndex = opt.addressIndex|0
    const includeUnconfirmedFunds = opt.includeUnconfirmedFunds
    const password=opt.password
    const feePerByte = opt.feePerByte || this.cp.defaultFeeSatPerByte
    const offer_hash=opt.txid
    
    const cur = this.cp
    let hex=""

    return this.createCommand("order",{
      source:cur.getAddress(0,addressIndex),
      offer_hash
    },{
      addressIndex,
      includeUnconfirmedFunds,
      feePerByte,disableUtxoLocks:true,
      extendedTxInfo:true
    }).then(res=>{
      hex=res.tx_hex
      return storage.get("keyPairs")
    }).then(cipher=>{
      const signedTx=cur.signTx({
        hash:hex,
        password:password,
        path:[[0,addressIndex]],
        entropyCipher:cipher.entropy
      })
      return cur.callCP("broadcast_tx",{signed_tx_hex:signedTx.toHex()})
    })
  }
  createBroadcast(opt){
    const addressIndex = opt.addressIndex|0
    const includeUnconfirmedFunds = opt.includeUnconfirmedFunds
    const password=opt.password
    const feePerByte = opt.feePerByte || this.cp.defaultFeeSatPerByte
    const text=opt.text
    const timestamp = parseInt(opt.timestamp)
    const value=parseFloat(opt.value)
    const fee_fraction =parseFloat(opt.feeFraction)
    
    const cur = this.cp
    let hex=""

    return this.createCommand("order",{
      source:cur.getAddress(0,addressIndex),
      text,
      timestamp,
      value,
      fee_fraction
    },{
      addressIndex,
      includeUnconfirmedFunds,
      feePerByte,disableUtxoLocks:true,
      extendedTxInfo:true
    }).then(res=>{
      hex=res.tx_hex
      return storage.get("keyPairs")
    }).then(cipher=>{
      const signedTx=cur.signTx({
        hash:hex,
        password:password,
        path:[[0,addressIndex]],
        entropyCipher:cipher.entropy
      })
      return cur.callCP("broadcast_tx",{signed_tx_hex:signedTx.toHex()})
    })
  }
}
