/*! vue-onsenui v2.2.0 - Fri Sep 22 2017 17:58:02 GMT+0900 (JST) */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("onsenui"));
	else if(typeof define === 'function' && define.amd)
		define("VueOnsen", ["onsenui"], factory);
	else if(typeof exports === 'object')
		exports["VueOnsen"] = factory(require("onsenui"));
	else
		root["VueOnsen"] = factory(root["ons"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_55__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
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
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _keys = __webpack_require__(1);
	
	var _keys2 = _interopRequireDefault(_keys);
	
	var _components = __webpack_require__(36);
	
	var components = _interopRequireWildcard(_components);
	
	var _util = __webpack_require__(53);
	
	var _onsenui = __webpack_require__(55);
	
	var _onsenui2 = _interopRequireDefault(_onsenui);
	
	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var register = function register(Vue, type, items) {
	  (0, _keys2.default)(items).forEach(function (key) {
	    var value = items[key];
	    key = (0, _util.hyphenate)(key);
	    Vue[type](key, value);
	  });
	};
	
	var install = function install(Vue) {
	  var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
	
	  register(Vue, 'component', components);
	
	  if (Vue.config.devtools && !Vue.config.silent) {
	    Vue.mixin({
	      beforeCreate: function beforeCreate() {
	        if (this.$options.template) {
	          var match = this.$options.template.match(/<(ons-[\w-]+)/im);
	
	          if (match) {
	            var location = this.$options._componentTag ? ' in component <' + this.$options._componentTag + '>' : '';
	            _onsenui2.default._util.warn('[vue-onsenui] Vue templates must not contain <ons-*> elements directly.\n' + ('<' + match[1] + '> element found near index ' + match.index + location + '. Please use <v-' + match[1] + '> instead:\n              ' + this.$options.template));
	          }
	        }
	      }
	    });
	  }
	
	  Vue.prototype.$ons = (0, _keys2.default)(_onsenui2.default).filter(function (k) {
	    return [/^is/, /^disable/, /^enable/, /^mock/, /^open/, /^set/, /animit/, /Element$/, /fastClick/, /GestureDetector/, /notification/, /orientation/, /platform/, /ready/].some(function (t) {
	      return k.match(t);
	    });
	  }).reduce(function (r, k) {
	    r[k] = _onsenui2.default[k];
	    return r;
	  }, { _ons: _onsenui2.default });
	};
	
	if (typeof window !== 'undefined' && window.Vue) {
	  window.Vue.use({ install: install });
	}
	
	exports.default = install;

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(2), __esModule: true };

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(3);
	module.exports = __webpack_require__(23).Object.keys;

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.2.14 Object.keys(O)
	var toObject = __webpack_require__(4)
	  , $keys    = __webpack_require__(6);
	
	__webpack_require__(21)('keys', function(){
	  return function keys(it){
	    return $keys(toObject(it));
	  };
	});

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	// 7.1.13 ToObject(argument)
	var defined = __webpack_require__(5);
	module.exports = function(it){
	  return Object(defined(it));
	};

/***/ },
/* 5 */
/***/ function(module, exports) {

	// 7.2.1 RequireObjectCoercible(argument)
	module.exports = function(it){
	  if(it == undefined)throw TypeError("Can't call method on  " + it);
	  return it;
	};

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.2.14 / 15.2.3.14 Object.keys(O)
	var $keys       = __webpack_require__(7)
	  , enumBugKeys = __webpack_require__(20);
	
	module.exports = Object.keys || function keys(O){
	  return $keys(O, enumBugKeys);
	};

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	var has          = __webpack_require__(8)
	  , toIObject    = __webpack_require__(9)
	  , arrayIndexOf = __webpack_require__(12)(false)
	  , IE_PROTO     = __webpack_require__(16)('IE_PROTO');
	
	module.exports = function(object, names){
	  var O      = toIObject(object)
	    , i      = 0
	    , result = []
	    , key;
	  for(key in O)if(key != IE_PROTO)has(O, key) && result.push(key);
	  // Don't enum bug & hidden keys
	  while(names.length > i)if(has(O, key = names[i++])){
	    ~arrayIndexOf(result, key) || result.push(key);
	  }
	  return result;
	};

/***/ },
/* 8 */
/***/ function(module, exports) {

	var hasOwnProperty = {}.hasOwnProperty;
	module.exports = function(it, key){
	  return hasOwnProperty.call(it, key);
	};

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	// to indexed object, toObject with fallback for non-array-like ES3 strings
	var IObject = __webpack_require__(10)
	  , defined = __webpack_require__(5);
	module.exports = function(it){
	  return IObject(defined(it));
	};

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	// fallback for non-array-like ES3 and non-enumerable old V8 strings
	var cof = __webpack_require__(11);
	module.exports = Object('z').propertyIsEnumerable(0) ? Object : function(it){
	  return cof(it) == 'String' ? it.split('') : Object(it);
	};

/***/ },
/* 11 */
/***/ function(module, exports) {

	var toString = {}.toString;
	
	module.exports = function(it){
	  return toString.call(it).slice(8, -1);
	};

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	// false -> Array#indexOf
	// true  -> Array#includes
	var toIObject = __webpack_require__(9)
	  , toLength  = __webpack_require__(13)
	  , toIndex   = __webpack_require__(15);
	module.exports = function(IS_INCLUDES){
	  return function($this, el, fromIndex){
	    var O      = toIObject($this)
	      , length = toLength(O.length)
	      , index  = toIndex(fromIndex, length)
	      , value;
	    // Array#includes uses SameValueZero equality algorithm
	    if(IS_INCLUDES && el != el)while(length > index){
	      value = O[index++];
	      if(value != value)return true;
	    // Array#toIndex ignores holes, Array#includes - not
	    } else for(;length > index; index++)if(IS_INCLUDES || index in O){
	      if(O[index] === el)return IS_INCLUDES || index || 0;
	    } return !IS_INCLUDES && -1;
	  };
	};

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	// 7.1.15 ToLength
	var toInteger = __webpack_require__(14)
	  , min       = Math.min;
	module.exports = function(it){
	  return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
	};

/***/ },
/* 14 */
/***/ function(module, exports) {

	// 7.1.4 ToInteger
	var ceil  = Math.ceil
	  , floor = Math.floor;
	module.exports = function(it){
	  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
	};

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	var toInteger = __webpack_require__(14)
	  , max       = Math.max
	  , min       = Math.min;
	module.exports = function(index, length){
	  index = toInteger(index);
	  return index < 0 ? max(index + length, 0) : min(index, length);
	};

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	var shared = __webpack_require__(17)('keys')
	  , uid    = __webpack_require__(19);
	module.exports = function(key){
	  return shared[key] || (shared[key] = uid(key));
	};

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	var global = __webpack_require__(18)
	  , SHARED = '__core-js_shared__'
	  , store  = global[SHARED] || (global[SHARED] = {});
	module.exports = function(key){
	  return store[key] || (store[key] = {});
	};

/***/ },
/* 18 */
/***/ function(module, exports) {

	// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
	var global = module.exports = typeof window != 'undefined' && window.Math == Math
	  ? window : typeof self != 'undefined' && self.Math == Math ? self : Function('return this')();
	if(typeof __g == 'number')__g = global; // eslint-disable-line no-undef

/***/ },
/* 19 */
/***/ function(module, exports) {

	var id = 0
	  , px = Math.random();
	module.exports = function(key){
	  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
	};

/***/ },
/* 20 */
/***/ function(module, exports) {

	// IE 8- don't enum bug keys
	module.exports = (
	  'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'
	).split(',');

/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	// most Object methods by ES6 should accept primitives
	var $export = __webpack_require__(22)
	  , core    = __webpack_require__(23)
	  , fails   = __webpack_require__(32);
	module.exports = function(KEY, exec){
	  var fn  = (core.Object || {})[KEY] || Object[KEY]
	    , exp = {};
	  exp[KEY] = exec(fn);
	  $export($export.S + $export.F * fails(function(){ fn(1); }), 'Object', exp);
	};

/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	var global    = __webpack_require__(18)
	  , core      = __webpack_require__(23)
	  , ctx       = __webpack_require__(24)
	  , hide      = __webpack_require__(26)
	  , PROTOTYPE = 'prototype';
	
	var $export = function(type, name, source){
	  var IS_FORCED = type & $export.F
	    , IS_GLOBAL = type & $export.G
	    , IS_STATIC = type & $export.S
	    , IS_PROTO  = type & $export.P
	    , IS_BIND   = type & $export.B
	    , IS_WRAP   = type & $export.W
	    , exports   = IS_GLOBAL ? core : core[name] || (core[name] = {})
	    , expProto  = exports[PROTOTYPE]
	    , target    = IS_GLOBAL ? global : IS_STATIC ? global[name] : (global[name] || {})[PROTOTYPE]
	    , key, own, out;
	  if(IS_GLOBAL)source = name;
	  for(key in source){
	    // contains in native
	    own = !IS_FORCED && target && target[key] !== undefined;
	    if(own && key in exports)continue;
	    // export native or passed
	    out = own ? target[key] : source[key];
	    // prevent global pollution for namespaces
	    exports[key] = IS_GLOBAL && typeof target[key] != 'function' ? source[key]
	    // bind timers to global for call from export context
	    : IS_BIND && own ? ctx(out, global)
	    // wrap global constructors for prevent change them in library
	    : IS_WRAP && target[key] == out ? (function(C){
	      var F = function(a, b, c){
	        if(this instanceof C){
	          switch(arguments.length){
	            case 0: return new C;
	            case 1: return new C(a);
	            case 2: return new C(a, b);
	          } return new C(a, b, c);
	        } return C.apply(this, arguments);
	      };
	      F[PROTOTYPE] = C[PROTOTYPE];
	      return F;
	    // make static versions for prototype methods
	    })(out) : IS_PROTO && typeof out == 'function' ? ctx(Function.call, out) : out;
	    // export proto methods to core.%CONSTRUCTOR%.methods.%NAME%
	    if(IS_PROTO){
	      (exports.virtual || (exports.virtual = {}))[key] = out;
	      // export proto methods to core.%CONSTRUCTOR%.prototype.%NAME%
	      if(type & $export.R && expProto && !expProto[key])hide(expProto, key, out);
	    }
	  }
	};
	// type bitmap
	$export.F = 1;   // forced
	$export.G = 2;   // global
	$export.S = 4;   // static
	$export.P = 8;   // proto
	$export.B = 16;  // bind
	$export.W = 32;  // wrap
	$export.U = 64;  // safe
	$export.R = 128; // real proto method for `library` 
	module.exports = $export;

/***/ },
/* 23 */
/***/ function(module, exports) {

	var core = module.exports = {version: '2.4.0'};
	if(typeof __e == 'number')__e = core; // eslint-disable-line no-undef

/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	// optional / simple context binding
	var aFunction = __webpack_require__(25);
	module.exports = function(fn, that, length){
	  aFunction(fn);
	  if(that === undefined)return fn;
	  switch(length){
	    case 1: return function(a){
	      return fn.call(that, a);
	    };
	    case 2: return function(a, b){
	      return fn.call(that, a, b);
	    };
	    case 3: return function(a, b, c){
	      return fn.call(that, a, b, c);
	    };
	  }
	  return function(/* ...args */){
	    return fn.apply(that, arguments);
	  };
	};

/***/ },
/* 25 */
/***/ function(module, exports) {

	module.exports = function(it){
	  if(typeof it != 'function')throw TypeError(it + ' is not a function!');
	  return it;
	};

/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	var dP         = __webpack_require__(27)
	  , createDesc = __webpack_require__(35);
	module.exports = __webpack_require__(31) ? function(object, key, value){
	  return dP.f(object, key, createDesc(1, value));
	} : function(object, key, value){
	  object[key] = value;
	  return object;
	};

/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	var anObject       = __webpack_require__(28)
	  , IE8_DOM_DEFINE = __webpack_require__(30)
	  , toPrimitive    = __webpack_require__(34)
	  , dP             = Object.defineProperty;
	
	exports.f = __webpack_require__(31) ? Object.defineProperty : function defineProperty(O, P, Attributes){
	  anObject(O);
	  P = toPrimitive(P, true);
	  anObject(Attributes);
	  if(IE8_DOM_DEFINE)try {
	    return dP(O, P, Attributes);
	  } catch(e){ /* empty */ }
	  if('get' in Attributes || 'set' in Attributes)throw TypeError('Accessors not supported!');
	  if('value' in Attributes)O[P] = Attributes.value;
	  return O;
	};

/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	var isObject = __webpack_require__(29);
	module.exports = function(it){
	  if(!isObject(it))throw TypeError(it + ' is not an object!');
	  return it;
	};

/***/ },
/* 29 */
/***/ function(module, exports) {

	module.exports = function(it){
	  return typeof it === 'object' ? it !== null : typeof it === 'function';
	};

/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = !__webpack_require__(31) && !__webpack_require__(32)(function(){
	  return Object.defineProperty(__webpack_require__(33)('div'), 'a', {get: function(){ return 7; }}).a != 7;
	});

/***/ },
/* 31 */
/***/ function(module, exports, __webpack_require__) {

	// Thank's IE8 for his funny defineProperty
	module.exports = !__webpack_require__(32)(function(){
	  return Object.defineProperty({}, 'a', {get: function(){ return 7; }}).a != 7;
	});

/***/ },
/* 32 */
/***/ function(module, exports) {

	module.exports = function(exec){
	  try {
	    return !!exec();
	  } catch(e){
	    return true;
	  }
	};

/***/ },
/* 33 */
/***/ function(module, exports, __webpack_require__) {

	var isObject = __webpack_require__(29)
	  , document = __webpack_require__(18).document
	  // in old IE typeof document.createElement is 'object'
	  , is = isObject(document) && isObject(document.createElement);
	module.exports = function(it){
	  return is ? document.createElement(it) : {};
	};

/***/ },
/* 34 */
/***/ function(module, exports, __webpack_require__) {

	// 7.1.1 ToPrimitive(input [, PreferredType])
	var isObject = __webpack_require__(29);
	// instead of the ES6 spec version, we didn't implement @@toPrimitive case
	// and the second argument - flag - preferred type is a string
	module.exports = function(it, S){
	  if(!isObject(it))return it;
	  var fn, val;
	  if(S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it)))return val;
	  if(typeof (fn = it.valueOf) == 'function' && !isObject(val = fn.call(it)))return val;
	  if(!S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it)))return val;
	  throw TypeError("Can't convert object to primitive value");
	};

