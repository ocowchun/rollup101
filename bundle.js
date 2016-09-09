'use strict';

var require$$1 = require('fs');
var require$$4 = require('tty');
var require$$0 = require('util');
var require$$0$1 = require('net');
var require$$3 = require('url');
var require$$2 = require('http');
var require$$1$1 = require('https');
var require$$0$2 = require('crypto');
var require$$3$1 = require('os');

var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {}

function interopDefault(ex) {
	return ex && typeof ex === 'object' && 'default' in ex ? ex['default'] : ex;
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var index = createCommonjsModule(function (module) {
/**
 * Helpers.
 */

var s = 1000;
var m = s * 60;
var h = m * 60;
var d = h * 24;
var y = d * 365.25;

/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} options
 * @return {String|Number}
 * @api public
 */

module.exports = function(val, options){
  options = options || {};
  if ('string' == typeof val) return parse(val);
  return options.long
    ? long(val)
    : short(val);
};

/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function parse(str) {
  str = '' + str;
  if (str.length > 10000) return;
  var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(str);
  if (!match) return;
  var n = parseFloat(match[1]);
  var type = (match[2] || 'ms').toLowerCase();
  switch (type) {
    case 'years':
    case 'year':
    case 'yrs':
    case 'yr':
    case 'y':
      return n * y;
    case 'days':
    case 'day':
    case 'd':
      return n * d;
    case 'hours':
    case 'hour':
    case 'hrs':
    case 'hr':
    case 'h':
      return n * h;
    case 'minutes':
    case 'minute':
    case 'mins':
    case 'min':
    case 'm':
      return n * m;
    case 'seconds':
    case 'second':
    case 'secs':
    case 'sec':
    case 's':
      return n * s;
    case 'milliseconds':
    case 'millisecond':
    case 'msecs':
    case 'msec':
    case 'ms':
      return n;
  }
}

/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function short(ms) {
  if (ms >= d) return Math.round(ms / d) + 'd';
  if (ms >= h) return Math.round(ms / h) + 'h';
  if (ms >= m) return Math.round(ms / m) + 'm';
  if (ms >= s) return Math.round(ms / s) + 's';
  return ms + 'ms';
}

/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function long(ms) {
  return plural(ms, d, 'day')
    || plural(ms, h, 'hour')
    || plural(ms, m, 'minute')
    || plural(ms, s, 'second')
    || ms + ' ms';
}

/**
 * Pluralization helper.
 */

function plural(ms, n, name) {
  if (ms < n) return;
  if (ms < n * 1.5) return Math.floor(ms / n) + ' ' + name;
  return Math.ceil(ms / n) + ' ' + name + 's';
}
});

var index$1 = interopDefault(index);


var require$$0$4 = Object.freeze({
  default: index$1
});

var debug = createCommonjsModule(function (module, exports) {
/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = debug;
exports.coerce = coerce;
exports.disable = disable;
exports.enable = enable;
exports.enabled = enabled;
exports.humanize = interopDefault(require$$0$4);

/**
 * The currently active debug mode names, and names to skip.
 */

exports.names = [];
exports.skips = [];

/**
 * Map of special "%n" handling functions, for the debug "format" argument.
 *
 * Valid key names are a single, lowercased letter, i.e. "n".
 */

exports.formatters = {};

/**
 * Previously assigned color.
 */

var prevColor = 0;

/**
 * Previous log timestamp.
 */

var prevTime;

/**
 * Select a color.
 *
 * @return {Number}
 * @api private
 */

function selectColor() {
  return exports.colors[prevColor++ % exports.colors.length];
}

/**
 * Create a debugger with the given `namespace`.
 *
 * @param {String} namespace
 * @return {Function}
 * @api public
 */

function debug(namespace) {

  // define the `disabled` version
  function disabled() {
  }
  disabled.enabled = false;

  // define the `enabled` version
  function enabled() {

    var self = enabled;

    // set `diff` timestamp
    var curr = +new Date();
    var ms = curr - (prevTime || curr);
    self.diff = ms;
    self.prev = prevTime;
    self.curr = curr;
    prevTime = curr;

    // add the `color` if not set
    if (null == self.useColors) self.useColors = exports.useColors();
    if (null == self.color && self.useColors) self.color = selectColor();

    var args = Array.prototype.slice.call(arguments);

    args[0] = exports.coerce(args[0]);

    if ('string' !== typeof args[0]) {
      // anything else let's inspect with %o
      args = ['%o'].concat(args);
    }

    // apply any `formatters` transformations
    var index = 0;
    args[0] = args[0].replace(/%([a-z%])/g, function(match, format) {
      // if we encounter an escaped % then don't increase the array index
      if (match === '%%') return match;
      index++;
      var formatter = exports.formatters[format];
      if ('function' === typeof formatter) {
        var val = args[index];
        match = formatter.call(self, val);

        // now we need to remove `args[index]` since it's inlined in the `format`
        args.splice(index, 1);
        index--;
      }
      return match;
    });

    if ('function' === typeof exports.formatArgs) {
      args = exports.formatArgs.apply(self, args);
    }
    var logFn = enabled.log || exports.log || console.log.bind(console);
    logFn.apply(self, args);
  }
  enabled.enabled = true;

  var fn = exports.enabled(namespace) ? enabled : disabled;

  fn.namespace = namespace;

  return fn;
}

/**
 * Enables a debug mode by namespaces. This can include modes
 * separated by a colon and wildcards.
 *
 * @param {String} namespaces
 * @api public
 */

function enable(namespaces) {
  exports.save(namespaces);

  var split = (namespaces || '').split(/[\s,]+/);
  var len = split.length;

  for (var i = 0; i < len; i++) {
    if (!split[i]) continue; // ignore empty strings
    namespaces = split[i].replace(/\*/g, '.*?');
    if (namespaces[0] === '-') {
      exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
    } else {
      exports.names.push(new RegExp('^' + namespaces + '$'));
    }
  }
}

/**
 * Disable debug output.
 *
 * @api public
 */

function disable() {
  exports.enable('');
}

/**
 * Returns true if the given mode name is enabled, false otherwise.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

function enabled(name) {
  var i, len;
  for (i = 0, len = exports.skips.length; i < len; i++) {
    if (exports.skips[i].test(name)) {
      return false;
    }
  }
  for (i = 0, len = exports.names.length; i < len; i++) {
    if (exports.names[i].test(name)) {
      return true;
    }
  }
  return false;
}

/**
 * Coerce `val`.
 *
 * @param {Mixed} val
 * @return {Mixed}
 * @api private
 */

function coerce(val) {
  if (val instanceof Error) return val.stack || val.message;
  return val;
}
});

var debug$1 = interopDefault(debug);
var formatters = debug.formatters;
var skips = debug.skips;
var names = debug.names;
var humanize = debug.humanize;
var enabled = debug.enabled;
var enable = debug.enable;
var disable = debug.disable;
var coerce = debug.coerce;

var require$$2$1 = Object.freeze({
  default: debug$1,
  formatters: formatters,
  skips: skips,
  names: names,
  humanize: humanize,
  enabled: enabled,
  enable: enable,
  disable: disable,
  coerce: coerce
});

