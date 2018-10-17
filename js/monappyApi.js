/*
    Monya - The easiest cryptocurrency wallet
    Copyright (C) 2017-2018 monya-wallet

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