/***/ },
/* 35 */
/***/ function(module, exports) {

	module.exports = function(bitmap, value){
	  return {
	    enumerable  : !(bitmap & 1),
	    configurable: !(bitmap & 2),
	    writable    : !(bitmap & 4),
	    value       : value
	  };
	};

/***/ },
/* 36 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.VOnsToast = exports.VOnsModal = exports.VOnsActionSheetButton = exports.VOnsActionSheet = exports.VOnsDialog = exports.VOnsPage = exports.VOnsSpeedDialItem = exports.VOnsFab = exports.VOnsPullHook = exports.VOnsRadio = exports.VOnsRange = exports.VOnsSearchInput = exports.VOnsInput = exports.VOnsCheckbox = exports.VOnsSwitch = exports.VOnsSplitter = exports.VOnsSplitterContent = exports.VOnsSplitterMask = exports.VOnsCarouselItem = exports.VOnsProgressCircular = exports.VOnsProgressBar = exports.VOnsCol = exports.VOnsRow = exports.VOnsRipple = exports.VOnsListHeader = exports.VOnsListTitle = exports.VOnsListItem = exports.VOnsList = exports.VOnsCard = exports.VOnsIcon = exports.VOnsButton = exports.VOnsAlertDialogButton = exports.VOnsToolbarButton = exports.VOnsBottomToolbar = exports.VOnsToolbar = exports.VOnsSegment = exports.VOnsSelect = exports.VOnsLazyRepeat = exports.VOnsSplitterSide = exports.VOnsNavigator = exports.VOnsBackButton = exports.VOnsTabbar = exports.VOnsTab = exports.VOnsCarousel = exports.VOnsSpeedDial = exports.VOnsAlertDialog = exports.VOnsPopover = undefined;
	
	var _VOnsPopover = __webpack_require__(37);
	
	Object.defineProperty(exports, 'VOnsPopover', {
	  enumerable: true,
	  get: function get() {
	    return _interopRequireDefault(_VOnsPopover).default;
	  }
	});
	
	var _VOnsAlertDialog = __webpack_require__(81);
	
	Object.defineProperty(exports, 'VOnsAlertDialog', {
	  enumerable: true,
	  get: function get() {
	    return _interopRequireDefault(_VOnsAlertDialog).default;
	  }
	});
	
	var _VOnsSpeedDial = __webpack_require__(84);
	
	Object.defineProperty(exports, 'VOnsSpeedDial', {
	  enumerable: true,
	  get: function get() {
	    return _interopRequireDefault(_VOnsSpeedDial).default;
	  }
	});
	
	var _VOnsCarousel = __webpack_require__(87);
	
	Object.defineProperty(exports, 'VOnsCarousel', {
	  enumerable: true,
	  get: function get() {
	    return _interopRequireDefault(_VOnsCarousel).default;
	  }
	});
	
	var _VOnsTab = __webpack_require__(90);
	
	Object.defineProperty(exports, 'VOnsTab', {
	  enumerable: true,
	  get: function get() {
	    return _interopRequireDefault(_VOnsTab).default;
	  }
	});
	
	var _VOnsTabbar = __webpack_require__(93);
	
	Object.defineProperty(exports, 'VOnsTabbar', {
	  enumerable: true,
	  get: function get() {
	    return _interopRequireDefault(_VOnsTabbar).default;
	  }
	});
	
	var _VOnsBackButton = __webpack_require__(100);
	
	Object.defineProperty(exports, 'VOnsBackButton', {
	  enumerable: true,
	  get: function get() {
	    return _interopRequireDefault(_VOnsBackButton).default;
	  }
	});
	
	var _VOnsNavigator = __webpack_require__(103);
	
	Object.defineProperty(exports, 'VOnsNavigator', {
	  enumerable: true,
	  get: function get() {
	    return _interopRequireDefault(_VOnsNavigator).default;
	  }
	});
	
	var _VOnsSplitterSide = __webpack_require__(122);
	
	Object.defineProperty(exports, 'VOnsSplitterSide', {
	  enumerable: true,
	  get: function get() {
	    return _interopRequireDefault(_VOnsSplitterSide).default;
	  }
	});
	
	var _VOnsLazyRepeat = __webpack_require__(125);
	
	Object.defineProperty(exports, 'VOnsLazyRepeat', {
	  enumerable: true,
	  get: function get() {
	    return _interopRequireDefault(_VOnsLazyRepeat).default;
	  }
	});
	
	var _VOnsSelect = __webpack_require__(128);
	
	Object.defineProperty(exports, 'VOnsSelect', {
	  enumerable: true,
	  get: function get() {
	    return _interopRequireDefault(_VOnsSelect).default;
	  }
	});
	
	var _VOnsSegment = __webpack_require__(131);
	
	Object.defineProperty(exports, 'VOnsSegment', {
	  enumerable: true,
	  get: function get() {
	    return _interopRequireDefault(_VOnsSegment).default;
	  }
	});
	
	var _VGeneric = __webpack_require__(134);
	
	var _VGeneric2 = _interopRequireDefault(_VGeneric);
	
	var _mixins = __webpack_require__(47);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var extend = function extend(component) {
	  var mixins = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
	  return { name: 'v-ons-' + component, mixins: mixins, extends: _VGeneric2.default };
	};
	
	var VOnsToolbar = exports.VOnsToolbar = extend('toolbar');
	var VOnsBottomToolbar = exports.VOnsBottomToolbar = extend('bottom-toolbar');
	var VOnsToolbarButton = exports.VOnsToolbarButton = extend('toolbar-button');
	var VOnsAlertDialogButton = exports.VOnsAlertDialogButton = extend('alert-dialog-button');
	var VOnsButton = exports.VOnsButton = extend('button');
	var VOnsIcon = exports.VOnsIcon = extend('icon');
	var VOnsCard = exports.VOnsCard = extend('card');
	var VOnsList = exports.VOnsList = extend('list');
	var VOnsListItem = exports.VOnsListItem = extend('list-item');
	var VOnsListTitle = exports.VOnsListTitle = extend('list-title');
	var VOnsListHeader = exports.VOnsListHeader = extend('list-header');
	var VOnsRipple = exports.VOnsRipple = extend('ripple');
	var VOnsRow = exports.VOnsRow = extend('row');
	var VOnsCol = exports.VOnsCol = extend('col');
	var VOnsProgressBar = exports.VOnsProgressBar = extend('progress-bar');
	var VOnsProgressCircular = exports.VOnsProgressCircular = extend('progress-circular');
	var VOnsCarouselItem = exports.VOnsCarouselItem = extend('carousel-item');
	var VOnsSplitterMask = exports.VOnsSplitterMask = extend('splitter-mask');
	var VOnsSplitterContent = exports.VOnsSplitterContent = extend('splitter-content');
	var VOnsSplitter = exports.VOnsSplitter = extend('splitter', [_mixins.selfProvider, _mixins.deriveDBB]);
	var VOnsSwitch = exports.VOnsSwitch = extend('switch', [_mixins.modelCheckbox]);
	var VOnsCheckbox = exports.VOnsCheckbox = extend('checkbox', [_mixins.modelCheckbox]);
	var VOnsInput = exports.VOnsInput = extend('input', [_mixins.modelInput]);
	var VOnsSearchInput = exports.VOnsSearchInput = extend('search-input', [_mixins.modelInput]);
	var VOnsRange = exports.VOnsRange = extend('range', [_mixins.modelInput]);
	var VOnsRadio = exports.VOnsRadio = extend('radio', [_mixins.modelRadio]);
	var VOnsPullHook = exports.VOnsPullHook = extend('pull-hook', [(0, _mixins.deriveHandler)('onAction'), (0, _mixins.deriveHandler)('onPull', true)]);
	var VOnsFab = exports.VOnsFab = extend('fab', [_mixins.hidable]);
	var VOnsSpeedDialItem = exports.VOnsSpeedDialItem = extend('speed-dial-item');
	var VOnsPage = exports.VOnsPage = extend('page', [_mixins.deriveDBB, (0, _mixins.deriveHandler)('onInfiniteScroll')]);
	var VOnsDialog = exports.VOnsDialog = extend('dialog', [_mixins.hidable, _mixins.hasOptions, _mixins.dialogCancel, _mixins.deriveDBB, _mixins.portal]);
	var VOnsActionSheet = exports.VOnsActionSheet = extend('action-sheet', [_mixins.hidable, _mixins.hasOptions, _mixins.dialogCancel, _mixins.deriveDBB, _mixins.portal]);
	var VOnsActionSheetButton = exports.VOnsActionSheetButton = extend('action-sheet-button');
	var VOnsModal = exports.VOnsModal = extend('modal', [_mixins.hidable, _mixins.hasOptions, _mixins.deriveDBB, _mixins.portal]);
	var VOnsToast = exports.VOnsToast = extend('toast', [_mixins.hidable, _mixins.hasOptions, _mixins.deriveDBB, _mixins.portal]);

/***/ },
/* 37 */
/***/ function(module, exports, __webpack_require__) {

	var Component = __webpack_require__(38)(
	  /* script */
	  __webpack_require__(39),
	  /* template */
	  __webpack_require__(80),
	  /* styles */
	  null,
	  /* scopeId */
	  null,
	  /* moduleIdentifier (server only) */
	  null
	)
	
	module.exports = Component.exports


/***/ },
/* 38 */
/***/ function(module, exports) {

	/* globals __VUE_SSR_CONTEXT__ */
	
	// this module is a runtime utility for cleaner component module output and will
	// be included in the final webpack user bundle
	
	module.exports = function normalizeComponent (
	  rawScriptExports,
	  compiledTemplate,
	  injectStyles,
	  scopeId,
	  moduleIdentifier /* server only */
	) {
	  var esModule
	  var scriptExports = rawScriptExports = rawScriptExports || {}
	
	  // ES6 modules interop
	  var type = typeof rawScriptExports.default
	  if (type === 'object' || type === 'function') {
	    esModule = rawScriptExports
	    scriptExports = rawScriptExports.default
	  }
	
	  // Vue.extend constructor export interop
	  var options = typeof scriptExports === 'function'
	    ? scriptExports.options
	    : scriptExports
	
	  // render functions
	  if (compiledTemplate) {
	    options.render = compiledTemplate.render
	    options.staticRenderFns = compiledTemplate.staticRenderFns
	  }
	
	  // scopedId
	  if (scopeId) {
	    options._scopeId = scopeId
	  }
	
	  var hook
	  if (moduleIdentifier) { // server build
	    hook = function (context) {
	      // 2.3 injection
	      context =
	        context || // cached call
	        (this.$vnode && this.$vnode.ssrContext) || // stateful
	        (this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext) // functional
	      // 2.2 with runInNewContext: true
	      if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
	        context = __VUE_SSR_CONTEXT__
	      }
	      // inject component styles
	      if (injectStyles) {
	        injectStyles.call(this, context)
	      }
	      // register component module identifier for async chunk inferrence
	      if (context && context._registeredComponents) {
	        context._registeredComponents.add(moduleIdentifier)
	      }
	    }
	    // used by ssr in case component is cached and beforeCreate
	    // never gets called
	    options._ssrRegister = hook
	  } else if (injectStyles) {
	    hook = injectStyles
	  }
	
	  if (hook) {
	    var functional = options.functional
	    var existing = functional
	      ? options.render
	      : options.beforeCreate
	    if (!functional) {
	      // inject component registration as beforeCreate hook
	      options.beforeCreate = existing
	        ? [].concat(existing, hook)
	        : [hook]
	    } else {
	      // register for functioal component in vue file
	      options.render = function renderWithStyleInjection (h, context) {
	        hook.call(context)
	        return existing(h, context)
	      }
	    }
	  }
	
	  return {
	    esModule: esModule,
	    exports: scriptExports,
	    options: options
	  }
	}


