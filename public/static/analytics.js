// Segment Analytics Implementation
(function() {
  // Initialize analytics global
  window.analytics = window.analytics || [];
  
  // If already initialized, skip
  if (window.analytics.initialize) return;
  
  // Mark as invoked
  window.analytics.invoked = true;
  
  // Define methods
  window.analytics.methods = [
    'trackSubmit', 'trackClick', 'trackLink', 'trackForm', 'pageview',
    'identify', 'reset', 'group', 'track', 'ready', 'alias', 'debug',
    'page', 'screen', 'once', 'off', 'on'
  ];
  
  // Factory function
  window.analytics.factory = function(method) {
    return function() {
      var args = Array.prototype.slice.call(arguments);
      args.unshift(method);
      window.analytics.push(args);
      return window.analytics;
    };
  };
  
  // Create methods
  for (var i = 0; i < window.analytics.methods.length; i++) {
    var method = window.analytics.methods[i];
    window.analytics[method] = window.analytics.factory(method);
  }
  
  // Load function
  window.analytics.load = function(writeKey, options) {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = 'https://cdn.segment.com/analytics.js/v1/' + writeKey + '/analytics.min.js';
    var firstScript = document.getElementsByTagName('script')[0];
    firstScript.parentNode.insertBefore(script, firstScript);
    window.analytics._loadOptions = options;
  };
  
  // Load and initialize
  window.analytics.SNIPPET_VERSION = '4.13.2';
  window.analytics.load('gjA4ViwEJm6Vo4JNL0Gm122FvKKbO3Bp');
  window.analytics.page();
  
  console.log('Segment Analytics initialized successfully');
})();