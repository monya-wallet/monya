/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 58);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

var ERRORS = __webpack_require__(48)
var NATIVE = __webpack_require__(23)

// short-hand
var tfJSON = ERRORS.tfJSON
var TfTypeError = ERRORS.TfTypeError
var TfPropertyTypeError = ERRORS.TfPropertyTypeError
var tfSubError = ERRORS.tfSubError
var getValueTypeName = ERRORS.getValueTypeName

var TYPES = {
  arrayOf: function arrayOf (type) {
    type = compile(type)

    function _arrayOf (array, strict) {
      if (!NATIVE.Array(array)) return false

      return array.every(function (value, i) {
        try {
          return typeforce(type, value, strict)
        } catch (e) {
          throw tfSubError(e, i)
        }
      })
    }
    _arrayOf.toJSON = function () { return '[' + tfJSON(type) + ']' }

    return _arrayOf
  },

  maybe: function maybe (type) {
    type = compile(type)

    function _maybe (value, strict) {
      return NATIVE.Nil(value) || type(value, strict, maybe)
    }
    _maybe.toJSON = function () { return '?' + tfJSON(type) }

    return _maybe
  },

  map: function map (propertyType, propertyKeyType) {
    propertyType = compile(propertyType)
    if (propertyKeyType) propertyKeyType = compile(propertyKeyType)

    function _map (value, strict) {
      if (!NATIVE.Object(value, strict)) return false
      if (NATIVE.Nil(value, strict)) return false

      for (var propertyName in value) {
        try {
          if (propertyKeyType) {
            typeforce(propertyKeyType, propertyName, strict)
          }
        } catch (e) {
          throw tfSubError(e, propertyName, 'key')
        }

        try {
          var propertyValue = value[propertyName]
          typeforce(propertyType, propertyValue, strict)
        } catch (e) {
          throw tfSubError(e, propertyName)
        }
      }

      return true
    }

    if (propertyKeyType) {
      _map.toJSON = function () {
        return '{' + tfJSON(propertyKeyType) + ': ' + tfJSON(propertyType) + '}'
      }
    } else {
      _map.toJSON = function () { return '{' + tfJSON(propertyType) + '}' }
    }

    return _map
  },

  object: function object (uncompiled) {
    var type = {}

    for (var typePropertyName in uncompiled) {
      type[typePropertyName] = compile(uncompiled[typePropertyName])
    }

    function _object (value, strict) {
      if (!NATIVE.Object(value)) return false
      if (NATIVE.Nil(value)) return false

      var propertyName

      try {
        for (propertyName in type) {
          var propertyType = type[propertyName]
          var propertyValue = value[propertyName]

          typeforce(propertyType, propertyValue, strict)
        }
      } catch (e) {
        throw tfSubError(e, propertyName)
      }

      if (strict) {
        for (propertyName in value) {
          if (type[propertyName]) continue

          throw new TfPropertyTypeError(undefined, propertyName)
        }
      }

      return true
    }
    _object.toJSON = function () { return tfJSON(type) }

    return _object
  },

  oneOf: function oneOf () {
    var types = [].slice.call(arguments).map(compile)

    function _oneOf (value, strict) {
      return types.some(function (type) {
        try {
          return typeforce(type, value, strict)
        } catch (e) {
          return false
        }
      })
    }
    _oneOf.toJSON = function () { return types.map(tfJSON).join('|') }

    return _oneOf
  },

  quacksLike: function quacksLike (type) {
    function _quacksLike (value) {
      return type === getValueTypeName(value)
    }
    _quacksLike.toJSON = function () { return type }

    return _quacksLike
  },

  tuple: function tuple () {
    var types = [].slice.call(arguments).map(compile)

    function _tuple (values, strict) {
      return types.every(function (type, i) {
        try {
          return typeforce(type, values[i], strict)
        } catch (e) {
          throw tfSubError(e, i)
        }
      }) && (!strict || values.length === arguments.length)
    }
    _tuple.toJSON = function () { return '(' + types.map(tfJSON).join(', ') + ')' }

    return _tuple
  },

  value: function value (expected) {
    function _value (actual) {
      return actual === expected
    }
    _value.toJSON = function () { return expected }

    return _value
  }
}

function compile (type) {
  if (NATIVE.String(type)) {
    if (type[0] === '?') return TYPES.maybe(type.slice(1))

    return NATIVE[type] || TYPES.quacksLike(type)
  } else if (type && NATIVE.Object(type)) {
    if (NATIVE.Array(type)) return TYPES.arrayOf(type[0])

    return TYPES.object(type)
  } else if (NATIVE.Function(type)) {
    return type
  }

  return TYPES.value(type)
}

function typeforce (type, value, strict, surrogate) {
  if (NATIVE.Function(type)) {
    if (type(value, strict)) return true

    throw new TfTypeError(surrogate || type, value)
  }

  // JIT
  return typeforce(compile(type), value, strict)
}

// assign types to typeforce function
for (var typeName in NATIVE) {
  typeforce[typeName] = NATIVE[typeName]
}

for (typeName in TYPES) {
  typeforce[typeName] = TYPES[typeName]
}

var EXTRA = __webpack_require__(125)
for (typeName in EXTRA) {
  typeforce[typeName] = EXTRA[typeName]
}

// async wrapper
function __async (type, value, strict, callback) {
  // default to falsy strict if using shorthand overload
  if (typeof strict === 'function') return __async(type, value, false, strict)

  try {
    typeforce(type, value, strict)
  } catch (e) {
    return callback(e)
  }

  callback()
}

typeforce.async = __async
typeforce.compile = compile
typeforce.TfTypeError = TfTypeError
typeforce.TfPropertyTypeError = TfPropertyTypeError

module.exports = typeforce


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(global) {/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */



var base64 = __webpack_require__(106)
var ieee754 = __webpack_require__(107)
var isArray = __webpack_require__(36)

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * Due to various browser bugs, sometimes the Object implementation will be used even
 * when the browser supports typed arrays.
 *
 * Note:
 *
 *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
 *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
 *
 *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
 *
 *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
 *     incorrect length in some situations.

 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
 * get the Object implementation, which is slower but behaves correctly.
 */
Buffer.TYPED_ARRAY_SUPPORT = global.TYPED_ARRAY_SUPPORT !== undefined
  ? global.TYPED_ARRAY_SUPPORT
  : typedArraySupport()

/*
 * Export kMaxLength after typed array support is determined.
 */
exports.kMaxLength = kMaxLength()

function typedArraySupport () {
  try {
    var arr = new Uint8Array(1)
    arr.__proto__ = {__proto__: Uint8Array.prototype, foo: function () { return 42 }}
    return arr.foo() === 42 && // typed array instances can be augmented
        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
        arr.subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
  } catch (e) {
    return false
  }
}

function kMaxLength () {
  return Buffer.TYPED_ARRAY_SUPPORT
    ? 0x7fffffff
    : 0x3fffffff
}

function createBuffer (that, length) {
  if (kMaxLength() < length) {
    throw new RangeError('Invalid typed array length')
  }
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = new Uint8Array(length)
    that.__proto__ = Buffer.prototype
  } else {
    // Fallback: Return an object instance of the Buffer class
    if (that === null) {
      that = new Buffer(length)
    }
    that.length = length
  }

  return that
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  if (!Buffer.TYPED_ARRAY_SUPPORT && !(this instanceof Buffer)) {
    return new Buffer(arg, encodingOrOffset, length)
  }

  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new Error(
        'If encoding is specified then the first argument must be a string'
      )
    }
    return allocUnsafe(this, arg)
  }
  return from(this, arg, encodingOrOffset, length)
}

Buffer.poolSize = 8192 // not used by this implementation

// TODO: Legacy, not needed anymore. Remove in next major version.
Buffer._augment = function (arr) {
  arr.__proto__ = Buffer.prototype
  return arr
}

function from (that, value, encodingOrOffset, length) {
  if (typeof value === 'number') {
    throw new TypeError('"value" argument must not be a number')
  }

  if (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) {
    return fromArrayBuffer(that, value, encodingOrOffset, length)
  }

  if (typeof value === 'string') {
    return fromString(that, value, encodingOrOffset)
  }

  return fromObject(that, value)
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(null, value, encodingOrOffset, length)
}

if (Buffer.TYPED_ARRAY_SUPPORT) {
  Buffer.prototype.__proto__ = Uint8Array.prototype
  Buffer.__proto__ = Uint8Array
  if (typeof Symbol !== 'undefined' && Symbol.species &&
      Buffer[Symbol.species] === Buffer) {
    // Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
    Object.defineProperty(Buffer, Symbol.species, {
      value: null,
      configurable: true
    })
  }
}

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be a number')
  } else if (size < 0) {
    throw new RangeError('"size" argument must not be negative')
  }
}

function alloc (that, size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(that, size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(that, size).fill(fill, encoding)
      : createBuffer(that, size).fill(fill)
  }
  return createBuffer(that, size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(null, size, fill, encoding)
}

function allocUnsafe (that, size) {
  assertSize(size)
  that = createBuffer(that, size < 0 ? 0 : checked(size) | 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) {
    for (var i = 0; i < size; ++i) {
      that[i] = 0
    }
  }
  return that
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(null, size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(null, size)
}

function fromString (that, string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('"encoding" must be a valid string encoding')
  }

  var length = byteLength(string, encoding) | 0
  that = createBuffer(that, length)

  var actual = that.write(string, encoding)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    that = that.slice(0, actual)
  }

  return that
}

function fromArrayLike (that, array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0
  that = createBuffer(that, length)
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

function fromArrayBuffer (that, array, byteOffset, length) {
  array.byteLength // this throws if `array` is not a valid ArrayBuffer

  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('\'offset\' is out of bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('\'length\' is out of bounds')
  }

  if (byteOffset === undefined && length === undefined) {
    array = new Uint8Array(array)
  } else if (length === undefined) {
    array = new Uint8Array(array, byteOffset)
  } else {
    array = new Uint8Array(array, byteOffset, length)
  }

  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = array
    that.__proto__ = Buffer.prototype
  } else {
    // Fallback: Return an object instance of the Buffer class
    that = fromArrayLike(that, array)
  }
  return that
}

function fromObject (that, obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0
    that = createBuffer(that, len)

    if (that.length === 0) {
      return that
    }

    obj.copy(that, 0, 0, len)
    return that
  }

  if (obj) {
    if ((typeof ArrayBuffer !== 'undefined' &&
        obj.buffer instanceof ArrayBuffer) || 'length' in obj) {
      if (typeof obj.length !== 'number' || isnan(obj.length)) {
        return createBuffer(that, 0)
      }
      return fromArrayLike(that, obj)
    }

    if (obj.type === 'Buffer' && isArray(obj.data)) {
      return fromArrayLike(that, obj.data)
    }
  }

  throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.')
}

function checked (length) {
  // Note: cannot use `length < kMaxLength()` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= kMaxLength()) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + kMaxLength().toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return !!(b != null && b._isBuffer)
}

Buffer.compare = function compare (a, b) {
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError('Arguments must be Buffers')
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; ++i) {
      length += list[i].length
    }
  }

  var buffer = Buffer.allocUnsafe(length)
  var pos = 0
  for (i = 0; i < list.length; ++i) {
    var buf = list[i]
    if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos)
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (typeof ArrayBuffer !== 'undefined' && typeof ArrayBuffer.isView === 'function' &&
      (ArrayBuffer.isView(string) || string instanceof ArrayBuffer)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    string = '' + string
  }

  var len = string.length
  if (len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
      case undefined:
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) return utf8ToBytes(string).length // assume utf8
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// The property is used by `Buffer.isBuffer` and `is-buffer` (in Safari 5-7) to detect
// Buffer instances.
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  var i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7)
    swap(this, i + 1, i + 6)
    swap(this, i + 2, i + 5)
    swap(this, i + 3, i + 4)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  var length = this.length | 0
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
    if (this.length > max) str += ' ... '
  }
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (!Buffer.isBuffer(target)) {
    throw new TypeError('Argument must be a Buffer')
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  var x = thisEnd - thisStart
  var y = end - start
  var len = Math.min(x, y)

  var thisCopy = this.slice(thisStart, thisEnd)
  var targetCopy = target.slice(start, end)

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset = +byteOffset  // Coerce to Number.
  if (isNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1)
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (Buffer.isBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF // Search for a byte value [0-255]
    if (Buffer.TYPED_ARRAY_SUPPORT &&
        typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1
  var arrLength = arr.length
  var valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i
  if (dir) {
    var foundIndex = -1
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex
        foundIndex = -1
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
    for (i = byteOffset; i >= 0; i--) {
      var found = true
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
}

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  if (strLen % 2 !== 0) throw new TypeError('Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (isNaN(parsed)) return i
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function latin1Write (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset | 0
    if (isFinite(length)) {
      length = length | 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  // legacy write(string, encoding, offset, length) - remove in v0.13
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
      : (firstByte > 0xBF) ? 2
      : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; ++i) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    newBuf = this.subarray(start, end)
    newBuf.__proto__ = Buffer.prototype
  } else {
    var sliceLen = end - start
    newBuf = new Buffer(sliceLen, undefined)
    for (var i = 0; i < sliceLen; ++i) {
      newBuf[i] = this[i + start]
    }
  }

  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  this[offset] = (value & 0xff)
  return offset + 1
}

function objectWriteUInt16 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; ++i) {
    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
      (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

function objectWriteUInt32 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffffffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; ++i) {
    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset + 3] = (value >>> 24)
    this[offset + 2] = (value >>> 16)
    this[offset + 1] = (value >>> 8)
    this[offset] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
    this[offset + 2] = (value >>> 16)
    this[offset + 3] = (value >>> 24)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start
  var i

  if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start]
    }
  } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
    // ascending copy from start
    for (i = 0; i < len; ++i) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, start + len),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0)
      if (code < 256) {
        val = code
      }
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
  } else if (typeof val === 'number') {
    val = val & 255
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  var i
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    var bytes = Buffer.isBuffer(val)
      ? val
      : utf8ToBytes(new Buffer(val, encoding).toString())
    var len = bytes.length
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

function isnan (val) {
  return val !== val // eslint-disable-line no-self-compare
}

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(7)))

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

/* eslint-disable node/no-deprecated-api */
var buffer = __webpack_require__(1)
var Buffer = buffer.Buffer

// alternative to using Object.keys for old browsers
function copyProps (src, dst) {
  for (var key in src) {
    dst[key] = src[key]
  }
}
if (Buffer.from && Buffer.alloc && Buffer.allocUnsafe && Buffer.allocUnsafeSlow) {
  module.exports = buffer
} else {
  // Copy properties from require('buffer')
  copyProps(buffer, exports)
  exports.Buffer = SafeBuffer
}

function SafeBuffer (arg, encodingOrOffset, length) {
  return Buffer(arg, encodingOrOffset, length)
}

// Copy static methods from Buffer
copyProps(Buffer, SafeBuffer)

SafeBuffer.from = function (arg, encodingOrOffset, length) {
  if (typeof arg === 'number') {
    throw new TypeError('Argument must not be a number')
  }
  return Buffer(arg, encodingOrOffset, length)
}

SafeBuffer.alloc = function (size, fill, encoding) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  var buf = Buffer(size)
  if (fill !== undefined) {
    if (typeof encoding === 'string') {
      buf.fill(fill, encoding)
    } else {
      buf.fill(fill)
    }
  } else {
    buf.fill(0)
  }
  return buf
}

SafeBuffer.allocUnsafe = function (size) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  return Buffer(size)
}

SafeBuffer.allocUnsafeSlow = function (size) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  return buffer.SlowBuffer(size)
}


/***/ }),
/* 3 */
/***/ (function(module, exports) {

if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

var Buffer = __webpack_require__(2).Buffer
var bip66 = __webpack_require__(49)
var pushdata = __webpack_require__(50)
var typeforce = __webpack_require__(0)
var types = __webpack_require__(5)
var scriptNumber = __webpack_require__(51)

var OPS = __webpack_require__(6)
var REVERSE_OPS = __webpack_require__(126)
var OP_INT_BASE = OPS.OP_RESERVED // OP_1 - 1

function isOPInt (value) {
  return types.Number(value) &&
    ((value === OPS.OP_0) ||
    (value >= OPS.OP_1 && value <= OPS.OP_16) ||
    (value === OPS.OP_1NEGATE))
}

function isPushOnlyChunk (value) {
  return types.Buffer(value) || isOPInt(value)
}

function isPushOnly (value) {
  return types.Array(value) && value.every(isPushOnlyChunk)
}

function asMinimalOP (buffer) {
  if (buffer.length === 0) return OPS.OP_0
  if (buffer.length !== 1) return
  if (buffer[0] >= 1 && buffer[0] <= 16) return OP_INT_BASE + buffer[0]
  if (buffer[0] === 0x81) return OPS.OP_1NEGATE
}

function compile (chunks) {
  // TODO: remove me
  if (Buffer.isBuffer(chunks)) return chunks

  typeforce(types.Array, chunks)

  var bufferSize = chunks.reduce(function (accum, chunk) {
    // data chunk
    if (Buffer.isBuffer(chunk)) {
      // adhere to BIP62.3, minimal push policy
      if (chunk.length === 1 && asMinimalOP(chunk) !== undefined) {
        return accum + 1
      }

      return accum + pushdata.encodingLength(chunk.length) + chunk.length
    }

    // opcode
    return accum + 1
  }, 0.0)

  var buffer = Buffer.allocUnsafe(bufferSize)
  var offset = 0

  chunks.forEach(function (chunk) {
    // data chunk
    if (Buffer.isBuffer(chunk)) {
      // adhere to BIP62.3, minimal push policy
      var opcode = asMinimalOP(chunk)
      if (opcode !== undefined) {
        buffer.writeUInt8(opcode, offset)
        offset += 1
        return
      }

      offset += pushdata.encode(buffer, chunk.length, offset)
      chunk.copy(buffer, offset)
      offset += chunk.length

    // opcode
    } else {
      buffer.writeUInt8(chunk, offset)
      offset += 1
    }
  })

  if (offset !== buffer.length) throw new Error('Could not decode chunks')
  return buffer
}

function decompile (buffer) {
  // TODO: remove me
  if (types.Array(buffer)) return buffer

  typeforce(types.Buffer, buffer)

  var chunks = []
  var i = 0

  while (i < buffer.length) {
    var opcode = buffer[i]

    // data chunk
    if ((opcode > OPS.OP_0) && (opcode <= OPS.OP_PUSHDATA4)) {
      var d = pushdata.decode(buffer, i)

      // did reading a pushDataInt fail? empty script
      if (d === null) return []
      i += d.size

      // attempt to read too much data? empty script
      if (i + d.number > buffer.length) return []

      var data = buffer.slice(i, i + d.number)
      i += d.number

      // decompile minimally
      var op = asMinimalOP(data)
      if (op !== undefined) {
        chunks.push(op)
      } else {
        chunks.push(data)
      }

    // opcode
    } else {
      chunks.push(opcode)

      i += 1
    }
  }

  return chunks
}

function toASM (chunks) {
  if (Buffer.isBuffer(chunks)) {
    chunks = decompile(chunks)
  }

  return chunks.map(function (chunk) {
    // data?
    if (Buffer.isBuffer(chunk)) {
      var op = asMinimalOP(chunk)
      if (op === undefined) return chunk.toString('hex')
      chunk = op
    }

    // opcode!
    return REVERSE_OPS[chunk]
  }).join(' ')
}

function fromASM (asm) {
  typeforce(types.String, asm)

  return compile(asm.split(' ').map(function (chunkStr) {
    // opcode?
    if (OPS[chunkStr] !== undefined) return OPS[chunkStr]
    typeforce(types.Hex, chunkStr)

    // data!
    return Buffer.from(chunkStr, 'hex')
  }))
}

function toStack (chunks) {
  chunks = decompile(chunks)
  typeforce(isPushOnly, chunks)

  return chunks.map(function (op) {
    if (Buffer.isBuffer(op)) return op
    if (op === OPS.OP_0) return Buffer.allocUnsafe(0)

    return scriptNumber.encode(op - OP_INT_BASE)
  })
}

function isCanonicalPubKey (buffer) {
  if (!Buffer.isBuffer(buffer)) return false
  if (buffer.length < 33) return false

  switch (buffer[0]) {
    case 0x02:
    case 0x03:
      return buffer.length === 33
    case 0x04:
      return buffer.length === 65
  }

  return false
}

function isDefinedHashType (hashType) {
  var hashTypeMod = hashType & ~0x80

// return hashTypeMod > SIGHASH_ALL && hashTypeMod < SIGHASH_SINGLE
  return hashTypeMod > 0x00 && hashTypeMod < 0x04
}

function isCanonicalSignature (buffer) {
  if (!Buffer.isBuffer(buffer)) return false
  if (!isDefinedHashType(buffer[buffer.length - 1])) return false

  return bip66.check(buffer.slice(0, -1))
}

module.exports = {
  compile: compile,
  decompile: decompile,
  fromASM: fromASM,
  toASM: toASM,
  toStack: toStack,

  number: __webpack_require__(51),

  isCanonicalPubKey: isCanonicalPubKey,
  isCanonicalSignature: isCanonicalSignature,
  isPushOnly: isPushOnly,
  isDefinedHashType: isDefinedHashType
}

var templates = __webpack_require__(127)
for (var key in templates) {
  module.exports[key] = templates[key]
}


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

var typeforce = __webpack_require__(0)

var UINT31_MAX = Math.pow(2, 31) - 1
function UInt31 (value) {
  return typeforce.UInt32(value) && value <= UINT31_MAX
}

function BIP32Path (value) {
  return typeforce.String(value) && value.match(/^(m\/)?(\d+'?\/)*\d+'?$/)
}
BIP32Path.toJSON = function () { return 'BIP32 derivation path' }

var SATOSHI_MAX = 21 * 1e14
function Satoshi (value) {
  return typeforce.UInt53(value) && value <= SATOSHI_MAX
}

// external dependent types
var BigInt = typeforce.quacksLike('BigInteger')
var ECPoint = typeforce.quacksLike('Point')

// exposed, external API
var ECSignature = typeforce.compile({ r: BigInt, s: BigInt })
var Network = typeforce.compile({
  messagePrefix: typeforce.oneOf(typeforce.Buffer, typeforce.String),
  bip32: {
    public: typeforce.UInt32,
    private: typeforce.UInt32
  },
  pubKeyHash: typeforce.UInt8,
  scriptHash: typeforce.UInt8,
  wif: typeforce.UInt8
})

// extend typeforce types with ours
var types = {
  BigInt: BigInt,
  BIP32Path: BIP32Path,
  Buffer256bit: typeforce.BufferN(32),
  ECPoint: ECPoint,
  ECSignature: ECSignature,
  Hash160bit: typeforce.BufferN(20),
  Hash256bit: typeforce.BufferN(32),
  Network: Network,
  Satoshi: Satoshi,
  UInt31: UInt31
}

for (var typeName in typeforce) {
  types[typeName] = typeforce[typeName]
}

module.exports = types


/***/ }),
/* 6 */
/***/ (function(module, exports) {

module.exports = {"OP_FALSE":0,"OP_0":0,"OP_PUSHDATA1":76,"OP_PUSHDATA2":77,"OP_PUSHDATA4":78,"OP_1NEGATE":79,"OP_RESERVED":80,"OP_1":81,"OP_TRUE":81,"OP_2":82,"OP_3":83,"OP_4":84,"OP_5":85,"OP_6":86,"OP_7":87,"OP_8":88,"OP_9":89,"OP_10":90,"OP_11":91,"OP_12":92,"OP_13":93,"OP_14":94,"OP_15":95,"OP_16":96,"OP_NOP":97,"OP_VER":98,"OP_IF":99,"OP_NOTIF":100,"OP_VERIF":101,"OP_VERNOTIF":102,"OP_ELSE":103,"OP_ENDIF":104,"OP_VERIFY":105,"OP_RETURN":106,"OP_TOALTSTACK":107,"OP_FROMALTSTACK":108,"OP_2DROP":109,"OP_2DUP":110,"OP_3DUP":111,"OP_2OVER":112,"OP_2ROT":113,"OP_2SWAP":114,"OP_IFDUP":115,"OP_DEPTH":116,"OP_DROP":117,"OP_DUP":118,"OP_NIP":119,"OP_OVER":120,"OP_PICK":121,"OP_ROLL":122,"OP_ROT":123,"OP_SWAP":124,"OP_TUCK":125,"OP_CAT":126,"OP_SUBSTR":127,"OP_LEFT":128,"OP_RIGHT":129,"OP_SIZE":130,"OP_INVERT":131,"OP_AND":132,"OP_OR":133,"OP_XOR":134,"OP_EQUAL":135,"OP_EQUALVERIFY":136,"OP_RESERVED1":137,"OP_RESERVED2":138,"OP_1ADD":139,"OP_1SUB":140,"OP_2MUL":141,"OP_2DIV":142,"OP_NEGATE":143,"OP_ABS":144,"OP_NOT":145,"OP_0NOTEQUAL":146,"OP_ADD":147,"OP_SUB":148,"OP_MUL":149,"OP_DIV":150,"OP_MOD":151,"OP_LSHIFT":152,"OP_RSHIFT":153,"OP_BOOLAND":154,"OP_BOOLOR":155,"OP_NUMEQUAL":156,"OP_NUMEQUALVERIFY":157,"OP_NUMNOTEQUAL":158,"OP_LESSTHAN":159,"OP_GREATERTHAN":160,"OP_LESSTHANOREQUAL":161,"OP_GREATERTHANOREQUAL":162,"OP_MIN":163,"OP_MAX":164,"OP_WITHIN":165,"OP_RIPEMD160":166,"OP_SHA1":167,"OP_SHA256":168,"OP_HASH160":169,"OP_HASH256":170,"OP_CODESEPARATOR":171,"OP_CHECKSIG":172,"OP_CHECKSIGVERIFY":173,"OP_CHECKMULTISIG":174,"OP_CHECKMULTISIGVERIFY":175,"OP_NOP1":176,"OP_NOP2":177,"OP_CHECKLOCKTIMEVERIFY":177,"OP_NOP3":178,"OP_NOP4":179,"OP_NOP5":180,"OP_NOP6":181,"OP_NOP7":182,"OP_NOP8":183,"OP_NOP9":184,"OP_NOP10":185,"OP_PUBKEYHASH":253,"OP_PUBKEY":254,"OP_INVALIDOPCODE":255}

/***/ }),
/* 7 */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || Function("return this")() || (1,eval)("this");
} catch(e) {
	// This works if the window reference is available
	if(typeof window === "object")
		g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// a duplex stream is just a stream that is both readable and writable.
// Since JS doesn't have multiple prototypal inheritance, this class
// prototypally inherits from Readable, and then parasitically from
// Writable.



/*<replacement>*/

var processNextTick = __webpack_require__(16);
/*</replacement>*/

/*<replacement>*/
var objectKeys = Object.keys || function (obj) {
  var keys = [];
  for (var key in obj) {
    keys.push(key);
  }return keys;
};
/*</replacement>*/

module.exports = Duplex;

/*<replacement>*/
var util = __webpack_require__(14);
util.inherits = __webpack_require__(3);
/*</replacement>*/

var Readable = __webpack_require__(41);
var Writable = __webpack_require__(20);

util.inherits(Duplex, Readable);

var keys = objectKeys(Writable.prototype);
for (var v = 0; v < keys.length; v++) {
  var method = keys[v];
  if (!Duplex.prototype[method]) Duplex.prototype[method] = Writable.prototype[method];
}

function Duplex(options) {
  if (!(this instanceof Duplex)) return new Duplex(options);

  Readable.call(this, options);
  Writable.call(this, options);

  if (options && options.readable === false) this.readable = false;

  if (options && options.writable === false) this.writable = false;

  this.allowHalfOpen = true;
  if (options && options.allowHalfOpen === false) this.allowHalfOpen = false;

  this.once('end', onend);
}

// the no-half-open enforcer
function onend() {
  // if we allow half-open state, or if the writable side ended,
  // then we're ok.
  if (this.allowHalfOpen || this._writableState.ended) return;

  // no more data can be written.
  // But allow more writes to happen in this tick.
  processNextTick(onEndNT, this);
}

function onEndNT(self) {
  self.end();
}

Object.defineProperty(Duplex.prototype, 'destroyed', {
  get: function () {
    if (this._readableState === undefined || this._writableState === undefined) {
      return false;
    }
    return this._readableState.destroyed && this._writableState.destroyed;
  },
  set: function (value) {
    // we ignore the value if the stream
    // has not been initialized yet
    if (this._readableState === undefined || this._writableState === undefined) {
      return;
    }

    // backward compatibility, the user is explicitly
    // managing destroyed
    this._readableState.destroyed = value;
    this._writableState.destroyed = value;
  }
});

Duplex.prototype._destroy = function (err, cb) {
  this.push(null);
  this.end();

  processNextTick(cb, err);
};

function forEach(xs, f) {
  for (var i = 0, l = xs.length; i < l; i++) {
    f(xs[i], i);
  }
}

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

var BigInteger = __webpack_require__(55)

//addons
__webpack_require__(154)

module.exports = BigInteger

/***/ }),
/* 10 */
/***/ (function(module, exports) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
module.exports = function(useSourceMap) {
	var list = [];

	// return the list of modules as css string
	list.toString = function toString() {
		return this.map(function (item) {
			var content = cssWithMappingToString(item, useSourceMap);
			if(item[2]) {
				return "@media " + item[2] + "{" + content + "}";
			} else {
				return content;
			}
		}).join("");
	};

	// import a list of modules into the list
	list.i = function(modules, mediaQuery) {
		if(typeof modules === "string")
			modules = [[null, modules, ""]];
		var alreadyImportedModules = {};
		for(var i = 0; i < this.length; i++) {
			var id = this[i][0];
			if(typeof id === "number")
				alreadyImportedModules[id] = true;
		}
		for(i = 0; i < modules.length; i++) {
			var item = modules[i];
			// skip already imported module
			// this implementation is not 100% perfect for weird media query combinations
			//  when a module is imported multiple times with different media queries.
			//  I hope this will never occur (Hey this way we have smaller bundles)
			if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
				if(mediaQuery && !item[2]) {
					item[2] = mediaQuery;
				} else if(mediaQuery) {
					item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
				}
				list.push(item);
			}
		}
	};
	return list;
};

function cssWithMappingToString(item, useSourceMap) {
	var content = item[1] || '';
	var cssMapping = item[3];
	if (!cssMapping) {
		return content;
	}

	if (useSourceMap && typeof btoa === 'function') {
		var sourceMapping = toComment(cssMapping);
		var sourceURLs = cssMapping.sources.map(function (source) {
			return '/*# sourceURL=' + cssMapping.sourceRoot + source + ' */'
		});

		return [content].concat(sourceURLs).concat([sourceMapping]).join('\n');
	}

	return [content].join('\n');
}

// Adapted from convert-source-map (MIT)
function toComment(sourceMap) {
	// eslint-disable-next-line no-undef
	var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap))));
	var data = 'sourceMappingURL=data:application/json;charset=utf-8;base64,' + base64;

	return '/*# ' + data + ' */';
}


/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

var createHash = __webpack_require__(37)

function ripemd160 (buffer) {
  return createHash('rmd160').update(buffer).digest()
}

function sha1 (buffer) {
  return createHash('sha1').update(buffer).digest()
}

function sha256 (buffer) {
  return createHash('sha256').update(buffer).digest()
}

function hash160 (buffer) {
  return ripemd160(sha256(buffer))
}

function hash256 (buffer) {
  return sha256(sha256(buffer))
}

module.exports = {
  hash160: hash160,
  hash256: hash256,
  ripemd160: ripemd160,
  sha1: sha1,
  sha256: sha256
}


/***/ }),
/* 12 */
/***/ (function(module, exports) {

// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };


/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(Buffer) {// prototype class for hash functions
function Hash (blockSize, finalSize) {
  this._block = new Buffer(blockSize)
  this._finalSize = finalSize
  this._blockSize = blockSize
  this._len = 0
  this._s = 0
}

Hash.prototype.update = function (data, enc) {
  if (typeof data === 'string') {
    enc = enc || 'utf8'
    data = new Buffer(data, enc)
  }

  var l = this._len += data.length
  var s = this._s || 0
  var f = 0
  var buffer = this._block

  while (s < l) {
    var t = Math.min(data.length, f + this._blockSize - (s % this._blockSize))
    var ch = (t - f)

    for (var i = 0; i < ch; i++) {
      buffer[(s % this._blockSize) + i] = data[i + f]
    }

    s += ch
    f += ch

    if ((s % this._blockSize) === 0) {
      this._update(buffer)
    }
  }
  this._s = s

  return this
}

Hash.prototype.digest = function (enc) {
  // Suppose the length of the message M, in bits, is l
  var l = this._len * 8

  // Append the bit 1 to the end of the message
  this._block[this._len % this._blockSize] = 0x80

  // and then k zero bits, where k is the smallest non-negative solution to the equation (l + 1 + k) === finalSize mod blockSize
  this._block.fill(0, this._len % this._blockSize + 1)

  if (l % (this._blockSize * 8) >= this._finalSize * 8) {
    this._update(this._block)
    this._block.fill(0)
  }

  // to this append the block which is equal to the number l written in binary
  // TODO: handle case where l is > Math.pow(2, 29)
  this._block.writeInt32BE(l, this._blockSize - 4)

  var hash = this._update(this._block) || this._hash()

  return enc ? hash.toString(enc) : hash
}

Hash.prototype._update = function () {
  throw new Error('_update must be implemented by subclass')
}

module.exports = Hash

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1).Buffer))

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(Buffer) {// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.

function isArray(arg) {
  if (Array.isArray) {
    return Array.isArray(arg);
  }
  return objectToString(arg) === '[object Array]';
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = Buffer.isBuffer;

function objectToString(o) {
  return Object.prototype.toString.call(o);
}

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1).Buffer))

/***/ }),
/* 15 */
/***/ (function(module, exports) {

// https://en.bitcoin.it/wiki/List_of_address_prefixes
// Dogecoin BIP32 is a proposed standard: https://bitcointalk.org/index.php?topic=409731

module.exports = {
  bitcoin: {
    messagePrefix: '\x18Bitcoin Signed Message:\n',
    bech32: 'bc',
    bip32: {
      public: 0x0488b21e,
      private: 0x0488ade4
    },
    pubKeyHash: 0x00,
    scriptHash: 0x05,
    wif: 0x80
  },
  testnet: {
    messagePrefix: '\x18Bitcoin Signed Message:\n',
    bech32: 'tb',
    bip32: {
      public: 0x043587cf,
      private: 0x04358394
    },
    pubKeyHash: 0x6f,
    scriptHash: 0xc4,
    wif: 0xef
  },
  litecoin: {
    messagePrefix: '\x19Litecoin Signed Message:\n',
    bip32: {
      public: 0x019da462,
      private: 0x019d9cfe
    },
    pubKeyHash: 0x30,
    scriptHash: 0x32,
    wif: 0xb0
  }
}


/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(process) {

if (!process.version ||
    process.version.indexOf('v0.') === 0 ||
    process.version.indexOf('v1.') === 0 && process.version.indexOf('v1.8.') !== 0) {
  module.exports = nextTick;
} else {
  module.exports = process.nextTick;
}

function nextTick(fn, arg1, arg2, arg3) {
  if (typeof fn !== 'function') {
    throw new TypeError('"callback" argument must be a function');
  }
  var len = arguments.length;
  var args, i;
  switch (len) {
  case 0:
  case 1:
    return process.nextTick(fn);
  case 2:
    return process.nextTick(function afterTickOne() {
      fn.call(null, arg1);
    });
  case 3:
    return process.nextTick(function afterTickTwo() {
      fn.call(null, arg1, arg2);
    });
  case 4:
    return process.nextTick(function afterTickThree() {
      fn.call(null, arg1, arg2, arg3);
    });
  default:
    args = new Array(len - 1);
    i = 0;
    while (i < args.length) {
      args[i++] = arguments[i];
    }
    return process.nextTick(function afterTick() {
      fn.apply(null, args);
    });
  }
}

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(12)))

/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

var stylesInDom = {};

var	memoize = function (fn) {
	var memo;

	return function () {
		if (typeof memo === "undefined") memo = fn.apply(this, arguments);
		return memo;
	};
};

var isOldIE = memoize(function () {
	// Test for IE <= 9 as proposed by Browserhacks
	// @see http://browserhacks.com/#hack-e71d8692f65334173fee715c222cb805
	// Tests for existence of standard globals is to allow style-loader
	// to operate correctly into non-standard environments
	// @see https://github.com/webpack-contrib/style-loader/issues/177
	return window && document && document.all && !window.atob;
});

var getElement = (function (fn) {
	var memo = {};

	return function(selector) {
		if (typeof memo[selector] === "undefined") {
			memo[selector] = fn.call(this, selector);
		}

		return memo[selector]
	};
})(function (target) {
	return document.querySelector(target)
});

var singleton = null;
var	singletonCounter = 0;
var	stylesInsertedAtTop = [];

var	fixUrls = __webpack_require__(62);

module.exports = function(list, options) {
	if (typeof DEBUG !== "undefined" && DEBUG) {
		if (typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
	}

	options = options || {};

	options.attrs = typeof options.attrs === "object" ? options.attrs : {};

	// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
	// tags it will allow on a page
	if (!options.singleton) options.singleton = isOldIE();

	// By default, add <style> tags to the <head> element
	if (!options.insertInto) options.insertInto = "head";

	// By default, add <style> tags to the bottom of the target
	if (!options.insertAt) options.insertAt = "bottom";

	var styles = listToStyles(list, options);

	addStylesToDom(styles, options);

	return function update (newList) {
		var mayRemove = [];

		for (var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];

			domStyle.refs--;
			mayRemove.push(domStyle);
		}

		if(newList) {
			var newStyles = listToStyles(newList, options);
			addStylesToDom(newStyles, options);
		}

		for (var i = 0; i < mayRemove.length; i++) {
			var domStyle = mayRemove[i];

			if(domStyle.refs === 0) {
				for (var j = 0; j < domStyle.parts.length; j++) domStyle.parts[j]();

				delete stylesInDom[domStyle.id];
			}
		}
	};
};

function addStylesToDom (styles, options) {
	for (var i = 0; i < styles.length; i++) {
		var item = styles[i];
		var domStyle = stylesInDom[item.id];

		if(domStyle) {
			domStyle.refs++;

			for(var j = 0; j < domStyle.parts.length; j++) {
				domStyle.parts[j](item.parts[j]);
			}

			for(; j < item.parts.length; j++) {
				domStyle.parts.push(addStyle(item.parts[j], options));
			}
		} else {
			var parts = [];

			for(var j = 0; j < item.parts.length; j++) {
				parts.push(addStyle(item.parts[j], options));
			}

			stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
		}
	}
}

function listToStyles (list, options) {
	var styles = [];
	var newStyles = {};

	for (var i = 0; i < list.length; i++) {
		var item = list[i];
		var id = options.base ? item[0] + options.base : item[0];
		var css = item[1];
		var media = item[2];
		var sourceMap = item[3];
		var part = {css: css, media: media, sourceMap: sourceMap};

		if(!newStyles[id]) styles.push(newStyles[id] = {id: id, parts: [part]});
		else newStyles[id].parts.push(part);
	}

	return styles;
}

function insertStyleElement (options, style) {
	var target = getElement(options.insertInto)

	if (!target) {
		throw new Error("Couldn't find a style target. This probably means that the value for the 'insertInto' parameter is invalid.");
	}

	var lastStyleElementInsertedAtTop = stylesInsertedAtTop[stylesInsertedAtTop.length - 1];

	if (options.insertAt === "top") {
		if (!lastStyleElementInsertedAtTop) {
			target.insertBefore(style, target.firstChild);
		} else if (lastStyleElementInsertedAtTop.nextSibling) {
			target.insertBefore(style, lastStyleElementInsertedAtTop.nextSibling);
		} else {
			target.appendChild(style);
		}
		stylesInsertedAtTop.push(style);
	} else if (options.insertAt === "bottom") {
		target.appendChild(style);
	} else {
		throw new Error("Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'.");
	}
}

function removeStyleElement (style) {
	if (style.parentNode === null) return false;
	style.parentNode.removeChild(style);

	var idx = stylesInsertedAtTop.indexOf(style);
	if(idx >= 0) {
		stylesInsertedAtTop.splice(idx, 1);
	}
}

function createStyleElement (options) {
	var style = document.createElement("style");

	options.attrs.type = "text/css";

	addAttrs(style, options.attrs);
	insertStyleElement(options, style);

	return style;
}

function createLinkElement (options) {
	var link = document.createElement("link");

	options.attrs.type = "text/css";
	options.attrs.rel = "stylesheet";

	addAttrs(link, options.attrs);
	insertStyleElement(options, link);

	return link;
}

function addAttrs (el, attrs) {
	Object.keys(attrs).forEach(function (key) {
		el.setAttribute(key, attrs[key]);
	});
}

function addStyle (obj, options) {
	var style, update, remove, result;

	// If a transform function was defined, run it on the css
	if (options.transform && obj.css) {
	    result = options.transform(obj.css);

	    if (result) {
	    	// If transform returns a value, use that instead of the original css.
	    	// This allows running runtime transformations on the css.
	    	obj.css = result;
	    } else {
	    	// If the transform function returns a falsy value, don't add this css.
	    	// This allows conditional loading of css
	    	return function() {
	    		// noop
	    	};
	    }
	}

	if (options.singleton) {
		var styleIndex = singletonCounter++;

		style = singleton || (singleton = createStyleElement(options));

		update = applyToSingletonTag.bind(null, style, styleIndex, false);
		remove = applyToSingletonTag.bind(null, style, styleIndex, true);

	} else if (
		obj.sourceMap &&
		typeof URL === "function" &&
		typeof URL.createObjectURL === "function" &&
		typeof URL.revokeObjectURL === "function" &&
		typeof Blob === "function" &&
		typeof btoa === "function"
	) {
		style = createLinkElement(options);
		update = updateLink.bind(null, style, options);
		remove = function () {
			removeStyleElement(style);

			if(style.href) URL.revokeObjectURL(style.href);
		};
	} else {
		style = createStyleElement(options);
		update = applyToTag.bind(null, style);
		remove = function () {
			removeStyleElement(style);
		};
	}

	update(obj);

	return function updateStyle (newObj) {
		if (newObj) {
			if (
				newObj.css === obj.css &&
				newObj.media === obj.media &&
				newObj.sourceMap === obj.sourceMap
			) {
				return;
			}

			update(obj = newObj);
		} else {
			remove();
		}
	};
}

var replaceText = (function () {
	var textStore = [];

	return function (index, replacement) {
		textStore[index] = replacement;

		return textStore.filter(Boolean).join('\n');
	};
})();

function applyToSingletonTag (style, index, remove, obj) {
	var css = remove ? "" : obj.css;

	if (style.styleSheet) {
		style.styleSheet.cssText = replaceText(index, css);
	} else {
		var cssNode = document.createTextNode(css);
		var childNodes = style.childNodes;

		if (childNodes[index]) style.removeChild(childNodes[index]);

		if (childNodes.length) {
			style.insertBefore(cssNode, childNodes[index]);
		} else {
			style.appendChild(cssNode);
		}
	}
}

function applyToTag (style, obj) {
	var css = obj.css;
	var media = obj.media;

	if(media) {
		style.setAttribute("media", media)
	}

	if(style.styleSheet) {
		style.styleSheet.cssText = css;
	} else {
		while(style.firstChild) {
			style.removeChild(style.firstChild);
		}

		style.appendChild(document.createTextNode(css));
	}
}

function updateLink (link, options, obj) {
	var css = obj.css;
	var sourceMap = obj.sourceMap;

	/*
		If convertToAbsoluteUrls isn't defined, but sourcemaps are enabled
		and there is no publicPath defined then lets turn convertToAbsoluteUrls
		on by default.  Otherwise default to the convertToAbsoluteUrls option
		directly
	*/
	var autoFixUrls = options.convertToAbsoluteUrls === undefined && sourceMap;

	if (options.convertToAbsoluteUrls || autoFixUrls) {
		css = fixUrls(css);
	}

	if (sourceMap) {
		// http://stackoverflow.com/a/26603875
		css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
	}

	var blob = new Blob([css], { type: "text/css" });

	var oldSrc = link.href;

	link.href = URL.createObjectURL(blob);

	if(oldSrc) URL.revokeObjectURL(oldSrc);
}


/***/ }),
/* 18 */
/***/ (function(module, exports) {

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      } else {
        // At least give some kind of context to the user
        var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
        err.context = er;
        throw err;
      }
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    args = Array.prototype.slice.call(arguments, 1);
    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else if (listeners) {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.prototype.listenerCount = function(type) {
  if (this._events) {
    var evlistener = this._events[type];

    if (isFunction(evlistener))
      return 1;
    else if (evlistener)
      return evlistener.length;
  }
  return 0;
};

EventEmitter.listenerCount = function(emitter, type) {
  return emitter.listenerCount(type);
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}


/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(41);
exports.Stream = exports;
exports.Readable = exports;
exports.Writable = __webpack_require__(20);
exports.Duplex = __webpack_require__(8);
exports.Transform = __webpack_require__(44);
exports.PassThrough = __webpack_require__(115);


/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(process, setImmediate, global) {// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// A bit simpler than readable streams.
// Implement an async ._write(chunk, encoding, cb), and it'll handle all
// the drain event emission and buffering.



/*<replacement>*/

var processNextTick = __webpack_require__(16);
/*</replacement>*/

module.exports = Writable;

/* <replacement> */
function WriteReq(chunk, encoding, cb) {
  this.chunk = chunk;
  this.encoding = encoding;
  this.callback = cb;
  this.next = null;
}

// It seems a linked list but it is not
// there will be only 2 of these for each stream
function CorkedRequest(state) {
  var _this = this;

  this.next = null;
  this.entry = null;
  this.finish = function () {
    onCorkedFinish(_this, state);
  };
}
/* </replacement> */

/*<replacement>*/
var asyncWrite = !process.browser && ['v0.10', 'v0.9.'].indexOf(process.version.slice(0, 5)) > -1 ? setImmediate : processNextTick;
/*</replacement>*/

/*<replacement>*/
var Duplex;
/*</replacement>*/

Writable.WritableState = WritableState;

/*<replacement>*/
var util = __webpack_require__(14);
util.inherits = __webpack_require__(3);
/*</replacement>*/

/*<replacement>*/
var internalUtil = {
  deprecate: __webpack_require__(114)
};
/*</replacement>*/

/*<replacement>*/
var Stream = __webpack_require__(42);
/*</replacement>*/

/*<replacement>*/
var Buffer = __webpack_require__(2).Buffer;
var OurUint8Array = global.Uint8Array || function () {};
function _uint8ArrayToBuffer(chunk) {
  return Buffer.from(chunk);
}
function _isUint8Array(obj) {
  return Buffer.isBuffer(obj) || obj instanceof OurUint8Array;
}
/*</replacement>*/

var destroyImpl = __webpack_require__(43);

util.inherits(Writable, Stream);

function nop() {}

function WritableState(options, stream) {
  Duplex = Duplex || __webpack_require__(8);

  options = options || {};

  // object stream flag to indicate whether or not this stream
  // contains buffers or objects.
  this.objectMode = !!options.objectMode;

  if (stream instanceof Duplex) this.objectMode = this.objectMode || !!options.writableObjectMode;

  // the point at which write() starts returning false
  // Note: 0 is a valid value, means that we always return false if
  // the entire buffer is not flushed immediately on write()
  var hwm = options.highWaterMark;
  var defaultHwm = this.objectMode ? 16 : 16 * 1024;
  this.highWaterMark = hwm || hwm === 0 ? hwm : defaultHwm;

  // cast to ints.
  this.highWaterMark = Math.floor(this.highWaterMark);

  // if _final has been called
  this.finalCalled = false;

  // drain event flag.
  this.needDrain = false;
  // at the start of calling end()
  this.ending = false;
  // when end() has been called, and returned
  this.ended = false;
  // when 'finish' is emitted
  this.finished = false;

  // has it been destroyed
  this.destroyed = false;

  // should we decode strings into buffers before passing to _write?
  // this is here so that some node-core streams can optimize string
  // handling at a lower level.
  var noDecode = options.decodeStrings === false;
  this.decodeStrings = !noDecode;

  // Crypto is kind of old and crusty.  Historically, its default string
  // encoding is 'binary' so we have to make this configurable.
  // Everything else in the universe uses 'utf8', though.
  this.defaultEncoding = options.defaultEncoding || 'utf8';

  // not an actual buffer we keep track of, but a measurement
  // of how much we're waiting to get pushed to some underlying
  // socket or file.
  this.length = 0;

  // a flag to see when we're in the middle of a write.
  this.writing = false;

  // when true all writes will be buffered until .uncork() call
  this.corked = 0;

  // a flag to be able to tell if the onwrite cb is called immediately,
  // or on a later tick.  We set this to true at first, because any
  // actions that shouldn't happen until "later" should generally also
  // not happen before the first write call.
  this.sync = true;

  // a flag to know if we're processing previously buffered items, which
  // may call the _write() callback in the same tick, so that we don't
  // end up in an overlapped onwrite situation.
  this.bufferProcessing = false;

  // the callback that's passed to _write(chunk,cb)
  this.onwrite = function (er) {
    onwrite(stream, er);
  };

  // the callback that the user supplies to write(chunk,encoding,cb)
  this.writecb = null;

  // the amount that is being written when _write is called.
  this.writelen = 0;

  this.bufferedRequest = null;
  this.lastBufferedRequest = null;

  // number of pending user-supplied write callbacks
  // this must be 0 before 'finish' can be emitted
  this.pendingcb = 0;

  // emit prefinish if the only thing we're waiting for is _write cbs
  // This is relevant for synchronous Transform streams
  this.prefinished = false;

  // True if the error was already emitted and should not be thrown again
  this.errorEmitted = false;

  // count buffered requests
  this.bufferedRequestCount = 0;

  // allocate the first CorkedRequest, there is always
  // one allocated and free to use, and we maintain at most two
  this.corkedRequestsFree = new CorkedRequest(this);
}

WritableState.prototype.getBuffer = function getBuffer() {
  var current = this.bufferedRequest;
  var out = [];
  while (current) {
    out.push(current);
    current = current.next;
  }
  return out;
};

(function () {
  try {
    Object.defineProperty(WritableState.prototype, 'buffer', {
      get: internalUtil.deprecate(function () {
        return this.getBuffer();
      }, '_writableState.buffer is deprecated. Use _writableState.getBuffer ' + 'instead.', 'DEP0003')
    });
  } catch (_) {}
})();

// Test _writableState for inheritance to account for Duplex streams,
// whose prototype chain only points to Readable.
var realHasInstance;
if (typeof Symbol === 'function' && Symbol.hasInstance && typeof Function.prototype[Symbol.hasInstance] === 'function') {
  realHasInstance = Function.prototype[Symbol.hasInstance];
  Object.defineProperty(Writable, Symbol.hasInstance, {
    value: function (object) {
      if (realHasInstance.call(this, object)) return true;

      return object && object._writableState instanceof WritableState;
    }
  });
} else {
  realHasInstance = function (object) {
    return object instanceof this;
  };
}

function Writable(options) {
  Duplex = Duplex || __webpack_require__(8);

  // Writable ctor is applied to Duplexes, too.
  // `realHasInstance` is necessary because using plain `instanceof`
  // would return false, as no `_writableState` property is attached.

  // Trying to use the custom `instanceof` for Writable here will also break the
  // Node.js LazyTransform implementation, which has a non-trivial getter for
  // `_writableState` that would lead to infinite recursion.
  if (!realHasInstance.call(Writable, this) && !(this instanceof Duplex)) {
    return new Writable(options);
  }

  this._writableState = new WritableState(options, this);

  // legacy.
  this.writable = true;

  if (options) {
    if (typeof options.write === 'function') this._write = options.write;

    if (typeof options.writev === 'function') this._writev = options.writev;

    if (typeof options.destroy === 'function') this._destroy = options.destroy;

    if (typeof options.final === 'function') this._final = options.final;
  }

  Stream.call(this);
}

// Otherwise people can pipe Writable streams, which is just wrong.
Writable.prototype.pipe = function () {
  this.emit('error', new Error('Cannot pipe, not readable'));
};

function writeAfterEnd(stream, cb) {
  var er = new Error('write after end');
  // TODO: defer error events consistently everywhere, not just the cb
  stream.emit('error', er);
  processNextTick(cb, er);
}

// Checks that a user-supplied chunk is valid, especially for the particular
// mode the stream is in. Currently this means that `null` is never accepted
// and undefined/non-string values are only allowed in object mode.
function validChunk(stream, state, chunk, cb) {
  var valid = true;
  var er = false;

  if (chunk === null) {
    er = new TypeError('May not write null values to stream');
  } else if (typeof chunk !== 'string' && chunk !== undefined && !state.objectMode) {
    er = new TypeError('Invalid non-string/buffer chunk');
  }
  if (er) {
    stream.emit('error', er);
    processNextTick(cb, er);
    valid = false;
  }
  return valid;
}

Writable.prototype.write = function (chunk, encoding, cb) {
  var state = this._writableState;
  var ret = false;
  var isBuf = _isUint8Array(chunk) && !state.objectMode;

  if (isBuf && !Buffer.isBuffer(chunk)) {
    chunk = _uint8ArrayToBuffer(chunk);
  }

  if (typeof encoding === 'function') {
    cb = encoding;
    encoding = null;
  }

  if (isBuf) encoding = 'buffer';else if (!encoding) encoding = state.defaultEncoding;

  if (typeof cb !== 'function') cb = nop;

  if (state.ended) writeAfterEnd(this, cb);else if (isBuf || validChunk(this, state, chunk, cb)) {
    state.pendingcb++;
    ret = writeOrBuffer(this, state, isBuf, chunk, encoding, cb);
  }

  return ret;
};

Writable.prototype.cork = function () {
  var state = this._writableState;

  state.corked++;
};

Writable.prototype.uncork = function () {
  var state = this._writableState;

  if (state.corked) {
    state.corked--;

    if (!state.writing && !state.corked && !state.finished && !state.bufferProcessing && state.bufferedRequest) clearBuffer(this, state);
  }
};

Writable.prototype.setDefaultEncoding = function setDefaultEncoding(encoding) {
  // node::ParseEncoding() requires lower case.
  if (typeof encoding === 'string') encoding = encoding.toLowerCase();
  if (!(['hex', 'utf8', 'utf-8', 'ascii', 'binary', 'base64', 'ucs2', 'ucs-2', 'utf16le', 'utf-16le', 'raw'].indexOf((encoding + '').toLowerCase()) > -1)) throw new TypeError('Unknown encoding: ' + encoding);
  this._writableState.defaultEncoding = encoding;
  return this;
};

function decodeChunk(state, chunk, encoding) {
  if (!state.objectMode && state.decodeStrings !== false && typeof chunk === 'string') {
    chunk = Buffer.from(chunk, encoding);
  }
  return chunk;
}

// if we're already writing something, then just put this
// in the queue, and wait our turn.  Otherwise, call _write
// If we return false, then we need a drain event, so set that flag.
function writeOrBuffer(stream, state, isBuf, chunk, encoding, cb) {
  if (!isBuf) {
    var newChunk = decodeChunk(state, chunk, encoding);
    if (chunk !== newChunk) {
      isBuf = true;
      encoding = 'buffer';
      chunk = newChunk;
    }
  }
  var len = state.objectMode ? 1 : chunk.length;

  state.length += len;

  var ret = state.length < state.highWaterMark;
  // we must ensure that previous needDrain will not be reset to false.
  if (!ret) state.needDrain = true;

  if (state.writing || state.corked) {
    var last = state.lastBufferedRequest;
    state.lastBufferedRequest = {
      chunk: chunk,
      encoding: encoding,
      isBuf: isBuf,
      callback: cb,
      next: null
    };
    if (last) {
      last.next = state.lastBufferedRequest;
    } else {
      state.bufferedRequest = state.lastBufferedRequest;
    }
    state.bufferedRequestCount += 1;
  } else {
    doWrite(stream, state, false, len, chunk, encoding, cb);
  }

  return ret;
}

function doWrite(stream, state, writev, len, chunk, encoding, cb) {
  state.writelen = len;
  state.writecb = cb;
  state.writing = true;
  state.sync = true;
  if (writev) stream._writev(chunk, state.onwrite);else stream._write(chunk, encoding, state.onwrite);
  state.sync = false;
}

function onwriteError(stream, state, sync, er, cb) {
  --state.pendingcb;

  if (sync) {
    // defer the callback if we are being called synchronously
    // to avoid piling up things on the stack
    processNextTick(cb, er);
    // this can emit finish, and it will always happen
    // after error
    processNextTick(finishMaybe, stream, state);
    stream._writableState.errorEmitted = true;
    stream.emit('error', er);
  } else {
    // the caller expect this to happen before if
    // it is async
    cb(er);
    stream._writableState.errorEmitted = true;
    stream.emit('error', er);
    // this can emit finish, but finish must
    // always follow error
    finishMaybe(stream, state);
  }
}

function onwriteStateUpdate(state) {
  state.writing = false;
  state.writecb = null;
  state.length -= state.writelen;
  state.writelen = 0;
}

function onwrite(stream, er) {
  var state = stream._writableState;
  var sync = state.sync;
  var cb = state.writecb;

  onwriteStateUpdate(state);

  if (er) onwriteError(stream, state, sync, er, cb);else {
    // Check if we're actually ready to finish, but don't emit yet
    var finished = needFinish(state);

    if (!finished && !state.corked && !state.bufferProcessing && state.bufferedRequest) {
      clearBuffer(stream, state);
    }

    if (sync) {
      /*<replacement>*/
      asyncWrite(afterWrite, stream, state, finished, cb);
      /*</replacement>*/
    } else {
      afterWrite(stream, state, finished, cb);
    }
  }
}

function afterWrite(stream, state, finished, cb) {
  if (!finished) onwriteDrain(stream, state);
  state.pendingcb--;
  cb();
  finishMaybe(stream, state);
}

// Must force callback to be called on nextTick, so that we don't
// emit 'drain' before the write() consumer gets the 'false' return
// value, and has a chance to attach a 'drain' listener.
function onwriteDrain(stream, state) {
  if (state.length === 0 && state.needDrain) {
    state.needDrain = false;
    stream.emit('drain');
  }
}

// if there's something in the buffer waiting, then process it
function clearBuffer(stream, state) {
  state.bufferProcessing = true;
  var entry = state.bufferedRequest;

  if (stream._writev && entry && entry.next) {
    // Fast case, write everything using _writev()
    var l = state.bufferedRequestCount;
    var buffer = new Array(l);
    var holder = state.corkedRequestsFree;
    holder.entry = entry;

    var count = 0;
    var allBuffers = true;
    while (entry) {
      buffer[count] = entry;
      if (!entry.isBuf) allBuffers = false;
      entry = entry.next;
      count += 1;
    }
    buffer.allBuffers = allBuffers;

    doWrite(stream, state, true, state.length, buffer, '', holder.finish);

    // doWrite is almost always async, defer these to save a bit of time
    // as the hot path ends with doWrite
    state.pendingcb++;
    state.lastBufferedRequest = null;
    if (holder.next) {
      state.corkedRequestsFree = holder.next;
      holder.next = null;
    } else {
      state.corkedRequestsFree = new CorkedRequest(state);
    }
  } else {
    // Slow case, write chunks one-by-one
    while (entry) {
      var chunk = entry.chunk;
      var encoding = entry.encoding;
      var cb = entry.callback;
      var len = state.objectMode ? 1 : chunk.length;

      doWrite(stream, state, false, len, chunk, encoding, cb);
      entry = entry.next;
      // if we didn't call the onwrite immediately, then
      // it means that we need to wait until it does.
      // also, that means that the chunk and cb are currently
      // being processed, so move the buffer counter past them.
      if (state.writing) {
        break;
      }
    }

    if (entry === null) state.lastBufferedRequest = null;
  }

  state.bufferedRequestCount = 0;
  state.bufferedRequest = entry;
  state.bufferProcessing = false;
}

Writable.prototype._write = function (chunk, encoding, cb) {
  cb(new Error('_write() is not implemented'));
};

Writable.prototype._writev = null;

Writable.prototype.end = function (chunk, encoding, cb) {
  var state = this._writableState;

  if (typeof chunk === 'function') {
    cb = chunk;
    chunk = null;
    encoding = null;
  } else if (typeof encoding === 'function') {
    cb = encoding;
    encoding = null;
  }

  if (chunk !== null && chunk !== undefined) this.write(chunk, encoding);

  // .end() fully uncorks
  if (state.corked) {
    state.corked = 1;
    this.uncork();
  }

  // ignore unnecessary end() calls.
  if (!state.ending && !state.finished) endWritable(this, state, cb);
};

function needFinish(state) {
  return state.ending && state.length === 0 && state.bufferedRequest === null && !state.finished && !state.writing;
}
function callFinal(stream, state) {
  stream._final(function (err) {
    state.pendingcb--;
    if (err) {
      stream.emit('error', err);
    }
    state.prefinished = true;
    stream.emit('prefinish');
    finishMaybe(stream, state);
  });
}
function prefinish(stream, state) {
  if (!state.prefinished && !state.finalCalled) {
    if (typeof stream._final === 'function') {
      state.pendingcb++;
      state.finalCalled = true;
      processNextTick(callFinal, stream, state);
    } else {
      state.prefinished = true;
      stream.emit('prefinish');
    }
  }
}

function finishMaybe(stream, state) {
  var need = needFinish(state);
  if (need) {
    prefinish(stream, state);
    if (state.pendingcb === 0) {
      state.finished = true;
      stream.emit('finish');
    }
  }
  return need;
}

function endWritable(stream, state, cb) {
  state.ending = true;
  finishMaybe(stream, state);
  if (cb) {
    if (state.finished) processNextTick(cb);else stream.once('finish', cb);
  }
  state.ended = true;
  stream.writable = false;
}

function onCorkedFinish(corkReq, state, err) {
  var entry = corkReq.entry;
  corkReq.entry = null;
  while (entry) {
    var cb = entry.callback;
    state.pendingcb--;
    cb(err);
    entry = entry.next;
  }
  if (state.corkedRequestsFree) {
    state.corkedRequestsFree.next = corkReq;
  } else {
    state.corkedRequestsFree = corkReq;
  }
}

Object.defineProperty(Writable.prototype, 'destroyed', {
  get: function () {
    if (this._writableState === undefined) {
      return false;
    }
    return this._writableState.destroyed;
  },
  set: function (value) {
    // we ignore the value if the stream
    // has not been initialized yet
    if (!this._writableState) {
      return;
    }

    // backward compatibility, the user is explicitly
    // managing destroyed
    this._writableState.destroyed = value;
  }
});

Writable.prototype.destroy = destroyImpl.destroy;
Writable.prototype._undestroy = destroyImpl.undestroy;
Writable.prototype._destroy = function (err, cb) {
  this.end();
  cb(err);
};
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(12), __webpack_require__(112).setImmediate, __webpack_require__(7)))

/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var Buffer = __webpack_require__(1).Buffer;

var isBufferEncoding = Buffer.isEncoding
  || function(encoding) {
       switch (encoding && encoding.toLowerCase()) {
         case 'hex': case 'utf8': case 'utf-8': case 'ascii': case 'binary': case 'base64': case 'ucs2': case 'ucs-2': case 'utf16le': case 'utf-16le': case 'raw': return true;
         default: return false;
       }
     }


function assertEncoding(encoding) {
  if (encoding && !isBufferEncoding(encoding)) {
    throw new Error('Unknown encoding: ' + encoding);
  }
}

// StringDecoder provides an interface for efficiently splitting a series of
// buffers into a series of JS strings without breaking apart multi-byte
// characters. CESU-8 is handled as part of the UTF-8 encoding.
//
// @TODO Handling all encodings inside a single object makes it very difficult
// to reason about this code, so it should be split up in the future.
// @TODO There should be a utf8-strict encoding that rejects invalid UTF-8 code
// points as used by CESU-8.
var StringDecoder = exports.StringDecoder = function(encoding) {
  this.encoding = (encoding || 'utf8').toLowerCase().replace(/[-_]/, '');
  assertEncoding(encoding);
  switch (this.encoding) {
    case 'utf8':
      // CESU-8 represents each of Surrogate Pair by 3-bytes
      this.surrogateSize = 3;
      break;
    case 'ucs2':
    case 'utf16le':
      // UTF-16 represents each of Surrogate Pair by 2-bytes
      this.surrogateSize = 2;
      this.detectIncompleteChar = utf16DetectIncompleteChar;
      break;
    case 'base64':
      // Base-64 stores 3 bytes in 4 chars, and pads the remainder.
      this.surrogateSize = 3;
      this.detectIncompleteChar = base64DetectIncompleteChar;
      break;
    default:
      this.write = passThroughWrite;
      return;
  }

  // Enough space to store all bytes of a single character. UTF-8 needs 4
  // bytes, but CESU-8 may require up to 6 (3 bytes per surrogate).
  this.charBuffer = new Buffer(6);
  // Number of bytes received for the current incomplete multi-byte character.
  this.charReceived = 0;
  // Number of bytes expected for the current incomplete multi-byte character.
  this.charLength = 0;
};


// write decodes the given buffer and returns it as JS string that is
// guaranteed to not contain any partial multi-byte characters. Any partial
// character found at the end of the buffer is buffered up, and will be
// returned when calling write again with the remaining bytes.
//
// Note: Converting a Buffer containing an orphan surrogate to a String
// currently works, but converting a String to a Buffer (via `new Buffer`, or
// Buffer#write) will replace incomplete surrogates with the unicode
// replacement character. See https://codereview.chromium.org/121173009/ .
StringDecoder.prototype.write = function(buffer) {
  var charStr = '';
  // if our last write ended with an incomplete multibyte character
  while (this.charLength) {
    // determine how many remaining bytes this buffer has to offer for this char
    var available = (buffer.length >= this.charLength - this.charReceived) ?
        this.charLength - this.charReceived :
        buffer.length;

    // add the new bytes to the char buffer
    buffer.copy(this.charBuffer, this.charReceived, 0, available);
    this.charReceived += available;

    if (this.charReceived < this.charLength) {
      // still not enough chars in this buffer? wait for more ...
      return '';
    }

    // remove bytes belonging to the current character from the buffer
    buffer = buffer.slice(available, buffer.length);

    // get the character that was split
    charStr = this.charBuffer.slice(0, this.charLength).toString(this.encoding);

    // CESU-8: lead surrogate (D800-DBFF) is also the incomplete character
    var charCode = charStr.charCodeAt(charStr.length - 1);
    if (charCode >= 0xD800 && charCode <= 0xDBFF) {
      this.charLength += this.surrogateSize;
      charStr = '';
      continue;
    }
    this.charReceived = this.charLength = 0;

    // if there are no more bytes in this buffer, just emit our char
    if (buffer.length === 0) {
      return charStr;
    }
    break;
  }

  // determine and set charLength / charReceived
  this.detectIncompleteChar(buffer);

  var end = buffer.length;
  if (this.charLength) {
    // buffer the incomplete character bytes we got
    buffer.copy(this.charBuffer, 0, buffer.length - this.charReceived, end);
    end -= this.charReceived;
  }

  charStr += buffer.toString(this.encoding, 0, end);

  var end = charStr.length - 1;
  var charCode = charStr.charCodeAt(end);
  // CESU-8: lead surrogate (D800-DBFF) is also the incomplete character
  if (charCode >= 0xD800 && charCode <= 0xDBFF) {
    var size = this.surrogateSize;
    this.charLength += size;
    this.charReceived += size;
    this.charBuffer.copy(this.charBuffer, size, 0, size);
    buffer.copy(this.charBuffer, 0, 0, size);
    return charStr.substring(0, end);
  }

  // or just emit the charStr
  return charStr;
};

// detectIncompleteChar determines if there is an incomplete UTF-8 character at
// the end of the given buffer. If so, it sets this.charLength to the byte
// length that character, and sets this.charReceived to the number of bytes
// that are available for this character.
StringDecoder.prototype.detectIncompleteChar = function(buffer) {
  // determine how many bytes we have to check at the end of this buffer
  var i = (buffer.length >= 3) ? 3 : buffer.length;

  // Figure out if one of the last i bytes of our buffer announces an
  // incomplete char.
  for (; i > 0; i--) {
    var c = buffer[buffer.length - i];

    // See http://en.wikipedia.org/wiki/UTF-8#Description

    // 110XXXXX
    if (i == 1 && c >> 5 == 0x06) {
      this.charLength = 2;
      break;
    }

    // 1110XXXX
    if (i <= 2 && c >> 4 == 0x0E) {
      this.charLength = 3;
      break;
    }

    // 11110XXX
    if (i <= 3 && c >> 3 == 0x1E) {
      this.charLength = 4;
      break;
    }
  }
  this.charReceived = i;
};

StringDecoder.prototype.end = function(buffer) {
  var res = '';
  if (buffer && buffer.length)
    res = this.write(buffer);

  if (this.charReceived) {
    var cr = this.charReceived;
    var buf = this.charBuffer;
    var enc = this.encoding;
    res += buf.slice(0, cr).toString(enc);
  }

  return res;
};

function passThroughWrite(buffer) {
  return buffer.toString(this.encoding);
}

function utf16DetectIncompleteChar(buffer) {
  this.charReceived = buffer.length % 2;
  this.charLength = this.charReceived ? 2 : 0;
}

function base64DetectIncompleteChar(buffer) {
  this.charReceived = buffer.length % 3;
  this.charLength = this.charReceived ? 3 : 0;
}


/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

var Buffer = __webpack_require__(2).Buffer
var Transform = __webpack_require__(40).Transform
var StringDecoder = __webpack_require__(21).StringDecoder
var inherits = __webpack_require__(3)

function CipherBase (hashMode) {
  Transform.call(this)
  this.hashMode = typeof hashMode === 'string'
  if (this.hashMode) {
    this[hashMode] = this._finalOrDigest
  } else {
    this.final = this._finalOrDigest
  }
  if (this._final) {
    this.__final = this._final
    this._final = null
  }
  this._decoder = null
  this._encoding = null
}
inherits(CipherBase, Transform)

CipherBase.prototype.update = function (data, inputEnc, outputEnc) {
  if (typeof data === 'string') {
    data = Buffer.from(data, inputEnc)
  }

  var outData = this._update(data)
  if (this.hashMode) return this

  if (outputEnc) {
    outData = this._toString(outData, outputEnc)
  }

  return outData
}

CipherBase.prototype.setAutoPadding = function () {}
CipherBase.prototype.getAuthTag = function () {
  throw new Error('trying to get auth tag in unsupported state')
}

CipherBase.prototype.setAuthTag = function () {
  throw new Error('trying to set auth tag in unsupported state')
}

CipherBase.prototype.setAAD = function () {
  throw new Error('trying to set aad in unsupported state')
}

CipherBase.prototype._transform = function (data, _, next) {
  var err
  try {
    if (this.hashMode) {
      this._update(data)
    } else {
      this.push(this._update(data))
    }
  } catch (e) {
    err = e
  } finally {
    next(err)
  }
}
CipherBase.prototype._flush = function (done) {
  var err
  try {
    this.push(this.__final())
  } catch (e) {
    err = e
  }

  done(err)
}
CipherBase.prototype._finalOrDigest = function (outputEnc) {
  var outData = this.__final() || Buffer.alloc(0)
  if (outputEnc) {
    outData = this._toString(outData, outputEnc, true)
  }
  return outData
}

CipherBase.prototype._toString = function (value, enc, fin) {
  if (!this._decoder) {
    this._decoder = new StringDecoder(enc)
    this._encoding = enc
  }

  if (this._encoding !== enc) throw new Error('can\'t switch encodings')

  var out = this._decoder.write(value)
  if (fin) {
    out += this._decoder.end()
  }

  return out
}

module.exports = CipherBase


/***/ }),
/* 23 */
/***/ (function(module, exports) {

var types = {
  Array: function (value) { return value !== null && value !== undefined && value.constructor === Array },
  Boolean: function (value) { return typeof value === 'boolean' },
  Function: function (value) { return typeof value === 'function' },
  Nil: function (value) { return value === undefined || value === null },
  Number: function (value) { return typeof value === 'number' },
  Object: function (value) { return typeof value === 'object' },
  String: function (value) { return typeof value === 'string' },
  '': function () { return true }
}

// TODO: deprecate
types.Null = types.Nil

for (var typeName in types) {
  types[typeName].toJSON = function (t) {
    return t
  }.bind(null, typeName)
}

module.exports = types


/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(Buffer) {

// Number.MAX_SAFE_INTEGER
var MAX_SAFE_INTEGER = 9007199254740991

function checkUInt53 (n) {
  if (n < 0 || n > MAX_SAFE_INTEGER || n % 1 !== 0) throw new RangeError('value out of range')
}

function encode (number, buffer, offset) {
  checkUInt53(number)

  if (!buffer) buffer = new Buffer(encodingLength(number))
  if (!Buffer.isBuffer(buffer)) throw new TypeError('buffer must be a Buffer instance')
  if (!offset) offset = 0

  // 8 bit
  if (number < 0xfd) {
    buffer.writeUInt8(number, offset)
    encode.bytes = 1

  // 16 bit
  } else if (number <= 0xffff) {
    buffer.writeUInt8(0xfd, offset)
    buffer.writeUInt16LE(number, offset + 1)
    encode.bytes = 3

  // 32 bit
  } else if (number <= 0xffffffff) {
    buffer.writeUInt8(0xfe, offset)
    buffer.writeUInt32LE(number, offset + 1)
    encode.bytes = 5

  // 64 bit
  } else {
    buffer.writeUInt8(0xff, offset)
    buffer.writeUInt32LE(number >>> 0, offset + 1)
    buffer.writeUInt32LE((number / 0x100000000) | 0, offset + 5)
    encode.bytes = 9
  }

  return buffer
}

function decode (buffer, offset) {
  if (!Buffer.isBuffer(buffer)) throw new TypeError('buffer must be a Buffer instance')
  if (!offset) offset = 0

  var first = buffer.readUInt8(offset)

  // 8 bit
  if (first < 0xfd) {
    decode.bytes = 1
    return first

  // 16 bit
  } else if (first === 0xfd) {
    decode.bytes = 3
    return buffer.readUInt16LE(offset + 1)

  // 32 bit
  } else if (first === 0xfe) {
    decode.bytes = 5
    return buffer.readUInt32LE(offset + 1)

  // 64 bit
  } else {
    decode.bytes = 9
    var lo = buffer.readUInt32LE(offset + 1)
    var hi = buffer.readUInt32LE(offset + 5)
    var number = hi * 0x0100000000 + lo
    checkUInt53(number)

    return number
  }
}

function encodingLength (number) {
  checkUInt53(number)

  return (
    number < 0xfd ? 1
  : number <= 0xffff ? 3
  : number <= 0xffffffff ? 5
  : 9
  )
}

module.exports = { encode: encode, decode: decode, encodingLength: encodingLength }

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1).Buffer))

/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

var Buffer = __webpack_require__(2).Buffer
var bcrypto = __webpack_require__(11)
var bscript = __webpack_require__(4)
var bufferutils = __webpack_require__(53)
var opcodes = __webpack_require__(6)
var typeforce = __webpack_require__(0)
var types = __webpack_require__(5)
var varuint = __webpack_require__(24)

function varSliceSize (someScript) {
  var length = someScript.length

  return varuint.encodingLength(length) + length
}

function vectorSize (someVector) {
  var length = someVector.length

  return varuint.encodingLength(length) + someVector.reduce(function (sum, witness) {
    return sum + varSliceSize(witness)
  }, 0)
}

function Transaction () {
  this.version = 1
  this.locktime = 0
  this.ins = []
  this.outs = []
}

Transaction.DEFAULT_SEQUENCE = 0xffffffff
Transaction.SIGHASH_ALL = 0x01
Transaction.SIGHASH_NONE = 0x02
Transaction.SIGHASH_SINGLE = 0x03
Transaction.SIGHASH_ANYONECANPAY = 0x80
Transaction.ADVANCED_TRANSACTION_MARKER = 0x00
Transaction.ADVANCED_TRANSACTION_FLAG = 0x01

var EMPTY_SCRIPT = Buffer.allocUnsafe(0)
var EMPTY_WITNESS = []
var ZERO = Buffer.from('0000000000000000000000000000000000000000000000000000000000000000', 'hex')
var ONE = Buffer.from('0000000000000000000000000000000000000000000000000000000000000001', 'hex')
var VALUE_UINT64_MAX = Buffer.from('ffffffffffffffff', 'hex')
var BLANK_OUTPUT = {
  script: EMPTY_SCRIPT,
  valueBuffer: VALUE_UINT64_MAX
}

Transaction.fromBuffer = function (buffer, __noStrict) {
  var offset = 0
  function readSlice (n) {
    offset += n
    return buffer.slice(offset - n, offset)
  }

  function readUInt32 () {
    var i = buffer.readUInt32LE(offset)
    offset += 4
    return i
  }

  function readInt32 () {
    var i = buffer.readInt32LE(offset)
    offset += 4
    return i
  }

  function readUInt64 () {
    var i = bufferutils.readUInt64LE(buffer, offset)
    offset += 8
    return i
  }

  function readVarInt () {
    var vi = varuint.decode(buffer, offset)
    offset += varuint.decode.bytes
    return vi
  }

  function readVarSlice () {
    return readSlice(readVarInt())
  }

  function readVector () {
    var count = readVarInt()
    var vector = []
    for (var i = 0; i < count; i++) vector.push(readVarSlice())
    return vector
  }

  var tx = new Transaction()
  tx.version = readInt32()

  var marker = buffer.readUInt8(offset)
  var flag = buffer.readUInt8(offset + 1)

  var hasWitnesses = false
  if (marker === Transaction.ADVANCED_TRANSACTION_MARKER &&
      flag === Transaction.ADVANCED_TRANSACTION_FLAG) {
    offset += 2
    hasWitnesses = true
  }

  var vinLen = readVarInt()
  for (var i = 0; i < vinLen; ++i) {
    tx.ins.push({
      hash: readSlice(32),
      index: readUInt32(),
      script: readVarSlice(),
      sequence: readUInt32(),
      witness: EMPTY_WITNESS
    })
  }

  var voutLen = readVarInt()
  for (i = 0; i < voutLen; ++i) {
    tx.outs.push({
      value: readUInt64(),
      script: readVarSlice()
    })
  }

  if (hasWitnesses) {
    for (i = 0; i < vinLen; ++i) {
      tx.ins[i].witness = readVector()
    }

    // was this pointless?
    if (!tx.hasWitnesses()) throw new Error('Transaction has superfluous witness data')
  }

  tx.locktime = readUInt32()

  if (__noStrict) return tx
  if (offset !== buffer.length) throw new Error('Transaction has unexpected data')

  return tx
}

Transaction.fromHex = function (hex) {
  return Transaction.fromBuffer(Buffer.from(hex, 'hex'))
}

Transaction.isCoinbaseHash = function (buffer) {
  typeforce(types.Hash256bit, buffer)
  for (var i = 0; i < 32; ++i) {
    if (buffer[i] !== 0) return false
  }
  return true
}

Transaction.prototype.isCoinbase = function () {
  return this.ins.length === 1 && Transaction.isCoinbaseHash(this.ins[0].hash)
}

Transaction.prototype.addInput = function (hash, index, sequence, scriptSig) {
  typeforce(types.tuple(
    types.Hash256bit,
    types.UInt32,
    types.maybe(types.UInt32),
    types.maybe(types.Buffer)
  ), arguments)

  if (types.Null(sequence)) {
    sequence = Transaction.DEFAULT_SEQUENCE
  }

  // Add the input and return the input's index
  return (this.ins.push({
    hash: hash,
    index: index,
    script: scriptSig || EMPTY_SCRIPT,
    sequence: sequence,
    witness: EMPTY_WITNESS
  }) - 1)
}

Transaction.prototype.addOutput = function (scriptPubKey, value) {
  typeforce(types.tuple(types.Buffer, types.Satoshi), arguments)

  // Add the output and return the output's index
  return (this.outs.push({
    script: scriptPubKey,
    value: value
  }) - 1)
}

Transaction.prototype.hasWitnesses = function () {
  return this.ins.some(function (x) {
    return x.witness.length !== 0
  })
}

Transaction.prototype.weight = function () {
  var base = this.__byteLength(false)
  var total = this.__byteLength(true)
  return base * 3 + total
}

Transaction.prototype.virtualSize = function () {
  return Math.ceil(this.weight() / 4)
}

Transaction.prototype.byteLength = function () {
  return this.__byteLength(true)
}

Transaction.prototype.__byteLength = function (__allowWitness) {
  var hasWitnesses = __allowWitness && this.hasWitnesses()

  return (
    (hasWitnesses ? 10 : 8) +
    varuint.encodingLength(this.ins.length) +
    varuint.encodingLength(this.outs.length) +
    this.ins.reduce(function (sum, input) { return sum + 40 + varSliceSize(input.script) }, 0) +
    this.outs.reduce(function (sum, output) { return sum + 8 + varSliceSize(output.script) }, 0) +
    (hasWitnesses ? this.ins.reduce(function (sum, input) { return sum + vectorSize(input.witness) }, 0) : 0)
  )
}

Transaction.prototype.clone = function () {
  var newTx = new Transaction()
  newTx.version = this.version
  newTx.locktime = this.locktime

  newTx.ins = this.ins.map(function (txIn) {
    return {
      hash: txIn.hash,
      index: txIn.index,
      script: txIn.script,
      sequence: txIn.sequence,
      witness: txIn.witness
    }
  })

  newTx.outs = this.outs.map(function (txOut) {
    return {
      script: txOut.script,
      value: txOut.value
    }
  })

  return newTx
}

/**
 * Hash transaction for signing a specific input.
 *
 * Bitcoin uses a different hash for each signed transaction input.
 * This method copies the transaction, makes the necessary changes based on the
 * hashType, and then hashes the result.
 * This hash can then be used to sign the provided transaction input.
 */
Transaction.prototype.hashForSignature = function (inIndex, prevOutScript, hashType) {
  typeforce(types.tuple(types.UInt32, types.Buffer, /* types.UInt8 */ types.Number), arguments)

  // https://github.com/bitcoin/bitcoin/blob/master/src/test/sighash_tests.cpp#L29
  if (inIndex >= this.ins.length) return ONE

  // ignore OP_CODESEPARATOR
  var ourScript = bscript.compile(bscript.decompile(prevOutScript).filter(function (x) {
    return x !== opcodes.OP_CODESEPARATOR
  }))

  var txTmp = this.clone()

  // SIGHASH_NONE: ignore all outputs? (wildcard payee)
  if ((hashType & 0x1f) === Transaction.SIGHASH_NONE) {
    txTmp.outs = []

    // ignore sequence numbers (except at inIndex)
    txTmp.ins.forEach(function (input, i) {
      if (i === inIndex) return

      input.sequence = 0
    })

  // SIGHASH_SINGLE: ignore all outputs, except at the same index?
  } else if ((hashType & 0x1f) === Transaction.SIGHASH_SINGLE) {
    // https://github.com/bitcoin/bitcoin/blob/master/src/test/sighash_tests.cpp#L60
    if (inIndex >= this.outs.length) return ONE

    // truncate outputs after
    txTmp.outs.length = inIndex + 1

    // "blank" outputs before
    for (var i = 0; i < inIndex; i++) {
      txTmp.outs[i] = BLANK_OUTPUT
    }

    // ignore sequence numbers (except at inIndex)
    txTmp.ins.forEach(function (input, y) {
      if (y === inIndex) return

      input.sequence = 0
    })
  }

  // SIGHASH_ANYONECANPAY: ignore inputs entirely?
  if (hashType & Transaction.SIGHASH_ANYONECANPAY) {
    txTmp.ins = [txTmp.ins[inIndex]]
    txTmp.ins[0].script = ourScript

  // SIGHASH_ALL: only ignore input scripts
  } else {
    // "blank" others input scripts
    txTmp.ins.forEach(function (input) { input.script = EMPTY_SCRIPT })
    txTmp.ins[inIndex].script = ourScript
  }

  // serialize and hash
  var buffer = Buffer.allocUnsafe(txTmp.__byteLength(false) + 4)
  buffer.writeInt32LE(hashType, buffer.length - 4)
  txTmp.__toBuffer(buffer, 0, false)

  return bcrypto.hash256(buffer)
}

Transaction.prototype.hashForWitnessV0 = function (inIndex, prevOutScript, value, hashType) {
  typeforce(types.tuple(types.UInt32, types.Buffer, types.Satoshi, types.UInt32), arguments)

  var tbuffer, toffset
  function writeSlice (slice) { toffset += slice.copy(tbuffer, toffset) }
  function writeUInt32 (i) { toffset = tbuffer.writeUInt32LE(i, toffset) }
  function writeUInt64 (i) { toffset = bufferutils.writeUInt64LE(tbuffer, i, toffset) }
  function writeVarInt (i) {
    varuint.encode(i, tbuffer, toffset)
    toffset += varuint.encode.bytes
  }
  function writeVarSlice (slice) { writeVarInt(slice.length); writeSlice(slice) }

  var hashOutputs = ZERO
  var hashPrevouts = ZERO
  var hashSequence = ZERO

  if (!(hashType & Transaction.SIGHASH_ANYONECANPAY)) {
    tbuffer = Buffer.allocUnsafe(36 * this.ins.length)
    toffset = 0

    this.ins.forEach(function (txIn) {
      writeSlice(txIn.hash)
      writeUInt32(txIn.index)
    })

    hashPrevouts = bcrypto.hash256(tbuffer)
  }

  if (!(hashType & Transaction.SIGHASH_ANYONECANPAY) &&
       (hashType & 0x1f) !== Transaction.SIGHASH_SINGLE &&
       (hashType & 0x1f) !== Transaction.SIGHASH_NONE) {
    tbuffer = Buffer.allocUnsafe(4 * this.ins.length)
    toffset = 0

    this.ins.forEach(function (txIn) {
      writeUInt32(txIn.sequence)
    })

    hashSequence = bcrypto.hash256(tbuffer)
  }

  if ((hashType & 0x1f) !== Transaction.SIGHASH_SINGLE &&
      (hashType & 0x1f) !== Transaction.SIGHASH_NONE) {
    var txOutsSize = this.outs.reduce(function (sum, output) {
      return sum + 8 + varSliceSize(output.script)
    }, 0)

    tbuffer = Buffer.allocUnsafe(txOutsSize)
    toffset = 0

    this.outs.forEach(function (out) {
      writeUInt64(out.value)
      writeVarSlice(out.script)
    })

    hashOutputs = bcrypto.hash256(tbuffer)
  } else if ((hashType & 0x1f) === Transaction.SIGHASH_SINGLE && inIndex < this.outs.length) {
    var output = this.outs[inIndex]

    tbuffer = Buffer.allocUnsafe(8 + varSliceSize(output.script))
    toffset = 0
    writeUInt64(output.value)
    writeVarSlice(output.script)

    hashOutputs = bcrypto.hash256(tbuffer)
  }

  tbuffer = Buffer.allocUnsafe(156 + varSliceSize(prevOutScript))
  toffset = 0

  var input = this.ins[inIndex]
  writeUInt32(this.version)
  writeSlice(hashPrevouts)
  writeSlice(hashSequence)
  writeSlice(input.hash)
  writeUInt32(input.index)
  writeVarSlice(prevOutScript)
  writeUInt64(value)
  writeUInt32(input.sequence)
  writeSlice(hashOutputs)
  writeUInt32(this.locktime)
  writeUInt32(hashType)
  return bcrypto.hash256(tbuffer)
}

Transaction.prototype.getHash = function () {
  return bcrypto.hash256(this.__toBuffer(undefined, undefined, false))
}

Transaction.prototype.getId = function () {
  // transaction hash's are displayed in reverse order
  return this.getHash().reverse().toString('hex')
}

Transaction.prototype.toBuffer = function (buffer, initialOffset) {
  return this.__toBuffer(buffer, initialOffset, true)
}

Transaction.prototype.__toBuffer = function (buffer, initialOffset, __allowWitness) {
  if (!buffer) buffer = Buffer.allocUnsafe(this.__byteLength(__allowWitness))

  var offset = initialOffset || 0
  function writeSlice (slice) { offset += slice.copy(buffer, offset) }
  function writeUInt8 (i) { offset = buffer.writeUInt8(i, offset) }
  function writeUInt32 (i) { offset = buffer.writeUInt32LE(i, offset) }
  function writeInt32 (i) { offset = buffer.writeInt32LE(i, offset) }
  function writeUInt64 (i) { offset = bufferutils.writeUInt64LE(buffer, i, offset) }
  function writeVarInt (i) {
    varuint.encode(i, buffer, offset)
    offset += varuint.encode.bytes
  }
  function writeVarSlice (slice) { writeVarInt(slice.length); writeSlice(slice) }
  function writeVector (vector) { writeVarInt(vector.length); vector.forEach(writeVarSlice) }

  writeInt32(this.version)

  var hasWitnesses = __allowWitness && this.hasWitnesses()

  if (hasWitnesses) {
    writeUInt8(Transaction.ADVANCED_TRANSACTION_MARKER)
    writeUInt8(Transaction.ADVANCED_TRANSACTION_FLAG)
  }

  writeVarInt(this.ins.length)

  this.ins.forEach(function (txIn) {
    writeSlice(txIn.hash)
    writeUInt32(txIn.index)
    writeVarSlice(txIn.script)
    writeUInt32(txIn.sequence)
  })

  writeVarInt(this.outs.length)
  this.outs.forEach(function (txOut) {
    if (!txOut.valueBuffer) {
      writeUInt64(txOut.value)
    } else {
      writeSlice(txOut.valueBuffer)
    }

    writeVarSlice(txOut.script)
  })

  if (hasWitnesses) {
    this.ins.forEach(function (input) {
      writeVector(input.witness)
    })
  }

  writeUInt32(this.locktime)

  // avoid slicing unless necessary
  if (initialOffset !== undefined) return buffer.slice(initialOffset, offset)
  return buffer
}

Transaction.prototype.toHex = function () {
  return this.toBuffer().toString('hex')
}

Transaction.prototype.setInputScript = function (index, scriptSig) {
  typeforce(types.tuple(types.Number, types.Buffer), arguments)

  this.ins[index].script = scriptSig
}

Transaction.prototype.setWitness = function (index, witness) {
  typeforce(types.tuple(types.Number, [types.Buffer]), arguments)

  this.ins[index].witness = witness
}

module.exports = Transaction


/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

var baddress = __webpack_require__(27)
var bcrypto = __webpack_require__(11)
var ecdsa = __webpack_require__(151)
var randomBytes = __webpack_require__(160)
var typeforce = __webpack_require__(0)
var types = __webpack_require__(5)
var wif = __webpack_require__(161)

var NETWORKS = __webpack_require__(15)
var BigInteger = __webpack_require__(9)

var ecurve = __webpack_require__(31)
var secp256k1 = ecdsa.__curve

function ECPair (d, Q, options) {
  if (options) {
    typeforce({
      compressed: types.maybe(types.Boolean),
      network: types.maybe(types.Network)
    }, options)
  }

  options = options || {}

  if (d) {
    if (d.signum() <= 0) throw new Error('Private key must be greater than 0')
    if (d.compareTo(secp256k1.n) >= 0) throw new Error('Private key must be less than the curve order')
    if (Q) throw new TypeError('Unexpected publicKey parameter')

    this.d = d
  } else {
    typeforce(types.ECPoint, Q)

    this.__Q = Q
  }

  this.compressed = options.compressed === undefined ? true : options.compressed
  this.network = options.network || NETWORKS.bitcoin
}

Object.defineProperty(ECPair.prototype, 'Q', {
  get: function () {
    if (!this.__Q && this.d) {
      this.__Q = secp256k1.G.multiply(this.d)
    }

    return this.__Q
  }
})

ECPair.fromPublicKeyBuffer = function (buffer, network) {
  var Q = ecurve.Point.decodeFrom(secp256k1, buffer)

  return new ECPair(null, Q, {
    compressed: Q.compressed,
    network: network
  })
}

ECPair.fromWIF = function (string, network) {
  var decoded = wif.decode(string)
  var version = decoded.version

  // list of networks?
  if (types.Array(network)) {
    network = network.filter(function (x) {
      return version === x.wif
    }).pop()

    if (!network) throw new Error('Unknown network version')

  // otherwise, assume a network object (or default to bitcoin)
  } else {
    network = network || NETWORKS.bitcoin

    if (version !== network.wif) throw new Error('Invalid network version')
  }

  var d = BigInteger.fromBuffer(decoded.privateKey)

  return new ECPair(d, null, {
    compressed: decoded.compressed,
    network: network
  })
}

ECPair.makeRandom = function (options) {
  options = options || {}

  var rng = options.rng || randomBytes

  var d
  do {
    var buffer = rng(32)
    typeforce(types.Buffer256bit, buffer)

    d = BigInteger.fromBuffer(buffer)
  } while (d.signum() <= 0 || d.compareTo(secp256k1.n) >= 0)

  return new ECPair(d, null, options)
}

ECPair.prototype.getAddress = function () {
  return baddress.toBase58Check(bcrypto.hash160(this.getPublicKeyBuffer()), this.getNetwork().pubKeyHash)
}

ECPair.prototype.getNetwork = function () {
  return this.network
}

ECPair.prototype.getPublicKeyBuffer = function () {
  return this.Q.getEncoded(this.compressed)
}

ECPair.prototype.sign = function (hash) {
  if (!this.d) throw new Error('Missing private key')

  return ecdsa.sign(hash, this.d)
}

ECPair.prototype.toWIF = function () {
  if (!this.d) throw new Error('Missing private key')

  return wif.encode(this.network.wif, this.d.toBuffer(32), this.compressed)
}

ECPair.prototype.verify = function (hash, signature) {
  return ecdsa.verify(hash, signature, this.Q)
}

module.exports = ECPair


/***/ }),
/* 27 */
/***/ (function(module, exports, __webpack_require__) {

var Buffer = __webpack_require__(2).Buffer
var bech32 = __webpack_require__(148)
var bs58check = __webpack_require__(28)
var bscript = __webpack_require__(4)
var networks = __webpack_require__(15)
var typeforce = __webpack_require__(0)
var types = __webpack_require__(5)

function fromBase58Check (address) {
  var payload = bs58check.decode(address)

  // TODO: 4.0.0, move to "toOutputScript"
  if (payload.length < 21) throw new TypeError(address + ' is too short')
  if (payload.length > 21) throw new TypeError(address + ' is too long')

  var version = payload.readUInt8(0)
  var hash = payload.slice(1)

  return { version: version, hash: hash }
}

function fromBech32 (address) {
  var result = bech32.decode(address)
  var data = bech32.fromWords(result.words.slice(1))

  return {
    version: result.words[0],
    prefix: result.prefix,
    data: Buffer.from(data)
  }
}

function toBase58Check (hash, version) {
  typeforce(types.tuple(types.Hash160bit, types.UInt8), arguments)

  var payload = Buffer.allocUnsafe(21)
  payload.writeUInt8(version, 0)
  hash.copy(payload, 1)

  return bs58check.encode(payload)
}

function toBech32 (data, version, prefix) {
  var words = bech32.toWords(data)
  words.unshift(version)

  return bech32.encode(prefix, words)
}

function fromOutputScript (outputScript, network) {
  network = network || networks.bitcoin

  if (bscript.pubKeyHash.output.check(outputScript)) return toBase58Check(bscript.compile(outputScript).slice(3, 23), network.pubKeyHash)
  if (bscript.scriptHash.output.check(outputScript)) return toBase58Check(bscript.compile(outputScript).slice(2, 22), network.scriptHash)
  if (bscript.witnessPubKeyHash.output.check(outputScript)) return toBech32(bscript.compile(outputScript).slice(2, 22), 0, network.bech32)
  if (bscript.witnessScriptHash.output.check(outputScript)) return toBech32(bscript.compile(outputScript).slice(2, 34), 0, network.bech32)

  throw new Error(bscript.toASM(outputScript) + ' has no matching Address')
}

function toOutputScript (address, network) {
  network = network || networks.bitcoin

  var decode
  try {
    decode = fromBase58Check(address)
  } catch (e) {}

  if (decode) {
    if (decode.version === network.pubKeyHash) return bscript.pubKeyHash.output.encode(decode.hash)
    if (decode.version === network.scriptHash) return bscript.scriptHash.output.encode(decode.hash)
  } else {
    try {
      decode = fromBech32(address)
    } catch (e) {}

    if (decode) {
      if (decode.prefix !== network.bech32) throw new Error(address + ' has an invalid prefix')
      if (decode.version === 0) {
        if (decode.data.length === 20) return bscript.witnessPubKeyHash.output.encode(decode.data)
        if (decode.data.length === 32) return bscript.witnessScriptHash.output.encode(decode.data)
      }
    }
  }

  throw new Error(address + ' has no matching Script')
}

module.exports = {
  fromBase58Check: fromBase58Check,
  fromBech32: fromBech32,
  fromOutputScript: fromOutputScript,
  toBase58Check: toBase58Check,
  toBech32: toBech32,
  toOutputScript: toOutputScript
}


/***/ }),
/* 28 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(Buffer) {

var base58 = __webpack_require__(149)
var createHash = __webpack_require__(37)

// SHA256(SHA256(buffer))
function sha256x2 (buffer) {
  var tmp = createHash('sha256').update(buffer).digest()
  return createHash('sha256').update(tmp).digest()
}

// Encode a buffer as a base58-check encoded string
function encode (payload) {
  var checksum = sha256x2(payload)

  return base58.encode(Buffer.concat([
    payload,
    checksum
  ], payload.length + 4))
}

function decodeRaw (buffer) {
  var payload = buffer.slice(0, -4)
  var checksum = buffer.slice(-4)
  var newChecksum = sha256x2(payload)

  if (checksum[0] ^ newChecksum[0] |
      checksum[1] ^ newChecksum[1] |
      checksum[2] ^ newChecksum[2] |
      checksum[3] ^ newChecksum[3]) return

  return payload
}

// Decode a base58-check encoded string to a buffer, no result if checksum is wrong
function decodeUnsafe (string) {
  var buffer = base58.decodeUnsafe(string)
  if (!buffer) return

  return decodeRaw(buffer)
}

function decode (string) {
  var buffer = base58.decode(string)
  var payload = decodeRaw(buffer)
  if (!payload) throw new Error('Invalid checksum')
  return payload
}

module.exports = {
  encode: encode,
  decode: decode,
  decodeUnsafe: decodeUnsafe
}

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1).Buffer))

/***/ }),
/* 29 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(global) {

// compare and isBuffer taken from https://github.com/feross/buffer/blob/680e9e5e488f22aac27599a57dc844a6315928dd/index.js
// original notice:

/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */
function compare(a, b) {
  if (a === b) {
    return 0;
  }

  var x = a.length;
  var y = b.length;

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i];
      y = b[i];
      break;
    }
  }

  if (x < y) {
    return -1;
  }
  if (y < x) {
    return 1;
  }
  return 0;
}
function isBuffer(b) {
  if (global.Buffer && typeof global.Buffer.isBuffer === 'function') {
    return global.Buffer.isBuffer(b);
  }
  return !!(b != null && b._isBuffer);
}

// based on node assert, original notice:

// http://wiki.commonjs.org/wiki/Unit_Testing/1.0
//
// THIS IS NOT TESTED NOR LIKELY TO WORK OUTSIDE V8!
//
// Originally from narwhal.js (http://narwhaljs.org)
// Copyright (c) 2009 Thomas Robinson <280north.com>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the 'Software'), to
// deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
// sell copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
// ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

var util = __webpack_require__(155);
var hasOwn = Object.prototype.hasOwnProperty;
var pSlice = Array.prototype.slice;
var functionsHaveNames = (function () {
  return function foo() {}.name === 'foo';
}());
function pToString (obj) {
  return Object.prototype.toString.call(obj);
}
function isView(arrbuf) {
  if (isBuffer(arrbuf)) {
    return false;
  }
  if (typeof global.ArrayBuffer !== 'function') {
    return false;
  }
  if (typeof ArrayBuffer.isView === 'function') {
    return ArrayBuffer.isView(arrbuf);
  }
  if (!arrbuf) {
    return false;
  }
  if (arrbuf instanceof DataView) {
    return true;
  }
  if (arrbuf.buffer && arrbuf.buffer instanceof ArrayBuffer) {
    return true;
  }
  return false;
}
// 1. The assert module provides functions that throw
// AssertionError's when particular conditions are not met. The
// assert module must conform to the following interface.

var assert = module.exports = ok;

// 2. The AssertionError is defined in assert.
// new assert.AssertionError({ message: message,
//                             actual: actual,
//                             expected: expected })

var regex = /\s*function\s+([^\(\s]*)\s*/;
// based on https://github.com/ljharb/function.prototype.name/blob/adeeeec8bfcc6068b187d7d9fb3d5bb1d3a30899/implementation.js
function getName(func) {
  if (!util.isFunction(func)) {
    return;
  }
  if (functionsHaveNames) {
    return func.name;
  }
  var str = func.toString();
  var match = str.match(regex);
  return match && match[1];
}
assert.AssertionError = function AssertionError(options) {
  this.name = 'AssertionError';
  this.actual = options.actual;
  this.expected = options.expected;
  this.operator = options.operator;
  if (options.message) {
    this.message = options.message;
    this.generatedMessage = false;
  } else {
    this.message = getMessage(this);
    this.generatedMessage = true;
  }
  var stackStartFunction = options.stackStartFunction || fail;
  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, stackStartFunction);
  } else {
    // non v8 browsers so we can have a stacktrace
    var err = new Error();
    if (err.stack) {
      var out = err.stack;

      // try to strip useless frames
      var fn_name = getName(stackStartFunction);
      var idx = out.indexOf('\n' + fn_name);
      if (idx >= 0) {
        // once we have located the function frame
        // we need to strip out everything before it (and its line)
        var next_line = out.indexOf('\n', idx + 1);
        out = out.substring(next_line + 1);
      }

      this.stack = out;
    }
  }
};

// assert.AssertionError instanceof Error
util.inherits(assert.AssertionError, Error);

function truncate(s, n) {
  if (typeof s === 'string') {
    return s.length < n ? s : s.slice(0, n);
  } else {
    return s;
  }
}
function inspect(something) {
  if (functionsHaveNames || !util.isFunction(something)) {
    return util.inspect(something);
  }
  var rawname = getName(something);
  var name = rawname ? ': ' + rawname : '';
  return '[Function' +  name + ']';
}
function getMessage(self) {
  return truncate(inspect(self.actual), 128) + ' ' +
         self.operator + ' ' +
         truncate(inspect(self.expected), 128);
}

// At present only the three keys mentioned above are used and
// understood by the spec. Implementations or sub modules can pass
// other keys to the AssertionError's constructor - they will be
// ignored.

// 3. All of the following functions must throw an AssertionError
// when a corresponding condition is not met, with a message that
// may be undefined if not provided.  All assertion methods provide
// both the actual and expected values to the assertion error for
// display purposes.

function fail(actual, expected, message, operator, stackStartFunction) {
  throw new assert.AssertionError({
    message: message,
    actual: actual,
    expected: expected,
    operator: operator,
    stackStartFunction: stackStartFunction
  });
}

// EXTENSION! allows for well behaved errors defined elsewhere.
assert.fail = fail;

// 4. Pure assertion tests whether a value is truthy, as determined
// by !!guard.
// assert.ok(guard, message_opt);
// This statement is equivalent to assert.equal(true, !!guard,
// message_opt);. To test strictly for the value true, use
// assert.strictEqual(true, guard, message_opt);.

function ok(value, message) {
  if (!value) fail(value, true, message, '==', assert.ok);
}
assert.ok = ok;

// 5. The equality assertion tests shallow, coercive equality with
// ==.
// assert.equal(actual, expected, message_opt);

assert.equal = function equal(actual, expected, message) {
  if (actual != expected) fail(actual, expected, message, '==', assert.equal);
};

// 6. The non-equality assertion tests for whether two objects are not equal
// with != assert.notEqual(actual, expected, message_opt);

assert.notEqual = function notEqual(actual, expected, message) {
  if (actual == expected) {
    fail(actual, expected, message, '!=', assert.notEqual);
  }
};

// 7. The equivalence assertion tests a deep equality relation.
// assert.deepEqual(actual, expected, message_opt);

assert.deepEqual = function deepEqual(actual, expected, message) {
  if (!_deepEqual(actual, expected, false)) {
    fail(actual, expected, message, 'deepEqual', assert.deepEqual);
  }
};

assert.deepStrictEqual = function deepStrictEqual(actual, expected, message) {
  if (!_deepEqual(actual, expected, true)) {
    fail(actual, expected, message, 'deepStrictEqual', assert.deepStrictEqual);
  }
};

function _deepEqual(actual, expected, strict, memos) {
  // 7.1. All identical values are equivalent, as determined by ===.
  if (actual === expected) {
    return true;
  } else if (isBuffer(actual) && isBuffer(expected)) {
    return compare(actual, expected) === 0;

  // 7.2. If the expected value is a Date object, the actual value is
  // equivalent if it is also a Date object that refers to the same time.
  } else if (util.isDate(actual) && util.isDate(expected)) {
    return actual.getTime() === expected.getTime();

  // 7.3 If the expected value is a RegExp object, the actual value is
  // equivalent if it is also a RegExp object with the same source and
  // properties (`global`, `multiline`, `lastIndex`, `ignoreCase`).
  } else if (util.isRegExp(actual) && util.isRegExp(expected)) {
    return actual.source === expected.source &&
           actual.global === expected.global &&
           actual.multiline === expected.multiline &&
           actual.lastIndex === expected.lastIndex &&
           actual.ignoreCase === expected.ignoreCase;

  // 7.4. Other pairs that do not both pass typeof value == 'object',
  // equivalence is determined by ==.
  } else if ((actual === null || typeof actual !== 'object') &&
             (expected === null || typeof expected !== 'object')) {
    return strict ? actual === expected : actual == expected;

  // If both values are instances of typed arrays, wrap their underlying
  // ArrayBuffers in a Buffer each to increase performance
  // This optimization requires the arrays to have the same type as checked by
  // Object.prototype.toString (aka pToString). Never perform binary
  // comparisons for Float*Arrays, though, since e.g. +0 === -0 but their
  // bit patterns are not identical.
  } else if (isView(actual) && isView(expected) &&
             pToString(actual) === pToString(expected) &&
             !(actual instanceof Float32Array ||
               actual instanceof Float64Array)) {
    return compare(new Uint8Array(actual.buffer),
                   new Uint8Array(expected.buffer)) === 0;

  // 7.5 For all other Object pairs, including Array objects, equivalence is
  // determined by having the same number of owned properties (as verified
  // with Object.prototype.hasOwnProperty.call), the same set of keys
  // (although not necessarily the same order), equivalent values for every
  // corresponding key, and an identical 'prototype' property. Note: this
  // accounts for both named and indexed properties on Arrays.
  } else if (isBuffer(actual) !== isBuffer(expected)) {
    return false;
  } else {
    memos = memos || {actual: [], expected: []};

    var actualIndex = memos.actual.indexOf(actual);
    if (actualIndex !== -1) {
      if (actualIndex === memos.expected.indexOf(expected)) {
        return true;
      }
    }

    memos.actual.push(actual);
    memos.expected.push(expected);

    return objEquiv(actual, expected, strict, memos);
  }
}

function isArguments(object) {
  return Object.prototype.toString.call(object) == '[object Arguments]';
}

function objEquiv(a, b, strict, actualVisitedObjects) {
  if (a === null || a === undefined || b === null || b === undefined)
    return false;
  // if one is a primitive, the other must be same
  if (util.isPrimitive(a) || util.isPrimitive(b))
    return a === b;
  if (strict && Object.getPrototypeOf(a) !== Object.getPrototypeOf(b))
    return false;
  var aIsArgs = isArguments(a);
  var bIsArgs = isArguments(b);
  if ((aIsArgs && !bIsArgs) || (!aIsArgs && bIsArgs))
    return false;
  if (aIsArgs) {
    a = pSlice.call(a);
    b = pSlice.call(b);
    return _deepEqual(a, b, strict);
  }
  var ka = objectKeys(a);
  var kb = objectKeys(b);
  var key, i;
  // having the same number of owned properties (keys incorporates
  // hasOwnProperty)
  if (ka.length !== kb.length)
    return false;
  //the same set of keys (although not necessarily the same order),
  ka.sort();
  kb.sort();
  //~~~cheap key test
  for (i = ka.length - 1; i >= 0; i--) {
    if (ka[i] !== kb[i])
      return false;
  }
  //equivalent values for every corresponding key, and
  //~~~possibly expensive deep test
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!_deepEqual(a[key], b[key], strict, actualVisitedObjects))
      return false;
  }
  return true;
}

// 8. The non-equivalence assertion tests for any deep inequality.
// assert.notDeepEqual(actual, expected, message_opt);

assert.notDeepEqual = function notDeepEqual(actual, expected, message) {
  if (_deepEqual(actual, expected, false)) {
    fail(actual, expected, message, 'notDeepEqual', assert.notDeepEqual);
  }
};

assert.notDeepStrictEqual = notDeepStrictEqual;
function notDeepStrictEqual(actual, expected, message) {
  if (_deepEqual(actual, expected, true)) {
    fail(actual, expected, message, 'notDeepStrictEqual', notDeepStrictEqual);
  }
}


// 9. The strict equality assertion tests strict equality, as determined by ===.
// assert.strictEqual(actual, expected, message_opt);

assert.strictEqual = function strictEqual(actual, expected, message) {
  if (actual !== expected) {
    fail(actual, expected, message, '===', assert.strictEqual);
  }
};

// 10. The strict non-equality assertion tests for strict inequality, as
// determined by !==.  assert.notStrictEqual(actual, expected, message_opt);

assert.notStrictEqual = function notStrictEqual(actual, expected, message) {
  if (actual === expected) {
    fail(actual, expected, message, '!==', assert.notStrictEqual);
  }
};

function expectedException(actual, expected) {
  if (!actual || !expected) {
    return false;
  }

  if (Object.prototype.toString.call(expected) == '[object RegExp]') {
    return expected.test(actual);
  }

  try {
    if (actual instanceof expected) {
      return true;
    }
  } catch (e) {
    // Ignore.  The instanceof check doesn't work for arrow functions.
  }

  if (Error.isPrototypeOf(expected)) {
    return false;
  }

  return expected.call({}, actual) === true;
}

function _tryBlock(block) {
  var error;
  try {
    block();
  } catch (e) {
    error = e;
  }
  return error;
}

function _throws(shouldThrow, block, expected, message) {
  var actual;

  if (typeof block !== 'function') {
    throw new TypeError('"block" argument must be a function');
  }

  if (typeof expected === 'string') {
    message = expected;
    expected = null;
  }

  actual = _tryBlock(block);

  message = (expected && expected.name ? ' (' + expected.name + ').' : '.') +
            (message ? ' ' + message : '.');

  if (shouldThrow && !actual) {
    fail(actual, expected, 'Missing expected exception' + message);
  }

  var userProvidedMessage = typeof message === 'string';
  var isUnwantedException = !shouldThrow && util.isError(actual);
  var isUnexpectedException = !shouldThrow && actual && !expected;

  if ((isUnwantedException &&
      userProvidedMessage &&
      expectedException(actual, expected)) ||
      isUnexpectedException) {
    fail(actual, expected, 'Got unwanted exception' + message);
  }

  if ((shouldThrow && actual && expected &&
      !expectedException(actual, expected)) || (!shouldThrow && actual)) {
    throw actual;
  }
}

// 11. Expected to throw an error:
// assert.throws(block, Error_opt, message_opt);

assert.throws = function(block, /*optional*/error, /*optional*/message) {
  _throws(true, block, error, message);
};

// EXTENSION! This is annoying to write outside this module.
assert.doesNotThrow = function(block, /*optional*/error, /*optional*/message) {
  _throws(false, block, error, message);
};

assert.ifError = function(err) { if (err) throw err; };

var objectKeys = Object.keys || function (obj) {
  var keys = [];
  for (var key in obj) {
    if (hasOwn.call(obj, key)) keys.push(key);
  }
  return keys;
};

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(7)))

/***/ }),
/* 30 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(Buffer) {var bip66 = __webpack_require__(49)
var typeforce = __webpack_require__(0)
var types = __webpack_require__(5)

var BigInteger = __webpack_require__(9)

function ECSignature (r, s) {
  typeforce(types.tuple(types.BigInt, types.BigInt), arguments)

  this.r = r
  this.s = s
}

ECSignature.parseCompact = function (buffer) {
  if (buffer.length !== 65) throw new Error('Invalid signature length')

  var flagByte = buffer.readUInt8(0) - 27
  if (flagByte !== (flagByte & 7)) throw new Error('Invalid signature parameter')

  var compressed = !!(flagByte & 4)
  var recoveryParam = flagByte & 3

  var r = BigInteger.fromBuffer(buffer.slice(1, 33))
  var s = BigInteger.fromBuffer(buffer.slice(33))

  return {
    compressed: compressed,
    i: recoveryParam,
    signature: new ECSignature(r, s)
  }
}

ECSignature.fromDER = function (buffer) {
  var decode = bip66.decode(buffer)
  var r = BigInteger.fromDERInteger(decode.r)
  var s = BigInteger.fromDERInteger(decode.s)

  return new ECSignature(r, s)
}

// BIP62: 1 byte hashType flag (only 0x01, 0x02, 0x03, 0x81, 0x82 and 0x83 are allowed)
ECSignature.parseScriptSignature = function (buffer) {
  var hashType = buffer.readUInt8(buffer.length - 1)
  var hashTypeMod = hashType & ~0x80

  if (hashTypeMod <= 0x00 || hashTypeMod >= 0x04) throw new Error('Invalid hashType ' + hashType)

  return {
    signature: ECSignature.fromDER(buffer.slice(0, -1)),
    hashType: hashType
  }
}

ECSignature.prototype.toCompact = function (i, compressed) {
  if (compressed) {
    i += 4
  }

  i += 27

  var buffer = Buffer.alloc(65)
  buffer.writeUInt8(i, 0)
  this.r.toBuffer(32).copy(buffer, 1)
  this.s.toBuffer(32).copy(buffer, 33)

  return buffer
}

ECSignature.prototype.toDER = function () {
  var r = Buffer.from(this.r.toDERInteger())
  var s = Buffer.from(this.s.toDERInteger())

  return bip66.encode(r, s)
}

ECSignature.prototype.toScriptSignature = function (hashType) {
  var hashTypeMod = hashType & ~0x80
  if (hashTypeMod <= 0 || hashTypeMod >= 4) throw new Error('Invalid hashType ' + hashType)

  var hashTypeBuffer = Buffer.alloc(1)
  hashTypeBuffer.writeUInt8(hashType, 0)

  return Buffer.concat([this.toDER(), hashTypeBuffer])
}

module.exports = ECSignature

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1).Buffer))

/***/ }),
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

var Point = __webpack_require__(56)
var Curve = __webpack_require__(57)

var getCurveByName = __webpack_require__(158)

module.exports = {
  Curve: Curve,
  Point: Point,
  getCurveByName: getCurveByName
}


/***/ }),
/* 32 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "dist/assets/19e65b89cee273a249fba4c09b951b74.eot";

/***/ }),
/* 33 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = __webpack_require__(86)({
  data: function data() {
    return {};
  },

  methods: {
    start: function start() {
      this.$emit("push", __webpack_require__(87));
    }
  },
  mounted: function mounted() {}
});

/***/ }),
/* 34 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Get passphrase list of seed.
 * @param {String} wordLang Language.
 */
exports.getPassphraseSeedList = function (wordLang) {
  return new Promise(function (resolve, reject) {
    switch (wordLang) {
      case "en":
        resolve(__webpack_require__(95));
        break;
      default:
        return reject(new Error("Word language is invalid."));
    }
  });
};

/**
 * Get passphrase from array.
 * @param {Array<int>} array int array.each element must be 0<=elem<=1023
 * @param {String} wordLang Language.
 * @return {Promise.resolve(Array<String>)} Passphrase
 */
exports.getWordsFromArray = function (array) {
  var wordLang = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "en";
  return exports.getPassphraseSeedList(wordLang).then(function (wordList) {
    var words = [];
    for (var i = 0; i < array.length; i++) {
      words.push(wordList[array[i]]);
    }
    return words;
  });
};

/***/ }),
/* 35 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = __webpack_require__(101)({
  data: function data() {
    return {};
  },

  methods: {}
});

/***/ }),
/* 36 */
/***/ (function(module, exports) {

var toString = {}.toString;

module.exports = Array.isArray || function (arr) {
  return toString.call(arr) == '[object Array]';
};


/***/ }),
/* 37 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(Buffer) {
var inherits = __webpack_require__(3)
var md5 = __webpack_require__(38)
var RIPEMD160 = __webpack_require__(39)
var sha = __webpack_require__(45)

var Base = __webpack_require__(22)

function HashNoConstructor (hash) {
  Base.call(this, 'digest')

  this._hash = hash
  this.buffers = []
}

inherits(HashNoConstructor, Base)

HashNoConstructor.prototype._update = function (data) {
  this.buffers.push(data)
}

HashNoConstructor.prototype._final = function () {
  var buf = Buffer.concat(this.buffers)
  var r = this._hash(buf)
  this.buffers = null

  return r
}

function Hash (hash) {
  Base.call(this, 'digest')

  this._hash = hash
}

inherits(Hash, Base)

Hash.prototype._update = function (data) {
  this._hash.update(data)
}

Hash.prototype._final = function () {
  return this._hash.digest()
}

module.exports = function createHash (alg) {
  alg = alg.toLowerCase()
  if (alg === 'md5') return new HashNoConstructor(md5)
  if (alg === 'rmd160' || alg === 'ripemd160') return new Hash(new RIPEMD160())

  return new Hash(sha(alg))
}

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1).Buffer))

/***/ }),
/* 38 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*
 * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
 * Digest Algorithm, as defined in RFC 1321.
 * Version 2.1 Copyright (C) Paul Johnston 1999 - 2002.
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 * Distributed under the BSD License
 * See http://pajhome.org.uk/crypt/md5 for more info.
 */

var makeHash = __webpack_require__(108)

/*
 * Calculate the MD5 of an array of little-endian words, and a bit length
 */
function core_md5 (x, len) {
  /* append padding */
  x[len >> 5] |= 0x80 << ((len) % 32)
  x[(((len + 64) >>> 9) << 4) + 14] = len

  var a = 1732584193
  var b = -271733879
  var c = -1732584194
  var d = 271733878

  for (var i = 0; i < x.length; i += 16) {
    var olda = a
    var oldb = b
    var oldc = c
    var oldd = d

    a = md5_ff(a, b, c, d, x[i + 0], 7, -680876936)
    d = md5_ff(d, a, b, c, x[i + 1], 12, -389564586)
    c = md5_ff(c, d, a, b, x[i + 2], 17, 606105819)
    b = md5_ff(b, c, d, a, x[i + 3], 22, -1044525330)
    a = md5_ff(a, b, c, d, x[i + 4], 7, -176418897)
    d = md5_ff(d, a, b, c, x[i + 5], 12, 1200080426)
    c = md5_ff(c, d, a, b, x[i + 6], 17, -1473231341)
    b = md5_ff(b, c, d, a, x[i + 7], 22, -45705983)
    a = md5_ff(a, b, c, d, x[i + 8], 7, 1770035416)
    d = md5_ff(d, a, b, c, x[i + 9], 12, -1958414417)
    c = md5_ff(c, d, a, b, x[i + 10], 17, -42063)
    b = md5_ff(b, c, d, a, x[i + 11], 22, -1990404162)
    a = md5_ff(a, b, c, d, x[i + 12], 7, 1804603682)
    d = md5_ff(d, a, b, c, x[i + 13], 12, -40341101)
    c = md5_ff(c, d, a, b, x[i + 14], 17, -1502002290)
    b = md5_ff(b, c, d, a, x[i + 15], 22, 1236535329)

    a = md5_gg(a, b, c, d, x[i + 1], 5, -165796510)
    d = md5_gg(d, a, b, c, x[i + 6], 9, -1069501632)
    c = md5_gg(c, d, a, b, x[i + 11], 14, 643717713)
    b = md5_gg(b, c, d, a, x[i + 0], 20, -373897302)
    a = md5_gg(a, b, c, d, x[i + 5], 5, -701558691)
    d = md5_gg(d, a, b, c, x[i + 10], 9, 38016083)
    c = md5_gg(c, d, a, b, x[i + 15], 14, -660478335)
    b = md5_gg(b, c, d, a, x[i + 4], 20, -405537848)
    a = md5_gg(a, b, c, d, x[i + 9], 5, 568446438)
    d = md5_gg(d, a, b, c, x[i + 14], 9, -1019803690)
    c = md5_gg(c, d, a, b, x[i + 3], 14, -187363961)
    b = md5_gg(b, c, d, a, x[i + 8], 20, 1163531501)
    a = md5_gg(a, b, c, d, x[i + 13], 5, -1444681467)
    d = md5_gg(d, a, b, c, x[i + 2], 9, -51403784)
    c = md5_gg(c, d, a, b, x[i + 7], 14, 1735328473)
    b = md5_gg(b, c, d, a, x[i + 12], 20, -1926607734)

    a = md5_hh(a, b, c, d, x[i + 5], 4, -378558)
    d = md5_hh(d, a, b, c, x[i + 8], 11, -2022574463)
    c = md5_hh(c, d, a, b, x[i + 11], 16, 1839030562)
    b = md5_hh(b, c, d, a, x[i + 14], 23, -35309556)
    a = md5_hh(a, b, c, d, x[i + 1], 4, -1530992060)
    d = md5_hh(d, a, b, c, x[i + 4], 11, 1272893353)
    c = md5_hh(c, d, a, b, x[i + 7], 16, -155497632)
    b = md5_hh(b, c, d, a, x[i + 10], 23, -1094730640)
    a = md5_hh(a, b, c, d, x[i + 13], 4, 681279174)
    d = md5_hh(d, a, b, c, x[i + 0], 11, -358537222)
    c = md5_hh(c, d, a, b, x[i + 3], 16, -722521979)
    b = md5_hh(b, c, d, a, x[i + 6], 23, 76029189)
    a = md5_hh(a, b, c, d, x[i + 9], 4, -640364487)
    d = md5_hh(d, a, b, c, x[i + 12], 11, -421815835)
    c = md5_hh(c, d, a, b, x[i + 15], 16, 530742520)
    b = md5_hh(b, c, d, a, x[i + 2], 23, -995338651)

    a = md5_ii(a, b, c, d, x[i + 0], 6, -198630844)
    d = md5_ii(d, a, b, c, x[i + 7], 10, 1126891415)
    c = md5_ii(c, d, a, b, x[i + 14], 15, -1416354905)
    b = md5_ii(b, c, d, a, x[i + 5], 21, -57434055)
    a = md5_ii(a, b, c, d, x[i + 12], 6, 1700485571)
    d = md5_ii(d, a, b, c, x[i + 3], 10, -1894986606)
    c = md5_ii(c, d, a, b, x[i + 10], 15, -1051523)
    b = md5_ii(b, c, d, a, x[i + 1], 21, -2054922799)
    a = md5_ii(a, b, c, d, x[i + 8], 6, 1873313359)
    d = md5_ii(d, a, b, c, x[i + 15], 10, -30611744)
    c = md5_ii(c, d, a, b, x[i + 6], 15, -1560198380)
    b = md5_ii(b, c, d, a, x[i + 13], 21, 1309151649)
    a = md5_ii(a, b, c, d, x[i + 4], 6, -145523070)
    d = md5_ii(d, a, b, c, x[i + 11], 10, -1120210379)
    c = md5_ii(c, d, a, b, x[i + 2], 15, 718787259)
    b = md5_ii(b, c, d, a, x[i + 9], 21, -343485551)

    a = safe_add(a, olda)
    b = safe_add(b, oldb)
    c = safe_add(c, oldc)
    d = safe_add(d, oldd)
  }

  return [a, b, c, d]
}

/*
 * These functions implement the four basic operations the algorithm uses.
 */
function md5_cmn (q, a, b, x, s, t) {
  return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s), b)
}

function md5_ff (a, b, c, d, x, s, t) {
  return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t)
}

function md5_gg (a, b, c, d, x, s, t) {
  return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t)
}

function md5_hh (a, b, c, d, x, s, t) {
  return md5_cmn(b ^ c ^ d, a, b, x, s, t)
}

function md5_ii (a, b, c, d, x, s, t) {
  return md5_cmn(c ^ (b | (~d)), a, b, x, s, t)
}

/*
 * Add integers, wrapping at 2^32. This uses 16-bit operations internally
 * to work around bugs in some JS interpreters.
 */
function safe_add (x, y) {
  var lsw = (x & 0xFFFF) + (y & 0xFFFF)
  var msw = (x >> 16) + (y >> 16) + (lsw >> 16)
  return (msw << 16) | (lsw & 0xFFFF)
}

/*
 * Bitwise rotate a 32-bit number to the left.
 */
function bit_rol (num, cnt) {
  return (num << cnt) | (num >>> (32 - cnt))
}

module.exports = function md5 (buf) {
  return makeHash(buf, core_md5)
}


/***/ }),
/* 39 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(Buffer) {
var inherits = __webpack_require__(3)
var HashBase = __webpack_require__(109)

function RIPEMD160 () {
  HashBase.call(this, 64)

  // state
  this._a = 0x67452301
  this._b = 0xefcdab89
  this._c = 0x98badcfe
  this._d = 0x10325476
  this._e = 0xc3d2e1f0
}

inherits(RIPEMD160, HashBase)

RIPEMD160.prototype._update = function () {
  var m = new Array(16)
  for (var i = 0; i < 16; ++i) m[i] = this._block.readInt32LE(i * 4)

  var al = this._a
  var bl = this._b
  var cl = this._c
  var dl = this._d
  var el = this._e

  // Mj = 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15
  // K = 0x00000000
  // Sj = 11, 14, 15, 12, 5, 8, 7, 9, 11, 13, 14, 15, 6, 7, 9, 8
  al = fn1(al, bl, cl, dl, el, m[0], 0x00000000, 11); cl = rotl(cl, 10)
  el = fn1(el, al, bl, cl, dl, m[1], 0x00000000, 14); bl = rotl(bl, 10)
  dl = fn1(dl, el, al, bl, cl, m[2], 0x00000000, 15); al = rotl(al, 10)
  cl = fn1(cl, dl, el, al, bl, m[3], 0x00000000, 12); el = rotl(el, 10)
  bl = fn1(bl, cl, dl, el, al, m[4], 0x00000000, 5); dl = rotl(dl, 10)
  al = fn1(al, bl, cl, dl, el, m[5], 0x00000000, 8); cl = rotl(cl, 10)
  el = fn1(el, al, bl, cl, dl, m[6], 0x00000000, 7); bl = rotl(bl, 10)
  dl = fn1(dl, el, al, bl, cl, m[7], 0x00000000, 9); al = rotl(al, 10)
  cl = fn1(cl, dl, el, al, bl, m[8], 0x00000000, 11); el = rotl(el, 10)
  bl = fn1(bl, cl, dl, el, al, m[9], 0x00000000, 13); dl = rotl(dl, 10)
  al = fn1(al, bl, cl, dl, el, m[10], 0x00000000, 14); cl = rotl(cl, 10)
  el = fn1(el, al, bl, cl, dl, m[11], 0x00000000, 15); bl = rotl(bl, 10)
  dl = fn1(dl, el, al, bl, cl, m[12], 0x00000000, 6); al = rotl(al, 10)
  cl = fn1(cl, dl, el, al, bl, m[13], 0x00000000, 7); el = rotl(el, 10)
  bl = fn1(bl, cl, dl, el, al, m[14], 0x00000000, 9); dl = rotl(dl, 10)
  al = fn1(al, bl, cl, dl, el, m[15], 0x00000000, 8); cl = rotl(cl, 10)

  // Mj = 7, 4, 13, 1, 10, 6, 15, 3, 12, 0, 9, 5, 2, 14, 11, 8
  // K = 0x5a827999
  // Sj = 7, 6, 8, 13, 11, 9, 7, 15, 7, 12, 15, 9, 11, 7, 13, 12
  el = fn2(el, al, bl, cl, dl, m[7], 0x5a827999, 7); bl = rotl(bl, 10)
  dl = fn2(dl, el, al, bl, cl, m[4], 0x5a827999, 6); al = rotl(al, 10)
  cl = fn2(cl, dl, el, al, bl, m[13], 0x5a827999, 8); el = rotl(el, 10)
  bl = fn2(bl, cl, dl, el, al, m[1], 0x5a827999, 13); dl = rotl(dl, 10)
  al = fn2(al, bl, cl, dl, el, m[10], 0x5a827999, 11); cl = rotl(cl, 10)
  el = fn2(el, al, bl, cl, dl, m[6], 0x5a827999, 9); bl = rotl(bl, 10)
  dl = fn2(dl, el, al, bl, cl, m[15], 0x5a827999, 7); al = rotl(al, 10)
  cl = fn2(cl, dl, el, al, bl, m[3], 0x5a827999, 15); el = rotl(el, 10)
  bl = fn2(bl, cl, dl, el, al, m[12], 0x5a827999, 7); dl = rotl(dl, 10)
  al = fn2(al, bl, cl, dl, el, m[0], 0x5a827999, 12); cl = rotl(cl, 10)
  el = fn2(el, al, bl, cl, dl, m[9], 0x5a827999, 15); bl = rotl(bl, 10)
  dl = fn2(dl, el, al, bl, cl, m[5], 0x5a827999, 9); al = rotl(al, 10)
  cl = fn2(cl, dl, el, al, bl, m[2], 0x5a827999, 11); el = rotl(el, 10)
  bl = fn2(bl, cl, dl, el, al, m[14], 0x5a827999, 7); dl = rotl(dl, 10)
  al = fn2(al, bl, cl, dl, el, m[11], 0x5a827999, 13); cl = rotl(cl, 10)
  el = fn2(el, al, bl, cl, dl, m[8], 0x5a827999, 12); bl = rotl(bl, 10)

  // Mj = 3, 10, 14, 4, 9, 15, 8, 1, 2, 7, 0, 6, 13, 11, 5, 12
  // K = 0x6ed9eba1
  // Sj = 11, 13, 6, 7, 14, 9, 13, 15, 14, 8, 13, 6, 5, 12, 7, 5
  dl = fn3(dl, el, al, bl, cl, m[3], 0x6ed9eba1, 11); al = rotl(al, 10)
  cl = fn3(cl, dl, el, al, bl, m[10], 0x6ed9eba1, 13); el = rotl(el, 10)
  bl = fn3(bl, cl, dl, el, al, m[14], 0x6ed9eba1, 6); dl = rotl(dl, 10)
  al = fn3(al, bl, cl, dl, el, m[4], 0x6ed9eba1, 7); cl = rotl(cl, 10)
  el = fn3(el, al, bl, cl, dl, m[9], 0x6ed9eba1, 14); bl = rotl(bl, 10)
  dl = fn3(dl, el, al, bl, cl, m[15], 0x6ed9eba1, 9); al = rotl(al, 10)
  cl = fn3(cl, dl, el, al, bl, m[8], 0x6ed9eba1, 13); el = rotl(el, 10)
  bl = fn3(bl, cl, dl, el, al, m[1], 0x6ed9eba1, 15); dl = rotl(dl, 10)
  al = fn3(al, bl, cl, dl, el, m[2], 0x6ed9eba1, 14); cl = rotl(cl, 10)
  el = fn3(el, al, bl, cl, dl, m[7], 0x6ed9eba1, 8); bl = rotl(bl, 10)
  dl = fn3(dl, el, al, bl, cl, m[0], 0x6ed9eba1, 13); al = rotl(al, 10)
  cl = fn3(cl, dl, el, al, bl, m[6], 0x6ed9eba1, 6); el = rotl(el, 10)
  bl = fn3(bl, cl, dl, el, al, m[13], 0x6ed9eba1, 5); dl = rotl(dl, 10)
  al = fn3(al, bl, cl, dl, el, m[11], 0x6ed9eba1, 12); cl = rotl(cl, 10)
  el = fn3(el, al, bl, cl, dl, m[5], 0x6ed9eba1, 7); bl = rotl(bl, 10)
  dl = fn3(dl, el, al, bl, cl, m[12], 0x6ed9eba1, 5); al = rotl(al, 10)

  // Mj = 1, 9, 11, 10, 0, 8, 12, 4, 13, 3, 7, 15, 14, 5, 6, 2
  // K = 0x8f1bbcdc
  // Sj = 11, 12, 14, 15, 14, 15, 9, 8, 9, 14, 5, 6, 8, 6, 5, 12
  cl = fn4(cl, dl, el, al, bl, m[1], 0x8f1bbcdc, 11); el = rotl(el, 10)
  bl = fn4(bl, cl, dl, el, al, m[9], 0x8f1bbcdc, 12); dl = rotl(dl, 10)
  al = fn4(al, bl, cl, dl, el, m[11], 0x8f1bbcdc, 14); cl = rotl(cl, 10)
  el = fn4(el, al, bl, cl, dl, m[10], 0x8f1bbcdc, 15); bl = rotl(bl, 10)
  dl = fn4(dl, el, al, bl, cl, m[0], 0x8f1bbcdc, 14); al = rotl(al, 10)
  cl = fn4(cl, dl, el, al, bl, m[8], 0x8f1bbcdc, 15); el = rotl(el, 10)
  bl = fn4(bl, cl, dl, el, al, m[12], 0x8f1bbcdc, 9); dl = rotl(dl, 10)
  al = fn4(al, bl, cl, dl, el, m[4], 0x8f1bbcdc, 8); cl = rotl(cl, 10)
  el = fn4(el, al, bl, cl, dl, m[13], 0x8f1bbcdc, 9); bl = rotl(bl, 10)
  dl = fn4(dl, el, al, bl, cl, m[3], 0x8f1bbcdc, 14); al = rotl(al, 10)
  cl = fn4(cl, dl, el, al, bl, m[7], 0x8f1bbcdc, 5); el = rotl(el, 10)
  bl = fn4(bl, cl, dl, el, al, m[15], 0x8f1bbcdc, 6); dl = rotl(dl, 10)
  al = fn4(al, bl, cl, dl, el, m[14], 0x8f1bbcdc, 8); cl = rotl(cl, 10)
  el = fn4(el, al, bl, cl, dl, m[5], 0x8f1bbcdc, 6); bl = rotl(bl, 10)
  dl = fn4(dl, el, al, bl, cl, m[6], 0x8f1bbcdc, 5); al = rotl(al, 10)
  cl = fn4(cl, dl, el, al, bl, m[2], 0x8f1bbcdc, 12); el = rotl(el, 10)

  // Mj = 4, 0, 5, 9, 7, 12, 2, 10, 14, 1, 3, 8, 11, 6, 15, 13
  // K = 0xa953fd4e
  // Sj = 9, 15, 5, 11, 6, 8, 13, 12, 5, 12, 13, 14, 11, 8, 5, 6
  bl = fn5(bl, cl, dl, el, al, m[4], 0xa953fd4e, 9); dl = rotl(dl, 10)
  al = fn5(al, bl, cl, dl, el, m[0], 0xa953fd4e, 15); cl = rotl(cl, 10)
  el = fn5(el, al, bl, cl, dl, m[5], 0xa953fd4e, 5); bl = rotl(bl, 10)
  dl = fn5(dl, el, al, bl, cl, m[9], 0xa953fd4e, 11); al = rotl(al, 10)
  cl = fn5(cl, dl, el, al, bl, m[7], 0xa953fd4e, 6); el = rotl(el, 10)
  bl = fn5(bl, cl, dl, el, al, m[12], 0xa953fd4e, 8); dl = rotl(dl, 10)
  al = fn5(al, bl, cl, dl, el, m[2], 0xa953fd4e, 13); cl = rotl(cl, 10)
  el = fn5(el, al, bl, cl, dl, m[10], 0xa953fd4e, 12); bl = rotl(bl, 10)
  dl = fn5(dl, el, al, bl, cl, m[14], 0xa953fd4e, 5); al = rotl(al, 10)
  cl = fn5(cl, dl, el, al, bl, m[1], 0xa953fd4e, 12); el = rotl(el, 10)
  bl = fn5(bl, cl, dl, el, al, m[3], 0xa953fd4e, 13); dl = rotl(dl, 10)
  al = fn5(al, bl, cl, dl, el, m[8], 0xa953fd4e, 14); cl = rotl(cl, 10)
  el = fn5(el, al, bl, cl, dl, m[11], 0xa953fd4e, 11); bl = rotl(bl, 10)
  dl = fn5(dl, el, al, bl, cl, m[6], 0xa953fd4e, 8); al = rotl(al, 10)
  cl = fn5(cl, dl, el, al, bl, m[15], 0xa953fd4e, 5); el = rotl(el, 10)
  bl = fn5(bl, cl, dl, el, al, m[13], 0xa953fd4e, 6); dl = rotl(dl, 10)

  var ar = this._a
  var br = this._b
  var cr = this._c
  var dr = this._d
  var er = this._e

  // M'j = 5, 14, 7, 0, 9, 2, 11, 4, 13, 6, 15, 8, 1, 10, 3, 12
  // K' = 0x50a28be6
  // S'j = 8, 9, 9, 11, 13, 15, 15, 5, 7, 7, 8, 11, 14, 14, 12, 6
  ar = fn5(ar, br, cr, dr, er, m[5], 0x50a28be6, 8); cr = rotl(cr, 10)
  er = fn5(er, ar, br, cr, dr, m[14], 0x50a28be6, 9); br = rotl(br, 10)
  dr = fn5(dr, er, ar, br, cr, m[7], 0x50a28be6, 9); ar = rotl(ar, 10)
  cr = fn5(cr, dr, er, ar, br, m[0], 0x50a28be6, 11); er = rotl(er, 10)
  br = fn5(br, cr, dr, er, ar, m[9], 0x50a28be6, 13); dr = rotl(dr, 10)
  ar = fn5(ar, br, cr, dr, er, m[2], 0x50a28be6, 15); cr = rotl(cr, 10)
  er = fn5(er, ar, br, cr, dr, m[11], 0x50a28be6, 15); br = rotl(br, 10)
  dr = fn5(dr, er, ar, br, cr, m[4], 0x50a28be6, 5); ar = rotl(ar, 10)
  cr = fn5(cr, dr, er, ar, br, m[13], 0x50a28be6, 7); er = rotl(er, 10)
  br = fn5(br, cr, dr, er, ar, m[6], 0x50a28be6, 7); dr = rotl(dr, 10)
  ar = fn5(ar, br, cr, dr, er, m[15], 0x50a28be6, 8); cr = rotl(cr, 10)
  er = fn5(er, ar, br, cr, dr, m[8], 0x50a28be6, 11); br = rotl(br, 10)
  dr = fn5(dr, er, ar, br, cr, m[1], 0x50a28be6, 14); ar = rotl(ar, 10)
  cr = fn5(cr, dr, er, ar, br, m[10], 0x50a28be6, 14); er = rotl(er, 10)
  br = fn5(br, cr, dr, er, ar, m[3], 0x50a28be6, 12); dr = rotl(dr, 10)
  ar = fn5(ar, br, cr, dr, er, m[12], 0x50a28be6, 6); cr = rotl(cr, 10)

  // M'j = 6, 11, 3, 7, 0, 13, 5, 10, 14, 15, 8, 12, 4, 9, 1, 2
  // K' = 0x5c4dd124
  // S'j = 9, 13, 15, 7, 12, 8, 9, 11, 7, 7, 12, 7, 6, 15, 13, 11
  er = fn4(er, ar, br, cr, dr, m[6], 0x5c4dd124, 9); br = rotl(br, 10)
  dr = fn4(dr, er, ar, br, cr, m[11], 0x5c4dd124, 13); ar = rotl(ar, 10)
  cr = fn4(cr, dr, er, ar, br, m[3], 0x5c4dd124, 15); er = rotl(er, 10)
  br = fn4(br, cr, dr, er, ar, m[7], 0x5c4dd124, 7); dr = rotl(dr, 10)
  ar = fn4(ar, br, cr, dr, er, m[0], 0x5c4dd124, 12); cr = rotl(cr, 10)
  er = fn4(er, ar, br, cr, dr, m[13], 0x5c4dd124, 8); br = rotl(br, 10)
  dr = fn4(dr, er, ar, br, cr, m[5], 0x5c4dd124, 9); ar = rotl(ar, 10)
  cr = fn4(cr, dr, er, ar, br, m[10], 0x5c4dd124, 11); er = rotl(er, 10)
  br = fn4(br, cr, dr, er, ar, m[14], 0x5c4dd124, 7); dr = rotl(dr, 10)
  ar = fn4(ar, br, cr, dr, er, m[15], 0x5c4dd124, 7); cr = rotl(cr, 10)
  er = fn4(er, ar, br, cr, dr, m[8], 0x5c4dd124, 12); br = rotl(br, 10)
  dr = fn4(dr, er, ar, br, cr, m[12], 0x5c4dd124, 7); ar = rotl(ar, 10)
  cr = fn4(cr, dr, er, ar, br, m[4], 0x5c4dd124, 6); er = rotl(er, 10)
  br = fn4(br, cr, dr, er, ar, m[9], 0x5c4dd124, 15); dr = rotl(dr, 10)
  ar = fn4(ar, br, cr, dr, er, m[1], 0x5c4dd124, 13); cr = rotl(cr, 10)
  er = fn4(er, ar, br, cr, dr, m[2], 0x5c4dd124, 11); br = rotl(br, 10)

  // M'j = 15, 5, 1, 3, 7, 14, 6, 9, 11, 8, 12, 2, 10, 0, 4, 13
  // K' = 0x6d703ef3
  // S'j = 9, 7, 15, 11, 8, 6, 6, 14, 12, 13, 5, 14, 13, 13, 7, 5
  dr = fn3(dr, er, ar, br, cr, m[15], 0x6d703ef3, 9); ar = rotl(ar, 10)
  cr = fn3(cr, dr, er, ar, br, m[5], 0x6d703ef3, 7); er = rotl(er, 10)
  br = fn3(br, cr, dr, er, ar, m[1], 0x6d703ef3, 15); dr = rotl(dr, 10)
  ar = fn3(ar, br, cr, dr, er, m[3], 0x6d703ef3, 11); cr = rotl(cr, 10)
  er = fn3(er, ar, br, cr, dr, m[7], 0x6d703ef3, 8); br = rotl(br, 10)
  dr = fn3(dr, er, ar, br, cr, m[14], 0x6d703ef3, 6); ar = rotl(ar, 10)
  cr = fn3(cr, dr, er, ar, br, m[6], 0x6d703ef3, 6); er = rotl(er, 10)
  br = fn3(br, cr, dr, er, ar, m[9], 0x6d703ef3, 14); dr = rotl(dr, 10)
  ar = fn3(ar, br, cr, dr, er, m[11], 0x6d703ef3, 12); cr = rotl(cr, 10)
  er = fn3(er, ar, br, cr, dr, m[8], 0x6d703ef3, 13); br = rotl(br, 10)
  dr = fn3(dr, er, ar, br, cr, m[12], 0x6d703ef3, 5); ar = rotl(ar, 10)
  cr = fn3(cr, dr, er, ar, br, m[2], 0x6d703ef3, 14); er = rotl(er, 10)
  br = fn3(br, cr, dr, er, ar, m[10], 0x6d703ef3, 13); dr = rotl(dr, 10)
  ar = fn3(ar, br, cr, dr, er, m[0], 0x6d703ef3, 13); cr = rotl(cr, 10)
  er = fn3(er, ar, br, cr, dr, m[4], 0x6d703ef3, 7); br = rotl(br, 10)
  dr = fn3(dr, er, ar, br, cr, m[13], 0x6d703ef3, 5); ar = rotl(ar, 10)

  // M'j = 8, 6, 4, 1, 3, 11, 15, 0, 5, 12, 2, 13, 9, 7, 10, 14
  // K' = 0x7a6d76e9
  // S'j = 15, 5, 8, 11, 14, 14, 6, 14, 6, 9, 12, 9, 12, 5, 15, 8
  cr = fn2(cr, dr, er, ar, br, m[8], 0x7a6d76e9, 15); er = rotl(er, 10)
  br = fn2(br, cr, dr, er, ar, m[6], 0x7a6d76e9, 5); dr = rotl(dr, 10)
  ar = fn2(ar, br, cr, dr, er, m[4], 0x7a6d76e9, 8); cr = rotl(cr, 10)
  er = fn2(er, ar, br, cr, dr, m[1], 0x7a6d76e9, 11); br = rotl(br, 10)
  dr = fn2(dr, er, ar, br, cr, m[3], 0x7a6d76e9, 14); ar = rotl(ar, 10)
  cr = fn2(cr, dr, er, ar, br, m[11], 0x7a6d76e9, 14); er = rotl(er, 10)
  br = fn2(br, cr, dr, er, ar, m[15], 0x7a6d76e9, 6); dr = rotl(dr, 10)
  ar = fn2(ar, br, cr, dr, er, m[0], 0x7a6d76e9, 14); cr = rotl(cr, 10)
  er = fn2(er, ar, br, cr, dr, m[5], 0x7a6d76e9, 6); br = rotl(br, 10)
  dr = fn2(dr, er, ar, br, cr, m[12], 0x7a6d76e9, 9); ar = rotl(ar, 10)
  cr = fn2(cr, dr, er, ar, br, m[2], 0x7a6d76e9, 12); er = rotl(er, 10)
  br = fn2(br, cr, dr, er, ar, m[13], 0x7a6d76e9, 9); dr = rotl(dr, 10)
  ar = fn2(ar, br, cr, dr, er, m[9], 0x7a6d76e9, 12); cr = rotl(cr, 10)
  er = fn2(er, ar, br, cr, dr, m[7], 0x7a6d76e9, 5); br = rotl(br, 10)
  dr = fn2(dr, er, ar, br, cr, m[10], 0x7a6d76e9, 15); ar = rotl(ar, 10)
  cr = fn2(cr, dr, er, ar, br, m[14], 0x7a6d76e9, 8); er = rotl(er, 10)

  // M'j = 12, 15, 10, 4, 1, 5, 8, 7, 6, 2, 13, 14, 0, 3, 9, 11
  // K' = 0x00000000
  // S'j = 8, 5, 12, 9, 12, 5, 14, 6, 8, 13, 6, 5, 15, 13, 11, 11
  br = fn1(br, cr, dr, er, ar, m[12], 0x00000000, 8); dr = rotl(dr, 10)
  ar = fn1(ar, br, cr, dr, er, m[15], 0x00000000, 5); cr = rotl(cr, 10)
  er = fn1(er, ar, br, cr, dr, m[10], 0x00000000, 12); br = rotl(br, 10)
  dr = fn1(dr, er, ar, br, cr, m[4], 0x00000000, 9); ar = rotl(ar, 10)
  cr = fn1(cr, dr, er, ar, br, m[1], 0x00000000, 12); er = rotl(er, 10)
  br = fn1(br, cr, dr, er, ar, m[5], 0x00000000, 5); dr = rotl(dr, 10)
  ar = fn1(ar, br, cr, dr, er, m[8], 0x00000000, 14); cr = rotl(cr, 10)
  er = fn1(er, ar, br, cr, dr, m[7], 0x00000000, 6); br = rotl(br, 10)
  dr = fn1(dr, er, ar, br, cr, m[6], 0x00000000, 8); ar = rotl(ar, 10)
  cr = fn1(cr, dr, er, ar, br, m[2], 0x00000000, 13); er = rotl(er, 10)
  br = fn1(br, cr, dr, er, ar, m[13], 0x00000000, 6); dr = rotl(dr, 10)
  ar = fn1(ar, br, cr, dr, er, m[14], 0x00000000, 5); cr = rotl(cr, 10)
  er = fn1(er, ar, br, cr, dr, m[0], 0x00000000, 15); br = rotl(br, 10)
  dr = fn1(dr, er, ar, br, cr, m[3], 0x00000000, 13); ar = rotl(ar, 10)
  cr = fn1(cr, dr, er, ar, br, m[9], 0x00000000, 11); er = rotl(er, 10)
  br = fn1(br, cr, dr, er, ar, m[11], 0x00000000, 11); dr = rotl(dr, 10)

  // change state
  var t = (this._b + cl + dr) | 0
  this._b = (this._c + dl + er) | 0
  this._c = (this._d + el + ar) | 0
  this._d = (this._e + al + br) | 0
  this._e = (this._a + bl + cr) | 0
  this._a = t
}

RIPEMD160.prototype._digest = function () {
  // create padding and handle blocks
  this._block[this._blockOffset++] = 0x80
  if (this._blockOffset > 56) {
    this._block.fill(0, this._blockOffset, 64)
    this._update()
    this._blockOffset = 0
  }

  this._block.fill(0, this._blockOffset, 56)
  this._block.writeUInt32LE(this._length[0], 56)
  this._block.writeUInt32LE(this._length[1], 60)
  this._update()

  // produce result
  var buffer = new Buffer(20)
  buffer.writeInt32LE(this._a, 0)
  buffer.writeInt32LE(this._b, 4)
  buffer.writeInt32LE(this._c, 8)
  buffer.writeInt32LE(this._d, 12)
  buffer.writeInt32LE(this._e, 16)
  return buffer
}

function rotl (x, n) {
  return (x << n) | (x >>> (32 - n))
}

function fn1 (a, b, c, d, e, m, k, s) {
  return (rotl((a + (b ^ c ^ d) + m + k) | 0, s) + e) | 0
}

function fn2 (a, b, c, d, e, m, k, s) {
  return (rotl((a + ((b & c) | ((~b) & d)) + m + k) | 0, s) + e) | 0
}

function fn3 (a, b, c, d, e, m, k, s) {
  return (rotl((a + ((b | (~c)) ^ d) + m + k) | 0, s) + e) | 0
}

function fn4 (a, b, c, d, e, m, k, s) {
  return (rotl((a + ((b & d) | (c & (~d))) + m + k) | 0, s) + e) | 0
}

function fn5 (a, b, c, d, e, m, k, s) {
  return (rotl((a + (b ^ (c | (~d))) + m + k) | 0, s) + e) | 0
}

module.exports = RIPEMD160

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1).Buffer))

/***/ }),
/* 40 */
/***/ (function(module, exports, __webpack_require__) {

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

module.exports = Stream;

var EE = __webpack_require__(18).EventEmitter;
var inherits = __webpack_require__(3);

inherits(Stream, EE);
Stream.Readable = __webpack_require__(19);
Stream.Writable = __webpack_require__(116);
Stream.Duplex = __webpack_require__(117);
Stream.Transform = __webpack_require__(118);
Stream.PassThrough = __webpack_require__(119);

// Backwards-compat with node 0.4.x
Stream.Stream = Stream;



// old-style streams.  Note that the pipe method (the only relevant
// part of this class) is overridden in the Readable class.

function Stream() {
  EE.call(this);
}

Stream.prototype.pipe = function(dest, options) {
  var source = this;

  function ondata(chunk) {
    if (dest.writable) {
      if (false === dest.write(chunk) && source.pause) {
        source.pause();
      }
    }
  }

  source.on('data', ondata);

  function ondrain() {
    if (source.readable && source.resume) {
      source.resume();
    }
  }

  dest.on('drain', ondrain);

  // If the 'end' option is not supplied, dest.end() will be called when
  // source gets the 'end' or 'close' events.  Only dest.end() once.
  if (!dest._isStdio && (!options || options.end !== false)) {
    source.on('end', onend);
    source.on('close', onclose);
  }

  var didOnEnd = false;
  function onend() {
    if (didOnEnd) return;
    didOnEnd = true;

    dest.end();
  }


  function onclose() {
    if (didOnEnd) return;
    didOnEnd = true;

    if (typeof dest.destroy === 'function') dest.destroy();
  }

  // don't leave dangling pipes when there are errors.
  function onerror(er) {
    cleanup();
    if (EE.listenerCount(this, 'error') === 0) {
      throw er; // Unhandled stream error in pipe.
    }
  }

  source.on('error', onerror);
  dest.on('error', onerror);

  // remove all the event listeners that were added.
  function cleanup() {
    source.removeListener('data', ondata);
    dest.removeListener('drain', ondrain);

    source.removeListener('end', onend);
    source.removeListener('close', onclose);

    source.removeListener('error', onerror);
    dest.removeListener('error', onerror);

    source.removeListener('end', cleanup);
    source.removeListener('close', cleanup);

    dest.removeListener('close', cleanup);
  }

  source.on('end', cleanup);
  source.on('close', cleanup);

  dest.on('close', cleanup);

  dest.emit('pipe', source);

  // Allow for unix-like usage: A.pipe(B).pipe(C)
  return dest;
};


/***/ }),
/* 41 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(global, process) {// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.



/*<replacement>*/

var processNextTick = __webpack_require__(16);
/*</replacement>*/

module.exports = Readable;

/*<replacement>*/
var isArray = __webpack_require__(36);
/*</replacement>*/

/*<replacement>*/
var Duplex;
/*</replacement>*/

Readable.ReadableState = ReadableState;

/*<replacement>*/
var EE = __webpack_require__(18).EventEmitter;

var EElistenerCount = function (emitter, type) {
  return emitter.listeners(type).length;
};
/*</replacement>*/

/*<replacement>*/
var Stream = __webpack_require__(42);
/*</replacement>*/

// TODO(bmeurer): Change this back to const once hole checks are
// properly optimized away early in Ignition+TurboFan.
/*<replacement>*/
var Buffer = __webpack_require__(2).Buffer;
var OurUint8Array = global.Uint8Array || function () {};
function _uint8ArrayToBuffer(chunk) {
  return Buffer.from(chunk);
}
function _isUint8Array(obj) {
  return Buffer.isBuffer(obj) || obj instanceof OurUint8Array;
}
/*</replacement>*/

/*<replacement>*/
var util = __webpack_require__(14);
util.inherits = __webpack_require__(3);
/*</replacement>*/

/*<replacement>*/
var debugUtil = __webpack_require__(110);
var debug = void 0;
if (debugUtil && debugUtil.debuglog) {
  debug = debugUtil.debuglog('stream');
} else {
  debug = function () {};
}
/*</replacement>*/

var BufferList = __webpack_require__(111);
var destroyImpl = __webpack_require__(43);
var StringDecoder;

util.inherits(Readable, Stream);

var kProxyEvents = ['error', 'close', 'destroy', 'pause', 'resume'];

function prependListener(emitter, event, fn) {
  // Sadly this is not cacheable as some libraries bundle their own
  // event emitter implementation with them.
  if (typeof emitter.prependListener === 'function') {
    return emitter.prependListener(event, fn);
  } else {
    // This is a hack to make sure that our error handler is attached before any
    // userland ones.  NEVER DO THIS. This is here only because this code needs
    // to continue to work with older versions of Node.js that do not include
    // the prependListener() method. The goal is to eventually remove this hack.
    if (!emitter._events || !emitter._events[event]) emitter.on(event, fn);else if (isArray(emitter._events[event])) emitter._events[event].unshift(fn);else emitter._events[event] = [fn, emitter._events[event]];
  }
}

function ReadableState(options, stream) {
  Duplex = Duplex || __webpack_require__(8);

  options = options || {};

  // object stream flag. Used to make read(n) ignore n and to
  // make all the buffer merging and length checks go away
  this.objectMode = !!options.objectMode;

  if (stream instanceof Duplex) this.objectMode = this.objectMode || !!options.readableObjectMode;

  // the point at which it stops calling _read() to fill the buffer
  // Note: 0 is a valid value, means "don't call _read preemptively ever"
  var hwm = options.highWaterMark;
  var defaultHwm = this.objectMode ? 16 : 16 * 1024;
  this.highWaterMark = hwm || hwm === 0 ? hwm : defaultHwm;

  // cast to ints.
  this.highWaterMark = Math.floor(this.highWaterMark);

  // A linked list is used to store data chunks instead of an array because the
  // linked list can remove elements from the beginning faster than
  // array.shift()
  this.buffer = new BufferList();
  this.length = 0;
  this.pipes = null;
  this.pipesCount = 0;
  this.flowing = null;
  this.ended = false;
  this.endEmitted = false;
  this.reading = false;

  // a flag to be able to tell if the event 'readable'/'data' is emitted
  // immediately, or on a later tick.  We set this to true at first, because
  // any actions that shouldn't happen until "later" should generally also
  // not happen before the first read call.
  this.sync = true;

  // whenever we return null, then we set a flag to say
  // that we're awaiting a 'readable' event emission.
  this.needReadable = false;
  this.emittedReadable = false;
  this.readableListening = false;
  this.resumeScheduled = false;

  // has it been destroyed
  this.destroyed = false;

  // Crypto is kind of old and crusty.  Historically, its default string
  // encoding is 'binary' so we have to make this configurable.
  // Everything else in the universe uses 'utf8', though.
  this.defaultEncoding = options.defaultEncoding || 'utf8';

  // the number of writers that are awaiting a drain event in .pipe()s
  this.awaitDrain = 0;

  // if true, a maybeReadMore has been scheduled
  this.readingMore = false;

  this.decoder = null;
  this.encoding = null;
  if (options.encoding) {
    if (!StringDecoder) StringDecoder = __webpack_require__(21).StringDecoder;
    this.decoder = new StringDecoder(options.encoding);
    this.encoding = options.encoding;
  }
}

function Readable(options) {
  Duplex = Duplex || __webpack_require__(8);

  if (!(this instanceof Readable)) return new Readable(options);

  this._readableState = new ReadableState(options, this);

  // legacy
  this.readable = true;

  if (options) {
    if (typeof options.read === 'function') this._read = options.read;

    if (typeof options.destroy === 'function') this._destroy = options.destroy;
  }

  Stream.call(this);
}

Object.defineProperty(Readable.prototype, 'destroyed', {
  get: function () {
    if (this._readableState === undefined) {
      return false;
    }
    return this._readableState.destroyed;
  },
  set: function (value) {
    // we ignore the value if the stream
    // has not been initialized yet
    if (!this._readableState) {
      return;
    }

    // backward compatibility, the user is explicitly
    // managing destroyed
    this._readableState.destroyed = value;
  }
});

Readable.prototype.destroy = destroyImpl.destroy;
Readable.prototype._undestroy = destroyImpl.undestroy;
Readable.prototype._destroy = function (err, cb) {
  this.push(null);
  cb(err);
};

// Manually shove something into the read() buffer.
// This returns true if the highWaterMark has not been hit yet,
// similar to how Writable.write() returns true if you should
// write() some more.
Readable.prototype.push = function (chunk, encoding) {
  var state = this._readableState;
  var skipChunkCheck;

  if (!state.objectMode) {
    if (typeof chunk === 'string') {
      encoding = encoding || state.defaultEncoding;
      if (encoding !== state.encoding) {
        chunk = Buffer.from(chunk, encoding);
        encoding = '';
      }
      skipChunkCheck = true;
    }
  } else {
    skipChunkCheck = true;
  }

  return readableAddChunk(this, chunk, encoding, false, skipChunkCheck);
};

// Unshift should *always* be something directly out of read()
Readable.prototype.unshift = function (chunk) {
  return readableAddChunk(this, chunk, null, true, false);
};

function readableAddChunk(stream, chunk, encoding, addToFront, skipChunkCheck) {
  var state = stream._readableState;
  if (chunk === null) {
    state.reading = false;
    onEofChunk(stream, state);
  } else {
    var er;
    if (!skipChunkCheck) er = chunkInvalid(state, chunk);
    if (er) {
      stream.emit('error', er);
    } else if (state.objectMode || chunk && chunk.length > 0) {
      if (typeof chunk !== 'string' && !state.objectMode && Object.getPrototypeOf(chunk) !== Buffer.prototype) {
        chunk = _uint8ArrayToBuffer(chunk);
      }

      if (addToFront) {
        if (state.endEmitted) stream.emit('error', new Error('stream.unshift() after end event'));else addChunk(stream, state, chunk, true);
      } else if (state.ended) {
        stream.emit('error', new Error('stream.push() after EOF'));
      } else {
        state.reading = false;
        if (state.decoder && !encoding) {
          chunk = state.decoder.write(chunk);
          if (state.objectMode || chunk.length !== 0) addChunk(stream, state, chunk, false);else maybeReadMore(stream, state);
        } else {
          addChunk(stream, state, chunk, false);
        }
      }
    } else if (!addToFront) {
      state.reading = false;
    }
  }

  return needMoreData(state);
}

function addChunk(stream, state, chunk, addToFront) {
  if (state.flowing && state.length === 0 && !state.sync) {
    stream.emit('data', chunk);
    stream.read(0);
  } else {
    // update the buffer info.
    state.length += state.objectMode ? 1 : chunk.length;
    if (addToFront) state.buffer.unshift(chunk);else state.buffer.push(chunk);

    if (state.needReadable) emitReadable(stream);
  }
  maybeReadMore(stream, state);
}

function chunkInvalid(state, chunk) {
  var er;
  if (!_isUint8Array(chunk) && typeof chunk !== 'string' && chunk !== undefined && !state.objectMode) {
    er = new TypeError('Invalid non-string/buffer chunk');
  }
  return er;
}

// if it's past the high water mark, we can push in some more.
// Also, if we have no data yet, we can stand some
// more bytes.  This is to work around cases where hwm=0,
// such as the repl.  Also, if the push() triggered a
// readable event, and the user called read(largeNumber) such that
// needReadable was set, then we ought to push more, so that another
// 'readable' event will be triggered.
function needMoreData(state) {
  return !state.ended && (state.needReadable || state.length < state.highWaterMark || state.length === 0);
}

Readable.prototype.isPaused = function () {
  return this._readableState.flowing === false;
};

// backwards compatibility.
Readable.prototype.setEncoding = function (enc) {
  if (!StringDecoder) StringDecoder = __webpack_require__(21).StringDecoder;
  this._readableState.decoder = new StringDecoder(enc);
  this._readableState.encoding = enc;
  return this;
};

// Don't raise the hwm > 8MB
var MAX_HWM = 0x800000;
function computeNewHighWaterMark(n) {
  if (n >= MAX_HWM) {
    n = MAX_HWM;
  } else {
    // Get the next highest power of 2 to prevent increasing hwm excessively in
    // tiny amounts
    n--;
    n |= n >>> 1;
    n |= n >>> 2;
    n |= n >>> 4;
    n |= n >>> 8;
    n |= n >>> 16;
    n++;
  }
  return n;
}

// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function howMuchToRead(n, state) {
  if (n <= 0 || state.length === 0 && state.ended) return 0;
  if (state.objectMode) return 1;
  if (n !== n) {
    // Only flow one buffer at a time
    if (state.flowing && state.length) return state.buffer.head.data.length;else return state.length;
  }
  // If we're asking for more than the current hwm, then raise the hwm.
  if (n > state.highWaterMark) state.highWaterMark = computeNewHighWaterMark(n);
  if (n <= state.length) return n;
  // Don't have enough
  if (!state.ended) {
    state.needReadable = true;
    return 0;
  }
  return state.length;
}

// you can override either this method, or the async _read(n) below.
Readable.prototype.read = function (n) {
  debug('read', n);
  n = parseInt(n, 10);
  var state = this._readableState;
  var nOrig = n;

  if (n !== 0) state.emittedReadable = false;

  // if we're doing read(0) to trigger a readable event, but we
  // already have a bunch of data in the buffer, then just trigger
  // the 'readable' event and move on.
  if (n === 0 && state.needReadable && (state.length >= state.highWaterMark || state.ended)) {
    debug('read: emitReadable', state.length, state.ended);
    if (state.length === 0 && state.ended) endReadable(this);else emitReadable(this);
    return null;
  }

  n = howMuchToRead(n, state);

  // if we've ended, and we're now clear, then finish it up.
  if (n === 0 && state.ended) {
    if (state.length === 0) endReadable(this);
    return null;
  }

  // All the actual chunk generation logic needs to be
  // *below* the call to _read.  The reason is that in certain
  // synthetic stream cases, such as passthrough streams, _read
  // may be a completely synchronous operation which may change
  // the state of the read buffer, providing enough data when
  // before there was *not* enough.
  //
  // So, the steps are:
  // 1. Figure out what the state of things will be after we do
  // a read from the buffer.
  //
  // 2. If that resulting state will trigger a _read, then call _read.
  // Note that this may be asynchronous, or synchronous.  Yes, it is
  // deeply ugly to write APIs this way, but that still doesn't mean
  // that the Readable class should behave improperly, as streams are
  // designed to be sync/async agnostic.
  // Take note if the _read call is sync or async (ie, if the read call
  // has returned yet), so that we know whether or not it's safe to emit
  // 'readable' etc.
  //
  // 3. Actually pull the requested chunks out of the buffer and return.

  // if we need a readable event, then we need to do some reading.
  var doRead = state.needReadable;
  debug('need readable', doRead);

  // if we currently have less than the highWaterMark, then also read some
  if (state.length === 0 || state.length - n < state.highWaterMark) {
    doRead = true;
    debug('length less than watermark', doRead);
  }

  // however, if we've ended, then there's no point, and if we're already
  // reading, then it's unnecessary.
  if (state.ended || state.reading) {
    doRead = false;
    debug('reading or ended', doRead);
  } else if (doRead) {
    debug('do read');
    state.reading = true;
    state.sync = true;
    // if the length is currently zero, then we *need* a readable event.
    if (state.length === 0) state.needReadable = true;
    // call internal read method
    this._read(state.highWaterMark);
    state.sync = false;
    // If _read pushed data synchronously, then `reading` will be false,
    // and we need to re-evaluate how much data we can return to the user.
    if (!state.reading) n = howMuchToRead(nOrig, state);
  }

  var ret;
  if (n > 0) ret = fromList(n, state);else ret = null;

  if (ret === null) {
    state.needReadable = true;
    n = 0;
  } else {
    state.length -= n;
  }

  if (state.length === 0) {
    // If we have nothing in the buffer, then we want to know
    // as soon as we *do* get something into the buffer.
    if (!state.ended) state.needReadable = true;

    // If we tried to read() past the EOF, then emit end on the next tick.
    if (nOrig !== n && state.ended) endReadable(this);
  }

  if (ret !== null) this.emit('data', ret);

  return ret;
};

function onEofChunk(stream, state) {
  if (state.ended) return;
  if (state.decoder) {
    var chunk = state.decoder.end();
    if (chunk && chunk.length) {
      state.buffer.push(chunk);
      state.length += state.objectMode ? 1 : chunk.length;
    }
  }
  state.ended = true;

  // emit 'readable' now to make sure it gets picked up.
  emitReadable(stream);
}

// Don't emit readable right away in sync mode, because this can trigger
// another read() call => stack overflow.  This way, it might trigger
// a nextTick recursion warning, but that's not so bad.
function emitReadable(stream) {
  var state = stream._readableState;
  state.needReadable = false;
  if (!state.emittedReadable) {
    debug('emitReadable', state.flowing);
    state.emittedReadable = true;
    if (state.sync) processNextTick(emitReadable_, stream);else emitReadable_(stream);
  }
}

function emitReadable_(stream) {
  debug('emit readable');
  stream.emit('readable');
  flow(stream);
}

// at this point, the user has presumably seen the 'readable' event,
// and called read() to consume some data.  that may have triggered
// in turn another _read(n) call, in which case reading = true if
// it's in progress.
// However, if we're not ended, or reading, and the length < hwm,
// then go ahead and try to read some more preemptively.
function maybeReadMore(stream, state) {
  if (!state.readingMore) {
    state.readingMore = true;
    processNextTick(maybeReadMore_, stream, state);
  }
}

function maybeReadMore_(stream, state) {
  var len = state.length;
  while (!state.reading && !state.flowing && !state.ended && state.length < state.highWaterMark) {
    debug('maybeReadMore read 0');
    stream.read(0);
    if (len === state.length)
      // didn't get any data, stop spinning.
      break;else len = state.length;
  }
  state.readingMore = false;
}

// abstract method.  to be overridden in specific implementation classes.
// call cb(er, data) where data is <= n in length.
// for virtual (non-string, non-buffer) streams, "length" is somewhat
// arbitrary, and perhaps not very meaningful.
Readable.prototype._read = function (n) {
  this.emit('error', new Error('_read() is not implemented'));
};

Readable.prototype.pipe = function (dest, pipeOpts) {
  var src = this;
  var state = this._readableState;

  switch (state.pipesCount) {
    case 0:
      state.pipes = dest;
      break;
    case 1:
      state.pipes = [state.pipes, dest];
      break;
    default:
      state.pipes.push(dest);
      break;
  }
  state.pipesCount += 1;
  debug('pipe count=%d opts=%j', state.pipesCount, pipeOpts);

  var doEnd = (!pipeOpts || pipeOpts.end !== false) && dest !== process.stdout && dest !== process.stderr;

  var endFn = doEnd ? onend : unpipe;
  if (state.endEmitted) processNextTick(endFn);else src.once('end', endFn);

  dest.on('unpipe', onunpipe);
  function onunpipe(readable, unpipeInfo) {
    debug('onunpipe');
    if (readable === src) {
      if (unpipeInfo && unpipeInfo.hasUnpiped === false) {
        unpipeInfo.hasUnpiped = true;
        cleanup();
      }
    }
  }

  function onend() {
    debug('onend');
    dest.end();
  }

  // when the dest drains, it reduces the awaitDrain counter
  // on the source.  This would be more elegant with a .once()
  // handler in flow(), but adding and removing repeatedly is
  // too slow.
  var ondrain = pipeOnDrain(src);
  dest.on('drain', ondrain);

  var cleanedUp = false;
  function cleanup() {
    debug('cleanup');
    // cleanup event handlers once the pipe is broken
    dest.removeListener('close', onclose);
    dest.removeListener('finish', onfinish);
    dest.removeListener('drain', ondrain);
    dest.removeListener('error', onerror);
    dest.removeListener('unpipe', onunpipe);
    src.removeListener('end', onend);
    src.removeListener('end', unpipe);
    src.removeListener('data', ondata);

    cleanedUp = true;

    // if the reader is waiting for a drain event from this
    // specific writer, then it would cause it to never start
    // flowing again.
    // So, if this is awaiting a drain, then we just call it now.
    // If we don't know, then assume that we are waiting for one.
    if (state.awaitDrain && (!dest._writableState || dest._writableState.needDrain)) ondrain();
  }

  // If the user pushes more data while we're writing to dest then we'll end up
  // in ondata again. However, we only want to increase awaitDrain once because
  // dest will only emit one 'drain' event for the multiple writes.
  // => Introduce a guard on increasing awaitDrain.
  var increasedAwaitDrain = false;
  src.on('data', ondata);
  function ondata(chunk) {
    debug('ondata');
    increasedAwaitDrain = false;
    var ret = dest.write(chunk);
    if (false === ret && !increasedAwaitDrain) {
      // If the user unpiped during `dest.write()`, it is possible
      // to get stuck in a permanently paused state if that write
      // also returned false.
      // => Check whether `dest` is still a piping destination.
      if ((state.pipesCount === 1 && state.pipes === dest || state.pipesCount > 1 && indexOf(state.pipes, dest) !== -1) && !cleanedUp) {
        debug('false write response, pause', src._readableState.awaitDrain);
        src._readableState.awaitDrain++;
        increasedAwaitDrain = true;
      }
      src.pause();
    }
  }

  // if the dest has an error, then stop piping into it.
  // however, don't suppress the throwing behavior for this.
  function onerror(er) {
    debug('onerror', er);
    unpipe();
    dest.removeListener('error', onerror);
    if (EElistenerCount(dest, 'error') === 0) dest.emit('error', er);
  }

  // Make sure our error handler is attached before userland ones.
  prependListener(dest, 'error', onerror);

  // Both close and finish should trigger unpipe, but only once.
  function onclose() {
    dest.removeListener('finish', onfinish);
    unpipe();
  }
  dest.once('close', onclose);
  function onfinish() {
    debug('onfinish');
    dest.removeListener('close', onclose);
    unpipe();
  }
  dest.once('finish', onfinish);

  function unpipe() {
    debug('unpipe');
    src.unpipe(dest);
  }

  // tell the dest that it's being piped to
  dest.emit('pipe', src);

  // start the flow if it hasn't been started already.
  if (!state.flowing) {
    debug('pipe resume');
    src.resume();
  }

  return dest;
};

function pipeOnDrain(src) {
  return function () {
    var state = src._readableState;
    debug('pipeOnDrain', state.awaitDrain);
    if (state.awaitDrain) state.awaitDrain--;
    if (state.awaitDrain === 0 && EElistenerCount(src, 'data')) {
      state.flowing = true;
      flow(src);
    }
  };
}

Readable.prototype.unpipe = function (dest) {
  var state = this._readableState;
  var unpipeInfo = { hasUnpiped: false };

  // if we're not piping anywhere, then do nothing.
  if (state.pipesCount === 0) return this;

  // just one destination.  most common case.
  if (state.pipesCount === 1) {
    // passed in one, but it's not the right one.
    if (dest && dest !== state.pipes) return this;

    if (!dest) dest = state.pipes;

    // got a match.
    state.pipes = null;
    state.pipesCount = 0;
    state.flowing = false;
    if (dest) dest.emit('unpipe', this, unpipeInfo);
    return this;
  }

  // slow case. multiple pipe destinations.

  if (!dest) {
    // remove all.
    var dests = state.pipes;
    var len = state.pipesCount;
    state.pipes = null;
    state.pipesCount = 0;
    state.flowing = false;

    for (var i = 0; i < len; i++) {
      dests[i].emit('unpipe', this, unpipeInfo);
    }return this;
  }

  // try to find the right one.
  var index = indexOf(state.pipes, dest);
  if (index === -1) return this;

  state.pipes.splice(index, 1);
  state.pipesCount -= 1;
  if (state.pipesCount === 1) state.pipes = state.pipes[0];

  dest.emit('unpipe', this, unpipeInfo);

  return this;
};

// set up data events if they are asked for
// Ensure readable listeners eventually get something
Readable.prototype.on = function (ev, fn) {
  var res = Stream.prototype.on.call(this, ev, fn);

  if (ev === 'data') {
    // Start flowing on next tick if stream isn't explicitly paused
    if (this._readableState.flowing !== false) this.resume();
  } else if (ev === 'readable') {
    var state = this._readableState;
    if (!state.endEmitted && !state.readableListening) {
      state.readableListening = state.needReadable = true;
      state.emittedReadable = false;
      if (!state.reading) {
        processNextTick(nReadingNextTick, this);
      } else if (state.length) {
        emitReadable(this);
      }
    }
  }

  return res;
};
Readable.prototype.addListener = Readable.prototype.on;

function nReadingNextTick(self) {
  debug('readable nexttick read 0');
  self.read(0);
}

// pause() and resume() are remnants of the legacy readable stream API
// If the user uses them, then switch into old mode.
Readable.prototype.resume = function () {
  var state = this._readableState;
  if (!state.flowing) {
    debug('resume');
    state.flowing = true;
    resume(this, state);
  }
  return this;
};

function resume(stream, state) {
  if (!state.resumeScheduled) {
    state.resumeScheduled = true;
    processNextTick(resume_, stream, state);
  }
}

function resume_(stream, state) {
  if (!state.reading) {
    debug('resume read 0');
    stream.read(0);
  }

  state.resumeScheduled = false;
  state.awaitDrain = 0;
  stream.emit('resume');
  flow(stream);
  if (state.flowing && !state.reading) stream.read(0);
}

Readable.prototype.pause = function () {
  debug('call pause flowing=%j', this._readableState.flowing);
  if (false !== this._readableState.flowing) {
    debug('pause');
    this._readableState.flowing = false;
    this.emit('pause');
  }
  return this;
};

function flow(stream) {
  var state = stream._readableState;
  debug('flow', state.flowing);
  while (state.flowing && stream.read() !== null) {}
}

// wrap an old-style stream as the async data source.
// This is *not* part of the readable stream interface.
// It is an ugly unfortunate mess of history.
Readable.prototype.wrap = function (stream) {
  var state = this._readableState;
  var paused = false;

  var self = this;
  stream.on('end', function () {
    debug('wrapped end');
    if (state.decoder && !state.ended) {
      var chunk = state.decoder.end();
      if (chunk && chunk.length) self.push(chunk);
    }

    self.push(null);
  });

  stream.on('data', function (chunk) {
    debug('wrapped data');
    if (state.decoder) chunk = state.decoder.write(chunk);

    // don't skip over falsy values in objectMode
    if (state.objectMode && (chunk === null || chunk === undefined)) return;else if (!state.objectMode && (!chunk || !chunk.length)) return;

    var ret = self.push(chunk);
    if (!ret) {
      paused = true;
      stream.pause();
    }
  });

  // proxy all the other methods.
  // important when wrapping filters and duplexes.
  for (var i in stream) {
    if (this[i] === undefined && typeof stream[i] === 'function') {
      this[i] = function (method) {
        return function () {
          return stream[method].apply(stream, arguments);
        };
      }(i);
    }
  }

  // proxy certain important events.
  for (var n = 0; n < kProxyEvents.length; n++) {
    stream.on(kProxyEvents[n], self.emit.bind(self, kProxyEvents[n]));
  }

  // when we try to consume some more bytes, simply unpause the
  // underlying stream.
  self._read = function (n) {
    debug('wrapped _read', n);
    if (paused) {
      paused = false;
      stream.resume();
    }
  };

  return self;
};

// exposed for testing purposes only.
Readable._fromList = fromList;

// Pluck off n bytes from an array of buffers.
// Length is the combined lengths of all the buffers in the list.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function fromList(n, state) {
  // nothing buffered
  if (state.length === 0) return null;

  var ret;
  if (state.objectMode) ret = state.buffer.shift();else if (!n || n >= state.length) {
    // read it all, truncate the list
    if (state.decoder) ret = state.buffer.join('');else if (state.buffer.length === 1) ret = state.buffer.head.data;else ret = state.buffer.concat(state.length);
    state.buffer.clear();
  } else {
    // read part of list
    ret = fromListPartial(n, state.buffer, state.decoder);
  }

  return ret;
}

// Extracts only enough buffered data to satisfy the amount requested.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function fromListPartial(n, list, hasStrings) {
  var ret;
  if (n < list.head.data.length) {
    // slice is the same for buffers and strings
    ret = list.head.data.slice(0, n);
    list.head.data = list.head.data.slice(n);
  } else if (n === list.head.data.length) {
    // first chunk is a perfect match
    ret = list.shift();
  } else {
    // result spans more than one buffer
    ret = hasStrings ? copyFromBufferString(n, list) : copyFromBuffer(n, list);
  }
  return ret;
}

// Copies a specified amount of characters from the list of buffered data
// chunks.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function copyFromBufferString(n, list) {
  var p = list.head;
  var c = 1;
  var ret = p.data;
  n -= ret.length;
  while (p = p.next) {
    var str = p.data;
    var nb = n > str.length ? str.length : n;
    if (nb === str.length) ret += str;else ret += str.slice(0, n);
    n -= nb;
    if (n === 0) {
      if (nb === str.length) {
        ++c;
        if (p.next) list.head = p.next;else list.head = list.tail = null;
      } else {
        list.head = p;
        p.data = str.slice(nb);
      }
      break;
    }
    ++c;
  }
  list.length -= c;
  return ret;
}

// Copies a specified amount of bytes from the list of buffered data chunks.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function copyFromBuffer(n, list) {
  var ret = Buffer.allocUnsafe(n);
  var p = list.head;
  var c = 1;
  p.data.copy(ret);
  n -= p.data.length;
  while (p = p.next) {
    var buf = p.data;
    var nb = n > buf.length ? buf.length : n;
    buf.copy(ret, ret.length - n, 0, nb);
    n -= nb;
    if (n === 0) {
      if (nb === buf.length) {
        ++c;
        if (p.next) list.head = p.next;else list.head = list.tail = null;
      } else {
        list.head = p;
        p.data = buf.slice(nb);
      }
      break;
    }
    ++c;
  }
  list.length -= c;
  return ret;
}

function endReadable(stream) {
  var state = stream._readableState;

  // If we get here before consuming all the bytes, then that is a
  // bug in node.  Should never happen.
  if (state.length > 0) throw new Error('"endReadable()" called on non-empty stream');

  if (!state.endEmitted) {
    state.ended = true;
    processNextTick(endReadableNT, state, stream);
  }
}

function endReadableNT(state, stream) {
  // Check that we didn't get one last unshift.
  if (!state.endEmitted && state.length === 0) {
    state.endEmitted = true;
    stream.readable = false;
    stream.emit('end');
  }
}

function forEach(xs, f) {
  for (var i = 0, l = xs.length; i < l; i++) {
    f(xs[i], i);
  }
}

function indexOf(xs, x) {
  for (var i = 0, l = xs.length; i < l; i++) {
    if (xs[i] === x) return i;
  }
  return -1;
}
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(7), __webpack_require__(12)))

/***/ }),
/* 42 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(18).EventEmitter;


/***/ }),
/* 43 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/*<replacement>*/

var processNextTick = __webpack_require__(16);
/*</replacement>*/

// undocumented cb() API, needed for core, not for public API
function destroy(err, cb) {
  var _this = this;

  var readableDestroyed = this._readableState && this._readableState.destroyed;
  var writableDestroyed = this._writableState && this._writableState.destroyed;

  if (readableDestroyed || writableDestroyed) {
    if (cb) {
      cb(err);
    } else if (err && (!this._writableState || !this._writableState.errorEmitted)) {
      processNextTick(emitErrorNT, this, err);
    }
    return;
  }

  // we set destroyed to true before firing error callbacks in order
  // to make it re-entrance safe in case destroy() is called within callbacks

  if (this._readableState) {
    this._readableState.destroyed = true;
  }

  // if this is a duplex stream mark the writable part as destroyed as well
  if (this._writableState) {
    this._writableState.destroyed = true;
  }

  this._destroy(err || null, function (err) {
    if (!cb && err) {
      processNextTick(emitErrorNT, _this, err);
      if (_this._writableState) {
        _this._writableState.errorEmitted = true;
      }
    } else if (cb) {
      cb(err);
    }
  });
}

function undestroy() {
  if (this._readableState) {
    this._readableState.destroyed = false;
    this._readableState.reading = false;
    this._readableState.ended = false;
    this._readableState.endEmitted = false;
  }

  if (this._writableState) {
    this._writableState.destroyed = false;
    this._writableState.ended = false;
    this._writableState.ending = false;
    this._writableState.finished = false;
    this._writableState.errorEmitted = false;
  }
}

function emitErrorNT(self, err) {
  self.emit('error', err);
}

module.exports = {
  destroy: destroy,
  undestroy: undestroy
};

/***/ }),
/* 44 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// a transform stream is a readable/writable stream where you do
// something with the data.  Sometimes it's called a "filter",
// but that's not a great name for it, since that implies a thing where
// some bits pass through, and others are simply ignored.  (That would
// be a valid example of a transform, of course.)
//
// While the output is causally related to the input, it's not a
// necessarily symmetric or synchronous transformation.  For example,
// a zlib stream might take multiple plain-text writes(), and then
// emit a single compressed chunk some time in the future.
//
// Here's how this works:
//
// The Transform stream has all the aspects of the readable and writable
// stream classes.  When you write(chunk), that calls _write(chunk,cb)
// internally, and returns false if there's a lot of pending writes
// buffered up.  When you call read(), that calls _read(n) until
// there's enough pending readable data buffered up.
//
// In a transform stream, the written data is placed in a buffer.  When
// _read(n) is called, it transforms the queued up data, calling the
// buffered _write cb's as it consumes chunks.  If consuming a single
// written chunk would result in multiple output chunks, then the first
// outputted bit calls the readcb, and subsequent chunks just go into
// the read buffer, and will cause it to emit 'readable' if necessary.
//
// This way, back-pressure is actually determined by the reading side,
// since _read has to be called to start processing a new chunk.  However,
// a pathological inflate type of transform can cause excessive buffering
// here.  For example, imagine a stream where every byte of input is
// interpreted as an integer from 0-255, and then results in that many
// bytes of output.  Writing the 4 bytes {ff,ff,ff,ff} would result in
// 1kb of data being output.  In this case, you could write a very small
// amount of input, and end up with a very large amount of output.  In
// such a pathological inflating mechanism, there'd be no way to tell
// the system to stop doing the transform.  A single 4MB write could
// cause the system to run out of memory.
//
// However, even in such a pathological case, only a single written chunk
// would be consumed, and then the rest would wait (un-transformed) until
// the results of the previous transformed chunk were consumed.



module.exports = Transform;

var Duplex = __webpack_require__(8);

/*<replacement>*/
var util = __webpack_require__(14);
util.inherits = __webpack_require__(3);
/*</replacement>*/

util.inherits(Transform, Duplex);

function TransformState(stream) {
  this.afterTransform = function (er, data) {
    return afterTransform(stream, er, data);
  };

  this.needTransform = false;
  this.transforming = false;
  this.writecb = null;
  this.writechunk = null;
  this.writeencoding = null;
}

function afterTransform(stream, er, data) {
  var ts = stream._transformState;
  ts.transforming = false;

  var cb = ts.writecb;

  if (!cb) {
    return stream.emit('error', new Error('write callback called multiple times'));
  }

  ts.writechunk = null;
  ts.writecb = null;

  if (data !== null && data !== undefined) stream.push(data);

  cb(er);

  var rs = stream._readableState;
  rs.reading = false;
  if (rs.needReadable || rs.length < rs.highWaterMark) {
    stream._read(rs.highWaterMark);
  }
}

function Transform(options) {
  if (!(this instanceof Transform)) return new Transform(options);

  Duplex.call(this, options);

  this._transformState = new TransformState(this);

  var stream = this;

  // start out asking for a readable event once data is transformed.
  this._readableState.needReadable = true;

  // we have implemented the _read method, and done the other things
  // that Readable wants before the first _read call, so unset the
  // sync guard flag.
  this._readableState.sync = false;

  if (options) {
    if (typeof options.transform === 'function') this._transform = options.transform;

    if (typeof options.flush === 'function') this._flush = options.flush;
  }

  // When the writable side finishes, then flush out anything remaining.
  this.once('prefinish', function () {
    if (typeof this._flush === 'function') this._flush(function (er, data) {
      done(stream, er, data);
    });else done(stream);
  });
}

Transform.prototype.push = function (chunk, encoding) {
  this._transformState.needTransform = false;
  return Duplex.prototype.push.call(this, chunk, encoding);
};

// This is the part where you do stuff!
// override this function in implementation classes.
// 'chunk' is an input chunk.
//
// Call `push(newChunk)` to pass along transformed output
// to the readable side.  You may call 'push' zero or more times.
//
// Call `cb(err)` when you are done with this chunk.  If you pass
// an error, then that'll put the hurt on the whole operation.  If you
// never call cb(), then you'll never get another chunk.
Transform.prototype._transform = function (chunk, encoding, cb) {
  throw new Error('_transform() is not implemented');
};

Transform.prototype._write = function (chunk, encoding, cb) {
  var ts = this._transformState;
  ts.writecb = cb;
  ts.writechunk = chunk;
  ts.writeencoding = encoding;
  if (!ts.transforming) {
    var rs = this._readableState;
    if (ts.needTransform || rs.needReadable || rs.length < rs.highWaterMark) this._read(rs.highWaterMark);
  }
};

// Doesn't matter what the args are here.
// _transform does all the work.
// That we got here means that the readable side wants more data.
Transform.prototype._read = function (n) {
  var ts = this._transformState;

  if (ts.writechunk !== null && ts.writecb && !ts.transforming) {
    ts.transforming = true;
    this._transform(ts.writechunk, ts.writeencoding, ts.afterTransform);
  } else {
    // mark that we need a transform, so that any data that comes in
    // will get processed, now that we've asked for it.
    ts.needTransform = true;
  }
};

Transform.prototype._destroy = function (err, cb) {
  var _this = this;

  Duplex.prototype._destroy.call(this, err, function (err2) {
    cb(err2);
    _this.emit('close');
  });
};

function done(stream, er, data) {
  if (er) return stream.emit('error', er);

  if (data !== null && data !== undefined) stream.push(data);

  // if there's nothing in the write buffer, then that means
  // that nothing more will ever be provided
  var ws = stream._writableState;
  var ts = stream._transformState;

  if (ws.length) throw new Error('Calling transform done when ws.length != 0');

  if (ts.transforming) throw new Error('Calling transform done when still transforming');

  return stream.push(null);
}

/***/ }),
/* 45 */
/***/ (function(module, exports, __webpack_require__) {

var exports = module.exports = function SHA (algorithm) {
  algorithm = algorithm.toLowerCase()

  var Algorithm = exports[algorithm]
  if (!Algorithm) throw new Error(algorithm + ' is not supported (we accept pull requests)')

  return new Algorithm()
}

exports.sha = __webpack_require__(120)
exports.sha1 = __webpack_require__(121)
exports.sha224 = __webpack_require__(122)
exports.sha256 = __webpack_require__(46)
exports.sha384 = __webpack_require__(123)
exports.sha512 = __webpack_require__(47)


/***/ }),
/* 46 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(Buffer) {/**
 * A JavaScript implementation of the Secure Hash Algorithm, SHA-256, as defined
 * in FIPS 180-2
 * Version 2.2-beta Copyright Angel Marin, Paul Johnston 2000 - 2009.
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 *
 */

var inherits = __webpack_require__(3)
var Hash = __webpack_require__(13)

var K = [
  0x428A2F98, 0x71374491, 0xB5C0FBCF, 0xE9B5DBA5,
  0x3956C25B, 0x59F111F1, 0x923F82A4, 0xAB1C5ED5,
  0xD807AA98, 0x12835B01, 0x243185BE, 0x550C7DC3,
  0x72BE5D74, 0x80DEB1FE, 0x9BDC06A7, 0xC19BF174,
  0xE49B69C1, 0xEFBE4786, 0x0FC19DC6, 0x240CA1CC,
  0x2DE92C6F, 0x4A7484AA, 0x5CB0A9DC, 0x76F988DA,
  0x983E5152, 0xA831C66D, 0xB00327C8, 0xBF597FC7,
  0xC6E00BF3, 0xD5A79147, 0x06CA6351, 0x14292967,
  0x27B70A85, 0x2E1B2138, 0x4D2C6DFC, 0x53380D13,
  0x650A7354, 0x766A0ABB, 0x81C2C92E, 0x92722C85,
  0xA2BFE8A1, 0xA81A664B, 0xC24B8B70, 0xC76C51A3,
  0xD192E819, 0xD6990624, 0xF40E3585, 0x106AA070,
  0x19A4C116, 0x1E376C08, 0x2748774C, 0x34B0BCB5,
  0x391C0CB3, 0x4ED8AA4A, 0x5B9CCA4F, 0x682E6FF3,
  0x748F82EE, 0x78A5636F, 0x84C87814, 0x8CC70208,
  0x90BEFFFA, 0xA4506CEB, 0xBEF9A3F7, 0xC67178F2
]

var W = new Array(64)

function Sha256 () {
  this.init()

  this._w = W // new Array(64)

  Hash.call(this, 64, 56)
}

inherits(Sha256, Hash)

Sha256.prototype.init = function () {
  this._a = 0x6a09e667
  this._b = 0xbb67ae85
  this._c = 0x3c6ef372
  this._d = 0xa54ff53a
  this._e = 0x510e527f
  this._f = 0x9b05688c
  this._g = 0x1f83d9ab
  this._h = 0x5be0cd19

  return this
}

function ch (x, y, z) {
  return z ^ (x & (y ^ z))
}

function maj (x, y, z) {
  return (x & y) | (z & (x | y))
}

function sigma0 (x) {
  return (x >>> 2 | x << 30) ^ (x >>> 13 | x << 19) ^ (x >>> 22 | x << 10)
}

function sigma1 (x) {
  return (x >>> 6 | x << 26) ^ (x >>> 11 | x << 21) ^ (x >>> 25 | x << 7)
}

function gamma0 (x) {
  return (x >>> 7 | x << 25) ^ (x >>> 18 | x << 14) ^ (x >>> 3)
}

function gamma1 (x) {
  return (x >>> 17 | x << 15) ^ (x >>> 19 | x << 13) ^ (x >>> 10)
}

Sha256.prototype._update = function (M) {
  var W = this._w

  var a = this._a | 0
  var b = this._b | 0
  var c = this._c | 0
  var d = this._d | 0
  var e = this._e | 0
  var f = this._f | 0
  var g = this._g | 0
  var h = this._h | 0

  for (var i = 0; i < 16; ++i) W[i] = M.readInt32BE(i * 4)
  for (; i < 64; ++i) W[i] = (gamma1(W[i - 2]) + W[i - 7] + gamma0(W[i - 15]) + W[i - 16]) | 0

  for (var j = 0; j < 64; ++j) {
    var T1 = (h + sigma1(e) + ch(e, f, g) + K[j] + W[j]) | 0
    var T2 = (sigma0(a) + maj(a, b, c)) | 0

    h = g
    g = f
    f = e
    e = (d + T1) | 0
    d = c
    c = b
    b = a
    a = (T1 + T2) | 0
  }

  this._a = (a + this._a) | 0
  this._b = (b + this._b) | 0
  this._c = (c + this._c) | 0
  this._d = (d + this._d) | 0
  this._e = (e + this._e) | 0
  this._f = (f + this._f) | 0
  this._g = (g + this._g) | 0
  this._h = (h + this._h) | 0
}

Sha256.prototype._hash = function () {
  var H = new Buffer(32)

  H.writeInt32BE(this._a, 0)
  H.writeInt32BE(this._b, 4)
  H.writeInt32BE(this._c, 8)
  H.writeInt32BE(this._d, 12)
  H.writeInt32BE(this._e, 16)
  H.writeInt32BE(this._f, 20)
  H.writeInt32BE(this._g, 24)
  H.writeInt32BE(this._h, 28)

  return H
}

module.exports = Sha256

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1).Buffer))

/***/ }),
/* 47 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(Buffer) {var inherits = __webpack_require__(3)
var Hash = __webpack_require__(13)

var K = [
  0x428a2f98, 0xd728ae22, 0x71374491, 0x23ef65cd,
  0xb5c0fbcf, 0xec4d3b2f, 0xe9b5dba5, 0x8189dbbc,
  0x3956c25b, 0xf348b538, 0x59f111f1, 0xb605d019,
  0x923f82a4, 0xaf194f9b, 0xab1c5ed5, 0xda6d8118,
  0xd807aa98, 0xa3030242, 0x12835b01, 0x45706fbe,
  0x243185be, 0x4ee4b28c, 0x550c7dc3, 0xd5ffb4e2,
  0x72be5d74, 0xf27b896f, 0x80deb1fe, 0x3b1696b1,
  0x9bdc06a7, 0x25c71235, 0xc19bf174, 0xcf692694,
  0xe49b69c1, 0x9ef14ad2, 0xefbe4786, 0x384f25e3,
  0x0fc19dc6, 0x8b8cd5b5, 0x240ca1cc, 0x77ac9c65,
  0x2de92c6f, 0x592b0275, 0x4a7484aa, 0x6ea6e483,
  0x5cb0a9dc, 0xbd41fbd4, 0x76f988da, 0x831153b5,
  0x983e5152, 0xee66dfab, 0xa831c66d, 0x2db43210,
  0xb00327c8, 0x98fb213f, 0xbf597fc7, 0xbeef0ee4,
  0xc6e00bf3, 0x3da88fc2, 0xd5a79147, 0x930aa725,
  0x06ca6351, 0xe003826f, 0x14292967, 0x0a0e6e70,
  0x27b70a85, 0x46d22ffc, 0x2e1b2138, 0x5c26c926,
  0x4d2c6dfc, 0x5ac42aed, 0x53380d13, 0x9d95b3df,
  0x650a7354, 0x8baf63de, 0x766a0abb, 0x3c77b2a8,
  0x81c2c92e, 0x47edaee6, 0x92722c85, 0x1482353b,
  0xa2bfe8a1, 0x4cf10364, 0xa81a664b, 0xbc423001,
  0xc24b8b70, 0xd0f89791, 0xc76c51a3, 0x0654be30,
  0xd192e819, 0xd6ef5218, 0xd6990624, 0x5565a910,
  0xf40e3585, 0x5771202a, 0x106aa070, 0x32bbd1b8,
  0x19a4c116, 0xb8d2d0c8, 0x1e376c08, 0x5141ab53,
  0x2748774c, 0xdf8eeb99, 0x34b0bcb5, 0xe19b48a8,
  0x391c0cb3, 0xc5c95a63, 0x4ed8aa4a, 0xe3418acb,
  0x5b9cca4f, 0x7763e373, 0x682e6ff3, 0xd6b2b8a3,
  0x748f82ee, 0x5defb2fc, 0x78a5636f, 0x43172f60,
  0x84c87814, 0xa1f0ab72, 0x8cc70208, 0x1a6439ec,
  0x90befffa, 0x23631e28, 0xa4506ceb, 0xde82bde9,
  0xbef9a3f7, 0xb2c67915, 0xc67178f2, 0xe372532b,
  0xca273ece, 0xea26619c, 0xd186b8c7, 0x21c0c207,
  0xeada7dd6, 0xcde0eb1e, 0xf57d4f7f, 0xee6ed178,
  0x06f067aa, 0x72176fba, 0x0a637dc5, 0xa2c898a6,
  0x113f9804, 0xbef90dae, 0x1b710b35, 0x131c471b,
  0x28db77f5, 0x23047d84, 0x32caab7b, 0x40c72493,
  0x3c9ebe0a, 0x15c9bebc, 0x431d67c4, 0x9c100d4c,
  0x4cc5d4be, 0xcb3e42b6, 0x597f299c, 0xfc657e2a,
  0x5fcb6fab, 0x3ad6faec, 0x6c44198c, 0x4a475817
]

var W = new Array(160)

function Sha512 () {
  this.init()
  this._w = W

  Hash.call(this, 128, 112)
}

inherits(Sha512, Hash)

Sha512.prototype.init = function () {
  this._ah = 0x6a09e667
  this._bh = 0xbb67ae85
  this._ch = 0x3c6ef372
  this._dh = 0xa54ff53a
  this._eh = 0x510e527f
  this._fh = 0x9b05688c
  this._gh = 0x1f83d9ab
  this._hh = 0x5be0cd19

  this._al = 0xf3bcc908
  this._bl = 0x84caa73b
  this._cl = 0xfe94f82b
  this._dl = 0x5f1d36f1
  this._el = 0xade682d1
  this._fl = 0x2b3e6c1f
  this._gl = 0xfb41bd6b
  this._hl = 0x137e2179

  return this
}

function Ch (x, y, z) {
  return z ^ (x & (y ^ z))
}

function maj (x, y, z) {
  return (x & y) | (z & (x | y))
}

function sigma0 (x, xl) {
  return (x >>> 28 | xl << 4) ^ (xl >>> 2 | x << 30) ^ (xl >>> 7 | x << 25)
}

function sigma1 (x, xl) {
  return (x >>> 14 | xl << 18) ^ (x >>> 18 | xl << 14) ^ (xl >>> 9 | x << 23)
}

function Gamma0 (x, xl) {
  return (x >>> 1 | xl << 31) ^ (x >>> 8 | xl << 24) ^ (x >>> 7)
}

function Gamma0l (x, xl) {
  return (x >>> 1 | xl << 31) ^ (x >>> 8 | xl << 24) ^ (x >>> 7 | xl << 25)
}

function Gamma1 (x, xl) {
  return (x >>> 19 | xl << 13) ^ (xl >>> 29 | x << 3) ^ (x >>> 6)
}

function Gamma1l (x, xl) {
  return (x >>> 19 | xl << 13) ^ (xl >>> 29 | x << 3) ^ (x >>> 6 | xl << 26)
}

function getCarry (a, b) {
  return (a >>> 0) < (b >>> 0) ? 1 : 0
}

Sha512.prototype._update = function (M) {
  var W = this._w

  var ah = this._ah | 0
  var bh = this._bh | 0
  var ch = this._ch | 0
  var dh = this._dh | 0
  var eh = this._eh | 0
  var fh = this._fh | 0
  var gh = this._gh | 0
  var hh = this._hh | 0

  var al = this._al | 0
  var bl = this._bl | 0
  var cl = this._cl | 0
  var dl = this._dl | 0
  var el = this._el | 0
  var fl = this._fl | 0
  var gl = this._gl | 0
  var hl = this._hl | 0

  for (var i = 0; i < 32; i += 2) {
    W[i] = M.readInt32BE(i * 4)
    W[i + 1] = M.readInt32BE(i * 4 + 4)
  }
  for (; i < 160; i += 2) {
    var xh = W[i - 15 * 2]
    var xl = W[i - 15 * 2 + 1]
    var gamma0 = Gamma0(xh, xl)
    var gamma0l = Gamma0l(xl, xh)

    xh = W[i - 2 * 2]
    xl = W[i - 2 * 2 + 1]
    var gamma1 = Gamma1(xh, xl)
    var gamma1l = Gamma1l(xl, xh)

    // W[i] = gamma0 + W[i - 7] + gamma1 + W[i - 16]
    var Wi7h = W[i - 7 * 2]
    var Wi7l = W[i - 7 * 2 + 1]

    var Wi16h = W[i - 16 * 2]
    var Wi16l = W[i - 16 * 2 + 1]

    var Wil = (gamma0l + Wi7l) | 0
    var Wih = (gamma0 + Wi7h + getCarry(Wil, gamma0l)) | 0
    Wil = (Wil + gamma1l) | 0
    Wih = (Wih + gamma1 + getCarry(Wil, gamma1l)) | 0
    Wil = (Wil + Wi16l) | 0
    Wih = (Wih + Wi16h + getCarry(Wil, Wi16l)) | 0

    W[i] = Wih
    W[i + 1] = Wil
  }

  for (var j = 0; j < 160; j += 2) {
    Wih = W[j]
    Wil = W[j + 1]

    var majh = maj(ah, bh, ch)
    var majl = maj(al, bl, cl)

    var sigma0h = sigma0(ah, al)
    var sigma0l = sigma0(al, ah)
    var sigma1h = sigma1(eh, el)
    var sigma1l = sigma1(el, eh)

    // t1 = h + sigma1 + ch + K[j] + W[j]
    var Kih = K[j]
    var Kil = K[j + 1]

    var chh = Ch(eh, fh, gh)
    var chl = Ch(el, fl, gl)

    var t1l = (hl + sigma1l) | 0
    var t1h = (hh + sigma1h + getCarry(t1l, hl)) | 0
    t1l = (t1l + chl) | 0
    t1h = (t1h + chh + getCarry(t1l, chl)) | 0
    t1l = (t1l + Kil) | 0
    t1h = (t1h + Kih + getCarry(t1l, Kil)) | 0
    t1l = (t1l + Wil) | 0
    t1h = (t1h + Wih + getCarry(t1l, Wil)) | 0

    // t2 = sigma0 + maj
    var t2l = (sigma0l + majl) | 0
    var t2h = (sigma0h + majh + getCarry(t2l, sigma0l)) | 0

    hh = gh
    hl = gl
    gh = fh
    gl = fl
    fh = eh
    fl = el
    el = (dl + t1l) | 0
    eh = (dh + t1h + getCarry(el, dl)) | 0
    dh = ch
    dl = cl
    ch = bh
    cl = bl
    bh = ah
    bl = al
    al = (t1l + t2l) | 0
    ah = (t1h + t2h + getCarry(al, t1l)) | 0
  }

  this._al = (this._al + al) | 0
  this._bl = (this._bl + bl) | 0
  this._cl = (this._cl + cl) | 0
  this._dl = (this._dl + dl) | 0
  this._el = (this._el + el) | 0
  this._fl = (this._fl + fl) | 0
  this._gl = (this._gl + gl) | 0
  this._hl = (this._hl + hl) | 0

  this._ah = (this._ah + ah + getCarry(this._al, al)) | 0
  this._bh = (this._bh + bh + getCarry(this._bl, bl)) | 0
  this._ch = (this._ch + ch + getCarry(this._cl, cl)) | 0
  this._dh = (this._dh + dh + getCarry(this._dl, dl)) | 0
  this._eh = (this._eh + eh + getCarry(this._el, el)) | 0
  this._fh = (this._fh + fh + getCarry(this._fl, fl)) | 0
  this._gh = (this._gh + gh + getCarry(this._gl, gl)) | 0
  this._hh = (this._hh + hh + getCarry(this._hl, hl)) | 0
}

Sha512.prototype._hash = function () {
  var H = new Buffer(64)

  function writeInt64BE (h, l, offset) {
    H.writeInt32BE(h, offset)
    H.writeInt32BE(l, offset + 4)
  }

  writeInt64BE(this._ah, this._al, 0)
  writeInt64BE(this._bh, this._bl, 8)
  writeInt64BE(this._ch, this._cl, 16)
  writeInt64BE(this._dh, this._dl, 24)
  writeInt64BE(this._eh, this._el, 32)
  writeInt64BE(this._fh, this._fl, 40)
  writeInt64BE(this._gh, this._gl, 48)
  writeInt64BE(this._hh, this._hl, 56)

  return H
}

module.exports = Sha512

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1).Buffer))

/***/ }),
/* 48 */
/***/ (function(module, exports, __webpack_require__) {

var native = __webpack_require__(23)

function getTypeName (fn) {
  return fn.name || fn.toString().match(/function (.*?)\s*\(/)[1]
}

function getValueTypeName (value) {
  return native.Nil(value) ? '' : getTypeName(value.constructor)
}

function getValue (value) {
  if (native.Function(value)) return ''
  if (native.String(value)) return JSON.stringify(value)
  if (value && native.Object(value)) return ''
  return value
}

function tfJSON (type) {
  if (native.Function(type)) return type.toJSON ? type.toJSON() : getTypeName(type)
  if (native.Array(type)) return 'Array'
  if (type && native.Object(type)) return 'Object'

  return type !== undefined ? type : ''
}

function tfErrorString (type, value, valueTypeName) {
  var valueJson = getValue(value)

  return 'Expected ' + tfJSON(type) + ', got' +
    (valueTypeName !== '' ? ' ' + valueTypeName : '') +
    (valueJson !== '' ? ' ' + valueJson : '')
}

function TfTypeError (type, value, valueTypeName) {
  valueTypeName = valueTypeName || getValueTypeName(value)
  this.message = tfErrorString(type, value, valueTypeName)

  Error.captureStackTrace(this, TfTypeError)
  this.__type = type
  this.__value = value
  this.__valueTypeName = valueTypeName
}

TfTypeError.prototype = Object.create(Error.prototype)
TfTypeError.prototype.constructor = TfTypeError

function tfPropertyErrorString (type, label, name, value, valueTypeName) {
  var description = '" of type '
  if (label === 'key') description = '" with key type '

  return tfErrorString('property "' + tfJSON(name) + description + tfJSON(type), value, valueTypeName)
}

function TfPropertyTypeError (type, property, label, value, valueTypeName) {
  if (type) {
    valueTypeName = valueTypeName || getValueTypeName(value)
    this.message = tfPropertyErrorString(type, label, property, value, valueTypeName)
  } else {
    this.message = 'Unexpected property "' + property + '"'
  }

  Error.captureStackTrace(this, TfTypeError)
  this.__label = label
  this.__property = property
  this.__type = type
  this.__value = value
  this.__valueTypeName = valueTypeName
}

TfPropertyTypeError.prototype = Object.create(Error.prototype)
TfPropertyTypeError.prototype.constructor = TfTypeError

function tfCustomError (expected, actual) {
  return new TfTypeError(expected, {}, actual)
}

function tfSubError (e, property, label) {
  // sub child?
  if (e instanceof TfPropertyTypeError) {
    property = property + '.' + e.__property

    e = new TfPropertyTypeError(
      e.__type, property, e.__label, e.__value, e.__valueTypeName
    )

  // child?
  } else if (e instanceof TfTypeError) {
    e = new TfPropertyTypeError(
      e.__type, property, label, e.__value, e.__valueTypeName
    )
  }

  Error.captureStackTrace(e)
  return e
}

module.exports = {
  TfTypeError: TfTypeError,
  TfPropertyTypeError: TfPropertyTypeError,
  tfCustomError: tfCustomError,
  tfSubError: tfSubError,
  tfJSON: tfJSON,
  getValueTypeName: getValueTypeName
}


/***/ }),
/* 49 */
/***/ (function(module, exports, __webpack_require__) {

// Reference https://github.com/bitcoin/bips/blob/master/bip-0066.mediawiki
// Format: 0x30 [total-length] 0x02 [R-length] [R] 0x02 [S-length] [S]
// NOTE: SIGHASH byte ignored AND restricted, truncate before use

var Buffer = __webpack_require__(2).Buffer

function check (buffer) {
  if (buffer.length < 8) return false
  if (buffer.length > 72) return false
  if (buffer[0] !== 0x30) return false
  if (buffer[1] !== buffer.length - 2) return false
  if (buffer[2] !== 0x02) return false

  var lenR = buffer[3]
  if (lenR === 0) return false
  if (5 + lenR >= buffer.length) return false
  if (buffer[4 + lenR] !== 0x02) return false

  var lenS = buffer[5 + lenR]
  if (lenS === 0) return false
  if ((6 + lenR + lenS) !== buffer.length) return false

  if (buffer[4] & 0x80) return false
  if (lenR > 1 && (buffer[4] === 0x00) && !(buffer[5] & 0x80)) return false

  if (buffer[lenR + 6] & 0x80) return false
  if (lenS > 1 && (buffer[lenR + 6] === 0x00) && !(buffer[lenR + 7] & 0x80)) return false
  return true
}

function decode (buffer) {
  if (buffer.length < 8) throw new Error('DER sequence length is too short')
  if (buffer.length > 72) throw new Error('DER sequence length is too long')
  if (buffer[0] !== 0x30) throw new Error('Expected DER sequence')
  if (buffer[1] !== buffer.length - 2) throw new Error('DER sequence length is invalid')
  if (buffer[2] !== 0x02) throw new Error('Expected DER integer')

  var lenR = buffer[3]
  if (lenR === 0) throw new Error('R length is zero')
  if (5 + lenR >= buffer.length) throw new Error('R length is too long')
  if (buffer[4 + lenR] !== 0x02) throw new Error('Expected DER integer (2)')

  var lenS = buffer[5 + lenR]
  if (lenS === 0) throw new Error('S length is zero')
  if ((6 + lenR + lenS) !== buffer.length) throw new Error('S length is invalid')

  if (buffer[4] & 0x80) throw new Error('R value is negative')
  if (lenR > 1 && (buffer[4] === 0x00) && !(buffer[5] & 0x80)) throw new Error('R value excessively padded')

  if (buffer[lenR + 6] & 0x80) throw new Error('S value is negative')
  if (lenS > 1 && (buffer[lenR + 6] === 0x00) && !(buffer[lenR + 7] & 0x80)) throw new Error('S value excessively padded')

  // non-BIP66 - extract R, S values
  return {
    r: buffer.slice(4, 4 + lenR),
    s: buffer.slice(6 + lenR)
  }
}

/*
 * Expects r and s to be positive DER integers.
 *
 * The DER format uses the most significant bit as a sign bit (& 0x80).
 * If the significant bit is set AND the integer is positive, a 0x00 is prepended.
 *
 * Examples:
 *
 *      0 =>     0x00
 *      1 =>     0x01
 *     -1 =>     0xff
 *    127 =>     0x7f
 *   -127 =>     0x81
 *    128 =>   0x0080
 *   -128 =>     0x80
 *    255 =>   0x00ff
 *   -255 =>   0xff01
 *  16300 =>   0x3fac
 * -16300 =>   0xc054
 *  62300 => 0x00f35c
 * -62300 => 0xff0ca4
*/
function encode (r, s) {
  var lenR = r.length
  var lenS = s.length
  if (lenR === 0) throw new Error('R length is zero')
  if (lenS === 0) throw new Error('S length is zero')
  if (lenR > 33) throw new Error('R length is too long')
  if (lenS > 33) throw new Error('S length is too long')
  if (r[0] & 0x80) throw new Error('R value is negative')
  if (s[0] & 0x80) throw new Error('S value is negative')
  if (lenR > 1 && (r[0] === 0x00) && !(r[1] & 0x80)) throw new Error('R value excessively padded')
  if (lenS > 1 && (s[0] === 0x00) && !(s[1] & 0x80)) throw new Error('S value excessively padded')

  var signature = Buffer.allocUnsafe(6 + lenR + lenS)

  // 0x30 [total-length] 0x02 [R-length] [R] 0x02 [S-length] [S]
  signature[0] = 0x30
  signature[1] = signature.length - 2
  signature[2] = 0x02
  signature[3] = r.length
  r.copy(signature, 4)
  signature[4 + lenR] = 0x02
  signature[5 + lenR] = s.length
  s.copy(signature, 6 + lenR)

  return signature
}

module.exports = {
  check: check,
  decode: decode,
  encode: encode
}


/***/ }),
/* 50 */
/***/ (function(module, exports, __webpack_require__) {

var OPS = __webpack_require__(6)

function encodingLength (i) {
  return i < OPS.OP_PUSHDATA1 ? 1
  : i <= 0xff ? 2
  : i <= 0xffff ? 3
  : 5
}

function encode (buffer, number, offset) {
  var size = encodingLength(number)

  // ~6 bit
  if (size === 1) {
    buffer.writeUInt8(number, offset)

  // 8 bit
  } else if (size === 2) {
    buffer.writeUInt8(OPS.OP_PUSHDATA1, offset)
    buffer.writeUInt8(number, offset + 1)

  // 16 bit
  } else if (size === 3) {
    buffer.writeUInt8(OPS.OP_PUSHDATA2, offset)
    buffer.writeUInt16LE(number, offset + 1)

  // 32 bit
  } else {
    buffer.writeUInt8(OPS.OP_PUSHDATA4, offset)
    buffer.writeUInt32LE(number, offset + 1)
  }

  return size
}

function decode (buffer, offset) {
  var opcode = buffer.readUInt8(offset)
  var number, size

  // ~6 bit
  if (opcode < OPS.OP_PUSHDATA1) {
    number = opcode
    size = 1

  // 8 bit
  } else if (opcode === OPS.OP_PUSHDATA1) {
    if (offset + 2 > buffer.length) return null
    number = buffer.readUInt8(offset + 1)
    size = 2

  // 16 bit
  } else if (opcode === OPS.OP_PUSHDATA2) {
    if (offset + 3 > buffer.length) return null
    number = buffer.readUInt16LE(offset + 1)
    size = 3

  // 32 bit
  } else {
    if (offset + 5 > buffer.length) return null
    if (opcode !== OPS.OP_PUSHDATA4) throw new Error('Unexpected opcode')

    number = buffer.readUInt32LE(offset + 1)
    size = 5
  }

  return {
    opcode: opcode,
    number: number,
    size: size
  }
}

module.exports = {
  encodingLength: encodingLength,
  encode: encode,
  decode: decode
}


/***/ }),
/* 51 */
/***/ (function(module, exports, __webpack_require__) {

var Buffer = __webpack_require__(2).Buffer

function decode (buffer, maxLength, minimal) {
  maxLength = maxLength || 4
  minimal = minimal === undefined ? true : minimal

  var length = buffer.length
  if (length === 0) return 0
  if (length > maxLength) throw new TypeError('Script number overflow')
  if (minimal) {
    if ((buffer[length - 1] & 0x7f) === 0) {
      if (length <= 1 || (buffer[length - 2] & 0x80) === 0) throw new Error('Non-minimally encoded script number')
    }
  }

  // 40-bit
  if (length === 5) {
    var a = buffer.readUInt32LE(0)
    var b = buffer.readUInt8(4)

    if (b & 0x80) return -(((b & ~0x80) * 0x100000000) + a)
    return (b * 0x100000000) + a
  }

  var result = 0

  // 32-bit / 24-bit / 16-bit / 8-bit
  for (var i = 0; i < length; ++i) {
    result |= buffer[i] << (8 * i)
  }

  if (buffer[length - 1] & 0x80) return -(result & ~(0x80 << (8 * (length - 1))))
  return result
}

function scriptNumSize (i) {
  return i > 0x7fffffff ? 5
  : i > 0x7fffff ? 4
  : i > 0x7fff ? 3
  : i > 0x7f ? 2
  : i > 0x00 ? 1
  : 0
}

function encode (number) {
  var value = Math.abs(number)
  var size = scriptNumSize(value)
  var buffer = Buffer.allocUnsafe(size)
  var negative = number < 0

  for (var i = 0; i < size; ++i) {
    buffer.writeUInt8(value & 0xff, i)
    value >>= 8
  }

  if (buffer[size - 1] & 0x80) {
    buffer.writeUInt8(negative ? 0x80 : 0x00, size - 1)
  } else if (negative) {
    buffer[size - 1] |= 0x80
  }

  return buffer
}

module.exports = {
  decode: decode,
  encode: encode
}


/***/ }),
/* 52 */
/***/ (function(module, exports, __webpack_require__) {

// <scriptSig> {serialized scriptPubKey script}

var Buffer = __webpack_require__(2).Buffer
var bscript = __webpack_require__(4)
var typeforce = __webpack_require__(0)

function check (script, allowIncomplete) {
  var chunks = bscript.decompile(script)
  if (chunks.length < 1) return false

  var lastChunk = chunks[chunks.length - 1]
  if (!Buffer.isBuffer(lastChunk)) return false

  var scriptSigChunks = bscript.decompile(bscript.compile(chunks.slice(0, -1)))
  var redeemScriptChunks = bscript.decompile(lastChunk)

  // is redeemScript a valid script?
  if (redeemScriptChunks.length === 0) return false

  // is redeemScriptSig push only?
  if (!bscript.isPushOnly(scriptSigChunks)) return false

  var inputType = bscript.classifyInput(scriptSigChunks, allowIncomplete)
  var outputType = bscript.classifyOutput(redeemScriptChunks)
  if (chunks.length === 1) {
    return outputType === bscript.types.P2WSH || outputType === bscript.types.P2WPKH
  }
  return inputType === outputType
}
check.toJSON = function () { return 'scriptHash input' }

function encodeStack (redeemScriptStack, redeemScript) {
  var serializedScriptPubKey = bscript.compile(redeemScript)

  return [].concat(redeemScriptStack, serializedScriptPubKey)
}

function encode (redeemScriptSig, redeemScript) {
  var redeemScriptStack = bscript.decompile(redeemScriptSig)

  return bscript.compile(encodeStack(redeemScriptStack, redeemScript))
}

function decodeStack (stack) {
  typeforce(check, stack)

  return {
    redeemScriptStack: stack.slice(0, -1),
    redeemScript: stack[stack.length - 1]
  }
}

function decode (buffer) {
  var stack = bscript.decompile(buffer)
  var result = decodeStack(stack)
  result.redeemScriptSig = bscript.compile(result.redeemScriptStack)
  delete result.redeemScriptStack
  return result
}

module.exports = {
  check: check,
  decode: decode,
  decodeStack: decodeStack,
  encode: encode,
  encodeStack: encodeStack
}


/***/ }),
/* 53 */
/***/ (function(module, exports, __webpack_require__) {

var pushdata = __webpack_require__(50)
var varuint = __webpack_require__(24)

// https://github.com/feross/buffer/blob/master/index.js#L1127
function verifuint (value, max) {
  if (typeof value !== 'number') throw new Error('cannot write a non-number as a number')
  if (value < 0) throw new Error('specified a negative value for writing an unsigned value')
  if (value > max) throw new Error('RangeError: value out of range')
  if (Math.floor(value) !== value) throw new Error('value has a fractional component')
}

function readUInt64LE (buffer, offset) {
  var a = buffer.readUInt32LE(offset)
  var b = buffer.readUInt32LE(offset + 4)
  b *= 0x100000000

  verifuint(b + a, 0x001fffffffffffff)

  return b + a
}

function writeUInt64LE (buffer, value, offset) {
  verifuint(value, 0x001fffffffffffff)

  buffer.writeInt32LE(value & -1, offset)
  buffer.writeUInt32LE(Math.floor(value / 0x100000000), offset + 4)
  return offset + 8
}

// TODO: remove in 4.0.0?
function readVarInt (buffer, offset) {
  var result = varuint.decode(buffer, offset)

  return {
    number: result,
    size: varuint.decode.bytes
  }
}

// TODO: remove in 4.0.0?
function writeVarInt (buffer, number, offset) {
  varuint.encode(number, buffer, offset)
  return varuint.encode.bytes
}

module.exports = {
  pushDataSize: pushdata.encodingLength,
  readPushDataInt: pushdata.decode,
  readUInt64LE: readUInt64LE,
  readVarInt: readVarInt,
  varIntBuffer: varuint.encode,
  varIntSize: varuint.encodingLength,
  writePushDataInt: pushdata.encode,
  writeUInt64LE: writeUInt64LE,
  writeVarInt: writeVarInt
}


/***/ }),
/* 54 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var inherits = __webpack_require__(3)
var Legacy = __webpack_require__(152)
var Base = __webpack_require__(22)
var Buffer = __webpack_require__(2).Buffer
var md5 = __webpack_require__(38)
var RIPEMD160 = __webpack_require__(39)

var sha = __webpack_require__(45)

var ZEROS = Buffer.alloc(128)

function Hmac (alg, key) {
  Base.call(this, 'digest')
  if (typeof key === 'string') {
    key = Buffer.from(key)
  }

  var blocksize = (alg === 'sha512' || alg === 'sha384') ? 128 : 64

  this._alg = alg
  this._key = key
  if (key.length > blocksize) {
    var hash = alg === 'rmd160' ? new RIPEMD160() : sha(alg)
    key = hash.update(key).digest()
  } else if (key.length < blocksize) {
    key = Buffer.concat([key, ZEROS], blocksize)
  }

  var ipad = this._ipad = Buffer.allocUnsafe(blocksize)
  var opad = this._opad = Buffer.allocUnsafe(blocksize)

  for (var i = 0; i < blocksize; i++) {
    ipad[i] = key[i] ^ 0x36
    opad[i] = key[i] ^ 0x5C
  }
  this._hash = alg === 'rmd160' ? new RIPEMD160() : sha(alg)
  this._hash.update(ipad)
}

inherits(Hmac, Base)

Hmac.prototype._update = function (data) {
  this._hash.update(data)
}

Hmac.prototype._final = function () {
  var h = this._hash.digest()
  var hash = this._alg === 'rmd160' ? new RIPEMD160() : sha(this._alg)
  return hash.update(this._opad).update(h).digest()
}

module.exports = function createHmac (alg, key) {
  alg = alg.toLowerCase()
  if (alg === 'rmd160' || alg === 'ripemd160') {
    return new Hmac('rmd160', key)
  }
  if (alg === 'md5') {
    return new Legacy(md5, key)
  }
  return new Hmac(alg, key)
}


/***/ }),
/* 55 */
/***/ (function(module, exports, __webpack_require__) {

// (public) Constructor
function BigInteger(a, b, c) {
  if (!(this instanceof BigInteger))
    return new BigInteger(a, b, c)

  if (a != null) {
    if ("number" == typeof a) this.fromNumber(a, b, c)
    else if (b == null && "string" != typeof a) this.fromString(a, 256)
    else this.fromString(a, b)
  }
}

var proto = BigInteger.prototype

// duck-typed isBigInteger
proto.__bigi = __webpack_require__(153).version
BigInteger.isBigInteger = function (obj, check_ver) {
  return obj && obj.__bigi && (!check_ver || obj.__bigi === proto.__bigi)
}

// Bits per digit
var dbits

// am: Compute w_j += (x*this_i), propagate carries,
// c is initial carry, returns final carry.
// c < 3*dvalue, x < 2*dvalue, this_i < dvalue
// We need to select the fastest one that works in this environment.

// am1: use a single mult and divide to get the high bits,
// max digit bits should be 26 because
// max internal value = 2*dvalue^2-2*dvalue (< 2^53)
function am1(i, x, w, j, c, n) {
  while (--n >= 0) {
    var v = x * this[i++] + w[j] + c
    c = Math.floor(v / 0x4000000)
    w[j++] = v & 0x3ffffff
  }
  return c
}
// am2 avoids a big mult-and-extract completely.
// Max digit bits should be <= 30 because we do bitwise ops
// on values up to 2*hdvalue^2-hdvalue-1 (< 2^31)
function am2(i, x, w, j, c, n) {
  var xl = x & 0x7fff,
    xh = x >> 15
  while (--n >= 0) {
    var l = this[i] & 0x7fff
    var h = this[i++] >> 15
    var m = xh * l + h * xl
    l = xl * l + ((m & 0x7fff) << 15) + w[j] + (c & 0x3fffffff)
    c = (l >>> 30) + (m >>> 15) + xh * h + (c >>> 30)
    w[j++] = l & 0x3fffffff
  }
  return c
}
// Alternately, set max digit bits to 28 since some
// browsers slow down when dealing with 32-bit numbers.
function am3(i, x, w, j, c, n) {
  var xl = x & 0x3fff,
    xh = x >> 14
  while (--n >= 0) {
    var l = this[i] & 0x3fff
    var h = this[i++] >> 14
    var m = xh * l + h * xl
    l = xl * l + ((m & 0x3fff) << 14) + w[j] + c
    c = (l >> 28) + (m >> 14) + xh * h
    w[j++] = l & 0xfffffff
  }
  return c
}

// wtf?
BigInteger.prototype.am = am1
dbits = 26

BigInteger.prototype.DB = dbits
BigInteger.prototype.DM = ((1 << dbits) - 1)
var DV = BigInteger.prototype.DV = (1 << dbits)

var BI_FP = 52
BigInteger.prototype.FV = Math.pow(2, BI_FP)
BigInteger.prototype.F1 = BI_FP - dbits
BigInteger.prototype.F2 = 2 * dbits - BI_FP

// Digit conversions
var BI_RM = "0123456789abcdefghijklmnopqrstuvwxyz"
var BI_RC = new Array()
var rr, vv
rr = "0".charCodeAt(0)
for (vv = 0; vv <= 9; ++vv) BI_RC[rr++] = vv
rr = "a".charCodeAt(0)
for (vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv
rr = "A".charCodeAt(0)
for (vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv

function int2char(n) {
  return BI_RM.charAt(n)
}

function intAt(s, i) {
  var c = BI_RC[s.charCodeAt(i)]
  return (c == null) ? -1 : c
}

// (protected) copy this to r
function bnpCopyTo(r) {
  for (var i = this.t - 1; i >= 0; --i) r[i] = this[i]
  r.t = this.t
  r.s = this.s
}

// (protected) set from integer value x, -DV <= x < DV
function bnpFromInt(x) {
  this.t = 1
  this.s = (x < 0) ? -1 : 0
  if (x > 0) this[0] = x
  else if (x < -1) this[0] = x + DV
  else this.t = 0
}

// return bigint initialized to value
function nbv(i) {
  var r = new BigInteger()
  r.fromInt(i)
  return r
}

// (protected) set from string and radix
function bnpFromString(s, b) {
  var self = this

  var k
  if (b == 16) k = 4
  else if (b == 8) k = 3
  else if (b == 256) k = 8; // byte array
  else if (b == 2) k = 1
  else if (b == 32) k = 5
  else if (b == 4) k = 2
  else {
    self.fromRadix(s, b)
    return
  }
  self.t = 0
  self.s = 0
  var i = s.length,
    mi = false,
    sh = 0
  while (--i >= 0) {
    var x = (k == 8) ? s[i] & 0xff : intAt(s, i)
    if (x < 0) {
      if (s.charAt(i) == "-") mi = true
      continue
    }
    mi = false
    if (sh == 0)
      self[self.t++] = x
    else if (sh + k > self.DB) {
      self[self.t - 1] |= (x & ((1 << (self.DB - sh)) - 1)) << sh
      self[self.t++] = (x >> (self.DB - sh))
    } else
      self[self.t - 1] |= x << sh
    sh += k
    if (sh >= self.DB) sh -= self.DB
  }
  if (k == 8 && (s[0] & 0x80) != 0) {
    self.s = -1
    if (sh > 0) self[self.t - 1] |= ((1 << (self.DB - sh)) - 1) << sh
  }
  self.clamp()
  if (mi) BigInteger.ZERO.subTo(self, self)
}

// (protected) clamp off excess high words
function bnpClamp() {
  var c = this.s & this.DM
  while (this.t > 0 && this[this.t - 1] == c)--this.t
}

// (public) return string representation in given radix
function bnToString(b) {
  var self = this
  if (self.s < 0) return "-" + self.negate()
    .toString(b)
  var k
  if (b == 16) k = 4
  else if (b == 8) k = 3
  else if (b == 2) k = 1
  else if (b == 32) k = 5
  else if (b == 4) k = 2
  else return self.toRadix(b)
  var km = (1 << k) - 1,
    d, m = false,
    r = "",
    i = self.t
  var p = self.DB - (i * self.DB) % k
  if (i-- > 0) {
    if (p < self.DB && (d = self[i] >> p) > 0) {
      m = true
      r = int2char(d)
    }
    while (i >= 0) {
      if (p < k) {
        d = (self[i] & ((1 << p) - 1)) << (k - p)
        d |= self[--i] >> (p += self.DB - k)
      } else {
        d = (self[i] >> (p -= k)) & km
        if (p <= 0) {
          p += self.DB
          --i
        }
      }
      if (d > 0) m = true
      if (m) r += int2char(d)
    }
  }
  return m ? r : "0"
}

// (public) -this
function bnNegate() {
  var r = new BigInteger()
  BigInteger.ZERO.subTo(this, r)
  return r
}

// (public) |this|
function bnAbs() {
  return (this.s < 0) ? this.negate() : this
}

// (public) return + if this > a, - if this < a, 0 if equal
function bnCompareTo(a) {
  var r = this.s - a.s
  if (r != 0) return r
  var i = this.t
  r = i - a.t
  if (r != 0) return (this.s < 0) ? -r : r
  while (--i >= 0)
    if ((r = this[i] - a[i]) != 0) return r
  return 0
}

// returns bit length of the integer x
function nbits(x) {
  var r = 1,
    t
  if ((t = x >>> 16) != 0) {
    x = t
    r += 16
  }
  if ((t = x >> 8) != 0) {
    x = t
    r += 8
  }
  if ((t = x >> 4) != 0) {
    x = t
    r += 4
  }
  if ((t = x >> 2) != 0) {
    x = t
    r += 2
  }
  if ((t = x >> 1) != 0) {
    x = t
    r += 1
  }
  return r
}

// (public) return the number of bits in "this"
function bnBitLength() {
  if (this.t <= 0) return 0
  return this.DB * (this.t - 1) + nbits(this[this.t - 1] ^ (this.s & this.DM))
}

// (public) return the number of bytes in "this"
function bnByteLength() {
  return this.bitLength() >> 3
}

// (protected) r = this << n*DB
function bnpDLShiftTo(n, r) {
  var i
  for (i = this.t - 1; i >= 0; --i) r[i + n] = this[i]
  for (i = n - 1; i >= 0; --i) r[i] = 0
  r.t = this.t + n
  r.s = this.s
}

// (protected) r = this >> n*DB
function bnpDRShiftTo(n, r) {
  for (var i = n; i < this.t; ++i) r[i - n] = this[i]
  r.t = Math.max(this.t - n, 0)
  r.s = this.s
}

// (protected) r = this << n
function bnpLShiftTo(n, r) {
  var self = this
  var bs = n % self.DB
  var cbs = self.DB - bs
  var bm = (1 << cbs) - 1
  var ds = Math.floor(n / self.DB),
    c = (self.s << bs) & self.DM,
    i
  for (i = self.t - 1; i >= 0; --i) {
    r[i + ds + 1] = (self[i] >> cbs) | c
    c = (self[i] & bm) << bs
  }
  for (i = ds - 1; i >= 0; --i) r[i] = 0
  r[ds] = c
  r.t = self.t + ds + 1
  r.s = self.s
  r.clamp()
}

// (protected) r = this >> n
function bnpRShiftTo(n, r) {
  var self = this
  r.s = self.s
  var ds = Math.floor(n / self.DB)
  if (ds >= self.t) {
    r.t = 0
    return
  }
  var bs = n % self.DB
  var cbs = self.DB - bs
  var bm = (1 << bs) - 1
  r[0] = self[ds] >> bs
  for (var i = ds + 1; i < self.t; ++i) {
    r[i - ds - 1] |= (self[i] & bm) << cbs
    r[i - ds] = self[i] >> bs
  }
  if (bs > 0) r[self.t - ds - 1] |= (self.s & bm) << cbs
  r.t = self.t - ds
  r.clamp()
}

// (protected) r = this - a
function bnpSubTo(a, r) {
  var self = this
  var i = 0,
    c = 0,
    m = Math.min(a.t, self.t)
  while (i < m) {
    c += self[i] - a[i]
    r[i++] = c & self.DM
    c >>= self.DB
  }
  if (a.t < self.t) {
    c -= a.s
    while (i < self.t) {
      c += self[i]
      r[i++] = c & self.DM
      c >>= self.DB
    }
    c += self.s
  } else {
    c += self.s
    while (i < a.t) {
      c -= a[i]
      r[i++] = c & self.DM
      c >>= self.DB
    }
    c -= a.s
  }
  r.s = (c < 0) ? -1 : 0
  if (c < -1) r[i++] = self.DV + c
  else if (c > 0) r[i++] = c
  r.t = i
  r.clamp()
}

// (protected) r = this * a, r != this,a (HAC 14.12)
// "this" should be the larger one if appropriate.
function bnpMultiplyTo(a, r) {
  var x = this.abs(),
    y = a.abs()
  var i = x.t
  r.t = i + y.t
  while (--i >= 0) r[i] = 0
  for (i = 0; i < y.t; ++i) r[i + x.t] = x.am(0, y[i], r, i, 0, x.t)
  r.s = 0
  r.clamp()
  if (this.s != a.s) BigInteger.ZERO.subTo(r, r)
}

// (protected) r = this^2, r != this (HAC 14.16)
function bnpSquareTo(r) {
  var x = this.abs()
  var i = r.t = 2 * x.t
  while (--i >= 0) r[i] = 0
  for (i = 0; i < x.t - 1; ++i) {
    var c = x.am(i, x[i], r, 2 * i, 0, 1)
    if ((r[i + x.t] += x.am(i + 1, 2 * x[i], r, 2 * i + 1, c, x.t - i - 1)) >= x.DV) {
      r[i + x.t] -= x.DV
      r[i + x.t + 1] = 1
    }
  }
  if (r.t > 0) r[r.t - 1] += x.am(i, x[i], r, 2 * i, 0, 1)
  r.s = 0
  r.clamp()
}

// (protected) divide this by m, quotient and remainder to q, r (HAC 14.20)
// r != q, this != m.  q or r may be null.
function bnpDivRemTo(m, q, r) {
  var self = this
  var pm = m.abs()
  if (pm.t <= 0) return
  var pt = self.abs()
  if (pt.t < pm.t) {
    if (q != null) q.fromInt(0)
    if (r != null) self.copyTo(r)
    return
  }
  if (r == null) r = new BigInteger()
  var y = new BigInteger(),
    ts = self.s,
    ms = m.s
  var nsh = self.DB - nbits(pm[pm.t - 1]); // normalize modulus
  if (nsh > 0) {
    pm.lShiftTo(nsh, y)
    pt.lShiftTo(nsh, r)
  } else {
    pm.copyTo(y)
    pt.copyTo(r)
  }
  var ys = y.t
  var y0 = y[ys - 1]
  if (y0 == 0) return
  var yt = y0 * (1 << self.F1) + ((ys > 1) ? y[ys - 2] >> self.F2 : 0)
  var d1 = self.FV / yt,
    d2 = (1 << self.F1) / yt,
    e = 1 << self.F2
  var i = r.t,
    j = i - ys,
    t = (q == null) ? new BigInteger() : q
  y.dlShiftTo(j, t)
  if (r.compareTo(t) >= 0) {
    r[r.t++] = 1
    r.subTo(t, r)
  }
  BigInteger.ONE.dlShiftTo(ys, t)
  t.subTo(y, y); // "negative" y so we can replace sub with am later
  while (y.t < ys) y[y.t++] = 0
  while (--j >= 0) {
    // Estimate quotient digit
    var qd = (r[--i] == y0) ? self.DM : Math.floor(r[i] * d1 + (r[i - 1] + e) * d2)
    if ((r[i] += y.am(0, qd, r, j, 0, ys)) < qd) { // Try it out
      y.dlShiftTo(j, t)
      r.subTo(t, r)
      while (r[i] < --qd) r.subTo(t, r)
    }
  }
  if (q != null) {
    r.drShiftTo(ys, q)
    if (ts != ms) BigInteger.ZERO.subTo(q, q)
  }
  r.t = ys
  r.clamp()
  if (nsh > 0) r.rShiftTo(nsh, r); // Denormalize remainder
  if (ts < 0) BigInteger.ZERO.subTo(r, r)
}

// (public) this mod a
function bnMod(a) {
  var r = new BigInteger()
  this.abs()
    .divRemTo(a, null, r)
  if (this.s < 0 && r.compareTo(BigInteger.ZERO) > 0) a.subTo(r, r)
  return r
}

// Modular reduction using "classic" algorithm
function Classic(m) {
  this.m = m
}

function cConvert(x) {
  if (x.s < 0 || x.compareTo(this.m) >= 0) return x.mod(this.m)
  else return x
}

function cRevert(x) {
  return x
}

function cReduce(x) {
  x.divRemTo(this.m, null, x)
}

function cMulTo(x, y, r) {
  x.multiplyTo(y, r)
  this.reduce(r)
}

function cSqrTo(x, r) {
  x.squareTo(r)
  this.reduce(r)
}

Classic.prototype.convert = cConvert
Classic.prototype.revert = cRevert
Classic.prototype.reduce = cReduce
Classic.prototype.mulTo = cMulTo
Classic.prototype.sqrTo = cSqrTo

// (protected) return "-1/this % 2^DB"; useful for Mont. reduction
// justification:
//         xy == 1 (mod m)
//         xy =  1+km
//   xy(2-xy) = (1+km)(1-km)
// x[y(2-xy)] = 1-k^2m^2
// x[y(2-xy)] == 1 (mod m^2)
// if y is 1/x mod m, then y(2-xy) is 1/x mod m^2
// should reduce x and y(2-xy) by m^2 at each step to keep size bounded.
// JS multiply "overflows" differently from C/C++, so care is needed here.
function bnpInvDigit() {
  if (this.t < 1) return 0
  var x = this[0]
  if ((x & 1) == 0) return 0
  var y = x & 3; // y == 1/x mod 2^2
  y = (y * (2 - (x & 0xf) * y)) & 0xf; // y == 1/x mod 2^4
  y = (y * (2 - (x & 0xff) * y)) & 0xff; // y == 1/x mod 2^8
  y = (y * (2 - (((x & 0xffff) * y) & 0xffff))) & 0xffff; // y == 1/x mod 2^16
  // last step - calculate inverse mod DV directly
  // assumes 16 < DB <= 32 and assumes ability to handle 48-bit ints
  y = (y * (2 - x * y % this.DV)) % this.DV; // y == 1/x mod 2^dbits
  // we really want the negative inverse, and -DV < y < DV
  return (y > 0) ? this.DV - y : -y
}

// Montgomery reduction
function Montgomery(m) {
  this.m = m
  this.mp = m.invDigit()
  this.mpl = this.mp & 0x7fff
  this.mph = this.mp >> 15
  this.um = (1 << (m.DB - 15)) - 1
  this.mt2 = 2 * m.t
}

// xR mod m
function montConvert(x) {
  var r = new BigInteger()
  x.abs()
    .dlShiftTo(this.m.t, r)
  r.divRemTo(this.m, null, r)
  if (x.s < 0 && r.compareTo(BigInteger.ZERO) > 0) this.m.subTo(r, r)
  return r
}

// x/R mod m
function montRevert(x) {
  var r = new BigInteger()
  x.copyTo(r)
  this.reduce(r)
  return r
}

// x = x/R mod m (HAC 14.32)
function montReduce(x) {
  while (x.t <= this.mt2) // pad x so am has enough room later
    x[x.t++] = 0
  for (var i = 0; i < this.m.t; ++i) {
    // faster way of calculating u0 = x[i]*mp mod DV
    var j = x[i] & 0x7fff
    var u0 = (j * this.mpl + (((j * this.mph + (x[i] >> 15) * this.mpl) & this.um) << 15)) & x.DM
    // use am to combine the multiply-shift-add into one call
    j = i + this.m.t
    x[j] += this.m.am(0, u0, x, i, 0, this.m.t)
    // propagate carry
    while (x[j] >= x.DV) {
      x[j] -= x.DV
      x[++j]++
    }
  }
  x.clamp()
  x.drShiftTo(this.m.t, x)
  if (x.compareTo(this.m) >= 0) x.subTo(this.m, x)
}

// r = "x^2/R mod m"; x != r
function montSqrTo(x, r) {
  x.squareTo(r)
  this.reduce(r)
}

// r = "xy/R mod m"; x,y != r
function montMulTo(x, y, r) {
  x.multiplyTo(y, r)
  this.reduce(r)
}

Montgomery.prototype.convert = montConvert
Montgomery.prototype.revert = montRevert
Montgomery.prototype.reduce = montReduce
Montgomery.prototype.mulTo = montMulTo
Montgomery.prototype.sqrTo = montSqrTo

// (protected) true iff this is even
function bnpIsEven() {
  return ((this.t > 0) ? (this[0] & 1) : this.s) == 0
}

// (protected) this^e, e < 2^32, doing sqr and mul with "r" (HAC 14.79)
function bnpExp(e, z) {
  if (e > 0xffffffff || e < 1) return BigInteger.ONE
  var r = new BigInteger(),
    r2 = new BigInteger(),
    g = z.convert(this),
    i = nbits(e) - 1
  g.copyTo(r)
  while (--i >= 0) {
    z.sqrTo(r, r2)
    if ((e & (1 << i)) > 0) z.mulTo(r2, g, r)
    else {
      var t = r
      r = r2
      r2 = t
    }
  }
  return z.revert(r)
}

// (public) this^e % m, 0 <= e < 2^32
function bnModPowInt(e, m) {
  var z
  if (e < 256 || m.isEven()) z = new Classic(m)
  else z = new Montgomery(m)
  return this.exp(e, z)
}

// protected
proto.copyTo = bnpCopyTo
proto.fromInt = bnpFromInt
proto.fromString = bnpFromString
proto.clamp = bnpClamp
proto.dlShiftTo = bnpDLShiftTo
proto.drShiftTo = bnpDRShiftTo
proto.lShiftTo = bnpLShiftTo
proto.rShiftTo = bnpRShiftTo
proto.subTo = bnpSubTo
proto.multiplyTo = bnpMultiplyTo
proto.squareTo = bnpSquareTo
proto.divRemTo = bnpDivRemTo
proto.invDigit = bnpInvDigit
proto.isEven = bnpIsEven
proto.exp = bnpExp

// public
proto.toString = bnToString
proto.negate = bnNegate
proto.abs = bnAbs
proto.compareTo = bnCompareTo
proto.bitLength = bnBitLength
proto.byteLength = bnByteLength
proto.mod = bnMod
proto.modPowInt = bnModPowInt

// (public)
function bnClone() {
  var r = new BigInteger()
  this.copyTo(r)
  return r
}

// (public) return value as integer
function bnIntValue() {
  if (this.s < 0) {
    if (this.t == 1) return this[0] - this.DV
    else if (this.t == 0) return -1
  } else if (this.t == 1) return this[0]
  else if (this.t == 0) return 0
  // assumes 16 < DB < 32
  return ((this[1] & ((1 << (32 - this.DB)) - 1)) << this.DB) | this[0]
}

// (public) return value as byte
function bnByteValue() {
  return (this.t == 0) ? this.s : (this[0] << 24) >> 24
}

// (public) return value as short (assumes DB>=16)
function bnShortValue() {
  return (this.t == 0) ? this.s : (this[0] << 16) >> 16
}

// (protected) return x s.t. r^x < DV
function bnpChunkSize(r) {
  return Math.floor(Math.LN2 * this.DB / Math.log(r))
}

// (public) 0 if this == 0, 1 if this > 0
function bnSigNum() {
  if (this.s < 0) return -1
  else if (this.t <= 0 || (this.t == 1 && this[0] <= 0)) return 0
  else return 1
}

// (protected) convert to radix string
function bnpToRadix(b) {
  if (b == null) b = 10
  if (this.signum() == 0 || b < 2 || b > 36) return "0"
  var cs = this.chunkSize(b)
  var a = Math.pow(b, cs)
  var d = nbv(a),
    y = new BigInteger(),
    z = new BigInteger(),
    r = ""
  this.divRemTo(d, y, z)
  while (y.signum() > 0) {
    r = (a + z.intValue())
      .toString(b)
      .substr(1) + r
    y.divRemTo(d, y, z)
  }
  return z.intValue()
    .toString(b) + r
}

// (protected) convert from radix string
function bnpFromRadix(s, b) {
  var self = this
  self.fromInt(0)
  if (b == null) b = 10
  var cs = self.chunkSize(b)
  var d = Math.pow(b, cs),
    mi = false,
    j = 0,
    w = 0
  for (var i = 0; i < s.length; ++i) {
    var x = intAt(s, i)
    if (x < 0) {
      if (s.charAt(i) == "-" && self.signum() == 0) mi = true
      continue
    }
    w = b * w + x
    if (++j >= cs) {
      self.dMultiply(d)
      self.dAddOffset(w, 0)
      j = 0
      w = 0
    }
  }
  if (j > 0) {
    self.dMultiply(Math.pow(b, j))
    self.dAddOffset(w, 0)
  }
  if (mi) BigInteger.ZERO.subTo(self, self)
}

// (protected) alternate constructor
function bnpFromNumber(a, b, c) {
  var self = this
  if ("number" == typeof b) {
    // new BigInteger(int,int,RNG)
    if (a < 2) self.fromInt(1)
    else {
      self.fromNumber(a, c)
      if (!self.testBit(a - 1)) // force MSB set
        self.bitwiseTo(BigInteger.ONE.shiftLeft(a - 1), op_or, self)
      if (self.isEven()) self.dAddOffset(1, 0); // force odd
      while (!self.isProbablePrime(b)) {
        self.dAddOffset(2, 0)
        if (self.bitLength() > a) self.subTo(BigInteger.ONE.shiftLeft(a - 1), self)
      }
    }
  } else {
    // new BigInteger(int,RNG)
    var x = new Array(),
      t = a & 7
    x.length = (a >> 3) + 1
    b.nextBytes(x)
    if (t > 0) x[0] &= ((1 << t) - 1)
    else x[0] = 0
    self.fromString(x, 256)
  }
}

// (public) convert to bigendian byte array
function bnToByteArray() {
  var self = this
  var i = self.t,
    r = new Array()
  r[0] = self.s
  var p = self.DB - (i * self.DB) % 8,
    d, k = 0
  if (i-- > 0) {
    if (p < self.DB && (d = self[i] >> p) != (self.s & self.DM) >> p)
      r[k++] = d | (self.s << (self.DB - p))
    while (i >= 0) {
      if (p < 8) {
        d = (self[i] & ((1 << p) - 1)) << (8 - p)
        d |= self[--i] >> (p += self.DB - 8)
      } else {
        d = (self[i] >> (p -= 8)) & 0xff
        if (p <= 0) {
          p += self.DB
          --i
        }
      }
      if ((d & 0x80) != 0) d |= -256
      if (k === 0 && (self.s & 0x80) != (d & 0x80))++k
      if (k > 0 || d != self.s) r[k++] = d
    }
  }
  return r
}

function bnEquals(a) {
  return (this.compareTo(a) == 0)
}

function bnMin(a) {
  return (this.compareTo(a) < 0) ? this : a
}

function bnMax(a) {
  return (this.compareTo(a) > 0) ? this : a
}

// (protected) r = this op a (bitwise)
function bnpBitwiseTo(a, op, r) {
  var self = this
  var i, f, m = Math.min(a.t, self.t)
  for (i = 0; i < m; ++i) r[i] = op(self[i], a[i])
  if (a.t < self.t) {
    f = a.s & self.DM
    for (i = m; i < self.t; ++i) r[i] = op(self[i], f)
    r.t = self.t
  } else {
    f = self.s & self.DM
    for (i = m; i < a.t; ++i) r[i] = op(f, a[i])
    r.t = a.t
  }
  r.s = op(self.s, a.s)
  r.clamp()
}

// (public) this & a
function op_and(x, y) {
  return x & y
}

function bnAnd(a) {
  var r = new BigInteger()
  this.bitwiseTo(a, op_and, r)
  return r
}

// (public) this | a
function op_or(x, y) {
  return x | y
}

function bnOr(a) {
  var r = new BigInteger()
  this.bitwiseTo(a, op_or, r)
  return r
}

// (public) this ^ a
function op_xor(x, y) {
  return x ^ y
}

function bnXor(a) {
  var r = new BigInteger()
  this.bitwiseTo(a, op_xor, r)
  return r
}

// (public) this & ~a
function op_andnot(x, y) {
  return x & ~y
}

function bnAndNot(a) {
  var r = new BigInteger()
  this.bitwiseTo(a, op_andnot, r)
  return r
}

// (public) ~this
function bnNot() {
  var r = new BigInteger()
  for (var i = 0; i < this.t; ++i) r[i] = this.DM & ~this[i]
  r.t = this.t
  r.s = ~this.s
  return r
}

// (public) this << n
function bnShiftLeft(n) {
  var r = new BigInteger()
  if (n < 0) this.rShiftTo(-n, r)
  else this.lShiftTo(n, r)
  return r
}

// (public) this >> n
function bnShiftRight(n) {
  var r = new BigInteger()
  if (n < 0) this.lShiftTo(-n, r)
  else this.rShiftTo(n, r)
  return r
}

// return index of lowest 1-bit in x, x < 2^31
function lbit(x) {
  if (x == 0) return -1
  var r = 0
  if ((x & 0xffff) == 0) {
    x >>= 16
    r += 16
  }
  if ((x & 0xff) == 0) {
    x >>= 8
    r += 8
  }
  if ((x & 0xf) == 0) {
    x >>= 4
    r += 4
  }
  if ((x & 3) == 0) {
    x >>= 2
    r += 2
  }
  if ((x & 1) == 0)++r
  return r
}

// (public) returns index of lowest 1-bit (or -1 if none)
function bnGetLowestSetBit() {
  for (var i = 0; i < this.t; ++i)
    if (this[i] != 0) return i * this.DB + lbit(this[i])
  if (this.s < 0) return this.t * this.DB
  return -1
}

// return number of 1 bits in x
function cbit(x) {
  var r = 0
  while (x != 0) {
    x &= x - 1
    ++r
  }
  return r
}

// (public) return number of set bits
function bnBitCount() {
  var r = 0,
    x = this.s & this.DM
  for (var i = 0; i < this.t; ++i) r += cbit(this[i] ^ x)
  return r
}

// (public) true iff nth bit is set
function bnTestBit(n) {
  var j = Math.floor(n / this.DB)
  if (j >= this.t) return (this.s != 0)
  return ((this[j] & (1 << (n % this.DB))) != 0)
}

// (protected) this op (1<<n)
function bnpChangeBit(n, op) {
  var r = BigInteger.ONE.shiftLeft(n)
  this.bitwiseTo(r, op, r)
  return r
}

// (public) this | (1<<n)
function bnSetBit(n) {
  return this.changeBit(n, op_or)
}

// (public) this & ~(1<<n)
function bnClearBit(n) {
  return this.changeBit(n, op_andnot)
}

// (public) this ^ (1<<n)
function bnFlipBit(n) {
  return this.changeBit(n, op_xor)
}

// (protected) r = this + a
function bnpAddTo(a, r) {
  var self = this

  var i = 0,
    c = 0,
    m = Math.min(a.t, self.t)
  while (i < m) {
    c += self[i] + a[i]
    r[i++] = c & self.DM
    c >>= self.DB
  }
  if (a.t < self.t) {
    c += a.s
    while (i < self.t) {
      c += self[i]
      r[i++] = c & self.DM
      c >>= self.DB
    }
    c += self.s
  } else {
    c += self.s
    while (i < a.t) {
      c += a[i]
      r[i++] = c & self.DM
      c >>= self.DB
    }
    c += a.s
  }
  r.s = (c < 0) ? -1 : 0
  if (c > 0) r[i++] = c
  else if (c < -1) r[i++] = self.DV + c
  r.t = i
  r.clamp()
}

// (public) this + a
function bnAdd(a) {
  var r = new BigInteger()
  this.addTo(a, r)
  return r
}

// (public) this - a
function bnSubtract(a) {
  var r = new BigInteger()
  this.subTo(a, r)
  return r
}

// (public) this * a
function bnMultiply(a) {
  var r = new BigInteger()
  this.multiplyTo(a, r)
  return r
}

// (public) this^2
function bnSquare() {
  var r = new BigInteger()
  this.squareTo(r)
  return r
}

// (public) this / a
function bnDivide(a) {
  var r = new BigInteger()
  this.divRemTo(a, r, null)
  return r
}

// (public) this % a
function bnRemainder(a) {
  var r = new BigInteger()
  this.divRemTo(a, null, r)
  return r
}

// (public) [this/a,this%a]
function bnDivideAndRemainder(a) {
  var q = new BigInteger(),
    r = new BigInteger()
  this.divRemTo(a, q, r)
  return new Array(q, r)
}

// (protected) this *= n, this >= 0, 1 < n < DV
function bnpDMultiply(n) {
  this[this.t] = this.am(0, n - 1, this, 0, 0, this.t)
  ++this.t
  this.clamp()
}

// (protected) this += n << w words, this >= 0
function bnpDAddOffset(n, w) {
  if (n == 0) return
  while (this.t <= w) this[this.t++] = 0
  this[w] += n
  while (this[w] >= this.DV) {
    this[w] -= this.DV
    if (++w >= this.t) this[this.t++] = 0
    ++this[w]
  }
}

// A "null" reducer
function NullExp() {}

function nNop(x) {
  return x
}

function nMulTo(x, y, r) {
  x.multiplyTo(y, r)
}

function nSqrTo(x, r) {
  x.squareTo(r)
}

NullExp.prototype.convert = nNop
NullExp.prototype.revert = nNop
NullExp.prototype.mulTo = nMulTo
NullExp.prototype.sqrTo = nSqrTo

// (public) this^e
function bnPow(e) {
  return this.exp(e, new NullExp())
}

// (protected) r = lower n words of "this * a", a.t <= n
// "this" should be the larger one if appropriate.
function bnpMultiplyLowerTo(a, n, r) {
  var i = Math.min(this.t + a.t, n)
  r.s = 0; // assumes a,this >= 0
  r.t = i
  while (i > 0) r[--i] = 0
  var j
  for (j = r.t - this.t; i < j; ++i) r[i + this.t] = this.am(0, a[i], r, i, 0, this.t)
  for (j = Math.min(a.t, n); i < j; ++i) this.am(0, a[i], r, i, 0, n - i)
  r.clamp()
}

// (protected) r = "this * a" without lower n words, n > 0
// "this" should be the larger one if appropriate.
function bnpMultiplyUpperTo(a, n, r) {
  --n
  var i = r.t = this.t + a.t - n
  r.s = 0; // assumes a,this >= 0
  while (--i >= 0) r[i] = 0
  for (i = Math.max(n - this.t, 0); i < a.t; ++i)
    r[this.t + i - n] = this.am(n - i, a[i], r, 0, 0, this.t + i - n)
  r.clamp()
  r.drShiftTo(1, r)
}

// Barrett modular reduction
function Barrett(m) {
  // setup Barrett
  this.r2 = new BigInteger()
  this.q3 = new BigInteger()
  BigInteger.ONE.dlShiftTo(2 * m.t, this.r2)
  this.mu = this.r2.divide(m)
  this.m = m
}

function barrettConvert(x) {
  if (x.s < 0 || x.t > 2 * this.m.t) return x.mod(this.m)
  else if (x.compareTo(this.m) < 0) return x
  else {
    var r = new BigInteger()
    x.copyTo(r)
    this.reduce(r)
    return r
  }
}

function barrettRevert(x) {
  return x
}

// x = x mod m (HAC 14.42)
function barrettReduce(x) {
  var self = this
  x.drShiftTo(self.m.t - 1, self.r2)
  if (x.t > self.m.t + 1) {
    x.t = self.m.t + 1
    x.clamp()
  }
  self.mu.multiplyUpperTo(self.r2, self.m.t + 1, self.q3)
  self.m.multiplyLowerTo(self.q3, self.m.t + 1, self.r2)
  while (x.compareTo(self.r2) < 0) x.dAddOffset(1, self.m.t + 1)
  x.subTo(self.r2, x)
  while (x.compareTo(self.m) >= 0) x.subTo(self.m, x)
}

// r = x^2 mod m; x != r
function barrettSqrTo(x, r) {
  x.squareTo(r)
  this.reduce(r)
}

// r = x*y mod m; x,y != r
function barrettMulTo(x, y, r) {
  x.multiplyTo(y, r)
  this.reduce(r)
}

Barrett.prototype.convert = barrettConvert
Barrett.prototype.revert = barrettRevert
Barrett.prototype.reduce = barrettReduce
Barrett.prototype.mulTo = barrettMulTo
Barrett.prototype.sqrTo = barrettSqrTo

// (public) this^e % m (HAC 14.85)
function bnModPow(e, m) {
  var i = e.bitLength(),
    k, r = nbv(1),
    z
  if (i <= 0) return r
  else if (i < 18) k = 1
  else if (i < 48) k = 3
  else if (i < 144) k = 4
  else if (i < 768) k = 5
  else k = 6
  if (i < 8)
    z = new Classic(m)
  else if (m.isEven())
    z = new Barrett(m)
  else
    z = new Montgomery(m)

  // precomputation
  var g = new Array(),
    n = 3,
    k1 = k - 1,
    km = (1 << k) - 1
  g[1] = z.convert(this)
  if (k > 1) {
    var g2 = new BigInteger()
    z.sqrTo(g[1], g2)
    while (n <= km) {
      g[n] = new BigInteger()
      z.mulTo(g2, g[n - 2], g[n])
      n += 2
    }
  }

  var j = e.t - 1,
    w, is1 = true,
    r2 = new BigInteger(),
    t
  i = nbits(e[j]) - 1
  while (j >= 0) {
    if (i >= k1) w = (e[j] >> (i - k1)) & km
    else {
      w = (e[j] & ((1 << (i + 1)) - 1)) << (k1 - i)
      if (j > 0) w |= e[j - 1] >> (this.DB + i - k1)
    }

    n = k
    while ((w & 1) == 0) {
      w >>= 1
      --n
    }
    if ((i -= n) < 0) {
      i += this.DB
      --j
    }
    if (is1) { // ret == 1, don't bother squaring or multiplying it
      g[w].copyTo(r)
      is1 = false
    } else {
      while (n > 1) {
        z.sqrTo(r, r2)
        z.sqrTo(r2, r)
        n -= 2
      }
      if (n > 0) z.sqrTo(r, r2)
      else {
        t = r
        r = r2
        r2 = t
      }
      z.mulTo(r2, g[w], r)
    }

    while (j >= 0 && (e[j] & (1 << i)) == 0) {
      z.sqrTo(r, r2)
      t = r
      r = r2
      r2 = t
      if (--i < 0) {
        i = this.DB - 1
        --j
      }
    }
  }
  return z.revert(r)
}

// (public) gcd(this,a) (HAC 14.54)
function bnGCD(a) {
  var x = (this.s < 0) ? this.negate() : this.clone()
  var y = (a.s < 0) ? a.negate() : a.clone()
  if (x.compareTo(y) < 0) {
    var t = x
    x = y
    y = t
  }
  var i = x.getLowestSetBit(),
    g = y.getLowestSetBit()
  if (g < 0) return x
  if (i < g) g = i
  if (g > 0) {
    x.rShiftTo(g, x)
    y.rShiftTo(g, y)
  }
  while (x.signum() > 0) {
    if ((i = x.getLowestSetBit()) > 0) x.rShiftTo(i, x)
    if ((i = y.getLowestSetBit()) > 0) y.rShiftTo(i, y)
    if (x.compareTo(y) >= 0) {
      x.subTo(y, x)
      x.rShiftTo(1, x)
    } else {
      y.subTo(x, y)
      y.rShiftTo(1, y)
    }
  }
  if (g > 0) y.lShiftTo(g, y)
  return y
}

// (protected) this % n, n < 2^26
function bnpModInt(n) {
  if (n <= 0) return 0
  var d = this.DV % n,
    r = (this.s < 0) ? n - 1 : 0
  if (this.t > 0)
    if (d == 0) r = this[0] % n
    else
      for (var i = this.t - 1; i >= 0; --i) r = (d * r + this[i]) % n
  return r
}

// (public) 1/this % m (HAC 14.61)
function bnModInverse(m) {
  var ac = m.isEven()
  if (this.signum() === 0) throw new Error('division by zero')
  if ((this.isEven() && ac) || m.signum() == 0) return BigInteger.ZERO
  var u = m.clone(),
    v = this.clone()
  var a = nbv(1),
    b = nbv(0),
    c = nbv(0),
    d = nbv(1)
  while (u.signum() != 0) {
    while (u.isEven()) {
      u.rShiftTo(1, u)
      if (ac) {
        if (!a.isEven() || !b.isEven()) {
          a.addTo(this, a)
          b.subTo(m, b)
        }
        a.rShiftTo(1, a)
      } else if (!b.isEven()) b.subTo(m, b)
      b.rShiftTo(1, b)
    }
    while (v.isEven()) {
      v.rShiftTo(1, v)
      if (ac) {
        if (!c.isEven() || !d.isEven()) {
          c.addTo(this, c)
          d.subTo(m, d)
        }
        c.rShiftTo(1, c)
      } else if (!d.isEven()) d.subTo(m, d)
      d.rShiftTo(1, d)
    }
    if (u.compareTo(v) >= 0) {
      u.subTo(v, u)
      if (ac) a.subTo(c, a)
      b.subTo(d, b)
    } else {
      v.subTo(u, v)
      if (ac) c.subTo(a, c)
      d.subTo(b, d)
    }
  }
  if (v.compareTo(BigInteger.ONE) != 0) return BigInteger.ZERO
  while (d.compareTo(m) >= 0) d.subTo(m, d)
  while (d.signum() < 0) d.addTo(m, d)
  return d
}

var lowprimes = [
  2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71,
  73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131, 137, 139, 149, 151,
  157, 163, 167, 173, 179, 181, 191, 193, 197, 199, 211, 223, 227, 229, 233,
  239, 241, 251, 257, 263, 269, 271, 277, 281, 283, 293, 307, 311, 313, 317,
  331, 337, 347, 349, 353, 359, 367, 373, 379, 383, 389, 397, 401, 409, 419,
  421, 431, 433, 439, 443, 449, 457, 461, 463, 467, 479, 487, 491, 499, 503,
  509, 521, 523, 541, 547, 557, 563, 569, 571, 577, 587, 593, 599, 601, 607,
  613, 617, 619, 631, 641, 643, 647, 653, 659, 661, 673, 677, 683, 691, 701,
  709, 719, 727, 733, 739, 743, 751, 757, 761, 769, 773, 787, 797, 809, 811,
  821, 823, 827, 829, 839, 853, 857, 859, 863, 877, 881, 883, 887, 907, 911,
  919, 929, 937, 941, 947, 953, 967, 971, 977, 983, 991, 997
]

var lplim = (1 << 26) / lowprimes[lowprimes.length - 1]

// (public) test primality with certainty >= 1-.5^t
function bnIsProbablePrime(t) {
  var i, x = this.abs()
  if (x.t == 1 && x[0] <= lowprimes[lowprimes.length - 1]) {
    for (i = 0; i < lowprimes.length; ++i)
      if (x[0] == lowprimes[i]) return true
    return false
  }
  if (x.isEven()) return false
  i = 1
  while (i < lowprimes.length) {
    var m = lowprimes[i],
      j = i + 1
    while (j < lowprimes.length && m < lplim) m *= lowprimes[j++]
    m = x.modInt(m)
    while (i < j) if (m % lowprimes[i++] == 0) return false
  }
  return x.millerRabin(t)
}

// (protected) true if probably prime (HAC 4.24, Miller-Rabin)
function bnpMillerRabin(t) {
  var n1 = this.subtract(BigInteger.ONE)
  var k = n1.getLowestSetBit()
  if (k <= 0) return false
  var r = n1.shiftRight(k)
  t = (t + 1) >> 1
  if (t > lowprimes.length) t = lowprimes.length
  var a = new BigInteger(null)
  var j, bases = []
  for (var i = 0; i < t; ++i) {
    for (;;) {
      j = lowprimes[Math.floor(Math.random() * lowprimes.length)]
      if (bases.indexOf(j) == -1) break
    }
    bases.push(j)
    a.fromInt(j)
    var y = a.modPow(r, this)
    if (y.compareTo(BigInteger.ONE) != 0 && y.compareTo(n1) != 0) {
      var j = 1
      while (j++ < k && y.compareTo(n1) != 0) {
        y = y.modPowInt(2, this)
        if (y.compareTo(BigInteger.ONE) == 0) return false
      }
      if (y.compareTo(n1) != 0) return false
    }
  }
  return true
}

// protected
proto.chunkSize = bnpChunkSize
proto.toRadix = bnpToRadix
proto.fromRadix = bnpFromRadix
proto.fromNumber = bnpFromNumber
proto.bitwiseTo = bnpBitwiseTo
proto.changeBit = bnpChangeBit
proto.addTo = bnpAddTo
proto.dMultiply = bnpDMultiply
proto.dAddOffset = bnpDAddOffset
proto.multiplyLowerTo = bnpMultiplyLowerTo
proto.multiplyUpperTo = bnpMultiplyUpperTo
proto.modInt = bnpModInt
proto.millerRabin = bnpMillerRabin

// public
proto.clone = bnClone
proto.intValue = bnIntValue
proto.byteValue = bnByteValue
proto.shortValue = bnShortValue
proto.signum = bnSigNum
proto.toByteArray = bnToByteArray
proto.equals = bnEquals
proto.min = bnMin
proto.max = bnMax
proto.and = bnAnd
proto.or = bnOr
proto.xor = bnXor
proto.andNot = bnAndNot
proto.not = bnNot
proto.shiftLeft = bnShiftLeft
proto.shiftRight = bnShiftRight
proto.getLowestSetBit = bnGetLowestSetBit
proto.bitCount = bnBitCount
proto.testBit = bnTestBit
proto.setBit = bnSetBit
proto.clearBit = bnClearBit
proto.flipBit = bnFlipBit
proto.add = bnAdd
proto.subtract = bnSubtract
proto.multiply = bnMultiply
proto.divide = bnDivide
proto.remainder = bnRemainder
proto.divideAndRemainder = bnDivideAndRemainder
proto.modPow = bnModPow
proto.modInverse = bnModInverse
proto.pow = bnPow
proto.gcd = bnGCD
proto.isProbablePrime = bnIsProbablePrime

// JSBN-specific extension
proto.square = bnSquare

// constants
BigInteger.ZERO = nbv(0)
BigInteger.ONE = nbv(1)
BigInteger.valueOf = nbv

module.exports = BigInteger


/***/ }),
/* 56 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(Buffer) {var assert = __webpack_require__(29)
var BigInteger = __webpack_require__(9)

var THREE = BigInteger.valueOf(3)

function Point (curve, x, y, z) {
  assert.notStrictEqual(z, undefined, 'Missing Z coordinate')

  this.curve = curve
  this.x = x
  this.y = y
  this.z = z
  this._zInv = null

  this.compressed = true
}

Object.defineProperty(Point.prototype, 'zInv', {
  get: function () {
    if (this._zInv === null) {
      this._zInv = this.z.modInverse(this.curve.p)
    }

    return this._zInv
  }
})

Object.defineProperty(Point.prototype, 'affineX', {
  get: function () {
    return this.x.multiply(this.zInv).mod(this.curve.p)
  }
})

Object.defineProperty(Point.prototype, 'affineY', {
  get: function () {
    return this.y.multiply(this.zInv).mod(this.curve.p)
  }
})

Point.fromAffine = function (curve, x, y) {
  return new Point(curve, x, y, BigInteger.ONE)
}

Point.prototype.equals = function (other) {
  if (other === this) return true
  if (this.curve.isInfinity(this)) return this.curve.isInfinity(other)
  if (this.curve.isInfinity(other)) return this.curve.isInfinity(this)

  // u = Y2 * Z1 - Y1 * Z2
  var u = other.y.multiply(this.z).subtract(this.y.multiply(other.z)).mod(this.curve.p)

  if (u.signum() !== 0) return false

  // v = X2 * Z1 - X1 * Z2
  var v = other.x.multiply(this.z).subtract(this.x.multiply(other.z)).mod(this.curve.p)

  return v.signum() === 0
}

Point.prototype.negate = function () {
  var y = this.curve.p.subtract(this.y)

  return new Point(this.curve, this.x, y, this.z)
}

Point.prototype.add = function (b) {
  if (this.curve.isInfinity(this)) return b
  if (this.curve.isInfinity(b)) return this

  var x1 = this.x
  var y1 = this.y
  var x2 = b.x
  var y2 = b.y

  // u = Y2 * Z1 - Y1 * Z2
  var u = y2.multiply(this.z).subtract(y1.multiply(b.z)).mod(this.curve.p)
  // v = X2 * Z1 - X1 * Z2
  var v = x2.multiply(this.z).subtract(x1.multiply(b.z)).mod(this.curve.p)

  if (v.signum() === 0) {
    if (u.signum() === 0) {
      return this.twice() // this == b, so double
    }

    return this.curve.infinity // this = -b, so infinity
  }

  var v2 = v.square()
  var v3 = v2.multiply(v)
  var x1v2 = x1.multiply(v2)
  var zu2 = u.square().multiply(this.z)

  // x3 = v * (z2 * (z1 * u^2 - 2 * x1 * v^2) - v^3)
  var x3 = zu2.subtract(x1v2.shiftLeft(1)).multiply(b.z).subtract(v3).multiply(v).mod(this.curve.p)
  // y3 = z2 * (3 * x1 * u * v^2 - y1 * v^3 - z1 * u^3) + u * v^3
  var y3 = x1v2.multiply(THREE).multiply(u).subtract(y1.multiply(v3)).subtract(zu2.multiply(u)).multiply(b.z).add(u.multiply(v3)).mod(this.curve.p)
  // z3 = v^3 * z1 * z2
  var z3 = v3.multiply(this.z).multiply(b.z).mod(this.curve.p)

  return new Point(this.curve, x3, y3, z3)
}

Point.prototype.twice = function () {
  if (this.curve.isInfinity(this)) return this
  if (this.y.signum() === 0) return this.curve.infinity

  var x1 = this.x
  var y1 = this.y

  var y1z1 = y1.multiply(this.z).mod(this.curve.p)
  var y1sqz1 = y1z1.multiply(y1).mod(this.curve.p)
  var a = this.curve.a

  // w = 3 * x1^2 + a * z1^2
  var w = x1.square().multiply(THREE)

  if (a.signum() !== 0) {
    w = w.add(this.z.square().multiply(a))
  }

  w = w.mod(this.curve.p)
  // x3 = 2 * y1 * z1 * (w^2 - 8 * x1 * y1^2 * z1)
  var x3 = w.square().subtract(x1.shiftLeft(3).multiply(y1sqz1)).shiftLeft(1).multiply(y1z1).mod(this.curve.p)
  // y3 = 4 * y1^2 * z1 * (3 * w * x1 - 2 * y1^2 * z1) - w^3
  var y3 = w.multiply(THREE).multiply(x1).subtract(y1sqz1.shiftLeft(1)).shiftLeft(2).multiply(y1sqz1).subtract(w.pow(3)).mod(this.curve.p)
  // z3 = 8 * (y1 * z1)^3
  var z3 = y1z1.pow(3).shiftLeft(3).mod(this.curve.p)

  return new Point(this.curve, x3, y3, z3)
}

// Simple NAF (Non-Adjacent Form) multiplication algorithm
// TODO: modularize the multiplication algorithm
Point.prototype.multiply = function (k) {
  if (this.curve.isInfinity(this)) return this
  if (k.signum() === 0) return this.curve.infinity

  var e = k
  var h = e.multiply(THREE)

  var neg = this.negate()
  var R = this

  for (var i = h.bitLength() - 2; i > 0; --i) {
    var hBit = h.testBit(i)
    var eBit = e.testBit(i)

    R = R.twice()

    if (hBit !== eBit) {
      R = R.add(hBit ? this : neg)
    }
  }

  return R
}

// Compute this*j + x*k (simultaneous multiplication)
Point.prototype.multiplyTwo = function (j, x, k) {
  var i = Math.max(j.bitLength(), k.bitLength()) - 1
  var R = this.curve.infinity
  var both = this.add(x)

  while (i >= 0) {
    var jBit = j.testBit(i)
    var kBit = k.testBit(i)

    R = R.twice()

    if (jBit) {
      if (kBit) {
        R = R.add(both)
      } else {
        R = R.add(this)
      }
    } else if (kBit) {
      R = R.add(x)
    }
    --i
  }

  return R
}

Point.prototype.getEncoded = function (compressed) {
  if (compressed == null) compressed = this.compressed
  if (this.curve.isInfinity(this)) return new Buffer('00', 'hex') // Infinity point encoded is simply '00'

  var x = this.affineX
  var y = this.affineY
  var byteLength = this.curve.pLength
  var buffer

  // 0x02/0x03 | X
  if (compressed) {
    buffer = new Buffer(1 + byteLength)
    buffer.writeUInt8(y.isEven() ? 0x02 : 0x03, 0)

  // 0x04 | X | Y
  } else {
    buffer = new Buffer(1 + byteLength + byteLength)
    buffer.writeUInt8(0x04, 0)

    y.toBuffer(byteLength).copy(buffer, 1 + byteLength)
  }

  x.toBuffer(byteLength).copy(buffer, 1)

  return buffer
}

Point.decodeFrom = function (curve, buffer) {
  var type = buffer.readUInt8(0)
  var compressed = (type !== 4)

  var byteLength = Math.floor((curve.p.bitLength() + 7) / 8)
  var x = BigInteger.fromBuffer(buffer.slice(1, 1 + byteLength))

  var Q
  if (compressed) {
    assert.equal(buffer.length, byteLength + 1, 'Invalid sequence length')
    assert(type === 0x02 || type === 0x03, 'Invalid sequence tag')

    var isOdd = (type === 0x03)
    Q = curve.pointFromX(isOdd, x)
  } else {
    assert.equal(buffer.length, 1 + byteLength + byteLength, 'Invalid sequence length')

    var y = BigInteger.fromBuffer(buffer.slice(1 + byteLength))
    Q = Point.fromAffine(curve, x, y)
  }

  Q.compressed = compressed
  return Q
}

Point.prototype.toString = function () {
  if (this.curve.isInfinity(this)) return '(INFINITY)'

  return '(' + this.affineX.toString() + ',' + this.affineY.toString() + ')'
}

module.exports = Point

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1).Buffer))

/***/ }),
/* 57 */
/***/ (function(module, exports, __webpack_require__) {

var assert = __webpack_require__(29)
var BigInteger = __webpack_require__(9)

var Point = __webpack_require__(56)

function Curve (p, a, b, Gx, Gy, n, h) {
  this.p = p
  this.a = a
  this.b = b
  this.G = Point.fromAffine(this, Gx, Gy)
  this.n = n
  this.h = h

  this.infinity = new Point(this, null, null, BigInteger.ZERO)

  // result caching
  this.pOverFour = p.add(BigInteger.ONE).shiftRight(2)

  // determine size of p in bytes
  this.pLength = Math.floor((this.p.bitLength() + 7) / 8)
}

Curve.prototype.pointFromX = function (isOdd, x) {
  var alpha = x.pow(3).add(this.a.multiply(x)).add(this.b).mod(this.p)
  var beta = alpha.modPow(this.pOverFour, this.p) // XXX: not compatible with all curves

  var y = beta
  if (beta.isEven() ^ !isOdd) {
    y = this.p.subtract(y) // -y % p
  }

  return Point.fromAffine(this, x, y)
}

Curve.prototype.isInfinity = function (Q) {
  if (Q === this.infinity) return true

  return Q.z.signum() === 0 && Q.y.signum() !== 0
}

Curve.prototype.isOnCurve = function (Q) {
  if (this.isInfinity(Q)) return true

  var x = Q.affineX
  var y = Q.affineY
  var a = this.a
  var b = this.b
  var p = this.p

  // Check that xQ and yQ are integers in the interval [0, p - 1]
  if (x.signum() < 0 || x.compareTo(p) >= 0) return false
  if (y.signum() < 0 || y.compareTo(p) >= 0) return false

  // and check that y^2 = x^3 + ax + b (mod p)
  var lhs = y.square().mod(p)
  var rhs = x.pow(3).add(a.multiply(x)).add(b).mod(p)
  return lhs.equals(rhs)
}

/**
 * Validate an elliptic curve point.
 *
 * See SEC 1, section 3.2.2.1: Elliptic Curve Public Key Validation Primitive
 */
Curve.prototype.validate = function (Q) {
  // Check Q != O
  assert(!this.isInfinity(Q), 'Point is at infinity')
  assert(this.isOnCurve(Q), 'Point is not on the curve')

  // Check nQ = O (where Q is a scalar multiple of G)
  var nQ = Q.multiply(this.n)
  assert(this.isInfinity(nQ), 'Point is not a scalar multiple of G')

  return true
}

module.exports = Curve


/***/ }),
/* 58 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


__webpack_require__(59);
__webpack_require__(63);
__webpack_require__(80);
//const Vue = require("vue/dist/vue")
//const VueOnsen = require("vue-onsenui")

Vue.use(VueOnsen);

Vue.component('custom-bar', __webpack_require__(82));
exports.vm = new Vue({
  el: "#app",
  data: function data() {
    return {};
  },

  components: {
    navigator: __webpack_require__(84),
    first: __webpack_require__(33)
  }

});

/***/ }),
/* 59 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(60);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(17)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../node_modules/css-loader/index.js!../node_modules/sass-loader/lib/loader.js!./index.scss", function() {
			var newContent = require("!!../node_modules/css-loader/index.js!../node_modules/sass-loader/lib/loader.js!./index.scss");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 60 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(10)(undefined);
// imports


// module
exports.push([module.i, "[data-page=\"home\"] #youHave {\n  width: 100%;\n  background-color: #fff85e;\n  padding: 2% 0%;\n  color: #7c5702;\n  background-image: url(" + __webpack_require__(61) + ");\n  background-repeat: no-repeat;\n  background-position: bottom right; }\n  [data-page=\"home\"] #youHave .label {\n    color: #7b7442; }\n  [data-page=\"home\"] #youHave #balanceWrap {\n    margin: 5% 0;\n    text-align: center; }\n    [data-page=\"home\"] #youHave #balanceWrap #balance {\n      font-size: 3em; }\n    [data-page=\"home\"] #youHave #balanceWrap #unit {\n      font-size: 1.1em; }\n\n[data-page=\"receive\"] {\n  text-align: center; }\n  [data-page=\"receive\"] #simple .label {\n    margin: 10px;\n    color: #888; }\n  [data-page=\"receive\"] #simple #qrArea #qrcode {\n    width: 250px;\n    height: 250px;\n    background-color: #aaa;\n    display: inline-block;\n    margin: 10px;\n    padding: 10px; }\n  [data-page=\"receive\"] #simple #qrArea .address {\n    display: block; }\n\n[data-page=\"first\"] .wrap {\n  width: 100%;\n  height: 100%;\n  background-color: #fff85e; }\n  [data-page=\"first\"] .wrap .logo {\n    position: absolute;\n    top: 30%;\n    width: 100%;\n    text-align: center; }\n    [data-page=\"first\"] .wrap .logo .icon {\n      display: inline-block;\n      background-image: url(" + __webpack_require__(61) + ");\n      background-position: center center;\n      background-repeat: no-repeat;\n      background-size: contain;\n      width: 100px;\n      height: 100px; }\n    [data-page=\"first\"] .wrap .logo .appName {\n      font-size: 2em;\n      color: #7c5702; }\n    [data-page=\"first\"] .wrap .logo .label {\n      color: #7c5702;\n      opacity: 0.5; }\n  [data-page=\"first\"] .wrap .buttons {\n    margin: 80px auto;\n    width: 60%; }\n    [data-page=\"first\"] .wrap .buttons ons-button {\n      margin: 10px 0;\n      width: 100%; }\n\n[data-page=\"question\"] .questionItem {\n  text-align: center;\n  padding: 5%; }\n  [data-page=\"question\"] .questionItem .questionText {\n    padding: 10%;\n    border-radius: 8px;\n    border: 1px solid #7c5702;\n    color: #7c5702;\n    background-color: white; }\n  [data-page=\"question\"] .questionItem .answers .answer {\n    border-radius: 6px;\n    background-color: #fff85e;\n    color: #7c5702;\n    margin: 10px 0;\n    padding: 10px; }\n\n[data-page=\"generateKeyWarn\"] .wrap {\n  padding: 10px; }\n  [data-page=\"generateKeyWarn\"] .wrap .check {\n    padding: 12px; }\n    [data-page=\"generateKeyWarn\"] .wrap .check input {\n      font-size: 1.5em; }\n\n[data-page=\"generateKey\"] .touchArea {\n  height: 50%;\n  background: #50aba0;\n  color: white;\n  font-size: 2em;\n  text-align: center;\n  padding: 30% 10%; }\n", ""]);

// exports


/***/ }),
/* 61 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "dist/assets/d04ded86af3bf074f2692b5c887c9f79.png";

/***/ }),
/* 62 */
/***/ (function(module, exports) {


/**
 * When source maps are enabled, `style-loader` uses a link element with a data-uri to
 * embed the css on the page. This breaks all relative urls because now they are relative to a
 * bundle instead of the current page.
 *
 * One solution is to only use full urls, but that may be impossible.
 *
 * Instead, this function "fixes" the relative urls to be absolute according to the current page location.
 *
 * A rudimentary test suite is located at `test/fixUrls.js` and can be run via the `npm test` command.
 *
 */

module.exports = function (css) {
  // get current location
  var location = typeof window !== "undefined" && window.location;

  if (!location) {
    throw new Error("fixUrls requires window.location");
  }

	// blank or null?
	if (!css || typeof css !== "string") {
	  return css;
  }

  var baseUrl = location.protocol + "//" + location.host;
  var currentDir = baseUrl + location.pathname.replace(/\/[^\/]*$/, "/");

	// convert each url(...)
	/*
	This regular expression is just a way to recursively match brackets within
	a string.

	 /url\s*\(  = Match on the word "url" with any whitespace after it and then a parens
	   (  = Start a capturing group
	     (?:  = Start a non-capturing group
	         [^)(]  = Match anything that isn't a parentheses
	         |  = OR
	         \(  = Match a start parentheses
	             (?:  = Start another non-capturing groups
	                 [^)(]+  = Match anything that isn't a parentheses
	                 |  = OR
	                 \(  = Match a start parentheses
	                     [^)(]*  = Match anything that isn't a parentheses
	                 \)  = Match a end parentheses
	             )  = End Group
              *\) = Match anything and then a close parens
          )  = Close non-capturing group
          *  = Match anything
       )  = Close capturing group
	 \)  = Match a close parens

	 /gi  = Get all matches, not the first.  Be case insensitive.
	 */
	var fixedCss = css.replace(/url\s*\(((?:[^)(]|\((?:[^)(]+|\([^)(]*\))*\))*)\)/gi, function(fullMatch, origUrl) {
		// strip quotes (if they exist)
		var unquotedOrigUrl = origUrl
			.trim()
			.replace(/^"(.*)"$/, function(o, $1){ return $1; })
			.replace(/^'(.*)'$/, function(o, $1){ return $1; });

		// already a full url? no change
		if (/^(#|data:|http:\/\/|https:\/\/|file:\/\/\/)/i.test(unquotedOrigUrl)) {
		  return fullMatch;
		}

		// convert the url to a full url
		var newUrl;

		if (unquotedOrigUrl.indexOf("//") === 0) {
		  	//TODO: should we add protocol?
			newUrl = unquotedOrigUrl;
		} else if (unquotedOrigUrl.indexOf("/") === 0) {
			// path should be relative to the base url
			newUrl = baseUrl + unquotedOrigUrl; // already starts with '/'
		} else {
			// path should be relative to current directory
			newUrl = currentDir + unquotedOrigUrl.replace(/^\.\//, ""); // Strip leading './'
		}

		// send back the fixed url(...)
		return "url(" + JSON.stringify(newUrl) + ")";
	});

	// send back the fixed css
	return fixedCss;
};


/***/ }),
/* 63 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(64);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(17)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../../node_modules/css-loader/index.js!./onsenui.css", function() {
			var newContent = require("!!../../../node_modules/css-loader/index.js!./onsenui.css");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 64 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(10)(undefined);
// imports
exports.i(__webpack_require__(65), "");
exports.i(__webpack_require__(69), "");
exports.i(__webpack_require__(73), "");

// module
exports.push([module.i, "/*! onsenui - v2.8.2 - 2017-11-22 */\n\n\nons-page, ons-navigator,\nons-tabbar,\nons-gesture-detector {\n  display: block;\n  touch-action: manipulation; /* Remove click delay */\n}\n\nons-navigator,\nons-tabbar,\nons-splitter,\nons-action-sheet,\nons-dialog,\nons-toast,\nons-alert-dialog {\n  position: absolute;\n  top: 0;\n  left: 0;\n  bottom: 0;\n  right: 0;\n  overflow: hidden;\n  touch-action: manipulation; /* Remove click delay */\n}\n\nons-toast {\n  pointer-events: none;\n}\n\nons-toast .toast {\n  pointer-events: auto;\n}\n\nons-tab {\n  -webkit-transform: translate3d(0, 0, 0);\n          transform: translate3d(0, 0, 0);\n}\n\nons-page, ons-navigator, ons-tabbar, ons-dialog, ons-alert-dialog, ons-action-sheet, ons-toast {\n  z-index: 2;\n}\n\nons-fab, ons-speed-dial {\n  z-index: 10001;\n}\n\nons-toolbar:not([inline]), ons-bottom-toolbar {\n  position: absolute;\n  left: 0;\n  right: 0;\n  z-index: 10000;\n}\n\nons-toolbar:not([inline]) {\n  top: 0;\n}\n\nons-bottom-toolbar {\n  bottom: 0;\n}\n\n.page, .page__content,\n.page--material, .page--material__content {\n  background-color: transparent !important;\n  background: transparent !important;\n}\n\n.page__content {\n  overflow: auto;\n  -webkit-overflow-scrolling: touch;\n  z-index: 0;\n  -ms-touch-action: pan-y;\n}\n\n.page__content--suppress-layer-creation {\n  -webkit-overflow-scrolling: auto;\n}\n\n.page.overflow-visible,\n.page.overflow-visible .page,\n.page.overflow-visible .page__content,\n.page.overflow-visible ons-navigator,\n.page.overflow-visible ons-splitter {\n  overflow: visible;\n}\n\n.page.overflow-visible .page__content.content-swiping,\n.page.overflow-visible .page__content.content-swiping .page,\n.page.overflow-visible .page__content.content-swiping .page__content {\n  overflow: auto;\n}\n\n.page[status-bar-fill] > .page__content {\n  top: 20px;\n}\n\n.page[status-bar-fill] > .toolbar {\n  padding-top: 20px;\n  box-sizing: content-box;\n}\n\n.page[status-bar-fill] > .toolbar:not(.toolbar--transparent) + .page__background,\n.page[status-bar-fill] > .toolbar:not(.toolbar--cover-content) + .page__background + .page__content {\n  top: 64px;\n}\n\n.page[status-bar-fill] > .toolbar--material:not(.toolbar-transparent) + .page__background,\n.page[status-bar-fill] > .toolbar--material:not(.toolbar--cover-content) + .page__background + .page__content {\n  top: 76px;\n}\n\n.page[status-bar-fill] > .toolbar.toolbar--transparent + .page__background {\n  top: 0;\n}\n\nons-tabbar[status-bar-fill] > .tabbar--top__content {\n  top: 71px;\n}\n\nons-tabbar[status-bar-fill] > .tabbar--top {\n  padding-top: 22px;\n}\n\nons-tabbar[position=\"top\"] .page[status-bar-fill] > .page__content {\n  top: 0px;\n}\n\n.toolbar + .page__background + .page__content ons-tabbar[status-bar-fill] > .tabbar--top {\n  top: 0px;\n}\n\n.toolbar + .page__background + .page__content ons-tabbar[status-bar-fill] > .tabbar--top__content {\n  top: 49px;\n}\n\n.page__content > .list:not(.list--material):first-child {\n  margin-top: -1px; /* Avoid double border with toolbar */\n}\n\nons-action-sheet[disabled],\nons-dialog[disabled],\nons-alert-dialog[disabled],\nons-popover[disabled] {\n  pointer-events: none;\n  opacity: 0.75;\n}\n\nons-list-item[disabled] {\n   pointer-events: none;\n}\n\nons-range[disabled] {\n  opacity: 0.3;\n  pointer-events: none;\n}\n\nons-pull-hook {\n  position: relative;\n  display: block;\n  margin: auto;\n  text-align: center;\n  z-index: 20002;\n}\n\nons-splitter, ons-splitter-mask, ons-splitter-content, ons-splitter-side {\n  display: block;\n  position: absolute;\n  left: 0;\n  right: 0;\n  top: 0;\n  bottom: 0;\n  box-sizing: border-box;\n  z-index: 0;\n}\n\nons-splitter-mask {\n  z-index: 4;\n  background-color: rgba(0, 0, 0, 0.1);\n  display: none;\n  opacity: 0;\n}\n\nons-splitter-content {\n  z-index: 2;\n}\n\nons-splitter-side {\n  right: auto;\n  z-index: 2;\n}\n\nons-splitter-side[side=\"right\"] {\n  right: 0;\n  left: auto;\n}\n\nons-splitter-side[mode=\"collapse\"] {\n  z-index: 5;\n  left: auto;\n  right: 100%;\n}\n\nons-splitter-side[side=\"right\"][mode=\"collapse\"] {\n  right: auto;\n  left: 100%;\n}\n\nons-splitter-side[mode=\"split\"] {\n  z-index: 3;\n}\n\nons-toolbar-button > ons-icon[icon*=\"ion-\"] {\n  font-size: 26px;\n}\n\nons-range, ons-select {\n  display: inline-block;\n}\n\nons-range > input {\n  min-width: 50px;\n  width: 100%;\n}\n\nons-select > select {\n  width: 100%;\n}\n\nons-carousel[disabled] {\n  pointer-events: none;\n  opacity: 0.75;\n}\n\nons-carousel[fullscreen] {\n  height: 100%;\n}\n\n.ons-status-bar-mock {\n  position: absolute;\n  width: 100%;\n  height: 20px;\n  padding: 0 16px 0 6px;\n  box-sizing: border-box;\n  z-index: 30000;\n  display: -webkit-box;\n  display: -webkit-flex;\n  display: flex;\n  -webkit-box-pack: justify;\n  -webkit-justify-content: space-between;\n          justify-content: space-between;\n  font-size: 12px;\n  line-height: 20px;\n  font-family: Arial, Helvetica;\n}\n\n.ons-status-bar-mock i {\n  padding: 0 2px;\n}\n\n.ons-status-bar-mock.android {\n  color: white;\n  background-color: #222;\n  font-family: Roboto, Arial, Helvetica;\n}\n\n.ons-status-bar-mock.android ~ * {\n  top: 20px;\n  bottom: 0;\n  position: inherit;\n  width: 100%;\n}\n\nons-row {\n  display: -webkit-box;\n  display: -webkit-flex;\n  display: -moz-box;\n  display: -moz-flex;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-flex-wrap: wrap;\n          flex-wrap: wrap;\n  width: 100%;\n  box-sizing: border-box;\n}\n\nons-row[vertical-align=\"top\"], ons-row[align=\"top\"] {\n  -webkit-box-align: start;\n  box-align: start;\n  -ms-flex-align: start;\n  -webkit-align-items: flex-start;\n  -moz-align-items: flex-start;\n  align-items: flex-start;\n}\n\nons-row[vertical-align=\"bottom\"], ons-row[align=\"bottom\"] {\n  -webkit-box-align: end;\n  box-align: end;\n  -ms-flex-align: end;\n  -webkit-align-items: flex-end;\n  -moz-align-items: flex-end;\n  align-items: flex-end;\n}\n\nons-row[vertical-align=\"center\"], ons-row[align=\"center\"] {\n  -webkit-box-align: center;\n  box-align: center;\n  -ms-flex-align: center;\n  -webkit-align-items: center;\n  -moz-align-items: center;\n  align-items: center;\n  text-align: inherit;\n}\n\nons-row + ons-row {\n  padding-top: 0;\n}\n\nons-col {\n  -webkit-box-flex: 1;\n  -webkit-flex: 1;\n  -moz-box-flex: 1;\n  -moz-flex: 1;\n  -ms-flex: 1;\n  flex: 1;\n  display: block;\n  width: 100%;\n  box-sizing: border-box;\n}\n\nons-col[vertical-align=\"top\"], ons-col[align=\"top\"] {\n  -webkit-align-self: flex-start;\n  -moz-align-self: flex-start;\n  -ms-flex-item-align: start;\n  align-self: flex-start;\n}\n\nons-col[vertical-align=\"bottom\"], ons-col[align=\"bottom\"] {\n  -webkit-align-self: flex-end;\n  -moz-align-self: flex-end;\n  -ms-flex-item-align: end;\n  align-self: flex-end; }\n\nons-col[vertical-align=\"center\"], ons-col[align=\"center\"] {\n  -webkit-align-self: center;\n  -moz-align-self: center;\n  -ms-flex-item-align: center;\n  text-align: inherit;\n}\n\n\n/*\nCopyright 2013-2015 ASIAL CORPORATION\n\nLicensed under the Apache License, Version 2.0 (the \"License\");\nyou may not use this file except in compliance with the License.\nYou may obtain a copy of the License at\n\n   http://www.apache.org/licenses/LICENSE-2.0\n\nUnless required by applicable law or agreed to in writing, software\ndistributed under the License is distributed on an \"AS IS\" BASIS,\nWITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\nSee the License for the specific language governing permissions and\nlimitations under the License.\n\n */\n\n.ons-icon {\n  display: inline-block;\n  line-height: inherit;\n  font-style: normal;\n  font-weight: normal;\n  font-size: inherit;\n  text-rendering: auto;\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n}\n\n.segment__button .ons-icon {\n  line-height: initial;\n}\n\n:not(ons-toolbar-button):not(ons-action-sheet-button):not(.segment__button) > .ons-icon--ion {\n  line-height: 0.75em;\n  vertical-align: -25%;\n}\n\n.ons-icon[spin] {\n  -webkit-animation: ons-icon-spin 2s infinite linear;\n  -moz-animation: ons-icon-spin 2s infinite linear;\n  animation: ons-icon-spin 2s infinite linear;\n}\n\n@-moz-keyframes ons-icon-spin {\n  0% {\n    -moz-transform: rotate(0deg);\n  }\n  100% {\n    -moz-transform: rotate(359deg);\n  }\n}\n\n@-webkit-keyframes ons-icon-spin {\n  0% {\n    -webkit-transform: rotate(0deg);\n  }\n  100% {\n    -webkit-transform: rotate(359deg);\n  }\n}\n\n@keyframes ons-icon-spin {\n  0% {\n    -webkit-transform: rotate(0deg);\n    transform: rotate(0deg);\n  }\n  100% {\n    -webkit-transform: rotate(359deg);\n    transform: rotate(359deg);\n  }\n}\n\n.ons-icon[rotate=\"90\"] {\n  -webkit-transform: rotate(90deg);\n  -moz-transform: rotate(90deg);\n  transform: rotate(90deg);\n}\n\n.ons-icon[rotate=\"180\"] {\n  -webkit-transform: rotate(180deg);\n  -moz-transform: rotate(180deg);\n  transform: rotate(180deg);\n}\n\n.ons-icon[rotate=\"270\"] {\n  -webkit-transform: rotate(270deg);\n  -moz-transform: rotate(270deg);\n  transform: rotate(270deg);\n}\n\n.ons-icon[fixed-width] {\n  width: 1.28571429em;\n  text-align: center;\n}\n\n.ons-icon--lg {\n  font-size: 1.33333333em;\n  line-height: 0.75em;\n  vertical-align: -15%;\n}\n\n.ons-icon--2x {\n  font-size: 2em;\n}\n\n.ons-icon--3x {\n  font-size: 3em;\n}\n\n.ons-icon--4x {\n  font-size: 4em;\n}\n\n.ons-icon--5x {\n  font-size: 5em;\n}\n\nons-input, ons-radio, ons-checkbox, ons-search-input {\n  display: inline-block;\n  position: relative;\n}\n\nons-input .text-input,\nons-search-input .search-input {\n  width: 100%;\n  display: inline-block;\n}\n\nons-input .text-input__label:not(.text-input--material__label) {\n  display: none;\n}\n\nons-input:not([float]) .text-input--material__label--active {\n  display: none;\n}\n\nons-input[disabled],\nons-radio[disabled],\nons-checkbox[disabled],\nons-segment[disabled],\nons-search-input[disabled] {\n  opacity: 0.5;\n  pointer-events: none;\n}\n\nons-input input.text-input--material::-webkit-input-placeholder {\n  color: transparent;\n}\n\nons-input input.text-input--material::-moz-placeholder {\n  color: transparent;\n}\n\nons-input input.text-input--material:-ms-input-placeholder {\n  color: transparent;\n}\n\n/* Suppress safe area support for pages in splitter sides */\n@media (orientation: landscape) {\n  html[onsflag-iphonex-landscape] ons-splitter-side[side=\"left\"] .page__content {\n    padding-right: 0;\n  }\n  html[onsflag-iphonex-landscape] ons-splitter-side[side=\"right\"] .page__content {\n    padding-left: 0;\n  }\n}\n/* Support the situation that a progress bar is located just below a toolbar */\n@media (orientation: landscape) {\n  html[onsflag-iphonex-landscape] .page__content > ons-progress-bar > .progress-bar {\n    margin-left: -44px;\n    margin-right: -44px;\n    width: calc(100% + 88px);\n  }\n}\n/* Lists in .page__content in splitter-sides */\n@media (orientation: landscape) {\n  /* Suppress left safe area support for pages in right splitter sides */\n  html[onsflag-iphonex-landscape] ons-splitter-side[side=\"right\"] .page__content > .list:not(.list--inset) {\n    margin-left: 0;\n  }\n  html[onsflag-iphonex-landscape] ons-splitter-side[side=\"right\"] .page__content > .list:not(.list--inset) > .list-header {\n    padding-left: 15px;\n  }\n  html[onsflag-iphonex-landscape] ons-splitter-side[side=\"right\"] .page__content > .list:not(.list--inset) > .list-item {\n    padding-left: 14px;\n  }\n\n  /* Suppress right safe area support for pages in left splitter sides */\n  html[onsflag-iphonex-landscape] ons-splitter-side[side=\"left\"] .page__content > .list:not(.list--inset) {\n    margin-right: 0;\n  }\n  html[onsflag-iphonex-landscape] ons-splitter-side[side=\"left\"] .page__content > .list:not(.list--inset) > .list-item--chevron:before {\n    right: 16px;\n  }\n  html[onsflag-iphonex-landscape] ons-splitter-side[side=\"left\"] .page__content > .list:not(.list--inset) > .list-item > .list-item__center:last-child {\n    padding-right: 6px;\n  }\n  html[onsflag-iphonex-landscape] ons-splitter-side[side=\"left\"] .page__content > .list:not(.list--inset) > .list-item > .list-item__right {\n    padding-right: 12px;\n  }\n  html[onsflag-iphonex-landscape] ons-splitter-side[side=\"left\"] .page__content > .list:not(.list--inset) > .list-item > .list-item--chevron__right {\n    padding-right: 30px;\n  }\n}\n\n/*\nCopyright 2013-2015 ASIAL CORPORATION\n\nLicensed under the Apache License, Version 2.0 (the \"License\");\nyou may not use this file except in compliance with the License.\nYou may obtain a copy of the License at\n\n   http://www.apache.org/licenses/LICENSE-2.0\n\nUnless required by applicable law or agreed to in writing, software\ndistributed under the License is distributed on an \"AS IS\" BASIS,\nWITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\nSee the License for the specific language governing permissions and\nlimitations under the License.\n\n */\n\nons-progress-bar {\n  display: block;\n}\n\nons-progress-circular {\n  display: inline-block;\n  width: 32px;\n  height: 32px;\n}\n\nons-progress-circular > svg.progress-circular {\n  width: 100%;\n  height: 100%;\n}\n\n/*\nCopyright 2013-2015 ASIAL CORPORATION\n\nLicensed under the Apache License, Version 2.0 (the \"License\");\nyou may not use this file except in compliance with the License.\nYou may obtain a copy of the License at\n\n   http://www.apache.org/licenses/LICENSE-2.0\n\nUnless required by applicable law or agreed to in writing, software\ndistributed under the License is distributed on an \"AS IS\" BASIS,\nWITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\nSee the License for the specific language governing permissions and\nlimitations under the License.\n\n */\n.ripple {\n  display: block;\n  position: absolute;\n  overflow: hidden;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  pointer-events: none;\n}\n\n.ripple__background {\n  background: rgba(255, 255, 255, 0.2);\n  position: absolute;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  opacity: 0;\n  pointer-events: none;\n}\n\n.ripple__wave {\n  background: rgba(255, 255, 255, 0.2);\n  width: 0;\n  height: 0;\n  border-radius: 50%;\n  position: absolute;\n  top: 0;\n  left: 0;\n  z-index: 0;\n  pointer-events: none;\n}\n\n/* FIXME */\nons-list-item .ripple__wave,\nons-list-item .ripple__background,\n.button--material--flat .ripple__wave,\n.button--material--flat .ripple__background {\n  background: rgba(189, 189, 189, 0.3);\n}\n\n.ripple--light-gray__wave,\n.ripple--light-gray__background {\n  background: rgba(189, 189, 189, 0.3);\n}\n\n\n/*\nCopyright 2013-2015 ASIAL CORPORATION\n\nLicensed under the Apache License, Version 2.0 (the \"License\");\nyou may not use this file except in compliance with the License.\nYou may obtain a copy of the License at\n\n   http://www.apache.org/licenses/LICENSE-2.0\n\nUnless required by applicable law or agreed to in writing, software\ndistributed under the License is distributed on an \"AS IS\" BASIS,\nWITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\nSee the License for the specific language governing permissions and\nlimitations under the License.\n\n */\n\n.ons-swiper {\n  overflow: hidden;\n  display: block;\n  box-sizing: border-box;\n}\n\n.ons-swiper-target {\n  display: -webkit-box;\n  display: -webkit-flex;\n  display: flex;\n  height: 100%;\n  z-index: 1;\n  -webkit-box-orient: horizontal;\n  -webkit-box-direction: normal;\n  -webkit-flex-direction: row;\n          flex-direction: row;\n}\n\n.ons-swiper-target--vertical {\n  -webkit-box-orient: vertical;\n  -webkit-box-direction: normal;\n  -webkit-flex-direction: column;\n          flex-direction: column;\n}\n\n.ons-swiper-target > * {\n  height: inherit;\n  -webkit-flex-shrink: 0;\n          flex-shrink: 0;\n  box-sizing: border-box;\n  width: 100%;\n  position: relative !important;\n}\n\n.ons-swiper-tabbar .tabbar--material__button:after {\n  display: none;\n}\n\n.ons-swiper-blocker {\n  display: block;\n  position: absolute;\n  top: 0;\n  bottom: 0;\n  left: 0;\n  right: 0;\n  pointer-events: none\n}\n", ""]);

// exports


/***/ }),
/* 65 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(10)(undefined);
// imports


// module
exports.push([module.i, "@charset \"UTF-8\";/*!\n  Ionicons, v2.0.1\n  Created by Ben Sperry for the Ionic Framework, http://ionicons.com/\n  https://twitter.com/benjsperry  https://twitter.com/ionicframework\n  MIT License: https://github.com/driftyco/ionicons\n\n  Android-style icons originally built by Google’s\n  Material Design Icons: https://github.com/google/material-design-icons\n  used under CC BY http://creativecommons.org/licenses/by/4.0/\n  Modified icons to fit ionicon’s grid from original.\n*/@font-face{font-family:\"Ionicons\";src:url(" + __webpack_require__(32) + ");src:url(" + __webpack_require__(32) + ") format(\"embedded-opentype\"),url(" + __webpack_require__(66) + ") format(\"truetype\"),url(" + __webpack_require__(67) + ") format(\"woff\"),url(" + __webpack_require__(68) + ") format(\"svg\");font-weight:normal;font-style:normal}.ion,.ionicons,.ion-alert:before,.ion-alert-circled:before,.ion-android-add:before,.ion-android-add-circle:before,.ion-android-alarm-clock:before,.ion-android-alert:before,.ion-android-apps:before,.ion-android-archive:before,.ion-android-arrow-back:before,.ion-android-arrow-down:before,.ion-android-arrow-dropdown:before,.ion-android-arrow-dropdown-circle:before,.ion-android-arrow-dropleft:before,.ion-android-arrow-dropleft-circle:before,.ion-android-arrow-dropright:before,.ion-android-arrow-dropright-circle:before,.ion-android-arrow-dropup:before,.ion-android-arrow-dropup-circle:before,.ion-android-arrow-forward:before,.ion-android-arrow-up:before,.ion-android-attach:before,.ion-android-bar:before,.ion-android-bicycle:before,.ion-android-boat:before,.ion-android-bookmark:before,.ion-android-bulb:before,.ion-android-bus:before,.ion-android-calendar:before,.ion-android-call:before,.ion-android-camera:before,.ion-android-cancel:before,.ion-android-car:before,.ion-android-cart:before,.ion-android-chat:before,.ion-android-checkbox:before,.ion-android-checkbox-blank:before,.ion-android-checkbox-outline:before,.ion-android-checkbox-outline-blank:before,.ion-android-checkmark-circle:before,.ion-android-clipboard:before,.ion-android-close:before,.ion-android-cloud:before,.ion-android-cloud-circle:before,.ion-android-cloud-done:before,.ion-android-cloud-outline:before,.ion-android-color-palette:before,.ion-android-compass:before,.ion-android-contact:before,.ion-android-contacts:before,.ion-android-contract:before,.ion-android-create:before,.ion-android-delete:before,.ion-android-desktop:before,.ion-android-document:before,.ion-android-done:before,.ion-android-done-all:before,.ion-android-download:before,.ion-android-drafts:before,.ion-android-exit:before,.ion-android-expand:before,.ion-android-favorite:before,.ion-android-favorite-outline:before,.ion-android-film:before,.ion-android-folder:before,.ion-android-folder-open:before,.ion-android-funnel:before,.ion-android-globe:before,.ion-android-hand:before,.ion-android-hangout:before,.ion-android-happy:before,.ion-android-home:before,.ion-android-image:before,.ion-android-laptop:before,.ion-android-list:before,.ion-android-locate:before,.ion-android-lock:before,.ion-android-mail:before,.ion-android-map:before,.ion-android-menu:before,.ion-android-microphone:before,.ion-android-microphone-off:before,.ion-android-more-horizontal:before,.ion-android-more-vertical:before,.ion-android-navigate:before,.ion-android-notifications:before,.ion-android-notifications-none:before,.ion-android-notifications-off:before,.ion-android-open:before,.ion-android-options:before,.ion-android-people:before,.ion-android-person:before,.ion-android-person-add:before,.ion-android-phone-landscape:before,.ion-android-phone-portrait:before,.ion-android-pin:before,.ion-android-plane:before,.ion-android-playstore:before,.ion-android-print:before,.ion-android-radio-button-off:before,.ion-android-radio-button-on:before,.ion-android-refresh:before,.ion-android-remove:before,.ion-android-remove-circle:before,.ion-android-restaurant:before,.ion-android-sad:before,.ion-android-search:before,.ion-android-send:before,.ion-android-settings:before,.ion-android-share:before,.ion-android-share-alt:before,.ion-android-star:before,.ion-android-star-half:before,.ion-android-star-outline:before,.ion-android-stopwatch:before,.ion-android-subway:before,.ion-android-sunny:before,.ion-android-sync:before,.ion-android-textsms:before,.ion-android-time:before,.ion-android-train:before,.ion-android-unlock:before,.ion-android-upload:before,.ion-android-volume-down:before,.ion-android-volume-mute:before,.ion-android-volume-off:before,.ion-android-volume-up:before,.ion-android-walk:before,.ion-android-warning:before,.ion-android-watch:before,.ion-android-wifi:before,.ion-aperture:before,.ion-archive:before,.ion-arrow-down-a:before,.ion-arrow-down-b:before,.ion-arrow-down-c:before,.ion-arrow-expand:before,.ion-arrow-graph-down-left:before,.ion-arrow-graph-down-right:before,.ion-arrow-graph-up-left:before,.ion-arrow-graph-up-right:before,.ion-arrow-left-a:before,.ion-arrow-left-b:before,.ion-arrow-left-c:before,.ion-arrow-move:before,.ion-arrow-resize:before,.ion-arrow-return-left:before,.ion-arrow-return-right:before,.ion-arrow-right-a:before,.ion-arrow-right-b:before,.ion-arrow-right-c:before,.ion-arrow-shrink:before,.ion-arrow-swap:before,.ion-arrow-up-a:before,.ion-arrow-up-b:before,.ion-arrow-up-c:before,.ion-asterisk:before,.ion-at:before,.ion-backspace:before,.ion-backspace-outline:before,.ion-bag:before,.ion-battery-charging:before,.ion-battery-empty:before,.ion-battery-full:before,.ion-battery-half:before,.ion-battery-low:before,.ion-beaker:before,.ion-beer:before,.ion-bluetooth:before,.ion-bonfire:before,.ion-bookmark:before,.ion-bowtie:before,.ion-briefcase:before,.ion-bug:before,.ion-calculator:before,.ion-calendar:before,.ion-camera:before,.ion-card:before,.ion-cash:before,.ion-chatbox:before,.ion-chatbox-working:before,.ion-chatboxes:before,.ion-chatbubble:before,.ion-chatbubble-working:before,.ion-chatbubbles:before,.ion-checkmark:before,.ion-checkmark-circled:before,.ion-checkmark-round:before,.ion-chevron-down:before,.ion-chevron-left:before,.ion-chevron-right:before,.ion-chevron-up:before,.ion-clipboard:before,.ion-clock:before,.ion-close:before,.ion-close-circled:before,.ion-close-round:before,.ion-closed-captioning:before,.ion-cloud:before,.ion-code:before,.ion-code-download:before,.ion-code-working:before,.ion-coffee:before,.ion-compass:before,.ion-compose:before,.ion-connection-bars:before,.ion-contrast:before,.ion-crop:before,.ion-cube:before,.ion-disc:before,.ion-document:before,.ion-document-text:before,.ion-drag:before,.ion-earth:before,.ion-easel:before,.ion-edit:before,.ion-egg:before,.ion-eject:before,.ion-email:before,.ion-email-unread:before,.ion-erlenmeyer-flask:before,.ion-erlenmeyer-flask-bubbles:before,.ion-eye:before,.ion-eye-disabled:before,.ion-female:before,.ion-filing:before,.ion-film-marker:before,.ion-fireball:before,.ion-flag:before,.ion-flame:before,.ion-flash:before,.ion-flash-off:before,.ion-folder:before,.ion-fork:before,.ion-fork-repo:before,.ion-forward:before,.ion-funnel:before,.ion-gear-a:before,.ion-gear-b:before,.ion-grid:before,.ion-hammer:before,.ion-happy:before,.ion-happy-outline:before,.ion-headphone:before,.ion-heart:before,.ion-heart-broken:before,.ion-help:before,.ion-help-buoy:before,.ion-help-circled:before,.ion-home:before,.ion-icecream:before,.ion-image:before,.ion-images:before,.ion-information:before,.ion-information-circled:before,.ion-ionic:before,.ion-ios-alarm:before,.ion-ios-alarm-outline:before,.ion-ios-albums:before,.ion-ios-albums-outline:before,.ion-ios-americanfootball:before,.ion-ios-americanfootball-outline:before,.ion-ios-analytics:before,.ion-ios-analytics-outline:before,.ion-ios-arrow-back:before,.ion-ios-arrow-down:before,.ion-ios-arrow-forward:before,.ion-ios-arrow-left:before,.ion-ios-arrow-right:before,.ion-ios-arrow-thin-down:before,.ion-ios-arrow-thin-left:before,.ion-ios-arrow-thin-right:before,.ion-ios-arrow-thin-up:before,.ion-ios-arrow-up:before,.ion-ios-at:before,.ion-ios-at-outline:before,.ion-ios-barcode:before,.ion-ios-barcode-outline:before,.ion-ios-baseball:before,.ion-ios-baseball-outline:before,.ion-ios-basketball:before,.ion-ios-basketball-outline:before,.ion-ios-bell:before,.ion-ios-bell-outline:before,.ion-ios-body:before,.ion-ios-body-outline:before,.ion-ios-bolt:before,.ion-ios-bolt-outline:before,.ion-ios-book:before,.ion-ios-book-outline:before,.ion-ios-bookmarks:before,.ion-ios-bookmarks-outline:before,.ion-ios-box:before,.ion-ios-box-outline:before,.ion-ios-briefcase:before,.ion-ios-briefcase-outline:before,.ion-ios-browsers:before,.ion-ios-browsers-outline:before,.ion-ios-calculator:before,.ion-ios-calculator-outline:before,.ion-ios-calendar:before,.ion-ios-calendar-outline:before,.ion-ios-camera:before,.ion-ios-camera-outline:before,.ion-ios-cart:before,.ion-ios-cart-outline:before,.ion-ios-chatboxes:before,.ion-ios-chatboxes-outline:before,.ion-ios-chatbubble:before,.ion-ios-chatbubble-outline:before,.ion-ios-checkmark:before,.ion-ios-checkmark-empty:before,.ion-ios-checkmark-outline:before,.ion-ios-circle-filled:before,.ion-ios-circle-outline:before,.ion-ios-clock:before,.ion-ios-clock-outline:before,.ion-ios-close:before,.ion-ios-close-empty:before,.ion-ios-close-outline:before,.ion-ios-cloud:before,.ion-ios-cloud-download:before,.ion-ios-cloud-download-outline:before,.ion-ios-cloud-outline:before,.ion-ios-cloud-upload:before,.ion-ios-cloud-upload-outline:before,.ion-ios-cloudy:before,.ion-ios-cloudy-night:before,.ion-ios-cloudy-night-outline:before,.ion-ios-cloudy-outline:before,.ion-ios-cog:before,.ion-ios-cog-outline:before,.ion-ios-color-filter:before,.ion-ios-color-filter-outline:before,.ion-ios-color-wand:before,.ion-ios-color-wand-outline:before,.ion-ios-compose:before,.ion-ios-compose-outline:before,.ion-ios-contact:before,.ion-ios-contact-outline:before,.ion-ios-copy:before,.ion-ios-copy-outline:before,.ion-ios-crop:before,.ion-ios-crop-strong:before,.ion-ios-download:before,.ion-ios-download-outline:before,.ion-ios-drag:before,.ion-ios-email:before,.ion-ios-email-outline:before,.ion-ios-eye:before,.ion-ios-eye-outline:before,.ion-ios-fastforward:before,.ion-ios-fastforward-outline:before,.ion-ios-filing:before,.ion-ios-filing-outline:before,.ion-ios-film:before,.ion-ios-film-outline:before,.ion-ios-flag:before,.ion-ios-flag-outline:before,.ion-ios-flame:before,.ion-ios-flame-outline:before,.ion-ios-flask:before,.ion-ios-flask-outline:before,.ion-ios-flower:before,.ion-ios-flower-outline:before,.ion-ios-folder:before,.ion-ios-folder-outline:before,.ion-ios-football:before,.ion-ios-football-outline:before,.ion-ios-game-controller-a:before,.ion-ios-game-controller-a-outline:before,.ion-ios-game-controller-b:before,.ion-ios-game-controller-b-outline:before,.ion-ios-gear:before,.ion-ios-gear-outline:before,.ion-ios-glasses:before,.ion-ios-glasses-outline:before,.ion-ios-grid-view:before,.ion-ios-grid-view-outline:before,.ion-ios-heart:before,.ion-ios-heart-outline:before,.ion-ios-help:before,.ion-ios-help-empty:before,.ion-ios-help-outline:before,.ion-ios-home:before,.ion-ios-home-outline:before,.ion-ios-infinite:before,.ion-ios-infinite-outline:before,.ion-ios-information:before,.ion-ios-information-empty:before,.ion-ios-information-outline:before,.ion-ios-ionic-outline:before,.ion-ios-keypad:before,.ion-ios-keypad-outline:before,.ion-ios-lightbulb:before,.ion-ios-lightbulb-outline:before,.ion-ios-list:before,.ion-ios-list-outline:before,.ion-ios-location:before,.ion-ios-location-outline:before,.ion-ios-locked:before,.ion-ios-locked-outline:before,.ion-ios-loop:before,.ion-ios-loop-strong:before,.ion-ios-medical:before,.ion-ios-medical-outline:before,.ion-ios-medkit:before,.ion-ios-medkit-outline:before,.ion-ios-mic:before,.ion-ios-mic-off:before,.ion-ios-mic-outline:before,.ion-ios-minus:before,.ion-ios-minus-empty:before,.ion-ios-minus-outline:before,.ion-ios-monitor:before,.ion-ios-monitor-outline:before,.ion-ios-moon:before,.ion-ios-moon-outline:before,.ion-ios-more:before,.ion-ios-more-outline:before,.ion-ios-musical-note:before,.ion-ios-musical-notes:before,.ion-ios-navigate:before,.ion-ios-navigate-outline:before,.ion-ios-nutrition:before,.ion-ios-nutrition-outline:before,.ion-ios-paper:before,.ion-ios-paper-outline:before,.ion-ios-paperplane:before,.ion-ios-paperplane-outline:before,.ion-ios-partlysunny:before,.ion-ios-partlysunny-outline:before,.ion-ios-pause:before,.ion-ios-pause-outline:before,.ion-ios-paw:before,.ion-ios-paw-outline:before,.ion-ios-people:before,.ion-ios-people-outline:before,.ion-ios-person:before,.ion-ios-person-outline:before,.ion-ios-personadd:before,.ion-ios-personadd-outline:before,.ion-ios-photos:before,.ion-ios-photos-outline:before,.ion-ios-pie:before,.ion-ios-pie-outline:before,.ion-ios-pint:before,.ion-ios-pint-outline:before,.ion-ios-play:before,.ion-ios-play-outline:before,.ion-ios-plus:before,.ion-ios-plus-empty:before,.ion-ios-plus-outline:before,.ion-ios-pricetag:before,.ion-ios-pricetag-outline:before,.ion-ios-pricetags:before,.ion-ios-pricetags-outline:before,.ion-ios-printer:before,.ion-ios-printer-outline:before,.ion-ios-pulse:before,.ion-ios-pulse-strong:before,.ion-ios-rainy:before,.ion-ios-rainy-outline:before,.ion-ios-recording:before,.ion-ios-recording-outline:before,.ion-ios-redo:before,.ion-ios-redo-outline:before,.ion-ios-refresh:before,.ion-ios-refresh-empty:before,.ion-ios-refresh-outline:before,.ion-ios-reload:before,.ion-ios-reverse-camera:before,.ion-ios-reverse-camera-outline:before,.ion-ios-rewind:before,.ion-ios-rewind-outline:before,.ion-ios-rose:before,.ion-ios-rose-outline:before,.ion-ios-search:before,.ion-ios-search-strong:before,.ion-ios-settings:before,.ion-ios-settings-strong:before,.ion-ios-shuffle:before,.ion-ios-shuffle-strong:before,.ion-ios-skipbackward:before,.ion-ios-skipbackward-outline:before,.ion-ios-skipforward:before,.ion-ios-skipforward-outline:before,.ion-ios-snowy:before,.ion-ios-speedometer:before,.ion-ios-speedometer-outline:before,.ion-ios-star:before,.ion-ios-star-half:before,.ion-ios-star-outline:before,.ion-ios-stopwatch:before,.ion-ios-stopwatch-outline:before,.ion-ios-sunny:before,.ion-ios-sunny-outline:before,.ion-ios-telephone:before,.ion-ios-telephone-outline:before,.ion-ios-tennisball:before,.ion-ios-tennisball-outline:before,.ion-ios-thunderstorm:before,.ion-ios-thunderstorm-outline:before,.ion-ios-time:before,.ion-ios-time-outline:before,.ion-ios-timer:before,.ion-ios-timer-outline:before,.ion-ios-toggle:before,.ion-ios-toggle-outline:before,.ion-ios-trash:before,.ion-ios-trash-outline:before,.ion-ios-undo:before,.ion-ios-undo-outline:before,.ion-ios-unlocked:before,.ion-ios-unlocked-outline:before,.ion-ios-upload:before,.ion-ios-upload-outline:before,.ion-ios-videocam:before,.ion-ios-videocam-outline:before,.ion-ios-volume-high:before,.ion-ios-volume-low:before,.ion-ios-wineglass:before,.ion-ios-wineglass-outline:before,.ion-ios-world:before,.ion-ios-world-outline:before,.ion-ipad:before,.ion-iphone:before,.ion-ipod:before,.ion-jet:before,.ion-key:before,.ion-knife:before,.ion-laptop:before,.ion-leaf:before,.ion-levels:before,.ion-lightbulb:before,.ion-link:before,.ion-load-a:before,.ion-load-b:before,.ion-load-c:before,.ion-load-d:before,.ion-location:before,.ion-lock-combination:before,.ion-locked:before,.ion-log-in:before,.ion-log-out:before,.ion-loop:before,.ion-magnet:before,.ion-male:before,.ion-man:before,.ion-map:before,.ion-medkit:before,.ion-merge:before,.ion-mic-a:before,.ion-mic-b:before,.ion-mic-c:before,.ion-minus:before,.ion-minus-circled:before,.ion-minus-round:before,.ion-model-s:before,.ion-monitor:before,.ion-more:before,.ion-mouse:before,.ion-music-note:before,.ion-navicon:before,.ion-navicon-round:before,.ion-navigate:before,.ion-network:before,.ion-no-smoking:before,.ion-nuclear:before,.ion-outlet:before,.ion-paintbrush:before,.ion-paintbucket:before,.ion-paper-airplane:before,.ion-paperclip:before,.ion-pause:before,.ion-person:before,.ion-person-add:before,.ion-person-stalker:before,.ion-pie-graph:before,.ion-pin:before,.ion-pinpoint:before,.ion-pizza:before,.ion-plane:before,.ion-planet:before,.ion-play:before,.ion-playstation:before,.ion-plus:before,.ion-plus-circled:before,.ion-plus-round:before,.ion-podium:before,.ion-pound:before,.ion-power:before,.ion-pricetag:before,.ion-pricetags:before,.ion-printer:before,.ion-pull-request:before,.ion-qr-scanner:before,.ion-quote:before,.ion-radio-waves:before,.ion-record:before,.ion-refresh:before,.ion-reply:before,.ion-reply-all:before,.ion-ribbon-a:before,.ion-ribbon-b:before,.ion-sad:before,.ion-sad-outline:before,.ion-scissors:before,.ion-search:before,.ion-settings:before,.ion-share:before,.ion-shuffle:before,.ion-skip-backward:before,.ion-skip-forward:before,.ion-social-android:before,.ion-social-android-outline:before,.ion-social-angular:before,.ion-social-angular-outline:before,.ion-social-apple:before,.ion-social-apple-outline:before,.ion-social-bitcoin:before,.ion-social-bitcoin-outline:before,.ion-social-buffer:before,.ion-social-buffer-outline:before,.ion-social-chrome:before,.ion-social-chrome-outline:before,.ion-social-codepen:before,.ion-social-codepen-outline:before,.ion-social-css3:before,.ion-social-css3-outline:before,.ion-social-designernews:before,.ion-social-designernews-outline:before,.ion-social-dribbble:before,.ion-social-dribbble-outline:before,.ion-social-dropbox:before,.ion-social-dropbox-outline:before,.ion-social-euro:before,.ion-social-euro-outline:before,.ion-social-facebook:before,.ion-social-facebook-outline:before,.ion-social-foursquare:before,.ion-social-foursquare-outline:before,.ion-social-freebsd-devil:before,.ion-social-github:before,.ion-social-github-outline:before,.ion-social-google:before,.ion-social-google-outline:before,.ion-social-googleplus:before,.ion-social-googleplus-outline:before,.ion-social-hackernews:before,.ion-social-hackernews-outline:before,.ion-social-html5:before,.ion-social-html5-outline:before,.ion-social-instagram:before,.ion-social-instagram-outline:before,.ion-social-javascript:before,.ion-social-javascript-outline:before,.ion-social-linkedin:before,.ion-social-linkedin-outline:before,.ion-social-markdown:before,.ion-social-nodejs:before,.ion-social-octocat:before,.ion-social-pinterest:before,.ion-social-pinterest-outline:before,.ion-social-python:before,.ion-social-reddit:before,.ion-social-reddit-outline:before,.ion-social-rss:before,.ion-social-rss-outline:before,.ion-social-sass:before,.ion-social-skype:before,.ion-social-skype-outline:before,.ion-social-snapchat:before,.ion-social-snapchat-outline:before,.ion-social-tumblr:before,.ion-social-tumblr-outline:before,.ion-social-tux:before,.ion-social-twitch:before,.ion-social-twitch-outline:before,.ion-social-twitter:before,.ion-social-twitter-outline:before,.ion-social-usd:before,.ion-social-usd-outline:before,.ion-social-vimeo:before,.ion-social-vimeo-outline:before,.ion-social-whatsapp:before,.ion-social-whatsapp-outline:before,.ion-social-windows:before,.ion-social-windows-outline:before,.ion-social-wordpress:before,.ion-social-wordpress-outline:before,.ion-social-yahoo:before,.ion-social-yahoo-outline:before,.ion-social-yen:before,.ion-social-yen-outline:before,.ion-social-youtube:before,.ion-social-youtube-outline:before,.ion-soup-can:before,.ion-soup-can-outline:before,.ion-speakerphone:before,.ion-speedometer:before,.ion-spoon:before,.ion-star:before,.ion-stats-bars:before,.ion-steam:before,.ion-stop:before,.ion-thermometer:before,.ion-thumbsdown:before,.ion-thumbsup:before,.ion-toggle:before,.ion-toggle-filled:before,.ion-transgender:before,.ion-trash-a:before,.ion-trash-b:before,.ion-trophy:before,.ion-tshirt:before,.ion-tshirt-outline:before,.ion-umbrella:before,.ion-university:before,.ion-unlocked:before,.ion-upload:before,.ion-usb:before,.ion-videocamera:before,.ion-volume-high:before,.ion-volume-low:before,.ion-volume-medium:before,.ion-volume-mute:before,.ion-wand:before,.ion-waterdrop:before,.ion-wifi:before,.ion-wineglass:before,.ion-woman:before,.ion-wrench:before,.ion-xbox:before{display:inline-block;font-family:\"Ionicons\";speak:none;font-style:normal;font-weight:normal;font-variant:normal;text-transform:none;text-rendering:auto;line-height:1;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}.ion-alert:before{content:\"\\F101\"}.ion-alert-circled:before{content:\"\\F100\"}.ion-android-add:before{content:\"\\F2C7\"}.ion-android-add-circle:before{content:\"\\F359\"}.ion-android-alarm-clock:before{content:\"\\F35A\"}.ion-android-alert:before{content:\"\\F35B\"}.ion-android-apps:before{content:\"\\F35C\"}.ion-android-archive:before{content:\"\\F2C9\"}.ion-android-arrow-back:before{content:\"\\F2CA\"}.ion-android-arrow-down:before{content:\"\\F35D\"}.ion-android-arrow-dropdown:before{content:\"\\F35F\"}.ion-android-arrow-dropdown-circle:before{content:\"\\F35E\"}.ion-android-arrow-dropleft:before{content:\"\\F361\"}.ion-android-arrow-dropleft-circle:before{content:\"\\F360\"}.ion-android-arrow-dropright:before{content:\"\\F363\"}.ion-android-arrow-dropright-circle:before{content:\"\\F362\"}.ion-android-arrow-dropup:before{content:\"\\F365\"}.ion-android-arrow-dropup-circle:before{content:\"\\F364\"}.ion-android-arrow-forward:before{content:\"\\F30F\"}.ion-android-arrow-up:before{content:\"\\F366\"}.ion-android-attach:before{content:\"\\F367\"}.ion-android-bar:before{content:\"\\F368\"}.ion-android-bicycle:before{content:\"\\F369\"}.ion-android-boat:before{content:\"\\F36A\"}.ion-android-bookmark:before{content:\"\\F36B\"}.ion-android-bulb:before{content:\"\\F36C\"}.ion-android-bus:before{content:\"\\F36D\"}.ion-android-calendar:before{content:\"\\F2D1\"}.ion-android-call:before{content:\"\\F2D2\"}.ion-android-camera:before{content:\"\\F2D3\"}.ion-android-cancel:before{content:\"\\F36E\"}.ion-android-car:before{content:\"\\F36F\"}.ion-android-cart:before{content:\"\\F370\"}.ion-android-chat:before{content:\"\\F2D4\"}.ion-android-checkbox:before{content:\"\\F374\"}.ion-android-checkbox-blank:before{content:\"\\F371\"}.ion-android-checkbox-outline:before{content:\"\\F373\"}.ion-android-checkbox-outline-blank:before{content:\"\\F372\"}.ion-android-checkmark-circle:before{content:\"\\F375\"}.ion-android-clipboard:before{content:\"\\F376\"}.ion-android-close:before{content:\"\\F2D7\"}.ion-android-cloud:before{content:\"\\F37A\"}.ion-android-cloud-circle:before{content:\"\\F377\"}.ion-android-cloud-done:before{content:\"\\F378\"}.ion-android-cloud-outline:before{content:\"\\F379\"}.ion-android-color-palette:before{content:\"\\F37B\"}.ion-android-compass:before{content:\"\\F37C\"}.ion-android-contact:before{content:\"\\F2D8\"}.ion-android-contacts:before{content:\"\\F2D9\"}.ion-android-contract:before{content:\"\\F37D\"}.ion-android-create:before{content:\"\\F37E\"}.ion-android-delete:before{content:\"\\F37F\"}.ion-android-desktop:before{content:\"\\F380\"}.ion-android-document:before{content:\"\\F381\"}.ion-android-done:before{content:\"\\F383\"}.ion-android-done-all:before{content:\"\\F382\"}.ion-android-download:before{content:\"\\F2DD\"}.ion-android-drafts:before{content:\"\\F384\"}.ion-android-exit:before{content:\"\\F385\"}.ion-android-expand:before{content:\"\\F386\"}.ion-android-favorite:before{content:\"\\F388\"}.ion-android-favorite-outline:before{content:\"\\F387\"}.ion-android-film:before{content:\"\\F389\"}.ion-android-folder:before{content:\"\\F2E0\"}.ion-android-folder-open:before{content:\"\\F38A\"}.ion-android-funnel:before{content:\"\\F38B\"}.ion-android-globe:before{content:\"\\F38C\"}.ion-android-hand:before{content:\"\\F2E3\"}.ion-android-hangout:before{content:\"\\F38D\"}.ion-android-happy:before{content:\"\\F38E\"}.ion-android-home:before{content:\"\\F38F\"}.ion-android-image:before{content:\"\\F2E4\"}.ion-android-laptop:before{content:\"\\F390\"}.ion-android-list:before{content:\"\\F391\"}.ion-android-locate:before{content:\"\\F2E9\"}.ion-android-lock:before{content:\"\\F392\"}.ion-android-mail:before{content:\"\\F2EB\"}.ion-android-map:before{content:\"\\F393\"}.ion-android-menu:before{content:\"\\F394\"}.ion-android-microphone:before{content:\"\\F2EC\"}.ion-android-microphone-off:before{content:\"\\F395\"}.ion-android-more-horizontal:before{content:\"\\F396\"}.ion-android-more-vertical:before{content:\"\\F397\"}.ion-android-navigate:before{content:\"\\F398\"}.ion-android-notifications:before{content:\"\\F39B\"}.ion-android-notifications-none:before{content:\"\\F399\"}.ion-android-notifications-off:before{content:\"\\F39A\"}.ion-android-open:before{content:\"\\F39C\"}.ion-android-options:before{content:\"\\F39D\"}.ion-android-people:before{content:\"\\F39E\"}.ion-android-person:before{content:\"\\F3A0\"}.ion-android-person-add:before{content:\"\\F39F\"}.ion-android-phone-landscape:before{content:\"\\F3A1\"}.ion-android-phone-portrait:before{content:\"\\F3A2\"}.ion-android-pin:before{content:\"\\F3A3\"}.ion-android-plane:before{content:\"\\F3A4\"}.ion-android-playstore:before{content:\"\\F2F0\"}.ion-android-print:before{content:\"\\F3A5\"}.ion-android-radio-button-off:before{content:\"\\F3A6\"}.ion-android-radio-button-on:before{content:\"\\F3A7\"}.ion-android-refresh:before{content:\"\\F3A8\"}.ion-android-remove:before{content:\"\\F2F4\"}.ion-android-remove-circle:before{content:\"\\F3A9\"}.ion-android-restaurant:before{content:\"\\F3AA\"}.ion-android-sad:before{content:\"\\F3AB\"}.ion-android-search:before{content:\"\\F2F5\"}.ion-android-send:before{content:\"\\F2F6\"}.ion-android-settings:before{content:\"\\F2F7\"}.ion-android-share:before{content:\"\\F2F8\"}.ion-android-share-alt:before{content:\"\\F3AC\"}.ion-android-star:before{content:\"\\F2FC\"}.ion-android-star-half:before{content:\"\\F3AD\"}.ion-android-star-outline:before{content:\"\\F3AE\"}.ion-android-stopwatch:before{content:\"\\F2FD\"}.ion-android-subway:before{content:\"\\F3AF\"}.ion-android-sunny:before{content:\"\\F3B0\"}.ion-android-sync:before{content:\"\\F3B1\"}.ion-android-textsms:before{content:\"\\F3B2\"}.ion-android-time:before{content:\"\\F3B3\"}.ion-android-train:before{content:\"\\F3B4\"}.ion-android-unlock:before{content:\"\\F3B5\"}.ion-android-upload:before{content:\"\\F3B6\"}.ion-android-volume-down:before{content:\"\\F3B7\"}.ion-android-volume-mute:before{content:\"\\F3B8\"}.ion-android-volume-off:before{content:\"\\F3B9\"}.ion-android-volume-up:before{content:\"\\F3BA\"}.ion-android-walk:before{content:\"\\F3BB\"}.ion-android-warning:before{content:\"\\F3BC\"}.ion-android-watch:before{content:\"\\F3BD\"}.ion-android-wifi:before{content:\"\\F305\"}.ion-aperture:before{content:\"\\F313\"}.ion-archive:before{content:\"\\F102\"}.ion-arrow-down-a:before{content:\"\\F103\"}.ion-arrow-down-b:before{content:\"\\F104\"}.ion-arrow-down-c:before{content:\"\\F105\"}.ion-arrow-expand:before{content:\"\\F25E\"}.ion-arrow-graph-down-left:before{content:\"\\F25F\"}.ion-arrow-graph-down-right:before{content:\"\\F260\"}.ion-arrow-graph-up-left:before{content:\"\\F261\"}.ion-arrow-graph-up-right:before{content:\"\\F262\"}.ion-arrow-left-a:before{content:\"\\F106\"}.ion-arrow-left-b:before{content:\"\\F107\"}.ion-arrow-left-c:before{content:\"\\F108\"}.ion-arrow-move:before{content:\"\\F263\"}.ion-arrow-resize:before{content:\"\\F264\"}.ion-arrow-return-left:before{content:\"\\F265\"}.ion-arrow-return-right:before{content:\"\\F266\"}.ion-arrow-right-a:before{content:\"\\F109\"}.ion-arrow-right-b:before{content:\"\\F10A\"}.ion-arrow-right-c:before{content:\"\\F10B\"}.ion-arrow-shrink:before{content:\"\\F267\"}.ion-arrow-swap:before{content:\"\\F268\"}.ion-arrow-up-a:before{content:\"\\F10C\"}.ion-arrow-up-b:before{content:\"\\F10D\"}.ion-arrow-up-c:before{content:\"\\F10E\"}.ion-asterisk:before{content:\"\\F314\"}.ion-at:before{content:\"\\F10F\"}.ion-backspace:before{content:\"\\F3BF\"}.ion-backspace-outline:before{content:\"\\F3BE\"}.ion-bag:before{content:\"\\F110\"}.ion-battery-charging:before{content:\"\\F111\"}.ion-battery-empty:before{content:\"\\F112\"}.ion-battery-full:before{content:\"\\F113\"}.ion-battery-half:before{content:\"\\F114\"}.ion-battery-low:before{content:\"\\F115\"}.ion-beaker:before{content:\"\\F269\"}.ion-beer:before{content:\"\\F26A\"}.ion-bluetooth:before{content:\"\\F116\"}.ion-bonfire:before{content:\"\\F315\"}.ion-bookmark:before{content:\"\\F26B\"}.ion-bowtie:before{content:\"\\F3C0\"}.ion-briefcase:before{content:\"\\F26C\"}.ion-bug:before{content:\"\\F2BE\"}.ion-calculator:before{content:\"\\F26D\"}.ion-calendar:before{content:\"\\F117\"}.ion-camera:before{content:\"\\F118\"}.ion-card:before{content:\"\\F119\"}.ion-cash:before{content:\"\\F316\"}.ion-chatbox:before{content:\"\\F11B\"}.ion-chatbox-working:before{content:\"\\F11A\"}.ion-chatboxes:before{content:\"\\F11C\"}.ion-chatbubble:before{content:\"\\F11E\"}.ion-chatbubble-working:before{content:\"\\F11D\"}.ion-chatbubbles:before{content:\"\\F11F\"}.ion-checkmark:before{content:\"\\F122\"}.ion-checkmark-circled:before{content:\"\\F120\"}.ion-checkmark-round:before{content:\"\\F121\"}.ion-chevron-down:before{content:\"\\F123\"}.ion-chevron-left:before{content:\"\\F124\"}.ion-chevron-right:before{content:\"\\F125\"}.ion-chevron-up:before{content:\"\\F126\"}.ion-clipboard:before{content:\"\\F127\"}.ion-clock:before{content:\"\\F26E\"}.ion-close:before{content:\"\\F12A\"}.ion-close-circled:before{content:\"\\F128\"}.ion-close-round:before{content:\"\\F129\"}.ion-closed-captioning:before{content:\"\\F317\"}.ion-cloud:before{content:\"\\F12B\"}.ion-code:before{content:\"\\F271\"}.ion-code-download:before{content:\"\\F26F\"}.ion-code-working:before{content:\"\\F270\"}.ion-coffee:before{content:\"\\F272\"}.ion-compass:before{content:\"\\F273\"}.ion-compose:before{content:\"\\F12C\"}.ion-connection-bars:before{content:\"\\F274\"}.ion-contrast:before{content:\"\\F275\"}.ion-crop:before{content:\"\\F3C1\"}.ion-cube:before{content:\"\\F318\"}.ion-disc:before{content:\"\\F12D\"}.ion-document:before{content:\"\\F12F\"}.ion-document-text:before{content:\"\\F12E\"}.ion-drag:before{content:\"\\F130\"}.ion-earth:before{content:\"\\F276\"}.ion-easel:before{content:\"\\F3C2\"}.ion-edit:before{content:\"\\F2BF\"}.ion-egg:before{content:\"\\F277\"}.ion-eject:before{content:\"\\F131\"}.ion-email:before{content:\"\\F132\"}.ion-email-unread:before{content:\"\\F3C3\"}.ion-erlenmeyer-flask:before{content:\"\\F3C5\"}.ion-erlenmeyer-flask-bubbles:before{content:\"\\F3C4\"}.ion-eye:before{content:\"\\F133\"}.ion-eye-disabled:before{content:\"\\F306\"}.ion-female:before{content:\"\\F278\"}.ion-filing:before{content:\"\\F134\"}.ion-film-marker:before{content:\"\\F135\"}.ion-fireball:before{content:\"\\F319\"}.ion-flag:before{content:\"\\F279\"}.ion-flame:before{content:\"\\F31A\"}.ion-flash:before{content:\"\\F137\"}.ion-flash-off:before{content:\"\\F136\"}.ion-folder:before{content:\"\\F139\"}.ion-fork:before{content:\"\\F27A\"}.ion-fork-repo:before{content:\"\\F2C0\"}.ion-forward:before{content:\"\\F13A\"}.ion-funnel:before{content:\"\\F31B\"}.ion-gear-a:before{content:\"\\F13D\"}.ion-gear-b:before{content:\"\\F13E\"}.ion-grid:before{content:\"\\F13F\"}.ion-hammer:before{content:\"\\F27B\"}.ion-happy:before{content:\"\\F31C\"}.ion-happy-outline:before{content:\"\\F3C6\"}.ion-headphone:before{content:\"\\F140\"}.ion-heart:before{content:\"\\F141\"}.ion-heart-broken:before{content:\"\\F31D\"}.ion-help:before{content:\"\\F143\"}.ion-help-buoy:before{content:\"\\F27C\"}.ion-help-circled:before{content:\"\\F142\"}.ion-home:before{content:\"\\F144\"}.ion-icecream:before{content:\"\\F27D\"}.ion-image:before{content:\"\\F147\"}.ion-images:before{content:\"\\F148\"}.ion-information:before{content:\"\\F14A\"}.ion-information-circled:before{content:\"\\F149\"}.ion-ionic:before{content:\"\\F14B\"}.ion-ios-alarm:before{content:\"\\F3C8\"}.ion-ios-alarm-outline:before{content:\"\\F3C7\"}.ion-ios-albums:before{content:\"\\F3CA\"}.ion-ios-albums-outline:before{content:\"\\F3C9\"}.ion-ios-americanfootball:before{content:\"\\F3CC\"}.ion-ios-americanfootball-outline:before{content:\"\\F3CB\"}.ion-ios-analytics:before{content:\"\\F3CE\"}.ion-ios-analytics-outline:before{content:\"\\F3CD\"}.ion-ios-arrow-back:before{content:\"\\F3CF\"}.ion-ios-arrow-down:before{content:\"\\F3D0\"}.ion-ios-arrow-forward:before{content:\"\\F3D1\"}.ion-ios-arrow-left:before{content:\"\\F3D2\"}.ion-ios-arrow-right:before{content:\"\\F3D3\"}.ion-ios-arrow-thin-down:before{content:\"\\F3D4\"}.ion-ios-arrow-thin-left:before{content:\"\\F3D5\"}.ion-ios-arrow-thin-right:before{content:\"\\F3D6\"}.ion-ios-arrow-thin-up:before{content:\"\\F3D7\"}.ion-ios-arrow-up:before{content:\"\\F3D8\"}.ion-ios-at:before{content:\"\\F3DA\"}.ion-ios-at-outline:before{content:\"\\F3D9\"}.ion-ios-barcode:before{content:\"\\F3DC\"}.ion-ios-barcode-outline:before{content:\"\\F3DB\"}.ion-ios-baseball:before{content:\"\\F3DE\"}.ion-ios-baseball-outline:before{content:\"\\F3DD\"}.ion-ios-basketball:before{content:\"\\F3E0\"}.ion-ios-basketball-outline:before{content:\"\\F3DF\"}.ion-ios-bell:before{content:\"\\F3E2\"}.ion-ios-bell-outline:before{content:\"\\F3E1\"}.ion-ios-body:before{content:\"\\F3E4\"}.ion-ios-body-outline:before{content:\"\\F3E3\"}.ion-ios-bolt:before{content:\"\\F3E6\"}.ion-ios-bolt-outline:before{content:\"\\F3E5\"}.ion-ios-book:before{content:\"\\F3E8\"}.ion-ios-book-outline:before{content:\"\\F3E7\"}.ion-ios-bookmarks:before{content:\"\\F3EA\"}.ion-ios-bookmarks-outline:before{content:\"\\F3E9\"}.ion-ios-box:before{content:\"\\F3EC\"}.ion-ios-box-outline:before{content:\"\\F3EB\"}.ion-ios-briefcase:before{content:\"\\F3EE\"}.ion-ios-briefcase-outline:before{content:\"\\F3ED\"}.ion-ios-browsers:before{content:\"\\F3F0\"}.ion-ios-browsers-outline:before{content:\"\\F3EF\"}.ion-ios-calculator:before{content:\"\\F3F2\"}.ion-ios-calculator-outline:before{content:\"\\F3F1\"}.ion-ios-calendar:before{content:\"\\F3F4\"}.ion-ios-calendar-outline:before{content:\"\\F3F3\"}.ion-ios-camera:before{content:\"\\F3F6\"}.ion-ios-camera-outline:before{content:\"\\F3F5\"}.ion-ios-cart:before{content:\"\\F3F8\"}.ion-ios-cart-outline:before{content:\"\\F3F7\"}.ion-ios-chatboxes:before{content:\"\\F3FA\"}.ion-ios-chatboxes-outline:before{content:\"\\F3F9\"}.ion-ios-chatbubble:before{content:\"\\F3FC\"}.ion-ios-chatbubble-outline:before{content:\"\\F3FB\"}.ion-ios-checkmark:before{content:\"\\F3FF\"}.ion-ios-checkmark-empty:before{content:\"\\F3FD\"}.ion-ios-checkmark-outline:before{content:\"\\F3FE\"}.ion-ios-circle-filled:before{content:\"\\F400\"}.ion-ios-circle-outline:before{content:\"\\F401\"}.ion-ios-clock:before{content:\"\\F403\"}.ion-ios-clock-outline:before{content:\"\\F402\"}.ion-ios-close:before{content:\"\\F406\"}.ion-ios-close-empty:before{content:\"\\F404\"}.ion-ios-close-outline:before{content:\"\\F405\"}.ion-ios-cloud:before{content:\"\\F40C\"}.ion-ios-cloud-download:before{content:\"\\F408\"}.ion-ios-cloud-download-outline:before{content:\"\\F407\"}.ion-ios-cloud-outline:before{content:\"\\F409\"}.ion-ios-cloud-upload:before{content:\"\\F40B\"}.ion-ios-cloud-upload-outline:before{content:\"\\F40A\"}.ion-ios-cloudy:before{content:\"\\F410\"}.ion-ios-cloudy-night:before{content:\"\\F40E\"}.ion-ios-cloudy-night-outline:before{content:\"\\F40D\"}.ion-ios-cloudy-outline:before{content:\"\\F40F\"}.ion-ios-cog:before{content:\"\\F412\"}.ion-ios-cog-outline:before{content:\"\\F411\"}.ion-ios-color-filter:before{content:\"\\F414\"}.ion-ios-color-filter-outline:before{content:\"\\F413\"}.ion-ios-color-wand:before{content:\"\\F416\"}.ion-ios-color-wand-outline:before{content:\"\\F415\"}.ion-ios-compose:before{content:\"\\F418\"}.ion-ios-compose-outline:before{content:\"\\F417\"}.ion-ios-contact:before{content:\"\\F41A\"}.ion-ios-contact-outline:before{content:\"\\F419\"}.ion-ios-copy:before{content:\"\\F41C\"}.ion-ios-copy-outline:before{content:\"\\F41B\"}.ion-ios-crop:before{content:\"\\F41E\"}.ion-ios-crop-strong:before{content:\"\\F41D\"}.ion-ios-download:before{content:\"\\F420\"}.ion-ios-download-outline:before{content:\"\\F41F\"}.ion-ios-drag:before{content:\"\\F421\"}.ion-ios-email:before{content:\"\\F423\"}.ion-ios-email-outline:before{content:\"\\F422\"}.ion-ios-eye:before{content:\"\\F425\"}.ion-ios-eye-outline:before{content:\"\\F424\"}.ion-ios-fastforward:before{content:\"\\F427\"}.ion-ios-fastforward-outline:before{content:\"\\F426\"}.ion-ios-filing:before{content:\"\\F429\"}.ion-ios-filing-outline:before{content:\"\\F428\"}.ion-ios-film:before{content:\"\\F42B\"}.ion-ios-film-outline:before{content:\"\\F42A\"}.ion-ios-flag:before{content:\"\\F42D\"}.ion-ios-flag-outline:before{content:\"\\F42C\"}.ion-ios-flame:before{content:\"\\F42F\"}.ion-ios-flame-outline:before{content:\"\\F42E\"}.ion-ios-flask:before{content:\"\\F431\"}.ion-ios-flask-outline:before{content:\"\\F430\"}.ion-ios-flower:before{content:\"\\F433\"}.ion-ios-flower-outline:before{content:\"\\F432\"}.ion-ios-folder:before{content:\"\\F435\"}.ion-ios-folder-outline:before{content:\"\\F434\"}.ion-ios-football:before{content:\"\\F437\"}.ion-ios-football-outline:before{content:\"\\F436\"}.ion-ios-game-controller-a:before{content:\"\\F439\"}.ion-ios-game-controller-a-outline:before{content:\"\\F438\"}.ion-ios-game-controller-b:before{content:\"\\F43B\"}.ion-ios-game-controller-b-outline:before{content:\"\\F43A\"}.ion-ios-gear:before{content:\"\\F43D\"}.ion-ios-gear-outline:before{content:\"\\F43C\"}.ion-ios-glasses:before{content:\"\\F43F\"}.ion-ios-glasses-outline:before{content:\"\\F43E\"}.ion-ios-grid-view:before{content:\"\\F441\"}.ion-ios-grid-view-outline:before{content:\"\\F440\"}.ion-ios-heart:before{content:\"\\F443\"}.ion-ios-heart-outline:before{content:\"\\F442\"}.ion-ios-help:before{content:\"\\F446\"}.ion-ios-help-empty:before{content:\"\\F444\"}.ion-ios-help-outline:before{content:\"\\F445\"}.ion-ios-home:before{content:\"\\F448\"}.ion-ios-home-outline:before{content:\"\\F447\"}.ion-ios-infinite:before{content:\"\\F44A\"}.ion-ios-infinite-outline:before{content:\"\\F449\"}.ion-ios-information:before{content:\"\\F44D\"}.ion-ios-information-empty:before{content:\"\\F44B\"}.ion-ios-information-outline:before{content:\"\\F44C\"}.ion-ios-ionic-outline:before{content:\"\\F44E\"}.ion-ios-keypad:before{content:\"\\F450\"}.ion-ios-keypad-outline:before{content:\"\\F44F\"}.ion-ios-lightbulb:before{content:\"\\F452\"}.ion-ios-lightbulb-outline:before{content:\"\\F451\"}.ion-ios-list:before{content:\"\\F454\"}.ion-ios-list-outline:before{content:\"\\F453\"}.ion-ios-location:before{content:\"\\F456\"}.ion-ios-location-outline:before{content:\"\\F455\"}.ion-ios-locked:before{content:\"\\F458\"}.ion-ios-locked-outline:before{content:\"\\F457\"}.ion-ios-loop:before{content:\"\\F45A\"}.ion-ios-loop-strong:before{content:\"\\F459\"}.ion-ios-medical:before{content:\"\\F45C\"}.ion-ios-medical-outline:before{content:\"\\F45B\"}.ion-ios-medkit:before{content:\"\\F45E\"}.ion-ios-medkit-outline:before{content:\"\\F45D\"}.ion-ios-mic:before{content:\"\\F461\"}.ion-ios-mic-off:before{content:\"\\F45F\"}.ion-ios-mic-outline:before{content:\"\\F460\"}.ion-ios-minus:before{content:\"\\F464\"}.ion-ios-minus-empty:before{content:\"\\F462\"}.ion-ios-minus-outline:before{content:\"\\F463\"}.ion-ios-monitor:before{content:\"\\F466\"}.ion-ios-monitor-outline:before{content:\"\\F465\"}.ion-ios-moon:before{content:\"\\F468\"}.ion-ios-moon-outline:before{content:\"\\F467\"}.ion-ios-more:before{content:\"\\F46A\"}.ion-ios-more-outline:before{content:\"\\F469\"}.ion-ios-musical-note:before{content:\"\\F46B\"}.ion-ios-musical-notes:before{content:\"\\F46C\"}.ion-ios-navigate:before{content:\"\\F46E\"}.ion-ios-navigate-outline:before{content:\"\\F46D\"}.ion-ios-nutrition:before{content:\"\\F470\"}.ion-ios-nutrition-outline:before{content:\"\\F46F\"}.ion-ios-paper:before{content:\"\\F472\"}.ion-ios-paper-outline:before{content:\"\\F471\"}.ion-ios-paperplane:before{content:\"\\F474\"}.ion-ios-paperplane-outline:before{content:\"\\F473\"}.ion-ios-partlysunny:before{content:\"\\F476\"}.ion-ios-partlysunny-outline:before{content:\"\\F475\"}.ion-ios-pause:before{content:\"\\F478\"}.ion-ios-pause-outline:before{content:\"\\F477\"}.ion-ios-paw:before{content:\"\\F47A\"}.ion-ios-paw-outline:before{content:\"\\F479\"}.ion-ios-people:before{content:\"\\F47C\"}.ion-ios-people-outline:before{content:\"\\F47B\"}.ion-ios-person:before{content:\"\\F47E\"}.ion-ios-person-outline:before{content:\"\\F47D\"}.ion-ios-personadd:before{content:\"\\F480\"}.ion-ios-personadd-outline:before{content:\"\\F47F\"}.ion-ios-photos:before{content:\"\\F482\"}.ion-ios-photos-outline:before{content:\"\\F481\"}.ion-ios-pie:before{content:\"\\F484\"}.ion-ios-pie-outline:before{content:\"\\F483\"}.ion-ios-pint:before{content:\"\\F486\"}.ion-ios-pint-outline:before{content:\"\\F485\"}.ion-ios-play:before{content:\"\\F488\"}.ion-ios-play-outline:before{content:\"\\F487\"}.ion-ios-plus:before{content:\"\\F48B\"}.ion-ios-plus-empty:before{content:\"\\F489\"}.ion-ios-plus-outline:before{content:\"\\F48A\"}.ion-ios-pricetag:before{content:\"\\F48D\"}.ion-ios-pricetag-outline:before{content:\"\\F48C\"}.ion-ios-pricetags:before{content:\"\\F48F\"}.ion-ios-pricetags-outline:before{content:\"\\F48E\"}.ion-ios-printer:before{content:\"\\F491\"}.ion-ios-printer-outline:before{content:\"\\F490\"}.ion-ios-pulse:before{content:\"\\F493\"}.ion-ios-pulse-strong:before{content:\"\\F492\"}.ion-ios-rainy:before{content:\"\\F495\"}.ion-ios-rainy-outline:before{content:\"\\F494\"}.ion-ios-recording:before{content:\"\\F497\"}.ion-ios-recording-outline:before{content:\"\\F496\"}.ion-ios-redo:before{content:\"\\F499\"}.ion-ios-redo-outline:before{content:\"\\F498\"}.ion-ios-refresh:before{content:\"\\F49C\"}.ion-ios-refresh-empty:before{content:\"\\F49A\"}.ion-ios-refresh-outline:before{content:\"\\F49B\"}.ion-ios-reload:before{content:\"\\F49D\"}.ion-ios-reverse-camera:before{content:\"\\F49F\"}.ion-ios-reverse-camera-outline:before{content:\"\\F49E\"}.ion-ios-rewind:before{content:\"\\F4A1\"}.ion-ios-rewind-outline:before{content:\"\\F4A0\"}.ion-ios-rose:before{content:\"\\F4A3\"}.ion-ios-rose-outline:before{content:\"\\F4A2\"}.ion-ios-search:before{content:\"\\F4A5\"}.ion-ios-search-strong:before{content:\"\\F4A4\"}.ion-ios-settings:before{content:\"\\F4A7\"}.ion-ios-settings-strong:before{content:\"\\F4A6\"}.ion-ios-shuffle:before{content:\"\\F4A9\"}.ion-ios-shuffle-strong:before{content:\"\\F4A8\"}.ion-ios-skipbackward:before{content:\"\\F4AB\"}.ion-ios-skipbackward-outline:before{content:\"\\F4AA\"}.ion-ios-skipforward:before{content:\"\\F4AD\"}.ion-ios-skipforward-outline:before{content:\"\\F4AC\"}.ion-ios-snowy:before{content:\"\\F4AE\"}.ion-ios-speedometer:before{content:\"\\F4B0\"}.ion-ios-speedometer-outline:before{content:\"\\F4AF\"}.ion-ios-star:before{content:\"\\F4B3\"}.ion-ios-star-half:before{content:\"\\F4B1\"}.ion-ios-star-outline:before{content:\"\\F4B2\"}.ion-ios-stopwatch:before{content:\"\\F4B5\"}.ion-ios-stopwatch-outline:before{content:\"\\F4B4\"}.ion-ios-sunny:before{content:\"\\F4B7\"}.ion-ios-sunny-outline:before{content:\"\\F4B6\"}.ion-ios-telephone:before{content:\"\\F4B9\"}.ion-ios-telephone-outline:before{content:\"\\F4B8\"}.ion-ios-tennisball:before{content:\"\\F4BB\"}.ion-ios-tennisball-outline:before{content:\"\\F4BA\"}.ion-ios-thunderstorm:before{content:\"\\F4BD\"}.ion-ios-thunderstorm-outline:before{content:\"\\F4BC\"}.ion-ios-time:before{content:\"\\F4BF\"}.ion-ios-time-outline:before{content:\"\\F4BE\"}.ion-ios-timer:before{content:\"\\F4C1\"}.ion-ios-timer-outline:before{content:\"\\F4C0\"}.ion-ios-toggle:before{content:\"\\F4C3\"}.ion-ios-toggle-outline:before{content:\"\\F4C2\"}.ion-ios-trash:before{content:\"\\F4C5\"}.ion-ios-trash-outline:before{content:\"\\F4C4\"}.ion-ios-undo:before{content:\"\\F4C7\"}.ion-ios-undo-outline:before{content:\"\\F4C6\"}.ion-ios-unlocked:before{content:\"\\F4C9\"}.ion-ios-unlocked-outline:before{content:\"\\F4C8\"}.ion-ios-upload:before{content:\"\\F4CB\"}.ion-ios-upload-outline:before{content:\"\\F4CA\"}.ion-ios-videocam:before{content:\"\\F4CD\"}.ion-ios-videocam-outline:before{content:\"\\F4CC\"}.ion-ios-volume-high:before{content:\"\\F4CE\"}.ion-ios-volume-low:before{content:\"\\F4CF\"}.ion-ios-wineglass:before{content:\"\\F4D1\"}.ion-ios-wineglass-outline:before{content:\"\\F4D0\"}.ion-ios-world:before{content:\"\\F4D3\"}.ion-ios-world-outline:before{content:\"\\F4D2\"}.ion-ipad:before{content:\"\\F1F9\"}.ion-iphone:before{content:\"\\F1FA\"}.ion-ipod:before{content:\"\\F1FB\"}.ion-jet:before{content:\"\\F295\"}.ion-key:before{content:\"\\F296\"}.ion-knife:before{content:\"\\F297\"}.ion-laptop:before{content:\"\\F1FC\"}.ion-leaf:before{content:\"\\F1FD\"}.ion-levels:before{content:\"\\F298\"}.ion-lightbulb:before{content:\"\\F299\"}.ion-link:before{content:\"\\F1FE\"}.ion-load-a:before{content:\"\\F29A\"}.ion-load-b:before{content:\"\\F29B\"}.ion-load-c:before{content:\"\\F29C\"}.ion-load-d:before{content:\"\\F29D\"}.ion-location:before{content:\"\\F1FF\"}.ion-lock-combination:before{content:\"\\F4D4\"}.ion-locked:before{content:\"\\F200\"}.ion-log-in:before{content:\"\\F29E\"}.ion-log-out:before{content:\"\\F29F\"}.ion-loop:before{content:\"\\F201\"}.ion-magnet:before{content:\"\\F2A0\"}.ion-male:before{content:\"\\F2A1\"}.ion-man:before{content:\"\\F202\"}.ion-map:before{content:\"\\F203\"}.ion-medkit:before{content:\"\\F2A2\"}.ion-merge:before{content:\"\\F33F\"}.ion-mic-a:before{content:\"\\F204\"}.ion-mic-b:before{content:\"\\F205\"}.ion-mic-c:before{content:\"\\F206\"}.ion-minus:before{content:\"\\F209\"}.ion-minus-circled:before{content:\"\\F207\"}.ion-minus-round:before{content:\"\\F208\"}.ion-model-s:before{content:\"\\F2C1\"}.ion-monitor:before{content:\"\\F20A\"}.ion-more:before{content:\"\\F20B\"}.ion-mouse:before{content:\"\\F340\"}.ion-music-note:before{content:\"\\F20C\"}.ion-navicon:before{content:\"\\F20E\"}.ion-navicon-round:before{content:\"\\F20D\"}.ion-navigate:before{content:\"\\F2A3\"}.ion-network:before{content:\"\\F341\"}.ion-no-smoking:before{content:\"\\F2C2\"}.ion-nuclear:before{content:\"\\F2A4\"}.ion-outlet:before{content:\"\\F342\"}.ion-paintbrush:before{content:\"\\F4D5\"}.ion-paintbucket:before{content:\"\\F4D6\"}.ion-paper-airplane:before{content:\"\\F2C3\"}.ion-paperclip:before{content:\"\\F20F\"}.ion-pause:before{content:\"\\F210\"}.ion-person:before{content:\"\\F213\"}.ion-person-add:before{content:\"\\F211\"}.ion-person-stalker:before{content:\"\\F212\"}.ion-pie-graph:before{content:\"\\F2A5\"}.ion-pin:before{content:\"\\F2A6\"}.ion-pinpoint:before{content:\"\\F2A7\"}.ion-pizza:before{content:\"\\F2A8\"}.ion-plane:before{content:\"\\F214\"}.ion-planet:before{content:\"\\F343\"}.ion-play:before{content:\"\\F215\"}.ion-playstation:before{content:\"\\F30A\"}.ion-plus:before{content:\"\\F218\"}.ion-plus-circled:before{content:\"\\F216\"}.ion-plus-round:before{content:\"\\F217\"}.ion-podium:before{content:\"\\F344\"}.ion-pound:before{content:\"\\F219\"}.ion-power:before{content:\"\\F2A9\"}.ion-pricetag:before{content:\"\\F2AA\"}.ion-pricetags:before{content:\"\\F2AB\"}.ion-printer:before{content:\"\\F21A\"}.ion-pull-request:before{content:\"\\F345\"}.ion-qr-scanner:before{content:\"\\F346\"}.ion-quote:before{content:\"\\F347\"}.ion-radio-waves:before{content:\"\\F2AC\"}.ion-record:before{content:\"\\F21B\"}.ion-refresh:before{content:\"\\F21C\"}.ion-reply:before{content:\"\\F21E\"}.ion-reply-all:before{content:\"\\F21D\"}.ion-ribbon-a:before{content:\"\\F348\"}.ion-ribbon-b:before{content:\"\\F349\"}.ion-sad:before{content:\"\\F34A\"}.ion-sad-outline:before{content:\"\\F4D7\"}.ion-scissors:before{content:\"\\F34B\"}.ion-search:before{content:\"\\F21F\"}.ion-settings:before{content:\"\\F2AD\"}.ion-share:before{content:\"\\F220\"}.ion-shuffle:before{content:\"\\F221\"}.ion-skip-backward:before{content:\"\\F222\"}.ion-skip-forward:before{content:\"\\F223\"}.ion-social-android:before{content:\"\\F225\"}.ion-social-android-outline:before{content:\"\\F224\"}.ion-social-angular:before{content:\"\\F4D9\"}.ion-social-angular-outline:before{content:\"\\F4D8\"}.ion-social-apple:before{content:\"\\F227\"}.ion-social-apple-outline:before{content:\"\\F226\"}.ion-social-bitcoin:before{content:\"\\F2AF\"}.ion-social-bitcoin-outline:before{content:\"\\F2AE\"}.ion-social-buffer:before{content:\"\\F229\"}.ion-social-buffer-outline:before{content:\"\\F228\"}.ion-social-chrome:before{content:\"\\F4DB\"}.ion-social-chrome-outline:before{content:\"\\F4DA\"}.ion-social-codepen:before{content:\"\\F4DD\"}.ion-social-codepen-outline:before{content:\"\\F4DC\"}.ion-social-css3:before{content:\"\\F4DF\"}.ion-social-css3-outline:before{content:\"\\F4DE\"}.ion-social-designernews:before{content:\"\\F22B\"}.ion-social-designernews-outline:before{content:\"\\F22A\"}.ion-social-dribbble:before{content:\"\\F22D\"}.ion-social-dribbble-outline:before{content:\"\\F22C\"}.ion-social-dropbox:before{content:\"\\F22F\"}.ion-social-dropbox-outline:before{content:\"\\F22E\"}.ion-social-euro:before{content:\"\\F4E1\"}.ion-social-euro-outline:before{content:\"\\F4E0\"}.ion-social-facebook:before{content:\"\\F231\"}.ion-social-facebook-outline:before{content:\"\\F230\"}.ion-social-foursquare:before{content:\"\\F34D\"}.ion-social-foursquare-outline:before{content:\"\\F34C\"}.ion-social-freebsd-devil:before{content:\"\\F2C4\"}.ion-social-github:before{content:\"\\F233\"}.ion-social-github-outline:before{content:\"\\F232\"}.ion-social-google:before{content:\"\\F34F\"}.ion-social-google-outline:before{content:\"\\F34E\"}.ion-social-googleplus:before{content:\"\\F235\"}.ion-social-googleplus-outline:before{content:\"\\F234\"}.ion-social-hackernews:before{content:\"\\F237\"}.ion-social-hackernews-outline:before{content:\"\\F236\"}.ion-social-html5:before{content:\"\\F4E3\"}.ion-social-html5-outline:before{content:\"\\F4E2\"}.ion-social-instagram:before{content:\"\\F351\"}.ion-social-instagram-outline:before{content:\"\\F350\"}.ion-social-javascript:before{content:\"\\F4E5\"}.ion-social-javascript-outline:before{content:\"\\F4E4\"}.ion-social-linkedin:before{content:\"\\F239\"}.ion-social-linkedin-outline:before{content:\"\\F238\"}.ion-social-markdown:before{content:\"\\F4E6\"}.ion-social-nodejs:before{content:\"\\F4E7\"}.ion-social-octocat:before{content:\"\\F4E8\"}.ion-social-pinterest:before{content:\"\\F2B1\"}.ion-social-pinterest-outline:before{content:\"\\F2B0\"}.ion-social-python:before{content:\"\\F4E9\"}.ion-social-reddit:before{content:\"\\F23B\"}.ion-social-reddit-outline:before{content:\"\\F23A\"}.ion-social-rss:before{content:\"\\F23D\"}.ion-social-rss-outline:before{content:\"\\F23C\"}.ion-social-sass:before{content:\"\\F4EA\"}.ion-social-skype:before{content:\"\\F23F\"}.ion-social-skype-outline:before{content:\"\\F23E\"}.ion-social-snapchat:before{content:\"\\F4EC\"}.ion-social-snapchat-outline:before{content:\"\\F4EB\"}.ion-social-tumblr:before{content:\"\\F241\"}.ion-social-tumblr-outline:before{content:\"\\F240\"}.ion-social-tux:before{content:\"\\F2C5\"}.ion-social-twitch:before{content:\"\\F4EE\"}.ion-social-twitch-outline:before{content:\"\\F4ED\"}.ion-social-twitter:before{content:\"\\F243\"}.ion-social-twitter-outline:before{content:\"\\F242\"}.ion-social-usd:before{content:\"\\F353\"}.ion-social-usd-outline:before{content:\"\\F352\"}.ion-social-vimeo:before{content:\"\\F245\"}.ion-social-vimeo-outline:before{content:\"\\F244\"}.ion-social-whatsapp:before{content:\"\\F4F0\"}.ion-social-whatsapp-outline:before{content:\"\\F4EF\"}.ion-social-windows:before{content:\"\\F247\"}.ion-social-windows-outline:before{content:\"\\F246\"}.ion-social-wordpress:before{content:\"\\F249\"}.ion-social-wordpress-outline:before{content:\"\\F248\"}.ion-social-yahoo:before{content:\"\\F24B\"}.ion-social-yahoo-outline:before{content:\"\\F24A\"}.ion-social-yen:before{content:\"\\F4F2\"}.ion-social-yen-outline:before{content:\"\\F4F1\"}.ion-social-youtube:before{content:\"\\F24D\"}.ion-social-youtube-outline:before{content:\"\\F24C\"}.ion-soup-can:before{content:\"\\F4F4\"}.ion-soup-can-outline:before{content:\"\\F4F3\"}.ion-speakerphone:before{content:\"\\F2B2\"}.ion-speedometer:before{content:\"\\F2B3\"}.ion-spoon:before{content:\"\\F2B4\"}.ion-star:before{content:\"\\F24E\"}.ion-stats-bars:before{content:\"\\F2B5\"}.ion-steam:before{content:\"\\F30B\"}.ion-stop:before{content:\"\\F24F\"}.ion-thermometer:before{content:\"\\F2B6\"}.ion-thumbsdown:before{content:\"\\F250\"}.ion-thumbsup:before{content:\"\\F251\"}.ion-toggle:before{content:\"\\F355\"}.ion-toggle-filled:before{content:\"\\F354\"}.ion-transgender:before{content:\"\\F4F5\"}.ion-trash-a:before{content:\"\\F252\"}.ion-trash-b:before{content:\"\\F253\"}.ion-trophy:before{content:\"\\F356\"}.ion-tshirt:before{content:\"\\F4F7\"}.ion-tshirt-outline:before{content:\"\\F4F6\"}.ion-umbrella:before{content:\"\\F2B7\"}.ion-university:before{content:\"\\F357\"}.ion-unlocked:before{content:\"\\F254\"}.ion-upload:before{content:\"\\F255\"}.ion-usb:before{content:\"\\F2B8\"}.ion-videocamera:before{content:\"\\F256\"}.ion-volume-high:before{content:\"\\F257\"}.ion-volume-low:before{content:\"\\F258\"}.ion-volume-medium:before{content:\"\\F259\"}.ion-volume-mute:before{content:\"\\F25A\"}.ion-wand:before{content:\"\\F358\"}.ion-waterdrop:before{content:\"\\F25B\"}.ion-wifi:before{content:\"\\F25C\"}.ion-wineglass:before{content:\"\\F2B9\"}.ion-woman:before{content:\"\\F25D\"}.ion-wrench:before{content:\"\\F2BA\"}.ion-xbox:before{content:\"\\F30C\"}", ""]);

// exports


/***/ }),
/* 66 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "dist/assets/dd4781d1acc57ba4c4808d1b44301201.ttf";

/***/ }),
/* 67 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "dist/assets/2c159d0d05473040b53ec79df8797d32.woff";

/***/ }),
/* 68 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "dist/assets/aff28a207631f39ee0272d5cdde43ee7.svg";

/***/ }),
/* 69 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(10)(undefined);
// imports


// module
exports.push([module.i, "@font-face{font-family:Material-Design-Iconic-Font;src:url(" + __webpack_require__(70) + ") format('woff2'),url(" + __webpack_require__(71) + ") format('woff'),url(" + __webpack_require__(72) + ") format('truetype')}.zmdi{display:inline-block;font:normal normal normal 14px/1 'Material-Design-Iconic-Font';font-size:inherit;text-rendering:auto;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}.zmdi-hc-lg{font-size:1.33333333em;line-height:.75em;vertical-align:-15%}.zmdi-hc-2x{font-size:2em}.zmdi-hc-3x{font-size:3em}.zmdi-hc-4x{font-size:4em}.zmdi-hc-5x{font-size:5em}.zmdi-hc-fw{width:1.28571429em;text-align:center}.zmdi-hc-ul{padding-left:0;margin-left:2.14285714em;list-style-type:none}.zmdi-hc-ul>li{position:relative}.zmdi-hc-li{position:absolute;left:-2.14285714em;width:2.14285714em;top:.14285714em;text-align:center}.zmdi-hc-li.zmdi-hc-lg{left:-1.85714286em}.zmdi-hc-border{padding:.1em .25em;border:solid .1em #9e9e9e;border-radius:2px}.zmdi-hc-border-circle{padding:.1em .25em;border:solid .1em #9e9e9e;border-radius:50%}.zmdi.pull-left{float:left;margin-right:.15em}.zmdi.pull-right{float:right;margin-left:.15em}.zmdi-hc-spin{-webkit-animation:zmdi-spin 1.5s infinite linear;animation:zmdi-spin 1.5s infinite linear}.zmdi-hc-spin-reverse{-webkit-animation:zmdi-spin-reverse 1.5s infinite linear;animation:zmdi-spin-reverse 1.5s infinite linear}@-webkit-keyframes zmdi-spin{0%{-webkit-transform:rotate(0deg);transform:rotate(0deg)}100%{-webkit-transform:rotate(359deg);transform:rotate(359deg)}}@keyframes zmdi-spin{0%{-webkit-transform:rotate(0deg);transform:rotate(0deg)}100%{-webkit-transform:rotate(359deg);transform:rotate(359deg)}}@-webkit-keyframes zmdi-spin-reverse{0%{-webkit-transform:rotate(0deg);transform:rotate(0deg)}100%{-webkit-transform:rotate(-359deg);transform:rotate(-359deg)}}@keyframes zmdi-spin-reverse{0%{-webkit-transform:rotate(0deg);transform:rotate(0deg)}100%{-webkit-transform:rotate(-359deg);transform:rotate(-359deg)}}.zmdi-hc-rotate-90{-webkit-transform:rotate(90deg);-ms-transform:rotate(90deg);transform:rotate(90deg)}.zmdi-hc-rotate-180{-webkit-transform:rotate(180deg);-ms-transform:rotate(180deg);transform:rotate(180deg)}.zmdi-hc-rotate-270{-webkit-transform:rotate(270deg);-ms-transform:rotate(270deg);transform:rotate(270deg)}.zmdi-hc-flip-horizontal{-webkit-transform:scale(-1,1);-ms-transform:scale(-1,1);transform:scale(-1,1)}.zmdi-hc-flip-vertical{-webkit-transform:scale(1,-1);-ms-transform:scale(1,-1);transform:scale(1,-1)}.zmdi-hc-stack{position:relative;display:inline-block;width:2em;height:2em;line-height:2em;vertical-align:middle}.zmdi-hc-stack-1x,.zmdi-hc-stack-2x{position:absolute;left:0;width:100%;text-align:center}.zmdi-hc-stack-1x{line-height:inherit}.zmdi-hc-stack-2x{font-size:2em}.zmdi-hc-inverse{color:#fff}.zmdi-3d-rotation:before{content:'\\F101'}.zmdi-airplane-off:before{content:'\\F102'}.zmdi-airplane:before{content:'\\F103'}.zmdi-album:before{content:'\\F104'}.zmdi-archive:before{content:'\\F105'}.zmdi-assignment-account:before{content:'\\F106'}.zmdi-assignment-alert:before{content:'\\F107'}.zmdi-assignment-check:before{content:'\\F108'}.zmdi-assignment-o:before{content:'\\F109'}.zmdi-assignment-return:before{content:'\\F10A'}.zmdi-assignment-returned:before{content:'\\F10B'}.zmdi-assignment:before{content:'\\F10C'}.zmdi-attachment-alt:before{content:'\\F10D'}.zmdi-attachment:before{content:'\\F10E'}.zmdi-audio:before{content:'\\F10F'}.zmdi-badge-check:before{content:'\\F110'}.zmdi-balance-wallet:before{content:'\\F111'}.zmdi-balance:before{content:'\\F112'}.zmdi-battery-alert:before{content:'\\F113'}.zmdi-battery-flash:before{content:'\\F114'}.zmdi-battery-unknown:before{content:'\\F115'}.zmdi-battery:before{content:'\\F116'}.zmdi-bike:before{content:'\\F117'}.zmdi-block-alt:before{content:'\\F118'}.zmdi-block:before{content:'\\F119'}.zmdi-boat:before{content:'\\F11A'}.zmdi-book-image:before{content:'\\F11B'}.zmdi-book:before{content:'\\F11C'}.zmdi-bookmark-outline:before{content:'\\F11D'}.zmdi-bookmark:before{content:'\\F11E'}.zmdi-brush:before{content:'\\F11F'}.zmdi-bug:before{content:'\\F120'}.zmdi-bus:before{content:'\\F121'}.zmdi-cake:before{content:'\\F122'}.zmdi-car-taxi:before{content:'\\F123'}.zmdi-car-wash:before{content:'\\F124'}.zmdi-car:before{content:'\\F125'}.zmdi-card-giftcard:before{content:'\\F126'}.zmdi-card-membership:before{content:'\\F127'}.zmdi-card-travel:before{content:'\\F128'}.zmdi-card:before{content:'\\F129'}.zmdi-case-check:before{content:'\\F12A'}.zmdi-case-download:before{content:'\\F12B'}.zmdi-case-play:before{content:'\\F12C'}.zmdi-case:before{content:'\\F12D'}.zmdi-cast-connected:before{content:'\\F12E'}.zmdi-cast:before{content:'\\F12F'}.zmdi-chart-donut:before{content:'\\F130'}.zmdi-chart:before{content:'\\F131'}.zmdi-city-alt:before{content:'\\F132'}.zmdi-city:before{content:'\\F133'}.zmdi-close-circle-o:before{content:'\\F134'}.zmdi-close-circle:before{content:'\\F135'}.zmdi-close:before{content:'\\F136'}.zmdi-cocktail:before{content:'\\F137'}.zmdi-code-setting:before{content:'\\F138'}.zmdi-code-smartphone:before{content:'\\F139'}.zmdi-code:before{content:'\\F13A'}.zmdi-coffee:before{content:'\\F13B'}.zmdi-collection-bookmark:before{content:'\\F13C'}.zmdi-collection-case-play:before{content:'\\F13D'}.zmdi-collection-folder-image:before{content:'\\F13E'}.zmdi-collection-image-o:before{content:'\\F13F'}.zmdi-collection-image:before{content:'\\F140'}.zmdi-collection-item-1:before{content:'\\F141'}.zmdi-collection-item-2:before{content:'\\F142'}.zmdi-collection-item-3:before{content:'\\F143'}.zmdi-collection-item-4:before{content:'\\F144'}.zmdi-collection-item-5:before{content:'\\F145'}.zmdi-collection-item-6:before{content:'\\F146'}.zmdi-collection-item-7:before{content:'\\F147'}.zmdi-collection-item-8:before{content:'\\F148'}.zmdi-collection-item-9-plus:before{content:'\\F149'}.zmdi-collection-item-9:before{content:'\\F14A'}.zmdi-collection-item:before{content:'\\F14B'}.zmdi-collection-music:before{content:'\\F14C'}.zmdi-collection-pdf:before{content:'\\F14D'}.zmdi-collection-plus:before{content:'\\F14E'}.zmdi-collection-speaker:before{content:'\\F14F'}.zmdi-collection-text:before{content:'\\F150'}.zmdi-collection-video:before{content:'\\F151'}.zmdi-compass:before{content:'\\F152'}.zmdi-cutlery:before{content:'\\F153'}.zmdi-delete:before{content:'\\F154'}.zmdi-dialpad:before{content:'\\F155'}.zmdi-dns:before{content:'\\F156'}.zmdi-drink:before{content:'\\F157'}.zmdi-edit:before{content:'\\F158'}.zmdi-email-open:before{content:'\\F159'}.zmdi-email:before{content:'\\F15A'}.zmdi-eye-off:before{content:'\\F15B'}.zmdi-eye:before{content:'\\F15C'}.zmdi-eyedropper:before{content:'\\F15D'}.zmdi-favorite-outline:before{content:'\\F15E'}.zmdi-favorite:before{content:'\\F15F'}.zmdi-filter-list:before{content:'\\F160'}.zmdi-fire:before{content:'\\F161'}.zmdi-flag:before{content:'\\F162'}.zmdi-flare:before{content:'\\F163'}.zmdi-flash-auto:before{content:'\\F164'}.zmdi-flash-off:before{content:'\\F165'}.zmdi-flash:before{content:'\\F166'}.zmdi-flip:before{content:'\\F167'}.zmdi-flower-alt:before{content:'\\F168'}.zmdi-flower:before{content:'\\F169'}.zmdi-font:before{content:'\\F16A'}.zmdi-fullscreen-alt:before{content:'\\F16B'}.zmdi-fullscreen-exit:before{content:'\\F16C'}.zmdi-fullscreen:before{content:'\\F16D'}.zmdi-functions:before{content:'\\F16E'}.zmdi-gas-station:before{content:'\\F16F'}.zmdi-gesture:before{content:'\\F170'}.zmdi-globe-alt:before{content:'\\F171'}.zmdi-globe-lock:before{content:'\\F172'}.zmdi-globe:before{content:'\\F173'}.zmdi-graduation-cap:before{content:'\\F174'}.zmdi-home:before{content:'\\F175'}.zmdi-hospital-alt:before{content:'\\F176'}.zmdi-hospital:before{content:'\\F177'}.zmdi-hotel:before{content:'\\F178'}.zmdi-hourglass-alt:before{content:'\\F179'}.zmdi-hourglass-outline:before{content:'\\F17A'}.zmdi-hourglass:before{content:'\\F17B'}.zmdi-http:before{content:'\\F17C'}.zmdi-image-alt:before{content:'\\F17D'}.zmdi-image-o:before{content:'\\F17E'}.zmdi-image:before{content:'\\F17F'}.zmdi-inbox:before{content:'\\F180'}.zmdi-invert-colors-off:before{content:'\\F181'}.zmdi-invert-colors:before{content:'\\F182'}.zmdi-key:before{content:'\\F183'}.zmdi-label-alt-outline:before{content:'\\F184'}.zmdi-label-alt:before{content:'\\F185'}.zmdi-label-heart:before{content:'\\F186'}.zmdi-label:before{content:'\\F187'}.zmdi-labels:before{content:'\\F188'}.zmdi-lamp:before{content:'\\F189'}.zmdi-landscape:before{content:'\\F18A'}.zmdi-layers-off:before{content:'\\F18B'}.zmdi-layers:before{content:'\\F18C'}.zmdi-library:before{content:'\\F18D'}.zmdi-link:before{content:'\\F18E'}.zmdi-lock-open:before{content:'\\F18F'}.zmdi-lock-outline:before{content:'\\F190'}.zmdi-lock:before{content:'\\F191'}.zmdi-mail-reply-all:before{content:'\\F192'}.zmdi-mail-reply:before{content:'\\F193'}.zmdi-mail-send:before{content:'\\F194'}.zmdi-mall:before{content:'\\F195'}.zmdi-map:before{content:'\\F196'}.zmdi-menu:before{content:'\\F197'}.zmdi-money-box:before{content:'\\F198'}.zmdi-money-off:before{content:'\\F199'}.zmdi-money:before{content:'\\F19A'}.zmdi-more-vert:before{content:'\\F19B'}.zmdi-more:before{content:'\\F19C'}.zmdi-movie-alt:before{content:'\\F19D'}.zmdi-movie:before{content:'\\F19E'}.zmdi-nature-people:before{content:'\\F19F'}.zmdi-nature:before{content:'\\F1A0'}.zmdi-navigation:before{content:'\\F1A1'}.zmdi-open-in-browser:before{content:'\\F1A2'}.zmdi-open-in-new:before{content:'\\F1A3'}.zmdi-palette:before{content:'\\F1A4'}.zmdi-parking:before{content:'\\F1A5'}.zmdi-pin-account:before{content:'\\F1A6'}.zmdi-pin-assistant:before{content:'\\F1A7'}.zmdi-pin-drop:before{content:'\\F1A8'}.zmdi-pin-help:before{content:'\\F1A9'}.zmdi-pin-off:before{content:'\\F1AA'}.zmdi-pin:before{content:'\\F1AB'}.zmdi-pizza:before{content:'\\F1AC'}.zmdi-plaster:before{content:'\\F1AD'}.zmdi-power-setting:before{content:'\\F1AE'}.zmdi-power:before{content:'\\F1AF'}.zmdi-print:before{content:'\\F1B0'}.zmdi-puzzle-piece:before{content:'\\F1B1'}.zmdi-quote:before{content:'\\F1B2'}.zmdi-railway:before{content:'\\F1B3'}.zmdi-receipt:before{content:'\\F1B4'}.zmdi-refresh-alt:before{content:'\\F1B5'}.zmdi-refresh-sync-alert:before{content:'\\F1B6'}.zmdi-refresh-sync-off:before{content:'\\F1B7'}.zmdi-refresh-sync:before{content:'\\F1B8'}.zmdi-refresh:before{content:'\\F1B9'}.zmdi-roller:before{content:'\\F1BA'}.zmdi-ruler:before{content:'\\F1BB'}.zmdi-scissors:before{content:'\\F1BC'}.zmdi-screen-rotation-lock:before{content:'\\F1BD'}.zmdi-screen-rotation:before{content:'\\F1BE'}.zmdi-search-for:before{content:'\\F1BF'}.zmdi-search-in-file:before{content:'\\F1C0'}.zmdi-search-in-page:before{content:'\\F1C1'}.zmdi-search-replace:before{content:'\\F1C2'}.zmdi-search:before{content:'\\F1C3'}.zmdi-seat:before{content:'\\F1C4'}.zmdi-settings-square:before{content:'\\F1C5'}.zmdi-settings:before{content:'\\F1C6'}.zmdi-shield-check:before{content:'\\F1C7'}.zmdi-shield-security:before{content:'\\F1C8'}.zmdi-shopping-basket:before{content:'\\F1C9'}.zmdi-shopping-cart-plus:before{content:'\\F1CA'}.zmdi-shopping-cart:before{content:'\\F1CB'}.zmdi-sign-in:before{content:'\\F1CC'}.zmdi-sort-amount-asc:before{content:'\\F1CD'}.zmdi-sort-amount-desc:before{content:'\\F1CE'}.zmdi-sort-asc:before{content:'\\F1CF'}.zmdi-sort-desc:before{content:'\\F1D0'}.zmdi-spellcheck:before{content:'\\F1D1'}.zmdi-storage:before{content:'\\F1D2'}.zmdi-store-24:before{content:'\\F1D3'}.zmdi-store:before{content:'\\F1D4'}.zmdi-subway:before{content:'\\F1D5'}.zmdi-sun:before{content:'\\F1D6'}.zmdi-tab-unselected:before{content:'\\F1D7'}.zmdi-tab:before{content:'\\F1D8'}.zmdi-tag-close:before{content:'\\F1D9'}.zmdi-tag-more:before{content:'\\F1DA'}.zmdi-tag:before{content:'\\F1DB'}.zmdi-thumb-down:before{content:'\\F1DC'}.zmdi-thumb-up-down:before{content:'\\F1DD'}.zmdi-thumb-up:before{content:'\\F1DE'}.zmdi-ticket-star:before{content:'\\F1DF'}.zmdi-toll:before{content:'\\F1E0'}.zmdi-toys:before{content:'\\F1E1'}.zmdi-traffic:before{content:'\\F1E2'}.zmdi-translate:before{content:'\\F1E3'}.zmdi-triangle-down:before{content:'\\F1E4'}.zmdi-triangle-up:before{content:'\\F1E5'}.zmdi-truck:before{content:'\\F1E6'}.zmdi-turning-sign:before{content:'\\F1E7'}.zmdi-wallpaper:before{content:'\\F1E8'}.zmdi-washing-machine:before{content:'\\F1E9'}.zmdi-window-maximize:before{content:'\\F1EA'}.zmdi-window-minimize:before{content:'\\F1EB'}.zmdi-window-restore:before{content:'\\F1EC'}.zmdi-wrench:before{content:'\\F1ED'}.zmdi-zoom-in:before{content:'\\F1EE'}.zmdi-zoom-out:before{content:'\\F1EF'}.zmdi-alert-circle-o:before{content:'\\F1F0'}.zmdi-alert-circle:before{content:'\\F1F1'}.zmdi-alert-octagon:before{content:'\\F1F2'}.zmdi-alert-polygon:before{content:'\\F1F3'}.zmdi-alert-triangle:before{content:'\\F1F4'}.zmdi-help-outline:before{content:'\\F1F5'}.zmdi-help:before{content:'\\F1F6'}.zmdi-info-outline:before{content:'\\F1F7'}.zmdi-info:before{content:'\\F1F8'}.zmdi-notifications-active:before{content:'\\F1F9'}.zmdi-notifications-add:before{content:'\\F1FA'}.zmdi-notifications-none:before{content:'\\F1FB'}.zmdi-notifications-off:before{content:'\\F1FC'}.zmdi-notifications-paused:before{content:'\\F1FD'}.zmdi-notifications:before{content:'\\F1FE'}.zmdi-account-add:before{content:'\\F1FF'}.zmdi-account-box-mail:before{content:'\\F200'}.zmdi-account-box-o:before{content:'\\F201'}.zmdi-account-box-phone:before{content:'\\F202'}.zmdi-account-box:before{content:'\\F203'}.zmdi-account-calendar:before{content:'\\F204'}.zmdi-account-circle:before{content:'\\F205'}.zmdi-account-o:before{content:'\\F206'}.zmdi-account:before{content:'\\F207'}.zmdi-accounts-add:before{content:'\\F208'}.zmdi-accounts-alt:before{content:'\\F209'}.zmdi-accounts-list-alt:before{content:'\\F20A'}.zmdi-accounts-list:before{content:'\\F20B'}.zmdi-accounts-outline:before{content:'\\F20C'}.zmdi-accounts:before{content:'\\F20D'}.zmdi-face:before{content:'\\F20E'}.zmdi-female:before{content:'\\F20F'}.zmdi-male-alt:before{content:'\\F210'}.zmdi-male-female:before{content:'\\F211'}.zmdi-male:before{content:'\\F212'}.zmdi-mood-bad:before{content:'\\F213'}.zmdi-mood:before{content:'\\F214'}.zmdi-run:before{content:'\\F215'}.zmdi-walk:before{content:'\\F216'}.zmdi-cloud-box:before{content:'\\F217'}.zmdi-cloud-circle:before{content:'\\F218'}.zmdi-cloud-done:before{content:'\\F219'}.zmdi-cloud-download:before{content:'\\F21A'}.zmdi-cloud-off:before{content:'\\F21B'}.zmdi-cloud-outline-alt:before{content:'\\F21C'}.zmdi-cloud-outline:before{content:'\\F21D'}.zmdi-cloud-upload:before{content:'\\F21E'}.zmdi-cloud:before{content:'\\F21F'}.zmdi-download:before{content:'\\F220'}.zmdi-file-plus:before{content:'\\F221'}.zmdi-file-text:before{content:'\\F222'}.zmdi-file:before{content:'\\F223'}.zmdi-folder-outline:before{content:'\\F224'}.zmdi-folder-person:before{content:'\\F225'}.zmdi-folder-star-alt:before{content:'\\F226'}.zmdi-folder-star:before{content:'\\F227'}.zmdi-folder:before{content:'\\F228'}.zmdi-gif:before{content:'\\F229'}.zmdi-upload:before{content:'\\F22A'}.zmdi-border-all:before{content:'\\F22B'}.zmdi-border-bottom:before{content:'\\F22C'}.zmdi-border-clear:before{content:'\\F22D'}.zmdi-border-color:before{content:'\\F22E'}.zmdi-border-horizontal:before{content:'\\F22F'}.zmdi-border-inner:before{content:'\\F230'}.zmdi-border-left:before{content:'\\F231'}.zmdi-border-outer:before{content:'\\F232'}.zmdi-border-right:before{content:'\\F233'}.zmdi-border-style:before{content:'\\F234'}.zmdi-border-top:before{content:'\\F235'}.zmdi-border-vertical:before{content:'\\F236'}.zmdi-copy:before{content:'\\F237'}.zmdi-crop:before{content:'\\F238'}.zmdi-format-align-center:before{content:'\\F239'}.zmdi-format-align-justify:before{content:'\\F23A'}.zmdi-format-align-left:before{content:'\\F23B'}.zmdi-format-align-right:before{content:'\\F23C'}.zmdi-format-bold:before{content:'\\F23D'}.zmdi-format-clear-all:before{content:'\\F23E'}.zmdi-format-clear:before{content:'\\F23F'}.zmdi-format-color-fill:before{content:'\\F240'}.zmdi-format-color-reset:before{content:'\\F241'}.zmdi-format-color-text:before{content:'\\F242'}.zmdi-format-indent-decrease:before{content:'\\F243'}.zmdi-format-indent-increase:before{content:'\\F244'}.zmdi-format-italic:before{content:'\\F245'}.zmdi-format-line-spacing:before{content:'\\F246'}.zmdi-format-list-bulleted:before{content:'\\F247'}.zmdi-format-list-numbered:before{content:'\\F248'}.zmdi-format-ltr:before{content:'\\F249'}.zmdi-format-rtl:before{content:'\\F24A'}.zmdi-format-size:before{content:'\\F24B'}.zmdi-format-strikethrough-s:before{content:'\\F24C'}.zmdi-format-strikethrough:before{content:'\\F24D'}.zmdi-format-subject:before{content:'\\F24E'}.zmdi-format-underlined:before{content:'\\F24F'}.zmdi-format-valign-bottom:before{content:'\\F250'}.zmdi-format-valign-center:before{content:'\\F251'}.zmdi-format-valign-top:before{content:'\\F252'}.zmdi-redo:before{content:'\\F253'}.zmdi-select-all:before{content:'\\F254'}.zmdi-space-bar:before{content:'\\F255'}.zmdi-text-format:before{content:'\\F256'}.zmdi-transform:before{content:'\\F257'}.zmdi-undo:before{content:'\\F258'}.zmdi-wrap-text:before{content:'\\F259'}.zmdi-comment-alert:before{content:'\\F25A'}.zmdi-comment-alt-text:before{content:'\\F25B'}.zmdi-comment-alt:before{content:'\\F25C'}.zmdi-comment-edit:before{content:'\\F25D'}.zmdi-comment-image:before{content:'\\F25E'}.zmdi-comment-list:before{content:'\\F25F'}.zmdi-comment-more:before{content:'\\F260'}.zmdi-comment-outline:before{content:'\\F261'}.zmdi-comment-text-alt:before{content:'\\F262'}.zmdi-comment-text:before{content:'\\F263'}.zmdi-comment-video:before{content:'\\F264'}.zmdi-comment:before{content:'\\F265'}.zmdi-comments:before{content:'\\F266'}.zmdi-check-all:before{content:'\\F267'}.zmdi-check-circle-u:before{content:'\\F268'}.zmdi-check-circle:before{content:'\\F269'}.zmdi-check-square:before{content:'\\F26A'}.zmdi-check:before{content:'\\F26B'}.zmdi-circle-o:before{content:'\\F26C'}.zmdi-circle:before{content:'\\F26D'}.zmdi-dot-circle-alt:before{content:'\\F26E'}.zmdi-dot-circle:before{content:'\\F26F'}.zmdi-minus-circle-outline:before{content:'\\F270'}.zmdi-minus-circle:before{content:'\\F271'}.zmdi-minus-square:before{content:'\\F272'}.zmdi-minus:before{content:'\\F273'}.zmdi-plus-circle-o-duplicate:before{content:'\\F274'}.zmdi-plus-circle-o:before{content:'\\F275'}.zmdi-plus-circle:before{content:'\\F276'}.zmdi-plus-square:before{content:'\\F277'}.zmdi-plus:before{content:'\\F278'}.zmdi-square-o:before{content:'\\F279'}.zmdi-star-circle:before{content:'\\F27A'}.zmdi-star-half:before{content:'\\F27B'}.zmdi-star-outline:before{content:'\\F27C'}.zmdi-star:before{content:'\\F27D'}.zmdi-bluetooth-connected:before{content:'\\F27E'}.zmdi-bluetooth-off:before{content:'\\F27F'}.zmdi-bluetooth-search:before{content:'\\F280'}.zmdi-bluetooth-setting:before{content:'\\F281'}.zmdi-bluetooth:before{content:'\\F282'}.zmdi-camera-add:before{content:'\\F283'}.zmdi-camera-alt:before{content:'\\F284'}.zmdi-camera-bw:before{content:'\\F285'}.zmdi-camera-front:before{content:'\\F286'}.zmdi-camera-mic:before{content:'\\F287'}.zmdi-camera-party-mode:before{content:'\\F288'}.zmdi-camera-rear:before{content:'\\F289'}.zmdi-camera-roll:before{content:'\\F28A'}.zmdi-camera-switch:before{content:'\\F28B'}.zmdi-camera:before{content:'\\F28C'}.zmdi-card-alert:before{content:'\\F28D'}.zmdi-card-off:before{content:'\\F28E'}.zmdi-card-sd:before{content:'\\F28F'}.zmdi-card-sim:before{content:'\\F290'}.zmdi-desktop-mac:before{content:'\\F291'}.zmdi-desktop-windows:before{content:'\\F292'}.zmdi-device-hub:before{content:'\\F293'}.zmdi-devices-off:before{content:'\\F294'}.zmdi-devices:before{content:'\\F295'}.zmdi-dock:before{content:'\\F296'}.zmdi-floppy:before{content:'\\F297'}.zmdi-gamepad:before{content:'\\F298'}.zmdi-gps-dot:before{content:'\\F299'}.zmdi-gps-off:before{content:'\\F29A'}.zmdi-gps:before{content:'\\F29B'}.zmdi-headset-mic:before{content:'\\F29C'}.zmdi-headset:before{content:'\\F29D'}.zmdi-input-antenna:before{content:'\\F29E'}.zmdi-input-composite:before{content:'\\F29F'}.zmdi-input-hdmi:before{content:'\\F2A0'}.zmdi-input-power:before{content:'\\F2A1'}.zmdi-input-svideo:before{content:'\\F2A2'}.zmdi-keyboard-hide:before{content:'\\F2A3'}.zmdi-keyboard:before{content:'\\F2A4'}.zmdi-laptop-chromebook:before{content:'\\F2A5'}.zmdi-laptop-mac:before{content:'\\F2A6'}.zmdi-laptop:before{content:'\\F2A7'}.zmdi-mic-off:before{content:'\\F2A8'}.zmdi-mic-outline:before{content:'\\F2A9'}.zmdi-mic-setting:before{content:'\\F2AA'}.zmdi-mic:before{content:'\\F2AB'}.zmdi-mouse:before{content:'\\F2AC'}.zmdi-network-alert:before{content:'\\F2AD'}.zmdi-network-locked:before{content:'\\F2AE'}.zmdi-network-off:before{content:'\\F2AF'}.zmdi-network-outline:before{content:'\\F2B0'}.zmdi-network-setting:before{content:'\\F2B1'}.zmdi-network:before{content:'\\F2B2'}.zmdi-phone-bluetooth:before{content:'\\F2B3'}.zmdi-phone-end:before{content:'\\F2B4'}.zmdi-phone-forwarded:before{content:'\\F2B5'}.zmdi-phone-in-talk:before{content:'\\F2B6'}.zmdi-phone-locked:before{content:'\\F2B7'}.zmdi-phone-missed:before{content:'\\F2B8'}.zmdi-phone-msg:before{content:'\\F2B9'}.zmdi-phone-paused:before{content:'\\F2BA'}.zmdi-phone-ring:before{content:'\\F2BB'}.zmdi-phone-setting:before{content:'\\F2BC'}.zmdi-phone-sip:before{content:'\\F2BD'}.zmdi-phone:before{content:'\\F2BE'}.zmdi-portable-wifi-changes:before{content:'\\F2BF'}.zmdi-portable-wifi-off:before{content:'\\F2C0'}.zmdi-portable-wifi:before{content:'\\F2C1'}.zmdi-radio:before{content:'\\F2C2'}.zmdi-reader:before{content:'\\F2C3'}.zmdi-remote-control-alt:before{content:'\\F2C4'}.zmdi-remote-control:before{content:'\\F2C5'}.zmdi-router:before{content:'\\F2C6'}.zmdi-scanner:before{content:'\\F2C7'}.zmdi-smartphone-android:before{content:'\\F2C8'}.zmdi-smartphone-download:before{content:'\\F2C9'}.zmdi-smartphone-erase:before{content:'\\F2CA'}.zmdi-smartphone-info:before{content:'\\F2CB'}.zmdi-smartphone-iphone:before{content:'\\F2CC'}.zmdi-smartphone-landscape-lock:before{content:'\\F2CD'}.zmdi-smartphone-landscape:before{content:'\\F2CE'}.zmdi-smartphone-lock:before{content:'\\F2CF'}.zmdi-smartphone-portrait-lock:before{content:'\\F2D0'}.zmdi-smartphone-ring:before{content:'\\F2D1'}.zmdi-smartphone-setting:before{content:'\\F2D2'}.zmdi-smartphone-setup:before{content:'\\F2D3'}.zmdi-smartphone:before{content:'\\F2D4'}.zmdi-speaker:before{content:'\\F2D5'}.zmdi-tablet-android:before{content:'\\F2D6'}.zmdi-tablet-mac:before{content:'\\F2D7'}.zmdi-tablet:before{content:'\\F2D8'}.zmdi-tv-alt-play:before{content:'\\F2D9'}.zmdi-tv-list:before{content:'\\F2DA'}.zmdi-tv-play:before{content:'\\F2DB'}.zmdi-tv:before{content:'\\F2DC'}.zmdi-usb:before{content:'\\F2DD'}.zmdi-videocam-off:before{content:'\\F2DE'}.zmdi-videocam-switch:before{content:'\\F2DF'}.zmdi-videocam:before{content:'\\F2E0'}.zmdi-watch:before{content:'\\F2E1'}.zmdi-wifi-alt-2:before{content:'\\F2E2'}.zmdi-wifi-alt:before{content:'\\F2E3'}.zmdi-wifi-info:before{content:'\\F2E4'}.zmdi-wifi-lock:before{content:'\\F2E5'}.zmdi-wifi-off:before{content:'\\F2E6'}.zmdi-wifi-outline:before{content:'\\F2E7'}.zmdi-wifi:before{content:'\\F2E8'}.zmdi-arrow-left-bottom:before{content:'\\F2E9'}.zmdi-arrow-left:before{content:'\\F2EA'}.zmdi-arrow-merge:before{content:'\\F2EB'}.zmdi-arrow-missed:before{content:'\\F2EC'}.zmdi-arrow-right-top:before{content:'\\F2ED'}.zmdi-arrow-right:before{content:'\\F2EE'}.zmdi-arrow-split:before{content:'\\F2EF'}.zmdi-arrows:before{content:'\\F2F0'}.zmdi-caret-down-circle:before{content:'\\F2F1'}.zmdi-caret-down:before{content:'\\F2F2'}.zmdi-caret-left-circle:before{content:'\\F2F3'}.zmdi-caret-left:before{content:'\\F2F4'}.zmdi-caret-right-circle:before{content:'\\F2F5'}.zmdi-caret-right:before{content:'\\F2F6'}.zmdi-caret-up-circle:before{content:'\\F2F7'}.zmdi-caret-up:before{content:'\\F2F8'}.zmdi-chevron-down:before{content:'\\F2F9'}.zmdi-chevron-left:before{content:'\\F2FA'}.zmdi-chevron-right:before{content:'\\F2FB'}.zmdi-chevron-up:before{content:'\\F2FC'}.zmdi-forward:before{content:'\\F2FD'}.zmdi-long-arrow-down:before{content:'\\F2FE'}.zmdi-long-arrow-left:before{content:'\\F2FF'}.zmdi-long-arrow-return:before{content:'\\F300'}.zmdi-long-arrow-right:before{content:'\\F301'}.zmdi-long-arrow-tab:before{content:'\\F302'}.zmdi-long-arrow-up:before{content:'\\F303'}.zmdi-rotate-ccw:before{content:'\\F304'}.zmdi-rotate-cw:before{content:'\\F305'}.zmdi-rotate-left:before{content:'\\F306'}.zmdi-rotate-right:before{content:'\\F307'}.zmdi-square-down:before{content:'\\F308'}.zmdi-square-right:before{content:'\\F309'}.zmdi-swap-alt:before{content:'\\F30A'}.zmdi-swap-vertical-circle:before{content:'\\F30B'}.zmdi-swap-vertical:before{content:'\\F30C'}.zmdi-swap:before{content:'\\F30D'}.zmdi-trending-down:before{content:'\\F30E'}.zmdi-trending-flat:before{content:'\\F30F'}.zmdi-trending-up:before{content:'\\F310'}.zmdi-unfold-less:before{content:'\\F311'}.zmdi-unfold-more:before{content:'\\F312'}.zmdi-apps:before{content:'\\F313'}.zmdi-grid-off:before{content:'\\F314'}.zmdi-grid:before{content:'\\F315'}.zmdi-view-agenda:before{content:'\\F316'}.zmdi-view-array:before{content:'\\F317'}.zmdi-view-carousel:before{content:'\\F318'}.zmdi-view-column:before{content:'\\F319'}.zmdi-view-comfy:before{content:'\\F31A'}.zmdi-view-compact:before{content:'\\F31B'}.zmdi-view-dashboard:before{content:'\\F31C'}.zmdi-view-day:before{content:'\\F31D'}.zmdi-view-headline:before{content:'\\F31E'}.zmdi-view-list-alt:before{content:'\\F31F'}.zmdi-view-list:before{content:'\\F320'}.zmdi-view-module:before{content:'\\F321'}.zmdi-view-quilt:before{content:'\\F322'}.zmdi-view-stream:before{content:'\\F323'}.zmdi-view-subtitles:before{content:'\\F324'}.zmdi-view-toc:before{content:'\\F325'}.zmdi-view-web:before{content:'\\F326'}.zmdi-view-week:before{content:'\\F327'}.zmdi-widgets:before{content:'\\F328'}.zmdi-alarm-check:before{content:'\\F329'}.zmdi-alarm-off:before{content:'\\F32A'}.zmdi-alarm-plus:before{content:'\\F32B'}.zmdi-alarm-snooze:before{content:'\\F32C'}.zmdi-alarm:before{content:'\\F32D'}.zmdi-calendar-alt:before{content:'\\F32E'}.zmdi-calendar-check:before{content:'\\F32F'}.zmdi-calendar-close:before{content:'\\F330'}.zmdi-calendar-note:before{content:'\\F331'}.zmdi-calendar:before{content:'\\F332'}.zmdi-time-countdown:before{content:'\\F333'}.zmdi-time-interval:before{content:'\\F334'}.zmdi-time-restore-setting:before{content:'\\F335'}.zmdi-time-restore:before{content:'\\F336'}.zmdi-time:before{content:'\\F337'}.zmdi-timer-off:before{content:'\\F338'}.zmdi-timer:before{content:'\\F339'}.zmdi-android-alt:before{content:'\\F33A'}.zmdi-android:before{content:'\\F33B'}.zmdi-apple:before{content:'\\F33C'}.zmdi-behance:before{content:'\\F33D'}.zmdi-codepen:before{content:'\\F33E'}.zmdi-dribbble:before{content:'\\F33F'}.zmdi-dropbox:before{content:'\\F340'}.zmdi-evernote:before{content:'\\F341'}.zmdi-facebook-box:before{content:'\\F342'}.zmdi-facebook:before{content:'\\F343'}.zmdi-github-box:before{content:'\\F344'}.zmdi-github:before{content:'\\F345'}.zmdi-google-drive:before{content:'\\F346'}.zmdi-google-earth:before{content:'\\F347'}.zmdi-google-glass:before{content:'\\F348'}.zmdi-google-maps:before{content:'\\F349'}.zmdi-google-pages:before{content:'\\F34A'}.zmdi-google-play:before{content:'\\F34B'}.zmdi-google-plus-box:before{content:'\\F34C'}.zmdi-google-plus:before{content:'\\F34D'}.zmdi-google:before{content:'\\F34E'}.zmdi-instagram:before{content:'\\F34F'}.zmdi-language-css3:before{content:'\\F350'}.zmdi-language-html5:before{content:'\\F351'}.zmdi-language-javascript:before{content:'\\F352'}.zmdi-language-python-alt:before{content:'\\F353'}.zmdi-language-python:before{content:'\\F354'}.zmdi-lastfm:before{content:'\\F355'}.zmdi-linkedin-box:before{content:'\\F356'}.zmdi-paypal:before{content:'\\F357'}.zmdi-pinterest-box:before{content:'\\F358'}.zmdi-pocket:before{content:'\\F359'}.zmdi-polymer:before{content:'\\F35A'}.zmdi-share:before{content:'\\F35B'}.zmdi-stackoverflow:before{content:'\\F35C'}.zmdi-steam-square:before{content:'\\F35D'}.zmdi-steam:before{content:'\\F35E'}.zmdi-twitter-box:before{content:'\\F35F'}.zmdi-twitter:before{content:'\\F360'}.zmdi-vk:before{content:'\\F361'}.zmdi-wikipedia:before{content:'\\F362'}.zmdi-windows:before{content:'\\F363'}.zmdi-aspect-ratio-alt:before{content:'\\F364'}.zmdi-aspect-ratio:before{content:'\\F365'}.zmdi-blur-circular:before{content:'\\F366'}.zmdi-blur-linear:before{content:'\\F367'}.zmdi-blur-off:before{content:'\\F368'}.zmdi-blur:before{content:'\\F369'}.zmdi-brightness-2:before{content:'\\F36A'}.zmdi-brightness-3:before{content:'\\F36B'}.zmdi-brightness-4:before{content:'\\F36C'}.zmdi-brightness-5:before{content:'\\F36D'}.zmdi-brightness-6:before{content:'\\F36E'}.zmdi-brightness-7:before{content:'\\F36F'}.zmdi-brightness-auto:before{content:'\\F370'}.zmdi-brightness-setting:before{content:'\\F371'}.zmdi-broken-image:before{content:'\\F372'}.zmdi-center-focus-strong:before{content:'\\F373'}.zmdi-center-focus-weak:before{content:'\\F374'}.zmdi-compare:before{content:'\\F375'}.zmdi-crop-16-9:before{content:'\\F376'}.zmdi-crop-3-2:before{content:'\\F377'}.zmdi-crop-5-4:before{content:'\\F378'}.zmdi-crop-7-5:before{content:'\\F379'}.zmdi-crop-din:before{content:'\\F37A'}.zmdi-crop-free:before{content:'\\F37B'}.zmdi-crop-landscape:before{content:'\\F37C'}.zmdi-crop-portrait:before{content:'\\F37D'}.zmdi-crop-square:before{content:'\\F37E'}.zmdi-exposure-alt:before{content:'\\F37F'}.zmdi-exposure:before{content:'\\F380'}.zmdi-filter-b-and-w:before{content:'\\F381'}.zmdi-filter-center-focus:before{content:'\\F382'}.zmdi-filter-frames:before{content:'\\F383'}.zmdi-filter-tilt-shift:before{content:'\\F384'}.zmdi-gradient:before{content:'\\F385'}.zmdi-grain:before{content:'\\F386'}.zmdi-graphic-eq:before{content:'\\F387'}.zmdi-hdr-off:before{content:'\\F388'}.zmdi-hdr-strong:before{content:'\\F389'}.zmdi-hdr-weak:before{content:'\\F38A'}.zmdi-hdr:before{content:'\\F38B'}.zmdi-iridescent:before{content:'\\F38C'}.zmdi-leak-off:before{content:'\\F38D'}.zmdi-leak:before{content:'\\F38E'}.zmdi-looks:before{content:'\\F38F'}.zmdi-loupe:before{content:'\\F390'}.zmdi-panorama-horizontal:before{content:'\\F391'}.zmdi-panorama-vertical:before{content:'\\F392'}.zmdi-panorama-wide-angle:before{content:'\\F393'}.zmdi-photo-size-select-large:before{content:'\\F394'}.zmdi-photo-size-select-small:before{content:'\\F395'}.zmdi-picture-in-picture:before{content:'\\F396'}.zmdi-slideshow:before{content:'\\F397'}.zmdi-texture:before{content:'\\F398'}.zmdi-tonality:before{content:'\\F399'}.zmdi-vignette:before{content:'\\F39A'}.zmdi-wb-auto:before{content:'\\F39B'}.zmdi-eject-alt:before{content:'\\F39C'}.zmdi-eject:before{content:'\\F39D'}.zmdi-equalizer:before{content:'\\F39E'}.zmdi-fast-forward:before{content:'\\F39F'}.zmdi-fast-rewind:before{content:'\\F3A0'}.zmdi-forward-10:before{content:'\\F3A1'}.zmdi-forward-30:before{content:'\\F3A2'}.zmdi-forward-5:before{content:'\\F3A3'}.zmdi-hearing:before{content:'\\F3A4'}.zmdi-pause-circle-outline:before{content:'\\F3A5'}.zmdi-pause-circle:before{content:'\\F3A6'}.zmdi-pause:before{content:'\\F3A7'}.zmdi-play-circle-outline:before{content:'\\F3A8'}.zmdi-play-circle:before{content:'\\F3A9'}.zmdi-play:before{content:'\\F3AA'}.zmdi-playlist-audio:before{content:'\\F3AB'}.zmdi-playlist-plus:before{content:'\\F3AC'}.zmdi-repeat-one:before{content:'\\F3AD'}.zmdi-repeat:before{content:'\\F3AE'}.zmdi-replay-10:before{content:'\\F3AF'}.zmdi-replay-30:before{content:'\\F3B0'}.zmdi-replay-5:before{content:'\\F3B1'}.zmdi-replay:before{content:'\\F3B2'}.zmdi-shuffle:before{content:'\\F3B3'}.zmdi-skip-next:before{content:'\\F3B4'}.zmdi-skip-previous:before{content:'\\F3B5'}.zmdi-stop:before{content:'\\F3B6'}.zmdi-surround-sound:before{content:'\\F3B7'}.zmdi-tune:before{content:'\\F3B8'}.zmdi-volume-down:before{content:'\\F3B9'}.zmdi-volume-mute:before{content:'\\F3BA'}.zmdi-volume-off:before{content:'\\F3BB'}.zmdi-volume-up:before{content:'\\F3BC'}.zmdi-n-1-square:before{content:'\\F3BD'}.zmdi-n-2-square:before{content:'\\F3BE'}.zmdi-n-3-square:before{content:'\\F3BF'}.zmdi-n-4-square:before{content:'\\F3C0'}.zmdi-n-5-square:before{content:'\\F3C1'}.zmdi-n-6-square:before{content:'\\F3C2'}.zmdi-neg-1:before{content:'\\F3C3'}.zmdi-neg-2:before{content:'\\F3C4'}.zmdi-plus-1:before{content:'\\F3C5'}.zmdi-plus-2:before{content:'\\F3C6'}.zmdi-sec-10:before{content:'\\F3C7'}.zmdi-sec-3:before{content:'\\F3C8'}.zmdi-zero:before{content:'\\F3C9'}.zmdi-airline-seat-flat-angled:before{content:'\\F3CA'}.zmdi-airline-seat-flat:before{content:'\\F3CB'}.zmdi-airline-seat-individual-suite:before{content:'\\F3CC'}.zmdi-airline-seat-legroom-extra:before{content:'\\F3CD'}.zmdi-airline-seat-legroom-normal:before{content:'\\F3CE'}.zmdi-airline-seat-legroom-reduced:before{content:'\\F3CF'}.zmdi-airline-seat-recline-extra:before{content:'\\F3D0'}.zmdi-airline-seat-recline-normal:before{content:'\\F3D1'}.zmdi-airplay:before{content:'\\F3D2'}.zmdi-closed-caption:before{content:'\\F3D3'}.zmdi-confirmation-number:before{content:'\\F3D4'}.zmdi-developer-board:before{content:'\\F3D5'}.zmdi-disc-full:before{content:'\\F3D6'}.zmdi-explicit:before{content:'\\F3D7'}.zmdi-flight-land:before{content:'\\F3D8'}.zmdi-flight-takeoff:before{content:'\\F3D9'}.zmdi-flip-to-back:before{content:'\\F3DA'}.zmdi-flip-to-front:before{content:'\\F3DB'}.zmdi-group-work:before{content:'\\F3DC'}.zmdi-hd:before{content:'\\F3DD'}.zmdi-hq:before{content:'\\F3DE'}.zmdi-markunread-mailbox:before{content:'\\F3DF'}.zmdi-memory:before{content:'\\F3E0'}.zmdi-nfc:before{content:'\\F3E1'}.zmdi-play-for-work:before{content:'\\F3E2'}.zmdi-power-input:before{content:'\\F3E3'}.zmdi-present-to-all:before{content:'\\F3E4'}.zmdi-satellite:before{content:'\\F3E5'}.zmdi-tap-and-play:before{content:'\\F3E6'}.zmdi-vibration:before{content:'\\F3E7'}.zmdi-voicemail:before{content:'\\F3E8'}.zmdi-group:before{content:'\\F3E9'}.zmdi-rss:before{content:'\\F3EA'}.zmdi-shape:before{content:'\\F3EB'}.zmdi-spinner:before{content:'\\F3EC'}.zmdi-ungroup:before{content:'\\F3ED'}.zmdi-500px:before{content:'\\F3EE'}.zmdi-8tracks:before{content:'\\F3EF'}.zmdi-amazon:before{content:'\\F3F0'}.zmdi-blogger:before{content:'\\F3F1'}.zmdi-delicious:before{content:'\\F3F2'}.zmdi-disqus:before{content:'\\F3F3'}.zmdi-flattr:before{content:'\\F3F4'}.zmdi-flickr:before{content:'\\F3F5'}.zmdi-github-alt:before{content:'\\F3F6'}.zmdi-google-old:before{content:'\\F3F7'}.zmdi-linkedin:before{content:'\\F3F8'}.zmdi-odnoklassniki:before{content:'\\F3F9'}.zmdi-outlook:before{content:'\\F3FA'}.zmdi-paypal-alt:before{content:'\\F3FB'}.zmdi-pinterest:before{content:'\\F3FC'}.zmdi-playstation:before{content:'\\F3FD'}.zmdi-reddit:before{content:'\\F3FE'}.zmdi-skype:before{content:'\\F3FF'}.zmdi-slideshare:before{content:'\\F400'}.zmdi-soundcloud:before{content:'\\F401'}.zmdi-tumblr:before{content:'\\F402'}.zmdi-twitch:before{content:'\\F403'}.zmdi-vimeo:before{content:'\\F404'}.zmdi-whatsapp:before{content:'\\F405'}.zmdi-xbox:before{content:'\\F406'}.zmdi-yahoo:before{content:'\\F407'}.zmdi-youtube-play:before{content:'\\F408'}.zmdi-youtube:before{content:'\\F409'}.zmdi-3d-rotation:before{content:'\\F101'}.zmdi-airplane-off:before{content:'\\F102'}.zmdi-airplane:before{content:'\\F103'}.zmdi-album:before{content:'\\F104'}.zmdi-archive:before{content:'\\F105'}.zmdi-assignment-account:before{content:'\\F106'}.zmdi-assignment-alert:before{content:'\\F107'}.zmdi-assignment-check:before{content:'\\F108'}.zmdi-assignment-o:before{content:'\\F109'}.zmdi-assignment-return:before{content:'\\F10A'}.zmdi-assignment-returned:before{content:'\\F10B'}.zmdi-assignment:before{content:'\\F10C'}.zmdi-attachment-alt:before{content:'\\F10D'}.zmdi-attachment:before{content:'\\F10E'}.zmdi-audio:before{content:'\\F10F'}.zmdi-badge-check:before{content:'\\F110'}.zmdi-balance-wallet:before{content:'\\F111'}.zmdi-balance:before{content:'\\F112'}.zmdi-battery-alert:before{content:'\\F113'}.zmdi-battery-flash:before{content:'\\F114'}.zmdi-battery-unknown:before{content:'\\F115'}.zmdi-battery:before{content:'\\F116'}.zmdi-bike:before{content:'\\F117'}.zmdi-block-alt:before{content:'\\F118'}.zmdi-block:before{content:'\\F119'}.zmdi-boat:before{content:'\\F11A'}.zmdi-book-image:before{content:'\\F11B'}.zmdi-book:before{content:'\\F11C'}.zmdi-bookmark-outline:before{content:'\\F11D'}.zmdi-bookmark:before{content:'\\F11E'}.zmdi-brush:before{content:'\\F11F'}.zmdi-bug:before{content:'\\F120'}.zmdi-bus:before{content:'\\F121'}.zmdi-cake:before{content:'\\F122'}.zmdi-car-taxi:before{content:'\\F123'}.zmdi-car-wash:before{content:'\\F124'}.zmdi-car:before{content:'\\F125'}.zmdi-card-giftcard:before{content:'\\F126'}.zmdi-card-membership:before{content:'\\F127'}.zmdi-card-travel:before{content:'\\F128'}.zmdi-card:before{content:'\\F129'}.zmdi-case-check:before{content:'\\F12A'}.zmdi-case-download:before{content:'\\F12B'}.zmdi-case-play:before{content:'\\F12C'}.zmdi-case:before{content:'\\F12D'}.zmdi-cast-connected:before{content:'\\F12E'}.zmdi-cast:before{content:'\\F12F'}.zmdi-chart-donut:before{content:'\\F130'}.zmdi-chart:before{content:'\\F131'}.zmdi-city-alt:before{content:'\\F132'}.zmdi-city:before{content:'\\F133'}.zmdi-close-circle-o:before{content:'\\F134'}.zmdi-close-circle:before{content:'\\F135'}.zmdi-close:before{content:'\\F136'}.zmdi-cocktail:before{content:'\\F137'}.zmdi-code-setting:before{content:'\\F138'}.zmdi-code-smartphone:before{content:'\\F139'}.zmdi-code:before{content:'\\F13A'}.zmdi-coffee:before{content:'\\F13B'}.zmdi-collection-bookmark:before{content:'\\F13C'}.zmdi-collection-case-play:before{content:'\\F13D'}.zmdi-collection-folder-image:before{content:'\\F13E'}.zmdi-collection-image-o:before{content:'\\F13F'}.zmdi-collection-image:before{content:'\\F140'}.zmdi-collection-item-1:before{content:'\\F141'}.zmdi-collection-item-2:before{content:'\\F142'}.zmdi-collection-item-3:before{content:'\\F143'}.zmdi-collection-item-4:before{content:'\\F144'}.zmdi-collection-item-5:before{content:'\\F145'}.zmdi-collection-item-6:before{content:'\\F146'}.zmdi-collection-item-7:before{content:'\\F147'}.zmdi-collection-item-8:before{content:'\\F148'}.zmdi-collection-item-9-plus:before{content:'\\F149'}.zmdi-collection-item-9:before{content:'\\F14A'}.zmdi-collection-item:before{content:'\\F14B'}.zmdi-collection-music:before{content:'\\F14C'}.zmdi-collection-pdf:before{content:'\\F14D'}.zmdi-collection-plus:before{content:'\\F14E'}.zmdi-collection-speaker:before{content:'\\F14F'}.zmdi-collection-text:before{content:'\\F150'}.zmdi-collection-video:before{content:'\\F151'}.zmdi-compass:before{content:'\\F152'}.zmdi-cutlery:before{content:'\\F153'}.zmdi-delete:before{content:'\\F154'}.zmdi-dialpad:before{content:'\\F155'}.zmdi-dns:before{content:'\\F156'}.zmdi-drink:before{content:'\\F157'}.zmdi-edit:before{content:'\\F158'}.zmdi-email-open:before{content:'\\F159'}.zmdi-email:before{content:'\\F15A'}.zmdi-eye-off:before{content:'\\F15B'}.zmdi-eye:before{content:'\\F15C'}.zmdi-eyedropper:before{content:'\\F15D'}.zmdi-favorite-outline:before{content:'\\F15E'}.zmdi-favorite:before{content:'\\F15F'}.zmdi-filter-list:before{content:'\\F160'}.zmdi-fire:before{content:'\\F161'}.zmdi-flag:before{content:'\\F162'}.zmdi-flare:before{content:'\\F163'}.zmdi-flash-auto:before{content:'\\F164'}.zmdi-flash-off:before{content:'\\F165'}.zmdi-flash:before{content:'\\F166'}.zmdi-flip:before{content:'\\F167'}.zmdi-flower-alt:before{content:'\\F168'}.zmdi-flower:before{content:'\\F169'}.zmdi-font:before{content:'\\F16A'}.zmdi-fullscreen-alt:before{content:'\\F16B'}.zmdi-fullscreen-exit:before{content:'\\F16C'}.zmdi-fullscreen:before{content:'\\F16D'}.zmdi-functions:before{content:'\\F16E'}.zmdi-gas-station:before{content:'\\F16F'}.zmdi-gesture:before{content:'\\F170'}.zmdi-globe-alt:before{content:'\\F171'}.zmdi-globe-lock:before{content:'\\F172'}.zmdi-globe:before{content:'\\F173'}.zmdi-graduation-cap:before{content:'\\F174'}.zmdi-home:before{content:'\\F175'}.zmdi-hospital-alt:before{content:'\\F176'}.zmdi-hospital:before{content:'\\F177'}.zmdi-hotel:before{content:'\\F178'}.zmdi-hourglass-alt:before{content:'\\F179'}.zmdi-hourglass-outline:before{content:'\\F17A'}.zmdi-hourglass:before{content:'\\F17B'}.zmdi-http:before{content:'\\F17C'}.zmdi-image-alt:before{content:'\\F17D'}.zmdi-image-o:before{content:'\\F17E'}.zmdi-image:before{content:'\\F17F'}.zmdi-inbox:before{content:'\\F180'}.zmdi-invert-colors-off:before{content:'\\F181'}.zmdi-invert-colors:before{content:'\\F182'}.zmdi-key:before{content:'\\F183'}.zmdi-label-alt-outline:before{content:'\\F184'}.zmdi-label-alt:before{content:'\\F185'}.zmdi-label-heart:before{content:'\\F186'}.zmdi-label:before{content:'\\F187'}.zmdi-labels:before{content:'\\F188'}.zmdi-lamp:before{content:'\\F189'}.zmdi-landscape:before{content:'\\F18A'}.zmdi-layers-off:before{content:'\\F18B'}.zmdi-layers:before{content:'\\F18C'}.zmdi-library:before{content:'\\F18D'}.zmdi-link:before{content:'\\F18E'}.zmdi-lock-open:before{content:'\\F18F'}.zmdi-lock-outline:before{content:'\\F190'}.zmdi-lock:before{content:'\\F191'}.zmdi-mail-reply-all:before{content:'\\F192'}.zmdi-mail-reply:before{content:'\\F193'}.zmdi-mail-send:before{content:'\\F194'}.zmdi-mall:before{content:'\\F195'}.zmdi-map:before{content:'\\F196'}.zmdi-menu:before{content:'\\F197'}.zmdi-money-box:before{content:'\\F198'}.zmdi-money-off:before{content:'\\F199'}.zmdi-money:before{content:'\\F19A'}.zmdi-more-vert:before{content:'\\F19B'}.zmdi-more:before{content:'\\F19C'}.zmdi-movie-alt:before{content:'\\F19D'}.zmdi-movie:before{content:'\\F19E'}.zmdi-nature-people:before{content:'\\F19F'}.zmdi-nature:before{content:'\\F1A0'}.zmdi-navigation:before{content:'\\F1A1'}.zmdi-open-in-browser:before{content:'\\F1A2'}.zmdi-open-in-new:before{content:'\\F1A3'}.zmdi-palette:before{content:'\\F1A4'}.zmdi-parking:before{content:'\\F1A5'}.zmdi-pin-account:before{content:'\\F1A6'}.zmdi-pin-assistant:before{content:'\\F1A7'}.zmdi-pin-drop:before{content:'\\F1A8'}.zmdi-pin-help:before{content:'\\F1A9'}.zmdi-pin-off:before{content:'\\F1AA'}.zmdi-pin:before{content:'\\F1AB'}.zmdi-pizza:before{content:'\\F1AC'}.zmdi-plaster:before{content:'\\F1AD'}.zmdi-power-setting:before{content:'\\F1AE'}.zmdi-power:before{content:'\\F1AF'}.zmdi-print:before{content:'\\F1B0'}.zmdi-puzzle-piece:before{content:'\\F1B1'}.zmdi-quote:before{content:'\\F1B2'}.zmdi-railway:before{content:'\\F1B3'}.zmdi-receipt:before{content:'\\F1B4'}.zmdi-refresh-alt:before{content:'\\F1B5'}.zmdi-refresh-sync-alert:before{content:'\\F1B6'}.zmdi-refresh-sync-off:before{content:'\\F1B7'}.zmdi-refresh-sync:before{content:'\\F1B8'}.zmdi-refresh:before{content:'\\F1B9'}.zmdi-roller:before{content:'\\F1BA'}.zmdi-ruler:before{content:'\\F1BB'}.zmdi-scissors:before{content:'\\F1BC'}.zmdi-screen-rotation-lock:before{content:'\\F1BD'}.zmdi-screen-rotation:before{content:'\\F1BE'}.zmdi-search-for:before{content:'\\F1BF'}.zmdi-search-in-file:before{content:'\\F1C0'}.zmdi-search-in-page:before{content:'\\F1C1'}.zmdi-search-replace:before{content:'\\F1C2'}.zmdi-search:before{content:'\\F1C3'}.zmdi-seat:before{content:'\\F1C4'}.zmdi-settings-square:before{content:'\\F1C5'}.zmdi-settings:before{content:'\\F1C6'}.zmdi-shield-check:before{content:'\\F1C7'}.zmdi-shield-security:before{content:'\\F1C8'}.zmdi-shopping-basket:before{content:'\\F1C9'}.zmdi-shopping-cart-plus:before{content:'\\F1CA'}.zmdi-shopping-cart:before{content:'\\F1CB'}.zmdi-sign-in:before{content:'\\F1CC'}.zmdi-sort-amount-asc:before{content:'\\F1CD'}.zmdi-sort-amount-desc:before{content:'\\F1CE'}.zmdi-sort-asc:before{content:'\\F1CF'}.zmdi-sort-desc:before{content:'\\F1D0'}.zmdi-spellcheck:before{content:'\\F1D1'}.zmdi-storage:before{content:'\\F1D2'}.zmdi-store-24:before{content:'\\F1D3'}.zmdi-store:before{content:'\\F1D4'}.zmdi-subway:before{content:'\\F1D5'}.zmdi-sun:before{content:'\\F1D6'}.zmdi-tab-unselected:before{content:'\\F1D7'}.zmdi-tab:before{content:'\\F1D8'}.zmdi-tag-close:before{content:'\\F1D9'}.zmdi-tag-more:before{content:'\\F1DA'}.zmdi-tag:before{content:'\\F1DB'}.zmdi-thumb-down:before{content:'\\F1DC'}.zmdi-thumb-up-down:before{content:'\\F1DD'}.zmdi-thumb-up:before{content:'\\F1DE'}.zmdi-ticket-star:before{content:'\\F1DF'}.zmdi-toll:before{content:'\\F1E0'}.zmdi-toys:before{content:'\\F1E1'}.zmdi-traffic:before{content:'\\F1E2'}.zmdi-translate:before{content:'\\F1E3'}.zmdi-triangle-down:before{content:'\\F1E4'}.zmdi-triangle-up:before{content:'\\F1E5'}.zmdi-truck:before{content:'\\F1E6'}.zmdi-turning-sign:before{content:'\\F1E7'}.zmdi-wallpaper:before{content:'\\F1E8'}.zmdi-washing-machine:before{content:'\\F1E9'}.zmdi-window-maximize:before{content:'\\F1EA'}.zmdi-window-minimize:before{content:'\\F1EB'}.zmdi-window-restore:before{content:'\\F1EC'}.zmdi-wrench:before{content:'\\F1ED'}.zmdi-zoom-in:before{content:'\\F1EE'}.zmdi-zoom-out:before{content:'\\F1EF'}.zmdi-alert-circle-o:before{content:'\\F1F0'}.zmdi-alert-circle:before{content:'\\F1F1'}.zmdi-alert-octagon:before{content:'\\F1F2'}.zmdi-alert-polygon:before{content:'\\F1F3'}.zmdi-alert-triangle:before{content:'\\F1F4'}.zmdi-help-outline:before{content:'\\F1F5'}.zmdi-help:before{content:'\\F1F6'}.zmdi-info-outline:before{content:'\\F1F7'}.zmdi-info:before{content:'\\F1F8'}.zmdi-notifications-active:before{content:'\\F1F9'}.zmdi-notifications-add:before{content:'\\F1FA'}.zmdi-notifications-none:before{content:'\\F1FB'}.zmdi-notifications-off:before{content:'\\F1FC'}.zmdi-notifications-paused:before{content:'\\F1FD'}.zmdi-notifications:before{content:'\\F1FE'}.zmdi-account-add:before{content:'\\F1FF'}.zmdi-account-box-mail:before{content:'\\F200'}.zmdi-account-box-o:before{content:'\\F201'}.zmdi-account-box-phone:before{content:'\\F202'}.zmdi-account-box:before{content:'\\F203'}.zmdi-account-calendar:before{content:'\\F204'}.zmdi-account-circle:before{content:'\\F205'}.zmdi-account-o:before{content:'\\F206'}.zmdi-account:before{content:'\\F207'}.zmdi-accounts-add:before{content:'\\F208'}.zmdi-accounts-alt:before{content:'\\F209'}.zmdi-accounts-list-alt:before{content:'\\F20A'}.zmdi-accounts-list:before{content:'\\F20B'}.zmdi-accounts-outline:before{content:'\\F20C'}.zmdi-accounts:before{content:'\\F20D'}.zmdi-face:before{content:'\\F20E'}.zmdi-female:before{content:'\\F20F'}.zmdi-male-alt:before{content:'\\F210'}.zmdi-male-female:before{content:'\\F211'}.zmdi-male:before{content:'\\F212'}.zmdi-mood-bad:before{content:'\\F213'}.zmdi-mood:before{content:'\\F214'}.zmdi-run:before{content:'\\F215'}.zmdi-walk:before{content:'\\F216'}.zmdi-cloud-box:before{content:'\\F217'}.zmdi-cloud-circle:before{content:'\\F218'}.zmdi-cloud-done:before{content:'\\F219'}.zmdi-cloud-download:before{content:'\\F21A'}.zmdi-cloud-off:before{content:'\\F21B'}.zmdi-cloud-outline-alt:before{content:'\\F21C'}.zmdi-cloud-outline:before{content:'\\F21D'}.zmdi-cloud-upload:before{content:'\\F21E'}.zmdi-cloud:before{content:'\\F21F'}.zmdi-download:before{content:'\\F220'}.zmdi-file-plus:before{content:'\\F221'}.zmdi-file-text:before{content:'\\F222'}.zmdi-file:before{content:'\\F223'}.zmdi-folder-outline:before{content:'\\F224'}.zmdi-folder-person:before{content:'\\F225'}.zmdi-folder-star-alt:before{content:'\\F226'}.zmdi-folder-star:before{content:'\\F227'}.zmdi-folder:before{content:'\\F228'}.zmdi-gif:before{content:'\\F229'}.zmdi-upload:before{content:'\\F22A'}.zmdi-border-all:before{content:'\\F22B'}.zmdi-border-bottom:before{content:'\\F22C'}.zmdi-border-clear:before{content:'\\F22D'}.zmdi-border-color:before{content:'\\F22E'}.zmdi-border-horizontal:before{content:'\\F22F'}.zmdi-border-inner:before{content:'\\F230'}.zmdi-border-left:before{content:'\\F231'}.zmdi-border-outer:before{content:'\\F232'}.zmdi-border-right:before{content:'\\F233'}.zmdi-border-style:before{content:'\\F234'}.zmdi-border-top:before{content:'\\F235'}.zmdi-border-vertical:before{content:'\\F236'}.zmdi-copy:before{content:'\\F237'}.zmdi-crop:before{content:'\\F238'}.zmdi-format-align-center:before{content:'\\F239'}.zmdi-format-align-justify:before{content:'\\F23A'}.zmdi-format-align-left:before{content:'\\F23B'}.zmdi-format-align-right:before{content:'\\F23C'}.zmdi-format-bold:before{content:'\\F23D'}.zmdi-format-clear-all:before{content:'\\F23E'}.zmdi-format-clear:before{content:'\\F23F'}.zmdi-format-color-fill:before{content:'\\F240'}.zmdi-format-color-reset:before{content:'\\F241'}.zmdi-format-color-text:before{content:'\\F242'}.zmdi-format-indent-decrease:before{content:'\\F243'}.zmdi-format-indent-increase:before{content:'\\F244'}.zmdi-format-italic:before{content:'\\F245'}.zmdi-format-line-spacing:before{content:'\\F246'}.zmdi-format-list-bulleted:before{content:'\\F247'}.zmdi-format-list-numbered:before{content:'\\F248'}.zmdi-format-ltr:before{content:'\\F249'}.zmdi-format-rtl:before{content:'\\F24A'}.zmdi-format-size:before{content:'\\F24B'}.zmdi-format-strikethrough-s:before{content:'\\F24C'}.zmdi-format-strikethrough:before{content:'\\F24D'}.zmdi-format-subject:before{content:'\\F24E'}.zmdi-format-underlined:before{content:'\\F24F'}.zmdi-format-valign-bottom:before{content:'\\F250'}.zmdi-format-valign-center:before{content:'\\F251'}.zmdi-format-valign-top:before{content:'\\F252'}.zmdi-redo:before{content:'\\F253'}.zmdi-select-all:before{content:'\\F254'}.zmdi-space-bar:before{content:'\\F255'}.zmdi-text-format:before{content:'\\F256'}.zmdi-transform:before{content:'\\F257'}.zmdi-undo:before{content:'\\F258'}.zmdi-wrap-text:before{content:'\\F259'}.zmdi-comment-alert:before{content:'\\F25A'}.zmdi-comment-alt-text:before{content:'\\F25B'}.zmdi-comment-alt:before{content:'\\F25C'}.zmdi-comment-edit:before{content:'\\F25D'}.zmdi-comment-image:before{content:'\\F25E'}.zmdi-comment-list:before{content:'\\F25F'}.zmdi-comment-more:before{content:'\\F260'}.zmdi-comment-outline:before{content:'\\F261'}.zmdi-comment-text-alt:before{content:'\\F262'}.zmdi-comment-text:before{content:'\\F263'}.zmdi-comment-video:before{content:'\\F264'}.zmdi-comment:before{content:'\\F265'}.zmdi-comments:before{content:'\\F266'}.zmdi-check-all:before{content:'\\F267'}.zmdi-check-circle-u:before{content:'\\F268'}.zmdi-check-circle:before{content:'\\F269'}.zmdi-check-square:before{content:'\\F26A'}.zmdi-check:before{content:'\\F26B'}.zmdi-circle-o:before{content:'\\F26C'}.zmdi-circle:before{content:'\\F26D'}.zmdi-dot-circle-alt:before{content:'\\F26E'}.zmdi-dot-circle:before{content:'\\F26F'}.zmdi-minus-circle-outline:before{content:'\\F270'}.zmdi-minus-circle:before{content:'\\F271'}.zmdi-minus-square:before{content:'\\F272'}.zmdi-minus:before{content:'\\F273'}.zmdi-plus-circle-o-duplicate:before{content:'\\F274'}.zmdi-plus-circle-o:before{content:'\\F275'}.zmdi-plus-circle:before{content:'\\F276'}.zmdi-plus-square:before{content:'\\F277'}.zmdi-plus:before{content:'\\F278'}.zmdi-square-o:before{content:'\\F279'}.zmdi-star-circle:before{content:'\\F27A'}.zmdi-star-half:before{content:'\\F27B'}.zmdi-star-outline:before{content:'\\F27C'}.zmdi-star:before{content:'\\F27D'}.zmdi-bluetooth-connected:before{content:'\\F27E'}.zmdi-bluetooth-off:before{content:'\\F27F'}.zmdi-bluetooth-search:before{content:'\\F280'}.zmdi-bluetooth-setting:before{content:'\\F281'}.zmdi-bluetooth:before{content:'\\F282'}.zmdi-camera-add:before{content:'\\F283'}.zmdi-camera-alt:before{content:'\\F284'}.zmdi-camera-bw:before{content:'\\F285'}.zmdi-camera-front:before{content:'\\F286'}.zmdi-camera-mic:before{content:'\\F287'}.zmdi-camera-party-mode:before{content:'\\F288'}.zmdi-camera-rear:before{content:'\\F289'}.zmdi-camera-roll:before{content:'\\F28A'}.zmdi-camera-switch:before{content:'\\F28B'}.zmdi-camera:before{content:'\\F28C'}.zmdi-card-alert:before{content:'\\F28D'}.zmdi-card-off:before{content:'\\F28E'}.zmdi-card-sd:before{content:'\\F28F'}.zmdi-card-sim:before{content:'\\F290'}.zmdi-desktop-mac:before{content:'\\F291'}.zmdi-desktop-windows:before{content:'\\F292'}.zmdi-device-hub:before{content:'\\F293'}.zmdi-devices-off:before{content:'\\F294'}.zmdi-devices:before{content:'\\F295'}.zmdi-dock:before{content:'\\F296'}.zmdi-floppy:before{content:'\\F297'}.zmdi-gamepad:before{content:'\\F298'}.zmdi-gps-dot:before{content:'\\F299'}.zmdi-gps-off:before{content:'\\F29A'}.zmdi-gps:before{content:'\\F29B'}.zmdi-headset-mic:before{content:'\\F29C'}.zmdi-headset:before{content:'\\F29D'}.zmdi-input-antenna:before{content:'\\F29E'}.zmdi-input-composite:before{content:'\\F29F'}.zmdi-input-hdmi:before{content:'\\F2A0'}.zmdi-input-power:before{content:'\\F2A1'}.zmdi-input-svideo:before{content:'\\F2A2'}.zmdi-keyboard-hide:before{content:'\\F2A3'}.zmdi-keyboard:before{content:'\\F2A4'}.zmdi-laptop-chromebook:before{content:'\\F2A5'}.zmdi-laptop-mac:before{content:'\\F2A6'}.zmdi-laptop:before{content:'\\F2A7'}.zmdi-mic-off:before{content:'\\F2A8'}.zmdi-mic-outline:before{content:'\\F2A9'}.zmdi-mic-setting:before{content:'\\F2AA'}.zmdi-mic:before{content:'\\F2AB'}.zmdi-mouse:before{content:'\\F2AC'}.zmdi-network-alert:before{content:'\\F2AD'}.zmdi-network-locked:before{content:'\\F2AE'}.zmdi-network-off:before{content:'\\F2AF'}.zmdi-network-outline:before{content:'\\F2B0'}.zmdi-network-setting:before{content:'\\F2B1'}.zmdi-network:before{content:'\\F2B2'}.zmdi-phone-bluetooth:before{content:'\\F2B3'}.zmdi-phone-end:before{content:'\\F2B4'}.zmdi-phone-forwarded:before{content:'\\F2B5'}.zmdi-phone-in-talk:before{content:'\\F2B6'}.zmdi-phone-locked:before{content:'\\F2B7'}.zmdi-phone-missed:before{content:'\\F2B8'}.zmdi-phone-msg:before{content:'\\F2B9'}.zmdi-phone-paused:before{content:'\\F2BA'}.zmdi-phone-ring:before{content:'\\F2BB'}.zmdi-phone-setting:before{content:'\\F2BC'}.zmdi-phone-sip:before{content:'\\F2BD'}.zmdi-phone:before{content:'\\F2BE'}.zmdi-portable-wifi-changes:before{content:'\\F2BF'}.zmdi-portable-wifi-off:before{content:'\\F2C0'}.zmdi-portable-wifi:before{content:'\\F2C1'}.zmdi-radio:before{content:'\\F2C2'}.zmdi-reader:before{content:'\\F2C3'}.zmdi-remote-control-alt:before{content:'\\F2C4'}.zmdi-remote-control:before{content:'\\F2C5'}.zmdi-router:before{content:'\\F2C6'}.zmdi-scanner:before{content:'\\F2C7'}.zmdi-smartphone-android:before{content:'\\F2C8'}.zmdi-smartphone-download:before{content:'\\F2C9'}.zmdi-smartphone-erase:before{content:'\\F2CA'}.zmdi-smartphone-info:before{content:'\\F2CB'}.zmdi-smartphone-iphone:before{content:'\\F2CC'}.zmdi-smartphone-landscape-lock:before{content:'\\F2CD'}.zmdi-smartphone-landscape:before{content:'\\F2CE'}.zmdi-smartphone-lock:before{content:'\\F2CF'}.zmdi-smartphone-portrait-lock:before{content:'\\F2D0'}.zmdi-smartphone-ring:before{content:'\\F2D1'}.zmdi-smartphone-setting:before{content:'\\F2D2'}.zmdi-smartphone-setup:before{content:'\\F2D3'}.zmdi-smartphone:before{content:'\\F2D4'}.zmdi-speaker:before{content:'\\F2D5'}.zmdi-tablet-android:before{content:'\\F2D6'}.zmdi-tablet-mac:before{content:'\\F2D7'}.zmdi-tablet:before{content:'\\F2D8'}.zmdi-tv-alt-play:before{content:'\\F2D9'}.zmdi-tv-list:before{content:'\\F2DA'}.zmdi-tv-play:before{content:'\\F2DB'}.zmdi-tv:before{content:'\\F2DC'}.zmdi-usb:before{content:'\\F2DD'}.zmdi-videocam-off:before{content:'\\F2DE'}.zmdi-videocam-switch:before{content:'\\F2DF'}.zmdi-videocam:before{content:'\\F2E0'}.zmdi-watch:before{content:'\\F2E1'}.zmdi-wifi-alt-2:before{content:'\\F2E2'}.zmdi-wifi-alt:before{content:'\\F2E3'}.zmdi-wifi-info:before{content:'\\F2E4'}.zmdi-wifi-lock:before{content:'\\F2E5'}.zmdi-wifi-off:before{content:'\\F2E6'}.zmdi-wifi-outline:before{content:'\\F2E7'}.zmdi-wifi:before{content:'\\F2E8'}.zmdi-arrow-left-bottom:before{content:'\\F2E9'}.zmdi-arrow-left:before{content:'\\F2EA'}.zmdi-arrow-merge:before{content:'\\F2EB'}.zmdi-arrow-missed:before{content:'\\F2EC'}.zmdi-arrow-right-top:before{content:'\\F2ED'}.zmdi-arrow-right:before{content:'\\F2EE'}.zmdi-arrow-split:before{content:'\\F2EF'}.zmdi-arrows:before{content:'\\F2F0'}.zmdi-caret-down-circle:before{content:'\\F2F1'}.zmdi-caret-down:before{content:'\\F2F2'}.zmdi-caret-left-circle:before{content:'\\F2F3'}.zmdi-caret-left:before{content:'\\F2F4'}.zmdi-caret-right-circle:before{content:'\\F2F5'}.zmdi-caret-right:before{content:'\\F2F6'}.zmdi-caret-up-circle:before{content:'\\F2F7'}.zmdi-caret-up:before{content:'\\F2F8'}.zmdi-chevron-down:before{content:'\\F2F9'}.zmdi-chevron-left:before{content:'\\F2FA'}.zmdi-chevron-right:before{content:'\\F2FB'}.zmdi-chevron-up:before{content:'\\F2FC'}.zmdi-forward:before{content:'\\F2FD'}.zmdi-long-arrow-down:before{content:'\\F2FE'}.zmdi-long-arrow-left:before{content:'\\F2FF'}.zmdi-long-arrow-return:before{content:'\\F300'}.zmdi-long-arrow-right:before{content:'\\F301'}.zmdi-long-arrow-tab:before{content:'\\F302'}.zmdi-long-arrow-up:before{content:'\\F303'}.zmdi-rotate-ccw:before{content:'\\F304'}.zmdi-rotate-cw:before{content:'\\F305'}.zmdi-rotate-left:before{content:'\\F306'}.zmdi-rotate-right:before{content:'\\F307'}.zmdi-square-down:before{content:'\\F308'}.zmdi-square-right:before{content:'\\F309'}.zmdi-swap-alt:before{content:'\\F30A'}.zmdi-swap-vertical-circle:before{content:'\\F30B'}.zmdi-swap-vertical:before{content:'\\F30C'}.zmdi-swap:before{content:'\\F30D'}.zmdi-trending-down:before{content:'\\F30E'}.zmdi-trending-flat:before{content:'\\F30F'}.zmdi-trending-up:before{content:'\\F310'}.zmdi-unfold-less:before{content:'\\F311'}.zmdi-unfold-more:before{content:'\\F312'}.zmdi-apps:before{content:'\\F313'}.zmdi-grid-off:before{content:'\\F314'}.zmdi-grid:before{content:'\\F315'}.zmdi-view-agenda:before{content:'\\F316'}.zmdi-view-array:before{content:'\\F317'}.zmdi-view-carousel:before{content:'\\F318'}.zmdi-view-column:before{content:'\\F319'}.zmdi-view-comfy:before{content:'\\F31A'}.zmdi-view-compact:before{content:'\\F31B'}.zmdi-view-dashboard:before{content:'\\F31C'}.zmdi-view-day:before{content:'\\F31D'}.zmdi-view-headline:before{content:'\\F31E'}.zmdi-view-list-alt:before{content:'\\F31F'}.zmdi-view-list:before{content:'\\F320'}.zmdi-view-module:before{content:'\\F321'}.zmdi-view-quilt:before{content:'\\F322'}.zmdi-view-stream:before{content:'\\F323'}.zmdi-view-subtitles:before{content:'\\F324'}.zmdi-view-toc:before{content:'\\F325'}.zmdi-view-web:before{content:'\\F326'}.zmdi-view-week:before{content:'\\F327'}.zmdi-widgets:before{content:'\\F328'}.zmdi-alarm-check:before{content:'\\F329'}.zmdi-alarm-off:before{content:'\\F32A'}.zmdi-alarm-plus:before{content:'\\F32B'}.zmdi-alarm-snooze:before{content:'\\F32C'}.zmdi-alarm:before{content:'\\F32D'}.zmdi-calendar-alt:before{content:'\\F32E'}.zmdi-calendar-check:before{content:'\\F32F'}.zmdi-calendar-close:before{content:'\\F330'}.zmdi-calendar-note:before{content:'\\F331'}.zmdi-calendar:before{content:'\\F332'}.zmdi-time-countdown:before{content:'\\F333'}.zmdi-time-interval:before{content:'\\F334'}.zmdi-time-restore-setting:before{content:'\\F335'}.zmdi-time-restore:before{content:'\\F336'}.zmdi-time:before{content:'\\F337'}.zmdi-timer-off:before{content:'\\F338'}.zmdi-timer:before{content:'\\F339'}.zmdi-android-alt:before{content:'\\F33A'}.zmdi-android:before{content:'\\F33B'}.zmdi-apple:before{content:'\\F33C'}.zmdi-behance:before{content:'\\F33D'}.zmdi-codepen:before{content:'\\F33E'}.zmdi-dribbble:before{content:'\\F33F'}.zmdi-dropbox:before{content:'\\F340'}.zmdi-evernote:before{content:'\\F341'}.zmdi-facebook-box:before{content:'\\F342'}.zmdi-facebook:before{content:'\\F343'}.zmdi-github-box:before{content:'\\F344'}.zmdi-github:before{content:'\\F345'}.zmdi-google-drive:before{content:'\\F346'}.zmdi-google-earth:before{content:'\\F347'}.zmdi-google-glass:before{content:'\\F348'}.zmdi-google-maps:before{content:'\\F349'}.zmdi-google-pages:before{content:'\\F34A'}.zmdi-google-play:before{content:'\\F34B'}.zmdi-google-plus-box:before{content:'\\F34C'}.zmdi-google-plus:before{content:'\\F34D'}.zmdi-google:before{content:'\\F34E'}.zmdi-instagram:before{content:'\\F34F'}.zmdi-language-css3:before{content:'\\F350'}.zmdi-language-html5:before{content:'\\F351'}.zmdi-language-javascript:before{content:'\\F352'}.zmdi-language-python-alt:before{content:'\\F353'}.zmdi-language-python:before{content:'\\F354'}.zmdi-lastfm:before{content:'\\F355'}.zmdi-linkedin-box:before{content:'\\F356'}.zmdi-paypal:before{content:'\\F357'}.zmdi-pinterest-box:before{content:'\\F358'}.zmdi-pocket:before{content:'\\F359'}.zmdi-polymer:before{content:'\\F35A'}.zmdi-share:before{content:'\\F35B'}.zmdi-stackoverflow:before{content:'\\F35C'}.zmdi-steam-square:before{content:'\\F35D'}.zmdi-steam:before{content:'\\F35E'}.zmdi-twitter-box:before{content:'\\F35F'}.zmdi-twitter:before{content:'\\F360'}.zmdi-vk:before{content:'\\F361'}.zmdi-wikipedia:before{content:'\\F362'}.zmdi-windows:before{content:'\\F363'}.zmdi-aspect-ratio-alt:before{content:'\\F364'}.zmdi-aspect-ratio:before{content:'\\F365'}.zmdi-blur-circular:before{content:'\\F366'}.zmdi-blur-linear:before{content:'\\F367'}.zmdi-blur-off:before{content:'\\F368'}.zmdi-blur:before{content:'\\F369'}.zmdi-brightness-2:before{content:'\\F36A'}.zmdi-brightness-3:before{content:'\\F36B'}.zmdi-brightness-4:before{content:'\\F36C'}.zmdi-brightness-5:before{content:'\\F36D'}.zmdi-brightness-6:before{content:'\\F36E'}.zmdi-brightness-7:before{content:'\\F36F'}.zmdi-brightness-auto:before{content:'\\F370'}.zmdi-brightness-setting:before{content:'\\F371'}.zmdi-broken-image:before{content:'\\F372'}.zmdi-center-focus-strong:before{content:'\\F373'}.zmdi-center-focus-weak:before{content:'\\F374'}.zmdi-compare:before{content:'\\F375'}.zmdi-crop-16-9:before{content:'\\F376'}.zmdi-crop-3-2:before{content:'\\F377'}.zmdi-crop-5-4:before{content:'\\F378'}.zmdi-crop-7-5:before{content:'\\F379'}.zmdi-crop-din:before{content:'\\F37A'}.zmdi-crop-free:before{content:'\\F37B'}.zmdi-crop-landscape:before{content:'\\F37C'}.zmdi-crop-portrait:before{content:'\\F37D'}.zmdi-crop-square:before{content:'\\F37E'}.zmdi-exposure-alt:before{content:'\\F37F'}.zmdi-exposure:before{content:'\\F380'}.zmdi-filter-b-and-w:before{content:'\\F381'}.zmdi-filter-center-focus:before{content:'\\F382'}.zmdi-filter-frames:before{content:'\\F383'}.zmdi-filter-tilt-shift:before{content:'\\F384'}.zmdi-gradient:before{content:'\\F385'}.zmdi-grain:before{content:'\\F386'}.zmdi-graphic-eq:before{content:'\\F387'}.zmdi-hdr-off:before{content:'\\F388'}.zmdi-hdr-strong:before{content:'\\F389'}.zmdi-hdr-weak:before{content:'\\F38A'}.zmdi-hdr:before{content:'\\F38B'}.zmdi-iridescent:before{content:'\\F38C'}.zmdi-leak-off:before{content:'\\F38D'}.zmdi-leak:before{content:'\\F38E'}.zmdi-looks:before{content:'\\F38F'}.zmdi-loupe:before{content:'\\F390'}.zmdi-panorama-horizontal:before{content:'\\F391'}.zmdi-panorama-vertical:before{content:'\\F392'}.zmdi-panorama-wide-angle:before{content:'\\F393'}.zmdi-photo-size-select-large:before{content:'\\F394'}.zmdi-photo-size-select-small:before{content:'\\F395'}.zmdi-picture-in-picture:before{content:'\\F396'}.zmdi-slideshow:before{content:'\\F397'}.zmdi-texture:before{content:'\\F398'}.zmdi-tonality:before{content:'\\F399'}.zmdi-vignette:before{content:'\\F39A'}.zmdi-wb-auto:before{content:'\\F39B'}.zmdi-eject-alt:before{content:'\\F39C'}.zmdi-eject:before{content:'\\F39D'}.zmdi-equalizer:before{content:'\\F39E'}.zmdi-fast-forward:before{content:'\\F39F'}.zmdi-fast-rewind:before{content:'\\F3A0'}.zmdi-forward-10:before{content:'\\F3A1'}.zmdi-forward-30:before{content:'\\F3A2'}.zmdi-forward-5:before{content:'\\F3A3'}.zmdi-hearing:before{content:'\\F3A4'}.zmdi-pause-circle-outline:before{content:'\\F3A5'}.zmdi-pause-circle:before{content:'\\F3A6'}.zmdi-pause:before{content:'\\F3A7'}.zmdi-play-circle-outline:before{content:'\\F3A8'}.zmdi-play-circle:before{content:'\\F3A9'}.zmdi-play:before{content:'\\F3AA'}.zmdi-playlist-audio:before{content:'\\F3AB'}.zmdi-playlist-plus:before{content:'\\F3AC'}.zmdi-repeat-one:before{content:'\\F3AD'}.zmdi-repeat:before{content:'\\F3AE'}.zmdi-replay-10:before{content:'\\F3AF'}.zmdi-replay-30:before{content:'\\F3B0'}.zmdi-replay-5:before{content:'\\F3B1'}.zmdi-replay:before{content:'\\F3B2'}.zmdi-shuffle:before{content:'\\F3B3'}.zmdi-skip-next:before{content:'\\F3B4'}.zmdi-skip-previous:before{content:'\\F3B5'}.zmdi-stop:before{content:'\\F3B6'}.zmdi-surround-sound:before{content:'\\F3B7'}.zmdi-tune:before{content:'\\F3B8'}.zmdi-volume-down:before{content:'\\F3B9'}.zmdi-volume-mute:before{content:'\\F3BA'}.zmdi-volume-off:before{content:'\\F3BB'}.zmdi-volume-up:before{content:'\\F3BC'}.zmdi-n-1-square:before{content:'\\F3BD'}.zmdi-n-2-square:before{content:'\\F3BE'}.zmdi-n-3-square:before{content:'\\F3BF'}.zmdi-n-4-square:before{content:'\\F3C0'}.zmdi-n-5-square:before{content:'\\F3C1'}.zmdi-n-6-square:before{content:'\\F3C2'}.zmdi-neg-1:before{content:'\\F3C3'}.zmdi-neg-2:before{content:'\\F3C4'}.zmdi-plus-1:before{content:'\\F3C5'}.zmdi-plus-2:before{content:'\\F3C6'}.zmdi-sec-10:before{content:'\\F3C7'}.zmdi-sec-3:before{content:'\\F3C8'}.zmdi-zero:before{content:'\\F3C9'}.zmdi-airline-seat-flat-angled:before{content:'\\F3CA'}.zmdi-airline-seat-flat:before{content:'\\F3CB'}.zmdi-airline-seat-individual-suite:before{content:'\\F3CC'}.zmdi-airline-seat-legroom-extra:before{content:'\\F3CD'}.zmdi-airline-seat-legroom-normal:before{content:'\\F3CE'}.zmdi-airline-seat-legroom-reduced:before{content:'\\F3CF'}.zmdi-airline-seat-recline-extra:before{content:'\\F3D0'}.zmdi-airline-seat-recline-normal:before{content:'\\F3D1'}.zmdi-airplay:before{content:'\\F3D2'}.zmdi-closed-caption:before{content:'\\F3D3'}.zmdi-confirmation-number:before{content:'\\F3D4'}.zmdi-developer-board:before{content:'\\F3D5'}.zmdi-disc-full:before{content:'\\F3D6'}.zmdi-explicit:before{content:'\\F3D7'}.zmdi-flight-land:before{content:'\\F3D8'}.zmdi-flight-takeoff:before{content:'\\F3D9'}.zmdi-flip-to-back:before{content:'\\F3DA'}.zmdi-flip-to-front:before{content:'\\F3DB'}.zmdi-group-work:before{content:'\\F3DC'}.zmdi-hd:before{content:'\\F3DD'}.zmdi-hq:before{content:'\\F3DE'}.zmdi-markunread-mailbox:before{content:'\\F3DF'}.zmdi-memory:before{content:'\\F3E0'}.zmdi-nfc:before{content:'\\F3E1'}.zmdi-play-for-work:before{content:'\\F3E2'}.zmdi-power-input:before{content:'\\F3E3'}.zmdi-present-to-all:before{content:'\\F3E4'}.zmdi-satellite:before{content:'\\F3E5'}.zmdi-tap-and-play:before{content:'\\F3E6'}.zmdi-vibration:before{content:'\\F3E7'}.zmdi-voicemail:before{content:'\\F3E8'}.zmdi-group:before{content:'\\F3E9'}.zmdi-rss:before{content:'\\F3EA'}.zmdi-shape:before{content:'\\F3EB'}.zmdi-spinner:before{content:'\\F3EC'}.zmdi-ungroup:before{content:'\\F3ED'}.zmdi-500px:before{content:'\\F3EE'}.zmdi-8tracks:before{content:'\\F3EF'}.zmdi-amazon:before{content:'\\F3F0'}.zmdi-blogger:before{content:'\\F3F1'}.zmdi-delicious:before{content:'\\F3F2'}.zmdi-disqus:before{content:'\\F3F3'}.zmdi-flattr:before{content:'\\F3F4'}.zmdi-flickr:before{content:'\\F3F5'}.zmdi-github-alt:before{content:'\\F3F6'}.zmdi-google-old:before{content:'\\F3F7'}.zmdi-linkedin:before{content:'\\F3F8'}.zmdi-odnoklassniki:before{content:'\\F3F9'}.zmdi-outlook:before{content:'\\F3FA'}.zmdi-paypal-alt:before{content:'\\F3FB'}.zmdi-pinterest:before{content:'\\F3FC'}.zmdi-playstation:before{content:'\\F3FD'}.zmdi-reddit:before{content:'\\F3FE'}.zmdi-skype:before{content:'\\F3FF'}.zmdi-slideshare:before{content:'\\F400'}.zmdi-soundcloud:before{content:'\\F401'}.zmdi-tumblr:before{content:'\\F402'}.zmdi-twitch:before{content:'\\F403'}.zmdi-vimeo:before{content:'\\F404'}.zmdi-whatsapp:before{content:'\\F405'}.zmdi-xbox:before{content:'\\F406'}.zmdi-yahoo:before{content:'\\F407'}.zmdi-youtube-play:before{content:'\\F408'}.zmdi-youtube:before{content:'\\F409'}.zmdi-import-export:before{content:'\\F30C'}.zmdi-swap-vertical-:before{content:'\\F30C'}.zmdi-airplanemode-inactive:before{content:'\\F102'}.zmdi-airplanemode-active:before{content:'\\F103'}.zmdi-rate-review:before{content:'\\F103'}.zmdi-comment-sign:before{content:'\\F25A'}.zmdi-network-warning:before{content:'\\F2AD'}.zmdi-shopping-cart-add:before{content:'\\F1CA'}.zmdi-file-add:before{content:'\\F221'}.zmdi-network-wifi-scan:before{content:'\\F2E4'}.zmdi-collection-add:before{content:'\\F14E'}.zmdi-format-playlist-add:before{content:'\\F3AC'}.zmdi-format-queue-music:before{content:'\\F3AB'}.zmdi-plus-box:before{content:'\\F277'}.zmdi-tag-backspace:before{content:'\\F1D9'}.zmdi-alarm-add:before{content:'\\F32B'}.zmdi-battery-charging:before{content:'\\F114'}.zmdi-daydream-setting:before{content:'\\F217'}.zmdi-more-horiz:before{content:'\\F19C'}.zmdi-book-photo:before{content:'\\F11B'}.zmdi-incandescent:before{content:'\\F189'}.zmdi-wb-iridescent:before{content:'\\F38C'}.zmdi-calendar-remove:before{content:'\\F330'}.zmdi-refresh-sync-disabled:before{content:'\\F1B7'}.zmdi-refresh-sync-problem:before{content:'\\F1B6'}.zmdi-crop-original:before{content:'\\F17E'}.zmdi-power-off:before{content:'\\F1AF'}.zmdi-power-off-setting:before{content:'\\F1AE'}.zmdi-leak-remove:before{content:'\\F38D'}.zmdi-star-border:before{content:'\\F27C'}.zmdi-brightness-low:before{content:'\\F36D'}.zmdi-brightness-medium:before{content:'\\F36E'}.zmdi-brightness-high:before{content:'\\F36F'}.zmdi-smartphone-portrait:before{content:'\\F2D4'}.zmdi-live-tv:before{content:'\\F2D9'}.zmdi-format-textdirection-l-to-r:before{content:'\\F249'}.zmdi-format-textdirection-r-to-l:before{content:'\\F24A'}.zmdi-arrow-back:before{content:'\\F2EA'}.zmdi-arrow-forward:before{content:'\\F2EE'}.zmdi-arrow-in:before{content:'\\F2E9'}.zmdi-arrow-out:before{content:'\\F2ED'}.zmdi-rotate-90-degrees-ccw:before{content:'\\F304'}.zmdi-adb:before{content:'\\F33A'}.zmdi-network-wifi:before{content:'\\F2E8'}.zmdi-network-wifi-alt:before{content:'\\F2E3'}.zmdi-network-wifi-lock:before{content:'\\F2E5'}.zmdi-network-wifi-off:before{content:'\\F2E6'}.zmdi-network-wifi-outline:before{content:'\\F2E7'}.zmdi-network-wifi-info:before{content:'\\F2E4'}.zmdi-layers-clear:before{content:'\\F18B'}.zmdi-colorize:before{content:'\\F15D'}.zmdi-format-paint:before{content:'\\F1BA'}.zmdi-format-quote:before{content:'\\F1B2'}.zmdi-camera-monochrome-photos:before{content:'\\F285'}.zmdi-sort-by-alpha:before{content:'\\F1CF'}.zmdi-folder-shared:before{content:'\\F225'}.zmdi-folder-special:before{content:'\\F226'}.zmdi-comment-dots:before{content:'\\F260'}.zmdi-reorder:before{content:'\\F31E'}.zmdi-dehaze:before{content:'\\F197'}.zmdi-sort:before{content:'\\F1CE'}.zmdi-pages:before{content:'\\F34A'}.zmdi-stack-overflow:before{content:'\\F35C'}.zmdi-calendar-account:before{content:'\\F204'}.zmdi-paste:before{content:'\\F109'}.zmdi-cut:before{content:'\\F1BC'}.zmdi-save:before{content:'\\F297'}.zmdi-smartphone-code:before{content:'\\F139'}.zmdi-directions-bike:before{content:'\\F117'}.zmdi-directions-boat:before{content:'\\F11A'}.zmdi-directions-bus:before{content:'\\F121'}.zmdi-directions-car:before{content:'\\F125'}.zmdi-directions-railway:before{content:'\\F1B3'}.zmdi-directions-run:before{content:'\\F215'}.zmdi-directions-subway:before{content:'\\F1D5'}.zmdi-directions-walk:before{content:'\\F216'}.zmdi-local-hotel:before{content:'\\F178'}.zmdi-local-activity:before{content:'\\F1DF'}.zmdi-local-play:before{content:'\\F1DF'}.zmdi-local-airport:before{content:'\\F103'}.zmdi-local-atm:before{content:'\\F198'}.zmdi-local-bar:before{content:'\\F137'}.zmdi-local-cafe:before{content:'\\F13B'}.zmdi-local-car-wash:before{content:'\\F124'}.zmdi-local-convenience-store:before{content:'\\F1D3'}.zmdi-local-dining:before{content:'\\F153'}.zmdi-local-drink:before{content:'\\F157'}.zmdi-local-florist:before{content:'\\F168'}.zmdi-local-gas-station:before{content:'\\F16F'}.zmdi-local-grocery-store:before{content:'\\F1CB'}.zmdi-local-hospital:before{content:'\\F177'}.zmdi-local-laundry-service:before{content:'\\F1E9'}.zmdi-local-library:before{content:'\\F18D'}.zmdi-local-mall:before{content:'\\F195'}.zmdi-local-movies:before{content:'\\F19D'}.zmdi-local-offer:before{content:'\\F187'}.zmdi-local-parking:before{content:'\\F1A5'}.zmdi-local-parking:before{content:'\\F1A5'}.zmdi-local-pharmacy:before{content:'\\F176'}.zmdi-local-phone:before{content:'\\F2BE'}.zmdi-local-pizza:before{content:'\\F1AC'}.zmdi-local-post-office:before{content:'\\F15A'}.zmdi-local-printshop:before{content:'\\F1B0'}.zmdi-local-see:before{content:'\\F28C'}.zmdi-local-shipping:before{content:'\\F1E6'}.zmdi-local-store:before{content:'\\F1D4'}.zmdi-local-taxi:before{content:'\\F123'}.zmdi-local-wc:before{content:'\\F211'}.zmdi-my-location:before{content:'\\F299'}.zmdi-directions:before{content:'\\F1E7'}", ""]);

// exports


/***/ }),
/* 70 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "dist/assets/a4d31128b633bc0b1cc1f18a34fb3851.woff2";

/***/ }),
/* 71 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "dist/assets/d2a55d331bdd1a7ea97a8a1fbb3c569c.woff";

/***/ }),
/* 72 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "dist/assets/b351bd62abcd96e924d9f44a3da169a7.ttf";

/***/ }),
/* 73 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(10)(undefined);
// imports


// module
exports.push([module.i, "/*!\n *  Font Awesome 4.7.0 by @davegandy - http://fontawesome.io - @fontawesome\n *  License - http://fontawesome.io/license (Font: SIL OFL 1.1, CSS: MIT License)\n */@font-face{font-family:'FontAwesome';src:url(" + __webpack_require__(74) + ");src:url(" + __webpack_require__(75) + "?#iefix&v=4.7.0) format('embedded-opentype'),url(" + __webpack_require__(76) + ") format('woff2'),url(" + __webpack_require__(77) + ") format('woff'),url(" + __webpack_require__(78) + ") format('truetype'),url(" + __webpack_require__(79) + "#fontawesomeregular) format('svg');font-weight:normal;font-style:normal}.fa{display:inline-block;font:normal normal normal 14px/1 FontAwesome;font-size:inherit;text-rendering:auto;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}.fa-lg{font-size:1.33333333em;line-height:.75em;vertical-align:-15%}.fa-2x{font-size:2em}.fa-3x{font-size:3em}.fa-4x{font-size:4em}.fa-5x{font-size:5em}.fa-fw{width:1.28571429em;text-align:center}.fa-ul{padding-left:0;margin-left:2.14285714em;list-style-type:none}.fa-ul>li{position:relative}.fa-li{position:absolute;left:-2.14285714em;width:2.14285714em;top:.14285714em;text-align:center}.fa-li.fa-lg{left:-1.85714286em}.fa-border{padding:.2em .25em .15em;border:solid .08em #eee;border-radius:.1em}.fa-pull-left{float:left}.fa-pull-right{float:right}.fa.fa-pull-left{margin-right:.3em}.fa.fa-pull-right{margin-left:.3em}.pull-right{float:right}.pull-left{float:left}.fa.pull-left{margin-right:.3em}.fa.pull-right{margin-left:.3em}.fa-spin{-webkit-animation:fa-spin 2s infinite linear;animation:fa-spin 2s infinite linear}.fa-pulse{-webkit-animation:fa-spin 1s infinite steps(8);animation:fa-spin 1s infinite steps(8)}@-webkit-keyframes fa-spin{0%{-webkit-transform:rotate(0deg);transform:rotate(0deg)}100%{-webkit-transform:rotate(359deg);transform:rotate(359deg)}}@keyframes fa-spin{0%{-webkit-transform:rotate(0deg);transform:rotate(0deg)}100%{-webkit-transform:rotate(359deg);transform:rotate(359deg)}}.fa-rotate-90{-ms-filter:\"progid:DXImageTransform.Microsoft.BasicImage(rotation=1)\";-webkit-transform:rotate(90deg);-ms-transform:rotate(90deg);transform:rotate(90deg)}.fa-rotate-180{-ms-filter:\"progid:DXImageTransform.Microsoft.BasicImage(rotation=2)\";-webkit-transform:rotate(180deg);-ms-transform:rotate(180deg);transform:rotate(180deg)}.fa-rotate-270{-ms-filter:\"progid:DXImageTransform.Microsoft.BasicImage(rotation=3)\";-webkit-transform:rotate(270deg);-ms-transform:rotate(270deg);transform:rotate(270deg)}.fa-flip-horizontal{-ms-filter:\"progid:DXImageTransform.Microsoft.BasicImage(rotation=0, mirror=1)\";-webkit-transform:scale(-1, 1);-ms-transform:scale(-1, 1);transform:scale(-1, 1)}.fa-flip-vertical{-ms-filter:\"progid:DXImageTransform.Microsoft.BasicImage(rotation=2, mirror=1)\";-webkit-transform:scale(1, -1);-ms-transform:scale(1, -1);transform:scale(1, -1)}:root .fa-rotate-90,:root .fa-rotate-180,:root .fa-rotate-270,:root .fa-flip-horizontal,:root .fa-flip-vertical{filter:none}.fa-stack{position:relative;display:inline-block;width:2em;height:2em;line-height:2em;vertical-align:middle}.fa-stack-1x,.fa-stack-2x{position:absolute;left:0;width:100%;text-align:center}.fa-stack-1x{line-height:inherit}.fa-stack-2x{font-size:2em}.fa-inverse{color:#fff}.fa-glass:before{content:\"\\F000\"}.fa-music:before{content:\"\\F001\"}.fa-search:before{content:\"\\F002\"}.fa-envelope-o:before{content:\"\\F003\"}.fa-heart:before{content:\"\\F004\"}.fa-star:before{content:\"\\F005\"}.fa-star-o:before{content:\"\\F006\"}.fa-user:before{content:\"\\F007\"}.fa-film:before{content:\"\\F008\"}.fa-th-large:before{content:\"\\F009\"}.fa-th:before{content:\"\\F00A\"}.fa-th-list:before{content:\"\\F00B\"}.fa-check:before{content:\"\\F00C\"}.fa-remove:before,.fa-close:before,.fa-times:before{content:\"\\F00D\"}.fa-search-plus:before{content:\"\\F00E\"}.fa-search-minus:before{content:\"\\F010\"}.fa-power-off:before{content:\"\\F011\"}.fa-signal:before{content:\"\\F012\"}.fa-gear:before,.fa-cog:before{content:\"\\F013\"}.fa-trash-o:before{content:\"\\F014\"}.fa-home:before{content:\"\\F015\"}.fa-file-o:before{content:\"\\F016\"}.fa-clock-o:before{content:\"\\F017\"}.fa-road:before{content:\"\\F018\"}.fa-download:before{content:\"\\F019\"}.fa-arrow-circle-o-down:before{content:\"\\F01A\"}.fa-arrow-circle-o-up:before{content:\"\\F01B\"}.fa-inbox:before{content:\"\\F01C\"}.fa-play-circle-o:before{content:\"\\F01D\"}.fa-rotate-right:before,.fa-repeat:before{content:\"\\F01E\"}.fa-refresh:before{content:\"\\F021\"}.fa-list-alt:before{content:\"\\F022\"}.fa-lock:before{content:\"\\F023\"}.fa-flag:before{content:\"\\F024\"}.fa-headphones:before{content:\"\\F025\"}.fa-volume-off:before{content:\"\\F026\"}.fa-volume-down:before{content:\"\\F027\"}.fa-volume-up:before{content:\"\\F028\"}.fa-qrcode:before{content:\"\\F029\"}.fa-barcode:before{content:\"\\F02A\"}.fa-tag:before{content:\"\\F02B\"}.fa-tags:before{content:\"\\F02C\"}.fa-book:before{content:\"\\F02D\"}.fa-bookmark:before{content:\"\\F02E\"}.fa-print:before{content:\"\\F02F\"}.fa-camera:before{content:\"\\F030\"}.fa-font:before{content:\"\\F031\"}.fa-bold:before{content:\"\\F032\"}.fa-italic:before{content:\"\\F033\"}.fa-text-height:before{content:\"\\F034\"}.fa-text-width:before{content:\"\\F035\"}.fa-align-left:before{content:\"\\F036\"}.fa-align-center:before{content:\"\\F037\"}.fa-align-right:before{content:\"\\F038\"}.fa-align-justify:before{content:\"\\F039\"}.fa-list:before{content:\"\\F03A\"}.fa-dedent:before,.fa-outdent:before{content:\"\\F03B\"}.fa-indent:before{content:\"\\F03C\"}.fa-video-camera:before{content:\"\\F03D\"}.fa-photo:before,.fa-image:before,.fa-picture-o:before{content:\"\\F03E\"}.fa-pencil:before{content:\"\\F040\"}.fa-map-marker:before{content:\"\\F041\"}.fa-adjust:before{content:\"\\F042\"}.fa-tint:before{content:\"\\F043\"}.fa-edit:before,.fa-pencil-square-o:before{content:\"\\F044\"}.fa-share-square-o:before{content:\"\\F045\"}.fa-check-square-o:before{content:\"\\F046\"}.fa-arrows:before{content:\"\\F047\"}.fa-step-backward:before{content:\"\\F048\"}.fa-fast-backward:before{content:\"\\F049\"}.fa-backward:before{content:\"\\F04A\"}.fa-play:before{content:\"\\F04B\"}.fa-pause:before{content:\"\\F04C\"}.fa-stop:before{content:\"\\F04D\"}.fa-forward:before{content:\"\\F04E\"}.fa-fast-forward:before{content:\"\\F050\"}.fa-step-forward:before{content:\"\\F051\"}.fa-eject:before{content:\"\\F052\"}.fa-chevron-left:before{content:\"\\F053\"}.fa-chevron-right:before{content:\"\\F054\"}.fa-plus-circle:before{content:\"\\F055\"}.fa-minus-circle:before{content:\"\\F056\"}.fa-times-circle:before{content:\"\\F057\"}.fa-check-circle:before{content:\"\\F058\"}.fa-question-circle:before{content:\"\\F059\"}.fa-info-circle:before{content:\"\\F05A\"}.fa-crosshairs:before{content:\"\\F05B\"}.fa-times-circle-o:before{content:\"\\F05C\"}.fa-check-circle-o:before{content:\"\\F05D\"}.fa-ban:before{content:\"\\F05E\"}.fa-arrow-left:before{content:\"\\F060\"}.fa-arrow-right:before{content:\"\\F061\"}.fa-arrow-up:before{content:\"\\F062\"}.fa-arrow-down:before{content:\"\\F063\"}.fa-mail-forward:before,.fa-share:before{content:\"\\F064\"}.fa-expand:before{content:\"\\F065\"}.fa-compress:before{content:\"\\F066\"}.fa-plus:before{content:\"\\F067\"}.fa-minus:before{content:\"\\F068\"}.fa-asterisk:before{content:\"\\F069\"}.fa-exclamation-circle:before{content:\"\\F06A\"}.fa-gift:before{content:\"\\F06B\"}.fa-leaf:before{content:\"\\F06C\"}.fa-fire:before{content:\"\\F06D\"}.fa-eye:before{content:\"\\F06E\"}.fa-eye-slash:before{content:\"\\F070\"}.fa-warning:before,.fa-exclamation-triangle:before{content:\"\\F071\"}.fa-plane:before{content:\"\\F072\"}.fa-calendar:before{content:\"\\F073\"}.fa-random:before{content:\"\\F074\"}.fa-comment:before{content:\"\\F075\"}.fa-magnet:before{content:\"\\F076\"}.fa-chevron-up:before{content:\"\\F077\"}.fa-chevron-down:before{content:\"\\F078\"}.fa-retweet:before{content:\"\\F079\"}.fa-shopping-cart:before{content:\"\\F07A\"}.fa-folder:before{content:\"\\F07B\"}.fa-folder-open:before{content:\"\\F07C\"}.fa-arrows-v:before{content:\"\\F07D\"}.fa-arrows-h:before{content:\"\\F07E\"}.fa-bar-chart-o:before,.fa-bar-chart:before{content:\"\\F080\"}.fa-twitter-square:before{content:\"\\F081\"}.fa-facebook-square:before{content:\"\\F082\"}.fa-camera-retro:before{content:\"\\F083\"}.fa-key:before{content:\"\\F084\"}.fa-gears:before,.fa-cogs:before{content:\"\\F085\"}.fa-comments:before{content:\"\\F086\"}.fa-thumbs-o-up:before{content:\"\\F087\"}.fa-thumbs-o-down:before{content:\"\\F088\"}.fa-star-half:before{content:\"\\F089\"}.fa-heart-o:before{content:\"\\F08A\"}.fa-sign-out:before{content:\"\\F08B\"}.fa-linkedin-square:before{content:\"\\F08C\"}.fa-thumb-tack:before{content:\"\\F08D\"}.fa-external-link:before{content:\"\\F08E\"}.fa-sign-in:before{content:\"\\F090\"}.fa-trophy:before{content:\"\\F091\"}.fa-github-square:before{content:\"\\F092\"}.fa-upload:before{content:\"\\F093\"}.fa-lemon-o:before{content:\"\\F094\"}.fa-phone:before{content:\"\\F095\"}.fa-square-o:before{content:\"\\F096\"}.fa-bookmark-o:before{content:\"\\F097\"}.fa-phone-square:before{content:\"\\F098\"}.fa-twitter:before{content:\"\\F099\"}.fa-facebook-f:before,.fa-facebook:before{content:\"\\F09A\"}.fa-github:before{content:\"\\F09B\"}.fa-unlock:before{content:\"\\F09C\"}.fa-credit-card:before{content:\"\\F09D\"}.fa-feed:before,.fa-rss:before{content:\"\\F09E\"}.fa-hdd-o:before{content:\"\\F0A0\"}.fa-bullhorn:before{content:\"\\F0A1\"}.fa-bell:before{content:\"\\F0F3\"}.fa-certificate:before{content:\"\\F0A3\"}.fa-hand-o-right:before{content:\"\\F0A4\"}.fa-hand-o-left:before{content:\"\\F0A5\"}.fa-hand-o-up:before{content:\"\\F0A6\"}.fa-hand-o-down:before{content:\"\\F0A7\"}.fa-arrow-circle-left:before{content:\"\\F0A8\"}.fa-arrow-circle-right:before{content:\"\\F0A9\"}.fa-arrow-circle-up:before{content:\"\\F0AA\"}.fa-arrow-circle-down:before{content:\"\\F0AB\"}.fa-globe:before{content:\"\\F0AC\"}.fa-wrench:before{content:\"\\F0AD\"}.fa-tasks:before{content:\"\\F0AE\"}.fa-filter:before{content:\"\\F0B0\"}.fa-briefcase:before{content:\"\\F0B1\"}.fa-arrows-alt:before{content:\"\\F0B2\"}.fa-group:before,.fa-users:before{content:\"\\F0C0\"}.fa-chain:before,.fa-link:before{content:\"\\F0C1\"}.fa-cloud:before{content:\"\\F0C2\"}.fa-flask:before{content:\"\\F0C3\"}.fa-cut:before,.fa-scissors:before{content:\"\\F0C4\"}.fa-copy:before,.fa-files-o:before{content:\"\\F0C5\"}.fa-paperclip:before{content:\"\\F0C6\"}.fa-save:before,.fa-floppy-o:before{content:\"\\F0C7\"}.fa-square:before{content:\"\\F0C8\"}.fa-navicon:before,.fa-reorder:before,.fa-bars:before{content:\"\\F0C9\"}.fa-list-ul:before{content:\"\\F0CA\"}.fa-list-ol:before{content:\"\\F0CB\"}.fa-strikethrough:before{content:\"\\F0CC\"}.fa-underline:before{content:\"\\F0CD\"}.fa-table:before{content:\"\\F0CE\"}.fa-magic:before{content:\"\\F0D0\"}.fa-truck:before{content:\"\\F0D1\"}.fa-pinterest:before{content:\"\\F0D2\"}.fa-pinterest-square:before{content:\"\\F0D3\"}.fa-google-plus-square:before{content:\"\\F0D4\"}.fa-google-plus:before{content:\"\\F0D5\"}.fa-money:before{content:\"\\F0D6\"}.fa-caret-down:before{content:\"\\F0D7\"}.fa-caret-up:before{content:\"\\F0D8\"}.fa-caret-left:before{content:\"\\F0D9\"}.fa-caret-right:before{content:\"\\F0DA\"}.fa-columns:before{content:\"\\F0DB\"}.fa-unsorted:before,.fa-sort:before{content:\"\\F0DC\"}.fa-sort-down:before,.fa-sort-desc:before{content:\"\\F0DD\"}.fa-sort-up:before,.fa-sort-asc:before{content:\"\\F0DE\"}.fa-envelope:before{content:\"\\F0E0\"}.fa-linkedin:before{content:\"\\F0E1\"}.fa-rotate-left:before,.fa-undo:before{content:\"\\F0E2\"}.fa-legal:before,.fa-gavel:before{content:\"\\F0E3\"}.fa-dashboard:before,.fa-tachometer:before{content:\"\\F0E4\"}.fa-comment-o:before{content:\"\\F0E5\"}.fa-comments-o:before{content:\"\\F0E6\"}.fa-flash:before,.fa-bolt:before{content:\"\\F0E7\"}.fa-sitemap:before{content:\"\\F0E8\"}.fa-umbrella:before{content:\"\\F0E9\"}.fa-paste:before,.fa-clipboard:before{content:\"\\F0EA\"}.fa-lightbulb-o:before{content:\"\\F0EB\"}.fa-exchange:before{content:\"\\F0EC\"}.fa-cloud-download:before{content:\"\\F0ED\"}.fa-cloud-upload:before{content:\"\\F0EE\"}.fa-user-md:before{content:\"\\F0F0\"}.fa-stethoscope:before{content:\"\\F0F1\"}.fa-suitcase:before{content:\"\\F0F2\"}.fa-bell-o:before{content:\"\\F0A2\"}.fa-coffee:before{content:\"\\F0F4\"}.fa-cutlery:before{content:\"\\F0F5\"}.fa-file-text-o:before{content:\"\\F0F6\"}.fa-building-o:before{content:\"\\F0F7\"}.fa-hospital-o:before{content:\"\\F0F8\"}.fa-ambulance:before{content:\"\\F0F9\"}.fa-medkit:before{content:\"\\F0FA\"}.fa-fighter-jet:before{content:\"\\F0FB\"}.fa-beer:before{content:\"\\F0FC\"}.fa-h-square:before{content:\"\\F0FD\"}.fa-plus-square:before{content:\"\\F0FE\"}.fa-angle-double-left:before{content:\"\\F100\"}.fa-angle-double-right:before{content:\"\\F101\"}.fa-angle-double-up:before{content:\"\\F102\"}.fa-angle-double-down:before{content:\"\\F103\"}.fa-angle-left:before{content:\"\\F104\"}.fa-angle-right:before{content:\"\\F105\"}.fa-angle-up:before{content:\"\\F106\"}.fa-angle-down:before{content:\"\\F107\"}.fa-desktop:before{content:\"\\F108\"}.fa-laptop:before{content:\"\\F109\"}.fa-tablet:before{content:\"\\F10A\"}.fa-mobile-phone:before,.fa-mobile:before{content:\"\\F10B\"}.fa-circle-o:before{content:\"\\F10C\"}.fa-quote-left:before{content:\"\\F10D\"}.fa-quote-right:before{content:\"\\F10E\"}.fa-spinner:before{content:\"\\F110\"}.fa-circle:before{content:\"\\F111\"}.fa-mail-reply:before,.fa-reply:before{content:\"\\F112\"}.fa-github-alt:before{content:\"\\F113\"}.fa-folder-o:before{content:\"\\F114\"}.fa-folder-open-o:before{content:\"\\F115\"}.fa-smile-o:before{content:\"\\F118\"}.fa-frown-o:before{content:\"\\F119\"}.fa-meh-o:before{content:\"\\F11A\"}.fa-gamepad:before{content:\"\\F11B\"}.fa-keyboard-o:before{content:\"\\F11C\"}.fa-flag-o:before{content:\"\\F11D\"}.fa-flag-checkered:before{content:\"\\F11E\"}.fa-terminal:before{content:\"\\F120\"}.fa-code:before{content:\"\\F121\"}.fa-mail-reply-all:before,.fa-reply-all:before{content:\"\\F122\"}.fa-star-half-empty:before,.fa-star-half-full:before,.fa-star-half-o:before{content:\"\\F123\"}.fa-location-arrow:before{content:\"\\F124\"}.fa-crop:before{content:\"\\F125\"}.fa-code-fork:before{content:\"\\F126\"}.fa-unlink:before,.fa-chain-broken:before{content:\"\\F127\"}.fa-question:before{content:\"\\F128\"}.fa-info:before{content:\"\\F129\"}.fa-exclamation:before{content:\"\\F12A\"}.fa-superscript:before{content:\"\\F12B\"}.fa-subscript:before{content:\"\\F12C\"}.fa-eraser:before{content:\"\\F12D\"}.fa-puzzle-piece:before{content:\"\\F12E\"}.fa-microphone:before{content:\"\\F130\"}.fa-microphone-slash:before{content:\"\\F131\"}.fa-shield:before{content:\"\\F132\"}.fa-calendar-o:before{content:\"\\F133\"}.fa-fire-extinguisher:before{content:\"\\F134\"}.fa-rocket:before{content:\"\\F135\"}.fa-maxcdn:before{content:\"\\F136\"}.fa-chevron-circle-left:before{content:\"\\F137\"}.fa-chevron-circle-right:before{content:\"\\F138\"}.fa-chevron-circle-up:before{content:\"\\F139\"}.fa-chevron-circle-down:before{content:\"\\F13A\"}.fa-html5:before{content:\"\\F13B\"}.fa-css3:before{content:\"\\F13C\"}.fa-anchor:before{content:\"\\F13D\"}.fa-unlock-alt:before{content:\"\\F13E\"}.fa-bullseye:before{content:\"\\F140\"}.fa-ellipsis-h:before{content:\"\\F141\"}.fa-ellipsis-v:before{content:\"\\F142\"}.fa-rss-square:before{content:\"\\F143\"}.fa-play-circle:before{content:\"\\F144\"}.fa-ticket:before{content:\"\\F145\"}.fa-minus-square:before{content:\"\\F146\"}.fa-minus-square-o:before{content:\"\\F147\"}.fa-level-up:before{content:\"\\F148\"}.fa-level-down:before{content:\"\\F149\"}.fa-check-square:before{content:\"\\F14A\"}.fa-pencil-square:before{content:\"\\F14B\"}.fa-external-link-square:before{content:\"\\F14C\"}.fa-share-square:before{content:\"\\F14D\"}.fa-compass:before{content:\"\\F14E\"}.fa-toggle-down:before,.fa-caret-square-o-down:before{content:\"\\F150\"}.fa-toggle-up:before,.fa-caret-square-o-up:before{content:\"\\F151\"}.fa-toggle-right:before,.fa-caret-square-o-right:before{content:\"\\F152\"}.fa-euro:before,.fa-eur:before{content:\"\\F153\"}.fa-gbp:before{content:\"\\F154\"}.fa-dollar:before,.fa-usd:before{content:\"\\F155\"}.fa-rupee:before,.fa-inr:before{content:\"\\F156\"}.fa-cny:before,.fa-rmb:before,.fa-yen:before,.fa-jpy:before{content:\"\\F157\"}.fa-ruble:before,.fa-rouble:before,.fa-rub:before{content:\"\\F158\"}.fa-won:before,.fa-krw:before{content:\"\\F159\"}.fa-bitcoin:before,.fa-btc:before{content:\"\\F15A\"}.fa-file:before{content:\"\\F15B\"}.fa-file-text:before{content:\"\\F15C\"}.fa-sort-alpha-asc:before{content:\"\\F15D\"}.fa-sort-alpha-desc:before{content:\"\\F15E\"}.fa-sort-amount-asc:before{content:\"\\F160\"}.fa-sort-amount-desc:before{content:\"\\F161\"}.fa-sort-numeric-asc:before{content:\"\\F162\"}.fa-sort-numeric-desc:before{content:\"\\F163\"}.fa-thumbs-up:before{content:\"\\F164\"}.fa-thumbs-down:before{content:\"\\F165\"}.fa-youtube-square:before{content:\"\\F166\"}.fa-youtube:before{content:\"\\F167\"}.fa-xing:before{content:\"\\F168\"}.fa-xing-square:before{content:\"\\F169\"}.fa-youtube-play:before{content:\"\\F16A\"}.fa-dropbox:before{content:\"\\F16B\"}.fa-stack-overflow:before{content:\"\\F16C\"}.fa-instagram:before{content:\"\\F16D\"}.fa-flickr:before{content:\"\\F16E\"}.fa-adn:before{content:\"\\F170\"}.fa-bitbucket:before{content:\"\\F171\"}.fa-bitbucket-square:before{content:\"\\F172\"}.fa-tumblr:before{content:\"\\F173\"}.fa-tumblr-square:before{content:\"\\F174\"}.fa-long-arrow-down:before{content:\"\\F175\"}.fa-long-arrow-up:before{content:\"\\F176\"}.fa-long-arrow-left:before{content:\"\\F177\"}.fa-long-arrow-right:before{content:\"\\F178\"}.fa-apple:before{content:\"\\F179\"}.fa-windows:before{content:\"\\F17A\"}.fa-android:before{content:\"\\F17B\"}.fa-linux:before{content:\"\\F17C\"}.fa-dribbble:before{content:\"\\F17D\"}.fa-skype:before{content:\"\\F17E\"}.fa-foursquare:before{content:\"\\F180\"}.fa-trello:before{content:\"\\F181\"}.fa-female:before{content:\"\\F182\"}.fa-male:before{content:\"\\F183\"}.fa-gittip:before,.fa-gratipay:before{content:\"\\F184\"}.fa-sun-o:before{content:\"\\F185\"}.fa-moon-o:before{content:\"\\F186\"}.fa-archive:before{content:\"\\F187\"}.fa-bug:before{content:\"\\F188\"}.fa-vk:before{content:\"\\F189\"}.fa-weibo:before{content:\"\\F18A\"}.fa-renren:before{content:\"\\F18B\"}.fa-pagelines:before{content:\"\\F18C\"}.fa-stack-exchange:before{content:\"\\F18D\"}.fa-arrow-circle-o-right:before{content:\"\\F18E\"}.fa-arrow-circle-o-left:before{content:\"\\F190\"}.fa-toggle-left:before,.fa-caret-square-o-left:before{content:\"\\F191\"}.fa-dot-circle-o:before{content:\"\\F192\"}.fa-wheelchair:before{content:\"\\F193\"}.fa-vimeo-square:before{content:\"\\F194\"}.fa-turkish-lira:before,.fa-try:before{content:\"\\F195\"}.fa-plus-square-o:before{content:\"\\F196\"}.fa-space-shuttle:before{content:\"\\F197\"}.fa-slack:before{content:\"\\F198\"}.fa-envelope-square:before{content:\"\\F199\"}.fa-wordpress:before{content:\"\\F19A\"}.fa-openid:before{content:\"\\F19B\"}.fa-institution:before,.fa-bank:before,.fa-university:before{content:\"\\F19C\"}.fa-mortar-board:before,.fa-graduation-cap:before{content:\"\\F19D\"}.fa-yahoo:before{content:\"\\F19E\"}.fa-google:before{content:\"\\F1A0\"}.fa-reddit:before{content:\"\\F1A1\"}.fa-reddit-square:before{content:\"\\F1A2\"}.fa-stumbleupon-circle:before{content:\"\\F1A3\"}.fa-stumbleupon:before{content:\"\\F1A4\"}.fa-delicious:before{content:\"\\F1A5\"}.fa-digg:before{content:\"\\F1A6\"}.fa-pied-piper-pp:before{content:\"\\F1A7\"}.fa-pied-piper-alt:before{content:\"\\F1A8\"}.fa-drupal:before{content:\"\\F1A9\"}.fa-joomla:before{content:\"\\F1AA\"}.fa-language:before{content:\"\\F1AB\"}.fa-fax:before{content:\"\\F1AC\"}.fa-building:before{content:\"\\F1AD\"}.fa-child:before{content:\"\\F1AE\"}.fa-paw:before{content:\"\\F1B0\"}.fa-spoon:before{content:\"\\F1B1\"}.fa-cube:before{content:\"\\F1B2\"}.fa-cubes:before{content:\"\\F1B3\"}.fa-behance:before{content:\"\\F1B4\"}.fa-behance-square:before{content:\"\\F1B5\"}.fa-steam:before{content:\"\\F1B6\"}.fa-steam-square:before{content:\"\\F1B7\"}.fa-recycle:before{content:\"\\F1B8\"}.fa-automobile:before,.fa-car:before{content:\"\\F1B9\"}.fa-cab:before,.fa-taxi:before{content:\"\\F1BA\"}.fa-tree:before{content:\"\\F1BB\"}.fa-spotify:before{content:\"\\F1BC\"}.fa-deviantart:before{content:\"\\F1BD\"}.fa-soundcloud:before{content:\"\\F1BE\"}.fa-database:before{content:\"\\F1C0\"}.fa-file-pdf-o:before{content:\"\\F1C1\"}.fa-file-word-o:before{content:\"\\F1C2\"}.fa-file-excel-o:before{content:\"\\F1C3\"}.fa-file-powerpoint-o:before{content:\"\\F1C4\"}.fa-file-photo-o:before,.fa-file-picture-o:before,.fa-file-image-o:before{content:\"\\F1C5\"}.fa-file-zip-o:before,.fa-file-archive-o:before{content:\"\\F1C6\"}.fa-file-sound-o:before,.fa-file-audio-o:before{content:\"\\F1C7\"}.fa-file-movie-o:before,.fa-file-video-o:before{content:\"\\F1C8\"}.fa-file-code-o:before{content:\"\\F1C9\"}.fa-vine:before{content:\"\\F1CA\"}.fa-codepen:before{content:\"\\F1CB\"}.fa-jsfiddle:before{content:\"\\F1CC\"}.fa-life-bouy:before,.fa-life-buoy:before,.fa-life-saver:before,.fa-support:before,.fa-life-ring:before{content:\"\\F1CD\"}.fa-circle-o-notch:before{content:\"\\F1CE\"}.fa-ra:before,.fa-resistance:before,.fa-rebel:before{content:\"\\F1D0\"}.fa-ge:before,.fa-empire:before{content:\"\\F1D1\"}.fa-git-square:before{content:\"\\F1D2\"}.fa-git:before{content:\"\\F1D3\"}.fa-y-combinator-square:before,.fa-yc-square:before,.fa-hacker-news:before{content:\"\\F1D4\"}.fa-tencent-weibo:before{content:\"\\F1D5\"}.fa-qq:before{content:\"\\F1D6\"}.fa-wechat:before,.fa-weixin:before{content:\"\\F1D7\"}.fa-send:before,.fa-paper-plane:before{content:\"\\F1D8\"}.fa-send-o:before,.fa-paper-plane-o:before{content:\"\\F1D9\"}.fa-history:before{content:\"\\F1DA\"}.fa-circle-thin:before{content:\"\\F1DB\"}.fa-header:before{content:\"\\F1DC\"}.fa-paragraph:before{content:\"\\F1DD\"}.fa-sliders:before{content:\"\\F1DE\"}.fa-share-alt:before{content:\"\\F1E0\"}.fa-share-alt-square:before{content:\"\\F1E1\"}.fa-bomb:before{content:\"\\F1E2\"}.fa-soccer-ball-o:before,.fa-futbol-o:before{content:\"\\F1E3\"}.fa-tty:before{content:\"\\F1E4\"}.fa-binoculars:before{content:\"\\F1E5\"}.fa-plug:before{content:\"\\F1E6\"}.fa-slideshare:before{content:\"\\F1E7\"}.fa-twitch:before{content:\"\\F1E8\"}.fa-yelp:before{content:\"\\F1E9\"}.fa-newspaper-o:before{content:\"\\F1EA\"}.fa-wifi:before{content:\"\\F1EB\"}.fa-calculator:before{content:\"\\F1EC\"}.fa-paypal:before{content:\"\\F1ED\"}.fa-google-wallet:before{content:\"\\F1EE\"}.fa-cc-visa:before{content:\"\\F1F0\"}.fa-cc-mastercard:before{content:\"\\F1F1\"}.fa-cc-discover:before{content:\"\\F1F2\"}.fa-cc-amex:before{content:\"\\F1F3\"}.fa-cc-paypal:before{content:\"\\F1F4\"}.fa-cc-stripe:before{content:\"\\F1F5\"}.fa-bell-slash:before{content:\"\\F1F6\"}.fa-bell-slash-o:before{content:\"\\F1F7\"}.fa-trash:before{content:\"\\F1F8\"}.fa-copyright:before{content:\"\\F1F9\"}.fa-at:before{content:\"\\F1FA\"}.fa-eyedropper:before{content:\"\\F1FB\"}.fa-paint-brush:before{content:\"\\F1FC\"}.fa-birthday-cake:before{content:\"\\F1FD\"}.fa-area-chart:before{content:\"\\F1FE\"}.fa-pie-chart:before{content:\"\\F200\"}.fa-line-chart:before{content:\"\\F201\"}.fa-lastfm:before{content:\"\\F202\"}.fa-lastfm-square:before{content:\"\\F203\"}.fa-toggle-off:before{content:\"\\F204\"}.fa-toggle-on:before{content:\"\\F205\"}.fa-bicycle:before{content:\"\\F206\"}.fa-bus:before{content:\"\\F207\"}.fa-ioxhost:before{content:\"\\F208\"}.fa-angellist:before{content:\"\\F209\"}.fa-cc:before{content:\"\\F20A\"}.fa-shekel:before,.fa-sheqel:before,.fa-ils:before{content:\"\\F20B\"}.fa-meanpath:before{content:\"\\F20C\"}.fa-buysellads:before{content:\"\\F20D\"}.fa-connectdevelop:before{content:\"\\F20E\"}.fa-dashcube:before{content:\"\\F210\"}.fa-forumbee:before{content:\"\\F211\"}.fa-leanpub:before{content:\"\\F212\"}.fa-sellsy:before{content:\"\\F213\"}.fa-shirtsinbulk:before{content:\"\\F214\"}.fa-simplybuilt:before{content:\"\\F215\"}.fa-skyatlas:before{content:\"\\F216\"}.fa-cart-plus:before{content:\"\\F217\"}.fa-cart-arrow-down:before{content:\"\\F218\"}.fa-diamond:before{content:\"\\F219\"}.fa-ship:before{content:\"\\F21A\"}.fa-user-secret:before{content:\"\\F21B\"}.fa-motorcycle:before{content:\"\\F21C\"}.fa-street-view:before{content:\"\\F21D\"}.fa-heartbeat:before{content:\"\\F21E\"}.fa-venus:before{content:\"\\F221\"}.fa-mars:before{content:\"\\F222\"}.fa-mercury:before{content:\"\\F223\"}.fa-intersex:before,.fa-transgender:before{content:\"\\F224\"}.fa-transgender-alt:before{content:\"\\F225\"}.fa-venus-double:before{content:\"\\F226\"}.fa-mars-double:before{content:\"\\F227\"}.fa-venus-mars:before{content:\"\\F228\"}.fa-mars-stroke:before{content:\"\\F229\"}.fa-mars-stroke-v:before{content:\"\\F22A\"}.fa-mars-stroke-h:before{content:\"\\F22B\"}.fa-neuter:before{content:\"\\F22C\"}.fa-genderless:before{content:\"\\F22D\"}.fa-facebook-official:before{content:\"\\F230\"}.fa-pinterest-p:before{content:\"\\F231\"}.fa-whatsapp:before{content:\"\\F232\"}.fa-server:before{content:\"\\F233\"}.fa-user-plus:before{content:\"\\F234\"}.fa-user-times:before{content:\"\\F235\"}.fa-hotel:before,.fa-bed:before{content:\"\\F236\"}.fa-viacoin:before{content:\"\\F237\"}.fa-train:before{content:\"\\F238\"}.fa-subway:before{content:\"\\F239\"}.fa-medium:before{content:\"\\F23A\"}.fa-yc:before,.fa-y-combinator:before{content:\"\\F23B\"}.fa-optin-monster:before{content:\"\\F23C\"}.fa-opencart:before{content:\"\\F23D\"}.fa-expeditedssl:before{content:\"\\F23E\"}.fa-battery-4:before,.fa-battery:before,.fa-battery-full:before{content:\"\\F240\"}.fa-battery-3:before,.fa-battery-three-quarters:before{content:\"\\F241\"}.fa-battery-2:before,.fa-battery-half:before{content:\"\\F242\"}.fa-battery-1:before,.fa-battery-quarter:before{content:\"\\F243\"}.fa-battery-0:before,.fa-battery-empty:before{content:\"\\F244\"}.fa-mouse-pointer:before{content:\"\\F245\"}.fa-i-cursor:before{content:\"\\F246\"}.fa-object-group:before{content:\"\\F247\"}.fa-object-ungroup:before{content:\"\\F248\"}.fa-sticky-note:before{content:\"\\F249\"}.fa-sticky-note-o:before{content:\"\\F24A\"}.fa-cc-jcb:before{content:\"\\F24B\"}.fa-cc-diners-club:before{content:\"\\F24C\"}.fa-clone:before{content:\"\\F24D\"}.fa-balance-scale:before{content:\"\\F24E\"}.fa-hourglass-o:before{content:\"\\F250\"}.fa-hourglass-1:before,.fa-hourglass-start:before{content:\"\\F251\"}.fa-hourglass-2:before,.fa-hourglass-half:before{content:\"\\F252\"}.fa-hourglass-3:before,.fa-hourglass-end:before{content:\"\\F253\"}.fa-hourglass:before{content:\"\\F254\"}.fa-hand-grab-o:before,.fa-hand-rock-o:before{content:\"\\F255\"}.fa-hand-stop-o:before,.fa-hand-paper-o:before{content:\"\\F256\"}.fa-hand-scissors-o:before{content:\"\\F257\"}.fa-hand-lizard-o:before{content:\"\\F258\"}.fa-hand-spock-o:before{content:\"\\F259\"}.fa-hand-pointer-o:before{content:\"\\F25A\"}.fa-hand-peace-o:before{content:\"\\F25B\"}.fa-trademark:before{content:\"\\F25C\"}.fa-registered:before{content:\"\\F25D\"}.fa-creative-commons:before{content:\"\\F25E\"}.fa-gg:before{content:\"\\F260\"}.fa-gg-circle:before{content:\"\\F261\"}.fa-tripadvisor:before{content:\"\\F262\"}.fa-odnoklassniki:before{content:\"\\F263\"}.fa-odnoklassniki-square:before{content:\"\\F264\"}.fa-get-pocket:before{content:\"\\F265\"}.fa-wikipedia-w:before{content:\"\\F266\"}.fa-safari:before{content:\"\\F267\"}.fa-chrome:before{content:\"\\F268\"}.fa-firefox:before{content:\"\\F269\"}.fa-opera:before{content:\"\\F26A\"}.fa-internet-explorer:before{content:\"\\F26B\"}.fa-tv:before,.fa-television:before{content:\"\\F26C\"}.fa-contao:before{content:\"\\F26D\"}.fa-500px:before{content:\"\\F26E\"}.fa-amazon:before{content:\"\\F270\"}.fa-calendar-plus-o:before{content:\"\\F271\"}.fa-calendar-minus-o:before{content:\"\\F272\"}.fa-calendar-times-o:before{content:\"\\F273\"}.fa-calendar-check-o:before{content:\"\\F274\"}.fa-industry:before{content:\"\\F275\"}.fa-map-pin:before{content:\"\\F276\"}.fa-map-signs:before{content:\"\\F277\"}.fa-map-o:before{content:\"\\F278\"}.fa-map:before{content:\"\\F279\"}.fa-commenting:before{content:\"\\F27A\"}.fa-commenting-o:before{content:\"\\F27B\"}.fa-houzz:before{content:\"\\F27C\"}.fa-vimeo:before{content:\"\\F27D\"}.fa-black-tie:before{content:\"\\F27E\"}.fa-fonticons:before{content:\"\\F280\"}.fa-reddit-alien:before{content:\"\\F281\"}.fa-edge:before{content:\"\\F282\"}.fa-credit-card-alt:before{content:\"\\F283\"}.fa-codiepie:before{content:\"\\F284\"}.fa-modx:before{content:\"\\F285\"}.fa-fort-awesome:before{content:\"\\F286\"}.fa-usb:before{content:\"\\F287\"}.fa-product-hunt:before{content:\"\\F288\"}.fa-mixcloud:before{content:\"\\F289\"}.fa-scribd:before{content:\"\\F28A\"}.fa-pause-circle:before{content:\"\\F28B\"}.fa-pause-circle-o:before{content:\"\\F28C\"}.fa-stop-circle:before{content:\"\\F28D\"}.fa-stop-circle-o:before{content:\"\\F28E\"}.fa-shopping-bag:before{content:\"\\F290\"}.fa-shopping-basket:before{content:\"\\F291\"}.fa-hashtag:before{content:\"\\F292\"}.fa-bluetooth:before{content:\"\\F293\"}.fa-bluetooth-b:before{content:\"\\F294\"}.fa-percent:before{content:\"\\F295\"}.fa-gitlab:before{content:\"\\F296\"}.fa-wpbeginner:before{content:\"\\F297\"}.fa-wpforms:before{content:\"\\F298\"}.fa-envira:before{content:\"\\F299\"}.fa-universal-access:before{content:\"\\F29A\"}.fa-wheelchair-alt:before{content:\"\\F29B\"}.fa-question-circle-o:before{content:\"\\F29C\"}.fa-blind:before{content:\"\\F29D\"}.fa-audio-description:before{content:\"\\F29E\"}.fa-volume-control-phone:before{content:\"\\F2A0\"}.fa-braille:before{content:\"\\F2A1\"}.fa-assistive-listening-systems:before{content:\"\\F2A2\"}.fa-asl-interpreting:before,.fa-american-sign-language-interpreting:before{content:\"\\F2A3\"}.fa-deafness:before,.fa-hard-of-hearing:before,.fa-deaf:before{content:\"\\F2A4\"}.fa-glide:before{content:\"\\F2A5\"}.fa-glide-g:before{content:\"\\F2A6\"}.fa-signing:before,.fa-sign-language:before{content:\"\\F2A7\"}.fa-low-vision:before{content:\"\\F2A8\"}.fa-viadeo:before{content:\"\\F2A9\"}.fa-viadeo-square:before{content:\"\\F2AA\"}.fa-snapchat:before{content:\"\\F2AB\"}.fa-snapchat-ghost:before{content:\"\\F2AC\"}.fa-snapchat-square:before{content:\"\\F2AD\"}.fa-pied-piper:before{content:\"\\F2AE\"}.fa-first-order:before{content:\"\\F2B0\"}.fa-yoast:before{content:\"\\F2B1\"}.fa-themeisle:before{content:\"\\F2B2\"}.fa-google-plus-circle:before,.fa-google-plus-official:before{content:\"\\F2B3\"}.fa-fa:before,.fa-font-awesome:before{content:\"\\F2B4\"}.fa-handshake-o:before{content:\"\\F2B5\"}.fa-envelope-open:before{content:\"\\F2B6\"}.fa-envelope-open-o:before{content:\"\\F2B7\"}.fa-linode:before{content:\"\\F2B8\"}.fa-address-book:before{content:\"\\F2B9\"}.fa-address-book-o:before{content:\"\\F2BA\"}.fa-vcard:before,.fa-address-card:before{content:\"\\F2BB\"}.fa-vcard-o:before,.fa-address-card-o:before{content:\"\\F2BC\"}.fa-user-circle:before{content:\"\\F2BD\"}.fa-user-circle-o:before{content:\"\\F2BE\"}.fa-user-o:before{content:\"\\F2C0\"}.fa-id-badge:before{content:\"\\F2C1\"}.fa-drivers-license:before,.fa-id-card:before{content:\"\\F2C2\"}.fa-drivers-license-o:before,.fa-id-card-o:before{content:\"\\F2C3\"}.fa-quora:before{content:\"\\F2C4\"}.fa-free-code-camp:before{content:\"\\F2C5\"}.fa-telegram:before{content:\"\\F2C6\"}.fa-thermometer-4:before,.fa-thermometer:before,.fa-thermometer-full:before{content:\"\\F2C7\"}.fa-thermometer-3:before,.fa-thermometer-three-quarters:before{content:\"\\F2C8\"}.fa-thermometer-2:before,.fa-thermometer-half:before{content:\"\\F2C9\"}.fa-thermometer-1:before,.fa-thermometer-quarter:before{content:\"\\F2CA\"}.fa-thermometer-0:before,.fa-thermometer-empty:before{content:\"\\F2CB\"}.fa-shower:before{content:\"\\F2CC\"}.fa-bathtub:before,.fa-s15:before,.fa-bath:before{content:\"\\F2CD\"}.fa-podcast:before{content:\"\\F2CE\"}.fa-window-maximize:before{content:\"\\F2D0\"}.fa-window-minimize:before{content:\"\\F2D1\"}.fa-window-restore:before{content:\"\\F2D2\"}.fa-times-rectangle:before,.fa-window-close:before{content:\"\\F2D3\"}.fa-times-rectangle-o:before,.fa-window-close-o:before{content:\"\\F2D4\"}.fa-bandcamp:before{content:\"\\F2D5\"}.fa-grav:before{content:\"\\F2D6\"}.fa-etsy:before{content:\"\\F2D7\"}.fa-imdb:before{content:\"\\F2D8\"}.fa-ravelry:before{content:\"\\F2D9\"}.fa-eercast:before{content:\"\\F2DA\"}.fa-microchip:before{content:\"\\F2DB\"}.fa-snowflake-o:before{content:\"\\F2DC\"}.fa-superpowers:before{content:\"\\F2DD\"}.fa-wpexplorer:before{content:\"\\F2DE\"}.fa-meetup:before{content:\"\\F2E0\"}.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0, 0, 0, 0);border:0}.sr-only-focusable:active,.sr-only-focusable:focus{position:static;width:auto;height:auto;margin:0;overflow:visible;clip:auto}\n", ""]);

// exports


/***/ }),
/* 74 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "dist/assets/674f50d287a8c48dc19ba404d20fe713.eot";

/***/ }),
/* 75 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "dist/assets/674f50d287a8c48dc19ba404d20fe713.eot";

/***/ }),
/* 76 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "dist/assets/af7ae505a9eed503f8b8e6982036873e.woff2";

/***/ }),
/* 77 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "dist/assets/fee66e712a8a08eef5805a46892932ad.woff";

/***/ }),
/* 78 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "dist/assets/b06871f281fee6b241d60582ae9369b9.ttf";

/***/ }),
/* 79 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "dist/assets/912ec66d7572ff821749319396470bde.svg";

/***/ }),
/* 80 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(81);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(17)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../../node_modules/css-loader/index.js!./onsen-css-components.css", function() {
			var newContent = require("!!../../../node_modules/css-loader/index.js!./onsen-css-components.css");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 81 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(10)(undefined);
// imports


// module
exports.push([module.i, "/*!\n * Copyright 2013-2017 ASIAL CORPORATION\n *\n * Licensed under the Apache License, Version 2.0 (the \"License\");\n * you may not use this file except in compliance with the License.\n * You may obtain a copy of the License at\n *\n *    http://www.apache.org/licenses/LICENSE-2.0\n *\n * Unless required by applicable law or agreed to in writing, software\n * distributed under the License is distributed on an \"AS IS\" BASIS,\n * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\n * See the License for the specific language governing permissions and\n * limitations under the License.\n *\n */\n/*!\n * Copyright 2012 Adobe Systems Inc.;\n *\n * Licensed under the Apache License, Version 2.0 (the \"License\");\n * you may not use this file except in compliance with the License.\n * You may obtain a copy of the License at\n *\n * http://www.apache.org/licenses/LICENSE-2.0\n *\n * Unless required by applicable law or agreed to in writing, software\n * distributed under the License is distributed on an \"AS IS\" BASIS,\n * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\n * See the License for the specific language governing permissions and\n * limitations under the License.\n *\n */\n:root {\n  /* variables for iOS components */\n\n  /* variables for Material Design components */\n\n  /* others */\n}\nhtml {\n  height: 100%;\n  width: 100%;\n}\nbody {\n  position: absolute;\n  overflow: hidden;\n  top: 0;\n  right: 0;\n  left: 0;\n  bottom: 0;\n  padding: 0;\n  margin: 0;\n  -webkit-text-size-adjust: 100%;\n  touch-action: manipulation;\n}\nhtml, body, div, span, applet, object, iframe,\nh1, h2, h3, h4, h5, h6, p, blockquote, pre,\na, abbr, acronym, address, big, cite, code,\ndel, dfn, em, img, ins, kbd, q, s, samp,\nsmall, strike, strong, sub, sup, tt, var,\nb, u, i, center, dl, dt, dd, ol, ul, li,\nfieldset, form, label, legend,\ntable, caption, tbody, tfoot, thead, tr, th, td,\narticle, aside, canvas, details, embed,\nfigure, figcaption, footer, header, hgroup,\nmenu, nav, output, ruby, section, summary,\ntime, mark, audio, video {\n  -webkit-user-select: none;\n     -moz-user-select: none;\n      -ms-user-select: none;\n          user-select: none;\n  -webkit-tap-highlight-color: transparent;\n  -webkit-touch-callout: none;\n}\ninput, textarea, select {\n  -webkit-user-select: auto;\n      -ms-user-select: auto;\n          user-select: auto;\n  -moz-user-select: text;\n  -webkit-touch-callout: none;\n}\na, button, input, textarea, select {\n  touch-action: manipulation;\n}\ninput:active, input:focus, textarea:active, textarea:focus, select:active, select:focus {\n  outline: none;\n}\nh1 {\n  font-size: 36px;\n}\nh2 {\n  font-size: 30px;\n}\nh3 {\n  font-size: 24px;\n}\nh4, h5, h6 {\n  font-size: 18px;\n}\n:root {\n}\n.page {\n  font-family: -apple-system, 'Helvetica Neue', 'Helvetica', 'Arial', 'Lucida Grande', sans-serif;\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n  font-weight: 400;\n  background-color: #efeff4;\n  position: absolute;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  overflow-x: visible;\n  overflow-y: hidden;\n  color: #1f1f21;\n  -ms-overflow-style: none;\n  -webkit-font-smoothing: antialiased;\n}\n.page::-webkit-scrollbar {\n  display: none;\n}\n.page__content {\n  background-color: #efeff4;\n  position: absolute;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  box-sizing: border-box;\n}\n.page__background {\n  background-color: #efeff4;\n  position: absolute;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  box-sizing: border-box;\n}\n.page--material {\n  font-family: 'Roboto', 'Noto', sans-serif;\n  -webkit-font-smoothing: antialiased;\n  font-weight: 400;\n  background-color: #eceff1;\n}\n.page--material__content {\n  font-family: 'Roboto', 'Noto', sans-serif;\n  -webkit-font-smoothing: antialiased;\n  font-weight: 400;\n  font-weight: 400;\n}\n.page__content h1,\n.page__content h2,\n.page__content h3,\n.page__content h4,\n.page__content h5 {\n  font-family: 'Roboto', 'Noto', sans-serif;\n  -webkit-font-smoothing: antialiased;\n  font-weight: 400;\n  font-weight: 500;\n  margin: 0.6em 0;\n  padding: 0;\n}\n.page__content h1 {\n  font-size: 28px;\n}\n.page__content h2 {\n  font-size: 24px;\n}\n.page__content h3 {\n  font-size: 20px;\n}\n.page--material__content h1,\n.page--material__content h2,\n.page--material__content h3,\n.page--material__content h4,\n.page--material__content h5 {\n  font-family: 'Roboto', 'Noto', sans-serif;\n  -webkit-font-smoothing: antialiased;\n  font-weight: 400;\n  font-weight: 500;\n  margin: 0.6em 0;\n  padding: 0;\n}\n.page--material__content h1 {\n  font-size: 28px;\n}\n.page--material__content h2 {\n  font-size: 24px;\n}\n.page--material__content h3 {\n  font-size: 20px;\n}\n.page--material__background {\n  background-color: #eceff1;\n}\n:root { /* background color active */\n}\n/*~\n  name: Switch\n  category: Switch\n  elements: ons-switch\n  markup: |\n    <label class=\"switch\">\n      <input type=\"checkbox\" class=\"switch__input\">\n      <div class=\"switch__toggle\">\n        <div class=\"switch__handle\"></div>\n      </div>\n    </label>\n    <label class=\"switch\">\n      <input type=\"checkbox\" class=\"switch__input\" checked>\n      <div class=\"switch__toggle\">\n        <div class=\"switch__handle\"></div>\n      </div>\n    </label>\n    <label class=\"switch\">\n      <input type=\"checkbox\" class=\"switch__input\" disabled>\n      <div class=\"switch__toggle\">\n        <div class=\"switch__handle\"></div>\n      </div>\n    </label>\n*/\n.switch {\n  display: inline-block;\n  vertical-align: top;\n  box-sizing: border-box;\n  background-clip: padding-box;\n  position: relative;\n  min-width: 51px;\n  font-size: 17px;\n  padding: 0 20px;\n  border: none;\n  overflow: visible;\n  width: 51px;\n  height: 32px;\n  z-index: 0;\n  text-align: left;\n}\n.switch__input {\n  position: absolute;\n  right: 0;\n  top: 0;\n  left: 0;\n  bottom: 0;\n  padding: 0;\n  border: 0;\n  background-color: transparent;\n  z-index: 1;\n  vertical-align: top;\n  outline: none;\n  width: 100%;\n  height: 100%;\n  margin: 0;\n  -webkit-appearance: none;\n     -moz-appearance: none;\n          appearance: none;\n  z-index: 0;\n}\n/* switch toggle background */\n.switch__toggle {\n  background-color: white;\n  position: absolute;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  border-radius: 30px;\n  transition-property: all;\n  transition-duration: 0.35s;\n  transition-timing-function: ease-out;\n  box-shadow: inset 0 0 0 2px #e5e5e5;\n}\n/* switch toggle circle */\n.switch__handle {\n  box-sizing: border-box;\n  background-clip: padding-box;\n  position: absolute;\n  content: '';\n  border-radius: 28px;\n  height: 28px;\n  width: 28px;\n  background-color: white;\n  left: 1px;\n  top: 2px;\n  transition-property: all;\n  transition-duration: 0.35s;\n  transition-timing-function: cubic-bezier(.59, .01, .5, .99);\n  box-shadow: 0 0 1px 0 rgba(0, 0, 0, .25), 0 3px 2px rgba(0, 0, 0, .25);\n}\n.switch--active__handle {\n  transition: none;\n}\n:checked + .switch__toggle {\n  box-shadow: inset 0 0 0 2px #44db5e;\n  background-color: #44db5e;\n}\n:checked + .switch__toggle > .switch__handle {\n  left: 21px;\n  box-shadow: 0 3px 2px rgba(0, 0, 0, .25);\n}\n:disabled + .switch__toggle {\n  opacity: 0.3;\n  cursor: default;\n  pointer-events: none;\n}\n.switch__touch {\n  position: absolute;\n  top: -5px;\n  bottom: -5px;\n  left: -10px;\n  right: -10px;\n}\n/*~\n  name: Material Switch\n  category: Switch\n  elements: ons-switch\n  markup: |\n    <label class=\"switch switch--material\">\n      <input type=\"checkbox\" class=\"switch__input switch--material__input\">\n      <div class=\"switch__toggle switch--material__toggle\">\n        <div class=\"switch__handle switch--material__handle\">\n        </div>\n      </div>\n    </label>\n    <label class=\"switch switch--material\">\n      <input type=\"checkbox\" class=\"switch__input switch--material__input\" checked>\n      <div class=\"switch__toggle switch--material__toggle\">\n        <div class=\"switch__handle switch--material__handle\">\n        </div>\n      </div>\n    </label>\n    <label class=\"switch switch--material\">\n      <input type=\"checkbox\" class=\"switch__input switch--material__input\" disabled>\n      <div class=\"switch__toggle switch--material__toggle\">\n        <div class=\"switch__handle switch--material__handle\">\n        </div>\n      </div>\n    </label>\n*/\n.switch--material {\n  width: 36px;\n  height: 24px;\n  padding: 0 10px;\n  min-width: 36px;\n}\n.switch--material__toggle {\n  background-color: #b0afaf;\n  margin-top: 5px;\n  height: 14px;\n  box-shadow: none;\n}\n.switch--material__input {\n  position: absolute;\n  right: 0;\n  top: 0;\n  left: 0;\n  bottom: 0;\n  padding: 0;\n  border: 0;\n  background-color: transparent;\n  z-index: 1;\n  vertical-align: top;\n  outline: none;\n  width: 100%;\n  height: 100%;\n  margin: 0;\n  -webkit-appearance: none;\n     -moz-appearance: none;\n          appearance: none;\n  z-index: 0;\n}\n.switch--material__handle {\n  background-color: #f1f1f1;\n  left: 0;\n  margin-top: -5px;\n  width: 20px;\n  height: 20px;\n  box-shadow:\n      0 4px 5px 0 rgba(0, 0, 0, .14),\n      0 1px 10px 0 rgba(0, 0, 0, .12),\n      0 2px 4px -1px rgba(0, 0, 0, .4);\n}\n:checked + .switch--material__toggle {\n  background-color: rgba(55, 71, 79, 0.5);\n  box-shadow: none;\n}\n:checked + .switch--material__toggle > .switch--material__handle {\n  left: 16px;\n  background-color: #37474f;\n  box-shadow:\n      0 2px 2px 0 rgba(0, 0, 0, .14),\n      0 1px 5px 0 rgba(0, 0, 0, .12),\n      0 3px 1px -2px rgba(0, 0, 0, .2);\n}\n:disabled + .switch--material__toggle {\n  opacity: 0.3;\n  cursor: default;\n  pointer-events: none;\n}\n.switch--material__handle:before {\n  background: transparent;\n  content: '';\n  display: block;\n  width: 100%;\n  height: 100%;\n  border-radius: 50%;\n  z-index: 0;\n  box-shadow: 0 0 0 0 rgba(0, 0, 0, .12);\n  transition: box-shadow 0.1s linear;\n}\n.switch--material__toggle > .switch--active__handle:before {\n  box-shadow: 0 0 0 14px rgba(0, 0, 0, .12);\n}\n:checked + .switch--material__toggle > .switch--active__handle:before {\n  box-shadow: 0 0 0 14px rgba(55, 71, 79, 0.2);\n}\n.switch--material__touch {\n  position: absolute;\n  top: -10px;\n  bottom: -10px;\n  left: -15px;\n  right: -15px;\n}\n/*~\n  name: Range\n  category: Range\n  elements: ons-range\n  markup: |\n    <div class=\"range\">\n      <input type=\"range\" class=\"range__input\">\n      <input type=\"range\" class=\"range__focus-ring\">\n    </div>\n\n    <div class=\"range range--disabled\">\n      <input type=\"range\" class=\"range__input\" disabled>\n      <input type=\"range\" class=\"range__focus-ring\" disabled>\n    </div>\n*/\n.range {\n  display: inline-block;\n  position: relative;\n  width: 100px;\n  height: 30px;\n  margin: 0;\n  padding: 0;\n  background-image: linear-gradient(#a4aab3, #a4aab3);\n  background-position: left center;\n  background-size: 100% 2px;\n  background-repeat: no-repeat;\n  background-color: transparent;\n}\n.range__input {\n  box-sizing: border-box;\n  background-clip: padding-box;\n  padding: 0;\n  margin: 0;\n  font: inherit;\n  color: inherit;\n  background: transparent;\n  border: none;\n  vertical-align: top;\n  outline: none;\n  line-height: 1;\n  -webkit-appearance: none;\n     -moz-appearance: none;\n          appearance: none;\n  background-image: linear-gradient(#0076ff, #0076ff);\n  background-position: left center;\n  background-size: 0% 2px;\n  background-repeat: no-repeat;\n  height: 30px;\n  position: relative;\n  z-index: 1;\n  width: 100%;\n}\n.range__input::-moz-range-track {\n  position: relative;\n  border: none;\n  background: none;\n  box-shadow: none;\n  top: 0;\n  margin: 0;\n  padding: 0;\n}\n.range__input::-ms-track {\n  position: relative;\n  border: none;\n  background-color: #a4aab3;\n  height: 0;\n  border-radius: 50%;\n}\n.range__input::-webkit-slider-thumb {\n  cursor: pointer;\n  position: relative;\n  height: 28px;\n  width: 28px;\n  background-color: #fff;\n  border: none;\n  box-shadow: 0 0 1px 0 rgba(0, 0, 0, .25), 0 3px 2px rgba(0, 0, 0, .25);\n  border-radius: 50%;\n  margin: 0;\n  padding: 0;\n  box-sizing: border-box;\n  -webkit-appearance: none;\n          appearance: none;\n  top: 0;\n  z-index: 1;\n}\n.range__input::-moz-range-thumb {\n  cursor: pointer;\n  position: relative;\n  height: 28px;\n  width: 28px;\n  background-color: #fff;\n  border: none;\n  box-shadow: 0 0 1px 0 rgba(0, 0, 0, .25), 0 3px 2px rgba(0, 0, 0, .25);\n  border-radius: 50%;\n  margin: 0;\n  padding: 0;\n}\n.range__input::-ms-thumb {\n  cursor: pointer;\n  position: relative;\n  height: 28px;\n  width: 28px;\n  background-color: #fff;\n  border: none;\n  box-shadow: 0 0 1px 0 rgba(0, 0, 0, .25), 0 3px 2px rgba(0, 0, 0, .25);\n  border-radius: 50%;\n  margin: 0;\n  padding: 0;\n  top: 0;\n}\n.range__input::-ms-fill-lower {\n  height: 2px;\n  background-color: #0076ff;\n}\n.range__input::-ms-tooltip {\n  display: none;\n}\n.range__input:disabled {\n  opacity: 1;\n  pointer-events: none;\n}\n.range__focus-ring {\n  pointer-events: none;\n  top: 0;\n  left: 0;\n  display: none;\n  box-sizing: border-box;\n  background-clip: padding-box;\n  padding: 0;\n  margin: 0;\n  font: inherit;\n  color: inherit;\n  background: transparent;\n  border: none;\n  vertical-align: top;\n  outline: none;\n  line-height: 1;\n  -webkit-appearance: none;\n     -moz-appearance: none;\n          appearance: none;\n  background: none;\n  height: 30px;\n  position: absolute;\n  z-index: 0;\n  width: 100%;\n}\n.range--disabled {\n  opacity: 0.3;\n  cursor: default;\n  pointer-events: none;\n  pointer-events: none;\n}\n/*~\n  name: Material Range\n  category: Range\n  elements: ons-range\n  markup: |\n    <div class=\"range range--material\">\n      <input type=\"range\" class=\"range__input range--material__input\" min=\"0\" max=\"100\">\n      <!-- <input type=\"range\" class=\"range__focus-ring range--material__focus-ring\"> -->\n    </div>\n\n    <div class=\"range range--material range--disabled\">\n      <input type=\"range\" class=\"range__input range--material__input\" disabled>\n      <!-- <input type=\"range\" class=\"range__focus-ring range--material__focus-ring\" disabled> -->\n    </div>\n*/\n.range--material {\n  position: relative;\n  background-image: linear-gradient(#bdbdbd, #bdbdbd);\n}\n.range--material__input {\n  background-image: linear-gradient(#31313a, #31313a);\n  background-position: center left;\n  background-size: 0% 2px;\n}\n.range--material__focus-ring {\n  display: block;\n}\n.range--material__focus-ring::-webkit-slider-thumb {\n  -webkit-appearance: none;\n          appearance: none;\n  width: 14px;\n  height: 14px;\n  border: none;\n  box-shadow: 0 0 0 9px #31313a;\n  background-color: #31313a;\n  border-radius: 50%;\n  opacity: 0;\n  transition: opacity 0.25s ease-out, -webkit-transform 0.25s ease-out;\n  transition: opacity 0.25s ease-out, transform 0.25s ease-out;\n  transition: opacity 0.25s ease-out, transform 0.25s ease-out, -webkit-transform 0.25s ease-out;\n}\n.range--material__input.range__input--active + .range--material__focus-ring::-webkit-slider-thumb {\n  opacity: 0.2;\n  -webkit-transform: scale(1.5, 1.5, 1.5);\n          transform: scale(1.5, 1.5, 1.5);\n}\n.range--material__input::-webkit-slider-thumb {\n  position: relative;\n  box-sizing: border-box;\n  border: none;\n  background-color: transparent;\n  width: 14px;\n  height: 32px;\n  border-radius: 0;\n  box-shadow: none;\n  background-image: radial-gradient(circle farthest-corner, #31313a 0%, #31313a 6.6px, transparent 7px);\n  transition: -webkit-transform 0.1s linear;\n  transition: transform 0.1s linear;\n  transition: transform 0.1s linear, -webkit-transform 0.1s linear;\n  overflow: visible;\n}\n.range--material__input[_zero]::-webkit-slider-thumb {\n  background-image: radial-gradient(circle farthest-corner, #f2f2f2 0%, #f2f2f2 4px, #bdbdbd 4px, #bdbdbd 6.4px, transparent 7px);\n}\n.range--material__input[_zero] + .range--material__focus-ring::-webkit-slider-thumb {\n  box-shadow: 0 0 0 9px #bdbdbd;\n}\n.range--material__input::-moz-range-track {\n  background: none;\n}\n.range--material__input::-moz-range-thumb,\n.range--material__input:focus::-moz-range-thumb {\n  box-sizing: border-box;\n  border: none;\n  width: 14px;\n  height: 32px;\n  border-radius: 0;\n  background-color: transparent;\n  background-image: -moz-radial-gradient(circle farthest-corner, #31313a 0%, #31313a 6.6px, transparent 7px); /* stylelint-disable-line */\n  box-shadow: none;\n}\n.range--material__input:active::-webkit-slider-thumb,\n.range--material__input.range__input--active::-webkit-slider-thumb { /* NOTICE: \":active\" does not work on Android Chrome. */\n  -webkit-transform: scale(1.5);\n          transform: scale(1.5);\n  transition: -webkit-transform 0.1s linear;\n  transition: transform 0.1s linear;\n  transition: transform 0.1s linear, -webkit-transform 0.1s linear;\n}\n/* stylelint-disable */\n.range--disabled.range--material { /* stylelint-enable */\n  opacity: 1;\n}\n/* stylelint-disable */\n.range--disabled > .range--material__input { /* stylelint-enable */\n  background-image: none;\n}\n.range--material__input:disabled::-webkit-slider-thumb {\n  background-image: radial-gradient(circle farthest-corner, #b0b0b0 0%, #b0b0b0 4px, #eeeeee 4.4px, #eeeeee 7.6px, transparent 7.6px);\n  transition: none;\n}\n.range--material__input:disabled::-moz-range-thumb {\n  background-image: -moz-radial-gradient(circle farthest-corner, #b0b0b0 0%, #b0b0b0 4px, #eeeeee 4.4px, #eeeeee 7.6px, transparent 7.6px); /* stylelint-disable-line */\n  transition: none;\n}\n/*~\n  name: Notification\n  category: Notification\n  markup: |\n    <span class=\"notification\">1</span>\n    <span class=\"notification\">10</span>\n    <span class=\"notification\">999</span>\n*/\n.notification {\n  position: relative;\n  display: inline-block;\n  vertical-align: top;\n  font: inherit;\n  border: none;\n  box-sizing: border-box;\n  background-clip: padding-box;\n  padding: 0;\n  margin: 0;\n  font: inherit;\n  color: inherit;\n  background: transparent;\n  border: none;\n  line-height: normal;\n  font-family: -apple-system, 'Helvetica Neue', 'Helvetica', 'Arial', 'Lucida Grande', sans-serif;\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n  font-weight: 400;\n  cursor: default;\n  -webkit-user-select: none;\n     -moz-user-select: none;\n      -ms-user-select: none;\n          user-select: none;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n  overflow: hidden;\n  text-decoration: none;\n  margin: 0;\n  padding: 0 4px;\n  width: auto;\n  height: 19px;\n  border-radius: 19px;\n  background-color: #fe3824;\n  color: white;\n  text-align: center;\n  font-size: 16px;\n  min-width: 19px;\n  line-height: 19px;\n  font-weight: 400;\n}\n.notification:empty {\n  display: none;\n}\n/*~\n  name: Material Notification\n  category: Notification\n  markup: |\n    <span class=\"notification notification--material\">1</span>\n    <span class=\"notification notification--material\">10</span>\n    <span class=\"notification notification--material\">999</span>\n*/\n.notification--material {\n  font-family: 'Roboto', 'Noto', sans-serif;\n  -webkit-font-smoothing: antialiased;\n  font-weight: 400;\n  background-color: #e91e63;\n  font-size: 16px;\n  font-weight: 500;\n  color: white;\n}\n/*~\n  name: Toolbar\n  category: Toolbar\n  elements: ons-toolbar\n  markup: |\n    <div class=\"toolbar\">\n      <div class=\"toolbar__center\">Navigation Bar</div>\n    </div>\n*/\n.toolbar {\n  font-family: -apple-system, 'Helvetica Neue', 'Helvetica', 'Arial', 'Lucida Grande', sans-serif;\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n  font-weight: 400;\n  box-sizing: border-box;\n  background-clip: padding-box;\n  white-space: nowrap;\n  overflow: hidden;\n  word-spacing: 0;\n  padding: 0;\n  margin: 0;\n  font: inherit;\n  color: inherit;\n  background: transparent;\n  border: none;\n  line-height: normal;\n  cursor: default;\n  -webkit-user-select: none;\n     -moz-user-select: none;\n      -ms-user-select: none;\n          user-select: none;\n  z-index: 2;\n  display: -webkit-box;\n  display: -webkit-flex;\n  display: flex;\n  -webkit-box-align: stretch;\n  -webkit-align-items: stretch;\n          align-items: stretch;\n  -webkit-flex-wrap: nowrap;\n          flex-wrap: nowrap;\n  height: 44px;\n  padding-left: 0;\n  padding-right: 0;\n  background: #fafafa;\n  color: #1f1f21;\n  box-shadow: none;\n  font-weight: 400;\n  width: 100%;\n  white-space: nowrap;\n  border-bottom: none;\n  background-size: 100% 1px;\n  background-repeat: no-repeat;\n  background-position: bottom;\n  background-image: linear-gradient(0deg, #b2b2b2, #b2b2b2 100%);\n}\n@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {\n  .toolbar {\n    background-image: linear-gradient(0deg, #b2b2b2, #b2b2b2 50%, transparent 50%);\n  }\n}\n.toolbar__bg {\n  background: #fafafa;\n}\n.toolbar__item {\n  box-sizing: border-box;\n  background-clip: padding-box;\n  padding: 0;\n  margin: 0;\n  font: inherit;\n  color: inherit;\n  background: transparent;\n  border: none;\n  line-height: normal;\n  height: 44px;\n  overflow: visible;\n  display: block;\n  vertical-align: middle;\n}\n.toolbar__left {\n  box-sizing: border-box;\n  background-clip: padding-box;\n  padding: 0;\n  margin: 0;\n  font: inherit;\n  color: inherit;\n  background: transparent;\n  border: none;\n  line-height: normal;\n  max-width: 50%;\n  width: 27%;\n  text-align: left;\n  line-height: 44px;\n}\n.toolbar__right {\n  box-sizing: border-box;\n  background-clip: padding-box;\n  padding: 0;\n  margin: 0;\n  font: inherit;\n  color: inherit;\n  background: transparent;\n  border: none;\n  line-height: normal;\n  max-width: 50%;\n  width: 27%;\n  text-align: right;\n  line-height: 44px;\n}\n.toolbar__center {\n  box-sizing: border-box;\n  background-clip: padding-box;\n  padding: 0;\n  margin: 0;\n  font: inherit;\n  color: inherit;\n  background: transparent;\n  border: none;\n  line-height: normal;\n  width: 46%;\n  text-align: center;\n  line-height: 44px;\n  font-size: 17px;\n  font-weight: 500;\n  color: #1f1f21;\n}\n.toolbar__title {\n  line-height: 44px;\n  font-size: 17px;\n  font-weight: 500;\n  color: #1f1f21;\n  margin: 0;\n  padding: 0;\n  overflow: visible;\n}\n.toolbar__center:first-child:last-child {\n  width: 100%;\n}\n/*~\n  name: Toolbar Item\n  category: Toolbar\n  elements: ons-toolbar ons-toolbar-button\n  markup: |\n    <div class=\"toolbar\">\n      <div class=\"toolbar__left\">\n        <span class=\"toolbar-button\">\n          <i class=\"ion-navicon\" style=\"font-size:32px; vertical-align:-6px;\"></i>\n        </span>\n      </div>\n\n      <div class=\"toolbar__center\">\n        Navigation Bar\n      </div>\n\n      <div class=\"toolbar__right\">\n        <span class=\"toolbar-button\">Label</span>\n      </div>\n    </div>\n*/\n/*~\n  name: Toolbar with Outline Button\n  category: Toolbar\n  elements: ons-toolbar ons-toolbar-button\n  markup: |\n    <!-- Prerequisite=This example use ionicons(http://ionicons.com) to display icons. -->\n    <div class=\"toolbar\">\n      <div class=\"toolbar__left\">\n        <span class=\"toolbar-button toolbar-button--outline\">\n          <i class=\"ion-navicon\" style=\"font-size:32px; vertical-align:-6px;\"></i>\n        </span>\n      </div>\n\n      <div class=\"toolbar__center\">\n        Title\n      </div>\n\n      <div class=\"toolbar__right\">\n        <span class=\"toolbar-button toolbar-button--outline\">Button</span>\n      </div>\n    </div>\n*/\n/*~\n  name: Bottom Bar\n  category: Toolbar\n  elements: ons-bottom-toolbar\n  markup: |\n    <div class=\"bottom-bar\">\n      <div class=\"bottom-bar__line-height\" style=\"text-align:center\">Bottom Toolbar</div>\n    </div>\n*/\n.bottom-bar {\n  font-family: -apple-system, 'Helvetica Neue', 'Helvetica', 'Arial', 'Lucida Grande', sans-serif;\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n  font-weight: 400;\n  box-sizing: border-box;\n  background-clip: padding-box;\n  white-space: nowrap;\n  overflow: hidden;\n  word-spacing: 0;\n  padding: 0;\n  margin: 0;\n  font: inherit;\n  color: inherit;\n  background: transparent;\n  border: none;\n  line-height: normal;\n  cursor: default;\n  -webkit-user-select: none;\n     -moz-user-select: none;\n      -ms-user-select: none;\n          user-select: none;\n  z-index: 2;\n  display: block;\n  height: 44px;\n  padding-left: 0;\n  padding-right: 0;\n  background: #fafafa;\n  color: #1f1f21;\n  box-shadow: none;\n  font-weight: 400;\n  border-bottom: none;\n  border-top: 1px solid #b2b2b2;\n  position: absolute;\n  bottom: 0;\n  right: 0;\n  left: 0;\n  border-top: none;\n  background-size: 100% 1px;\n  background-repeat: no-repeat;\n  background-position: top;\n  background-image: linear-gradient(180deg, #b2b2b2, #b2b2b2 100%);\n}\n@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {\n  .bottom-bar {\n    background-image: linear-gradient(180deg, #b2b2b2, #b2b2b2 50%, transparent 50%);\n  }\n}\n.bottom-bar__line-height {\n  line-height: 44px;\n  padding-bottom: 0;\n  padding-top: 0;\n}\n.bottom-bar--aligned {\n  display: -webkit-box;\n  display: -webkit-flex;\n  display: flex;\n  -webkit-flex-wrap: nowrap;\n          flex-wrap: nowrap;\n  line-height: 44px;\n}\n.bottom-bar--transparent {\n  background-color: transparent;\n  background-image: none;\n  border: none;\n}\n/*~\n  name: Toolbar with Segment\n  category: Toolbar\n  elements: ons-toolbar\n  markup: |\n    <div class=\"toolbar\">\n      <div class=\"toolbar__center\">\n        <div class=\"segment\" style=\"width:200px;margin:7px 50px;\">\n          <div class=\"segment__item\">\n            <input type=\"radio\" class=\"segment__input\" name=\"navi-segment-a\" checked>\n            <div class=\"segment__button\">One</div>\n          </div>\n\n          <div class=\"segment__item\">\n            <input type=\"radio\" class=\"segment__input\" name=\"navi-segment-a\">\n            <div class=\"segment__button\">Two</div>\n          </div>\n        </div>\n      </div>\n    </div>\n*/\n/*~\n  name: Material Toolbar\n  category: Toolbar\n  elements: ons-toolbar\n  markup: |\n    <div class=\"toolbar toolbar--material\">\n      <div class=\"toolbar__center toolbar--material__center\">\n        Title\n      </div>\n    </div>\n*/\n.toolbar--material {\n  display: -webkit-box;\n  display: -webkit-flex;\n  display: flex;\n  -webkit-flex-wrap: nowrap;\n          flex-wrap: nowrap;\n  -webkit-box-pack: justify;\n  -webkit-justify-content: space-between;\n          justify-content: space-between;\n  height: 56px;\n  border-bottom: 0;\n  box-shadow: 0 1px 5px rgba(0, 0, 0, .3);\n  padding: 0;\n  background-color: #ffffff;\n  background-size: 0;\n}\n/*~\n  name: No Shadow Toolbar\n  category: Toolbar\n  elements: ons-toolbar\n  markup: |\n    <div class=\"toolbar toolbar--noshadow\">\n      <div class=\"toolbar__left\">\n        <span class=\"toolbar-button\">\n          <i class=\"ion-navicon\" style=\"font-size:32px; vertical-align:-6px;\"></i>\n        </span>\n      </div>\n      <div class=\"toolbar__center\">\n        Navigation Bar\n      </div>\n      <div class=\"toolbar__right\">\n        <span class=\"toolbar-button\">Label</span>\n      </div>\n    </div>\n*/\n.toolbar--noshadow {\n  box-shadow: none;\n  background-image: none;\n  border-bottom: none;\n}\n.toolbar--material__left, .toolbar--material__right {\n  font-family: 'Roboto', 'Noto', sans-serif;\n  -webkit-font-smoothing: antialiased;\n  font-weight: 400;\n  font-size: 20px;\n  font-weight: 500;\n  color: #31313a;\n  height: 56px;\n  min-width: 72px;\n  width: auto;\n  line-height: 56px;\n}\n.toolbar--material__center {\n  font-family: 'Roboto', 'Noto', sans-serif;\n  -webkit-font-smoothing: antialiased;\n  font-weight: 400;\n  font-size: 20px;\n  font-weight: 500;\n  color: #31313a;\n  height: 56px;\n  width: auto;\n  -webkit-box-flex: 1;\n  -webkit-flex-grow: 1;\n          flex-grow: 1;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  text-align: left;\n  line-height: 56px;\n}\n.toolbar--material__center:first-child {\n  margin-left: 16px;\n}\n.toolbar--material__center:last-child {\n  margin-right: 16px;\n}\n.toolbar--material__left:empty, .toolbar--material__right:empty {\n  min-width: 16px;\n}\n/*~\n  name: Material Toolbar with Icons\n  category: Toolbar\n  elements: ons-toolbar\n  markup: |\n    <div class=\"toolbar toolbar--material\">\n      <div class=\"toolbar__left toolbar--material__left\">\n        <span class=\"toolbar-button toolbar-button--material\">\n          <i class=\"zmdi zmdi-menu\"></i>\n        </span>\n      </div>\n      <div class=\"toolbar__center toolbar--material__center\">\n        Title\n      </div>\n      <div class=\"toolbar__right toolbar--material__right\">\n        <span class=\"toolbar-button toolbar-button--material\">\n          <i class=\"zmdi zmdi-search\"></i>\n        </span>\n        <span class=\"toolbar-button toolbar-button--material\">\n          <i class=\"zmdi zmdi-favorite\"></i>\n        </span>\n        <span class=\"toolbar-button toolbar-button--material\">\n          <i class=\"zmdi zmdi-more-vert\"></i>\n        </span>\n      </div>\n    </div>\n*/\n/*~\n  name: Transparent Toolbar\n  category: Toolbar\n  elements: ons-toolbar\n  markup: |\n    <div class=\"toolbar toolbar--transparent\">\n      <div class=\"toolbar__left\">\n        <span class=\"toolbar-button\">\n          <i class=\"ion-navicon\" style=\"font-size:32px; vertical-align:-6px;\"></i>\n        </span>\n      </div>\n      <div class=\"toolbar__center\">\n        Navigation Bar\n      </div>\n      <div class=\"toolbar__right\">\n        <span class=\"toolbar-button\">Label</span>\n      </div>\n    </div>\n*/\n.toolbar--transparent {\n  background-color: transparent;\n  box-shadow: none;\n  background-image: none;\n  border-bottom: none;\n}\n/*~\n  name: Button\n  category: Button\n  elements: ons-button\n  markup: |\n    <button class=\"button\">Button</button>\n    <button class=\"button\" disabled>Button</button>\n*/\n.button {\n  position: relative;\n  display: inline-block;\n  box-sizing: border-box;\n  background-clip: padding-box;\n  padding: 0;\n  margin: 0;\n  font: inherit;\n  color: inherit;\n  background: transparent;\n  border: none;\n  line-height: normal;\n  font-family: -apple-system, 'Helvetica Neue', 'Helvetica', 'Arial', 'Lucida Grande', sans-serif;\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n  font-weight: 400;\n  cursor: default;\n  -webkit-user-select: none;\n     -moz-user-select: none;\n      -ms-user-select: none;\n          user-select: none;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n  overflow: hidden;\n  height: auto;\n  text-decoration: none;\n  padding: 4px 10px;\n  font-size: 17px;\n  line-height: 32px;\n  letter-spacing: 0;\n  color: white;\n  vertical-align: middle;\n  background-color: #0076ff;\n  border: 0 solid currentColor;\n  border-radius: 3px;\n  transition: none;\n}\n.button:hover {\n  transition: none;\n}\n.button:active {\n  background-color: #0076ff;\n  transition: none;\n  opacity: 0.2;\n}\n.button:focus {\n  outline: 0;\n}\n.button:disabled, .button[disabled] {\n  opacity: 0.3;\n  cursor: default;\n  pointer-events: none;\n}\n/*~\n  name: Outline Button\n  category: Button\n  elements: ons-button\n  markup: |\n    <button class=\"button button--outline\">Button</button>\n    <button class=\"button button--outline\" disabled>Button</button>\n*/\n.button--outline {\n  background-color: transparent;\n  border: 1px solid #0076ff;\n  color: #0076ff;\n}\n.button--outline:active {\n  background-color: rgb(179, 214, 255);\n  border: 1px solid #0076ff;\n  color: #0076ff;\n  opacity: 1;\n}\n.button--outline:hover {\n  border: 1px solid #0076ff;\n  transition: 0;\n}\n/*~\n  name: Light Button\n  category: Button\n  elements: ons-button\n  markup: |\n    <button class=\"button button--light\">Button</button>\n    <button class=\"button button--light\" disabled>Button</button>\n*/\n.button--light {\n  background-color: transparent;\n  color: rgba(0, 0, 0, 0.4);\n  border: 1px solid rgba(0, 0, 0, 0.2);\n}\n.button--light:active {\n  background-color: rgba(0, 0, 0, 0.05);\n  color: rgba(0, 0, 0, 0.4);\n  border: 1px solid rgba(0, 0, 0, 0.2);\n  opacity: 1;\n}\n/*~\n  name: Quiet Button\n  category: Button\n  elements: ons-button\n  markup: |\n    <button class=\"button--quiet\">Button</button>\n    <button class=\"button--quiet\" disabled>Button</button>\n*/\n.button--quiet {\n  position: relative;\n  display: inline-block;\n  box-sizing: border-box;\n  background-clip: padding-box;\n  padding: 0;\n  margin: 0;\n  font: inherit;\n  color: inherit;\n  background: transparent;\n  border: none;\n  line-height: normal;\n  font-family: -apple-system, 'Helvetica Neue', 'Helvetica', 'Arial', 'Lucida Grande', sans-serif;\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n  font-weight: 400;\n  cursor: default;\n  -webkit-user-select: none;\n     -moz-user-select: none;\n      -ms-user-select: none;\n          user-select: none;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n  overflow: hidden;\n  height: auto;\n  text-decoration: none;\n  padding: 4px 10px;\n  font-size: 17px;\n  line-height: 32px;\n  letter-spacing: 0;\n  color: white;\n  vertical-align: middle;\n  background-color: #0076ff;\n  border: 0 solid currentColor;\n  border-radius: 3px;\n  transition: none;\n  background: transparent;\n  border: 1px solid transparent;\n  box-shadow: none;\n  background: transparent;\n  color: #0076ff;\n  border: none;\n}\n.button--quiet:disabled,\n.button--quiet[disabled] {\n  opacity: 0.3;\n  cursor: default;\n  pointer-events: none;\n  border: none;\n}\n.button--quiet:hover {\n  transition: none;\n}\n.button--quiet:focus {\n  outline: 0;\n}\n.button--quiet:active {\n  background-color: transparent;\n  border: none;\n  transition: none;\n  opacity: 0.2;\n  color: #0076ff;\n}\n/*~\n  name: Call To Action Button\n  category: Button\n  elements: ons-button\n  markup: |\n    <button class=\"button--cta\">Button</button>\n    <button class=\"button--cta\" disabled>Button</button>\n*/\n.button--cta {\n  position: relative;\n  display: inline-block;\n  box-sizing: border-box;\n  background-clip: padding-box;\n  padding: 0;\n  margin: 0;\n  font: inherit;\n  color: inherit;\n  background: transparent;\n  border: none;\n  line-height: normal;\n  font-family: -apple-system, 'Helvetica Neue', 'Helvetica', 'Arial', 'Lucida Grande', sans-serif;\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n  font-weight: 400;\n  cursor: default;\n  -webkit-user-select: none;\n     -moz-user-select: none;\n      -ms-user-select: none;\n          user-select: none;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n  overflow: hidden;\n  height: auto;\n  text-decoration: none;\n  padding: 4px 10px;\n  font-size: 17px;\n  line-height: 32px;\n  letter-spacing: 0;\n  color: white;\n  vertical-align: middle;\n  background-color: #0076ff;\n  border: 0 solid currentColor;\n  border-radius: 3px;\n  transition: none;\n  border: none;\n  background-color: #25a6d9;\n  color: white;\n}\n.button--cta:hover {\n  transition: none;\n}\n.button--cta:focus {\n  outline: 0;\n}\n.button--cta:active {\n  color: white;\n  background-color: #25a6d9;\n  transition: none;\n  opacity: 0.2;\n}\n.button--cta:disabled,\n.button--cta[disabled] {\n  opacity: 0.3;\n  cursor: default;\n  pointer-events: none;\n}\n/*\n  name: Large Button\n  category: Button\n  elements: ons-button\n  markup: |\n    <button class=\"button button--large\" style=\"width: 95%; margin: 0 auto;\">Button</button>\n*/\n.button--large {\n  font-size: 17px;\n  font-weight: 500;\n  line-height: 36px;\n  padding: 4px 12px;\n  display: block;\n  width: 100%;\n  text-align: center;\n}\n.button--large:active {\n  background-color: #0076ff;\n  transition: none;\n  opacity: 0.2;\n  transition: none;\n}\n.button--large:disabled,\n.button--large[disabled] {\n  opacity: 0.3;\n  cursor: default;\n  pointer-events: none;\n}\n.button--large:hover {\n  transition: none;\n}\n.button--large:focus {\n  outline: 0;\n}\n/*~\n  name: Large Quiet Button\n  category: Button\n  elements: ons-button\n  markup: |\n    <button class=\"button--large--quiet\" style=\"width: 95%; margin: 0 auto;\">Button</button>\n*/\n.button--large--quiet { /* stylelint-disable-line */\n  position: relative;\n  display: inline-block;\n  box-sizing: border-box;\n  background-clip: padding-box;\n  padding: 0;\n  margin: 0;\n  font: inherit;\n  color: inherit;\n  background: transparent;\n  border: none;\n  line-height: normal;\n  font-family: -apple-system, 'Helvetica Neue', 'Helvetica', 'Arial', 'Lucida Grande', sans-serif;\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n  font-weight: 400;\n  cursor: default;\n  -webkit-user-select: none;\n     -moz-user-select: none;\n      -ms-user-select: none;\n          user-select: none;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n  overflow: hidden;\n  height: auto;\n  text-decoration: none;\n  padding: 4px 10px;\n  font-size: 17px;\n  line-height: 32px;\n  letter-spacing: 0;\n  color: white;\n  vertical-align: middle;\n  background-color: #0076ff;\n  border: 0 solid currentColor;\n  border-radius: 3px;\n  transition: none;\n  font-size: 17px;\n  font-weight: 500;\n  line-height: 36px;\n  padding: 4px 12px;\n  display: block;\n  width: 100%;\n  background: transparent;\n  border: 1px solid transparent;\n  box-shadow: none;\n  color: #0076ff;\n  text-align: center;\n}\n.button--large--quiet:active { /* stylelint-disable-line */\n  transition: none;\n  opacity: 0.2;\n  color: #0076ff;\n  background: transparent;\n  border: 1px solid transparent;\n  box-shadow: none;\n}\n.button--large--quiet:disabled, .button--large--quiet[disabled] { /* stylelint-disable-line */\n  opacity: 0.3;\n  cursor: default;\n  pointer-events: none;\n}\n.button--large--quiet:hover { /* stylelint-disable-line */\n  transition: none;\n}\n.button--large--quiet:focus { /* stylelint-disable-line */\n  outline: 0;\n}\n/*~\n  name: Large Call To Action Button\n  category: Button\n  elements: ons-button\n  markup: |\n    <button class=\"button--large--cta\" style=\"width: 95%; margin: 0 auto;\">Button</button>\n*/\n.button--large--cta { /* stylelint-disable-line */\n  position: relative;\n  display: inline-block;\n  box-sizing: border-box;\n  background-clip: padding-box;\n  padding: 0;\n  margin: 0;\n  font: inherit;\n  color: inherit;\n  background: transparent;\n  border: none;\n  line-height: normal;\n  font-family: -apple-system, 'Helvetica Neue', 'Helvetica', 'Arial', 'Lucida Grande', sans-serif;\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n  font-weight: 400;\n  cursor: default;\n  -webkit-user-select: none;\n     -moz-user-select: none;\n      -ms-user-select: none;\n          user-select: none;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n  overflow: hidden;\n  height: auto;\n  text-decoration: none;\n  padding: 4px 10px;\n  font-size: 17px;\n  line-height: 32px;\n  letter-spacing: 0;\n  color: white;\n  vertical-align: middle;\n  background-color: #0076ff;\n  border: 0 solid currentColor;\n  border-radius: 3px;\n  transition: none;\n  border: none;\n  background-color: #25a6d9;\n  color: white;\n  font-size: 17px;\n  font-weight: 500;\n  line-height: 36px;\n  padding: 4px 12px;\n  width: 100%;\n  text-align: center;\n  display: block;\n}\n.button--large--cta:hover { /* stylelint-disable-line */\n  transition: none;\n}\n.button--large--cta:focus { /* stylelint-disable-line */\n  outline: 0;\n}\n.button--large--cta:active { /* stylelint-disable-line */\n  color: white;\n  background-color: #25a6d9;\n  transition: none;\n  opacity: 0.2;\n}\n.button--large--cta:disabled, .button--large--cta[disabled] { /* stylelint-disable-line */\n  opacity: 0.3;\n  cursor: default;\n  pointer-events: none;\n}\n/*~\n  name: Material Button\n  category: Button\n  elements: ons-button\n  markup: |\n    <button class=\"button button--material\">BUTTON</button>\n    <button class=\"button button--material\" disabled>DISABLED</button>\n*/\n.button--material {\n  position: relative;\n  display: inline-block;\n  box-sizing: border-box;\n  background-clip: padding-box;\n  padding: 0;\n  margin: 0;\n  font: inherit;\n  color: inherit;\n  background: transparent;\n  border: none;\n  line-height: normal;\n  font-family: -apple-system, 'Helvetica Neue', 'Helvetica', 'Arial', 'Lucida Grande', sans-serif;\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n  font-weight: 400;\n  cursor: default;\n  -webkit-user-select: none;\n     -moz-user-select: none;\n      -ms-user-select: none;\n          user-select: none;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n  overflow: hidden;\n  height: auto;\n  text-decoration: none;\n  padding: 4px 10px;\n  font-size: 17px;\n  line-height: 32px;\n  letter-spacing: 0;\n  color: white;\n  vertical-align: middle;\n  background-color: #0076ff;\n  border: 0 solid currentColor;\n  border-radius: 3px;\n  transition: none;\n  box-shadow:\n      0 2px 2px 0 rgba(0, 0, 0, .14),\n      0 1px 5px 0 rgba(0, 0, 0, .12),\n      0 3px 1px -2px rgba(0, 0, 0, .2);\n  font-family: 'Roboto', 'Noto', sans-serif;\n  -webkit-font-smoothing: antialiased;\n  font-weight: 400;\n  min-height: 36px;\n  line-height: 36px;\n  padding: 0 16px;\n  text-align: center;\n  font-size: 14px;\n  -webkit-transform: translate3d(0, 0, 0);\n          transform: translate3d(0, 0, 0);\n  text-transform: uppercase;\n  background-color: #2979ff;\n  color: #ffffff;\n  font-weight: 500;\n  transition: background-color 0.25s linear;\n  opacity: 1;\n  transition: all 0.25s linear;\n}\n.button--material:hover {\n  transition: all 0.25s linear;\n}\n.button--material:active {\n  box-shadow:\n      0 6px 10px 0 rgba(0, 0, 0, .14),\n      0 1px 18px 0 rgba(0, 0, 0, .12),\n      0 3px 5px -1px rgba(0, 0, 0, .4);\n  background-color: #2979ff;\n  opacity: 0.9;\n  transition: all 0.25s linear;\n}\n.button--material:focus {\n  outline: 0;\n}\n.button--material:disabled,\n.button--material[disabled] {\n  transition: none;\n  box-shadow: none;\n  background-color: rgba(79, 79, 79, 0.26);\n  color: rgba(0, 0, 0, 0.26);\n  opacity: 1;\n}\n/*~\n  name: Material Flat Button\n  category: Button\n  elements: ons-button\n  markup: |\n    <button class=\"button button--material--flat\">BUTTON</button>\n    <button class=\"button button--material--flat\" disabled>DISABLED</button>\n*/\n.button--material--flat { /* stylelint-disable-line */\n  position: relative;\n  display: inline-block;\n  box-sizing: border-box;\n  background-clip: padding-box;\n  padding: 0;\n  margin: 0;\n  font: inherit;\n  color: inherit;\n  background: transparent;\n  border: none;\n  line-height: normal;\n  font-family: -apple-system, 'Helvetica Neue', 'Helvetica', 'Arial', 'Lucida Grande', sans-serif;\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n  font-weight: 400;\n  cursor: default;\n  -webkit-user-select: none;\n     -moz-user-select: none;\n      -ms-user-select: none;\n          user-select: none;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n  overflow: hidden;\n  height: auto;\n  text-decoration: none;\n  padding: 4px 10px;\n  font-size: 17px;\n  line-height: 32px;\n  letter-spacing: 0;\n  color: white;\n  vertical-align: middle;\n  background-color: #0076ff;\n  border: 0 solid currentColor;\n  border-radius: 3px;\n  transition: none;\n  box-shadow:\n      0 2px 2px 0 rgba(0, 0, 0, .14),\n      0 1px 5px 0 rgba(0, 0, 0, .12),\n      0 3px 1px -2px rgba(0, 0, 0, .2);\n  font-family: 'Roboto', 'Noto', sans-serif;\n  -webkit-font-smoothing: antialiased;\n  font-weight: 400;\n  min-height: 36px;\n  line-height: 36px;\n  padding: 0 16px;\n  text-align: center;\n  font-size: 14px;\n  -webkit-transform: translate3d(0, 0, 0);\n          transform: translate3d(0, 0, 0);\n  text-transform: uppercase;\n  background-color: #2979ff;\n  color: #ffffff;\n  font-weight: 500;\n  transition: background-color 0.25s linear;\n  box-shadow: none;\n  background-color: transparent;\n  color: #2979ff;\n  transition: all 0.25s linear;\n}\n.button--material--flat:hover { /* stylelint-disable-line */\n  transition: all 0.25s linear;\n}\n.button--material--flat:focus { /* stylelint-disable-line */\n  box-shadow: none;\n  background-color: transparent;\n  color: #2979ff;\n  outline: 0;\n  opacity: 1;\n  border: none;\n}\n.button--material--flat:active { /* stylelint-disable-line */\n  box-shadow: none;\n  outline: 0;\n  opacity: 1;\n  border: none;\n  background-color: rgba(153, 153, 153, 0.2);\n  color: #2979ff;\n  transition: all 0.25s linear;\n}\n.button--material--flat:disabled, .button--material--flat[disabled] {/* stylelint-disable-line */\n  transition: none;\n  opacity: 1;\n  box-shadow: none;\n  background-color: transparent;\n  color: rgba(0, 0, 0, 0.26);\n}\n/*~\n  name: Button Bar\n  category: Segment\n  markup: |\n    <div class=\"button-bar\" style=\"width:280px;\">\n      <div class=\"button-bar__item\">\n        <button class=\"button-bar__button\">One</button>\n      </div>\n      <div class=\"button-bar__item\">\n        <button class=\"button-bar__button\">Two</button>\n      </div>\n      <div class=\"button-bar__item\">\n        <button class=\"button-bar__button\">Three</button>\n      </div>\n    </div>\n*/\n.button-bar {\n  font-family: -apple-system, 'Helvetica Neue', 'Helvetica', 'Arial', 'Lucida Grande', sans-serif;\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n  font-weight: 400;\n  display: -webkit-inline-box;\n  display: -webkit-inline-flex;\n  display: inline-flex;\n  -webkit-box-align: stretch;\n  -webkit-align-items: stretch;\n          align-items: stretch;\n  -webkit-align-content: stretch;\n          align-content: stretch;\n  -webkit-flex-wrap: nowrap;\n          flex-wrap: nowrap;\n  margin: 0;\n  padding: 0;\n  border: none;\n}\n.button-bar__item {\n  font-family: -apple-system, 'Helvetica Neue', 'Helvetica', 'Arial', 'Lucida Grande', sans-serif;\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n  font-weight: 400;\n  border-radius: 0;\n  width: 100%;\n  padding: 0;\n  margin: 0;\n  position: relative;\n  overflow: hidden;\n  box-sizing: border-box;\n}\n.button-bar__button {\n  font-family: -apple-system, 'Helvetica Neue', 'Helvetica', 'Arial', 'Lucida Grande', sans-serif;\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n  font-weight: 400;\n  border-radius: 0;\n  background-color: transparent;\n  color: #0076ff;\n  border: 1px solid #0076ff;\n  border-top-width: 1px;\n  border-bottom-width: 1px;\n  border-right-width: 1px;\n  border-left-width: 0;\n  font-weight: 400;\n  padding: 0;\n  font-size: 13px;\n  height: 27px;\n  line-height: 27px;\n  width: 100%;\n  transition: background-color 0.2s linear, color 0.2s linear;\n  box-sizing: border-box;\n}\n.button-bar__button:disabled {\n  opacity: 0.3;\n  cursor: default;\n  pointer-events: none;\n}\n.button-bar__button:hover {\n  transition: none;\n}\n.button-bar__button:focus {\n  outline: 0;\n}\n:checked + .button-bar__button {\n  background-color: #0076ff;\n  color: #fff;\n  transition: none;\n}\n.button-bar__button:active,\n:active + .button-bar__button {\n  background-color: rgb(179, 214, 255);\n  border: 0 solid #0076ff;\n  border-top: 1px solid #0076ff;\n  border-bottom: 1px solid #0076ff;\n  border-right: 1px solid #0076ff;\n  font-size: 13px;\n  width: 100%;\n  transition: none;\n}\n.button-bar__item:first-child > .button-bar__button {\n  border-left-width: 1px;\n  border-radius: 4px 0 0 4px;\n}\n.button-bar__item:last-child > .button-bar__button {\n  border-right-width: 1px;\n  border-radius: 0 4px 4px 0;\n}\n/*~\n  name: Segment\n  category: Segment\n  markup: |\n    <div class=\"segment\" style=\"width: 280px; margin: 0 auto;\">\n      <button class=\"segment__item\">\n        <input type=\"radio\" class=\"segment__input\" name=\"segment-a\" checked>\n        <div class=\"segment__button\">One</div>\n      </button>\n      <button class=\"segment__item\">\n        <input type=\"radio\" class=\"segment__input\" name=\"segment-a\">\n        <div class=\"segment__button\">Two</div>\n      </button>\n      <button class=\"segment__item\">\n        <input type=\"radio\" class=\"segment__input\" name=\"segment-a\">\n        <div class=\"segment__button\">Three</div>\n      </button>\n    </div>\n*/\n.segment {\n  font-family: -apple-system, 'Helvetica Neue', 'Helvetica', 'Arial', 'Lucida Grande', sans-serif;\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n  font-weight: 400;\n  display: -webkit-inline-box;\n  display: -webkit-inline-flex;\n  display: inline-flex;\n  -webkit-box-align: stretch;\n  -webkit-align-items: stretch;\n          align-items: stretch;\n  -webkit-align-content: stretch;\n          align-content: stretch;\n  -webkit-flex-wrap: nowrap;\n          flex-wrap: nowrap;\n  margin: 0;\n  padding: 0;\n  border: none;\n}\n.segment__item {\n  font-family: -apple-system, 'Helvetica Neue', 'Helvetica', 'Arial', 'Lucida Grande', sans-serif;\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n  font-weight: 400;\n  border-radius: 0;\n  width: 100%;\n  padding: 0;\n  margin: 0;\n  position: relative;\n  overflow: hidden;\n  box-sizing: border-box;\n  display: block;\n  background-color: transparent;\n  border: none;\n}\n.segment__input {\n  position: absolute;\n  right: 0;\n  top: 0;\n  left: 0;\n  bottom: 0;\n  padding: 0;\n  border: 0;\n  background-color: transparent;\n  z-index: 1;\n  vertical-align: top;\n  outline: none;\n  width: 100%;\n  height: 100%;\n  margin: 0;\n  -webkit-appearance: none;\n     -moz-appearance: none;\n          appearance: none;\n}\n.segment__button {\n  font-family: -apple-system, 'Helvetica Neue', 'Helvetica', 'Arial', 'Lucida Grande', sans-serif;\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n  font-weight: 400;\n  border-radius: 0;\n  background-color: transparent;\n  color: #0076ff;\n  border: 1px solid #0076ff;\n  border-top-width: 1px;\n  border-bottom-width: 1px;\n  border-right-width: 1px;\n  border-left-width: 0;\n  font-weight: 400;\n  padding: 0;\n  font-size: 13px;\n  height: 29px;\n  line-height: 29px;\n  width: 100%;\n  transition: background-color 0.2s linear, color 0.2s linear;\n  box-sizing: border-box;\n  text-align: center;\n}\n.segment__item:disabled {\n  opacity: 0.3;\n  cursor: default;\n  pointer-events: none;\n}\n.segment__button:hover {\n  transition: none;\n}\n.segment__button:focus {\n  outline: 0;\n}\n:active + .segment__button {\n  background-color: rgb(179, 214, 255);\n  border: 0 solid #0076ff;\n  border-top: 1px solid #0076ff;\n  border-bottom: 1px solid #0076ff;\n  border-right: 1px solid #0076ff;\n  font-size: 13px;\n  width: 100%;\n  transition: none;\n}\n:checked + .segment__button {\n  background-color: #0076ff;\n  color: #fff;\n  transition: none;\n}\n.segment__item:first-child > .segment__button {\n  border-left-width: 1px;\n  border-radius: 4px 0 0 4px;\n}\n.segment__item:last-child > .segment__button {\n  border-right-width: 1px;\n  border-radius: 0 4px 4px 0;\n}\n/*~\n  name: Material Segment\n  category: Segment\n  markup: |\n    <div class=\"segment segment--material\" style=\"width: 280px; margin: 0 auto;\">\n      <button class=\"segment__item segment--material__item\">\n        <input type=\"radio\" class=\"segment__input segment--material__input\" name=\"segment-b\" checked>\n        <div class=\"segment__button segment--material__button\">One</div>\n      </button>\n      <button class=\"segment__item segment--material__item\">\n        <input type=\"radio\" class=\"segment__input segment--material__input\" name=\"segment-b\">\n        <div class=\"segment__button segment--material__button\">Two</div>\n      </button>\n      <button class=\"segment__item segment--material__item\">\n        <input type=\"radio\" class=\"segment__input segment--material__input\" name=\"segment-b\">\n        <div class=\"segment__button segment--material__button\">Three</div>\n      </button>\n    </div>\n*/\n.segment--material {\n  border-radius: 2px;\n  overflow: hidden;\n  box-shadow: 0 0 2px 0 rgba(0, 0, 0, .12), 0 2px 2px 0 rgba(0, 0, 0, .24);\n}\n.segment--material__button {\n  font-family: 'Roboto', 'Noto', sans-serif;\n  -webkit-font-smoothing: antialiased;\n  font-weight: 400;\n  font-size: 14px;\n  height: 32px;\n  line-height: 32px;\n  border-width: 0;\n  color: rgba(0, 0, 0, 0.38);\n  border-radius: 0;\n  background-color: #fafafa;\n}\n:active + .segment--material__button {\n  background-color: #fafafa;\n  border-radius: 0;\n  border-width: 0;\n  font-size: 14px;\n  transition: none;\n  color: rgba(0, 0, 0, 0.38);\n}\n:checked + .segment--material__button {\n  background-color: #c8c8c8;\n  color: #353535;\n  border-radius: 0;\n  border-width: 0;\n}\n.segment--material__item:first-child > .segment--material__button,\n.segment--material__item:last-child > .segment--material__button {\n  border-radius: 0;\n  border-width: 0;\n}\n:root { /* Text color */ /* Text color active */\n}\n/*~\n  name: Icon Tabbar\n  category: Tabbar\n  elements: ons-tabbar ons-tab\n  markup: |\n    <!-- Prerequisite=This example use ionicons(http://ionicons.com) to display icons. -->\n    <div class=\"tabbar\">\n      <label class=\"tabbar__item\">\n        <input type=\"radio\" name=\"tabbar-a\" checked=\"checked\">\n        <button class=\"tabbar__button\">\n          <i class=\"tabbar__icon ion-stop\"></i>\n          <div class=\"tabbar__label\">One</div>\n        </button>\n      </label>\n\n      <label class=\"tabbar__item\">\n        <input type=\"radio\" name=\"tabbar-a\">\n        <button class=\"tabbar__button\">\n          <i class=\"tabbar__icon ion-record\"></i>\n          <div class=\"tabbar__label\">Two</div>\n        </button>\n      </label>\n\n      <label class=\"tabbar__item\">\n        <input type=\"radio\" name=\"tabbar-a\">\n        <button class=\"tabbar__button\">\n          <i class=\"tabbar__icon ion-star\"></i>\n          <div class=\"tabbar__label\">Three</div>\n        </button>\n      </label>\n    </div>\n*/\n/*~\n  name: Tabbar\n  category: Tabbar\n  elements: ons-tabbar ons-tab\n  markup: |\n    <div class=\"tabbar\">\n      <label class=\"tabbar__item\">\n        <input type=\"radio\" name=\"tabbar-c\" checked=\"checked\">\n        <button class=\"tabbar__button\">\n          <div class=\"tabbar__label\">One</div>\n        </button>\n      </label>\n\n      <label class=\"tabbar__item\">\n        <input type=\"radio\" name=\"tabbar-c\">\n        <button class=\"tabbar__button\">\n          <div class=\"tabbar__label\">Two</div>\n        </button>\n      </label>\n\n      <label class=\"tabbar__item\">\n        <input type=\"radio\" name=\"tabbar-c\">\n        <button class=\"tabbar__button\">\n          <div class=\"tabbar__label\">Three</div>\n        </button>\n      </label>\n    </div>\n*/\n.tabbar {\n  font-family: -apple-system, 'Helvetica Neue', 'Helvetica', 'Arial', 'Lucida Grande', sans-serif;\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n  font-weight: 400;\n  display: -webkit-box;\n  display: -webkit-flex;\n  display: flex;\n  position: absolute;\n  bottom: 0;\n  left: 0;\n  right: 0;\n  white-space: nowrap;\n  margin: 0;\n  padding: 0;\n  height: 49px;\n  background-color: #fafafa;\n  border-top: 1px solid #ccc;\n  width: 100%;\n}\n@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {\n  .tabbar {\n    border-top: none;\n    background-size: 100% 1px;\n    background-repeat: no-repeat;\n    background-position: top;\n    background-image: linear-gradient(180deg, #ccc, #ccc 50%, transparent 50%);\n  }\n}\n.tabbar__item {\n  font-family: -apple-system, 'Helvetica Neue', 'Helvetica', 'Arial', 'Lucida Grande', sans-serif;\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n  font-weight: 400;\n  position: relative;\n  -webkit-box-flex: 1;\n  -webkit-flex-grow: 1;\n          flex-grow: 1;\n  -webkit-flex-basis: 0;\n          flex-basis: 0;\n  width: auto;\n  border-radius: 0;\n}\n.tabbar__item > input {\n  position: absolute;\n  right: 0;\n  top: 0;\n  left: 0;\n  bottom: 0;\n  padding: 0;\n  border: 0;\n  background-color: transparent;\n  z-index: 1;\n  vertical-align: top;\n  outline: none;\n  width: 100%;\n  height: 100%;\n  margin: 0;\n  -webkit-appearance: none;\n     -moz-appearance: none;\n          appearance: none;\n}\n.tabbar__button {\n  font-family: -apple-system, 'Helvetica Neue', 'Helvetica', 'Arial', 'Lucida Grande', sans-serif;\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n  font-weight: 400;\n  box-sizing: border-box;\n  background-clip: padding-box;\n  padding: 0;\n  margin: 0;\n  font: inherit;\n  color: inherit;\n  background: transparent;\n  border: none;\n  line-height: normal;\n  cursor: default;\n  -webkit-user-select: none;\n     -moz-user-select: none;\n      -ms-user-select: none;\n          user-select: none;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n  overflow: hidden;\n  position: relative;\n  display: inline-block;\n  text-decoration: none;\n  padding: 0;\n  height: 49px;\n  letter-spacing: 0;\n  color: #999;\n  vertical-align: top;\n  background-color: transparent;\n  border-top: none;\n  width: 100%;\n  font-weight: 400;\n  line-height: 49px;\n}\n@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {\n  .tabbar__button {\n    border-top: none;\n  }\n}\n.tabbar__icon {\n  font-size: 24px;\n  padding: 0;\n  margin: 0;\n  line-height: 26px;\n  display: block !important; /* stylelint-disable-line declaration-no-important */\n  height: 28px;\n}\n.tabbar__label {\n  font-family: -apple-system, 'Helvetica Neue', 'Helvetica', 'Arial', 'Lucida Grande', sans-serif;\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n  font-weight: 400;\n}\n.tabbar__badge.notification { /* FIXME */\n  position: absolute;\n  top: 5px;\n  z-index: 10;\n  font-size: 12px;\n  height: 16px;\n  line-height: 16px;\n  border-radius: 8px;\n}\n.tabbar__icon + .tabbar__label {\n  font-size: 10px;\n  line-height: 1;\n  margin: 0;\n  font-weight: 400;\n}\n.tabbar__label:first-child {\n  font-size: 16px;\n  line-height: 49px;\n  margin: 0;\n  padding: 0;\n}\n:checked + .tabbar__button {\n  color: #0076ff;\n  background-color: transparent;\n  box-shadow: none;\n  border-top: none;\n}\n.tabbar__button:disabled {\n  opacity: 0.3;\n  cursor: default;\n  pointer-events: none;\n}\n.tabbar__button:focus {\n  z-index: 1;\n  border-top: none;\n  box-shadow: none;\n  outline: 0;\n}\n.tabbar__content {\n  position: absolute;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 49px;\n  z-index: 0;\n}\n.tabbar--autogrow .tabbar__item {\n  -webkit-flex-basis: auto;\n          flex-basis: auto;\n}\n/*~\n  name: Icon Only Tabbar\n  category: Tabbar\n  elements: ons-tabbar ons-tab\n  markup: |\n    <!-- Prerequisite=This example use ionicons(http://ionicons.com) to display icons. -->\n    <div class=\"tabbar\">\n      <label class=\"tabbar__item\">\n        <input type=\"radio\" name=\"tabbar-b\" checked=\"checked\">\n        <button class=\"tabbar__button\">\n          <i class=\"tabbar__icon ion-stop\"></i>\n        </button>\n      </label>\n\n      <label class=\"tabbar__item\">\n        <input type=\"radio\" name=\"tabbar-b\">\n        <button class=\"tabbar__button\">\n          <i class=\"tabbar__icon ion-record\"></i>\n        </button>\n      </label>\n\n      <label class=\"tabbar__item\">\n        <input type=\"radio\" name=\"tabbar-b\">\n        <button class=\"tabbar__button\">\n          <i class=\"tabbar__icon ion-star\"></i>\n        </button>\n      </label>\n\n    </div>\n*/\n/*~\n  name: Top Tabbar\n  category: Tabbar\n  elements: ons-tabbar ons-tab\n  markup: |\n    <div class=\"tabbar tabbar--top\">\n      <label class=\"tabbar__item\">\n        <input type=\"radio\" name=\"top-tabbar-a\" checked=\"checked\">\n        <button class=\"tabbar__button\">\n          <i class=\"tabbar__icon ion-stop\"></i>\n        </button>\n      </label>\n\n      <label class=\"tabbar__item\">\n        <input type=\"radio\" name=\"top-tabbar-a\">\n        <button class=\"tabbar__button\">\n          <i class=\"tabbar__icon ion-record\"></i>\n        </button>\n      </label>\n\n      <label class=\"tabbar__item\">\n        <input type=\"radio\" name=\"top-tabbar-a\">\n        <button class=\"tabbar__button\">\n          <i class=\"tabbar__icon ion-star\"></i>\n        </button>\n      </label>\n    </div>\n*/\n.tabbar--top {\n  position: relative;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: auto;\n  border-top: none;\n  border-bottom: 1px solid #ccc;\n}\n@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {\n  .tabbar--top {\n    border-bottom: none;\n    background-size: 100% 1px;\n    background-repeat: no-repeat;\n    background-position: bottom;\n    background-image: linear-gradient(0deg, #ccc, #ccc 50%, transparent 50%);\n  }\n}\n.tabbar--top__content {\n  top: 49px;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  z-index: 0;\n}\n/*~\n  name: Bordered Top Tabbar\n  category: Tabbar\n  elements: ons-tabbar ons-tab\n  markup: |\n    <div class=\"tabbar tabbar--top tabbar--top-border\">\n      <label class=\"tabbar__item tabbar--top-border__item\">\n        <input type=\"radio\" name=\"top-tabbar-b\" checked=\"checked\">\n        <button class=\"tabbar__button tabbar--top-border__button\">\n          Home\n        </button>\n      </label>\n\n      <label class=\"tabbar__item tabbar--top-border__item\">\n        <input type=\"radio\" name=\"top-tabbar-b\">\n        <button class=\"tabbar__button tabbar--top-border__button\">\n          Comments\n        </button>\n      </label>\n\n      <label class=\"tabbar__item tabbar--top-border__item\">\n        <input type=\"radio\" name=\"top-tabbar-b\">\n        <button class=\"tabbar__button tabbar--top-border__button\">\n          Activity\n        </button>\n      </label>\n    </div>\n*/\n/*~\n  name: Material Tabbar\n  category: Tabbar\n  elements: ons-tabbar ons-tab\n  markup: |\n    <div class=\"tabbar tabbar--top tabbar--material\">\n      <label class=\"tabbar__item tabbar--material__item\">\n        <input type=\"radio\" name=\"tabbar-material-a\" checked=\"checked\">\n        <button class=\"tabbar__button tabbar--material__button\">\n          Music\n        </button>\n      </label>\n\n      <label class=\"tabbar__item tabbar--material__item\">\n        <input type=\"radio\" name=\"tabbar-material-a\">\n        <button class=\"tabbar__button tabbar--material__button\">\n          Movies\n        </button>\n      </label>\n\n      <label class=\"tabbar__item tabbar--material__item\">\n        <input type=\"radio\" name=\"tabbar-material-a\">\n        <button class=\"tabbar__button tabbar--material__button\">\n          Books\n        </button>\n      </label>\n\n      <label class=\"tabbar__item tabbar--material__item\">\n        <input type=\"radio\" name=\"tabbar-material-a\">\n        <button class=\"tabbar__button tabbar--material__button\">\n          Games\n        </button>\n      </label>\n\n    </div>\n*/\n.tabbar--top-border__button {\n  background-color: transparent;\n  border-bottom: 4px solid transparent;\n}\n:checked + .tabbar--top-border__button {\n  background-color: transparent;\n  border-bottom: 4px solid #0076ff;\n}\n.tabbar__border {\n  position: absolute;\n  bottom: 0;\n  left: 0;\n  width: 0;\n  height: 4px;\n  background-color: #0076ff;\n}\n.tabbar--material {\n  background: none;\n  background-color: #ffffff;\n  border-bottom-width: 0;\n  box-shadow:\n    0 4px 2px -2px rgba(0, 0, 0, .14),\n    0 3px 5px -2px rgba(0, 0, 0, .12),\n    0 5px 1px -4px rgba(0, 0, 0, .2);\n}\n.tabbar--material__button {\n  background-color: transparent;\n  color: #31313a;\n  text-transform: uppercase;\n  font-size: 14px;\n  font-weight: 500;\n  font-family: 'Roboto', 'Noto', sans-serif;\n  -webkit-font-smoothing: antialiased;\n  font-weight: 400;\n}\n.tabbar--material__button:after {\n  content: '';\n  display: block;\n  width: 0;\n  height: 2px;\n  bottom: 0;\n  position: absolute;\n  margin-top: -2px;\n  background-color: #31313a;\n}\n:checked + .tabbar--material__button:after {\n  width: 100%;\n  transition: width 0.2s ease-in-out;\n}\n:checked + .tabbar--material__button {\n  background-color: transparent;\n  color: #31313a;\n}\n.tabbar--material__item:not([ripple]):active {\n  background-color: rgba(49, 49, 58, .1);\n}\n.tabbar--material__border {\n  height: 2px;\n  background-color: #31313a;\n}\n/*~\n  name: Material Tabbar (Icon only)\n  category: Tabbar\n  elements: ons-tabbar ons-tab\n  markup: |\n    <div class=\"tabbar tabbar--top tabbar--material\">\n      <label class=\"tabbar__item tabbar--material__item\">\n        <input type=\"radio\" name=\"tabbar-material-b\" checked=\"checked\">\n        <button class=\"tabbar__button tabbar--material__button\">\n          <i class=\"tabbar__icon tabbar--material__icon zmdi zmdi-phone\"></i>\n        </button>\n      </label>\n\n      <label class=\"tabbar__item tabbar--material__item\">\n        <input type=\"radio\" name=\"tabbar-material-b\">\n        <button class=\"tabbar__button tabbar--material__button\">\n          <i class=\"tabbar__icon tabbar--material__icon zmdi zmdi-favorite\"></i>\n        </button>\n      </label>\n\n      <label class=\"tabbar__item tabbar--material__item\">\n        <input type=\"radio\" name=\"tabbar-material-b\">\n        <button class=\"tabbar__button tabbar--material__button\">\n          <i class=\"tabbar__icon tabbar--material__icon zmdi zmdi-pin-account\"></i>\n        </button>\n      </label>\n    </div>\n*/\n.tabbar--material__icon {\n  font-size: 22px !important; /* stylelint-disable-line declaration-no-important */\n  line-height: 36px;\n}\n/*~\n  name: Material Tabbar (Icon and Label)\n  category: Tabbar\n  elements: ons-tabbar ons-tab\n  markup: |\n    <div class=\"tabbar tabbar--top tabbar--material\">\n      <label class=\"tabbar__item tabbar--material__item\">\n        <input type=\"radio\" name=\"tabbar-material-c\" checked=\"checked\">\n        <button class=\"tabbar__button tabbar--material__button\">\n          <i class=\"tabbar__icon tabbar--material__icon zmdi zmdi-phone\"></i>\n          <div class=\"tabbar__label tabbar--material__label\">Call</div>\n        </button>\n      </label>\n\n      <label class=\"tabbar__item tabbar--material__item\">\n        <input type=\"radio\" name=\"tabbar-material-c\">\n        <button class=\"tabbar__button tabbar--material__button\">\n          <i class=\"tabbar__icon tabbar--material__icon zmdi zmdi-favorite\"></i>\n          <div class=\"tabbar__label tabbar--material__label\">Favorites</div>\n        </button>\n      </label>\n\n      <label class=\"tabbar__item tabbar--material__item\">\n        <input type=\"radio\" name=\"tabbar-material-c\">\n        <button class=\"tabbar__button tabbar--material__button\">\n          <i class=\"tabbar__icon tabbar--material__icon zmdi zmdi-delete\"></i>\n          <div class=\"tabbar__label tabbar--material__label\">Delete</div>\n        </button>\n      </label>\n    </div>\n*/\n.tabbar--material__label {\n  font-family: 'Roboto', 'Noto', sans-serif;\n  -webkit-font-smoothing: antialiased;\n  font-weight: 400;\n}\n.tabbar--material__label:first-child {\n  font-family: 'Roboto', 'Noto', sans-serif;\n  -webkit-font-smoothing: antialiased;\n  font-weight: 400;\n  letter-spacing: 0.015em;\n  font-weight: 500;\n  font-size: 14px;\n}\n.tabbar--material__icon + .tabbar--material__label {\n  font-size: 10px;\n}\n/*~\n  name: Toolbar Button\n  category: Toolbar Button\n  elements: ons-toolbar-button\n  markup: |\n    <!-- Prerequisite=This example use font-awesome(http://fortawesome.github.io/Font-Awesome/) to display icons. -->\n    <button class=\"toolbar-button\">\n      <i class=\"fa fa-bell\" style=\"font-size:17px\"></i>\n    </button>\n\n    <button class=\"toolbar-button\">\n      Label\n    </button>\n\n    <button class=\"toolbar-button toolbar-button--outline\">\n      <i class=\"fa fa-bell\" style=\"font-size:17px\"></i> Label\n    </button>\n*/\n.toolbar-button {\n  font-family: -apple-system, 'Helvetica Neue', 'Helvetica', 'Arial', 'Lucida Grande', sans-serif;\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n  font-weight: 400;\n  padding: 4px 10px;\n  letter-spacing: 0;\n  color: #0076ff;\n  background-color: rgba(0, 0, 0, 0);\n  border-radius: 2px;\n  border: 1px solid transparent;\n  font-weight: 400;\n  font-size: 17px;\n  transition: none;\n}\n.toolbar-button:active {\n  background-color: rgba(0, 0, 0, 0);\n  transition: none;\n  opacity: 0.2;\n}\n.toolbar-button:disabled,\n.toolbar-button[disabled] {\n  opacity: 0.3;\n  cursor: default;\n  pointer-events: none;\n}\n.toolbar-button:focus {\n  outline: 0;\n  transition: none;\n}\n.toolbar-button:hover {\n  transition: none;\n}\n.toolbar-button--outline {\n  border: 1px solid #0076ff;\n  margin: auto 8px;\n  padding-left: 6px;\n  padding-right: 6px;\n}\n/*~\n  name: Material Toolbar Button\n  category: Toolbar Button\n  elements: ons-toolbar-button\n  markup: |\n    <!-- Prerequisite=This example use Material Design Iconic Font(http://zavoloklom.github.io/material-design-iconic-font/) to display icons. -->\n    <span class=\"toolbar-button toolbar-button--material\">\n      <i class=\"zmdi zmdi-menu\"></i>\n    </span>\n    <span class=\"toolbar-button toolbar-button--material\">\n      Label\n    </span>\n    <span class=\"toolbar-button toolbar-button--material\">\n      <i class=\"zmdi zmdi-favorite\"></i>\n    </span>\n*/\n.toolbar-button--material {\n  font-size: 22px;\n  color: #1e88e5;\n  display: inline-block;\n  padding: 0 12px;\n  height: 100%;\n  margin: 0;\n  border: none;\n  border-radius: 0;\n  vertical-align: baseline;\n  vertical-align: initial;\n  transition: background-color 0.25s linear;\n}\n.toolbar-button--material:first-of-type {\n  margin-left: 4px;\n}\n.toolbar-button--material:last-of-type {\n  margin-right: 4px;\n}\n.toolbar-button--material:active {\n  opacity: 1;\n  transition: background-color 0.25s linear;\n}\n.back-button {\n  height: 44px;\n  line-height: 44px;\n  padding-left: 8px;\n  color: #0076ff;\n  background-color: rgba(0, 0, 0, 0);\n  display: inline-block;\n}\n.back-button:active {\n  opacity: 0.2;\n}\n.back-button__label {\n  display: inline-block;\n  height: 100%;\n  vertical-align: top;\n  line-height: 44px;\n  font-size: 17px;\n  font-weight: 500;\n}\n.back-button__icon {\n  margin-right: 6px;\n  display: -webkit-inline-box;\n  display: -webkit-inline-flex;\n  display: inline-flex;\n  fill: #0076ff;\n  -webkit-box-align: center;\n  -webkit-align-items: center;\n          align-items: center;\n  height: 100%;\n}\n.back-button--material {\n  font-size: 22px;\n  color: #1e88e5;\n  display: inline-block;\n  padding: 0 12px;\n  height: 100%;\n  margin: 0 0 0 4px;\n  border: none;\n  border-radius: 0;\n  vertical-align: baseline;\n  vertical-align: initial;\n  line-height: 56px;\n}\n.back-button--material__label {\n  display: none;\n  font-size: 20px;\n}\n.back-button--material__icon {\n  display: -webkit-inline-box;\n  display: -webkit-inline-flex;\n  display: inline-flex;\n  fill: #1e88e5;\n  -webkit-box-align: center;\n  -webkit-align-items: center;\n          align-items: center;\n  height: 100%;\n}\n.back-button--material:active {\n  opacity: 1;\n}\n:root { /* background color active */\n}\n/*~\n  name: Checkbox\n  category: Checkbox\n  elements: ons-input\n  markup: |\n    <label class=\"checkbox\">\n      <input type=\"checkbox\" class=\"checkbox__input\">\n      <div class=\"checkbox__checkmark\"></div>\n      OFF\n    </label>\n\n    <label class=\"checkbox\">\n      <input type=\"checkbox\" class=\"checkbox__input\" checked=\"checked\">\n      <div class=\"checkbox__checkmark\"></div>\n      ON\n    </label>\n\n    <label class=\"checkbox\">\n      <input type=\"checkbox\" class=\"checkbox__input\" disabled>\n      <div class=\"checkbox__checkmark\"></div>\n      Disabled\n    </label>\n*/\n.checkbox {\n  position: relative;\n  display: inline-block;\n  vertical-align: top;\n  cursor: default;\n  -webkit-user-select: none;\n     -moz-user-select: none;\n      -ms-user-select: none;\n          user-select: none;\n  font-family: -apple-system, 'Helvetica Neue', 'Helvetica', 'Arial', 'Lucida Grande', sans-serif;\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n  font-weight: 400;\n  line-height: 22px;\n}\n.checkbox__checkmark {\n  box-sizing: border-box;\n  background-clip: padding-box;\n  position: relative;\n  display: inline-block;\n  vertical-align: top;\n  cursor: default;\n  -webkit-user-select: none;\n     -moz-user-select: none;\n      -ms-user-select: none;\n          user-select: none;\n  font-family: -apple-system, 'Helvetica Neue', 'Helvetica', 'Arial', 'Lucida Grande', sans-serif;\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n  font-weight: 400;\n  position: relative;\n  height: 22px;\n  width: 22px;\n  pointer-events: none;\n}\n.checkbox__input,\n.checkbox__input:checked {\n  position: absolute;\n  right: 0;\n  top: 0;\n  left: 0;\n  bottom: 0;\n  padding: 0;\n  border: 0;\n  background-color: transparent;\n  z-index: 1;\n  vertical-align: top;\n  outline: none;\n  width: 100%;\n  height: 100%;\n  margin: 0;\n  -webkit-appearance: none;\n     -moz-appearance: none;\n          appearance: none;\n}\n.checkbox__checkmark:before {\n  content: '';\n  position: absolute;\n  box-sizing: border-box;\n  background-clip: padding-box;\n  width: 22px;\n  height: 22px;\n  background: transparent;\n  border: 1px solid #c7c7cd;\n  border-radius: 22px;\n  left: 0;\n}\n/* checkmark's line */\n.checkbox__checkmark:after {\n  content: '';\n  position: absolute;\n  top: 7px;\n  left: 5px;\n  width: 11px;\n  height: 5px;\n  background: transparent;\n  border: 2px solid #fff;\n  border-width: 1px;\n  border-top: none;\n  border-right: none;\n  border-radius: 0;\n  -webkit-transform: rotate(-45deg);\n          transform: rotate(-45deg);\n  opacity: 0;\n}\n:checked + .checkbox__checkmark:before {\n  background: #0076ff;\n  border: none;\n}\n:checked + .checkbox__checkmark:after {\n  opacity: 1;\n}\n:disabled + .checkbox__checkmark {\n  opacity: 0.3;\n  cursor: default;\n  pointer-events: none;\n}\n:disabled:active + .checkbox__checkmark:before { /* FIXME */\n  background: transparent;\n}\n/*~\n  name: No border Checkbox\n  category: Checkbox\n  elements: ons-input\n  markup: |\n    <label class=\"checkbox--noborder\">\n      <input type=\"checkbox\" class=\"checkbox__input checkbox--noborder__input\">\n      <div class=\"checkbox__checkmark checkbox--noborder__checkmark\"></div>\n      OFF\n    </label>\n\n    <label class=\"checkbox--noborder\">\n      <input type=\"checkbox\" class=\"checkbox__input checkbox--noborder__input\" checked=\"checked\">\n      <div class=\"checkbox__checkmark checkbox--noborder__checkmark\"></div>\n      ON\n    </label>\n\n    <label class=\"checkbox--noborder\">\n      <input type=\"checkbox\" class=\"checkbox__input checkbox--noborder__input\" disabled checked=\"checked\">\n      <div class=\"checkbox__checkmark checkbox--noborder__checkmark\"></div>\n      Disabled\n    </label>\n */\n.checkbox--noborder {\n  position: relative;\n  display: inline-block;\n  vertical-align: top;\n  cursor: default;\n  -webkit-user-select: none;\n     -moz-user-select: none;\n      -ms-user-select: none;\n          user-select: none;\n  font-family: -apple-system, 'Helvetica Neue', 'Helvetica', 'Arial', 'Lucida Grande', sans-serif;\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n  font-weight: 400;\n  line-height: 22px;\n  position: relative;\n}\n.checkbox--noborder__input {\n  position: absolute;\n  right: 0;\n  top: 0;\n  left: 0;\n  bottom: 0;\n  padding: 0;\n  border: 0;\n  background-color: transparent;\n  z-index: 1;\n  vertical-align: top;\n  outline: none;\n  width: 100%;\n  height: 100%;\n  margin: 0;\n  -webkit-appearance: none;\n     -moz-appearance: none;\n          appearance: none;\n}\n.checkbox--noborder__checkmark {\n  position: relative;\n  display: inline-block;\n  vertical-align: top;\n  cursor: default;\n  -webkit-user-select: none;\n     -moz-user-select: none;\n      -ms-user-select: none;\n          user-select: none;\n  box-sizing: border-box;\n  background-clip: padding-box;\n  width: 22px;\n  height: 22px;\n  background: transparent;\n  border: none;\n}\n.checkbox--noborder__checkmark:before {\n  content: '';\n  position: absolute;\n  width: 22px;\n  height: 22px;\n  background: transparent;\n  border: none;\n  border-radius: 22px;\n  left: 0;\n}\n/* checkmark's line */\n.checkbox--noborder__checkmark:after {\n  content: '';\n  position: absolute;\n  top: 7px;\n  left: 4px;\n  opacity: 0;\n  width: 11px;\n  height: 4px;\n  background: transparent;\n  border: 2px solid #0076ff;\n  border-top: none;\n  border-right: none;\n  border-radius: 0;\n  -webkit-transform: rotate(-45deg);\n          transform: rotate(-45deg);\n}\n:checked + .checkbox--noborder__checkmark:before {\n  background: transparent;\n  border: none;\n}\n:checked + .checkbox--noborder__checkmark:after {\n  opacity: 1;\n}\n:focus + .checkbox--noborder__checkmark:before {\n  border: none;\n}\n:disabled + .checkbox--noborder__checkmark {\n  opacity: 0.3;\n  cursor: default;\n  pointer-events: none;\n}\n:disabled:active + .checkbox--noborder__checkmark:before {\n  background: transparent;\n  border: none;\n}\n/*~\n  name: Material Checkbox\n  category: Checkbox\n  elements: ons-input\n  markup: |\n    <label class=\"checkbox checkbox--material\">\n      <input type=\"checkbox\" class=\"checkbox__input checkbox--material__input\">\n      <div class=\"checkbox__checkmark checkbox--material__checkmark\"></div>\n      OFF\n    </label>\n    <label class=\"checkbox checkbox--material\">\n      <input type=\"checkbox\" class=\"checkbox__input checkbox--material__input\" checked=\"checked\">\n      <div class=\"checkbox__checkmark checkbox--material__checkmark\"></div>\n      ON\n    </label>\n    <label class=\"checkbox checkbox--material\">\n      <input type=\"checkbox\" class=\"checkbox__input checkbox--material__input\" checked=\"checked\" disabled>\n      <div class=\"checkbox__checkmark checkbox--material__checkmark\"></div>\n      ON\n    </label>\n    <label class=\"checkbox checkbox--material\">\n      <input type=\"checkbox\" class=\"checkbox__input checkbox--material__input\" disabled>\n      <div class=\"checkbox__checkmark checkbox--material__checkmark\"></div>\n      Disabled\n    </label>\n*/\n.checkbox--material {\n  line-height: 18px;\n  font-family: 'Roboto', 'Noto', sans-serif;\n  -webkit-font-smoothing: antialiased;\n  font-weight: 400;\n  overflow: visible;\n}\n.checkbox--material__checkmark {\n  width: 18px;\n  height: 18px;\n}\n.checkbox--material__checkmark:before {\n  border-radius: 2px;\n  height: 18px;\n  width: 18px;\n  border: 2px solid #717171;\n  transition: background-color 0.1s linear 0.2s, border-color 0.1s linear 0.2s;\n  background-color: transparent;\n}\n:checked + .checkbox--material__checkmark:before {\n  border: 2px solid #37474f;\n  background-color: #37474f;\n  transition: background-color 0.1s linear, border-color 0.1s linear;\n}\n.checkbox--material__checkmark:after {\n  border-color: #ffffff;\n  transition: -webkit-transform 0.2s ease 0;\n  transition: transform 0.2s ease 0;\n  transition: transform 0.2s ease 0, -webkit-transform 0.2s ease 0;\n  width: 10px;\n  height: 5px;\n  top: 4px;\n  left: 3px;\n  -webkit-transform: scale(0) rotate(-45deg);\n          transform: scale(0) rotate(-45deg);\n  border-width: 2px;\n}\n:checked + .checkbox--material__checkmark:after {\n  transition: -webkit-transform 0.2s ease 0.2s;\n  transition: transform 0.2s ease 0.2s;\n  transition: transform 0.2s ease 0.2s, -webkit-transform 0.2s ease 0.2s;\n  width: 10px;\n  height: 5px;\n  top: 4px;\n  left: 3px;\n  -webkit-transform: scale(1) rotate(-45deg);\n          transform: scale(1) rotate(-45deg);\n  border-width: 2px;\n}\n/* active ring effect */\n.checkbox--material__input:before {\n  content: '';\n  opacity: 0;\n  position: absolute;\n  top: 0;\n  left: 0;\n  width: 18px;\n  height: 18px;\n  box-shadow: 0 0 0 11px #717171;\n  box-sizing: border-box;\n  border-radius: 50%;\n  background-color: #717171;\n  pointer-events: none;\n  display: block;\n  -webkit-transform: scale3d(0.2, 0.2, 0.2);\n          transform: scale3d(0.2, 0.2, 0.2);\n  transition: opacity 0.25s ease-out, -webkit-transform 0.1s ease-out;\n  transition: opacity 0.25s ease-out, transform 0.1s ease-out;\n  transition: opacity 0.25s ease-out, transform 0.1s ease-out, -webkit-transform 0.1s ease-out;\n}\n.checkbox--material__input:checked:before {\n  box-shadow: 0 0 0 11px #37474f;\n  background-color: #37474f;\n}\n.checkbox--material__input:active:before {\n  opacity: .15;\n  -webkit-transform: scale3d(1, 1, 1);\n          transform: scale3d(1, 1, 1);\n}\n:disabled + .checkbox--material__checkmark {\n  opacity: 1;\n}\n:disabled + .checkbox--material__checkmark:before {\n  border-color: #afafaf;\n}\n:disabled:checked + .checkbox--material__checkmark:before {\n  background-color: #afafaf;\n}\n:disabled:checked + .checkbox--material__checkmark:after {\n  border-color: #ffffff;\n}\n/*~\n  name: Radio Button\n  category: Radio Button\n  elements: ons-input\n  markup: |\n    <label class=\"radio-button\">\n      <input type=\"radio\" class=\"radio-button__input\" name=\"r\" checked=\"checked\">\n      <div class=\"radio-button__checkmark\"></div>\n      Label\n    </label>\n\n    <label class=\"radio-button\">\n      <input type=\"radio\" class=\"radio-button__input\" name=\"r\">\n      <div class=\"radio-button__checkmark\"></div>\n      Label\n    </label>\n\n    <label class=\"radio-button\">\n      <input type=\"radio\" class=\"radio-button__input\" name=\"r\">\n      <div class=\"radio-button__checkmark\"></div>\n      Label\n    </label>\n*/\n.radio-button__input {\n  position: absolute;\n  right: 0;\n  top: 0;\n  left: 0;\n  bottom: 0;\n  padding: 0;\n  border: 0;\n  background-color: transparent;\n  z-index: 1;\n  vertical-align: top;\n  outline: none;\n  width: 100%;\n  height: 100%;\n  margin: 0;\n  -webkit-appearance: none;\n     -moz-appearance: none;\n          appearance: none;\n}\n.radio-button__input:active,\n.radio-button__input:focus {\n  outline: 0;\n  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);\n}\n.radio-button {\n  position: relative;\n  display: inline-block;\n  vertical-align: top;\n  cursor: default;\n  -webkit-user-select: none;\n     -moz-user-select: none;\n      -ms-user-select: none;\n          user-select: none;\n  position: relative;\n  line-height: 24px;\n  text-align: left;\n}\n.radio-button__checkmark:before {\n  content: '';\n  position: absolute;\n  border-radius: 100%;\n  box-sizing: border-box;\n  background-clip: padding-box;\n  width: 22px;\n  height: 22px;\n  background: transparent;\n  border: none;\n  border-radius: 22px;\n  left: 0;\n}\n.radio-button__checkmark {\n  box-sizing: border-box;\n  background-clip: padding-box;\n  position: relative;\n  display: inline-block;\n  vertical-align: top;\n  cursor: default;\n  -webkit-user-select: none;\n     -moz-user-select: none;\n      -ms-user-select: none;\n          user-select: none;\n  font-family: -apple-system, 'Helvetica Neue', 'Helvetica', 'Arial', 'Lucida Grande', sans-serif;\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n  font-weight: 400;\n  position: relative;\n  position: relative;\n  width: 24px;\n  height: 24px;\n  background: transparent;\n  pointer-events: none;\n}\n.radio-button__checkmark:after {\n  content: '';\n  position: absolute;\n  top: 7px;\n  left: 4px;\n  opacity: 0;\n  width: 11px;\n  height: 4px;\n  background: transparent;\n  border: 2px solid #0076ff;\n  border-top: none;\n  border-right: none;\n  border-radius: 0;\n  -webkit-transform: rotate(-45deg);\n          transform: rotate(-45deg);\n}\n:checked + .radio-button__checkmark {\n  background: rgba(0, 0, 0, 0);\n}\n:checked + .radio-button__checkmark:after {\n  opacity: 1;\n}\n:checked + .radio-button__checkmark:before {\n  background: transparent;\n  border: none;\n}\n:disabled + .radio-button__checkmark {\n  opacity: 0.3;\n  cursor: default;\n  pointer-events: none;\n}\n/*~\n  name: Material Radio Button\n  category: Radio Button\n  elements: ons-input\n  markup: |\n    <label class=\"radio-button radio-button--material\">\n      <input type=\"radio\" class=\"radio-button__input radio-button--material__input\" name=\"r\" checked=\"checked\">\n      <div class=\"radio-button__checkmark radio-button--material__checkmark\"></div>\n      Label\n    </label>\n    <label class=\"radio-button radio-button--material\">\n      <input type=\"radio\" class=\"radio-button__input radio-button--material__input\" name=\"r\">\n      <div class=\"radio-button__checkmark radio-button--material__checkmark\"></div>\n      Label\n    </label>\n    <label class=\"radio-button radio-button--material\">\n      <input type=\"radio\" class=\"radio-button__input radio-button--material__input\" name=\"s\" disabled checked>\n      <div class=\"radio-button__checkmark radio-button--material__checkmark\"></div>\n      Label\n    </label>\n    <label class=\"radio-button radio-button--material\">\n      <input type=\"radio\" class=\"radio-button__input radio-button--material__input\" name=\"s\" disabled>\n      <div class=\"radio-button__checkmark radio-button--material__checkmark\"></div>\n      Label\n    </label>\n*/\n.radio-button--material {\n  line-height: 20px + 2px;\n  font-family: 'Roboto', 'Noto', sans-serif;\n  -webkit-font-smoothing: antialiased;\n  font-weight: 400;\n}\n.radio-button--material__input:before {\n  content: '';\n  position: absolute;\n  top: 0;\n  left: 0;\n  opacity: 0;\n  width: 20px;\n  height: 20px;\n  box-shadow: 0 0 0 14px #717171;\n  border: none;\n  box-sizing: border-box;\n  border-radius: 50%;\n  background-color: #717171;\n  pointer-events: none;\n  display: block;\n  -webkit-transform: scale3d(0.2, 0.2, 0.2);\n          transform: scale3d(0.2, 0.2, 0.2);\n  transition: opacity 0.25s ease-out, -webkit-transform 0.1s ease-out;\n  transition: opacity 0.25s ease-out, transform 0.1s ease-out;\n  transition: opacity 0.25s ease-out, transform 0.1s ease-out, -webkit-transform 0.1s ease-out;\n}\n.radio-button--material__input:checked:before {\n  box-shadow: 0 0 0 14px #37474f;\n  background-color: #37474f;\n}\n.radio-button--material__input:active:before {\n  opacity: .15;\n  -webkit-transform: scale3d(1, 1, 1);\n          transform: scale3d(1, 1, 1);\n}\n.radio-button--material__checkmark {\n  width: 20px;\n  height: 20px;\n  overflow: visible;\n}\n.radio-button--material__checkmark:before {\n  background: transparent;\n  border: 2px solid #717171;\n  box-sizing: border-box;\n  border-radius: 50%;\n  width: 20px;\n  height: 20px;\n  transition: border 0.2s ease;\n}\n.radio-button--material__checkmark:after {\n  transition: background 0.2s ease, -webkit-transform 0.2s ease;\n  transition: background 0.2s ease, transform 0.2s ease;\n  transition: background 0.2s ease, transform 0.2s ease, -webkit-transform 0.2s ease;\n  top: 5px;\n  left: 5px;\n  width: 10px;\n  height: 10px;\n  border: none;\n  border-radius: 50%;\n  -webkit-transform: scale(0);\n          transform: scale(0);\n}\n:checked + .radio-button--material__checkmark:before {\n  background: transparent;\n  border: 2px solid #37474f;\n}\n.radio-button--material__input + .radio-button__checkmark:after {\n  background: #717171;\n  opacity: 1;\n  -webkit-transform: scale(0);\n          transform: scale(0);\n}\n:checked + .radio-button--material__checkmark:after {\n  opacity: 1;\n  background: #37474f;\n  -webkit-transform: scale(1);\n          transform: scale(1);\n}\n:disabled + .radio-button--material__checkmark {\n  opacity: 1;\n}\n:disabled + .radio-button--material__checkmark:after {\n  background-color: #afafaf;\n  border-color: #afafaf;\n}\n:disabled + .radio-button--material__checkmark:before {\n  border-color: #afafaf;\n}\n/*~\n  name: List\n  category: List\n  elements: ons-list ons-list-item\n  markup: |\n    <ul class=\"list\">\n      <li class=\"list-item\">\n        <div class=\"list-item__center\">Dog</div>\n      </li>\n      <li class=\"list-item\">\n        <div class=\"list-item__center\">Cat</div>\n      </li>\n      <li class=\"list-item\">\n        <div class=\"list-item__center\">Hamster</div>\n      </li>\n    </ul>\n*/\n.list {\n  padding: 0;\n  margin: 0;\n  font: inherit;\n  color: inherit;\n  background: transparent;\n  border: none;\n  line-height: normal;\n  cursor: default;\n  -webkit-user-select: none;\n     -moz-user-select: none;\n      -ms-user-select: none;\n          user-select: none;\n  font-family: -apple-system, 'Helvetica Neue', 'Helvetica', 'Arial', 'Lucida Grande', sans-serif;\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n  font-weight: 400;\n  list-style-type: none;\n  text-align: left;\n  display: block;\n  -webkit-overflow-scrolling: touch;\n  overflow: hidden;\n  background-image:\n    linear-gradient(#ccc, #ccc),\n    linear-gradient(#ccc, #ccc);\n  background-size: 100% 1px, 100% 1px;\n  background-repeat: no-repeat;\n  background-position: bottom, top;\n  border: none;\n  background-color: #fff;\n}\n@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {\n  .list {\n    background-image:\n      linear-gradient(0deg, #ccc, #ccc 50%, transparent 50%),\n      linear-gradient(180deg, #ccc, #ccc 50%, transparent 50%);\n  }\n}\n.list-item {\n  width: 100%;\n  position: relative;\n  list-style: none;\n  box-sizing: border-box;\n  display: -webkit-box;\n  display: -webkit-flex;\n  display: flex;\n  -webkit-box-orient: horizontal;\n  -webkit-box-direction: normal;\n  -webkit-flex-direction: row;\n          flex-direction: row;\n  -webkit-box-pack: start;\n  -webkit-justify-content: flex-start;\n          justify-content: flex-start;\n  -webkit-box-align: center;\n  -webkit-align-items: center;\n          align-items: center;\n  padding: 0 0 0 14px;\n  margin: 0 0 -1px 0;\n  color: #1f1f21;\n  transition: background-color 0.2s linear;\n}\n.list-item__left {\n  box-sizing: border-box;\n  display: -webkit-box;\n  display: -webkit-flex;\n  display: flex;\n  padding: 12px 14px 12px 0;\n  -webkit-box-ordinal-group: 1;\n  -webkit-order: 0;\n          order: 0;\n  -webkit-box-align: center;\n  -webkit-align-items: center;\n          align-items: center;\n  -webkit-align-self: stretch;\n          align-self: stretch;\n  line-height: 1.2em;\n  min-height: 44px;\n}\n.list-item__left:empty {\n  width: 0;\n  min-width: 0;\n  padding: 0;\n  margin: 0;\n}\n.list-item__center {\n  box-sizing: border-box;\n  display: -webkit-box;\n  display: -webkit-flex;\n  display: flex;\n  -webkit-box-flex: 1;\n  -webkit-flex-grow: 1;\n          flex-grow: 1;\n  -webkit-flex-wrap: wrap;\n          flex-wrap: wrap;\n  -webkit-box-orient: horizontal;\n  -webkit-box-direction: normal;\n  -webkit-flex-direction: row;\n          flex-direction: row;\n  -webkit-box-ordinal-group: 2;\n  -webkit-order: 1;\n          order: 1;\n  margin-right: auto;\n  -webkit-box-align: center;\n  -webkit-align-items: center;\n          align-items: center;\n  -webkit-align-self: stretch;\n          align-self: stretch;\n  margin-left: 0;\n  border-bottom: none;\n  background-size: 100% 1px;\n  background-repeat: no-repeat;\n  background-position: bottom;\n  background-image: linear-gradient(0deg, #ccc, #ccc 100%);\n}\n@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {\n  .list-item__center {\n    background-image: linear-gradient(0deg, #ccc, #ccc 50%, transparent 50%);\n  }\n}\n.list-item__center {\n  padding: 12px 6px 12px 0;\n  line-height: 1.2em;\n  min-height: 44px;\n}\n.list-item__right {\n  box-sizing: border-box;\n  display: -webkit-box;\n  display: -webkit-flex;\n  display: flex;\n  margin-left: auto;\n  padding: 12px 12px 12px 0;\n  -webkit-box-ordinal-group: 3;\n  -webkit-order: 2;\n          order: 2;\n  -webkit-box-align: center;\n  -webkit-align-items: center;\n          align-items: center;\n  -webkit-align-self: stretch;\n          align-self: stretch;\n  border-bottom: none;\n  background-size: 100% 1px;\n  background-repeat: no-repeat;\n  background-position: bottom;\n  background-image: linear-gradient(0deg, #ccc, #ccc 100%);\n}\n@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {\n  .list-item__right {\n    background-image: linear-gradient(0deg, #ccc, #ccc 50%, transparent 50%);\n  }\n}\n.list-item__right {\n  line-height: 1.2em;\n  min-height: 44px;\n}\n.list-header {\n  margin: 0;\n  list-style: none;\n  text-align: left;\n  display: block;\n  box-sizing: border-box;\n  padding: 0 0 0 15px;\n  font-size: 12px;\n  font-weight: 500;\n  color: #1f1f21;\n  min-height: 24px;\n  line-height: 25px;\n  text-transform: uppercase;\n  position: relative;\n  background-color: #eee;\n  background-size: 100% 1px;\n  background-repeat: no-repeat;\n  background-position: top;\n  background-image: linear-gradient(0deg, #ccc, #ccc 100%);\n}\n@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {\n  .list-header {\n    background-image: linear-gradient(180deg, #ccc, #ccc 50%, transparent 50%);\n  }\n}\n/*~\n  name: Noborder List\n  category: List\n  elements: ons-list ons-list-item\n  markup: |\n    <ul class=\"list list--noborder\">\n      <li class=\"list-item\">\n        <div class=\"list-item__center\">Item</div>\n      </li>\n      <li class=\"list-item\">\n        <div class=\"list-item__center\">Item</div>\n      </li>\n    </ul>\n */\n.list--noborder {\n  border-top: none;\n  border-bottom: none;\n  background-image: none;\n}\n/*~\n  name: Category List Header\n  category: List\n  elements: ons-list ons-list-header ons-list-item\n  markup: |\n    <ul class=\"list\">\n      <li class=\"list-header\">\n        Header\n      </li>\n      <li class=\"list-item\">\n        <div class=\"list-item__center\">Item</div>\n      </li>\n      <li class=\"list-item\">\n        <div class=\"list-item__center\">Item</div>\n      </li>\n      <li class=\"list-item\">\n        <div class=\"list-item__center\">Item</div>\n      </li>\n    </ul>\n */\n/*~\n  name: Tappable List\n  category: List\n  elements: ons-list ons-list-item\n  markup: |\n    <ul class=\"list\">\n      <li class=\"list-item list-item--tappable\">\n        <div class=\"list-item__center\">Tappable Item</div>\n      </li>\n      <li class=\"list-item list-item--tappable\">\n        <div class=\"list-item__center\">Tappable Item</div>\n      </li>\n      <li class=\"list-item list-item--tappable\">\n        <div class=\"list-item__center\">Tappable Item</div>\n      </li>\n    </ul>\n */\n.list-item--tappable:active {\n  transition: none;\n  background-color: #d9d9d9;\n}\n/*~\n  name: Switch in List Item\n  category: List\n  elements: ons-list ons-list-item ons-switch\n  markup: |\n    <ul class=\"list\">\n      <li class=\"list-item\">\n        <div class=\"list-item__center\">\n          Label\n        </div>\n        <div class=\"list-item__right\">\n          <label class=\"switch\">\n            <input type=\"checkbox\" class=\"switch__input\" checked>\n            <div class=\"switch__toggle\">\n              <div class=\"switch__handle\"></div>\n            </div>\n          </label>\n        </div>\n      </li>\n      <li class=\"list-item\">\n        <div class=\"list-item__center\">\n          Label\n        </div>\n        <div class=\"list-item__right\">\n          <label class=\"switch\">\n            <input type=\"checkbox\" class=\"switch__input\">\n            <div class=\"switch__toggle\">\n              <div class=\"switch__handle\"></div>\n            </div>\n          </label>\n        </div>\n      </li>\n    </ul>\n*/\n/*~\n  name: Inset List\n  category: List\n  elements: ons-list ons-list-item\n  markup: |\n    <ul class=\"list list--inset\">\n      <li class=\"list-item list--inset__item list-item--chevron list-item--tappable\">\n        <div class=\"list-item__center\">List Item with Chevron</div>\n      </li>\n      <li class=\"list-item list--inset__item list-item--chevron list-item--tappable\">\n        <div class=\"list-item__center\">List Item with Chevron</div>\n      </li>\n    </ul>\n */\n.list--inset {\n  margin: 0 8px;\n  border: 1px solid #ccc;\n  border-radius: 4px;\n  background-image: none;\n}\n/*~\n  name: Radio Button in List Item\n  category: List\n  elements: ons-list ons-list-item ons-input\n  markup: |\n    <ul class=\"list\">\n      <li class=\"list-item list-item--tappable\">\n        <div class=\"list-item__left\">\n          <label class=\"radio-button\">\n            <input type=\"radio\" id=\"r1\" class=\"radio-button__input\" name=\"r\" checked=\"checked\">\n            <div class=\"radio-button__checkmark\"></div>\n          </label>\n        </div>\n        <label for=\"r1\" class=\"list-item__center\">\n          Radio Button\n        </label>\n      </li>\n      <li class=\"list-item list-item--tappable\">\n        <div class=\"list-item__left\">\n          <label class=\"radio-button\">\n            <input type=\"radio\" id=\"r2\" class=\"radio-button__input\" name=\"r\">\n            <div class=\"radio-button__checkmark\"></div>\n          </label>\n        </div>\n        <label for=\"r2\" class=\"list-item__center\">\n          Radio Button\n        </label>\n      </li>\n    </ul>\n*/\n/*~\n  name: Checkbox in List Item\n  category: List\n  elements: ons-list ons-list-item ons-input\n  markup: |\n    <ul class=\"list\">\n      <li class=\"list-item list-item--tappable\">\n        <div class=\"list-item__left\">\n          <label class=\"checkbox\">\n            <input type=\"checkbox\" id=\"checkbox1\" class=\"checkbox__input\" name=\"c\" checked=\"checked\">\n            <div class=\"checkbox__checkmark\"></div>\n          </label>\n        </div>\n        <label for=\"checkbox1\" class=\"list-item__center\">\n          Checkbox\n        </label>\n      </li>\n      <li class=\"list-item list-item--tappable\">\n        <div class=\"list-item__left\">\n          <label class=\"checkbox\">\n            <input type=\"checkbox\" id=\"checkbox2\" class=\"checkbox__input\" name=\"c\">\n            <div class=\"checkbox__checkmark\"></div>\n          </label>\n        </div>\n        <label for=\"checkbox2\" class=\"list-item__center\">\n          Checkbox\n        </label>\n      </li>\n    </ul>\n*/\n/*~\n  name: No border Checkbox in List Item\n  category: List\n  elements: ons-list ons-list-item ons-input\n  markup: |\n    <ul class=\"list\">\n      <li class=\"list-item list-item--tappable\">\n        <div class=\"list-item__left\">\n          <label class=\"checkbox checkbox--noborder\">\n            <input id=\"s1\" type=\"checkbox\" class=\"checkbox__input checkbox--noborder__input\">\n            <div class=\"checkbox__checkmark checkbox--noborder checkbox--noborder__checkmark\"></div>\n          </label>\n        </div>\n        <label for=\"s1\" class=\"list-item__center\">\n          Checkbox\n        </label>\n      </li>\n      <li class=\"list-item list-item--tappable\">\n        <div class=\"list-item__left\">\n          <label class=\"checkbox checkbox--noborder\">\n            <input id=\"s2\" type=\"checkbox\" class=\"checkbox__input checkbox--noborder__input\" checked>\n            <div class=\"checkbox__checkmark checkbox--noborder checkbox--noborder__checkmark\"></div>\n          </label>\n        </div>\n        <label for=\"s2\" class=\"list-item__center\">\n          Checkbox\n        </label>\n      </li>\n    </ul>\n*/\n/*~\n  name: Text Input in List Item\n  category: List\n  elements: ons-list ons-list-item ons-input\n  markup: |\n    <ul class=\"list\">\n      <li class=\"list-item\">\n        <div class=\"list-item__center\">\n          <input type=\"text\" class=\"text-input\" placeholder=\"Name\">\n        </div>\n      </li>\n      <li class=\"list-item\">\n        <div class=\"list-item__center\">\n          <input type=\"text\" class=\"text-input\" placeholder=\"Email\">\n        </div>\n      </li>\n    </ul>\n*/\n/*~\n  name: Textarea in List Item\n  category: List\n  elements: ons-list ons-list-item\n  markup: |\n    <ul class=\"list\">\n      <li class=\"list-item\">\n        <div class=\"list-item__center\">\n          <textarea class=\"textarea textarea--transparent\" placeholder=\"Text message\"></textarea>\n        </div>\n      </li>\n    </ul>\n*/\n/*~\n  name: Right Label in List Item\n  category: List\n  elements: ons-list ons-list-item\n  markup: |\n    <ul class=\"list\">\n      <li class=\"list-item\">\n        <div class=\"list-item__center\">\n          Title\n        </div>\n        <div class=\"list-item__right\">\n          <div class=\"list-item__label\">Label</div>\n        </div>\n      </li>\n    </ul>\n*/\n.list-item__label {\n  font-size: 14px;\n  padding: 0 4px;\n  opacity: 0.6;\n}\n/*~\n  name: List Item with Subtitle\n  category: List\n  elements: ons-list ons-list-item\n  markup: |\n    <ul class=\"list\">\n      <li class=\"list-item\">\n        <div class=\"list-item__center\">\n          <div class=\"list-item__title\">\n            Title\n          </div>\n          <div class=\"list-item__subtitle\">\n            Subtitle\n          </div>\n        </div>\n      </li>\n    </ul>\n*/\n.list-item__title {\n  -webkit-flex-basis: 100%;\n          flex-basis: 100%;\n  -webkit-align-self: flex-end;\n          align-self: flex-end;\n  -webkit-box-ordinal-group: 1;\n  -webkit-order: 0;\n          order: 0;\n}\n.list-item__subtitle {\n  opacity: 0.75;\n  font-size: 14px;\n  -webkit-box-ordinal-group: 2;\n  -webkit-order: 1;\n          order: 1;\n  -webkit-flex-basis: 100%;\n          flex-basis: 100%;\n  -webkit-align-self: flex-start;\n          align-self: flex-start;\n}\n/*~\n  name: List Item with Thumbnail\n  category: List\n  elements: ons-list ons-list-item\n  markup: |\n    <ul class=\"list\">\n      <li class=\"list-item\">\n        <div class=\"list-item__left\">\n          <img class=\"list-item__thumbnail\" src=\"http://placekitten.com/g/40/40\" alt=\"Cute kitten\">\n        </div>\n\n        <div class=\"list-item__center\">\n          <div class=\"list-item__title\">Lily</div>\n          <div class=\"list-item__subtitle\">Very friendly cat</div>\n        </div>\n      </li>\n\n      <li class=\"list-item\">\n        <div class=\"list-item__left\">\n          <img class=\"list-item__thumbnail\" src=\"http://placekitten.com/g/40/40\" alt=\"Cute kitten\">\n        </div>\n\n        <div class=\"list-item__center\">\n          <div class=\"list-item__title\">Molly</div>\n          <div class=\"list-item__subtitle\">Loves tuna!</div>\n        </div>\n      </li>\n    </ul>\n*/\n.list-item__thumbnail {\n  width: 40px;\n  height: 40px;\n  border-radius: 6px;\n  display: block;\n  margin: 0;\n}\n/*~\n  name: List Item with Icon\n  category: List\n  elements: ons-list ons-list-item\n  markup: |\n    <ul class=\"list\">\n      <li class=\"list-item\">\n        <div class=\"list-item__left\">\n          <img class=\"list-item__thumbnail\" src=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAIAAAADnC86AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wwJCB8v/9zErgAAABl0RVh0Q29tbWVudABDcmVhdGVkIHdpdGggR0lNUFeBDhcAAAAvSURBVFjD7c0BDQAACAMgtX+KJzWGm4MCdJK6MHVELBaLxWKxWCwWi8VisVj8MV7qBgI2A8rYpgAAAABJRU5ErkJggg==\">\n        </div>\n\n        <div class=\"list-item__center\">\n          <div class=\"list-item__title\">Alice</div>\n          <div class=\"list-item__subtitle\">Description</div>\n        </div>\n\n        <div class=\"list-item__right\">\n          <i class=\"ion-ios-information list-item__icon\"></i>\n        </div>\n      </li>\n\n      <li class=\"list-item\">\n        <div class=\"list-item__left\">\n          <img class=\"list-item__thumbnail\" src=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAIAAAADnC86AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wwJCB8v/9zErgAAABl0RVh0Q29tbWVudABDcmVhdGVkIHdpdGggR0lNUFeBDhcAAAAvSURBVFjD7c0BDQAACAMgtX+KJzWGm4MCdJK6MHVELBaLxWKxWCwWi8VisVj8MV7qBgI2A8rYpgAAAABJRU5ErkJggg==\">\n        </div>\n\n        <div class=\"list-item__center\">\n          <div class=\"list-item__title\">Bob</div>\n          <div class=\"list-item__subtitle\">Description</div>\n        </div>\n\n        <div class=\"list-item__right\">\n          <i class=\"ion-ios-information list-item__icon\"></i>\n        </div>\n      </li>\n    </ul>\n*/\n.list-item__icon {\n  font-size: 22px;\n  padding: 0 6px;\n}\n/*~\n  name: Material List\n  category: List\n  elements: ons-list ons-list-item\n  markup: |\n    <ul class=\"list list--material\">\n      <li class=\"list-item list-item--material\">\n        <div class=\"list-item__center list-item--material__center\">\n          <div class=\"list-item__title list-item--material__title\">Orange</div>\n          <div class=\"list-item__subtitle list-item--material__subtitle\">Sweet fruit that grows on trees.</div>\n        </div>\n      </li>\n      <li class=\"list-item list-item--material\">\n        <div class=\"list-item__center list-item--material__center\">\n          <div class=\"list-item__title list-item--material__title\">Pear</div>\n          <div class=\"list-item__subtitle list-item--material__subtitle\">Funny-shaped fruit.</div>\n        </div>\n      </li>\n    </ul>\n*/\n.list--material {\n  font-family: 'Roboto', 'Noto', sans-serif;\n  -webkit-font-smoothing: antialiased;\n  font-weight: 400;\n  background-image: none;\n  background-color: #fff;\n}\n.list-item--material {\n  border: 0;\n  padding: 0 0 0 16px;\n  line-height: normal;\n}\n.list-item--material__subtitle {\n  margin-top: 4px;\n}\n.list-item--material:first-child {\n  box-shadow: none;\n}\n.list-item--material__left {\n  padding: 14px 0;\n  min-width: 56px;\n  line-height: 1;\n  min-height: 48px;\n}\n.list-item--material__left:empty,\n.list-item--material__center {\n  padding: 14px 6px 14px 0;\n  border-color: #eee;\n  border-bottom: none;\n  background-size: 100% 1px;\n  background-repeat: no-repeat;\n  background-position: bottom;\n  background-image: linear-gradient(0deg, #eee, #eee 100%);\n}\n@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {\n  .list-item--material__left:empty,\n.list-item--material__center {\n    background-image: linear-gradient(0deg, #eee, #eee 50%, transparent 50%);\n  }\n}\n.list-item--material__left:empty,\n.list-item--material__center {\n  min-height: 48px;\n}\n.list-item--material__right {\n  padding: 14px 16px 14px 0;\n  line-height: 1;\n  border-color: #eee;\n  border-bottom: none;\n  background-size: 100% 1px;\n  background-repeat: no-repeat;\n  background-position: bottom;\n  background-image: linear-gradient(0deg, #eee, #eee 100%);\n}\n@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {\n  .list-item--material__right {\n    background-image: linear-gradient(0deg, #eee, #eee 50%, transparent 50%);\n  }\n}\n.list-item--material__right {\n  min-height: 48px;\n}\n.list-item--material.list-item--longdivider {\n  border-bottom: 1px solid #eee;\n  border-bottom: none;\n  background-size: 100% 1px;\n  background-repeat: no-repeat;\n  background-position: bottom;\n  background-image: linear-gradient(0deg, #eee, #eee 100%);\n}\n@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {\n  .list-item--material.list-item--longdivider {\n    background-image: linear-gradient(0deg, #eee, #eee 50%, transparent 50%);\n  }\n}\n/*~\n  name: Material List with Header\n  category: List\n  elements: ons-list ons-list-item\n  markup: |\n    <ul class=\"list list--material\">\n      <li class=\"list-header list-header--material\">\n        Fruits\n      </li>\n      <li class=\"list-item list-item--material\">\n        <div class=\"list-item__center list-item--material__center\">\n          <div class=\"list-item__title list-item--material__title\">Orange</div>\n          <div class=\"list-item__subtitle list-item--material__subtitle\">Sweet fruit that grows on trees.</div>\n        </div>\n      </li>\n    </ul>\n*/\n.list-header--material {\n  background: #fff;\n  border: none;\n  font-size: 14px;\n  text-transform: none;\n  margin: -1px 0 0 0;\n  color: #757575;\n  font-weight: 500;\n  padding: 8px 16px;\n}\n.list-header--material:not(:first-of-type) {\n  border-top: none;\n  background-size: 100% 1px;\n  background-repeat: no-repeat;\n  background-position: top;\n  background-image: linear-gradient(180deg, #eee, #eee 100%);\n}\n@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {\n  .list-header--material:not(:first-of-type) {\n    background-image: linear-gradient(180deg, #eee, #eee 50%, transparent 50%);\n  }\n}\n.list-header--material:not(:first-of-type) {\n  padding-top: 16px;\n}\n/*~\n  name: Material List with Checkboxes\n  category: List\n  elements: ons-list ons-list-item ons-input\n  markup: |\n    <ul class=\"list list--material\">\n      <li class=\"list-item list-item--material\">\n        <div class=\"list-item__left list-item--material__left\">\n          <label class=\"checkbox checkbox--material\">\n            <input type=\"checkbox\" id=\"checkbox3\" class=\"checkbox__input checkbox--material__input\">\n            <div class=\"checkbox__checkmark checkbox--material__checkmark\"></div>\n          </label>\n        </div>\n\n        <label for=\"checkbox3\" class=\"list-item__center list-item--material__center\">\n          <div class=\"list-item__title list-item--material__title\">Notifications</div>\n          <div class=\"list-item__subtitle list-item--material__subtitle\">Allow notifications</div>\n        </label>\n      </li>\n\n      <li class=\"list-item list-item--material\">\n        <div class=\"list-item__left list-item--material__left\">\n          <label class=\"checkbox checkbox--material\">\n            <input type=\"checkbox\" id=\"checkbox4\" class=\"checkbox__input checkbox--material__input\" checked=\"checked\">\n            <div class=\"checkbox__checkmark checkbox--material__checkmark\"></div>\n          </label>\n        </div>\n\n        <label for=\"checkbox4\" class=\"list-item__center list-item--material__center\">\n          <div class=\"list-item__title list-item--material__title\">Sound</div>\n          <div class=\"list-item__subtitle list-item--material__subtitle\">Hangouts message</div>\n        </label>\n      </li>\n\n    </ul>\n*/\n/*~\n  name: Material List with Thumbnails\n  category: List\n  markup: |\n    <ul class=\"list list--material\">\n      <li class=\"list-item list-item--material\">\n        <div class=\"list-item__left list-item--material__left\">\n          <img class=\"list-item__thumbnail list-item--material__thumbnail\" src=\"http://placekitten.com/g/42/41\" alt=\"Cute kitten\">\n        </div>\n\n        <div class=\"list-item__center list-item--material__center\">\n          <div class=\"list-item__title list-item--material__title\">Lily</div>\n          <div class=\"list-item__subtitle list-item--material__subtitle\">Very friendly cat</div>\n        </div>\n      </li>\n\n      <li class=\"list-item list-item--material\">\n        <div class=\"list-item__left list-item--material__left\">\n          <img class=\"list-item__thumbnail list-item--material__thumbnail\" src=\"http://placekitten.com/g/40/40\" alt=\"Cute kitten\">\n        </div>\n\n        <div class=\"list-item__center list-item--material__center\">\n          <div class=\"list-item__title list-item--material__title\">Molly</div>\n          <div class=\"list-item__subtitle list-item--material__subtitle\">Loves tuna!</div>\n        </div>\n      </li>\n\n    </ul>\n*/\n.list-item--material__thumbnail {\n  width: 40px;\n  height: 40px;\n  border-radius: 100%;\n}\n/*~\n  name: Material List with Icons\n  category: List\n  markup: |\n    <ul class=\"list list--material\">\n      <li class=\"list-item list-item--material\">\n        <div class=\"list-item__left list-item--material__left\">\n          <img class=\"list-item__thumbnail list-item--material__thumbnail\" src=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAIAAAADnC86AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wwJCB8v/9zErgAAABl0RVh0Q29tbWVudABDcmVhdGVkIHdpdGggR0lNUFeBDhcAAAAvSURBVFjD7c0BDQAACAMgtX+KJzWGm4MCdJK6MHVELBaLxWKxWCwWi8VisVj8MV7qBgI2A8rYpgAAAABJRU5ErkJggg==\">\n        </div>\n\n        <div class=\"list-item__center list-item--material__center\">\n          <div class=\"list-item__title list-item--material__title\">Alice</div>\n          <div class=\"list-item__subtitle list-item--material__subtitle\">Description</div>\n        </div>\n\n        <div class=\"list-item__right list-item--material__right\">\n          <i style=\"color:#ccc\" class=\"list-item__icon list-item--material__icon zmdi zmdi-comment\"></i>\n        </div>\n      </li>\n\n      <li class=\"list-item list-item--material\">\n        <div class=\"list-item__left list-item--material__left\">\n          <img class=\"list-item__thumbnail list-item--material__thumbnail\" src=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAIAAAADnC86AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wwJCB8v/9zErgAAABl0RVh0Q29tbWVudABDcmVhdGVkIHdpdGggR0lNUFeBDhcAAAAvSURBVFjD7c0BDQAACAMgtX+KJzWGm4MCdJK6MHVELBaLxWKxWCwWi8VisVj8MV7qBgI2A8rYpgAAAABJRU5ErkJggg==\">\n        </div>\n\n        <div class=\"list-item__center list-item--material__center\">\n          <div class=\"list-item__title list-item--material__title\">Bob</div>\n          <div class=\"list-item__subtitle list-item--material__subtitle\">Description</div>\n        </div>\n\n        <div class=\"list-item__right list-item--material__right\">\n          <i style=\"color:#ccc\" class=\"list-item__icon list-item--material__icon zmdi zmdi-comment\"></i>\n        </div>\n      </li>\n    </ul>\n*/\n.list-item--material__icon {\n  font-size: 20px;\n  padding: 0 4px;\n}\n/*~\n  name: List Item with Chevron\n  category: List\n  elements: ons-list ons-list-item\n  markup: |\n    <ul class=\"list\">\n      <li class=\"list-item list-item--chevron\">\n        <div class=\"list-item__center\">Item A</div>\n      </li>\n      <li class=\"list-item list-item--chevron\">\n        <div class=\"list-item__center\">Item B</div>\n        <div class=\"list-item__right list-item--chevron__right\">\n          <div class=\"list-item__label\">Label</div>\n        </div>\n      </li>\n    </ul>\n */\n.list-item--chevron:before {\n  border-right: 2px solid #c7c7cc;\n  border-bottom: 2px solid #c7c7cc;\n  position: absolute;\n  content: '';\n  width: 7px;\n  height: 7px;\n  background-color: transparent;\n  -webkit-transform: translateY(-50%) rotate(-45deg);\n          transform: translateY(-50%) rotate(-45deg);\n  right: 16px;\n  top: 50%;\n  z-index: 5;\n}\n.list-item--chevron__right {\n  padding-right: 30px;\n}\n/*~\n  name: Nodivider List Item with Chevron\n  category: List\n  elements: ons-list ons-list-item\n  markup: |\n    <ul class=\"list\">\n      <li class=\"list-item list-item--nodivider list-item--chevron\">\n        <div class=\"list-item__center list-item--nodivider__center\">Item A</div>\n      </li>\n      <li class=\"list-item list-item--nodivider list-item--chevron\">\n        <div class=\"list-item__center list-item--nodivider__center\">Item B</div>\n        <div class=\"list-item__right list-item--nodivider__right list-item--chevron__right\">\n          <div class=\"list-item__label\">Label</div>\n        </div>\n      </li>\n    </ul>\n */\n/*~\n  name: List item without divider\n  category: List\n  markup: |\n    <ul class=\"list\">\n      <li class=\"list-item list-item--nodivider\">\n        <div class=\"list-item__center list-item--nodivider__center\">Item</div>\n      </li>\n      <li class=\"list-item list-item--nodivider\">\n        <div class=\"list-item__center list-item--nodivider__center\">Item</div>\n      </li>\n    </ul>\n */\n.list-item--nodivider__center,\n.list-item--nodivider__right {\n  border: none;\n  background-image: none;\n}\n/*~\n  name: List item with long divider\n  category: List\n  markup: |\n    <ul class=\"list\">\n      <li class=\"list-item list-item--longdivider\">\n        <div class=\"list-item__center list-item--longdivider__center\">Item</div>\n      </li>\n      <li class=\"list-item list-item--longdivider\">\n        <div class=\"list-item__center list-item--longdivider__center\">Item</div>\n      </li>\n    </ul>\n */\n.list-item--longdivider {\n  border-bottom: 1px solid #ccc;\n  border-bottom: none;\n  background-size: 100% 1px;\n  background-repeat: no-repeat;\n  background-position: bottom;\n  background-image: linear-gradient(0deg, #ccc, #ccc 100%);\n}\n@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {\n  .list-item--longdivider {\n    background-image: linear-gradient(0deg, #ccc, #ccc 50%, transparent 50%);\n  }\n}\n.list-item--longdivider:last-of-type {\n  border: none;\n  background-image: none;\n}\n.list-item--longdivider__center {\n  border: none;\n  background-image: none;\n}\n.list-item--longdivider__right {\n  border: none;\n  background-image: none;\n}\n/*~\n  name: List title\n  category: List\n  markup: |\n    <div class=\"list-title\">List Title</div>\n    <ul class=\"list\">\n      <li class=\"list-item\">\n        <div class=\"list-item__center\">Item</div>\n      </li>\n      <li class=\"list-item\">\n        <div class=\"list-item__center\">Item</div>\n      </li>\n    </ul>\n */\n.list-title {\n  padding: 0;\n  margin: 0;\n  font: inherit;\n  color: inherit;\n  background: transparent;\n  border: none;\n  line-height: normal;\n  cursor: default;\n  -webkit-user-select: none;\n     -moz-user-select: none;\n      -ms-user-select: none;\n          user-select: none;\n  font-family: -apple-system, 'Helvetica Neue', 'Helvetica', 'Arial', 'Lucida Grande', sans-serif;\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n  font-weight: 400;\n  display: block;\n  color: #6d6d72;\n  text-align: left;\n  box-sizing: border-box;\n  padding: 0 0 0 16px;\n  margin: 0;\n  font-size: 13px;\n  font-weight: 500;\n  line-height: 24px;\n  text-transform: uppercase;\n  letter-spacing: 0.04em;\n}\n/*~\n  name: Material List Title\n  category: List\n  markup: |\n    <h3 class=\"list-title list-title--material\">LIST TITLE</h3>\n    <ul class=\"list list--material\">\n      <li class=\"list-item list-item--material\">\n        <div class=\"list-item__center list-item--material__center\">Item</div>\n      </li>\n      <li class=\"list-item list-item--material\">\n        <div class=\"list-item__center list-item--material__center\">Item</div>\n      </li>\n    </ul>\n */\n.list-title--material {\n  font-family: 'Roboto', 'Noto', sans-serif;\n  -webkit-font-smoothing: antialiased;\n  font-weight: 400;\n  color: #757575;\n  font-size: 14px;\n  margin: 0;\n  padding: 12px 0 12px 16px;\n  font-weight: 500;\n  line-height: 24px;\n}\n/*~\n  name: Search Input\n  category: Search Input\n  markup: |\n    <input type=\"search\" value=\"\" placeholder=\"Search\" class=\"search-input\" style=\"width: 280px;\">\n*/\n.search-input {\n  box-sizing: border-box;\n  background-clip: padding-box;\n  padding: 0;\n  margin: 0;\n  font: inherit;\n  color: inherit;\n  background: transparent;\n  border: none;\n  vertical-align: top;\n  outline: none;\n  line-height: 1;\n  font-family: -apple-system, 'Helvetica Neue', 'Helvetica', 'Arial', 'Lucida Grande', sans-serif;\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n  font-weight: 400;\n  -webkit-appearance: textfield;\n     -moz-appearance: textfield;\n          appearance: textfield;\n  box-sizing: border-box;\n  height: 28px;\n  font-size: 14px;\n  background-color: rgba(3, 3, 3, .09);\n  box-shadow: none;\n  color: #1f1f21;\n  line-height: 1.3;\n  padding: 0 8px 0 28px;\n  margin: 0;\n  border-radius: 5.5px;\n  background-image: url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iMTNweCIgaGVpZ2h0PSIxNHB4IiB2aWV3Qm94PSIwIDAgMTMgMTQiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+CiAgICA8IS0tIEdlbmVyYXRvcjogU2tldGNoIDQyICgzNjc4MSkgLSBodHRwOi8vd3d3LmJvaGVtaWFuY29kaW5nLmNvbS9za2V0Y2ggLS0+CiAgICA8dGl0bGU+aW9zLXNlYXJjaC1pbnB1dC1pY29uPC90aXRsZT4KICAgIDxkZXNjPkNyZWF0ZWQgd2l0aCBTa2V0Y2guPC9kZXNjPgogICAgPGRlZnM+PC9kZWZzPgogICAgPGcgaWQ9ImNvbXBvbmVudHMiIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPgogICAgICAgIDxnIGlkPSJpb3Mtc2VhcmNoLWlucHV0IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtNDguMDAwMDAwLCAtNDMuMDAwMDAwKSIgZmlsbD0iIzdBNzk3QiI+CiAgICAgICAgICAgIDxnIGlkPSJHcm91cCIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoNDAuMDAwMDAwLCAzNi4wMDAwMDApIj4KICAgICAgICAgICAgICAgIDxwYXRoIGQ9Ik0xNi45OTcyNDgyLDE1LjUwNDE0NjYgQzE3LjA3NzM2NTcsMTUuNTQwNTkzOCAxNy4xNTIyNzMxLDE1LjU5MTYxMjkgMTcuMjE3NzUxNiwxNS42NTcwOTE0IEwyMC42NDk5OTEsMTkuMDg5MzMwOCBDMjAuOTQ0ODQ0OSwxOS4zODQxODQ3IDIwLjk0ODQ3NjQsMTkuODU4NjA2IDIwLjY1MzU0MTIsMjAuMTUzNTQxMiBDMjAuMzYwNjQ4LDIwLjQ0NjQzNDQgMTkuODgxMjcxNiwyMC40NDE5MzE3IDE5LjU4OTMzMDgsMjAuMTQ5OTkxIEwxNi4xNTcwOTE0LDE2LjcxNzc1MTYgQzE2LjA5MTM3LDE2LjY1MjAzMDEgMTYuMDQwMTE3MSwxNi41NzczODc0IDE2LjAwMzQxNDEsMTYuNDk3Nzk5NSBDMTUuMTY3MTY5NCwxNy4xMjcwNDExIDE0LjEyNzEzOTMsMTcuNSAxMywxNy41IEMxMC4yMzg1NzYzLDE3LjUgOCwxNS4yNjE0MjM3IDgsMTIuNSBDOCw5LjczODU3NjI1IDEwLjIzODU3NjMsNy41IDEzLDcuNSBDMTUuNzYxNDIzNyw3LjUgMTgsOS43Mzg1NzYyNSAxOCwxMi41IEMxOCwxMy42Mjc0Njg1IDE3LjYyNjgyMzIsMTQuNjY3Nzc2OCAxNi45OTcyNDgyLDE1LjUwNDE0NjYgWiBNMTMsMTYuNSBDMTUuMjA5MTM5LDE2LjUgMTcsMTQuNzA5MTM5IDE3LDEyLjUgQzE3LDEwLjI5MDg2MSAxNS4yMDkxMzksOC41IDEzLDguNSBDMTAuNzkwODYxLDguNSA5LDEwLjI5MDg2MSA5LDEyLjUgQzksMTQuNzA5MTM5IDEwLjc5MDg2MSwxNi41IDEzLDE2LjUgWiIgaWQ9Imlvcy1zZWFyY2gtaW5wdXQtaWNvbiI+PC9wYXRoPgogICAgICAgICAgICA8L2c+CiAgICAgICAgPC9nPgogICAgPC9nPgo8L3N2Zz4=');\n  background-position: 8px center;\n  background-repeat: no-repeat;\n  background-size: 13px;\n  font-weight: 400;\n  display: inline-block;\n  text-indent: 0;\n}\n.search-input::-webkit-search-cancel-button {\n  -webkit-appearance: textfield;\n          appearance: textfield;\n  display: none;\n}\n.search-input::-webkit-search-decoration {\n  display: none;\n}\n.search-input:focus {\n  outline: none;\n}\n.search-input::-webkit-input-placeholder {\n  color: #7a797b;\n  font-size: 14px;\n  text-indent: 0;\n}\n.search-input:-ms-input-placeholder {\n  color: #7a797b;\n  font-size: 14px;\n  text-indent: 0;\n}\n.search-input::-ms-input-placeholder {\n  color: #7a797b;\n  font-size: 14px;\n  text-indent: 0;\n}\n.search-input::placeholder {\n  color: #7a797b;\n  font-size: 14px;\n  text-indent: 0;\n}\n.search-input:placeholder-shown {\n}\n.search-input:disabled {\n  opacity: 0.3;\n  cursor: default;\n  pointer-events: none;\n}\n/*~\n  name: Material Search Input\n  category: Search Input\n  markup: |\n    <input type=\"search\" value=\"\" placeholder=\"Search\" class=\"search-input search-input--material\" style=\"width: 280px;\">\n*/\n.search-input--material {\n  font-family: 'Roboto', 'Noto', sans-serif;\n  -webkit-font-smoothing: antialiased;\n  font-weight: 400;\n  border-radius: 2px;\n  height: 48px;\n  background-color: #fafafa;\n  background-image: url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iMThweCIgaGVpZ2h0PSIxOHB4IiB2aWV3Qm94PSIwIDAgMTggMTgiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+CiAgICA8IS0tIEdlbmVyYXRvcjogU2tldGNoIDQzLjIgKDM5MDY5KSAtIGh0dHA6Ly93d3cuYm9oZW1pYW5jb2RpbmcuY29tL3NrZXRjaCAtLT4KICAgIDx0aXRsZT5TaGFwZTwvdGl0bGU+CiAgICA8ZGVzYz5DcmVhdGVkIHdpdGggU2tldGNoLjwvZGVzYz4KICAgIDxkZWZzPjwvZGVmcz4KICAgIDxnIGlkPSJQYWdlLTEiIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPgogICAgICAgIDxnIGlkPSJhbmRyb2lkLXNlYXJjaC1pbnB1dC1pY29uIiBmaWxsLXJ1bGU9Im5vbnplcm8iIGZpbGw9IiM4OTg5ODkiPgogICAgICAgICAgICA8ZyBpZD0iY29tcG9uZW50cyI+CiAgICAgICAgICAgICAgICA8ZyBpZD0ibWF0ZXJpYWwtc2VhcmNoIj4KICAgICAgICAgICAgICAgICAgICA8ZyBpZD0ic2VhcmNoIj4KICAgICAgICAgICAgICAgICAgICAgICAgPGcgaWQ9Ik1hdGVyaWFsL0ljb25zLWJsYWNrL3NlYXJjaCI+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPSJNMTIuNTAyLDYuNDkxIEwxMS43MDgsNi40OTEgTDExLjQzMiw2Ljc2NSBDMTIuNDA3LDcuOTAyIDEzLDkuMzc2IDEzLDEwLjk5MSBDMTMsMTQuNTgxIDEwLjA5LDE3LjQ5MSA2LjUsMTcuNDkxIEMyLjkxLDE3LjQ5MSAwLDE0LjU4MSAwLDEwLjk5MSBDMCw3LjQwMSAyLjkxLDQuNDkxIDYuNSw0LjQ5MSBDOC4xMTUsNC40OTEgOS41ODgsNS4wODMgMTAuNzI1LDYuMDU3IEwxMS4wMDEsNS43ODMgTDExLjAwMSw0Ljk5MSBMMTUuOTk5LDAgTDE3LjQ5LDEuNDkxIEwxMi41MDIsNi40OTEgTDEyLjUwMiw2LjQ5MSBaIE02LjUsNi40OTEgQzQuMDE0LDYuNDkxIDIsOC41MDUgMiwxMC45OTEgQzIsMTMuNDc2IDQuMDE0LDE1LjQ5MSA2LjUsMTUuNDkxIEM4Ljk4NSwxNS40OTEgMTEsMTMuNDc2IDExLDEwLjk5MSBDMTEsOC41MDUgOC45ODUsNi40OTEgNi41LDYuNDkxIEw2LjUsNi40OTEgWiIgaWQ9IlNoYXBlIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSg4Ljc0NTAwMCwgOC43NDU1MDApIHNjYWxlKC0xLCAxKSByb3RhdGUoLTE4MC4wMDAwMDApIHRyYW5zbGF0ZSgtOC43NDUwMDAsIC04Ljc0NTUwMCkgIj48L3BhdGg+CiAgICAgICAgICAgICAgICAgICAgICAgIDwvZz4KICAgICAgICAgICAgICAgICAgICA8L2c+CiAgICAgICAgICAgICAgICA8L2c+CiAgICAgICAgICAgIDwvZz4KICAgICAgICA8L2c+CiAgICA8L2c+Cjwvc3ZnPg==');\n  background-size: 18px;\n  background-position: 18px center;\n  font-size: 14px;\n  padding: 0 24px 0 64px;\n  box-shadow: 0 0 2px 0 rgba(0, 0, 0, .12), 0 2px 2px 0 rgba(0, 0, 0, .24), 0 1px 0 0 rgba(255, 255, 255, .06) inset;\n}\n/*~\n  name: Text Input\n  category: Text Input\n  elements: ons-input\n  markup: |\n    <div><input type=\"text\" class=\"text-input\" placeholder=\"text\" value=\"\"></div>\n    <div><input type=\"text\" class=\"text-input\" placeholder=\"text\" value=\"\" disabled></div>\n*/\n.text-input {\n  box-sizing: border-box;\n  background-clip: padding-box;\n  padding: 0;\n  margin: 0;\n  font: inherit;\n  color: inherit;\n  background: transparent;\n  border: none;\n  vertical-align: top;\n  outline: none;\n  line-height: 1;\n  font-family: -apple-system, 'Helvetica Neue', 'Helvetica', 'Arial', 'Lucida Grande', sans-serif;\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n  font-weight: 400;\n  border: none;\n  background-color: transparent;\n  letter-spacing: 0;\n  box-shadow: none;\n  color: #1f1f21;\n  padding: 0;\n  margin: 0;\n  width: auto;\n  font-size: 15px;\n  height: 31px;\n  font-weight: 400;\n  box-sizing: border-box;\n}\n.text-input::-ms-clear {\n  display: none;\n}\n.text-input:disabled {\n  opacity: 0.3;\n  cursor: default;\n  pointer-events: none;\n}\n.text-input::-webkit-input-placeholder {\n  color: #999;\n}\n.text-input:-ms-input-placeholder {\n  color: #999;\n}\n.text-input::-ms-input-placeholder {\n  color: #999;\n}\n.text-input::placeholder {\n  color: #999;\n}\n.text-input:disabled::-webkit-input-placeholder {\n  border: none;\n  background-color: transparent;\n  color: #999;\n}\n.text-input:disabled:-ms-input-placeholder {\n  border: none;\n  background-color: transparent;\n  color: #999;\n}\n.text-input:disabled::-ms-input-placeholder {\n  border: none;\n  background-color: transparent;\n  color: #999;\n}\n.text-input:disabled::placeholder {\n  border: none;\n  background-color: transparent;\n  color: #999;\n}\n.text-input:invalid {\n  border: none;\n  background-color: transparent;\n  color: #1f1f21;\n}\n/*~\n  name: Underbar Text Input\n  category: Text Input\n  elements: ons-input\n  markup: |\n    <div><input type=\"text\" class=\"text-input text-input--underbar\" placeholder=\"text\" value=\"\"></div>\n    <div><input type=\"text\" class=\"text-input text-input--underbar\" placeholder=\"text\" value=\"\" disabled></div>\n*/\n.text-input--underbar {\n  box-sizing: border-box;\n  background-clip: padding-box;\n  padding: 0;\n  margin: 0;\n  font: inherit;\n  color: inherit;\n  background: transparent;\n  border: none;\n  vertical-align: top;\n  outline: none;\n  line-height: 1;\n  font-family: -apple-system, 'Helvetica Neue', 'Helvetica', 'Arial', 'Lucida Grande', sans-serif;\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n  font-weight: 400;\n  border: none;\n  background-color: transparent;\n  letter-spacing: 0;\n  box-shadow: none;\n  color: #1f1f21;\n  padding: 0;\n  margin: 0;\n  width: auto;\n  font-size: 15px;\n  height: 31px;\n  font-weight: 400;\n  box-sizing: border-box;\n  border: none;\n  background-color: transparent;\n  border-bottom: 1px solid #ccc;\n  border-radius: 0;\n}\n.text-input--underbar:disabled {\n  opacity: 0.3;\n  cursor: default;\n  pointer-events: none;\n  border: none;\n  background-color: transparent;\n  border-bottom: 1px solid #ccc;\n}\n.text-input--underbar:disabled::-webkit-input-placeholder {\n  border: none;\n  background-color: transparent;\n  color: #999;\n  border: none;\n  background-color: transparent;\n}\n.text-input--underbar:disabled:-ms-input-placeholder {\n  border: none;\n  background-color: transparent;\n  color: #999;\n  border: none;\n  background-color: transparent;\n}\n.text-input--underbar:disabled::-ms-input-placeholder {\n  border: none;\n  background-color: transparent;\n  color: #999;\n  border: none;\n  background-color: transparent;\n}\n.text-input--underbar:disabled::placeholder {\n  border: none;\n  background-color: transparent;\n  color: #999;\n  border: none;\n  background-color: transparent;\n}\n.text-input--underbar:invalid {\n  border: none;\n  background-color: transparent;\n  color: #1f1f21;\n  border: none;\n  background-color: transparent;\n  border-bottom: 1px solid #ccc;\n}\n/*~\n  name: Material Input\n  category: Text Input\n  elements: ons-input\n  markup: |\n    <span>\n      <div><input class=\"text-input text-input--material\" placeholder=\"Username\" type=\"text\" required></div>\n      <br />\n      <div><input class=\"text-input text-input--material\" placeholder=\"Password\" type=\"password\" required></div>\n    </span>\n*/\n.text-input--material {\n  box-sizing: border-box;\n  background-clip: padding-box;\n  padding: 0;\n  margin: 0;\n  font: inherit;\n  color: inherit;\n  background: transparent;\n  border: none;\n  vertical-align: top;\n  outline: none;\n  line-height: 1;\n  font-family: -apple-system, 'Helvetica Neue', 'Helvetica', 'Arial', 'Lucida Grande', sans-serif;\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n  font-weight: 400;\n  font-family: 'Roboto', 'Noto', sans-serif;\n  -webkit-font-smoothing: antialiased;\n  font-weight: 400;\n  color: #212121;\n  background-image: linear-gradient(to top, transparent 1px, #afafaf 1px);\n  background-size: 100% 2px;\n  background-repeat: no-repeat;\n  background-position: center bottom;\n  background-color: transparent;\n  font-size: 16px;\n  font-weight: 400;\n  border: none;\n  padding-bottom: 2px;\n  border-radius: 0;\n  height: 24px;\n  vertical-align: middle;\n  -webkit-transform: translate3d(0, 0, 0); /* FIXME: prevent ios flicker */\n}\n.text-input--material__label {\n  font-family: 'Roboto', 'Noto', sans-serif;\n  -webkit-font-smoothing: antialiased;\n  font-weight: 400;\n  color: #afafaf;\n  position: absolute;\n  left: 0;\n  top: 2px;\n  font-size: 16px;\n  font-weight: 400;\n  pointer-events: none;\n}\n.text-input--material__label--active {\n  color: #3d5afe;\n  -webkit-transform: translate(0, -75%) scale(0.75);\n          transform: translate(0, -75%) scale(0.75);\n  -webkit-transform-origin: left top;\n          transform-origin: left top;\n  transition: color 0.1s ease-in, -webkit-transform 0.1s ease-in;\n  transition: transform 0.1s ease-in, color 0.1s ease-in;\n  transition: transform 0.1s ease-in, color 0.1s ease-in, -webkit-transform 0.1s ease-in;\n}\n.text-input--material:focus {\n  background-image:\n    linear-gradient(#3d5afe, #3d5afe),\n    linear-gradient(to top, transparent 1px, #afafaf 1px);\n  -webkit-animation: material-text-input-animate 0.3s forwards;\n          animation: material-text-input-animate 0.3s forwards;\n}\n.text-input--material::-webkit-input-placeholder {\n  color: #afafaf;\n  line-height: 20px;\n}\n.text-input--material:-ms-input-placeholder {\n  color: #afafaf;\n  line-height: 20px;\n}\n.text-input--material::-ms-input-placeholder {\n  color: #afafaf;\n  line-height: 20px;\n}\n.text-input--material::placeholder {\n  color: #afafaf;\n  line-height: 20px;\n}\n@-webkit-keyframes material-text-input-animate {\n  0% {\n    background-size: 0% 2px, 100% 2px;\n  }\n\n  100% {\n    background-size: 100% 2px, 100% 2px;\n  }\n}\n@keyframes material-text-input-animate {\n  0% {\n    background-size: 0% 2px, 100% 2px;\n  }\n\n  100% {\n    background-size: 100% 2px, 100% 2px;\n  }\n}\n/*~\n  name: Textarea\n  category: Textarea\n  markup: |\n    <textarea class=\"textarea\" rows=\"3\" placeholder=\"Textarea\"></textarea>\n*/\n.textarea {\n  box-sizing: border-box;\n  background-clip: padding-box;\n  padding: 0;\n  margin: 0;\n  font: inherit;\n  color: inherit;\n  background: transparent;\n  border: none;\n  line-height: normal;\n  font-family: -apple-system, 'Helvetica Neue', 'Helvetica', 'Arial', 'Lucida Grande', sans-serif;\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n  font-weight: 400;\n  vertical-align: top;\n  resize: none;\n  outline: none;\n  padding: 5px 5px 5px 5px;\n  font-size: 15px;\n  font-weight: 400;\n  border-radius: 4px;\n  border: 1px solid #ccc;\n  background-color: #efeff4;\n  color: #1f1f21;\n  letter-spacing: 0;\n  box-shadow: none;\n  -webkit-appearance: none;\n     -moz-appearance: none;\n          appearance: none;\n  width: auto;\n}\n.textarea:disabled {\n  opacity: 0.3;\n  cursor: default;\n  pointer-events: none;\n}\n.textarea::-webkit-input-placeholder {\n  color: #999;\n}\n.textarea:-ms-input-placeholder {\n  color: #999;\n}\n.textarea::-ms-input-placeholder {\n  color: #999;\n}\n.textarea::placeholder {\n  color: #999;\n}\n/*~\n  name: Textarea Transparent\n  category: Textarea\n  markup: |\n    <textarea class=\"textarea textarea--transparent\" rows=\"3\" placeholder=\"Textarea\"></textarea>\n*/\n.textarea--transparent {\n  box-sizing: border-box;\n  background-clip: padding-box;\n  padding: 0;\n  margin: 0;\n  font: inherit;\n  color: inherit;\n  background: transparent;\n  border: none;\n  line-height: normal;\n  font-family: -apple-system, 'Helvetica Neue', 'Helvetica', 'Arial', 'Lucida Grande', sans-serif;\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n  font-weight: 400;\n  vertical-align: top;\n  resize: none;\n  outline: none;\n  padding: 5px 5px 5px 5px;\n  padding-left: 0;\n  padding-right: 0;\n  font-size: 15px;\n  font-weight: 400;\n  border-radius: 4px;\n  border: none;\n  background-color: transparent;\n  color: #1f1f21;\n  letter-spacing: 0;\n  box-shadow: none;\n  -webkit-appearance: none;\n     -moz-appearance: none;\n          appearance: none;\n  width: auto;\n}\n.textarea--transparent:disabled {\n  opacity: 0.3;\n  cursor: default;\n  pointer-events: none;\n}\n.textarea--transparent::-webkit-input-placeholder {\n  color: #999;\n}\n.textarea--transparent:-ms-input-placeholder {\n  color: #999;\n}\n.textarea--transparent::-ms-input-placeholder {\n  color: #999;\n}\n.textarea--transparent::placeholder {\n  color: #999;\n}\n/*~\n  name: Dialog\n  category: Dialog\n  elements: ons-dialog\n  markup: |\n    <div class=\"dialog-mask\"></div>\n    <div class=\"dialog\">\n      <div class=\"dialog-container\">\n        <p style=\"text-align:center;margin-top:40px;opacity:0.4;\">Content</p>\n      </div>\n    </div>\n*/\n.dialog {\n  box-sizing: border-box;\n  background-clip: padding-box;\n  padding: 0;\n  margin: 0;\n  font: inherit;\n  color: inherit;\n  background: transparent;\n  border: none;\n  line-height: normal;\n  cursor: default;\n  -webkit-user-select: none;\n     -moz-user-select: none;\n      -ms-user-select: none;\n          user-select: none;\n  font-family: -apple-system, 'Helvetica Neue', 'Helvetica', 'Arial', 'Lucida Grande', sans-serif;\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n  font-weight: 400;\n  position: absolute;\n  top: 50%;\n  left: 50%;\n  -webkit-transform: translate(-50%, -50%);\n          transform: translate(-50%, -50%);\n  margin: auto auto;\n  overflow: hidden;\n  min-width: 270px;\n  min-height: 100px;\n  text-align: left;\n}\n.dialog-container {\n  height: inherit;\n  min-height: inherit;\n  overflow: hidden;\n  border-radius: 4px;\n  background-color: #f4f4f4;\n  -webkit-mask-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAA5JREFUeNpiYGBgAAgwAAAEAAGbA+oJAAAAAElFTkSuQmCC');\n  color: #1f1f21;\n}\n.dialog-mask {\n  padding: 0;\n  margin: 0;\n  font: inherit;\n  color: inherit;\n  background: transparent;\n  border: none;\n  line-height: normal;\n  cursor: default;\n  -webkit-user-select: none;\n     -moz-user-select: none;\n      -ms-user-select: none;\n          user-select: none;\n  position: absolute;\n  top: 0;\n  right: 0;\n  left: 0;\n  bottom: 0;\n  background-color: rgba(0, 0, 0, .2);\n}\n/*~\n  name: Material Dialog\n  category: Dialog\n  elements: ons-dialog\n  markup: |\n    <div class=\"dialog-mask dialog-mask--material\"></div>\n    <div class=\"dialog dialog--material\">\n      <div class=\"dialog dialog-container--material\">\n        <p style=\"margin-left:24px;margin-right:24px\">The quick brown fox jumps over the lazy dog.</p>\n      </div>\n    </div>\n*/\n.dialog--material {\n  font-family: 'Roboto', 'Noto', sans-serif;\n  -webkit-font-smoothing: antialiased;\n  font-weight: 400;\n  text-align: left;\n  box-shadow:\n      0 16px 24px 2px rgba(0, 0, 0, .14),\n      0 6px 30px 5px rgba(0, 0, 0, .12),\n      0 8px 10px -5px rgba(0, 0, 0, .4);\n}\n.dialog-container--material {\n  border-radius: 2px;\n  background-color: #ffffff;\n  color: #1f1f21;\n}\n.dialog-mask--material {\n  background-color: rgba(0, 0, 0, .3);\n}\n/*~\n  name: Alert Dialog\n  category: Alert Dialog\n  elements: ons-alert-dialog\n  markup: |\n    <div class=\"alert-dialog-mask\"></div>\n    <div class=\"alert-dialog\">\n      <div class=\"alert-dialog-container\">\n        <div class=\"alert-dialog-title\">Alert</div>\n\n        <div class=\"alert-dialog-content\">\n          Hello World!\n        </div>\n\n        <div class=\"alert-dialog-footer\">\n          <button class=\"alert-dialog-button alert-dialog-button--primal\">OK</button>\n        </div>\n      </div>\n    </div>\n*/\n.alert-dialog {\n  box-sizing: border-box;\n  background-clip: padding-box;\n  padding: 0;\n  margin: 0;\n  font: inherit;\n  color: inherit;\n  background: transparent;\n  border: none;\n  line-height: normal;\n  cursor: default;\n  -webkit-user-select: none;\n     -moz-user-select: none;\n      -ms-user-select: none;\n          user-select: none;\n  font-family: -apple-system, 'Helvetica Neue', 'Helvetica', 'Arial', 'Lucida Grande', sans-serif;\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n  font-weight: 400;\n  position: absolute;\n  top: 50%;\n  left: 50%;\n  -webkit-transform: translate(-50%, -50%);\n          transform: translate(-50%, -50%);\n  width: 270px;\n  margin: auto;\n  background-color: #f4f4f4;\n  border-radius: 8px;\n  overflow: visible;\n  max-width: 95%;\n  color: #1f1f21;\n}\n.alert-dialog-container {\n  height: inherit;\n  padding-top: 16px;\n  overflow: hidden;\n}\n.alert-dialog-title {\n  font-family: -apple-system, 'Helvetica Neue', 'Helvetica', 'Arial', 'Lucida Grande', sans-serif;\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n  font-weight: 400;\n  font-size: 17px;\n  font-weight: 500;\n  padding: 0 8px;\n  text-align: center;\n  color: #1f1f21;\n}\n.alert-dialog-content {\n  box-sizing: border-box;\n  background-clip: padding-box;\n  padding: 4px 12px 8px;\n  font-size: 14px;\n  min-height: 36px;\n  text-align: center;\n  color: #1f1f21;\n}\n.alert-dialog-footer {\n  width: 100%;\n}\n.alert-dialog-button {\n  box-sizing: border-box;\n  background-clip: padding-box;\n  padding: 0;\n  margin: 0;\n  font: inherit;\n  color: inherit;\n  background: transparent;\n  border: none;\n  line-height: normal;\n  font-family: -apple-system, 'Helvetica Neue', 'Helvetica', 'Arial', 'Lucida Grande', sans-serif;\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n  font-weight: 400;\n  cursor: default;\n  -webkit-user-select: none;\n     -moz-user-select: none;\n      -ms-user-select: none;\n          user-select: none;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n  overflow: hidden;\n  text-decoration: none;\n  letter-spacing: 0;\n  vertical-align: middle;\n  border: none;\n  border-top: 1px solid #ddd;\n  font-size: 16px;\n  padding: 0 8px;\n  margin: 0;\n  display: block;\n  width: 100%;\n  background-color: transparent;\n  text-align: center;\n  height: 44px;\n  line-height: 44px;\n  outline: none;\n  color: #0076ff;\n}\n@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {\n  .alert-dialog-button {\n    border-top: none;\n    background-size: 100% 1px;\n    background-repeat: no-repeat;\n    background-position: top;\n    background-image: linear-gradient(180deg, #ddd, #ddd 50%, transparent 50%);\n  }\n}\n.alert-dialog-button:active {\n  background-color: rgba(0, 0, 0, .05);\n}\n.alert-dialog-button--primal {\n  font-weight: 500;\n}\n.alert-dialog-footer--rowfooter {\n  white-space: nowrap;\n  display: -webkit-box;\n  display: -webkit-flex;\n  display: flex;\n  -webkit-flex-wrap: wrap;\n          flex-wrap: wrap;\n}\n.alert-dialog-button--rowfooter {\n  -webkit-box-flex: 1;\n  -webkit-flex: 1;\n          flex: 1;\n  display: block;\n  width: 100%;\n  border-left: 1px solid #ddd;\n}\n@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {\n  .alert-dialog-button--rowfooter {\n    border-top: none;\n    border-left: none;\n    background-size: 100% 1px, 1px 100%;\n    background-repeat: no-repeat;\n    background-position: top, left;\n    background-image:\n      linear-gradient(0deg, transparent, transparent 50%, #ddd 50%),\n      linear-gradient(90deg, transparent, transparent 50%, #ddd 50%);\n  }\n}\n.alert-dialog-button--rowfooter:first-child {\n  border-left: none;\n}\n@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {\n  .alert-dialog-button--rowfooter:first-child {\n    border-top: none;\n    background-size: 100% 1px;\n    background-repeat: no-repeat;\n    background-position: top, left;\n    background-image: linear-gradient(0deg, transparent, transparent 50%, #ddd 50%);\n  }\n}\n.alert-dialog-mask {\n  padding: 0;\n  margin: 0;\n  font: inherit;\n  color: inherit;\n  background: transparent;\n  border: none;\n  line-height: normal;\n  cursor: default;\n  -webkit-user-select: none;\n     -moz-user-select: none;\n      -ms-user-select: none;\n          user-select: none;\n  position: absolute;\n  top: 0;\n  right: 0;\n  left: 0;\n  bottom: 0;\n  background-color: rgba(0, 0, 0, .2);\n}\n/*~\n  name: Alert Dialog without Title\n  category: Alert Dialog\n  elements: ons-alert-dialog\n  markup: |\n    <div class=\"alert-dialog-mask\"></div>\n    <div class=\"alert-dialog\">\n      <div class=\"alert-dialog-container\">\n        <div class=\"alert-dialog-content\">\n          Hello World!\n        </div>\n\n        <div class=\"alert-dialog-footer\">\n          <button class=\"alert-dialog-button alert-dialog-button--primal\">OK</button>\n        </div>\n      </div>\n    </div>\n*/\n/*~\n  name: Alert Dialog with Multiple Buttons\n  category: Alert Dialog\n  elements: ons-alert-dialog\n  markup: |\n    <div class=\"alert-dialog-mask\"></div>\n    <div class=\"alert-dialog\">\n      <div class=\"alert-dialog-container\">\n        <div class=\"alert-dialog-content\">\n          Hello World!\n        </div>\n\n        <div class=\"alert-dialog-footer\">\n          <button class=\"alert-dialog-button\">Cancel</button>\n          <button class=\"alert-dialog-button alert-dialog-button--primal\">OK</button>\n        </div>\n      </div>\n    </div>\n*/\n/*~\n  name: Alert Dialog with Multiple Buttons 2\n  category: Alert Dialog\n  elements: ons-alert-dialog\n  markup: |\n    <div class=\"alert-dialog-mask\"></div>\n    <div class=\"alert-dialog\">\n      <div class=\"alert-dialog-container\">\n        <div class=\"alert-dialog-title\">Alert</div>\n\n        <div class=\"alert-dialog-content\">\n          Hello World!\n        </div>\n\n        <div class=\"alert-dialog-footer alert-dialog-footer--rowfooter\">\n          <button class=\"alert-dialog-button alert-dialog-button--rowfooter\">Left</button>\n          <button class=\"alert-dialog-button alert-dialog-button--primal alert-dialog-button--rowfooter\">Center</button>\n          <button class=\"alert-dialog-button alert-dialog-button--rowfooter\">Right</button>\n        </div>\n      </div>\n    </div>\n*/\n/*~\n  name: Material Alert Dialog\n  category: Alert Dialog\n  elements: ons-alert-dialog\n  markup: |\n    <div class=\"alert-dialog-mask alert-dialog-mask--material\"></div>\n    <div class=\"alert-dialog alert-dialog--material\">\n      <div class=\"alert-dialog-container alert-dialog-container--material\">\n        <div class=\"alert-dialog-title alert-dialog-title--material\">\n          Dialog title\n        </div>\n        <div class=\"alert-dialog-content alert-dialog-content--material\">\n          Some dialog content.\n        </div>\n        <div class=\"alert-dialog-footer alert-dialog-footer--material\">\n          <button class=\"alert-dialog-button alert-dialog-button--material\">OK</button>\n          <button class=\"alert-dialog-button alert-dialog-button--material\">CANCEL</button>\n        </div>\n      </div>\n    </div>\n*/\n.alert-dialog--material {\n  border-radius: 2px;\n  background-color: #ffffff;\n}\n.alert-dialog-container--material {\n  padding: 22px 0 0 0;\n  box-shadow:\n      0 16px 24px 2px rgba(0, 0, 0, .14),\n      0 6px 30px 5px rgba(0, 0, 0, .12),\n      0 8px 10px -5px rgba(0, 0, 0, .4);\n}\n.alert-dialog-title--material {\n  font-family: 'Roboto', 'Noto', sans-serif;\n  -webkit-font-smoothing: antialiased;\n  font-weight: 400;\n  text-align: left;\n  font-size: 20px;\n  font-weight: 500;\n  padding: 0 24px;\n  color: #31313a;\n}\n.alert-dialog-content--material {\n  font-family: 'Roboto', 'Noto', sans-serif;\n  -webkit-font-smoothing: antialiased;\n  font-weight: 400;\n  text-align: left;\n  font-size: 16px;\n  font-weight: 400;\n  line-height: 20px;\n  padding: 0 24px;\n  margin: 24px 0 10px 0;\n  min-height: 0;\n  color: rgba(49, 49, 58, .85);\n}\n.alert-dialog-footer--material {\n  display: block;\n  padding: 0;\n  height: 52px;\n  box-sizing: border-box;\n  margin: 0;\n  line-height: 1;\n}\n.alert-dialog-button--material {\n  font-family: 'Roboto', 'Noto', sans-serif;\n  -webkit-font-smoothing: antialiased;\n  font-weight: 400;\n  text-transform: uppercase;\n  display: inline-block;\n  width: auto;\n  float: right;\n  background: none;\n  border: none;\n  border-radius: 2px;\n  font-size: 14px;\n  font-weight: 500;\n  outline: none;\n  height: 36px;\n  line-height: 36px;\n  padding: 0 8px;\n  margin: 8px 8px 8px 0;\n  box-sizing: border-box;\n  min-width: 50px;\n  color: #37474f;\n}\n@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {\n  .alert-dialog-button--material {\n    background: none;\n  }\n}\n.alert-dialog-button--material:active {\n  background-color: transparent;\n  background-color: initial;\n}\n/* stylelint-disable */\n.alert-dialog-button--rowfooter--material,\n.alert-dialog-button--rowfooter--material:first-child { /* stylelint-enable */\n  border: 0;\n}\n@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {\n  .alert-dialog-button--rowfooter--material,\n.alert-dialog-button--rowfooter--material:first-child {\n    background: none;\n  }\n}\n/* stylelint-disable */\n.alert-dialog-button--primal--material { /* stylelint-enable */\n  font-weight: 500;\n}\n@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {\n  .alert-dialog-button--primal--material {\n    background: none;\n  }\n}\n.alert-dialog-mask--material {\n  background-color: rgba(0, 0, 0, .3);\n}\n/*~\n  name: Popover\n  category: Popover\n  elements: ons-popover\n  markup: |\n    <div class=\"popover-mask\"></div>\n    <div class=\"popover popover--bottom\" style=\"bottom: 20px; left: 65px;\">\n      <div class=\"popover__arrow popover--bottom__arrow\" style=\"left: 110px;\"></div>\n      <div class=\"popover__content popover--bottom__content\">\n        <div style=\"text-align:center;opacity:0.8;margin-top:40px\">Content</div>\n      </div>\n    </div>\n*/\n/*~\n  name: Popover(top)\n  category: Popover\n  elements: ons-popover\n  markup: |\n    <div class=\"popover-mask\"></div>\n    <div class=\"popover popover--top\" style=\"top: 20px; left: 50px;\">\n      <div class=\"popover__arrow popover--top__arrow\" style=\"margin-left: 110px;\"></div>\n      <div class=\"popover__content popover--top__content\">\n        <div style=\"text-align: center; opacity: 0.8; margin-top: 40px\">Content</div>\n      </div>\n    </div>\n*/\n/*~\n  name: Popover(left)\n  category: Popover\n  elements: ons-popover\n  markup: |\n    <div class=\"popover-mask\"></div>\n    <div class=\"popover popover--right\" style=\"top: 20px; right: 20px;\">\n      <div class=\"popover__arrow popover--right__arrow\" style=\"bottom: 50px;\"></div>\n      <div class=\"popover__content popover--right__content\">\n        <div style=\"text-align: center; opacity: 0.8; margin-top: 40px\">Content</div>\n      </div>\n    </div>\n*/\n/*~\n  name: Popover(right)\n  category: Popover\n  elements: ons-popover\n  markup: |\n    <div class=\"popover-mask\"></div>\n    <div class=\"popover popover--left\" style=\"top: 20px;left: 20px;\">\n      <div class=\"popover__arrow popover--left__arrow\" style=\"top: 50px;\"></div>\n      <div class=\"popover__content popover--left__content\">\n        <div style=\"text-align: center; opacity: 0.8; margin-top: 40px\">Content</div>\n      </div>\n    </div>\n*/\n.popover {\n  position: absolute;\n  z-index: 20001;\n}\n.popover--bottom {\n  bottom: 0;\n}\n.popover--top {\n  top: 0;\n}\n.popover--left {\n  left: 0;\n}\n.popover--right {\n  right: 0;\n}\n.popover-mask {\n  left: 0;\n  right: 0;\n  top: 0;\n  bottom: 0;\n  background-color: rgba(0, 0, 0, .2);\n  position: absolute;\n  z-index: 19999;\n}\n.popover__content {\n  box-sizing: border-box;\n  background-clip: padding-box;\n  padding: 0;\n  margin: 0;\n  font: inherit;\n  color: inherit;\n  background: transparent;\n  border: none;\n  line-height: normal;\n  cursor: default;\n  -webkit-user-select: none;\n     -moz-user-select: none;\n      -ms-user-select: none;\n          user-select: none;\n  font-family: -apple-system, 'Helvetica Neue', 'Helvetica', 'Arial', 'Lucida Grande', sans-serif;\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n  font-weight: 400;\n  display: block;\n  width: 220px;\n  overflow: auto;\n  min-height: 100px;\n  max-height: 100%;\n  background-color: white;\n  border-radius: 8px;\n  color: #1f1f21;\n  pointer-events: auto;\n}\n.popover--top__content {\n\n}\n.popover--bottom__content {\n\n}\n.popover--left__content {\n\n}\n.popover--right__content {\n\n}\n.popover__arrow {\n  position: absolute;\n  width: 18px;\n  height: 18px;\n  -webkit-transform-origin: 50% 50% 0;\n          transform-origin: 50% 50% 0;\n  background-color: transparent;\n  background-image: linear-gradient(45deg, white, white 50%, transparent 50%);\n  border-radius: 0 0 0 4px;\n  margin: 0;\n  z-index: 20001;\n}\n/* NOTE: If you changed this properties, you should check if ons-popover is broken. */\n.popover--bottom__arrow {\n  -webkit-transform: translateY(6px) translateX(-9px) rotate(-45deg);\n          transform: translateY(6px) translateX(-9px) rotate(-45deg);\n  bottom: 0;\n  margin-right: -18px;\n}\n.popover--top__arrow {\n  -webkit-transform: translateY(-6px) translateX(-9px) rotate(135deg);\n          transform: translateY(-6px) translateX(-9px) rotate(135deg);\n  top: 0;\n  margin-right: -18px;\n}\n.popover--left__arrow {\n  -webkit-transform: translateX(-6px) translateY(-9px) rotate(45deg);\n          transform: translateX(-6px) translateY(-9px) rotate(45deg);\n  left: 0;\n  margin-bottom: -18px;\n}\n.popover--right__arrow {\n  -webkit-transform: translateX(6px) translateY(-9px) rotate(225deg);\n          transform: translateX(6px) translateY(-9px) rotate(225deg);\n  right: 0;\n  margin-bottom: -18px;\n}\n/*~\n  name: Material Popover\n  category: Popover\n  elements: ons-popover\n  markup: |\n    <div class=\"popover-mask popover-mask--material\"></div>\n    <div class=\"popover popover--material popover--left\" style=\"top: 50px; left: 65px;\">\n      <div class=\"popover__arrow popover--material__arrow popover--left__arrow\"></div>\n      <div class=\"popover__content popover--material__content popover--left__content\">\n        <div style=\"text-align: center; opacity: 0.8; margin-top: 40px\">Content</div>\n      </div>\n    </div>\n*/\n.popover--material {\n}\n.popover-mask--material {\n  background-color: transparent;\n}\n.popover--material__content {\n  background-color: #fafafa;\n  border-radius: 2px;\n  color: #1f1f21;\n  box-shadow:\n      0 2px 2px 0 rgba(0, 0, 0, .14),\n      0 1px 5px 0 rgba(0, 0, 0, .12),\n      0 3px 1px -2px rgba(0, 0, 0, .2);\n}\n.popover--material__arrow {\n  display: none;\n}\n/*~\n  name: Progress Bar\n  category: Progress Bar\n  elements: ons-progress-bar\n  markup: |\n    <div class=\"progress-bar\">\n      <div class=\"progress-bar__primary\" style=\"width: 30%\"></div>\n    </div>\n    <br />\n    <div class=\"progress-bar\">\n      <div class=\"progress-bar__primary\" style=\"width:20%\"></div>\n      <div class=\"progress-bar__secondary\" style=\"width:76%\"></div>\n    </div>\n    <br />\n    <div class=\"progress-bar progress-bar--indeterminate\">\n    </div>\n*/\n.progress-bar {\n  position: relative;\n  height: 2px;\n  display: block;\n  width: 100%;\n  background-color: transparent;\n  background-clip: padding-box;\n  margin: 0;\n  overflow: hidden;\n  border-radius: 4px;\n}\n.progress-bar__primary,\n.progress-bar__secondary {\n  position: absolute;\n  background-color: #0076ff;\n  top: 0;\n  bottom: 0;\n  transition: width .3s linear;\n  z-index: 100;\n  border-radius: 4px;\n}\n.progress-bar__secondary {\n  background-color: #65adff;\n  z-index: 0;\n}\n.progress-bar--indeterminate:before {\n  content: '';\n  position: absolute;\n  background-color: #0076ff;\n  top: 0;\n  left: 0;\n  bottom: 0;\n  will-change: left, right;\n  -webkit-animation: progress-bar__indeterminate 2.1s cubic-bezier(0.65, 0.815, 0.735, 0.395) infinite;\n          animation: progress-bar__indeterminate 2.1s cubic-bezier(0.65, 0.815, 0.735, 0.395) infinite;\n  border-radius: 4px;\n}\n.progress-bar--indeterminate:after {\n  content: '';\n  position: absolute;\n  background-color: #0076ff;\n  top: 0;\n  left: 0;\n  bottom: 0;\n  will-change: left, right;\n  -webkit-animation: progress-bar__indeterminate-short 2.1s cubic-bezier(0.165, 0.84, 0.44, 1) infinite;\n          animation: progress-bar__indeterminate-short 2.1s cubic-bezier(0.165, 0.84, 0.44, 1) infinite;\n  -webkit-animation-delay: 1.15s;\n          animation-delay: 1.15s;\n  border-radius: 4px;\n}\n@-webkit-keyframes progress-bar__indeterminate {\n  0% {\n    left: -35%;\n    right: 100%;\n  }\n\n  60% {\n    left: 100%;\n    right: -90%;\n  }\n\n  100% {\n    left: 100%;\n    right: -90%;\n  }\n}\n@keyframes progress-bar__indeterminate {\n  0% {\n    left: -35%;\n    right: 100%;\n  }\n\n  60% {\n    left: 100%;\n    right: -90%;\n  }\n\n  100% {\n    left: 100%;\n    right: -90%;\n  }\n}\n@-webkit-keyframes progress-bar__indeterminate-short {\n  0% {\n    left: -200%;\n    right: 100%;\n  }\n\n  60% {\n    left: 107%;\n    right: -8%;\n  }\n\n  100% {\n    left: 107%;\n    right: -8%;\n  }\n}\n@keyframes progress-bar__indeterminate-short {\n  0% {\n    left: -200%;\n    right: 100%;\n  }\n\n  60% {\n    left: 107%;\n    right: -8%;\n  }\n\n  100% {\n    left: 107%;\n    right: -8%;\n  }\n}\n/*~\n  name: Material Progress Bar\n  category: Progress Bar\n  elements: ons-progress-bar\n  markup: |\n    <div class=\"progress-bar progress-bar--material\">\n      <div class=\"progress-bar__primary progress-bar--material__primary\" style=\"width: 30%\"></div>\n    </div>\n    <br />\n    <div class=\"progress-bar progress-bar--material\">\n      <div class=\"progress-bar__primary progress-bar--material__primary\" style=\"width:20%\"></div>\n      <div class=\"progress-bar__secondary progress-bar--material__secondary\" style=\"width:76%\"></div>\n    </div>\n    <br />\n    <div class=\"progress-bar progress-bar--material progress-bar--indeterminate\">\n    </div>\n*/\n.progress-bar--material {\n  height: 4px;\n  background-color: transparent;\n  border-radius: 0;\n}\n.progress-bar--material__primary,\n.progress-bar--material__secondary {\n  background-color: #37474f;\n  border-radius: 0;\n}\n.progress-bar--material__secondary {\n  background-color: #548ba7;\n  z-index: 0;\n}\n.progress-bar--material.progress-bar--indeterminate:before { /* FIXME */\n  background-color: #37474f;\n  border-radius: 0;\n}\n.progress-bar--material.progress-bar--indeterminate:after { /* FIXME */\n  background-color: #37474f;\n  border-radius: 0;\n}\n/*~\n  name: Progress Circle\n  category: Progress Circle\n  elements: ons-progress-circular\n  markup: |\n    <svg class=\"progress-circular progress-circular--indeterminate\">\n      <circle class=\"progress-circular__background\"/>\n      <circle class=\"progress-circular__primary progress-circular--indeterminate__primary\"/>\n      <circle class=\"progress-circular__secondary progress-circular--indeterminate__secondary\"/>\n    </svg>\n\n    <svg class=\"progress-circular\">\n      <circle class=\"progress-circular__background\"/>\n      <circle class=\"progress-circular__secondary\" style=\"stroke-dasharray: 140%, 251.32%\"/>\n      <circle class=\"progress-circular__primary\" style=\"stroke-dasharray: 100%, 251.32%\"/>\n    </svg>\n\n    <svg class=\"progress-circular\">\n      <circle class=\"progress-circular__background\"/>\n      <circle class=\"progress-circular__primary\" style=\"stroke-dasharray: 80%, 251.32%\"/>\n    </svg>\n*/\n.progress-circular {\n  height: 32px;\n  position: relative;\n  width: 32px;\n  -webkit-transform: rotate(270deg);\n          transform: rotate(270deg);\n  -webkit-animation: none;\n          animation: none;\n}\n.progress-circular__background,\n.progress-circular__primary,\n.progress-circular__secondary {\n  cx: 50%;\n  cy: 50%;\n  r: 40%;\n  -webkit-animation: none;\n          animation: none;\n  fill: none;\n  stroke-width: 5%;\n  stroke-miterlimit: 10;\n}\n.progress-circular__background {\n  stroke: transparent;\n}\n.progress-circular__primary {\n  stroke-dasharray: 1, 200;\n  stroke-dashoffset: 0;\n  stroke: #0076ff;\n  transition: all 1s cubic-bezier(0.4, 0, 0.2, 1);\n}\n.progress-circular__secondary {\n  stroke: #65adff;\n}\n.progress-circular--indeterminate {\n  -webkit-animation: progress__rotate 2s linear infinite;\n          animation: progress__rotate 2s linear infinite;\n  -webkit-transform: none;\n          transform: none;\n}\n.progress-circular--indeterminate__primary {\n  -webkit-animation: progress__dash 1.5s ease-in-out infinite;\n          animation: progress__dash 1.5s ease-in-out infinite;\n}\n.progress-circular--indeterminate__secondary {\n  display: none;\n}\n@-webkit-keyframes progress__rotate {\n  100% {\n    -webkit-transform: rotate(360deg);\n            transform: rotate(360deg);\n  }\n}\n@keyframes progress__rotate {\n  100% {\n    -webkit-transform: rotate(360deg);\n            transform: rotate(360deg);\n  }\n}\n@-webkit-keyframes progress__dash {\n  0% {\n    stroke-dasharray: 10%, 241.32%;\n    stroke-dashoffset: 0;\n  }\n\n  50% {\n    stroke-dasharray: 201%, 50.322%;\n    stroke-dashoffset: -100%;\n  }\n\n  100% {\n    stroke-dasharray: 10%, 241.32%;\n    stroke-dashoffset: -251.32%;\n  }\n}\n@keyframes progress__dash {\n  0% {\n    stroke-dasharray: 10%, 241.32%;\n    stroke-dashoffset: 0;\n  }\n\n  50% {\n    stroke-dasharray: 201%, 50.322%;\n    stroke-dashoffset: -100%;\n  }\n\n  100% {\n    stroke-dasharray: 10%, 241.32%;\n    stroke-dashoffset: -251.32%;\n  }\n}\n/*~\n  name: Material Progress Circle\n  category: Progress Circle\n  elements: ons-progress-circular\n  markup: |\n    <svg class=\"progress-circular progress-circular--material progress-circular--indeterminate\">\n      <circle class=\"progress-circular__background progress-circular--material__background\"/>\n      <circle class=\"progress-circular__primary progress-circular--material__primary progress-circular--indeterminate__primary\"/>\n      <circle class=\"progress-circular__secondary progress-circular--material__secondary progress-circular--indeterminate__secondary\"/>\n    </svg>\n\n    <svg class=\"progress-circular progress-circular--material\">\n      <circle class=\"progress-circular__background progress-circular--material__background\"/>\n      <circle class=\"progress-circular__secondary progress-circular--material__secondary\" style=\"stroke-dasharray: 140%, 251.32%\"/>\n      <circle class=\"progress-circular__primary progress-circular--material__primary\" style=\"stroke-dasharray: 100%, 251.32%\"/>\n    </svg>\n\n    <svg class=\"progress-circular progress-circular--material\">\n      <circle class=\"progress-circular__background progress-circular--material__background\"/>\n      <circle class=\"progress-circular__primary progress-circular--material__primary\" style=\"stroke-dasharray: 80%, 251.32%\"/>\n    </svg>\n*/\n.progress-circular--material__background,\n.progress-circular--material__primary,\n.progress-circular--material__secondary {\n  stroke-width: 9%;\n}\n.progress-circular--material__background {\n  stroke: transparent;\n}\n.progress-circular--material__primary {\n  stroke: #37474f;\n}\n.progress-circular--material__secondary {\n  stroke: #548ba7;\n}\n/*~\n  name: Fab\n  category: Fab\n  elements: ons-fab\n  markup: |\n    <button class=\"fab\"><i class=\"zmdi zmdi-car\"></i></button>\n    <button class=\"fab\" disabled><i class=\"zmdi zmdi-car\"></i></button>\n*/\n.fab {\n  position: relative;\n  display: inline-block;\n  box-sizing: border-box;\n  background-clip: padding-box;\n  padding: 0;\n  margin: 0;\n  font: inherit;\n  color: inherit;\n  background: transparent;\n  border: none;\n  line-height: normal;\n  font-family: -apple-system, 'Helvetica Neue', 'Helvetica', 'Arial', 'Lucida Grande', sans-serif;\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n  font-weight: 400;\n  cursor: default;\n  -webkit-user-select: none;\n     -moz-user-select: none;\n      -ms-user-select: none;\n          user-select: none;\n  width: 56px;\n  height: 56px;\n  text-decoration: none;\n  font-size: 25px;\n  line-height: 56px;\n  letter-spacing: 0;\n  color: #ffffff;\n  vertical-align: middle;\n  text-align: center;\n  background-color: #0076ff;\n  border: 0 solid currentColor;\n  border-radius: 50%;\n  overflow: hidden;\n  box-shadow: 0 3px 6px rgba(0, 0, 0, .12);\n  transition: all 0.1s linear;\n}\n.fab:active {\n  box-shadow: 0 3px 6 rgba(0, 0, 0, .12);\n  background-color: rgba(0, 118, 255, 0.7);\n  transition: all 0.2s ease;\n  box-shadow: 0 0 6 rgba(0, 0, 0, .12);\n}\n.fab:focus {\n  outline: 0;\n}\n.fab__icon {\n  position: relative;\n  overflow: hidden;\n  height: 100%;\n  width: 100%;\n  display: block;\n  border-radius: 100%;\n  padding: 0;\n  z-index: 100;\n  line-height: 56px;\n}\n.fab:disabled,\n.fab[disabled] {\n  background-color: rgba(0, 0, 0, 0.5);\n  box-shadow: none;\n  opacity: 0.3;\n  cursor: default;\n  pointer-events: none;\n}\n/*~\n  name: Material Fab\n  category: Fab\n  elements: ons-fab\n  markup: |\n    <button class=\"fab fab--material\"><i class=\"zmdi zmdi-car\"></i></button>\n    <button class=\"fab fab--material\" disabled><i class=\"zmdi zmdi-car\"></i></button>\n*/\n.fab--material {\n  position: relative;\n  display: inline-block;\n  box-sizing: border-box;\n  background-clip: padding-box;\n  padding: 0;\n  margin: 0;\n  font: inherit;\n  color: inherit;\n  background: transparent;\n  border: none;\n  line-height: normal;\n  font-family: -apple-system, 'Helvetica Neue', 'Helvetica', 'Arial', 'Lucida Grande', sans-serif;\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n  font-weight: 400;\n  cursor: default;\n  -webkit-user-select: none;\n     -moz-user-select: none;\n      -ms-user-select: none;\n          user-select: none;\n  width: 56px;\n  height: 56px;\n  text-decoration: none;\n  font-size: 25px;\n  line-height: 56px;\n  letter-spacing: 0;\n  color: #ffffff;\n  vertical-align: middle;\n  text-align: center;\n  background-color: #0076ff;\n  border: 0 solid currentColor;\n  border-radius: 50%;\n  overflow: hidden;\n  box-shadow: 0 3px 6px rgba(0, 0, 0, .12);\n  transition: all 0.1s linear;\n  font-family: 'Roboto', 'Noto', sans-serif;\n  -webkit-font-smoothing: antialiased;\n  font-weight: 400;\n  width: 56px;\n  height: 56px;\n  text-decoration: none;\n  font-size: 25px;\n  line-height: 56px;\n  color: #31313a;\n  background-color: #ffffff;\n  box-shadow:\n      0 4px 5px 0 rgba(0, 0, 0, .14),\n      0 1px 10px 0 rgba(0, 0, 0, .12),\n      0 2px 4px -1px rgba(0, 0, 0, .4);\n  transition: all 0.2s ease-in-out;\n}\n.fab--material:active {\n  box-shadow:\n      0 8px 10px 1px rgba(0, 0, 0, .14),\n      0 3px 14px 2px rgba(0, 0, 0, .12),\n      0 5px 5px -3px rgba(0, 0, 0, .4);\n  background-color: rgba(255, 255, 255, .75);\n  transition: all 0.2s ease;\n}\n.fab--material:focus {\n  outline: 0;\n}\n.fab--material__icon {\n  position: relative;\n  overflow: hidden;\n  height: 100%;\n  width: 100%;\n  display: block;\n  border-radius: 100%;\n  padding: 0;\n  z-index: 100;\n  line-height: 56px;\n}\n.fab--material:disabled,\n.fab--material[disabled] {\n  background-color: rgba(0, 0, 0, 0.5);\n  box-shadow: none;\n  opacity: 0.3;\n  cursor: default;\n  pointer-events: none;\n}\n/*~\n  name: Fab Mini\n  category: Fab\n  elements: ons-fab\n  markup: |\n    <button class=\"fab fab--mini\"><i class=\"zmdi zmdi-plus\"></i></button>\n    <button class=\"fab fab--mini\" disabled><i class=\"zmdi zmdi-plus\"></i></button>\n*/\n/*~\n  name: Material Fab Mini\n  category: Fab\n  elements: ons-fab\n  markup: |\n    <button class=\"fab fab--material fab--mini\"><i class=\"zmdi zmdi-plus\"></i></button>\n    <button class=\"fab fab--material fab--mini\" disabled><i class=\"zmdi zmdi-plus\"></i></button>\n*/\n.fab--mini {\n  width: 40px;\n  height: 40px;\n  line-height: 40px;\n}\n.fab--mini__icon {\n  line-height: 40px;\n}\n.speed-dial__item {\n  position: absolute;\n  -webkit-transform: scale(0);\n          transform: scale(0);\n}\n.fab--top__right {\n  top: 20px;\n  bottom: auto;\n  right: 20px;\n  left: auto;\n  position: absolute;\n}\n.fab--bottom__right {\n  top: auto;\n  bottom: 20px;\n  right: 20px;\n  left: auto;\n  position: absolute;\n}\n.fab--top__left {\n  top: 20px;\n  bottom: auto;\n  right: auto;\n  left: 20px;\n  position: absolute;\n}\n.fab--bottom__left {\n  top: auto;\n  bottom: 20px;\n  right: auto;\n  left: 20px;\n  position: absolute;\n}\n.fab--top__center {\n  top: 20px;\n  bottom: auto;\n  margin-left: -28px;\n  left: 50%;\n  right: auto;\n  position: absolute;\n}\n.fab--bottom__center {\n  top: auto;\n  bottom: 20px;\n  margin-left: -28px;\n  left: 50%;\n  right: auto;\n  position: absolute;\n}\n/*~\n  name: Modal\n  category: Modal\n  elements: ons-modal\n  markup: |\n    <div class=\"modal\">\n      <div class=\"modal__content\">\n        Message Text\n      </div>\n    </div>\n*/\n.modal {\n  box-sizing: border-box;\n  background-clip: padding-box;\n  white-space: nowrap;\n  overflow: hidden;\n  word-spacing: 0;\n  padding: 0;\n  margin: 0;\n  font: inherit;\n  color: inherit;\n  background: transparent;\n  border: none;\n  line-height: normal;\n  box-sizing: border-box;\n  background-clip: padding-box;\n  font-family: -apple-system, 'Helvetica Neue', 'Helvetica', 'Arial', 'Lucida Grande', sans-serif;\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n  font-weight: 400;\n  overflow: hidden;\n  background-color: rgba(0, 0, 0, .7);\n  position: absolute;\n  left: 0;\n  right: 0;\n  top: 0;\n  bottom: 0;\n  width: 100%;\n  height: 100%;\n  display: table;\n  z-index: 2147483647;\n}\n.modal__content {\n  box-sizing: border-box;\n  background-clip: padding-box;\n  white-space: nowrap;\n  overflow: hidden;\n  word-spacing: 0;\n  padding: 0;\n  margin: 0;\n  font: inherit;\n  color: inherit;\n  background: transparent;\n  border: none;\n  line-height: normal;\n  box-sizing: border-box;\n  background-clip: padding-box;\n  font-family: -apple-system, 'Helvetica Neue', 'Helvetica', 'Arial', 'Lucida Grande', sans-serif;\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n  font-weight: 400;\n  display: table-cell;\n  vertical-align: middle;\n  text-align: center;\n  color: #fff;\n  white-space: normal;\n}\n/*~\n  name: Select Input\n  category: Select Input\n  markup: |\n    <select class=\"select-input\">\n      <option>Option 1</option>\n      <option>Option 2</option>\n      <option>Option 3</option>\n    </select>\n\n    &nbsp;\n\n    <select class=\"select-input\" disabled>\n      <option>Option 1</option>\n      <option>Option 2</option>\n      <option>Option 3</option>\n    </select>\n*/\n.select-input {\n  box-sizing: border-box;\n  background-clip: padding-box;\n  padding: 0;\n  margin: 0;\n  font: inherit;\n  color: inherit;\n  background: transparent;\n  border: none;\n  vertical-align: top;\n  outline: none;\n  line-height: 1;\n  font-family: -apple-system, 'Helvetica Neue', 'Helvetica', 'Arial', 'Lucida Grande', sans-serif;\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n  font-weight: 400;\n  border: none;\n  background-color: transparent;\n  position: relative;\n  font-size: 17px;\n  height: 32px;\n  line-height: 32px;\n  border-color: #ccc;\n  color: #1f1f21;\n  -webkit-appearance: none;\n     -moz-appearance: none;\n          appearance: none;\n  display: inline-block;\n  border-radius: 0;\n  border: none;\n  padding: 0 20px 0 0;\n  background-color: transparent;\n  background-image: url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iMTBweCIgaGVpZ2h0PSI1cHgiIHZpZXdCb3g9IjAgMCAxMCA1IiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPgogICAgPCEtLSBHZW5lcmF0b3I6IFNrZXRjaCA0My4yICgzOTA2OSkgLSBodHRwOi8vd3d3LmJvaGVtaWFuY29kaW5nLmNvbS9za2V0Y2ggLS0+CiAgICA8dGl0bGU+c2VsZWN0LWFsbG93PC90aXRsZT4KICAgIDxkZXNjPkNyZWF0ZWQgd2l0aCBTa2V0Y2guPC9kZXNjPgogICAgPGRlZnM+PC9kZWZzPgogICAgPGcgaWQ9InNlbGVjdCIgc3Ryb2tlPSJub25lIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCI+CiAgICAgICAgPGcgaWQ9Imlvcy1zZWxlY3QiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0xOTguMDAwMDAwLCAtMTE0LjAwMDAwMCkiIGZpbGw9IiM3NTc1NzUiPgogICAgICAgICAgICA8ZyBpZD0ibWVudS1iYXItKy1vcGVuLW1lbnUiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDEyMy4wMDAwMDAsIDEwMC4wMDAwMDApIj4KICAgICAgICAgICAgICAgIDxnIGlkPSJtZW51LWJhciI+CiAgICAgICAgICAgICAgICAgICAgPHBvbHlnb24gaWQ9InNlbGVjdC1hbGxvdyIgcG9pbnRzPSI3NSAxNCA4MCAxOSA4NSAxNCI+PC9wb2x5Z29uPgogICAgICAgICAgICAgICAgPC9nPgogICAgICAgICAgICA8L2c+CiAgICAgICAgPC9nPgogICAgPC9nPgo8L3N2Zz4=');\n  background-repeat: no-repeat;\n  background-position: right center;\n  border-bottom: none;\n}\n.select-input::-ms-clear {\n  display: none;\n}\n.select-input::-webkit-input-placeholder {\n  color: #999;\n}\n.select-input:-ms-input-placeholder {\n  color: #999;\n}\n.select-input::-ms-input-placeholder {\n  color: #999;\n}\n.select-input::placeholder {\n  color: #999;\n}\n.select-input:disabled {\n  opacity: 0.3;\n  cursor: default;\n  pointer-events: none;\n  border: none;\n  background-color: transparent;\n}\n.select-input:disabled::-webkit-input-placeholder {\n  border: none;\n  background-color: transparent;\n  color: #999;\n}\n.select-input:disabled:-ms-input-placeholder {\n  border: none;\n  background-color: transparent;\n  color: #999;\n}\n.select-input:disabled::-ms-input-placeholder {\n  border: none;\n  background-color: transparent;\n  color: #999;\n}\n.select-input:disabled::placeholder {\n  border: none;\n  background-color: transparent;\n  color: #999;\n}\n.select-input:invalid {\n  border: none;\n  background-color: transparent;\n  color: #1f1f21;\n}\n.select-input[multiple] {\n  height: 64px;\n}\n/*~\n  name: Material Select Input\n  category: Select Input\n  markup: |\n    <select class=\"select-input select-input--material\">\n      <option>Option 1</option>\n      <option>Option 2</option>\n      <option>Option 3</option>\n    </select>\n\n    &nbsp;\n\n    <select class=\"select-input select-input--material\" disabled>\n      <option>Option 1</option>\n      <option>Option 2</option>\n      <option>Option 3</option>\n    </select>\n*/\n.select-input--material {\n  font-family: 'Roboto', 'Noto', sans-serif;\n  -webkit-font-smoothing: antialiased;\n  font-weight: 400;\n  color: #1f1f21;\n  font-size: 15px;\n  background-image: url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iMTBweCIgaGVpZ2h0PSI1cHgiIHZpZXdCb3g9IjAgMCAxMCA1IiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPgogICAgPCEtLSBHZW5lcmF0b3I6IFNrZXRjaCA0My4yICgzOTA2OSkgLSBodHRwOi8vd3d3LmJvaGVtaWFuY29kaW5nLmNvbS9za2V0Y2ggLS0+CiAgICA8dGl0bGU+c2VsZWN0LWFsbG93PC90aXRsZT4KICAgIDxkZXNjPkNyZWF0ZWQgd2l0aCBTa2V0Y2guPC9kZXNjPgogICAgPGRlZnM+PC9kZWZzPgogICAgPGcgaWQ9InNlbGVjdCIgc3Ryb2tlPSJub25lIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCI+CiAgICAgICAgPGcgaWQ9Imlvcy1zZWxlY3QiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0xOTguMDAwMDAwLCAtMTE0LjAwMDAwMCkiIGZpbGw9IiM3NTc1NzUiPgogICAgICAgICAgICA8ZyBpZD0ibWVudS1iYXItKy1vcGVuLW1lbnUiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDEyMy4wMDAwMDAsIDEwMC4wMDAwMDApIj4KICAgICAgICAgICAgICAgIDxnIGlkPSJtZW51LWJhciI+CiAgICAgICAgICAgICAgICAgICAgPHBvbHlnb24gaWQ9InNlbGVjdC1hbGxvdyIgcG9pbnRzPSI3NSAxNCA4MCAxOSA4NSAxNCI+PC9wb2x5Z29uPgogICAgICAgICAgICAgICAgPC9nPgogICAgICAgICAgICA8L2c+CiAgICAgICAgPC9nPgogICAgPC9nPgo8L3N2Zz4='), linear-gradient(to top, rgba(0, 0, 0, 0.12) 50%, rgba(0, 0, 0, 0.12) 50%);\n  background-size: auto, 100% 1px;\n  background-repeat: no-repeat;\n  background-position: right center, left bottom;\n  border: none;\n  font-weight: 400;\n  -webkit-transform: translate3d(0, 0, 0);\n          transform: translate3d(0, 0, 0); /* prevent ios flicker */\n}\n.select-input--material__label {\n  font-family: 'Roboto', 'Noto', sans-serif;\n  -webkit-font-smoothing: antialiased;\n  font-weight: 400;\n  color: rgba(0, 0, 0, .81);\n  position: absolute;\n  left: 0;\n  top: 2px;\n  font-size: 16px;\n  pointer-events: none;\n}\n.select-input--material__label--active {\n  color: rgba(0, 0, 0, .15);\n  -webkit-transform: translate(0, -75%) scale(0.75);\n          transform: translate(0, -75%) scale(0.75);\n  -webkit-transform-origin: left top;\n          transform-origin: left top;\n  transition: color 0.1s ease-in, -webkit-transform 0.1s ease-in;\n  transition: transform 0.1s ease-in, color 0.1s ease-in;\n  transition: transform 0.1s ease-in, color 0.1s ease-in, -webkit-transform 0.1s ease-in;\n}\n.select-input--material::-webkit-input-placeholder {\n  color: rgba(0, 0, 0, .81);\n  line-height: 20px;\n}\n.select-input--material:-ms-input-placeholder {\n  color: rgba(0, 0, 0, .81);\n  line-height: 20px;\n}\n.select-input--material::-ms-input-placeholder {\n  color: rgba(0, 0, 0, .81);\n  line-height: 20px;\n}\n.select-input--material::placeholder {\n  color: rgba(0, 0, 0, .81);\n  line-height: 20px;\n}\n@-webkit-keyframes material-select-input-animate {\n  0% {\n    background-size: 0% 2px, 100% 2px;\n  }\n\n  100% {\n    background-size: 100% 2px, 100% 2px;\n  }\n}\n@keyframes material-select-input-animate {\n  0% {\n    background-size: 0% 2px, 100% 2px;\n  }\n\n  100% {\n    background-size: 100% 2px, 100% 2px;\n  }\n}\n/*~\n  name: Underbar Select Input\n  category: Select Input\n  markup: |\n    <select class=\"select-input select-input--underbar\">\n      <option>Option 1</option>\n      <option>Option 2</option>\n      <option>Option 3</option>\n    </select>\n\n    &nbsp;\n\n    <select class=\"select-input select-input--underbar\" disabled>\n      <option>Option 1</option>\n      <option>Option 2</option>\n      <option>Option 3</option>\n    </select>\n*/\n.select-input--underbar {\n  border: none;\n  border-bottom: 1px solid #ccc;\n}\n.select-input--underbar:disabled {\n  opacity: 0.3;\n  cursor: default;\n  pointer-events: none;\n  border: none;\n  background-color: transparent;\n  border: none;\n  background-color: transparent;\n  border-bottom: 1px solid #ccc;\n}\n.select-input--underbar:disabled::-webkit-input-placeholder {\n  border: none;\n  background-color: transparent;\n  color: #999;\n  border: none;\n  background-color: transparent;\n}\n.select-input--underbar:disabled:-ms-input-placeholder {\n  border: none;\n  background-color: transparent;\n  color: #999;\n  border: none;\n  background-color: transparent;\n}\n.select-input--underbar:disabled::-ms-input-placeholder {\n  border: none;\n  background-color: transparent;\n  color: #999;\n  border: none;\n  background-color: transparent;\n}\n.select-input--underbar:disabled::placeholder {\n  border: none;\n  background-color: transparent;\n  color: #999;\n  border: none;\n  background-color: transparent;\n}\n.select-input--underbar:invalid {\n  border: none;\n  background-color: transparent;\n  color: #1f1f21;\n  border: none;\n  background-color: transparent;\n  border-bottom: 1px solid #ccc;\n}\n/*~\n  name: Action Sheet\n  category: Action Sheet\n  markup: |\n    <div class=\"action-sheet-mask\"></div>\n    <div class=\"action-sheet\">\n      <div class=\"action-sheet-title\">Title</div>\n      <button class=\"action-sheet-button\">Label</button>\n      <button class=\"action-sheet-button\">Cancel</button>\n    </div>\n*/\n/*~\n  name: Action Sheet with Delete Label\n  category: Action Sheet\n  markup: |\n    <div class=\"action-sheet-mask\"></div>\n    <div class=\"action-sheet\">\n      <button class=\"action-sheet-button\">Label</button>\n      <button class=\"action-sheet-button action-sheet-button--destructive\">Delete Label</button>\n      <button class=\"action-sheet-button\">Cancel</button>\n    </div>\n*/\n.action-sheet {\n  font-family: -apple-system, 'Helvetica Neue', 'Helvetica', 'Arial', 'Lucida Grande', sans-serif;\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n  font-weight: 400;\n  cursor: default;\n  position: absolute;\n  left: 10px; /* iOS 9, 10, 11 */\n  right: 10px; /* iOS 9, 10, 11 */\n  bottom: 10px; /* iOS 9, 10, 11 */\n  z-index: 2;\n}\n.action-sheet-button {\n  box-sizing: border-box;\n  height: 56px;\n  font-size: 20px;\n  text-align: center;\n  color: #0076ff;\n  background-color: rgba(255, 255, 255, .9);\n  border-radius: 0;\n  line-height: 56px;\n  border: none;\n  -webkit-appearance: none;\n     -moz-appearance: none;\n          appearance: none;\n  display: block;\n  width: 100%;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n  overflow: hidden;\n  background-size: 100% 1px;\n  background-repeat: no-repeat;\n  background-position: bottom;\n  background-image: linear-gradient(0deg, rgba(0, 0, 0, .1), rgba(0, 0, 0, .1) 100%);\n}\n@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {\n  .action-sheet-button {\n    background-image: linear-gradient(0deg, rgba(0, 0, 0, .1), rgba(0, 0, 0, .1) 50%, transparent 50%);\n  }\n}\n.action-sheet-button:first-child {\n  border-top-left-radius: 12px;\n  border-top-right-radius: 12px;\n}\n.action-sheet-button:active {\n  background-color: #e9e9e9;\n  background-image: none;\n}\n.action-sheet-button:focus {\n  outline: none;\n}\n.action-sheet-button:nth-last-of-type(2) {\n  border-bottom-right-radius: 12px;\n  border-bottom-left-radius: 12px;\n  background-image: none;\n}\n.action-sheet-button:last-of-type {\n  border-radius: 12px;\n  margin: 8px 0 0 0; /* iOS 9, 10, 11 */\n  background-color: #fff;\n  background-image: none;\n  font-weight: 600;\n}\n.action-sheet-button:last-of-type:active {\n  background-color: #e9e9e9;\n}\n.action-sheet-button--destructive {\n  color: #fe3824;\n}\n.action-sheet-title {\n  box-sizing: border-box;\n  height: 56px;\n  font-size: 13px;\n  color: #8f8e94;\n  text-align: center;\n  background-color: rgba(255, 255, 255, .9);\n  line-height: 56px;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n  overflow: hidden;\n  background-size: 100% 1px;\n  background-repeat: no-repeat;\n  background-position: bottom;\n  background-image: linear-gradient(0deg, rgba(0, 0, 0, .1), rgba(0, 0, 0, .1) 100%);\n}\n@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {\n  .action-sheet-title {\n    background-image: linear-gradient(0deg, rgba(0, 0, 0, .1), rgba(0, 0, 0, .1) 50%, transparent 50%);\n  }\n}\n.action-sheet-title:first-child {\n  border-top-left-radius: 12px;\n  border-top-right-radius: 12px;\n}\n.action-sheet-icon {\n  display: none;\n}\n.action-sheet-mask {\n  position: absolute;\n  left: 0;\n  top: 0;\n  right: 0;\n  bottom: 0;\n  background-color: rgba(0, 0, 0, .1);\n  z-index: 1;\n}\n/*~\n  name: Material Action Sheet\n  category: Action Sheet\n  markup: |\n    <div class=\"action-sheet-mask action-sheet-mask--material\"></div>\n    <div class=\"action-sheet action-sheet--material\">\n      <button class=\"action-sheet-button action-sheet-button--material\"><i class=\"ion-android-checkbox-blank action-sheet-icon--material\"></i>Label</button>\n      <button class=\"action-sheet-button action-sheet-button--material\"><i class=\"ion-android-checkbox-blank action-sheet-icon--material\"></i>Label</button>\n      <button class=\"action-sheet-button action-sheet-button--material\"><i class=\"ion-android-close action-sheet-icon--material\"></i>Cancel</button>\n    </div>\n*/\n/*~\n  name: Material Action Sheet with Title\n  category: Action Sheet\n  markup: |\n    <div class=\"action-sheet-mask action-sheet-mask--material\"></div>\n    <div class=\"action-sheet action-sheet--material\">\n      <div class=\"action-sheet-title action-sheet-title--material\">Title</div>\n      <button class=\"action-sheet-button action-sheet-button--material\"><i class=\"ion-android-checkbox-blank action-sheet-icon--material\"></i>Label</button>\n      <button class=\"action-sheet-button action-sheet-button--material\"><i class=\"ion-android-close action-sheet-icon--material\"></i>Cancel</button>\n    </div>\n*/\n.action-sheet--material {\n  left: 0;\n  right: 0;\n  bottom: 0;\n  box-shadow:\n      0 16px 24px 2px rgba(0, 0, 0, .14),\n      0 6px 30px 5px rgba(0, 0, 0, .12),\n      0 8px 10px -5px rgba(0, 0, 0, .4);\n}\n.action-sheet-title--material {\n  font-family: 'Roboto', 'Noto', sans-serif;\n  -webkit-font-smoothing: antialiased;\n  font-weight: 400;\n  border-radius: 0;\n  background-image: none;\n  text-align: left;\n  height: 56px;\n  line-height: 56px;\n  font-size: 16px;\n  padding: 0 0 0 16px;\n  color: #686868;\n  background-color: white;\n  font-weight: 400;\n}\n.action-sheet-title--material:first-child {\n  border-radius: 0;\n}\n.action-sheet-button--material {\n  font-family: 'Roboto', 'Noto', sans-serif;\n  -webkit-font-smoothing: antialiased;\n  font-weight: 400;\n  border-radius: 0;\n  background-image: none;\n  height: 52px;\n  line-height: 52px;\n  text-align: left;\n  font-size: 16px;\n  padding: 0 0 0 16px;\n  color: #686868;\n  font-weight: 400;\n  background-color: white;\n}\n.action-sheet-button--material:first-child {\n  border-radius: 0;\n}\n.action-sheet-button--material:nth-last-of-type(2) {\n  border-radius: 0;\n}\n.action-sheet-button--material:last-of-type {\n  margin: 0;\n  border-radius: 0;\n  font-weight: 400;\n  background-color: white;\n}\n.action-sheet-icon--material {\n  display: inline-block;\n  float: left;\n  height: 52px;\n  line-height: 52px;\n  margin-right: 32px;\n  font-size: 26px;\n  width: 0.8em;\n  text-align: center;\n}\n.action-sheet-mask--material {\n  background-color: rgba(0, 0, 0, .2);\n}\n/*~\n  name: Card\n  category: Card\n  markup: |\n    <div style=\"height: 200px; padding: 1px 0 0 0;\">\n      <div class=\"card\">\n        <div class=\"card__content\">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</div>\n      </div>\n    </div>\n*/\n.card {\n  font-family: -apple-system, 'Helvetica Neue', 'Helvetica', 'Arial', 'Lucida Grande', sans-serif;\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n  font-weight: 400;\n  box-shadow: 0 1px 2px rgba(0, 0, 0, .12);\n  border-radius: 8px;\n  background-color: white;\n  box-sizing: border-box;\n  display: block;\n  margin: 8px;\n  padding: 16px;\n  text-align: left;\n  word-wrap: break-word;\n}\n.card__content {\n  margin: 0;\n  font-size: 14px;\n  line-height: 1.4;\n  color: #030303;\n}\n/*~\n  name: Card with Title\n  category: Card\n  markup: |\n    <div style=\"height: 200px; padding: 1px 0 0 0;\">\n      <div class=\"card\">\n        <h2 class=\"card__title\">Card Title</h2>\n        <div class=\"card__content\">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</div>\n      </div>\n    </div>\n*/\n.card__title {\n  font-family: -apple-system, 'Helvetica Neue', 'Helvetica', 'Arial', 'Lucida Grande', sans-serif;\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n  font-weight: 400;\n  font-weight: 400;\n  font-size: 20px;\n  margin: 4px 0 8px 0;\n  padding: 0;\n  display: block;\n  box-sizing: border-box;\n}\n/*~\n  name: Material Card\n  category: Card\n  markup: |\n    <div style=\"height: 200px; padding: 1px 0 0 0;\">\n      <div class=\"card card--material\">\n        <div class=\"card__content card--material__content\">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</div>\n      </div>\n    </div>\n*/\n.card--material {\n  background-color: white;\n  border-radius: 2px;\n  box-shadow:\n      0 2px 2px 0 rgba(0, 0, 0, .14),\n      0 1px 5px 0 rgba(0, 0, 0, .12),\n      0 3px 1px -2px rgba(0, 0, 0, .2);\n  font-family: 'Roboto', 'Noto', sans-serif;\n  -webkit-font-smoothing: antialiased;\n  font-weight: 400;\n}\n.card--material__content {\n  font-size: 14px;\n  line-height: 1.4;\n  color: rgba(0, 0, 0, .54);\n}\n/*~\n  name: Material Card with Title\n  category: Card\n  markup: |\n    <div style=\"height: 200px; padding: 1px 0 0 0;\">\n      <div class=\"card card--material\">\n        <div class=\"card__title card--material__title\">Card Title</div>\n        <div class=\"card__content card--material__content\">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</div>\n      </div>\n    </div>\n*/\n.card--material__title {\n  font-family: 'Roboto', 'Noto', sans-serif;\n  -webkit-font-smoothing: antialiased;\n  font-weight: 400;\n  font-size: 24px;\n  margin: 8px 0 12px 0;\n}\n/*~\n  name: Toast\n  category: Toast\n  markup: |\n    <div class=\"toast\">\n      <div class=\"toast__message\">Message Message Message Message Message Message</div>\n      <button class=\"toast__button\">ACTION</button>\n    </div>\n*/\n.toast {\n  font-family: -apple-system, 'Helvetica Neue', 'Helvetica', 'Arial', 'Lucida Grande', sans-serif;\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n  font-weight: 400;\n  position: absolute;\n  z-index: 2;\n  left: 8px;\n  right: 8px;\n  bottom: 0;\n  margin: 8px 0;\n  border-radius: 8px;\n  background-color: rgba(0, 0, 0, .8);\n  display: -webkit-box;\n  display: -webkit-flex;\n  display: flex;\n  min-height: 48px;\n  line-height: 48px;\n  box-sizing: border-box;\n  padding: 0 16px;\n}\n.toast__message {\n  font-size: 14px;\n  color: white;\n  -webkit-box-flex: 1;\n  -webkit-flex-grow: 1;\n          flex-grow: 1;\n  text-align: left;\n  margin: 0 16px 0 0;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n  overflow: hidden;\n}\n.toast__button {\n  font-size: 14px;\n  color: white;\n  -webkit-box-flex: 0;\n  -webkit-flex-grow: 0;\n          flex-grow: 0;\n  -webkit-appearance: none;\n     -moz-appearance: none;\n          appearance: none;\n  border: none;\n  background-color: transparent;\n  cursor: default;\n  text-transform: uppercase;\n}\n.toast__button:focus {\n  outline: none;\n}\n.toast__button:active {\n  opacity: 0.4;\n}\n/*~\n  name: Material Toast\n  category: Toast\n  markup: |\n    <div class=\"toast toast--material\">\n      <div class=\"toast__message toast--material__message\">Message Message Message Message Message Message</div>\n      <button class=\"toast__button toast--material__button\">ACTION</button>\n    </div>\n*/\n.toast--material {\n  left: 0;\n  right: 0;\n  bottom: 0;\n  margin: 0;\n  background-color: rgba(0, 0, 0, .8);\n  border-radius: 0;\n  padding: 0 24px;\n}\n.toast--material__message {\n  font-family: 'Roboto', 'Noto', sans-serif;\n  -webkit-font-smoothing: antialiased;\n  font-weight: 400;\n  margin: 0 24px 0 0;\n}\n.toast--material__button {\n  font-family: 'Roboto', 'Noto', sans-serif;\n  -webkit-font-smoothing: antialiased;\n  font-weight: 400;\n  color: #bbdefb;\n}\n/* ------- */\n/* Default */\n/* ------- */\n/* All toolbar */\n.toolbar {\n  top: 0;\n  box-sizing: border-box;\n  padding-top: 0;\n}\n.bottom-bar {\n  bottom: 0;\n  box-sizing: border-box;\n  padding-bottom: 0;\n}\n/* All page__background with a ordinal toolbar */\n.toolbar+.page__background {\n  top: 44px;\n}\n/* All page__content without toolbars */\n.page__content {\n  top: 0;\n  padding-top: 0;\n\n  bottom: 0;\n}\n/* All page__content with a toolbar */\n.toolbar+.page__background+.page__content {\n  top: 44px;\n  padding-top: 0;\n}\n/* All page__content with a bottom-bar */\n.page-with-bottom-toolbar > .page__content {\n  bottom: 44px;\n}\n/* -------- */\n/* Material */\n/* -------- */\n/* All page__background with a material toolbar */\n.toolbar.toolbar--material+.page__background {\n  top: 56px;\n}\n/* All page__content with a material toolbar */\n.toolbar.toolbar--material+.page__background+.page__content {\n  top: 56px;\n  padding-top: 0;\n}\n/* -------- */\n/*  Others  */\n/* -------- */\n/* All page__background with a transparent toolbar */\n.toolbar.toolbar--transparent+.page__background {\n  top: 0;\n}\n/* All page__content with a transparent cover-content toolbar and its direct descendant page_content */\n.toolbar.toolbar--transparent.toolbar--cover-content+.page__background+.page__content,\n.toolbar.toolbar--transparent.toolbar--cover-content+.page__background+.page__content .page_content {\n  top: 0;\n  padding-top: 44px;\n}\n/* All page__content with a material transparent cover-content toolbar and its direct descendant page_content */\n.toolbar.toolbar--material.toolbar--transparent.toolbar--cover-content+.page__background+.page__content,\n.toolbar.toolbar--material.toolbar--transparent.toolbar--cover-content+.page__background+.page__content .page_content {\n  top: 0;\n  padding-top: 56px;\n}\n/* -------- */\n/*  Tabbar  */\n/* -------- */\n/* All top tabbar */\n.tabbar--top {\n  padding-top: 0;\n}\n/* All bottom tabbar */\n.tabbar:not(.tabbar--top) {\n  padding-bottom: 0;\n}\n/* non BEM */\n/* @import './util.css'; */\n@media (orientation: landscape) {\n  html[onsflag-iphonex-landscape] .page__content {\n    padding-left: 44px;\n    padding-right: 44px;\n  }\n  /* Ignore if the page is in dialogs or modals */\n  html[onsflag-iphonex-landscape] .dialog .page__content,\n  html[onsflag-iphonex-landscape] .modal .page__content {\n    padding-left: 0;\n    padding-right: 0;\n  }\n}\n/* @import './switch.css'; */\n/* @import './range.css'; */\n/* @import './notification.css'; */\n@media (orientation: landscape) {\n  html[onsflag-iphonex-landscape] .toolbar__left {\n    padding-left: 44px;\n  }\n\n  html[onsflag-iphonex-landscape] .toolbar__right {\n    padding-right: 44px;\n  }\n\n  html[onsflag-iphonex-landscape] .bottom-bar {\n    padding-right: 44px;\n    padding-left: 44px;\n  }\n}\n/* @import './button.css'; */\n/* @import './button-bar.css'; */\n/* @import './segment.css'; */\n@media (orientation: landscape) {\n  html[onsflag-iphonex-landscape] .tabbar {\n    padding-left: 44px;\n    padding-right: 44px;\n    width: calc(100% - 88px);\n  }\n}\n/* @import './toolbar-button.css'; */\n/* @import './checkbox.css'; */\n/* @import './radio-button.css'; */\n/* @import './list.css'; */\n/* @import './search-input.css'; */\n/* @import './text-input.css'; */\n/* @import './textarea.css'; */\n/* @import './dialog.css'; */\n/* @import './alert-dialog.css'; */\n/* @import './popover.css'; */\n/* @import './progress-bar.css'; */\n/* @import './progress-circular.css'; */\n@media (orientation: portrait) {\n  /* For top safe area */\n  html[onsflag-iphonex-portrait] .fab--top__left,\n  html[onsflag-iphonex-portrait] .fab--top__center,\n  html[onsflag-iphonex-portrait] .fab--top__right {\n    top: 64px;\n  }\n\n  /* For bottom safe area */\n  html[onsflag-iphonex-portrait] .fab--bottom__left,\n  html[onsflag-iphonex-portrait] .fab--bottom__center,\n  html[onsflag-iphonex-portrait] .fab--bottom__right {\n    bottom: 34px; /* Omit 20px space */\n  }\n}\n@media (orientation: landscape) {\n  /* For bottom safe area */\n  html[onsflag-iphonex-landscape] .fab--bottom__left,\n  html[onsflag-iphonex-landscape] .fab--bottom__center,\n  html[onsflag-iphonex-landscape] .fab--bottom__right {\n    bottom: 21px; /* Omit 20px space */\n  }\n  \n  /* For left safe area */\n  html[onsflag-iphonex-landscape] .fab--top__left,\n  html[onsflag-iphonex-landscape] .fab--bottom__left {\n    left: 44px; /* Omit 20px space */\n  }\n\n  /* For right safe area */\n  html[onsflag-iphonex-landscape] .fab--top__right,\n  html[onsflag-iphonex-landscape] .fab--bottom__right {\n    right: 44px; /* Omit 20px space */\n  }\n}\n/* @import './modal.css'; */\n/* @import './select.css'; */\n@media (orientation: portrait) {\n  html[onsflag-iphonex-portrait] .action-sheet {\n    bottom: 48px; /* bottom safe area + 14 pt (extra bottom margin) */\n  }\n}\n@media (orientation: landscape) {\n  html[onsflag-iphonex-landscape] .action-sheet {\n    /* The width in landscape mode is the same as the width in portrait mode */\n    left: calc((100vw - 100vh + 20px) / 2);\n    right: calc((100vw - 100vh + 20px) / 2);\n    bottom: 33px; /* bottom safe area + 12 pt (extra bottom margin) */\n  }\n}\n/* @import './card.css'; */\n@media (orientation: portrait) {\n  html[onsflag-iphonex-portrait] .toast {\n    bottom: 34px;\n  }\n}\n@media (orientation: landscape) {\n  html[onsflag-iphonex-landscape] .toast {\n    left: 52px;\n    right: 52px;\n    bottom: 21px;\n  }\n}\n/*\n  Note:\n\n  :not(X) does not work if X is a complex selector like `.foo .bar` due to the spec of :not(X).\n  Instead we have to use the following form for representing A:not(X A):not(Y A):not(Z A),\n  which means `A which does not have any X, Y and Z as its ancestors`.\n\n  // Equivalent to A:not(X A):not(Y A):not(Z A) { foo: bar; }\n  A {\n    // Apply styles for A\n    foo: bar;\n  }\n  X A,\n  Y A,\n  Z A {\n    // Subtract `X A`, `Y A` and `Z A`\n    // (Restore original styles of A)\n  }\n*/\n/*\n  Note:\n\n  @apply has been deprecated as of Oct, 2017.\n  Please do not use @apply to restore original styles.\n*/\n/* Bars and page contents */\n@media (orientation: portrait) {\n  /* Outermost toolbar */\n  html[onsflag-iphonex-portrait] .toolbar {\n    top: 0;\n    box-sizing: content-box;\n    padding-top: 44px;\n  }\n  /* Non-outermost */\n  html[onsflag-iphonex-portrait] .dialog .toolbar, /* if wrapped with dialogs */\n  html[onsflag-iphonex-portrait] .modal .toolbar, /* if wrapped with modals */\n  html[onsflag-iphonex-portrait] .toolbar:not(.toolbar--cover-content)+.page__background+.page__content .toolbar, /* if wrapped with a page with a toolbar */\n  html[onsflag-iphonex-portrait] .tabbar--top__content .toolbar { /* if wrapped with a top tabbar */\n    /* Restore original styles */\n    top: 0;\n    box-sizing: border-box;\n    padding-top: 0;\n  }\n\n  /* Outermost bottom-bar */\n  html[onsflag-iphonex-portrait] .bottom-bar {\n    bottom: 0;\n    box-sizing: content-box;\n    padding-bottom: 34px;\n  }\n  /* Non-outermost */\n  html[onsflag-iphonex-portrait] .dialog .bottom-bar, /* if wrapped with dialogs */\n  html[onsflag-iphonex-portrait] .modal .bottom-bar, /* if wrapped with modals */\n  html[onsflag-iphonex-portrait] .page-with-bottom-toolbar > .page__content .bottom-bar, /* if wrapped with a page with a bottom-bar */\n  html[onsflag-iphonex-portrait] .tabbar__content:not(.tabbar--top__content) .bottom-bar { /* if wrapped with a bottom tabbar */\n    /* Restore original styles */\n    bottom: 0;\n    box-sizing: border-box;\n    padding-bottom: 0;\n  }\n\n  /* Outermost page__content without toolbars or bottom-bars */\n  html[onsflag-iphonex-portrait] .page__content {\n    top: 0;\n    padding-top: 44px;\n    bottom: 0;\n    padding-bottom: 34px;\n  }\n  /* Non-outermost */\n  html[onsflag-iphonex-portrait] .dialog .page__content, /* if wrapped with dialogs */\n  html[onsflag-iphonex-portrait] .modal .page__content, /* if wrapped with modals */\n  html[onsflag-iphonex-portrait] .toolbar:not(.toolbar--cover-content)+.page__background+.page__content .page__content, /* if wrapped with a page with a toolbar */\n  html[onsflag-iphonex-portrait] .tabbar--top__content .page__content, /* if wrapped with a top tabbar */\n  html[onsflag-iphonex-portrait] .toolbar:not(.toolbar--cover-content)+.page__background+.page__content { /* if the page has a toolbar */\n    /* Restore original styles */\n    top: 0;\n    padding-top: 0;\n  }\n  html[onsflag-iphonex-portrait] .dialog .page__content, /* if wrapped with dialogs */\n  html[onsflag-iphonex-portrait] .modal .page__content, /* if wrapped with modals */\n  html[onsflag-iphonex-portrait] .page-with-bottom-toolbar > .page__content .page__content, /* if wrapped with a page with a bottom-bar */\n  html[onsflag-iphonex-portrait] .tabbar__content:not(.tabbar--top__content) .page__content, /* if wrapped with a bottom tabbar */\n  html[onsflag-iphonex-portrait] .page-with-bottom-toolbar > .page__content { /* if the page has a bottom-bar */\n    /* Restore original styles */\n    bottom: 0;\n    padding-bottom: 0;\n  }\n\n  /* Outermost page__content with a toolbar */\n  html[onsflag-iphonex-portrait] .toolbar:not(.toolbar--cover-content)+.page__background,\n  html[onsflag-iphonex-portrait] .toolbar:not(.toolbar--cover-content)+.page__background+.page__content {\n    top: 88px;\n    padding-top: 0;\n  }\n  /* Non-outermost */\n  html[onsflag-iphonex-portrait] .dialog .toolbar:not(.toolbar--cover-content)+.page__background,\n  html[onsflag-iphonex-portrait] .dialog .toolbar:not(.toolbar--cover-content)+.page__background+.page__content, /* if wrapped with dialogs */\n\n  html[onsflag-iphonex-portrait] .modal .toolbar:not(.toolbar--cover-content)+.page__background,\n  html[onsflag-iphonex-portrait] .modal .toolbar:not(.toolbar--cover-content)+.page__background+.page__content, /* if wrapped with modals */\n\n  html[onsflag-iphonex-portrait] .toolbar:not(.toolbar--cover-content)+.page__background+.page__content .toolbar:not(.toolbar--cover-content)+.page__background,\n  html[onsflag-iphonex-portrait] .toolbar:not(.toolbar--cover-content)+.page__background+.page__content .toolbar:not(.toolbar--cover-content)+.page__background+.page__content, /* if wrapped with a page with a toolbar */\n\n  html[onsflag-iphonex-portrait] .tabbar--top__content .toolbar:not(.toolbar--cover-content)+.page__background,\n  html[onsflag-iphonex-portrait] .tabbar--top__content .toolbar:not(.toolbar--cover-content)+.page__background+.page__content { /* if wrapped with a top tabbar */\n    /* Restore original styles */\n    top: 44px;\n    padding-top: 0;\n  }\n\n  /* Outermost page__content with a bottom-bar */\n  html[onsflag-iphonex-portrait] .page-with-bottom-toolbar > .page__content {\n    bottom: 78px;\n    padding-bottom: 0;\n  }\n  /* Non-outermost */\n  html[onsflag-iphonex-portrait] .dialog .page-with-bottom-toolbar > .page__content, /* if wrapped with dialogs */\n  html[onsflag-iphonex-portrait] .modal .page-with-bottom-toolbar > .page__content, /* if wrapped with modals */\n  html[onsflag-iphonex-portrait] .page-with-bottom-toolbar > .page__content .page-with-bottom-toolbar > .page__content, /* if wrapped with a page with a bottom-bar */\n  html[onsflag-iphonex-portrait] .tabbar__content:not(.tabbar--top__content) .page-with-bottom-toolbar > .page__content { /* if wrapped with a bottom tabbar */\n    /* Restore original styles */\n    bottom: 44px;\n    padding-bottom: 0;\n  }\n\n  /* Outermost page__content with a transparent cover-content toolbar and its direct descendant page_content */\n  html[onsflag-iphonex-portrait] .toolbar.toolbar--transparent.toolbar--cover-content+.page__background+.page__content,\n  html[onsflag-iphonex-portrait] .toolbar.toolbar--transparent.toolbar--cover-content+.page__background+.page__content .page_content {\n    top: 0;\n    padding-top: 88px;\n  }\n  /* Non-outermost */\n  html[onsflag-iphonex-portrait] .dialog .toolbar.toolbar--transparent.toolbar--cover-content+.page__background+.page__content, /* if wrapped with dialogs */\n  html[onsflag-iphonex-portrait] .dialog .toolbar.toolbar--transparent.toolbar--cover-content+.page__background+.page__content .page_content,\n  html[onsflag-iphonex-portrait] .modal .toolbar.toolbar--transparent.toolbar--cover-content+.page__background+.page__content, /* if wrapped with modals */\n  html[onsflag-iphonex-portrait] .modal .toolbar.toolbar--transparent.toolbar--cover-content+.page__background+.page__content .page_content,\n  html[onsflag-iphonex-portrait] .toolbar:not(.toolbar--cover-content)+.page__background+.page__content .toolbar.toolbar--transparent.toolbar--cover-content+.page__background+.page__content, /* if wrapped with a page with a toolbar */\n  html[onsflag-iphonex-portrait] .toolbar:not(.toolbar--cover-content)+.page__background+.page__content .toolbar.toolbar--transparent.toolbar--cover-content+.page__background+.page__content .page__content,\n  html[onsflag-iphonex-portrait] .tabbar--top__content .toolbar.toolbar--transparent.toolbar--cover-content+.page__background+.page__content,\n  html[onsflag-iphonex-portrait] .tabbar--top__content .toolbar.toolbar--transparent.toolbar--cover-content+.page__background+.page__content .page_content {  /* if wrapped with a top tabbar */\n    /* Restore original styles */\n    top: 0;\n    padding-top: 44px;\n  }\n\n  /* Outermost top tabbar */\n  html[onsflag-iphonex-portrait] .tabbar--top {\n    padding-top: 44px;\n  }\n  /* Non-outermost */\n  html[onsflag-iphonex-portrait] .dialog .tabbar--top, /* if wrapped with dialogs */\n  html[onsflag-iphonex-portrait] .modal .tabbar--top, /* if wrapped with modals */\n  html[onsflag-iphonex-portrait] .toolbar:not(.toolbar--cover-content)+.page__background+.page__content .tabbar--top, /* if wrapped with a page with a toolbar */\n  html[onsflag-iphonex-portrait] .tabbar--top__content .tabbar--top { /* if wrapped with a top tabbar */\n    /* Restore original styles */\n    padding-top: 0;\n  }\n\n  /* Outermost tabbar--top__content */\n  html[onsflag-iphonex-portrait] .tabbar--top__content {\n    top: 93px;\n  }\n  /* Non-outermost */\n  html[onsflag-iphonex-portrait] .dialog .tabbar--top__content, /* if wrapped with dialogs */\n  html[onsflag-iphonex-portrait] .modal .tabbar--top__content, /* if wrapped with modals */\n  html[onsflag-iphonex-portrait] .toolbar:not(.toolbar--cover-content)+.page__background+.page__content .tabbar--top__content, /* if wrapped with a page with a toolbar */\n  html[onsflag-iphonex-portrait] .tabbar--top__content .tabbar--top__content { /* if wrapped with a top tabbar */\n    /* Restore original styles */\n    top: 49px;\n  }\n\n  /* Outermost bottom tabbar */\n  html[onsflag-iphonex-portrait] .tabbar:not(.tabbar--top):not(.tabbar--top) {\n    padding-bottom: 34px;\n  }\n  /* Non-outermost */\n  html[onsflag-iphonex-portrait] .dialog .tabbar:not(.tabbar--top):not(.tabbar--top), /* if wrapped with dialogs */\n  html[onsflag-iphonex-portrait] .modal .tabbar:not(.tabbar--top):not(.tabbar--top), /* if wrapped with modals */\n  html[onsflag-iphonex-portrait] .page-with-bottom-toolbar > .page__content .tabbar:not(.tabbar--top), /* if wrapped with a page with a bottom-bar */\n  html[onsflag-iphonex-portrait] .tabbar__content:not(.tabbar--top__content) .tabbar:not(.tabbar--top) { /* if wrapped with a bottom tabbar */\n    /* Restore original styles */\n    padding-bottom: 0;\n  }\n\n  /* Outermost.tabbar__content:not(.tabbar--top__content) */\n  html[onsflag-iphonex-portrait] .tabbar__content:not(.tabbar--top__content) {\n    bottom: 83px;\n  }\n  /* Non-outermost */\n  html[onsflag-iphonex-portrait] .dialog .tabbar__content:not(.tabbar--top__content), /* if wrapped with dialogs */\n  html[onsflag-iphonex-portrait] .modal .tabbar__content:not(.tabbar--top__content), /* if wrapped with modals */\n  html[onsflag-iphonex-portrait] .page-with-bottom-toolbar > .page__content .tabbar__content:not(.tabbar--top__content), /* if wrapped with a page with a bottom-bar */\n  html[onsflag-iphonex-portrait] .tabbar__content:not(.tabbar--top__content) .tabbar__content:not(.tabbar--top__content) { /* if wrapped with a bottom tabbar */\n    /* Restore original styles */\n    bottom: 49px;\n  }\n}\n@media (orientation: landscape) {\n  /* Outermost bottom-bar */\n  html[onsflag-iphonex-landscape] .bottom-bar {\n    bottom: 0;\n    box-sizing: content-box;\n    padding-bottom: 21px;\n  }\n  /* Non-outermost */\n  html[onsflag-iphonex-landscape] .dialog .bottom-bar, /* if wrapped with dialogs */\n  html[onsflag-iphonex-landscape] .modal .bottom-bar, /* if wrapped with modals */\n  html[onsflag-iphonex-landscape] .page-with-bottom-toolbar > .page__content .bottom-bar, /* if wrapped with a page with a bottom-bar */\n  html[onsflag-iphonex-landscape] .tabbar__content:not(.tabbar--top__content) .bottom-bar { /* if wrapped with a bottom tabbar */\n    /* Restore original styles */\n    bottom: 0;\n    box-sizing: border-box;\n    padding-bottom: 0;\n  }\n\n  /* Outermost page__content without bottom-bars */\n  html[onsflag-iphonex-landscape] .page__content {\n    bottom: 0;\n    padding-bottom: 21px;\n  }\n  /* Non-outermost */\n  html[onsflag-iphonex-landscape] .dialog .page__content, /* if wrapped with dialogs */\n  html[onsflag-iphonex-landscape] .modal .page__content, /* if wrapped with modals */\n  html[onsflag-iphonex-landscape] .page-with-bottom-toolbar > .page__content .page__content, /* if wrapped with a page with a bottom-bar */\n  html[onsflag-iphonex-landscape] .tabbar__content:not(.tabbar--top__content) .page__content, /* if wrapped with a bottom tabbar */\n  html[onsflag-iphonex-landscape] .page-with-bottom-toolbar > .page__content { /* if the page has a bottom-bar */\n    /* Restore original styles */\n    bottom: 0;\n    padding-bottom: 0;\n  }\n\n  /* Outermost page__content with a bottom-bar */\n  html[onsflag-iphonex-landscape] .page-with-bottom-toolbar > .page__content {\n    bottom: 65px;\n    padding-bottom: 0;\n  }\n  /* Non-outermost */\n  html[onsflag-iphonex-landscape] .dialog .page-with-bottom-toolbar > .page__content, /* if wrapped with dialogs */\n  html[onsflag-iphonex-landscape] .modal .page-with-bottom-toolbar > .page__content, /* if wrapped with modals */\n  html[onsflag-iphonex-landscape] .page-with-bottom-toolbar > .page__content .page-with-bottom-toolbar > .page__content, /* if wrapped with a page with a bottom-bar */\n  html[onsflag-iphonex-landscape] .tabbar__content:not(.tabbar--top__content) .page-with-bottom-toolbar > .page__content { /* if wrapped with a bottom tabbar */\n    /* Restore original styles */\n    bottom: 44px;\n    padding-bottom: 0;\n  }\n\n  /* Outermost bottom tabbar */\n  html[onsflag-iphonex-landscape] .tabbar:not(.tabbar--top) {\n    padding-bottom: 21px;\n  }\n  /* Non-outermost */\n  html[onsflag-iphonex-landscape] .dialog .tabbar:not(.tabbar--top), /* if wrapped with dialogs */\n  html[onsflag-iphonex-landscape] .modal .tabbar:not(.tabbar--top), /* if wrapped with modals */\n  html[onsflag-iphonex-landscape] .page-with-bottom-toolbar > .page__content .tabbar:not(.tabbar--top), /* if wrapped with a page with a bottom-bar */\n  html[onsflag-iphonex-landscape] .tabbar__content:not(.tabbar--top__content) .tabbar:not(.tabbar--top) { /* if wrapped with a bottom tabbar */\n    /* Restore original styles */\n    padding-bottom: 0;\n  }\n\n  /* Outermost.tabbar__content:not(.tabbar--top__content) */\n  html[onsflag-iphonex-landscape] .tabbar__content:not(.tabbar--top__content) {\n    bottom: 70px;\n  }\n  /* Non-outermost */\n  html[onsflag-iphonex-landscape] .dialog .tabbar__content:not(.tabbar--top__content), /* if wrapped with dialogs */\n  html[onsflag-iphonex-landscape] .modal .tabbar__content:not(.tabbar--top__content), /* if wrapped with modals */\n  html[onsflag-iphonex-landscape] .page-with-bottom-toolbar > .page__content .tabbar__content:not(.tabbar--top__content), /* if wrapped with a page with a bottom-bar */\n  html[onsflag-iphonex-landscape] .tabbar__content:not(.tabbar--top__content) .tabbar__content:not(.tabbar--top__content) { /* if wrapped with a bottom tabbar */\n    /* Restore original styles */\n    bottom: 49px;\n  }\n}\n/* Lists in .page__content */\n@media (orientation: landscape) {\n  /* Only patching lists just under .page__content */\n  html[onsflag-iphonex-landscape] .page__content > .list:not(.list--inset) {\n    margin-left: -44px;\n    margin-right: -44px;\n  }\n\n  /* For left safe area */\n  html[onsflag-iphonex-landscape] .page__content > .list:not(.list--inset) > .list-header {\n    padding-left: 59px;\n  }\n  html[onsflag-iphonex-landscape] .page__content > .list:not(.list--inset) > .list-item {\n    /* margin-left is not suitable for iPhone X patch. Using padding-left here. */\n    padding-left: 58px;\n  }\n\n  /* For right safe area */\n  html[onsflag-iphonex-landscape] .page__content > .list:not(.list--inset) > .list-item--chevron:before {\n    right: 60px;\n  }\n  html[onsflag-iphonex-landscape] .page__content > .list:not(.list--inset) > .list-item > .list-item__center:last-child {\n    padding-right: 50px;\n  }\n  html[onsflag-iphonex-landscape] .page__content > .list:not(.list--inset) > .list-item > .list-item__right {\n    padding-right: 56px;\n  }\n  html[onsflag-iphonex-landscape] .page__content > .list:not(.list--inset) > .list-item > .list-item--chevron__right {\n    padding-right: 74px;\n  }\n}\n/* Lists in .page__content in dialogs and modals */\n@media (orientation: landscape) {\n  /* Only patching lists just under .page__content */\n  html[onsflag-iphonex-landscape] .dialog .page__content > .list:not(.list--inset),\n  html[onsflag-iphonex-landscape] .modal .page__content > .list:not(.list--inset) {\n    margin-left: 0;\n    margin-right: 0;\n  }\n\n  /* For left safe area */\n  html[onsflag-iphonex-landscape] .dialog .page__content > .list:not(.list--inset) > .list-header,\n  html[onsflag-iphonex-landscape] .modal .page__content > .list:not(.list--inset) > .list-header {\n    padding-left: 15px;\n  }\n  html[onsflag-iphonex-landscape] .dialog .page__content > .list:not(.list--inset) > .list-item,\n  html[onsflag-iphonex-landscape] .modal .page__content > .list:not(.list--inset) > .list-item {\n    padding-left: 14px;\n  }\n\n  /* For right safe area */\n  html[onsflag-iphonex-landscape] .dialog .page__content > .list:not(.list--inset) > .list-item--chevron:before,\n  html[onsflag-iphonex-landscape] .modal .page__content > .list:not(.list--inset) > .list-item--chevron:before {\n    right: 16px;\n  }\n  html[onsflag-iphonex-landscape] .dialog .page__content > .list:not(.list--inset) > .list-item > .list-item__center:last-child,\n  html[onsflag-iphonex-landscape] .modal .page__content > .list:not(.list--inset) > .list-item > .list-item__center:last-child {\n    padding-right: 6px;\n  }\n  html[onsflag-iphonex-landscape] .dialog .page__content > .list:not(.list--inset) > .list-item > .list-item__right,\n  html[onsflag-iphonex-landscape] .modal .page__content > .list:not(.list--inset) > .list-item > .list-item__right {\n    padding-right: 12px;\n  }\n  html[onsflag-iphonex-landscape] .dialog .page__content > .list:not(.list--inset) > .list-item > .list-item--chevron__right,\n  html[onsflag-iphonex-landscape] .modal .page__content > .list:not(.list--inset) > .list-item > .list-item--chevron__right {\n    padding-right: 30px;\n  }\n}\n/* non BEM */\n", ""]);

// exports


/***/ }),
/* 82 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = __webpack_require__(83)({
  data: function data() {
    return {};
  },

  methods: {
    menuOpen: function menuOpen() {
      this.$parent.$parent.$parent.$parent.$parent.$parent.openSide = true; //助けて
    }
  },

  props: ["title", "menu", "modifier"]
});

/***/ }),
/* 83 */
/***/ (function(module, exports, __webpack_require__) {

var render = function(){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('v-ons-toolbar',{attrs:{"modifier":_vm.modifier}},[_c('div',{staticClass:"left"},[_c('v-ons-back-button'),_vm._v(" "),(_vm.menu)?_c('v-ons-toolbar-button',{on:{"click":_vm.menuOpen}},[_c('v-ons-icon',{attrs:{"icon":"ion-navicon, material:md-menu"}})],1):_vm._e()],1),_vm._v(" "),_c('div',{staticClass:"center"},[_vm._v(_vm._s(_vm.title))]),_vm._v(" "),_c('div',{staticClass:"right"})])}
var staticRenderFns = []
module.exports = function (_exports) {
  var options = typeof _exports === 'function'
    ? _exports.options
    : _exports
  options.render = render
  options.staticRenderFns = staticRenderFns
  if (false) {
    api.createRecord("data-v-c213eacc", options)
  }
  return _exports
}
var api = null
if (false) {(function () {
  api = require("vue-hot-reload-api")
  api.install(require("vue"))
  if (!api.compatible) return
  module.hot.accept()
  if (module.hot.data) {
    api.rerender("data-v-c213eacc", { render: render, staticRenderFns: staticRenderFns })
  }
})()}


/***/ }),
/* 84 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = __webpack_require__(85)({
  data: function data() {
    return {
      pageStack: [__webpack_require__(33)],
      openSide: false,
      pageParam: null
    };
  },

  methods: {
    home: function home() {
      this.openSide = false;this.$set(this, "pageStack", [__webpack_require__(99)]);
    },
    receive: function receive() {
      this.openSide = false;this.$set(this, "pageStack", [__webpack_require__(102)]);
    },
    send: function send() {
      this.openSide = false;this.$set(this, "pageStack", [__webpack_require__(35)]);
    },
    history: function history() {
      this.openSide = false;this.$set(this, "pageStack", [__webpack_require__(165)]);
    },
    settings: function settings() {
      this.openSide = false;this.$set(this, "pageStack", [__webpack_require__(167)]);
    },
    help: function help() {
      this.openSide = false;this.$set(this, "pageStack", [__webpack_require__(169)]);
    }
  },
  mounted: function mounted() {}
});

/***/ }),
/* 85 */
/***/ (function(module, exports, __webpack_require__) {

var render = function(){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('v-ons-splitter',[_c('v-ons-splitter-side',{attrs:{"width":"250px","collapse":"","side":"left","open":_vm.openSide},on:{"update:open":function($event){_vm.openSide=$event}}},[_c('v-ons-page',[_c('v-ons-list',[_c('v-ons-list-item',{attrs:{"modifier":"tappable"},on:{"click":_vm.home}},[_c('div',{staticClass:"left"},[_c('v-ons-icon',{attrs:{"icon":"fa-home"}})],1),_vm._v(" "),_c('div',{staticClass:"center"},[_vm._v("ホーム")])]),_vm._v(" "),_c('v-ons-list-item',{attrs:{"modifier":"tappable"},on:{"click":_vm.receive}},[_c('div',{staticClass:"left"},[_c('v-ons-icon',{attrs:{"icon":"fa-qrcode"}})],1),_vm._v(" "),_c('div',{staticClass:"center"},[_vm._v("受け取り/QR")])]),_vm._v(" "),_c('v-ons-list-item',{attrs:{"modifier":"tappable"},on:{"click":_vm.send}},[_c('div',{staticClass:"left"},[_c('v-ons-icon',{attrs:{"icon":"fa-paper-plane"}})],1),_vm._v(" "),_c('div',{staticClass:"center"},[_vm._v("送る")])]),_vm._v(" "),_c('v-ons-list-item',{attrs:{"modifier":"tappable"},on:{"click":_vm.history}},[_c('div',{staticClass:"left"},[_c('v-ons-icon',{attrs:{"icon":"fa-history"}})],1),_vm._v(" "),_c('div',{staticClass:"center"},[_vm._v("履歴")])]),_vm._v(" "),_c('v-ons-list-item',{attrs:{"modifier":"tappable"},on:{"click":_vm.settings}},[_c('div',{staticClass:"left"},[_c('v-ons-icon',{attrs:{"icon":"fa-cog"}})],1),_vm._v(" "),_c('div',{staticClass:"center"},[_vm._v("設定")])]),_vm._v(" "),_c('v-ons-list-item',{attrs:{"modifier":"tappable"},on:{"click":_vm.help}},[_c('div',{staticClass:"left"},[_c('v-ons-icon',{attrs:{"icon":"fa-question"}})],1),_vm._v(" "),_c('div',{staticClass:"center"},[_vm._v("ヘルプ/豆知識")])])],1)],1)],1),_vm._v(" "),_c('v-ons-splitter-content',[_c('v-ons-navigator',{attrs:{"swipeable":"","page-stack":_vm.pageStack,"options":{animation:'slide'}},on:{"push":function($event){_vm.pageStack = _vm.pageStack.concat( [$event])},"reset":function($event){_vm.pageStack = [_vm.pageStack[0]]},"pop":function($event){_vm.pageStack.pop()},"setParam":function($event){_vm.pageParam=$event},"getParam":function($event){$event(_vm.pageParam);_vm.pageParam=null}}})],1)],1)}
var staticRenderFns = []
module.exports = function (_exports) {
  var options = typeof _exports === 'function'
    ? _exports.options
    : _exports
  options.render = render
  options.staticRenderFns = staticRenderFns
  if (false) {
    api.createRecord("data-v-08d88f76", options)
  }
  return _exports
}
var api = null
if (false) {(function () {
  api = require("vue-hot-reload-api")
  api.install(require("vue"))
  if (!api.compatible) return
  module.hot.accept()
  if (module.hot.data) {
    api.rerender("data-v-08d88f76", { render: render, staticRenderFns: staticRenderFns })
  }
})()}


/***/ }),
/* 86 */
/***/ (function(module, exports, __webpack_require__) {

var render = function(){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('v-ons-page',{attrs:{"data-page":"first"}},[_c('div',{staticClass:"wrap"},[_c('div',{staticClass:"logo"},[_c('div',{staticClass:"icon"}),_vm._v(" "),_c('div',{staticClass:"appName"},[_vm._v("もにゃ")]),_vm._v(" "),_c('div',{staticClass:"label"},[_vm._v("The easiest Monacoin Wallet")]),_vm._v(" "),_c('div',{staticClass:"buttons"},[_c('v-ons-button',{on:{"click":_vm.start}},[_vm._v("Start!")])],1)])])])}
var staticRenderFns = []
module.exports = function (_exports) {
  var options = typeof _exports === 'function'
    ? _exports.options
    : _exports
  options.render = render
  options.staticRenderFns = staticRenderFns
  if (false) {
    api.createRecord("data-v-33e3890c", options)
  }
  return _exports
}
var api = null
if (false) {(function () {
  api = require("vue-hot-reload-api")
  api.install(require("vue"))
  if (!api.compatible) return
  module.hot.accept()
  if (module.hot.data) {
    api.rerender("data-v-33e3890c", { render: render, staticRenderFns: staticRenderFns })
  }
})()}


/***/ }),
/* 87 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = __webpack_require__(88)({
  data: function data() {
    return {
      questionNumber: 0,
      questions: qList,
      answers: []
    };
  },

  methods: {
    answer: function answer(ans) {
      this.answers[this.questionNumber] = ans.value;
      if (ans.callback) {
        ans.callback(function (flag) {
          if (flag === true) {
            this.questionNumber = ans.to;
          }
        });
        return;
      }
      switch (ans.to) {
        case -1:
        //exit
        case -2:
          //decline--set for advanced user

          this.$emit("push", __webpack_require__(89));
          break;
        case -3:
          //go to keyinput
          break;
        default:
          this.questionNumber = ans.to | 0;
      }
    }
  },
  mounted: function mounted() {},

  components: {}
});

var qList = [{ //0
  text: "以前にこのアプリケーションを利用したことがありますか？",
  answers: [{
    label: "ないです",
    value: false,
    to: 1
  }, {
    label: "ありますあります",
    value: true,
    to: -3
  }]
}, { //1
  text: "初期設定と、ユーザーの暗号通貨に対する知識を測るためにいくつかの質問に答えてください。",
  answers: [{
    label: "わかりました。",
    value: true,
    to: 2
  }, {
    label: "自分で設定するので答えません。",
    value: false,
    to: -2
  }]
}, { //2
  text: "「モナコイン」といえば",
  answers: [{
    label: "今初めて聞いた",
    value: 0,
    to: 3
  }, {
    label: "モナーから派生したやつ？",
    value: 1,
    to: 3
  }, {
    label: "Twitterで変なひとがくれるやつ？",
    value: 2,
    to: 3
  }, {
    label: "暴騰したと聞きました",
    value: 3,
    to: 3
  }, {
    label: "どんどこわっしょーい",
    value: 4,
    to: 4
  }, {
    label: "scriptHash=0x05",
    value: 5,
    to: 5 /*,{
           label:"ミスモナコイン薫ちゃんは男",
           value:6,
           to:5
          }*/ }]
}, { //3
  text: "「暗号通貨」といえば",
  answers: [{
    label: "今初めて聞いた",
    value: 0,
    to: 6
  }, {
    label: "電子マネー",
    value: 1,
    to: 6
  }, {
    label: "ビットコイン",
    value: 2,
    to: 4
  }, {
    label: "詐欺",
    value: 3,
    to: 6
  }, {
    label: "仮想通貨のこと？",
    value: 4,
    to: 6
  }, {
    label: "海外送金に便利",
    value: 5,
    to: 4
  }, {
    label: "Blockchain",
    value: 6,
    to: 4
  }]
}, { //4
  text: "好きな暗号通貨は?",
  answers: [{
    label: "この中にない",
    value: "none",
    to: 7
  }, {
    label: "モナコイン",
    value: "mona",
    to: 7
  }, {
    label: "ビットコイン",
    value: "btc",
    to: 7
  }, {
    label: "Ethereum",
    value: "eth",
    to: 7
  }, {
    label: "OmiseGo",
    value: "omg",
    to: 7
  }, {
    label: "Ripple",
    value: "xrp",
    to: 7
  }]
}, { //5
  text: "だいたい察した。大丈夫ですね。",
  answers: [{
    label: "次へ",
    value: 1,
    to: -2
  }]
}, { //6
  text: "\u6697\u53F7\u901A\u8CA8\u3068\u306F\u3001\u300C\u6697\u53F7\u300D\u306E\u30C8\u30EA\u30C3\u30AF\u3092\u5229\u7528\u3057\u3001\n\u6539\u3056\u3093\u304C\u3067\u304D\u306A\u3044\n\u30FB\u5B89\u5168\n\u30FB\u56FD\u5BB6\u306E\u652F\u914D\u306B\u3088\u3089\u306A\u3044\n\u300C\u901A\u8CA8\u300D\u3059\u306A\u308F\u3061\u304A\u91D1\u3067\u3059\u3002\n\u3053\u308C\u306F\u65E5\u672C\u5186\u3001\u7C73\u30C9\u30EB\u306A\u3069\u3068\u306F\u72EC\u7ACB\u3057\u3001\u72EC\u81EA\u306E\u4FA1\u5024\u3092\u3082\u3061\u307E\u3059\u3002\n\u3053\u306E\u30A2\u30D7\u30EA\u306F\u305D\u306E\u3046\u3061\u306E\u300C\u30E2\u30CA\u30B3\u30A4\u30F3\u300D\u3092\u9001\u3063\u305F\u308A\u3001\u53D7\u3051\u53D6\u3063\u305F\u308A\u3059\u308B\u30A2\u30D7\u30EA\u3067\u3059\u3002",
  answers: [{
    label: "わかった",
    value: "understood",
    to: 7
  }, {
    label: "難しいなあ",
    value: "difficult",
    to: 7
  }]
}, { //7
  text: "表示する単位は何にしますか？\n(あとで変更できます。)",
  answers: [{
    label: "MONA,JPYなど通貨コード",
    value: "normal",
    to: 8
  }, {
    label: "もにゃ,円など親しみやすい形式",
    value: "easy",
    to: 8
  }]
}, { //8
  text: "コインの使用方法",
  answers: [{
    label: "使いやすさ重視",
    value: "easy",
    to: 9
  }, {
    label: "セキュリティ重視",
    value: "secure",
    to: 9
  }, {
    label: "UTXOを手動で操作",
    value: "manual",
    to: 9
  }]
}, { //9
  text: "やってもいいことは何？",
  answers: [{
    label: "「秘密鍵」画面をスクリーンショット",
    value: 0,
    to: 10
  }, {
    label: "このアプリの初期設定を友達などの他人にやってもらう",
    value: 1,
    to: 10
  }, {
    label: "「秘密鍵」を付箋に書いてデスクに貼っておく",
    value: 1,
    to: 10
  }, {
    label: "パスワードを「123456」を設定する",
    value: 2,
    to: 10
  }, {
    label: "この中にやってもいいものはない",
    value: 3,
    to: 11
  }]
}, { //10
  text: "\u305D\u308C\u306F\u884C\u3063\u3066\u306F\u3044\u3051\u307E\u305B\u3093\uFF01\uFF01\n\u300C\u79D8\u5BC6\u9375\u300D\u3068\u3044\u3046\u3082\u306E\u306F\u3001\u6587\u5B57\u901A\u308A\u3001\u79D8\u5BC6\u306B\u3057\u306A\u3051\u308C\u3070\u3044\u3051\u306A\u3044\u9375\u3067\u3059\u3002\n\u3053\u306E\u300C\u79D8\u5BC6\u9375\u300D\u306F\u3001\u304A\u91D1\u3092\u91D1\u5EAB\u304B\u3089\u53D6\u308A\u51FA\u3059\u6642\u306E\u3088\u3046\u306B\u3001\u3042\u306A\u305F\u304C\u6301\u3064\u30E2\u30CA\u30B3\u30A4\u30F3\u3092\u5229\u7528\u3059\u308B\u305F\u3081\u306B\u4F7F\u3046\u9375\u3067\u3059\u3002\n\u7D1B\u5931\u3059\u308B\u3068\u3001\u30E2\u30CA\u30B3\u30A4\u30F3\u3092\u4F7F\u3048\u306A\u304F\u306A\u308A\u3001\n\u8AB0\u304B\u306B\u76D7\u307E\u308C\u305F\u3089\u3001\u305D\u306E\u4EBA\u306B\u30E2\u30CA\u30B3\u30A4\u30F3\u3092\u60AA\u7528\u3055\u308C\u307E\u3059\u3002\n\u305D\u306E\u305F\u3081\u306B\u3001\u30B9\u30AF\u30EA\u30FC\u30F3\u30B7\u30E7\u30C3\u30C8\u3001\u30B3\u30D4\u30FC\uFF06\u8CBC\u308A\u4ED8\u3051\u3067\u30C7\u30FC\u30BF\u3092\u4FDD\u5B58\u305B\u305A\u3001\n\u79D8\u5BC6\u9375\u306F\u3001\u81EA\u529B\u3067\u7D19\u306B\u624B\u66F8\u304D\u3057\u3066\u3001\u305D\u306E\u7D19\u3092\u3001\u5B89\u5168\u306A\u5834\u6240\u306B\u4FDD\u7BA1\u3057\u3066\u304F\u3060\u3055\u3044\u3002\n\u9375\u3092\u4FDD\u8B77\u3059\u308B\u305F\u3081\u306E\u30D1\u30B9\u30EF\u30FC\u30C9\u3082\u5F37\u56FA\u306A\u3082\u306E\u306B\u3057\u3066\u304F\u3060\u3055\u3044\u3002\n\u624B\u66F8\u304D\u3068\u805E\u3044\u3066\u3001\u9762\u5012\u81ED\u305D\u3046\u3060\u3068\u601D\u3063\u305F\u65B9\u3082\u3044\u3089\u3063\u3057\u3083\u308B\u3068\u601D\u3044\u307E\u3059\u304C\u3001\n\u7C21\u5358\u306B\u3067\u304D\u308B\u5DE5\u592B\u304C\u3055\u308C\u3066\u3044\u307E\u3059\u306E\u3067\u3001\u3054\u5B89\u5FC3\u304F\u3060\u3055\u3044\u3002",
  answers: [{
    label: "戻る",
    value: 1,
    to: 9
  }]
}, { //11
  text: "\u300C\u79D8\u5BC6\u9375\u300D\u3068\u3044\u3046\u3082\u306E\u306F\u3001\u6587\u5B57\u901A\u308A\u3001\u79D8\u5BC6\u306B\u3057\u306A\u3051\u308C\u3070\u3044\u3051\u306A\u3044\u9375\u3067\u3059\u3002\n\u30B9\u30AF\u30EA\u30FC\u30F3\u30B7\u30E7\u30C3\u30C8\u3001\u30B3\u30D4\u30FC\uFF06\u8CBC\u308A\u4ED8\u3051\u3067\u30C7\u30FC\u30BF\u3092\u4FDD\u5B58\u305B\u305A\u3001\n\u79D8\u5BC6\u9375\u306F\u3001\u81EA\u529B\u3067\u7D19\u306B\u624B\u66F8\u304D\u3057\u3066\u3001\u305D\u306E\u7D19\u3092\u3001\u5B89\u5168\u306A\u5834\u6240\u306B\u4FDD\u7BA1\u3057\u3066\u304F\u3060\u3055\u3044\u3002\n\u3053\u308C\u3067\u8CEA\u554F\u306F\u4EE5\u4E0A\u3067\u3059\u3002",
  answers: [{
    label: "次へ",
    value: 0,
    to: -1
  }]
}];

/***/ }),
/* 88 */
/***/ (function(module, exports, __webpack_require__) {

var render = function(){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('v-ons-page',{attrs:{"data-page":"question"}},[_c('v-ons-carousel',{attrs:{"fullscreen":"","auto-scroll":"","index":_vm.questionNumber}},_vm._l((_vm.questions),function(qq){return _c('v-ons-carousel-item',{staticClass:"questionItem"},[_c('div',{staticClass:"questionText"},[_vm._v(_vm._s(qq.text))]),_vm._v(" "),_vm._l((qq.answers),function(ans,ind){return _c('div',{staticClass:"answers"},[_c('div',{staticClass:"answer",on:{"click":function($event){_vm.answer(ans)}}},[_vm._v(_vm._s(ans.label))])])})],2)}))],1)}
var staticRenderFns = []
module.exports = function (_exports) {
  var options = typeof _exports === 'function'
    ? _exports.options
    : _exports
  options.render = render
  options.staticRenderFns = staticRenderFns
  if (false) {
    api.createRecord("data-v-85456e20", options)
  }
  return _exports
}
var api = null
if (false) {(function () {
  api = require("vue-hot-reload-api")
  api.install(require("vue"))
  if (!api.compatible) return
  module.hot.accept()
  if (module.hot.data) {
    api.rerender("data-v-85456e20", { render: render, staticRenderFns: staticRenderFns })
  }
})()}


/***/ }),
/* 89 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = __webpack_require__(90)({
  data: function data() {
    return {
      check1: false, check2: false, check3: false
    };
  },

  methods: {
    next: function next() {
      this.$emit("push", __webpack_require__(91));
    }
  },
  mounted: function mounted() {},

  components: {}
});

/***/ }),
/* 90 */
/***/ (function(module, exports, __webpack_require__) {

var render = function(){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('v-ons-page',{attrs:{"data-page":"generateKeyWarn"}},[_c('custom-bar',{attrs:{"title":"ご確認ください"}}),_vm._v(" "),_c('div',{staticClass:"wrap"},[_c('p',[_vm._v("秘密鍵を作成します。以下の注意事項をよく読んで、チェックをしてください")]),_vm._v(" "),_c('ul',[_c('li',[_vm._v("秘密鍵は所有するモナコインにアクセスする権利そのものです。")]),_vm._v(" "),_c('li',[_vm._v("13個の英単語を正確に、紙に手書きしてください。")]),_vm._v(" "),_c('li',[_vm._v("英単語のスクリーンショットを撮影・コピーしないでください。")]),_vm._v(" "),_c('li',[_vm._v("これを紛失すると、モナコインを使うことはできなくなります。")]),_vm._v(" "),_c('li',[_vm._v("他人に知れ渡ると、モナコインを盗まれる可能性があります。")]),_vm._v(" "),_c('li',[_vm._v("管理が不十分だったことによる責任は利用者自身が負い、他の誰も負いません。")])])]),_vm._v(" "),_c('v-ons-list',[_c('v-ons-list-item',[_c('label',{staticClass:"left"},[_c('v-ons-checkbox',{attrs:{"input-id":"check1"},model:{value:(_vm.check1),callback:function ($$v) {_vm.check1=$$v},expression:"check1"}})],1),_vm._v(" "),_c('label',{staticClass:"center",attrs:{"for":"check1"}},[_vm._v("秘密鍵の重要性を理解しました。")])]),_vm._v(" "),_c('v-ons-list-item',[_c('label',{staticClass:"left"},[_c('v-ons-checkbox',{attrs:{"input-id":"check2"},model:{value:(_vm.check2),callback:function ($$v) {_vm.check2=$$v},expression:"check2"}})],1),_vm._v(" "),_c('label',{staticClass:"center",attrs:{"for":"check2"}},[_vm._v("画面を誰にも・どのソフトにも見られたり盗聴されていません。")])]),_vm._v(" "),_c('v-ons-list-item',[_c('label',{staticClass:"left"},[_c('v-ons-checkbox',{attrs:{"input-id":"check3"},model:{value:(_vm.check3),callback:function ($$v) {_vm.check3=$$v},expression:"check3"}})],1),_vm._v(" "),_c('label',{staticClass:"center",attrs:{"for":"check3"}},[_vm._v("秘密鍵の管理は自己責任であることを理解しました。")])]),_vm._v(" "),_c('v-ons-list-item',[_c('v-ons-button',{attrs:{"disabled":!_vm.check1||!_vm.check2||!_vm.check3,"modifier":"large"},on:{"click":_vm.next}},[_vm._v("次へ")])],1)],1)],1)}
var staticRenderFns = []
module.exports = function (_exports) {
  var options = typeof _exports === 'function'
    ? _exports.options
    : _exports
  options.render = render
  options.staticRenderFns = staticRenderFns
  if (false) {
    api.createRecord("data-v-98c844a8", options)
  }
  return _exports
}
var api = null
if (false) {(function () {
  api = require("vue-hot-reload-api")
  api.install(require("vue"))
  if (!api.compatible) return
  module.hot.accept()
  if (module.hot.data) {
    api.rerender("data-v-98c844a8", { render: render, staticRenderFns: staticRenderFns })
  }
})()}


/***/ }),
/* 91 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var param = __webpack_require__(92);
module.exports = __webpack_require__(93)({
  data: function data() {
    return {
      cnt: 0,
      wordCount: param.normalPassphraseWords,
      next: false,
      keyArray: [],
      sensorAvailable: false

    };
  },

  methods: {
    complete: function complete() {
      if (!this.next) {
        this.next = true;
        this.$emit("setParam", { keyArray: this.keyArray });
        this.$emit("push", __webpack_require__(94));
      }
    }
  },
  mounted: function mounted() {
    var _this = this;

    var detecting = true;
    var drag = false;
    var arr = [];
    var gd = this.$ons.GestureDetector(this.$refs.touchArea);
    gd.on("dragstart", function () {
      if (!detecting) {
        return;
      }
      drag = true;
    });
    gd.on("drag", function (e) {
      if (!detecting) {
        return;
      }
      if ((Math.random() * 19 | 0) === 4) {
        var a = (e.gesture.interimAngle * e.gesture.deltaX * e.gesture.deltaY | 0) % 2048;
        if (a) {
          arr.push(a > 0 ? a : -a);
        }
      }
    });
    gd.on("dragend", function () {
      if (!detecting) {
        return;
      }
      drag = false;
      if (arr.length) {
        var sum = 16;
        for (var i = arr.length - 1; i >= 0; i--) {
          sum += arr[i];
        }
        _this.keyArray.push(sum % 2048);
        if (++_this.cnt >= _this.wordCount) {
          detecting = false;
          setInterval(function () {
            _this.complete();
          }, 300);
        }
      }
      arr = [];
    });
    window.addEventListener("devicemotion", function (e) {
      if (!detecting) {
        return;
      }
      if (e.rotationRate.alpha) {
        _this.sensorAvailable = true;
      }

      if (12 === (Math.random() * 45 | 0)) {
        var a = (e.acceleration.x + e.acceleration.y + e.rotationRate.alpha + e.rotationRate.beta + e.rotationRate.gamma) * 810893 | 0;
        a = a > 0 ? a : -a;
        if (a > 30) {
          _this.keyArray.push(a % 2048);
          if (++_this.cnt >= _this.wordCount) {
            detecting = false;
            setInterval(function () {
              _this.complete();
            }, 300);
          }
        }
      }
    }, true);
  },

  components: {}
});

/***/ }),
/* 92 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = {
  normalPassphraseWords: 15
};

/***/ }),
/* 93 */
/***/ (function(module, exports, __webpack_require__) {

var render = function(){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('v-ons-page',{attrs:{"data-page":"generateKey"}},[_c('custom-bar',{attrs:{"title":"秘密鍵を生成","modifier":"transparent"}}),_vm._v(" "),_c('div',{ref:"touchArea",staticClass:"touchArea"},[_c('p',{directives:[{name:"show",rawName:"v-show",value:(_vm.cnt<_vm.wordCount),expression:"cnt<wordCount"}]},[_vm._v("\n      ここをスワイプしたりドラッグしたりしてセキュリティを高めましょう"),_c('br'),_vm._v(" "),_c('small',{directives:[{name:"show",rawName:"v-show",value:(_vm.sensorAvailable),expression:"sensorAvailable"}]},[_vm._v("または端末を振ってください。")]),_c('br'),_vm._v("\n      "+_vm._s(_vm.cnt)),_c('small',[_vm._v("/"+_vm._s(_vm.wordCount))])]),_vm._v(" "),_c('p',{directives:[{name:"show",rawName:"v-show",value:(_vm.cnt>=_vm.wordCount),expression:"cnt>=wordCount"}]},[_vm._v("計算中"),_c('br'),_c('small',[_vm._v("数分かかる場合があります。")])]),_vm._v(" "),_c('v-ons-progress-bar',{attrs:{"value":_vm.cnt/_vm.wordCount*100}})],1)],1)}
var staticRenderFns = []
module.exports = function (_exports) {
  var options = typeof _exports === 'function'
    ? _exports.options
    : _exports
  options.render = render
  options.staticRenderFns = staticRenderFns
  if (false) {
    api.createRecord("data-v-06417112", options)
  }
  return _exports
}
var api = null
if (false) {(function () {
  api = require("vue-hot-reload-api")
  api.install(require("vue"))
  if (!api.compatible) return
  module.hot.accept()
  if (module.hot.data) {
    api.rerender("data-v-06417112", { render: render, staticRenderFns: staticRenderFns })
  }
})()}


/***/ }),
/* 94 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var securityManager = __webpack_require__(34);
module.exports = __webpack_require__(96)({
  data: function data() {
    return {
      keyArray: null,
      words: []
    };
  },

  methods: {
    next: function next() {
      this.$emit("push", __webpack_require__(97));
    }
  },
  mounted: function mounted() {
    var _this = this;

    this.$emit("getParam", function (param) {
      securityManager.getWordsFromArray(param.keyArray).then(function (words) {
        _this.words = words;
        _this.$emit("setParam", { keyArray: param.keyArray });
      });
    });
  },

  components: {}
});

/***/ }),
/* 95 */
/***/ (function(module, exports) {

module.exports = ["abandon","ability","able","about","above","absent","absorb","abstract","absurd","abuse","access","accident","account","accuse","achieve","acid","acoustic","acquire","across","act","action","actor","actress","actual","adapt","add","addict","address","adjust","admit","adult","advance","advice","aerobic","affair","afford","afraid","again","age","agent","agree","ahead","aim","air","airport","aisle","alarm","album","alcohol","alert","alien","all","alley","allow","almost","alone","alpha","already","also","alter","always","amateur","amazing","among","amount","amused","analyst","anchor","ancient","anger","angle","angry","animal","ankle","announce","annual","another","answer","antenna","antique","anxiety","any","apart","apology","appear","apple","approve","april","arch","arctic","area","arena","argue","arm","armed","armor","army","around","arrange","arrest","arrive","arrow","art","artefact","artist","artwork","ask","aspect","assault","asset","assist","assume","asthma","athlete","atom","attack","attend","attitude","attract","auction","audit","august","aunt","author","auto","autumn","average","avocado","avoid","awake","aware","away","awesome","awful","awkward","axis","baby","bachelor","bacon","badge","bag","balance","balcony","ball","bamboo","banana","banner","bar","barely","bargain","barrel","base","basic","basket","battle","beach","bean","beauty","because","become","beef","before","begin","behave","behind","believe","below","belt","bench","benefit","best","betray","better","between","beyond","bicycle","bid","bike","bind","biology","bird","birth","bitter","black","blade","blame","blanket","blast","bleak","bless","blind","blood","blossom","blouse","blue","blur","blush","board","boat","body","boil","bomb","bone","bonus","book","boost","border","boring","borrow","boss","bottom","bounce","box","boy","bracket","brain","brand","brass","brave","bread","breeze","brick","bridge","brief","bright","bring","brisk","broccoli","broken","bronze","broom","brother","brown","brush","bubble","buddy","budget","buffalo","build","bulb","bulk","bullet","bundle","bunker","burden","burger","burst","bus","business","busy","butter","buyer","buzz","cabbage","cabin","cable","cactus","cage","cake","call","calm","camera","camp","can","canal","cancel","candy","cannon","canoe","canvas","canyon","capable","capital","captain","car","carbon","card","cargo","carpet","carry","cart","case","cash","casino","castle","casual","cat","catalog","catch","category","cattle","caught","cause","caution","cave","ceiling","celery","cement","census","century","cereal","certain","chair","chalk","champion","change","chaos","chapter","charge","chase","chat","cheap","check","cheese","chef","cherry","chest","chicken","chief","child","chimney","choice","choose","chronic","chuckle","chunk","churn","cigar","cinnamon","circle","citizen","city","civil","claim","clap","clarify","claw","clay","clean","clerk","clever","click","client","cliff","climb","clinic","clip","clock","clog","close","cloth","cloud","clown","club","clump","cluster","clutch","coach","coast","coconut","code","coffee","coil","coin","collect","color","column","combine","come","comfort","comic","common","company","concert","conduct","confirm","congress","connect","consider","control","convince","cook","cool","copper","copy","coral","core","corn","correct","cost","cotton","couch","country","couple","course","cousin","cover","coyote","crack","cradle","craft","cram","crane","crash","crater","crawl","crazy","cream","credit","creek","crew","cricket","crime","crisp","critic","crop","cross","crouch","crowd","crucial","cruel","cruise","crumble","crunch","crush","cry","crystal","cube","culture","cup","cupboard","curious","current","curtain","curve","cushion","custom","cute","cycle","dad","damage","damp","dance","danger","daring","dash","daughter","dawn","day","deal","debate","debris","decade","december","decide","decline","decorate","decrease","deer","defense","define","defy","degree","delay","deliver","demand","demise","denial","dentist","deny","depart","depend","deposit","depth","deputy","derive","describe","desert","design","desk","despair","destroy","detail","detect","develop","device","devote","diagram","dial","diamond","diary","dice","diesel","diet","differ","digital","dignity","dilemma","dinner","dinosaur","direct","dirt","disagree","discover","disease","dish","dismiss","disorder","display","distance","divert","divide","divorce","dizzy","doctor","document","dog","doll","dolphin","domain","donate","donkey","donor","door","dose","double","dove","draft","dragon","drama","drastic","draw","dream","dress","drift","drill","drink","drip","drive","drop","drum","dry","duck","dumb","dune","during","dust","dutch","duty","dwarf","dynamic","eager","eagle","early","earn","earth","easily","east","easy","echo","ecology","economy","edge","edit","educate","effort","egg","eight","either","elbow","elder","electric","elegant","element","elephant","elevator","elite","else","embark","embody","embrace","emerge","emotion","employ","empower","empty","enable","enact","end","endless","endorse","enemy","energy","enforce","engage","engine","enhance","enjoy","enlist","enough","enrich","enroll","ensure","enter","entire","entry","envelope","episode","equal","equip","era","erase","erode","erosion","error","erupt","escape","essay","essence","estate","eternal","ethics","evidence","evil","evoke","evolve","exact","example","excess","exchange","excite","exclude","excuse","execute","exercise","exhaust","exhibit","exile","exist","exit","exotic","expand","expect","expire","explain","expose","express","extend","extra","eye","eyebrow","fabric","face","faculty","fade","faint","faith","fall","false","fame","family","famous","fan","fancy","fantasy","farm","fashion","fat","fatal","father","fatigue","fault","favorite","feature","february","federal","fee","feed","feel","female","fence","festival","fetch","fever","few","fiber","fiction","field","figure","file","film","filter","final","find","fine","finger","finish","fire","firm","first","fiscal","fish","fit","fitness","fix","flag","flame","flash","flat","flavor","flee","flight","flip","float","flock","floor","flower","fluid","flush","fly","foam","focus","fog","foil","fold","follow","food","foot","force","forest","forget","fork","fortune","forum","forward","fossil","foster","found","fox","fragile","frame","frequent","fresh","friend","fringe","frog","front","frost","frown","frozen","fruit","fuel","fun","funny","furnace","fury","future","gadget","gain","galaxy","gallery","game","gap","garage","garbage","garden","garlic","garment","gas","gasp","gate","gather","gauge","gaze","general","genius","genre","gentle","genuine","gesture","ghost","giant","gift","giggle","ginger","giraffe","girl","give","glad","glance","glare","glass","glide","glimpse","globe","gloom","glory","glove","glow","glue","goat","goddess","gold","good","goose","gorilla","gospel","gossip","govern","gown","grab","grace","grain","grant","grape","grass","gravity","great","green","grid","grief","grit","grocery","group","grow","grunt","guard","guess","guide","guilt","guitar","gun","gym","habit","hair","half","hammer","hamster","hand","happy","harbor","hard","harsh","harvest","hat","have","hawk","hazard","head","health","heart","heavy","hedgehog","height","hello","helmet","help","hen","hero","hidden","high","hill","hint","hip","hire","history","hobby","hockey","hold","hole","holiday","hollow","home","honey","hood","hope","horn","horror","horse","hospital","host","hotel","hour","hover","hub","huge","human","humble","humor","hundred","hungry","hunt","hurdle","hurry","hurt","husband","hybrid","ice","icon","idea","identify","idle","ignore","ill","illegal","illness","image","imitate","immense","immune","impact","impose","improve","impulse","inch","include","income","increase","index","indicate","indoor","industry","infant","inflict","inform","inhale","inherit","initial","inject","injury","inmate","inner","innocent","input","inquiry","insane","insect","inside","inspire","install","intact","interest","into","invest","invite","involve","iron","island","isolate","issue","item","ivory","jacket","jaguar","jar","jazz","jealous","jeans","jelly","jewel","job","join","joke","journey","joy","judge","juice","jump","jungle","junior","junk","just","kangaroo","keen","keep","ketchup","key","kick","kid","kidney","kind","kingdom","kiss","kit","kitchen","kite","kitten","kiwi","knee","knife","knock","know","lab","label","labor","ladder","lady","lake","lamp","language","laptop","large","later","latin","laugh","laundry","lava","law","lawn","lawsuit","layer","lazy","leader","leaf","learn","leave","lecture","left","leg","legal","legend","leisure","lemon","lend","length","lens","leopard","lesson","letter","level","liar","liberty","library","license","life","lift","light","like","limb","limit","link","lion","liquid","list","little","live","lizard","load","loan","lobster","local","lock","logic","lonely","long","loop","lottery","loud","lounge","love","loyal","lucky","luggage","lumber","lunar","lunch","luxury","lyrics","machine","mad","magic","magnet","maid","mail","main","major","make","mammal","man","manage","mandate","mango","mansion","manual","maple","marble","march","margin","marine","market","marriage","mask","mass","master","match","material","math","matrix","matter","maximum","maze","meadow","mean","measure","meat","mechanic","medal","media","melody","melt","member","memory","mention","menu","mercy","merge","merit","merry","mesh","message","metal","method","middle","midnight","milk","million","mimic","mind","minimum","minor","minute","miracle","mirror","misery","miss","mistake","mix","mixed","mixture","mobile","model","modify","mom","moment","monitor","monkey","monster","month","moon","moral","more","morning","mosquito","mother","motion","motor","mountain","mouse","move","movie","much","muffin","mule","multiply","muscle","museum","mushroom","music","must","mutual","myself","mystery","myth","naive","name","napkin","narrow","nasty","nation","nature","near","neck","need","negative","neglect","neither","nephew","nerve","nest","net","network","neutral","never","news","next","nice","night","noble","noise","nominee","noodle","normal","north","nose","notable","note","nothing","notice","novel","now","nuclear","number","nurse","nut","oak","obey","object","oblige","obscure","observe","obtain","obvious","occur","ocean","october","odor","off","offer","office","often","oil","okay","old","olive","olympic","omit","once","one","onion","online","only","open","opera","opinion","oppose","option","orange","orbit","orchard","order","ordinary","organ","orient","original","orphan","ostrich","other","outdoor","outer","output","outside","oval","oven","over","own","owner","oxygen","oyster","ozone","pact","paddle","page","pair","palace","palm","panda","panel","panic","panther","paper","parade","parent","park","parrot","party","pass","patch","path","patient","patrol","pattern","pause","pave","payment","peace","peanut","pear","peasant","pelican","pen","penalty","pencil","people","pepper","perfect","permit","person","pet","phone","photo","phrase","physical","piano","picnic","picture","piece","pig","pigeon","pill","pilot","pink","pioneer","pipe","pistol","pitch","pizza","place","planet","plastic","plate","play","please","pledge","pluck","plug","plunge","poem","poet","point","polar","pole","police","pond","pony","pool","popular","portion","position","possible","post","potato","pottery","poverty","powder","power","practice","praise","predict","prefer","prepare","present","pretty","prevent","price","pride","primary","print","priority","prison","private","prize","problem","process","produce","profit","program","project","promote","proof","property","prosper","protect","proud","provide","public","pudding","pull","pulp","pulse","pumpkin","punch","pupil","puppy","purchase","purity","purpose","purse","push","put","puzzle","pyramid","quality","quantum","quarter","question","quick","quit","quiz","quote","rabbit","raccoon","race","rack","radar","radio","rail","rain","raise","rally","ramp","ranch","random","range","rapid","rare","rate","rather","raven","raw","razor","ready","real","reason","rebel","rebuild","recall","receive","recipe","record","recycle","reduce","reflect","reform","refuse","region","regret","regular","reject","relax","release","relief","rely","remain","remember","remind","remove","render","renew","rent","reopen","repair","repeat","replace","report","require","rescue","resemble","resist","resource","response","result","retire","retreat","return","reunion","reveal","review","reward","rhythm","rib","ribbon","rice","rich","ride","ridge","rifle","right","rigid","ring","riot","ripple","risk","ritual","rival","river","road","roast","robot","robust","rocket","romance","roof","rookie","room","rose","rotate","rough","round","route","royal","rubber","rude","rug","rule","run","runway","rural","sad","saddle","sadness","safe","sail","salad","salmon","salon","salt","salute","same","sample","sand","satisfy","satoshi","sauce","sausage","save","say","scale","scan","scare","scatter","scene","scheme","school","science","scissors","scorpion","scout","scrap","screen","script","scrub","sea","search","season","seat","second","secret","section","security","seed","seek","segment","select","sell","seminar","senior","sense","sentence","series","service","session","settle","setup","seven","shadow","shaft","shallow","share","shed","shell","sheriff","shield","shift","shine","ship","shiver","shock","shoe","shoot","shop","short","shoulder","shove","shrimp","shrug","shuffle","shy","sibling","sick","side","siege","sight","sign","silent","silk","silly","silver","similar","simple","since","sing","siren","sister","situate","six","size","skate","sketch","ski","skill","skin","skirt","skull","slab","slam","sleep","slender","slice","slide","slight","slim","slogan","slot","slow","slush","small","smart","smile","smoke","smooth","snack","snake","snap","sniff","snow","soap","soccer","social","sock","soda","soft","solar","soldier","solid","solution","solve","someone","song","soon","sorry","sort","soul","sound","soup","source","south","space","spare","spatial","spawn","speak","special","speed","spell","spend","sphere","spice","spider","spike","spin","spirit","split","spoil","sponsor","spoon","sport","spot","spray","spread","spring","spy","square","squeeze","squirrel","stable","stadium","staff","stage","stairs","stamp","stand","start","state","stay","steak","steel","stem","step","stereo","stick","still","sting","stock","stomach","stone","stool","story","stove","strategy","street","strike","strong","struggle","student","stuff","stumble","style","subject","submit","subway","success","such","sudden","suffer","sugar","suggest","suit","summer","sun","sunny","sunset","super","supply","supreme","sure","surface","surge","surprise","surround","survey","suspect","sustain","swallow","swamp","swap","swarm","swear","sweet","swift","swim","swing","switch","sword","symbol","symptom","syrup","system","table","tackle","tag","tail","talent","talk","tank","tape","target","task","taste","tattoo","taxi","teach","team","tell","ten","tenant","tennis","tent","term","test","text","thank","that","theme","then","theory","there","they","thing","this","thought","three","thrive","throw","thumb","thunder","ticket","tide","tiger","tilt","timber","time","tiny","tip","tired","tissue","title","toast","tobacco","today","toddler","toe","together","toilet","token","tomato","tomorrow","tone","tongue","tonight","tool","tooth","top","topic","topple","torch","tornado","tortoise","toss","total","tourist","toward","tower","town","toy","track","trade","traffic","tragic","train","transfer","trap","trash","travel","tray","treat","tree","trend","trial","tribe","trick","trigger","trim","trip","trophy","trouble","truck","true","truly","trumpet","trust","truth","try","tube","tuition","tumble","tuna","tunnel","turkey","turn","turtle","twelve","twenty","twice","twin","twist","two","type","typical","ugly","umbrella","unable","unaware","uncle","uncover","under","undo","unfair","unfold","unhappy","uniform","unique","unit","universe","unknown","unlock","until","unusual","unveil","update","upgrade","uphold","upon","upper","upset","urban","urge","usage","use","used","useful","useless","usual","utility","vacant","vacuum","vague","valid","valley","valve","van","vanish","vapor","various","vast","vault","vehicle","velvet","vendor","venture","venue","verb","verify","version","very","vessel","veteran","viable","vibrant","vicious","victory","video","view","village","vintage","violin","virtual","virus","visa","visit","visual","vital","vivid","vocal","voice","void","volcano","volume","vote","voyage","wage","wagon","wait","walk","wall","walnut","want","warfare","warm","warrior","wash","wasp","waste","water","wave","way","wealth","weapon","wear","weasel","weather","web","wedding","weekend","weird","welcome","west","wet","whale","what","wheat","wheel","when","where","whip","whisper","wide","width","wife","wild","will","win","window","wine","wing","wink","winner","winter","wire","wisdom","wise","wish","witness","wolf","woman","wonder","wood","wool","word","work","world","worry","worth","wrap","wreck","wrestle","wrist","write","wrong","yard","year","yellow","you","young","youth","zebra","zero","zone","zoo"]

/***/ }),
/* 96 */
/***/ (function(module, exports, __webpack_require__) {

var render = function(){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('v-ons-page',{attrs:{"data-page":"showPassphrase"}},[_c('custom-bar',{attrs:{"title":"パスフレーズ"}}),_vm._v(" "),_c('div',{staticClass:"wrap"},[_c('ul',[_c('li',[_vm._v("英単語を正確に、紙に手書きしてください。")]),_vm._v(" "),_c('li',[_vm._v("英単語のスクリーンショットを撮影・コピーしないでください。")]),_vm._v(" "),_c('li',[_vm._v("他人に知れ渡ると、モナコインを盗まれる可能性があります。")]),_vm._v(" "),_c('li',[_vm._v("チェックボックスは確認のためにお使いください。")])]),_vm._v(" "),_c('v-ons-list',[_vm._l((_vm.words),function(word,index){return _c('v-ons-list-item',[_c('label',{staticClass:"left"},[_vm._v("\n          "+_vm._s(index+1)+"\n        ")]),_vm._v(" "),_c('label',{staticClass:"center"},[_vm._v(_vm._s(word))]),_vm._v(" "),_c('label',{staticClass:"right"},[_c('v-ons-checkbox')],1)])}),_vm._v(" "),_c('v-ons-list-item',[_c('v-ons-button',{attrs:{"modifier":"large","disable":!_vm.words.length},on:{"click":_vm.next}},[_vm._v("次へ")])],1)],2)],1)],1)}
var staticRenderFns = []
module.exports = function (_exports) {
  var options = typeof _exports === 'function'
    ? _exports.options
    : _exports
  options.render = render
  options.staticRenderFns = staticRenderFns
  if (false) {
    api.createRecord("data-v-56246a62", options)
  }
  return _exports
}
var api = null
if (false) {(function () {
  api = require("vue-hot-reload-api")
  api.install(require("vue"))
  if (!api.compatible) return
  module.hot.accept()
  if (module.hot.data) {
    api.rerender("data-v-56246a62", { render: render, staticRenderFns: staticRenderFns })
  }
})()}


/***/ }),
/* 97 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var securityManager = __webpack_require__(34);
module.exports = __webpack_require__(98)({
  data: function data() {
    return {
      passwordType: "password",
      password: "",
      password2: ""
    };
  },

  methods: {
    next: function next() {
      //this.$emit("push",require("./generateKey.js"))
    }
  },
  mounted: function mounted() {
    var _this = this;

    this.$emit("getParam", function (param) {
      securityManager.getWordsFromArray(param.keyArray).then(function (words) {
        _this.words = words;
      });
    });
  },

  components: {}
});

/***/ }),
/* 98 */
/***/ (function(module, exports, __webpack_require__) {

var render = function(){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('v-ons-page',{attrs:{"data-page":"setPassword"}},[_c('custom-bar',{attrs:{"title":"パスワード設定"}}),_vm._v(" "),_c('div',{staticClass:"wrap"},[_c('ul',[_c('li',[_vm._v("パスワードを設定します。")]),_vm._v(" "),_c('li',[_vm._v("秘密鍵を保護するために使用されます。")]),_vm._v(" "),_c('li',[_vm._v("他人に知れ渡ると、勝手にアプリケーションを利用される可能性があります。")])]),_vm._v(" "),_c('v-ons-list',[_c('v-ons-list-header',[_vm._v("パスワードの種類")]),_vm._v(" "),_c('v-ons-list-item',[_c('label',{staticClass:"left"},[_c('v-ons-radio',{attrs:{"input-id":"pin","value":"pin"},model:{value:(_vm.passwordType),callback:function ($$v) {_vm.passwordType=$$v},expression:"passwordType"}})],1),_vm._v(" "),_c('label',{staticClass:"center",attrs:{"for":"pin"}},[_vm._v("数字のみのPINコード")])]),_vm._v(" "),_c('v-ons-list-item',[_c('label',{staticClass:"left"},[_c('v-ons-radio',{attrs:{"input-id":"pin","value":"password"},model:{value:(_vm.passwordType),callback:function ($$v) {_vm.passwordType=$$v},expression:"passwordType"}})],1),_vm._v(" "),_c('label',{staticClass:"center",attrs:{"for":"pin"}},[_vm._v("半角英数字のパスワード")])]),_vm._v(" "),_c('div',{directives:[{name:"show",rawName:"v-show",value:(_vm.passwordType==='password'),expression:"passwordType==='password'"}]},[_c('v-ons-list-header',[_vm._v("パスワード")]),_vm._v(" "),_c('v-ons-list-item',[_c('v-ons-input',{attrs:{"placeholder":"Password"},model:{value:(_vm.password),callback:function ($$v) {_vm.password=$$v},expression:"password"}})],1),_vm._v(" "),_c('v-ons-list-item',[_c('v-ons-input',{attrs:{"placeholder":"Retype Password"},model:{value:(_vm.password2),callback:function ($$v) {_vm.password2=$$v},expression:"password2"}})],1),_vm._v(" "),_c('v-ons-list-item',[_c('v-ons-button',{attrs:{"modifier":"large","disable":!_vm.password||_vm.password!==_vm.password2},on:{"click":function($event){}}},[_vm._v("次へ")])],1)],1),_vm._v(" "),_c('div',{directives:[{name:"show",rawName:"v-show",value:(_vm.passwordType==='pin'),expression:"passwordType==='pin'"}]})],1)],1)],1)}
var staticRenderFns = []
module.exports = function (_exports) {
  var options = typeof _exports === 'function'
    ? _exports.options
    : _exports
  options.render = render
  options.staticRenderFns = staticRenderFns
  if (false) {
    api.createRecord("data-v-2e40ef02", options)
  }
  return _exports
}
var api = null
if (false) {(function () {
  api = require("vue-hot-reload-api")
  api.install(require("vue"))
  if (!api.compatible) return
  module.hot.accept()
  if (module.hot.data) {
    api.rerender("data-v-2e40ef02", { render: render, staticRenderFns: staticRenderFns })
  }
})()}


/***/ }),
/* 99 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = __webpack_require__(100)({
  data: function data() {
    return {
      balanceToShow: 4545,
      unitToShow: "mona"
    };
  },

  methods: {
    push: function push() {
      this.$emit("push", __webpack_require__(35));
    }
  }
});

/***/ }),
/* 100 */
/***/ (function(module, exports, __webpack_require__) {

var render = function(){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('v-ons-page',{attrs:{"data-page":"home"}},[_c('custom-bar',{attrs:{"title":"ホーム","menu":"true"}}),_vm._v(" "),_c('div',[_c('div',{attrs:{"id":"youHave"}},[_c('div',{staticClass:"label"},[_vm._v("あなたが今持っているのは")]),_vm._v(" "),_c('div',{attrs:{"id":"balanceWrap"}},[_c('span',{attrs:{"id":"balance"}},[_vm._v(_vm._s(_vm.balanceToShow))]),_vm._v(" "),_c('span',{directives:[{name:"show",rawName:"v-show",value:(_vm.unitToShow=='mona_easy'),expression:"unitToShow=='mona_easy'"}],attrs:{"id":"unit"}},[_vm._v("もにゃ")]),_vm._v(" "),_c('span',{directives:[{name:"show",rawName:"v-show",value:(_vm.unitToShow=='mona'),expression:"unitToShow=='mona'"}],attrs:{"id":"unit"}},[_vm._v("MONA")]),_vm._v(" "),_c('span',{directives:[{name:"show",rawName:"v-show",value:(_vm.unitToShow=='jpy'),expression:"unitToShow=='jpy'"}],attrs:{"id":"unit"}},[_vm._v("円")])])]),_vm._v(" "),_c('div',{attrs:{"id":"transactions"}},[_c('v-ons-list',[_c('v-ons-list-header',[_vm._v("最近の取引")]),_vm._v(" "),_c('v-ons-list-item',{attrs:{"modifier":"tappable"}},[_c('div',{staticClass:"center"},[_vm._v("\n            受け取り\n          ")]),_vm._v(" "),_c('div',{staticClass:"right"},[_vm._v("10モナ")])]),_vm._v(" "),_c('v-ons-list-item',{attrs:{"modifier":"chevron tappable"}},[_c('div',{staticClass:"left"},[_vm._v("詳しく")])])],1)],1)])],1)}
var staticRenderFns = []
module.exports = function (_exports) {
  var options = typeof _exports === 'function'
    ? _exports.options
    : _exports
  options.render = render
  options.staticRenderFns = staticRenderFns
  if (false) {
    api.createRecord("data-v-b2342bd2", options)
  }
  return _exports
}
var api = null
if (false) {(function () {
  api = require("vue-hot-reload-api")
  api.install(require("vue"))
  if (!api.compatible) return
  module.hot.accept()
  if (module.hot.data) {
    api.rerender("data-v-b2342bd2", { render: render, staticRenderFns: staticRenderFns })
  }
})()}


/***/ }),
/* 101 */
/***/ (function(module, exports, __webpack_require__) {

var render = function(){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('v-ons-page',{attrs:{"data-page":"send"}},[_c('custom-bar',{attrs:{"title":"送る","menu":"true"}}),_vm._v(" "),_c('div')],1)}
var staticRenderFns = []
module.exports = function (_exports) {
  var options = typeof _exports === 'function'
    ? _exports.options
    : _exports
  options.render = render
  options.staticRenderFns = staticRenderFns
  if (false) {
    api.createRecord("data-v-2a3c510e", options)
  }
  return _exports
}
var api = null
if (false) {(function () {
  api = require("vue-hot-reload-api")
  api.install(require("vue"))
  if (!api.compatible) return
  module.hot.accept()
  if (module.hot.data) {
    api.rerender("data-v-2a3c510e", { render: render, staticRenderFns: staticRenderFns })
  }
})()}


/***/ }),
/* 102 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var coin = __webpack_require__(103);

module.exports = __webpack_require__(164)({
  data: function data() {
    return {
      mainAddress: ""
    };
  },

  methods: {
    getMainAddress: function getMainAddress() {
      this.mainAddress = coin.getAddressForTesting();
    }
  },
  mounted: function mounted() {
    this.getMainAddress();
  }
});

/***/ }),
/* 103 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var bcLib = __webpack_require__(104);

var monacoinNetwork = exports.monacoinNetwork = {
  messagePrefix: '\x19Monacoin Signed Message:\n',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4
  },
  pubKeyHash: 0x32,
  scriptHash: 0x05,
  wif: 0xb2,
  bech32: "mona"
};

exports.getAddressForTesting = function () {
  var keyPair = bcLib.ECPair.makeRandom({
    network: monacoinNetwork
  });
  var address = keyPair.getAddress();
  return address;
};

/***/ }),
/* 104 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = {
  Block: __webpack_require__(105),
  ECPair: __webpack_require__(26),
  ECSignature: __webpack_require__(30),
  HDNode: __webpack_require__(162),
  Transaction: __webpack_require__(25),
  TransactionBuilder: __webpack_require__(163),

  address: __webpack_require__(27),
  bufferutils: __webpack_require__(53), // TODO: remove in 4.0.0
  crypto: __webpack_require__(11),
  networks: __webpack_require__(15),
  opcodes: __webpack_require__(6),
  script: __webpack_require__(4)
}


/***/ }),
/* 105 */
/***/ (function(module, exports, __webpack_require__) {

var Buffer = __webpack_require__(2).Buffer
var bcrypto = __webpack_require__(11)
var fastMerkleRoot = __webpack_require__(124)
var typeforce = __webpack_require__(0)
var types = __webpack_require__(5)
var varuint = __webpack_require__(24)

var Transaction = __webpack_require__(25)

function Block () {
  this.version = 1
  this.prevHash = null
  this.merkleRoot = null
  this.timestamp = 0
  this.bits = 0
  this.nonce = 0
}

Block.fromBuffer = function (buffer) {
  if (buffer.length < 80) throw new Error('Buffer too small (< 80 bytes)')

  var offset = 0
  function readSlice (n) {
    offset += n
    return buffer.slice(offset - n, offset)
  }

  function readUInt32 () {
    var i = buffer.readUInt32LE(offset)
    offset += 4
    return i
  }

  function readInt32 () {
    var i = buffer.readInt32LE(offset)
    offset += 4
    return i
  }

  var block = new Block()
  block.version = readInt32()
  block.prevHash = readSlice(32)
  block.merkleRoot = readSlice(32)
  block.timestamp = readUInt32()
  block.bits = readUInt32()
  block.nonce = readUInt32()

  if (buffer.length === 80) return block

  function readVarInt () {
    var vi = varuint.decode(buffer, offset)
    offset += varuint.decode.bytes
    return vi
  }

  function readTransaction () {
    var tx = Transaction.fromBuffer(buffer.slice(offset), true)
    offset += tx.byteLength()
    return tx
  }

  var nTransactions = readVarInt()
  block.transactions = []

  for (var i = 0; i < nTransactions; ++i) {
    var tx = readTransaction()
    block.transactions.push(tx)
  }

  return block
}

Block.prototype.byteLength = function (headersOnly) {
  if (headersOnly || !this.transactions) return 80

  return 80 + varuint.encodingLength(this.transactions.length) + this.transactions.reduce(function (a, x) {
    return a + x.byteLength()
  }, 0)
}

Block.fromHex = function (hex) {
  return Block.fromBuffer(Buffer.from(hex, 'hex'))
}

Block.prototype.getHash = function () {
  return bcrypto.hash256(this.toBuffer(true))
}

Block.prototype.getId = function () {
  return this.getHash().reverse().toString('hex')
}

Block.prototype.getUTCDate = function () {
  var date = new Date(0) // epoch
  date.setUTCSeconds(this.timestamp)

  return date
}

// TODO: buffer, offset compatibility
Block.prototype.toBuffer = function (headersOnly) {
  var buffer = Buffer.allocUnsafe(this.byteLength(headersOnly))

  var offset = 0
  function writeSlice (slice) {
    slice.copy(buffer, offset)
    offset += slice.length
  }

  function writeInt32 (i) {
    buffer.writeInt32LE(i, offset)
    offset += 4
  }
  function writeUInt32 (i) {
    buffer.writeUInt32LE(i, offset)
    offset += 4
  }

  writeInt32(this.version)
  writeSlice(this.prevHash)
  writeSlice(this.merkleRoot)
  writeUInt32(this.timestamp)
  writeUInt32(this.bits)
  writeUInt32(this.nonce)

  if (headersOnly || !this.transactions) return buffer

  varuint.encode(this.transactions.length, buffer, offset)
  offset += varuint.encode.bytes

  this.transactions.forEach(function (tx) {
    var txSize = tx.byteLength() // TODO: extract from toBuffer?
    tx.toBuffer(buffer, offset)
    offset += txSize
  })

  return buffer
}

Block.prototype.toHex = function (headersOnly) {
  return this.toBuffer(headersOnly).toString('hex')
}

Block.calculateTarget = function (bits) {
  var exponent = ((bits & 0xff000000) >> 24) - 3
  var mantissa = bits & 0x007fffff
  var target = Buffer.alloc(32, 0)
  target.writeUInt32BE(mantissa, 28 - exponent)
  return target
}

Block.calculateMerkleRoot = function (transactions) {
  typeforce([{ getHash: types.Function }], transactions)
  if (transactions.length === 0) throw TypeError('Cannot compute merkle root for zero transactions')

  var hashes = transactions.map(function (transaction) {
    return transaction.getHash()
  })

  return fastMerkleRoot(hashes, bcrypto.hash256)
}

Block.prototype.checkMerkleRoot = function () {
  if (!this.transactions) return false

  var actualMerkleRoot = Block.calculateMerkleRoot(this.transactions)
  return this.merkleRoot.compare(actualMerkleRoot) === 0
}

Block.prototype.checkProofOfWork = function () {
  var hash = this.getHash().reverse()
  var target = Block.calculateTarget(this.bits)

  return hash.compare(target) <= 0
}

module.exports = Block


/***/ }),
/* 106 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.byteLength = byteLength
exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i]
  revLookup[code.charCodeAt(i)] = i
}

revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function placeHoldersCount (b64) {
  var len = b64.length
  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // the number of equal signs (place holders)
  // if there are two placeholders, than the two characters before it
  // represent one byte
  // if there is only one, then the three characters before it represent 2 bytes
  // this is just a cheap hack to not do indexOf twice
  return b64[len - 2] === '=' ? 2 : b64[len - 1] === '=' ? 1 : 0
}

function byteLength (b64) {
  // base64 is 4/3 + up to two characters of the original data
  return (b64.length * 3 / 4) - placeHoldersCount(b64)
}

function toByteArray (b64) {
  var i, l, tmp, placeHolders, arr
  var len = b64.length
  placeHolders = placeHoldersCount(b64)

  arr = new Arr((len * 3 / 4) - placeHolders)

  // if there are placeholders, only get up to the last complete 4 chars
  l = placeHolders > 0 ? len - 4 : len

  var L = 0

  for (i = 0; i < l; i += 4) {
    tmp = (revLookup[b64.charCodeAt(i)] << 18) | (revLookup[b64.charCodeAt(i + 1)] << 12) | (revLookup[b64.charCodeAt(i + 2)] << 6) | revLookup[b64.charCodeAt(i + 3)]
    arr[L++] = (tmp >> 16) & 0xFF
    arr[L++] = (tmp >> 8) & 0xFF
    arr[L++] = tmp & 0xFF
  }

  if (placeHolders === 2) {
    tmp = (revLookup[b64.charCodeAt(i)] << 2) | (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[L++] = tmp & 0xFF
  } else if (placeHolders === 1) {
    tmp = (revLookup[b64.charCodeAt(i)] << 10) | (revLookup[b64.charCodeAt(i + 1)] << 4) | (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[L++] = (tmp >> 8) & 0xFF
    arr[L++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var output = ''
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    output += lookup[tmp >> 2]
    output += lookup[(tmp << 4) & 0x3F]
    output += '=='
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + (uint8[len - 1])
    output += lookup[tmp >> 10]
    output += lookup[(tmp >> 4) & 0x3F]
    output += lookup[(tmp << 2) & 0x3F]
    output += '='
  }

  parts.push(output)

  return parts.join('')
}


/***/ }),
/* 107 */
/***/ (function(module, exports) {

exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}


/***/ }),
/* 108 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(Buffer) {
var intSize = 4
var zeroBuffer = new Buffer(intSize)
zeroBuffer.fill(0)

var charSize = 8
var hashSize = 16

function toArray (buf) {
  if ((buf.length % intSize) !== 0) {
    var len = buf.length + (intSize - (buf.length % intSize))
    buf = Buffer.concat([buf, zeroBuffer], len)
  }

  var arr = new Array(buf.length >>> 2)
  for (var i = 0, j = 0; i < buf.length; i += intSize, j++) {
    arr[j] = buf.readInt32LE(i)
  }

  return arr
}

module.exports = function hash (buf, fn) {
  var arr = fn(toArray(buf), buf.length * charSize)
  buf = new Buffer(hashSize)
  for (var i = 0; i < arr.length; i++) {
    buf.writeInt32LE(arr[i], i << 2, true)
  }
  return buf
}

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1).Buffer))

/***/ }),
/* 109 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(Buffer) {
var Transform = __webpack_require__(40).Transform
var inherits = __webpack_require__(3)

function HashBase (blockSize) {
  Transform.call(this)

  this._block = new Buffer(blockSize)
  this._blockSize = blockSize
  this._blockOffset = 0
  this._length = [0, 0, 0, 0]

  this._finalized = false
}

inherits(HashBase, Transform)

HashBase.prototype._transform = function (chunk, encoding, callback) {
  var error = null
  try {
    if (encoding !== 'buffer') chunk = new Buffer(chunk, encoding)
    this.update(chunk)
  } catch (err) {
    error = err
  }

  callback(error)
}

HashBase.prototype._flush = function (callback) {
  var error = null
  try {
    this.push(this._digest())
  } catch (err) {
    error = err
  }

  callback(error)
}

HashBase.prototype.update = function (data, encoding) {
  if (!Buffer.isBuffer(data) && typeof data !== 'string') throw new TypeError('Data must be a string or a buffer')
  if (this._finalized) throw new Error('Digest already called')
  if (!Buffer.isBuffer(data)) data = new Buffer(data, encoding || 'binary')

  // consume data
  var block = this._block
  var offset = 0
  while (this._blockOffset + data.length - offset >= this._blockSize) {
    for (var i = this._blockOffset; i < this._blockSize;) block[i++] = data[offset++]
    this._update()
    this._blockOffset = 0
  }
  while (offset < data.length) block[this._blockOffset++] = data[offset++]

  // update length
  for (var j = 0, carry = data.length * 8; carry > 0; ++j) {
    this._length[j] += carry
    carry = (this._length[j] / 0x0100000000) | 0
    if (carry > 0) this._length[j] -= 0x0100000000 * carry
  }

  return this
}

HashBase.prototype._update = function (data) {
  throw new Error('_update is not implemented')
}

HashBase.prototype.digest = function (encoding) {
  if (this._finalized) throw new Error('Digest already called')
  this._finalized = true

  var digest = this._digest()
  if (encoding !== undefined) digest = digest.toString(encoding)
  return digest
}

HashBase.prototype._digest = function () {
  throw new Error('_digest is not implemented')
}

module.exports = HashBase

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1).Buffer))

/***/ }),
/* 110 */
/***/ (function(module, exports) {

/* (ignored) */

/***/ }),
/* 111 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/*<replacement>*/

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Buffer = __webpack_require__(2).Buffer;
/*</replacement>*/

function copyBuffer(src, target, offset) {
  src.copy(target, offset);
}

module.exports = function () {
  function BufferList() {
    _classCallCheck(this, BufferList);

    this.head = null;
    this.tail = null;
    this.length = 0;
  }

  BufferList.prototype.push = function push(v) {
    var entry = { data: v, next: null };
    if (this.length > 0) this.tail.next = entry;else this.head = entry;
    this.tail = entry;
    ++this.length;
  };

  BufferList.prototype.unshift = function unshift(v) {
    var entry = { data: v, next: this.head };
    if (this.length === 0) this.tail = entry;
    this.head = entry;
    ++this.length;
  };

  BufferList.prototype.shift = function shift() {
    if (this.length === 0) return;
    var ret = this.head.data;
    if (this.length === 1) this.head = this.tail = null;else this.head = this.head.next;
    --this.length;
    return ret;
  };

  BufferList.prototype.clear = function clear() {
    this.head = this.tail = null;
    this.length = 0;
  };

  BufferList.prototype.join = function join(s) {
    if (this.length === 0) return '';
    var p = this.head;
    var ret = '' + p.data;
    while (p = p.next) {
      ret += s + p.data;
    }return ret;
  };

  BufferList.prototype.concat = function concat(n) {
    if (this.length === 0) return Buffer.alloc(0);
    if (this.length === 1) return this.head.data;
    var ret = Buffer.allocUnsafe(n >>> 0);
    var p = this.head;
    var i = 0;
    while (p) {
      copyBuffer(p.data, ret, i);
      i += p.data.length;
      p = p.next;
    }
    return ret;
  };

  return BufferList;
}();

/***/ }),
/* 112 */
/***/ (function(module, exports, __webpack_require__) {

var apply = Function.prototype.apply;

// DOM APIs, for completeness

exports.setTimeout = function() {
  return new Timeout(apply.call(setTimeout, window, arguments), clearTimeout);
};
exports.setInterval = function() {
  return new Timeout(apply.call(setInterval, window, arguments), clearInterval);
};
exports.clearTimeout =
exports.clearInterval = function(timeout) {
  if (timeout) {
    timeout.close();
  }
};

function Timeout(id, clearFn) {
  this._id = id;
  this._clearFn = clearFn;
}
Timeout.prototype.unref = Timeout.prototype.ref = function() {};
Timeout.prototype.close = function() {
  this._clearFn.call(window, this._id);
};

// Does not start the time, just sets up the members needed.
exports.enroll = function(item, msecs) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = msecs;
};

exports.unenroll = function(item) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = -1;
};

exports._unrefActive = exports.active = function(item) {
  clearTimeout(item._idleTimeoutId);

  var msecs = item._idleTimeout;
  if (msecs >= 0) {
    item._idleTimeoutId = setTimeout(function onTimeout() {
      if (item._onTimeout)
        item._onTimeout();
    }, msecs);
  }
};

// setimmediate attaches itself to the global object
__webpack_require__(113);
exports.setImmediate = setImmediate;
exports.clearImmediate = clearImmediate;


/***/ }),
/* 113 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global, process) {(function (global, undefined) {
    "use strict";

    if (global.setImmediate) {
        return;
    }

    var nextHandle = 1; // Spec says greater than zero
    var tasksByHandle = {};
    var currentlyRunningATask = false;
    var doc = global.document;
    var registerImmediate;

    function setImmediate(callback) {
      // Callback can either be a function or a string
      if (typeof callback !== "function") {
        callback = new Function("" + callback);
      }
      // Copy function arguments
      var args = new Array(arguments.length - 1);
      for (var i = 0; i < args.length; i++) {
          args[i] = arguments[i + 1];
      }
      // Store and register the task
      var task = { callback: callback, args: args };
      tasksByHandle[nextHandle] = task;
      registerImmediate(nextHandle);
      return nextHandle++;
    }

    function clearImmediate(handle) {
        delete tasksByHandle[handle];
    }

    function run(task) {
        var callback = task.callback;
        var args = task.args;
        switch (args.length) {
        case 0:
            callback();
            break;
        case 1:
            callback(args[0]);
            break;
        case 2:
            callback(args[0], args[1]);
            break;
        case 3:
            callback(args[0], args[1], args[2]);
            break;
        default:
            callback.apply(undefined, args);
            break;
        }
    }

    function runIfPresent(handle) {
        // From the spec: "Wait until any invocations of this algorithm started before this one have completed."
        // So if we're currently running a task, we'll need to delay this invocation.
        if (currentlyRunningATask) {
            // Delay by doing a setTimeout. setImmediate was tried instead, but in Firefox 7 it generated a
            // "too much recursion" error.
            setTimeout(runIfPresent, 0, handle);
        } else {
            var task = tasksByHandle[handle];
            if (task) {
                currentlyRunningATask = true;
                try {
                    run(task);
                } finally {
                    clearImmediate(handle);
                    currentlyRunningATask = false;
                }
            }
        }
    }

    function installNextTickImplementation() {
        registerImmediate = function(handle) {
            process.nextTick(function () { runIfPresent(handle); });
        };
    }

    function canUsePostMessage() {
        // The test against `importScripts` prevents this implementation from being installed inside a web worker,
        // where `global.postMessage` means something completely different and can't be used for this purpose.
        if (global.postMessage && !global.importScripts) {
            var postMessageIsAsynchronous = true;
            var oldOnMessage = global.onmessage;
            global.onmessage = function() {
                postMessageIsAsynchronous = false;
            };
            global.postMessage("", "*");
            global.onmessage = oldOnMessage;
            return postMessageIsAsynchronous;
        }
    }

    function installPostMessageImplementation() {
        // Installs an event handler on `global` for the `message` event: see
        // * https://developer.mozilla.org/en/DOM/window.postMessage
        // * http://www.whatwg.org/specs/web-apps/current-work/multipage/comms.html#crossDocumentMessages

        var messagePrefix = "setImmediate$" + Math.random() + "$";
        var onGlobalMessage = function(event) {
            if (event.source === global &&
                typeof event.data === "string" &&
                event.data.indexOf(messagePrefix) === 0) {
                runIfPresent(+event.data.slice(messagePrefix.length));
            }
        };

        if (global.addEventListener) {
            global.addEventListener("message", onGlobalMessage, false);
        } else {
            global.attachEvent("onmessage", onGlobalMessage);
        }

        registerImmediate = function(handle) {
            global.postMessage(messagePrefix + handle, "*");
        };
    }

    function installMessageChannelImplementation() {
        var channel = new MessageChannel();
        channel.port1.onmessage = function(event) {
            var handle = event.data;
            runIfPresent(handle);
        };

        registerImmediate = function(handle) {
            channel.port2.postMessage(handle);
        };
    }

    function installReadyStateChangeImplementation() {
        var html = doc.documentElement;
        registerImmediate = function(handle) {
            // Create a <script> element; its readystatechange event will be fired asynchronously once it is inserted
            // into the document. Do so, thus queuing up the task. Remember to clean up once it's been called.
            var script = doc.createElement("script");
            script.onreadystatechange = function () {
                runIfPresent(handle);
                script.onreadystatechange = null;
                html.removeChild(script);
                script = null;
            };
            html.appendChild(script);
        };
    }

    function installSetTimeoutImplementation() {
        registerImmediate = function(handle) {
            setTimeout(runIfPresent, 0, handle);
        };
    }

    // If supported, we should attach to the prototype of global, since that is where setTimeout et al. live.
    var attachTo = Object.getPrototypeOf && Object.getPrototypeOf(global);
    attachTo = attachTo && attachTo.setTimeout ? attachTo : global;

    // Don't get fooled by e.g. browserify environments.
    if ({}.toString.call(global.process) === "[object process]") {
        // For Node.js before 0.9
        installNextTickImplementation();

    } else if (canUsePostMessage()) {
        // For non-IE10 modern browsers
        installPostMessageImplementation();

    } else if (global.MessageChannel) {
        // For web workers, where supported
        installMessageChannelImplementation();

    } else if (doc && "onreadystatechange" in doc.createElement("script")) {
        // For IE 6–8
        installReadyStateChangeImplementation();

    } else {
        // For older browsers
        installSetTimeoutImplementation();
    }

    attachTo.setImmediate = setImmediate;
    attachTo.clearImmediate = clearImmediate;
}(typeof self === "undefined" ? typeof global === "undefined" ? this : global : self));

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(7), __webpack_require__(12)))

/***/ }),
/* 114 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {
/**
 * Module exports.
 */

module.exports = deprecate;

/**
 * Mark that a method should not be used.
 * Returns a modified function which warns once by default.
 *
 * If `localStorage.noDeprecation = true` is set, then it is a no-op.
 *
 * If `localStorage.throwDeprecation = true` is set, then deprecated functions
 * will throw an Error when invoked.
 *
 * If `localStorage.traceDeprecation = true` is set, then deprecated functions
 * will invoke `console.trace()` instead of `console.error()`.
 *
 * @param {Function} fn - the function to deprecate
 * @param {String} msg - the string to print to the console when `fn` is invoked
 * @returns {Function} a new "deprecated" version of `fn`
 * @api public
 */

function deprecate (fn, msg) {
  if (config('noDeprecation')) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (config('throwDeprecation')) {
        throw new Error(msg);
      } else if (config('traceDeprecation')) {
        console.trace(msg);
      } else {
        console.warn(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
}

/**
 * Checks `localStorage` for boolean values for the given `name`.
 *
 * @param {String} name
 * @returns {Boolean}
 * @api private
 */

function config (name) {
  // accessing global.localStorage can trigger a DOMException in sandboxed iframes
  try {
    if (!global.localStorage) return false;
  } catch (_) {
    return false;
  }
  var val = global.localStorage[name];
  if (null == val) return false;
  return String(val).toLowerCase() === 'true';
}

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(7)))

/***/ }),
/* 115 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// a passthrough stream.
// basically just the most minimal sort of Transform stream.
// Every written chunk gets output as-is.



module.exports = PassThrough;

var Transform = __webpack_require__(44);

/*<replacement>*/
var util = __webpack_require__(14);
util.inherits = __webpack_require__(3);
/*</replacement>*/

util.inherits(PassThrough, Transform);

function PassThrough(options) {
  if (!(this instanceof PassThrough)) return new PassThrough(options);

  Transform.call(this, options);
}

PassThrough.prototype._transform = function (chunk, encoding, cb) {
  cb(null, chunk);
};

/***/ }),
/* 116 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(20);


/***/ }),
/* 117 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(8);


/***/ }),
/* 118 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(19).Transform


/***/ }),
/* 119 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(19).PassThrough


/***/ }),
/* 120 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(Buffer) {/*
 * A JavaScript implementation of the Secure Hash Algorithm, SHA-0, as defined
 * in FIPS PUB 180-1
 * This source code is derived from sha1.js of the same repository.
 * The difference between SHA-0 and SHA-1 is just a bitwise rotate left
 * operation was added.
 */

var inherits = __webpack_require__(3)
var Hash = __webpack_require__(13)

var K = [
  0x5a827999, 0x6ed9eba1, 0x8f1bbcdc | 0, 0xca62c1d6 | 0
]

var W = new Array(80)

function Sha () {
  this.init()
  this._w = W

  Hash.call(this, 64, 56)
}

inherits(Sha, Hash)

Sha.prototype.init = function () {
  this._a = 0x67452301
  this._b = 0xefcdab89
  this._c = 0x98badcfe
  this._d = 0x10325476
  this._e = 0xc3d2e1f0

  return this
}

function rotl5 (num) {
  return (num << 5) | (num >>> 27)
}

function rotl30 (num) {
  return (num << 30) | (num >>> 2)
}

function ft (s, b, c, d) {
  if (s === 0) return (b & c) | ((~b) & d)
  if (s === 2) return (b & c) | (b & d) | (c & d)
  return b ^ c ^ d
}

Sha.prototype._update = function (M) {
  var W = this._w

  var a = this._a | 0
  var b = this._b | 0
  var c = this._c | 0
  var d = this._d | 0
  var e = this._e | 0

  for (var i = 0; i < 16; ++i) W[i] = M.readInt32BE(i * 4)
  for (; i < 80; ++i) W[i] = W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16]

  for (var j = 0; j < 80; ++j) {
    var s = ~~(j / 20)
    var t = (rotl5(a) + ft(s, b, c, d) + e + W[j] + K[s]) | 0

    e = d
    d = c
    c = rotl30(b)
    b = a
    a = t
  }

  this._a = (a + this._a) | 0
  this._b = (b + this._b) | 0
  this._c = (c + this._c) | 0
  this._d = (d + this._d) | 0
  this._e = (e + this._e) | 0
}

Sha.prototype._hash = function () {
  var H = new Buffer(20)

  H.writeInt32BE(this._a | 0, 0)
  H.writeInt32BE(this._b | 0, 4)
  H.writeInt32BE(this._c | 0, 8)
  H.writeInt32BE(this._d | 0, 12)
  H.writeInt32BE(this._e | 0, 16)

  return H
}

module.exports = Sha

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1).Buffer))

/***/ }),
/* 121 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(Buffer) {/*
 * A JavaScript implementation of the Secure Hash Algorithm, SHA-1, as defined
 * in FIPS PUB 180-1
 * Version 2.1a Copyright Paul Johnston 2000 - 2002.
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 * Distributed under the BSD License
 * See http://pajhome.org.uk/crypt/md5 for details.
 */

var inherits = __webpack_require__(3)
var Hash = __webpack_require__(13)

var K = [
  0x5a827999, 0x6ed9eba1, 0x8f1bbcdc | 0, 0xca62c1d6 | 0
]

var W = new Array(80)

function Sha1 () {
  this.init()
  this._w = W

  Hash.call(this, 64, 56)
}

inherits(Sha1, Hash)

Sha1.prototype.init = function () {
  this._a = 0x67452301
  this._b = 0xefcdab89
  this._c = 0x98badcfe
  this._d = 0x10325476
  this._e = 0xc3d2e1f0

  return this
}

function rotl1 (num) {
  return (num << 1) | (num >>> 31)
}

function rotl5 (num) {
  return (num << 5) | (num >>> 27)
}

function rotl30 (num) {
  return (num << 30) | (num >>> 2)
}

function ft (s, b, c, d) {
  if (s === 0) return (b & c) | ((~b) & d)
  if (s === 2) return (b & c) | (b & d) | (c & d)
  return b ^ c ^ d
}

Sha1.prototype._update = function (M) {
  var W = this._w

  var a = this._a | 0
  var b = this._b | 0
  var c = this._c | 0
  var d = this._d | 0
  var e = this._e | 0

  for (var i = 0; i < 16; ++i) W[i] = M.readInt32BE(i * 4)
  for (; i < 80; ++i) W[i] = rotl1(W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16])

  for (var j = 0; j < 80; ++j) {
    var s = ~~(j / 20)
    var t = (rotl5(a) + ft(s, b, c, d) + e + W[j] + K[s]) | 0

    e = d
    d = c
    c = rotl30(b)
    b = a
    a = t
  }

  this._a = (a + this._a) | 0
  this._b = (b + this._b) | 0
  this._c = (c + this._c) | 0
  this._d = (d + this._d) | 0
  this._e = (e + this._e) | 0
}

Sha1.prototype._hash = function () {
  var H = new Buffer(20)

  H.writeInt32BE(this._a | 0, 0)
  H.writeInt32BE(this._b | 0, 4)
  H.writeInt32BE(this._c | 0, 8)
  H.writeInt32BE(this._d | 0, 12)
  H.writeInt32BE(this._e | 0, 16)

  return H
}

module.exports = Sha1

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1).Buffer))

/***/ }),
/* 122 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(Buffer) {/**
 * A JavaScript implementation of the Secure Hash Algorithm, SHA-256, as defined
 * in FIPS 180-2
 * Version 2.2-beta Copyright Angel Marin, Paul Johnston 2000 - 2009.
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 *
 */

var inherits = __webpack_require__(3)
var Sha256 = __webpack_require__(46)
var Hash = __webpack_require__(13)

var W = new Array(64)

function Sha224 () {
  this.init()

  this._w = W // new Array(64)

  Hash.call(this, 64, 56)
}

inherits(Sha224, Sha256)

Sha224.prototype.init = function () {
  this._a = 0xc1059ed8
  this._b = 0x367cd507
  this._c = 0x3070dd17
  this._d = 0xf70e5939
  this._e = 0xffc00b31
  this._f = 0x68581511
  this._g = 0x64f98fa7
  this._h = 0xbefa4fa4

  return this
}

Sha224.prototype._hash = function () {
  var H = new Buffer(28)

  H.writeInt32BE(this._a, 0)
  H.writeInt32BE(this._b, 4)
  H.writeInt32BE(this._c, 8)
  H.writeInt32BE(this._d, 12)
  H.writeInt32BE(this._e, 16)
  H.writeInt32BE(this._f, 20)
  H.writeInt32BE(this._g, 24)

  return H
}

module.exports = Sha224

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1).Buffer))

/***/ }),
/* 123 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(Buffer) {var inherits = __webpack_require__(3)
var SHA512 = __webpack_require__(47)
var Hash = __webpack_require__(13)

var W = new Array(160)

function Sha384 () {
  this.init()
  this._w = W

  Hash.call(this, 128, 112)
}

inherits(Sha384, SHA512)

Sha384.prototype.init = function () {
  this._ah = 0xcbbb9d5d
  this._bh = 0x629a292a
  this._ch = 0x9159015a
  this._dh = 0x152fecd8
  this._eh = 0x67332667
  this._fh = 0x8eb44a87
  this._gh = 0xdb0c2e0d
  this._hh = 0x47b5481d

  this._al = 0xc1059ed8
  this._bl = 0x367cd507
  this._cl = 0x3070dd17
  this._dl = 0xf70e5939
  this._el = 0xffc00b31
  this._fl = 0x68581511
  this._gl = 0x64f98fa7
  this._hl = 0xbefa4fa4

  return this
}

Sha384.prototype._hash = function () {
  var H = new Buffer(48)

  function writeInt64BE (h, l, offset) {
    H.writeInt32BE(h, offset)
    H.writeInt32BE(l, offset + 4)
  }

  writeInt64BE(this._ah, this._al, 0)
  writeInt64BE(this._bh, this._bl, 8)
  writeInt64BE(this._ch, this._cl, 16)
  writeInt64BE(this._dh, this._dl, 24)
  writeInt64BE(this._eh, this._el, 32)
  writeInt64BE(this._fh, this._fl, 40)

  return H
}

module.exports = Sha384

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1).Buffer))

/***/ }),
/* 124 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(Buffer) {// constant-space merkle root calculation algorithm
module.exports = function fastRoot (values, digestFn) {
  if (!Array.isArray(values)) throw TypeError('Expected values Array')
  if (typeof digestFn !== 'function') throw TypeError('Expected digest Function')

  var length = values.length
  var results = values.concat()

  while (length > 1) {
    var j = 0

    for (var i = 0; i < length; i += 2, ++j) {
      var left = results[i]
      var right = i + 1 === length ? left : results[i + 1]
      var data = Buffer.concat([left, right])

      results[j] = digestFn(data)
    }

    length = j
  }

  return results[0]
}

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1).Buffer))

/***/ }),
/* 125 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(Buffer) {var NATIVE = __webpack_require__(23)
var ERRORS = __webpack_require__(48)

function _Buffer (value) {
  return Buffer.isBuffer(value)
}

function Hex (value) {
  return typeof value === 'string' && /^([0-9a-f]{2})+$/i.test(value)
}

function _LengthN (type, length) {
  var name = type.toJSON()

  function Length (value) {
    if (!type(value)) return false
    if (value.length === length) return true

    throw ERRORS.tfCustomError(name + '(Length: ' + length + ')', name + '(Length: ' + value.length + ')')
  }
  Length.toJSON = function () { return name }

  return Length
}

var _ArrayN = _LengthN.bind(null, NATIVE.Array)
var _BufferN = _LengthN.bind(null, _Buffer)
var _HexN = _LengthN.bind(null, Hex)

var UINT53_MAX = Math.pow(2, 53) - 1

function Finite (value) {
  return typeof value === 'number' && isFinite(value)
}
function Int8 (value) { return ((value << 24) >> 24) === value }
function Int16 (value) { return ((value << 16) >> 16) === value }
function Int32 (value) { return (value | 0) === value }
function UInt8 (value) { return (value & 0xff) === value }
function UInt16 (value) { return (value & 0xffff) === value }
function UInt32 (value) { return (value >>> 0) === value }
function UInt53 (value) {
  return typeof value === 'number' &&
    value >= 0 &&
    value <= UINT53_MAX &&
    Math.floor(value) === value
}

var types = {
  ArrayN: _ArrayN,
  Buffer: _Buffer,
  BufferN: _BufferN,
  Finite: Finite,
  Hex: Hex,
  HexN: _HexN,
  Int8: Int8,
  Int16: Int16,
  Int32: Int32,
  UInt8: UInt8,
  UInt16: UInt16,
  UInt32: UInt32,
  UInt53: UInt53
}

for (var typeName in types) {
  types[typeName].toJSON = function (t) {
    return t
  }.bind(null, typeName)
}

module.exports = types

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1).Buffer))

/***/ }),
/* 126 */
/***/ (function(module, exports, __webpack_require__) {

var OPS = __webpack_require__(6)

var map = {}
for (var op in OPS) {
  var code = OPS[op]
  map[code] = op
}

module.exports = map


/***/ }),
/* 127 */
/***/ (function(module, exports, __webpack_require__) {

var decompile = __webpack_require__(4).decompile
var multisig = __webpack_require__(128)
var nullData = __webpack_require__(131)
var pubKey = __webpack_require__(132)
var pubKeyHash = __webpack_require__(135)
var scriptHash = __webpack_require__(138)
var witnessPubKeyHash = __webpack_require__(140)
var witnessScriptHash = __webpack_require__(143)
var witnessCommitment = __webpack_require__(146)

var types = {
  MULTISIG: 'multisig',
  NONSTANDARD: 'nonstandard',
  NULLDATA: 'nulldata',
  P2PK: 'pubkey',
  P2PKH: 'pubkeyhash',
  P2SH: 'scripthash',
  P2WPKH: 'witnesspubkeyhash',
  P2WSH: 'witnessscripthash',
  WITNESS_COMMITMENT: 'witnesscommitment'
}

function classifyOutput (script) {
  if (witnessPubKeyHash.output.check(script)) return types.P2WPKH
  if (witnessScriptHash.output.check(script)) return types.P2WSH
  if (pubKeyHash.output.check(script)) return types.P2PKH
  if (scriptHash.output.check(script)) return types.P2SH

  // XXX: optimization, below functions .decompile before use
  var chunks = decompile(script)
  if (multisig.output.check(chunks)) return types.MULTISIG
  if (pubKey.output.check(chunks)) return types.P2PK
  if (witnessCommitment.output.check(chunks)) return types.WITNESS_COMMITMENT
  if (nullData.output.check(chunks)) return types.NULLDATA

  return types.NONSTANDARD
}

function classifyInput (script, allowIncomplete) {
  // XXX: optimization, below functions .decompile before use
  var chunks = decompile(script)

  if (pubKeyHash.input.check(chunks)) return types.P2PKH
  if (scriptHash.input.check(chunks, allowIncomplete)) return types.P2SH
  if (multisig.input.check(chunks, allowIncomplete)) return types.MULTISIG
  if (pubKey.input.check(chunks)) return types.P2PK

  return types.NONSTANDARD
}

function classifyWitness (script, allowIncomplete) {
  // XXX: optimization, below functions .decompile before use
  var chunks = decompile(script)

  if (witnessPubKeyHash.input.check(chunks)) return types.P2WPKH
  if (witnessScriptHash.input.check(chunks, allowIncomplete)) return types.P2WSH

  return types.NONSTANDARD
}

module.exports = {
  classifyInput: classifyInput,
  classifyOutput: classifyOutput,
  classifyWitness: classifyWitness,
  multisig: multisig,
  nullData: nullData,
  pubKey: pubKey,
  pubKeyHash: pubKeyHash,
  scriptHash: scriptHash,
  witnessPubKeyHash: witnessPubKeyHash,
  witnessScriptHash: witnessScriptHash,
  witnessCommitment: witnessCommitment,
  types: types
}


/***/ }),
/* 128 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = {
  input: __webpack_require__(129),
  output: __webpack_require__(130)
}


/***/ }),
/* 129 */
/***/ (function(module, exports, __webpack_require__) {

// OP_0 [signatures ...]

var Buffer = __webpack_require__(2).Buffer
var bscript = __webpack_require__(4)
var typeforce = __webpack_require__(0)
var OPS = __webpack_require__(6)

function partialSignature (value) {
  return value === OPS.OP_0 || bscript.isCanonicalSignature(value)
}

function check (script, allowIncomplete) {
  var chunks = bscript.decompile(script)
  if (chunks.length < 2) return false
  if (chunks[0] !== OPS.OP_0) return false

  if (allowIncomplete) {
    return chunks.slice(1).every(partialSignature)
  }

  return chunks.slice(1).every(bscript.isCanonicalSignature)
}
check.toJSON = function () { return 'multisig input' }

var EMPTY_BUFFER = Buffer.allocUnsafe(0)

function encodeStack (signatures, scriptPubKey) {
  typeforce([partialSignature], signatures)

  if (scriptPubKey) {
    var scriptData = bscript.multisig.output.decode(scriptPubKey)

    if (signatures.length < scriptData.m) {
      throw new TypeError('Not enough signatures provided')
    }

    if (signatures.length > scriptData.pubKeys.length) {
      throw new TypeError('Too many signatures provided')
    }
  }

  return [].concat(EMPTY_BUFFER, signatures.map(function (sig) {
    if (sig === OPS.OP_0) {
      return EMPTY_BUFFER
    }
    return sig
  }))
}

function encode (signatures, scriptPubKey) {
  return bscript.compile(encodeStack(signatures, scriptPubKey))
}

function decodeStack (stack, allowIncomplete) {
  typeforce(check, stack, allowIncomplete)
  return stack.slice(1)
}

function decode (buffer, allowIncomplete) {
  var stack = bscript.decompile(buffer)
  return decodeStack(stack, allowIncomplete)
}

module.exports = {
  check: check,
  decode: decode,
  decodeStack: decodeStack,
  encode: encode,
  encodeStack: encodeStack
}


/***/ }),
/* 130 */
/***/ (function(module, exports, __webpack_require__) {

// m [pubKeys ...] n OP_CHECKMULTISIG

var bscript = __webpack_require__(4)
var types = __webpack_require__(5)
var typeforce = __webpack_require__(0)
var OPS = __webpack_require__(6)
var OP_INT_BASE = OPS.OP_RESERVED // OP_1 - 1

function check (script, allowIncomplete) {
  var chunks = bscript.decompile(script)

  if (chunks.length < 4) return false
  if (chunks[chunks.length - 1] !== OPS.OP_CHECKMULTISIG) return false
  if (!types.Number(chunks[0])) return false
  if (!types.Number(chunks[chunks.length - 2])) return false
  var m = chunks[0] - OP_INT_BASE
  var n = chunks[chunks.length - 2] - OP_INT_BASE

  if (m <= 0) return false
  if (n > 16) return false
  if (m > n) return false
  if (n !== chunks.length - 3) return false
  if (allowIncomplete) return true

  var keys = chunks.slice(1, -2)
  return keys.every(bscript.isCanonicalPubKey)
}
check.toJSON = function () { return 'multi-sig output' }

function encode (m, pubKeys) {
  typeforce({
    m: types.Number,
    pubKeys: [bscript.isCanonicalPubKey]
  }, {
    m: m,
    pubKeys: pubKeys
  })

  var n = pubKeys.length
  if (n < m) throw new TypeError('Not enough pubKeys provided')

  return bscript.compile([].concat(
    OP_INT_BASE + m,
    pubKeys,
    OP_INT_BASE + n,
    OPS.OP_CHECKMULTISIG
  ))
}

function decode (buffer, allowIncomplete) {
  var chunks = bscript.decompile(buffer)
  typeforce(check, chunks, allowIncomplete)

  return {
    m: chunks[0] - OP_INT_BASE,
    pubKeys: chunks.slice(1, -2)
  }
}

module.exports = {
  check: check,
  decode: decode,
  encode: encode
}


/***/ }),
/* 131 */
/***/ (function(module, exports, __webpack_require__) {

// OP_RETURN {data}

var bscript = __webpack_require__(4)
var types = __webpack_require__(5)
var typeforce = __webpack_require__(0)
var OPS = __webpack_require__(6)

function check (script) {
  var buffer = bscript.compile(script)

  return buffer.length > 1 &&
    buffer[0] === OPS.OP_RETURN
}
check.toJSON = function () { return 'null data output' }

function encode (data) {
  typeforce(types.Buffer, data)

  return bscript.compile([OPS.OP_RETURN, data])
}

function decode (buffer) {
  typeforce(check, buffer)

  return buffer.slice(2)
}

module.exports = {
  output: {
    check: check,
    decode: decode,
    encode: encode
  }
}


/***/ }),
/* 132 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = {
  input: __webpack_require__(133),
  output: __webpack_require__(134)
}


/***/ }),
/* 133 */
/***/ (function(module, exports, __webpack_require__) {

// {signature}

var bscript = __webpack_require__(4)
var typeforce = __webpack_require__(0)

function check (script) {
  var chunks = bscript.decompile(script)

  return chunks.length === 1 &&
    bscript.isCanonicalSignature(chunks[0])
}
check.toJSON = function () { return 'pubKey input' }

function encodeStack (signature) {
  typeforce(bscript.isCanonicalSignature, signature)
  return [signature]
}

function encode (signature) {
  return bscript.compile(encodeStack(signature))
}

function decodeStack (stack) {
  typeforce(check, stack)
  return stack[0]
}

function decode (buffer) {
  var stack = bscript.decompile(buffer)
  return decodeStack(stack)
}

module.exports = {
  check: check,
  decode: decode,
  decodeStack: decodeStack,
  encode: encode,
  encodeStack: encodeStack
}


/***/ }),
/* 134 */
/***/ (function(module, exports, __webpack_require__) {

// {pubKey} OP_CHECKSIG

var bscript = __webpack_require__(4)
var typeforce = __webpack_require__(0)
var OPS = __webpack_require__(6)

function check (script) {
  var chunks = bscript.decompile(script)

  return chunks.length === 2 &&
    bscript.isCanonicalPubKey(chunks[0]) &&
    chunks[1] === OPS.OP_CHECKSIG
}
check.toJSON = function () { return 'pubKey output' }

function encode (pubKey) {
  typeforce(bscript.isCanonicalPubKey, pubKey)

  return bscript.compile([pubKey, OPS.OP_CHECKSIG])
}

function decode (buffer) {
  var chunks = bscript.decompile(buffer)
  typeforce(check, chunks)

  return chunks[0]
}

module.exports = {
  check: check,
  decode: decode,
  encode: encode
}


/***/ }),
/* 135 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = {
  input: __webpack_require__(136),
  output: __webpack_require__(137)
}


/***/ }),
/* 136 */
/***/ (function(module, exports, __webpack_require__) {

// {signature} {pubKey}

var bscript = __webpack_require__(4)
var typeforce = __webpack_require__(0)

function check (script) {
  var chunks = bscript.decompile(script)

  return chunks.length === 2 &&
    bscript.isCanonicalSignature(chunks[0]) &&
    bscript.isCanonicalPubKey(chunks[1])
}
check.toJSON = function () { return 'pubKeyHash input' }

function encodeStack (signature, pubKey) {
  typeforce({
    signature: bscript.isCanonicalSignature,
    pubKey: bscript.isCanonicalPubKey
  }, {
    signature: signature,
    pubKey: pubKey
  })

  return [signature, pubKey]
}

function encode (signature, pubKey) {
  return bscript.compile(encodeStack(signature, pubKey))
}

function decodeStack (stack) {
  typeforce(check, stack)

  return {
    signature: stack[0],
    pubKey: stack[1]
  }
}

function decode (buffer) {
  var stack = bscript.decompile(buffer)
  return decodeStack(stack)
}

module.exports = {
  check: check,
  decode: decode,
  decodeStack: decodeStack,
  encode: encode,
  encodeStack: encodeStack
}


/***/ }),
/* 137 */
/***/ (function(module, exports, __webpack_require__) {

// OP_DUP OP_HASH160 {pubKeyHash} OP_EQUALVERIFY OP_CHECKSIG

var bscript = __webpack_require__(4)
var types = __webpack_require__(5)
var typeforce = __webpack_require__(0)
var OPS = __webpack_require__(6)

function check (script) {
  var buffer = bscript.compile(script)

  return buffer.length === 25 &&
    buffer[0] === OPS.OP_DUP &&
    buffer[1] === OPS.OP_HASH160 &&
    buffer[2] === 0x14 &&
    buffer[23] === OPS.OP_EQUALVERIFY &&
    buffer[24] === OPS.OP_CHECKSIG
}
check.toJSON = function () { return 'pubKeyHash output' }

function encode (pubKeyHash) {
  typeforce(types.Hash160bit, pubKeyHash)

  return bscript.compile([
    OPS.OP_DUP,
    OPS.OP_HASH160,
    pubKeyHash,
    OPS.OP_EQUALVERIFY,
    OPS.OP_CHECKSIG
  ])
}

function decode (buffer) {
  typeforce(check, buffer)

  return buffer.slice(3, 23)
}

module.exports = {
  check: check,
  decode: decode,
  encode: encode
}


/***/ }),
/* 138 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = {
  input: __webpack_require__(52),
  output: __webpack_require__(139)
}


/***/ }),
/* 139 */
/***/ (function(module, exports, __webpack_require__) {

// OP_HASH160 {scriptHash} OP_EQUAL

var bscript = __webpack_require__(4)
var types = __webpack_require__(5)
var typeforce = __webpack_require__(0)
var OPS = __webpack_require__(6)

function check (script) {
  var buffer = bscript.compile(script)

  return buffer.length === 23 &&
    buffer[0] === OPS.OP_HASH160 &&
    buffer[1] === 0x14 &&
    buffer[22] === OPS.OP_EQUAL
}
check.toJSON = function () { return 'scriptHash output' }

function encode (scriptHash) {
  typeforce(types.Hash160bit, scriptHash)

  return bscript.compile([OPS.OP_HASH160, scriptHash, OPS.OP_EQUAL])
}

function decode (buffer) {
  typeforce(check, buffer)

  return buffer.slice(2, 22)
}

module.exports = {
  check: check,
  decode: decode,
  encode: encode
}


/***/ }),
/* 140 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = {
  input: __webpack_require__(141),
  output: __webpack_require__(142)
}


/***/ }),
/* 141 */
/***/ (function(module, exports, __webpack_require__) {

// {signature} {pubKey}

var bscript = __webpack_require__(4)
var typeforce = __webpack_require__(0)

function isCompressedCanonicalPubKey (pubKey) {
  return bscript.isCanonicalPubKey(pubKey) && pubKey.length === 33
}

function check (script) {
  var chunks = bscript.decompile(script)

  return chunks.length === 2 &&
    bscript.isCanonicalSignature(chunks[0]) &&
    isCompressedCanonicalPubKey(chunks[1])
}
check.toJSON = function () { return 'witnessPubKeyHash input' }

function encodeStack (signature, pubKey) {
  typeforce({
    signature: bscript.isCanonicalSignature,
    pubKey: isCompressedCanonicalPubKey
  }, {
    signature: signature,
    pubKey: pubKey
  })

  return [signature, pubKey]
}

function decodeStack (stack) {
  typeforce(check, stack)

  return {
    signature: stack[0],
    pubKey: stack[1]
  }
}

module.exports = {
  check: check,
  decodeStack: decodeStack,
  encodeStack: encodeStack
}


/***/ }),
/* 142 */
/***/ (function(module, exports, __webpack_require__) {

// OP_0 {pubKeyHash}

var bscript = __webpack_require__(4)
var types = __webpack_require__(5)
var typeforce = __webpack_require__(0)
var OPS = __webpack_require__(6)

function check (script) {
  var buffer = bscript.compile(script)

  return buffer.length === 22 &&
    buffer[0] === OPS.OP_0 &&
    buffer[1] === 0x14
}
check.toJSON = function () { return 'Witness pubKeyHash output' }

function encode (pubKeyHash) {
  typeforce(types.Hash160bit, pubKeyHash)

  return bscript.compile([OPS.OP_0, pubKeyHash])
}

function decode (buffer) {
  typeforce(check, buffer)

  return buffer.slice(2)
}

module.exports = {
  check: check,
  decode: decode,
  encode: encode
}


/***/ }),
/* 143 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = {
  input: __webpack_require__(144),
  output: __webpack_require__(145)
}


/***/ }),
/* 144 */
/***/ (function(module, exports, __webpack_require__) {

// {signature} {pubKey}

var p2sh = __webpack_require__(52)

module.exports = {
  check: p2sh.check,
  decodeStack: p2sh.decodeStack,
  encodeStack: p2sh.encodeStack
}


/***/ }),
/* 145 */
/***/ (function(module, exports, __webpack_require__) {

// OP_0 {scriptHash}

var bscript = __webpack_require__(4)
var types = __webpack_require__(5)
var typeforce = __webpack_require__(0)
var OPS = __webpack_require__(6)

function check (script) {
  var buffer = bscript.compile(script)

  return buffer.length === 34 &&
    buffer[0] === OPS.OP_0 &&
    buffer[1] === 0x20
}
check.toJSON = function () { return 'Witness scriptHash output' }

function encode (scriptHash) {
  typeforce(types.Hash256bit, scriptHash)

  return bscript.compile([OPS.OP_0, scriptHash])
}

function decode (buffer) {
  typeforce(check, buffer)

  return buffer.slice(2)
}

module.exports = {
  check: check,
  decode: decode,
  encode: encode
}


/***/ }),
/* 146 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = {
  output: __webpack_require__(147)
}


/***/ }),
/* 147 */
/***/ (function(module, exports, __webpack_require__) {

// OP_RETURN {aa21a9ed} {commitment}

var Buffer = __webpack_require__(2).Buffer
var bscript = __webpack_require__(4)
var types = __webpack_require__(5)
var typeforce = __webpack_require__(0)
var OPS = __webpack_require__(6)

var HEADER = Buffer.from('aa21a9ed', 'hex')

function check (script) {
  var buffer = bscript.compile(script)

  return buffer.length > 37 &&
    buffer[0] === OPS.OP_RETURN &&
    buffer[1] === 0x24 &&
    buffer.slice(2, 6).equals(HEADER)
}

check.toJSON = function () { return 'Witness commitment output' }

function encode (commitment) {
  typeforce(types.Hash256bit, commitment)

  var buffer = Buffer.allocUnsafe(36)
  HEADER.copy(buffer, 0)
  commitment.copy(buffer, 4)

  return bscript.compile([OPS.OP_RETURN, buffer])
}

function decode (buffer) {
  typeforce(check, buffer)

  return bscript.decompile(buffer)[1].slice(4, 36)
}

module.exports = {
  check: check,
  decode: decode,
  encode: encode
}


/***/ }),
/* 148 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

let ALPHABET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l'

// pre-compute lookup table
let ALPHABET_MAP = {}
for (let z = 0; z < ALPHABET.length; z++) {
  let x = ALPHABET.charAt(z)

  if (ALPHABET_MAP[x] !== undefined) throw new TypeError(x + ' is ambiguous')
  ALPHABET_MAP[x] = z
}

function polymodStep (pre) {
  let b = pre >> 25
  return ((pre & 0x1FFFFFF) << 5) ^
    (-((b >> 0) & 1) & 0x3b6a57b2) ^
    (-((b >> 1) & 1) & 0x26508e6d) ^
    (-((b >> 2) & 1) & 0x1ea119fa) ^
    (-((b >> 3) & 1) & 0x3d4233dd) ^
    (-((b >> 4) & 1) & 0x2a1462b3)
}

function prefixChk (prefix) {
  let chk = 1
  for (let i = 0; i < prefix.length; ++i) {
    let c = prefix.charCodeAt(i)
    if (c < 33 || c > 126) throw new Error('Invalid prefix (' + prefix + ')')

    chk = polymodStep(chk) ^ (c >> 5)
  }
  chk = polymodStep(chk)

  for (let i = 0; i < prefix.length; ++i) {
    let v = prefix.charCodeAt(i)
    chk = polymodStep(chk) ^ (v & 0x1f)
  }
  return chk
}

function encode (prefix, words) {
  // too long?
  if ((prefix.length + 7 + words.length) > 90) throw new TypeError('Exceeds Bech32 maximum length')
  prefix = prefix.toLowerCase()

  // determine chk mod
  let chk = prefixChk(prefix)
  let result = prefix + '1'
  for (let i = 0; i < words.length; ++i) {
    let x = words[i]
    if ((x >> 5) !== 0) throw new Error('Non 5-bit word')

    chk = polymodStep(chk) ^ x
    result += ALPHABET.charAt(x)
  }

  for (let i = 0; i < 6; ++i) {
    chk = polymodStep(chk)
  }
  chk ^= 1

  for (let i = 0; i < 6; ++i) {
    let v = (chk >> ((5 - i) * 5)) & 0x1f
    result += ALPHABET.charAt(v)
  }

  return result
}

function decode (str) {
  if (str.length < 8) throw new TypeError(str + ' too short')
  if (str.length > 90) throw new TypeError(str + ' too long')

  // don't allow mixed case
  let lowered = str.toLowerCase()
  let uppered = str.toUpperCase()
  if (str !== lowered && str !== uppered) throw new Error('Mixed-case string ' + str)
  str = lowered

  let split = str.lastIndexOf('1')
  if (split === 0) throw new Error('Missing prefix for ' + str)

  let prefix = str.slice(0, split)
  let wordChars = str.slice(split + 1)
  if (wordChars.length < 6) throw new Error('Data too short')

  let chk = prefixChk(prefix)
  let words = []
  for (let i = 0; i < wordChars.length; ++i) {
    let c = wordChars.charAt(i)
    let v = ALPHABET_MAP[c]
    if (v === undefined) throw new Error('Unknown character ' + c)
    chk = polymodStep(chk) ^ v

    // not in the checksum?
    if (i + 6 >= wordChars.length) continue
    words.push(v)
  }

  if (chk !== 1) throw new Error('Invalid checksum for ' + str)
  return { prefix, words }
}

function convert (data, inBits, outBits, pad) {
  let value = 0
  let bits = 0
  let maxV = (1 << outBits) - 1

  let result = []
  for (let i = 0; i < data.length; ++i) {
    value = (value << inBits) | data[i]
    bits += inBits

    while (bits >= outBits) {
      bits -= outBits
      result.push((value >> bits) & maxV)
    }
  }

  if (pad) {
    if (bits > 0) {
      result.push((value << (outBits - bits)) & maxV)
    }
  } else {
    if (bits >= inBits) throw new Error('Excess padding')
    if ((value << (outBits - bits)) & maxV) throw new Error('Non-zero padding')
  }

  return result
}

function toWords (bytes) {
  return convert(bytes, 8, 5, true)
}

function fromWords (words) {
  return convert(words, 5, 8, false)
}

module.exports = { decode, encode, toWords, fromWords }


/***/ }),
/* 149 */
/***/ (function(module, exports, __webpack_require__) {

var basex = __webpack_require__(150)
var ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'

module.exports = basex(ALPHABET)


/***/ }),
/* 150 */
/***/ (function(module, exports, __webpack_require__) {

// base-x encoding
// Forked from https://github.com/cryptocoinjs/bs58
// Originally written by Mike Hearn for BitcoinJ
// Copyright (c) 2011 Google Inc
// Ported to JavaScript by Stefan Thomas
// Merged Buffer refactorings from base58-native by Stephen Pair
// Copyright (c) 2013 BitPay Inc

var Buffer = __webpack_require__(2).Buffer

module.exports = function base (ALPHABET) {
  var ALPHABET_MAP = {}
  var BASE = ALPHABET.length
  var LEADER = ALPHABET.charAt(0)

  // pre-compute lookup table
  for (var z = 0; z < ALPHABET.length; z++) {
    var x = ALPHABET.charAt(z)

    if (ALPHABET_MAP[x] !== undefined) throw new TypeError(x + ' is ambiguous')
    ALPHABET_MAP[x] = z
  }

  function encode (source) {
    if (source.length === 0) return ''

    var digits = [0]
    for (var i = 0; i < source.length; ++i) {
      for (var j = 0, carry = source[i]; j < digits.length; ++j) {
        carry += digits[j] << 8
        digits[j] = carry % BASE
        carry = (carry / BASE) | 0
      }

      while (carry > 0) {
        digits.push(carry % BASE)
        carry = (carry / BASE) | 0
      }
    }

    var string = ''

    // deal with leading zeros
    for (var k = 0; source[k] === 0 && k < source.length - 1; ++k) string += ALPHABET[0]
    // convert digits to a string
    for (var q = digits.length - 1; q >= 0; --q) string += ALPHABET[digits[q]]

    return string
  }

  function decodeUnsafe (string) {
    if (string.length === 0) return Buffer.allocUnsafe(0)

    var bytes = [0]
    for (var i = 0; i < string.length; i++) {
      var value = ALPHABET_MAP[string[i]]
      if (value === undefined) return

      for (var j = 0, carry = value; j < bytes.length; ++j) {
        carry += bytes[j] * BASE
        bytes[j] = carry & 0xff
        carry >>= 8
      }

      while (carry > 0) {
        bytes.push(carry & 0xff)
        carry >>= 8
      }
    }

    // deal with leading zeros
    for (var k = 0; string[k] === LEADER && k < string.length - 1; ++k) {
      bytes.push(0)
    }

    return Buffer.from(bytes.reverse())
  }

  function decode (string) {
    var buffer = decodeUnsafe(string)
    if (buffer) return buffer

    throw new Error('Non-base' + BASE + ' character')
  }

  return {
    encode: encode,
    decodeUnsafe: decodeUnsafe,
    decode: decode
  }
}


/***/ }),
/* 151 */
/***/ (function(module, exports, __webpack_require__) {

var Buffer = __webpack_require__(2).Buffer
var createHmac = __webpack_require__(54)
var typeforce = __webpack_require__(0)
var types = __webpack_require__(5)

var BigInteger = __webpack_require__(9)
var ECSignature = __webpack_require__(30)

var ZERO = Buffer.alloc(1, 0)
var ONE = Buffer.alloc(1, 1)

var ecurve = __webpack_require__(31)
var secp256k1 = ecurve.getCurveByName('secp256k1')

// https://tools.ietf.org/html/rfc6979#section-3.2
function deterministicGenerateK (hash, x, checkSig) {
  typeforce(types.tuple(
    types.Hash256bit,
    types.Buffer256bit,
    types.Function
  ), arguments)

  // Step A, ignored as hash already provided
  // Step B
  // Step C
  var k = Buffer.alloc(32, 0)
  var v = Buffer.alloc(32, 1)

  // Step D
  k = createHmac('sha256', k)
    .update(v)
    .update(ZERO)
    .update(x)
    .update(hash)
    .digest()

  // Step E
  v = createHmac('sha256', k).update(v).digest()

  // Step F
  k = createHmac('sha256', k)
    .update(v)
    .update(ONE)
    .update(x)
    .update(hash)
    .digest()

  // Step G
  v = createHmac('sha256', k).update(v).digest()

  // Step H1/H2a, ignored as tlen === qlen (256 bit)
  // Step H2b
  v = createHmac('sha256', k).update(v).digest()

  var T = BigInteger.fromBuffer(v)

  // Step H3, repeat until T is within the interval [1, n - 1] and is suitable for ECDSA
  while (T.signum() <= 0 || T.compareTo(secp256k1.n) >= 0 || !checkSig(T)) {
    k = createHmac('sha256', k)
      .update(v)
      .update(ZERO)
      .digest()

    v = createHmac('sha256', k).update(v).digest()

    // Step H1/H2a, again, ignored as tlen === qlen (256 bit)
    // Step H2b again
    v = createHmac('sha256', k).update(v).digest()
    T = BigInteger.fromBuffer(v)
  }

  return T
}

var N_OVER_TWO = secp256k1.n.shiftRight(1)

function sign (hash, d) {
  typeforce(types.tuple(types.Hash256bit, types.BigInt), arguments)

  var x = d.toBuffer(32)
  var e = BigInteger.fromBuffer(hash)
  var n = secp256k1.n
  var G = secp256k1.G

  var r, s
  deterministicGenerateK(hash, x, function (k) {
    var Q = G.multiply(k)

    if (secp256k1.isInfinity(Q)) return false

    r = Q.affineX.mod(n)
    if (r.signum() === 0) return false

    s = k.modInverse(n).multiply(e.add(d.multiply(r))).mod(n)
    if (s.signum() === 0) return false

    return true
  })

  // enforce low S values, see bip62: 'low s values in signatures'
  if (s.compareTo(N_OVER_TWO) > 0) {
    s = n.subtract(s)
  }

  return new ECSignature(r, s)
}

function verify (hash, signature, Q) {
  typeforce(types.tuple(
    types.Hash256bit,
    types.ECSignature,
    types.ECPoint
  ), arguments)

  var n = secp256k1.n
  var G = secp256k1.G

  var r = signature.r
  var s = signature.s

  // 1.4.1 Enforce r and s are both integers in the interval [1, n − 1]
  if (r.signum() <= 0 || r.compareTo(n) >= 0) return false
  if (s.signum() <= 0 || s.compareTo(n) >= 0) return false

  // 1.4.2 H = Hash(M), already done by the user
  // 1.4.3 e = H
  var e = BigInteger.fromBuffer(hash)

  // Compute s^-1
  var sInv = s.modInverse(n)

  // 1.4.4 Compute u1 = es^−1 mod n
  //               u2 = rs^−1 mod n
  var u1 = e.multiply(sInv).mod(n)
  var u2 = r.multiply(sInv).mod(n)

  // 1.4.5 Compute R = (xR, yR)
  //               R = u1G + u2Q
  var R = G.multiplyTwo(u1, Q, u2)

  // 1.4.5 (cont.) Enforce R is not at infinity
  if (secp256k1.isInfinity(R)) return false

  // 1.4.6 Convert the field element R.x to an integer
  var xR = R.affineX

  // 1.4.7 Set v = xR mod n
  var v = xR.mod(n)

  // 1.4.8 If v = r, output "valid", and if v != r, output "invalid"
  return v.equals(r)
}

module.exports = {
  deterministicGenerateK: deterministicGenerateK,
  sign: sign,
  verify: verify,

  // TODO: remove
  __curve: secp256k1
}


/***/ }),
/* 152 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var inherits = __webpack_require__(3)
var Buffer = __webpack_require__(2).Buffer

var Base = __webpack_require__(22)

var ZEROS = Buffer.alloc(128)
var blocksize = 64

function Hmac (alg, key) {
  Base.call(this, 'digest')
  if (typeof key === 'string') {
    key = Buffer.from(key)
  }

  this._alg = alg
  this._key = key

  if (key.length > blocksize) {
    key = alg(key)
  } else if (key.length < blocksize) {
    key = Buffer.concat([key, ZEROS], blocksize)
  }

  var ipad = this._ipad = Buffer.allocUnsafe(blocksize)
  var opad = this._opad = Buffer.allocUnsafe(blocksize)

  for (var i = 0; i < blocksize; i++) {
    ipad[i] = key[i] ^ 0x36
    opad[i] = key[i] ^ 0x5C
  }

  this._hash = [ipad]
}

inherits(Hmac, Base)

Hmac.prototype._update = function (data) {
  this._hash.push(data)
}

Hmac.prototype._final = function () {
  var h = this._alg(Buffer.concat(this._hash))
  return this._alg(Buffer.concat([this._opad, h]))
}
module.exports = Hmac


/***/ }),
/* 153 */
/***/ (function(module, exports) {

module.exports = {"_args":[[{"raw":"bigi@^1.4.0","scope":null,"escapedName":"bigi","name":"bigi","rawSpec":"^1.4.0","spec":">=1.4.0 <2.0.0","type":"range"},"/Users/yjsnpi/codes/monya/node_modules/bitcoinjs-lib"]],"_from":"bigi@>=1.4.0 <2.0.0","_id":"bigi@1.4.2","_inCache":true,"_location":"/bigi","_nodeVersion":"6.1.0","_npmOperationalInternal":{"host":"packages-12-west.internal.npmjs.com","tmp":"tmp/bigi-1.4.2.tgz_1469584192413_0.6801238611806184"},"_npmUser":{"name":"jprichardson","email":"jprichardson@gmail.com"},"_npmVersion":"3.8.6","_phantomChildren":{},"_requested":{"raw":"bigi@^1.4.0","scope":null,"escapedName":"bigi","name":"bigi","rawSpec":"^1.4.0","spec":">=1.4.0 <2.0.0","type":"range"},"_requiredBy":["/bitcoinjs-lib","/ecurve"],"_resolved":"https://registry.npmjs.org/bigi/-/bigi-1.4.2.tgz","_shasum":"9c665a95f88b8b08fc05cfd731f561859d725825","_shrinkwrap":null,"_spec":"bigi@^1.4.0","_where":"/Users/yjsnpi/codes/monya/node_modules/bitcoinjs-lib","bugs":{"url":"https://github.com/cryptocoinjs/bigi/issues"},"dependencies":{},"description":"Big integers.","devDependencies":{"coveralls":"^2.11.2","istanbul":"^0.3.5","jshint":"^2.5.1","mocha":"^2.1.0","mochify":"^2.1.0"},"directories":{},"dist":{"shasum":"9c665a95f88b8b08fc05cfd731f561859d725825","tarball":"https://registry.npmjs.org/bigi/-/bigi-1.4.2.tgz"},"gitHead":"c25308081c896ff84702303722bf5ecd8b3f78e3","homepage":"https://github.com/cryptocoinjs/bigi#readme","keywords":["cryptography","math","bitcoin","arbitrary","precision","arithmetic","big","integer","int","number","biginteger","bigint","bignumber","decimal","float"],"main":"./lib/index.js","maintainers":[{"name":"midnightlightning","email":"boydb@midnightdesign.ws"},{"name":"sidazhang","email":"sidazhang89@gmail.com"},{"name":"nadav","email":"npm@shesek.info"},{"name":"jprichardson","email":"jprichardson@gmail.com"}],"name":"bigi","optionalDependencies":{},"readme":"ERROR: No README data found!","repository":{"url":"git+https://github.com/cryptocoinjs/bigi.git","type":"git"},"scripts":{"browser-test":"mochify --wd -R spec","coverage":"istanbul cover ./node_modules/.bin/_mocha -- --reporter list test/*.js","coveralls":"npm run-script coverage && node ./node_modules/.bin/coveralls < coverage/lcov.info","jshint":"jshint --config jshint.json lib/*.js ; true","test":"_mocha -- test/*.js","unit":"mocha"},"testling":{"files":"test/*.js","harness":"mocha","browsers":["ie/9..latest","firefox/latest","chrome/latest","safari/6.0..latest","iphone/6.0..latest","android-browser/4.2..latest"]},"version":"1.4.2"}

/***/ }),
/* 154 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(Buffer) {// FIXME: Kind of a weird way to throw exceptions, consider removing
var assert = __webpack_require__(29)
var BigInteger = __webpack_require__(55)

/**
 * Turns a byte array into a big integer.
 *
 * This function will interpret a byte array as a big integer in big
 * endian notation.
 */
BigInteger.fromByteArrayUnsigned = function(byteArray) {
  // BigInteger expects a DER integer conformant byte array
  if (byteArray[0] & 0x80) {
    return new BigInteger([0].concat(byteArray))
  }

  return new BigInteger(byteArray)
}

/**
 * Returns a byte array representation of the big integer.
 *
 * This returns the absolute of the contained value in big endian
 * form. A value of zero results in an empty array.
 */
BigInteger.prototype.toByteArrayUnsigned = function() {
  var byteArray = this.toByteArray()
  return byteArray[0] === 0 ? byteArray.slice(1) : byteArray
}

BigInteger.fromDERInteger = function(byteArray) {
  return new BigInteger(byteArray)
}

/*
 * Converts BigInteger to a DER integer representation.
 *
 * The format for this value uses the most significant bit as a sign
 * bit.  If the most significant bit is already set and the integer is
 * positive, a 0x00 is prepended.
 *
 * Examples:
 *
 *      0 =>     0x00
 *      1 =>     0x01
 *     -1 =>     0xff
 *    127 =>     0x7f
 *   -127 =>     0x81
 *    128 =>   0x0080
 *   -128 =>     0x80
 *    255 =>   0x00ff
 *   -255 =>   0xff01
 *  16300 =>   0x3fac
 * -16300 =>   0xc054
 *  62300 => 0x00f35c
 * -62300 => 0xff0ca4
*/
BigInteger.prototype.toDERInteger = BigInteger.prototype.toByteArray

BigInteger.fromBuffer = function(buffer) {
  // BigInteger expects a DER integer conformant byte array
  if (buffer[0] & 0x80) {
    var byteArray = Array.prototype.slice.call(buffer)

    return new BigInteger([0].concat(byteArray))
  }

  return new BigInteger(buffer)
}

BigInteger.fromHex = function(hex) {
  if (hex === '') return BigInteger.ZERO

  assert.equal(hex, hex.match(/^[A-Fa-f0-9]+/), 'Invalid hex string')
  assert.equal(hex.length % 2, 0, 'Incomplete hex')
  return new BigInteger(hex, 16)
}

BigInteger.prototype.toBuffer = function(size) {
  var byteArray = this.toByteArrayUnsigned()
  var zeros = []

  var padding = size - byteArray.length
  while (zeros.length < padding) zeros.push(0)

  return new Buffer(zeros.concat(byteArray))
}

BigInteger.prototype.toHex = function(size) {
  return this.toBuffer(size).toString('hex')
}

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1).Buffer))

/***/ }),
/* 155 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global, process) {// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = __webpack_require__(156);

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = __webpack_require__(157);

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(7), __webpack_require__(12)))

/***/ }),
/* 156 */
/***/ (function(module, exports) {

module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}

/***/ }),
/* 157 */
/***/ (function(module, exports) {

if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}


/***/ }),
/* 158 */
/***/ (function(module, exports, __webpack_require__) {

var BigInteger = __webpack_require__(9)

var curves = __webpack_require__(159)
var Curve = __webpack_require__(57)

function getCurveByName (name) {
  var curve = curves[name]
  if (!curve) return null

  var p = new BigInteger(curve.p, 16)
  var a = new BigInteger(curve.a, 16)
  var b = new BigInteger(curve.b, 16)
  var n = new BigInteger(curve.n, 16)
  var h = new BigInteger(curve.h, 16)
  var Gx = new BigInteger(curve.Gx, 16)
  var Gy = new BigInteger(curve.Gy, 16)

  return new Curve(p, a, b, Gx, Gy, n, h)
}

module.exports = getCurveByName


/***/ }),
/* 159 */
/***/ (function(module, exports) {

module.exports = {"secp128r1":{"p":"fffffffdffffffffffffffffffffffff","a":"fffffffdfffffffffffffffffffffffc","b":"e87579c11079f43dd824993c2cee5ed3","n":"fffffffe0000000075a30d1b9038a115","h":"01","Gx":"161ff7528b899b2d0c28607ca52c5b86","Gy":"cf5ac8395bafeb13c02da292dded7a83"},"secp160k1":{"p":"fffffffffffffffffffffffffffffffeffffac73","a":"00","b":"07","n":"0100000000000000000001b8fa16dfab9aca16b6b3","h":"01","Gx":"3b4c382ce37aa192a4019e763036f4f5dd4d7ebb","Gy":"938cf935318fdced6bc28286531733c3f03c4fee"},"secp160r1":{"p":"ffffffffffffffffffffffffffffffff7fffffff","a":"ffffffffffffffffffffffffffffffff7ffffffc","b":"1c97befc54bd7a8b65acf89f81d4d4adc565fa45","n":"0100000000000000000001f4c8f927aed3ca752257","h":"01","Gx":"4a96b5688ef573284664698968c38bb913cbfc82","Gy":"23a628553168947d59dcc912042351377ac5fb32"},"secp192k1":{"p":"fffffffffffffffffffffffffffffffffffffffeffffee37","a":"00","b":"03","n":"fffffffffffffffffffffffe26f2fc170f69466a74defd8d","h":"01","Gx":"db4ff10ec057e9ae26b07d0280b7f4341da5d1b1eae06c7d","Gy":"9b2f2f6d9c5628a7844163d015be86344082aa88d95e2f9d"},"secp192r1":{"p":"fffffffffffffffffffffffffffffffeffffffffffffffff","a":"fffffffffffffffffffffffffffffffefffffffffffffffc","b":"64210519e59c80e70fa7e9ab72243049feb8deecc146b9b1","n":"ffffffffffffffffffffffff99def836146bc9b1b4d22831","h":"01","Gx":"188da80eb03090f67cbf20eb43a18800f4ff0afd82ff1012","Gy":"07192b95ffc8da78631011ed6b24cdd573f977a11e794811"},"secp256k1":{"p":"fffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f","a":"00","b":"07","n":"fffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141","h":"01","Gx":"79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798","Gy":"483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8"},"secp256r1":{"p":"ffffffff00000001000000000000000000000000ffffffffffffffffffffffff","a":"ffffffff00000001000000000000000000000000fffffffffffffffffffffffc","b":"5ac635d8aa3a93e7b3ebbd55769886bc651d06b0cc53b0f63bce3c3e27d2604b","n":"ffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551","h":"01","Gx":"6b17d1f2e12c4247f8bce6e563a440f277037d812deb33a0f4a13945d898c296","Gy":"4fe342e2fe1a7f9b8ee7eb4a7c0f9e162bce33576b315ececbb6406837bf51f5"}}

/***/ }),
/* 160 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(global, process) {

function oldBrowser () {
  throw new Error('secure random number generation not supported by this browser\nuse chrome, FireFox or Internet Explorer 11')
}

var Buffer = __webpack_require__(2).Buffer
var crypto = global.crypto || global.msCrypto

if (crypto && crypto.getRandomValues) {
  module.exports = randomBytes
} else {
  module.exports = oldBrowser
}

function randomBytes (size, cb) {
  // phantomjs needs to throw
  if (size > 65536) throw new Error('requested too many random bytes')
  // in case browserify  isn't using the Uint8Array version
  var rawBytes = new global.Uint8Array(size)

  // This will not work in older browsers.
  // See https://developer.mozilla.org/en-US/docs/Web/API/window.crypto.getRandomValues
  if (size > 0) {  // getRandomValues fails on IE if size == 0
    crypto.getRandomValues(rawBytes)
  }

  // XXX: phantomjs doesn't like a buffer being passed here
  var bytes = Buffer.from(rawBytes.buffer)

  if (typeof cb === 'function') {
    return process.nextTick(function () {
      cb(null, bytes)
    })
  }

  return bytes
}

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(7), __webpack_require__(12)))

/***/ }),
/* 161 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(Buffer) {var bs58check = __webpack_require__(28)

function decodeRaw (buffer, version) {
  // check version only if defined
  if (version !== undefined && buffer[0] !== version) throw new Error('Invalid network version')

  // uncompressed
  if (buffer.length === 33) {
    return {
      version: buffer[0],
      privateKey: buffer.slice(1, 33),
      compressed: false
    }
  }

  // invalid length
  if (buffer.length !== 34) throw new Error('Invalid WIF length')

  // invalid compression flag
  if (buffer[33] !== 0x01) throw new Error('Invalid compression flag')

  return {
    version: buffer[0],
    privateKey: buffer.slice(1, 33),
    compressed: true
  }
}

function encodeRaw (version, privateKey, compressed) {
  var result = new Buffer(compressed ? 34 : 33)

  result.writeUInt8(version, 0)
  privateKey.copy(result, 1)

  if (compressed) {
    result[33] = 0x01
  }

  return result
}

function decode (string, version) {
  return decodeRaw(bs58check.decode(string), version)
}

function encode (version, privateKey, compressed) {
  if (typeof version === 'number') return bs58check.encode(encodeRaw(version, privateKey, compressed))

  return bs58check.encode(
    encodeRaw(
      version.version,
      version.privateKey,
      version.compressed
    )
  )
}

module.exports = {
  decode: decode,
  decodeRaw: decodeRaw,
  encode: encode,
  encodeRaw: encodeRaw
}

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1).Buffer))

/***/ }),
/* 162 */
/***/ (function(module, exports, __webpack_require__) {

var Buffer = __webpack_require__(2).Buffer
var base58check = __webpack_require__(28)
var bcrypto = __webpack_require__(11)
var createHmac = __webpack_require__(54)
var typeforce = __webpack_require__(0)
var types = __webpack_require__(5)
var NETWORKS = __webpack_require__(15)

var BigInteger = __webpack_require__(9)
var ECPair = __webpack_require__(26)

var ecurve = __webpack_require__(31)
var curve = ecurve.getCurveByName('secp256k1')

function HDNode (keyPair, chainCode) {
  typeforce(types.tuple('ECPair', types.Buffer256bit), arguments)

  if (!keyPair.compressed) throw new TypeError('BIP32 only allows compressed keyPairs')

  this.keyPair = keyPair
  this.chainCode = chainCode
  this.depth = 0
  this.index = 0
  this.parentFingerprint = 0x00000000
}

HDNode.HIGHEST_BIT = 0x80000000
HDNode.LENGTH = 78
HDNode.MASTER_SECRET = Buffer.from('Bitcoin seed', 'utf8')

HDNode.fromSeedBuffer = function (seed, network) {
  typeforce(types.tuple(types.Buffer, types.maybe(types.Network)), arguments)

  if (seed.length < 16) throw new TypeError('Seed should be at least 128 bits')
  if (seed.length > 64) throw new TypeError('Seed should be at most 512 bits')

  var I = createHmac('sha512', HDNode.MASTER_SECRET).update(seed).digest()
  var IL = I.slice(0, 32)
  var IR = I.slice(32)

  // In case IL is 0 or >= n, the master key is invalid
  // This is handled by the ECPair constructor
  var pIL = BigInteger.fromBuffer(IL)
  var keyPair = new ECPair(pIL, null, {
    network: network
  })

  return new HDNode(keyPair, IR)
}

HDNode.fromSeedHex = function (hex, network) {
  return HDNode.fromSeedBuffer(Buffer.from(hex, 'hex'), network)
}

HDNode.fromBase58 = function (string, networks) {
  var buffer = base58check.decode(string)
  if (buffer.length !== 78) throw new Error('Invalid buffer length')

  // 4 bytes: version bytes
  var version = buffer.readUInt32BE(0)
  var network

  // list of networks?
  if (Array.isArray(networks)) {
    network = networks.filter(function (x) {
      return version === x.bip32.private ||
             version === x.bip32.public
    }).pop()

    if (!network) throw new Error('Unknown network version')

  // otherwise, assume a network object (or default to bitcoin)
  } else {
    network = networks || NETWORKS.bitcoin
  }

  if (version !== network.bip32.private &&
    version !== network.bip32.public) throw new Error('Invalid network version')

  // 1 byte: depth: 0x00 for master nodes, 0x01 for level-1 descendants, ...
  var depth = buffer[4]

  // 4 bytes: the fingerprint of the parent's key (0x00000000 if master key)
  var parentFingerprint = buffer.readUInt32BE(5)
  if (depth === 0) {
    if (parentFingerprint !== 0x00000000) throw new Error('Invalid parent fingerprint')
  }

  // 4 bytes: child number. This is the number i in xi = xpar/i, with xi the key being serialized.
  // This is encoded in MSB order. (0x00000000 if master key)
  var index = buffer.readUInt32BE(9)
  if (depth === 0 && index !== 0) throw new Error('Invalid index')

  // 32 bytes: the chain code
  var chainCode = buffer.slice(13, 45)
  var keyPair

  // 33 bytes: private key data (0x00 + k)
  if (version === network.bip32.private) {
    if (buffer.readUInt8(45) !== 0x00) throw new Error('Invalid private key')

    var d = BigInteger.fromBuffer(buffer.slice(46, 78))
    keyPair = new ECPair(d, null, { network: network })

  // 33 bytes: public key data (0x02 + X or 0x03 + X)
  } else {
    var Q = ecurve.Point.decodeFrom(curve, buffer.slice(45, 78))
    // Q.compressed is assumed, if somehow this assumption is broken, `new HDNode` will throw

    // Verify that the X coordinate in the public point corresponds to a point on the curve.
    // If not, the extended public key is invalid.
    curve.validate(Q)

    keyPair = new ECPair(null, Q, { network: network })
  }

  var hd = new HDNode(keyPair, chainCode)
  hd.depth = depth
  hd.index = index
  hd.parentFingerprint = parentFingerprint

  return hd
}

HDNode.prototype.getAddress = function () {
  return this.keyPair.getAddress()
}

HDNode.prototype.getIdentifier = function () {
  return bcrypto.hash160(this.keyPair.getPublicKeyBuffer())
}

HDNode.prototype.getFingerprint = function () {
  return this.getIdentifier().slice(0, 4)
}

HDNode.prototype.getNetwork = function () {
  return this.keyPair.getNetwork()
}

HDNode.prototype.getPublicKeyBuffer = function () {
  return this.keyPair.getPublicKeyBuffer()
}

HDNode.prototype.neutered = function () {
  var neuteredKeyPair = new ECPair(null, this.keyPair.Q, {
    network: this.keyPair.network
  })

  var neutered = new HDNode(neuteredKeyPair, this.chainCode)
  neutered.depth = this.depth
  neutered.index = this.index
  neutered.parentFingerprint = this.parentFingerprint

  return neutered
}

HDNode.prototype.sign = function (hash) {
  return this.keyPair.sign(hash)
}

HDNode.prototype.verify = function (hash, signature) {
  return this.keyPair.verify(hash, signature)
}

HDNode.prototype.toBase58 = function (__isPrivate) {
  if (__isPrivate !== undefined) throw new TypeError('Unsupported argument in 2.0.0')

  // Version
  var network = this.keyPair.network
  var version = (!this.isNeutered()) ? network.bip32.private : network.bip32.public
  var buffer = Buffer.allocUnsafe(78)

  // 4 bytes: version bytes
  buffer.writeUInt32BE(version, 0)

  // 1 byte: depth: 0x00 for master nodes, 0x01 for level-1 descendants, ....
  buffer.writeUInt8(this.depth, 4)

  // 4 bytes: the fingerprint of the parent's key (0x00000000 if master key)
  buffer.writeUInt32BE(this.parentFingerprint, 5)

  // 4 bytes: child number. This is the number i in xi = xpar/i, with xi the key being serialized.
  // This is encoded in big endian. (0x00000000 if master key)
  buffer.writeUInt32BE(this.index, 9)

  // 32 bytes: the chain code
  this.chainCode.copy(buffer, 13)

  // 33 bytes: the public key or private key data
  if (!this.isNeutered()) {
    // 0x00 + k for private keys
    buffer.writeUInt8(0, 45)
    this.keyPair.d.toBuffer(32).copy(buffer, 46)

  // 33 bytes: the public key
  } else {
    // X9.62 encoding for public keys
    this.keyPair.getPublicKeyBuffer().copy(buffer, 45)
  }

  return base58check.encode(buffer)
}

// https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki#child-key-derivation-ckd-functions
HDNode.prototype.derive = function (index) {
  typeforce(types.UInt32, index)

  var isHardened = index >= HDNode.HIGHEST_BIT
  var data = Buffer.allocUnsafe(37)

  // Hardened child
  if (isHardened) {
    if (this.isNeutered()) throw new TypeError('Could not derive hardened child key')

    // data = 0x00 || ser256(kpar) || ser32(index)
    data[0] = 0x00
    this.keyPair.d.toBuffer(32).copy(data, 1)
    data.writeUInt32BE(index, 33)

  // Normal child
  } else {
    // data = serP(point(kpar)) || ser32(index)
    //      = serP(Kpar) || ser32(index)
    this.keyPair.getPublicKeyBuffer().copy(data, 0)
    data.writeUInt32BE(index, 33)
  }

  var I = createHmac('sha512', this.chainCode).update(data).digest()
  var IL = I.slice(0, 32)
  var IR = I.slice(32)

  var pIL = BigInteger.fromBuffer(IL)

  // In case parse256(IL) >= n, proceed with the next value for i
  if (pIL.compareTo(curve.n) >= 0) {
    return this.derive(index + 1)
  }

  // Private parent key -> private child key
  var derivedKeyPair
  if (!this.isNeutered()) {
    // ki = parse256(IL) + kpar (mod n)
    var ki = pIL.add(this.keyPair.d).mod(curve.n)

    // In case ki == 0, proceed with the next value for i
    if (ki.signum() === 0) {
      return this.derive(index + 1)
    }

    derivedKeyPair = new ECPair(ki, null, {
      network: this.keyPair.network
    })

  // Public parent key -> public child key
  } else {
    // Ki = point(parse256(IL)) + Kpar
    //    = G*IL + Kpar
    var Ki = curve.G.multiply(pIL).add(this.keyPair.Q)

    // In case Ki is the point at infinity, proceed with the next value for i
    if (curve.isInfinity(Ki)) {
      return this.derive(index + 1)
    }

    derivedKeyPair = new ECPair(null, Ki, {
      network: this.keyPair.network
    })
  }

  var hd = new HDNode(derivedKeyPair, IR)
  hd.depth = this.depth + 1
  hd.index = index
  hd.parentFingerprint = this.getFingerprint().readUInt32BE(0)

  return hd
}

HDNode.prototype.deriveHardened = function (index) {
  typeforce(types.UInt31, index)

  // Only derives hardened private keys by default
  return this.derive(index + HDNode.HIGHEST_BIT)
}

// Private === not neutered
// Public === neutered
HDNode.prototype.isNeutered = function () {
  return !(this.keyPair.d)
}

HDNode.prototype.derivePath = function (path) {
  typeforce(types.BIP32Path, path)

  var splitPath = path.split('/')
  if (splitPath[0] === 'm') {
    if (this.parentFingerprint) {
      throw new Error('Not a master node')
    }

    splitPath = splitPath.slice(1)
  }

  return splitPath.reduce(function (prevHd, indexStr) {
    var index
    if (indexStr.slice(-1) === "'") {
      index = parseInt(indexStr.slice(0, -1), 10)
      return prevHd.deriveHardened(index)
    } else {
      index = parseInt(indexStr, 10)
      return prevHd.derive(index)
    }
  }, this)
}

module.exports = HDNode


/***/ }),
/* 163 */
/***/ (function(module, exports, __webpack_require__) {

var Buffer = __webpack_require__(2).Buffer
var baddress = __webpack_require__(27)
var bcrypto = __webpack_require__(11)
var bscript = __webpack_require__(4)
var networks = __webpack_require__(15)
var ops = __webpack_require__(6)
var typeforce = __webpack_require__(0)
var types = __webpack_require__(5)
var scriptTypes = bscript.types
var SIGNABLE = [bscript.types.P2PKH, bscript.types.P2PK, bscript.types.MULTISIG]
var P2SH = SIGNABLE.concat([bscript.types.P2WPKH, bscript.types.P2WSH])

var ECPair = __webpack_require__(26)
var ECSignature = __webpack_require__(30)
var Transaction = __webpack_require__(25)

function supportedType (type) {
  return SIGNABLE.indexOf(type) !== -1
}

function supportedP2SHType (type) {
  return P2SH.indexOf(type) !== -1
}

function extractChunks (type, chunks, script) {
  var pubKeys = []
  var signatures = []
  switch (type) {
    case scriptTypes.P2PKH:
      // if (redeemScript) throw new Error('Nonstandard... P2SH(P2PKH)')
      pubKeys = chunks.slice(1)
      signatures = chunks.slice(0, 1)
      break

    case scriptTypes.P2PK:
      pubKeys[0] = script ? bscript.pubKey.output.decode(script) : undefined
      signatures = chunks.slice(0, 1)
      break

    case scriptTypes.MULTISIG:
      if (script) {
        var multisig = bscript.multisig.output.decode(script)
        pubKeys = multisig.pubKeys
      }

      signatures = chunks.slice(1).map(function (chunk) {
        return chunk.length === 0 ? undefined : chunk
      })
      break
  }

  return {
    pubKeys: pubKeys,
    signatures: signatures
  }
}
function expandInput (scriptSig, witnessStack) {
  if (scriptSig.length === 0 && witnessStack.length === 0) return {}

  var prevOutScript
  var prevOutType
  var scriptType
  var script
  var redeemScript
  var witnessScript
  var witnessScriptType
  var redeemScriptType
  var witness = false
  var p2wsh = false
  var p2sh = false
  var witnessProgram
  var chunks

  var scriptSigChunks = bscript.decompile(scriptSig)
  var sigType = bscript.classifyInput(scriptSigChunks, true)
  if (sigType === scriptTypes.P2SH) {
    p2sh = true
    redeemScript = scriptSigChunks[scriptSigChunks.length - 1]
    redeemScriptType = bscript.classifyOutput(redeemScript)
    prevOutScript = bscript.scriptHash.output.encode(bcrypto.hash160(redeemScript))
    prevOutType = scriptTypes.P2SH
    script = redeemScript
  }

  var classifyWitness = bscript.classifyWitness(witnessStack, true)
  if (classifyWitness === scriptTypes.P2WSH) {
    witnessScript = witnessStack[witnessStack.length - 1]
    witnessScriptType = bscript.classifyOutput(witnessScript)
    p2wsh = true
    witness = true
    if (scriptSig.length === 0) {
      prevOutScript = bscript.witnessScriptHash.output.encode(bcrypto.sha256(witnessScript))
      prevOutType = scriptTypes.P2WSH
      if (redeemScript !== undefined) {
        throw new Error('Redeem script given when unnecessary')
      }
      // bare witness
    } else {
      if (!redeemScript) {
        throw new Error('No redeemScript provided for P2WSH, but scriptSig non-empty')
      }
      witnessProgram = bscript.witnessScriptHash.output.encode(bcrypto.sha256(witnessScript))
      if (!redeemScript.equals(witnessProgram)) {
        throw new Error('Redeem script didn\'t match witnessScript')
      }
    }

    if (!supportedType(bscript.classifyOutput(witnessScript))) {
      throw new Error('unsupported witness script')
    }

    script = witnessScript
    scriptType = witnessScriptType
    chunks = witnessStack.slice(0, -1)
  } else if (classifyWitness === scriptTypes.P2WPKH) {
    witness = true
    var key = witnessStack[witnessStack.length - 1]
    var keyHash = bcrypto.hash160(key)
    if (scriptSig.length === 0) {
      prevOutScript = bscript.witnessPubKeyHash.output.encode(keyHash)
      prevOutType = scriptTypes.P2WPKH
      if (typeof redeemScript !== 'undefined') {
        throw new Error('Redeem script given when unnecessary')
      }
    } else {
      if (!redeemScript) {
        throw new Error('No redeemScript provided for P2WPKH, but scriptSig wasn\'t empty')
      }
      witnessProgram = bscript.witnessPubKeyHash.output.encode(keyHash)
      if (!redeemScript.equals(witnessProgram)) {
        throw new Error('Redeem script did not have the right witness program')
      }
    }

    scriptType = scriptTypes.P2PKH
    chunks = witnessStack
  } else if (redeemScript) {
    if (!supportedP2SHType(redeemScriptType)) {
      throw new Error('Bad redeemscript!')
    }

    script = redeemScript
    scriptType = redeemScriptType
    chunks = scriptSigChunks.slice(0, -1)
  } else {
    prevOutType = scriptType = bscript.classifyInput(scriptSig)
    chunks = scriptSigChunks
  }

  var expanded = extractChunks(scriptType, chunks, script)

  var result = {
    pubKeys: expanded.pubKeys,
    signatures: expanded.signatures,
    prevOutScript: prevOutScript,
    prevOutType: prevOutType,
    signType: scriptType,
    signScript: script,
    witness: Boolean(witness)
  }

  if (p2sh) {
    result.redeemScript = redeemScript
    result.redeemScriptType = redeemScriptType
  }

  if (p2wsh) {
    result.witnessScript = witnessScript
    result.witnessScriptType = witnessScriptType
  }

  return result
}

// could be done in expandInput, but requires the original Transaction for hashForSignature
function fixMultisigOrder (input, transaction, vin) {
  if (input.redeemScriptType !== scriptTypes.MULTISIG || !input.redeemScript) return
  if (input.pubKeys.length === input.signatures.length) return

  var unmatched = input.signatures.concat()

  input.signatures = input.pubKeys.map(function (pubKey) {
    var keyPair = ECPair.fromPublicKeyBuffer(pubKey)
    var match

    // check for a signature
    unmatched.some(function (signature, i) {
      // skip if undefined || OP_0
      if (!signature) return false

      // TODO: avoid O(n) hashForSignature
      var parsed = ECSignature.parseScriptSignature(signature)
      var hash = transaction.hashForSignature(vin, input.redeemScript, parsed.hashType)

      // skip if signature does not match pubKey
      if (!keyPair.verify(hash, parsed.signature)) return false

      // remove matched signature from unmatched
      unmatched[i] = undefined
      match = signature

      return true
    })

    return match
  })
}

function expandOutput (script, scriptType, ourPubKey) {
  typeforce(types.Buffer, script)

  var scriptChunks = bscript.decompile(script)
  if (!scriptType) {
    scriptType = bscript.classifyOutput(script)
  }

  var pubKeys = []

  switch (scriptType) {
    // does our hash160(pubKey) match the output scripts?
    case scriptTypes.P2PKH:
      if (!ourPubKey) break

      var pkh1 = scriptChunks[2]
      var pkh2 = bcrypto.hash160(ourPubKey)
      if (pkh1.equals(pkh2)) pubKeys = [ourPubKey]
      break

    // does our hash160(pubKey) match the output scripts?
    case scriptTypes.P2WPKH:
      if (!ourPubKey) break

      var wpkh1 = scriptChunks[1]
      var wpkh2 = bcrypto.hash160(ourPubKey)
      if (wpkh1.equals(wpkh2)) pubKeys = [ourPubKey]
      break

    case scriptTypes.P2PK:
      pubKeys = scriptChunks.slice(0, 1)
      break

    case scriptTypes.MULTISIG:
      pubKeys = scriptChunks.slice(1, -2)
      break

    default: return { scriptType: scriptType }
  }

  return {
    pubKeys: pubKeys,
    scriptType: scriptType,
    signatures: pubKeys.map(function () { return undefined })
  }
}

function checkP2shInput (input, redeemScriptHash) {
  if (input.prevOutType) {
    if (input.prevOutType !== scriptTypes.P2SH) throw new Error('PrevOutScript must be P2SH')

    var prevOutScriptScriptHash = bscript.decompile(input.prevOutScript)[1]
    if (!prevOutScriptScriptHash.equals(redeemScriptHash)) throw new Error('Inconsistent hash160(RedeemScript)')
  }
}

function checkP2WSHInput (input, witnessScriptHash) {
  if (input.prevOutType) {
    if (input.prevOutType !== scriptTypes.P2WSH) throw new Error('PrevOutScript must be P2WSH')

    var scriptHash = bscript.decompile(input.prevOutScript)[1]
    if (!scriptHash.equals(witnessScriptHash)) throw new Error('Inconsistent sha25(WitnessScript)')
  }
}

function prepareInput (input, kpPubKey, redeemScript, witnessValue, witnessScript) {
  var expanded
  var prevOutType
  var prevOutScript

  var p2sh = false
  var p2shType
  var redeemScriptHash

  var witness = false
  var p2wsh = false
  var witnessType
  var witnessScriptHash

  var signType
  var signScript

  if (redeemScript && witnessScript) {
    redeemScriptHash = bcrypto.hash160(redeemScript)
    witnessScriptHash = bcrypto.sha256(witnessScript)
    checkP2shInput(input, redeemScriptHash)

    if (!redeemScript.equals(bscript.witnessScriptHash.output.encode(witnessScriptHash))) throw new Error('Witness script inconsistent with redeem script')

    expanded = expandOutput(witnessScript, undefined, kpPubKey)
    if (!expanded.pubKeys) throw new Error('WitnessScript not supported "' + bscript.toASM(redeemScript) + '"')
    prevOutType = bscript.types.P2SH
    prevOutScript = bscript.scriptHash.output.encode(redeemScriptHash)
    p2sh = witness = p2wsh = true
    p2shType = bscript.types.P2WSH
    signType = witnessType = expanded.scriptType
    signScript = witnessScript
  } else if (redeemScript) {
    redeemScriptHash = bcrypto.hash160(redeemScript)
    checkP2shInput(input, redeemScriptHash)

    expanded = expandOutput(redeemScript, undefined, kpPubKey)
    if (!expanded.pubKeys) throw new Error('RedeemScript not supported "' + bscript.toASM(redeemScript) + '"')

    prevOutType = bscript.types.P2SH
    prevOutScript = bscript.scriptHash.output.encode(redeemScriptHash)
    p2sh = true
    signType = p2shType = expanded.scriptType
    signScript = redeemScript
    witness = signType === bscript.types.P2WPKH
  } else if (witnessScript) {
    witnessScriptHash = bcrypto.sha256(witnessScript)
    checkP2WSHInput(input, witnessScriptHash)

    expanded = expandOutput(witnessScript, undefined, kpPubKey)
    if (!expanded.pubKeys) throw new Error('WitnessScript not supported "' + bscript.toASM(redeemScript) + '"')

    prevOutType = bscript.types.P2WSH
    prevOutScript = bscript.witnessScriptHash.output.encode(witnessScriptHash)
    witness = p2wsh = true
    signType = witnessType = expanded.scriptType
    signScript = witnessScript
  } else if (input.prevOutType) {
    // embedded scripts are not possible without a redeemScript
    if (input.prevOutType === scriptTypes.P2SH ||
      input.prevOutType === scriptTypes.P2WSH) {
      throw new Error('PrevOutScript is ' + input.prevOutType + ', requires redeemScript')
    }

    prevOutType = input.prevOutType
    prevOutScript = input.prevOutScript
    expanded = expandOutput(input.prevOutScript, input.prevOutType, kpPubKey)
    if (!expanded.pubKeys) return

    witness = (input.prevOutType === scriptTypes.P2WPKH)
    signType = prevOutType
    signScript = prevOutScript
  } else {
    prevOutScript = bscript.pubKeyHash.output.encode(bcrypto.hash160(kpPubKey))
    expanded = expandOutput(prevOutScript, scriptTypes.P2PKH, kpPubKey)
    prevOutType = scriptTypes.P2PKH
    witness = false
    signType = prevOutType
    signScript = prevOutScript
  }

  if (witnessValue !== undefined || witness) {
    typeforce(types.Satoshi, witnessValue)
    if (input.value !== undefined && input.value !== witnessValue) throw new Error('Input didn\'t match witnessValue')
    input.value = witnessValue
  }

  if (signType === scriptTypes.P2WPKH) {
    signScript = bscript.pubKeyHash.output.encode(bscript.witnessPubKeyHash.output.decode(signScript))
  }

  if (p2sh) {
    input.redeemScript = redeemScript
    input.redeemScriptType = p2shType
  }

  if (p2wsh) {
    input.witnessScript = witnessScript
    input.witnessScriptType = witnessType
  }

  input.pubKeys = expanded.pubKeys
  input.signatures = expanded.signatures
  input.signScript = signScript
  input.signType = signType
  input.prevOutScript = prevOutScript
  input.prevOutType = prevOutType
  input.witness = witness
}

function buildStack (type, signatures, pubKeys, allowIncomplete) {
  if (type === scriptTypes.P2PKH) {
    if (signatures.length === 1 && Buffer.isBuffer(signatures[0]) && pubKeys.length === 1) return bscript.pubKeyHash.input.encodeStack(signatures[0], pubKeys[0])
  } else if (type === scriptTypes.P2PK) {
    if (signatures.length === 1 && Buffer.isBuffer(signatures[0])) return bscript.pubKey.input.encodeStack(signatures[0])
  } else if (type === scriptTypes.MULTISIG) {
    if (signatures.length > 0) {
      signatures = signatures.map(function (signature) {
        return signature || ops.OP_0
      })
      if (!allowIncomplete) {
        // remove blank signatures
        signatures = signatures.filter(function (x) { return x !== ops.OP_0 })
      }

      return bscript.multisig.input.encodeStack(signatures)
    }
  } else {
    throw new Error('Not yet supported')
  }

  if (!allowIncomplete) throw new Error('Not enough signatures provided')
  return []
}

function buildInput (input, allowIncomplete) {
  var scriptType = input.prevOutType
  var sig = []
  var witness = []

  if (supportedType(scriptType)) {
    sig = buildStack(scriptType, input.signatures, input.pubKeys, allowIncomplete)
  }

  var p2sh = false
  if (scriptType === bscript.types.P2SH) {
    // We can remove this error later when we have a guarantee prepareInput
    // rejects unsignable scripts - it MUST be signable at this point.
    if (!allowIncomplete && !supportedP2SHType(input.redeemScriptType)) {
      throw new Error('Impossible to sign this type')
    }

    if (supportedType(input.redeemScriptType)) {
      sig = buildStack(input.redeemScriptType, input.signatures, input.pubKeys, allowIncomplete)
    }

    // If it wasn't SIGNABLE, it's witness, defer to that
    if (input.redeemScriptType) {
      p2sh = true
      scriptType = input.redeemScriptType
    }
  }

  switch (scriptType) {
    // P2WPKH is a special case of P2PKH
    case bscript.types.P2WPKH:
      witness = buildStack(bscript.types.P2PKH, input.signatures, input.pubKeys, allowIncomplete)
      break

    case bscript.types.P2WSH:
      // We can remove this check later
      if (!allowIncomplete && !supportedType(input.witnessScriptType)) {
        throw new Error('Impossible to sign this type')
      }

      if (supportedType(input.witnessScriptType)) {
        witness = buildStack(input.witnessScriptType, input.signatures, input.pubKeys, allowIncomplete)
        witness.push(input.witnessScript)
        scriptType = input.witnessScriptType
      }

      break
  }

  // append redeemScript if necessary
  if (p2sh) {
    sig.push(input.redeemScript)
  }

  return {
    type: scriptType,
    script: bscript.compile(sig),
    witness: witness
  }
}

function TransactionBuilder (network, maximumFeeRate) {
  this.prevTxMap = {}
  this.network = network || networks.bitcoin

  // WARNING: This is __NOT__ to be relied on, its just another potential safety mechanism (safety in-depth)
  this.maximumFeeRate = maximumFeeRate || 1000

  this.inputs = []
  this.tx = new Transaction()
}

TransactionBuilder.prototype.setLockTime = function (locktime) {
  typeforce(types.UInt32, locktime)

  // if any signatures exist, throw
  if (this.inputs.some(function (input) {
    if (!input.signatures) return false

    return input.signatures.some(function (s) { return s })
  })) {
    throw new Error('No, this would invalidate signatures')
  }

  this.tx.locktime = locktime
}

TransactionBuilder.prototype.setVersion = function (version) {
  typeforce(types.UInt32, version)

  // XXX: this might eventually become more complex depending on what the versions represent
  this.tx.version = version
}

TransactionBuilder.fromTransaction = function (transaction, network) {
  var txb = new TransactionBuilder(network)

  // Copy transaction fields
  txb.setVersion(transaction.version)
  txb.setLockTime(transaction.locktime)

  // Copy outputs (done first to avoid signature invalidation)
  transaction.outs.forEach(function (txOut) {
    txb.addOutput(txOut.script, txOut.value)
  })

  // Copy inputs
  transaction.ins.forEach(function (txIn) {
    txb.__addInputUnsafe(txIn.hash, txIn.index, {
      sequence: txIn.sequence,
      script: txIn.script,
      witness: txIn.witness
    })
  })

  // fix some things not possible through the public API
  txb.inputs.forEach(function (input, i) {
    fixMultisigOrder(input, transaction, i)
  })

  return txb
}

TransactionBuilder.prototype.addInput = function (txHash, vout, sequence, prevOutScript) {
  if (!this.__canModifyInputs()) {
    throw new Error('No, this would invalidate signatures')
  }

  var value

  // is it a hex string?
  if (typeof txHash === 'string') {
    // transaction hashs's are displayed in reverse order, un-reverse it
    txHash = Buffer.from(txHash, 'hex').reverse()

  // is it a Transaction object?
  } else if (txHash instanceof Transaction) {
    var txOut = txHash.outs[vout]
    prevOutScript = txOut.script
    value = txOut.value

    txHash = txHash.getHash()
  }

  return this.__addInputUnsafe(txHash, vout, {
    sequence: sequence,
    prevOutScript: prevOutScript,
    value: value
  })
}

TransactionBuilder.prototype.__addInputUnsafe = function (txHash, vout, options) {
  if (Transaction.isCoinbaseHash(txHash)) {
    throw new Error('coinbase inputs not supported')
  }

  var prevTxOut = txHash.toString('hex') + ':' + vout
  if (this.prevTxMap[prevTxOut] !== undefined) throw new Error('Duplicate TxOut: ' + prevTxOut)

  var input = {}

  // derive what we can from the scriptSig
  if (options.script !== undefined) {
    input = expandInput(options.script, options.witness || [])
  }

  // if an input value was given, retain it
  if (options.value !== undefined) {
    input.value = options.value
  }

  // derive what we can from the previous transactions output script
  if (!input.prevOutScript && options.prevOutScript) {
    var prevOutType

    if (!input.pubKeys && !input.signatures) {
      var expanded = expandOutput(options.prevOutScript)

      if (expanded.pubKeys) {
        input.pubKeys = expanded.pubKeys
        input.signatures = expanded.signatures
      }

      prevOutType = expanded.scriptType
    }

    input.prevOutScript = options.prevOutScript
    input.prevOutType = prevOutType || bscript.classifyOutput(options.prevOutScript)
  }

  var vin = this.tx.addInput(txHash, vout, options.sequence, options.scriptSig)
  this.inputs[vin] = input
  this.prevTxMap[prevTxOut] = vin
  return vin
}

TransactionBuilder.prototype.addOutput = function (scriptPubKey, value) {
  if (!this.__canModifyOutputs()) {
    throw new Error('No, this would invalidate signatures')
  }

  // Attempt to get a script if it's a base58 address string
  if (typeof scriptPubKey === 'string') {
    scriptPubKey = baddress.toOutputScript(scriptPubKey, this.network)
  }

  return this.tx.addOutput(scriptPubKey, value)
}

TransactionBuilder.prototype.build = function () {
  return this.__build(false)
}
TransactionBuilder.prototype.buildIncomplete = function () {
  return this.__build(true)
}

TransactionBuilder.prototype.__build = function (allowIncomplete) {
  if (!allowIncomplete) {
    if (!this.tx.ins.length) throw new Error('Transaction has no inputs')
    if (!this.tx.outs.length) throw new Error('Transaction has no outputs')
  }

  var tx = this.tx.clone()
  // Create script signatures from inputs
  this.inputs.forEach(function (input, i) {
    var scriptType = input.witnessScriptType || input.redeemScriptType || input.prevOutType
    if (!scriptType && !allowIncomplete) throw new Error('Transaction is not complete')
    var result = buildInput(input, allowIncomplete)

    // skip if no result
    if (!allowIncomplete) {
      if (!supportedType(result.type) && result.type !== bscript.types.P2WPKH) {
        throw new Error(result.type + ' not supported')
      }
    }

    tx.setInputScript(i, result.script)
    tx.setWitness(i, result.witness)
  })

  if (!allowIncomplete) {
    // do not rely on this, its merely a last resort
    if (this.__overMaximumFees(tx.virtualSize())) {
      throw new Error('Transaction has absurd fees')
    }
  }

  return tx
}

function canSign (input) {
  return input.prevOutScript !== undefined &&
    input.signScript !== undefined &&
    input.pubKeys !== undefined &&
    input.signatures !== undefined &&
    input.signatures.length === input.pubKeys.length &&
    input.pubKeys.length > 0 &&
    input.witness !== undefined
}

TransactionBuilder.prototype.sign = function (vin, keyPair, redeemScript, hashType, witnessValue, witnessScript) {
  if (keyPair.network !== this.network) throw new Error('Inconsistent network')
  if (!this.inputs[vin]) throw new Error('No input at index: ' + vin)
  hashType = hashType || Transaction.SIGHASH_ALL

  var input = this.inputs[vin]

  // if redeemScript was previously provided, enforce consistency
  if (input.redeemScript !== undefined &&
      redeemScript &&
      !input.redeemScript.equals(redeemScript)) {
    throw new Error('Inconsistent redeemScript')
  }

  var kpPubKey = keyPair.getPublicKeyBuffer()
  if (!canSign(input)) {
    prepareInput(input, kpPubKey, redeemScript, witnessValue, witnessScript)
    if (!canSign(input)) throw Error(input.prevOutType + ' not supported')
  }

  // ready to sign
  var signatureHash
  if (input.witness) {
    signatureHash = this.tx.hashForWitnessV0(vin, input.signScript, input.value, hashType)
  } else {
    signatureHash = this.tx.hashForSignature(vin, input.signScript, hashType)
  }
  // enforce in order signing of public keys
  var signed = input.pubKeys.some(function (pubKey, i) {
    if (!kpPubKey.equals(pubKey)) return false
    if (input.signatures[i]) throw new Error('Signature already exists')
    if (!keyPair.compressed &&
      input.signType === scriptTypes.P2WPKH) throw new Error('BIP143 rejects uncompressed public keys in P2WPKH or P2WSH')

    input.signatures[i] = keyPair.sign(signatureHash).toScriptSignature(hashType)
    return true
  })

  if (!signed) throw new Error('Key pair cannot sign for this input')
}

function signatureHashType (buffer) {
  return buffer.readUInt8(buffer.length - 1)
}

TransactionBuilder.prototype.__canModifyInputs = function () {
  return this.inputs.every(function (input) {
    // any signatures?
    if (input.signatures === undefined) return true

    return input.signatures.every(function (signature) {
      if (!signature) return true
      var hashType = signatureHashType(signature)

      // if SIGHASH_ANYONECANPAY is set, signatures would not
      // be invalidated by more inputs
      return hashType & Transaction.SIGHASH_ANYONECANPAY
    })
  })
}

TransactionBuilder.prototype.__canModifyOutputs = function () {
  var nInputs = this.tx.ins.length
  var nOutputs = this.tx.outs.length

  return this.inputs.every(function (input) {
    if (input.signatures === undefined) return true

    return input.signatures.every(function (signature) {
      if (!signature) return true
      var hashType = signatureHashType(signature)

      var hashTypeMod = hashType & 0x1f
      if (hashTypeMod === Transaction.SIGHASH_NONE) return true
      if (hashTypeMod === Transaction.SIGHASH_SINGLE) {
        // if SIGHASH_SINGLE is set, and nInputs > nOutputs
        // some signatures would be invalidated by the addition
        // of more outputs
        return nInputs <= nOutputs
      }
    })
  })
}

TransactionBuilder.prototype.__overMaximumFees = function (bytes) {
  // not all inputs will have .value defined
  var incoming = this.inputs.reduce(function (a, x) { return a + (x.value >>> 0) }, 0)

  // but all outputs do, and if we have any input value
  // we can immediately determine if the outputs are too small
  var outgoing = this.tx.outs.reduce(function (a, x) { return a + x.value }, 0)
  var fee = incoming - outgoing
  var feeRate = fee / bytes

  return feeRate > this.maximumFeeRate
}

module.exports = TransactionBuilder


/***/ }),
/* 164 */
/***/ (function(module, exports, __webpack_require__) {

var render = function(){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('v-ons-page',{attrs:{"data-page":"receive"}},[_c('custom-bar',{attrs:{"title":"受け取り","menu":"true"}}),_vm._v(" "),_c('div',[_c('div',{attrs:{"id":"simple"}},[_c('div',{staticClass:"label"},[_vm._v("とりあえず送ってもらう")]),_vm._v(" "),_c('div',{attrs:{"id":"qrArea"}},[_c('div',{attrs:{"id":"qrcode"}},[_vm._v("a")]),_vm._v(" "),_c('div',{staticClass:"address"},[_vm._v(_vm._s(_vm.mainAddress||"読み込み中"))])]),_vm._v(" "),_c('v-ons-button',[_c('v-ons-icon',{attrs:{"icon":"fa-clipboard"}}),_vm._v("\n        アドレスコピー\n      ")],1),_vm._v(" "),_c('v-ons-button',[_c('v-ons-icon',{attrs:{"icon":"fa-share"}}),_vm._v("共有\n      ")],1)],1),_vm._v(" "),_c('div',{attrs:{"id":"addresses"}},[_c('v-ons-list',[_c('v-ons-list-header',[_vm._v("他のアドレスで請求書をつくる")]),_vm._v(" "),_c('v-ons-list-item',[_c('div',{staticClass:"center"},[_vm._v("メイン")]),_vm._v(" "),_c('div',{staticClass:"right"},[_vm._v("4544モナ")])]),_vm._v(" "),_c('v-ons-list-item',[_c('div',{staticClass:"center"},[_vm._v("さぶ")]),_vm._v(" "),_c('div',{staticClass:"right"},[_vm._v("1モナ")])]),_vm._v(" "),_c('v-ons-list-item',{attrs:{"modifier":"tappable chevron"}},[_vm._v("新たにアドレスを作成")])],1)],1)])],1)}
var staticRenderFns = []
module.exports = function (_exports) {
  var options = typeof _exports === 'function'
    ? _exports.options
    : _exports
  options.render = render
  options.staticRenderFns = staticRenderFns
  if (false) {
    api.createRecord("data-v-7219380e", options)
  }
  return _exports
}
var api = null
if (false) {(function () {
  api = require("vue-hot-reload-api")
  api.install(require("vue"))
  if (!api.compatible) return
  module.hot.accept()
  if (module.hot.data) {
    api.rerender("data-v-7219380e", { render: render, staticRenderFns: staticRenderFns })
  }
})()}


/***/ }),
/* 165 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = __webpack_require__(166)({
  data: function data() {
    return {};
  },

  methods: {},
  mounted: function mounted() {}
});

/***/ }),
/* 166 */
/***/ (function(module, exports, __webpack_require__) {

var render = function(){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('v-ons-page',{attrs:{"data-page":"history"}},[_c('custom-bar',{attrs:{"title":"履歴","menu":"true"}}),_vm._v(" "),_c('div')],1)}
var staticRenderFns = []
module.exports = function (_exports) {
  var options = typeof _exports === 'function'
    ? _exports.options
    : _exports
  options.render = render
  options.staticRenderFns = staticRenderFns
  if (false) {
    api.createRecord("data-v-7ffe58e8", options)
  }
  return _exports
}
var api = null
if (false) {(function () {
  api = require("vue-hot-reload-api")
  api.install(require("vue"))
  if (!api.compatible) return
  module.hot.accept()
  if (module.hot.data) {
    api.rerender("data-v-7ffe58e8", { render: render, staticRenderFns: staticRenderFns })
  }
})()}


/***/ }),
/* 167 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = __webpack_require__(168)({
  data: function data() {
    return {};
  },

  methods: {},
  mounted: function mounted() {}
});

/***/ }),
/* 168 */
/***/ (function(module, exports, __webpack_require__) {

var render = function(){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('v-ons-page',{attrs:{"data-page":"settings"}},[_c('custom-bar',{attrs:{"title":"設定","menu":"true"}}),_vm._v(" "),_c('div',[_c('v-ons-list',[_c('v-ons-list-header'),_vm._v(" "),_c('v-ons-list-item')],1)],1)],1)}
var staticRenderFns = []
module.exports = function (_exports) {
  var options = typeof _exports === 'function'
    ? _exports.options
    : _exports
  options.render = render
  options.staticRenderFns = staticRenderFns
  if (false) {
    api.createRecord("data-v-5277325a", options)
  }
  return _exports
}
var api = null
if (false) {(function () {
  api = require("vue-hot-reload-api")
  api.install(require("vue"))
  if (!api.compatible) return
  module.hot.accept()
  if (module.hot.data) {
    api.rerender("data-v-5277325a", { render: render, staticRenderFns: staticRenderFns })
  }
})()}


/***/ }),
/* 169 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = __webpack_require__(170)({
  data: function data() {
    return {};
  },

  methods: {},
  mounted: function mounted() {}
});

/***/ }),
/* 170 */
/***/ (function(module, exports, __webpack_require__) {

var render = function(){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('v-ons-page',{attrs:{"data-page":"help"}},[_c('custom-bar',{attrs:{"title":"ヘルプ","menu":"true"}}),_vm._v(" "),_c('div',[_c('v-ons-list',[_c('v-ons-list-header',[_vm._v("使い方")]),_vm._v(" "),_c('v-ons-list-item'),_vm._v(" "),_c('v-ons-list-header',[_vm._v("暗号通貨解説")]),_vm._v(" "),_c('v-ons-list-header',[_vm._v("用語集")]),_vm._v(" "),_c('v-ons-list-header',[_vm._v("その他")]),_vm._v(" "),_c('v-ons-list-item',[_vm._v("このアプリについて")])],1)],1)],1)}
var staticRenderFns = []
module.exports = function (_exports) {
  var options = typeof _exports === 'function'
    ? _exports.options
    : _exports
  options.render = render
  options.staticRenderFns = staticRenderFns
  if (false) {
    api.createRecord("data-v-75f93cf5", options)
  }
  return _exports
}
var api = null
if (false) {(function () {
  api = require("vue-hot-reload-api")
  api.install(require("vue"))
  if (!api.compatible) return
  module.hot.accept()
  if (module.hot.data) {
    api.rerender("data-v-75f93cf5", { render: render, staticRenderFns: staticRenderFns })
  }
})()}


/***/ })
/******/ ]);