/***/ },
/* 39 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _extends2 = __webpack_require__(40);
	
	var _extends3 = _interopRequireDefault(_extends2);
	
	var _mixins = __webpack_require__(47);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	exports.default = {
	  mixins: [_mixins.hidable, _mixins.hasOptions, _mixins.dialogCancel, _mixins.deriveEvents, _mixins.deriveDBB, _mixins.portal],
	
	  props: {
	    target: {
	      validator: function validator(value) {
	        return value._isVue || typeof value === 'string' || value instanceof Event || value instanceof HTMLElement;
	      }
	    }
	  },
	
	  computed: {
	    normalizedTarget: function normalizedTarget() {
	      if (this.target && this.target._isVue) {
	        return this.target.$el;
	      }
	      return this.target;
	    },
	    normalizedOptions: function normalizedOptions() {
	      if (this.target) {
	        return (0, _extends3.default)({
	          target: this.normalizedTarget
	        }, this.options);
	      }
	      return this.options;
	    }
	  }
	};

/***/ },
/* 40 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	exports.__esModule = true;
	
	var _assign = __webpack_require__(41);
	
	var _assign2 = _interopRequireDefault(_assign);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	exports.default = _assign2.default || function (target) {
	  for (var i = 1; i < arguments.length; i++) {
	    var source = arguments[i];
	
	    for (var key in source) {
	      if (Object.prototype.hasOwnProperty.call(source, key)) {
	        target[key] = source[key];
	      }
	    }
	  }
	
	  return target;
	};

/***/ },
/* 41 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(42), __esModule: true };

/***/ },
/* 42 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(43);
	module.exports = __webpack_require__(23).Object.assign;

/***/ },
/* 43 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.3.1 Object.assign(target, source)
	var $export = __webpack_require__(22);
	
	$export($export.S + $export.F, 'Object', {assign: __webpack_require__(44)});

/***/ },
/* 44 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	// 19.1.2.1 Object.assign(target, source, ...)
	var getKeys  = __webpack_require__(6)
	  , gOPS     = __webpack_require__(45)
	  , pIE      = __webpack_require__(46)
	  , toObject = __webpack_require__(4)
	  , IObject  = __webpack_require__(10)
	  , $assign  = Object.assign;
	
	// should work with symbols and should have deterministic property order (V8 bug)
	module.exports = !$assign || __webpack_require__(32)(function(){
	  var A = {}
	    , B = {}
	    , S = Symbol()
	    , K = 'abcdefghijklmnopqrst';
	  A[S] = 7;
	  K.split('').forEach(function(k){ B[k] = k; });
	  return $assign({}, A)[S] != 7 || Object.keys($assign({}, B)).join('') != K;
	}) ? function assign(target, source){ // eslint-disable-line no-unused-vars
	  var T     = toObject(target)
	    , aLen  = arguments.length
	    , index = 1
	    , getSymbols = gOPS.f
	    , isEnum     = pIE.f;
	  while(aLen > index){
	    var S      = IObject(arguments[index++])
	      , keys   = getSymbols ? getKeys(S).concat(getSymbols(S)) : getKeys(S)
	      , length = keys.length
	      , j      = 0
	      , key;
	    while(length > j)if(isEnum.call(S, key = keys[j++]))T[key] = S[key];
	  } return T;
	} : $assign;

/***/ },
/* 45 */
/***/ function(module, exports) {

	exports.f = Object.getOwnPropertySymbols;

/***/ },
/* 46 */
/***/ function(module, exports) {

	exports.f = {}.propertyIsEnumerable;

/***/ },
/* 47 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _derive = __webpack_require__(48);
	
	Object.defineProperty(exports, 'deriveDBB', {
	  enumerable: true,
	  get: function get() {
	    return _derive.deriveDBB;
	  }
	});
	Object.defineProperty(exports, 'deriveHandler', {
	  enumerable: true,
	  get: function get() {
	    return _derive.deriveHandler;
	  }
	});
	Object.defineProperty(exports, 'deriveEvents', {
	  enumerable: true,
	  get: function get() {
	    return _derive.deriveEvents;
	  }
	});
	
	var _common = __webpack_require__(54);
	
	Object.defineProperty(exports, 'hidable', {
	  enumerable: true,
	  get: function get() {
	    return _common.hidable;
	  }
	});
	Object.defineProperty(exports, 'hasOptions', {
	  enumerable: true,
	  get: function get() {
	    return _common.hasOptions;
	  }
	});
	Object.defineProperty(exports, 'selfProvider', {
	  enumerable: true,
	  get: function get() {
	    return _common.selfProvider;
	  }
	});
	Object.defineProperty(exports, 'dialogCancel', {
	  enumerable: true,
	  get: function get() {
	    return _common.dialogCancel;
	  }
	});
	Object.defineProperty(exports, 'portal', {
	  enumerable: true,
	  get: function get() {
	    return _common.portal;
	  }
	});
	
	var _model = __webpack_require__(56);
	
	Object.defineProperty(exports, 'modelInput', {
	  enumerable: true,
	  get: function get() {
	    return _model.modelInput;
	  }
	});
	Object.defineProperty(exports, 'modelCheckbox', {
	  enumerable: true,
	  get: function get() {
	    return _model.modelCheckbox;
	  }
	});
	Object.defineProperty(exports, 'modelRadio', {
	  enumerable: true,
	  get: function get() {
	    return _model.modelRadio;
	  }
	});

/***/ },
/* 48 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.deriveEvents = exports.deriveHandler = exports.deriveDBB = undefined;
	
	var _keys = __webpack_require__(1);
	
	var _keys2 = _interopRequireDefault(_keys);
	
	var _defineProperty2 = __webpack_require__(49);
	
	var _defineProperty3 = _interopRequireDefault(_defineProperty2);
	
	var _extends2 = __webpack_require__(40);
	
	var _extends3 = _interopRequireDefault(_extends2);
	
	var _util = __webpack_require__(53);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var _setupDBB = function _setupDBB(component) {
	  var dbb = 'onDeviceBackButton';
	
	  var handler = component[dbb] || component.$el[dbb] && component.$el[dbb]._callback || function (e) {
	    return e.callParentHandler();
	  };
	
	  component.$el[dbb] = function (event) {
	    var runDefault = true;
	
	    component.$emit((0, _util.handlerToProp)(dbb), (0, _extends3.default)({}, event, {
	      preventDefault: function preventDefault() {
	        return runDefault = false;
	      }
	    }));
	
	    runDefault && handler(event);
	  };
	
	  component._isDBBSetup = true;
	};
	
	var deriveDBB = {
	  mounted: function mounted() {
	    _setupDBB(this);
	  },
	  activated: function activated() {
	    this._isDBBSetup === false && _setupDBB(this);
	  },
	  deactivated: function deactivated() {
	    this._isDBBSetup === true && (this._isDBBSetup = false);
	  },
	  destroyed: function destroyed() {
	    this.$el.onDeviceBackButton && this.$el.onDeviceBackButton.destroy();
	  }
	};
	
	var deriveHandler = function deriveHandler(handlerName) {
	  var keepName = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
	
	  var propName = keepName ? handlerName : (0, _util.handlerToProp)(handlerName);
	
	  return {
	    props: (0, _defineProperty3.default)({}, propName, {
	      type: Function,
	      default: null
	    }),
	
	    watch: (0, _defineProperty3.default)({}, propName, function () {
	      this.$el[handlerName] = this[propName];
	    }),
	
	    mounted: function mounted() {
	      this[propName] && (this.$el[handlerName] = this[propName]);
	    }
	  };
	};
	
	var deriveEvents = {
	  computed: {
	    unrecognizedListeners: function unrecognizedListeners() {
	      var _this = this;
	
	      var element = (0, _util.capitalize)((0, _util.camelize)(this.$options._componentTag.slice(6))) + 'Element';
	      return (0, _keys2.default)(this.$listeners || {}).filter(function (k) {
	        return (_this.$ons[element].events || []).indexOf(k) === -1;
	      }).reduce(function (r, k) {
	        r[k] = _this.$listeners[k];
	        return r;
	      }, {});
	    }
	  },
	
	  mounted: function mounted() {
	    var _this2 = this;
	
	    this._handlers = {};
	
	    (this.$el.constructor.events || []).forEach(function (key) {
	      _this2._handlers[(0, _util.eventToHandler)(key)] = function (event) {
	        if (event.target === _this2.$el || !/^ons-/i.test(event.target.tagName)) {
	          _this2.$emit(key, event);
	        }
	      };
	      _this2.$el.addEventListener(key, _this2._handlers[(0, _util.eventToHandler)(key)]);
	    });
	  },
	  beforeDestroy: function beforeDestroy() {
	    var _this3 = this;
	
	    (0, _keys2.default)(this._handlers).forEach(function (key) {
	      _this3.$el.removeEventListener(key, _this3._handlers[key]);
	    });
	    this._handlers = null;
	  }
	};
	
	exports.deriveDBB = deriveDBB;
	exports.deriveHandler = deriveHandler;
	exports.deriveEvents = deriveEvents;

/***/ },
/* 49 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	exports.__esModule = true;
	
	var _defineProperty = __webpack_require__(50);
	
	var _defineProperty2 = _interopRequireDefault(_defineProperty);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	exports.default = function (obj, key, value) {
	  if (key in obj) {
	    (0, _defineProperty2.default)(obj, key, {
	      value: value,
	      enumerable: true,
	      configurable: true,
	      writable: true
	    });
	  } else {
	    obj[key] = value;
	  }
	
	  return obj;
	};

/***/ },
/* 50 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(51), __esModule: true };

/***/ },
/* 51 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(52);
	var $Object = __webpack_require__(23).Object;
	module.exports = function defineProperty(it, key, desc){
	  return $Object.defineProperty(it, key, desc);
	};

/***/ },
/* 52 */
/***/ function(module, exports, __webpack_require__) {

	var $export = __webpack_require__(22);
	// 19.1.2.4 / 15.2.3.6 Object.defineProperty(O, P, Attributes)
	$export($export.S + $export.F * !__webpack_require__(31), 'Object', {defineProperty: __webpack_require__(27).f});

/***/ },
/* 53 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var hyphenate = exports.hyphenate = function hyphenate(string) {
	  return string.replace(/([a-zA-Z])([A-Z])/g, '$1-$2').toLowerCase();
	};
	
	var capitalize = exports.capitalize = function capitalize(string) {
	  return string.charAt(0).toUpperCase() + string.slice(1);
	};
	
	var camelize = exports.camelize = function camelize(string) {
	  return string.toLowerCase().replace(/-([a-z])/g, function (m, l) {
	    return l.toUpperCase();
	  });
	};
	
	var eventToHandler = exports.eventToHandler = function eventToHandler(name) {
	  return '_on' + capitalize(name);
	};
	
	var handlerToProp = exports.handlerToProp = function handlerToProp(name) {
	  return name.slice(2).charAt(0).toLowerCase() + name.slice(2).slice(1);
	};

/***/ },
/* 54 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.portal = exports.dialogCancel = exports.selfProvider = exports.hasOptions = exports.hidable = undefined;
	
	var _defineProperty2 = __webpack_require__(49);
	
	var _defineProperty3 = _interopRequireDefault(_defineProperty2);
	
	var _onsenui = __webpack_require__(55);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var _toggleVisibility = function _toggleVisibility() {
	  if (typeof this.visible === 'boolean' && this.visible !== this.$el.visible) {
	    this.$el[this.visible ? 'show' : 'hide'].call(this.$el, this.normalizedOptions || this.options);
	  }
	};
	var _teleport = function _teleport() {
	  if (!this._isDestroyed && (!this.$el.parentNode || this.$el.parentNode !== document.body)) {
	    document.body.appendChild(this.$el);
	  }
	};
	var _unmount = function _unmount() {
	  var _this = this;
	
	  if (this.$el.visible === true) {
	    this.$el.hide().then(function () {
	      return _this.$el.remove();
	    });
	  } else {
	    this.$el.remove();
	  }
	};
	
	var hidable = {
	  props: {
	    visible: {
	      type: Boolean,
	      default: undefined }
	  },
	
	  watch: {
	    visible: function visible() {
	      _toggleVisibility.call(this);
	    }
	  },
	
	  mounted: function mounted() {
	    var _this2 = this;
	
	    this.$nextTick(function () {
	      return _toggleVisibility.call(_this2);
	    });
	  },
	  activated: function activated() {
	    var _this3 = this;
	
	    this.$nextTick(function () {
	      return _toggleVisibility.call(_this3);
	    });
	  }
	};
	
	var hasOptions = {
	  props: {
	    options: {
	      type: Object,
	      default: function _default() {
	        return {};
	      }
	    }
	  }
	};
	
	var selfProvider = {
	  provide: function provide() {
	    return (0, _defineProperty3.default)({}, this.$options._componentTag.slice(6), this);
	  }
	};
	
	var dialogCancel = {
	  mounted: function mounted() {
	    var _this4 = this;
	
	    this.$on('dialog-cancel', function () {
	      return _this4.$emit('update:visible', false);
	    });
	  }
	};
	
	var portal = {
	  mounted: function mounted() {
	    _teleport.call(this);
	  },
	  updated: function updated() {
	    _teleport.call(this);
	  },
	  activated: function activated() {
	    _teleport.call(this);
	  },
	  deactivated: function deactivated() {
	    _unmount.call(this);
	  },
	  beforeDestroy: function beforeDestroy() {
	    _unmount.call(this);
	  }
	};
	
	exports.hidable = hidable;
	exports.hasOptions = hasOptions;
	exports.selfProvider = selfProvider;
	exports.dialogCancel = dialogCancel;
	exports.portal = portal;

/***/ },
/* 55 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_55__;

/***/ },
/* 56 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.modelRadio = exports.modelCheckbox = exports.modelInput = undefined;
	
	var _toConsumableArray2 = __webpack_require__(57);
	
	var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);
	
	var _defineProperty2 = __webpack_require__(49);
	
	var _defineProperty3 = _interopRequireDefault(_defineProperty2);
	
	var _props, _props2;
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var model = {
	  prop: 'modelProp',
	  event: 'modelEvent'
	};
	
	var modelInput = {
	  model: model,
	  props: (_props = {}, (0, _defineProperty3.default)(_props, model.prop, [Number, String]), (0, _defineProperty3.default)(_props, model.event, {
	    type: String,
	    default: 'input'
	  }), _props),
	
	  methods: {
	    _updateValue: function _updateValue() {
	      if (this[model.prop] !== undefined && this.$el.value !== this[model.prop]) {
	        this.$el.value = this[model.prop];
	      }
	    },
	    _onModelEvent: function _onModelEvent(event) {
	      this.$emit(model.event, event.target.value);
	    }
	  },
	
	  watch: (0, _defineProperty3.default)({}, model.prop, function () {
	    this._updateValue();
	  }),
	
	  mounted: function mounted() {
	    this._updateValue();
	    this.$el.addEventListener(this[model.event], this._onModelEvent);
	  },
	  beforeDestroy: function beforeDestroy() {
	    this.$el.removeEventListener(this[model.event], this._onModelEvent);
	  }
	};
	
	var modelCheckbox = {
	  mixins: [modelInput],
	
	  props: (_props2 = {}, (0, _defineProperty3.default)(_props2, model.prop, [Array, Boolean]), (0, _defineProperty3.default)(_props2, model.event, {
	    type: String,
	    default: 'change'
	  }), _props2),
	
	  methods: {
	    _updateValue: function _updateValue() {
	      if (this[model.prop] instanceof Array) {
	        this.$el.checked = this[model.prop].indexOf(this.$el.value) >= 0;
	      } else {
	        this.$el.checked = this[model.prop];
	      }
	    },
	    _onModelEvent: function _onModelEvent(event) {
	      var _event$target = event.target,
	          value = _event$target.value,
	          checked = _event$target.checked;
	
	      var newValue = void 0;
	
	      if (this[model.prop] instanceof Array) {
	        var index = this[model.prop].indexOf(value);
	        var included = index >= 0;
	
	        if (included && !checked) {
	          newValue = [].concat((0, _toConsumableArray3.default)(this[model.prop].slice(0, index)), (0, _toConsumableArray3.default)(this[model.prop].slice(index + 1, this[model.prop].length)));
	        }
	
	        if (!included && checked) {
	          newValue = [].concat((0, _toConsumableArray3.default)(this[model.prop]), [value]);
	        }
	      } else {
	        newValue = checked;
	      }
	
	      newValue !== undefined && this.$emit(model.event, newValue);
	    }
	  }
	};
	
	var modelRadio = {
	  mixins: [modelInput],
	  props: (0, _defineProperty3.default)({}, model.event, {
	    type: String,
	    default: 'change'
	  }),
	
	  methods: {
	    _updateValue: function _updateValue() {
	      this.$el.checked = this[model.prop] === this.$el.value;
	    },
	    _onModelEvent: function _onModelEvent(event) {
	      var _event$target2 = event.target,
	          value = _event$target2.value,
	          checked = _event$target2.checked;
	
	      checked && this.$emit(model.event, value);
	    }
	  }
	};
	
	exports.modelInput = modelInput;
	exports.modelCheckbox = modelCheckbox;
	exports.modelRadio = modelRadio;

/***/ },
/* 57 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	exports.__esModule = true;
	
	var _from = __webpack_require__(58);
	
	var _from2 = _interopRequireDefault(_from);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	exports.default = function (arr) {
	  if (Array.isArray(arr)) {
	    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
	      arr2[i] = arr[i];
	    }
	
	    return arr2;
	  } else {
	    return (0, _from2.default)(arr);
	  }
	};

/***/ },
/* 58 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(59), __esModule: true };

/***/ },
/* 59 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(60);
	__webpack_require__(73);
	module.exports = __webpack_require__(23).Array.from;

/***/ },
/* 60 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var $at  = __webpack_require__(61)(true);
	
	// 21.1.3.27 String.prototype[@@iterator]()
	__webpack_require__(62)(String, 'String', function(iterated){
	  this._t = String(iterated); // target
	  this._i = 0;                // next index
	// 21.1.5.2.1 %StringIteratorPrototype%.next()
	}, function(){
	  var O     = this._t
	    , index = this._i
	    , point;
	  if(index >= O.length)return {value: undefined, done: true};
	  point = $at(O, index);
	  this._i += point.length;
	  return {value: point, done: false};
	});

/***/ },
/* 61 */
/***/ function(module, exports, __webpack_require__) {

	var toInteger = __webpack_require__(14)
	  , defined   = __webpack_require__(5);
	// true  -> String#at
	// false -> String#codePointAt
	module.exports = function(TO_STRING){
	  return function(that, pos){
	    var s = String(defined(that))
	      , i = toInteger(pos)
	      , l = s.length
	      , a, b;
	    if(i < 0 || i >= l)return TO_STRING ? '' : undefined;
	    a = s.charCodeAt(i);
	    return a < 0xd800 || a > 0xdbff || i + 1 === l || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
	      ? TO_STRING ? s.charAt(i) : a
	      : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
	  };
	};

/***/ },
/* 62 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var LIBRARY        = __webpack_require__(63)
	  , $export        = __webpack_require__(22)
	  , redefine       = __webpack_require__(64)
	  , hide           = __webpack_require__(26)
	  , has            = __webpack_require__(8)
	  , Iterators      = __webpack_require__(65)
	  , $iterCreate    = __webpack_require__(66)
	  , setToStringTag = __webpack_require__(70)
	  , getPrototypeOf = __webpack_require__(72)
	  , ITERATOR       = __webpack_require__(71)('iterator')
	  , BUGGY          = !([].keys && 'next' in [].keys()) // Safari has buggy iterators w/o `next`
	  , FF_ITERATOR    = '@@iterator'
	  , KEYS           = 'keys'
	  , VALUES         = 'values';
	
	var returnThis = function(){ return this; };
	
	module.exports = function(Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCED){
	  $iterCreate(Constructor, NAME, next);
	  var getMethod = function(kind){
	    if(!BUGGY && kind in proto)return proto[kind];
	    switch(kind){
	      case KEYS: return function keys(){ return new Constructor(this, kind); };
	      case VALUES: return function values(){ return new Constructor(this, kind); };
	    } return function entries(){ return new Constructor(this, kind); };
	  };
	  var TAG        = NAME + ' Iterator'
	    , DEF_VALUES = DEFAULT == VALUES
	    , VALUES_BUG = false
	    , proto      = Base.prototype
	    , $native    = proto[ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT]
	    , $default   = $native || getMethod(DEFAULT)
	    , $entries   = DEFAULT ? !DEF_VALUES ? $default : getMethod('entries') : undefined
	    , $anyNative = NAME == 'Array' ? proto.entries || $native : $native
	    , methods, key, IteratorPrototype;
	  // Fix native
	  if($anyNative){
	    IteratorPrototype = getPrototypeOf($anyNative.call(new Base));
	    if(IteratorPrototype !== Object.prototype){
	      // Set @@toStringTag to native iterators
	      setToStringTag(IteratorPrototype, TAG, true);
	      // fix for some old engines
	      if(!LIBRARY && !has(IteratorPrototype, ITERATOR))hide(IteratorPrototype, ITERATOR, returnThis);
	    }
	  }
	  // fix Array#{values, @@iterator}.name in V8 / FF
	  if(DEF_VALUES && $native && $native.name !== VALUES){
	    VALUES_BUG = true;
	    $default = function values(){ return $native.call(this); };
	  }
	  // Define iterator
	  if((!LIBRARY || FORCED) && (BUGGY || VALUES_BUG || !proto[ITERATOR])){
	    hide(proto, ITERATOR, $default);
	  }
	  // Plug for library
	  Iterators[NAME] = $default;
	  Iterators[TAG]  = returnThis;
	  if(DEFAULT){
	    methods = {
	      values:  DEF_VALUES ? $default : getMethod(VALUES),
	      keys:    IS_SET     ? $default : getMethod(KEYS),
	      entries: $entries
	    };
	    if(FORCED)for(key in methods){
	      if(!(key in proto))redefine(proto, key, methods[key]);
	    } else $export($export.P + $export.F * (BUGGY || VALUES_BUG), NAME, methods);
	  }
	  return methods;
	};

/***/ },
/* 63 */
/***/ function(module, exports) {

	module.exports = true;

/***/ },
/* 64 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(26);

/***/ },
/* 65 */
/***/ function(module, exports) {

	module.exports = {};

/***/ },
/* 66 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var create         = __webpack_require__(67)
	  , descriptor     = __webpack_require__(35)
	  , setToStringTag = __webpack_require__(70)
	  , IteratorPrototype = {};
	
	// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
	__webpack_require__(26)(IteratorPrototype, __webpack_require__(71)('iterator'), function(){ return this; });
	
	module.exports = function(Constructor, NAME, next){
	  Constructor.prototype = create(IteratorPrototype, {next: descriptor(1, next)});
	  setToStringTag(Constructor, NAME + ' Iterator');
	};

/***/ },
/* 67 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
	var anObject    = __webpack_require__(28)
	  , dPs         = __webpack_require__(68)
	  , enumBugKeys = __webpack_require__(20)
	  , IE_PROTO    = __webpack_require__(16)('IE_PROTO')
	  , Empty       = function(){ /* empty */ }
	  , PROTOTYPE   = 'prototype';
	
	// Create object with fake `null` prototype: use iframe Object with cleared prototype
	var createDict = function(){
	  // Thrash, waste and sodomy: IE GC bug
	  var iframe = __webpack_require__(33)('iframe')
	    , i      = enumBugKeys.length
	    , lt     = '<'
	    , gt     = '>'
	    , iframeDocument;
	  iframe.style.display = 'none';
	  __webpack_require__(69).appendChild(iframe);
	  iframe.src = 'javascript:'; // eslint-disable-line no-script-url
	  // createDict = iframe.contentWindow.Object;
	  // html.removeChild(iframe);
	  iframeDocument = iframe.contentWindow.document;
	  iframeDocument.open();
	  iframeDocument.write(lt + 'script' + gt + 'document.F=Object' + lt + '/script' + gt);
	  iframeDocument.close();
	  createDict = iframeDocument.F;
	  while(i--)delete createDict[PROTOTYPE][enumBugKeys[i]];
	  return createDict();
	};
	
	module.exports = Object.create || function create(O, Properties){
	  var result;
	  if(O !== null){
	    Empty[PROTOTYPE] = anObject(O);
	    result = new Empty;
	    Empty[PROTOTYPE] = null;
	    // add "__proto__" for Object.getPrototypeOf polyfill
	    result[IE_PROTO] = O;
	  } else result = createDict();
	  return Properties === undefined ? result : dPs(result, Properties);
	};


