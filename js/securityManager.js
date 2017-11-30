/**
 * Get passphrase list of seed.
 * @param {String} wordLang Language.
 */
exports.getPassphraseSeedList=(wordLang)=>new Promise((resolve,reject)=>{
  switch(wordLang){
    case "en":
      resolve(require("../res/bip39en.json"))
      break;
    default:
      return reject(new Error("Word language is invalid."))
  }
})

/**
 * Get passphrase from array.
 * @param {Array<int>} array int array.each element must be 0<=elem<=1023
 * @param {String} wordLang Language.
 * @return {Promise.resolve(Array<String>)} Passphrase
 */
exports.getWordsFromArray = (array,wordLang="en")=>exports.getPassphraseSeedList(wordLang).then((wordList)=>{
  const words = []
  for(let i=0;i<array.length;i++){
    words.push(wordList[array[i]]);
  }
  return words
})


