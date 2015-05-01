"use strict";

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

exports.__esModule = true;

var ListenerExpression = (function () {
  function ListenerExpression(eventManager, targetEvent, sourceExpression, delegate, preventDefault) {
    _classCallCheck(this, ListenerExpression);

    this.eventManager = eventManager;
    this.targetEvent = targetEvent;
    this.sourceExpression = sourceExpression;
    this.delegate = delegate;
    this.discrete = true;
    this.preventDefault = preventDefault;
  }

  ListenerExpression.prototype.createBinding = function createBinding(target) {
    return new Listener(this.eventManager, this.targetEvent, this.delegate, this.sourceExpression, target, this.preventDefault);
  };

  return ListenerExpression;
})();

exports.ListenerExpression = ListenerExpression;

var Listener = (function () {
  function Listener(eventManager, targetEvent, delegate, sourceExpression, target, preventDefault) {
    _classCallCheck(this, Listener);

    this.eventManager = eventManager;
    this.targetEvent = targetEvent;
    this.delegate = delegate;
    this.sourceExpression = sourceExpression;
    this.target = target;
    this.preventDefault = preventDefault;
  }

  Listener.prototype.bind = function bind(source) {
    var _this = this;

    if (this._disposeListener) {
      if (this.source === source) {
        return;
      }

      this.unbind();
    }

    this.source = source;
    this._disposeListener = this.eventManager.addEventListener(this.target, this.targetEvent, function (event) {
      var prevEvent = source.$event;
      source.$event = event;
      var result = _this.sourceExpression.evaluate(source);
      source.$event = prevEvent;
      if (result !== true && _this.preventDefault) {
        event.preventDefault();
      }
      return result;
    }, this.delegate);
  };

  Listener.prototype.unbind = function unbind() {
    if (this._disposeListener) {
      this._disposeListener();
      this._disposeListener = null;
    }
  };

  return Listener;
})();