/***/ },
/* 68 */
/***/ function(module, exports, __webpack_require__) {

	var dP       = __webpack_require__(27)
	  , anObject = __webpack_require__(28)
	  , getKeys  = __webpack_require__(6);
	
	module.exports = __webpack_require__(31) ? Object.defineProperties : function defineProperties(O, Properties){
	  anObject(O);
	  var keys   = getKeys(Properties)
	    , length = keys.length
	    , i = 0
	    , P;
	  while(length > i)dP.f(O, P = keys[i++], Properties[P]);
	  return O;
	};

/***/ },
/* 69 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(18).document && document.documentElement;

/***/ },
/* 70 */
/***/ function(module, exports, __webpack_require__) {

	var def = __webpack_require__(27).f
	  , has = __webpack_require__(8)
	  , TAG = __webpack_require__(71)('toStringTag');
	
	module.exports = function(it, tag, stat){
	  if(it && !has(it = stat ? it : it.prototype, TAG))def(it, TAG, {configurable: true, value: tag});
	};

/***/ },
/* 71 */
/***/ function(module, exports, __webpack_require__) {

	var store      = __webpack_require__(17)('wks')
	  , uid        = __webpack_require__(19)
	  , Symbol     = __webpack_require__(18).Symbol
	  , USE_SYMBOL = typeof Symbol == 'function';
	
	var $exports = module.exports = function(name){
	  return store[name] || (store[name] =
	    USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : uid)('Symbol.' + name));
	};
	
	$exports.store = store;