var node = createCommonjsModule(function (module, exports) {
/**
 * Module dependencies.
 */

var tty = interopDefault(require$$4);
var util = interopDefault(require$$0);

/**
 * This is the Node.js implementation of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = interopDefault(require$$2$1);
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;

/**
 * Colors.
 */

exports.colors = [6, 2, 3, 4, 5, 1];

/**
 * The file descriptor to write the `debug()` calls to.
 * Set the `DEBUG_FD` env variable to override with another value. i.e.:
 *
 *   $ DEBUG_FD=3 node script.js 3>debug.log
 */

var fd = parseInt(process.env.DEBUG_FD, 10) || 2;
var stream = 1 === fd ? process.stdout :
             2 === fd ? process.stderr :
             createWritableStdioStream(fd);

/**
 * Is stdout a TTY? Colored output is enabled when `true`.
 */

function useColors() {
  var debugColors = (process.env.DEBUG_COLORS || '').trim().toLowerCase();
  if (0 === debugColors.length) {
    return tty.isatty(fd);
  } else {
    return '0' !== debugColors
        && 'no' !== debugColors
        && 'false' !== debugColors
        && 'disabled' !== debugColors;
  }
}

/**
 * Map %o to `util.inspect()`, since Node doesn't do that out of the box.
 */

var inspect = (4 === util.inspect.length ?
  // node <= 0.8.x
  function (v, colors) {
    return util.inspect(v, void 0, void 0, colors);
  } :
  // node > 0.8.x
  function (v, colors) {
    return util.inspect(v, { colors: colors });
  }
);

exports.formatters.o = function(v) {
  return inspect(v, this.useColors)
    .replace(/\s*\n\s*/g, ' ');
};

/**
 * Adds ANSI color escape codes if enabled.
 *
 * @api public
 */

function formatArgs() {
  var args = arguments;
  var useColors = this.useColors;
  var name = this.namespace;

  if (useColors) {
    var c = this.color;

    args[0] = '  \u001b[3' + c + ';1m' + name + ' '
      + '\u001b[0m'
      + args[0] + '\u001b[3' + c + 'm'
      + ' +' + exports.humanize(this.diff) + '\u001b[0m';
  } else {
    args[0] = new Date().toUTCString()
      + ' ' + name + ' ' + args[0];
  }
  return args;
}

/**
 * Invokes `console.error()` with the specified arguments.
 */

function log() {
  return stream.write(util.format.apply(this, arguments) + '\n');
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */

function save(namespaces) {
  if (null == namespaces) {
    // If you set a process.env field to null or undefined, it gets cast to the
    // string 'null' or 'undefined'. Just delete instead.
    delete process.env.DEBUG;
  } else {
    process.env.DEBUG = namespaces;
  }
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */

function load() {
  return process.env.DEBUG;
}

/**
 * Copied from `node/src/node.js`.
 *
 * XXX: It's lame that node doesn't expose this API out-of-the-box. It also
 * relies on the undocumented `tty_wrap.guessHandleType()` which is also lame.
 */

function createWritableStdioStream (fd) {
  var stream;
  var tty_wrap = process.binding('tty_wrap');

  // Note stream._type is used for test-module-load-list.js

  switch (tty_wrap.guessHandleType(fd)) {
    case 'TTY':
      stream = new tty.WriteStream(fd);
      stream._type = 'tty';

      // Hack to have stream not keep the event loop alive.
      // See https://github.com/joyent/node/issues/1726
      if (stream._handle && stream._handle.unref) {
        stream._handle.unref();
      }
      break;

    case 'FILE':
      var fs = interopDefault(require$$1);
      stream = new fs.SyncWriteStream(fd, { autoClose: false });
      stream._type = 'fs';
      break;

    case 'PIPE':
    case 'TCP':
      var net = interopDefault(require$$0$1);
      stream = new net.Socket({
        fd: fd,
        readable: false,
        writable: true
      });

      // FIXME Should probably have an option in net.Socket to create a
      // stream from an existing fd which is writable only. But for now
      // we'll just add this hack and set the `readable` member to false.
      // Test: ./node test/fixtures/echo.js < /etc/passwd
      stream.readable = false;
      stream.read = null;
      stream._type = 'pipe';

      // FIXME Hack to have stream not keep the event loop alive.
      // See https://github.com/joyent/node/issues/1726
      if (stream._handle && stream._handle.unref) {
        stream._handle.unref();
      }
      break;

    default:
      // Probably an error on in uv_guess_handle()
      throw new Error('Implement me. Unknown stream file type!');
  }

  // For supporting legacy API we put the FD here.
  stream.fd = fd;

  stream._isStdio = true;

  return stream;
}

/**
 * Enable namespaces listed in `process.env.DEBUG` initially.
 */

exports.enable(load());
});

var node$1 = interopDefault(node);
var colors = node.colors;
var useColors = node.useColors;
var load = node.load;
var save = node.save;
var formatArgs = node.formatArgs;
var log = node.log;

var require$$0$3 = Object.freeze({
  default: node$1,
  colors: colors,
  useColors: useColors,
  load: load,
  save: save,
  formatArgs: formatArgs,
  log: log
});

var logger = createCommonjsModule(function (module) {
/*jslint devel: true, nomen: true, plusplus: true, regexp: true, indent: 2, maxlen: 100 */

"use strict";

var debug = interopDefault(require$$0$3);
var name = 'Rollbar';

var logger = {
  log: debug(name + ':log'),
  error: debug(name + ':error')
};

// Make logger.log log to stdout rather than stderr
logger.log.log = console.log.bind(console);

module.exports = logger;
});

var logger$1 = interopDefault(logger);


var require$$4$1 = Object.freeze({
  default: logger$1
});

var async = createCommonjsModule(function (module) {
/*!
 * async
 * https://github.com/caolan/async
 *
 * Copyright 2010-2014 Caolan McMahon
 * Released under the MIT license
 */
(function () {

    var async = {};
    function noop() {}

    // global on the server, window in the browser
    var root, previous_async;

    if (typeof window == 'object' && this === window) {
        root = window;
    }
    else if (typeof commonjsGlobal == 'object' && this === commonjsGlobal) {
        root = commonjsGlobal;
    }
    else {
        root = this;
    }

    if (root != null) {
      previous_async = root.async;
    }

    async.noConflict = function () {
        root.async = previous_async;
        return async;
    };

    function only_once(fn) {
        var called = false;
        return function() {
            if (called) throw new Error("Callback was already called.");
            called = true;
            fn.apply(this, arguments);
        };
    }

    function _once(fn) {
        var called = false;
        return function() {
            if (called) return;
            called = true;
            fn.apply(this, arguments);
        };
    }

    //// cross-browser compatiblity functions ////

    var _toString = Object.prototype.toString;

    var _isArray = Array.isArray || function (obj) {
        return _toString.call(obj) === '[object Array]';
    };

    function _isArrayLike(arr) {
        return _isArray(arr) || (
            // has a positive integer length property
            typeof arr.length === "number" &&
            arr.length >= 0 &&
            arr.length % 1 === 0
        );
    }

    function _each(coll, iterator) {
        return _isArrayLike(coll) ?
            _arrayEach(coll, iterator) :
            _forEachOf(coll, iterator);
    }

    function _arrayEach(arr, iterator) {
      var index = -1,
          length = arr.length;

      while (++index < length) {
        iterator(arr[index], index, arr);
      }
    }

    function _map(arr, iterator) {
      var index = -1,
          length = arr.length,
          result = Array(length);

      while (++index < length) {
        result[index] = iterator(arr[index], index, arr);
      }
      return result;
    }

    function _range(count) {
        return _map(Array(count), function (v, i) { return i; });
    }

    function _reduce(arr, iterator, memo) {
        _arrayEach(arr, function (x, i, a) {
            memo = iterator(memo, x, i, a);
        });
        return memo;
    }

    function _forEachOf(object, iterator) {
        _arrayEach(_keys(object), function (key) {
            iterator(object[key], key);
        });
    }

    var _keys = Object.keys || function (obj) {
        var keys = [];
        for (var k in obj) {
            if (obj.hasOwnProperty(k)) {
                keys.push(k);
            }
        }
        return keys;
    };

    function _keyIterator(coll) {
        var i = -1;
        var len;
        var keys;
        if (_isArrayLike(coll)) {
            len = coll.length;
            return function next() {
                i++;
                return i < len ? i : null;
            };
        } else {
            keys = _keys(coll);
            len = keys.length;
            return function next() {
                i++;
                return i < len ? keys[i] : null;
            };
        }
    }

    function _baseSlice(arr, start) {
        start = start || 0;
        var index = -1;
        var length = arr.length;

        if (start) {
          length -= start;
          length = length < 0 ? 0 : length;
        }
        var result = Array(length);

        while (++index < length) {
          result[index] = arr[index + start];
        }
        return result;
    }

    function _withoutIndex(iterator) {
        return function (value, index, callback) {
            return iterator(value, callback);
        };
    }

    //// exported async module functions ////

    //// nextTick implementation with browser-compatible fallback ////

    // capture the global reference to guard against fakeTimer mocks
    var _setImmediate;
    if (typeof setImmediate === 'function') {
        _setImmediate = setImmediate;
    }

    if (typeof process === 'undefined' || !(process.nextTick)) {
        if (_setImmediate) {
            async.nextTick = function (fn) {
                // not a direct alias for IE10 compatibility
                _setImmediate(fn);
            };
            async.setImmediate = async.nextTick;
        }
        else {
            async.nextTick = function (fn) {
                setTimeout(fn, 0);
            };
            async.setImmediate = async.nextTick;
        }
    }
    else {
        async.nextTick = process.nextTick;
        if (_setImmediate) {
            async.setImmediate = function (fn) {
              // not a direct alias for IE10 compatibility
              _setImmediate(fn);
            };
        }
        else {
            async.setImmediate = async.nextTick;
        }
    }

    async.forEach =
    async.each = function (arr, iterator, callback) {
        return async.eachOf(arr, _withoutIndex(iterator), callback);
    };

    async.forEachSeries =
    async.eachSeries = function (arr, iterator, callback) {
        return async.eachOfSeries(arr, _withoutIndex(iterator), callback);
    };


    async.forEachLimit =
    async.eachLimit = function (arr, limit, iterator, callback) {
        return _eachOfLimit(limit)(arr, _withoutIndex(iterator), callback);
    };

    async.forEachOf =
    async.eachOf = function (object, iterator, callback) {
        callback = _once(callback || noop);
        object = object || [];
        var size = _isArrayLike(object) ? object.length : _keys(object).length;
        var completed = 0;
        if (!size) {
            return callback(null);
        }
        _each(object, function (value, key) {
            iterator(object[key], key, only_once(done));
        });
        function done(err) {
          if (err) {
              callback(err);
          }
          else {
              completed += 1;
              if (completed >= size) {
                  callback(null);
              }
          }
        }
    };

    async.forEachOfSeries =
    async.eachOfSeries = function (obj, iterator, callback) {
        callback = _once(callback || noop);
        obj = obj || [];
        var nextKey = _keyIterator(obj);
        var key = nextKey();
        function iterate() {
            var sync = true;
            if (key === null) {
                return callback(null);
            }
            iterator(obj[key], key, only_once(function (err) {
                if (err) {
                    callback(err);
                }
                else {
                    key = nextKey();
                    if (key === null) {
                        return callback(null);
                    } else {
                        if (sync) {
                            async.nextTick(iterate);
                        } else {
                            iterate();
                        }
                    }
                }
            }));
            sync = false;
        }
        iterate();
    };



    async.forEachOfLimit =
    async.eachOfLimit = function (obj, limit, iterator, callback) {
        _eachOfLimit(limit)(obj, iterator, callback);
    };

    function _eachOfLimit(limit) {

        return function (obj, iterator, callback) {
            callback = _once(callback || noop);
            obj = obj || [];
            var nextKey = _keyIterator(obj);
            if (limit <= 0) {
                return callback(null);
            }
            var done = false;
            var running = 0;
            var errored = false;

            (function replenish () {
                if (done && running <= 0) {
                    return callback(null);
                }

                while (running < limit && !errored) {
                    var key = nextKey();
                    if (key === null) {
                        done = true;
                        if (running <= 0) {
                            callback(null);
                        }
                        return;
                    }
                    running += 1;
                    iterator(obj[key], key, only_once(function (err) {
                        running -= 1;
                        if (err) {
                            callback(err);
                            errored = true;
                        }
                        else {
                            replenish();
                        }
                    }));
                }
            })();
        };
    }


    function doParallel(fn) {
        return function (obj, iterator, callback) {
            return fn(async.eachOf, obj, iterator, callback);
        };
    }
    function doParallelLimit(limit, fn) {
        return function (obj, iterator, callback) {
            return fn(_eachOfLimit(limit), obj, iterator, callback);
        };
    }
    function doSeries(fn) {
        return function (obj, iterator, callback) {
            return fn(async.eachOfSeries, obj, iterator, callback);
        };
    }

    function _asyncMap(eachfn, arr, iterator, callback) {
        callback = _once(callback || noop);
        var results = [];
        eachfn(arr, function (value, index, callback) {
            iterator(value, function (err, v) {
                results[index] = v;
                callback(err);
            });
        }, function (err) {
            callback(err, results);
        });
    }

    async.map = doParallel(_asyncMap);
    async.mapSeries = doSeries(_asyncMap);
    async.mapLimit = function (arr, limit, iterator, callback) {
        return _mapLimit(limit)(arr, iterator, callback);
    };

    function _mapLimit(limit) {
        return doParallelLimit(limit, _asyncMap);
    }

    // reduce only has a series version, as doing reduce in parallel won't
    // work in many situations.
    async.inject =
    async.foldl =
    async.reduce = function (arr, memo, iterator, callback) {
        async.eachOfSeries(arr, function (x, i, callback) {
            iterator(memo, x, function (err, v) {
                memo = v;
                callback(err);
            });
        }, function (err) {
            callback(err || null, memo);
        });
    };

    async.foldr =
    async.reduceRight = function (arr, memo, iterator, callback) {
        var reversed = _map(arr, function (x) {
            return x;
        }).reverse();
        async.reduce(reversed, memo, iterator, callback);
    };

    function _filter(eachfn, arr, iterator, callback) {
        var results = [];
        arr = _map(arr, function (x, i) {
            return {index: i, value: x};
        });
        eachfn(arr, function (x, index, callback) {
            iterator(x.value, function (v) {
                if (v) {
                    results.push(x);
                }
                callback();
            });
        }, function () {
            callback(_map(results.sort(function (a, b) {
                return a.index - b.index;
            }), function (x) {
                return x.value;
            }));
        });
    }

    async.select =
    async.filter = doParallel(_filter);

    async.selectSeries =
    async.filterSeries = doSeries(_filter);

    function _reject(eachfn, arr, iterator, callback) {
        var results = [];
        arr = _map(arr, function (x, i) {
            return {index: i, value: x};
        });
        eachfn(arr, function (x, index, callback) {
            iterator(x.value, function (v) {
                if (!v) {
                    results.push(x);
                }
                callback();
            });
        }, function () {
            callback(_map(results.sort(function (a, b) {
                return a.index - b.index;
            }), function (x) {
                return x.value;
            }));
        });
    }
    async.reject = doParallel(_reject);
    async.rejectSeries = doSeries(_reject);

    function _detect(eachfn, arr, iterator, main_callback) {
        eachfn(arr, function (x, index, callback) {
            iterator(x, function (result) {
                if (result) {
                    main_callback(x);
                    main_callback = noop;
                }
                else {
                    callback();
                }
            });
        }, function () {
            main_callback();
        });
    }
    async.detect = doParallel(_detect);
    async.detectSeries = doSeries(_detect);

    async.any =
    async.some = function (arr, iterator, main_callback) {
        async.eachOf(arr, function (x, _, callback) {
            iterator(x, function (v) {
                if (v) {
                    main_callback(true);
                    main_callback = noop;
                }
                callback();
            });
        }, function () {
            main_callback(false);
        });
    };

    async.all =
    async.every = function (arr, iterator, main_callback) {
        async.eachOf(arr, function (x, _, callback) {
            iterator(x, function (v) {
                if (!v) {
                    main_callback(false);
                    main_callback = noop;
                }
                callback();
            });
        }, function () {
            main_callback(true);
        });
    };

    async.sortBy = function (arr, iterator, callback) {
        async.map(arr, function (x, callback) {
            iterator(x, function (err, criteria) {
                if (err) {
                    callback(err);
                }
                else {
                    callback(null, {value: x, criteria: criteria});
                }
            });
        }, function (err, results) {
            if (err) {
                return callback(err);
            }
            else {
                callback(null, _map(results.sort(comparator), function (x) {
                    return x.value;
                }));
            }

        });

        function comparator(left, right) {
            var a = left.criteria, b = right.criteria;
            return a < b ? -1 : a > b ? 1 : 0;
        }
    };

    async.auto = function (tasks, callback) {
        callback = _once(callback || noop);
        var keys = _keys(tasks);
        var remainingTasks = keys.length;
        if (!remainingTasks) {
            return callback(null);
        }

        var results = {};

        var listeners = [];
        function addListener(fn) {
            listeners.unshift(fn);
        }
        function removeListener(fn) {
            for (var i = 0; i < listeners.length; i += 1) {
                if (listeners[i] === fn) {
                    listeners.splice(i, 1);
                    return;
                }
            }
        }
        function taskComplete() {
            remainingTasks--;
            _arrayEach(listeners.slice(0), function (fn) {
                fn();
            });
        }

        addListener(function () {
            if (!remainingTasks) {
                callback(null, results);
            }
        });

        _arrayEach(keys, function (k) {
            var task = _isArray(tasks[k]) ? tasks[k]: [tasks[k]];
            function taskCallback(err) {
                var args = _baseSlice(arguments, 1);
                if (args.length <= 1) {
                    args = args[0];
                }
                if (err) {
                    var safeResults = {};
                    _arrayEach(_keys(results), function(rkey) {
                        safeResults[rkey] = results[rkey];
                    });
                    safeResults[k] = args;
                    callback(err, safeResults);
                }
                else {
                    results[k] = args;
                    async.setImmediate(taskComplete);
                }
            }
            var requires = task.slice(0, Math.abs(task.length - 1)) || [];
            // prevent dead-locks
            var len = requires.length;
            var dep;
            while (len--) {
                if (!(dep = tasks[requires[len]])) {
                    throw new Error('Has inexistant dependency');
                }
                if (_isArray(dep) && !!~dep.indexOf(k)) {
                    throw new Error('Has cyclic dependencies');
                }
            }
            function ready() {
                return _reduce(requires, function (a, x) {
                    return (a && results.hasOwnProperty(x));
                }, true) && !results.hasOwnProperty(k);
            }
            if (ready()) {
                task[task.length - 1](taskCallback, results);
            }
            else {
                addListener(listener);
            }
            function listener() {
                if (ready()) {
                    removeListener(listener);
                    task[task.length - 1](taskCallback, results);
                }
            }
        });
    };

    async.retry = function(times, task, callback) {
        var DEFAULT_TIMES = 5;
        var attempts = [];
        // Use defaults if times not passed
        if (typeof times === 'function') {
            callback = task;
            task = times;
            times = DEFAULT_TIMES;
        }
        // Make sure times is a number
        times = parseInt(times, 10) || DEFAULT_TIMES;

        function wrappedTask(wrappedCallback, wrappedResults) {
            function retryAttempt(task, finalAttempt) {
                return function(seriesCallback) {
                    task(function(err, result){
                        seriesCallback(!err || finalAttempt, {err: err, result: result});
                    }, wrappedResults);
                };
            }

            while (times) {
                attempts.push(retryAttempt(task, !(times-=1)));
            }
            async.series(attempts, function(done, data){
                data = data[data.length - 1];
                (wrappedCallback || callback)(data.err, data.result);
            });
        }

        // If a callback is passed, run this as a controll flow
        return callback ? wrappedTask() : wrappedTask;
    };

    async.waterfall = function (tasks, callback) {
        callback = _once(callback || noop);
        if (!_isArray(tasks)) {
          var err = new Error('First argument to waterfall must be an array of functions');
          return callback(err);
        }
        if (!tasks.length) {
            return callback();
        }
        function wrapIterator(iterator) {
            return function (err) {
                if (err) {
                    callback.apply(null, arguments);
                }
                else {
                    var args = _baseSlice(arguments, 1);
                    var next = iterator.next();
                    if (next) {
                        args.push(wrapIterator(next));
                    }
                    else {
                        args.push(callback);
                    }
                    ensureAsync(iterator).apply(null, args);
                }
            };
        }
        wrapIterator(async.iterator(tasks))();
    };

    function _parallel(eachfn, tasks, callback) {
        callback = callback || noop;
        var results = _isArrayLike(tasks) ? [] : {};

        eachfn(tasks, function (task, key, callback) {
            task(function (err) {
                var args = _baseSlice(arguments, 1);
                if (args.length <= 1) {
                    args = args[0];
                }
                results[key] = args;
                callback(err);
            });
        }, function (err) {
            callback(err, results);
        });
    }

    async.parallel = function (tasks, callback) {
        _parallel(async.eachOf, tasks, callback);
    };

    async.parallelLimit = function(tasks, limit, callback) {
        _parallel(_eachOfLimit(limit), tasks, callback);
    };

    async.series = function (tasks, callback) {
        callback = callback || noop;
        var results = _isArrayLike(tasks) ? [] : {};

        async.eachOfSeries(tasks, function (task, key, callback) {
            task(function (err) {
                var args = _baseSlice(arguments, 1);
                if (args.length <= 1) {
                    args = args[0];
                }
                results[key] = args;
                callback(err);
            });
        }, function (err) {
            callback(err, results);
        });
    };

    async.iterator = function (tasks) {
        function makeCallback(index) {
            function fn() {
                if (tasks.length) {
                    tasks[index].apply(null, arguments);
                }
                return fn.next();
            }
            fn.next = function () {
                return (index < tasks.length - 1) ? makeCallback(index + 1): null;
            };
            return fn;
        }
        return makeCallback(0);
    };

    async.apply = function (fn) {
        var args = _baseSlice(arguments, 1);
        return function () {
            return fn.apply(
                null, args.concat(_baseSlice(arguments))
            );
        };
    };

    function _concat(eachfn, arr, fn, callback) {
        var result = [];
        eachfn(arr, function (x, index, cb) {
            fn(x, function (err, y) {
                result = result.concat(y || []);
                cb(err);
            });
        }, function (err) {
            callback(err, result);
        });
    }
    async.concat = doParallel(_concat);
    async.concatSeries = doSeries(_concat);

    async.whilst = function (test, iterator, callback) {
        if (test()) {
            iterator(function (err) {
                if (err) {
                    return callback(err);
                }
                async.whilst(test, iterator, callback);
            });
        }
        else {
            callback(null);
        }
    };

    async.doWhilst = function (iterator, test, callback) {
        iterator(function (err) {
            if (err) {
                return callback(err);
            }
            var args = _baseSlice(arguments, 1);
            if (test.apply(null, args)) {
                async.doWhilst(iterator, test, callback);
            }
            else {
                callback(null);
            }
        });
    };

    async.until = function (test, iterator, callback) {
        if (!test()) {
            iterator(function (err) {
                if (err) {
                    return callback(err);
                }
                async.until(test, iterator, callback);
            });
        }
        else {
            callback(null);
        }
    };

    async.doUntil = function (iterator, test, callback) {
        iterator(function (err) {
            if (err) {
                return callback(err);
            }
            var args = _baseSlice(arguments, 1);
            if (!test.apply(null, args)) {
                async.doUntil(iterator, test, callback);
            }
            else {
                callback(null);
            }
        });
    };

    function _queue(worker, concurrency, payload) {
        if (concurrency == null) {
            concurrency = 1;
        }
        else if(concurrency === 0) {
            throw new Error('Concurrency must not be zero');
        }
        function _insert(q, data, pos, callback) {
            if (callback != null && typeof callback !== "function") {
                throw new Error("task callback must be a function");
            }
            q.started = true;
            if (!_isArray(data)) {
                data = [data];
            }
            if(data.length === 0 && q.idle()) {
                // call drain immediately if there are no tasks
                return async.setImmediate(function() {
                   q.drain();
                });
            }
            _arrayEach(data, function(task) {
                var item = {
                    data: task,
                    callback: callback || noop
                };

                if (pos) {
                  q.tasks.unshift(item);
                } else {
                  q.tasks.push(item);
                }

                if (q.tasks.length === q.concurrency) {
                    q.saturated();
                }
            });
            async.setImmediate(q.process);
        }
        function _next(q, tasks) {
            return function(){
                workers -= 1;
                var args = arguments;
                _arrayEach(tasks, function (task) {
                    task.callback.apply(task, args);
                });
                if (q.tasks.length + workers === 0) {
                    q.drain();
                }
                q.process();
            };
        }

        var workers = 0;
        var q = {
            tasks: [],
            concurrency: concurrency,
            saturated: noop,
            empty: noop,
            drain: noop,
            started: false,
            paused: false,
            push: function (data, callback) {
                _insert(q, data, false, callback);
            },
            kill: function () {
                q.drain = noop;
                q.tasks = [];
            },
            unshift: function (data, callback) {
                _insert(q, data, true, callback);
            },
            process: function () {
                if (!q.paused && workers < q.concurrency && q.tasks.length) {
                    while(workers < q.concurrency && q.tasks.length){
                        var tasks = payload ?
                            q.tasks.splice(0, payload) :
                            q.tasks.splice(0, q.tasks.length);

                        var data = _map(tasks, function (task) {
                            return task.data;
                        });

                        if (q.tasks.length === 0) {
                            q.empty();
                        }
                        workers += 1;
                        var cb = only_once(_next(q, tasks));
                        worker(data, cb);
                    }
                }
            },
            length: function () {
                return q.tasks.length;
            },
            running: function () {
                return workers;
            },
            idle: function() {
                return q.tasks.length + workers === 0;
            },
            pause: function () {
                q.paused = true;
            },
            resume: function () {
                if (q.paused === false) { return; }
                q.paused = false;
                var resumeCount = Math.min(q.concurrency, q.tasks.length);
                // Need to call q.process once per concurrent
                // worker to preserve full concurrency after pause
                for (var w = 1; w <= resumeCount; w++) {
                    async.setImmediate(q.process);
                }
            }
        };
        return q;
    }

    async.queue = function (worker, concurrency) {
        var q = _queue(function (items, cb) {
            worker(items[0], cb);
        }, concurrency, 1);

        return q;
    };

    async.priorityQueue = function (worker, concurrency) {

        function _compareTasks(a, b){
            return a.priority - b.priority;
        }

        function _binarySearch(sequence, item, compare) {
          var beg = -1,
              end = sequence.length - 1;
          while (beg < end) {
              var mid = beg + ((end - beg + 1) >>> 1);
              if (compare(item, sequence[mid]) >= 0) {
                  beg = mid;
              } else {
                  end = mid - 1;
              }
          }
          return beg;
        }

        function _insert(q, data, priority, callback) {
            if (callback != null && typeof callback !== "function") {
                throw new Error("task callback must be a function");
            }
            q.started = true;
            if (!_isArray(data)) {
                data = [data];
            }
            if(data.length === 0) {
                // call drain immediately if there are no tasks
                return async.setImmediate(function() {
                    q.drain();
                });
            }
            _arrayEach(data, function(task) {
                var item = {
                    data: task,
                    priority: priority,
                    callback: typeof callback === 'function' ? callback : noop
                };

                q.tasks.splice(_binarySearch(q.tasks, item, _compareTasks) + 1, 0, item);

                if (q.tasks.length === q.concurrency) {
                    q.saturated();
                }
                async.setImmediate(q.process);
            });
        }

        // Start with a normal queue
        var q = async.queue(worker, concurrency);

        // Override push to accept second parameter representing priority
        q.push = function (data, priority, callback) {
            _insert(q, data, priority, callback);
        };

        // Remove unshift function
        delete q.unshift;

        return q;
    };

    async.cargo = function (worker, payload) {
        return _queue(worker, 1, payload);
    };

    function _console_fn(name) {
        return function (fn) {
            var args = _baseSlice(arguments, 1);
            fn.apply(null, args.concat([function (err) {
                var args = _baseSlice(arguments, 1);
                if (typeof console !== 'undefined') {
                    if (err) {
                        if (console.error) {
                            console.error(err);
                        }
                    }
                    else if (console[name]) {
                        _arrayEach(args, function (x) {
                            console[name](x);
                        });
                    }
                }
            }]));
        };
    }
    async.log = _console_fn('log');
    async.dir = _console_fn('dir');
    /*async.info = _console_fn('info');
    async.warn = _console_fn('warn');
    async.error = _console_fn('error');*/

    async.memoize = function (fn, hasher) {
        var memo = {};
        var queues = {};
        hasher = hasher || function (x) {
            return x;
        };
        function memoized() {
            var args = _baseSlice(arguments);
            var callback = args.pop();
            var key = hasher.apply(null, args);
            if (key in memo) {
                async.nextTick(function () {
                    callback.apply(null, memo[key]);
                });
            }
            else if (key in queues) {
                queues[key].push(callback);
            }
            else {
                queues[key] = [callback];
                fn.apply(null, args.concat([function () {
                    memo[key] = _baseSlice(arguments);
                    var q = queues[key];
                    delete queues[key];
                    for (var i = 0, l = q.length; i < l; i++) {
                      q[i].apply(null, arguments);
                    }
                }]));
            }
        }
        memoized.memo = memo;
        memoized.unmemoized = fn;
        return memoized;
    };

    async.unmemoize = function (fn) {
      return function () {
        return (fn.unmemoized || fn).apply(null, arguments);
      };
    };

    function _times(mapper) {
        return function (count, iterator, callback) {
            mapper(_range(count), iterator, callback);
        };
    }

    async.times = _times(async.map);
    async.timesSeries = _times(async.mapSeries);
    async.timesLimit = function (count, limit, iterator, callback) {
        return async.mapLimit(_range(count), limit, iterator, callback);
    };

    async.seq = function (/* functions... */) {
        var fns = arguments;
        return function () {
            var that = this;
            var args = _baseSlice(arguments);

            var callback = args.slice(-1)[0];
            if (typeof callback == 'function') {
                args.pop();
            } else {
                callback = noop;
            }

            async.reduce(fns, args, function (newargs, fn, cb) {
                fn.apply(that, newargs.concat([function () {
                    var err = arguments[0];
                    var nextargs = _baseSlice(arguments, 1);
                    cb(err, nextargs);
                }]));
            },
            function (err, results) {
                callback.apply(that, [err].concat(results));
            });
        };
    };

    async.compose = function (/* functions... */) {
      return async.seq.apply(null, Array.prototype.reverse.call(arguments));
    };


    function _applyEach(eachfn, fns /*args...*/) {
        function go() {
            var that = this;
            var args = _baseSlice(arguments);
            var callback = args.pop();
            return eachfn(fns, function (fn, _, cb) {
                fn.apply(that, args.concat([cb]));
            },
            callback);
        }
        if (arguments.length > 2) {
            var args = _baseSlice(arguments, 2);
            return go.apply(this, args);
        }
        else {
            return go;
        }
    }

    async.applyEach = function (/*fns, args...*/) {
        var args = _baseSlice(arguments);
        return _applyEach.apply(null, [async.eachOf].concat(args));
    };
    async.applyEachSeries = function (/*fns, args...*/) {
        var args = _baseSlice(arguments);
        return _applyEach.apply(null, [async.eachOfSeries].concat(args));
    };


    async.forever = function (fn, callback) {
        var done = only_once(callback || noop);
        var task = ensureAsync(fn);
        function next(err) {
            if (err) {
                return done(err);
            }
            task(next);
        }
        next();
    };

    function ensureAsync(fn) {
        return function (/*...args, callback*/) {
            var args = _baseSlice(arguments);
            var callback = args.pop();
            args.push(function () {
                var innerArgs = arguments;
                if (sync) {
                    async.setImmediate(function () {
                        callback.apply(null, innerArgs);
                    });
                } else {
                    callback.apply(null, innerArgs);
                }
            });
            var sync = true;
            fn.apply(this, args);
            sync = false;
        };
    }

    async.ensureAsync = ensureAsync;

    // Node.js
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = async;
    }
    // AMD / RequireJS
    else if (typeof define !== 'undefined' && define.amd) {
        define([], function () {
            return async;
        });
    }
    // included directly via <script> tag
    else {
        root.async = async;
    }

}());
});

var async$1 = interopDefault(async);


var require$$3$3 = Object.freeze({
    default: async$1
});

var stringify = createCommonjsModule(function (module, exports) {
exports = module.exports = stringify
exports.getSerialize = serializer

function stringify(obj, replacer, spaces, cycleReplacer) {
  return JSON.stringify(obj, serializer(replacer, cycleReplacer), spaces)
}

function serializer(replacer, cycleReplacer) {
  var stack = [], keys = []

  if (cycleReplacer == null) cycleReplacer = function(key, value) {
    if (stack[0] === value) return "[Circular ~]"
    return "[Circular ~." + keys.slice(0, stack.indexOf(value)).join(".") + "]"
  }

  return function(key, value) {
    if (stack.length > 0) {
      var thisPos = stack.indexOf(this)
      ~thisPos ? stack.splice(thisPos + 1) : stack.push(this)
      ~thisPos ? keys.splice(thisPos, Infinity, key) : keys.push(key)
      if (~stack.indexOf(value)) value = cycleReplacer.call(this, key, value)
    }
    else stack.push(value)

    return replacer == null ? value : replacer.call(this, key, value)
  }
}
});

var stringify$1 = interopDefault(stringify);
var getSerialize = stringify.getSerialize;

var require$$0$5 = Object.freeze({
  default: stringify$1,
  getSerialize: getSerialize
});

var api$1 = createCommonjsModule(function (module, exports) {
/*jslint devel: true, nomen: true, plusplus: true, regexp: true, indent: 2, maxlen: 100 */

"use strict";

var logger = interopDefault(require$$4$1);
var async = interopDefault(require$$3$3);
var url = interopDefault(require$$3);
var http = interopDefault(require$$2);
var https = interopDefault(require$$1$1);
var stringify = interopDefault(require$$0$5);

exports.VERSION = '1';
exports.endpoint = 'https://api.rollbar.com/api/' + exports.VERSION + '/';
exports.accessToken = null;


var SETTINGS = {
  accessToken: null,
  protocol: 'https',
  endpoint: exports.endpoint,
  proxy: null
};


/*
 * Internal
 */


function transportOpts(path, method) {
  var port;
  port = SETTINGS.port ||
      (SETTINGS.protocol === 'http' ? 80 : (SETTINGS.protocol === 'https' ? 443 : undefined));

  return {
    host: SETTINGS.endpointOpts.host,
    port: port,
    path: SETTINGS.endpointOpts.path + path,
    method: method
  };
}


function parseApiResponse(respData, callback) {
  try {
    respData = JSON.parse(respData);
  } catch (e) {
    logger.error('Could not parse api response, err: ' + e);
    return callback(e);
  }

  if (respData.err) {
    logger.error('Received error: ' + respData.message);
    return callback(new Error('Api error: ' + (respData.message || 'Unknown error')));
  }


  if (respData.result && respData.result.uuid) {
    logger.log([
      'Successful api response.',
      ' Link: https://rollbar.com/occurrence/uuid/?uuid=' + respData.result.uuid
    ].join(''));

  } else {
    logger.log('Successful api response');
  }

  callback(null, respData.result);
}


function makeApiRequest(transport, opts, bodyObj, callback) {
  var writeData, req;

  if (!bodyObj) {
    return callback(new Error('Cannot send empty request'));
  }

  try {
    try {
      writeData = JSON.stringify(bodyObj);
    } catch (e) {
      logger.error('Could not serialize to JSON - falling back to safe-stringify');
      writeData = stringify(bodyObj);
    }
  } catch (e) {
    logger.error('Could not safe-stringify data. Giving up');
    return callback(e);
  }

  opts.headers = opts.headers || {};

  opts.headers['Content-Type'] = 'application/json';
  opts.headers['Content-Length'] = Buffer.byteLength(writeData, 'utf8');
  opts.headers['X-Rollbar-Access-Token'] = exports.accessToken;

  if (SETTINGS.proxy) {
    opts.path = SETTINGS.protocol + '://' + opts.host + opts.path;
    opts.host = SETTINGS.proxy.host;
    opts.port = SETTINGS.proxy.port;
    transport = http;
  }

  req = transport.request(opts, function (resp) {
    var respData = [];

    resp.setEncoding('utf8');
    resp.on('data', function (chunk) {
      respData.push(chunk);
    });

    resp.on('end', function () {
      respData = respData.join('');
      parseApiResponse(respData, callback);
    });
  });

  req.on('error', function (err) {
    logger.error('Could not make request to rollbar, ' + err);
    callback(err);
  });

  if (writeData) {
    req.write(writeData);
  }
  req.end();
}


function postApi(path, payload, callback) {
  var transport, opts;

  transport = SETTINGS.transport;
  opts = transportOpts(path, 'POST');

  return makeApiRequest(transport, opts, payload, callback);
}


function buildPayload(data) {
  var payload;

  payload = {
    access_token: exports.accessToken,
    data: data
  };

  return payload;
}


/*
 * Public API
 */


exports.init = function (accessToken, options) {
  var opt, portCheck;

  options = options || {};
  exports.accessToken = accessToken;
  exports.endpoint = options.endpoint || exports.endpoint;

  for (opt in options) {
    if (options.hasOwnProperty(opt)) {
      SETTINGS[opt] = options[opt];
    }
  }

  SETTINGS.endpointOpts = url.parse(exports.endpoint);
  SETTINGS.protocol = SETTINGS.endpointOpts.protocol.split(':')[0];
  SETTINGS.transport = {http: http, https: https}[SETTINGS.protocol];
  SETTINGS.proxy = options.proxy;

  portCheck = SETTINGS.endpointOpts.host.split(':');
  if (portCheck.length > 1) {
    SETTINGS.endpointOpts.host = portCheck[0];
    SETTINGS.port = parseInt(portCheck[1], 10);
  }
};


exports.postItem = function (item, callback) {
  return postApi('item/', buildPayload(item), callback);
};
});

var api$2 = interopDefault(api$1);
var postItem = api$1.postItem;
var init$1 = api$1.init;
var endpoint = api$1.endpoint;
var accessToken = api$1.accessToken;
var VERSION = api$1.VERSION;

var require$$3$2 = Object.freeze({
  default: api$2,
  postItem: postItem,
  init: init$1,
  endpoint: endpoint,
  accessToken: accessToken,
  VERSION: VERSION
});

var uuid = createCommonjsModule(function (module) {
//     uuid.js
//
//     Copyright (c) 2010-2012 Robert Kieffer
//     MIT License - http://opensource.org/licenses/mit-license.php

/*global window, require, define */
(function(_window) {
  'use strict';

  // Unique ID creation requires a high quality random # generator.  We feature
  // detect to determine the best RNG source, normalizing to a function that
  // returns 128-bits of randomness, since that's what's usually required
  var _rng, _mathRNG, _nodeRNG, _whatwgRNG, _previousRoot;

  function setupBrowser() {
    // Allow for MSIE11 msCrypto
    var _crypto = _window.crypto || _window.msCrypto;

    if (!_rng && _crypto && _crypto.getRandomValues) {
      // WHATWG crypto-based RNG - http://wiki.whatwg.org/wiki/Crypto
      //
      // Moderately fast, high quality
      try {
        var _rnds8 = new Uint8Array(16);
        _whatwgRNG = _rng = function whatwgRNG() {
          _crypto.getRandomValues(_rnds8);
          return _rnds8;
        };
        _rng();
      } catch(e) {}
    }

    if (!_rng) {
      // Math.random()-based (RNG)
      //
      // If all else fails, use Math.random().  It's fast, but is of unspecified
      // quality.
      var  _rnds = new Array(16);
      _mathRNG = _rng = function() {
        for (var i = 0, r; i < 16; i++) {
          if ((i & 0x03) === 0) { r = Math.random() * 0x100000000; }
          _rnds[i] = r >>> ((i & 0x03) << 3) & 0xff;
        }

        return _rnds;
      };
      if ('undefined' !== typeof console && console.warn) {
        console.warn("[SECURITY] node-uuid: crypto not usable, falling back to insecure Math.random()");
      }
    }
  }

  function setupNode() {
    // Node.js crypto-based RNG - http://nodejs.org/docs/v0.6.2/api/crypto.html
    //
    // Moderately fast, high quality
    if ('function' === 'function') {
      try {
        var _rb = interopDefault(require$$0$2).randomBytes;
        _nodeRNG = _rng = _rb && function() {return _rb(16);};
        _rng();
      } catch(e) {}
    }
  }

  if (_window) {
    setupBrowser();
  } else {
    setupNode();
  }

  // Buffer class to use
  var BufferClass = ('function' === typeof Buffer) ? Buffer : Array;

  // Maps for number <-> hex string conversion
  var _byteToHex = [];
  var _hexToByte = {};
  for (var i = 0; i < 256; i++) {
    _byteToHex[i] = (i + 0x100).toString(16).substr(1);
    _hexToByte[_byteToHex[i]] = i;
  }

  // **`parse()` - Parse a UUID into it's component bytes**
  function parse(s, buf, offset) {
    var i = (buf && offset) || 0, ii = 0;

    buf = buf || [];
    s.toLowerCase().replace(/[0-9a-f]{2}/g, function(oct) {
      if (ii < 16) { // Don't overflow!
        buf[i + ii++] = _hexToByte[oct];
      }
    });

    // Zero out remaining bytes if string was short
    while (ii < 16) {
      buf[i + ii++] = 0;
    }

    return buf;
  }

  // **`unparse()` - Convert UUID byte array (ala parse()) into a string**
  function unparse(buf, offset) {
    var i = offset || 0, bth = _byteToHex;
    return  bth[buf[i++]] + bth[buf[i++]] +
            bth[buf[i++]] + bth[buf[i++]] + '-' +
            bth[buf[i++]] + bth[buf[i++]] + '-' +
            bth[buf[i++]] + bth[buf[i++]] + '-' +
            bth[buf[i++]] + bth[buf[i++]] + '-' +
            bth[buf[i++]] + bth[buf[i++]] +
            bth[buf[i++]] + bth[buf[i++]] +
            bth[buf[i++]] + bth[buf[i++]];
  }

  // **`v1()` - Generate time-based UUID**
  //
  // Inspired by https://github.com/LiosK/UUID.js
  // and http://docs.python.org/library/uuid.html

  // random #'s we need to init node and clockseq
  var _seedBytes = _rng();

  // Per 4.5, create and 48-bit node id, (47 random bits + multicast bit = 1)
  var _nodeId = [
    _seedBytes[0] | 0x01,
    _seedBytes[1], _seedBytes[2], _seedBytes[3], _seedBytes[4], _seedBytes[5]
  ];

  // Per 4.2.2, randomize (14 bit) clockseq
  var _clockseq = (_seedBytes[6] << 8 | _seedBytes[7]) & 0x3fff;

  // Previous uuid creation time
  var _lastMSecs = 0, _lastNSecs = 0;

  // See https://github.com/broofa/node-uuid for API details
  function v1(options, buf, offset) {
    var i = buf && offset || 0;
    var b = buf || [];

    options = options || {};

    var clockseq = (options.clockseq != null) ? options.clockseq : _clockseq;

    // UUID timestamps are 100 nano-second units since the Gregorian epoch,
    // (1582-10-15 00:00).  JSNumbers aren't precise enough for this, so
    // time is handled internally as 'msecs' (integer milliseconds) and 'nsecs'
    // (100-nanoseconds offset from msecs) since unix epoch, 1970-01-01 00:00.
    var msecs = (options.msecs != null) ? options.msecs : new Date().getTime();

    // Per 4.2.1.2, use count of uuid's generated during the current clock
    // cycle to simulate higher resolution clock
    var nsecs = (options.nsecs != null) ? options.nsecs : _lastNSecs + 1;

    // Time since last uuid creation (in msecs)
    var dt = (msecs - _lastMSecs) + (nsecs - _lastNSecs)/10000;

    // Per 4.2.1.2, Bump clockseq on clock regression
    if (dt < 0 && options.clockseq == null) {
      clockseq = clockseq + 1 & 0x3fff;
    }

    // Reset nsecs if clock regresses (new clockseq) or we've moved onto a new
    // time interval
    if ((dt < 0 || msecs > _lastMSecs) && options.nsecs == null) {
      nsecs = 0;
    }

    // Per 4.2.1.2 Throw error if too many uuids are requested
    if (nsecs >= 10000) {
      throw new Error('uuid.v1(): Can\'t create more than 10M uuids/sec');
    }

    _lastMSecs = msecs;
    _lastNSecs = nsecs;
    _clockseq = clockseq;

    // Per 4.1.4 - Convert from unix epoch to Gregorian epoch
    msecs += 12219292800000;

    // `time_low`
    var tl = ((msecs & 0xfffffff) * 10000 + nsecs) % 0x100000000;
    b[i++] = tl >>> 24 & 0xff;
    b[i++] = tl >>> 16 & 0xff;
    b[i++] = tl >>> 8 & 0xff;
    b[i++] = tl & 0xff;

    // `time_mid`
    var tmh = (msecs / 0x100000000 * 10000) & 0xfffffff;
    b[i++] = tmh >>> 8 & 0xff;
    b[i++] = tmh & 0xff;

    // `time_high_and_version`
    b[i++] = tmh >>> 24 & 0xf | 0x10; // include version
    b[i++] = tmh >>> 16 & 0xff;

    // `clock_seq_hi_and_reserved` (Per 4.2.2 - include variant)
    b[i++] = clockseq >>> 8 | 0x80;

    // `clock_seq_low`
    b[i++] = clockseq & 0xff;

    // `node`
    var node = options.node || _nodeId;
    for (var n = 0; n < 6; n++) {
      b[i + n] = node[n];
    }

    return buf ? buf : unparse(b);
  }

  // **`v4()` - Generate random UUID**

  // See https://github.com/broofa/node-uuid for API details
  function v4(options, buf, offset) {
    // Deprecated - 'format' argument, as supported in v1.2
    var i = buf && offset || 0;

    if (typeof(options) === 'string') {
      buf = (options === 'binary') ? new BufferClass(16) : null;
      options = null;
    }
    options = options || {};

    var rnds = options.random || (options.rng || _rng)();

    // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
    rnds[6] = (rnds[6] & 0x0f) | 0x40;
    rnds[8] = (rnds[8] & 0x3f) | 0x80;

    // Copy bytes to buffer, if provided
    if (buf) {
      for (var ii = 0; ii < 16; ii++) {
        buf[i + ii] = rnds[ii];
      }
    }

    return buf || unparse(rnds);
  }

  // Export public API
  var uuid = v4;
  uuid.v1 = v1;
  uuid.v4 = v4;
  uuid.parse = parse;
  uuid.unparse = unparse;
  uuid.BufferClass = BufferClass;
  uuid._rng = _rng;
  uuid._mathRNG = _mathRNG;
  uuid._nodeRNG = _nodeRNG;
  uuid._whatwgRNG = _whatwgRNG;

  if (('undefined' !== typeof module) && module.exports) {
    // Publish as node.js module
    module.exports = uuid;
  } else if (typeof define === 'function' && define.amd) {
    // Publish as AMD module
    define(function() {return uuid;});


  } else {
    // Publish as global (in browsers)
    _previousRoot = _window.uuid;

    // **`noConflict()` - (browser only) to reset global 'uuid' var**
    uuid.noConflict = function() {
      _window.uuid = _previousRoot;
      return uuid;
    };

    _window.uuid = uuid;
  }
})('undefined' !== typeof window ? window : null);
});

var uuid$1 = interopDefault(uuid);


var require$$4$2 = Object.freeze({
  default: uuid$1
});

var lruCache = createCommonjsModule(function (module) {
;(function () { // closure for web browsers

if (typeof module === 'object' && module.exports) {
  module.exports = LRUCache
} else {
  // just set the global for non-node platforms.
  this.LRUCache = LRUCache
}

function hOP (obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key)
}

function naiveLength () { return 1 }

function LRUCache (options) {
  if (!(this instanceof LRUCache)) {
    return new LRUCache(options)
  }

  var max
  if (typeof options === 'number') {
    max = options
    options = { max: max }
  }

  if (!options) options = {}

  max = options.max

  var lengthCalculator = options.length || naiveLength

  if (typeof lengthCalculator !== "function") {
    lengthCalculator = naiveLength
  }

  if (!max || !(typeof max === "number") || max <= 0 ) {
    // a little bit silly.  maybe this should throw?
    max = Infinity
  }

  var allowStale = options.stale || false

  var maxAge = options.maxAge || null

  var dispose = options.dispose

  var cache = Object.create(null) // hash of items by key
    , lruList = Object.create(null) // list of items in order of use recency
    , mru = 0 // most recently used
    , lru = 0 // least recently used
    , length = 0 // number of items in the list
    , itemCount = 0


  // resize the cache when the max changes.
  Object.defineProperty(this, "max",
    { set : function (mL) {
        if (!mL || !(typeof mL === "number") || mL <= 0 ) mL = Infinity
        max = mL
        // if it gets above double max, trim right away.
        // otherwise, do it whenever it's convenient.
        if (length > max) trim()
      }
    , get : function () { return max }
    , enumerable : true
    })

  // resize the cache when the lengthCalculator changes.
  Object.defineProperty(this, "lengthCalculator",
    { set : function (lC) {
        if (typeof lC !== "function") {
          lengthCalculator = naiveLength
          length = itemCount
          for (var key in cache) {
            cache[key].length = 1
          }
        } else {
          lengthCalculator = lC
          length = 0
          for (var key in cache) {
            cache[key].length = lengthCalculator(cache[key].value)
            length += cache[key].length
          }
        }

        if (length > max) trim()
      }
    , get : function () { return lengthCalculator }
    , enumerable : true
    })

  Object.defineProperty(this, "length",
    { get : function () { return length }
    , enumerable : true
    })


  Object.defineProperty(this, "itemCount",
    { get : function () { return itemCount }
    , enumerable : true
    })

  this.forEach = function (fn, thisp) {
    thisp = thisp || this
    var i = 0;
    for (var k = mru - 1; k >= 0 && i < itemCount; k--) if (lruList[k]) {
      i++
      var hit = lruList[k]
      fn.call(thisp, hit.value, hit.key, this)
    }
  }

  this.keys = function () {
    var keys = new Array(itemCount)
    var i = 0
    for (var k = mru - 1; k >= 0 && i < itemCount; k--) if (lruList[k]) {
      var hit = lruList[k]
      keys[i++] = hit.key
    }
    return keys
  }

  this.values = function () {
    var values = new Array(itemCount)
    var i = 0
    for (var k = mru - 1; k >= 0 && i < itemCount; k--) if (lruList[k]) {
      var hit = lruList[k]
      values[i++] = hit.value
    }
    return values
  }

  this.reset = function () {
    if (dispose) {
      for (var k in cache) {
        dispose(k, cache[k].value)
      }
    }
    cache = {}
    lruList = {}
    lru = 0
    mru = 0
    length = 0
    itemCount = 0
  }

  // Provided for debugging/dev purposes only. No promises whatsoever that
  // this API stays stable.
  this.dump = function () {
    return cache
  }

  this.dumpLru = function () {
    return lruList
  }

  this.set = function (key, value) {
    if (hOP(cache, key)) {
      // dispose of the old one before overwriting
      if (dispose) dispose(key, cache[key].value)
      if (maxAge) cache[key].now = Date.now()
      cache[key].value = value
      this.get(key)
      return true
    }

    var len = lengthCalculator(value)
    var age = maxAge ? Date.now() : 0
    var hit = new Entry(key, value, mru++, len, age)

    // oversized objects fall out of cache automatically.
    if (hit.length > max) {
      if (dispose) dispose(key, value)
      return false
    }

    length += hit.length
    lruList[hit.lu] = cache[key] = hit
    itemCount ++

    if (length > max) trim()
    return true
  }

  this.has = function (key) {
    if (!hOP(cache, key)) return false
    var hit = cache[key]
    if (maxAge && (Date.now() - hit.now > maxAge)) {
      return false
    }
    return true
  }

  this.get = function (key) {
    if (!hOP(cache, key)) return
    var hit = cache[key]
    if (maxAge && (Date.now() - hit.now > maxAge)) {
      this.del(key)
      return allowStale ? hit.value : undefined
    }
    shiftLU(hit)
    hit.lu = mru ++
    lruList[hit.lu] = hit
    return hit.value
  }

  this.del = function (key) {
    del(cache[key])
  }

  function trim () {
    while (lru < mru && length > max)
      del(lruList[lru])
  }

  function shiftLU(hit) {
    delete lruList[ hit.lu ]
    while (lru < mru && !lruList[lru]) lru ++
  }

  function del(hit) {
    if (hit) {
      if (dispose) dispose(hit.key, hit.value)
      length -= hit.length
      itemCount --
      delete cache[ hit.key ]
      shiftLU(hit)
    }
  }
}

// classy, since V8 prefers predictable objects.
function Entry (key, value, mru, len, age) {
  this.key = key
  this.value = value
  this.lu = mru
  this.length = len
  this.now = age
}

})()
});

