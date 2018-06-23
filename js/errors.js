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