/***/ },
/* 72 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)
	var has         = __webpack_require__(8)
	  , toObject    = __webpack_require__(4)
	  , IE_PROTO    = __webpack_require__(16)('IE_PROTO')
	  , ObjectProto = Object.prototype;
	
	module.exports = Object.getPrototypeOf || function(O){
	  O = toObject(O);
	  if(has(O, IE_PROTO))return O[IE_PROTO];
	  if(typeof O.constructor == 'function' && O instanceof O.constructor){
	    return O.constructor.prototype;
	  } return O instanceof Object ? ObjectProto : null;
	};

/***/ },
/* 73 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var ctx            = __webpack_require__(24)
	  , $export        = __webpack_require__(22)
	  , toObject       = __webpack_require__(4)
	  , call           = __webpack_require__(74)
	  , isArrayIter    = __webpack_require__(75)
	  , toLength       = __webpack_require__(13)
	  , createProperty = __webpack_require__(76)
	  , getIterFn      = __webpack_require__(77);
	
	$export($export.S + $export.F * !__webpack_require__(79)(function(iter){ Array.from(iter); }), 'Array', {
	  // 22.1.2.1 Array.from(arrayLike, mapfn = undefined, thisArg = undefined)
	  from: function from(arrayLike/*, mapfn = undefined, thisArg = undefined*/){
	    var O       = toObject(arrayLike)
	      , C       = typeof this == 'function' ? this : Array
	      , aLen    = arguments.length
	      , mapfn   = aLen > 1 ? arguments[1] : undefined
	      , mapping = mapfn !== undefined
	      , index   = 0
	      , iterFn  = getIterFn(O)
	      , length, result, step, iterator;
	    if(mapping)mapfn = ctx(mapfn, aLen > 2 ? arguments[2] : undefined, 2);
	    // if object isn't iterable or it's array with default iterator - use simple case
	    if(iterFn != undefined && !(C == Array && isArrayIter(iterFn))){
	      for(iterator = iterFn.call(O), result = new C; !(step = iterator.next()).done; index++){
	        createProperty(result, index, mapping ? call(iterator, mapfn, [step.value, index], true) : step.value);
	      }
	    } else {
	      length = toLength(O.length);
	      for(result = new C(length); length > index; index++){
	        createProperty(result, index, mapping ? mapfn(O[index], index) : O[index]);
	      }
	    }
	    result.length = index;
	    return result;
	  }
	});


/***/ },
/* 74 */
/***/ function(module, exports, __webpack_require__) {

	// call something on iterator step with safe closing on error
	var anObject = __webpack_require__(28);
	module.exports = function(iterator, fn, value, entries){
	  try {
	    return entries ? fn(anObject(value)[0], value[1]) : fn(value);
	  // 7.4.6 IteratorClose(iterator, completion)
	  } catch(e){
	    var ret = iterator['return'];
	    if(ret !== undefined)anObject(ret.call(iterator));
	    throw e;
	  }
	};

/***/ },
/* 75 */
/***/ function(module, exports, __webpack_require__) {

	// check on default Array iterator
	var Iterators  = __webpack_require__(65)
	  , ITERATOR   = __webpack_require__(71)('iterator')
	  , ArrayProto = Array.prototype;
	
	module.exports = function(it){
	  return it !== undefined && (Iterators.Array === it || ArrayProto[ITERATOR] === it);
	};

/***/ },
/* 76 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var $defineProperty = __webpack_require__(27)
	  , createDesc      = __webpack_require__(35);
	
	module.exports = function(object, index, value){
	  if(index in object)$defineProperty.f(object, index, createDesc(0, value));
	  else object[index] = value;
	};

/***/ },
/* 77 */
/***/ function(module, exports, __webpack_require__) {

	var classof   = __webpack_require__(78)
	  , ITERATOR  = __webpack_require__(71)('iterator')
	  , Iterators = __webpack_require__(65);
	module.exports = __webpack_require__(23).getIteratorMethod = function(it){
	  if(it != undefined)return it[ITERATOR]
	    || it['@@iterator']
	    || Iterators[classof(it)];
	};

/***/ },
/* 78 */
/***/ function(module, exports, __webpack_require__) {

	// getting tag from 19.1.3.6 Object.prototype.toString()
	var cof = __webpack_require__(11)
	  , TAG = __webpack_require__(71)('toStringTag')
	  // ES3 wrong here
	  , ARG = cof(function(){ return arguments; }()) == 'Arguments';
	
	// fallback for IE11 Script Access Denied error
	var tryGet = function(it, key){
	  try {
	    return it[key];
	  } catch(e){ /* empty */ }
	};
	
	module.exports = function(it){
	  var O, T, B;
	  return it === undefined ? 'Undefined' : it === null ? 'Null'
	    // @@toStringTag case
	    : typeof (T = tryGet(O = Object(it), TAG)) == 'string' ? T
	    // builtinTag case
	    : ARG ? cof(O)
	    // ES3 arguments fallback
	    : (B = cof(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : B;
	};

/***/ },
/* 79 */
/***/ function(module, exports, __webpack_require__) {

	var ITERATOR     = __webpack_require__(71)('iterator')
	  , SAFE_CLOSING = false;
	
	try {
	  var riter = [7][ITERATOR]();
	  riter['return'] = function(){ SAFE_CLOSING = true; };
	  Array.from(riter, function(){ throw 2; });
	} catch(e){ /* empty */ }
	
	module.exports = function(exec, skipClosing){
	  if(!skipClosing && !SAFE_CLOSING)return false;
	  var safe = false;
	  try {
	    var arr  = [7]
	      , iter = arr[ITERATOR]();
	    iter.next = function(){ return {done: safe = true}; };
	    arr[ITERATOR] = function(){ return iter; };
	    exec(arr);
	  } catch(e){ /* empty */ }
	  return safe;
	};

/***/ },
/* 80 */
/***/ function(module, exports) {

	module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._c;
	  return _c('ons-popover', _vm._g({}, _vm.unrecognizedListeners), [_vm._t("default")], 2)
	},staticRenderFns: []}

/***/ },
/* 81 */
/***/ function(module, exports, __webpack_require__) {

	var Component = __webpack_require__(38)(
	  /* script */
	  __webpack_require__(82),
	  /* template */
	  __webpack_require__(83),
	  /* styles */
	  null,
	  /* scopeId */
	  null,
	  /* moduleIdentifier (server only) */
	  null
	)
	
	module.exports = Component.exports


/***/ },
/* 82 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _keys = __webpack_require__(1);
	
	var _keys2 = _interopRequireDefault(_keys);
	
	var _mixins = __webpack_require__(47);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	exports.default = {
	  mixins: [_mixins.hidable, _mixins.hasOptions, _mixins.dialogCancel, _mixins.deriveEvents, _mixins.deriveDBB, _mixins.portal],
	
	  props: {
	    title: {
	      type: String
	    },
	    footer: {
	      type: Object,
	      validator: function validator(value) {
	        return (0, _keys2.default)(value).every(function (key) {
	          return value[key] instanceof Function;
	        });
	      }
	    }
	  }
	};

/***/ },
/* 83 */
/***/ function(module, exports) {

	module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._c;
	  return _c('ons-alert-dialog', _vm._g({}, _vm.unrecognizedListeners), [_c('div', {
	    staticClass: "alert-dialog-title"
	  }, [_vm._t("title", [_vm._v(_vm._s(_vm.title))])], 2), _vm._v(" "), _c('div', {
	    staticClass: "alert-dialog-content"
	  }, [_vm._t("default")], 2), _vm._v(" "), _c('div', {
	    staticClass: "alert-dialog-footer"
	  }, [_vm._t("footer", _vm._l((_vm.footer), function(handler, key) {
	    return _c('ons-alert-dialog-button', {
	      key: key,
	      on: {
	        "click": handler
	      }
	    }, [_vm._v(_vm._s(key))])
	  }))], 2)])
	},staticRenderFns: []}

/***/ },
/* 84 */
/***/ function(module, exports, __webpack_require__) {

	var Component = __webpack_require__(38)(
	  /* script */
	  __webpack_require__(85),
	  /* template */
	  __webpack_require__(86),
	  /* styles */
	  null,
	  /* scopeId */
	  null,
	  /* moduleIdentifier (server only) */
	  null
	)
	
	module.exports = Component.exports


/***/ },
/* 85 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _mixins = __webpack_require__(47);
	
	exports.default = {
	  mixins: [_mixins.deriveEvents, _mixins.hidable],
	
	  props: {
	    open: {
	      type: Boolean,
	      default: undefined
	    }
	  },
	
	  methods: {
	    action: function action() {
	      var runDefault = true;
	      this.$emit('click', { preventDefault: function preventDefault() {
	          return runDefault = false;
	        } });
	
	      if (runDefault) {
	        this.$el.toggleItems();
	      }
	    },
	    _shouldUpdate: function _shouldUpdate() {
	      return this.open !== undefined && this.open !== this.$el.isOpen();
	    },
	    _updateToggle: function _updateToggle() {
	      this._shouldUpdate() && this.$el[this.open ? 'showItems' : 'hideItems'].call(this.$el);
	    }
	  },
	
	  watch: {
	    open: function open() {
	      this._updateToggle();
	    }
	  },
	
	  mounted: function mounted() {
	    var _this = this;
	
	    this.$on(['open', 'close'], function () {
	      return _this._shouldUpdate() && _this.$emit('update:open', _this.$el.isOpen());
	    });
	
	    this._updateToggle();
	  }
	};

/***/ },
/* 86 */
/***/ function(module, exports) {

	module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._c;
	  return _c('ons-speed-dial', {
	    domProps: {
	      "onClick": _vm.action
	    }
	  }, [_vm._t("default")], 2)
	},staticRenderFns: []}

/***/ },
/* 87 */
/***/ function(module, exports, __webpack_require__) {

	var Component = __webpack_require__(38)(
	  /* script */
	  __webpack_require__(88),
	  /* template */
	  __webpack_require__(89),
	  /* styles */
	  null,
	  /* scopeId */
	  null,
	  /* moduleIdentifier (server only) */
	  null
	)
	
	module.exports = Component.exports


/***/ },
/* 88 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _mixins = __webpack_require__(47);
	
	exports.default = {
	  mixins: [_mixins.hasOptions, _mixins.deriveEvents],
	
	  props: {
	    index: {
	      type: Number
	    },
	    onSwipe: {
	      type: Function
	    }
	  },
	
	  watch: {
	    index: function index() {
	      if (this.index !== this.$el.getActiveIndex()) {
	        this.$el.setActiveIndex(this.index, this.options);
	      }
	    }
	  }
	};

/***/ },
/* 89 */
/***/ function(module, exports) {

	module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._c;
	  return _c('ons-carousel', _vm._g({
	    attrs: {
	      "initial-index": _vm.index
	    },
	    domProps: {
	      "onSwipe": _vm.onSwipe
	    },
	    on: {
	      "postchange": function($event) {
	        if ($event.target !== $event.currentTarget) { return null; }
	        _vm.$emit('update:index', $event.activeIndex)
	      }
	    }
	  }, _vm.unrecognizedListeners), [_c('div', [_vm._t("default")], 2), _vm._v(" "), _c('div')])
	},staticRenderFns: []}

/***/ },
/* 90 */
/***/ function(module, exports, __webpack_require__) {

	var Component = __webpack_require__(38)(
	  /* script */
	  __webpack_require__(91),
	  /* template */
	  __webpack_require__(92),
	  /* styles */
	  null,
	  /* scopeId */
	  null,
	  /* moduleIdentifier (server only) */
	  null
	)
	
	module.exports = Component.exports


/***/ },
/* 91 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _extends2 = __webpack_require__(40);
	
	var _extends3 = _interopRequireDefault(_extends2);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	exports.default = {
	  inject: ['tabbar'],
	
	  props: {
	    page: {},
	    props: {},
	    active: {
	      type: Boolean
	    }
	  },
	
	  methods: {
	    action: function action() {
	      var runDefault = true;
	      this.$emit('click', { preventDefault: function preventDefault() {
	          return runDefault = false;
	        } });
	
	      if (runDefault) {
	        this.tabbar.$el.setActiveTab(this.$el.index, (0, _extends3.default)({ reject: false }, this.tabbar.options));
	      }
	    }
	  },
	
	  watch: {
	    active: function active() {
	      this.$el.setActive(this.active);
	    }
	  }
	};

/***/ },
/* 92 */
/***/ function(module, exports) {

	module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._c;
	  return _c('ons-tab', {
	    attrs: {
	      "active": _vm.active
	    },
	    domProps: {
	      "onClick": _vm.action
	    }
	  })
	},staticRenderFns: []}