var lruCache$1 = interopDefault(lruCache);


var require$$1$3 = Object.freeze({
  default: lruCache$1
});

var parser$1 = createCommonjsModule(function (module, exports) {
/*jslint devel: true, nomen: true, plusplus: true, regexp: true, indent: 2, maxlen: 100 */

"use strict";

var logger = interopDefault(require$$4$1);
var async = interopDefault(require$$3$3);
var fs = interopDefault(require$$1);
var lru = interopDefault(require$$1$3);
var util = interopDefault(require$$0);

var linesOfContext = 3;
var tracePattern =
  /^\s*at (?:([^(]+(?: \[\w\s+\])?) )?\(?(.+?)(?::(\d+):(\d+)(?:, <js>:(\d+):(\d+))?)?\)?$/;

var jadeTracePattern = /^\s*at .+ \(.+ (at[^)]+\))\)$/;
var jadeFramePattern = /^\s*(>?) [0-9]+\|(\s*.+)$/m;


var cache = lru({max: 100});
var pendingReads = {};

exports.cache = cache;
exports.pendingReads = pendingReads;


/*
 * Internal
 */


function getMultipleErrors(errors) {
  var errArray, key;

  if (errors === null || errors === undefined) {
    return null;
  }

  if (typeof errors !== "object") {
    return null;
  }

  if (util.isArray(errors)) {
    return errors;
  }

  errArray = [];

  for (key in errors) {
    if (errors.hasOwnProperty(key)) {
      errArray.push(errors[key]);
    }
  }
  return errArray;
}


function parseJadeDebugFrame(body) {
  var lines, lineNumSep, filename, lineno, numLines, msg, i,
    contextLine, preContext, postContext, line, jadeMatch;

  // Given a Jade exception body, return a frame object
  lines = body.split('\n');
  lineNumSep = lines[0].indexOf(':');
  filename = lines[0].slice(0, lineNumSep);
  lineno = parseInt(lines[0].slice(lineNumSep + 1), 10);
  numLines = lines.length;
  msg = lines[numLines - 1];

  lines = lines.slice(1, numLines - 1);

  preContext = [];
  postContext = [];
  for (i = 0; i < numLines - 2; ++i) {
    line = lines[i];
    jadeMatch = line.match(jadeFramePattern);
    if (jadeMatch) {
      if (jadeMatch[1] === '>') {
        contextLine = jadeMatch[2];
      } else {
        if (!contextLine) {
          if (jadeMatch[2]) {
            preContext.push(jadeMatch[2]);
          }
        } else {
          if (jadeMatch[2]) {
            postContext.push(jadeMatch[2]);
          }
        }
      }
    }
  }

  preContext = preContext.slice(0, Math.min(preContext.length, linesOfContext));
  postContext = postContext.slice(0, Math.min(postContext.length, linesOfContext));

  return {
    frame: {
      method: '<jade>',
      filename: filename,
      lineno: lineno,
      code: contextLine,
      context: {
        pre: preContext,
        post: postContext
      }
    },
    message: msg
  };
}


function extractContextLines(frame, fileLines) {
  frame.code = fileLines[frame.lineno - 1];
  frame.context = {
    pre: fileLines.slice(Math.max(0, frame.lineno - (linesOfContext + 1)), frame.lineno - 1),
    post: fileLines.slice(frame.lineno, frame.lineno + linesOfContext)
  };
}


function parseFrameLine(line, callback) {
  var matched, curLine, data, frame;

  curLine = line;
  matched = curLine.match(jadeTracePattern);
  if (matched) {
    curLine = matched[1];
  }
  matched = curLine.match(tracePattern);
  if (!matched) {
    return callback(null, null);
  }

  data = matched.slice(1);
  frame = {
    method: data[0] || '<unknown>',
    filename: data[1],
    lineno: Math.floor(data[2]),
    colno: Math.floor(data[3])
  };

  // For coffeescript, lineno and colno refer to the .coffee positions
  // The .js lineno and colno will be stored in compiled_*
  if (data[4]) {
    frame.compiled_lineno = Math.floor(data[4]);
  }

  if (data[5]) {
    frame.compiled_colno = Math.floor(data[5]);
  }

  callback(null, frame);
}


function shouldReadFrameFile(frameFilename, callback) {
  var isValidFilename, isCached, isPending;

  isValidFilename = frameFilename[0] === '/' || frameFilename[0] === '.';
  isCached = !!cache.get(frameFilename);
  isPending = !!pendingReads[frameFilename];

  callback(isValidFilename && !isCached && !isPending);
}


function readFileLines(filename, callback) {
  try {
    fs.readFile(filename, function (err, fileData) {
      var fileLines;
      if (err) {
        return callback(err);
      }

      fileLines = fileData.toString('utf8').split('\n');
      return callback(null, fileLines);
    });
  } catch (e) {
    logger.log(e);
  }
}


/* Older versions of node do not have fs.exists so we implement our own */
function checkFileExists(filename, callback) {
  if (fs.exists !== undefined) {
    fs.exists(filename, callback);
  } else {
    fs.stat(filename, function (err) {
      callback(!err);
    });
  }
}


function gatherContexts(frames, callback) {
  var frameFilenames = [];

  frames.forEach(function (frame) {
    if (frameFilenames.indexOf(frame.filename) === -1) {
      frameFilenames.push(frame.filename);
    }
  });

  async.filter(frameFilenames, shouldReadFrameFile, function (results) {
    var tempFileCache;

    tempFileCache = {};

    function gatherFileData(filename, callback) {
      readFileLines(filename, function (err, lines) {
        if (err) {
          return callback(err);
        }

        // Cache this in a temp cache as well as the LRU cache so that
        // we know we will have all of the necessary file contents for
        // each filename in tempFileCache.
        tempFileCache[filename] = lines;
        cache.set(filename, lines);

        return callback(null);
      });
    }

    function gatherContextLines(frame, callback) {
      var lines = tempFileCache[frame.filename] || cache.get(frame.filename);

      if (lines) {
        extractContextLines(frame, lines);
      }
      callback(null);
    }

    async.filter(results, checkFileExists, function (filenames) {
      async.each(filenames, gatherFileData, function (err) {
        if (err) {
          return callback(err);
        }
        async.eachSeries(frames, gatherContextLines, function (err) {
          if (err) {
            return callback(err);
          }
          callback(null, frames);
        });
      });
    });

  });
}

/*
 * Public API
 */


exports.parseException = function (exc, callback) {
  var multipleErrs = getMultipleErrors(exc.errors);

  return exports.parseStack(exc.stack, function (err, stack) {
    var message, ret, firstErr, jadeMatch, jadeData;

    if (err) {
      logger.error('could not parse exception, err: ' + err);
      return callback(err);
    }
    message = String(exc.message) || '<no message>';
    ret = {
      class: exc.name,
      message: message,
      frames: stack
    };

    if (multipleErrs && multipleErrs.length) {
      firstErr = multipleErrs[0];
      ret = {
        class: exc.name,
        message: String(firstErr.message),
        frames: stack
      };
    }

    jadeMatch = message.match(jadeFramePattern);
    if (jadeMatch) {
      jadeData = parseJadeDebugFrame(message);
      ret.message = jadeData.message;
      ret.frames.push(jadeData.frame);
    }
    return callback(null, ret);
  });
};


exports.parseStack = function (stack, callback) {
  var lines;

  // grab all lines except the first
  lines = (stack || '').split('\n').slice(1);

  // Parse out all of the frame and filename info
  async.map(lines, parseFrameLine, function (err, frames) {
    if (err) {
      return callback(err);
    }
    frames.reverse();
    async.filter(frames, function (frame, callback) { callback(!!frame); }, function (results) {
      gatherContexts(results, callback);
    });
  });
};
});

