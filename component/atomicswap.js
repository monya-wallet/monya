
const currencyList = require("../js/currencyList")
const xmp = currencyList.get("mona")
const bitcoin = require("bitcoinjs-lib")
const storage = require("../js/storage")
const bip39 = require("bip39")
const coinUtil = require("../js/coinUtil")
const OP_INT_BASE = 80;
function makeScript (aliceSecretHash,bobPubBuf,alicePubBuf,network){
  const ret= {}
  ret.aliceToBob={}
  ret.aliceToBob.redeemScript=bitcoin.script.compile([
    bitcoin.opcodes.OP_IF,
    bitcoin.opcodes.OP_HASH160,
    aliceSecretHash,
    bitcoin.opcodes.OP_EQUALVERIFY,
    bobPubBuf,
    bitcoin.opcodes.OP_CHECKSIG,
    bitcoin.opcodes.OP_ELSE,
    OP_INT_BASE + 2,
    alicePubBuf,
    bobPubBuf,
    OP_INT_BASE + 2,
    bitcoin.opcodes.OP_CHECKMULTISIG,
    bitcoin.opcodes.OP_ENDIF
  ])
  ret.aliceToBob.outputScript=bitcoin.script.scriptHash.output.encode(bitcoin.crypto.hash160(ret.aliceToBob.redeemScript))
  ret.aliceToBob.p2shAddr=bitcoin.address.fromOutputScript(ret.aliceToBob.outputScript, network);
  ret.bobToAlice={}
  ret.bobToAlice.redeemScript=bitcoin.script.compile([
    bitcoin.opcodes.OP_IF,
    bitcoin.opcodes.OP_HASH160,
    aliceSecretHash,
    bitcoin.opcodes.OP_EQUALVERIFY,
    alicePubBuf,
    bitcoin.opcodes.OP_CHECKSIG,
    bitcoin.opcodes.OP_ELSE,
    OP_INT_BASE + 2,
    alicePubBuf,
    bobPubBuf,
    OP_INT_BASE + 2,
    bitcoin.opcodes.OP_CHECKMULTISIG,
    bitcoin.opcodes.OP_ENDIF
  ])
  
  ret.bobToAlice.outputScript=bitcoin.script.scriptHash.output.encode(bitcoin.crypto.hash160(ret.bobToAlice.redeemScript))
  ret.bobToAlice.p2shAddr=bitcoin.address.fromOutputScript(ret.bobToAlice.outputScript, network);
  
  return ret
}
const signClaimTxWithSecret = function(txb, privKey, redeemScript, secret) {
  var signatureScript = redeemScript;
  var signatureHash = txb.tx.hashForSignature(0, signatureScript, bitcoin.Transaction.SIGHASH_ALL);
  var signature = privKey.sign(signatureHash);

  var tx = txb.buildIncomplete();

  var scriptSig = bitcoin.script.compile([
    signature.toScriptSignature(bitcoin.Transaction.SIGHASH_ALL),
    secret,
    bitcoin.opcodes.OP_TRUE
  ]);

  scriptSig = bitcoin.script.scriptHash.input.encode(scriptSig, redeemScript);
  tx.setInputScript(0, scriptSig);

  return tx;
};
const signClaimTxWithMultisig = function(txb, privKey1, privKey2, redeemScript) {
  var signatureScript = redeemScript;
  var signatureHash = txb.tx.hashForSignature(0, signatureScript, bitcoin.Transaction.SIGHASH_ALL);
  var signature1 = privKey1.sign(signatureHash);
  var signature2 = privKey2.sign(signatureHash);

  var tx = txb.buildIncomplete();

  var scriptSig = bitcoin.script.compile([
    bitcoin.opcodes.OP_O,
    signature1.toScriptSignature(bitcoin.Transaction.SIGHASH_ALL),
    signature2.toScriptSignature(bitcoin.Transaction.SIGHASH_ALL),
    bitcoin.opcodes.OP_FALSE
  ]);

  scriptSig = bitcoin.script.scriptHashInput(scriptSig, redeemScript);
  tx.setInputScript(0, scriptSig);

  return tx;
};

// Vue component start

module.exports=require("./atomicswap.html")({
  data(){
    return {
      aliceSecret:"",
      alicePubHex:"",
      bobPubHex:"",

      aliceToBobP2sh:"",
      bobToAliceP2sh:"",
      aliceSecretHash:"",

      fromAddr:"",
      fromAddrChange:0,
      fromAddrIndex:0,
      toAddr:"",
      redeemAmount:0,
      signedTx:"",
      password:"",

      ret:null
    }
  },
  methods:{
    getP2sh(){
      this.aliceSecretHash=bitcoin.crypto.hash160(Buffer.from(this.aliceSecret,"hex"))
      const ret =makeScript(this.aliceSecretHash,
                            Buffer.from(this.bobPubHex,"hex"),
                            Buffer.from(this.alicePubHex,"hex"),
                            xmp.network)
      this.aliceToBobP2sh=ret.aliceToBob.p2shAddr
      this.bobToAliceP2sh=ret.bobToAlice.p2shAddr
      this.ret=ret
    },
    createRedeemTx(){
      let hex=""
      xmp.callCPLib("create_send",{
        allow_unconfirmed_inputs:true,
        fee_per_kb:128*1024,// fixed for now
        encoding:"auto",
        extended_tx_info:true,
        source:this.fromAddr,
        destination:this.toAddr,
        asset:"MONA",
        quantity:this.redeemAmount|0
      }).then(res=>{
        hex=res.tx_hex
        return storage.get("keyPairs")
      }).then(cipher=>{
        let seed=
        bip39.mnemonicToSeed(
          bip39.entropyToMnemonic(
            coinUtil.decrypt(cipher.entropy,this.password)
          )
        )
        const node = bitcoin.HDNode.fromSeedBuffer(seed,this.network)
        var unsignedTx = bitcoin.Transaction.fromHex(hex);
        var txb = bitcoin.TransactionBuilder.fromTransaction(unsignedTx, xmp.network);
        var signedTx = signClaimTxWithSecret(
          txb,
          node
            .deriveHardened(44)
            .deriveHardened(xmp.bip44.coinType)
            .deriveHardened(xmp.bip44.account)
            .derive(this.fromAddrChange|0)
            .derive(this.fromAddrIndex|0).keyPair, this.ret.bobToAlice.redeemScript, Buffer.from(this.aliceSecret,"hex"));
        
        this.signedTx=signedTx.toHex()
      })
    }
  },
  
})