/***/ },
/* 93 */
/***/ function(module, exports, __webpack_require__) {

	var Component = __webpack_require__(38)(
	  /* script */
	  __webpack_require__(94),
	  /* template */
	  __webpack_require__(99),
	  /* styles */
	  null,
	  /* scopeId */
	  null,
	  /* moduleIdentifier (server only) */
	  null
	)
	
	module.exports = Component.exports


/***/ },
/* 94 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _extends2 = __webpack_require__(40);
	
	var _extends3 = _interopRequireDefault(_extends2);
	
	var _getOwnPropertyDescriptor = __webpack_require__(95);
	
	var _getOwnPropertyDescriptor2 = _interopRequireDefault(_getOwnPropertyDescriptor);
	
	var _mixins = __webpack_require__(47);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	exports.default = {
	  mixins: [_mixins.deriveEvents, _mixins.hasOptions, _mixins.hidable, _mixins.selfProvider],
	
	  props: {
	    index: {
	      type: Number
	    },
	    tabs: {
	      type: Array,
	      validator: function validator(value) {
	        return value.every(function (tab) {
	          return ['icon', 'label', 'page'].some(function (prop) {
	            return !!(0, _getOwnPropertyDescriptor2.default)(tab, prop);
	          });
	        });
	      }
	    },
	    onSwipe: {
	      type: Function
	    },
	    tabbarStyle: {
	      type: null
	    }
	  },
	
	  methods: {
	    _tabKey: function _tabKey(tab) {
	      return tab.key || tab.label || tab.icon;
	    }
	  },
	
	  watch: {
	    index: function index() {
	      if (this.index !== this.$el.getActiveTabIndex()) {
	        this.$el.setActiveTab(this.index, (0, _extends3.default)({ reject: false }, this.options));
	      }
	    }
	  }
	};

/***/ },
/* 95 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(96), __esModule: true };

/***/ },
/* 96 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(97);
	var $Object = __webpack_require__(23).Object;
	module.exports = function getOwnPropertyDescriptor(it, key){
	  return $Object.getOwnPropertyDescriptor(it, key);
	};

/***/ },
/* 97 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
	var toIObject                 = __webpack_require__(9)
	  , $getOwnPropertyDescriptor = __webpack_require__(98).f;
	
	__webpack_require__(21)('getOwnPropertyDescriptor', function(){
	  return function getOwnPropertyDescriptor(it, key){
	    return $getOwnPropertyDescriptor(toIObject(it), key);
	  };
	});

/***/ },
/* 98 */
/***/ function(module, exports, __webpack_require__) {

	var pIE            = __webpack_require__(46)
	  , createDesc     = __webpack_require__(35)
	  , toIObject      = __webpack_require__(9)
	  , toPrimitive    = __webpack_require__(34)
	  , has            = __webpack_require__(8)
	  , IE8_DOM_DEFINE = __webpack_require__(30)
	  , gOPD           = Object.getOwnPropertyDescriptor;
	
	exports.f = __webpack_require__(31) ? gOPD : function getOwnPropertyDescriptor(O, P){
	  O = toIObject(O);
	  P = toPrimitive(P, true);
	  if(IE8_DOM_DEFINE)try {
	    return gOPD(O, P);
	  } catch(e){ /* empty */ }
	  if(has(O, P))return createDesc(!pIE.f.call(O, P), O[P]);
	};

/***/ },
/* 99 */
/***/ function(module, exports) {

	module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._c;
	  return _c('ons-tabbar', _vm._g({
	    attrs: {
	      "activeIndex": _vm.index
	    },
	    domProps: {
	      "onSwipe": _vm.onSwipe
	    },
	    on: {
	      "prechange": function($event) {
	        if ($event.target !== $event.currentTarget) { return null; }
	        _vm.$nextTick(function () { return !$event.detail.canceled && _vm.$emit('update:index', $event.index); })
	      }
	    }
	  }, _vm.unrecognizedListeners), [_c('div', {
	    staticClass: "tabbar__content"
	  }, [_c('div', [_vm._t("pages", _vm._l((_vm.tabs), function(tab) {
	    return _c(tab.page, _vm._g(_vm._b({
	      key: (tab.page.key || tab.page.name || _vm._tabKey(tab)),
	      tag: "component"
	    }, 'component', tab.props, false), _vm.unrecognizedListeners))
	  }))], 2), _vm._v(" "), _c('div')]), _vm._v(" "), _c('div', {
	    staticClass: "tabbar",
	    style: (_vm.tabbarStyle)
	  }, [_vm._t("default", _vm._l((_vm.tabs), function(tab) {
	    return _c('v-ons-tab', _vm._b({
	      key: _vm._tabKey(tab)
	    }, 'v-ons-tab', tab, false))
	  })), _vm._v(" "), _c('div', {
	    staticClass: "tabbar__border"
	  })], 2)])
	},staticRenderFns: []}

/***/ },
/* 100 */
/***/ function(module, exports, __webpack_require__) {

	var Component = __webpack_require__(38)(
	  /* script */
	  __webpack_require__(101),
	  /* template */
	  __webpack_require__(102),
	  /* styles */
	  null,
	  /* scopeId */
	  null,
	  /* moduleIdentifier (server only) */
	  null
	)
	
	module.exports = Component.exports


/***/ },
/* 101 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = {
	  inject: ['navigator'],
	
	  methods: {
	    action: function action() {
	      var runDefault = true;
	      this.$emit('click', { preventDefault: function preventDefault() {
	          return runDefault = false;
	        } });
	
	      if (runDefault && this.navigator.pageStack.length > 1) {
	        this.navigator.popPage();
	      }
	    }
	  }
	};

/***/ },
/* 102 */
/***/ function(module, exports) {

	module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._c;
	  return _c('ons-back-button', {
	    domProps: {
	      "onClick": _vm.action
	    }
	  }, [_vm._t("default")], 2)
	},staticRenderFns: []}

