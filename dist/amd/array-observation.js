define(['exports', './environment', './array-change-records', './collection-observation'], function (exports, _environment, _arrayChangeRecords, _collectionObservation) {
  'use strict';

  var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

  var _inherits = function (subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

  exports.__esModule = true;
  exports.getArrayObserver = getArrayObserver;

  var arrayProto = Array.prototype;

  function getArrayObserver(taskQueue, array) {
    if (_environment.hasArrayObserve) {
      return new ArrayObserveObserver(array);
    } else {
      return ModifyArrayObserver.create(taskQueue, array);
    }
  }

  var ModifyArrayObserver = (function (_ModifyCollectionObserver) {
    function ModifyArrayObserver(taskQueue, array) {
      _classCallCheck(this, ModifyArrayObserver);

      _ModifyCollectionObserver.call(this, taskQueue, array);
    }

    _inherits(ModifyArrayObserver, _ModifyCollectionObserver);

    ModifyArrayObserver.create = function create(taskQueue, array) {
      var observer = new ModifyArrayObserver(taskQueue, array);

      array.pop = function () {
        var methodCallResult = arrayProto.pop.apply(array, arguments);
        observer.addChangeRecord({
          type: 'delete',
          object: array,
          name: array.length,
          oldValue: methodCallResult
        });
        return methodCallResult;
      };

      array.push = function () {
        var methodCallResult = arrayProto.push.apply(array, arguments);
        observer.addChangeRecord({
          type: 'splice',
          object: array,
          index: array.length - arguments.length,
          removed: [],
          addedCount: arguments.length
        });
        return methodCallResult;
      };

      array.reverse = function () {
        var oldArray = array.slice();
        var methodCallResult = arrayProto.reverse.apply(array, arguments);
        observer.reset(oldArray);
        return methodCallResult;
      };

      array.shift = function () {
        var methodCallResult = arrayProto.shift.apply(array, arguments);
        observer.addChangeRecord({
          type: 'delete',
          object: array,
          name: 0,
          oldValue: methodCallResult
        });
        return methodCallResult;
      };

      array.sort = function () {
        var oldArray = array.slice();
        var methodCallResult = arrayProto.sort.apply(array, arguments);
        observer.reset(oldArray);
        return methodCallResult;
      };

      array.splice = function () {
        var methodCallResult = arrayProto.splice.apply(array, arguments);
        observer.addChangeRecord({
          type: 'splice',
          object: array,
          index: arguments[0],
          removed: methodCallResult,
          addedCount: arguments.length > 2 ? arguments.length - 2 : 0
        });
        return methodCallResult;
      };

      array.unshift = function () {
        var methodCallResult = arrayProto.unshift.apply(array, arguments);
        observer.addChangeRecord({
          type: 'splice',
          object: array,
          index: 0,
          removed: [],
          addedCount: arguments.length
        });
        return methodCallResult;
      };

      return observer;
    };

    return ModifyArrayObserver;
  })(_collectionObservation.ModifyCollectionObserver);

  var ArrayObserveObserver = (function () {
    function ArrayObserveObserver(array) {
      _classCallCheck(this, ArrayObserveObserver);

      this.array = array;
      this.callbacks = [];
      this.observing = false;
    }

    ArrayObserveObserver.prototype.subscribe = function subscribe(callback) {
      var _this = this;

      var callbacks = this.callbacks;

      callbacks.push(callback);

      if (!this.observing) {
        this.observing = true;
        Array.observe(this.array, function (changes) {
          return _this.handleChanges(changes);
        });
      }

      return function () {
        callbacks.splice(callbacks.indexOf(callback), 1);
      };
    };

    ArrayObserveObserver.prototype.getLengthObserver = function getLengthObserver() {
      return this.lengthObserver || (this.lengthObserver = new _collectionObservation.CollectionLengthObserver(this.array));
    };

    ArrayObserveObserver.prototype.handleChanges = function handleChanges(changeRecords) {
      var callbacks = this.callbacks,
          i = callbacks.length,
          splices;

      if (i) {
        splices = _arrayChangeRecords.projectArraySplices(this.array, changeRecords);

        while (i--) {
          callbacks[i](splices);
        }
      }

      if (this.lengthObserver) {
        this.lengthObserver.call(this.array.length);
      }
    };

    return ArrayObserveObserver;
  })();
});