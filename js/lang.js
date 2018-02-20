module.exports = function(o){
  return o[window.localStorage.lang||
           (o[navigator.language]?
            navigator.language:"ja")]
}

module.exports.getLang = function(){
  return window.localStorage.lang||navigator.language
}