/***/ },
/* 103 */
/***/ function(module, exports, __webpack_require__) {

	var Component = __webpack_require__(38)(
	  /* script */
	  __webpack_require__(104),
	  /* template */
	  __webpack_require__(121),
	  /* styles */
	  null,
	  /* scopeId */
	  null,
	  /* moduleIdentifier (server only) */
	  null
	)
	
	module.exports = Component.exports


/***/ },
/* 104 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _extends2 = __webpack_require__(40);
	
	var _extends3 = _interopRequireDefault(_extends2);
	
	var _promise = __webpack_require__(105);
	
	var _promise2 = _interopRequireDefault(_promise);
	
	var _mixins = __webpack_require__(47);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	exports.default = {
	  mixins: [_mixins.hasOptions, _mixins.selfProvider, _mixins.deriveEvents, _mixins.deriveDBB],
	
	  props: {
	    pageStack: {
	      type: Array,
	      required: true
	    },
	    popPage: {
	      type: Function,
	      default: function _default() {
	        this.pageStack.pop();
	      }
	    }
	  },
	
	  methods: {
	    isReady: function isReady() {
	      if (this.hasOwnProperty('_ready') && this._ready instanceof _promise2.default) {
	        return this._ready;
	      }
	      return _promise2.default.resolve();
	    },
	    onDeviceBackButton: function onDeviceBackButton(event) {
	      if (this.pageStack.length > 1) {
	        this.popPage();
	      } else {
	        event.callParentHandler();
	      }
	    },
	    _findScrollPage: function _findScrollPage(page) {
	      var nextPage = page._contentElement.children.length === 1 && this.$ons._ons._util.getTopPage(page._contentElement.children[0]);
	      return nextPage ? this._findScrollPage(nextPage) : page;
	    },
	    _setPagesVisibility: function _setPagesVisibility(start, end, visibility) {
	      for (var i = start; i < end - 1; i++) {
	        this.$children[i].$el.style.visibility = visibility;
	      }
	    },
	    _reattachPage: function _reattachPage(pageElement) {
	      var position = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
	      var restoreScroll = arguments[2];
	
	      this.$el.insertBefore(pageElement, position);
	      restoreScroll instanceof Function && restoreScroll();
	      pageElement._isShown = true;
	    },
	    _redetachPage: function _redetachPage(pageElement) {
	      pageElement._destroy();
	      return _promise2.default.resolve();
	    },
	    _animate: function _animate(_ref) {
	      var _this = this;
	
	      var lastLength = _ref.lastLength,
	          currentLength = _ref.currentLength,
	          lastTopPage = _ref.lastTopPage,
	          currentTopPage = _ref.currentTopPage,
	          restoreScroll = _ref.restoreScroll;
	
	      if (currentLength > lastLength) {
	        var isReattached = false;
	        if (lastTopPage.parentElement !== this.$el) {
	          this._reattachPage(lastTopPage, this.$el.children[lastLength - 1], restoreScroll);
	          isReattached = true;
	          lastLength--;
	        }
	        this._setPagesVisibility(lastLength, currentLength, 'hidden');
	
	        return this.$el._pushPage((0, _extends3.default)({}, this.options, { leavePage: lastTopPage })).then(function () {
	          _this._setPagesVisibility(lastLength, currentLength, '');
	          if (isReattached) {
	            _this._redetachPage(lastTopPage);
	          }
	        });
	      }
	
	      if (currentLength < lastLength) {
	        this._reattachPage(lastTopPage, null, restoreScroll);
	        return this.$el._popPage((0, _extends3.default)({}, this.options), function () {
	          return _this._redetachPage(lastTopPage);
	        });
	      }
	
	      this._reattachPage(lastTopPage, currentTopPage, restoreScroll);
	      return this.$el._pushPage((0, _extends3.default)({}, this.options, { _replacePage: true })).then(function () {
	        return _this._redetachPage(lastTopPage);
	      });
	    },
	    _checkSwipe: function _checkSwipe(event) {
	      if (this.$el.hasAttribute('swipeable') && event.leavePage !== this.$el.lastChild && event.leavePage === this.$children[this.$children.length - 1].$el) {
	        this.popPage();
	      }
	    }
	  },
	
	  watch: {
	    pageStack: function pageStack(after, before) {
	      var _this2 = this;
	
	      if (this.$el.hasAttribute('swipeable') && this.$children.length !== this.$el.children.length) {
	        return;
	      }
	
	      var propWasMutated = after === before;
	
	      var lastLength = propWasMutated ? this.$children.length : before.length;
	      var lastTopPage = this.$children[this.$children.length - 1].$el;
	
	      var scrollElement = this._findScrollPage(lastTopPage);
	      var scrollValue = scrollElement.scrollTop || 0;
	      var restoreScroll = function restoreScroll() {
	        return scrollElement.scrollTop = scrollValue;
	      };
	
	      this.$nextTick(function () {
	        var currentLength = propWasMutated ? _this2.$children.length : after.length;
	        var currentTopPage = _this2.$children[_this2.$children.length - 1].$el;
	
	        if (currentTopPage !== lastTopPage) {
	          _this2._ready = _this2._animate({ lastLength: lastLength, currentLength: currentLength, lastTopPage: lastTopPage, currentTopPage: currentTopPage, restoreScroll: restoreScroll });
	        } else if (currentLength !== lastLength) {
	          currentTopPage.updateBackButton(currentLength > 1);
	        }
	
	        lastTopPage = currentTopPage = null;
	      });
	    }
	  }
	};

/***/ },
/* 105 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(106), __esModule: true };

/***/ },
/* 106 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(107);
	__webpack_require__(60);
	__webpack_require__(108);
	__webpack_require__(112);
	module.exports = __webpack_require__(23).Promise;

/***/ },
/* 107 */
/***/ function(module, exports) {



/***/ },
/* 108 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(109);
	var global        = __webpack_require__(18)
	  , hide          = __webpack_require__(26)
	  , Iterators     = __webpack_require__(65)
	  , TO_STRING_TAG = __webpack_require__(71)('toStringTag');
	
	for(var collections = ['NodeList', 'DOMTokenList', 'MediaList', 'StyleSheetList', 'CSSRuleList'], i = 0; i < 5; i++){
	  var NAME       = collections[i]
	    , Collection = global[NAME]
	    , proto      = Collection && Collection.prototype;
	  if(proto && !proto[TO_STRING_TAG])hide(proto, TO_STRING_TAG, NAME);
	  Iterators[NAME] = Iterators.Array;
	}

/***/ },
/* 109 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var addToUnscopables = __webpack_require__(110)
	  , step             = __webpack_require__(111)
	  , Iterators        = __webpack_require__(65)
	  , toIObject        = __webpack_require__(9);
	
	// 22.1.3.4 Array.prototype.entries()
	// 22.1.3.13 Array.prototype.keys()
	// 22.1.3.29 Array.prototype.values()
	// 22.1.3.30 Array.prototype[@@iterator]()
	module.exports = __webpack_require__(62)(Array, 'Array', function(iterated, kind){
	  this._t = toIObject(iterated); // target
	  this._i = 0;                   // next index
	  this._k = kind;                // kind
	// 22.1.5.2.1 %ArrayIteratorPrototype%.next()
	}, function(){
	  var O     = this._t
	    , kind  = this._k
	    , index = this._i++;
	  if(!O || index >= O.length){
	    this._t = undefined;
	    return step(1);
	  }
	  if(kind == 'keys'  )return step(0, index);
	  if(kind == 'values')return step(0, O[index]);
	  return step(0, [index, O[index]]);
	}, 'values');
	
	// argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
	Iterators.Arguments = Iterators.Array;
	
	addToUnscopables('keys');
	addToUnscopables('values');
	addToUnscopables('entries');

/***/ },
/* 110 */
/***/ function(module, exports) {

	module.exports = function(){ /* empty */ };

/***/ },
/* 111 */
/***/ function(module, exports) {

	module.exports = function(done, value){
	  return {value: value, done: !!done};
	};

/***/ },
/* 112 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var LIBRARY            = __webpack_require__(63)
	  , global             = __webpack_require__(18)
	  , ctx                = __webpack_require__(24)
	  , classof            = __webpack_require__(78)
	  , $export            = __webpack_require__(22)
	  , isObject           = __webpack_require__(29)
	  , aFunction          = __webpack_require__(25)
	  , anInstance         = __webpack_require__(113)
	  , forOf              = __webpack_require__(114)
	  , speciesConstructor = __webpack_require__(115)
	  , task               = __webpack_require__(116).set
	  , microtask          = __webpack_require__(118)()
	  , PROMISE            = 'Promise'
	  , TypeError          = global.TypeError
	  , process            = global.process
	  , $Promise           = global[PROMISE]
	  , process            = global.process
	  , isNode             = classof(process) == 'process'
	  , empty              = function(){ /* empty */ }
	  , Internal, GenericPromiseCapability, Wrapper;
	
	var USE_NATIVE = !!function(){
	  try {
	    // correct subclassing with @@species support
	    var promise     = $Promise.resolve(1)
	      , FakePromise = (promise.constructor = {})[__webpack_require__(71)('species')] = function(exec){ exec(empty, empty); };
	    // unhandled rejections tracking support, NodeJS Promise without it fails @@species test
	    return (isNode || typeof PromiseRejectionEvent == 'function') && promise.then(empty) instanceof FakePromise;
	  } catch(e){ /* empty */ }
	}();
	
	// helpers
	var sameConstructor = function(a, b){
	  // with library wrapper special case
	  return a === b || a === $Promise && b === Wrapper;
	};
	var isThenable = function(it){
	  var then;
	  return isObject(it) && typeof (then = it.then) == 'function' ? then : false;
	};
	var newPromiseCapability = function(C){
	  return sameConstructor($Promise, C)
	    ? new PromiseCapability(C)
	    : new GenericPromiseCapability(C);
	};
	var PromiseCapability = GenericPromiseCapability = function(C){
	  var resolve, reject;
	  this.promise = new C(function($$resolve, $$reject){
	    if(resolve !== undefined || reject !== undefined)throw TypeError('Bad Promise constructor');
	    resolve = $$resolve;
	    reject  = $$reject;
	  });
	  this.resolve = aFunction(resolve);
	  this.reject  = aFunction(reject);
	};
	var perform = function(exec){
	  try {
	    exec();
	  } catch(e){
	    return {error: e};
	  }
	};
	var notify = function(promise, isReject){
	  if(promise._n)return;
	  promise._n = true;
	  var chain = promise._c;
	  microtask(function(){
	    var value = promise._v
	      , ok    = promise._s == 1
	      , i     = 0;
	    var run = function(reaction){
	      var handler = ok ? reaction.ok : reaction.fail
	        , resolve = reaction.resolve
	        , reject  = reaction.reject
	        , domain  = reaction.domain
	        , result, then;
	      try {
	        if(handler){
	          if(!ok){
	            if(promise._h == 2)onHandleUnhandled(promise);
	            promise._h = 1;
	          }
	          if(handler === true)result = value;
	          else {
	            if(domain)domain.enter();
	            result = handler(value);
	            if(domain)domain.exit();
	          }
	          if(result === reaction.promise){
	            reject(TypeError('Promise-chain cycle'));
	          } else if(then = isThenable(result)){
	            then.call(result, resolve, reject);
	          } else resolve(result);
	        } else reject(value);
	      } catch(e){
	        reject(e);
	      }
	    };
	    while(chain.length > i)run(chain[i++]); // variable length - can't use forEach
	    promise._c = [];
	    promise._n = false;
	    if(isReject && !promise._h)onUnhandled(promise);
	  });
	};
	var onUnhandled = function(promise){
	  task.call(global, function(){
	    var value = promise._v
	      , abrupt, handler, console;
	    if(isUnhandled(promise)){
	      abrupt = perform(function(){
	        if(isNode){
	          process.emit('unhandledRejection', value, promise);
	        } else if(handler = global.onunhandledrejection){
	          handler({promise: promise, reason: value});
	        } else if((console = global.console) && console.error){
	          console.error('Unhandled promise rejection', value);
	        }
	      });
	      // Browsers should not trigger `rejectionHandled` event if it was handled here, NodeJS - should
	      promise._h = isNode || isUnhandled(promise) ? 2 : 1;
	    } promise._a = undefined;
	    if(abrupt)throw abrupt.error;
	  });
	};
	var isUnhandled = function(promise){
	  if(promise._h == 1)return false;
	  var chain = promise._a || promise._c
	    , i     = 0
	    , reaction;
	  while(chain.length > i){
	    reaction = chain[i++];
	    if(reaction.fail || !isUnhandled(reaction.promise))return false;
	  } return true;
	};
	var onHandleUnhandled = function(promise){
	  task.call(global, function(){
	    var handler;
	    if(isNode){
	      process.emit('rejectionHandled', promise);
	    } else if(handler = global.onrejectionhandled){
	      handler({promise: promise, reason: promise._v});
	    }
	  });
	};
	var $reject = function(value){
	  var promise = this;
	  if(promise._d)return;
	  promise._d = true;
	  promise = promise._w || promise; // unwrap
	  promise._v = value;
	  promise._s = 2;
	  if(!promise._a)promise._a = promise._c.slice();
	  notify(promise, true);
	};
	var $resolve = function(value){
	  var promise = this
	    , then;
	  if(promise._d)return;
	  promise._d = true;
	  promise = promise._w || promise; // unwrap
	  try {
	    if(promise === value)throw TypeError("Promise can't be resolved itself");
	    if(then = isThenable(value)){
	      microtask(function(){
	        var wrapper = {_w: promise, _d: false}; // wrap
	        try {
	          then.call(value, ctx($resolve, wrapper, 1), ctx($reject, wrapper, 1));
	        } catch(e){
	          $reject.call(wrapper, e);
	        }
	      });
	    } else {
	      promise._v = value;
	      promise._s = 1;
	      notify(promise, false);
	    }
	  } catch(e){
	    $reject.call({_w: promise, _d: false}, e); // wrap
	  }
	};
	
	// constructor polyfill
	if(!USE_NATIVE){
	  // 25.4.3.1 Promise(executor)
	  $Promise = function Promise(executor){
	    anInstance(this, $Promise, PROMISE, '_h');
	    aFunction(executor);
	    Internal.call(this);
	    try {
	      executor(ctx($resolve, this, 1), ctx($reject, this, 1));
	    } catch(err){
	      $reject.call(this, err);
	    }
	  };
	  Internal = function Promise(executor){
	    this._c = [];             // <- awaiting reactions
	    this._a = undefined;      // <- checked in isUnhandled reactions
	    this._s = 0;              // <- state
	    this._d = false;          // <- done
	    this._v = undefined;      // <- value
	    this._h = 0;              // <- rejection state, 0 - default, 1 - handled, 2 - unhandled
	    this._n = false;          // <- notify
	  };
	  Internal.prototype = __webpack_require__(119)($Promise.prototype, {
	    // 25.4.5.3 Promise.prototype.then(onFulfilled, onRejected)
	    then: function then(onFulfilled, onRejected){
	      var reaction    = newPromiseCapability(speciesConstructor(this, $Promise));
	      reaction.ok     = typeof onFulfilled == 'function' ? onFulfilled : true;
	      reaction.fail   = typeof onRejected == 'function' && onRejected;
	      reaction.domain = isNode ? process.domain : undefined;
	      this._c.push(reaction);
	      if(this._a)this._a.push(reaction);
	      if(this._s)notify(this, false);
	      return reaction.promise;
	    },
	    // 25.4.5.1 Promise.prototype.catch(onRejected)
	    'catch': function(onRejected){
	      return this.then(undefined, onRejected);
	    }
	  });
	  PromiseCapability = function(){
	    var promise  = new Internal;
	    this.promise = promise;
	    this.resolve = ctx($resolve, promise, 1);
	    this.reject  = ctx($reject, promise, 1);
	  };
	}
	
	$export($export.G + $export.W + $export.F * !USE_NATIVE, {Promise: $Promise});
	__webpack_require__(70)($Promise, PROMISE);
	__webpack_require__(120)(PROMISE);
	Wrapper = __webpack_require__(23)[PROMISE];
	
	// statics
	$export($export.S + $export.F * !USE_NATIVE, PROMISE, {
	  // 25.4.4.5 Promise.reject(r)
	  reject: function reject(r){
	    var capability = newPromiseCapability(this)
	      , $$reject   = capability.reject;
	    $$reject(r);
	    return capability.promise;
	  }
	});
	$export($export.S + $export.F * (LIBRARY || !USE_NATIVE), PROMISE, {
	  // 25.4.4.6 Promise.resolve(x)
	  resolve: function resolve(x){
	    // instanceof instead of internal slot check because we should fix it without replacement native Promise core
	    if(x instanceof $Promise && sameConstructor(x.constructor, this))return x;
	    var capability = newPromiseCapability(this)
	      , $$resolve  = capability.resolve;
	    $$resolve(x);
	    return capability.promise;
	  }
	});
	$export($export.S + $export.F * !(USE_NATIVE && __webpack_require__(79)(function(iter){
	  $Promise.all(iter)['catch'](empty);
	})), PROMISE, {
	  // 25.4.4.1 Promise.all(iterable)
	  all: function all(iterable){
	    var C          = this
	      , capability = newPromiseCapability(C)
	      , resolve    = capability.resolve
	      , reject     = capability.reject;
	    var abrupt = perform(function(){
	      var values    = []
	        , index     = 0
	        , remaining = 1;
	      forOf(iterable, false, function(promise){
	        var $index        = index++
	          , alreadyCalled = false;
	        values.push(undefined);
	        remaining++;
	        C.resolve(promise).then(function(value){
	          if(alreadyCalled)return;
	          alreadyCalled  = true;
	          values[$index] = value;
	          --remaining || resolve(values);
	        }, reject);
	      });
	      --remaining || resolve(values);
	    });
	    if(abrupt)reject(abrupt.error);
	    return capability.promise;
	  },
	  // 25.4.4.4 Promise.race(iterable)
	  race: function race(iterable){
	    var C          = this
	      , capability = newPromiseCapability(C)
	      , reject     = capability.reject;
	    var abrupt = perform(function(){
	      forOf(iterable, false, function(promise){
	        C.resolve(promise).then(capability.resolve, reject);
	      });
	    });
	    if(abrupt)reject(abrupt.error);
	    return capability.promise;
	  }
	});

