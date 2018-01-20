
const currencyList = require("../js/currencyList")
const bitcoin = require("bitcoinjs-lib")
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

  scriptSig = bitcoin.script.scriptHashInput(scriptSig, redeemScript);
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
      aliceSecretHash:""
    }
  },
  methods:{
    getP2sh(){
      this.aliceSecretHash=bitcoin.crypto.hash160(Buffer.from(this.aliceSecret,"hex"))
      const ret =makeScript(this.aliceSecretHash,
                            Buffer.from(this.bobPubHex,"hex"),
                            Buffer.from(this.alicePubHex,"hex"),
                            currencyList.get("mona").network)
      this.aliceToBobP2sh=ret.aliceToBob.p2shAddr
      this.bobToAliceP2sh=ret.bobToAlice.p2shAddr
      
    }
  },
  
})
