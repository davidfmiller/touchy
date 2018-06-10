




/* jshint undef: true,strict:true,trailing:true,loopfunc:true */
/* global document,window,Element,module */

(() => {
  'use strict';

  const

  RMR = require('rmr-util'),

  /**
   *
   * @param {Object} options -
   *  node (optional) -
   *  threshold (optional) - if provided,
   */
  Swipe = function(options) {

    const
    node = options.hasOwnProperty('node') ? RMR.Node.get(options.node) : document.body,
    self = this;

    if (! options.hasOwnProperty('threshold')) {
      options.continuous = true;
    }
    if (! node) {
      throw new Error('Invalid touchy node', options.node);
    }

    this.events = {
      start: function() { },
      move: function() { },
      end: function() { },
      cancel: function() { }
    };
    this.origin = null;

    node.addEventListener('touchstart', function(e) {

//      console.log('start', e.touches);

      self.origin = [e.touches[0].clientX, e.touches[0].clientY];
      self.events.start();
    });

    node.addEventListener('touchmove', function(e) {

      if (! self.origin) {
        return;
      }

      if (e.touches.length > 1) {
        self.origin = null;
        self.events.end();
        return;
      }
//      console.log('move', e.touches);

      e.preventDefault();

      const
      point = [e.touches[0].clientX, e.touches[0].clientY],
      delta = [point[0] - self.origin[0], point[1] - self.origin[1]];

      if (options.hasOwnProperty('continuous') && options.continuous) {
        self.events.move(delta);
      } else {

        let x = false, y = false;

        if (options.threshold[0] > 0 && Math.abs(delta[0]) >= Math.abs(options.threshold[0])) {
          x = true;
        }
        if (options.threshold[1] > 0 && Math.abs(delta[1]) >= Math.abs(options.threshold[1])) {
          y = true;
        }

        if (x || y) {
          self.events.move([x ? delta[0] : 0, y ? delta[1] : 0]);
          self.origin = null;
        }
      }
    }, { passive: false });

    node.addEventListener('touchend', function(/* e */) {
      self.origin = null;
      self.events.end();
    });
  };

  /**
   *
   * @param {String} name - 'start', 'move', or 'end'
   * @param {Function} method - invoked on appropriate event
   * @return {Object} - chainable
   */
  Swipe.prototype.on = function(name, method) {
    this.events[name] = method;
    return this;
  };


  /**
   * End tracking the current swipe event
   *
   * @return {Object} - chainable
   */
  Swipe.prototype.cancel = function() {
    this.origin = null;
    this.events.cancel();
    return this;
  };

  module.exports = {
    Swipe: Swipe
  };

})();