/***/ },
/* 113 */
/***/ function(module, exports) {

	module.exports = function(it, Constructor, name, forbiddenField){
	  if(!(it instanceof Constructor) || (forbiddenField !== undefined && forbiddenField in it)){
	    throw TypeError(name + ': incorrect invocation!');
	  } return it;
	};

/***/ },
/* 114 */
/***/ function(module, exports, __webpack_require__) {

	var ctx         = __webpack_require__(24)
	  , call        = __webpack_require__(74)
	  , isArrayIter = __webpack_require__(75)
	  , anObject    = __webpack_require__(28)
	  , toLength    = __webpack_require__(13)
	  , getIterFn   = __webpack_require__(77)
	  , BREAK       = {}
	  , RETURN      = {};
	var exports = module.exports = function(iterable, entries, fn, that, ITERATOR){
	  var iterFn = ITERATOR ? function(){ return iterable; } : getIterFn(iterable)
	    , f      = ctx(fn, that, entries ? 2 : 1)
	    , index  = 0
	    , length, step, iterator, result;
	  if(typeof iterFn != 'function')throw TypeError(iterable + ' is not iterable!');
	  // fast case for arrays with default iterator
	  if(isArrayIter(iterFn))for(length = toLength(iterable.length); length > index; index++){
	    result = entries ? f(anObject(step = iterable[index])[0], step[1]) : f(iterable[index]);
	    if(result === BREAK || result === RETURN)return result;
	  } else for(iterator = iterFn.call(iterable); !(step = iterator.next()).done; ){
	    result = call(iterator, f, step.value, entries);
	    if(result === BREAK || result === RETURN)return result;
	  }
	};
	exports.BREAK  = BREAK;
	exports.RETURN = RETURN;

/***/ },
/* 115 */
/***/ function(module, exports, __webpack_require__) {

	// 7.3.20 SpeciesConstructor(O, defaultConstructor)
	var anObject  = __webpack_require__(28)
	  , aFunction = __webpack_require__(25)
	  , SPECIES   = __webpack_require__(71)('species');
	module.exports = function(O, D){
	  var C = anObject(O).constructor, S;
	  return C === undefined || (S = anObject(C)[SPECIES]) == undefined ? D : aFunction(S);
	};

/***/ },
/* 116 */
/***/ function(module, exports, __webpack_require__) {

	var ctx                = __webpack_require__(24)
	  , invoke             = __webpack_require__(117)
	  , html               = __webpack_require__(69)
	  , cel                = __webpack_require__(33)
	  , global             = __webpack_require__(18)
	  , process            = global.process
	  , setTask            = global.setImmediate
	  , clearTask          = global.clearImmediate
	  , MessageChannel     = global.MessageChannel
	  , counter            = 0
	  , queue              = {}
	  , ONREADYSTATECHANGE = 'onreadystatechange'
	  , defer, channel, port;
	var run = function(){
	  var id = +this;
	  if(queue.hasOwnProperty(id)){
	    var fn = queue[id];
	    delete queue[id];
	    fn();
	  }
	};
	var listener = function(event){
	  run.call(event.data);
	};
	// Node.js 0.9+ & IE10+ has setImmediate, otherwise:
	if(!setTask || !clearTask){
	  setTask = function setImmediate(fn){
	    var args = [], i = 1;
	    while(arguments.length > i)args.push(arguments[i++]);
	    queue[++counter] = function(){
	      invoke(typeof fn == 'function' ? fn : Function(fn), args);
	    };
	    defer(counter);
	    return counter;
	  };
	  clearTask = function clearImmediate(id){
	    delete queue[id];
	  };
	  // Node.js 0.8-
	  if(__webpack_require__(11)(process) == 'process'){
	    defer = function(id){
	      process.nextTick(ctx(run, id, 1));
	    };
	  // Browsers with MessageChannel, includes WebWorkers
	  } else if(MessageChannel){
	    channel = new MessageChannel;
	    port    = channel.port2;
	    channel.port1.onmessage = listener;
	    defer = ctx(port.postMessage, port, 1);
	  // Browsers with postMessage, skip WebWorkers
	  // IE8 has postMessage, but it's sync & typeof its postMessage is 'object'
	  } else if(global.addEventListener && typeof postMessage == 'function' && !global.importScripts){
	    defer = function(id){
	      global.postMessage(id + '', '*');
	    };
	    global.addEventListener('message', listener, false);
	  // IE8-
	  } else if(ONREADYSTATECHANGE in cel('script')){
	    defer = function(id){
	      html.appendChild(cel('script'))[ONREADYSTATECHANGE] = function(){
	        html.removeChild(this);
	        run.call(id);
	      };
	    };
	  // Rest old browsers
	  } else {
	    defer = function(id){
	      setTimeout(ctx(run, id, 1), 0);
	    };
	  }
	}
	module.exports = {
	  set:   setTask,
	  clear: clearTask
	};

/***/ },
/* 117 */
/***/ function(module, exports) {

	// fast apply, http://jsperf.lnkit.com/fast-apply/5
	module.exports = function(fn, args, that){
	  var un = that === undefined;
	  switch(args.length){
	    case 0: return un ? fn()
	                      : fn.call(that);
	    case 1: return un ? fn(args[0])
	                      : fn.call(that, args[0]);
	    case 2: return un ? fn(args[0], args[1])
	                      : fn.call(that, args[0], args[1]);
	    case 3: return un ? fn(args[0], args[1], args[2])
	                      : fn.call(that, args[0], args[1], args[2]);
	    case 4: return un ? fn(args[0], args[1], args[2], args[3])
	                      : fn.call(that, args[0], args[1], args[2], args[3]);
	  } return              fn.apply(that, args);
	};

/***/ },
/* 118 */
/***/ function(module, exports, __webpack_require__) {

	var global    = __webpack_require__(18)
	  , macrotask = __webpack_require__(116).set
	  , Observer  = global.MutationObserver || global.WebKitMutationObserver
	  , process   = global.process
	  , Promise   = global.Promise
	  , isNode    = __webpack_require__(11)(process) == 'process';
	
	module.exports = function(){
	  var head, last, notify;
	
	  var flush = function(){
	    var parent, fn;
	    if(isNode && (parent = process.domain))parent.exit();
	    while(head){
	      fn   = head.fn;
	      head = head.next;
	      try {
	        fn();
	      } catch(e){
	        if(head)notify();
	        else last = undefined;
	        throw e;
	      }
	    } last = undefined;
	    if(parent)parent.enter();
	  };
	
	  // Node.js
	  if(isNode){
	    notify = function(){
	      process.nextTick(flush);
	    };
	  // browsers with MutationObserver
	  } else if(Observer){
	    var toggle = true
	      , node   = document.createTextNode('');
	    new Observer(flush).observe(node, {characterData: true}); // eslint-disable-line no-new
	    notify = function(){
	      node.data = toggle = !toggle;
	    };
	  // environments with maybe non-completely correct, but existent Promise
	  } else if(Promise && Promise.resolve){
	    var promise = Promise.resolve();
	    notify = function(){
	      promise.then(flush);
	    };
	  // for other environments - macrotask based on:
	  // - setImmediate
	  // - MessageChannel
	  // - window.postMessag
	  // - onreadystatechange
	  // - setTimeout
	  } else {
	    notify = function(){
	      // strange IE + webpack dev server bug - use .call(global)
	      macrotask.call(global, flush);
	    };
	  }
	
	  return function(fn){
	    var task = {fn: fn, next: undefined};
	    if(last)last.next = task;
	    if(!head){
	      head = task;
	      notify();
	    } last = task;
	  };
	};

/***/ },
/* 119 */
/***/ function(module, exports, __webpack_require__) {

	var hide = __webpack_require__(26);
	module.exports = function(target, src, safe){
	  for(var key in src){
	    if(safe && target[key])target[key] = src[key];
	    else hide(target, key, src[key]);
	  } return target;
	};

/***/ },
/* 120 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var global      = __webpack_require__(18)
	  , core        = __webpack_require__(23)
	  , dP          = __webpack_require__(27)
	  , DESCRIPTORS = __webpack_require__(31)
	  , SPECIES     = __webpack_require__(71)('species');
	
	module.exports = function(KEY){
	  var C = typeof core[KEY] == 'function' ? core[KEY] : global[KEY];
	  if(DESCRIPTORS && C && !C[SPECIES])dP.f(C, SPECIES, {
	    configurable: true,
	    get: function(){ return this; }
	  });
	};

/***/ },
/* 121 */
/***/ function(module, exports) {

	module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._c;
	  return _c('ons-navigator', _vm._g({
	    on: {
	      "postpop": function($event) {
	        if ($event.target !== $event.currentTarget) { return null; }
	        _vm._checkSwipe($event)
	      }
	    }
	  }, _vm.unrecognizedListeners), [_vm._t("default", _vm._l((_vm.pageStack), function(page) {
	    return _c(page, _vm._g({
	      key: page.key || page.name,
	      tag: "component"
	    }, _vm.unrecognizedListeners))
	  }))], 2)
	},staticRenderFns: []}

/***/ },
/* 122 */
/***/ function(module, exports, __webpack_require__) {

	var Component = __webpack_require__(38)(
	  /* script */
	  __webpack_require__(123),
	  /* template */
	  __webpack_require__(124),
	  /* styles */
	  null,
	  /* scopeId */
	  null,
	  /* moduleIdentifier (server only) */
	  null
	)
	
	module.exports = Component.exports


/***/ },
/* 123 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _mixins = __webpack_require__(47);
	
	exports.default = {
	  mixins: [_mixins.hasOptions, _mixins.deriveEvents],
	
	  props: {
	    open: {
	      type: Boolean,
	      default: undefined
	    }
	  },
	
	  methods: {
	    action: function action() {
	      this._shouldUpdate() && this.$el[this.open ? 'open' : 'close'].call(this.$el, this.options).catch(function () {});
	    },
	    _shouldUpdate: function _shouldUpdate() {
	      return this.open !== undefined && this.open !== this.$el.isOpen;
	    }
	  },
	
	  watch: {
	    open: function open() {
	      this.action();
	    }
	  },
	
	  mounted: function mounted() {
	    var _this = this;
	
	    this.$on(['postopen', 'postclose', 'modechange'], function () {
	      return _this._shouldUpdate() && _this.$emit('update:open', _this.$el.isOpen);
	    });
	
	    this.action();
	  }
	};

/***/ },
/* 124 */
/***/ function(module, exports) {

	module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._c;
	  return _c('ons-splitter-side', _vm._g({}, _vm.unrecognizedListeners), [_vm._t("default")], 2)
	},staticRenderFns: []}

/***/ },
/* 125 */
/***/ function(module, exports, __webpack_require__) {

	var Component = __webpack_require__(38)(
	  /* script */
	  __webpack_require__(126),
	  /* template */
	  __webpack_require__(127),
	  /* styles */
	  null,
	  /* scopeId */
	  null,
	  /* moduleIdentifier (server only) */
	  null
	)
	
	module.exports = Component.exports


/***/ },
/* 126 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = {
	  props: {
	    renderItem: {
	      type: Function,
	      required: true,
	      validator: function validator(value) {
	        var component = value(0);
	        if (component._isVue && !component._isMounted) {
	          component.$destroy();
	          return true;
	        }
	        return false;
	      }
	    },
	    length: {
	      type: Number,
	      required: true
	    },
	    calculateItemHeight: {
	      type: Function,
	      default: undefined
	    }
	  },
	
	  data: function data() {
	    return {
	      provider: null
	    };
	  },
	
	
	  methods: {
	    _setup: function _setup() {
	      var _this = this;
	
	      this.provider && this.provider.destroy();
	
	      var delegate = new this.$ons._ons._internal.LazyRepeatDelegate({
	        calculateItemHeight: this.calculateItemHeight,
	        createItemContent: function createItemContent(i) {
	          return _this.renderItem(i).$mount().$el;
	        },
	        destroyItem: function destroyItem(i, _ref) {
	          var element = _ref.element;
	          return element.__vue__.$destroy();
	        },
	        countItems: function countItems() {
	          return _this.length;
	        }
	      }, null);
	
	      this.provider = new this.$ons._ons._internal.LazyRepeatProvider(this.$parent.$el, delegate);
	    },
	    refresh: function refresh() {
	      return this.provider.refresh();
	    }
	  },
	
	  watch: {
	    renderItem: function renderItem() {
	      this._setup();
	    },
	    length: function length() {
	      this._setup();
	    },
	    calculateItemHeight: function calculateItemHeight() {
	      this._setup();
	    }
	  },
	
	  mounted: function mounted() {
	    this._setup();
	    this.$vnode.context.$on('refresh', this.refresh);
	  },
	  beforeDestroy: function beforeDestroy() {
	    this.$vnode.context.$off('refresh', this.refresh);
	
	    this.$el._lazyRepeatProvider = this.provider;
	    this.provider = null;
	  }
	};

/***/ },
/* 127 */
/***/ function(module, exports) {

	module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._c;
	  return _c('ons-lazy-repeat')
	},staticRenderFns: []}

/***/ },
/* 128 */
/***/ function(module, exports, __webpack_require__) {

	var Component = __webpack_require__(38)(
	  /* script */
	  __webpack_require__(129),
	  /* template */
	  __webpack_require__(130),
	  /* styles */
	  null,
	  /* scopeId */
	  null,
	  /* moduleIdentifier (server only) */
	  null
	)
	
	module.exports = Component.exports


/***/ },
/* 129 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _mixins = __webpack_require__(47);
	
	exports.default = {
	  mixins: [_mixins.modelInput]
	};

/***/ },
/* 130 */
/***/ function(module, exports) {

	module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._c;
	  return _c('ons-select', _vm._g({}, _vm.$listeners), [_c('select', [_vm._t("default")], 2)])
	},staticRenderFns: []}

/***/ },
/* 131 */
/***/ function(module, exports, __webpack_require__) {

	var Component = __webpack_require__(38)(
	  /* script */
	  __webpack_require__(132),
	  /* template */
	  __webpack_require__(133),
	  /* styles */
	  null,
	  /* scopeId */
	  null,
	  /* moduleIdentifier (server only) */
	  null
	)
	
	module.exports = Component.exports


/***/ },
/* 132 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _mixins = __webpack_require__(47);
	
	exports.default = {
	  mixins: [_mixins.deriveEvents],
	
	  props: {
	    index: {
	      type: Number
	    }
	  },
	
	  watch: {
	    index: function index() {
	      if (this.index !== this.$el.getActiveButtonIndex()) {
	        this.$el.setActiveButton(this.index, { reject: false });
	      }
	    }
	  }
	};

/***/ },
/* 133 */
/***/ function(module, exports) {

	module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._c;
	  return _c('ons-segment', {
	    attrs: {
	      "active-index": _vm.index
	    },
	    on: {
	      "postchange": function($event) {
	        if ($event.target !== $event.currentTarget) { return null; }
	        _vm.$emit('update:index', $event.index)
	      }
	    }
	  }, [_vm._t("default")], 2)
	},staticRenderFns: []}

/***/ },
/* 134 */
/***/ function(module, exports, __webpack_require__) {

	var Component = __webpack_require__(38)(
	  /* script */
	  __webpack_require__(135),
	  /* template */
	  __webpack_require__(136),
	  /* styles */
	  null,
	  /* scopeId */
	  null,
	  /* moduleIdentifier (server only) */
	  null
	)
	
	module.exports = Component.exports


/***/ },
/* 135 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _mixins = __webpack_require__(47);
	
	exports.default = {
	  mixins: [_mixins.deriveEvents]
	};

/***/ },
/* 136 */
/***/ function(module, exports) {

	module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._c;
	  return _c(_vm.$options._componentTag.slice(2), _vm._g({
	    tag: "component"
	  }, _vm.unrecognizedListeners), [_vm._t("default")], 2)
	},staticRenderFns: []}

/***/ }
/******/ ])
});
;
//# sourceMappingURL=vue-onsenui.js.map
