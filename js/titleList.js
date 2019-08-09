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
const Title = require("./title");
const axios = require("axios");
const coinUtil = require("../js/coinUtil");

const defaultTitles = [
  {
    cpCoinId: "btc", //Monaparty
    titleId: "cp",
    titleName: "Counterparty",
    apiVer: false,
    icon: require("../res/coins/xcp.png")
  },
  {
    cpCoinId: "mona", //Monaparty
    titleId: "monacard",
    titleName: "Monacard",
    apiVer: 1,
    apiEndpoint: "https://card.mona.jp/api",
    icon: require("../res/coins/xmp.png")
  }
];

let titles = {};
/**
 * Get supported titles
 * @param {function} fn(Title).
 */
exports.each = fn => {
  for (let titleName in titles) {
    if (titles[titleName] instanceof Title) {
      fn(titles[titleName]);
    }
  }
};

/**
 * Get a title from title ID
 * @param {String} titleId.
 */
exports.get = titleId => {
  if (titles[titleId] instanceof Title) {
    return titles[titleId];
  }
};

exports.getTitleList = () => {
  return titles;
};

exports.init = customTitles => {
  titles = {};
  for (let i = 0; i < defaultTitles.length; i++) {
    const defCoin = defaultTitles[i];
    titles[defCoin.titleId] = new Title(defCoin);
  }
  for (let i = 0; i < customTitles.length; i++) {
    const defCoin = customTitles[i];
    titles[defCoin.titleId] = new Title(defCoin);
  }
};
