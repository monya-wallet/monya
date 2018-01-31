/* vue-onsenui v2.4.2 - 2017-11-21 */

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('onsenui/esm'), require('onsenui/esm/elements/ons-toolbar'), require('onsenui/esm/elements/ons-bottom-toolbar'), require('onsenui/esm/elements/ons-toolbar-button'), require('onsenui/esm/elements/ons-alert-dialog-button'), require('onsenui/esm/elements/ons-button'), require('onsenui/esm/elements/ons-icon'), require('onsenui/esm/elements/ons-card'), require('onsenui/esm/elements/ons-list'), require('onsenui/esm/elements/ons-list-item'), require('onsenui/esm/elements/ons-list-title'), require('onsenui/esm/elements/ons-list-header'), require('onsenui/esm/elements/ons-ripple'), require('onsenui/esm/elements/ons-row'), require('onsenui/esm/elements/ons-col'), require('onsenui/esm/elements/ons-progress-bar'), require('onsenui/esm/elements/ons-progress-circular'), require('onsenui/esm/elements/ons-carousel-item'), require('onsenui/esm/elements/ons-splitter-mask'), require('onsenui/esm/elements/ons-splitter-content'), require('onsenui/esm/elements/ons-splitter'), require('onsenui/esm/elements/ons-switch'), require('onsenui/esm/elements/ons-checkbox'), require('onsenui/esm/elements/ons-input'), require('onsenui/esm/elements/ons-search-input'), require('onsenui/esm/elements/ons-range'), require('onsenui/esm/elements/ons-radio'), require('onsenui/esm/elements/ons-fab'), require('onsenui/esm/elements/ons-speed-dial-item'), require('onsenui/esm/elements/ons-dialog'), require('onsenui/esm/elements/ons-action-sheet'), require('onsenui/esm/elements/ons-action-sheet-button'), require('onsenui/esm/elements/ons-modal'), require('onsenui/esm/elements/ons-toast'), require('onsenui/esm/elements/ons-popover'), require('onsenui/esm/elements/ons-alert-dialog'), require('onsenui/esm/elements/ons-speed-dial'), require('onsenui/esm/elements/ons-carousel'), require('onsenui/esm/elements/ons-tab'), require('onsenui/esm/elements/ons-tabbar'), require('onsenui/esm/elements/ons-back-button'), require('onsenui/esm/elements/ons-navigator'), require('onsenui/esm/elements/ons-splitter-side'), require('onsenui/esm/elements/ons-lazy-repeat'), require('onsenui/esm/elements/ons-select'), require('onsenui/esm/elements/ons-segment'), require('onsenui/esm/elements/ons-pull-hook'), require('onsenui/esm/elements/ons-page')) :
	typeof define === 'function' && define.amd ? define(['onsenui/esm', 'onsenui/esm/elements/ons-toolbar', 'onsenui/esm/elements/ons-bottom-toolbar', 'onsenui/esm/elements/ons-toolbar-button', 'onsenui/esm/elements/ons-alert-dialog-button', 'onsenui/esm/elements/ons-button', 'onsenui/esm/elements/ons-icon', 'onsenui/esm/elements/ons-card', 'onsenui/esm/elements/ons-list', 'onsenui/esm/elements/ons-list-item', 'onsenui/esm/elements/ons-list-title', 'onsenui/esm/elements/ons-list-header', 'onsenui/esm/elements/ons-ripple', 'onsenui/esm/elements/ons-row', 'onsenui/esm/elements/ons-col', 'onsenui/esm/elements/ons-progress-bar', 'onsenui/esm/elements/ons-progress-circular', 'onsenui/esm/elements/ons-carousel-item', 'onsenui/esm/elements/ons-splitter-mask', 'onsenui/esm/elements/ons-splitter-content', 'onsenui/esm/elements/ons-splitter', 'onsenui/esm/elements/ons-switch', 'onsenui/esm/elements/ons-checkbox', 'onsenui/esm/elements/ons-input', 'onsenui/esm/elements/ons-search-input', 'onsenui/esm/elements/ons-range', 'onsenui/esm/elements/ons-radio', 'onsenui/esm/elements/ons-fab', 'onsenui/esm/elements/ons-speed-dial-item', 'onsenui/esm/elements/ons-dialog', 'onsenui/esm/elements/ons-action-sheet', 'onsenui/esm/elements/ons-action-sheet-button', 'onsenui/esm/elements/ons-modal', 'onsenui/esm/elements/ons-toast', 'onsenui/esm/elements/ons-popover', 'onsenui/esm/elements/ons-alert-dialog', 'onsenui/esm/elements/ons-speed-dial', 'onsenui/esm/elements/ons-carousel', 'onsenui/esm/elements/ons-tab', 'onsenui/esm/elements/ons-tabbar', 'onsenui/esm/elements/ons-back-button', 'onsenui/esm/elements/ons-navigator', 'onsenui/esm/elements/ons-splitter-side', 'onsenui/esm/elements/ons-lazy-repeat', 'onsenui/esm/elements/ons-select', 'onsenui/esm/elements/ons-segment', 'onsenui/esm/elements/ons-pull-hook', 'onsenui/esm/elements/ons-page'], factory) :
	(global.VueOnsen = factory(global.ons));
}(this, (function (ons) { 'use strict';

ons = ons && ons.hasOwnProperty('default') ? ons['default'] : ons;

var $ons$1 = Object.keys(ons).filter(function (k) {
  return [/^is/, /^disable/, /^enable/, /^mock/, /^open/, /^set/, /animit/, /elements/, /fastClick/, /GestureDetector/, /notification/, /orientation/, /platform/, /ready/].some(function (t) {
    return k.match(t);
  });
}).reduce(function (r, k) {
  r[k] = ons[k];
  return r;
}, { _ons: ons });

var capitalize = function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

var camelize = function camelize(string) {
  return string.toLowerCase().replace(/-([a-z])/g, function (m, l) {
    return l.toUpperCase();
  });
};

var eventToHandler = function eventToHandler(name) {
  return '_on' + capitalize(name);
};

var handlerToProp = function handlerToProp(name) {
  return name.slice(2).charAt(0).toLowerCase() + name.slice(2).slice(1);
};

var asyncGenerator = function () {
  function AwaitValue(value) {
    this.value = value;
  }

  function AsyncGenerator(gen) {
    var front, back;

    function send(key, arg) {
      return new Promise(function (resolve, reject) {
        var request = {
          key: key,
          arg: arg,
          resolve: resolve,
          reject: reject,
          next: null
        };

        if (back) {
          back = back.next = request;
        } else {
          front = back = request;
          resume(key, arg);
        }
      });
    }

    function resume(key, arg) {
      try {
        var result = gen[key](arg);
        var value = result.value;

        if (value instanceof AwaitValue) {
          Promise.resolve(value.value).then(function (arg) {
            resume("next", arg);
          }, function (arg) {
            resume("throw", arg);
          });
        } else {
          settle(result.done ? "return" : "normal", result.value);
        }
      } catch (err) {
        settle("throw", err);
      }
    }

    function settle(type, value) {
      switch (type) {
        case "return":
          front.resolve({
            value: value,
            done: true
          });
          break;

        case "throw":
          front.reject(value);
          break;

        default:
          front.resolve({
            value: value,
            done: false
          });
          break;
      }

      front = front.next;

      if (front) {
        resume(front.key, front.arg);
      } else {
        back = null;
      }
    }

    this._invoke = send;

    if (typeof gen.return !== "function") {
      this.return = undefined;
    }
  }

  if (typeof Symbol === "function" && Symbol.asyncIterator) {
    AsyncGenerator.prototype[Symbol.asyncIterator] = function () {
      return this;
    };
  }

  AsyncGenerator.prototype.next = function (arg) {
    return this._invoke("next", arg);
  };

  AsyncGenerator.prototype.throw = function (arg) {
    return this._invoke("throw", arg);
  };

  AsyncGenerator.prototype.return = function (arg) {
    return this._invoke("return", arg);
  };

  return {
    wrap: function (fn) {
      return function () {
        return new AsyncGenerator(fn.apply(this, arguments));
      };
    },
    await: function (value) {
      return new AwaitValue(value);
    }
  };
}();













var defineProperty = function (obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
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

var _extends = Object.assign || function (target) {
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



































var toConsumableArray = function (arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  } else {
    return Array.from(arr);
  }
};

/* Private */
var _setupDBB = function _setupDBB(component) {
  var dbb = 'onDeviceBackButton';
  // Call original handler or parent handler by default
  var handler = component[dbb] || component.$el[dbb] && component.$el[dbb]._callback || function (e) {
    return e.callParentHandler();
  };

  component.$el[dbb] = function (event) {
    var runDefault = true;

    component.$emit(handlerToProp(dbb), _extends({}, event, {
      preventDefault: function preventDefault() {
        return runDefault = false;
      }
    }));

    runDefault && handler(event);
  };

  component._isDBBSetup = true;
};

/* Public */
// Device Back Button Handler
var deriveDBB = {
  mounted: function mounted() {
    _setupDBB(this);
  },


  // Core destroys deviceBackButton handlers on disconnectedCallback.
  // This fixes the behavior for <keep-alive> component.
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

var deriveEvents = {
  computed: {
    unrecognizedListeners: function unrecognizedListeners() {
      var _this = this;

      var name = camelize('-' + this.$options._componentTag.slice(6));
      return Object.keys(this.$listeners || {}).filter(function (k) {
        return (ons.elements[name].events || []).indexOf(k) === -1;
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
      _this2._handlers[eventToHandler(key)] = function (event) {
        // Filter events from different components with the same name
        if (event.target === _this2.$el || !/^ons-/i.test(event.target.tagName)) {
          _this2.$emit(key, event);
        }
      };
      _this2.$el.addEventListener(key, _this2._handlers[eventToHandler(key)]);
    });
  },
  beforeDestroy: function beforeDestroy() {
    var _this3 = this;

    Object.keys(this._handlers).forEach(function (key) {
      _this3.$el.removeEventListener(key, _this3._handlers[key]);
    });
    this._handlers = null;
  }
};

/* Private */
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

/* Public */
// Components that can be shown or hidden
var hidable = {
  props: {
    visible: {
      type: Boolean,
      default: undefined // Avoid casting to false
    }
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

// Components with 'options' property
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

// Provides itself to its descendants
var selfProvider = {
  provide: function provide() {
    return defineProperty({}, this.$options._componentTag.slice(6), this);
  }
};

// Common event for Dialogs
var dialogCancel = {
  mounted: function mounted() {
    var _this4 = this;

    this.$on('dialog-cancel', function () {
      return _this4.$emit('update:visible', false);
    });
  }
};

// Moves the element to a global position
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

var _props;
var _props2;

/* Private */
var model = {
  prop: 'modelProp',
  event: 'modelEvent'
};

/* Public */

// Generic input
var modelInput = {
  model: model,
  props: (_props = {}, defineProperty(_props, model.prop, [Number, String]), defineProperty(_props, model.event, {
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

  watch: defineProperty({}, model.prop, function () {
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

// Checkable inputs
var modelCheckbox = {
  mixins: [modelInput],

  props: (_props2 = {}, defineProperty(_props2, model.prop, [Array, Boolean]), defineProperty(_props2, model.event, {
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
        // Is Array
        var index = this[model.prop].indexOf(value);
        var included = index >= 0;

        if (included && !checked) {
          newValue = [].concat(toConsumableArray(this[model.prop].slice(0, index)), toConsumableArray(this[model.prop].slice(index + 1, this[model.prop].length)));
        }

        if (!included && checked) {
          newValue = [].concat(toConsumableArray(this[model.prop]), [value]);
        }
      } else {
        // Is Boolean
        newValue = checked;
      }

      // Emit if value changed
      newValue !== undefined && this.$emit(model.event, newValue);
    }
  }
};

// Radio input
var modelRadio = {
  mixins: [modelInput],
  props: defineProperty({}, model.event, {
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

/* This file is generated automatically */
var VOnsToolbar = { render: function render() {
    var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _c('ons-toolbar', _vm._g({}, _vm.unrecognizedListeners), [_vm._t("default")], 2);
  }, staticRenderFns: [],
  name: 'v-ons-toolbar',
  mixins: [deriveEvents]
};

/* This file is generated automatically */
var VOnsBottomToolbar = { render: function render() {
    var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _c('ons-bottom-toolbar', _vm._g({}, _vm.unrecognizedListeners), [_vm._t("default")], 2);
  }, staticRenderFns: [],
  name: 'v-ons-bottom-toolbar',
  mixins: [deriveEvents]
};

/* This file is generated automatically */
var VOnsToolbarButton = { render: function render() {
    var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _c('ons-toolbar-button', _vm._g({}, _vm.unrecognizedListeners), [_vm._t("default")], 2);
  }, staticRenderFns: [],
  name: 'v-ons-toolbar-button',
  mixins: [deriveEvents]
};

/* This file is generated automatically */
var VOnsAlertDialogButton = { render: function render() {
    var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _c('ons-alert-dialog-button', _vm._g({}, _vm.unrecognizedListeners), [_vm._t("default")], 2);
  }, staticRenderFns: [],
  name: 'v-ons-alert-dialog-button',
  mixins: [deriveEvents]
};

/* This file is generated automatically */
var VOnsButton = { render: function render() {
    var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _c('ons-button', _vm._g({}, _vm.unrecognizedListeners), [_vm._t("default")], 2);
  }, staticRenderFns: [],
  name: 'v-ons-button',
  mixins: [deriveEvents]
};

/* This file is generated automatically */
var VOnsIcon = { render: function render() {
    var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _c('ons-icon', _vm._g({}, _vm.unrecognizedListeners), [_vm._t("default")], 2);
  }, staticRenderFns: [],
  name: 'v-ons-icon',
  mixins: [deriveEvents]
};

/* This file is generated automatically */
var VOnsCard = { render: function render() {
    var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _c('ons-card', _vm._g({}, _vm.unrecognizedListeners), [_vm._t("default")], 2);
  }, staticRenderFns: [],
  name: 'v-ons-card',
  mixins: [deriveEvents]
};

/* This file is generated automatically */
var VOnsList = { render: function render() {
    var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _c('ons-list', _vm._g({}, _vm.unrecognizedListeners), [_vm._t("default")], 2);
  }, staticRenderFns: [],
  name: 'v-ons-list',
  mixins: [deriveEvents]
};

/* This file is generated automatically */
var VOnsListItem = { render: function render() {
    var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _c('ons-list-item', _vm._g({}, _vm.unrecognizedListeners), [_vm._t("default")], 2);
  }, staticRenderFns: [],
  name: 'v-ons-list-item',
  mixins: [deriveEvents]
};

/* This file is generated automatically */
var VOnsListTitle = { render: function render() {
    var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _c('ons-list-title', _vm._g({}, _vm.unrecognizedListeners), [_vm._t("default")], 2);
  }, staticRenderFns: [],
  name: 'v-ons-list-title',
  mixins: [deriveEvents]
};

/* This file is generated automatically */
var VOnsListHeader = { render: function render() {
    var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _c('ons-list-header', _vm._g({}, _vm.unrecognizedListeners), [_vm._t("default")], 2);
  }, staticRenderFns: [],
  name: 'v-ons-list-header',
  mixins: [deriveEvents]
};

/* This file is generated automatically */
var VOnsRipple = { render: function render() {
    var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _c('ons-ripple', _vm._g({}, _vm.unrecognizedListeners), [_vm._t("default")], 2);
  }, staticRenderFns: [],
  name: 'v-ons-ripple',
  mixins: [deriveEvents]
};

/* This file is generated automatically */
var VOnsRow = { render: function render() {
    var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _c('ons-row', _vm._g({}, _vm.unrecognizedListeners), [_vm._t("default")], 2);
  }, staticRenderFns: [],
  name: 'v-ons-row',
  mixins: [deriveEvents]
};

/* This file is generated automatically */
var VOnsCol = { render: function render() {
    var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _c('ons-col', _vm._g({}, _vm.unrecognizedListeners), [_vm._t("default")], 2);
  }, staticRenderFns: [],
  name: 'v-ons-col',
  mixins: [deriveEvents]
};

/* This file is generated automatically */
var VOnsProgressBar = { render: function render() {
    var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _c('ons-progress-bar', _vm._g({}, _vm.unrecognizedListeners), [_vm._t("default")], 2);
  }, staticRenderFns: [],
  name: 'v-ons-progress-bar',
  mixins: [deriveEvents]
};

/* This file is generated automatically */
var VOnsProgressCircular = { render: function render() {
    var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _c('ons-progress-circular', _vm._g({}, _vm.unrecognizedListeners), [_vm._t("default")], 2);
  }, staticRenderFns: [],
  name: 'v-ons-progress-circular',
  mixins: [deriveEvents]
};

/* This file is generated automatically */
var VOnsCarouselItem = { render: function render() {
    var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _c('ons-carousel-item', _vm._g({}, _vm.unrecognizedListeners), [_vm._t("default")], 2);
  }, staticRenderFns: [],
  name: 'v-ons-carousel-item',
  mixins: [deriveEvents]
};

/* This file is generated automatically */
var VOnsSplitterMask = { render: function render() {
    var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _c('ons-splitter-mask', _vm._g({}, _vm.unrecognizedListeners), [_vm._t("default")], 2);
  }, staticRenderFns: [],
  name: 'v-ons-splitter-mask',
  mixins: [deriveEvents]
};

/* This file is generated automatically */
var VOnsSplitterContent = { render: function render() {
    var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _c('ons-splitter-content', _vm._g({}, _vm.unrecognizedListeners), [_vm._t("default")], 2);
  }, staticRenderFns: [],
  name: 'v-ons-splitter-content',
  mixins: [deriveEvents]
};

/* This file is generated automatically */
var VOnsSplitter = { render: function render() {
    var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _c('ons-splitter', _vm._g({}, _vm.unrecognizedListeners), [_vm._t("default")], 2);
  }, staticRenderFns: [],
  name: 'v-ons-splitter',
  mixins: [deriveEvents, selfProvider, deriveDBB]
};

/* This file is generated automatically */
var VOnsSwitch = { render: function render() {
    var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _c('ons-switch', _vm._g({}, _vm.unrecognizedListeners), [_vm._t("default")], 2);
  }, staticRenderFns: [],
  name: 'v-ons-switch',
  mixins: [deriveEvents, modelCheckbox]
};

/* This file is generated automatically */
var VOnsCheckbox = { render: function render() {
    var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _c('ons-checkbox', _vm._g({}, _vm.unrecognizedListeners), [_vm._t("default")], 2);
  }, staticRenderFns: [],
  name: 'v-ons-checkbox',
  mixins: [deriveEvents, modelCheckbox]
};

/* This file is generated automatically */
var VOnsInput = { render: function render() {
    var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _c('ons-input', _vm._g({}, _vm.unrecognizedListeners), [_vm._t("default")], 2);
  }, staticRenderFns: [],
  name: 'v-ons-input',
  mixins: [deriveEvents, modelInput]
};

/* This file is generated automatically */
var VOnsSearchInput = { render: function render() {
    var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _c('ons-search-input', _vm._g({}, _vm.unrecognizedListeners), [_vm._t("default")], 2);
  }, staticRenderFns: [],
  name: 'v-ons-search-input',
  mixins: [deriveEvents, modelInput]
};

/* This file is generated automatically */
var VOnsRange = { render: function render() {
    var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _c('ons-range', _vm._g({}, _vm.unrecognizedListeners), [_vm._t("default")], 2);
  }, staticRenderFns: [],
  name: 'v-ons-range',
  mixins: [deriveEvents, modelInput]
};

/* This file is generated automatically */
var VOnsRadio = { render: function render() {
    var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _c('ons-radio', _vm._g({}, _vm.unrecognizedListeners), [_vm._t("default")], 2);
  }, staticRenderFns: [],
  name: 'v-ons-radio',
  mixins: [deriveEvents, modelRadio]
};

/* This file is generated automatically */
var VOnsFab = { render: function render() {
    var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _c('ons-fab', _vm._g({}, _vm.unrecognizedListeners), [_vm._t("default")], 2);
  }, staticRenderFns: [],
  name: 'v-ons-fab',
  mixins: [deriveEvents, hidable]
};

/* This file is generated automatically */
var VOnsSpeedDialItem = { render: function render() {
    var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _c('ons-speed-dial-item', _vm._g({}, _vm.unrecognizedListeners), [_vm._t("default")], 2);
  }, staticRenderFns: [],
  name: 'v-ons-speed-dial-item',
  mixins: [deriveEvents]
};

/* This file is generated automatically */
var VOnsDialog = { render: function render() {
    var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _c('ons-dialog', _vm._g({}, _vm.unrecognizedListeners), [_vm._t("default")], 2);
  }, staticRenderFns: [],
  name: 'v-ons-dialog',
  mixins: [deriveEvents, hidable, hasOptions, dialogCancel, deriveDBB, portal]
};

/* This file is generated automatically */
var VOnsActionSheet = { render: function render() {
    var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _c('ons-action-sheet', _vm._g({}, _vm.unrecognizedListeners), [_vm._t("default")], 2);
  }, staticRenderFns: [],
  name: 'v-ons-action-sheet',
  mixins: [deriveEvents, hidable, hasOptions, dialogCancel, deriveDBB, portal]
};

/* This file is generated automatically */
var VOnsActionSheetButton = { render: function render() {
    var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _c('ons-action-sheet-button', _vm._g({}, _vm.unrecognizedListeners), [_vm._t("default")], 2);
  }, staticRenderFns: [],
  name: 'v-ons-action-sheet-button',
  mixins: [deriveEvents]
};

/* This file is generated automatically */
var VOnsModal = { render: function render() {
    var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _c('ons-modal', _vm._g({}, _vm.unrecognizedListeners), [_vm._t("default")], 2);
  }, staticRenderFns: [],
  name: 'v-ons-modal',
  mixins: [deriveEvents, hidable, hasOptions, deriveDBB, portal]
};

/* This file is generated automatically */
var VOnsToast = { render: function render() {
    var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _c('ons-toast', _vm._g({}, _vm.unrecognizedListeners), [_vm._t("default")], 2);
  }, staticRenderFns: [],
  name: 'v-ons-toast',
  mixins: [deriveEvents, hidable, hasOptions, deriveDBB, portal]
};

var VOnsPopover = { render: function render() {
    var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _c('ons-popover', _vm._g({}, _vm.unrecognizedListeners), [_vm._t("default")], 2);
  }, staticRenderFns: [],
  name: 'v-ons-popover',
  mixins: [hidable, hasOptions, dialogCancel, deriveEvents, deriveDBB, portal],

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
        return _extends({
          target: this.normalizedTarget
        }, this.options);
      }
      return this.options;
    }
  }
};

var VOnsAlertDialog = { render: function render() {
    var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _c('ons-alert-dialog', _vm._g({}, _vm.unrecognizedListeners), [_c('div', { staticClass: "alert-dialog-title" }, [_vm._t("title", [_vm._v(_vm._s(_vm.title))])], 2), _vm._v(" "), _c('div', { staticClass: "alert-dialog-content" }, [_vm._t("default")], 2), _vm._v(" "), _c('div', { staticClass: "alert-dialog-footer" }, [_vm._t("footer", _vm._l(_vm.footer, function (handler, key) {
      return _c('ons-alert-dialog-button', { key: key, on: { "click": handler } }, [_vm._v(_vm._s(key))]);
    }))], 2)]);
  }, staticRenderFns: [],
  name: 'v-ons-alert-dialog',
  mixins: [hidable, hasOptions, dialogCancel, deriveEvents, deriveDBB, portal],

  props: {
    title: {
      type: String
    },
    footer: {
      type: Object,
      validator: function validator(value) {
        return Object.keys(value).every(function (key) {
          return value[key] instanceof Function;
        });
      }
    }
  }
};

var VOnsSpeedDial = { render: function render() {
    var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _c('ons-speed-dial', { domProps: { "onClick": _vm.action } }, [_vm._t("default")], 2);
  }, staticRenderFns: [],
  name: 'v-ons-speed-dial',
  mixins: [deriveEvents, hidable],

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

var VOnsCarousel = { render: function render() {
    var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _c('ons-carousel', _vm._g({ attrs: { "initial-index": _vm.index }, domProps: { "onSwipe": _vm.onSwipe }, on: { "postchange": function postchange($event) {
          if ($event.target !== $event.currentTarget) {
            return null;
          }_vm.$emit('update:index', $event.activeIndex);
        } } }, _vm.unrecognizedListeners), [_c('div', [_vm._t("default")], 2), _vm._v(" "), _c('div')]);
  }, staticRenderFns: [],
  name: 'v-ons-carousel',
  mixins: [hasOptions, deriveEvents],

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

var VOnsTab = { render: function render() {
    var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _c('ons-tab', { attrs: { "active": _vm.active }, domProps: { "onClick": _vm.action } });
  }, staticRenderFns: [],
  name: 'v-ons-tab',
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
        this.tabbar.$el.setActiveTab(this.$el.index, _extends({ reject: false }, this.tabbar.options));
      }
    }
  },

  watch: {
    active: function active() {
      this.$el.setActive(this.active);
    }
  }
};

var VOnsTabbar = { render: function render() {
    var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _c('ons-tabbar', _vm._g({ attrs: { "activeIndex": _vm.index }, domProps: { "onSwipe": _vm.onSwipe }, on: { "prechange": function prechange($event) {
          if ($event.target !== $event.currentTarget) {
            return null;
          }_vm.$nextTick(function () {
            return !$event.detail.canceled && _vm.$emit('update:index', $event.index);
          });
        } } }, _vm.unrecognizedListeners), [_c('div', { staticClass: "tabbar__content" }, [_c('div', [_vm._t("pages", _vm._l(_vm.tabs, function (tab) {
      return _c(tab.page, _vm._g(_vm._b({ key: tab.page.key || tab.page.name || _vm._tabKey(tab), tag: "component" }, 'component', tab.props, false), _vm.unrecognizedListeners));
    }))], 2), _vm._v(" "), _c('div')]), _vm._v(" "), _c('div', { staticClass: "tabbar", style: _vm.tabbarStyle }, [_vm._t("default", _vm._l(_vm.tabs, function (tab) {
      return _c('v-ons-tab', _vm._b({ key: _vm._tabKey(tab) }, 'v-ons-tab', tab, false));
    })), _vm._v(" "), _c('div', { staticClass: "tabbar__border" })], 2)]);
  }, staticRenderFns: [],
  name: 'v-ons-tabbar',
  mixins: [deriveEvents, hasOptions, hidable, selfProvider],

  props: {
    index: {
      type: Number
    },
    tabs: {
      type: Array,
      validator: function validator(value) {
        return value.every(function (tab) {
          return ['icon', 'label', 'page'].some(function (prop) {
            return !!Object.getOwnPropertyDescriptor(tab, prop);
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
        this.$el.setActiveTab(this.index, _extends({ reject: false }, this.options));
      }
    }
  }
};

var VOnsBackButton = { render: function render() {
    var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _c('ons-back-button', { domProps: { "onClick": _vm.action } }, [_vm._t("default")], 2);
  }, staticRenderFns: [],
  name: 'v-ons-back-button',
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

var VOnsNavigator = { render: function render() {
    var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _c('ons-navigator', _vm._g({ on: { "postpop": function postpop($event) {
          if ($event.target !== $event.currentTarget) {
            return null;
          }_vm._checkSwipe($event);
        } } }, _vm.unrecognizedListeners), [_vm._t("default", _vm._l(_vm.pageStack, function (page) {
      return _c(page, _vm._g({ key: page.key || page.name, tag: "component" }, _vm.unrecognizedListeners));
    }))], 2);
  }, staticRenderFns: [],
  name: 'v-ons-navigator',
  mixins: [hasOptions, selfProvider, deriveEvents, deriveDBB],

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
      if (this.hasOwnProperty('_ready') && this._ready instanceof Promise) {
        return this._ready;
      }
      return Promise.resolve();
    },
    onDeviceBackButton: function onDeviceBackButton(event) {
      if (this.pageStack.length > 1) {
        this.popPage();
      } else {
        event.callParentHandler();
      }
    },
    _findScrollPage: function _findScrollPage(page) {
      var nextPage = page._contentElement.children.length === 1 && ons._util.getTopPage(page._contentElement.children[0]);
      return nextPage ? this._findScrollPage(nextPage) : page;
    },
    _setPagesVisibility: function _setPagesVisibility(start, end, visibility) {
      for (var i = start; i < end; i++) {
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
      return Promise.resolve();
    },
    _animate: function _animate(_ref) {
      var _this = this;

      var lastLength = _ref.lastLength,
          currentLength = _ref.currentLength,
          lastTopPage = _ref.lastTopPage,
          currentTopPage = _ref.currentTopPage,
          restoreScroll = _ref.restoreScroll;


      // Push
      if (currentLength > lastLength) {
        var isReattached = false;
        if (lastTopPage.parentElement !== this.$el) {
          this._reattachPage(lastTopPage, this.$el.children[lastLength - 1], restoreScroll);
          isReattached = true;
          lastLength--;
        }
        this._setPagesVisibility(lastLength, currentLength, 'hidden');

        return this.$el._pushPage(_extends({}, this.options, { leavePage: lastTopPage })).then(function () {
          _this._setPagesVisibility(lastLength, currentLength, '');
          if (isReattached) {
            _this._redetachPage(lastTopPage);
          }
        });
      }

      // Pop
      if (currentLength < lastLength) {
        this._reattachPage(lastTopPage, null, restoreScroll);
        return this.$el._popPage(_extends({}, this.options), function () {
          return _this._redetachPage(lastTopPage);
        });
      }

      // Replace page
      currentTopPage.style.visibility = 'hidden';
      this._reattachPage(lastTopPage, currentTopPage, restoreScroll);
      return this.$el._pushPage(_extends({}, this.options, { _replacePage: true })).then(function () {
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
      if (this.$el.hasAttribute('swipeable') && this.$children.length !== this.$el.children.length) {
        return;
      }

      var propWasMutated = after === before; // Can be mutated or replaced
      var lastTopPage = this.$children[this.$children.length - 1].$el;
      var scrollElement = this._findScrollPage(lastTopPage);
      var scrollValue = scrollElement.scrollTop || 0;

      this._pageStackUpdate = {
        lastTopPage: lastTopPage,
        lastLength: propWasMutated ? this.$children.length : before.length,
        currentLength: !propWasMutated && after.length,
        restoreScroll: function restoreScroll() {
          return scrollElement.scrollTop = scrollValue;
        }
      };

      // this.$nextTick(() => { }); // Waits too long, updated() hook is faster and prevents flickerings
    }
  },

  updated: function updated() {
    if (this._pageStackUpdate) {
      var currentTopPage = this.$children[this.$children.length - 1].$el;
      var _pageStackUpdate = this._pageStackUpdate,
          lastTopPage = _pageStackUpdate.lastTopPage,
          currentLength = _pageStackUpdate.currentLength;
      var _pageStackUpdate2 = this._pageStackUpdate,
          lastLength = _pageStackUpdate2.lastLength,
          restoreScroll = _pageStackUpdate2.restoreScroll;

      currentLength = currentLength === false ? this.$children.length : currentLength;

      if (currentTopPage !== lastTopPage) {
        this._ready = this._animate({ lastLength: lastLength, currentLength: currentLength, lastTopPage: lastTopPage, currentTopPage: currentTopPage, restoreScroll: restoreScroll });
      } else if (currentLength !== lastLength) {
        currentTopPage.updateBackButton(currentLength > 1);
      }

      lastTopPage = currentTopPage = this._pageStackUpdate = null;
    }
  }
};

var VOnsSplitterSide = { render: function render() {
    var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _c('ons-splitter-side', _vm._g({}, _vm.unrecognizedListeners), [_vm._t("default")], 2);
  }, staticRenderFns: [],
  name: 'v-ons-splitter-side',
  mixins: [hasOptions, deriveEvents],

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

var VOnsLazyRepeat = { render: function render() {
    var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _c('ons-lazy-repeat');
  }, staticRenderFns: [],
  name: 'v-ons-lazy-repeat',

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

      var delegate = new ons._internal.LazyRepeatDelegate({
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

      this.provider = new ons._internal.LazyRepeatProvider(this.$parent.$el, delegate);
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

    // This will destroy the provider once the rendered element
    // is detached (detachedCallback). Therefore, animations
    // have time to finish before elements start to disappear.
    // It cannot be set earlier in order to prevent accidental
    // destroys if this element is retached by something else.
    this.$el._lazyRepeatProvider = this.provider;
    this.provider = null;
  }
};

var VOnsSelect = { render: function render() {
    var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _c('ons-select', _vm._g({}, _vm.$listeners), [_c('select', [_vm._t("default")], 2)]);
  }, staticRenderFns: [],
  name: 'v-ons-select',
  mixins: [modelInput]
};

var VOnsSegment = { render: function render() {
    var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _c('ons-segment', { attrs: { "active-index": _vm.index }, on: { "postchange": function postchange($event) {
          if ($event.target !== $event.currentTarget) {
            return null;
          }_vm.$emit('update:index', $event.index);
        } } }, [_vm._t("default")], 2);
  }, staticRenderFns: [],
  name: 'v-ons-segment',
  mixins: [deriveEvents],

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

var VOnsPullHook = { render: function render() {
    var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _c('ons-pull-hook', _vm._g({ domProps: { "onAction": _vm.action, "onPull": _vm.onPull } }, _vm.unrecognizedListeners), [_vm._t("default")], 2);
  }, staticRenderFns: [],
  name: 'v-ons-pull-hook',
  mixins: [deriveEvents],

  props: {
    action: {
      type: Function
    },
    onPull: {
      type: Function
    }
  }
};

var VOnsPage = { render: function render() {
    var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _c('ons-page', _vm._g({ domProps: { "onInfiniteScroll": _vm.infiniteScroll } }, _vm.unrecognizedListeners), [_vm._t("default")], 2);
  }, staticRenderFns: [],
  name: 'v-ons-page',
  mixins: [deriveEvents, deriveDBB],

  props: {
    infiniteScroll: {
      type: Function
    }
  }
};

// Generic components:


var components = Object.freeze({
	VOnsToolbar: VOnsToolbar,
	VOnsBottomToolbar: VOnsBottomToolbar,
	VOnsToolbarButton: VOnsToolbarButton,
	VOnsAlertDialogButton: VOnsAlertDialogButton,
	VOnsButton: VOnsButton,
	VOnsIcon: VOnsIcon,
	VOnsCard: VOnsCard,
	VOnsList: VOnsList,
	VOnsListItem: VOnsListItem,
	VOnsListTitle: VOnsListTitle,
	VOnsListHeader: VOnsListHeader,
	VOnsRipple: VOnsRipple,
	VOnsRow: VOnsRow,
	VOnsCol: VOnsCol,
	VOnsProgressBar: VOnsProgressBar,
	VOnsProgressCircular: VOnsProgressCircular,
	VOnsCarouselItem: VOnsCarouselItem,
	VOnsSplitterMask: VOnsSplitterMask,
	VOnsSplitterContent: VOnsSplitterContent,
	VOnsSplitter: VOnsSplitter,
	VOnsSwitch: VOnsSwitch,
	VOnsCheckbox: VOnsCheckbox,
	VOnsInput: VOnsInput,
	VOnsSearchInput: VOnsSearchInput,
	VOnsRange: VOnsRange,
	VOnsRadio: VOnsRadio,
	VOnsFab: VOnsFab,
	VOnsSpeedDialItem: VOnsSpeedDialItem,
	VOnsDialog: VOnsDialog,
	VOnsActionSheet: VOnsActionSheet,
	VOnsActionSheetButton: VOnsActionSheetButton,
	VOnsModal: VOnsModal,
	VOnsToast: VOnsToast,
	VOnsPopover: VOnsPopover,
	VOnsAlertDialog: VOnsAlertDialog,
	VOnsSpeedDial: VOnsSpeedDial,
	VOnsCarousel: VOnsCarousel,
	VOnsTab: VOnsTab,
	VOnsTabbar: VOnsTabbar,
	VOnsBackButton: VOnsBackButton,
	VOnsNavigator: VOnsNavigator,
	VOnsSplitterSide: VOnsSplitterSide,
	VOnsLazyRepeat: VOnsLazyRepeat,
	VOnsSelect: VOnsSelect,
	VOnsSegment: VOnsSegment,
	VOnsPullHook: VOnsPullHook,
	VOnsPage: VOnsPage
});

$ons$1.install = function (Vue) {
  Object.keys(components).forEach(function (key) {
    return Vue.component(components[key].name, components[key]);
  });

  /**
   * Expose ons object.
   */
  Vue.prototype.$ons = $ons$1;
};

if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use({ install: $ons$1.install });
}

return $ons$1;

})));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidnVlLW9uc2VudWkuanMiLCJzb3VyY2VzIjpbIi4uL3NyYy9zZXR1cC5qcyIsIi4uL3NyYy9pbnRlcm5hbC91dGlsLmpzIiwiLi4vc3JjL21peGlucy9kZXJpdmUuanMiLCIuLi9zcmMvbWl4aW5zL2NvbW1vbi5qcyIsIi4uL3NyYy9taXhpbnMvbW9kZWwuanMiLCIuLi9zcmMvY29tcG9uZW50cy9WT25zVG9vbGJhci52dWUiLCIuLi9zcmMvY29tcG9uZW50cy9WT25zQm90dG9tVG9vbGJhci52dWUiLCIuLi9zcmMvY29tcG9uZW50cy9WT25zVG9vbGJhckJ1dHRvbi52dWUiLCIuLi9zcmMvY29tcG9uZW50cy9WT25zQWxlcnREaWFsb2dCdXR0b24udnVlIiwiLi4vc3JjL2NvbXBvbmVudHMvVk9uc0J1dHRvbi52dWUiLCIuLi9zcmMvY29tcG9uZW50cy9WT25zSWNvbi52dWUiLCIuLi9zcmMvY29tcG9uZW50cy9WT25zQ2FyZC52dWUiLCIuLi9zcmMvY29tcG9uZW50cy9WT25zTGlzdC52dWUiLCIuLi9zcmMvY29tcG9uZW50cy9WT25zTGlzdEl0ZW0udnVlIiwiLi4vc3JjL2NvbXBvbmVudHMvVk9uc0xpc3RUaXRsZS52dWUiLCIuLi9zcmMvY29tcG9uZW50cy9WT25zTGlzdEhlYWRlci52dWUiLCIuLi9zcmMvY29tcG9uZW50cy9WT25zUmlwcGxlLnZ1ZSIsIi4uL3NyYy9jb21wb25lbnRzL1ZPbnNSb3cudnVlIiwiLi4vc3JjL2NvbXBvbmVudHMvVk9uc0NvbC52dWUiLCIuLi9zcmMvY29tcG9uZW50cy9WT25zUHJvZ3Jlc3NCYXIudnVlIiwiLi4vc3JjL2NvbXBvbmVudHMvVk9uc1Byb2dyZXNzQ2lyY3VsYXIudnVlIiwiLi4vc3JjL2NvbXBvbmVudHMvVk9uc0Nhcm91c2VsSXRlbS52dWUiLCIuLi9zcmMvY29tcG9uZW50cy9WT25zU3BsaXR0ZXJNYXNrLnZ1ZSIsIi4uL3NyYy9jb21wb25lbnRzL1ZPbnNTcGxpdHRlckNvbnRlbnQudnVlIiwiLi4vc3JjL2NvbXBvbmVudHMvVk9uc1NwbGl0dGVyLnZ1ZSIsIi4uL3NyYy9jb21wb25lbnRzL1ZPbnNTd2l0Y2gudnVlIiwiLi4vc3JjL2NvbXBvbmVudHMvVk9uc0NoZWNrYm94LnZ1ZSIsIi4uL3NyYy9jb21wb25lbnRzL1ZPbnNJbnB1dC52dWUiLCIuLi9zcmMvY29tcG9uZW50cy9WT25zU2VhcmNoSW5wdXQudnVlIiwiLi4vc3JjL2NvbXBvbmVudHMvVk9uc1JhbmdlLnZ1ZSIsIi4uL3NyYy9jb21wb25lbnRzL1ZPbnNSYWRpby52dWUiLCIuLi9zcmMvY29tcG9uZW50cy9WT25zRmFiLnZ1ZSIsIi4uL3NyYy9jb21wb25lbnRzL1ZPbnNTcGVlZERpYWxJdGVtLnZ1ZSIsIi4uL3NyYy9jb21wb25lbnRzL1ZPbnNEaWFsb2cudnVlIiwiLi4vc3JjL2NvbXBvbmVudHMvVk9uc0FjdGlvblNoZWV0LnZ1ZSIsIi4uL3NyYy9jb21wb25lbnRzL1ZPbnNBY3Rpb25TaGVldEJ1dHRvbi52dWUiLCIuLi9zcmMvY29tcG9uZW50cy9WT25zTW9kYWwudnVlIiwiLi4vc3JjL2NvbXBvbmVudHMvVk9uc1RvYXN0LnZ1ZSIsIi4uL3NyYy9jb21wb25lbnRzL1ZPbnNQb3BvdmVyLnZ1ZSIsIi4uL3NyYy9jb21wb25lbnRzL1ZPbnNBbGVydERpYWxvZy52dWUiLCIuLi9zcmMvY29tcG9uZW50cy9WT25zU3BlZWREaWFsLnZ1ZSIsIi4uL3NyYy9jb21wb25lbnRzL1ZPbnNDYXJvdXNlbC52dWUiLCIuLi9zcmMvY29tcG9uZW50cy9WT25zVGFiLnZ1ZSIsIi4uL3NyYy9jb21wb25lbnRzL1ZPbnNUYWJiYXIudnVlIiwiLi4vc3JjL2NvbXBvbmVudHMvVk9uc0JhY2tCdXR0b24udnVlIiwiLi4vc3JjL2NvbXBvbmVudHMvVk9uc05hdmlnYXRvci52dWUiLCIuLi9zcmMvY29tcG9uZW50cy9WT25zU3BsaXR0ZXJTaWRlLnZ1ZSIsIi4uL3NyYy9jb21wb25lbnRzL1ZPbnNMYXp5UmVwZWF0LnZ1ZSIsIi4uL3NyYy9jb21wb25lbnRzL1ZPbnNTZWxlY3QudnVlIiwiLi4vc3JjL2NvbXBvbmVudHMvVk9uc1NlZ21lbnQudnVlIiwiLi4vc3JjL2NvbXBvbmVudHMvVk9uc1B1bGxIb29rLnZ1ZSIsIi4uL3NyYy9jb21wb25lbnRzL1ZPbnNQYWdlLnZ1ZSIsIi4uL3NyYy9jb21wb25lbnRzL2luZGV4LmpzIiwiLi4vc3JjL2luZGV4LnVtZC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgb25zIGZyb20gJ29uc2VudWkvZXNtJztcblxuY29uc3QgJG9ucyA9IE9iamVjdC5rZXlzKG9ucylcbiAgLmZpbHRlcihrID0+IFtcbiAgICAvXmlzLyxcbiAgICAvXmRpc2FibGUvLFxuICAgIC9eZW5hYmxlLyxcbiAgICAvXm1vY2svLFxuICAgIC9eb3Blbi8sXG4gICAgL15zZXQvLFxuICAgIC9hbmltaXQvLFxuICAgIC9lbGVtZW50cy8sXG4gICAgL2Zhc3RDbGljay8sXG4gICAgL0dlc3R1cmVEZXRlY3Rvci8sXG4gICAgL25vdGlmaWNhdGlvbi8sXG4gICAgL29yaWVudGF0aW9uLyxcbiAgICAvcGxhdGZvcm0vLFxuICAgIC9yZWFkeS8sXG4gIF0uc29tZSh0ID0+IGsubWF0Y2godCkpKVxuICAucmVkdWNlKChyLCBrKSA9PiB7XG4gICAgcltrXSA9IG9uc1trXTtcbiAgICByZXR1cm4gcjtcbiAgfSwgeyBfb25zOiBvbnMgfSk7XG5cbmV4cG9ydCB7XG4gICRvbnMsXG59O1xuIiwiZXhwb3J0IGNvbnN0IGh5cGhlbmF0ZSA9IHN0cmluZyA9PiBzdHJpbmcucmVwbGFjZSgvKFthLXpBLVpdKShbQS1aXSkvZywgJyQxLSQyJykudG9Mb3dlckNhc2UoKTtcblxuZXhwb3J0IGNvbnN0IGNhcGl0YWxpemUgPSBzdHJpbmcgPT4gc3RyaW5nLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgc3RyaW5nLnNsaWNlKDEpO1xuXG5leHBvcnQgY29uc3QgY2FtZWxpemUgPSBzdHJpbmcgPT4gc3RyaW5nLnRvTG93ZXJDYXNlKCkucmVwbGFjZSgvLShbYS16XSkvZywgKG0sIGwpID0+IGwudG9VcHBlckNhc2UoKSk7XG5cbmV4cG9ydCBjb25zdCBldmVudFRvSGFuZGxlciA9IG5hbWUgPT4gJ19vbicgKyBjYXBpdGFsaXplKG5hbWUpO1xuXG5leHBvcnQgY29uc3QgaGFuZGxlclRvUHJvcCA9IG5hbWUgPT4gbmFtZS5zbGljZSgyKS5jaGFyQXQoMCkudG9Mb3dlckNhc2UoKSArIG5hbWUuc2xpY2UoMikuc2xpY2UoMSk7XG4iLCJpbXBvcnQgb25zIGZyb20gJ29uc2VudWkvZXNtJztcbmltcG9ydCB7IGNhbWVsaXplLCBldmVudFRvSGFuZGxlciwgaGFuZGxlclRvUHJvcCB9IGZyb20gJy4uL2ludGVybmFsL3V0aWwnO1xuXG4vKiBQcml2YXRlICovXG5jb25zdCBfc2V0dXBEQkIgPSBjb21wb25lbnQgPT4ge1xuICBjb25zdCBkYmIgPSAnb25EZXZpY2VCYWNrQnV0dG9uJztcbiAgLy8gQ2FsbCBvcmlnaW5hbCBoYW5kbGVyIG9yIHBhcmVudCBoYW5kbGVyIGJ5IGRlZmF1bHRcbiAgY29uc3QgaGFuZGxlciA9IGNvbXBvbmVudFtkYmJdIHx8IChjb21wb25lbnQuJGVsW2RiYl0gJiYgY29tcG9uZW50LiRlbFtkYmJdLl9jYWxsYmFjaykgfHwgKGUgPT4gZS5jYWxsUGFyZW50SGFuZGxlcigpKTtcblxuICBjb21wb25lbnQuJGVsW2RiYl0gPSBldmVudCA9PiB7XG4gICAgbGV0IHJ1bkRlZmF1bHQgPSB0cnVlO1xuXG4gICAgY29tcG9uZW50LiRlbWl0KGhhbmRsZXJUb1Byb3AoZGJiKSwge1xuICAgICAgLi4uZXZlbnQsXG4gICAgICBwcmV2ZW50RGVmYXVsdDogKCkgPT4gcnVuRGVmYXVsdCA9IGZhbHNlXG4gICAgfSk7XG5cbiAgICBydW5EZWZhdWx0ICYmIGhhbmRsZXIoZXZlbnQpO1xuICB9O1xuXG4gIGNvbXBvbmVudC5faXNEQkJTZXR1cCA9IHRydWU7XG59O1xuXG4vKiBQdWJsaWMgKi9cbi8vIERldmljZSBCYWNrIEJ1dHRvbiBIYW5kbGVyXG5jb25zdCBkZXJpdmVEQkIgPSB7XG4gIG1vdW50ZWQoKSB7XG4gICAgX3NldHVwREJCKHRoaXMpO1xuICB9LFxuXG4gIC8vIENvcmUgZGVzdHJveXMgZGV2aWNlQmFja0J1dHRvbiBoYW5kbGVycyBvbiBkaXNjb25uZWN0ZWRDYWxsYmFjay5cbiAgLy8gVGhpcyBmaXhlcyB0aGUgYmVoYXZpb3IgZm9yIDxrZWVwLWFsaXZlPiBjb21wb25lbnQuXG4gIGFjdGl2YXRlZCgpIHtcbiAgICB0aGlzLl9pc0RCQlNldHVwID09PSBmYWxzZSAmJiBfc2V0dXBEQkIodGhpcyk7XG4gIH0sXG5cbiAgZGVhY3RpdmF0ZWQoKSB7XG4gICAgdGhpcy5faXNEQkJTZXR1cCA9PT0gdHJ1ZSAmJiAodGhpcy5faXNEQkJTZXR1cCA9IGZhbHNlKTtcbiAgfSxcblxuICBkZXN0cm95ZWQoKSB7XG4gICAgdGhpcy4kZWwub25EZXZpY2VCYWNrQnV0dG9uICYmIHRoaXMuJGVsLm9uRGV2aWNlQmFja0J1dHRvbi5kZXN0cm95KCk7XG4gIH1cbn07XG5cbmNvbnN0IGRlcml2ZUV2ZW50cyA9IHtcbiAgY29tcHV0ZWQ6IHtcbiAgICB1bnJlY29nbml6ZWRMaXN0ZW5lcnMoKSB7XG4gICAgICBjb25zdCBuYW1lID0gY2FtZWxpemUoJy0nICsgdGhpcy4kb3B0aW9ucy5fY29tcG9uZW50VGFnLnNsaWNlKDYpKTtcbiAgICAgIHJldHVybiBPYmplY3Qua2V5cyh0aGlzLiRsaXN0ZW5lcnMgfHwge30pXG4gICAgICAgIC5maWx0ZXIoayA9PiAob25zLmVsZW1lbnRzW25hbWVdLmV2ZW50cyB8fCBbXSkuaW5kZXhPZihrKSA9PT0gLTEpXG4gICAgICAgIC5yZWR1Y2UoKHIsIGspID0+IHtcbiAgICAgICAgICByW2tdID0gdGhpcy4kbGlzdGVuZXJzW2tdO1xuICAgICAgICAgIHJldHVybiByO1xuICAgICAgICB9LCB7fSk7XG4gICAgfVxuICB9LFxuXG4gIG1vdW50ZWQoKSB7XG4gICAgdGhpcy5faGFuZGxlcnMgPSB7fTtcblxuICAgICh0aGlzLiRlbC5jb25zdHJ1Y3Rvci5ldmVudHMgfHwgW10pLmZvckVhY2goa2V5ID0+IHtcbiAgICAgIHRoaXMuX2hhbmRsZXJzW2V2ZW50VG9IYW5kbGVyKGtleSldID0gZXZlbnQgPT4ge1xuICAgICAgICAvLyBGaWx0ZXIgZXZlbnRzIGZyb20gZGlmZmVyZW50IGNvbXBvbmVudHMgd2l0aCB0aGUgc2FtZSBuYW1lXG4gICAgICAgIGlmIChldmVudC50YXJnZXQgPT09IHRoaXMuJGVsIHx8ICEvXm9ucy0vaS50ZXN0KGV2ZW50LnRhcmdldC50YWdOYW1lKSkge1xuICAgICAgICAgIHRoaXMuJGVtaXQoa2V5LCBldmVudCk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICB0aGlzLiRlbC5hZGRFdmVudExpc3RlbmVyKGtleSwgdGhpcy5faGFuZGxlcnNbZXZlbnRUb0hhbmRsZXIoa2V5KV0pO1xuICAgIH0pO1xuICB9LFxuXG4gIGJlZm9yZURlc3Ryb3koKSB7XG4gICAgT2JqZWN0LmtleXModGhpcy5faGFuZGxlcnMpLmZvckVhY2goa2V5ID0+IHtcbiAgICAgIHRoaXMuJGVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoa2V5LCB0aGlzLl9oYW5kbGVyc1trZXldKTtcbiAgICB9KTtcbiAgICB0aGlzLl9oYW5kbGVycyA9IG51bGw7XG4gIH1cbn07XG5cbmV4cG9ydCB7IGRlcml2ZURCQiwgZGVyaXZlRXZlbnRzIH07XG4iLCIvKiBQcml2YXRlICovXG5jb25zdCBfdG9nZ2xlVmlzaWJpbGl0eSA9IGZ1bmN0aW9uKCkge1xuICBpZiAodHlwZW9mIHRoaXMudmlzaWJsZSA9PT0gJ2Jvb2xlYW4nICYmIHRoaXMudmlzaWJsZSAhPT0gdGhpcy4kZWwudmlzaWJsZSkge1xuICAgIHRoaXMuJGVsW3RoaXMudmlzaWJsZSA/ICdzaG93JyA6ICdoaWRlJ10uY2FsbCh0aGlzLiRlbCwgdGhpcy5ub3JtYWxpemVkT3B0aW9ucyB8fCB0aGlzLm9wdGlvbnMpO1xuICB9XG59O1xuY29uc3QgX3RlbGVwb3J0ID0gZnVuY3Rpb24oKSB7XG4gIGlmICghdGhpcy5faXNEZXN0cm95ZWQgJiYgKCF0aGlzLiRlbC5wYXJlbnROb2RlIHx8IHRoaXMuJGVsLnBhcmVudE5vZGUgIT09IGRvY3VtZW50LmJvZHkpKSB7XG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh0aGlzLiRlbCk7XG4gIH1cbn07XG5jb25zdCBfdW5tb3VudCA9IGZ1bmN0aW9uKCkge1xuICBpZiAodGhpcy4kZWwudmlzaWJsZSA9PT0gdHJ1ZSkge1xuICAgIHRoaXMuJGVsLmhpZGUoKS50aGVuKCgpID0+IHRoaXMuJGVsLnJlbW92ZSgpKTtcbiAgfSBlbHNlIHtcbiAgICB0aGlzLiRlbC5yZW1vdmUoKTtcbiAgfVxufTtcblxuLyogUHVibGljICovXG4vLyBDb21wb25lbnRzIHRoYXQgY2FuIGJlIHNob3duIG9yIGhpZGRlblxuY29uc3QgaGlkYWJsZSA9IHtcbiAgcHJvcHM6IHtcbiAgICB2aXNpYmxlOiB7XG4gICAgICB0eXBlOiBCb29sZWFuLFxuICAgICAgZGVmYXVsdDogdW5kZWZpbmVkIC8vIEF2b2lkIGNhc3RpbmcgdG8gZmFsc2VcbiAgICB9XG4gIH0sXG5cbiAgd2F0Y2g6IHtcbiAgICB2aXNpYmxlKCkge1xuICAgICAgX3RvZ2dsZVZpc2liaWxpdHkuY2FsbCh0aGlzKTtcbiAgICB9XG4gIH0sXG5cbiAgbW91bnRlZCgpIHtcbiAgICB0aGlzLiRuZXh0VGljaygoKSA9PiBfdG9nZ2xlVmlzaWJpbGl0eS5jYWxsKHRoaXMpKTtcbiAgfSxcblxuICBhY3RpdmF0ZWQoKSB7XG4gICAgdGhpcy4kbmV4dFRpY2soKCkgPT4gX3RvZ2dsZVZpc2liaWxpdHkuY2FsbCh0aGlzKSk7XG4gIH1cbn07XG5cbi8vIENvbXBvbmVudHMgd2l0aCAnb3B0aW9ucycgcHJvcGVydHlcbmNvbnN0IGhhc09wdGlvbnMgPSB7XG4gIHByb3BzOiB7XG4gICAgb3B0aW9uczoge1xuICAgICAgdHlwZTogT2JqZWN0LFxuICAgICAgZGVmYXVsdCgpIHtcbiAgICAgICAgcmV0dXJuIHt9O1xuICAgICAgfVxuICAgIH1cbiAgfVxufTtcblxuLy8gUHJvdmlkZXMgaXRzZWxmIHRvIGl0cyBkZXNjZW5kYW50c1xuY29uc3Qgc2VsZlByb3ZpZGVyID0ge1xuICBwcm92aWRlKCkge1xuICAgIHJldHVybiB7XG4gICAgICBbdGhpcy4kb3B0aW9ucy5fY29tcG9uZW50VGFnLnNsaWNlKDYpXTogdGhpc1xuICAgIH1cbiAgfVxufTtcblxuLy8gQ29tbW9uIGV2ZW50IGZvciBEaWFsb2dzXG5jb25zdCBkaWFsb2dDYW5jZWwgPSB7XG4gIG1vdW50ZWQoKSB7XG4gICAgdGhpcy4kb24oJ2RpYWxvZy1jYW5jZWwnLCAoKSA9PiB0aGlzLiRlbWl0KCd1cGRhdGU6dmlzaWJsZScsIGZhbHNlKSk7XG4gIH1cbn07XG5cbi8vIE1vdmVzIHRoZSBlbGVtZW50IHRvIGEgZ2xvYmFsIHBvc2l0aW9uXG5jb25zdCBwb3J0YWwgPSB7XG4gIG1vdW50ZWQoKSB7XG4gICAgX3RlbGVwb3J0LmNhbGwodGhpcyk7XG4gIH0sXG4gIHVwZGF0ZWQoKSB7XG4gICAgX3RlbGVwb3J0LmNhbGwodGhpcyk7XG4gIH0sXG4gIGFjdGl2YXRlZCgpIHtcbiAgICBfdGVsZXBvcnQuY2FsbCh0aGlzKTtcbiAgfSxcbiAgZGVhY3RpdmF0ZWQoKSB7XG4gICAgX3VubW91bnQuY2FsbCh0aGlzKTtcbiAgfSxcbiAgYmVmb3JlRGVzdHJveSgpIHtcbiAgICBfdW5tb3VudC5jYWxsKHRoaXMpO1xuICB9XG59O1xuXG5leHBvcnQgeyBoaWRhYmxlLCBoYXNPcHRpb25zLCBzZWxmUHJvdmlkZXIsIGRpYWxvZ0NhbmNlbCwgcG9ydGFsIH07XG4iLCIvKiBQcml2YXRlICovXG5jb25zdCBtb2RlbCA9IHtcbiAgcHJvcDogJ21vZGVsUHJvcCcsXG4gIGV2ZW50OiAnbW9kZWxFdmVudCdcbn07XG5cbi8qIFB1YmxpYyAqL1xuXG4vLyBHZW5lcmljIGlucHV0XG5jb25zdCBtb2RlbElucHV0ID0ge1xuICBtb2RlbCxcbiAgcHJvcHM6IHtcbiAgICBbbW9kZWwucHJvcF06IFtOdW1iZXIsIFN0cmluZ10sXG4gICAgW21vZGVsLmV2ZW50XToge1xuICAgICAgdHlwZTogU3RyaW5nLFxuICAgICAgZGVmYXVsdDogJ2lucHV0J1xuICAgIH1cbiAgfSxcblxuICBtZXRob2RzOiB7XG4gICAgX3VwZGF0ZVZhbHVlKCkge1xuICAgICAgaWYgKHRoaXNbbW9kZWwucHJvcF0gIT09IHVuZGVmaW5lZCAmJiB0aGlzLiRlbC52YWx1ZSAhPT0gdGhpc1ttb2RlbC5wcm9wXSkge1xuICAgICAgICB0aGlzLiRlbC52YWx1ZSA9IHRoaXNbbW9kZWwucHJvcF07XG4gICAgICB9XG4gICAgfSxcbiAgICBfb25Nb2RlbEV2ZW50KGV2ZW50KSB7XG4gICAgICB0aGlzLiRlbWl0KG1vZGVsLmV2ZW50LCBldmVudC50YXJnZXQudmFsdWUpO1xuICAgIH1cbiAgfSxcblxuICB3YXRjaDoge1xuICAgIFttb2RlbC5wcm9wXSgpIHtcbiAgICAgIHRoaXMuX3VwZGF0ZVZhbHVlKCk7XG4gICAgfVxuICB9LFxuXG4gIG1vdW50ZWQoKSB7XG4gICAgdGhpcy5fdXBkYXRlVmFsdWUoKTtcbiAgICB0aGlzLiRlbC5hZGRFdmVudExpc3RlbmVyKHRoaXNbbW9kZWwuZXZlbnRdLCB0aGlzLl9vbk1vZGVsRXZlbnQpO1xuICB9LFxuICBiZWZvcmVEZXN0cm95KCkge1xuICAgIHRoaXMuJGVsLnJlbW92ZUV2ZW50TGlzdGVuZXIodGhpc1ttb2RlbC5ldmVudF0sIHRoaXMuX29uTW9kZWxFdmVudCk7XG4gIH1cbn07XG5cbi8vIENoZWNrYWJsZSBpbnB1dHNcbmNvbnN0IG1vZGVsQ2hlY2tib3ggPSB7XG4gIG1peGluczogW21vZGVsSW5wdXRdLFxuXG4gIHByb3BzOiB7XG4gICAgW21vZGVsLnByb3BdOiBbQXJyYXksIEJvb2xlYW5dLFxuICAgIFttb2RlbC5ldmVudF06IHtcbiAgICAgIHR5cGU6IFN0cmluZyxcbiAgICAgIGRlZmF1bHQ6ICdjaGFuZ2UnXG4gICAgfVxuICB9LFxuXG4gIG1ldGhvZHM6IHtcbiAgICBfdXBkYXRlVmFsdWUoKSB7XG4gICAgICBpZiAodGhpc1ttb2RlbC5wcm9wXSBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICAgIHRoaXMuJGVsLmNoZWNrZWQgPSB0aGlzW21vZGVsLnByb3BdLmluZGV4T2YodGhpcy4kZWwudmFsdWUpID49IDA7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLiRlbC5jaGVja2VkID0gdGhpc1ttb2RlbC5wcm9wXTtcbiAgICAgIH1cbiAgICB9LFxuICAgIF9vbk1vZGVsRXZlbnQoZXZlbnQpIHtcbiAgICAgIGNvbnN0IHsgdmFsdWUsIGNoZWNrZWQgfSA9IGV2ZW50LnRhcmdldDtcbiAgICAgIGxldCBuZXdWYWx1ZTtcblxuICAgICAgaWYgKHRoaXNbbW9kZWwucHJvcF0gaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgICAvLyBJcyBBcnJheVxuICAgICAgICBjb25zdCBpbmRleCA9IHRoaXNbbW9kZWwucHJvcF0uaW5kZXhPZih2YWx1ZSk7XG4gICAgICAgIGNvbnN0IGluY2x1ZGVkID0gaW5kZXggPj0gMDtcblxuICAgICAgICBpZiAoaW5jbHVkZWQgJiYgIWNoZWNrZWQpIHtcbiAgICAgICAgICBuZXdWYWx1ZSA9IFtcbiAgICAgICAgICAgIC4uLnRoaXNbbW9kZWwucHJvcF0uc2xpY2UoMCwgaW5kZXgpLFxuICAgICAgICAgICAgLi4udGhpc1ttb2RlbC5wcm9wXS5zbGljZShpbmRleCArIDEsIHRoaXNbbW9kZWwucHJvcF0ubGVuZ3RoKVxuICAgICAgICAgIF07XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIWluY2x1ZGVkICYmIGNoZWNrZWQpIHtcbiAgICAgICAgICBuZXdWYWx1ZSA9IFsgLi4udGhpc1ttb2RlbC5wcm9wXSwgdmFsdWUgXTtcbiAgICAgICAgfVxuXG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBJcyBCb29sZWFuXG4gICAgICAgIG5ld1ZhbHVlID0gY2hlY2tlZDtcbiAgICAgIH1cblxuICAgICAgLy8gRW1pdCBpZiB2YWx1ZSBjaGFuZ2VkXG4gICAgICBuZXdWYWx1ZSAhPT0gdW5kZWZpbmVkICYmIHRoaXMuJGVtaXQobW9kZWwuZXZlbnQsIG5ld1ZhbHVlKTtcbiAgICB9XG4gIH1cbn07XG5cbi8vIFJhZGlvIGlucHV0XG5jb25zdCBtb2RlbFJhZGlvID0ge1xuICBtaXhpbnM6IFttb2RlbElucHV0XSxcbiAgcHJvcHM6IHtcbiAgICBbbW9kZWwuZXZlbnRdOiB7XG4gICAgICB0eXBlOiBTdHJpbmcsXG4gICAgICBkZWZhdWx0OiAnY2hhbmdlJ1xuICAgIH1cbiAgfSxcblxuICBtZXRob2RzOiB7XG4gICAgX3VwZGF0ZVZhbHVlKCkge1xuICAgICAgdGhpcy4kZWwuY2hlY2tlZCA9IHRoaXNbbW9kZWwucHJvcF0gPT09IHRoaXMuJGVsLnZhbHVlO1xuICAgIH0sXG4gICAgX29uTW9kZWxFdmVudChldmVudCkge1xuICAgICAgY29uc3QgeyB2YWx1ZSwgY2hlY2tlZCB9ID0gZXZlbnQudGFyZ2V0O1xuICAgICAgY2hlY2tlZCAmJiB0aGlzLiRlbWl0KG1vZGVsLmV2ZW50LCB2YWx1ZSk7XG4gICAgfVxuICB9XG59O1xuXG5leHBvcnQgeyBtb2RlbElucHV0LCBtb2RlbENoZWNrYm94LCBtb2RlbFJhZGlvIH07XG5cbiIsIjx0ZW1wbGF0ZT5cbiAgPG9ucy10b29sYmFyIHYtb249XCJ1bnJlY29nbml6ZWRMaXN0ZW5lcnNcIj5cbiAgICA8c2xvdD48L3Nsb3Q+XG4gIDwvb25zLXRvb2xiYXI+XG48L3RlbXBsYXRlPlxuXG48c2NyaXB0PlxuICAvKiBUaGlzIGZpbGUgaXMgZ2VuZXJhdGVkIGF1dG9tYXRpY2FsbHkgKi9cbiAgaW1wb3J0ICdvbnNlbnVpL2VzbS9lbGVtZW50cy9vbnMtdG9vbGJhcic7XG4gIGltcG9ydCB7IGRlcml2ZUV2ZW50cyB9IGZyb20gJy4uL21peGlucyc7XG5cbiAgZXhwb3J0IGRlZmF1bHQge1xuICAgIG5hbWU6ICd2LW9ucy10b29sYmFyJyxcbiAgICBtaXhpbnM6IFtkZXJpdmVFdmVudHNdXG4gIH07XG48L3NjcmlwdD4iLCI8dGVtcGxhdGU+XG4gIDxvbnMtYm90dG9tLXRvb2xiYXIgdi1vbj1cInVucmVjb2duaXplZExpc3RlbmVyc1wiPlxuICAgIDxzbG90Pjwvc2xvdD5cbiAgPC9vbnMtYm90dG9tLXRvb2xiYXI+XG48L3RlbXBsYXRlPlxuXG48c2NyaXB0PlxuICAvKiBUaGlzIGZpbGUgaXMgZ2VuZXJhdGVkIGF1dG9tYXRpY2FsbHkgKi9cbiAgaW1wb3J0ICdvbnNlbnVpL2VzbS9lbGVtZW50cy9vbnMtYm90dG9tLXRvb2xiYXInO1xuICBpbXBvcnQgeyBkZXJpdmVFdmVudHMgfSBmcm9tICcuLi9taXhpbnMnO1xuXG4gIGV4cG9ydCBkZWZhdWx0IHtcbiAgICBuYW1lOiAndi1vbnMtYm90dG9tLXRvb2xiYXInLFxuICAgIG1peGluczogW2Rlcml2ZUV2ZW50c11cbiAgfTtcbjwvc2NyaXB0PiIsIjx0ZW1wbGF0ZT5cbiAgPG9ucy10b29sYmFyLWJ1dHRvbiB2LW9uPVwidW5yZWNvZ25pemVkTGlzdGVuZXJzXCI+XG4gICAgPHNsb3Q+PC9zbG90PlxuICA8L29ucy10b29sYmFyLWJ1dHRvbj5cbjwvdGVtcGxhdGU+XG5cbjxzY3JpcHQ+XG4gIC8qIFRoaXMgZmlsZSBpcyBnZW5lcmF0ZWQgYXV0b21hdGljYWxseSAqL1xuICBpbXBvcnQgJ29uc2VudWkvZXNtL2VsZW1lbnRzL29ucy10b29sYmFyLWJ1dHRvbic7XG4gIGltcG9ydCB7IGRlcml2ZUV2ZW50cyB9IGZyb20gJy4uL21peGlucyc7XG5cbiAgZXhwb3J0IGRlZmF1bHQge1xuICAgIG5hbWU6ICd2LW9ucy10b29sYmFyLWJ1dHRvbicsXG4gICAgbWl4aW5zOiBbZGVyaXZlRXZlbnRzXVxuICB9O1xuPC9zY3JpcHQ+IiwiPHRlbXBsYXRlPlxuICA8b25zLWFsZXJ0LWRpYWxvZy1idXR0b24gdi1vbj1cInVucmVjb2duaXplZExpc3RlbmVyc1wiPlxuICAgIDxzbG90Pjwvc2xvdD5cbiAgPC9vbnMtYWxlcnQtZGlhbG9nLWJ1dHRvbj5cbjwvdGVtcGxhdGU+XG5cbjxzY3JpcHQ+XG4gIC8qIFRoaXMgZmlsZSBpcyBnZW5lcmF0ZWQgYXV0b21hdGljYWxseSAqL1xuICBpbXBvcnQgJ29uc2VudWkvZXNtL2VsZW1lbnRzL29ucy1hbGVydC1kaWFsb2ctYnV0dG9uJztcbiAgaW1wb3J0IHsgZGVyaXZlRXZlbnRzIH0gZnJvbSAnLi4vbWl4aW5zJztcblxuICBleHBvcnQgZGVmYXVsdCB7XG4gICAgbmFtZTogJ3Ytb25zLWFsZXJ0LWRpYWxvZy1idXR0b24nLFxuICAgIG1peGluczogW2Rlcml2ZUV2ZW50c11cbiAgfTtcbjwvc2NyaXB0PiIsIjx0ZW1wbGF0ZT5cbiAgPG9ucy1idXR0b24gdi1vbj1cInVucmVjb2duaXplZExpc3RlbmVyc1wiPlxuICAgIDxzbG90Pjwvc2xvdD5cbiAgPC9vbnMtYnV0dG9uPlxuPC90ZW1wbGF0ZT5cblxuPHNjcmlwdD5cbiAgLyogVGhpcyBmaWxlIGlzIGdlbmVyYXRlZCBhdXRvbWF0aWNhbGx5ICovXG4gIGltcG9ydCAnb25zZW51aS9lc20vZWxlbWVudHMvb25zLWJ1dHRvbic7XG4gIGltcG9ydCB7IGRlcml2ZUV2ZW50cyB9IGZyb20gJy4uL21peGlucyc7XG5cbiAgZXhwb3J0IGRlZmF1bHQge1xuICAgIG5hbWU6ICd2LW9ucy1idXR0b24nLFxuICAgIG1peGluczogW2Rlcml2ZUV2ZW50c11cbiAgfTtcbjwvc2NyaXB0PiIsIjx0ZW1wbGF0ZT5cbiAgPG9ucy1pY29uIHYtb249XCJ1bnJlY29nbml6ZWRMaXN0ZW5lcnNcIj5cbiAgICA8c2xvdD48L3Nsb3Q+XG4gIDwvb25zLWljb24+XG48L3RlbXBsYXRlPlxuXG48c2NyaXB0PlxuICAvKiBUaGlzIGZpbGUgaXMgZ2VuZXJhdGVkIGF1dG9tYXRpY2FsbHkgKi9cbiAgaW1wb3J0ICdvbnNlbnVpL2VzbS9lbGVtZW50cy9vbnMtaWNvbic7XG4gIGltcG9ydCB7IGRlcml2ZUV2ZW50cyB9IGZyb20gJy4uL21peGlucyc7XG5cbiAgZXhwb3J0IGRlZmF1bHQge1xuICAgIG5hbWU6ICd2LW9ucy1pY29uJyxcbiAgICBtaXhpbnM6IFtkZXJpdmVFdmVudHNdXG4gIH07XG48L3NjcmlwdD4iLCI8dGVtcGxhdGU+XG4gIDxvbnMtY2FyZCB2LW9uPVwidW5yZWNvZ25pemVkTGlzdGVuZXJzXCI+XG4gICAgPHNsb3Q+PC9zbG90PlxuICA8L29ucy1jYXJkPlxuPC90ZW1wbGF0ZT5cblxuPHNjcmlwdD5cbiAgLyogVGhpcyBmaWxlIGlzIGdlbmVyYXRlZCBhdXRvbWF0aWNhbGx5ICovXG4gIGltcG9ydCAnb25zZW51aS9lc20vZWxlbWVudHMvb25zLWNhcmQnO1xuICBpbXBvcnQgeyBkZXJpdmVFdmVudHMgfSBmcm9tICcuLi9taXhpbnMnO1xuXG4gIGV4cG9ydCBkZWZhdWx0IHtcbiAgICBuYW1lOiAndi1vbnMtY2FyZCcsXG4gICAgbWl4aW5zOiBbZGVyaXZlRXZlbnRzXVxuICB9O1xuPC9zY3JpcHQ+IiwiPHRlbXBsYXRlPlxuICA8b25zLWxpc3Qgdi1vbj1cInVucmVjb2duaXplZExpc3RlbmVyc1wiPlxuICAgIDxzbG90Pjwvc2xvdD5cbiAgPC9vbnMtbGlzdD5cbjwvdGVtcGxhdGU+XG5cbjxzY3JpcHQ+XG4gIC8qIFRoaXMgZmlsZSBpcyBnZW5lcmF0ZWQgYXV0b21hdGljYWxseSAqL1xuICBpbXBvcnQgJ29uc2VudWkvZXNtL2VsZW1lbnRzL29ucy1saXN0JztcbiAgaW1wb3J0IHsgZGVyaXZlRXZlbnRzIH0gZnJvbSAnLi4vbWl4aW5zJztcblxuICBleHBvcnQgZGVmYXVsdCB7XG4gICAgbmFtZTogJ3Ytb25zLWxpc3QnLFxuICAgIG1peGluczogW2Rlcml2ZUV2ZW50c11cbiAgfTtcbjwvc2NyaXB0PiIsIjx0ZW1wbGF0ZT5cbiAgPG9ucy1saXN0LWl0ZW0gdi1vbj1cInVucmVjb2duaXplZExpc3RlbmVyc1wiPlxuICAgIDxzbG90Pjwvc2xvdD5cbiAgPC9vbnMtbGlzdC1pdGVtPlxuPC90ZW1wbGF0ZT5cblxuPHNjcmlwdD5cbiAgLyogVGhpcyBmaWxlIGlzIGdlbmVyYXRlZCBhdXRvbWF0aWNhbGx5ICovXG4gIGltcG9ydCAnb25zZW51aS9lc20vZWxlbWVudHMvb25zLWxpc3QtaXRlbSc7XG4gIGltcG9ydCB7IGRlcml2ZUV2ZW50cyB9IGZyb20gJy4uL21peGlucyc7XG5cbiAgZXhwb3J0IGRlZmF1bHQge1xuICAgIG5hbWU6ICd2LW9ucy1saXN0LWl0ZW0nLFxuICAgIG1peGluczogW2Rlcml2ZUV2ZW50c11cbiAgfTtcbjwvc2NyaXB0PiIsIjx0ZW1wbGF0ZT5cbiAgPG9ucy1saXN0LXRpdGxlIHYtb249XCJ1bnJlY29nbml6ZWRMaXN0ZW5lcnNcIj5cbiAgICA8c2xvdD48L3Nsb3Q+XG4gIDwvb25zLWxpc3QtdGl0bGU+XG48L3RlbXBsYXRlPlxuXG48c2NyaXB0PlxuICAvKiBUaGlzIGZpbGUgaXMgZ2VuZXJhdGVkIGF1dG9tYXRpY2FsbHkgKi9cbiAgaW1wb3J0ICdvbnNlbnVpL2VzbS9lbGVtZW50cy9vbnMtbGlzdC10aXRsZSc7XG4gIGltcG9ydCB7IGRlcml2ZUV2ZW50cyB9IGZyb20gJy4uL21peGlucyc7XG5cbiAgZXhwb3J0IGRlZmF1bHQge1xuICAgIG5hbWU6ICd2LW9ucy1saXN0LXRpdGxlJyxcbiAgICBtaXhpbnM6IFtkZXJpdmVFdmVudHNdXG4gIH07XG48L3NjcmlwdD4iLCI8dGVtcGxhdGU+XG4gIDxvbnMtbGlzdC1oZWFkZXIgdi1vbj1cInVucmVjb2duaXplZExpc3RlbmVyc1wiPlxuICAgIDxzbG90Pjwvc2xvdD5cbiAgPC9vbnMtbGlzdC1oZWFkZXI+XG48L3RlbXBsYXRlPlxuXG48c2NyaXB0PlxuICAvKiBUaGlzIGZpbGUgaXMgZ2VuZXJhdGVkIGF1dG9tYXRpY2FsbHkgKi9cbiAgaW1wb3J0ICdvbnNlbnVpL2VzbS9lbGVtZW50cy9vbnMtbGlzdC1oZWFkZXInO1xuICBpbXBvcnQgeyBkZXJpdmVFdmVudHMgfSBmcm9tICcuLi9taXhpbnMnO1xuXG4gIGV4cG9ydCBkZWZhdWx0IHtcbiAgICBuYW1lOiAndi1vbnMtbGlzdC1oZWFkZXInLFxuICAgIG1peGluczogW2Rlcml2ZUV2ZW50c11cbiAgfTtcbjwvc2NyaXB0PiIsIjx0ZW1wbGF0ZT5cbiAgPG9ucy1yaXBwbGUgdi1vbj1cInVucmVjb2duaXplZExpc3RlbmVyc1wiPlxuICAgIDxzbG90Pjwvc2xvdD5cbiAgPC9vbnMtcmlwcGxlPlxuPC90ZW1wbGF0ZT5cblxuPHNjcmlwdD5cbiAgLyogVGhpcyBmaWxlIGlzIGdlbmVyYXRlZCBhdXRvbWF0aWNhbGx5ICovXG4gIGltcG9ydCAnb25zZW51aS9lc20vZWxlbWVudHMvb25zLXJpcHBsZSc7XG4gIGltcG9ydCB7IGRlcml2ZUV2ZW50cyB9IGZyb20gJy4uL21peGlucyc7XG5cbiAgZXhwb3J0IGRlZmF1bHQge1xuICAgIG5hbWU6ICd2LW9ucy1yaXBwbGUnLFxuICAgIG1peGluczogW2Rlcml2ZUV2ZW50c11cbiAgfTtcbjwvc2NyaXB0PiIsIjx0ZW1wbGF0ZT5cbiAgPG9ucy1yb3cgdi1vbj1cInVucmVjb2duaXplZExpc3RlbmVyc1wiPlxuICAgIDxzbG90Pjwvc2xvdD5cbiAgPC9vbnMtcm93PlxuPC90ZW1wbGF0ZT5cblxuPHNjcmlwdD5cbiAgLyogVGhpcyBmaWxlIGlzIGdlbmVyYXRlZCBhdXRvbWF0aWNhbGx5ICovXG4gIGltcG9ydCAnb25zZW51aS9lc20vZWxlbWVudHMvb25zLXJvdyc7XG4gIGltcG9ydCB7IGRlcml2ZUV2ZW50cyB9IGZyb20gJy4uL21peGlucyc7XG5cbiAgZXhwb3J0IGRlZmF1bHQge1xuICAgIG5hbWU6ICd2LW9ucy1yb3cnLFxuICAgIG1peGluczogW2Rlcml2ZUV2ZW50c11cbiAgfTtcbjwvc2NyaXB0PiIsIjx0ZW1wbGF0ZT5cbiAgPG9ucy1jb2wgdi1vbj1cInVucmVjb2duaXplZExpc3RlbmVyc1wiPlxuICAgIDxzbG90Pjwvc2xvdD5cbiAgPC9vbnMtY29sPlxuPC90ZW1wbGF0ZT5cblxuPHNjcmlwdD5cbiAgLyogVGhpcyBmaWxlIGlzIGdlbmVyYXRlZCBhdXRvbWF0aWNhbGx5ICovXG4gIGltcG9ydCAnb25zZW51aS9lc20vZWxlbWVudHMvb25zLWNvbCc7XG4gIGltcG9ydCB7IGRlcml2ZUV2ZW50cyB9IGZyb20gJy4uL21peGlucyc7XG5cbiAgZXhwb3J0IGRlZmF1bHQge1xuICAgIG5hbWU6ICd2LW9ucy1jb2wnLFxuICAgIG1peGluczogW2Rlcml2ZUV2ZW50c11cbiAgfTtcbjwvc2NyaXB0PiIsIjx0ZW1wbGF0ZT5cbiAgPG9ucy1wcm9ncmVzcy1iYXIgdi1vbj1cInVucmVjb2duaXplZExpc3RlbmVyc1wiPlxuICAgIDxzbG90Pjwvc2xvdD5cbiAgPC9vbnMtcHJvZ3Jlc3MtYmFyPlxuPC90ZW1wbGF0ZT5cblxuPHNjcmlwdD5cbiAgLyogVGhpcyBmaWxlIGlzIGdlbmVyYXRlZCBhdXRvbWF0aWNhbGx5ICovXG4gIGltcG9ydCAnb25zZW51aS9lc20vZWxlbWVudHMvb25zLXByb2dyZXNzLWJhcic7XG4gIGltcG9ydCB7IGRlcml2ZUV2ZW50cyB9IGZyb20gJy4uL21peGlucyc7XG5cbiAgZXhwb3J0IGRlZmF1bHQge1xuICAgIG5hbWU6ICd2LW9ucy1wcm9ncmVzcy1iYXInLFxuICAgIG1peGluczogW2Rlcml2ZUV2ZW50c11cbiAgfTtcbjwvc2NyaXB0PiIsIjx0ZW1wbGF0ZT5cbiAgPG9ucy1wcm9ncmVzcy1jaXJjdWxhciB2LW9uPVwidW5yZWNvZ25pemVkTGlzdGVuZXJzXCI+XG4gICAgPHNsb3Q+PC9zbG90PlxuICA8L29ucy1wcm9ncmVzcy1jaXJjdWxhcj5cbjwvdGVtcGxhdGU+XG5cbjxzY3JpcHQ+XG4gIC8qIFRoaXMgZmlsZSBpcyBnZW5lcmF0ZWQgYXV0b21hdGljYWxseSAqL1xuICBpbXBvcnQgJ29uc2VudWkvZXNtL2VsZW1lbnRzL29ucy1wcm9ncmVzcy1jaXJjdWxhcic7XG4gIGltcG9ydCB7IGRlcml2ZUV2ZW50cyB9IGZyb20gJy4uL21peGlucyc7XG5cbiAgZXhwb3J0IGRlZmF1bHQge1xuICAgIG5hbWU6ICd2LW9ucy1wcm9ncmVzcy1jaXJjdWxhcicsXG4gICAgbWl4aW5zOiBbZGVyaXZlRXZlbnRzXVxuICB9O1xuPC9zY3JpcHQ+IiwiPHRlbXBsYXRlPlxuICA8b25zLWNhcm91c2VsLWl0ZW0gdi1vbj1cInVucmVjb2duaXplZExpc3RlbmVyc1wiPlxuICAgIDxzbG90Pjwvc2xvdD5cbiAgPC9vbnMtY2Fyb3VzZWwtaXRlbT5cbjwvdGVtcGxhdGU+XG5cbjxzY3JpcHQ+XG4gIC8qIFRoaXMgZmlsZSBpcyBnZW5lcmF0ZWQgYXV0b21hdGljYWxseSAqL1xuICBpbXBvcnQgJ29uc2VudWkvZXNtL2VsZW1lbnRzL29ucy1jYXJvdXNlbC1pdGVtJztcbiAgaW1wb3J0IHsgZGVyaXZlRXZlbnRzIH0gZnJvbSAnLi4vbWl4aW5zJztcblxuICBleHBvcnQgZGVmYXVsdCB7XG4gICAgbmFtZTogJ3Ytb25zLWNhcm91c2VsLWl0ZW0nLFxuICAgIG1peGluczogW2Rlcml2ZUV2ZW50c11cbiAgfTtcbjwvc2NyaXB0PiIsIjx0ZW1wbGF0ZT5cbiAgPG9ucy1zcGxpdHRlci1tYXNrIHYtb249XCJ1bnJlY29nbml6ZWRMaXN0ZW5lcnNcIj5cbiAgICA8c2xvdD48L3Nsb3Q+XG4gIDwvb25zLXNwbGl0dGVyLW1hc2s+XG48L3RlbXBsYXRlPlxuXG48c2NyaXB0PlxuICAvKiBUaGlzIGZpbGUgaXMgZ2VuZXJhdGVkIGF1dG9tYXRpY2FsbHkgKi9cbiAgaW1wb3J0ICdvbnNlbnVpL2VzbS9lbGVtZW50cy9vbnMtc3BsaXR0ZXItbWFzayc7XG4gIGltcG9ydCB7IGRlcml2ZUV2ZW50cyB9IGZyb20gJy4uL21peGlucyc7XG5cbiAgZXhwb3J0IGRlZmF1bHQge1xuICAgIG5hbWU6ICd2LW9ucy1zcGxpdHRlci1tYXNrJyxcbiAgICBtaXhpbnM6IFtkZXJpdmVFdmVudHNdXG4gIH07XG48L3NjcmlwdD4iLCI8dGVtcGxhdGU+XG4gIDxvbnMtc3BsaXR0ZXItY29udGVudCB2LW9uPVwidW5yZWNvZ25pemVkTGlzdGVuZXJzXCI+XG4gICAgPHNsb3Q+PC9zbG90PlxuICA8L29ucy1zcGxpdHRlci1jb250ZW50PlxuPC90ZW1wbGF0ZT5cblxuPHNjcmlwdD5cbiAgLyogVGhpcyBmaWxlIGlzIGdlbmVyYXRlZCBhdXRvbWF0aWNhbGx5ICovXG4gIGltcG9ydCAnb25zZW51aS9lc20vZWxlbWVudHMvb25zLXNwbGl0dGVyLWNvbnRlbnQnO1xuICBpbXBvcnQgeyBkZXJpdmVFdmVudHMgfSBmcm9tICcuLi9taXhpbnMnO1xuXG4gIGV4cG9ydCBkZWZhdWx0IHtcbiAgICBuYW1lOiAndi1vbnMtc3BsaXR0ZXItY29udGVudCcsXG4gICAgbWl4aW5zOiBbZGVyaXZlRXZlbnRzXVxuICB9O1xuPC9zY3JpcHQ+IiwiPHRlbXBsYXRlPlxuICA8b25zLXNwbGl0dGVyIHYtb249XCJ1bnJlY29nbml6ZWRMaXN0ZW5lcnNcIj5cbiAgICA8c2xvdD48L3Nsb3Q+XG4gIDwvb25zLXNwbGl0dGVyPlxuPC90ZW1wbGF0ZT5cblxuPHNjcmlwdD5cbiAgLyogVGhpcyBmaWxlIGlzIGdlbmVyYXRlZCBhdXRvbWF0aWNhbGx5ICovXG4gIGltcG9ydCAnb25zZW51aS9lc20vZWxlbWVudHMvb25zLXNwbGl0dGVyJztcbiAgaW1wb3J0IHsgZGVyaXZlRXZlbnRzLCBzZWxmUHJvdmlkZXIsIGRlcml2ZURCQiB9IGZyb20gJy4uL21peGlucyc7XG5cbiAgZXhwb3J0IGRlZmF1bHQge1xuICAgIG5hbWU6ICd2LW9ucy1zcGxpdHRlcicsXG4gICAgbWl4aW5zOiBbZGVyaXZlRXZlbnRzLCBzZWxmUHJvdmlkZXIsIGRlcml2ZURCQl1cbiAgfTtcbjwvc2NyaXB0PiIsIjx0ZW1wbGF0ZT5cbiAgPG9ucy1zd2l0Y2ggdi1vbj1cInVucmVjb2duaXplZExpc3RlbmVyc1wiPlxuICAgIDxzbG90Pjwvc2xvdD5cbiAgPC9vbnMtc3dpdGNoPlxuPC90ZW1wbGF0ZT5cblxuPHNjcmlwdD5cbiAgLyogVGhpcyBmaWxlIGlzIGdlbmVyYXRlZCBhdXRvbWF0aWNhbGx5ICovXG4gIGltcG9ydCAnb25zZW51aS9lc20vZWxlbWVudHMvb25zLXN3aXRjaCc7XG4gIGltcG9ydCB7IGRlcml2ZUV2ZW50cywgbW9kZWxDaGVja2JveCB9IGZyb20gJy4uL21peGlucyc7XG5cbiAgZXhwb3J0IGRlZmF1bHQge1xuICAgIG5hbWU6ICd2LW9ucy1zd2l0Y2gnLFxuICAgIG1peGluczogW2Rlcml2ZUV2ZW50cywgbW9kZWxDaGVja2JveF1cbiAgfTtcbjwvc2NyaXB0PiIsIjx0ZW1wbGF0ZT5cbiAgPG9ucy1jaGVja2JveCB2LW9uPVwidW5yZWNvZ25pemVkTGlzdGVuZXJzXCI+XG4gICAgPHNsb3Q+PC9zbG90PlxuICA8L29ucy1jaGVja2JveD5cbjwvdGVtcGxhdGU+XG5cbjxzY3JpcHQ+XG4gIC8qIFRoaXMgZmlsZSBpcyBnZW5lcmF0ZWQgYXV0b21hdGljYWxseSAqL1xuICBpbXBvcnQgJ29uc2VudWkvZXNtL2VsZW1lbnRzL29ucy1jaGVja2JveCc7XG4gIGltcG9ydCB7IGRlcml2ZUV2ZW50cywgbW9kZWxDaGVja2JveCB9IGZyb20gJy4uL21peGlucyc7XG5cbiAgZXhwb3J0IGRlZmF1bHQge1xuICAgIG5hbWU6ICd2LW9ucy1jaGVja2JveCcsXG4gICAgbWl4aW5zOiBbZGVyaXZlRXZlbnRzLCBtb2RlbENoZWNrYm94XVxuICB9O1xuPC9zY3JpcHQ+IiwiPHRlbXBsYXRlPlxuICA8b25zLWlucHV0IHYtb249XCJ1bnJlY29nbml6ZWRMaXN0ZW5lcnNcIj5cbiAgICA8c2xvdD48L3Nsb3Q+XG4gIDwvb25zLWlucHV0PlxuPC90ZW1wbGF0ZT5cblxuPHNjcmlwdD5cbiAgLyogVGhpcyBmaWxlIGlzIGdlbmVyYXRlZCBhdXRvbWF0aWNhbGx5ICovXG4gIGltcG9ydCAnb25zZW51aS9lc20vZWxlbWVudHMvb25zLWlucHV0JztcbiAgaW1wb3J0IHsgZGVyaXZlRXZlbnRzLCBtb2RlbElucHV0IH0gZnJvbSAnLi4vbWl4aW5zJztcblxuICBleHBvcnQgZGVmYXVsdCB7XG4gICAgbmFtZTogJ3Ytb25zLWlucHV0JyxcbiAgICBtaXhpbnM6IFtkZXJpdmVFdmVudHMsIG1vZGVsSW5wdXRdXG4gIH07XG48L3NjcmlwdD4iLCI8dGVtcGxhdGU+XG4gIDxvbnMtc2VhcmNoLWlucHV0IHYtb249XCJ1bnJlY29nbml6ZWRMaXN0ZW5lcnNcIj5cbiAgICA8c2xvdD48L3Nsb3Q+XG4gIDwvb25zLXNlYXJjaC1pbnB1dD5cbjwvdGVtcGxhdGU+XG5cbjxzY3JpcHQ+XG4gIC8qIFRoaXMgZmlsZSBpcyBnZW5lcmF0ZWQgYXV0b21hdGljYWxseSAqL1xuICBpbXBvcnQgJ29uc2VudWkvZXNtL2VsZW1lbnRzL29ucy1zZWFyY2gtaW5wdXQnO1xuICBpbXBvcnQgeyBkZXJpdmVFdmVudHMsIG1vZGVsSW5wdXQgfSBmcm9tICcuLi9taXhpbnMnO1xuXG4gIGV4cG9ydCBkZWZhdWx0IHtcbiAgICBuYW1lOiAndi1vbnMtc2VhcmNoLWlucHV0JyxcbiAgICBtaXhpbnM6IFtkZXJpdmVFdmVudHMsIG1vZGVsSW5wdXRdXG4gIH07XG48L3NjcmlwdD4iLCI8dGVtcGxhdGU+XG4gIDxvbnMtcmFuZ2Ugdi1vbj1cInVucmVjb2duaXplZExpc3RlbmVyc1wiPlxuICAgIDxzbG90Pjwvc2xvdD5cbiAgPC9vbnMtcmFuZ2U+XG48L3RlbXBsYXRlPlxuXG48c2NyaXB0PlxuICAvKiBUaGlzIGZpbGUgaXMgZ2VuZXJhdGVkIGF1dG9tYXRpY2FsbHkgKi9cbiAgaW1wb3J0ICdvbnNlbnVpL2VzbS9lbGVtZW50cy9vbnMtcmFuZ2UnO1xuICBpbXBvcnQgeyBkZXJpdmVFdmVudHMsIG1vZGVsSW5wdXQgfSBmcm9tICcuLi9taXhpbnMnO1xuXG4gIGV4cG9ydCBkZWZhdWx0IHtcbiAgICBuYW1lOiAndi1vbnMtcmFuZ2UnLFxuICAgIG1peGluczogW2Rlcml2ZUV2ZW50cywgbW9kZWxJbnB1dF1cbiAgfTtcbjwvc2NyaXB0PiIsIjx0ZW1wbGF0ZT5cbiAgPG9ucy1yYWRpbyB2LW9uPVwidW5yZWNvZ25pemVkTGlzdGVuZXJzXCI+XG4gICAgPHNsb3Q+PC9zbG90PlxuICA8L29ucy1yYWRpbz5cbjwvdGVtcGxhdGU+XG5cbjxzY3JpcHQ+XG4gIC8qIFRoaXMgZmlsZSBpcyBnZW5lcmF0ZWQgYXV0b21hdGljYWxseSAqL1xuICBpbXBvcnQgJ29uc2VudWkvZXNtL2VsZW1lbnRzL29ucy1yYWRpbyc7XG4gIGltcG9ydCB7IGRlcml2ZUV2ZW50cywgbW9kZWxSYWRpbyB9IGZyb20gJy4uL21peGlucyc7XG5cbiAgZXhwb3J0IGRlZmF1bHQge1xuICAgIG5hbWU6ICd2LW9ucy1yYWRpbycsXG4gICAgbWl4aW5zOiBbZGVyaXZlRXZlbnRzLCBtb2RlbFJhZGlvXVxuICB9O1xuPC9zY3JpcHQ+IiwiPHRlbXBsYXRlPlxuICA8b25zLWZhYiB2LW9uPVwidW5yZWNvZ25pemVkTGlzdGVuZXJzXCI+XG4gICAgPHNsb3Q+PC9zbG90PlxuICA8L29ucy1mYWI+XG48L3RlbXBsYXRlPlxuXG48c2NyaXB0PlxuICAvKiBUaGlzIGZpbGUgaXMgZ2VuZXJhdGVkIGF1dG9tYXRpY2FsbHkgKi9cbiAgaW1wb3J0ICdvbnNlbnVpL2VzbS9lbGVtZW50cy9vbnMtZmFiJztcbiAgaW1wb3J0IHsgZGVyaXZlRXZlbnRzLCBoaWRhYmxlIH0gZnJvbSAnLi4vbWl4aW5zJztcblxuICBleHBvcnQgZGVmYXVsdCB7XG4gICAgbmFtZTogJ3Ytb25zLWZhYicsXG4gICAgbWl4aW5zOiBbZGVyaXZlRXZlbnRzLCBoaWRhYmxlXVxuICB9O1xuPC9zY3JpcHQ+IiwiPHRlbXBsYXRlPlxuICA8b25zLXNwZWVkLWRpYWwtaXRlbSB2LW9uPVwidW5yZWNvZ25pemVkTGlzdGVuZXJzXCI+XG4gICAgPHNsb3Q+PC9zbG90PlxuICA8L29ucy1zcGVlZC1kaWFsLWl0ZW0+XG48L3RlbXBsYXRlPlxuXG48c2NyaXB0PlxuICAvKiBUaGlzIGZpbGUgaXMgZ2VuZXJhdGVkIGF1dG9tYXRpY2FsbHkgKi9cbiAgaW1wb3J0ICdvbnNlbnVpL2VzbS9lbGVtZW50cy9vbnMtc3BlZWQtZGlhbC1pdGVtJztcbiAgaW1wb3J0IHsgZGVyaXZlRXZlbnRzIH0gZnJvbSAnLi4vbWl4aW5zJztcblxuICBleHBvcnQgZGVmYXVsdCB7XG4gICAgbmFtZTogJ3Ytb25zLXNwZWVkLWRpYWwtaXRlbScsXG4gICAgbWl4aW5zOiBbZGVyaXZlRXZlbnRzXVxuICB9O1xuPC9zY3JpcHQ+IiwiPHRlbXBsYXRlPlxuICA8b25zLWRpYWxvZyB2LW9uPVwidW5yZWNvZ25pemVkTGlzdGVuZXJzXCI+XG4gICAgPHNsb3Q+PC9zbG90PlxuICA8L29ucy1kaWFsb2c+XG48L3RlbXBsYXRlPlxuXG48c2NyaXB0PlxuICAvKiBUaGlzIGZpbGUgaXMgZ2VuZXJhdGVkIGF1dG9tYXRpY2FsbHkgKi9cbiAgaW1wb3J0ICdvbnNlbnVpL2VzbS9lbGVtZW50cy9vbnMtZGlhbG9nJztcbiAgaW1wb3J0IHsgZGVyaXZlRXZlbnRzLCBoaWRhYmxlLCBoYXNPcHRpb25zLCBkaWFsb2dDYW5jZWwsIGRlcml2ZURCQiwgcG9ydGFsIH0gZnJvbSAnLi4vbWl4aW5zJztcblxuICBleHBvcnQgZGVmYXVsdCB7XG4gICAgbmFtZTogJ3Ytb25zLWRpYWxvZycsXG4gICAgbWl4aW5zOiBbZGVyaXZlRXZlbnRzLCBoaWRhYmxlLCBoYXNPcHRpb25zLCBkaWFsb2dDYW5jZWwsIGRlcml2ZURCQiwgcG9ydGFsXVxuICB9O1xuPC9zY3JpcHQ+IiwiPHRlbXBsYXRlPlxuICA8b25zLWFjdGlvbi1zaGVldCB2LW9uPVwidW5yZWNvZ25pemVkTGlzdGVuZXJzXCI+XG4gICAgPHNsb3Q+PC9zbG90PlxuICA8L29ucy1hY3Rpb24tc2hlZXQ+XG48L3RlbXBsYXRlPlxuXG48c2NyaXB0PlxuICAvKiBUaGlzIGZpbGUgaXMgZ2VuZXJhdGVkIGF1dG9tYXRpY2FsbHkgKi9cbiAgaW1wb3J0ICdvbnNlbnVpL2VzbS9lbGVtZW50cy9vbnMtYWN0aW9uLXNoZWV0JztcbiAgaW1wb3J0IHsgZGVyaXZlRXZlbnRzLCBoaWRhYmxlLCBoYXNPcHRpb25zLCBkaWFsb2dDYW5jZWwsIGRlcml2ZURCQiwgcG9ydGFsIH0gZnJvbSAnLi4vbWl4aW5zJztcblxuICBleHBvcnQgZGVmYXVsdCB7XG4gICAgbmFtZTogJ3Ytb25zLWFjdGlvbi1zaGVldCcsXG4gICAgbWl4aW5zOiBbZGVyaXZlRXZlbnRzLCBoaWRhYmxlLCBoYXNPcHRpb25zLCBkaWFsb2dDYW5jZWwsIGRlcml2ZURCQiwgcG9ydGFsXVxuICB9O1xuPC9zY3JpcHQ+IiwiPHRlbXBsYXRlPlxuICA8b25zLWFjdGlvbi1zaGVldC1idXR0b24gdi1vbj1cInVucmVjb2duaXplZExpc3RlbmVyc1wiPlxuICAgIDxzbG90Pjwvc2xvdD5cbiAgPC9vbnMtYWN0aW9uLXNoZWV0LWJ1dHRvbj5cbjwvdGVtcGxhdGU+XG5cbjxzY3JpcHQ+XG4gIC8qIFRoaXMgZmlsZSBpcyBnZW5lcmF0ZWQgYXV0b21hdGljYWxseSAqL1xuICBpbXBvcnQgJ29uc2VudWkvZXNtL2VsZW1lbnRzL29ucy1hY3Rpb24tc2hlZXQtYnV0dG9uJztcbiAgaW1wb3J0IHsgZGVyaXZlRXZlbnRzIH0gZnJvbSAnLi4vbWl4aW5zJztcblxuICBleHBvcnQgZGVmYXVsdCB7XG4gICAgbmFtZTogJ3Ytb25zLWFjdGlvbi1zaGVldC1idXR0b24nLFxuICAgIG1peGluczogW2Rlcml2ZUV2ZW50c11cbiAgfTtcbjwvc2NyaXB0PiIsIjx0ZW1wbGF0ZT5cbiAgPG9ucy1tb2RhbCB2LW9uPVwidW5yZWNvZ25pemVkTGlzdGVuZXJzXCI+XG4gICAgPHNsb3Q+PC9zbG90PlxuICA8L29ucy1tb2RhbD5cbjwvdGVtcGxhdGU+XG5cbjxzY3JpcHQ+XG4gIC8qIFRoaXMgZmlsZSBpcyBnZW5lcmF0ZWQgYXV0b21hdGljYWxseSAqL1xuICBpbXBvcnQgJ29uc2VudWkvZXNtL2VsZW1lbnRzL29ucy1tb2RhbCc7XG4gIGltcG9ydCB7IGRlcml2ZUV2ZW50cywgaGlkYWJsZSwgaGFzT3B0aW9ucywgZGVyaXZlREJCLCBwb3J0YWwgfSBmcm9tICcuLi9taXhpbnMnO1xuXG4gIGV4cG9ydCBkZWZhdWx0IHtcbiAgICBuYW1lOiAndi1vbnMtbW9kYWwnLFxuICAgIG1peGluczogW2Rlcml2ZUV2ZW50cywgaGlkYWJsZSwgaGFzT3B0aW9ucywgZGVyaXZlREJCLCBwb3J0YWxdXG4gIH07XG48L3NjcmlwdD4iLCI8dGVtcGxhdGU+XG4gIDxvbnMtdG9hc3Qgdi1vbj1cInVucmVjb2duaXplZExpc3RlbmVyc1wiPlxuICAgIDxzbG90Pjwvc2xvdD5cbiAgPC9vbnMtdG9hc3Q+XG48L3RlbXBsYXRlPlxuXG48c2NyaXB0PlxuICAvKiBUaGlzIGZpbGUgaXMgZ2VuZXJhdGVkIGF1dG9tYXRpY2FsbHkgKi9cbiAgaW1wb3J0ICdvbnNlbnVpL2VzbS9lbGVtZW50cy9vbnMtdG9hc3QnO1xuICBpbXBvcnQgeyBkZXJpdmVFdmVudHMsIGhpZGFibGUsIGhhc09wdGlvbnMsIGRlcml2ZURCQiwgcG9ydGFsIH0gZnJvbSAnLi4vbWl4aW5zJztcblxuICBleHBvcnQgZGVmYXVsdCB7XG4gICAgbmFtZTogJ3Ytb25zLXRvYXN0JyxcbiAgICBtaXhpbnM6IFtkZXJpdmVFdmVudHMsIGhpZGFibGUsIGhhc09wdGlvbnMsIGRlcml2ZURCQiwgcG9ydGFsXVxuICB9O1xuPC9zY3JpcHQ+IiwiPHRlbXBsYXRlPlxuICA8b25zLXBvcG92ZXIgdi1vbj1cInVucmVjb2duaXplZExpc3RlbmVyc1wiPlxuICAgIDxzbG90Pjwvc2xvdD5cbiAgPC9vbnMtcG9wb3Zlcj5cbjwvdGVtcGxhdGU+XG5cbjxzY3JpcHQ+XG4gIGltcG9ydCAnb25zZW51aS9lc20vZWxlbWVudHMvb25zLXBvcG92ZXInO1xuICBpbXBvcnQgeyBoaWRhYmxlLCBoYXNPcHRpb25zLCBkaWFsb2dDYW5jZWwsIGRlcml2ZUV2ZW50cywgZGVyaXZlREJCLCBwb3J0YWwgfSBmcm9tICcuLi9taXhpbnMnO1xuXG4gIGV4cG9ydCBkZWZhdWx0IHtcbiAgICBuYW1lOiAndi1vbnMtcG9wb3ZlcicsXG4gICAgbWl4aW5zOiBbaGlkYWJsZSwgaGFzT3B0aW9ucywgZGlhbG9nQ2FuY2VsLCBkZXJpdmVFdmVudHMsIGRlcml2ZURCQiwgcG9ydGFsXSxcblxuICAgIHByb3BzOiB7XG4gICAgICB0YXJnZXQ6IHtcbiAgICAgICAgdmFsaWRhdG9yKHZhbHVlKSB7XG4gICAgICAgICAgcmV0dXJuIHZhbHVlLl9pc1Z1ZSB8fCB0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnIHx8IHZhbHVlIGluc3RhbmNlb2YgRXZlbnQgfHwgdmFsdWUgaW5zdGFuY2VvZiBIVE1MRWxlbWVudDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG5cbiAgICBjb21wdXRlZDoge1xuICAgICAgbm9ybWFsaXplZFRhcmdldCgpIHtcbiAgICAgICAgaWYgKHRoaXMudGFyZ2V0ICYmIHRoaXMudGFyZ2V0Ll9pc1Z1ZSkge1xuICAgICAgICAgIHJldHVybiB0aGlzLnRhcmdldC4kZWw7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMudGFyZ2V0O1xuICAgICAgfSxcbiAgICAgIG5vcm1hbGl6ZWRPcHRpb25zKCkge1xuICAgICAgICBpZiAodGhpcy50YXJnZXQpIHtcbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdGFyZ2V0OiB0aGlzLm5vcm1hbGl6ZWRUYXJnZXQsXG4gICAgICAgICAgICAuLi50aGlzLm9wdGlvbnNcbiAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLm9wdGlvbnM7XG4gICAgICB9XG4gICAgfVxuICB9O1xuPC9zY3JpcHQ+XG4iLCI8dGVtcGxhdGU+XG4gIDxvbnMtYWxlcnQtZGlhbG9nIHYtb249XCJ1bnJlY29nbml6ZWRMaXN0ZW5lcnNcIj5cbiAgICA8ZGl2IGNsYXNzPVwiYWxlcnQtZGlhbG9nLXRpdGxlXCI+XG4gICAgICA8c2xvdCBuYW1lPVwidGl0bGVcIj57e3RpdGxlfX08L3Nsb3Q+XG4gICAgPC9kaXY+XG4gICAgPGRpdiBjbGFzcz1cImFsZXJ0LWRpYWxvZy1jb250ZW50XCI+XG4gICAgICA8c2xvdD48L3Nsb3Q+XG4gICAgPC9kaXY+XG4gICAgPGRpdiBjbGFzcz1cImFsZXJ0LWRpYWxvZy1mb290ZXJcIj5cbiAgICAgIDxzbG90IG5hbWU9XCJmb290ZXJcIj5cbiAgICAgICAgPG9ucy1hbGVydC1kaWFsb2ctYnV0dG9uIHYtZm9yPVwiKGhhbmRsZXIsIGtleSkgaW4gZm9vdGVyXCIgOmtleT1cImtleVwiIEBjbGljaz1cImhhbmRsZXJcIj57e2tleX19PC9vbnMtYWxlcnQtZGlhbG9nLWJ1dHRvbj5cbiAgICAgIDwvc2xvdD5cbiAgICA8L2Rpdj5cbiAgPC9vbnMtYWxlcnQtZGlhbG9nPlxuPC90ZW1wbGF0ZT5cblxuPHNjcmlwdD5cbiAgaW1wb3J0ICdvbnNlbnVpL2VzbS9lbGVtZW50cy9vbnMtYWxlcnQtZGlhbG9nJztcbiAgaW1wb3J0IHsgaGlkYWJsZSwgaGFzT3B0aW9ucywgZGlhbG9nQ2FuY2VsLCBkZXJpdmVFdmVudHMsIGRlcml2ZURCQiwgcG9ydGFsIH0gZnJvbSAnLi4vbWl4aW5zJztcblxuICBleHBvcnQgZGVmYXVsdCB7XG4gICAgbmFtZTogJ3Ytb25zLWFsZXJ0LWRpYWxvZycsXG4gICAgbWl4aW5zOiBbaGlkYWJsZSwgaGFzT3B0aW9ucywgZGlhbG9nQ2FuY2VsLCBkZXJpdmVFdmVudHMsIGRlcml2ZURCQiwgcG9ydGFsXSxcblxuICAgIHByb3BzOiB7XG4gICAgICB0aXRsZToge1xuICAgICAgICB0eXBlOiBTdHJpbmdcbiAgICAgIH0sXG4gICAgICBmb290ZXI6IHtcbiAgICAgICAgdHlwZTogT2JqZWN0LFxuICAgICAgICB2YWxpZGF0b3IodmFsdWUpIHtcbiAgICAgICAgICByZXR1cm4gT2JqZWN0LmtleXModmFsdWUpLmV2ZXJ5KGtleSA9PiB2YWx1ZVtrZXldIGluc3RhbmNlb2YgRnVuY3Rpb24pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9O1xuPC9zY3JpcHQ+XG4iLCI8dGVtcGxhdGU+XG4gIDxvbnMtc3BlZWQtZGlhbCA6b24tY2xpY2sucHJvcD1cImFjdGlvblwiPlxuICAgIDxzbG90Pjwvc2xvdD5cbiAgPC9vbnMtc3BlZWQtZGlhbD5cbjwvdGVtcGxhdGU+XG5cbjxzY3JpcHQ+XG4gIGltcG9ydCAnb25zZW51aS9lc20vZWxlbWVudHMvb25zLXNwZWVkLWRpYWwnO1xuICBpbXBvcnQgeyBoaWRhYmxlLCBkZXJpdmVFdmVudHMgfSBmcm9tICcuLi9taXhpbnMnO1xuXG4gIGV4cG9ydCBkZWZhdWx0IHtcbiAgICBuYW1lOiAndi1vbnMtc3BlZWQtZGlhbCcsXG4gICAgbWl4aW5zOiBbZGVyaXZlRXZlbnRzLCBoaWRhYmxlXSxcblxuICAgIHByb3BzOiB7XG4gICAgICBvcGVuOiB7XG4gICAgICAgIHR5cGU6IEJvb2xlYW4sXG4gICAgICAgIGRlZmF1bHQ6IHVuZGVmaW5lZFxuICAgICAgfVxuICAgIH0sXG5cbiAgICBtZXRob2RzOiB7XG4gICAgICBhY3Rpb24oKSB7XG4gICAgICAgIGxldCBydW5EZWZhdWx0ID0gdHJ1ZTtcbiAgICAgICAgdGhpcy4kZW1pdCgnY2xpY2snLCB7IHByZXZlbnREZWZhdWx0OiAoKSA9PiBydW5EZWZhdWx0ID0gZmFsc2UgfSk7XG5cbiAgICAgICAgaWYgKHJ1bkRlZmF1bHQpIHtcbiAgICAgICAgICB0aGlzLiRlbC50b2dnbGVJdGVtcygpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgX3Nob3VsZFVwZGF0ZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMub3BlbiAhPT0gdW5kZWZpbmVkICYmIHRoaXMub3BlbiAhPT0gdGhpcy4kZWwuaXNPcGVuKCk7XG4gICAgICB9LFxuICAgICAgX3VwZGF0ZVRvZ2dsZSgpIHtcbiAgICAgICAgdGhpcy5fc2hvdWxkVXBkYXRlKCkgJiYgdGhpcy4kZWxbdGhpcy5vcGVuID8gJ3Nob3dJdGVtcycgOiAnaGlkZUl0ZW1zJ10uY2FsbCh0aGlzLiRlbCk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIHdhdGNoOiB7XG4gICAgICBvcGVuKCkge1xuICAgICAgICB0aGlzLl91cGRhdGVUb2dnbGUoKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgbW91bnRlZCgpIHtcbiAgICAgIHRoaXMuJG9uKFsnb3BlbicsICdjbG9zZSddLCAoKSA9PiB0aGlzLl9zaG91bGRVcGRhdGUoKSAmJiB0aGlzLiRlbWl0KCd1cGRhdGU6b3BlbicsIHRoaXMuJGVsLmlzT3BlbigpKSk7XG5cbiAgICAgIHRoaXMuX3VwZGF0ZVRvZ2dsZSgpO1xuICAgIH1cbiAgfTtcbjwvc2NyaXB0PlxuIiwiPHRlbXBsYXRlPlxuICA8b25zLWNhcm91c2VsXG4gICAgOm9uLXN3aXBlLnByb3A9XCJvblN3aXBlXCJcbiAgICA6aW5pdGlhbC1pbmRleD1cImluZGV4XCJcbiAgICBAcG9zdGNoYW5nZS5zZWxmPVwiJGVtaXQoJ3VwZGF0ZTppbmRleCcsICRldmVudC5hY3RpdmVJbmRleClcIlxuICAgIHYtb249XCJ1bnJlY29nbml6ZWRMaXN0ZW5lcnNcIlxuICA+XG4gICAgPGRpdj5cbiAgICAgIDxzbG90Pjwvc2xvdD5cbiAgICA8L2Rpdj5cbiAgICA8ZGl2PjwvZGl2PlxuICA8L29ucy1jYXJvdXNlbD5cbjwvdGVtcGxhdGU+XG5cbjxzY3JpcHQ+XG4gIGltcG9ydCAnb25zZW51aS9lc20vZWxlbWVudHMvb25zLWNhcm91c2VsJztcbiAgaW1wb3J0IHsgaGFzT3B0aW9ucywgZGVyaXZlRXZlbnRzIH0gZnJvbSAnLi4vbWl4aW5zJztcblxuICBleHBvcnQgZGVmYXVsdCB7XG4gICAgbmFtZTogJ3Ytb25zLWNhcm91c2VsJyxcbiAgICBtaXhpbnM6IFtoYXNPcHRpb25zLCBkZXJpdmVFdmVudHNdLFxuXG4gICAgcHJvcHM6IHtcbiAgICAgIGluZGV4OiB7XG4gICAgICAgIHR5cGU6IE51bWJlclxuICAgICAgfSxcbiAgICAgIG9uU3dpcGU6IHtcbiAgICAgICAgdHlwZTogRnVuY3Rpb25cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgd2F0Y2g6IHtcbiAgICAgIGluZGV4KCkge1xuICAgICAgICBpZiAodGhpcy5pbmRleCAhPT0gdGhpcy4kZWwuZ2V0QWN0aXZlSW5kZXgoKSkge1xuICAgICAgICAgIHRoaXMuJGVsLnNldEFjdGl2ZUluZGV4KHRoaXMuaW5kZXgsIHRoaXMub3B0aW9ucyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH07XG48L3NjcmlwdD5cbiIsIjx0ZW1wbGF0ZT5cbiAgPG9ucy10YWIgOmFjdGl2ZT1cImFjdGl2ZVwiIDpvbi1jbGljay5wcm9wPVwiYWN0aW9uXCI+XG4gIDwvb25zLXRhYj5cbjwvdGVtcGxhdGU+XG5cbjxzY3JpcHQ+XG4gIGltcG9ydCAnb25zZW51aS9lc20vZWxlbWVudHMvb25zLXRhYic7XG5cbiAgZXhwb3J0IGRlZmF1bHQge1xuICAgIG5hbWU6ICd2LW9ucy10YWInLFxuICAgIGluamVjdDogWyd0YWJiYXInXSxcblxuICAgIHByb3BzOiB7XG4gICAgICBwYWdlOiB7IH0sXG4gICAgICBwcm9wczogeyB9LFxuICAgICAgYWN0aXZlOiB7XG4gICAgICAgIHR5cGU6IEJvb2xlYW5cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgbWV0aG9kczoge1xuICAgICAgYWN0aW9uKCkge1xuICAgICAgICBsZXQgcnVuRGVmYXVsdCA9IHRydWU7XG4gICAgICAgIHRoaXMuJGVtaXQoJ2NsaWNrJywgeyBwcmV2ZW50RGVmYXVsdDogKCkgPT4gcnVuRGVmYXVsdCA9IGZhbHNlIH0pO1xuXG4gICAgICAgIGlmIChydW5EZWZhdWx0KSB7XG4gICAgICAgICAgdGhpcy50YWJiYXIuJGVsLnNldEFjdGl2ZVRhYih0aGlzLiRlbC5pbmRleCwgeyByZWplY3Q6IGZhbHNlLCAuLi50aGlzLnRhYmJhci5vcHRpb25zIH0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcblxuICAgIHdhdGNoOiB7XG4gICAgICBhY3RpdmUoKSB7XG4gICAgICAgIHRoaXMuJGVsLnNldEFjdGl2ZSh0aGlzLmFjdGl2ZSk7XG4gICAgICB9XG4gICAgfVxuICB9O1xuPC9zY3JpcHQ+XG4iLCI8dGVtcGxhdGU+XG4gIDxvbnMtdGFiYmFyXG4gICAgOm9uLXN3aXBlLnByb3A9XCJvblN3aXBlXCJcbiAgICA6YWN0aXZlSW5kZXg9XCJpbmRleFwiXG4gICAgQHByZWNoYW5nZS5zZWxmPVwiJG5leHRUaWNrKCgpID0+ICEkZXZlbnQuZGV0YWlsLmNhbmNlbGVkICYmICRlbWl0KCd1cGRhdGU6aW5kZXgnLCAkZXZlbnQuaW5kZXgpKVwiXG4gICAgdi1vbj1cInVucmVjb2duaXplZExpc3RlbmVyc1wiXG4gID5cbiAgICA8ZGl2IGNsYXNzPVwidGFiYmFyX19jb250ZW50XCI+XG4gICAgICA8ZGl2PlxuICAgICAgICA8c2xvdCBuYW1lPVwicGFnZXNcIj5cbiAgICAgICAgICA8Y29tcG9uZW50IHYtZm9yPVwidGFiIGluIHRhYnNcIiB2LWJpbmQ9XCJ0YWIucHJvcHNcIiA6aXM9XCJ0YWIucGFnZVwiIDprZXk9XCIodGFiLnBhZ2Uua2V5IHx8IHRhYi5wYWdlLm5hbWUgfHwgX3RhYktleSh0YWIpKVwiIHYtb249XCJ1bnJlY29nbml6ZWRMaXN0ZW5lcnNcIj48L2NvbXBvbmVudD5cbiAgICAgICAgPC9zbG90PlxuICAgICAgPC9kaXY+XG4gICAgICA8ZGl2PjwvZGl2PlxuICAgIDwvZGl2PlxuICAgIDxkaXYgY2xhc3M9XCJ0YWJiYXJcIiA6c3R5bGU9XCJ0YWJiYXJTdHlsZVwiPlxuICAgICAgPHNsb3Q+XG4gICAgICAgIDx2LW9ucy10YWIgdi1mb3I9XCJ0YWIgaW4gdGFic1wiIHYtYmluZD1cInRhYlwiIDprZXk9XCJfdGFiS2V5KHRhYilcIj48L3Ytb25zLXRhYj5cbiAgICAgIDwvc2xvdD5cbiAgICAgIDxkaXYgY2xhc3M9XCJ0YWJiYXJfX2JvcmRlclwiPjwvZGl2PlxuICAgIDwvZGl2PlxuICA8L29ucy10YWJiYXI+XG48L3RlbXBsYXRlPlxuXG48c2NyaXB0PlxuICBpbXBvcnQgJ29uc2VudWkvZXNtL2VsZW1lbnRzL29ucy10YWJiYXInO1xuICBpbXBvcnQgeyBkZXJpdmVFdmVudHMsIGhhc09wdGlvbnMsIGhpZGFibGUsIHNlbGZQcm92aWRlciB9IGZyb20gJy4uL21peGlucyc7XG5cbiAgZXhwb3J0IGRlZmF1bHQge1xuICAgIG5hbWU6ICd2LW9ucy10YWJiYXInLFxuICAgIG1peGluczogW2Rlcml2ZUV2ZW50cywgaGFzT3B0aW9ucywgaGlkYWJsZSwgc2VsZlByb3ZpZGVyXSxcblxuICAgIHByb3BzOiB7XG4gICAgICBpbmRleDoge1xuICAgICAgICB0eXBlOiBOdW1iZXJcbiAgICAgIH0sXG4gICAgICB0YWJzOiB7XG4gICAgICAgIHR5cGU6IEFycmF5LFxuICAgICAgICB2YWxpZGF0b3IodmFsdWUpIHtcbiAgICAgICAgICByZXR1cm4gdmFsdWUuZXZlcnkodGFiID0+IFsnaWNvbicsICdsYWJlbCcsICdwYWdlJ10uc29tZShwcm9wID0+ICEhT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih0YWIsIHByb3ApKSk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBvblN3aXBlOiB7XG4gICAgICAgIHR5cGU6IEZ1bmN0aW9uXG4gICAgICB9LFxuICAgICAgdGFiYmFyU3R5bGU6IHtcbiAgICAgICAgdHlwZTogbnVsbFxuICAgICAgfVxuICAgIH0sXG5cbiAgICBtZXRob2RzOiB7XG4gICAgICBfdGFiS2V5KHRhYikge1xuICAgICAgICByZXR1cm4gdGFiLmtleSB8fCB0YWIubGFiZWwgfHwgdGFiLmljb247XG4gICAgICB9XG4gICAgfSxcblxuICAgIHdhdGNoOiB7XG4gICAgICBpbmRleCgpIHtcbiAgICAgICAgaWYgKHRoaXMuaW5kZXggIT09IHRoaXMuJGVsLmdldEFjdGl2ZVRhYkluZGV4KCkpIHtcbiAgICAgICAgICB0aGlzLiRlbC5zZXRBY3RpdmVUYWIodGhpcy5pbmRleCwgeyByZWplY3Q6IGZhbHNlLCAuLi50aGlzLm9wdGlvbnMgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH07XG48L3NjcmlwdD5cbiIsIjx0ZW1wbGF0ZT5cbiAgPG9ucy1iYWNrLWJ1dHRvbiA6b24tY2xpY2sucHJvcD1cImFjdGlvblwiPlxuICAgIDxzbG90Pjwvc2xvdD5cbiAgPC9vbnMtYmFjay1idXR0b24+XG48L3RlbXBsYXRlPlxuXG48c2NyaXB0PlxuICBpbXBvcnQgJ29uc2VudWkvZXNtL2VsZW1lbnRzL29ucy1iYWNrLWJ1dHRvbic7XG5cbiAgZXhwb3J0IGRlZmF1bHQge1xuICAgIG5hbWU6ICd2LW9ucy1iYWNrLWJ1dHRvbicsXG4gICAgaW5qZWN0OiBbJ25hdmlnYXRvciddLFxuXG4gICAgbWV0aG9kczoge1xuICAgICAgYWN0aW9uKCkge1xuICAgICAgICBsZXQgcnVuRGVmYXVsdCA9IHRydWU7XG4gICAgICAgIHRoaXMuJGVtaXQoJ2NsaWNrJywgeyBwcmV2ZW50RGVmYXVsdDogKCkgPT4gcnVuRGVmYXVsdCA9IGZhbHNlIH0pO1xuXG4gICAgICAgIGlmIChydW5EZWZhdWx0ICYmIHRoaXMubmF2aWdhdG9yLnBhZ2VTdGFjay5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgdGhpcy5uYXZpZ2F0b3IucG9wUGFnZSgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9O1xuPC9zY3JpcHQ+XG4iLCI8dGVtcGxhdGU+XG4gIDxvbnMtbmF2aWdhdG9yIEBwb3N0cG9wLnNlbGY9XCJfY2hlY2tTd2lwZVwiIHYtb249XCJ1bnJlY29nbml6ZWRMaXN0ZW5lcnNcIj5cbiAgICA8c2xvdD5cbiAgICAgIDxjb21wb25lbnQgdi1mb3I9XCJwYWdlIGluIHBhZ2VTdGFja1wiIDppcz1cInBhZ2VcIiA6a2V5PVwicGFnZS5rZXkgfHwgcGFnZS5uYW1lXCIgdi1vbj1cInVucmVjb2duaXplZExpc3RlbmVyc1wiPjwvY29tcG9uZW50PlxuICAgIDwvc2xvdD5cbiAgPC9vbnMtbmF2aWdhdG9yPlxuPC90ZW1wbGF0ZT5cblxuPHNjcmlwdD5cbiAgaW1wb3J0ICdvbnNlbnVpL2VzbS9lbGVtZW50cy9vbnMtbmF2aWdhdG9yJztcbiAgaW1wb3J0IG9ucyBmcm9tICdvbnNlbnVpL2VzbSc7XG4gIGltcG9ydCB7IGhhc09wdGlvbnMsIHNlbGZQcm92aWRlciwgZGVyaXZlRXZlbnRzLCBkZXJpdmVEQkIgfSBmcm9tICcuLi9taXhpbnMnO1xuXG4gIGV4cG9ydCBkZWZhdWx0IHtcbiAgICBuYW1lOiAndi1vbnMtbmF2aWdhdG9yJyxcbiAgICBtaXhpbnM6IFtoYXNPcHRpb25zLCBzZWxmUHJvdmlkZXIsIGRlcml2ZUV2ZW50cywgZGVyaXZlREJCXSxcblxuICAgIHByb3BzOiB7XG4gICAgICBwYWdlU3RhY2s6IHtcbiAgICAgICAgdHlwZTogQXJyYXksXG4gICAgICAgIHJlcXVpcmVkOiB0cnVlXG4gICAgICB9LFxuICAgICAgcG9wUGFnZToge1xuICAgICAgICB0eXBlOiBGdW5jdGlvbixcbiAgICAgICAgZGVmYXVsdCgpIHtcbiAgICAgICAgICB0aGlzLnBhZ2VTdGFjay5wb3AoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG5cbiAgICBtZXRob2RzOiB7XG4gICAgICBpc1JlYWR5KCkge1xuICAgICAgICBpZiAodGhpcy5oYXNPd25Qcm9wZXJ0eSgnX3JlYWR5JykgJiYgdGhpcy5fcmVhZHkgaW5zdGFuY2VvZiBQcm9taXNlKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuX3JlYWR5O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICAgIH0sXG4gICAgICBvbkRldmljZUJhY2tCdXR0b24oZXZlbnQpIHtcbiAgICAgICAgaWYgKHRoaXMucGFnZVN0YWNrLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICB0aGlzLnBvcFBhZ2UoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBldmVudC5jYWxsUGFyZW50SGFuZGxlcigpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgX2ZpbmRTY3JvbGxQYWdlKHBhZ2UpIHtcbiAgICAgICAgY29uc3QgbmV4dFBhZ2UgPSBwYWdlLl9jb250ZW50RWxlbWVudC5jaGlsZHJlbi5sZW5ndGggPT09IDFcbiAgICAgICAgICAmJiBvbnMuX3V0aWwuZ2V0VG9wUGFnZShwYWdlLl9jb250ZW50RWxlbWVudC5jaGlsZHJlblswXSk7XG4gICAgICAgIHJldHVybiBuZXh0UGFnZSA/IHRoaXMuX2ZpbmRTY3JvbGxQYWdlKG5leHRQYWdlKSA6IHBhZ2U7XG4gICAgICB9LFxuICAgICAgX3NldFBhZ2VzVmlzaWJpbGl0eShzdGFydCwgZW5kLCB2aXNpYmlsaXR5KSB7XG4gICAgICAgIGZvciAobGV0IGkgPSBzdGFydDsgaSA8IGVuZDsgaSsrKSB7XG4gICAgICAgICAgdGhpcy4kY2hpbGRyZW5baV0uJGVsLnN0eWxlLnZpc2liaWxpdHkgPSB2aXNpYmlsaXR5O1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgX3JlYXR0YWNoUGFnZShwYWdlRWxlbWVudCwgcG9zaXRpb24gPSBudWxsLCByZXN0b3JlU2Nyb2xsKSB7XG4gICAgICAgIHRoaXMuJGVsLmluc2VydEJlZm9yZShwYWdlRWxlbWVudCwgcG9zaXRpb24pO1xuICAgICAgICByZXN0b3JlU2Nyb2xsIGluc3RhbmNlb2YgRnVuY3Rpb24gJiYgcmVzdG9yZVNjcm9sbCgpO1xuICAgICAgICBwYWdlRWxlbWVudC5faXNTaG93biA9IHRydWU7XG4gICAgICB9LFxuICAgICAgX3JlZGV0YWNoUGFnZShwYWdlRWxlbWVudCkge1xuICAgICAgICBwYWdlRWxlbWVudC5fZGVzdHJveSgpO1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgICB9LFxuICAgICAgX2FuaW1hdGUoeyBsYXN0TGVuZ3RoLCBjdXJyZW50TGVuZ3RoLCBsYXN0VG9wUGFnZSwgY3VycmVudFRvcFBhZ2UsIHJlc3RvcmVTY3JvbGwgfSkge1xuXG4gICAgICAgIC8vIFB1c2hcbiAgICAgICAgaWYgKGN1cnJlbnRMZW5ndGggPiBsYXN0TGVuZ3RoKSB7XG4gICAgICAgICAgbGV0IGlzUmVhdHRhY2hlZCA9IGZhbHNlO1xuICAgICAgICAgIGlmIChsYXN0VG9wUGFnZS5wYXJlbnRFbGVtZW50ICE9PSB0aGlzLiRlbCkge1xuICAgICAgICAgICAgdGhpcy5fcmVhdHRhY2hQYWdlKGxhc3RUb3BQYWdlLCB0aGlzLiRlbC5jaGlsZHJlbltsYXN0TGVuZ3RoIC0gMV0sIHJlc3RvcmVTY3JvbGwpO1xuICAgICAgICAgICAgaXNSZWF0dGFjaGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIGxhc3RMZW5ndGgtLTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5fc2V0UGFnZXNWaXNpYmlsaXR5KGxhc3RMZW5ndGgsIGN1cnJlbnRMZW5ndGgsICdoaWRkZW4nKTtcblxuICAgICAgICAgIHJldHVybiB0aGlzLiRlbC5fcHVzaFBhZ2UoeyAuLi50aGlzLm9wdGlvbnMsIGxlYXZlUGFnZTogbGFzdFRvcFBhZ2UgfSlcbiAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgdGhpcy5fc2V0UGFnZXNWaXNpYmlsaXR5KGxhc3RMZW5ndGgsIGN1cnJlbnRMZW5ndGgsICcnKTtcbiAgICAgICAgICAgICAgaWYgKGlzUmVhdHRhY2hlZCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX3JlZGV0YWNoUGFnZShsYXN0VG9wUGFnZSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gUG9wXG4gICAgICAgIGlmIChjdXJyZW50TGVuZ3RoIDwgbGFzdExlbmd0aCkge1xuICAgICAgICAgIHRoaXMuX3JlYXR0YWNoUGFnZShsYXN0VG9wUGFnZSwgbnVsbCwgcmVzdG9yZVNjcm9sbCk7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuJGVsLl9wb3BQYWdlKHsgLi4udGhpcy5vcHRpb25zIH0sICgpID0+IHRoaXMuX3JlZGV0YWNoUGFnZShsYXN0VG9wUGFnZSkpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gUmVwbGFjZSBwYWdlXG4gICAgICAgIGN1cnJlbnRUb3BQYWdlLnN0eWxlLnZpc2liaWxpdHkgPSAnaGlkZGVuJztcbiAgICAgICAgdGhpcy5fcmVhdHRhY2hQYWdlKGxhc3RUb3BQYWdlLCBjdXJyZW50VG9wUGFnZSwgcmVzdG9yZVNjcm9sbCk7XG4gICAgICAgIHJldHVybiB0aGlzLiRlbC5fcHVzaFBhZ2UoeyAuLi50aGlzLm9wdGlvbnMsIF9yZXBsYWNlUGFnZTogdHJ1ZSB9KS50aGVuKCgpID0+IHRoaXMuX3JlZGV0YWNoUGFnZShsYXN0VG9wUGFnZSkpO1xuICAgICAgfSxcbiAgICAgIF9jaGVja1N3aXBlKGV2ZW50KSB7XG4gICAgICAgIGlmICh0aGlzLiRlbC5oYXNBdHRyaWJ1dGUoJ3N3aXBlYWJsZScpICYmXG4gICAgICAgICAgZXZlbnQubGVhdmVQYWdlICE9PSB0aGlzLiRlbC5sYXN0Q2hpbGQgJiYgZXZlbnQubGVhdmVQYWdlID09PSB0aGlzLiRjaGlsZHJlblt0aGlzLiRjaGlsZHJlbi5sZW5ndGggLSAxXS4kZWxcbiAgICAgICAgKSB7XG4gICAgICAgICAgdGhpcy5wb3BQYWdlKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgd2F0Y2g6IHtcbiAgICAgIHBhZ2VTdGFjayhhZnRlciwgYmVmb3JlKSB7XG4gICAgICAgIGlmICh0aGlzLiRlbC5oYXNBdHRyaWJ1dGUoJ3N3aXBlYWJsZScpICYmIHRoaXMuJGNoaWxkcmVuLmxlbmd0aCAhPT0gdGhpcy4kZWwuY2hpbGRyZW4ubGVuZ3RoKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgcHJvcFdhc011dGF0ZWQgPSBhZnRlciA9PT0gYmVmb3JlOyAvLyBDYW4gYmUgbXV0YXRlZCBvciByZXBsYWNlZFxuICAgICAgICBjb25zdCBsYXN0VG9wUGFnZSA9IHRoaXMuJGNoaWxkcmVuW3RoaXMuJGNoaWxkcmVuLmxlbmd0aCAtIDFdLiRlbDtcbiAgICAgICAgY29uc3Qgc2Nyb2xsRWxlbWVudCA9IHRoaXMuX2ZpbmRTY3JvbGxQYWdlKGxhc3RUb3BQYWdlKTtcbiAgICAgICAgY29uc3Qgc2Nyb2xsVmFsdWUgPSBzY3JvbGxFbGVtZW50LnNjcm9sbFRvcCB8fCAwO1xuXG4gICAgICAgIHRoaXMuX3BhZ2VTdGFja1VwZGF0ZSA9IHtcbiAgICAgICAgICBsYXN0VG9wUGFnZSxcbiAgICAgICAgICBsYXN0TGVuZ3RoOiBwcm9wV2FzTXV0YXRlZCA/IHRoaXMuJGNoaWxkcmVuLmxlbmd0aCA6IGJlZm9yZS5sZW5ndGgsXG4gICAgICAgICAgY3VycmVudExlbmd0aDogIXByb3BXYXNNdXRhdGVkICYmIGFmdGVyLmxlbmd0aCxcbiAgICAgICAgICByZXN0b3JlU2Nyb2xsOiAoKSA9PiBzY3JvbGxFbGVtZW50LnNjcm9sbFRvcCA9IHNjcm9sbFZhbHVlXG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gdGhpcy4kbmV4dFRpY2soKCkgPT4geyB9KTsgLy8gV2FpdHMgdG9vIGxvbmcsIHVwZGF0ZWQoKSBob29rIGlzIGZhc3RlciBhbmQgcHJldmVudHMgZmxpY2tlcmluZ3NcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgdXBkYXRlZCgpIHtcbiAgICAgIGlmICh0aGlzLl9wYWdlU3RhY2tVcGRhdGUpIHtcbiAgICAgICAgbGV0IGN1cnJlbnRUb3BQYWdlID0gdGhpcy4kY2hpbGRyZW5bdGhpcy4kY2hpbGRyZW4ubGVuZ3RoIC0gMV0uJGVsO1xuICAgICAgICBsZXQgeyBsYXN0VG9wUGFnZSwgY3VycmVudExlbmd0aCB9ID0gdGhpcy5fcGFnZVN0YWNrVXBkYXRlO1xuICAgICAgICBjb25zdCB7IGxhc3RMZW5ndGgsIHJlc3RvcmVTY3JvbGwgfSA9IHRoaXMuX3BhZ2VTdGFja1VwZGF0ZTtcbiAgICAgICAgY3VycmVudExlbmd0aCA9IGN1cnJlbnRMZW5ndGggPT09IGZhbHNlID8gdGhpcy4kY2hpbGRyZW4ubGVuZ3RoIDogY3VycmVudExlbmd0aDtcblxuICAgICAgICBpZiAoY3VycmVudFRvcFBhZ2UgIT09IGxhc3RUb3BQYWdlKSB7XG4gICAgICAgICAgdGhpcy5fcmVhZHkgPSB0aGlzLl9hbmltYXRlKHsgbGFzdExlbmd0aCwgY3VycmVudExlbmd0aCwgbGFzdFRvcFBhZ2UsIGN1cnJlbnRUb3BQYWdlLCByZXN0b3JlU2Nyb2xsIH0pO1xuICAgICAgICB9IGVsc2UgaWYgKGN1cnJlbnRMZW5ndGggIT09IGxhc3RMZW5ndGgpIHtcbiAgICAgICAgICBjdXJyZW50VG9wUGFnZS51cGRhdGVCYWNrQnV0dG9uKGN1cnJlbnRMZW5ndGggPiAxKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxhc3RUb3BQYWdlID0gY3VycmVudFRvcFBhZ2UgPSB0aGlzLl9wYWdlU3RhY2tVcGRhdGUgPSBudWxsO1xuICAgICAgfVxuICAgIH1cbiAgfTtcbjwvc2NyaXB0PlxuIiwiPHRlbXBsYXRlPlxuICA8b25zLXNwbGl0dGVyLXNpZGUgdi1vbj1cInVucmVjb2duaXplZExpc3RlbmVyc1wiPlxuICAgIDxzbG90Pjwvc2xvdD5cbiAgPC9vbnMtc3BsaXR0ZXItc2lkZT5cbjwvdGVtcGxhdGU+XG5cbjxzY3JpcHQ+XG4gIGltcG9ydCAnb25zZW51aS9lc20vZWxlbWVudHMvb25zLXNwbGl0dGVyLXNpZGUnO1xuICBpbXBvcnQgeyBoYXNPcHRpb25zLCBkZXJpdmVFdmVudHMgfSBmcm9tICcuLi9taXhpbnMnO1xuXG4gIGV4cG9ydCBkZWZhdWx0IHtcbiAgICBuYW1lOiAndi1vbnMtc3BsaXR0ZXItc2lkZScsXG4gICAgbWl4aW5zOiBbaGFzT3B0aW9ucywgZGVyaXZlRXZlbnRzXSxcblxuICAgIHByb3BzOiB7XG4gICAgICBvcGVuOiB7XG4gICAgICAgIHR5cGU6IEJvb2xlYW4sXG4gICAgICAgIGRlZmF1bHQ6IHVuZGVmaW5lZFxuICAgICAgfVxuICAgIH0sXG5cbiAgICBtZXRob2RzOiB7XG4gICAgICBhY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuX3Nob3VsZFVwZGF0ZSgpICYmIHRoaXMuJGVsW3RoaXMub3BlbiA/ICdvcGVuJyA6ICdjbG9zZSddLmNhbGwodGhpcy4kZWwsIHRoaXMub3B0aW9ucykuY2F0Y2goKCkgPT4ge30pO1xuICAgICAgfSxcbiAgICAgIF9zaG91bGRVcGRhdGUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm9wZW4gIT09IHVuZGVmaW5lZCAmJiB0aGlzLm9wZW4gIT09IHRoaXMuJGVsLmlzT3BlbjtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgd2F0Y2g6IHtcbiAgICAgIG9wZW4oKSB7XG4gICAgICAgIHRoaXMuYWN0aW9uKCk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIG1vdW50ZWQoKSB7XG4gICAgICB0aGlzLiRvbihbJ3Bvc3RvcGVuJywgJ3Bvc3RjbG9zZScsICdtb2RlY2hhbmdlJ10sICgpID0+IHRoaXMuX3Nob3VsZFVwZGF0ZSgpICYmIHRoaXMuJGVtaXQoJ3VwZGF0ZTpvcGVuJywgdGhpcy4kZWwuaXNPcGVuKSk7XG5cbiAgICAgIHRoaXMuYWN0aW9uKCk7XG4gICAgfVxuICB9O1xuPC9zY3JpcHQ+XG4iLCI8dGVtcGxhdGU+XG4gIDwhLS0gVGhpcyBlbGVtZW50IGlzIHVzZWxlc3MgZXhjZXB0IGZvciB0aGUgZGVzdHJveSBwYXJ0IC0tPlxuICA8b25zLWxhenktcmVwZWF0Pjwvb25zLWxhenktcmVwZWF0PlxuPC90ZW1wbGF0ZT5cblxuPHNjcmlwdD5cbmltcG9ydCAnb25zZW51aS9lc20vZWxlbWVudHMvb25zLWxhenktcmVwZWF0JztcbmltcG9ydCBvbnMgZnJvbSAnb25zZW51aS9lc20nO1xuXG5leHBvcnQgZGVmYXVsdCB7XG4gIG5hbWU6ICd2LW9ucy1sYXp5LXJlcGVhdCcsXG5cbiAgcHJvcHM6IHtcbiAgICByZW5kZXJJdGVtOiB7XG4gICAgICB0eXBlOiBGdW5jdGlvbixcbiAgICAgIHJlcXVpcmVkOiB0cnVlLFxuICAgICAgdmFsaWRhdG9yKHZhbHVlKSB7XG4gICAgICAgIGNvbnN0IGNvbXBvbmVudCA9IHZhbHVlKDApO1xuICAgICAgICBpZiAoY29tcG9uZW50Ll9pc1Z1ZSAmJiAhY29tcG9uZW50Ll9pc01vdW50ZWQpIHtcbiAgICAgICAgICBjb21wb25lbnQuJGRlc3Ryb3koKTtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfSxcbiAgICBsZW5ndGg6IHtcbiAgICAgIHR5cGU6IE51bWJlcixcbiAgICAgIHJlcXVpcmVkOiB0cnVlXG4gICAgfSxcbiAgICBjYWxjdWxhdGVJdGVtSGVpZ2h0OiB7XG4gICAgICB0eXBlOiBGdW5jdGlvbixcbiAgICAgIGRlZmF1bHQ6IHVuZGVmaW5lZFxuICAgIH1cbiAgfSxcblxuICBkYXRhKCkge1xuICAgIHJldHVybiB7XG4gICAgICBwcm92aWRlcjogbnVsbFxuICAgIH07XG4gIH0sXG5cbiAgbWV0aG9kczoge1xuICAgIF9zZXR1cCgpIHtcbiAgICAgIHRoaXMucHJvdmlkZXIgJiYgdGhpcy5wcm92aWRlci5kZXN0cm95KCk7XG5cbiAgICAgIGNvbnN0IGRlbGVnYXRlID0gbmV3IG9ucy5faW50ZXJuYWwuTGF6eVJlcGVhdERlbGVnYXRlKHtcbiAgICAgICAgY2FsY3VsYXRlSXRlbUhlaWdodDogdGhpcy5jYWxjdWxhdGVJdGVtSGVpZ2h0LFxuICAgICAgICBjcmVhdGVJdGVtQ29udGVudDogaSA9PiB0aGlzLnJlbmRlckl0ZW0oaSkuJG1vdW50KCkuJGVsLFxuICAgICAgICBkZXN0cm95SXRlbTogKGksIHsgZWxlbWVudCB9KSA9PiBlbGVtZW50Ll9fdnVlX18uJGRlc3Ryb3koKSxcbiAgICAgICAgY291bnRJdGVtczogKCkgPT4gdGhpcy5sZW5ndGhcbiAgICAgIH0sIG51bGwpO1xuXG4gICAgICB0aGlzLnByb3ZpZGVyID0gbmV3IG9ucy5faW50ZXJuYWwuTGF6eVJlcGVhdFByb3ZpZGVyKHRoaXMuJHBhcmVudC4kZWwsIGRlbGVnYXRlKTtcbiAgICB9LFxuICAgIHJlZnJlc2goKSB7XG4gICAgICByZXR1cm4gdGhpcy5wcm92aWRlci5yZWZyZXNoKCk7XG4gICAgfVxuICB9LFxuXG4gIHdhdGNoOiB7XG4gICAgcmVuZGVySXRlbSgpIHtcbiAgICAgIHRoaXMuX3NldHVwKCk7XG4gICAgfSxcbiAgICBsZW5ndGgoKSB7XG4gICAgICB0aGlzLl9zZXR1cCgpO1xuICAgIH0sXG4gICAgY2FsY3VsYXRlSXRlbUhlaWdodCgpIHtcbiAgICAgIHRoaXMuX3NldHVwKCk7XG4gICAgfVxuICB9LFxuXG4gIG1vdW50ZWQoKSB7XG4gICAgdGhpcy5fc2V0dXAoKTtcbiAgICB0aGlzLiR2bm9kZS5jb250ZXh0LiRvbigncmVmcmVzaCcsIHRoaXMucmVmcmVzaCk7XG4gIH0sXG5cbiAgYmVmb3JlRGVzdHJveSgpIHtcbiAgICB0aGlzLiR2bm9kZS5jb250ZXh0LiRvZmYoJ3JlZnJlc2gnLCB0aGlzLnJlZnJlc2gpO1xuXG4gICAgLy8gVGhpcyB3aWxsIGRlc3Ryb3kgdGhlIHByb3ZpZGVyIG9uY2UgdGhlIHJlbmRlcmVkIGVsZW1lbnRcbiAgICAvLyBpcyBkZXRhY2hlZCAoZGV0YWNoZWRDYWxsYmFjaykuIFRoZXJlZm9yZSwgYW5pbWF0aW9uc1xuICAgIC8vIGhhdmUgdGltZSB0byBmaW5pc2ggYmVmb3JlIGVsZW1lbnRzIHN0YXJ0IHRvIGRpc2FwcGVhci5cbiAgICAvLyBJdCBjYW5ub3QgYmUgc2V0IGVhcmxpZXIgaW4gb3JkZXIgdG8gcHJldmVudCBhY2NpZGVudGFsXG4gICAgLy8gZGVzdHJveXMgaWYgdGhpcyBlbGVtZW50IGlzIHJldGFjaGVkIGJ5IHNvbWV0aGluZyBlbHNlLlxuICAgIHRoaXMuJGVsLl9sYXp5UmVwZWF0UHJvdmlkZXIgPSB0aGlzLnByb3ZpZGVyO1xuICAgIHRoaXMucHJvdmlkZXIgPSBudWxsO1xuICB9XG59O1xuPC9zY3JpcHQ+XG4iLCI8dGVtcGxhdGU+XG4gIDxvbnMtc2VsZWN0IHYtb249XCIkbGlzdGVuZXJzXCI+XG4gICAgPHNlbGVjdD5cbiAgICAgIDxzbG90Pjwvc2xvdD5cbiAgICA8L3NlbGVjdD5cbiAgPC9vbnMtc2VsZWN0PlxuPC90ZW1wbGF0ZT5cblxuPHNjcmlwdD5cbiAgaW1wb3J0ICdvbnNlbnVpL2VzbS9lbGVtZW50cy9vbnMtc2VsZWN0JztcbiAgaW1wb3J0IHsgbW9kZWxJbnB1dCB9IGZyb20gJy4uL21peGlucyc7XG5cbiAgZXhwb3J0IGRlZmF1bHQge1xuICAgIG5hbWU6ICd2LW9ucy1zZWxlY3QnLFxuICAgIG1peGluczogW21vZGVsSW5wdXRdXG4gIH07XG48L3NjcmlwdD5cbiIsIjx0ZW1wbGF0ZT5cbiAgPG9ucy1zZWdtZW50IDphY3RpdmUtaW5kZXg9XCJpbmRleFwiIEBwb3N0Y2hhbmdlLnNlbGY9XCIkZW1pdCgndXBkYXRlOmluZGV4JywgJGV2ZW50LmluZGV4KVwiPlxuICAgIDxzbG90Pjwvc2xvdD5cbiAgPC9vbnMtc2VnbWVudD5cbjwvdGVtcGxhdGU+XG5cbjxzY3JpcHQ+XG4gIGltcG9ydCAnb25zZW51aS9lc20vZWxlbWVudHMvb25zLXNlZ21lbnQnO1xuICBpbXBvcnQgeyBkZXJpdmVFdmVudHMgfSBmcm9tICcuLi9taXhpbnMnO1xuXG4gIGV4cG9ydCBkZWZhdWx0IHtcbiAgICBuYW1lOiAndi1vbnMtc2VnbWVudCcsXG4gICAgbWl4aW5zOiBbZGVyaXZlRXZlbnRzXSxcblxuICAgIHByb3BzOiB7XG4gICAgICBpbmRleDoge1xuICAgICAgICB0eXBlOiBOdW1iZXJcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgd2F0Y2g6IHtcbiAgICAgIGluZGV4KCkge1xuICAgICAgICBpZiAodGhpcy5pbmRleCAhPT0gdGhpcy4kZWwuZ2V0QWN0aXZlQnV0dG9uSW5kZXgoKSkge1xuICAgICAgICAgIHRoaXMuJGVsLnNldEFjdGl2ZUJ1dHRvbih0aGlzLmluZGV4LCB7IHJlamVjdDogZmFsc2UgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH07XG48L3NjcmlwdD5cbiIsIjx0ZW1wbGF0ZT5cbiAgPG9ucy1wdWxsLWhvb2tcbiAgICA6b24tYWN0aW9uLnByb3A9XCJhY3Rpb25cIlxuICAgIDpvbi1wdWxsLnByb3A9XCJvblB1bGxcIlxuICAgIHYtb249XCJ1bnJlY29nbml6ZWRMaXN0ZW5lcnNcIlxuICA+XG4gICAgPHNsb3Q+PC9zbG90PlxuICA8L29ucy1wdWxsLWhvb2s+XG48L3RlbXBsYXRlPlxuXG48c2NyaXB0PlxuICBpbXBvcnQgJ29uc2VudWkvZXNtL2VsZW1lbnRzL29ucy1wdWxsLWhvb2snO1xuICBpbXBvcnQgeyBkZXJpdmVFdmVudHMgfSBmcm9tICcuLi9taXhpbnMnO1xuXG4gIGV4cG9ydCBkZWZhdWx0IHtcbiAgICBuYW1lOiAndi1vbnMtcHVsbC1ob29rJyxcbiAgICBtaXhpbnM6IFtkZXJpdmVFdmVudHNdLFxuXG4gICAgcHJvcHM6IHtcbiAgICAgIGFjdGlvbjoge1xuICAgICAgICB0eXBlOiBGdW5jdGlvblxuICAgICAgfSxcbiAgICAgIG9uUHVsbDoge1xuICAgICAgICB0eXBlOiBGdW5jdGlvblxuICAgICAgfVxuICAgIH1cbiAgfTtcbjwvc2NyaXB0PlxuIiwiPHRlbXBsYXRlPlxuICA8b25zLXBhZ2UgOm9uLWluZmluaXRlLXNjcm9sbC5wcm9wPVwiaW5maW5pdGVTY3JvbGxcIiB2LW9uPVwidW5yZWNvZ25pemVkTGlzdGVuZXJzXCI+XG4gICAgPHNsb3Q+PC9zbG90PlxuICA8L29ucy1wYWdlPlxuPC90ZW1wbGF0ZT5cblxuPHNjcmlwdD5cbiAgaW1wb3J0ICdvbnNlbnVpL2VzbS9lbGVtZW50cy9vbnMtcGFnZSc7XG4gIGltcG9ydCB7IGRlcml2ZUV2ZW50cywgZGVyaXZlREJCIH0gZnJvbSAnLi4vbWl4aW5zJztcblxuICBleHBvcnQgZGVmYXVsdCB7XG4gICAgbmFtZTogJ3Ytb25zLXBhZ2UnLFxuICAgIG1peGluczogW2Rlcml2ZUV2ZW50cywgZGVyaXZlREJCXSxcblxuICAgIHByb3BzOiB7XG4gICAgICBpbmZpbml0ZVNjcm9sbDoge1xuICAgICAgICB0eXBlOiBGdW5jdGlvblxuICAgICAgfVxuICAgIH1cbiAgfTtcbjwvc2NyaXB0PlxuIiwiLy8gR2VuZXJpYyBjb21wb25lbnRzOlxuZXhwb3J0IHsgZGVmYXVsdCBhcyBWT25zVG9vbGJhciB9IGZyb20gJy4vVk9uc1Rvb2xiYXInO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBWT25zQm90dG9tVG9vbGJhciB9IGZyb20gJy4vVk9uc0JvdHRvbVRvb2xiYXInO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBWT25zVG9vbGJhckJ1dHRvbiB9IGZyb20gJy4vVk9uc1Rvb2xiYXJCdXR0b24nO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBWT25zQWxlcnREaWFsb2dCdXR0b24gfSBmcm9tICcuL1ZPbnNBbGVydERpYWxvZ0J1dHRvbic7XG5leHBvcnQgeyBkZWZhdWx0IGFzIFZPbnNCdXR0b24gfSBmcm9tICcuL1ZPbnNCdXR0b24nO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBWT25zSWNvbiB9IGZyb20gJy4vVk9uc0ljb24nO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBWT25zQ2FyZCB9IGZyb20gJy4vVk9uc0NhcmQnO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBWT25zTGlzdCB9IGZyb20gJy4vVk9uc0xpc3QnO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBWT25zTGlzdEl0ZW0gfSBmcm9tICcuL1ZPbnNMaXN0SXRlbSc7XG5leHBvcnQgeyBkZWZhdWx0IGFzIFZPbnNMaXN0VGl0bGUgfSBmcm9tICcuL1ZPbnNMaXN0VGl0bGUnO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBWT25zTGlzdEhlYWRlciB9IGZyb20gJy4vVk9uc0xpc3RIZWFkZXInO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBWT25zUmlwcGxlIH0gZnJvbSAnLi9WT25zUmlwcGxlJztcbmV4cG9ydCB7IGRlZmF1bHQgYXMgVk9uc1JvdyB9IGZyb20gJy4vVk9uc1Jvdyc7XG5leHBvcnQgeyBkZWZhdWx0IGFzIFZPbnNDb2wgfSBmcm9tICcuL1ZPbnNDb2wnO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBWT25zUHJvZ3Jlc3NCYXIgfSBmcm9tICcuL1ZPbnNQcm9ncmVzc0Jhcic7XG5leHBvcnQgeyBkZWZhdWx0IGFzIFZPbnNQcm9ncmVzc0NpcmN1bGFyIH0gZnJvbSAnLi9WT25zUHJvZ3Jlc3NDaXJjdWxhcic7XG5leHBvcnQgeyBkZWZhdWx0IGFzIFZPbnNDYXJvdXNlbEl0ZW0gfSBmcm9tICcuL1ZPbnNDYXJvdXNlbEl0ZW0nO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBWT25zU3BsaXR0ZXJNYXNrIH0gZnJvbSAnLi9WT25zU3BsaXR0ZXJNYXNrJztcbmV4cG9ydCB7IGRlZmF1bHQgYXMgVk9uc1NwbGl0dGVyQ29udGVudCB9IGZyb20gJy4vVk9uc1NwbGl0dGVyQ29udGVudCc7XG5leHBvcnQgeyBkZWZhdWx0IGFzIFZPbnNTcGxpdHRlciB9IGZyb20gJy4vVk9uc1NwbGl0dGVyJztcbmV4cG9ydCB7IGRlZmF1bHQgYXMgVk9uc1N3aXRjaCB9IGZyb20gJy4vVk9uc1N3aXRjaCc7XG5leHBvcnQgeyBkZWZhdWx0IGFzIFZPbnNDaGVja2JveCB9IGZyb20gJy4vVk9uc0NoZWNrYm94JztcbmV4cG9ydCB7IGRlZmF1bHQgYXMgVk9uc0lucHV0IH0gZnJvbSAnLi9WT25zSW5wdXQnO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBWT25zU2VhcmNoSW5wdXQgfSBmcm9tICcuL1ZPbnNTZWFyY2hJbnB1dCc7XG5leHBvcnQgeyBkZWZhdWx0IGFzIFZPbnNSYW5nZSB9IGZyb20gJy4vVk9uc1JhbmdlJztcbmV4cG9ydCB7IGRlZmF1bHQgYXMgVk9uc1JhZGlvIH0gZnJvbSAnLi9WT25zUmFkaW8nO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBWT25zRmFiIH0gZnJvbSAnLi9WT25zRmFiJztcbmV4cG9ydCB7IGRlZmF1bHQgYXMgVk9uc1NwZWVkRGlhbEl0ZW0gfSBmcm9tICcuL1ZPbnNTcGVlZERpYWxJdGVtJztcbmV4cG9ydCB7IGRlZmF1bHQgYXMgVk9uc0RpYWxvZyB9IGZyb20gJy4vVk9uc0RpYWxvZyc7XG5leHBvcnQgeyBkZWZhdWx0IGFzIFZPbnNBY3Rpb25TaGVldCB9IGZyb20gJy4vVk9uc0FjdGlvblNoZWV0JztcbmV4cG9ydCB7IGRlZmF1bHQgYXMgVk9uc0FjdGlvblNoZWV0QnV0dG9uIH0gZnJvbSAnLi9WT25zQWN0aW9uU2hlZXRCdXR0b24nO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBWT25zTW9kYWwgfSBmcm9tICcuL1ZPbnNNb2RhbCc7XG5leHBvcnQgeyBkZWZhdWx0IGFzIFZPbnNUb2FzdCB9IGZyb20gJy4vVk9uc1RvYXN0JztcblxuLy8gTWFudWFsIGNvbXBvbmVudHM6XG5leHBvcnQgeyBkZWZhdWx0IGFzIFZPbnNQb3BvdmVyIH0gZnJvbSAnLi9WT25zUG9wb3Zlcic7XG5leHBvcnQgeyBkZWZhdWx0IGFzIFZPbnNBbGVydERpYWxvZyB9IGZyb20gJy4vVk9uc0FsZXJ0RGlhbG9nJztcbmV4cG9ydCB7IGRlZmF1bHQgYXMgVk9uc1NwZWVkRGlhbCB9IGZyb20gJy4vVk9uc1NwZWVkRGlhbCc7XG5leHBvcnQgeyBkZWZhdWx0IGFzIFZPbnNDYXJvdXNlbCB9IGZyb20gJy4vVk9uc0Nhcm91c2VsJztcbmV4cG9ydCB7IGRlZmF1bHQgYXMgVk9uc1RhYiB9IGZyb20gJy4vVk9uc1RhYic7XG5leHBvcnQgeyBkZWZhdWx0IGFzIFZPbnNUYWJiYXIgfSBmcm9tICcuL1ZPbnNUYWJiYXInO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBWT25zQmFja0J1dHRvbiB9IGZyb20gJy4vVk9uc0JhY2tCdXR0b24nO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBWT25zTmF2aWdhdG9yIH0gZnJvbSAnLi9WT25zTmF2aWdhdG9yJztcbmV4cG9ydCB7IGRlZmF1bHQgYXMgVk9uc1NwbGl0dGVyU2lkZSB9IGZyb20gJy4vVk9uc1NwbGl0dGVyU2lkZSc7XG5leHBvcnQgeyBkZWZhdWx0IGFzIFZPbnNMYXp5UmVwZWF0IH0gZnJvbSAnLi9WT25zTGF6eVJlcGVhdCc7XG5leHBvcnQgeyBkZWZhdWx0IGFzIFZPbnNTZWxlY3QgfSBmcm9tICcuL1ZPbnNTZWxlY3QnO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBWT25zU2VnbWVudCB9IGZyb20gJy4vVk9uc1NlZ21lbnQnO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBWT25zUHVsbEhvb2sgfSBmcm9tICcuL1ZPbnNQdWxsSG9vayc7XG5leHBvcnQgeyBkZWZhdWx0IGFzIFZPbnNQYWdlIH0gZnJvbSAnLi9WT25zUGFnZSc7XG4iLCJpbXBvcnQgeyAkb25zIH0gZnJvbSAnLi9zZXR1cCc7XG5pbXBvcnQgKiBhcyBjb21wb25lbnRzIGZyb20gJy4vY29tcG9uZW50cyc7XG5cbiRvbnMuaW5zdGFsbCA9IChWdWUsIHBhcmFtcyA9IHt9KSA9PiB7XG4gIC8qKlxuICAgKiBSZWdpc3RlciBjb21wb25lbnRzIG9mIHZ1ZS1vbnNlbnVpLlxuICAgKi9cbiAgT2JqZWN0LmtleXMoY29tcG9uZW50cylcbiAgICAuZm9yRWFjaChrZXkgPT4gVnVlLmNvbXBvbmVudChjb21wb25lbnRzW2tleV0ubmFtZSwgY29tcG9uZW50c1trZXldKSk7XG5cbiAgLyoqXG4gICAqIEV4cG9zZSBvbnMgb2JqZWN0LlxuICAgKi9cbiAgVnVlLnByb3RvdHlwZS4kb25zID0gJG9ucztcbn07XG5cbmlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJiB3aW5kb3cuVnVlKSB7XG4gIHdpbmRvdy5WdWUudXNlKHsgaW5zdGFsbDogJG9ucy5pbnN0YWxsIH0pO1xufVxuXG5leHBvcnQgZGVmYXVsdCAkb25zO1xuIl0sIm5hbWVzIjpbIiRvbnMiLCJPYmplY3QiLCJrZXlzIiwib25zIiwiZmlsdGVyIiwic29tZSIsImsiLCJtYXRjaCIsInQiLCJyZWR1Y2UiLCJyIiwiX29ucyIsImNhcGl0YWxpemUiLCJzdHJpbmciLCJjaGFyQXQiLCJ0b1VwcGVyQ2FzZSIsInNsaWNlIiwiY2FtZWxpemUiLCJ0b0xvd2VyQ2FzZSIsInJlcGxhY2UiLCJtIiwibCIsImV2ZW50VG9IYW5kbGVyIiwibmFtZSIsImhhbmRsZXJUb1Byb3AiLCJfc2V0dXBEQkIiLCJkYmIiLCJoYW5kbGVyIiwiY29tcG9uZW50IiwiJGVsIiwiX2NhbGxiYWNrIiwiZSIsImNhbGxQYXJlbnRIYW5kbGVyIiwicnVuRGVmYXVsdCIsIiRlbWl0IiwiZXZlbnQiLCJfaXNEQkJTZXR1cCIsImRlcml2ZURCQiIsIm9uRGV2aWNlQmFja0J1dHRvbiIsImRlc3Ryb3kiLCJkZXJpdmVFdmVudHMiLCIkb3B0aW9ucyIsIl9jb21wb25lbnRUYWciLCIkbGlzdGVuZXJzIiwiZWxlbWVudHMiLCJldmVudHMiLCJpbmRleE9mIiwiX2hhbmRsZXJzIiwiY29uc3RydWN0b3IiLCJmb3JFYWNoIiwia2V5IiwidGFyZ2V0IiwidGVzdCIsInRhZ05hbWUiLCJhZGRFdmVudExpc3RlbmVyIiwicmVtb3ZlRXZlbnRMaXN0ZW5lciIsIl90b2dnbGVWaXNpYmlsaXR5IiwidmlzaWJsZSIsImNhbGwiLCJub3JtYWxpemVkT3B0aW9ucyIsIm9wdGlvbnMiLCJfdGVsZXBvcnQiLCJfaXNEZXN0cm95ZWQiLCJwYXJlbnROb2RlIiwiZG9jdW1lbnQiLCJib2R5IiwiYXBwZW5kQ2hpbGQiLCJfdW5tb3VudCIsImhpZGUiLCJ0aGVuIiwicmVtb3ZlIiwiaGlkYWJsZSIsIkJvb2xlYW4iLCJ1bmRlZmluZWQiLCIkbmV4dFRpY2siLCJoYXNPcHRpb25zIiwic2VsZlByb3ZpZGVyIiwiZGlhbG9nQ2FuY2VsIiwiJG9uIiwicG9ydGFsIiwibW9kZWwiLCJtb2RlbElucHV0IiwicHJvcCIsIk51bWJlciIsIlN0cmluZyIsInZhbHVlIiwiX3VwZGF0ZVZhbHVlIiwiX29uTW9kZWxFdmVudCIsIm1vZGVsQ2hlY2tib3giLCJBcnJheSIsImNoZWNrZWQiLCJuZXdWYWx1ZSIsImluZGV4IiwiaW5jbHVkZWQiLCJsZW5ndGgiLCJtb2RlbFJhZGlvIiwicmVuZGVyIiwiX2lzVnVlIiwiRXZlbnQiLCJIVE1MRWxlbWVudCIsIm5vcm1hbGl6ZWRUYXJnZXQiLCJldmVyeSIsIkZ1bmN0aW9uIiwicHJldmVudERlZmF1bHQiLCJ0b2dnbGVJdGVtcyIsIm9wZW4iLCJpc09wZW4iLCJfc2hvdWxkVXBkYXRlIiwiX3VwZGF0ZVRvZ2dsZSIsImdldEFjdGl2ZUluZGV4Iiwic2V0QWN0aXZlSW5kZXgiLCJ0YWJiYXIiLCJzZXRBY3RpdmVUYWIiLCJyZWplY3QiLCJzZXRBY3RpdmUiLCJhY3RpdmUiLCJnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IiLCJ0YWIiLCJsYWJlbCIsImljb24iLCJnZXRBY3RpdmVUYWJJbmRleCIsIm5hdmlnYXRvciIsInBhZ2VTdGFjayIsInBvcFBhZ2UiLCJwb3AiLCJoYXNPd25Qcm9wZXJ0eSIsIl9yZWFkeSIsIlByb21pc2UiLCJyZXNvbHZlIiwicGFnZSIsIm5leHRQYWdlIiwiX2NvbnRlbnRFbGVtZW50IiwiY2hpbGRyZW4iLCJfdXRpbCIsImdldFRvcFBhZ2UiLCJfZmluZFNjcm9sbFBhZ2UiLCJzdGFydCIsImVuZCIsInZpc2liaWxpdHkiLCJpIiwiJGNoaWxkcmVuIiwic3R5bGUiLCJwYWdlRWxlbWVudCIsInBvc2l0aW9uIiwicmVzdG9yZVNjcm9sbCIsImluc2VydEJlZm9yZSIsIl9pc1Nob3duIiwiX2Rlc3Ryb3kiLCJsYXN0TGVuZ3RoIiwiY3VycmVudExlbmd0aCIsImxhc3RUb3BQYWdlIiwiY3VycmVudFRvcFBhZ2UiLCJpc1JlYXR0YWNoZWQiLCJwYXJlbnRFbGVtZW50IiwiX3JlYXR0YWNoUGFnZSIsIl9zZXRQYWdlc1Zpc2liaWxpdHkiLCJfcHVzaFBhZ2UiLCJsZWF2ZVBhZ2UiLCJfcmVkZXRhY2hQYWdlIiwiX3BvcFBhZ2UiLCJfcmVwbGFjZVBhZ2UiLCJoYXNBdHRyaWJ1dGUiLCJsYXN0Q2hpbGQiLCJhZnRlciIsImJlZm9yZSIsInByb3BXYXNNdXRhdGVkIiwic2Nyb2xsRWxlbWVudCIsInNjcm9sbFZhbHVlIiwic2Nyb2xsVG9wIiwiX3BhZ2VTdGFja1VwZGF0ZSIsIl9hbmltYXRlIiwidXBkYXRlQmFja0J1dHRvbiIsImNhdGNoIiwiYWN0aW9uIiwiX2lzTW91bnRlZCIsIiRkZXN0cm95IiwicHJvdmlkZXIiLCJkZWxlZ2F0ZSIsIl9pbnRlcm5hbCIsIkxhenlSZXBlYXREZWxlZ2F0ZSIsImNhbGN1bGF0ZUl0ZW1IZWlnaHQiLCJyZW5kZXJJdGVtIiwiJG1vdW50IiwiZWxlbWVudCIsIl9fdnVlX18iLCJMYXp5UmVwZWF0UHJvdmlkZXIiLCIkcGFyZW50IiwicmVmcmVzaCIsIl9zZXR1cCIsIiR2bm9kZSIsImNvbnRleHQiLCIkb2ZmIiwiX2xhenlSZXBlYXRQcm92aWRlciIsImdldEFjdGl2ZUJ1dHRvbkluZGV4Iiwic2V0QWN0aXZlQnV0dG9uIiwiaW5zdGFsbCIsIlZ1ZSIsImNvbXBvbmVudHMiLCJwcm90b3R5cGUiLCJ3aW5kb3ciLCJ1c2UiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFFQSxJQUFNQSxTQUFPQyxPQUFPQyxJQUFQLENBQVlDLEdBQVosRUFDVkMsTUFEVSxDQUNIO1NBQUssQ0FDWCxLQURXLEVBRVgsVUFGVyxFQUdYLFNBSFcsRUFJWCxPQUpXLEVBS1gsT0FMVyxFQU1YLE1BTlcsRUFPWCxRQVBXLEVBUVgsVUFSVyxFQVNYLFdBVFcsRUFVWCxpQkFWVyxFQVdYLGNBWFcsRUFZWCxhQVpXLEVBYVgsVUFiVyxFQWNYLE9BZFcsRUFlWEMsSUFmVyxDQWVOO1dBQUtDLEVBQUVDLEtBQUYsQ0FBUUMsQ0FBUixDQUFMO0dBZk0sQ0FBTDtDQURHLEVBaUJWQyxNQWpCVSxDQWlCSCxVQUFDQyxDQUFELEVBQUlKLENBQUosRUFBVTtJQUNkQSxDQUFGLElBQU9ILElBQUlHLENBQUosQ0FBUDtTQUNPSSxDQUFQO0NBbkJTLEVBb0JSLEVBQUVDLE1BQU1SLEdBQVIsRUFwQlEsQ0FBYjs7QUNBTyxJQUFNUyxhQUFhLFNBQWJBLFVBQWE7U0FBVUMsT0FBT0MsTUFBUCxDQUFjLENBQWQsRUFBaUJDLFdBQWpCLEtBQWlDRixPQUFPRyxLQUFQLENBQWEsQ0FBYixDQUEzQztDQUFuQjs7QUFFUCxBQUFPLElBQU1DLFdBQVcsU0FBWEEsUUFBVztTQUFVSixPQUFPSyxXQUFQLEdBQXFCQyxPQUFyQixDQUE2QixXQUE3QixFQUEwQyxVQUFDQyxDQUFELEVBQUlDLENBQUo7V0FBVUEsRUFBRU4sV0FBRixFQUFW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
