const axios = require("axios")
const errors=require("./errors")
const coinUtil = require("./coinUtil")

const MONAPPY_API_ENDPOINT = coinUtil.proxyUrl("https://api.monappy.jp/v1/")

exports.getAddress = uId => axios.get(MONAPPY_API_ENDPOINT+"users/get_address?nickname="+uId)
  .then(r=>{
    if (r.data.status!=="ok") {
      throw new errors.MonappyError()
    }
    return r.data.address
  })

exports.getNicknameFromTwitter = twId =>axios.get(MONAPPY_API_ENDPOINT+"users/get_address?twitter_id="+twId)
  .then(r=>{
    if (r.data.status!=="ok") {
      throw new errors.MonappyError()
    }
    return r.data.nickname
  })