var parser$2 = interopDefault(parser$1);
var parseStack = parser$1.parseStack;
var parseException = parser$1.parseException;
var pendingReads = parser$1.pendingReads;
var cache = parser$1.cache;

var require$$1$2 = Object.freeze({
  default: parser$2,
  parseStack: parseStack,
  parseException: parseException,
  pendingReads: pendingReads,
  cache: cache
});

var _args = [["rollbar","/Users/ocowchun/projects/nodejs/rollup101"]];
var _from = "rollbar@latest";
var _id = "rollbar@0.6.2";
var _inCache = true;
var _installable = true;
var _location = "/rollbar";
var _nodeVersion = "0.12.14";
var _npmOperationalInternal = {"host":"packages-16-east.internal.npmjs.com","tmp":"tmp/rollbar-0.6.2.tgz_1464918193838_0.7007607584819198"};
var _npmUser = {"email":"cory@ratchet.io","name":"coryvirok"};
var _npmVersion = "2.15.1";
var _phantomChildren = {};
var _requested = {"name":"rollbar","raw":"rollbar","rawSpec":"","scope":null,"spec":"latest","type":"tag"};
var _requiredBy = ["/"];
var _resolved = "https://registry.npmjs.org/rollbar/-/rollbar-0.6.2.tgz";
var _shasum = "0dc5a69225847be0cf5c3a573ba0624b68e7c083";
var _shrinkwrap = null;
var _spec = "rollbar";
var _where = "/Users/ocowchun/projects/nodejs/rollup101";
var author = {"email":"support@rollbar.com","name":"Rollbar, Inc."};
var bugs = {"url":"https://github.com/rollbar/node_rollbar/issues"};
var dependencies = {"async":"~1.2.1","debug":"2.2.0","decache":"^3.0.5","json-stringify-safe":"~5.0.0","lru-cache":"~2.2.1","node-uuid":"1.4.x"};
var description = "A standalone (Node.js) client for Rollbar";
var devDependencies = {"express":"*","jade":"~0.27.7","sinon":"1.16.1","vows":"~0.7.0"};
var directories = {};
var dist = {"shasum":"0dc5a69225847be0cf5c3a573ba0624b68e7c083","tarball":"https://registry.npmjs.org/rollbar/-/rollbar-0.6.2.tgz"};
var engines = {"node":">= 0.6.0"};
var gitHead = "32f336924ed64e02947e27d81021e42ae716256e";
var homepage = "http://rollbar.com/docs/items_node/";
var keywords = ["rollbar","exception","uncaughtException","error","ratchetio","ratchet"];
var license = "MIT";
var main = "rollbar";
var maintainers = [{"email":"brianrue@gmail.com","name":"brianr"},{"email":"cory@ratchet.io","name":"coryvirok"},{"email":"jay@rollbar.com","name":"jfarrimo"},{"email":"jon@rollbar.com","name":"jondeandres"}];
var name = "rollbar";
var optionalDependencies = {"decache":"^3.0.5"};
var readme = "ERROR: No README data found!";
var repository = {"type":"git","url":"git://github.com/rollbar/node_rollbar.git"};
var scripts = {"test":"vows --spec test/*.js","test-and-coverage":"istanbul cover -- vows --spec test/*.js"};
var version = "0.6.2";
var _package = {
	_args: _args,
	_from: _from,
	_id: _id,
	_inCache: _inCache,
	_installable: _installable,
	_location: _location,
	_nodeVersion: _nodeVersion,
	_npmOperationalInternal: _npmOperationalInternal,
	_npmUser: _npmUser,
	_npmVersion: _npmVersion,
	_phantomChildren: _phantomChildren,
	_requested: _requested,
	_requiredBy: _requiredBy,
	_resolved: _resolved,
	_shasum: _shasum,
	_shrinkwrap: _shrinkwrap,
	_spec: _spec,
	_where: _where,
	author: author,
	bugs: bugs,
	dependencies: dependencies,
	description: description,
	devDependencies: devDependencies,
	directories: directories,
	dist: dist,
	engines: engines,
	gitHead: gitHead,
	homepage: homepage,
	keywords: keywords,
	license: license,
	main: main,
	maintainers: maintainers,
	name: name,
	optionalDependencies: optionalDependencies,
	readme: readme,
	repository: repository,
	scripts: scripts,
	version: version
};

