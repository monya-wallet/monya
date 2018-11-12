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
function createError(errorName){
  const e=function(message) {
    this.message = message||(errorName);
    const last_part = new Error().stack.match(/[^\s]+$/);
    this.stack = `${this.name} at ${last_part}`;
  }
  Object.setPrototypeOf(e, Error);
  e.prototype = Object.create(Error.prototype);
  e.prototype.name = errorName;
  e.prototype.message = "";
  e.prototype.constructor = e;
  return e
}


exports.NoSolutionError=createError("NoSolutionError")
exports.LabelNotFoundError=createError("LabelNotFoundError")
exports.MonappyError=createError("MonappyError")
exports.BiometricError=createError("BiometricError")
exports.BiometricVerificationError=createError("BiometricVerificationError")
exports.HDNodeNotFoundError=createError("HDNodeNotFoundError")
exports.InvalidIndexError=createError("InvalidIndexError")
exports.PasswordFailureError=createError("PasswordFailureError")
exports.ParameterNotFoundError=createError("ParameterNotFoundError")
exports.SignOnly=createError("SignOnly")
exports.AddressNotFoundError=createError("AddressNotFoundError")
