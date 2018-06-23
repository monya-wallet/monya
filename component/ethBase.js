/*
    Monya - The easiest cryptocurrency wallet
    Copyright (C) 2017-2018 MissMonacoin

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
const bip39 = require("@missmonacoin/bip39-eng")
const coinUtil = require("../js/coinUtil")
const storage = require("../js/storage")
const qrcode = require("qrcode")
const BigNumber = require('bignumber.js');
const axios = require('axios');
const bcLib = require('bitcoinjs-lib')
const Web3 = require('web3')
const hdkey = require('ethereumjs-wallet/hdkey')
const extension=require("../js/extension.js")
const erc20ABI = require("../js/erc20ABI.js")

const errors=require("../js/errors.js")

module.exports=function(option){
  const NETWORK_NAME=option.networkName
  const NETWORK_SCHEME=option.networkScheme
  const NETWORK_ICON=option.networkIcon
  const NETWORK_SYMBOL=option.networkSymbol
  const HD_DERIVATION_PATH=option.bip44DerivationPath
  const ADDRESS_INDEX=0 // address Index can't change for now
  const CHAIN_ID=option.chainId
  const RPC_SERVERS=option.rpcServers
  const EXPLORER = option.explorer

  let web3 = new Web3()
  let ext
  
  return require("../js/lang.js")({ja:require("./ja/ethBase.html"),en:require("./en/ethBase.html")})({
    data(){
      return {
        sendAmount:"",
        sendAddress:"",
        sendGasPrice:0,
        sendGasLimit:0,
        password:"",
        address:"",
        qrDataAddress:"",
        qrDataUrl:"",
        shareable:coinUtil.shareable(),
        incorrect:false,
        loading:false,
        confirm:false,
        price:1,
        serverDlg:false,
        invAmt:"",
        addressFormat:"url",
        sendMenu:false,
        invoiceMenu:false,
        removingToken:-1,
        option:false,

        sendingToken:false,
        
        rpcServer:null,
        balanceWei:"",
        unsignedTx:null,
        
        networkName:NETWORK_NAME,
        networkScheme:NETWORK_SCHEME,
        networkSymbol:NETWORK_SYMBOL,
        networkIcon:NETWORK_ICON,
        rpcServers:RPC_SERVERS,

        state:"initial",
        
        runContract:{
          show:false,
          abiStr:"",
          fn:"",
          args:[],
          result:"",
          gasLimit:0,
          gasPrice:0,
          password:"",
          value:0
        },

        tokens:[]
      }
    },
    store:require("../js/store.js"),
    methods:{
      
      getBalance(done){
        if(!this.address){
          return
        }
        this.loading=true
        this.tokens=[]
        web3.eth.getBalance(this.address).then(balanceWei=>{
          this.loading=false
          this.balanceWei=balanceWei
          return web3.eth.getGasPrice()
        }).then(gasPrice=>{
          this.sendGasPrice=web3.utils.fromWei(gasPrice,"gwei")
          return ext.get("tokens")
        }).then(tokens=>{
          if(!tokens){return []}
          
          return Promise.all(tokens.map(t=>{
            this.tokens.push(t)
            return (new web3.eth.Contract(erc20ABI,t.contractAddress))
              .methods.balanceOf(this.address)
              .call()
          }))
          
        }).then(balances=>{
          for (let i = 0; i < balances.length; i++) {
            this.$set(this.tokens[i],"balance",+(new BigNumber(balances[i])).shift(-this.tokens[i].decimals))
          }
          done&&done()
        }).catch(e=>{
          this.loading=false
          this.$store.commit("setError","Server Error: "+e.message)
        })
      },
      copyAddress(){
        coinUtil.copy(this.address)
      },
      share(event){
        const targetRect = event.target.getBoundingClientRect(),
              targetBounds = targetRect.left + ',' + targetRect.top + ',' + targetRect.width + ',' + targetRect.height;
        coinUtil.share({
          url:this.url
        },targetBounds).then(()=>{
        }).catch(()=>{
          this.copyAddress()
        })
      },
      send(){
        const sendGasPriceWei = web3.utils.toWei(""+this.sendGasPrice, "gwei")
        
        this.sendMenu=false
        this.confirm=false
        this.loading=true
        let addrProm;
        // NekoniumにENSはないので
        addrProm=Promise.resolve(this.sendAddress)
        addrProm.then(addr=>{
         this.sendAddress=addr
         return web3.eth.getTransactionCount(this.address)
        }).then(nonce => {
          
          const tx={
            nonce,
            from:this.address,
            gasPrice: web3.utils.numberToHex(sendGasPriceWei),
            gas: web3.utils.numberToHex(this.sendGasLimit),
            chainId: CHAIN_ID
          }

          
          if(this.sendingToken){
            const contract =new web3.eth.Contract(erc20ABI,this.sendingToken.contractAddress,{
              from:this.address
            })

            tx.to=this.sendingToken.contractAddress
            tx.value="0x0"
            tx.data=contract.methods.transfer(
              this.sendAddress,
              +(new BigNumber(this.sendAmount)).shift(this.sendingToken.decimals)
            ).encodeABI()

          }else{
            tx.to=this.sendAddress
            tx.value=web3.utils.numberToHex(web3.utils.toWei(""+this.sendAmount, "ether"))
          }
          this.unsignedTx=tx
          this.confirm=true
          this.loading=false

          storage.verifyBiometric().then(pwd=>{
            this.password=pwd
          }).catch(()=>{
            return
          })
        }).catch((e)=>{
          this.loading=false
          this.$store.commit("setError",e.message)
        })
      },
      broadcast(){
        if(!this.unsignedTx){
          return
        }
        this.confirm=false
        this.loading=true
        storage.get("keyPairs").then(c=>{
          const seed=
                bip39.mnemonicToSeed(
                  bip39.entropyToMnemonic(
                    coinUtil.decrypt(c.entropy,this.password)
                  )
                )
          return web3.eth.accounts.privateKeyToAccount("0x"+hdkey.fromMasterSeed(seed).derivePath(HD_DERIVATION_PATH).getWallet().getPrivateKey().toString("hex")).signTransaction(this.unsignedTx)
        }).then(signedTx=>{
          return web3.eth.sendSignedTransaction(signedTx.rawTransaction).on('transactionHash', txhash=>{
            this.sendAddress=""
          this.sendAmount=""
          this.password=""
          this.unsignedTx=null
          this.loading=false
          this.$store.commit("setFinishNextPage",{page:require("./home.js"),infoId:"sent",payload:{
            txId:txhash
          }})
          this.$emit("replace",require("./finished.js"))
          })
        }).catch(e=>{
          this.loading=false
          this.$store.commit("setError",e.message)
        })
      },
      connect(){
        this.serverDlg=false
        
        this.rpcServer = this.rpcServers[0]
        web3.setProvider(new web3.providers.HttpProvider(this.rpcServer))
      },
      getPrice(){
        this.price=1
      },
      getQrCode(){
        qrcode.toDataURL(this.url,{
          errorCorrectionLevel: 'M',
          type: 'image/png'
        },(err,url)=>{
          this.qrDataUrl=url
        })
      },
      getQrCodeAddress(){
        qrcode.toDataURL(NETWORK_SCHEME+":"+this.address,{
          errorCorrectionLevel: 'M',
          type: 'image/png'
        },(err,url)=>{
          this.qrDataAddress=url
        })
      },
      openExplorerAccount(){
        coinUtil.openUrl(EXPLORER+this.address)
      },
      setRpcServer(){
        web3.setProvider(new web3.providers.HttpProvider(this.rpcServer))
      },
      calcGasLimitFromAddress(){
        if(!web3.utils.isAddress(this.sendAddress)){
          return
        }
        let gasProm
        if(this.sendingToken){
          const contract =new web3.eth.Contract(erc20ABI,this.sendingToken.contractAddress,{
            from:this.address
          })
          gasProm=web3.eth.estimateGas({
            from: this.address,
            to: this.sendingToken.contractAddress,
            data:contract.methods.transfer(this.sendAddress,1).encodeABI()
          })
        }else{
          gasProm=web3.eth.estimateGas({
            from: this.address,
            to: this.sendAddress
          })
        }
        gasProm.then(result => {
          this.sendGasLimit=result
        }).catch(()=>{
          return false
        })
      },
      intValue(v){
        let iv = parseInt(v)
        return iv <= 0 ? 0 : iv
      },
      cast(val,type){
        switch(type){
          case "bool":
            return !!val
          case "uint":
          case "uint8":
          case "uint16":
          case "uint32":
          case "uint64":
          case "uint128":
          case "uint256":
          case "int":
          case "int8":
          case "int16":
          case "int32":
          case "int64":
          case "int128":
          case "int256":
            return parseInt(val)
          case "address":
            return web3.utils.isAddress(val)?val:""
          case "string":
            return ""+val

          default:
            return val
        }
      },
      
      runMethod(){
        if(!web3.utils.isAddress(this.runContract.contractAddress)){
          return this.$store.commit("setError","Invalid Parameter")
        }
        const method=(new web3.eth.Contract(this.abi,this.runContract.contractAddress,{from:this.address}))
              .methods[this.runContract.fn](...this.runContract.args)
        if(this.selectedAbiFn.constant){
          method.call().then(result=>{
            this.runContract.result=result
          }).catch(e=>{
            this.loading=false
            this.$store.commit("setError",e.message)
          })
        }else{
          this.loading=true
          const sendGasPriceWei = web3.utils.toWei(""+this.sendGasPrice, "gwei")
          
          Promise.all([storage.get("keyPairs"),web3.eth.getTransactionCount(this.address)]).then(res => {
            const seed=
                  bip39.mnemonicToSeed(
                    bip39.entropyToMnemonic(
                      coinUtil.decrypt(res[0].entropy,this.runContract.password)
                    )
                  )
            const nonce=res[1]
            const tx={
              from:this.address,
              nonce: web3.utils.numberToHex(nonce),
              gasPrice: web3.utils.numberToHex(sendGasPriceWei),
              gasLimit: web3.utils.numberToHex(this.runContract.gasLimit),
              to: this.runContract.contractAddress,
              value: "0x0",
              chainId: CHAIN_ID,
              data:method.encodeABI()
            }

            if(this.selectedAbiFn.payable){
              tx.value=web3.utils.numberToHex(web3.utils.toWei(""+this.runContract.value, "ether"))
            }
            
            return web3.eth.accounts.privateKeyToAccount("0x"+hdkey.fromMasterSeed(seed).derivePath(HD_DERIVATION_PATH).getWallet().getPrivateKey().toString("hex")).signTransaction(tx)
          }).then(signedTx=>{
            this.runContract.password=""
            return web3.eth.sendSignedTransaction(signedTx.rawTransaction)
          }).then(receipt=>{
            this.runContract.result=JSON.stringify(receipt)
            this.loading=false
          }).catch(e=>{
            this.loading=false
            this.$store.commit("setError",e.message)
          })
        }
      },
      goToAddTokens(){
        this.$emit("push",{extends:require("./ethTokens.js"),data(){return {networkScheme:NETWORK_SCHEME}}})
      }
    },
    computed:{
      url(){
        this.invAmt=parseFloat(this.invAmt)||0
        switch(this.addressFormat){
          case "url":
          case "monya":
            return coinUtil.getBip21(NETWORK_SCHEME,this.address,{
              amount:parseFloat(this.invAmt),
              label:NETWORK_SYMBOL
            },this.addressFormat==="url")
          default:
            return this.address
        }
      },
      isValidAddress(){
        return web3.utils.isAddress(this.sendAddress)
      },
      balance(){
        return web3.utils.fromWei(this.balanceWei,"ether")
      },
      totalGasPrice(){
        if(this.sendGasPrice > 0 && this.sendGasLimit > 0){
          return web3.utils.fromWei(new web3.utils.BN(web3.utils.toWei(""+this.sendGasPrice, "gwei")).mul(new web3.utils.BN(this.sendGasLimit)), "ether")
        }
        return "";
      },

      abi(){
        try{
          return JSON.parse(this.runContract.abiStr)
        }catch(e){
          return null
        }
      },
      selectedAbiFn(){
        if(!this.abi){return {inputs:[]}}
        for (let i = 0; i < this.abi.length; i++) {
          if(this.abi[i].name===this.runContract.fn){
            return this.abi[i]
          }
        }
        return {inputs:[]}
      }
    },
    watch:{
      invAmt(){
        this.getQrCode()
      },
      addressFormat(){
        this.getQrCode()
      }
    },
    mounted(){
      const rSend = this.$store.state.extensionSend||{}
      const sa = parseFloat(rSend.amount)||0
      if(rSend.address){
        this.sendAddress=rSend.address
        if(sa){
          this.sendAmount=""+sa
        }
        this.calcGasLimitFromAddress()
      }

      ext=extension.extStorage(NETWORK_SCHEME)
      ext.get("address").then(address=>{
        if(!address){this.$store.commit("setError",(new errors.AddressNotFoundError).message);return}
        this.address=address
        this.getBalance()
        this.getQrCode()
        this.getQrCodeAddress()
        if(this.sendAddress){
          this.sendMenu=true
        }
      })
      this.$store.commit("setExtensionSend",{})
      this.connect()
      this.getPrice()
      
    }
  })
};