var require$$0$6 = Object.freeze({
	_args: _args,
	_from: _from,
	_id: _id,
	_inCache: _inCache,
	_installable: _installable,
	_location: _location,
	_nodeVersion: _nodeVersion,
	_npmOperationalInternal: _npmOperationalInternal,
	_npmUser: _npmUser,
	_npmVersion: _npmVersion,
	_phantomChildren: _phantomChildren,
	_requested: _requested,
	_requiredBy: _requiredBy,
	_resolved: _resolved,
	_shasum: _shasum,
	_shrinkwrap: _shrinkwrap,
	_spec: _spec,
	_where: _where,
	author: author,
	bugs: bugs,
	dependencies: dependencies,
	description: description,
	devDependencies: devDependencies,
	directories: directories,
	dist: dist,
	engines: engines,
	gitHead: gitHead,
	homepage: homepage,
	keywords: keywords,
	license: license,
	main: main,
	maintainers: maintainers,
	name: name,
	optionalDependencies: optionalDependencies,
	readme: readme,
	repository: repository,
	scripts: scripts,
	version: version,
	default: _package
});

var notifier$1 = createCommonjsModule(function (module, exports) {
/*jslint devel: true, nomen: true, plusplus: true, regexp: true, indent: 2, maxlen: 100 */

"use strict";

var logger = interopDefault(require$$4$1);
var async = interopDefault(require$$3$3);
var http = interopDefault(require$$2);
var https = interopDefault(require$$1$1);
var uuid = interopDefault(require$$4$2);
var os = interopDefault(require$$3$1);
var url = interopDefault(require$$3);

var parser = interopDefault(require$$1$2);
var packageJson = interopDefault(require$$0$6);


exports.VERSION = packageJson.version;


var SETTINGS = {
  accessToken: null,
  codeVersion: null,
  host: os.hostname(),
  environment: 'development',
  framework: 'node-js',
  root: null,  // root path to your code
  branch: null,  // git branch name
  notifier: {
    name: 'node_rollbar',
    version: exports.VERSION
  },
  scrubHeaders: ['authorization', 'www-authorization', 'http_authorization', 'omniauth.auth',
                 'cookie', 'oauth-access-token', 'x_csrf_token', 'http_x_csrf_token', 'x-csrf-token'],
  scrubFields: ['passwd', 'password', 'password_confirmation', 'secret', 'confirm_password',
                'password_confirmation', 'secret_token', 'api_key', 'access_token', 'authenticity_token',
                'oauth_token', 'token', 'user_session_secret', 'request.session.csrf',
                'request.session._csrf', 'request.params._csrf', 'request.cookie', 'request.cookies'],
  addRequestData: null,  // Can be set by the user or will default to addRequestData defined below
  minimumLevel: 'debug',
  enabled: true
};


var apiClient;
var initialized = false;


/** Internal **/


function genUuid() {
  var buf = new Buffer(16);
  uuid.v4(null, buf);
  return buf.toString('hex');
}


function buildBaseData(extra) {
  var data, props;

  extra = extra || {};
  data = {
    timestamp: Math.floor((new Date().getTime()) / 1000),
    environment: extra.environment || SETTINGS.environment,
    level: extra.level || 'error',
    language: 'javascript',
    framework: extra.framework || SETTINGS.framework,
    uuid: genUuid(),
    notifier: JSON.parse(JSON.stringify(SETTINGS.notifier))
  };

  if (SETTINGS.codeVersion) {
    data.code_version = SETTINGS.codeVersion;
  }

  props = Object.getOwnPropertyNames(extra);
  props.forEach(function (name) {
    if (!data.hasOwnProperty(name)) {
      data[name] = extra[name];
    }
  });

  data.server = {
    host: SETTINGS.host,
    argv: process.argv.concat(),
    pid: process.pid
  };

  data.server.host = SETTINGS.host;

  if (SETTINGS.branch) {
    data.server.branch = SETTINGS.branch;
  }
  if (SETTINGS.root) {
    data.server.root = SETTINGS.root;
  }

  return data;
}


function buildErrorData(baseData, err, callback) {
  var errors = [];
  var chain = [];

  do {
    errors.push(err);
  } while((err = err.nested) !== undefined);

  baseData.body.trace_chain = chain;

  var cb = function(err) {
    if(err) {
      return callback(err);
    }

    return callback(null);
  };

  async.eachSeries(errors, _buildTraceData(chain), cb);
}

function _buildTraceData(chain) {
  return function(ex, cb) {
    parser.parseException(ex, function (err, errData) {
      if (err) {
        return cb(err);
      }

      chain.push({
        frames: errData.frames,
        exception: {
          class: errData['class'],
          message: errData.message
        }
      });

      return cb();
    });
  };
};


function charFill(char, num) {
  var a, x;

  a = [];
  x = num;
  while (x > 0) {
    a[x] = '';
    x -= 1;
  }
  return a.join(char);
}


function scrubRequestHeaders(headers, settings) {
  var obj, k;

  obj = {};
  settings = settings || SETTINGS;
  for (k in headers) {
    if (headers.hasOwnProperty(k)) {
      if (settings.scrubHeaders.indexOf(k) === -1) {
        obj[k] = headers[k];
      } else {
        obj[k] = charFill('*', headers[k].length);
      }
    }
  }
  return obj;
}


function scrubRequestParams(params, settings) {
  var k;

  settings = settings || SETTINGS;
  for (k in params) {
    if (params.hasOwnProperty(k) && params[k] && settings.scrubFields.indexOf(k) >= 0) {
      params[k] = charFill('*', params[k].length);
    }
  }

  return params;
}


function extractIp(req) {
  var ip = req.ip;
  if (!ip) {
    if (req.headers) {
      ip = req.headers['x-real-ip'] || req.headers['x-forwarded-for'];
    }
    if (!ip && req.connection && req.connection.remoteAddress) {
      ip = req.connection.remoteAddress;
    }
  }
  return ip;
}


function buildRequestData(req) {
  var headers, host, proto, reqUrl, parsedUrl, data, bodyParams, k, isPlainObject, hasOwnProperty;

  headers = req.headers || {};
  host = headers.host || '<no host>';
  proto = req.protocol || ((req.socket && req.socket.encrypted) ? 'https' : 'http');
  reqUrl = proto + '://' + host + (req.url || '');
  parsedUrl = url.parse(reqUrl, true);
  data = {url: reqUrl,
    GET: parsedUrl.query,
    user_ip: extractIp(req),
    headers: scrubRequestHeaders(headers),
    method: req.method};

  if (req.body) {
    bodyParams = {};
    if (typeof req.body === 'object') {
      isPlainObject = req.body.constructor === undefined;

      for (k in req.body) {
        hasOwnProperty = typeof req.body.hasOwnProperty === 'function'
          && req.body.hasOwnProperty(k);

        if (hasOwnProperty || isPlainObject) {
          bodyParams[k] = req.body[k];
        }
      }
      data[req.method] = scrubRequestParams(bodyParams);
    } else {
      data.body = req.body;
    }
  }

  return data;
}


function addRequestData(data, req) {
  var reqData, userId;

  reqData = buildRequestData(req);
  if (reqData) {
    data.request = reqData;
  }

  if (req.route) {
    data.context = req.route.path;
  } else {
    try {
      data.context = req.app._router.matchRequest(req).path;
    } catch (ignore) {
      // ignore
    }
  }

  if (req.rollbar_person) {
    data.person = req.rollbar_person;
  } else if (req.user) {
    data.person = {id: req.user.id};
    if (req.user.username) {
      data.person.username = req.user.username;
    }
    if (req.user.email) {
      data.person.email = req.user.email;
    }
  } else if (req.user_id || req.userId) {
    userId = req.user_id || req.userId;
    if (typeof userId === 'function') {
      userId = userId();
    }
    data.person = {id: userId};
  }
}


function buildItemData(item, callback) {
  var baseData, steps;

  baseData = buildBaseData(item.payload);

  // Add the message to baseData if there is one
  function addMessageData(callback) {
    baseData.body = {};
    if (item.message !== undefined) {
      baseData.body.message = {
        body: item.message
      };
    }
    callback(null);
  }

  // Add the error trace information to baseData if there is one
  function addTraceData(callback) {
    if (item.error) {
      buildErrorData(baseData, item.error, callback);
    } else {
      callback(null);
    }
  }

  // Add the request information to baseData if there is one
  function addReqData(callback) {
    var addReqDataFn = SETTINGS.addRequestData || addRequestData;
    if (item.request) {
      addReqDataFn(baseData, item.request);
    }
    callback(null);
  }

  steps = [
    addMessageData,
    addTraceData,
    addReqData
  ];

  async.series(steps, function (err) {
    if (err) {
      return callback(err);
    }

    callback(null, baseData);
  });

}


// Is the error level of a given item greater than or equal to the configured
// minimum level?
function levelGteMinimum(item) {
  var levels, messageLevel, payload, i, length;

  levels = [
    'critical',
    'error',
    'warning',
    'info',
    'debug'
  ];
  payload = item.payload || {};
  messageLevel = payload.level === undefined ? 'error' : payload.level;

  for (i = 0, length = levels.length; i < length; i++) {
    if (levels[i] === messageLevel) {
      return true;
    }
    if (levels[i] === SETTINGS.minimumLevel) {
      return false;
    }
  }

  // At this point the minimum level was never reached and the message level
  // wasn't a known one; something is wrong
  logger.error('minimumLevel of "%s" is unknown; '
      + 'meanwhile, message level of "%s" is unknown',
      SETTINGS.minimumLevel, messageLevel);

  // Allow the message to be sent anyway
  return true;
}


function addItem(item, callback) {
  if (typeof callback !== 'function') {
    callback = function dummyCallback() { return; };
  }

  if (!initialized) {
    var message = 'Rollbar is not initialized';
    logger.error(message);
    return callback(new Error(message));
  }

  if (!SETTINGS.enabled){
    logger.log('Rollbar is disabled');
    // reporting is disabled, so it's not an error
    // let's pretend everything is fine
    return callback();
  }

  if (!levelGteMinimum(item)) {
    logger.log('Item has insufficient level');
    callback();
    return;
  }

  try {
    buildItemData(item, function (err, data) {
      if (err) {
        return callback(err);
      }

      try {
        apiClient.postItem(data, function (err, resp) {
          callback(err, data, resp);
        });
      } catch (e) {
        logger.error('Internal error while posting item: ' + e);
        callback(e);
      }
    });
  } catch (e) {
    logger.error('Internal error while building payload: ' + e);
    callback(e);
  }
}


/*
 * Exports for testing
 */


exports._scrubRequestHeaders = function (headersToScrub, headers) {
  return scrubRequestHeaders(headers, headersToScrub ? {scrubHeaders: headersToScrub} : undefined);
};


exports._scrubRequestParams = function (paramsToScrub, params) {
  return scrubRequestParams(params, paramsToScrub ? {scrubFields: paramsToScrub} : undefined);
};


exports._extractIp = function (req) {
  return extractIp(req);
};


exports._levelGteMinimum = function (item) {
  return levelGteMinimum(item);
};


/*
 * Public API
 */

exports.init = function (api, options) {
  var opt;

  SETTINGS.accessToken = api.accessToken;

  apiClient = api;
  options = options || {};

  for (opt in options) {
    if (options.hasOwnProperty(opt)) {
      SETTINGS[opt] = options[opt];
    }
  }
  initialized = true;
};


exports.handleError = function (err, req, callback) {
  if (typeof req === 'function') {
    callback = req;
    req = null;
  }
  if (err instanceof Error) {
    return exports.handleErrorWithPayloadData(err, {}, req, callback);
  }
  return exports.reportMessage(JSON.stringify(err), 'error', req, callback);
};


exports.handleErrorWithPayloadData = function (err, payloadData, req, callback) {
  // Allow the user to call with an optional request and callback
  // e.g. handleErrorWithPayloadData(err, payloadData, req, callback)
  //   or handleErrorWithPayloadData(err, payloadData, callback)
  //   or handleErrorPayloadData(err, payloadData)
  if (typeof req === 'function') {
    callback = req;
    req = null;
  }

  if (!(err instanceof Error)) {
    if (typeof callback === 'function') {
      return callback(new Error('handleError was passed something other than an Error: ' + err));
    }
  }
  addItem({error: err, payload: payloadData, request: req}, callback);
};


exports.reportMessage = function (message, level, req, callback) {
  return exports.reportMessageWithPayloadData(message, {level: level}, req, callback);
};


exports.reportMessageWithPayloadData = function (message, payloadData, req, callback) {
  addItem({message: message, payload: payloadData, request: req}, callback);
};
});

var notifier$2 = interopDefault(notifier$1);
var reportMessageWithPayloadData$1 = notifier$1.reportMessageWithPayloadData;
var reportMessage$1 = notifier$1.reportMessage;
var handleErrorWithPayloadData$1 = notifier$1.handleErrorWithPayloadData;
var handleError$1 = notifier$1.handleError;
var init$2 = notifier$1.init;
var _levelGteMinimum = notifier$1._levelGteMinimum;
var _extractIp = notifier$1._extractIp;
var _scrubRequestParams = notifier$1._scrubRequestParams;
var _scrubRequestHeaders = notifier$1._scrubRequestHeaders;
var VERSION$1 = notifier$1.VERSION;

var require$$2$2 = Object.freeze({
  default: notifier$2,
  reportMessageWithPayloadData: reportMessageWithPayloadData$1,
  reportMessage: reportMessage$1,
  handleErrorWithPayloadData: handleErrorWithPayloadData$1,
  handleError: handleError$1,
  init: init$2,
  _levelGteMinimum: _levelGteMinimum,
  _extractIp: _extractIp,
  _scrubRequestParams: _scrubRequestParams,
  _scrubRequestHeaders: _scrubRequestHeaders,
  VERSION: VERSION$1
});

var error = createCommonjsModule(function (module) {
var util = interopDefault(require$$0);


function RollbarError(message, nested)
{
  Error.call(this);
  Error.captureStackTrace(this, this.constructor);

  this.message = message;
  this.nested = nested;
  this.name = this.constructor.name;
}

util.inherits(RollbarError, Error);

module.exports = RollbarError;
});

var error$1 = interopDefault(error);


var require$$0$7 = Object.freeze({
  default: error$1
});

var rollbar = createCommonjsModule(function (module, exports) {
/*jslint devel: true, nomen: true, indent: 2, maxlen: 100 */

"use strict";

var logger = interopDefault(require$$4$1);
var api = interopDefault(require$$3$2);
var notifier = interopDefault(require$$2$2);
var parser = interopDefault(require$$1$2);
var RollbarError = interopDefault(require$$0$7);

var initialized = false;

/**
 *
 * Rollbar:
 *
 *  Handle caught and uncaught exceptions, and report messages back to rollbar.
 *
 *  This library requires an account at http://rollbar.com/.
 *
 * Example usage:
 *
 *  Express -
 *
 *     var express = require('express');
 *     var rollbar = require('rollbar');
 *
 *     var app = express();
 *
 *     app.get('/', function (req, res) {
 *       ...
 *     });
 *
 *     // Use the rollbar error handler to send exceptions to your rollbar account
 *     app.use(rollbar.errorHandler('ROLLBAR_ACCESS_TOKEN'));
 *
 *     app.listen(6943);
 *
 *  Standalone -
 *
 *     var rollbar = require('rollbar');
 *     rollbar.init('ROLLBAR_ACCESS_TOKEN');
 *     rollbar.reportMessage('Hello world', 'debug');
 *
 *  Uncaught exceptions -
 *
 *     var rollbar = require('rollbar');
 *     rollbar.handleUncaughtExceptions('ROLLBAR_ACCESS_TOKEN');
 *
 *  Send exceptions and request data -
 *
 *     app.get('/', function (req, res) {
 *       try {
 *         ...
 *       } catch (e) {
 *         rollbar.handleError(e, req);
 *       }
 *     });
 *
 *  Track people -
 *
 *     app.get('/', function (req, res) {
 *       req.userId = 12345; // or req.user_id
 *       rollbar.reportMessage('Interesting event', req);
 *     });
 */

exports.init = function (accessToken, options) {
  /*
   * Initialize the rollbar library.
   *
   * For more information on each option, see http://rollbar.com/docs/api_items/
   *
   * Supported options, (all optional):
   *
   *  host - Default: os.hostname() - the hostname of the server the node.js process is running on
   *  environment - Default: 'unspecified' - the environment the code is running in. e.g. 'staging'
   *  endpoint - Default: 'https://api.rollbar.com/api/1/' - the url to send items to
   *  root - the path to your code, (not including any trailing slash) which will be used to link
   *    source files on rollbar
   *  branch - the branch in your version control system for this code
   *  codeVersion - the version or revision of your code
   *  enabled - Default: true - determines if errors gets reported to Rollbar
   *
   */
  if (!initialized) {
    options = options || {};
    if (!accessToken && options.enabled !== false) {
      logger.error('Missing access_token.');
      return;
    }

    options.environment = options.environment || process.env.NODE_ENV || 'unspecified';

    api.init(accessToken, options);
    notifier.init(api, options);
    initialized = true;
  }
};


/*
 * reportMessage(message, level, request, callback)
 *
 * Sends a message to rollbar with optional level, request and callback.
 * The callback should take a single parameter to indicate if there was an
 * error.
 *
 * Parameters:
 *  message - a string to send to rollbar
 *  level - Default: 'error' - optional level, 'debug', 'info', 'warning', 'error', 'critical'
 *  request - optional request object to send along with the message
 *  callback - optional callback that will be invoked once the message was reported.
 *    callback should take 3 parameters: callback(err, payloadData, response)
 *
 * Examples:
 *
 *  rollbar.reportMessage("User purchased something awesome!", "info");
 *
 *  rollbar.reportMessage("Something suspicious...", "debug", null, function (err, payloadData) {
 *    if (err) {
 *      console.error('Error sending to Rollbar:', err);
 *    } else {
 *      console.log('Reported message to rollbar:');
 *      console.log(payloadData);
 *    }
 *  });
 *
 */
exports.reportMessage = notifier.reportMessage;


/*
 * reportMessageWithPayloadData(message, payloadData, request, callback)
 *
 * The same as reportMessage() but allows you to specify extra data along with the message.
 *
 * Parameters:
 *  message - a string to send to rollbar
 *  payloadData - an object containing key/values to be sent along with the message.
 *    e.g. {level: "warning", fingerprint: "CustomerFingerPrint"}
 *  request - optional request object to send along with the message
 *  callback - optional callback that will be invoked once the message has been sent to Rollbar.
 *    callback should take 3 parameters: callback(err, payloadData, response)
 *
 * Examples:
 *
 *  rollbar.reportMessageWithPayloadData("Memcache miss",
 *    {level: "debug", fingerprint: "Memcache-miss"}, null, function (err) {
 *    // message was queued/sent to rollbar
 *  });
 *
 */
exports.reportMessageWithPayloadData = notifier.reportMessageWithPayloadData;

/*
 * handleError(err, request, callback)
 *
 * Send a details about the error to rollbar along with optional request information.
 *
 * Parameters:
 *  err - an Exception/Error instance
 *  request - an optional request object to send along with the error
 *  callback - optional callback that will be invoked after the error was sent to Rollbar.
 *    callback should take 3 parameters: callback(err, payloadData, response)
 *
 * Examples:
 *
 *  rollbar.handleError(new Error("Could not connect to the database"));
 *
 *  rollbar.handleError(new Error("it's just foobar..."), function (err) {
 *    // error was queued/sent to rollbar
 *  });
 *
 *  rollbar.handleError(new Error("invalid request!"), req);
 *
 */
exports.handleError = notifier.handleError;

/*
 * handleErrorWithPayloadData(err, payloadData, request, callback)
 *
 * The same as handleError() but allows you to specify additional data to log along with the error,
 * as well as other payload options.
 *
 * Parameters:
 *  err - an Exception/Error instance
 *  payloadData - an object containing keys/values to be sent along with the error report.
 *    e.g. {level: "warning"}
 *  request - optional request object to send along with the message
 *  callback - optional callback that will be invoked after the error was sent to Rollbar.
 *    callback should take 3 parameters: callback(err, payloadData, response)
 *
 *  Examples:
 *
 *   rollbar.handleError(new Error("Could not connect to database"), {level: "warning"});
 *   rollbar.handleError(new Error("Could not connect to database"),
 *    {custom: {someKey: "its value, otherKey: ["other", "value"]}});
 *   rollbar.handleError(new Error("error message"), {}, req, function (err) {
 *     // error was queued/sent to rollbar
 *   });
 */
exports.handleErrorWithPayloadData = notifier.handleErrorWithPayloadData;


exports.errorHandler = function (accessToken, options) {
  /*
   * A middleware handler for connect and express.js apps. For a list
   * of supported options, see the init() docs above.
   *
   * All exceptions thrown from inside an express or connect get/post/etc... handler
   * will be sent to rollbar when this middleware is installed.
   */
  exports.init(accessToken, options);
  return function (err, req, res, next) {
    var cb = function (rollbarErr) {
      if (rollbarErr) {
        logger.error('Error reporting to rollbar, ignoring: ' + rollbarErr);
      }
      return next(err, req, res);
    };

    if (!err) {
      return next(err, req, res);
    }

    if (err instanceof Error$1) {
      return notifier.handleError(err, req, cb);
    }

    return notifier.reportMessage('Error: ' + err, 'error', req, cb);
  };
};

exports.handleUncaughtExceptionsAndRejections = function (accessToken, options) {
  exports.handleUncaughtExceptions(accessToken, options);
  exports.handleUnhandledRejections(accessToken, options);
};

exports.handleUncaughtExceptions = function (accessToken, options) {
  /*
   * Registers a handler for the process.uncaughtException event
   *
   * If options.exitOnUncaughtException is set to true, the notifier will
   * immediately send the uncaught exception + all queued items to rollbar,
   * then call process.exit(1).
   *
   * Note: The node.js authors advise against using these type of handlers.
   * More info: http://nodejs.org/api/process.html#process_event_uncaughtexception
   *
   */

  // Default to not exiting on uncaught exceptions unless options.exitOnUncaughtException is set.
  options = options || {};
  var exitOnUncaught = options.exitOnUncaughtException === undefined ?
        false : !!options.exitOnUncaughtException;
  delete options.exitOnUncaughtException;

  exports.init(accessToken, options);

  if (initialized) {
    process.on('uncaughtException', function (err) {
      logger.error('Handling uncaught exception.');
      logger.error(err);

      notifier.handleError(err, function (err) {
        if (err) {
          logger.error('Encountered an error while handling an uncaught exception.');
          logger.error(err);
        }

        if (exitOnUncaught) {
          process.exit(1);
        }
      });
    });
  } else {
    logger.error('Rollbar is not initialized. Uncaught exceptions will not be tracked.');
  }
};

exports.handleUnhandledRejections = function (accessToken, options) {
  /*
   * Registers a handler for the process.unhandledRejection event.
   */

  options = options || {};

  exports.init(accessToken, options);

  if (initialized) {
    process.on('unhandledRejection', function (reason) {
      logger.error('Handling unhandled rejection.');
      logger.error(reason);

      notifier.handleError(reason, function (err) {
        if (err) {
          logger.error('Encountered an error while handling an unhandled rejection.');
          logger.error(err);
        }
      })
    });
  } else {
    logger.error('Rollbar is not initialized. Uncaught rejections will not be tracked.');
  }
};



exports.api = api;
exports.notifier = notifier;
exports.parser = parser;
exports.Error = RollbarError;
});

var rollbar$1 = interopDefault(rollbar);
var Error$1 = rollbar.Error;

console.log(rollbar$1);