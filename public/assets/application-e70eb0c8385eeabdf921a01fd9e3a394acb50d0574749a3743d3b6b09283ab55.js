/*
Unobtrusive JavaScript
https://github.com/rails/rails/blob/master/actionview/app/assets/javascripts
Released under the MIT license
 */


;

(function() {
  (function() {
    (function() {
      this.Rails = {
        linkClickSelector: 'a[data-confirm], a[data-method], a[data-remote]:not([disabled]), a[data-disable-with], a[data-disable]',
        buttonClickSelector: {
          selector: 'button[data-remote]:not([form]), button[data-confirm]:not([form])',
          exclude: 'form button'
        },
        inputChangeSelector: 'select[data-remote], input[data-remote], textarea[data-remote]',
        formSubmitSelector: 'form',
        formInputClickSelector: 'form input[type=submit], form input[type=image], form button[type=submit], form button:not([type]), input[type=submit][form], input[type=image][form], button[type=submit][form], button[form]:not([type])',
        formDisableSelector: 'input[data-disable-with]:enabled, button[data-disable-with]:enabled, textarea[data-disable-with]:enabled, input[data-disable]:enabled, button[data-disable]:enabled, textarea[data-disable]:enabled',
        formEnableSelector: 'input[data-disable-with]:disabled, button[data-disable-with]:disabled, textarea[data-disable-with]:disabled, input[data-disable]:disabled, button[data-disable]:disabled, textarea[data-disable]:disabled',
        fileInputSelector: 'input[name][type=file]:not([disabled])',
        linkDisableSelector: 'a[data-disable-with], a[data-disable]',
        buttonDisableSelector: 'button[data-remote][data-disable-with], button[data-remote][data-disable]'
      };

    }).call(this);
  }).call(this);

  var Rails = this.Rails;

  (function() {
    (function() {
      var expando, m;

      m = Element.prototype.matches || Element.prototype.matchesSelector || Element.prototype.mozMatchesSelector || Element.prototype.msMatchesSelector || Element.prototype.oMatchesSelector || Element.prototype.webkitMatchesSelector;

      Rails.matches = function(element, selector) {
        if (selector.exclude != null) {
          return m.call(element, selector.selector) && !m.call(element, selector.exclude);
        } else {
          return m.call(element, selector);
        }
      };

      expando = '_ujsData';

      Rails.getData = function(element, key) {
        var ref;
        return (ref = element[expando]) != null ? ref[key] : void 0;
      };

      Rails.setData = function(element, key, value) {
        if (element[expando] == null) {
          element[expando] = {};
        }
        return element[expando][key] = value;
      };

      Rails.$ = function(selector) {
        return Array.prototype.slice.call(document.querySelectorAll(selector));
      };

    }).call(this);
    (function() {
      var $, csrfParam, csrfToken;

      $ = Rails.$;

      csrfToken = Rails.csrfToken = function() {
        var meta;
        meta = document.querySelector('meta[name=csrf-token]');
        return meta && meta.content;
      };

      csrfParam = Rails.csrfParam = function() {
        var meta;
        meta = document.querySelector('meta[name=csrf-param]');
        return meta && meta.content;
      };

      Rails.CSRFProtection = function(xhr) {
        var token;
        token = csrfToken();
        if (token != null) {
          return xhr.setRequestHeader('X-CSRF-Token', token);
        }
      };

      Rails.refreshCSRFTokens = function() {
        var param, token;
        token = csrfToken();
        param = csrfParam();
        if ((token != null) && (param != null)) {
          return $('form input[name="' + param + '"]').forEach(function(input) {
            return input.value = token;
          });
        }
      };

    }).call(this);
    (function() {
      var CustomEvent, fire, matches;

      matches = Rails.matches;

      CustomEvent = window.CustomEvent;

      if (typeof CustomEvent !== 'function') {
        CustomEvent = function(event, params) {
          var evt;
          evt = document.createEvent('CustomEvent');
          evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
          return evt;
        };
        CustomEvent.prototype = window.Event.prototype;
      }

      fire = Rails.fire = function(obj, name, data) {
        var event;
        event = new CustomEvent(name, {
          bubbles: true,
          cancelable: true,
          detail: data
        });
        obj.dispatchEvent(event);
        return !event.defaultPrevented;
      };

      Rails.stopEverything = function(e) {
        fire(e.target, 'ujs:everythingStopped');
        e.preventDefault();
        e.stopPropagation();
        return e.stopImmediatePropagation();
      };

      Rails.delegate = function(element, selector, eventType, handler) {
        return element.addEventListener(eventType, function(e) {
          var target;
          target = e.target;
          while (!(!(target instanceof Element) || matches(target, selector))) {
            target = target.parentNode;
          }
          if (target instanceof Element && handler.call(target, e) === false) {
            e.preventDefault();
            return e.stopPropagation();
          }
        });
      };

    }).call(this);
    (function() {
      var AcceptHeaders, CSRFProtection, createXHR, fire, prepareOptions, processResponse;

      CSRFProtection = Rails.CSRFProtection, fire = Rails.fire;

      AcceptHeaders = {
        '*': '*/*',
        text: 'text/plain',
        html: 'text/html',
        xml: 'application/xml, text/xml',
        json: 'application/json, text/javascript',
        script: 'text/javascript, application/javascript, application/ecmascript, application/x-ecmascript'
      };

      Rails.ajax = function(options) {
        var xhr;
        options = prepareOptions(options);
        xhr = createXHR(options, function() {
          var response;
          response = processResponse(xhr.response, xhr.getResponseHeader('Content-Type'));
          if (Math.floor(xhr.status / 100) === 2) {
            if (typeof options.success === "function") {
              options.success(response, xhr.statusText, xhr);
            }
          } else {
            if (typeof options.error === "function") {
              options.error(response, xhr.statusText, xhr);
            }
          }
          return typeof options.complete === "function" ? options.complete(xhr, xhr.statusText) : void 0;
        });
        if (typeof options.beforeSend === "function") {
          options.beforeSend(xhr, options);
        }
        if (xhr.readyState === XMLHttpRequest.OPENED) {
          return xhr.send(options.data);
        } else {
          return fire(document, 'ajaxStop');
        }
      };

      prepareOptions = function(options) {
        options.url = options.url || location.href;
        options.type = options.type.toUpperCase();
        if (options.type === 'GET' && options.data) {
          if (options.url.indexOf('?') < 0) {
            options.url += '?' + options.data;
          } else {
            options.url += '&' + options.data;
          }
        }
        if (AcceptHeaders[options.dataType] == null) {
          options.dataType = '*';
        }
        options.accept = AcceptHeaders[options.dataType];
        if (options.dataType !== '*') {
          options.accept += ', */*; q=0.01';
        }
        return options;
      };

      createXHR = function(options, done) {
        var xhr;
        xhr = new XMLHttpRequest();
        xhr.open(options.type, options.url, true);
        xhr.setRequestHeader('Accept', options.accept);
        if (typeof options.data === 'string') {
          xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
        }
        if (!options.crossDomain) {
          xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        }
        CSRFProtection(xhr);
        xhr.withCredentials = !!options.withCredentials;
        xhr.onreadystatechange = function() {
          if (xhr.readyState === XMLHttpRequest.DONE) {
            return done(xhr);
          }
        };
        return xhr;
      };

      processResponse = function(response, type) {
        var parser, script;
        if (typeof response === 'string' && typeof type === 'string') {
          if (type.match(/\bjson\b/)) {
            try {
              response = JSON.parse(response);
            } catch (error) {}
          } else if (type.match(/\b(?:java|ecma)script\b/)) {
            script = document.createElement('script');
            script.text = response;
            document.head.appendChild(script).parentNode.removeChild(script);
          } else if (type.match(/\b(xml|html|svg)\b/)) {
            parser = new DOMParser();
            type = type.replace(/;.+/, '');
            try {
              response = parser.parseFromString(response, type);
            } catch (error) {}
          }
        }
        return response;
      };

      Rails.href = function(element) {
        return element.href;
      };

      Rails.isCrossDomain = function(url) {
        var e, originAnchor, urlAnchor;
        originAnchor = document.createElement('a');
        originAnchor.href = location.href;
        urlAnchor = document.createElement('a');
        try {
          urlAnchor.href = url;
          return !(((!urlAnchor.protocol || urlAnchor.protocol === ':') && !urlAnchor.host) || (originAnchor.protocol + '//' + originAnchor.host === urlAnchor.protocol + '//' + urlAnchor.host));
        } catch (error) {
          e = error;
          return true;
        }
      };

    }).call(this);
    (function() {
      var matches, toArray;

      matches = Rails.matches;

      toArray = function(e) {
        return Array.prototype.slice.call(e);
      };

      Rails.serializeElement = function(element, additionalParam) {
        var inputs, params;
        inputs = [element];
        if (matches(element, 'form')) {
          inputs = toArray(element.elements);
        }
        params = [];
        inputs.forEach(function(input) {
          if (!input.name) {
            return;
          }
          if (matches(input, 'select')) {
            return toArray(input.options).forEach(function(option) {
              if (option.selected) {
                return params.push({
                  name: input.name,
                  value: option.value
                });
              }
            });
          } else if (input.checked || ['radio', 'checkbox', 'submit'].indexOf(input.type) === -1) {
            return params.push({
              name: input.name,
              value: input.value
            });
          }
        });
        if (additionalParam) {
          params.push(additionalParam);
        }
        return params.map(function(param) {
          if (param.name != null) {
            return (encodeURIComponent(param.name)) + "=" + (encodeURIComponent(param.value));
          } else {
            return param;
          }
        }).join('&');
      };

      Rails.formElements = function(form, selector) {
        if (matches(form, 'form')) {
          return toArray(form.elements).filter(function(el) {
            return matches(el, selector);
          });
        } else {
          return toArray(form.querySelectorAll(selector));
        }
      };

    }).call(this);
    (function() {
      var allowAction, fire, stopEverything;

      fire = Rails.fire, stopEverything = Rails.stopEverything;

      Rails.handleConfirm = function(e) {
        if (!allowAction(this)) {
          return stopEverything(e);
        }
      };

      allowAction = function(element) {
        var answer, callback, message;
        message = element.getAttribute('data-confirm');
        if (!message) {
          return true;
        }
        answer = false;
        if (fire(element, 'confirm')) {
          try {
            answer = confirm(message);
          } catch (error) {}
          callback = fire(element, 'confirm:complete', [answer]);
        }
        return answer && callback;
      };

    }).call(this);
    (function() {
      var disableFormElement, disableFormElements, disableLinkElement, enableFormElement, enableFormElements, enableLinkElement, formElements, getData, matches, setData, stopEverything;

      matches = Rails.matches, getData = Rails.getData, setData = Rails.setData, stopEverything = Rails.stopEverything, formElements = Rails.formElements;

      Rails.handleDisabledElement = function(e) {
        var element;
        element = this;
        if (element.disabled) {
          return stopEverything(e);
        }
      };

      Rails.enableElement = function(e) {
        var element;
        element = e instanceof Event ? e.target : e;
        if (matches(element, Rails.linkDisableSelector)) {
          return enableLinkElement(element);
        } else if (matches(element, Rails.buttonDisableSelector) || matches(element, Rails.formEnableSelector)) {
          return enableFormElement(element);
        } else if (matches(element, Rails.formSubmitSelector)) {
          return enableFormElements(element);
        }
      };

      Rails.disableElement = function(e) {
        var element;
        element = e instanceof Event ? e.target : e;
        if (matches(element, Rails.linkDisableSelector)) {
          return disableLinkElement(element);
        } else if (matches(element, Rails.buttonDisableSelector) || matches(element, Rails.formDisableSelector)) {
          return disableFormElement(element);
        } else if (matches(element, Rails.formSubmitSelector)) {
          return disableFormElements(element);
        }
      };

      disableLinkElement = function(element) {
        var replacement;
        replacement = element.getAttribute('data-disable-with');
        if (replacement != null) {
          setData(element, 'ujs:enable-with', element.innerHTML);
          element.innerHTML = replacement;
        }
        element.addEventListener('click', stopEverything);
        return setData(element, 'ujs:disabled', true);
      };

      enableLinkElement = function(element) {
        var originalText;
        originalText = getData(element, 'ujs:enable-with');
        if (originalText != null) {
          element.innerHTML = originalText;
          setData(element, 'ujs:enable-with', null);
        }
        element.removeEventListener('click', stopEverything);
        return setData(element, 'ujs:disabled', null);
      };

      disableFormElements = function(form) {
        return formElements(form, Rails.formDisableSelector).forEach(disableFormElement);
      };

      disableFormElement = function(element) {
        var replacement;
        replacement = element.getAttribute('data-disable-with');
        if (replacement != null) {
          if (matches(element, 'button')) {
            setData(element, 'ujs:enable-with', element.innerHTML);
            element.innerHTML = replacement;
          } else {
            setData(element, 'ujs:enable-with', element.value);
            element.value = replacement;
          }
        }
        element.disabled = true;
        return setData(element, 'ujs:disabled', true);
      };

      enableFormElements = function(form) {
        return formElements(form, Rails.formEnableSelector).forEach(enableFormElement);
      };

      enableFormElement = function(element) {
        var originalText;
        originalText = getData(element, 'ujs:enable-with');
        if (originalText != null) {
          if (matches(element, 'button')) {
            element.innerHTML = originalText;
          } else {
            element.value = originalText;
          }
          setData(element, 'ujs:enable-with', null);
        }
        element.disabled = false;
        return setData(element, 'ujs:disabled', null);
      };

    }).call(this);
    (function() {
      var stopEverything;

      stopEverything = Rails.stopEverything;

      Rails.handleMethod = function(e) {
        var csrfParam, csrfToken, form, formContent, href, link, method;
        link = this;
        method = link.getAttribute('data-method');
        if (!method) {
          return;
        }
        href = Rails.href(link);
        csrfToken = Rails.csrfToken();
        csrfParam = Rails.csrfParam();
        form = document.createElement('form');
        formContent = "<input name='_method' value='" + method + "' type='hidden' />";
        if ((csrfParam != null) && (csrfToken != null) && !Rails.isCrossDomain(href)) {
          formContent += "<input name='" + csrfParam + "' value='" + csrfToken + "' type='hidden' />";
        }
        formContent += '<input type="submit" />';
        form.method = 'post';
        form.action = href;
        form.target = link.target;
        form.innerHTML = formContent;
        form.style.display = 'none';
        document.body.appendChild(form);
        form.querySelector('[type="submit"]').click();
        return stopEverything(e);
      };

    }).call(this);
    (function() {
      var ajax, fire, getData, isCrossDomain, isRemote, matches, serializeElement, setData, stopEverything,
        slice = [].slice;

      matches = Rails.matches, getData = Rails.getData, setData = Rails.setData, fire = Rails.fire, stopEverything = Rails.stopEverything, ajax = Rails.ajax, isCrossDomain = Rails.isCrossDomain, serializeElement = Rails.serializeElement;

      isRemote = function(element) {
        var value;
        value = element.getAttribute('data-remote');
        return (value != null) && value !== 'false';
      };

      Rails.handleRemote = function(e) {
        var button, data, dataType, element, method, url, withCredentials;
        element = this;
        if (!isRemote(element)) {
          return true;
        }
        if (!fire(element, 'ajax:before')) {
          fire(element, 'ajax:stopped');
          return false;
        }
        withCredentials = element.getAttribute('data-with-credentials');
        dataType = element.getAttribute('data-type') || 'script';
        if (matches(element, Rails.formSubmitSelector)) {
          button = getData(element, 'ujs:submit-button');
          method = getData(element, 'ujs:submit-button-formmethod') || element.method;
          url = getData(element, 'ujs:submit-button-formaction') || element.getAttribute('action') || location.href;
          if (method.toUpperCase() === 'GET') {
            url = url.replace(/\?.*$/, '');
          }
          if (element.enctype === 'multipart/form-data') {
            data = new FormData(element);
            if (button != null) {
              data.append(button.name, button.value);
            }
          } else {
            data = serializeElement(element, button);
          }
          setData(element, 'ujs:submit-button', null);
          setData(element, 'ujs:submit-button-formmethod', null);
          setData(element, 'ujs:submit-button-formaction', null);
        } else if (matches(element, Rails.buttonClickSelector) || matches(element, Rails.inputChangeSelector)) {
          method = element.getAttribute('data-method');
          url = element.getAttribute('data-url');
          data = serializeElement(element, element.getAttribute('data-params'));
        } else {
          method = element.getAttribute('data-method');
          url = Rails.href(element);
          data = element.getAttribute('data-params');
        }
        ajax({
          type: method || 'GET',
          url: url,
          data: data,
          dataType: dataType,
          beforeSend: function(xhr, options) {
            if (fire(element, 'ajax:beforeSend', [xhr, options])) {
              return fire(element, 'ajax:send', [xhr]);
            } else {
              fire(element, 'ajax:stopped');
              return xhr.abort();
            }
          },
          success: function() {
            var args;
            args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
            return fire(element, 'ajax:success', args);
          },
          error: function() {
            var args;
            args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
            return fire(element, 'ajax:error', args);
          },
          complete: function() {
            var args;
            args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
            return fire(element, 'ajax:complete', args);
          },
          crossDomain: isCrossDomain(url),
          withCredentials: (withCredentials != null) && withCredentials !== 'false'
        });
        return stopEverything(e);
      };

      Rails.formSubmitButtonClick = function(e) {
        var button, form;
        button = this;
        form = button.form;
        if (!form) {
          return;
        }
        if (button.name) {
          setData(form, 'ujs:submit-button', {
            name: button.name,
            value: button.value
          });
        }
        setData(form, 'ujs:formnovalidate-button', button.formNoValidate);
        setData(form, 'ujs:submit-button-formaction', button.getAttribute('formaction'));
        return setData(form, 'ujs:submit-button-formmethod', button.getAttribute('formmethod'));
      };

      Rails.handleMetaClick = function(e) {
        var data, link, metaClick, method;
        link = this;
        method = (link.getAttribute('data-method') || 'GET').toUpperCase();
        data = link.getAttribute('data-params');
        metaClick = e.metaKey || e.ctrlKey;
        if (metaClick && method === 'GET' && !data) {
          return e.stopImmediatePropagation();
        }
      };

    }).call(this);
    (function() {
      var $, CSRFProtection, delegate, disableElement, enableElement, fire, formSubmitButtonClick, getData, handleConfirm, handleDisabledElement, handleMetaClick, handleMethod, handleRemote, refreshCSRFTokens;

      fire = Rails.fire, delegate = Rails.delegate, getData = Rails.getData, $ = Rails.$, refreshCSRFTokens = Rails.refreshCSRFTokens, CSRFProtection = Rails.CSRFProtection, enableElement = Rails.enableElement, disableElement = Rails.disableElement, handleDisabledElement = Rails.handleDisabledElement, handleConfirm = Rails.handleConfirm, handleRemote = Rails.handleRemote, formSubmitButtonClick = Rails.formSubmitButtonClick, handleMetaClick = Rails.handleMetaClick, handleMethod = Rails.handleMethod;

      if ((typeof jQuery !== "undefined" && jQuery !== null) && (jQuery.ajax != null) && !jQuery.rails) {
        jQuery.rails = Rails;
        jQuery.ajaxPrefilter(function(options, originalOptions, xhr) {
          if (!options.crossDomain) {
            return CSRFProtection(xhr);
          }
        });
      }

      Rails.start = function() {
        if (window._rails_loaded) {
          throw new Error('rails-ujs has already been loaded!');
        }
        window.addEventListener('pageshow', function() {
          $(Rails.formEnableSelector).forEach(function(el) {
            if (getData(el, 'ujs:disabled')) {
              return enableElement(el);
            }
          });
          return $(Rails.linkDisableSelector).forEach(function(el) {
            if (getData(el, 'ujs:disabled')) {
              return enableElement(el);
            }
          });
        });
        delegate(document, Rails.linkDisableSelector, 'ajax:complete', enableElement);
        delegate(document, Rails.linkDisableSelector, 'ajax:stopped', enableElement);
        delegate(document, Rails.buttonDisableSelector, 'ajax:complete', enableElement);
        delegate(document, Rails.buttonDisableSelector, 'ajax:stopped', enableElement);
        delegate(document, Rails.linkClickSelector, 'click', handleDisabledElement);
        delegate(document, Rails.linkClickSelector, 'click', handleConfirm);
        delegate(document, Rails.linkClickSelector, 'click', handleMetaClick);
        delegate(document, Rails.linkClickSelector, 'click', disableElement);
        delegate(document, Rails.linkClickSelector, 'click', handleRemote);
        delegate(document, Rails.linkClickSelector, 'click', handleMethod);
        delegate(document, Rails.buttonClickSelector, 'click', handleDisabledElement);
        delegate(document, Rails.buttonClickSelector, 'click', handleConfirm);
        delegate(document, Rails.buttonClickSelector, 'click', disableElement);
        delegate(document, Rails.buttonClickSelector, 'click', handleRemote);
        delegate(document, Rails.inputChangeSelector, 'change', handleDisabledElement);
        delegate(document, Rails.inputChangeSelector, 'change', handleConfirm);
        delegate(document, Rails.inputChangeSelector, 'change', handleRemote);
        delegate(document, Rails.formSubmitSelector, 'submit', handleDisabledElement);
        delegate(document, Rails.formSubmitSelector, 'submit', handleConfirm);
        delegate(document, Rails.formSubmitSelector, 'submit', handleRemote);
        delegate(document, Rails.formSubmitSelector, 'submit', function(e) {
          return setTimeout((function() {
            return disableElement(e);
          }), 13);
        });
        delegate(document, Rails.formSubmitSelector, 'ajax:send', disableElement);
        delegate(document, Rails.formSubmitSelector, 'ajax:complete', enableElement);
        delegate(document, Rails.formInputClickSelector, 'click', handleDisabledElement);
        delegate(document, Rails.formInputClickSelector, 'click', handleConfirm);
        delegate(document, Rails.formInputClickSelector, 'click', formSubmitButtonClick);
        document.addEventListener('DOMContentLoaded', refreshCSRFTokens);
        return window._rails_loaded = true;
      };

      if (window.Rails === Rails && fire(document, 'rails:attachBindings')) {
        Rails.start();
      }

    }).call(this);
  }).call(this);

  if (typeof module === "object" && module.exports) {
    module.exports = Rails;
  } else if (typeof define === "function" && define.amd) {
    define(Rails);
  }
}).call(this);
/*
Turbolinks 5.1.0
Copyright © 2018 Basecamp, LLC
 */

(function(){this.Turbolinks={supported:function(){return null!=window.history.pushState&&null!=window.requestAnimationFrame&&null!=window.addEventListener}(),visit:function(t,e){return Turbolinks.controller.visit(t,e)},clearCache:function(){return Turbolinks.controller.clearCache()},setProgressBarDelay:function(t){return Turbolinks.controller.setProgressBarDelay(t)}}}).call(this),function(){var t,e,r,n=[].slice;Turbolinks.copyObject=function(t){var e,r,n;r={};for(e in t)n=t[e],r[e]=n;return r},Turbolinks.closest=function(e,r){return t.call(e,r)},t=function(){var t,r;return t=document.documentElement,null!=(r=t.closest)?r:function(t){var r;for(r=this;r;){if(r.nodeType===Node.ELEMENT_NODE&&e.call(r,t))return r;r=r.parentNode}}}(),Turbolinks.defer=function(t){return setTimeout(t,1)},Turbolinks.throttle=function(t){var e;return e=null,function(){var r;return r=1<=arguments.length?n.call(arguments,0):[],null!=e?e:e=requestAnimationFrame(function(n){return function(){return e=null,t.apply(n,r)}}(this))}},Turbolinks.dispatch=function(t,e){var n,o,i,s,a,u;return a=null!=e?e:{},u=a.target,n=a.cancelable,o=a.data,i=document.createEvent("Events"),i.initEvent(t,!0,n===!0),i.data=null!=o?o:{},i.cancelable&&!r&&(s=i.preventDefault,i.preventDefault=function(){return this.defaultPrevented||Object.defineProperty(this,"defaultPrevented",{get:function(){return!0}}),s.call(this)}),(null!=u?u:document).dispatchEvent(i),i},r=function(){var t;return t=document.createEvent("Events"),t.initEvent("test",!0,!0),t.preventDefault(),t.defaultPrevented}(),Turbolinks.match=function(t,r){return e.call(t,r)},e=function(){var t,e,r,n;return t=document.documentElement,null!=(e=null!=(r=null!=(n=t.matchesSelector)?n:t.webkitMatchesSelector)?r:t.msMatchesSelector)?e:t.mozMatchesSelector}(),Turbolinks.uuid=function(){var t,e,r;for(r="",t=e=1;36>=e;t=++e)r+=9===t||14===t||19===t||24===t?"-":15===t?"4":20===t?(Math.floor(4*Math.random())+8).toString(16):Math.floor(15*Math.random()).toString(16);return r}}.call(this),function(){Turbolinks.Location=function(){function t(t){var e,r;null==t&&(t=""),r=document.createElement("a"),r.href=t.toString(),this.absoluteURL=r.href,e=r.hash.length,2>e?this.requestURL=this.absoluteURL:(this.requestURL=this.absoluteURL.slice(0,-e),this.anchor=r.hash.slice(1))}var e,r,n,o;return t.wrap=function(t){return t instanceof this?t:new this(t)},t.prototype.getOrigin=function(){return this.absoluteURL.split("/",3).join("/")},t.prototype.getPath=function(){var t,e;return null!=(t=null!=(e=this.requestURL.match(/\/\/[^\/]*(\/[^?;]*)/))?e[1]:void 0)?t:"/"},t.prototype.getPathComponents=function(){return this.getPath().split("/").slice(1)},t.prototype.getLastPathComponent=function(){return this.getPathComponents().slice(-1)[0]},t.prototype.getExtension=function(){var t,e;return null!=(t=null!=(e=this.getLastPathComponent().match(/\.[^.]*$/))?e[0]:void 0)?t:""},t.prototype.isHTML=function(){return this.getExtension().match(/^(?:|\.(?:htm|html|xhtml))$/)},t.prototype.isPrefixedBy=function(t){var e;return e=r(t),this.isEqualTo(t)||o(this.absoluteURL,e)},t.prototype.isEqualTo=function(t){return this.absoluteURL===(null!=t?t.absoluteURL:void 0)},t.prototype.toCacheKey=function(){return this.requestURL},t.prototype.toJSON=function(){return this.absoluteURL},t.prototype.toString=function(){return this.absoluteURL},t.prototype.valueOf=function(){return this.absoluteURL},r=function(t){return e(t.getOrigin()+t.getPath())},e=function(t){return n(t,"/")?t:t+"/"},o=function(t,e){return t.slice(0,e.length)===e},n=function(t,e){return t.slice(-e.length)===e},t}()}.call(this),function(){var t=function(t,e){return function(){return t.apply(e,arguments)}};Turbolinks.HttpRequest=function(){function e(e,r,n){this.delegate=e,this.requestCanceled=t(this.requestCanceled,this),this.requestTimedOut=t(this.requestTimedOut,this),this.requestFailed=t(this.requestFailed,this),this.requestLoaded=t(this.requestLoaded,this),this.requestProgressed=t(this.requestProgressed,this),this.url=Turbolinks.Location.wrap(r).requestURL,this.referrer=Turbolinks.Location.wrap(n).absoluteURL,this.createXHR()}return e.NETWORK_FAILURE=0,e.TIMEOUT_FAILURE=-1,e.timeout=60,e.prototype.send=function(){var t;return this.xhr&&!this.sent?(this.notifyApplicationBeforeRequestStart(),this.setProgress(0),this.xhr.send(),this.sent=!0,"function"==typeof(t=this.delegate).requestStarted?t.requestStarted():void 0):void 0},e.prototype.cancel=function(){return this.xhr&&this.sent?this.xhr.abort():void 0},e.prototype.requestProgressed=function(t){return t.lengthComputable?this.setProgress(t.loaded/t.total):void 0},e.prototype.requestLoaded=function(){return this.endRequest(function(t){return function(){var e;return 200<=(e=t.xhr.status)&&300>e?t.delegate.requestCompletedWithResponse(t.xhr.responseText,t.xhr.getResponseHeader("Turbolinks-Location")):(t.failed=!0,t.delegate.requestFailedWithStatusCode(t.xhr.status,t.xhr.responseText))}}(this))},e.prototype.requestFailed=function(){return this.endRequest(function(t){return function(){return t.failed=!0,t.delegate.requestFailedWithStatusCode(t.constructor.NETWORK_FAILURE)}}(this))},e.prototype.requestTimedOut=function(){return this.endRequest(function(t){return function(){return t.failed=!0,t.delegate.requestFailedWithStatusCode(t.constructor.TIMEOUT_FAILURE)}}(this))},e.prototype.requestCanceled=function(){return this.endRequest()},e.prototype.notifyApplicationBeforeRequestStart=function(){return Turbolinks.dispatch("turbolinks:request-start",{data:{url:this.url,xhr:this.xhr}})},e.prototype.notifyApplicationAfterRequestEnd=function(){return Turbolinks.dispatch("turbolinks:request-end",{data:{url:this.url,xhr:this.xhr}})},e.prototype.createXHR=function(){return this.xhr=new XMLHttpRequest,this.xhr.open("GET",this.url,!0),this.xhr.timeout=1e3*this.constructor.timeout,this.xhr.setRequestHeader("Accept","text/html, application/xhtml+xml"),this.xhr.setRequestHeader("Turbolinks-Referrer",this.referrer),this.xhr.onprogress=this.requestProgressed,this.xhr.onload=this.requestLoaded,this.xhr.onerror=this.requestFailed,this.xhr.ontimeout=this.requestTimedOut,this.xhr.onabort=this.requestCanceled},e.prototype.endRequest=function(t){return this.xhr?(this.notifyApplicationAfterRequestEnd(),null!=t&&t.call(this),this.destroy()):void 0},e.prototype.setProgress=function(t){var e;return this.progress=t,"function"==typeof(e=this.delegate).requestProgressed?e.requestProgressed(this.progress):void 0},e.prototype.destroy=function(){var t;return this.setProgress(1),"function"==typeof(t=this.delegate).requestFinished&&t.requestFinished(),this.delegate=null,this.xhr=null},e}()}.call(this),function(){var t=function(t,e){return function(){return t.apply(e,arguments)}};Turbolinks.ProgressBar=function(){function e(){this.trickle=t(this.trickle,this),this.stylesheetElement=this.createStylesheetElement(),this.progressElement=this.createProgressElement()}var r;return r=300,e.defaultCSS=".turbolinks-progress-bar {\n  position: fixed;\n  display: block;\n  top: 0;\n  left: 0;\n  height: 3px;\n  background: #0076ff;\n  z-index: 9999;\n  transition: width "+r+"ms ease-out, opacity "+r/2+"ms "+r/2+"ms ease-in;\n  transform: translate3d(0, 0, 0);\n}",e.prototype.show=function(){return this.visible?void 0:(this.visible=!0,this.installStylesheetElement(),this.installProgressElement(),this.startTrickling())},e.prototype.hide=function(){return this.visible&&!this.hiding?(this.hiding=!0,this.fadeProgressElement(function(t){return function(){return t.uninstallProgressElement(),t.stopTrickling(),t.visible=!1,t.hiding=!1}}(this))):void 0},e.prototype.setValue=function(t){return this.value=t,this.refresh()},e.prototype.installStylesheetElement=function(){return document.head.insertBefore(this.stylesheetElement,document.head.firstChild)},e.prototype.installProgressElement=function(){return this.progressElement.style.width=0,this.progressElement.style.opacity=1,document.documentElement.insertBefore(this.progressElement,document.body),this.refresh()},e.prototype.fadeProgressElement=function(t){return this.progressElement.style.opacity=0,setTimeout(t,1.5*r)},e.prototype.uninstallProgressElement=function(){return this.progressElement.parentNode?document.documentElement.removeChild(this.progressElement):void 0},e.prototype.startTrickling=function(){return null!=this.trickleInterval?this.trickleInterval:this.trickleInterval=setInterval(this.trickle,r)},e.prototype.stopTrickling=function(){return clearInterval(this.trickleInterval),this.trickleInterval=null},e.prototype.trickle=function(){return this.setValue(this.value+Math.random()/100)},e.prototype.refresh=function(){return requestAnimationFrame(function(t){return function(){return t.progressElement.style.width=10+90*t.value+"%"}}(this))},e.prototype.createStylesheetElement=function(){var t;return t=document.createElement("style"),t.type="text/css",t.textContent=this.constructor.defaultCSS,t},e.prototype.createProgressElement=function(){var t;return t=document.createElement("div"),t.className="turbolinks-progress-bar",t},e}()}.call(this),function(){var t=function(t,e){return function(){return t.apply(e,arguments)}};Turbolinks.BrowserAdapter=function(){function e(e){this.controller=e,this.showProgressBar=t(this.showProgressBar,this),this.progressBar=new Turbolinks.ProgressBar}var r,n,o;return o=Turbolinks.HttpRequest,r=o.NETWORK_FAILURE,n=o.TIMEOUT_FAILURE,e.prototype.visitProposedToLocationWithAction=function(t,e){return this.controller.startVisitToLocationWithAction(t,e)},e.prototype.visitStarted=function(t){return t.issueRequest(),t.changeHistory(),t.loadCachedSnapshot()},e.prototype.visitRequestStarted=function(t){return this.progressBar.setValue(0),t.hasCachedSnapshot()||"restore"!==t.action?this.showProgressBarAfterDelay():this.showProgressBar()},e.prototype.visitRequestProgressed=function(t){return this.progressBar.setValue(t.progress)},e.prototype.visitRequestCompleted=function(t){return t.loadResponse()},e.prototype.visitRequestFailedWithStatusCode=function(t,e){switch(e){case r:case n:return this.reload();default:return t.loadResponse()}},e.prototype.visitRequestFinished=function(t){return this.hideProgressBar()},e.prototype.visitCompleted=function(t){return t.followRedirect()},e.prototype.pageInvalidated=function(){return this.reload()},e.prototype.showProgressBarAfterDelay=function(){return this.progressBarTimeout=setTimeout(this.showProgressBar,this.controller.progressBarDelay)},e.prototype.showProgressBar=function(){return this.progressBar.show()},e.prototype.hideProgressBar=function(){return this.progressBar.hide(),clearTimeout(this.progressBarTimeout)},e.prototype.reload=function(){return window.location.reload()},e}()}.call(this),function(){var t=function(t,e){return function(){return t.apply(e,arguments)}};Turbolinks.History=function(){function e(e){this.delegate=e,this.onPageLoad=t(this.onPageLoad,this),this.onPopState=t(this.onPopState,this)}return e.prototype.start=function(){return this.started?void 0:(addEventListener("popstate",this.onPopState,!1),addEventListener("load",this.onPageLoad,!1),this.started=!0)},e.prototype.stop=function(){return this.started?(removeEventListener("popstate",this.onPopState,!1),removeEventListener("load",this.onPageLoad,!1),this.started=!1):void 0},e.prototype.push=function(t,e){return t=Turbolinks.Location.wrap(t),this.update("push",t,e)},e.prototype.replace=function(t,e){return t=Turbolinks.Location.wrap(t),this.update("replace",t,e)},e.prototype.onPopState=function(t){var e,r,n,o;return this.shouldHandlePopState()&&(o=null!=(r=t.state)?r.turbolinks:void 0)?(e=Turbolinks.Location.wrap(window.location),n=o.restorationIdentifier,this.delegate.historyPoppedToLocationWithRestorationIdentifier(e,n)):void 0},e.prototype.onPageLoad=function(t){return Turbolinks.defer(function(t){return function(){return t.pageLoaded=!0}}(this))},e.prototype.shouldHandlePopState=function(){return this.pageIsLoaded()},e.prototype.pageIsLoaded=function(){return this.pageLoaded||"complete"===document.readyState},e.prototype.update=function(t,e,r){var n;return n={turbolinks:{restorationIdentifier:r}},history[t+"State"](n,null,e)},e}()}.call(this),function(){Turbolinks.Snapshot=function(){function t(t){var e,r;r=t.head,e=t.body,this.head=null!=r?r:document.createElement("head"),this.body=null!=e?e:document.createElement("body")}return t.wrap=function(t){return t instanceof this?t:this.fromHTML(t)},t.fromHTML=function(t){var e;return e=document.createElement("html"),e.innerHTML=t,this.fromElement(e)},t.fromElement=function(t){return new this({head:t.querySelector("head"),body:t.querySelector("body")})},t.prototype.clone=function(){return new t({head:this.head.cloneNode(!0),body:this.body.cloneNode(!0)})},t.prototype.getRootLocation=function(){var t,e;return e=null!=(t=this.getSetting("root"))?t:"/",new Turbolinks.Location(e)},t.prototype.getCacheControlValue=function(){return this.getSetting("cache-control")},t.prototype.getElementForAnchor=function(t){try{return this.body.querySelector("[id='"+t+"'], a[name='"+t+"']")}catch(e){}},t.prototype.hasAnchor=function(t){return null!=this.getElementForAnchor(t)},t.prototype.isPreviewable=function(){return"no-preview"!==this.getCacheControlValue()},t.prototype.isCacheable=function(){return"no-cache"!==this.getCacheControlValue()},t.prototype.isVisitable=function(){return"reload"!==this.getSetting("visit-control")},t.prototype.getSetting=function(t){var e,r;return r=this.head.querySelectorAll("meta[name='turbolinks-"+t+"']"),e=r[r.length-1],null!=e?e.getAttribute("content"):void 0},t}()}.call(this),function(){var t=[].slice;Turbolinks.Renderer=function(){function e(){}var r;return e.render=function(){var e,r,n,o;return n=arguments[0],r=arguments[1],e=3<=arguments.length?t.call(arguments,2):[],o=function(t,e,r){r.prototype=t.prototype;var n=new r,o=t.apply(n,e);return Object(o)===o?o:n}(this,e,function(){}),o.delegate=n,o.render(r),o},e.prototype.renderView=function(t){return this.delegate.viewWillRender(this.newBody),t(),this.delegate.viewRendered(this.newBody)},e.prototype.invalidateView=function(){return this.delegate.viewInvalidated()},e.prototype.createScriptElement=function(t){var e;return"false"===t.getAttribute("data-turbolinks-eval")?t:(e=document.createElement("script"),e.textContent=t.textContent,e.async=!1,r(e,t),e)},r=function(t,e){var r,n,o,i,s,a,u;for(i=e.attributes,a=[],r=0,n=i.length;n>r;r++)s=i[r],o=s.name,u=s.value,a.push(t.setAttribute(o,u));return a},e}()}.call(this),function(){Turbolinks.HeadDetails=function(){function t(t){var e,r,i,s,a,u,l;for(this.element=t,this.elements={},l=this.element.childNodes,s=0,u=l.length;u>s;s++)i=l[s],i.nodeType===Node.ELEMENT_NODE&&(a=i.outerHTML,r=null!=(e=this.elements)[a]?e[a]:e[a]={type:o(i),tracked:n(i),elements:[]},r.elements.push(i))}var e,r,n,o;return t.prototype.hasElementWithKey=function(t){return t in this.elements},t.prototype.getTrackedElementSignature=function(){var t,e;return function(){var r,n;r=this.elements,n=[];for(t in r)e=r[t].tracked,e&&n.push(t);return n}.call(this).join("")},t.prototype.getScriptElementsNotInDetails=function(t){return this.getElementsMatchingTypeNotInDetails("script",t)},t.prototype.getStylesheetElementsNotInDetails=function(t){return this.getElementsMatchingTypeNotInDetails("stylesheet",t)},t.prototype.getElementsMatchingTypeNotInDetails=function(t,e){var r,n,o,i,s,a;o=this.elements,s=[];for(n in o)i=o[n],a=i.type,r=i.elements,a!==t||e.hasElementWithKey(n)||s.push(r[0]);return s},t.prototype.getProvisionalElements=function(){var t,e,r,n,o,i,s;r=[],n=this.elements;for(e in n)o=n[e],s=o.type,i=o.tracked,t=o.elements,null!=s||i?t.length>1&&r.push.apply(r,t.slice(1)):r.push.apply(r,t);return r},o=function(t){return e(t)?"script":r(t)?"stylesheet":void 0},n=function(t){return"reload"===t.getAttribute("data-turbolinks-track")},e=function(t){var e;return e=t.tagName.toLowerCase(),"script"===e},r=function(t){var e;return e=t.tagName.toLowerCase(),"style"===e||"link"===e&&"stylesheet"===t.getAttribute("rel")},t}()}.call(this),function(){var t=function(t,r){function n(){this.constructor=t}for(var o in r)e.call(r,o)&&(t[o]=r[o]);return n.prototype=r.prototype,t.prototype=new n,t.__super__=r.prototype,t},e={}.hasOwnProperty;Turbolinks.SnapshotRenderer=function(e){function r(t,e,r){this.currentSnapshot=t,this.newSnapshot=e,this.isPreview=r,this.currentHeadDetails=new Turbolinks.HeadDetails(this.currentSnapshot.head),this.newHeadDetails=new Turbolinks.HeadDetails(this.newSnapshot.head),this.newBody=this.newSnapshot.body}return t(r,e),r.prototype.render=function(t){return this.shouldRender()?(this.mergeHead(),this.renderView(function(e){return function(){return e.replaceBody(),e.isPreview||e.focusFirstAutofocusableElement(),t()}}(this))):this.invalidateView()},r.prototype.mergeHead=function(){return this.copyNewHeadStylesheetElements(),this.copyNewHeadScriptElements(),this.removeCurrentHeadProvisionalElements(),this.copyNewHeadProvisionalElements()},r.prototype.replaceBody=function(){return this.activateBodyScriptElements(),this.importBodyPermanentElements(),this.assignNewBody()},r.prototype.shouldRender=function(){return this.newSnapshot.isVisitable()&&this.trackedElementsAreIdentical()},r.prototype.trackedElementsAreIdentical=function(){return this.currentHeadDetails.getTrackedElementSignature()===this.newHeadDetails.getTrackedElementSignature()},r.prototype.copyNewHeadStylesheetElements=function(){var t,e,r,n,o;for(n=this.getNewHeadStylesheetElements(),o=[],e=0,r=n.length;r>e;e++)t=n[e],o.push(document.head.appendChild(t));return o},r.prototype.copyNewHeadScriptElements=function(){var t,e,r,n,o;for(n=this.getNewHeadScriptElements(),o=[],e=0,r=n.length;r>e;e++)t=n[e],o.push(document.head.appendChild(this.createScriptElement(t)));return o},r.prototype.removeCurrentHeadProvisionalElements=function(){var t,e,r,n,o;for(n=this.getCurrentHeadProvisionalElements(),o=[],e=0,r=n.length;r>e;e++)t=n[e],o.push(document.head.removeChild(t));return o},r.prototype.copyNewHeadProvisionalElements=function(){var t,e,r,n,o;for(n=this.getNewHeadProvisionalElements(),o=[],e=0,r=n.length;r>e;e++)t=n[e],o.push(document.head.appendChild(t));return o},r.prototype.importBodyPermanentElements=function(){var t,e,r,n,o,i;for(n=this.getNewBodyPermanentElements(),i=[],e=0,r=n.length;r>e;e++)o=n[e],(t=this.findCurrentBodyPermanentElement(o))?i.push(o.parentNode.replaceChild(t,o)):i.push(void 0);return i},r.prototype.activateBodyScriptElements=function(){var t,e,r,n,o,i;for(n=this.getNewBodyScriptElements(),i=[],e=0,r=n.length;r>e;e++)o=n[e],t=this.createScriptElement(o),i.push(o.parentNode.replaceChild(t,o));return i},r.prototype.assignNewBody=function(){return document.body=this.newBody},r.prototype.focusFirstAutofocusableElement=function(){var t;return null!=(t=this.findFirstAutofocusableElement())?t.focus():void 0},r.prototype.getNewHeadStylesheetElements=function(){return this.newHeadDetails.getStylesheetElementsNotInDetails(this.currentHeadDetails)},r.prototype.getNewHeadScriptElements=function(){return this.newHeadDetails.getScriptElementsNotInDetails(this.currentHeadDetails)},r.prototype.getCurrentHeadProvisionalElements=function(){return this.currentHeadDetails.getProvisionalElements()},r.prototype.getNewHeadProvisionalElements=function(){return this.newHeadDetails.getProvisionalElements()},r.prototype.getNewBodyPermanentElements=function(){return this.newBody.querySelectorAll("[id][data-turbolinks-permanent]")},r.prototype.findCurrentBodyPermanentElement=function(t){return document.body.querySelector("#"+t.id+"[data-turbolinks-permanent]")},r.prototype.getNewBodyScriptElements=function(){return this.newBody.querySelectorAll("script")},r.prototype.findFirstAutofocusableElement=function(){return document.body.querySelector("[autofocus]")},r}(Turbolinks.Renderer)}.call(this),function(){var t=function(t,r){function n(){this.constructor=t}for(var o in r)e.call(r,o)&&(t[o]=r[o]);return n.prototype=r.prototype,t.prototype=new n,t.__super__=r.prototype,t},e={}.hasOwnProperty;Turbolinks.ErrorRenderer=function(e){function r(t){this.html=t}return t(r,e),r.prototype.render=function(t){return this.renderView(function(e){return function(){return e.replaceDocumentHTML(),e.activateBodyScriptElements(),t()}}(this))},r.prototype.replaceDocumentHTML=function(){return document.documentElement.innerHTML=this.html},r.prototype.activateBodyScriptElements=function(){var t,e,r,n,o,i;for(n=this.getScriptElements(),i=[],e=0,r=n.length;r>e;e++)o=n[e],t=this.createScriptElement(o),i.push(o.parentNode.replaceChild(t,o));return i},r.prototype.getScriptElements=function(){return document.documentElement.querySelectorAll("script")},r}(Turbolinks.Renderer)}.call(this),function(){Turbolinks.View=function(){function t(t){this.delegate=t,this.element=document.documentElement}return t.prototype.getRootLocation=function(){return this.getSnapshot().getRootLocation()},t.prototype.getElementForAnchor=function(t){return this.getSnapshot().getElementForAnchor(t)},t.prototype.getSnapshot=function(){return Turbolinks.Snapshot.fromElement(this.element)},t.prototype.render=function(t,e){var r,n,o;return o=t.snapshot,r=t.error,n=t.isPreview,this.markAsPreview(n),null!=o?this.renderSnapshot(o,n,e):this.renderError(r,e)},t.prototype.markAsPreview=function(t){return t?this.element.setAttribute("data-turbolinks-preview",""):this.element.removeAttribute("data-turbolinks-preview")},t.prototype.renderSnapshot=function(t,e,r){return Turbolinks.SnapshotRenderer.render(this.delegate,r,this.getSnapshot(),Turbolinks.Snapshot.wrap(t),e)},t.prototype.renderError=function(t,e){return Turbolinks.ErrorRenderer.render(this.delegate,e,t)},t}()}.call(this),function(){var t=function(t,e){return function(){return t.apply(e,arguments)}};Turbolinks.ScrollManager=function(){function e(e){this.delegate=e,this.onScroll=t(this.onScroll,this),this.onScroll=Turbolinks.throttle(this.onScroll)}return e.prototype.start=function(){return this.started?void 0:(addEventListener("scroll",this.onScroll,!1),this.onScroll(),this.started=!0)},e.prototype.stop=function(){return this.started?(removeEventListener("scroll",this.onScroll,!1),this.started=!1):void 0},e.prototype.scrollToElement=function(t){return t.scrollIntoView()},e.prototype.scrollToPosition=function(t){var e,r;return e=t.x,r=t.y,window.scrollTo(e,r)},e.prototype.onScroll=function(t){return this.updatePosition({x:window.pageXOffset,y:window.pageYOffset})},e.prototype.updatePosition=function(t){var e;return this.position=t,null!=(e=this.delegate)?e.scrollPositionChanged(this.position):void 0},e}()}.call(this),function(){Turbolinks.SnapshotCache=function(){function t(t){this.size=t,this.keys=[],this.snapshots={}}var e;return t.prototype.has=function(t){var r;return r=e(t),r in this.snapshots},t.prototype.get=function(t){var e;if(this.has(t))return e=this.read(t),this.touch(t),e},t.prototype.put=function(t,e){return this.write(t,e),this.touch(t),e},t.prototype.read=function(t){var r;return r=e(t),this.snapshots[r]},t.prototype.write=function(t,r){var n;return n=e(t),this.snapshots[n]=r},t.prototype.touch=function(t){var r,n;return n=e(t),r=this.keys.indexOf(n),r>-1&&this.keys.splice(r,1),this.keys.unshift(n),this.trim()},t.prototype.trim=function(){var t,e,r,n,o;for(n=this.keys.splice(this.size),o=[],t=0,r=n.length;r>t;t++)e=n[t],o.push(delete this.snapshots[e]);return o},e=function(t){return Turbolinks.Location.wrap(t).toCacheKey()},t}()}.call(this),function(){var t=function(t,e){return function(){return t.apply(e,arguments)}};Turbolinks.Visit=function(){function e(e,r,n){this.controller=e,this.action=n,this.performScroll=t(this.performScroll,this),this.identifier=Turbolinks.uuid(),this.location=Turbolinks.Location.wrap(r),this.adapter=this.controller.adapter,this.state="initialized",this.timingMetrics={}}var r;return e.prototype.start=function(){return"initialized"===this.state?(this.recordTimingMetric("visitStart"),this.state="started",this.adapter.visitStarted(this)):void 0},e.prototype.cancel=function(){var t;return"started"===this.state?(null!=(t=this.request)&&t.cancel(),this.cancelRender(),this.state="canceled"):void 0},e.prototype.complete=function(){var t;return"started"===this.state?(this.recordTimingMetric("visitEnd"),this.state="completed","function"==typeof(t=this.adapter).visitCompleted&&t.visitCompleted(this),this.controller.visitCompleted(this)):void 0},e.prototype.fail=function(){var t;return"started"===this.state?(this.state="failed","function"==typeof(t=this.adapter).visitFailed?t.visitFailed(this):void 0):void 0},e.prototype.changeHistory=function(){var t,e;return this.historyChanged?void 0:(t=this.location.isEqualTo(this.referrer)?"replace":this.action,e=r(t),this.controller[e](this.location,this.restorationIdentifier),this.historyChanged=!0)},e.prototype.issueRequest=function(){return this.shouldIssueRequest()&&null==this.request?(this.progress=0,this.request=new Turbolinks.HttpRequest(this,this.location,this.referrer),this.request.send()):void 0},e.prototype.getCachedSnapshot=function(){var t;return!(t=this.controller.getCachedSnapshotForLocation(this.location))||null!=this.location.anchor&&!t.hasAnchor(this.location.anchor)||"restore"!==this.action&&!t.isPreviewable()?void 0:t},e.prototype.hasCachedSnapshot=function(){return null!=this.getCachedSnapshot()},e.prototype.loadCachedSnapshot=function(){var t,e;return(e=this.getCachedSnapshot())?(t=this.shouldIssueRequest(),this.render(function(){var r;return this.cacheSnapshot(),this.controller.render({snapshot:e,isPreview:t},this.performScroll),"function"==typeof(r=this.adapter).visitRendered&&r.visitRendered(this),t?void 0:this.complete()})):void 0},e.prototype.loadResponse=function(){return null!=this.response?this.render(function(){var t,e;return this.cacheSnapshot(),this.request.failed?(this.controller.render({error:this.response},this.performScroll),"function"==typeof(t=this.adapter).visitRendered&&t.visitRendered(this),this.fail()):(this.controller.render({snapshot:this.response},this.performScroll),"function"==typeof(e=this.adapter).visitRendered&&e.visitRendered(this),this.complete())}):void 0},e.prototype.followRedirect=function(){return this.redirectedToLocation&&!this.followedRedirect?(this.location=this.redirectedToLocation,this.controller.replaceHistoryWithLocationAndRestorationIdentifier(this.redirectedToLocation,this.restorationIdentifier),this.followedRedirect=!0):void 0},e.prototype.requestStarted=function(){var t;return this.recordTimingMetric("requestStart"),"function"==typeof(t=this.adapter).visitRequestStarted?t.visitRequestStarted(this):void 0},e.prototype.requestProgressed=function(t){var e;return this.progress=t,"function"==typeof(e=this.adapter).visitRequestProgressed?e.visitRequestProgressed(this):void 0},e.prototype.requestCompletedWithResponse=function(t,e){return this.response=t,null!=e&&(this.redirectedToLocation=Turbolinks.Location.wrap(e)),this.adapter.visitRequestCompleted(this)},e.prototype.requestFailedWithStatusCode=function(t,e){return this.response=e,this.adapter.visitRequestFailedWithStatusCode(this,t)},e.prototype.requestFinished=function(){var t;return this.recordTimingMetric("requestEnd"),"function"==typeof(t=this.adapter).visitRequestFinished?t.visitRequestFinished(this):void 0},e.prototype.performScroll=function(){return this.scrolled?void 0:("restore"===this.action?this.scrollToRestoredPosition()||this.scrollToTop():this.scrollToAnchor()||this.scrollToTop(),this.scrolled=!0)},e.prototype.scrollToRestoredPosition=function(){var t,e;return t=null!=(e=this.restorationData)?e.scrollPosition:void 0,null!=t?(this.controller.scrollToPosition(t),!0):void 0},e.prototype.scrollToAnchor=function(){return null!=this.location.anchor?(this.controller.scrollToAnchor(this.location.anchor),!0):void 0},e.prototype.scrollToTop=function(){return this.controller.scrollToPosition({x:0,y:0})},e.prototype.recordTimingMetric=function(t){var e;return null!=(e=this.timingMetrics)[t]?e[t]:e[t]=(new Date).getTime()},e.prototype.getTimingMetrics=function(){return Turbolinks.copyObject(this.timingMetrics)},r=function(t){switch(t){case"replace":return"replaceHistoryWithLocationAndRestorationIdentifier";case"advance":case"restore":return"pushHistoryWithLocationAndRestorationIdentifier"}},e.prototype.shouldIssueRequest=function(){return"restore"===this.action?!this.hasCachedSnapshot():!0},e.prototype.cacheSnapshot=function(){return this.snapshotCached?void 0:(this.controller.cacheSnapshot(),this.snapshotCached=!0)},e.prototype.render=function(t){return this.cancelRender(),this.frame=requestAnimationFrame(function(e){return function(){return e.frame=null,t.call(e)}}(this))},e.prototype.cancelRender=function(){return this.frame?cancelAnimationFrame(this.frame):void 0},e}()}.call(this),function(){var t=function(t,e){return function(){return t.apply(e,arguments)}};Turbolinks.Controller=function(){function e(){this.clickBubbled=t(this.clickBubbled,this),this.clickCaptured=t(this.clickCaptured,this),this.pageLoaded=t(this.pageLoaded,this),this.history=new Turbolinks.History(this),this.view=new Turbolinks.View(this),this.scrollManager=new Turbolinks.ScrollManager(this),this.restorationData={},this.clearCache(),this.setProgressBarDelay(500)}return e.prototype.start=function(){return Turbolinks.supported&&!this.started?(addEventListener("click",this.clickCaptured,!0),addEventListener("DOMContentLoaded",this.pageLoaded,!1),this.scrollManager.start(),this.startHistory(),this.started=!0,this.enabled=!0):void 0},e.prototype.disable=function(){return this.enabled=!1},e.prototype.stop=function(){return this.started?(removeEventListener("click",this.clickCaptured,!0),removeEventListener("DOMContentLoaded",this.pageLoaded,!1),this.scrollManager.stop(),this.stopHistory(),this.started=!1):void 0},e.prototype.clearCache=function(){return this.cache=new Turbolinks.SnapshotCache(10)},e.prototype.visit=function(t,e){var r,n;return null==e&&(e={}),t=Turbolinks.Location.wrap(t),this.applicationAllowsVisitingLocation(t)?this.locationIsVisitable(t)?(r=null!=(n=e.action)?n:"advance",this.adapter.visitProposedToLocationWithAction(t,r)):window.location=t:void 0},e.prototype.startVisitToLocationWithAction=function(t,e,r){var n;return Turbolinks.supported?(n=this.getRestorationDataForIdentifier(r),this.startVisit(t,e,{restorationData:n})):window.location=t},e.prototype.setProgressBarDelay=function(t){return this.progressBarDelay=t},e.prototype.startHistory=function(){return this.location=Turbolinks.Location.wrap(window.location),this.restorationIdentifier=Turbolinks.uuid(),this.history.start(),this.history.replace(this.location,this.restorationIdentifier)},e.prototype.stopHistory=function(){return this.history.stop()},e.prototype.pushHistoryWithLocationAndRestorationIdentifier=function(t,e){return this.restorationIdentifier=e,this.location=Turbolinks.Location.wrap(t),this.history.push(this.location,this.restorationIdentifier)},e.prototype.replaceHistoryWithLocationAndRestorationIdentifier=function(t,e){return this.restorationIdentifier=e,this.location=Turbolinks.Location.wrap(t),this.history.replace(this.location,this.restorationIdentifier)},e.prototype.historyPoppedToLocationWithRestorationIdentifier=function(t,e){var r;return this.restorationIdentifier=e,this.enabled?(r=this.getRestorationDataForIdentifier(this.restorationIdentifier),this.startVisit(t,"restore",{restorationIdentifier:this.restorationIdentifier,restorationData:r,historyChanged:!0}),this.location=Turbolinks.Location.wrap(t)):this.adapter.pageInvalidated()},e.prototype.getCachedSnapshotForLocation=function(t){var e;return e=this.cache.get(t),e?e.clone():void 0},e.prototype.shouldCacheSnapshot=function(){return this.view.getSnapshot().isCacheable()},e.prototype.cacheSnapshot=function(){var t;return this.shouldCacheSnapshot()?(this.notifyApplicationBeforeCachingSnapshot(),t=this.view.getSnapshot(),this.cache.put(this.lastRenderedLocation,t.clone())):void 0},e.prototype.scrollToAnchor=function(t){var e;return(e=this.view.getElementForAnchor(t))?this.scrollToElement(e):this.scrollToPosition({x:0,y:0})},e.prototype.scrollToElement=function(t){return this.scrollManager.scrollToElement(t)},e.prototype.scrollToPosition=function(t){return this.scrollManager.scrollToPosition(t)},e.prototype.scrollPositionChanged=function(t){var e;return e=this.getCurrentRestorationData(),e.scrollPosition=t},e.prototype.render=function(t,e){return this.view.render(t,e)},e.prototype.viewInvalidated=function(){return this.adapter.pageInvalidated()},e.prototype.viewWillRender=function(t){return this.notifyApplicationBeforeRender(t)},e.prototype.viewRendered=function(){return this.lastRenderedLocation=this.currentVisit.location,this.notifyApplicationAfterRender()},e.prototype.pageLoaded=function(){
return this.lastRenderedLocation=this.location,this.notifyApplicationAfterPageLoad()},e.prototype.clickCaptured=function(){return removeEventListener("click",this.clickBubbled,!1),addEventListener("click",this.clickBubbled,!1)},e.prototype.clickBubbled=function(t){var e,r,n;return this.enabled&&this.clickEventIsSignificant(t)&&(r=this.getVisitableLinkForNode(t.target))&&(n=this.getVisitableLocationForLink(r))&&this.applicationAllowsFollowingLinkToLocation(r,n)?(t.preventDefault(),e=this.getActionForLink(r),this.visit(n,{action:e})):void 0},e.prototype.applicationAllowsFollowingLinkToLocation=function(t,e){var r;return r=this.notifyApplicationAfterClickingLinkToLocation(t,e),!r.defaultPrevented},e.prototype.applicationAllowsVisitingLocation=function(t){var e;return e=this.notifyApplicationBeforeVisitingLocation(t),!e.defaultPrevented},e.prototype.notifyApplicationAfterClickingLinkToLocation=function(t,e){return Turbolinks.dispatch("turbolinks:click",{target:t,data:{url:e.absoluteURL},cancelable:!0})},e.prototype.notifyApplicationBeforeVisitingLocation=function(t){return Turbolinks.dispatch("turbolinks:before-visit",{data:{url:t.absoluteURL},cancelable:!0})},e.prototype.notifyApplicationAfterVisitingLocation=function(t){return Turbolinks.dispatch("turbolinks:visit",{data:{url:t.absoluteURL}})},e.prototype.notifyApplicationBeforeCachingSnapshot=function(){return Turbolinks.dispatch("turbolinks:before-cache")},e.prototype.notifyApplicationBeforeRender=function(t){return Turbolinks.dispatch("turbolinks:before-render",{data:{newBody:t}})},e.prototype.notifyApplicationAfterRender=function(){return Turbolinks.dispatch("turbolinks:render")},e.prototype.notifyApplicationAfterPageLoad=function(t){return null==t&&(t={}),Turbolinks.dispatch("turbolinks:load",{data:{url:this.location.absoluteURL,timing:t}})},e.prototype.startVisit=function(t,e,r){var n;return null!=(n=this.currentVisit)&&n.cancel(),this.currentVisit=this.createVisit(t,e,r),this.currentVisit.start(),this.notifyApplicationAfterVisitingLocation(t)},e.prototype.createVisit=function(t,e,r){var n,o,i,s,a;return o=null!=r?r:{},s=o.restorationIdentifier,i=o.restorationData,n=o.historyChanged,a=new Turbolinks.Visit(this,t,e),a.restorationIdentifier=null!=s?s:Turbolinks.uuid(),a.restorationData=Turbolinks.copyObject(i),a.historyChanged=n,a.referrer=this.location,a},e.prototype.visitCompleted=function(t){return this.notifyApplicationAfterPageLoad(t.getTimingMetrics())},e.prototype.clickEventIsSignificant=function(t){return!(t.defaultPrevented||t.target.isContentEditable||t.which>1||t.altKey||t.ctrlKey||t.metaKey||t.shiftKey)},e.prototype.getVisitableLinkForNode=function(t){return this.nodeIsVisitable(t)?Turbolinks.closest(t,"a[href]:not([target]):not([download])"):void 0},e.prototype.getVisitableLocationForLink=function(t){var e;return e=new Turbolinks.Location(t.getAttribute("href")),this.locationIsVisitable(e)?e:void 0},e.prototype.getActionForLink=function(t){var e;return null!=(e=t.getAttribute("data-turbolinks-action"))?e:"advance"},e.prototype.nodeIsVisitable=function(t){var e;return(e=Turbolinks.closest(t,"[data-turbolinks]"))?"false"!==e.getAttribute("data-turbolinks"):!0},e.prototype.locationIsVisitable=function(t){return t.isPrefixedBy(this.view.getRootLocation())&&t.isHTML()},e.prototype.getCurrentRestorationData=function(){return this.getRestorationDataForIdentifier(this.restorationIdentifier)},e.prototype.getRestorationDataForIdentifier=function(t){var e;return null!=(e=this.restorationData)[t]?e[t]:e[t]={}},e}()}.call(this),function(){!function(){var t,e;if((t=e=document.currentScript)&&!e.hasAttribute("data-turbolinks-suppress-warning"))for(;t=t.parentNode;)if(t===document.body)return console.warn("You are loading Turbolinks from a <script> element inside the <body> element. This is probably not what you meant to do!\n\nLoad your application\u2019s JavaScript bundle inside the <head> element instead. <script> elements in <body> are evaluated with each page change.\n\nFor more information, see: https://github.com/turbolinks/turbolinks#working-with-script-elements\n\n\u2014\u2014\nSuppress this warning by adding a `data-turbolinks-suppress-warning` attribute to: %s",e.outerHTML)}()}.call(this),function(){var t,e,r;Turbolinks.start=function(){return e()?(null==Turbolinks.controller&&(Turbolinks.controller=t()),Turbolinks.controller.start()):void 0},e=function(){return null==window.Turbolinks&&(window.Turbolinks=Turbolinks),r()},t=function(){var t;return t=new Turbolinks.Controller,t.adapter=new Turbolinks.BrowserAdapter(t),t},r=function(){return window.Turbolinks===Turbolinks},r()&&Turbolinks.start()}.call(this);
/*global module:false*/

module.exports = function(grunt) {
    require('time-grunt')(grunt);

    require('load-grunt-tasks')(grunt);

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        banner:
            '/*! <%= pkg.name %> <%= pkg.version %> by <%= pkg.author.name %>\n' +
            '* Library to provide geo functions like distance calculation,\n' +
            '* conversion of decimal coordinates to sexagesimal and vice versa, etc.\n' +
            '* WGS 84 (World Geodetic System 1984)\n' +
            '* \n' +
            '* @author <%= pkg.author.name %>\n' +
            '* @url <%= pkg.author.url %>\n' +
            '* @version <%= pkg.version %>\n' +
            '* @license <%= _.pluck(pkg.licenses, "type").join(", ") %> \n**/',
        lint: {
            files: ['src/geolib.js'],
        },
        qunit: {
            files: ['tests/*.html'],
        },
        concat: {
            main: {
                options: {
                    banner: '<%= banner %>',
                    report: false,
                },
                src: ['src/geolib.js'],
                dest: 'dist/geolib.js',
            },
        },
        copy: {
            component: {
                files: [
                    {
                        src: 'package.json',
                        dest: 'component.json',
                    },
                ],
            },
            elev: {
                files: [
                    {
                        src: ['src/geolib.elevation.js'],
                        dest: 'dist/geolib.elevation.js',
                    },
                ],
            },
            pointInside: {
                files: [
                    {
                        src: ['src/geolib.isPointInsideRobust.js'],
                        dest: 'dist/geolib.isPointInsideRobust.js',
                    },
                ],
            },
        },
        replace: {
            version: {
                src: ['dist/*.js', 'bower.json', 'README.md'],
                overwrite: true,
                replacements: [
                    {
                        from: '$version$',
                        to: '<%= pkg.version %>',
                    },
                    {
                        from: /"version": "([0-9a-zA-Z\-\.\+]*)",/,
                        to: '"version": "<%= pkg.version %>",',
                    },
                    {
                        from: /v[0-9]+\.[0-9]{1,2}\.[0-9]{1,}/,
                        to: 'v<%= pkg.version %>',
                    },
                ],
            },
        },
        uglify: {
            options: {
                preserveComments: 'some',
            },
            main: {
                files: {
                    'dist/geolib.min.js': ['dist/geolib.js'],
                },
            },
            elev: {
                files: {
                    'dist/geolib.elevation.min.js': ['dist/geolib.elevation.js'],
                },
            },
            pointInside: {
                files: {
                    'dist/geolib.isPointInsideRobust.min.js': ['dist/geolib.isPointInsideRobust.js'],
                },
            },
        },
        watch: {
            all: {
                files: '<%= jshint.all %>',
                tasks: ['default'],
            },
        },
        jshint: {
            all: ['src/geolib.js', 'src/geolib.elevation.js', 'src/geolib.isPointInsideRobust.js'],
            options: {
                curly: true,
                eqeqeq: false,
                immed: true,
                latedef: true,
                newcap: false,
                noarg: true,
                sub: true,
                undef: true,
                evil: true,
                boss: true,
                eqnull: true,
                globals: {
                    module: true,
                    define: true,
                    require: true,
                    elevationResult: true,
                },
            },
        },
    });

    // Default task.
    grunt.registerTask('build', ['concat:main', 'copy', 'replace', 'uglify']);
    grunt.registerTask('default', ['build']);
    grunt.registerTask('travis', ['jshint', 'qunit']);
    grunt.registerTask('test', ['qunit']);
};
/*! geolib.elevation 2.0.23 by Manuel Bieh
*
* Elevation Addon for Geolib.js
* 
* @author Manuel Bieh
* @url http://www.manuelbieh.com/
* @version 2.0.23
* @license MIT
*/

;(function(global, geolib, undefined) {

	var elevation = {

		/*global google:true geolib:true require:true module:true elevationResult:true */

		/**
		*  @param      Array Collection of coords [{latitude: 51.510, longitude: 7.1321}, {latitude: 49.1238, longitude: "8° 30' W"}, ...]
		*  @return     Array [{lat:#lat, lng:#lng, elev:#elev},....]}
		*/
		getElevation: function() {
			if (typeof global.navigator !== 'undefined') {
				this.getElevationClient.apply(this, arguments);
			} else {
				this.getElevationServer.apply(this, arguments);
			}
		},


		/* Optional elevation addon requires Googlemaps API JS */
		getElevationClient: function(coords, cb) {

			if (!global.google) {
				throw new Error("Google maps api not loaded");
			}

			if (coords.length === 0) {
				return cb(null, null);
			}

			if (coords.length === 1) {
				return cb(new Error("getElevation requires at least 2 points."));
			}

			var path  = [];

			for(var i = 0; i < coords.length; i++) {
				path.push(new google.maps.LatLng(
					this.latitude(coords[i]),
					this.longitude(coords[i])
				));
			}

			var positionalRequest = {
				'path': path,
				'samples': path.length
			};

			var elevationService = new google.maps.ElevationService();
			var geolib = this;

			elevationService.getElevationAlongPath(positionalRequest, function (results, status) {
				geolib.elevationHandler(results, status, coords, cb);
			});

		},


		getElevationServer: function(coords, cb) {

			if (coords.length === 0) {
				return cb(null, null);
			}

			if (coords.length === 1) {
				return cb(new Error("getElevation requires at least 2 points."));
			}

			var gm = require('googlemaps');
			var path  = [];

			for(var i = 0; i < coords.length; i++) {
				path.push(
					this.latitude(coords[i]) + ',' + this.longitude(coords[i])
				);
			}

			var geolib = this;

			gm.elevationFromPath(path.join('|'), path.length, function(err, results) {
				geolib.elevationHandler(results.results, results.status, coords, cb);
			});

		},


		elevationHandler: function(results, status, coords, cb) {

			var latsLngsElevs = [];

			if (status == "OK" ) {

				for (var i = 0; i < results.length; i++) {
					latsLngsElevs.push({
						"lat": this.latitude(coords[i]),
						"lng": this.longitude(coords[i]),
						"elev":results[i].elevation
					});
				}

				cb(null, latsLngsElevs);

			} else {

				cb(new Error("Could not get elevation using Google's API"), elevationResult.status);

			}

		},


		/**
		*  @param      Array [{lat:#lat, lng:#lng, elev:#elev},....]}
		*  @return     Number % grade
		*/
		getGrade: function(coords) {

			var rise = Math.abs(
				this.elevation(coords[coords.length-1]) - this.elevation(coords[0])
			);

			var run = this.getPathLength(coords);

			return Math.floor((rise/run)*100);

		},


		/**
		*  @param      Array [{lat:#lat, lng:#lng, elev:#elev},....]}
		*  @return     Object {gain:#gain, loss:#loss}
		*/
		getTotalElevationGainAndLoss: function(coords) {

			var gain = 0;
			var loss = 0;

			for(var i = 0; i < coords.length - 1; i++) {

				var deltaElev = this.elevation(coords[i]) - this.elevation(coords[i + 1]);

				if (deltaElev > 0) {
					loss += deltaElev;
				} else {
					gain += Math.abs(deltaElev);
				}

			}

			return {
				"gain": gain,
				"loss": loss
			};

		}

	};

	// Node module
	if (typeof module !== 'undefined' && 
		typeof module.exports !== 'undefined') {

		geolib = require('geolib');
		geolib.extend(elevation);

	// AMD module
	} else if (typeof define === "function" && define.amd) {

		define(["geolib"], function (geolib) {
			geolib.extend(elevation);
			return geolib;
		});

	// we're in a browser
	} else {

		geolib.extend(elevation);

	}

}(this, this.geolib));
/*! geolib.elevation 2.0.23 by Manuel Bieh
*
* Elevation Addon for Geolib.js
* 
* @author Manuel Bieh
* @url http://www.manuelbieh.com/
* @version 2.0.23
* @license MIT
*/

!function(a,b,c){var d={getElevation:function(){"undefined"!=typeof a.navigator?this.getElevationClient.apply(this,arguments):this.getElevationServer.apply(this,arguments)},getElevationClient:function(b,c){if(!a.google)throw new Error("Google maps api not loaded");if(0===b.length)return c(null,null);if(1===b.length)return c(new Error("getElevation requires at least 2 points."));for(var d=[],e=0;e<b.length;e++)d.push(new google.maps.LatLng(this.latitude(b[e]),this.longitude(b[e])));var f={path:d,samples:d.length},g=new google.maps.ElevationService,h=this;g.getElevationAlongPath(f,function(a,d){h.elevationHandler(a,d,b,c)})},getElevationServer:function(a,b){if(0===a.length)return b(null,null);if(1===a.length)return b(new Error("getElevation requires at least 2 points."));for(var c=require("googlemaps"),d=[],e=0;e<a.length;e++)d.push(this.latitude(a[e])+","+this.longitude(a[e]));var f=this;c.elevationFromPath(d.join("|"),d.length,function(c,d){f.elevationHandler(d.results,d.status,a,b)})},elevationHandler:function(a,b,c,d){var e=[];if("OK"==b){for(var f=0;f<a.length;f++)e.push({lat:this.latitude(c[f]),lng:this.longitude(c[f]),elev:a[f].elevation});d(null,e)}else d(new Error("Could not get elevation using Google's API"),elevationResult.status)},getGrade:function(a){var b=Math.abs(this.elevation(a[a.length-1])-this.elevation(a[0])),c=this.getPathLength(a);return Math.floor(b/c*100)},getTotalElevationGainAndLoss:function(a){for(var b=0,c=0,d=0;d<a.length-1;d++){var e=this.elevation(a[d])-this.elevation(a[d+1]);e>0?c+=e:b+=Math.abs(e)}return{gain:b,loss:c}}};"undefined"!=typeof module&&"undefined"!=typeof module.exports?(b=require("geolib"),b.extend(d)):"function"==typeof define&&define.amd?define(["geolib"],function(a){return a.extend(d),a}):b.extend(d)}(this,this.geolib);
/*! geolib.isPointInsideRobust 2.0.23
* !!EXPERIMENTAL!!
*
* Robust version of isPointInside for Geolib.js
*
* Based on https://github.com/mikolalysenko/robust-point-in-polygon
* by Mikola Lysenko, licensed under MIT
*
* @author Manuel Bieh
* @url http://www.manuelbieh.com/
* @version 2.0.23
* @license MIT
*
*/

;(function(global, geolib, undefined) {

    var addOn = function(geolib) {

        var SPLITTER = +(Math.pow(2, 27) + 1.0);

        var NUM_EXPAND = 5;
        var EPSILON     = 1.1102230246251565e-16;
        var ERRBOUND3   = (3.0 + 16.0 * EPSILON) * EPSILON;
        var ERRBOUND4   = (7.0 + 56.0 * EPSILON) * EPSILON;

        var twoProduct = function(a, b, result) {
            var x = a * b;
            var c = SPLITTER * a;
            var abig = c - a;
            var ahi = c - abig;
            var alo = a - ahi;
            var d = SPLITTER * b;
            var bbig = d - b;
            var bhi = d - bbig;
            var blo = b - bhi;
            var err1 = x - (ahi * bhi);
            var err2 = err1 - (alo * bhi);
            var err3 = err2 - (ahi * blo);
            var y = alo * blo - err3;
            if(result) {
                result[0] = y;
                result[1] = x;
                return result;
            }
            return [ y, x ];
        };

        var fastTwoSum = function(a, b, result) {
            var x = a + b;
            var bv = x - a;
            var av = x - bv;
            var br = b - bv;
            var ar = a - av;
            if(result) {
                result[0] = ar + br;
                result[1] = x;
                return result;
            }
            return [ar+br, x];
        };

        var twoSum = fastTwoSum;

        var linearExpansionSum = function(e, f) {
            var ne = e.length|0;
            var nf = f.length|0;
            if(ne === 1 && nf === 1) {
                return scalarScalar(e[0], f[0]);
            }
            var n = ne + nf;
            var g = new Array(n);
            var count = 0;
            var eptr = 0;
            var fptr = 0;
            var abs = Math.abs;
            var ei = e[eptr];
            var ea = abs(ei);
            var fi = f[fptr];
            var fa = abs(fi);
            var a, b;
            if(ea < fa) {
                b = ei;
                eptr += 1;
                if(eptr < ne) {
                    ei = e[eptr];
                    ea = abs(ei);
                }
            } else {
                b = fi;
                fptr += 1;
                if(fptr < nf) {
                    fi = f[fptr];
                    fa = abs(fi);
                }
            }
            if((eptr < ne && ea < fa) || (fptr >= nf)) {
                a = ei;
                eptr += 1;
                if(eptr < ne) {
                    ei = e[eptr];
                    ea = abs(ei);
                }
            } else {
                a = fi;
                fptr += 1;
                if(fptr < nf) {
                    fi = f[fptr];
                    fa = abs(fi);
                }
            }
            var x = a + b;
            var bv = x - a;
            var y = b - bv;
            var q0 = y;
            var q1 = x;
            var _x, _bv, _av, _br, _ar;
            while(eptr < ne && fptr < nf) {
                if(ea < fa) {
                    a = ei;
                    eptr += 1;
                    if(eptr < ne) {
                        ei = e[eptr];
                        ea = abs(ei);
                    }
                } else {
                    a = fi;
                    fptr += 1;
                    if(fptr < nf) {
                        fi = f[fptr];
                        fa = abs(fi);
                    }
                }
                b = q0;
                x = a + b;
                bv = x - a;
                y = b - bv;
                if(y) {
                    g[count++] = y;
                }
                _x = q1 + x;
                _bv = _x - q1;
                _av = _x - _bv;
                _br = x - _bv;
                _ar = q1 - _av;
                q0 = _ar + _br;
                q1 = _x;
            }
            while(eptr < ne) {
                a = ei;
                b = q0;
                x = a + b;
                bv = x - a;
                y = b - bv;
                if(y) {
                    g[count++] = y;
                }
                _x = q1 + x;
                _bv = _x - q1;
                _av = _x - _bv;
                _br = x - _bv;
                _ar = q1 - _av;
                q0 = _ar + _br;
                q1 = _x;
                eptr += 1;
                if(eptr < ne) {
                    ei = e[eptr];
                }
            }
            while(fptr < nf) {
                a = fi;
                b = q0;
                x = a + b;
                bv = x - a;
                y = b - bv;
                if(y) {
                    g[count++] = y;
                }
                _x = q1 + x;
                _bv = _x - q1;
                _av = _x - _bv;
                _br = x - _bv;
                _ar = q1 - _av;
                q0 = _ar + _br;
                q1 = _x;
                fptr += 1;
                if(fptr < nf) {
                    fi = f[fptr];
                }
            }
            if(q0) {
                g[count++] = q0;
            }
            if(q1) {
                g[count++] = q1;
            }
            if(!count) {
                g[count++] = 0.0;
            }
            g.length = count;
            return g;
        };

        var robustSum = linearExpansionSum;

        var scaleLinearExpansion = function(e, scale) {
            var n = e.length;
            if(n === 1) {
                var ts = twoProduct(e[0], scale);
                if(ts[0]) {
                    return ts;
                }
                return [ ts[1] ];
            }
            var g = new Array(2 * n);
            var q = [0.1, 0.1];
            var t = [0.1, 0.1];
            var count = 0;
            twoProduct(e[0], scale, q);
            if(q[0]) {
                g[count++] = q[0];
            }
            for(var i=1; i<n; ++i) {
                twoProduct(e[i], scale, t);
                var pq = q[1];
                twoSum(pq, t[0], q);
                if(q[0]) {
                    g[count++] = q[0];
                }
                var a = t[1];
                var b = q[1];
                var x = a + b;
                var bv = x - a;
                var y = b - bv;
                q[1] = x;
                if(y) {
                    g[count++] = y;
                }
            }
            if(q[1]) {
                g[count++] = q[1];
            }
            if(count === 0) {
                g[count++] = 0.0;
            }
            g.length = count;
            return g;
        };

        var robustScale = scaleLinearExpansion;

        var scalarScalar = function(a, b) {
            var x = a + b;
            var bv = x - a;
            var av = x - bv;
            var br = b - bv;
            var ar = a - av;
            var y = ar + br;
            if(y) {
                return [y, x];
            }
            return [x];
        };

        var robustSubtract = function(e, f) {
            var ne = e.length|0;
            var nf = f.length|0;
            if(ne === 1 && nf === 1) {
                return scalarScalar(e[0], -f[0]);
            }
            var n = ne + nf;
            var g = new Array(n);
            var count = 0;
            var eptr = 0;
            var fptr = 0;
            var abs = Math.abs;
            var ei = e[eptr];
            var ea = abs(ei);
            var fi = -f[fptr];
            var fa = abs(fi);
            var a, b;
            if(ea < fa) {
                b = ei;
                eptr += 1;
                if(eptr < ne) {
                    ei = e[eptr];
                    ea = abs(ei);
                }
            } else {
                b = fi;
                fptr += 1;
                if(fptr < nf) {
                    fi = -f[fptr];
                    fa = abs(fi);
                }
            }
            if((eptr < ne && ea < fa) || (fptr >= nf)) {
                a = ei;
                eptr += 1;
                if(eptr < ne) {
                    ei = e[eptr];
                    ea = abs(ei);
                }
            } else {
                a = fi;
                fptr += 1;
                if(fptr < nf) {
                    fi = -f[fptr];
                    fa = abs(fi);
                }
            }
            var x = a + b;
            var bv = x - a;
            var y = b - bv;
            var q0 = y;
            var q1 = x;
            var _x, _bv, _av, _br, _ar;
            while(eptr < ne && fptr < nf) {
                if(ea < fa) {
                    a = ei;
                    eptr += 1;
                    if(eptr < ne) {
                        ei = e[eptr];
                        ea = abs(ei);
                    }
                } else {
                    a = fi;
                    fptr += 1;
                    if(fptr < nf) {
                        fi = -f[fptr];
                        fa = abs(fi);
                    }
                }
                b = q0;
                x = a + b;
                bv = x - a;
                y = b - bv;
                if(y) {
                    g[count++] = y;
                }
                _x = q1 + x;
                _bv = _x - q1;
                _av = _x - _bv;
                _br = x - _bv;
                _ar = q1 - _av;
                q0 = _ar + _br;
                q1 = _x;
            }
            while(eptr < ne) {
                a = ei;
                b = q0;
                x = a + b;
                bv = x - a;
                y = b - bv;
                if(y) {
                    g[count++] = y;
                }
                _x = q1 + x;
                _bv = _x - q1;
                _av = _x - _bv;
                _br = x - _bv;
                _ar = q1 - _av;
                q0 = _ar + _br;
                q1 = _x;
                eptr += 1;
                if(eptr < ne) {
                    ei = e[eptr];
                }
            }
            while(fptr < nf) {
                a = fi;
                b = q0;
                x = a + b;
                bv = x - a;
                y = b - bv;
                if(y) {
                    g[count++] = y;
                }
                _x = q1 + x;
                _bv = _x - q1;
                _av = _x - _bv;
                _br = x - _bv;
                _ar = q1 - _av;
                q0 = _ar + _br;
                q1 = _x;
                fptr += 1;
                if(fptr < nf) {
                    fi = -f[fptr];
                }
            }
            if(q0) {
                g[count++] = q0;
            }
            if(q1) {
                g[count++] = q1;
            }
            if(!count) {
                g[count++] = 0.0;
            }
            g.length = count;
            return g;
        };

        var cofactor = function(m, c) {
            var result = new Array(m.length-1);
            for(var i=1; i<m.length; ++i) {
                var r = result[i-1] = new Array(m.length-1);
                for(var j=0,k=0; j<m.length; ++j) {
                    if(j === c) {
                        continue;
                    }
                    r[k++] = m[i][j];
                }
            }
            return result;
        };

        var matrix = function(n) {
            var result = new Array(n);
            for(var i=0; i<n; ++i) {
                result[i] = new Array(n);
                for(var j=0; j<n; ++j) {
                    result[i][j] = ["m", j, "[", (n-i-1), "]"].join("");
                }
            }
            return result;
        };

        var sign = function(n) {
            if(n & 1) {
                return "-";
            }
            return "";
        };

        var generateSum = function(expr) {
            if(expr.length === 1) {
                return expr[0];
            } else if(expr.length === 2) {
                return ["sum(", expr[0], ",", expr[1], ")"].join("");
            } else {
                var m = expr.length>>1;
                return ["sum(", generateSum(expr.slice(0, m)), ",", generateSum(expr.slice(m)), ")"].join("");
            }
        };

        var determinant = function(m) {
            if(m.length === 2) {
                return [["sum(prod(", m[0][0], ",", m[1][1], "),prod(-", m[0][1], ",", m[1][0], "))"].join("")];
            } else {
                var expr = [];
                for(var i=0; i<m.length; ++i) {
                    expr.push(["scale(", generateSum(determinant(cofactor(m, i))), ",", sign(i), m[0][i], ")"].join(""));
                }
                return expr;
            }
        };

        var orientation = function(n) {
            var pos = [];
            var neg = [];
            var m = matrix(n);
            var args = [];
            for(var i=0; i<n; ++i) {
                if((i&1)===0) {
                    pos.push.apply(pos, determinant(cofactor(m, i)));
                } else {
                    neg.push.apply(neg, determinant(cofactor(m, i)));
                }
                args.push("m" + i);
            }
            var posExpr = generateSum(pos);
            var negExpr = generateSum(neg);
            var funcName = "orientation" + n + "Exact";
            var code = [
                "function ",
                funcName,
                "(", args.join(), "){var p=",
                posExpr,
                ",n=",
                negExpr,
                ",d=sub(p,n);return d[d.length-1];};return ",
                funcName
            ].join("");
            var proc = new Function("sum", "prod", "scale", "sub", code);
            return proc(robustSum, twoProduct, robustScale, robustSubtract);
        };

        var orient;
        var orientation3Exact = orientation(3);
        var orientation4Exact = orientation(4);

        var CACHED = [
            function orientation0() { return 0; },
            function orientation1() { return 0; },
            function orientation2(a, b) {
                return b[0] - a[0];
            },
            function orientation3(a, b, c) {
                var l = (a[1] - c[1]) * (b[0] - c[0]);
                var r = (a[0] - c[0]) * (b[1] - c[1]);
                var det = l - r;
                var s;
                if(l > 0) {
                    if(r <= 0) {
                        return det;
                    } else {
                        s = l + r;
                    }
                } else if(l < 0) {
                    if(r >= 0) {
                        return det;
                    } else {
                        s = -(l + r);
                    }
                } else {
                    return det;
                }
                var tol = ERRBOUND3 * s;
                if(det >= tol || det <= -tol) {
                    return det;
                }
                return orientation3Exact(a, b, c);
            },
            function orientation4(a,b,c,d) {
                var adx = a[0] - d[0];
                var bdx = b[0] - d[0];
                var cdx = c[0] - d[0];
                var ady = a[1] - d[1];
                var bdy = b[1] - d[1];
                var cdy = c[1] - d[1];
                var adz = a[2] - d[2];
                var bdz = b[2] - d[2];
                var cdz = c[2] - d[2];
                var bdxcdy = bdx * cdy;
                var cdxbdy = cdx * bdy;
                var cdxady = cdx * ady;
                var adxcdy = adx * cdy;
                var adxbdy = adx * bdy;
                var bdxady = bdx * ady;
                var det = adz * (bdxcdy - cdxbdy) +
                    bdz * (cdxady - adxcdy) +
                    cdz * (adxbdy - bdxady);
                var permanent = (Math.abs(bdxcdy) + Math.abs(cdxbdy)) * Math.abs(adz) +
                    (Math.abs(cdxady) + Math.abs(adxcdy)) * Math.abs(bdz) +
                    (Math.abs(adxbdy) + Math.abs(bdxady)) * Math.abs(cdz);
                var tol = ERRBOUND4 * permanent;
                if ((det > tol) || (-det > tol)) {
                    return det;
                }
                return orientation4Exact(a,b,c,d);
            }
        ];

        var slowOrient = function(args) {
            var proc = CACHED[args.length];
            if(!proc) {
                proc = CACHED[args.length] = orientation(args.length);
            }
            return proc.apply(undefined, args);
        };

        var generateOrientationProc = function() {
            while(CACHED.length <= NUM_EXPAND) {
                CACHED.push(orientation(CACHED.length));
            }
            var args = [];
            var procArgs = ["slow"];
            for(var i=0; i<=NUM_EXPAND; ++i) {
                args.push("a" + i);
                procArgs.push("o" + i);
            }
            var code = [
                "function getOrientation(",
                args.join(),
                "){switch(arguments.length){case 0:case 1:return 0;"
            ];
            for(i=2; i<=NUM_EXPAND; ++i) {
                code.push("case ", i, ":return o", i, "(", args.slice(0, i).join(), ");");
            }
            code.push("}var s=new Array(arguments.length);for(var i=0;i<arguments.length;++i){s[i]=arguments[i]};return slow(s);}return getOrientation");
            procArgs.push(code.join(""));

            var proc = Function.apply(undefined, procArgs);
            orient = proc.apply(undefined, [slowOrient].concat(CACHED));
            for(i=0; i<=NUM_EXPAND; ++i) {
                orient[i] = CACHED[i];
            }
        };

        generateOrientationProc();

        var robustPointInPolygon = function(vs, point) {
            // transform from geolib format to array syntax
            var x = geolib.longitude(point);
            var y = geolib.latitude(point);
            var coords = vs.map(function(coords) {
                return [geolib.longitude(coords), geolib.latitude(coords)];
            });

            vs = coords;
            point = [x,y];

            var n = vs.length;
            var inside = 1;
            var lim = n;

            var s, c, yk, px, p;

            for(var i = 0, j = n-1; i<lim; j=i++) {
                var a = vs[i];
                var b = vs[j];
                var yi = a[1];
                var yj = b[1];
                if(yj < yi) {
                    if(yj < y && y < yi) {
                        s = orient(a, b, point);
                        if(s === 0) {
                            return 0;
                        } else {
                            inside ^= (0 < s)|0;
                        }
                    } else if(y === yi) {
                        c = vs[(i+1)%n];
                        yk = c[1];
                        if(yi < yk) {
                            s = orient(a, b, point);
                            if(s === 0) {
                                return 0;
                            } else {
                                inside ^= (0 < s)|0;
                            }
                        }
                    }
                } else if(yi < yj) {
                    if(yi < y && y < yj) {
                        s = orient(a, b, point);
                        if(s === 0) {
                            return 0;
                        } else {
                            inside ^= (s < 0)|0;
                        }
                    } else if(y === yi) {
                        c = vs[(i+1)%n];
                        yk = c[1];
                        if(yk < yi) {
                            s = orient(a, b, point);
                            if(s === 0) {
                                return 0;
                            } else {
                                inside ^= (s < 0)|0;
                            }
                        }
                    }
                } else if(y === yi) {
                    var x0 = Math.min(a[0], b[0]);
                    var x1 = Math.max(a[0], b[0]);
                    if(i === 0) {
                        while(j>0) {
                            var k = (j+n-1)%n;
                            p = vs[k];
                            if(p[1] !== y) {
                                break;
                            }
                            px = p[0];
                            x0 = Math.min(x0, px);
                            x1 = Math.max(x1, px);
                            j = k;
                        }
                        if(j === 0) {
                            if(x0 <= x && x <= x1) {
                                return 0;
                            }
                            return 1;
                        }
                        lim = j+1;
                    }
                    var y0 = vs[(j+n-1)%n][1];
                    while(i+1<lim) {
                        p = vs[i+1];
                        if(p[1] !== y) {
                            break;
                        }
                        px = p[0];
                        x0 = Math.min(x0, px);
                        x1 = Math.max(x1, px);
                        i += 1;
                    }
                    if(x0 <= x && x <= x1) {
                        return 0;
                    }
                    var y1 = vs[(i+1)%n][1];
                    if(x < x0 && (y0 < y !== y1 < y)) {
                        inside ^= 1;
                    }
                }
            }
            return 2 * inside - 1;
        };

        return {

            /**
            * @param      object      coordinate to check e.g. {latitude: 51.5023, longitude: 7.3815}
            * @param      array       array with coords e.g. [{latitude: 51.5143, longitude: 7.4138}, {latitude: 123, longitude: 123}, ...]
            * @return     integer     -1 if point is inside, 0 if point is on boundaries, 1 if point is outside
            */
            isPointInsideRobust: function(latlng, coords) {
                return robustPointInPolygon(coords, latlng);
            },

            isInside: function() {
                return this.isPointInsideRobust.apply(this, arguments);
            }

        };

	};


	// Node module
	if (typeof module !== 'undefined' &&
		typeof module.exports !== 'undefined') {

        module.exports = function(geolib) {
            geolib.extend(addOn(geolib), true);
            return geolib;
        };

	// AMD module
	} else if (typeof define === "function" && define.amd) {

		define(["geolib"], function (geolib) {
			geolib.extend(addOn(geolib), true);
			return geolib;
		});

	// we're in a browser
	} else {

		geolib.extend(addOn(geolib), true);

	}

}(this, this.geolib));
/*! geolib.isPointInsideRobust 2.0.23
* !!EXPERIMENTAL!!
*
* Robust version of isPointInside for Geolib.js
*
* Based on https://github.com/mikolalysenko/robust-point-in-polygon
* by Mikola Lysenko, licensed under MIT
*
* @author Manuel Bieh
* @url http://www.manuelbieh.com/
* @version 2.0.23
* @license MIT
*
*/

!function(a,b,c){var d=function(a){var b,d=+(Math.pow(2,27)+1),e=5,f=1.1102230246251565e-16,g=(3+16*f)*f,h=(7+56*f)*f,i=function(a,b,c){var e=a*b,f=d*a,g=f-a,h=f-g,i=a-h,j=d*b,k=j-b,l=j-k,m=b-l,n=e-h*l,o=n-i*l,p=o-h*m,q=i*m-p;return c?(c[0]=q,c[1]=e,c):[q,e]},j=function(a,b,c){var d=a+b,e=d-a,f=d-e,g=b-e,h=a-f;return c?(c[0]=h+g,c[1]=d,c):[h+g,d]},k=j,l=function(a,b){var c=0|a.length,d=0|b.length;if(1===c&&1===d)return p(a[0],b[0]);var e,f,g=c+d,h=new Array(g),i=0,j=0,k=0,l=Math.abs,m=a[j],n=l(m),o=b[k],q=l(o);q>n?(f=m,j+=1,c>j&&(m=a[j],n=l(m))):(f=o,k+=1,d>k&&(o=b[k],q=l(o))),c>j&&q>n||k>=d?(e=m,j+=1,c>j&&(m=a[j],n=l(m))):(e=o,k+=1,d>k&&(o=b[k],q=l(o)));for(var r,s,t,u,v,w=e+f,x=w-e,y=f-x,z=y,A=w;c>j&&d>k;)q>n?(e=m,j+=1,c>j&&(m=a[j],n=l(m))):(e=o,k+=1,d>k&&(o=b[k],q=l(o))),f=z,w=e+f,x=w-e,y=f-x,y&&(h[i++]=y),r=A+w,s=r-A,t=r-s,u=w-s,v=A-t,z=v+u,A=r;for(;c>j;)e=m,f=z,w=e+f,x=w-e,y=f-x,y&&(h[i++]=y),r=A+w,s=r-A,t=r-s,u=w-s,v=A-t,z=v+u,A=r,j+=1,c>j&&(m=a[j]);for(;d>k;)e=o,f=z,w=e+f,x=w-e,y=f-x,y&&(h[i++]=y),r=A+w,s=r-A,t=r-s,u=w-s,v=A-t,z=v+u,A=r,k+=1,d>k&&(o=b[k]);return z&&(h[i++]=z),A&&(h[i++]=A),i||(h[i++]=0),h.length=i,h},m=l,n=function(a,b){var c=a.length;if(1===c){var d=i(a[0],b);return d[0]?d:[d[1]]}var e=new Array(2*c),f=[.1,.1],g=[.1,.1],h=0;i(a[0],b,f),f[0]&&(e[h++]=f[0]);for(var j=1;c>j;++j){i(a[j],b,g);var l=f[1];k(l,g[0],f),f[0]&&(e[h++]=f[0]);var m=g[1],n=f[1],o=m+n,p=o-m,q=n-p;f[1]=o,q&&(e[h++]=q)}return f[1]&&(e[h++]=f[1]),0===h&&(e[h++]=0),e.length=h,e},o=n,p=function(a,b){var c=a+b,d=c-a,e=c-d,f=b-d,g=a-e,h=g+f;return h?[h,c]:[c]},q=function(a,b){var c=0|a.length,d=0|b.length;if(1===c&&1===d)return p(a[0],-b[0]);var e,f,g=c+d,h=new Array(g),i=0,j=0,k=0,l=Math.abs,m=a[j],n=l(m),o=-b[k],q=l(o);q>n?(f=m,j+=1,c>j&&(m=a[j],n=l(m))):(f=o,k+=1,d>k&&(o=-b[k],q=l(o))),c>j&&q>n||k>=d?(e=m,j+=1,c>j&&(m=a[j],n=l(m))):(e=o,k+=1,d>k&&(o=-b[k],q=l(o)));for(var r,s,t,u,v,w=e+f,x=w-e,y=f-x,z=y,A=w;c>j&&d>k;)q>n?(e=m,j+=1,c>j&&(m=a[j],n=l(m))):(e=o,k+=1,d>k&&(o=-b[k],q=l(o))),f=z,w=e+f,x=w-e,y=f-x,y&&(h[i++]=y),r=A+w,s=r-A,t=r-s,u=w-s,v=A-t,z=v+u,A=r;for(;c>j;)e=m,f=z,w=e+f,x=w-e,y=f-x,y&&(h[i++]=y),r=A+w,s=r-A,t=r-s,u=w-s,v=A-t,z=v+u,A=r,j+=1,c>j&&(m=a[j]);for(;d>k;)e=o,f=z,w=e+f,x=w-e,y=f-x,y&&(h[i++]=y),r=A+w,s=r-A,t=r-s,u=w-s,v=A-t,z=v+u,A=r,k+=1,d>k&&(o=-b[k]);return z&&(h[i++]=z),A&&(h[i++]=A),i||(h[i++]=0),h.length=i,h},r=function(a,b){for(var c=new Array(a.length-1),d=1;d<a.length;++d)for(var e=c[d-1]=new Array(a.length-1),f=0,g=0;f<a.length;++f)f!==b&&(e[g++]=a[d][f]);return c},s=function(a){for(var b=new Array(a),c=0;a>c;++c){b[c]=new Array(a);for(var d=0;a>d;++d)b[c][d]=["m",d,"[",a-c-1,"]"].join("")}return b},t=function(a){return 1&a?"-":""},u=function(a){if(1===a.length)return a[0];if(2===a.length)return["sum(",a[0],",",a[1],")"].join("");var b=a.length>>1;return["sum(",u(a.slice(0,b)),",",u(a.slice(b)),")"].join("")},v=function(a){if(2===a.length)return[["sum(prod(",a[0][0],",",a[1][1],"),prod(-",a[0][1],",",a[1][0],"))"].join("")];for(var b=[],c=0;c<a.length;++c)b.push(["scale(",u(v(r(a,c))),",",t(c),a[0][c],")"].join(""));return b},w=function(a){for(var b=[],c=[],d=s(a),e=[],f=0;a>f;++f)0===(1&f)?b.push.apply(b,v(r(d,f))):c.push.apply(c,v(r(d,f))),e.push("m"+f);var g=u(b),h=u(c),j="orientation"+a+"Exact",k=["function ",j,"(",e.join(),"){var p=",g,",n=",h,",d=sub(p,n);return d[d.length-1];};return ",j].join(""),l=new Function("sum","prod","scale","sub",k);return l(m,i,o,q)},x=w(3),y=w(4),z=[function(){return 0},function(){return 0},function(a,b){return b[0]-a[0]},function(a,b,c){var d,e=(a[1]-c[1])*(b[0]-c[0]),f=(a[0]-c[0])*(b[1]-c[1]),h=e-f;if(e>0){if(0>=f)return h;d=e+f}else{if(!(0>e))return h;if(f>=0)return h;d=-(e+f)}var i=g*d;return h>=i||-i>=h?h:x(a,b,c)},function(a,b,c,d){var e=a[0]-d[0],f=b[0]-d[0],g=c[0]-d[0],i=a[1]-d[1],j=b[1]-d[1],k=c[1]-d[1],l=a[2]-d[2],m=b[2]-d[2],n=c[2]-d[2],o=f*k,p=g*j,q=g*i,r=e*k,s=e*j,t=f*i,u=l*(o-p)+m*(q-r)+n*(s-t),v=(Math.abs(o)+Math.abs(p))*Math.abs(l)+(Math.abs(q)+Math.abs(r))*Math.abs(m)+(Math.abs(s)+Math.abs(t))*Math.abs(n),w=h*v;return u>w||-u>w?u:y(a,b,c,d)}],A=function(a){var b=z[a.length];return b||(b=z[a.length]=w(a.length)),b.apply(c,a)},B=function(){for(;z.length<=e;)z.push(w(z.length));for(var a=[],d=["slow"],f=0;e>=f;++f)a.push("a"+f),d.push("o"+f);var g=["function getOrientation(",a.join(),"){switch(arguments.length){case 0:case 1:return 0;"];for(f=2;e>=f;++f)g.push("case ",f,":return o",f,"(",a.slice(0,f).join(),");");g.push("}var s=new Array(arguments.length);for(var i=0;i<arguments.length;++i){s[i]=arguments[i]};return slow(s);}return getOrientation"),d.push(g.join(""));var h=Function.apply(c,d);for(b=h.apply(c,[A].concat(z)),f=0;e>=f;++f)b[f]=z[f]};B();var C=function(c,d){var e=a.longitude(d),f=a.latitude(d),g=c.map(function(b){return[a.longitude(b),a.latitude(b)]});c=g,d=[e,f];for(var h,i,j,k,l,m=c.length,n=1,o=m,p=0,q=m-1;o>p;q=p++){var r=c[p],s=c[q],t=r[1],u=s[1];if(t>u){if(f>u&&t>f){if(h=b(r,s,d),0===h)return 0;n^=h>0|0}else if(f===t&&(i=c[(p+1)%m],j=i[1],j>t)){if(h=b(r,s,d),0===h)return 0;n^=h>0|0}}else if(u>t){if(f>t&&u>f){if(h=b(r,s,d),0===h)return 0;n^=0>h|0}else if(f===t&&(i=c[(p+1)%m],j=i[1],t>j)){if(h=b(r,s,d),0===h)return 0;n^=0>h|0}}else if(f===t){var v=Math.min(r[0],s[0]),w=Math.max(r[0],s[0]);if(0===p){for(;q>0;){var x=(q+m-1)%m;if(l=c[x],l[1]!==f)break;k=l[0],v=Math.min(v,k),w=Math.max(w,k),q=x}if(0===q)return e>=v&&w>=e?0:1;o=q+1}for(var y=c[(q+m-1)%m][1];o>p+1&&(l=c[p+1],l[1]===f);)k=l[0],v=Math.min(v,k),w=Math.max(w,k),p+=1;if(e>=v&&w>=e)return 0;var z=c[(p+1)%m][1];v>e&&f>y!=f>z&&(n^=1)}}return 2*n-1};return{isPointInsideRobust:function(a,b){return C(b,a)},isInside:function(){return this.isPointInsideRobust.apply(this,arguments)}}};"undefined"!=typeof module&&"undefined"!=typeof module.exports?module.exports=function(a){return a.extend(d(a),!0),a}:"function"==typeof define&&define.amd?define(["geolib"],function(a){return a.extend(d(a),!0),a}):b.extend(d(b),!0)}(this,this.geolib);
/*! geolib 2.0.23 by Manuel Bieh
* Library to provide geo functions like distance calculation,
* conversion of decimal coordinates to sexagesimal and vice versa, etc.
* WGS 84 (World Geodetic System 1984)
* 
* @author Manuel Bieh
* @url http://www.manuelbieh.com/
* @version 2.0.23
* @license MIT 
**/
;(function(global, undefined) {

    "use strict";

    function Geolib() {}

    // Constants
    Geolib.TO_RAD = Math.PI / 180;
    Geolib.TO_DEG = 180 / Math.PI;
    Geolib.PI_X2 = Math.PI * 2;
    Geolib.PI_DIV4 = Math.PI / 4;

    // Setting readonly defaults
    var geolib = Object.create(Geolib.prototype, {
        version: {
            value: "2.0.23"
        },
        radius: {
            value: 6378137
        },
        minLat: {
            value: -90
        },
        maxLat: {
            value: 90
        },
        minLon: {
            value: -180
        },
        maxLon: {
            value: 180
        },
        sexagesimalPattern: {
            value: /^([0-9]{1,3})°\s*([0-9]{1,3}(?:\.(?:[0-9]{1,2}))?)'\s*(([0-9]{1,3}(\.([0-9]{1,4}))?)"\s*)?([NEOSW]?)$/
        },
        measures: {
            value: Object.create(Object.prototype, {
                "m" : {value: 1},
                "km": {value: 0.001},
                "cm": {value: 100},
                "mm": {value: 1000},
                "mi": {value: (1 / 1609.344)},
                "sm": {value: (1 / 1852.216)},
                "ft": {value: (100 / 30.48)},
                "in": {value: (100 / 2.54)},
                "yd": {value: (1 / 0.9144)}
            })
        },
        prototype: {
            value: Geolib.prototype
        },
        extend: {
            value: function(methods, overwrite) {
                for(var prop in methods) {
                    if(typeof geolib.prototype[prop] === 'undefined' || overwrite === true) {
                        if(typeof methods[prop] === 'function' && typeof methods[prop].bind === 'function') {
                            geolib.prototype[prop] = methods[prop].bind(geolib);
                        } else {
                            geolib.prototype[prop] = methods[prop];
                        }
                    }
                }
            }
        }
    });

    if (typeof(Number.prototype.toRad) === 'undefined') {
        Number.prototype.toRad = function() {
            return this * Geolib.TO_RAD;
        };
    }

    if (typeof(Number.prototype.toDeg) === 'undefined') {
        Number.prototype.toDeg = function() {
            return this * Geolib.TO_DEG;
        };
    }

    // Here comes the magic
    geolib.extend({

        decimal: {},

        sexagesimal: {},

        distance: null,

        getKeys: function(point) {

            // GeoJSON Array [longitude, latitude(, elevation)]
            if(Object.prototype.toString.call(point) == '[object Array]') {

                return {
                    longitude: point.length >= 1 ? 0 : undefined,
                    latitude: point.length >= 2 ? 1 : undefined,
                    elevation: point.length >= 3 ? 2 : undefined
                };

            }

            var getKey = function(possibleValues) {

                var key;

                possibleValues.every(function(val) {
                    // TODO: check if point is an object
                    if(typeof point != 'object') {
                        return true;
                    }
                    return point.hasOwnProperty(val) ? (function() { key = val; return false; }()) : true;
                });

                return key;

            };

            var longitude = getKey(['lng', 'lon', 'longitude']);
            var latitude = getKey(['lat', 'latitude']);
            var elevation = getKey(['alt', 'altitude', 'elevation', 'elev']);

            // return undefined if not at least one valid property was found
            if(typeof latitude == 'undefined' &&
                typeof longitude == 'undefined' &&
                typeof elevation == 'undefined') {
                return undefined;
            }

            return {
                latitude: latitude,
                longitude: longitude,
                elevation: elevation
            };

        },

        // returns latitude of a given point, converted to decimal
        // set raw to true to avoid conversion
        getLat: function(point, raw) {
            return raw === true ? point[this.getKeys(point).latitude] : this.useDecimal(point[this.getKeys(point).latitude]);
        },

        // Alias for getLat
        latitude: function(point) {
            return this.getLat.call(this, point);
        },

        // returns longitude of a given point, converted to decimal
        // set raw to true to avoid conversion
        getLon: function(point, raw) {
            return raw === true ? point[this.getKeys(point).longitude] : this.useDecimal(point[this.getKeys(point).longitude]);
        },

        // Alias for getLon
        longitude: function(point) {
            return this.getLon.call(this, point);
        },

        getElev: function(point) {
            return point[this.getKeys(point).elevation];
        },

        // Alias for getElev
        elevation: function(point) {
            return this.getElev.call(this, point);
        },

        coords: function(point, raw) {

            var retval = {
                latitude: raw === true ? point[this.getKeys(point).latitude] : this.useDecimal(point[this.getKeys(point).latitude]),
                longitude: raw === true ? point[this.getKeys(point).longitude] : this.useDecimal(point[this.getKeys(point).longitude])
            };

            var elev = point[this.getKeys(point).elevation];

            if(typeof elev !== 'undefined') {
                retval['elevation'] = elev;
            }

            return retval;

        },

        // Alias for coords
        ll: function(point, raw) {
            return this.coords.call(this, point, raw);
        },


        // checks if a variable contains a valid latlong object
        validate: function(point) {

            var keys = this.getKeys(point);

            if(typeof keys === 'undefined' || typeof keys.latitude === 'undefined' || keys.longitude === 'undefined') {
                return false;
            }

            var lat = point[keys.latitude];
            var lng = point[keys.longitude];

            if(typeof lat === 'undefined' || !this.isDecimal(lat) && !this.isSexagesimal(lat)) {
                return false;
            }

            if(typeof lng === 'undefined' || !this.isDecimal(lng) && !this.isSexagesimal(lng)) {
                return false;
            }

            lat = this.useDecimal(lat);
            lng = this.useDecimal(lng);

            if(lat < this.minLat || lat > this.maxLat || lng < this.minLon || lng > this.maxLon) {
                return false;
            }

            return true;

        },

        /**
        * Calculates geodetic distance between two points specified by latitude/longitude using
        * Vincenty inverse formula for ellipsoids
        * Vincenty Inverse Solution of Geodesics on the Ellipsoid (c) Chris Veness 2002-2010
        * (Licensed under CC BY 3.0)
        *
        * @param    object    Start position {latitude: 123, longitude: 123}
        * @param    object    End position {latitude: 123, longitude: 123}
        * @param    integer   Accuracy (in meters)
        * @param    integer   Precision (in decimal cases)
        * @return   integer   Distance (in meters)
        */
        getDistance: function(start, end, accuracy, precision) {

            accuracy = Math.floor(accuracy) || 1;
            precision = Math.floor(precision) || 0;

            var s = this.coords(start);
            var e = this.coords(end);

            var a = 6378137, b = 6356752.314245,  f = 1/298.257223563;  // WGS-84 ellipsoid params
            var L = (e['longitude']-s['longitude']).toRad();

            var cosSigma, sigma, sinAlpha, cosSqAlpha, cos2SigmaM, sinSigma;

            var U1 = Math.atan((1-f) * Math.tan(parseFloat(s['latitude']).toRad()));
            var U2 = Math.atan((1-f) * Math.tan(parseFloat(e['latitude']).toRad()));
            var sinU1 = Math.sin(U1), cosU1 = Math.cos(U1);
            var sinU2 = Math.sin(U2), cosU2 = Math.cos(U2);

            var lambda = L, lambdaP, iterLimit = 100;
            do {
                var sinLambda = Math.sin(lambda), cosLambda = Math.cos(lambda);
                sinSigma = (
                    Math.sqrt(
                        (
                            cosU2 * sinLambda
                        ) * (
                            cosU2 * sinLambda
                        ) + (
                            cosU1 * sinU2 - sinU1 * cosU2 * cosLambda
                        ) * (
                            cosU1 * sinU2 - sinU1 * cosU2 * cosLambda
                        )
                    )
                );
                if (sinSigma === 0) {
                    return geolib.distance = 0;  // co-incident points
                }

                cosSigma = sinU1 * sinU2 + cosU1 * cosU2 * cosLambda;
                sigma = Math.atan2(sinSigma, cosSigma);
                sinAlpha = cosU1 * cosU2 * sinLambda / sinSigma;
                cosSqAlpha = 1 - sinAlpha * sinAlpha;
                cos2SigmaM = cosSigma - 2 * sinU1 * sinU2 / cosSqAlpha;

                if (isNaN(cos2SigmaM)) {
                    cos2SigmaM = 0;  // equatorial line: cosSqAlpha=0 (§6)
                }
                var C = (
                    f / 16 * cosSqAlpha * (
                        4 + f * (
                            4 - 3 * cosSqAlpha
                        )
                    )
                );
                lambdaP = lambda;
                lambda = (
                    L + (
                        1 - C
                    ) * f * sinAlpha * (
                        sigma + C * sinSigma * (
                            cos2SigmaM + C * cosSigma * (
                                -1 + 2 * cos2SigmaM * cos2SigmaM
                            )
                        )
                    )
                );

            } while (Math.abs(lambda-lambdaP) > 1e-12 && --iterLimit>0);

            if (iterLimit === 0) {
                return NaN;  // formula failed to converge
            }

            var uSq = (
                cosSqAlpha * (
                    a * a - b * b
                ) / (
                    b*b
                )
            );

            var A = (
                1 + uSq / 16384 * (
                    4096 + uSq * (
                        -768 + uSq * (
                            320 - 175 * uSq
                        )
                    )
                )
            );

            var B = (
                uSq / 1024 * (
                    256 + uSq * (
                        -128 + uSq * (
                            74-47 * uSq
                        )
                    )
                )
            );

            var deltaSigma = (
                B * sinSigma * (
                    cos2SigmaM + B / 4 * (
                        cosSigma * (
                            -1 + 2 * cos2SigmaM * cos2SigmaM
                        ) -B / 6 * cos2SigmaM * (
                            -3 + 4 * sinSigma * sinSigma
                        ) * (
                            -3 + 4 * cos2SigmaM * cos2SigmaM
                        )
                    )
                )
            );

            var distance = b * A * (sigma - deltaSigma);

            distance = distance.toFixed(precision); // round to 1mm precision

            //if (start.hasOwnProperty(elevation) && end.hasOwnProperty(elevation)) {
            if (typeof this.elevation(start) !== 'undefined' && typeof this.elevation(end) !== 'undefined') {
                var climb = Math.abs(this.elevation(start) - this.elevation(end));
                distance = Math.sqrt(distance * distance + climb * climb);
            }

            return this.distance = Math.round(distance * Math.pow(10, precision) / accuracy) * accuracy / Math.pow(10, precision);

            /*
            // note: to return initial/final bearings in addition to distance, use something like:
            var fwdAz = Math.atan2(cosU2*sinLambda,  cosU1*sinU2-sinU1*cosU2*cosLambda);
            var revAz = Math.atan2(cosU1*sinLambda, -sinU1*cosU2+cosU1*sinU2*cosLambda);

            return { distance: s, initialBearing: fwdAz.toDeg(), finalBearing: revAz.toDeg() };
            */

        },


        /**
        * Calculates the distance between two spots.
        * This method is more simple but also far more inaccurate
        *
        * @param    object    Start position {latitude: 123, longitude: 123}
        * @param    object    End position {latitude: 123, longitude: 123}
        * @param    integer   Accuracy (in meters)
        * @return   integer   Distance (in meters)
        */
        getDistanceSimple: function(start, end, accuracy) {

            accuracy = Math.floor(accuracy) || 1;

            var distance =
                Math.round(
                    Math.acos(
                        Math.sin(
                            this.latitude(end).toRad()
                        ) *
                        Math.sin(
                            this.latitude(start).toRad()
                        ) +
                        Math.cos(
                            this.latitude(end).toRad()
                        ) *
                        Math.cos(
                            this.latitude(start).toRad()
                        ) *
                        Math.cos(
                            this.longitude(start).toRad() - this.longitude(end).toRad()
                        )
                    ) * this.radius
                );

            return geolib.distance = Math.floor(Math.round(distance/accuracy)*accuracy);

        },


    /**
        * Calculates the center of a collection of geo coordinates
        *
        * @param        array       Collection of coords [{latitude: 51.510, longitude: 7.1321}, {latitude: 49.1238, longitude: "8° 30' W"}, ...]
        * @return       object      {latitude: centerLat, longitude: centerLng}
        */
        getCenter: function(coords) {

            var coordsArray = coords;
            if(typeof coords === 'object' && !(coords instanceof Array)) {

                coordsArray = [];

                for(var key in coords) {
                    coordsArray.push(
                        this.coords(coords[key])
                    );
                }

            }

            if(!coordsArray.length) {
                return false;
            }

            var X = 0.0;
            var Y = 0.0;
            var Z = 0.0;
            var lat, lon, hyp;

            coordsArray.forEach(function(coord) {

                lat = this.latitude(coord).toRad();
                lon = this.longitude(coord).toRad();

                X += Math.cos(lat) * Math.cos(lon);
                Y += Math.cos(lat) * Math.sin(lon);
                Z += Math.sin(lat);

            }, this);

            var nb_coords = coordsArray.length;
            X = X / nb_coords;
            Y = Y / nb_coords;
            Z = Z / nb_coords;

            lon = Math.atan2(Y, X);
            hyp = Math.sqrt(X * X + Y * Y);
            lat = Math.atan2(Z, hyp);

            return {
                latitude: (lat * Geolib.TO_DEG).toFixed(6),
                longitude: (lon * Geolib.TO_DEG).toFixed(6)
            };

        },


        /**
        * Gets the max and min, latitude, longitude, and elevation (if provided).
        * @param        array       array with coords e.g. [{latitude: 51.5143, longitude: 7.4138}, {latitude: 123, longitude: 123}, ...]
        * @return   object      {maxLat: maxLat,
        *                     minLat: minLat
        *                     maxLng: maxLng,
        *                     minLng: minLng,
        *                     maxElev: maxElev,
        *                     minElev: minElev}
        */
        getBounds: function(coords) {

            if (!coords.length) {
                return false;
            }

            var useElevation = this.elevation(coords[0]);

            var stats = {
                maxLat: -Infinity,
                minLat: Infinity,
                maxLng: -Infinity,
                minLng: Infinity
            };

            if (typeof useElevation != 'undefined') {
                stats.maxElev = 0;
                stats.minElev = Infinity;
            }

            for (var i = 0, l = coords.length; i < l; ++i) {

                stats.maxLat = Math.max(this.latitude(coords[i]), stats.maxLat);
                stats.minLat = Math.min(this.latitude(coords[i]), stats.minLat);
                stats.maxLng = Math.max(this.longitude(coords[i]), stats.maxLng);
                stats.minLng = Math.min(this.longitude(coords[i]), stats.minLng);

                if (useElevation) {
                    stats.maxElev = Math.max(this.elevation(coords[i]), stats.maxElev);
                    stats.minElev = Math.min(this.elevation(coords[i]), stats.minElev);
                }

            }

            return stats;

        },

        /**
        * Calculates the center of the bounds of geo coordinates.
        *
        * On polygons like political borders (eg. states)
        * this may gives a closer result to human expectation, than `getCenter`,
        * because that function can be disturbed by uneven distribution of
        * point in different sides.
        * Imagine the US state Oklahoma: `getCenter` on that gives a southern
        * point, because the southern border contains a lot more nodes,
        * than the others.
        *
        * @param        array       Collection of coords [{latitude: 51.510, longitude: 7.1321}, {latitude: 49.1238, longitude: "8° 30' W"}, ...]
        * @return       object      {latitude: centerLat, longitude: centerLng}
        */
        getCenterOfBounds: function(coords) {
            var b = this.getBounds(coords);
            var latitude = b.minLat + ((b.maxLat - b.minLat) / 2);
            var longitude = b.minLng + ((b.maxLng - b.minLng) / 2);
            return {
                latitude: parseFloat(latitude.toFixed(6)),
                longitude: parseFloat(longitude.toFixed(6))
            };
        },


        /**
        * Computes the bounding coordinates of all points on the surface
        * of the earth less than or equal to the specified great circle
        * distance.
        *
        * @param object Point position {latitude: 123, longitude: 123}
        * @param number Distance (in meters).
        * @return array Collection of two points defining the SW and NE corners.
        */
        getBoundsOfDistance: function(point, distance) {

            var latitude = this.latitude(point);
            var longitude = this.longitude(point);

            var radLat = latitude.toRad();
            var radLon = longitude.toRad();

            var radDist = distance / this.radius;
            var minLat = radLat - radDist;
            var maxLat = radLat + radDist;

            var MAX_LAT_RAD = this.maxLat.toRad();
            var MIN_LAT_RAD = this.minLat.toRad();
            var MAX_LON_RAD = this.maxLon.toRad();
            var MIN_LON_RAD = this.minLon.toRad();

            var minLon;
            var maxLon;

            if (minLat > MIN_LAT_RAD && maxLat < MAX_LAT_RAD) {

                var deltaLon = Math.asin(Math.sin(radDist) / Math.cos(radLat));
                minLon = radLon - deltaLon;

                if (minLon < MIN_LON_RAD) {
                    minLon += Geolib.PI_X2;
                }

                maxLon = radLon + deltaLon;

                if (maxLon > MAX_LON_RAD) {
                    maxLon -= Geolib.PI_X2;
                }

            } else {
                // A pole is within the distance.
                minLat = Math.max(minLat, MIN_LAT_RAD);
                maxLat = Math.min(maxLat, MAX_LAT_RAD);
                minLon = MIN_LON_RAD;
                maxLon = MAX_LON_RAD;
            }

            return [
                // Southwest
                {
                    latitude: minLat.toDeg(),
                    longitude: minLon.toDeg()
                },
                // Northeast
                {
                    latitude: maxLat.toDeg(),
                    longitude: maxLon.toDeg()
                }
            ];

        },


        /**
        * Checks whether a point is inside of a polygon or not.
        * Note that the polygon coords must be in correct order!
        *
        * @param        object      coordinate to check e.g. {latitude: 51.5023, longitude: 7.3815}
        * @param        array       array with coords e.g. [{latitude: 51.5143, longitude: 7.4138}, {latitude: 123, longitude: 123}, ...]
        * @return       bool        true if the coordinate is inside the given polygon
        */
        isPointInside: function(latlng, coords) {

            for(var c = false, i = -1, l = coords.length, j = l - 1; ++i < l; j = i) {

                if(
                    (
                        (this.longitude(coords[i]) <= this.longitude(latlng) && this.longitude(latlng) < this.longitude(coords[j])) ||
                        (this.longitude(coords[j]) <= this.longitude(latlng) && this.longitude(latlng) < this.longitude(coords[i]))
                    ) &&
                    (
                        this.latitude(latlng) < (this.latitude(coords[j]) - this.latitude(coords[i])) *
                        (this.longitude(latlng) - this.longitude(coords[i])) /
                        (this.longitude(coords[j]) - this.longitude(coords[i])) +
                        this.latitude(coords[i])
                    )
                ) {
                    c = !c;
                }

            }

            return c;

        },


       /**
        * Pre calculate the polygon coords, to speed up the point inside check.
        * Use this function before calling isPointInsideWithPreparedPolygon()
        * @see          Algorythm from http://alienryderflex.com/polygon/
        * @param        array       array with coords e.g. [{latitude: 51.5143, longitude: 7.4138}, {latitude: 123, longitude: 123}, ...]
        */
        preparePolygonForIsPointInsideOptimized: function(coords) {

            for(var i = 0, j = coords.length-1; i < coords.length; i++) {

            if(this.longitude(coords[j]) === this.longitude(coords[i])) {

                    coords[i].constant = this.latitude(coords[i]);
                    coords[i].multiple = 0;

                } else {

                    coords[i].constant = this.latitude(coords[i]) - (
                        this.longitude(coords[i]) * this.latitude(coords[j])
                    ) / (
                        this.longitude(coords[j]) - this.longitude(coords[i])
                    ) + (
                        this.longitude(coords[i])*this.latitude(coords[i])
                    ) / (
                        this.longitude(coords[j])-this.longitude(coords[i])
                    );

                    coords[i].multiple = (
                        this.latitude(coords[j])-this.latitude(coords[i])
                    ) / (
                        this.longitude(coords[j])-this.longitude(coords[i])
                    );

                }

                j=i;

            }

        },

      /**
       * Checks whether a point is inside of a polygon or not.
       * "This is useful if you have many points that need to be tested against the same (static) polygon."
       * Please call the function preparePolygonForIsPointInsideOptimized() with the same coords object before using this function.
       * Note that the polygon coords must be in correct order!
       *
       * @see          Algorythm from http://alienryderflex.com/polygon/
       *
       * @param     object      coordinate to check e.g. {latitude: 51.5023, longitude: 7.3815}
       * @param     array       array with coords e.g. [{latitude: 51.5143, longitude: 7.4138}, {latitude: 123, longitude: 123}, ...]
       * @return        bool        true if the coordinate is inside the given polygon
       */
        isPointInsideWithPreparedPolygon: function(point, coords) {

            var flgPointInside = false,
            y = this.longitude(point),
            x = this.latitude(point);

            for(var i = 0, j = coords.length-1; i < coords.length; i++) {

                if ((this.longitude(coords[i]) < y && this.longitude(coords[j]) >=y ||
                    this.longitude(coords[j]) < y && this.longitude(coords[i]) >= y)) {

                    flgPointInside^=(y*coords[i].multiple+coords[i].constant < x);

                }

                j=i;

            }

            return flgPointInside;

        },


        /**
        * Shortcut for geolib.isPointInside()
        */
        isInside: function() {
            return this.isPointInside.apply(this, arguments);
        },


        /**
        * Checks whether a point is inside of a circle or not.
        *
        * @param        object      coordinate to check (e.g. {latitude: 51.5023, longitude: 7.3815})
        * @param        object      coordinate of the circle's center (e.g. {latitude: 51.4812, longitude: 7.4025})
        * @param        integer     maximum radius in meters
        * @return       bool        true if the coordinate is within the given radius
        */
        isPointInCircle: function(latlng, center, radius) {
            return this.getDistance(latlng, center) < radius;
        },


        /**
        * Shortcut for geolib.isPointInCircle()
        */
        withinRadius: function() {
            return this.isPointInCircle.apply(this, arguments);
        },


        /**
        * Gets rhumb line bearing of two points. Find out about the difference between rhumb line and
        * great circle bearing on Wikipedia. It's quite complicated. Rhumb line should be fine in most cases:
        *
        * http://en.wikipedia.org/wiki/Rhumb_line#General_and_mathematical_description
        *
        * Function heavily based on Doug Vanderweide's great PHP version (licensed under GPL 3.0)
        * http://www.dougv.com/2009/07/13/calculating-the-bearing-and-compass-rose-direction-between-two-latitude-longitude-coordinates-in-php/
        *
        * @param        object      origin coordinate (e.g. {latitude: 51.5023, longitude: 7.3815})
        * @param        object      destination coordinate
        * @return       integer     calculated bearing
        */
        getRhumbLineBearing: function(originLL, destLL) {

            // difference of longitude coords
            var diffLon = this.longitude(destLL).toRad() - this.longitude(originLL).toRad();

            // difference latitude coords phi
            var diffPhi = Math.log(
                Math.tan(
                    this.latitude(destLL).toRad() / 2 + Geolib.PI_DIV4
                ) /
                Math.tan(
                    this.latitude(originLL).toRad() / 2 + Geolib.PI_DIV4
                )
            );

            // recalculate diffLon if it is greater than pi
            if(Math.abs(diffLon) > Math.PI) {
                if(diffLon > 0) {
                    diffLon = (Geolib.PI_X2 - diffLon) * -1;
                }
                else {
                    diffLon = Geolib.PI_X2 + diffLon;
                }
            }

            //return the angle, normalized
            return (Math.atan2(diffLon, diffPhi).toDeg() + 360) % 360;

        },


        /**
        * Gets great circle bearing of two points. See description of getRhumbLineBearing for more information
        *
        * @param        object      origin coordinate (e.g. {latitude: 51.5023, longitude: 7.3815})
        * @param        object      destination coordinate
        * @return       integer     calculated bearing
        */
        getBearing: function(originLL, destLL) {

            destLL['latitude'] = this.latitude(destLL);
            destLL['longitude'] = this.longitude(destLL);
            originLL['latitude'] = this.latitude(originLL);
            originLL['longitude'] = this.longitude(originLL);

            var bearing = (
                (
                    Math.atan2(
                        Math.sin(
                            destLL['longitude'].toRad() -
                            originLL['longitude'].toRad()
                        ) *
                        Math.cos(
                            destLL['latitude'].toRad()
                        ),
                        Math.cos(
                            originLL['latitude'].toRad()
                        ) *
                        Math.sin(
                            destLL['latitude'].toRad()
                        ) -
                        Math.sin(
                            originLL['latitude'].toRad()
                        ) *
                        Math.cos(
                            destLL['latitude'].toRad()
                        ) *
                        Math.cos(
                            destLL['longitude'].toRad() - originLL['longitude'].toRad()
                        )
                    )
                ).toDeg() + 360
            ) % 360;

            return bearing;

        },


        /**
        * Gets the compass direction from an origin coordinate to a destination coordinate.
        *
        * @param        object      origin coordinate (e.g. {latitude: 51.5023, longitude: 7.3815})
        * @param        object      destination coordinate
        * @param        string      Bearing mode. Can be either circle or rhumbline
        * @return       object      Returns an object with a rough (NESW) and an exact direction (NNE, NE, ENE, E, ESE, etc).
        */
        getCompassDirection: function(originLL, destLL, bearingMode) {

            var direction;
            var bearing;

            if(bearingMode == 'circle') {
                // use great circle bearing
                bearing = this.getBearing(originLL, destLL);
            } else {
                // default is rhumb line bearing
                bearing = this.getRhumbLineBearing(originLL, destLL);
            }

            switch(Math.round(bearing/22.5)) {
                case 1:
                    direction = {exact: "NNE", rough: "N"};
                    break;
                case 2:
                    direction = {exact: "NE", rough: "N"};
                    break;
                case 3:
                    direction = {exact: "ENE", rough: "E"};
                    break;
                case 4:
                    direction = {exact: "E", rough: "E"};
                    break;
                case 5:
                    direction = {exact: "ESE", rough: "E"};
                    break;
                case 6:
                    direction = {exact: "SE", rough: "E"};
                    break;
                case 7:
                    direction = {exact: "SSE", rough: "S"};
                    break;
                case 8:
                    direction = {exact: "S", rough: "S"};
                    break;
                case 9:
                    direction = {exact: "SSW", rough: "S"};
                    break;
                case 10:
                    direction = {exact: "SW", rough: "S"};
                    break;
                case 11:
                    direction = {exact: "WSW", rough: "W"};
                    break;
                case 12:
                    direction = {exact: "W", rough: "W"};
                    break;
                case 13:
                    direction = {exact: "WNW", rough: "W"};
                    break;
                case 14:
                    direction = {exact: "NW", rough: "W"};
                    break;
                case 15:
                    direction = {exact: "NNW", rough: "N"};
                    break;
                default:
                    direction = {exact: "N", rough: "N"};
            }

            direction['bearing'] = bearing;
            return direction;

        },


        /**
        * Shortcut for getCompassDirection
        */
        getDirection: function(originLL, destLL, bearingMode) {
            return this.getCompassDirection.apply(this, arguments);
        },


        /**
        * Sorts an array of coords by distance from a reference coordinate
        *
        * @param        object      reference coordinate e.g. {latitude: 51.5023, longitude: 7.3815}
        * @param        mixed       array or object with coords [{latitude: 51.5143, longitude: 7.4138}, {latitude: 123, longitude: 123}, ...]
        * @return       array       ordered array
        */
        orderByDistance: function(latlng, coords) {

            var coordsArray = Object.keys(coords).map(function(idx) {
                var distance = this.getDistance(latlng, coords[idx]);
                var augmentedCoord = Object.create(coords[idx]);
                augmentedCoord.distance = distance;
                augmentedCoord.key = idx;
                return augmentedCoord;
            }, this);

            return coordsArray.sort(function(a, b) {
                return a.distance - b.distance;
            });

        },

        /**
        * Check if a point lies in line created by two other points
        *
        * @param    object    Point to check: {latitude: 123, longitude: 123}
        * @param    object    Start of line {latitude: 123, longitude: 123}
        * @param    object    End of line {latitude: 123, longitude: 123}
        * @return   boolean
        */
        isPointInLine: function(point, start, end) {

            return (this.getDistance(start, point, 1, 3)+this.getDistance(point, end, 1, 3)).toFixed(3)==this.getDistance(start, end, 1, 3);
        },

                /**
        * Check if a point lies within a given distance from a line created by two other points
        *
        * @param    object    Point to check: {latitude: 123, longitude: 123}
        * @param    object    Start of line {latitude: 123, longitude: 123}
        * @param    object    End of line {latitude: 123, longitude: 123}
        * @pararm   float     maximum distance from line
        * @return   boolean
        */
        isPointNearLine: function(point, start, end, distance) {
            return this.getDistanceFromLine(point, start, end) < distance;
        },

                     /**
        * return the minimum distance from a point to a line
        *
        * @param    object    Point away from line
        * @param    object    Start of line {latitude: 123, longitude: 123}
        * @param    object    End of line {latitude: 123, longitude: 123}
        * @return   float     distance from point to line
        */
        getDistanceFromLine: function(point, start, end) {
            var d1 = this.getDistance(start, point, 1, 3);
            var d2 = this.getDistance(point, end, 1, 3);
            var d3 = this.getDistance(start, end, 1, 3);
            var distance = 0;

            // alpha is the angle between the line from start to point, and from start to end //
            var alpha = Math.acos((d1*d1 + d3*d3 - d2*d2)/(2*d1*d3));
            // beta is the angle between the line from end to point and from end to start //
            var beta = Math.acos((d2*d2 + d3*d3 - d1*d1)/(2*d2*d3));

            // if the angle is greater than 90 degrees, then the minimum distance is the
            // line from the start to the point //
            if(alpha>Math.PI/2) {
                distance = d1;
            }
            // same for the beta //
            else if(beta > Math.PI/2) {
                distance = d2;
            }
            // otherwise the minimum distance is achieved through a line perpendular to the start-end line,
            // which goes from the start-end line to the point //
            else {
                distance = Math.sin(alpha) * d1;
            }

            return distance;
        },

        /**
        * Finds the nearest coordinate to a reference coordinate
        *
        * @param        object      reference coordinate e.g. {latitude: 51.5023, longitude: 7.3815}
        * @param        mixed       array or object with coords [{latitude: 51.5143, longitude: 7.4138}, {latitude: 123, longitude: 123}, ...]
        * @return       array       ordered array
        */
        findNearest: function(latlng, coords, offset, limit) {

            offset = offset || 0;
            limit = limit || 1;
            var ordered = this.orderByDistance(latlng, coords);

            if(limit === 1) {
                return ordered[offset];
            } else {
                return ordered.splice(offset, limit);
            }

        },


        /**
        * Calculates the length of a given path
        *
        * @param        mixed       array or object with coords [{latitude: 51.5143, longitude: 7.4138}, {latitude: 123, longitude: 123}, ...]
        * @return       integer     length of the path (in meters)
        */
        getPathLength: function(coords) {

            var dist = 0;
            var last;

            for (var i = 0, l = coords.length; i < l; ++i) {
                if(last) {
                    //console.log(coords[i], last, this.getDistance(coords[i], last));
                    dist += this.getDistance(this.coords(coords[i]), last);
                }
                last = this.coords(coords[i]);
            }

            return dist;

        },


        /**
        * Calculates the speed between to points within a given time span.
        *
        * @param        object      coords with javascript timestamp {latitude: 51.5143, longitude: 7.4138, time: 1360231200880}
        * @param        object      coords with javascript timestamp {latitude: 51.5502, longitude: 7.4323, time: 1360245600460}
        * @param        object      options (currently "unit" is the only option. Default: km(h));
        * @return       float       speed in unit per hour
        */
        getSpeed: function(start, end, options) {

            var unit = options && options.unit || 'km';

            if(unit == 'mph') {
                unit = 'mi';
            } else if(unit == 'kmh') {
                unit = 'km';
            }

            var distance = geolib.getDistance(start, end);
            var time = ((end.time*1)/1000) - ((start.time*1)/1000);
            var mPerHr = (distance/time)*3600;
            var speed = Math.round(mPerHr * this.measures[unit] * 10000)/10000;
            return speed;

        },


        /**
         * Computes the destination point given an initial point, a distance
         * and a bearing
         *
         * see http://www.movable-type.co.uk/scripts/latlong.html for the original code
         *
         * @param        object     start coordinate (e.g. {latitude: 51.5023, longitude: 7.3815})
         * @param        float      longitude of the inital point in degree
         * @param        float      distance to go from the inital point in meter
         * @param        float      bearing in degree of the direction to go, e.g. 0 = north, 180 = south
         * @param        float      optional (in meter), defaults to mean radius of the earth
         * @return       object     {latitude: destLat (in degree), longitude: destLng (in degree)}
         */
        computeDestinationPoint: function(start, distance, bearing, radius) {

            var lat = this.latitude(start);
            var lng = this.longitude(start);

            radius = (typeof radius === 'undefined') ? this.radius : Number(radius);

            var δ = Number(distance) / radius; // angular distance in radians
            var θ = Number(bearing).toRad();

            var φ1 = Number(lat).toRad();
            var λ1 = Number(lng).toRad();

            var φ2 = Math.asin( Math.sin(φ1)*Math.cos(δ) +
                Math.cos(φ1)*Math.sin(δ)*Math.cos(θ) );
            var λ2 = λ1 + Math.atan2(Math.sin(θ)*Math.sin(δ)*Math.cos(φ1),
                    Math.cos(δ)-Math.sin(φ1)*Math.sin(φ2));
            λ2 = (λ2+3*Math.PI) % (2*Math.PI) - Math.PI; // normalise to -180..+180°

            return {
                latitude: φ2.toDeg(),
                longitude: λ2.toDeg()
            };

        },


        /**
        * Converts a distance from meters to km, mm, cm, mi, ft, in or yd
        *
        * @param        string      Format to be converted in
        * @param        float       Distance in meters
        * @param        float       Decimal places for rounding (default: 4)
        * @return       float       Converted distance
        */
        convertUnit: function(unit, distance, round) {

            if(distance === 0) {

                return 0;

            } else if(typeof distance === 'undefined') {

                if(this.distance === null) {
                    throw new Error('No distance was given');
                } else if(this.distance === 0) {
                    return 0;
                } else {
                    distance = this.distance;
                }

            }

            unit = unit || 'm';
            round = (null == round ? 4 : round);

            if(typeof this.measures[unit] !== 'undefined') {
                return this.round(distance * this.measures[unit], round);
            } else {
                throw new Error('Unknown unit for conversion.');
            }

        },


        /**
        * Checks if a value is in decimal format or, if neccessary, converts to decimal
        *
        * @param        mixed       Value(s) to be checked/converted (array of latlng objects, latlng object, sexagesimal string, float)
        * @return       float       Input data in decimal format
        */
        useDecimal: function(value) {

            if(Object.prototype.toString.call(value) === '[object Array]') {

                var geolib = this;

                value = value.map(function(val) {

                    //if(!isNaN(parseFloat(val))) {
                    if(geolib.isDecimal(val)) {

                        return geolib.useDecimal(val);

                    } else if(typeof val == 'object') {

                        if(geolib.validate(val)) {

                            return geolib.coords(val);

                        } else {

                            for(var prop in val) {
                                val[prop] = geolib.useDecimal(val[prop]);
                            }

                            return val;

                        }

                    } else if(geolib.isSexagesimal(val)) {

                        return geolib.sexagesimal2decimal(val);

                    } else {

                        return val;

                    }

                });

                return value;

            } else if(typeof value === 'object' && this.validate(value)) {

                return this.coords(value);

            } else if(typeof value === 'object') {

                for(var prop in value) {
                    value[prop] = this.useDecimal(value[prop]);
                }

                return value;

            }


            if (this.isDecimal(value)) {

                return parseFloat(value);

            } else if(this.isSexagesimal(value) === true) {

                return parseFloat(this.sexagesimal2decimal(value));

            }

            throw new Error('Unknown format.');

        },

        /**
        * Converts a decimal coordinate value to sexagesimal format
        *
        * @param        float       decimal
        * @return       string      Sexagesimal value (XX° YY' ZZ")
        */
        decimal2sexagesimal: function(dec) {

            if (dec in this.sexagesimal) {
                return this.sexagesimal[dec];
            }

            var tmp = dec.toString().split('.');

            var deg = Math.abs(tmp[0]);
            var min = ('0.' + (tmp[1] || 0))*60;
            var sec = min.toString().split('.');

            min = Math.floor(min);
            sec = (('0.' + (sec[1] || 0)) * 60).toFixed(2);

            this.sexagesimal[dec] = (deg + '° ' + min + "' " + sec + '"');

            return this.sexagesimal[dec];

        },


        /**
        * Converts a sexagesimal coordinate to decimal format
        *
        * @param        float       Sexagesimal coordinate
        * @return       string      Decimal value (XX.XXXXXXXX)
        */
        sexagesimal2decimal: function(sexagesimal) {

            if (sexagesimal in this.decimal) {
                return this.decimal[sexagesimal];
            }

            var regEx = new RegExp(this.sexagesimalPattern);
            var data = regEx.exec(sexagesimal);
            var min = 0, sec = 0;

            if(data) {
                min = parseFloat(data[2]/60);
                sec = parseFloat(data[4]/3600) || 0;
            }

            var dec = ((parseFloat(data[1]) + min + sec)).toFixed(8);
            //var   dec = ((parseFloat(data[1]) + min + sec));

                // South and West are negative decimals
                dec = (data[7] == 'S' || data[7] == 'W') ? parseFloat(-dec) : parseFloat(dec);
                //dec = (data[7] == 'S' || data[7] == 'W') ? -dec : dec;

            this.decimal[sexagesimal] = dec;

            return dec;

        },


        /**
        * Checks if a value is in decimal format
        *
        * @param        string      Value to be checked
        * @return       bool        True if in sexagesimal format
        */
        isDecimal: function(value) {

            value = value.toString().replace(/\s*/, '');

            // looks silly but works as expected
            // checks if value is in decimal format
            return (!isNaN(parseFloat(value)) && parseFloat(value) == value);

        },


        /**
        * Checks if a value is in sexagesimal format
        *
        * @param        string      Value to be checked
        * @return       bool        True if in sexagesimal format
        */
        isSexagesimal: function(value) {

            value = value.toString().replace(/\s*/, '');

            return this.sexagesimalPattern.test(value);

        },

        round: function(value, n) {
            var decPlace = Math.pow(10, n);
            return Math.round(value * decPlace)/decPlace;
        }

    });

    // Node module
    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {

        module.exports = geolib;

        // react native
        if (typeof global === 'object') {
          global.geolib = geolib;
        }

    // AMD module
    } else if (typeof define === "function" && define.amd) {

        define("geolib", [], function () {
            return geolib;
        });

    // we're in a browser
    } else {

        global.geolib = geolib;

    }

}(this));
/*! geolib 2.0.23 by Manuel Bieh
* Library to provide geo functions like distance calculation,
* conversion of decimal coordinates to sexagesimal and vice versa, etc.
* WGS 84 (World Geodetic System 1984)
* 
* @author Manuel Bieh
* @url http://www.manuelbieh.com/
* @version 2.0.23
* @license MIT 
**/

!function(a,b){"use strict";function c(){}c.TO_RAD=Math.PI/180,c.TO_DEG=180/Math.PI,c.PI_X2=2*Math.PI,c.PI_DIV4=Math.PI/4;var d=Object.create(c.prototype,{version:{value:"2.0.23"},radius:{value:6378137},minLat:{value:-90},maxLat:{value:90},minLon:{value:-180},maxLon:{value:180},sexagesimalPattern:{value:/^([0-9]{1,3})°\s*([0-9]{1,3}(?:\.(?:[0-9]{1,2}))?)'\s*(([0-9]{1,3}(\.([0-9]{1,4}))?)"\s*)?([NEOSW]?)$/},measures:{value:Object.create(Object.prototype,{m:{value:1},km:{value:.001},cm:{value:100},mm:{value:1e3},mi:{value:1/1609.344},sm:{value:1/1852.216},ft:{value:100/30.48},"in":{value:100/2.54},yd:{value:1/.9144}})},prototype:{value:c.prototype},extend:{value:function(a,b){for(var c in a)("undefined"==typeof d.prototype[c]||b===!0)&&("function"==typeof a[c]&&"function"==typeof a[c].bind?d.prototype[c]=a[c].bind(d):d.prototype[c]=a[c])}}});"undefined"==typeof Number.prototype.toRad&&(Number.prototype.toRad=function(){return this*c.TO_RAD}),"undefined"==typeof Number.prototype.toDeg&&(Number.prototype.toDeg=function(){return this*c.TO_DEG}),d.extend({decimal:{},sexagesimal:{},distance:null,getKeys:function(a){if("[object Array]"==Object.prototype.toString.call(a))return{longitude:a.length>=1?0:b,latitude:a.length>=2?1:b,elevation:a.length>=3?2:b};var c=function(b){var c;return b.every(function(b){return"object"!=typeof a?!0:a.hasOwnProperty(b)?function(){return c=b,!1}():!0}),c},d=c(["lng","lon","longitude"]),e=c(["lat","latitude"]),f=c(["alt","altitude","elevation","elev"]);return"undefined"==typeof e&&"undefined"==typeof d&&"undefined"==typeof f?b:{latitude:e,longitude:d,elevation:f}},getLat:function(a,b){return b===!0?a[this.getKeys(a).latitude]:this.useDecimal(a[this.getKeys(a).latitude])},latitude:function(a){return this.getLat.call(this,a)},getLon:function(a,b){return b===!0?a[this.getKeys(a).longitude]:this.useDecimal(a[this.getKeys(a).longitude])},longitude:function(a){return this.getLon.call(this,a)},getElev:function(a){return a[this.getKeys(a).elevation]},elevation:function(a){return this.getElev.call(this,a)},coords:function(a,b){var c={latitude:b===!0?a[this.getKeys(a).latitude]:this.useDecimal(a[this.getKeys(a).latitude]),longitude:b===!0?a[this.getKeys(a).longitude]:this.useDecimal(a[this.getKeys(a).longitude])},d=a[this.getKeys(a).elevation];return"undefined"!=typeof d&&(c.elevation=d),c},ll:function(a,b){return this.coords.call(this,a,b)},validate:function(a){var b=this.getKeys(a);if("undefined"==typeof b||"undefined"==typeof b.latitude||"undefined"===b.longitude)return!1;var c=a[b.latitude],d=a[b.longitude];return"undefined"==typeof c||!this.isDecimal(c)&&!this.isSexagesimal(c)?!1:"undefined"==typeof d||!this.isDecimal(d)&&!this.isSexagesimal(d)?!1:(c=this.useDecimal(c),d=this.useDecimal(d),c<this.minLat||c>this.maxLat||d<this.minLon||d>this.maxLon?!1:!0)},getDistance:function(a,b,c,e){c=Math.floor(c)||1,e=Math.floor(e)||0;var f,g,h,i,j,k,l,m=this.coords(a),n=this.coords(b),o=6378137,p=6356752.314245,q=1/298.257223563,r=(n.longitude-m.longitude).toRad(),s=Math.atan((1-q)*Math.tan(parseFloat(m.latitude).toRad())),t=Math.atan((1-q)*Math.tan(parseFloat(n.latitude).toRad())),u=Math.sin(s),v=Math.cos(s),w=Math.sin(t),x=Math.cos(t),y=r,z=100;do{var A=Math.sin(y),B=Math.cos(y);if(k=Math.sqrt(x*A*(x*A)+(v*w-u*x*B)*(v*w-u*x*B)),0===k)return d.distance=0;f=u*w+v*x*B,g=Math.atan2(k,f),h=v*x*A/k,i=1-h*h,j=f-2*u*w/i,isNaN(j)&&(j=0);var C=q/16*i*(4+q*(4-3*i));l=y,y=r+(1-C)*q*h*(g+C*k*(j+C*f*(-1+2*j*j)))}while(Math.abs(y-l)>1e-12&&--z>0);if(0===z)return NaN;var D=i*(o*o-p*p)/(p*p),E=1+D/16384*(4096+D*(-768+D*(320-175*D))),F=D/1024*(256+D*(-128+D*(74-47*D))),G=F*k*(j+F/4*(f*(-1+2*j*j)-F/6*j*(-3+4*k*k)*(-3+4*j*j))),H=p*E*(g-G);if(H=H.toFixed(e),"undefined"!=typeof this.elevation(a)&&"undefined"!=typeof this.elevation(b)){var I=Math.abs(this.elevation(a)-this.elevation(b));H=Math.sqrt(H*H+I*I)}return this.distance=Math.round(H*Math.pow(10,e)/c)*c/Math.pow(10,e)},getDistanceSimple:function(a,b,c){c=Math.floor(c)||1;var e=Math.round(Math.acos(Math.sin(this.latitude(b).toRad())*Math.sin(this.latitude(a).toRad())+Math.cos(this.latitude(b).toRad())*Math.cos(this.latitude(a).toRad())*Math.cos(this.longitude(a).toRad()-this.longitude(b).toRad()))*this.radius);return d.distance=Math.floor(Math.round(e/c)*c)},getCenter:function(a){var b=a;if("object"==typeof a&&!(a instanceof Array)){b=[];for(var d in a)b.push(this.coords(a[d]))}if(!b.length)return!1;var e,f,g,h=0,i=0,j=0;b.forEach(function(a){e=this.latitude(a).toRad(),f=this.longitude(a).toRad(),h+=Math.cos(e)*Math.cos(f),i+=Math.cos(e)*Math.sin(f),j+=Math.sin(e)},this);var k=b.length;return h/=k,i/=k,j/=k,f=Math.atan2(i,h),g=Math.sqrt(h*h+i*i),e=Math.atan2(j,g),{latitude:(e*c.TO_DEG).toFixed(6),longitude:(f*c.TO_DEG).toFixed(6)}},getBounds:function(a){if(!a.length)return!1;var b=this.elevation(a[0]),c={maxLat:-(1/0),minLat:1/0,maxLng:-(1/0),minLng:1/0};"undefined"!=typeof b&&(c.maxElev=0,c.minElev=1/0);for(var d=0,e=a.length;e>d;++d)c.maxLat=Math.max(this.latitude(a[d]),c.maxLat),c.minLat=Math.min(this.latitude(a[d]),c.minLat),c.maxLng=Math.max(this.longitude(a[d]),c.maxLng),c.minLng=Math.min(this.longitude(a[d]),c.minLng),b&&(c.maxElev=Math.max(this.elevation(a[d]),c.maxElev),c.minElev=Math.min(this.elevation(a[d]),c.minElev));return c},getCenterOfBounds:function(a){var b=this.getBounds(a),c=b.minLat+(b.maxLat-b.minLat)/2,d=b.minLng+(b.maxLng-b.minLng)/2;return{latitude:parseFloat(c.toFixed(6)),longitude:parseFloat(d.toFixed(6))}},getBoundsOfDistance:function(a,b){var d,e,f=this.latitude(a),g=this.longitude(a),h=f.toRad(),i=g.toRad(),j=b/this.radius,k=h-j,l=h+j,m=this.maxLat.toRad(),n=this.minLat.toRad(),o=this.maxLon.toRad(),p=this.minLon.toRad();if(k>n&&m>l){var q=Math.asin(Math.sin(j)/Math.cos(h));d=i-q,p>d&&(d+=c.PI_X2),e=i+q,e>o&&(e-=c.PI_X2)}else k=Math.max(k,n),l=Math.min(l,m),d=p,e=o;return[{latitude:k.toDeg(),longitude:d.toDeg()},{latitude:l.toDeg(),longitude:e.toDeg()}]},isPointInside:function(a,b){for(var c=!1,d=-1,e=b.length,f=e-1;++d<e;f=d)(this.longitude(b[d])<=this.longitude(a)&&this.longitude(a)<this.longitude(b[f])||this.longitude(b[f])<=this.longitude(a)&&this.longitude(a)<this.longitude(b[d]))&&this.latitude(a)<(this.latitude(b[f])-this.latitude(b[d]))*(this.longitude(a)-this.longitude(b[d]))/(this.longitude(b[f])-this.longitude(b[d]))+this.latitude(b[d])&&(c=!c);return c},preparePolygonForIsPointInsideOptimized:function(a){for(var b=0,c=a.length-1;b<a.length;b++)this.longitude(a[c])===this.longitude(a[b])?(a[b].constant=this.latitude(a[b]),a[b].multiple=0):(a[b].constant=this.latitude(a[b])-this.longitude(a[b])*this.latitude(a[c])/(this.longitude(a[c])-this.longitude(a[b]))+this.longitude(a[b])*this.latitude(a[b])/(this.longitude(a[c])-this.longitude(a[b])),a[b].multiple=(this.latitude(a[c])-this.latitude(a[b]))/(this.longitude(a[c])-this.longitude(a[b]))),c=b},isPointInsideWithPreparedPolygon:function(a,b){for(var c=!1,d=this.longitude(a),e=this.latitude(a),f=0,g=b.length-1;f<b.length;f++)(this.longitude(b[f])<d&&this.longitude(b[g])>=d||this.longitude(b[g])<d&&this.longitude(b[f])>=d)&&(c^=d*b[f].multiple+b[f].constant<e),g=f;return c},isInside:function(){return this.isPointInside.apply(this,arguments)},isPointInCircle:function(a,b,c){return this.getDistance(a,b)<c},withinRadius:function(){return this.isPointInCircle.apply(this,arguments)},getRhumbLineBearing:function(a,b){var d=this.longitude(b).toRad()-this.longitude(a).toRad(),e=Math.log(Math.tan(this.latitude(b).toRad()/2+c.PI_DIV4)/Math.tan(this.latitude(a).toRad()/2+c.PI_DIV4));return Math.abs(d)>Math.PI&&(d=d>0?-1*(c.PI_X2-d):c.PI_X2+d),(Math.atan2(d,e).toDeg()+360)%360},getBearing:function(a,b){b.latitude=this.latitude(b),b.longitude=this.longitude(b),a.latitude=this.latitude(a),a.longitude=this.longitude(a);var c=(Math.atan2(Math.sin(b.longitude.toRad()-a.longitude.toRad())*Math.cos(b.latitude.toRad()),Math.cos(a.latitude.toRad())*Math.sin(b.latitude.toRad())-Math.sin(a.latitude.toRad())*Math.cos(b.latitude.toRad())*Math.cos(b.longitude.toRad()-a.longitude.toRad())).toDeg()+360)%360;return c},getCompassDirection:function(a,b,c){var d,e;switch(e="circle"==c?this.getBearing(a,b):this.getRhumbLineBearing(a,b),Math.round(e/22.5)){case 1:d={exact:"NNE",rough:"N"};break;case 2:d={exact:"NE",rough:"N"};break;case 3:d={exact:"ENE",rough:"E"};break;case 4:d={exact:"E",rough:"E"};break;case 5:d={exact:"ESE",rough:"E"};break;case 6:d={exact:"SE",rough:"E"};break;case 7:d={exact:"SSE",rough:"S"};break;case 8:d={exact:"S",rough:"S"};break;case 9:d={exact:"SSW",rough:"S"};break;case 10:d={exact:"SW",rough:"S"};break;case 11:d={exact:"WSW",rough:"W"};break;case 12:d={exact:"W",rough:"W"};break;case 13:d={exact:"WNW",rough:"W"};break;case 14:d={exact:"NW",rough:"W"};break;case 15:d={exact:"NNW",rough:"N"};break;default:d={exact:"N",rough:"N"}}return d.bearing=e,d},getDirection:function(a,b,c){return this.getCompassDirection.apply(this,arguments)},orderByDistance:function(a,b){var c=Object.keys(b).map(function(c){var d=this.getDistance(a,b[c]),e=Object.create(b[c]);return e.distance=d,e.key=c,e},this);return c.sort(function(a,b){return a.distance-b.distance})},isPointInLine:function(a,b,c){return(this.getDistance(b,a,1,3)+this.getDistance(a,c,1,3)).toFixed(3)==this.getDistance(b,c,1,3)},isPointNearLine:function(a,b,c,d){return this.getDistanceFromLine(a,b,c)<d},getDistanceFromLine:function(a,b,c){var d=this.getDistance(b,a,1,3),e=this.getDistance(a,c,1,3),f=this.getDistance(b,c,1,3),g=0,h=Math.acos((d*d+f*f-e*e)/(2*d*f)),i=Math.acos((e*e+f*f-d*d)/(2*e*f));return g=h>Math.PI/2?d:i>Math.PI/2?e:Math.sin(h)*d},findNearest:function(a,b,c,d){c=c||0,d=d||1;var e=this.orderByDistance(a,b);return 1===d?e[c]:e.splice(c,d)},getPathLength:function(a){for(var b,c=0,d=0,e=a.length;e>d;++d)b&&(c+=this.getDistance(this.coords(a[d]),b)),b=this.coords(a[d]);return c},getSpeed:function(a,b,c){var e=c&&c.unit||"km";"mph"==e?e="mi":"kmh"==e&&(e="km");var f=d.getDistance(a,b),g=1*b.time/1e3-1*a.time/1e3,h=f/g*3600,i=Math.round(h*this.measures[e]*1e4)/1e4;return i},computeDestinationPoint:function(a,b,c,d){var e=this.latitude(a),f=this.longitude(a);d="undefined"==typeof d?this.radius:Number(d);var g=Number(b)/d,h=Number(c).toRad(),i=Number(e).toRad(),j=Number(f).toRad(),k=Math.asin(Math.sin(i)*Math.cos(g)+Math.cos(i)*Math.sin(g)*Math.cos(h)),l=j+Math.atan2(Math.sin(h)*Math.sin(g)*Math.cos(i),Math.cos(g)-Math.sin(i)*Math.sin(k));return l=(l+3*Math.PI)%(2*Math.PI)-Math.PI,{latitude:k.toDeg(),longitude:l.toDeg()}},convertUnit:function(a,b,c){if(0===b)return 0;if("undefined"==typeof b){if(null===this.distance)throw new Error("No distance was given");if(0===this.distance)return 0;b=this.distance}if(a=a||"m",c=null==c?4:c,"undefined"!=typeof this.measures[a])return this.round(b*this.measures[a],c);throw new Error("Unknown unit for conversion.")},useDecimal:function(a){if("[object Array]"===Object.prototype.toString.call(a)){var b=this;return a=a.map(function(a){if(b.isDecimal(a))return b.useDecimal(a);if("object"==typeof a){if(b.validate(a))return b.coords(a);for(var c in a)a[c]=b.useDecimal(a[c]);return a}return b.isSexagesimal(a)?b.sexagesimal2decimal(a):a})}if("object"==typeof a&&this.validate(a))return this.coords(a);if("object"==typeof a){for(var c in a)a[c]=this.useDecimal(a[c]);return a}if(this.isDecimal(a))return parseFloat(a);if(this.isSexagesimal(a)===!0)return parseFloat(this.sexagesimal2decimal(a));throw new Error("Unknown format.")},decimal2sexagesimal:function(a){if(a in this.sexagesimal)return this.sexagesimal[a];var b=a.toString().split("."),c=Math.abs(b[0]),d=60*("0."+(b[1]||0)),e=d.toString().split(".");return d=Math.floor(d),e=(60*("0."+(e[1]||0))).toFixed(2),this.sexagesimal[a]=c+"° "+d+"' "+e+'"',this.sexagesimal[a]},sexagesimal2decimal:function(a){if(a in this.decimal)return this.decimal[a];var b=new RegExp(this.sexagesimalPattern),c=b.exec(a),d=0,e=0;c&&(d=parseFloat(c[2]/60),e=parseFloat(c[4]/3600)||0);var f=(parseFloat(c[1])+d+e).toFixed(8);return f="S"==c[7]||"W"==c[7]?parseFloat(-f):parseFloat(f),this.decimal[a]=f,f},isDecimal:function(a){return a=a.toString().replace(/\s*/,""),!isNaN(parseFloat(a))&&parseFloat(a)==a},isSexagesimal:function(a){return a=a.toString().replace(/\s*/,""),this.sexagesimalPattern.test(a)},round:function(a,b){var c=Math.pow(10,b);return Math.round(a*c)/c}}),"undefined"!=typeof module&&"undefined"!=typeof module.exports?(module.exports=d,"object"==typeof a&&(a.geolib=d)):"function"==typeof define&&define.amd?define("geolib",[],function(){return d}):a.geolib=d}(this);
// Geolib makes `geolib` global on the window (or global) object, while Meteor expects a file-scoped global variable
geolib = this.geolib;
delete this.geolib;
// package metadata file for Meteor.js
'use strict';

var packageName = 'outatime:geolib';  // https://atmospherejs.com/outatime/geolib

var packageJson = JSON.parse(Npm.require("fs").readFileSync('package.json'));

Package.describe({
  name: packageName,
  summary: 'Geolib - Library to perform geo specific tasks',
  version: packageJson.version,
  documentation: 'meteor/README.md',
  git: 'https://github.com/manuelbieh/geolib.git'
});

Package.onUse(function (api) {
  api.versionsFrom(['METEOR@0.9.0', 'METEOR@1.0']);
  api.export('geolib');
  api.addFiles([
    'dist/geolib.js',
    'meteor/export.js'
  ]);
});

Package.onTest(function (api) {
  api.use(packageName);
  api.use('tinytest');

  api.addFiles('meteor/test.js');
});
'use strict';

Tinytest.add('Geolib.is', function (test) {
  test.equal(geolib.radius, 6378137, {message: 'simple geolib object'});
});
/*! geolib.elevation $version$ by Manuel Bieh
*
* Elevation Addon for Geolib.js
* 
* @author Manuel Bieh
* @url http://www.manuelbieh.com/
* @version $version$
* @license MIT
*/

;(function(global, geolib, undefined) {

	var elevation = {

		/*global google:true geolib:true require:true module:true elevationResult:true */

		/**
		*  @param      Array Collection of coords [{latitude: 51.510, longitude: 7.1321}, {latitude: 49.1238, longitude: "8° 30' W"}, ...]
		*  @return     Array [{lat:#lat, lng:#lng, elev:#elev},....]}
		*/
		getElevation: function() {
			if (typeof global.navigator !== 'undefined') {
				this.getElevationClient.apply(this, arguments);
			} else {
				this.getElevationServer.apply(this, arguments);
			}
		},


		/* Optional elevation addon requires Googlemaps API JS */
		getElevationClient: function(coords, cb) {

			if (!global.google) {
				throw new Error("Google maps api not loaded");
			}

			if (coords.length === 0) {
				return cb(null, null);
			}

			if (coords.length === 1) {
				return cb(new Error("getElevation requires at least 2 points."));
			}

			var path  = [];

			for(var i = 0; i < coords.length; i++) {
				path.push(new google.maps.LatLng(
					this.latitude(coords[i]),
					this.longitude(coords[i])
				));
			}

			var positionalRequest = {
				'path': path,
				'samples': path.length
			};

			var elevationService = new google.maps.ElevationService();
			var geolib = this;

			elevationService.getElevationAlongPath(positionalRequest, function (results, status) {
				geolib.elevationHandler(results, status, coords, cb);
			});

		},


		getElevationServer: function(coords, cb) {

			if (coords.length === 0) {
				return cb(null, null);
			}

			if (coords.length === 1) {
				return cb(new Error("getElevation requires at least 2 points."));
			}

			var gm = require('googlemaps');
			var path  = [];

			for(var i = 0; i < coords.length; i++) {
				path.push(
					this.latitude(coords[i]) + ',' + this.longitude(coords[i])
				);
			}

			var geolib = this;

			gm.elevationFromPath(path.join('|'), path.length, function(err, results) {
				geolib.elevationHandler(results.results, results.status, coords, cb);
			});

		},


		elevationHandler: function(results, status, coords, cb) {

			var latsLngsElevs = [];

			if (status == "OK" ) {

				for (var i = 0; i < results.length; i++) {
					latsLngsElevs.push({
						"lat": this.latitude(coords[i]),
						"lng": this.longitude(coords[i]),
						"elev":results[i].elevation
					});
				}

				cb(null, latsLngsElevs);

			} else {

				cb(new Error("Could not get elevation using Google's API"), elevationResult.status);

			}

		},


		/**
		*  @param      Array [{lat:#lat, lng:#lng, elev:#elev},....]}
		*  @return     Number % grade
		*/
		getGrade: function(coords) {

			var rise = Math.abs(
				this.elevation(coords[coords.length-1]) - this.elevation(coords[0])
			);

			var run = this.getPathLength(coords);

			return Math.floor((rise/run)*100);

		},


		/**
		*  @param      Array [{lat:#lat, lng:#lng, elev:#elev},....]}
		*  @return     Object {gain:#gain, loss:#loss}
		*/
		getTotalElevationGainAndLoss: function(coords) {

			var gain = 0;
			var loss = 0;

			for(var i = 0; i < coords.length - 1; i++) {

				var deltaElev = this.elevation(coords[i]) - this.elevation(coords[i + 1]);

				if (deltaElev > 0) {
					loss += deltaElev;
				} else {
					gain += Math.abs(deltaElev);
				}

			}

			return {
				"gain": gain,
				"loss": loss
			};

		}

	};

	// Node module
	if (typeof module !== 'undefined' && 
		typeof module.exports !== 'undefined') {

		geolib = require('geolib');
		geolib.extend(elevation);

	// AMD module
	} else if (typeof define === "function" && define.amd) {

		define(["geolib"], function (geolib) {
			geolib.extend(elevation);
			return geolib;
		});

	// we're in a browser
	} else {

		geolib.extend(elevation);

	}

}(this, this.geolib));
/*! geolib.isPointInsideRobust $version$
* !!EXPERIMENTAL!!
*
* Robust version of isPointInside for Geolib.js
*
* Based on https://github.com/mikolalysenko/robust-point-in-polygon
* by Mikola Lysenko, licensed under MIT
*
* @author Manuel Bieh
* @url http://www.manuelbieh.com/
* @version $version$
* @license MIT
*
*/

;(function(global, geolib, undefined) {

    var addOn = function(geolib) {

        var SPLITTER = +(Math.pow(2, 27) + 1.0);

        var NUM_EXPAND = 5;
        var EPSILON     = 1.1102230246251565e-16;
        var ERRBOUND3   = (3.0 + 16.0 * EPSILON) * EPSILON;
        var ERRBOUND4   = (7.0 + 56.0 * EPSILON) * EPSILON;

        var twoProduct = function(a, b, result) {
            var x = a * b;
            var c = SPLITTER * a;
            var abig = c - a;
            var ahi = c - abig;
            var alo = a - ahi;
            var d = SPLITTER * b;
            var bbig = d - b;
            var bhi = d - bbig;
            var blo = b - bhi;
            var err1 = x - (ahi * bhi);
            var err2 = err1 - (alo * bhi);
            var err3 = err2 - (ahi * blo);
            var y = alo * blo - err3;
            if(result) {
                result[0] = y;
                result[1] = x;
                return result;
            }
            return [ y, x ];
        };

        var fastTwoSum = function(a, b, result) {
            var x = a + b;
            var bv = x - a;
            var av = x - bv;
            var br = b - bv;
            var ar = a - av;
            if(result) {
                result[0] = ar + br;
                result[1] = x;
                return result;
            }
            return [ar+br, x];
        };

        var twoSum = fastTwoSum;

        var linearExpansionSum = function(e, f) {
            var ne = e.length|0;
            var nf = f.length|0;
            if(ne === 1 && nf === 1) {
                return scalarScalar(e[0], f[0]);
            }
            var n = ne + nf;
            var g = new Array(n);
            var count = 0;
            var eptr = 0;
            var fptr = 0;
            var abs = Math.abs;
            var ei = e[eptr];
            var ea = abs(ei);
            var fi = f[fptr];
            var fa = abs(fi);
            var a, b;
            if(ea < fa) {
                b = ei;
                eptr += 1;
                if(eptr < ne) {
                    ei = e[eptr];
                    ea = abs(ei);
                }
            } else {
                b = fi;
                fptr += 1;
                if(fptr < nf) {
                    fi = f[fptr];
                    fa = abs(fi);
                }
            }
            if((eptr < ne && ea < fa) || (fptr >= nf)) {
                a = ei;
                eptr += 1;
                if(eptr < ne) {
                    ei = e[eptr];
                    ea = abs(ei);
                }
            } else {
                a = fi;
                fptr += 1;
                if(fptr < nf) {
                    fi = f[fptr];
                    fa = abs(fi);
                }
            }
            var x = a + b;
            var bv = x - a;
            var y = b - bv;
            var q0 = y;
            var q1 = x;
            var _x, _bv, _av, _br, _ar;
            while(eptr < ne && fptr < nf) {
                if(ea < fa) {
                    a = ei;
                    eptr += 1;
                    if(eptr < ne) {
                        ei = e[eptr];
                        ea = abs(ei);
                    }
                } else {
                    a = fi;
                    fptr += 1;
                    if(fptr < nf) {
                        fi = f[fptr];
                        fa = abs(fi);
                    }
                }
                b = q0;
                x = a + b;
                bv = x - a;
                y = b - bv;
                if(y) {
                    g[count++] = y;
                }
                _x = q1 + x;
                _bv = _x - q1;
                _av = _x - _bv;
                _br = x - _bv;
                _ar = q1 - _av;
                q0 = _ar + _br;
                q1 = _x;
            }
            while(eptr < ne) {
                a = ei;
                b = q0;
                x = a + b;
                bv = x - a;
                y = b - bv;
                if(y) {
                    g[count++] = y;
                }
                _x = q1 + x;
                _bv = _x - q1;
                _av = _x - _bv;
                _br = x - _bv;
                _ar = q1 - _av;
                q0 = _ar + _br;
                q1 = _x;
                eptr += 1;
                if(eptr < ne) {
                    ei = e[eptr];
                }
            }
            while(fptr < nf) {
                a = fi;
                b = q0;
                x = a + b;
                bv = x - a;
                y = b - bv;
                if(y) {
                    g[count++] = y;
                }
                _x = q1 + x;
                _bv = _x - q1;
                _av = _x - _bv;
                _br = x - _bv;
                _ar = q1 - _av;
                q0 = _ar + _br;
                q1 = _x;
                fptr += 1;
                if(fptr < nf) {
                    fi = f[fptr];
                }
            }
            if(q0) {
                g[count++] = q0;
            }
            if(q1) {
                g[count++] = q1;
            }
            if(!count) {
                g[count++] = 0.0;
            }
            g.length = count;
            return g;
        };

        var robustSum = linearExpansionSum;

        var scaleLinearExpansion = function(e, scale) {
            var n = e.length;
            if(n === 1) {
                var ts = twoProduct(e[0], scale);
                if(ts[0]) {
                    return ts;
                }
                return [ ts[1] ];
            }
            var g = new Array(2 * n);
            var q = [0.1, 0.1];
            var t = [0.1, 0.1];
            var count = 0;
            twoProduct(e[0], scale, q);
            if(q[0]) {
                g[count++] = q[0];
            }
            for(var i=1; i<n; ++i) {
                twoProduct(e[i], scale, t);
                var pq = q[1];
                twoSum(pq, t[0], q);
                if(q[0]) {
                    g[count++] = q[0];
                }
                var a = t[1];
                var b = q[1];
                var x = a + b;
                var bv = x - a;
                var y = b - bv;
                q[1] = x;
                if(y) {
                    g[count++] = y;
                }
            }
            if(q[1]) {
                g[count++] = q[1];
            }
            if(count === 0) {
                g[count++] = 0.0;
            }
            g.length = count;
            return g;
        };

        var robustScale = scaleLinearExpansion;

        var scalarScalar = function(a, b) {
            var x = a + b;
            var bv = x - a;
            var av = x - bv;
            var br = b - bv;
            var ar = a - av;
            var y = ar + br;
            if(y) {
                return [y, x];
            }
            return [x];
        };

        var robustSubtract = function(e, f) {
            var ne = e.length|0;
            var nf = f.length|0;
            if(ne === 1 && nf === 1) {
                return scalarScalar(e[0], -f[0]);
            }
            var n = ne + nf;
            var g = new Array(n);
            var count = 0;
            var eptr = 0;
            var fptr = 0;
            var abs = Math.abs;
            var ei = e[eptr];
            var ea = abs(ei);
            var fi = -f[fptr];
            var fa = abs(fi);
            var a, b;
            if(ea < fa) {
                b = ei;
                eptr += 1;
                if(eptr < ne) {
                    ei = e[eptr];
                    ea = abs(ei);
                }
            } else {
                b = fi;
                fptr += 1;
                if(fptr < nf) {
                    fi = -f[fptr];
                    fa = abs(fi);
                }
            }
            if((eptr < ne && ea < fa) || (fptr >= nf)) {
                a = ei;
                eptr += 1;
                if(eptr < ne) {
                    ei = e[eptr];
                    ea = abs(ei);
                }
            } else {
                a = fi;
                fptr += 1;
                if(fptr < nf) {
                    fi = -f[fptr];
                    fa = abs(fi);
                }
            }
            var x = a + b;
            var bv = x - a;
            var y = b - bv;
            var q0 = y;
            var q1 = x;
            var _x, _bv, _av, _br, _ar;
            while(eptr < ne && fptr < nf) {
                if(ea < fa) {
                    a = ei;
                    eptr += 1;
                    if(eptr < ne) {
                        ei = e[eptr];
                        ea = abs(ei);
                    }
                } else {
                    a = fi;
                    fptr += 1;
                    if(fptr < nf) {
                        fi = -f[fptr];
                        fa = abs(fi);
                    }
                }
                b = q0;
                x = a + b;
                bv = x - a;
                y = b - bv;
                if(y) {
                    g[count++] = y;
                }
                _x = q1 + x;
                _bv = _x - q1;
                _av = _x - _bv;
                _br = x - _bv;
                _ar = q1 - _av;
                q0 = _ar + _br;
                q1 = _x;
            }
            while(eptr < ne) {
                a = ei;
                b = q0;
                x = a + b;
                bv = x - a;
                y = b - bv;
                if(y) {
                    g[count++] = y;
                }
                _x = q1 + x;
                _bv = _x - q1;
                _av = _x - _bv;
                _br = x - _bv;
                _ar = q1 - _av;
                q0 = _ar + _br;
                q1 = _x;
                eptr += 1;
                if(eptr < ne) {
                    ei = e[eptr];
                }
            }
            while(fptr < nf) {
                a = fi;
                b = q0;
                x = a + b;
                bv = x - a;
                y = b - bv;
                if(y) {
                    g[count++] = y;
                }
                _x = q1 + x;
                _bv = _x - q1;
                _av = _x - _bv;
                _br = x - _bv;
                _ar = q1 - _av;
                q0 = _ar + _br;
                q1 = _x;
                fptr += 1;
                if(fptr < nf) {
                    fi = -f[fptr];
                }
            }
            if(q0) {
                g[count++] = q0;
            }
            if(q1) {
                g[count++] = q1;
            }
            if(!count) {
                g[count++] = 0.0;
            }
            g.length = count;
            return g;
        };

        var cofactor = function(m, c) {
            var result = new Array(m.length-1);
            for(var i=1; i<m.length; ++i) {
                var r = result[i-1] = new Array(m.length-1);
                for(var j=0,k=0; j<m.length; ++j) {
                    if(j === c) {
                        continue;
                    }
                    r[k++] = m[i][j];
                }
            }
            return result;
        };

        var matrix = function(n) {
            var result = new Array(n);
            for(var i=0; i<n; ++i) {
                result[i] = new Array(n);
                for(var j=0; j<n; ++j) {
                    result[i][j] = ["m", j, "[", (n-i-1), "]"].join("");
                }
            }
            return result;
        };

        var sign = function(n) {
            if(n & 1) {
                return "-";
            }
            return "";
        };

        var generateSum = function(expr) {
            if(expr.length === 1) {
                return expr[0];
            } else if(expr.length === 2) {
                return ["sum(", expr[0], ",", expr[1], ")"].join("");
            } else {
                var m = expr.length>>1;
                return ["sum(", generateSum(expr.slice(0, m)), ",", generateSum(expr.slice(m)), ")"].join("");
            }
        };

        var determinant = function(m) {
            if(m.length === 2) {
                return [["sum(prod(", m[0][0], ",", m[1][1], "),prod(-", m[0][1], ",", m[1][0], "))"].join("")];
            } else {
                var expr = [];
                for(var i=0; i<m.length; ++i) {
                    expr.push(["scale(", generateSum(determinant(cofactor(m, i))), ",", sign(i), m[0][i], ")"].join(""));
                }
                return expr;
            }
        };

        var orientation = function(n) {
            var pos = [];
            var neg = [];
            var m = matrix(n);
            var args = [];
            for(var i=0; i<n; ++i) {
                if((i&1)===0) {
                    pos.push.apply(pos, determinant(cofactor(m, i)));
                } else {
                    neg.push.apply(neg, determinant(cofactor(m, i)));
                }
                args.push("m" + i);
            }
            var posExpr = generateSum(pos);
            var negExpr = generateSum(neg);
            var funcName = "orientation" + n + "Exact";
            var code = [
                "function ",
                funcName,
                "(", args.join(), "){var p=",
                posExpr,
                ",n=",
                negExpr,
                ",d=sub(p,n);return d[d.length-1];};return ",
                funcName
            ].join("");
            var proc = new Function("sum", "prod", "scale", "sub", code);
            return proc(robustSum, twoProduct, robustScale, robustSubtract);
        };

        var orient;
        var orientation3Exact = orientation(3);
        var orientation4Exact = orientation(4);

        var CACHED = [
            function orientation0() { return 0; },
            function orientation1() { return 0; },
            function orientation2(a, b) {
                return b[0] - a[0];
            },
            function orientation3(a, b, c) {
                var l = (a[1] - c[1]) * (b[0] - c[0]);
                var r = (a[0] - c[0]) * (b[1] - c[1]);
                var det = l - r;
                var s;
                if(l > 0) {
                    if(r <= 0) {
                        return det;
                    } else {
                        s = l + r;
                    }
                } else if(l < 0) {
                    if(r >= 0) {
                        return det;
                    } else {
                        s = -(l + r);
                    }
                } else {
                    return det;
                }
                var tol = ERRBOUND3 * s;
                if(det >= tol || det <= -tol) {
                    return det;
                }
                return orientation3Exact(a, b, c);
            },
            function orientation4(a,b,c,d) {
                var adx = a[0] - d[0];
                var bdx = b[0] - d[0];
                var cdx = c[0] - d[0];
                var ady = a[1] - d[1];
                var bdy = b[1] - d[1];
                var cdy = c[1] - d[1];
                var adz = a[2] - d[2];
                var bdz = b[2] - d[2];
                var cdz = c[2] - d[2];
                var bdxcdy = bdx * cdy;
                var cdxbdy = cdx * bdy;
                var cdxady = cdx * ady;
                var adxcdy = adx * cdy;
                var adxbdy = adx * bdy;
                var bdxady = bdx * ady;
                var det = adz * (bdxcdy - cdxbdy) +
                    bdz * (cdxady - adxcdy) +
                    cdz * (adxbdy - bdxady);
                var permanent = (Math.abs(bdxcdy) + Math.abs(cdxbdy)) * Math.abs(adz) +
                    (Math.abs(cdxady) + Math.abs(adxcdy)) * Math.abs(bdz) +
                    (Math.abs(adxbdy) + Math.abs(bdxady)) * Math.abs(cdz);
                var tol = ERRBOUND4 * permanent;
                if ((det > tol) || (-det > tol)) {
                    return det;
                }
                return orientation4Exact(a,b,c,d);
            }
        ];

        var slowOrient = function(args) {
            var proc = CACHED[args.length];
            if(!proc) {
                proc = CACHED[args.length] = orientation(args.length);
            }
            return proc.apply(undefined, args);
        };

        var generateOrientationProc = function() {
            while(CACHED.length <= NUM_EXPAND) {
                CACHED.push(orientation(CACHED.length));
            }
            var args = [];
            var procArgs = ["slow"];
            for(var i=0; i<=NUM_EXPAND; ++i) {
                args.push("a" + i);
                procArgs.push("o" + i);
            }
            var code = [
                "function getOrientation(",
                args.join(),
                "){switch(arguments.length){case 0:case 1:return 0;"
            ];
            for(i=2; i<=NUM_EXPAND; ++i) {
                code.push("case ", i, ":return o", i, "(", args.slice(0, i).join(), ");");
            }
            code.push("}var s=new Array(arguments.length);for(var i=0;i<arguments.length;++i){s[i]=arguments[i]};return slow(s);}return getOrientation");
            procArgs.push(code.join(""));

            var proc = Function.apply(undefined, procArgs);
            orient = proc.apply(undefined, [slowOrient].concat(CACHED));
            for(i=0; i<=NUM_EXPAND; ++i) {
                orient[i] = CACHED[i];
            }
        };

        generateOrientationProc();

        var robustPointInPolygon = function(vs, point) {
            // transform from geolib format to array syntax
            var x = geolib.longitude(point);
            var y = geolib.latitude(point);
            var coords = vs.map(function(coords) {
                return [geolib.longitude(coords), geolib.latitude(coords)];
            });

            vs = coords;
            point = [x,y];

            var n = vs.length;
            var inside = 1;
            var lim = n;

            var s, c, yk, px, p;

            for(var i = 0, j = n-1; i<lim; j=i++) {
                var a = vs[i];
                var b = vs[j];
                var yi = a[1];
                var yj = b[1];
                if(yj < yi) {
                    if(yj < y && y < yi) {
                        s = orient(a, b, point);
                        if(s === 0) {
                            return 0;
                        } else {
                            inside ^= (0 < s)|0;
                        }
                    } else if(y === yi) {
                        c = vs[(i+1)%n];
                        yk = c[1];
                        if(yi < yk) {
                            s = orient(a, b, point);
                            if(s === 0) {
                                return 0;
                            } else {
                                inside ^= (0 < s)|0;
                            }
                        }
                    }
                } else if(yi < yj) {
                    if(yi < y && y < yj) {
                        s = orient(a, b, point);
                        if(s === 0) {
                            return 0;
                        } else {
                            inside ^= (s < 0)|0;
                        }
                    } else if(y === yi) {
                        c = vs[(i+1)%n];
                        yk = c[1];
                        if(yk < yi) {
                            s = orient(a, b, point);
                            if(s === 0) {
                                return 0;
                            } else {
                                inside ^= (s < 0)|0;
                            }
                        }
                    }
                } else if(y === yi) {
                    var x0 = Math.min(a[0], b[0]);
                    var x1 = Math.max(a[0], b[0]);
                    if(i === 0) {
                        while(j>0) {
                            var k = (j+n-1)%n;
                            p = vs[k];
                            if(p[1] !== y) {
                                break;
                            }
                            px = p[0];
                            x0 = Math.min(x0, px);
                            x1 = Math.max(x1, px);
                            j = k;
                        }
                        if(j === 0) {
                            if(x0 <= x && x <= x1) {
                                return 0;
                            }
                            return 1;
                        }
                        lim = j+1;
                    }
                    var y0 = vs[(j+n-1)%n][1];
                    while(i+1<lim) {
                        p = vs[i+1];
                        if(p[1] !== y) {
                            break;
                        }
                        px = p[0];
                        x0 = Math.min(x0, px);
                        x1 = Math.max(x1, px);
                        i += 1;
                    }
                    if(x0 <= x && x <= x1) {
                        return 0;
                    }
                    var y1 = vs[(i+1)%n][1];
                    if(x < x0 && (y0 < y !== y1 < y)) {
                        inside ^= 1;
                    }
                }
            }
            return 2 * inside - 1;
        };

        return {

            /**
            * @param      object      coordinate to check e.g. {latitude: 51.5023, longitude: 7.3815}
            * @param      array       array with coords e.g. [{latitude: 51.5143, longitude: 7.4138}, {latitude: 123, longitude: 123}, ...]
            * @return     integer     -1 if point is inside, 0 if point is on boundaries, 1 if point is outside
            */
            isPointInsideRobust: function(latlng, coords) {
                return robustPointInPolygon(coords, latlng);
            },

            isInside: function() {
                return this.isPointInsideRobust.apply(this, arguments);
            }

        };

	};


	// Node module
	if (typeof module !== 'undefined' &&
		typeof module.exports !== 'undefined') {

        module.exports = function(geolib) {
            geolib.extend(addOn(geolib), true);
            return geolib;
        };

	// AMD module
	} else if (typeof define === "function" && define.amd) {

		define(["geolib"], function (geolib) {
			geolib.extend(addOn(geolib), true);
			return geolib;
		});

	// we're in a browser
	} else {

		geolib.extend(addOn(geolib), true);

	}

}(this, this.geolib));
(function(global, undefined) {
    'use strict';

    function Geolib() {}

    // Constants
    Geolib.TO_RAD = Math.PI / 180;
    Geolib.TO_DEG = 180 / Math.PI;
    Geolib.PI_X2 = Math.PI * 2;
    Geolib.PI_DIV4 = Math.PI / 4;

    // Setting readonly defaults
    var geolib = Object.create(Geolib.prototype, {
        version: {
            value: '$version$',
        },
        radius: {
            value: 6378137,
        },
        minLat: {
            value: -90,
        },
        maxLat: {
            value: 90,
        },
        minLon: {
            value: -180,
        },
        maxLon: {
            value: 180,
        },
        sexagesimalPattern: {
            value: /^([0-9]{1,3})°\s*([0-9]{1,3}(?:\.(?:[0-9]{1,2}))?)'\s*(([0-9]{1,3}(\.([0-9]{1,4}))?)"\s*)?([NEOSW]?)$/,
        },
        measures: {
            value: Object.create(Object.prototype, {
                m: { value: 1 },
                km: { value: 0.001 },
                cm: { value: 100 },
                mm: { value: 1000 },
                mi: { value: 1 / 1609.344 },
                sm: { value: 1 / 1852.216 },
                ft: { value: 100 / 30.48 },
                in: { value: 100 / 2.54 },
                yd: { value: 1 / 0.9144 },
            }),
        },
        prototype: {
            value: Geolib.prototype,
        },
        extend: {
            value: function(methods, overwrite) {
                for (const prop in methods) {
                    if (typeof geolib.prototype[prop] === 'undefined' || overwrite === true) {
                        if (typeof methods[prop] === 'function' && typeof methods[prop].bind === 'function') {
                            geolib.prototype[prop] = methods[prop].bind(geolib);
                        } else {
                            geolib.prototype[prop] = methods[prop];
                        }
                    }
                }
            },
        },
    });

    if (typeof Number.prototype.toRad === 'undefined') {
        Number.prototype.toRad = function() {
            return this * Geolib.TO_RAD;
        };
    }

    if (typeof Number.prototype.toDeg === 'undefined') {
        Number.prototype.toDeg = function() {
            return this * Geolib.TO_DEG;
        };
    }

    // Here comes the magic
    geolib.extend({
        decimal: {},

        sexagesimal: {},

        distance: null,

        getKeys: function(point) {
            // GeoJSON Array [longitude, latitude(, elevation)]
            if (Object.prototype.toString.call(point) == '[object Array]') {
                return {
                    longitude: point.length >= 1 ? 0 : undefined,
                    latitude: point.length >= 2 ? 1 : undefined,
                    elevation: point.length >= 3 ? 2 : undefined,
                };
            }

            const getKey = function(possibleValues) {
                let key;

                possibleValues.every((val) => {
                    // TODO: check if point is an object
                    if (typeof point !== 'object') {
                        return true;
                    }
                    return point.hasOwnProperty(val)
                        ? (function() {
                              key = val;
                              return false;
                          })()
                        : true;
                });

                return key;
            };

            const longitude = getKey(['lng', 'lon', 'longitude']);
            const latitude = getKey(['lat', 'latitude']);
            const elevation = getKey(['alt', 'altitude', 'elevation', 'elev']);

            // return undefined if not at least one valid property was found
            if (
                typeof latitude === 'undefined' &&
                typeof longitude === 'undefined' &&
                typeof elevation === 'undefined'
            ) {
                return undefined;
            }

            return {
                latitude: latitude,
                longitude: longitude,
                elevation: elevation,
            };
        },

        // returns latitude of a given point, converted to decimal
        // set raw to true to avoid conversion
        getLat: function(point, raw) {
            return raw === true
                ? point[this.getKeys(point).latitude]
                : this.useDecimal(point[this.getKeys(point).latitude]);
        },

        // Alias for getLat
        latitude: function(point) {
            return this.getLat.call(this, point);
        },

        // returns longitude of a given point, converted to decimal
        // set raw to true to avoid conversion
        getLon: function(point, raw) {
            return raw === true
                ? point[this.getKeys(point).longitude]
                : this.useDecimal(point[this.getKeys(point).longitude]);
        },

        // Alias for getLon
        longitude: function(point) {
            return this.getLon.call(this, point);
        },

        getElev: function(point) {
            return point[this.getKeys(point).elevation];
        },

        // Alias for getElev
        elevation: function(point) {
            return this.getElev.call(this, point);
        },

        coords: function(point, raw) {
            const retval = {
                latitude:
                    raw === true
                        ? point[this.getKeys(point).latitude]
                        : this.useDecimal(point[this.getKeys(point).latitude]),
                longitude:
                    raw === true
                        ? point[this.getKeys(point).longitude]
                        : this.useDecimal(point[this.getKeys(point).longitude]),
            };

            const elev = point[this.getKeys(point).elevation];

            if (typeof elev !== 'undefined') {
                retval.elevation = elev;
            }

            return retval;
        },

        // Alias for coords
        ll: function(point, raw) {
            return this.coords.call(this, point, raw);
        },

        // checks if a variable contains a valid latlong object
        validate: function(point) {
            const keys = this.getKeys(point);

            if (typeof keys === 'undefined' || typeof keys.latitude === 'undefined' || keys.longitude === 'undefined') {
                return false;
            }

            let lat = point[keys.latitude];
            let lng = point[keys.longitude];

            if (typeof lat === 'undefined' || (!this.isDecimal(lat) && !this.isSexagesimal(lat))) {
                return false;
            }

            if (typeof lng === 'undefined' || (!this.isDecimal(lng) && !this.isSexagesimal(lng))) {
                return false;
            }

            lat = this.useDecimal(lat);
            lng = this.useDecimal(lng);

            if (lat < this.minLat || lat > this.maxLat || lng < this.minLon || lng > this.maxLon) {
                return false;
            }

            return true;
        },

        /**
         * Calculates geodetic distance between two points specified by latitude/longitude using
         * Vincenty inverse formula for ellipsoids
         * Vincenty Inverse Solution of Geodesics on the Ellipsoid (c) Chris Veness 2002-2010
         * (Licensed under CC BY 3.0)
         *
         * @param    object    Start position {latitude: 123, longitude: 123}
         * @param    object    End position {latitude: 123, longitude: 123}
         * @param    integer   Accuracy (in meters)
         * @param    integer   Precision (in decimal cases)
         * @return   integer   Distance (in meters)
         */
        getDistance: function(start, end, accuracy, precision) {
            accuracy = Math.floor(accuracy) || 0.00001;
            precision = Math.floor(precision) || 0;

            const s = this.coords(start);
            const e = this.coords(end);

            let a = 6378137,
                b = 6356752.314245,
                f = 1 / 298.257223563; // WGS-84 ellipsoid params
            const L = (e.longitude - s.longitude).toRad();

            let cosSigma, sigma, sinAlpha, cosSqAlpha, cos2SigmaM, sinSigma;

            const U1 = Math.atan((1 - f) * Math.tan(parseFloat(s.latitude).toRad()));
            const U2 = Math.atan((1 - f) * Math.tan(parseFloat(e.latitude).toRad()));
            let sinU1 = Math.sin(U1),
                cosU1 = Math.cos(U1);
            let sinU2 = Math.sin(U2),
                cosU2 = Math.cos(U2);

            let lambda = L,
                lambdaP,
                iterLimit = 100;
            do {
                let sinLambda = Math.sin(lambda),
                    cosLambda = Math.cos(lambda);
                sinSigma = Math.sqrt(
                    cosU2 * sinLambda * (cosU2 * sinLambda) +
                        (cosU1 * sinU2 - sinU1 * cosU2 * cosLambda) * (cosU1 * sinU2 - sinU1 * cosU2 * cosLambda)
                );
                if (sinSigma === 0) {
                    return (geolib.distance = 0); // co-incident points
                }

                cosSigma = sinU1 * sinU2 + cosU1 * cosU2 * cosLambda;
                sigma = Math.atan2(sinSigma, cosSigma);
                sinAlpha = cosU1 * cosU2 * sinLambda / sinSigma;
                cosSqAlpha = 1 - sinAlpha * sinAlpha;
                cos2SigmaM = cosSigma - 2 * sinU1 * sinU2 / cosSqAlpha;

                if (isNaN(cos2SigmaM)) {
                    cos2SigmaM = 0; // equatorial line: cosSqAlpha=0 (§6)
                }
                const C = f / 16 * cosSqAlpha * (4 + f * (4 - 3 * cosSqAlpha));
                lambdaP = lambda;
                lambda =
                    L +
                    (1 - C) *
                        f *
                        sinAlpha *
                        (sigma + C * sinSigma * (cos2SigmaM + C * cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM)));
            } while (Math.abs(lambda - lambdaP) > 1e-12 && --iterLimit > 0);

            if (iterLimit === 0) {
                return NaN; // formula failed to converge
            }

            const uSq = cosSqAlpha * (a * a - b * b) / (b * b);

            const A = 1 + uSq / 16384 * (4096 + uSq * (-768 + uSq * (320 - 175 * uSq)));

            const B = uSq / 1024 * (256 + uSq * (-128 + uSq * (74 - 47 * uSq)));

            const deltaSigma =
                B *
                sinSigma *
                (cos2SigmaM +
                    B /
                        4 *
                        (cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM) -
                            B / 6 * cos2SigmaM * (-3 + 4 * sinSigma * sinSigma) * (-3 + 4 * cos2SigmaM * cos2SigmaM)));

            let distance = b * A * (sigma - deltaSigma);

            distance = distance.toFixed(precision); // round to 1mm precision

            //if (start.hasOwnProperty(elevation) && end.hasOwnProperty(elevation)) {
            if (typeof this.elevation(start) !== 'undefined' && typeof this.elevation(end) !== 'undefined') {
                const climb = Math.abs(this.elevation(start) - this.elevation(end));
                distance = Math.sqrt(distance * distance + climb * climb);
            }

            return (this.distance =
                Math.round(distance * Math.pow(10, precision) / accuracy) * accuracy / Math.pow(10, precision));

            /*
            // note: to return initial/final bearings in addition to distance, use something like:
            var fwdAz = Math.atan2(cosU2*sinLambda,  cosU1*sinU2-sinU1*cosU2*cosLambda);
            var revAz = Math.atan2(cosU1*sinLambda, -sinU1*cosU2+cosU1*sinU2*cosLambda);

            return { distance: s, initialBearing: fwdAz.toDeg(), finalBearing: revAz.toDeg() };
            */
        },

        /**
         * Calculates the distance between two spots.
         * This method is more simple but also far more inaccurate
         *
         * @param    object    Start position {latitude: 123, longitude: 123}
         * @param    object    End position {latitude: 123, longitude: 123}
         * @param    integer   Accuracy (in meters)
         * @return   integer   Distance (in meters)
         */
        getDistanceSimple: function(start, end, accuracy) {
            accuracy = Math.floor(accuracy) || 1;

            const distance = Math.round(
                Math.acos(
                    Math.sin(this.latitude(end).toRad()) * Math.sin(this.latitude(start).toRad()) +
                        Math.cos(this.latitude(end).toRad()) *
                            Math.cos(this.latitude(start).toRad()) *
                            Math.cos(this.longitude(start).toRad() - this.longitude(end).toRad())
                ) * this.radius
            );

            return (geolib.distance = Math.floor(Math.round(distance / accuracy) * accuracy));
        },

        /**
         * Calculates the center of a collection of geo coordinates
         *
         * @param        array       Collection of coords [{latitude: 51.510, longitude: 7.1321}, {latitude: 49.1238, longitude: "8° 30' W"}, ...]
         * @return       object      {latitude: centerLat, longitude: centerLng}
         */
        getCenter: function(coords) {
            let coordsArray = coords;
            if (typeof coords === 'object' && !(coords instanceof Array)) {
                coordsArray = [];

                for (const key in coords) {
                    coordsArray.push(this.coords(coords[key]));
                }
            }

            if (!coordsArray.length) {
                return false;
            }

            let X = 0.0;
            let Y = 0.0;
            let Z = 0.0;
            let lat, lon, hyp;

            coordsArray.forEach(function(coord) {
                lat = this.latitude(coord).toRad();
                lon = this.longitude(coord).toRad();

                X += Math.cos(lat) * Math.cos(lon);
                Y += Math.cos(lat) * Math.sin(lon);
                Z += Math.sin(lat);
            }, this);

            const nb_coords = coordsArray.length;
            X = X / nb_coords;
            Y = Y / nb_coords;
            Z = Z / nb_coords;

            lon = Math.atan2(Y, X);
            hyp = Math.sqrt(X * X + Y * Y);
            lat = Math.atan2(Z, hyp);

            return {
                latitude: (lat * Geolib.TO_DEG).toFixed(6),
                longitude: (lon * Geolib.TO_DEG).toFixed(6),
            };
        },

        /**
         * Gets the max and min, latitude, longitude, and elevation (if provided).
         * @param        array       array with coords e.g. [{latitude: 51.5143, longitude: 7.4138}, {latitude: 123, longitude: 123}, ...]
         * @return   object      {maxLat: maxLat,
         *                     minLat: minLat
         *                     maxLng: maxLng,
         *                     minLng: minLng,
         *                     maxElev: maxElev,
         *                     minElev: minElev}
         */
        getBounds: function(coords) {
            if (!coords.length) {
                return false;
            }

            const useElevation = this.elevation(coords[0]);

            const stats = {
                maxLat: -Infinity,
                minLat: Infinity,
                maxLng: -Infinity,
                minLng: Infinity,
            };

            if (typeof useElevation !== 'undefined') {
                stats.maxElev = 0;
                stats.minElev = Infinity;
            }

            for (let i = 0, l = coords.length; i < l; ++i) {
                stats.maxLat = Math.max(this.latitude(coords[i]), stats.maxLat);
                stats.minLat = Math.min(this.latitude(coords[i]), stats.minLat);
                stats.maxLng = Math.max(this.longitude(coords[i]), stats.maxLng);
                stats.minLng = Math.min(this.longitude(coords[i]), stats.minLng);

                if (useElevation) {
                    stats.maxElev = Math.max(this.elevation(coords[i]), stats.maxElev);
                    stats.minElev = Math.min(this.elevation(coords[i]), stats.minElev);
                }
            }

            return stats;
        },

        /**
         * Calculates the center of the bounds of geo coordinates.
         *
         * On polygons like political borders (eg. states)
         * this may gives a closer result to human expectation, than `getCenter`,
         * because that function can be disturbed by uneven distribution of
         * point in different sides.
         * Imagine the US state Oklahoma: `getCenter` on that gives a southern
         * point, because the southern border contains a lot more nodes,
         * than the others.
         *
         * @param        array       Collection of coords [{latitude: 51.510, longitude: 7.1321}, {latitude: 49.1238, longitude: "8° 30' W"}, ...]
         * @return       object      {latitude: centerLat, longitude: centerLng}
         */
        getCenterOfBounds: function(coords) {
            const b = this.getBounds(coords);
            const latitude = b.minLat + (b.maxLat - b.minLat) / 2;
            const longitude = b.minLng + (b.maxLng - b.minLng) / 2;
            return {
                latitude: parseFloat(latitude.toFixed(6)),
                longitude: parseFloat(longitude.toFixed(6)),
            };
        },

        /**
         * Computes the bounding coordinates of all points on the surface
         * of the earth less than or equal to the specified great circle
         * distance.
         *
         * @param object Point position {latitude: 123, longitude: 123}
         * @param number Distance (in meters).
         * @return array Collection of two points defining the SW and NE corners.
         */
        getBoundsOfDistance: function(point, distance) {
            const latitude = this.latitude(point);
            const longitude = this.longitude(point);

            const radLat = latitude.toRad();
            const radLon = longitude.toRad();

            const radDist = distance / this.radius;
            let minLat = radLat - radDist;
            let maxLat = radLat + radDist;

            const MAX_LAT_RAD = this.maxLat.toRad();
            const MIN_LAT_RAD = this.minLat.toRad();
            const MAX_LON_RAD = this.maxLon.toRad();
            const MIN_LON_RAD = this.minLon.toRad();

            let minLon;
            let maxLon;

            if (minLat > MIN_LAT_RAD && maxLat < MAX_LAT_RAD) {
                const deltaLon = Math.asin(Math.sin(radDist) / Math.cos(radLat));
                minLon = radLon - deltaLon;

                if (minLon < MIN_LON_RAD) {
                    minLon += Geolib.PI_X2;
                }

                maxLon = radLon + deltaLon;

                if (maxLon > MAX_LON_RAD) {
                    maxLon -= Geolib.PI_X2;
                }
            } else {
                // A pole is within the distance.
                minLat = Math.max(minLat, MIN_LAT_RAD);
                maxLat = Math.min(maxLat, MAX_LAT_RAD);
                minLon = MIN_LON_RAD;
                maxLon = MAX_LON_RAD;
            }

            return [
                // Southwest
                {
                    latitude: minLat.toDeg(),
                    longitude: minLon.toDeg(),
                },
                // Northeast
                {
                    latitude: maxLat.toDeg(),
                    longitude: maxLon.toDeg(),
                },
            ];
        },

        /**
         * Checks whether a point is inside of a polygon or not.
         * Note that the polygon coords must be in correct order!
         *
         * @param        object      coordinate to check e.g. {latitude: 51.5023, longitude: 7.3815}
         * @param        array       array with coords e.g. [{latitude: 51.5143, longitude: 7.4138}, {latitude: 123, longitude: 123}, ...]
         * @return       bool        true if the coordinate is inside the given polygon
         */
        isPointInside: function(latlng, coords) {
            for (var c = false, i = -1, l = coords.length, j = l - 1; ++i < l; j = i) {
                if (
                    ((this.longitude(coords[i]) <= this.longitude(latlng) &&
                        this.longitude(latlng) < this.longitude(coords[j])) ||
                        (this.longitude(coords[j]) <= this.longitude(latlng) &&
                            this.longitude(latlng) < this.longitude(coords[i]))) &&
                    this.latitude(latlng) <
                        (this.latitude(coords[j]) - this.latitude(coords[i])) *
                            (this.longitude(latlng) - this.longitude(coords[i])) /
                            (this.longitude(coords[j]) - this.longitude(coords[i])) +
                            this.latitude(coords[i])
                ) {
                    c = !c;
                }
            }

            return c;
        },

        /**
         * Pre calculate the polygon coords, to speed up the point inside check.
         * Use this function before calling isPointInsideWithPreparedPolygon()
         * @see          Algorythm from http://alienryderflex.com/polygon/
         * @param        array       array with coords e.g. [{latitude: 51.5143, longitude: 7.4138}, {latitude: 123, longitude: 123}, ...]
         */
        preparePolygonForIsPointInsideOptimized: function(coords) {
            for (let i = 0, j = coords.length - 1; i < coords.length; i++) {
                if (this.longitude(coords[j]) === this.longitude(coords[i])) {
                    coords[i].constant = this.latitude(coords[i]);
                    coords[i].multiple = 0;
                } else {
                    coords[i].constant =
                        this.latitude(coords[i]) -
                        this.longitude(coords[i]) *
                            this.latitude(coords[j]) /
                            (this.longitude(coords[j]) - this.longitude(coords[i])) +
                        this.longitude(coords[i]) *
                            this.latitude(coords[i]) /
                            (this.longitude(coords[j]) - this.longitude(coords[i]));

                    coords[i].multiple =
                        (this.latitude(coords[j]) - this.latitude(coords[i])) /
                        (this.longitude(coords[j]) - this.longitude(coords[i]));
                }

                j = i;
            }
        },

        /**
         * Checks whether a point is inside of a polygon or not.
         * "This is useful if you have many points that need to be tested against the same (static) polygon."
         * Please call the function preparePolygonForIsPointInsideOptimized() with the same coords object before using this function.
         * Note that the polygon coords must be in correct order!
         *
         * @see          Algorythm from http://alienryderflex.com/polygon/
         *
         * @param     object      coordinate to check e.g. {latitude: 51.5023, longitude: 7.3815}
         * @param     array       array with coords e.g. [{latitude: 51.5143, longitude: 7.4138}, {latitude: 123, longitude: 123}, ...]
         * @return        bool        true if the coordinate is inside the given polygon
         */
        isPointInsideWithPreparedPolygon: function(point, coords) {
            let flgPointInside = false,
                y = this.longitude(point),
                x = this.latitude(point);

            for (let i = 0, j = coords.length - 1; i < coords.length; i++) {
                if (
                    (this.longitude(coords[i]) < y && this.longitude(coords[j]) >= y) ||
                    (this.longitude(coords[j]) < y && this.longitude(coords[i]) >= y)
                ) {
                    flgPointInside ^= y * coords[i].multiple + coords[i].constant < x;
                }

                j = i;
            }

            return flgPointInside;
        },

        /**
         * Shortcut for geolib.isPointInside()
         */
        isInside: function() {
            return this.isPointInside.apply(this, arguments);
        },

        /**
         * Checks whether a point is inside of a circle or not.
         *
         * @param        object      coordinate to check (e.g. {latitude: 51.5023, longitude: 7.3815})
         * @param        object      coordinate of the circle's center (e.g. {latitude: 51.4812, longitude: 7.4025})
         * @param        integer     maximum radius in meters
         * @return       bool        true if the coordinate is within the given radius
         */
        isPointInCircle: function(latlng, center, radius) {
            return this.getDistance(latlng, center) < radius;
        },

        /**
         * Shortcut for geolib.isPointInCircle()
         */
        withinRadius: function() {
            return this.isPointInCircle.apply(this, arguments);
        },

        /**
         * Gets rhumb line bearing of two points. Find out about the difference between rhumb line and
         * great circle bearing on Wikipedia. It's quite complicated. Rhumb line should be fine in most cases:
         *
         * http://en.wikipedia.org/wiki/Rhumb_line#General_and_mathematical_description
         *
         * Function heavily based on Doug Vanderweide's great PHP version (licensed under GPL 3.0)
         * http://www.dougv.com/2009/07/13/calculating-the-bearing-and-compass-rose-direction-between-two-latitude-longitude-coordinates-in-php/
         *
         * @param        object      origin coordinate (e.g. {latitude: 51.5023, longitude: 7.3815})
         * @param        object      destination coordinate
         * @return       integer     calculated bearing
         */
        getRhumbLineBearing: function(originLL, destLL) {
            // difference of longitude coords
            let diffLon = this.longitude(destLL).toRad() - this.longitude(originLL).toRad();

            // difference latitude coords phi
            const diffPhi = Math.log(
                Math.tan(this.latitude(destLL).toRad() / 2 + Geolib.PI_DIV4) /
                    Math.tan(this.latitude(originLL).toRad() / 2 + Geolib.PI_DIV4)
            );

            // recalculate diffLon if it is greater than pi
            if (Math.abs(diffLon) > Math.PI) {
                if (diffLon > 0) {
                    diffLon = (Geolib.PI_X2 - diffLon) * -1;
                } else {
                    diffLon = Geolib.PI_X2 + diffLon;
                }
            }

            //return the angle, normalized
            return (Math.atan2(diffLon, diffPhi).toDeg() + 360) % 360;
        },

        /**
         * Gets great circle bearing of two points. See description of getRhumbLineBearing for more information
         *
         * @param        object      origin coordinate (e.g. {latitude: 51.5023, longitude: 7.3815})
         * @param        object      destination coordinate
         * @return       integer     calculated bearing
         */
        getBearing: function(originLL, destLL) {
            destLL.latitude = this.latitude(destLL);
            destLL.longitude = this.longitude(destLL);
            originLL.latitude = this.latitude(originLL);
            originLL.longitude = this.longitude(originLL);

            const bearing =
                (Math.atan2(
                    Math.sin(destLL.longitude.toRad() - originLL.longitude.toRad()) * Math.cos(destLL.latitude.toRad()),
                    Math.cos(originLL.latitude.toRad()) * Math.sin(destLL.latitude.toRad()) -
                        Math.sin(originLL.latitude.toRad()) *
                            Math.cos(destLL.latitude.toRad()) *
                            Math.cos(destLL.longitude.toRad() - originLL.longitude.toRad())
                ).toDeg() +
                    360) %
                360;

            return bearing;
        },

        /**
         * Gets the compass direction from an origin coordinate to a destination coordinate.
         *
         * @param        object      origin coordinate (e.g. {latitude: 51.5023, longitude: 7.3815})
         * @param        object      destination coordinate
         * @param        string      Bearing mode. Can be either circle or rhumbline
         * @return       object      Returns an object with a rough (NESW) and an exact direction (NNE, NE, ENE, E, ESE, etc).
         */
        getCompassDirection: function(originLL, destLL, bearingMode) {
            let direction;
            let bearing;

            if (bearingMode == 'circle') {
                // use great circle bearing
                bearing = this.getBearing(originLL, destLL);
            } else {
                // default is rhumb line bearing
                bearing = this.getRhumbLineBearing(originLL, destLL);
            }

            switch (Math.round(bearing / 22.5)) {
                case 1:
                    direction = { exact: 'NNE', rough: 'N' };
                    break;
                case 2:
                    direction = { exact: 'NE', rough: 'N' };
                    break;
                case 3:
                    direction = { exact: 'ENE', rough: 'E' };
                    break;
                case 4:
                    direction = { exact: 'E', rough: 'E' };
                    break;
                case 5:
                    direction = { exact: 'ESE', rough: 'E' };
                    break;
                case 6:
                    direction = { exact: 'SE', rough: 'E' };
                    break;
                case 7:
                    direction = { exact: 'SSE', rough: 'S' };
                    break;
                case 8:
                    direction = { exact: 'S', rough: 'S' };
                    break;
                case 9:
                    direction = { exact: 'SSW', rough: 'S' };
                    break;
                case 10:
                    direction = { exact: 'SW', rough: 'S' };
                    break;
                case 11:
                    direction = { exact: 'WSW', rough: 'W' };
                    break;
                case 12:
                    direction = { exact: 'W', rough: 'W' };
                    break;
                case 13:
                    direction = { exact: 'WNW', rough: 'W' };
                    break;
                case 14:
                    direction = { exact: 'NW', rough: 'W' };
                    break;
                case 15:
                    direction = { exact: 'NNW', rough: 'N' };
                    break;
                default:
                    direction = { exact: 'N', rough: 'N' };
            }

            direction.bearing = bearing;
            return direction;
        },

        /**
         * Shortcut for getCompassDirection
         */
        getDirection: function(originLL, destLL, bearingMode) {
            return this.getCompassDirection.apply(this, arguments);
        },

        /**
         * Sorts an array of coords by distance from a reference coordinate
         *
         * @param        object      reference coordinate e.g. {latitude: 51.5023, longitude: 7.3815}
         * @param        mixed       array or object with coords [{latitude: 51.5143, longitude: 7.4138}, {latitude: 123, longitude: 123}, ...]
         * @return       array       ordered array
         */
        orderByDistance: function(latlng, coords) {
            const coordsArray = Object.keys(coords).map(function(idx) {
                const distance = this.getDistance(latlng, coords[idx]);
                const augmentedCoord = Object.create(coords[idx]);
                augmentedCoord.distance = distance;
                augmentedCoord.key = idx;
                return augmentedCoord;
            }, this);

            return coordsArray.sort((a, b) => {
                return a.distance - b.distance;
            });
        },

        /**
         * Check if a point lies in line created by two other points
         *
         * @param    object    Point to check: {latitude: 123, longitude: 123}
         * @param    object    Start of line {latitude: 123, longitude: 123}
         * @param    object    End of line {latitude: 123, longitude: 123}
         * @return   boolean
         */
        isPointInLine: function(point, start, end) {
            return (
                (this.getDistance(start, point, 1, 3) + this.getDistance(point, end, 1, 3)).toFixed(3) ==
                this.getDistance(start, end, 1, 3)
            );
        },

        /**
         * Check if a point lies within a given distance from a line created by two other points
         *
         * @param    object    Point to check: {latitude: 123, longitude: 123}
         * @param    object    Start of line {latitude: 123, longitude: 123}
         * @param    object    End of line {latitude: 123, longitude: 123}
         * @pararm   float     maximum distance from line
         * @return   boolean
         */
        isPointNearLine: function(point, start, end, distance) {
            return this.getDistanceFromLine(point, start, end) < distance;
        },

        /**
         * return the minimum distance from a point to a line
         *
         * @param    object    Point away from line
         * @param    object    Start of line {latitude: 123, longitude: 123}
         * @param    object    End of line {latitude: 123, longitude: 123}
         * @return   float     distance from point to line
         */
        getDistanceFromLine: function(point, start, end) {
            const d1 = this.getDistance(start, point, 1, 3);
            const d2 = this.getDistance(point, end, 1, 3);
            const d3 = this.getDistance(start, end, 1, 3);
            let distance = 0;

            // alpha is the angle between the line from start to point, and from start to end //
            const alpha = Math.acos((d1 * d1 + d3 * d3 - d2 * d2) / (2 * d1 * d3));
            // beta is the angle between the line from end to point and from end to start //
            const beta = Math.acos((d2 * d2 + d3 * d3 - d1 * d1) / (2 * d2 * d3));

            // if the angle is greater than 90 degrees, then the minimum distance is the
            // line from the start to the point //
            if (alpha > Math.PI / 2) {
                distance = d1;
            } else if (beta > Math.PI / 2) {
                // same for the beta //
                distance = d2;
            } else {
                // otherwise the minimum distance is achieved through a line perpendular to the start-end line,
                // which goes from the start-end line to the point //
                distance = Math.sin(alpha) * d1;
            }

            return distance;
        },

        /**
         * Finds the nearest coordinate to a reference coordinate
         *
         * @param        object      reference coordinate e.g. {latitude: 51.5023, longitude: 7.3815}
         * @param        mixed       array or object with coords [{latitude: 51.5143, longitude: 7.4138}, {latitude: 123, longitude: 123}, ...]
         * @return       array       ordered array
         */
        findNearest: function(latlng, coords, offset, limit) {
            offset = offset || 0;
            limit = limit || 1;
            const ordered = this.orderByDistance(latlng, coords);

            if (limit === 1) {
                return ordered[offset];
            }
            return ordered.splice(offset, limit);
        },

        /**
         * Calculates the length of a given path
         *
         * @param        mixed       array or object with coords [{latitude: 51.5143, longitude: 7.4138}, {latitude: 123, longitude: 123}, ...]
         * @return       integer     length of the path (in meters)
         */
        getPathLength: function(coords) {
            let dist = 0;
            let last;

            for (let i = 0, l = coords.length; i < l; ++i) {
                if (last) {
                    //console.log(coords[i], last, this.getDistance(coords[i], last));
                    dist += this.getDistance(this.coords(coords[i]), last);
                }
                last = this.coords(coords[i]);
            }

            return dist;
        },

        /**
         * Calculates the speed between to points within a given time span.
         *
         * @param        object      coords with javascript timestamp {latitude: 51.5143, longitude: 7.4138, time: 1360231200880}
         * @param        object      coords with javascript timestamp {latitude: 51.5502, longitude: 7.4323, time: 1360245600460}
         * @param        object      options (currently "unit" is the only option. Default: km(h));
         * @return       float       speed in unit per hour
         */
        getSpeed: function(start, end, options) {
            let unit = (options && options.unit) || 'km';

            if (unit == 'mph') {
                unit = 'mi';
            } else if (unit == 'kmh') {
                unit = 'km';
            }

            const distance = geolib.getDistance(start, end);
            const time = Number(end.time) / 1000 - Number(start.time) / 1000;
            const mPerHr = distance / time * 3600;
            const speed = Math.round(mPerHr * this.measures[unit] * 10000) / 10000;
            return speed;
        },

        /**
         * Computes the destination point given an initial point, a distance
         * and a bearing
         *
         * see http://www.movable-type.co.uk/scripts/latlong.html for the original code
         *
         * @param        object     start coordinate (e.g. {latitude: 51.5023, longitude: 7.3815})
         * @param        float      longitude of the inital point in degree
         * @param        float      distance to go from the inital point in meter
         * @param        float      bearing in degree of the direction to go, e.g. 0 = north, 180 = south
         * @param        float      optional (in meter), defaults to mean radius of the earth
         * @return       object     {latitude: destLat (in degree), longitude: destLng (in degree)}
         */
        computeDestinationPoint: function(start, distance, bearing, radius) {
            const lat = this.latitude(start);
            const lng = this.longitude(start);

            radius = typeof radius === 'undefined' ? this.radius : Number(radius);

            const δ = Number(distance) / radius; // angular distance in radians
            const θ = Number(bearing).toRad();

            const φ1 = Number(lat).toRad();
            const λ1 = Number(lng).toRad();

            const φ2 = Math.asin(Math.sin(φ1) * Math.cos(δ) + Math.cos(φ1) * Math.sin(δ) * Math.cos(θ));
            let λ2 =
                λ1 + Math.atan2(Math.sin(θ) * Math.sin(δ) * Math.cos(φ1), Math.cos(δ) - Math.sin(φ1) * Math.sin(φ2));
            λ2 = (λ2 + 3 * Math.PI) % (2 * Math.PI) - Math.PI; // normalise to -180..+180°

            return {
                latitude: φ2.toDeg(),
                longitude: λ2.toDeg(),
            };
        },

        /**
         * Converts a distance from meters to km, mm, cm, mi, ft, in or yd
         *
         * @param        string      Format to be converted in
         * @param        float       Distance in meters
         * @param        float       Decimal places for rounding (default: 4)
         * @return       float       Converted distance
         */
        convertUnit: function(unit, distance, round) {
            if (distance === 0) {
                return 0;
            } else if (typeof distance === 'undefined') {
                if (this.distance === null) {
                    throw new Error('No distance was given');
                } else if (this.distance === 0) {
                    return 0;
                } else {
                    distance = this.distance;
                }
            }

            unit = unit || 'm';
            round = round == null ? 4 : round;

            if (typeof this.measures[unit] !== 'undefined') {
                return this.round(distance * this.measures[unit], round);
            }
            throw new Error('Unknown unit for conversion.');
        },

        /**
         * Checks if a value is in decimal format or, if neccessary, converts to decimal
         *
         * @param        mixed       Value(s) to be checked/converted (array of latlng objects, latlng object, sexagesimal string, float)
         * @return       float       Input data in decimal format
         */
        useDecimal: function(value) {
            if (Object.prototype.toString.call(value) === '[object Array]') {
                const geolib = this;

                value = value.map((val) => {
                    //if(!isNaN(parseFloat(val))) {
                    if (geolib.isDecimal(val)) {
                        return geolib.useDecimal(val);
                    } else if (typeof val === 'object') {
                        if (geolib.validate(val)) {
                            return geolib.coords(val);
                        }
                        for (const prop in val) {
                            val[prop] = geolib.useDecimal(val[prop]);
                        }

                        return val;
                    } else if (geolib.isSexagesimal(val)) {
                        return geolib.sexagesimal2decimal(val);
                    }
                    return val;
                });

                return value;
            } else if (typeof value === 'object' && this.validate(value)) {
                return this.coords(value);
            } else if (typeof value === 'object') {
                for (const prop in value) {
                    value[prop] = this.useDecimal(value[prop]);
                }

                return value;
            }

            if (this.isDecimal(value)) {
                return parseFloat(value);
            } else if (this.isSexagesimal(value) === true) {
                return parseFloat(this.sexagesimal2decimal(value));
            }

            throw new Error('Unknown format.');
        },

        /**
         * Converts a decimal coordinate value to sexagesimal format
         *
         * @param        float       decimal
         * @return       string      Sexagesimal value (XX° YY' ZZ")
         */
        decimal2sexagesimal: function(dec) {
            if (dec in this.sexagesimal) {
                return this.sexagesimal[dec];
            }

            const tmp = dec.toString().split('.');

            const deg = Math.abs(tmp[0]);
            let min = ('0.' + (tmp[1] || 0)) * 60;
            let sec = min.toString().split('.');

            min = Math.floor(min);
            sec = (('0.' + (sec[1] || 0)) * 60).toFixed(2);

            this.sexagesimal[dec] = deg + '° ' + min + "' " + sec + '"';

            return this.sexagesimal[dec];
        },

        /**
         * Converts a sexagesimal coordinate to decimal format
         *
         * @param        float       Sexagesimal coordinate
         * @return       string      Decimal value (XX.XXXXXXXX)
         */
        sexagesimal2decimal: function(sexagesimal) {
            if (sexagesimal in this.decimal) {
                return this.decimal[sexagesimal];
            }

            const regEx = new RegExp(this.sexagesimalPattern);
            const data = regEx.exec(sexagesimal);
            let min = 0,
                sec = 0;

            if (data) {
                min = parseFloat(data[2] / 60);
                sec = parseFloat(data[4] / 3600) || 0;
            }

            let dec = (parseFloat(data[1]) + min + sec).toFixed(8);
            //var   dec = ((parseFloat(data[1]) + min + sec));

            // South and West are negative decimals
            dec = data[7] == 'S' || data[7] == 'W' ? parseFloat(-dec) : parseFloat(dec);
            //dec = (data[7] == 'S' || data[7] == 'W') ? -dec : dec;

            this.decimal[sexagesimal] = dec;

            return dec;
        },

        /**
         * Checks if a value is in decimal format
         *
         * @param        string      Value to be checked
         * @return       bool        True if in sexagesimal format
         */
        isDecimal: function(value) {
            value = value.toString().replace(/\s*/, '');

            // looks silly but works as expected
            // checks if value is in decimal format
            return !isNaN(parseFloat(value)) && parseFloat(value) == value;
        },

        /**
         * Checks if a value is in sexagesimal format
         *
         * @param        string      Value to be checked
         * @return       bool        True if in sexagesimal format
         */
        isSexagesimal: function(value) {
            value = value.toString().replace(/\s*/, '');

            return this.sexagesimalPattern.test(value);
        },

        round: function(value, n) {
            const decPlace = Math.pow(10, n);
            return Math.round(value * decPlace) / decPlace;
        },
    });

    // Node module
    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = geolib;

        // react native
        if (typeof global === 'object') {
            global.geolib = geolib;
        }

        // AMD module
    } else if (typeof define === 'function' && define.amd) {
        define('geolib', [], () => {
            return geolib;
        });

        // we're in a browser
    } else {
        global.geolib = geolib;
    }
})(this);
/*global test:true expect:true geolib:true equal:true asyncTest:true start:true ok:true*/


    var cities = {
        "Berlin": {latitude: 52.518611, longitude: 13.408056},
        "Boston": {latitude: 42.357778, longitude: "71° 3' 34\" W"},
        "Dortmund": {latitude: "51° 31' 10.11\" N", longitude: "7° 28' 01\" E"},
        "London": {latitude: "51° 31' N", longitude: "0° 7' W"},
        "Manchester": {latitude: "53° 29' N", longitude: "2° 14' W"},
        "New York City": {latitude: 40.715517, longitude: -73.9991},
        "San Francisco": {latitude: 37.774514, longitude: -122.418079},
        "Sydney": {latitude: -33.869085, longitude: 151.210046},
        "Moscow": {latitude: 55.751667, longitude: 37.617778}
    };

    var polygon = [{"latitude": 51.513357512, "longitude": 7.45574331},
        {"latitude": 51.515400598, "longitude": 7.45518541},
        {"latitude": 51.516241842, "longitude": 7.456494328},
        {"latitude": 51.516722545, "longitude": 7.459863183},
        {"latitude": 51.517443592, "longitude": 7.463232037},
        {"latitude": 51.5177507, "longitude": 7.464755532},
        {"latitude": 51.517657233, "longitude": 7.466622349},
        {"latitude": 51.51722995, "longitude": 7.468317505},
        {"latitude": 51.516816015, "longitude": 7.47011995},
        {"latitude": 51.516308606, "longitude": 7.471793648},
        {"latitude": 51.515974782, "longitude": 7.472437378},
        {"latitude": 51.515413951, "longitude": 7.472845074},
        {"latitude": 51.514559338, "longitude": 7.472909447},
        {"latitude": 51.512195717, "longitude": 7.472651955},
        {"latitude": 51.511127373, "longitude": 7.47140741},
        {"latitude": 51.51029939, "longitude": 7.469948288},
        {"latitude": 51.509831973, "longitude": 7.468446251},
        {"latitude": 51.509978876, "longitude": 7.462481019},
        {"latitude": 51.510913701, "longitude": 7.460678574},
        {"latitude": 51.511594777, "longitude": 7.459434029},
        {"latitude": 51.512396029, "longitude": 7.457695958},
        {"latitude": 51.513317451, "longitude": 7.45574331}
    ];

    var polygon2 = [
        {"latitude": 51.513357512, "longitude": 7.45574331, "elevation":523.92},
        {"latitude": 51.515400598, "longitude": 7.45518541, "elevation":524.54},
        {"latitude": 51.516241842, "longitude": 7.456494328, "elevation":523.12},
        {"latitude": 51.516722545, "longitude": 7.459863183, "elevation":522.77},
        {"latitude": 51.517443592, "longitude": 7.463232037, "elevation":521.12}
    ];


    function nearlyEqual(result, expected, epsilon) {
        var diff = Math.abs(expected - result);
        ok(diff < epsilon,
           'Expected ' + expected + ', got ' + result + ', diff= ' + diff +
           ' (max diff=' + epsilon + ')');
    }

    test("Testing distance calculation: getDistance()", function() {

        expect(6);

        var distance1 = geolib.getDistance({latitude: 52.518611, longitude: 13.408056}, {latitude: 51.519475, longitude: 7.46694444});
        var distance2 = geolib.getDistance({latitude: 52.518611, longitude: 13.408056}, {latitude: 51.519475, longitude: 7.46694444}, 100);
        var distance3 = geolib.getDistance({latitude: 37.774514, longitude: -122.418079}, {latitude: 51.519475, longitude: 7.46694444});
        var distance4 = geolib.getDistance({"lat": 41.72977, "lng":-111.77621999999997}, {"lat":41.73198,"lng":-111.77636999999999});
        var distance5 = geolib.getDistance({"lat": 41.72977, "lng":-111.77621999999997}, {"lat":41.73198,"lng":-111.77636999999999}, 1, 3);
        var geoJSON = geolib.getDistance([-111.77621999999997, 41.72977], [-111.77636999999999, 41.73198]);

        equal(distance1, 422592, "Distance 1 should be 422592" );
        equal(distance2, 422600, "Distance 2 should be 422600" );
        equal(distance3, 8980260, "Distance 3 should be 8980260" );
        equal(distance4, 246, "Distance 4 should be 246" );
        equal(distance5, 245.777, "Distance 5 should be 245.777" );
        equal(geoJSON, 246, "Testing getDistance() with geoJSON data");

    });

    test("Testing distance calculation: getDistanceSimple()", function() {

        expect(3);

        var distance1 = geolib.getDistanceSimple({latitude: 52.518611, longitude: 13.408056}, {latitude: 51.519475, longitude: 7.46694444});
        var distance2 = geolib.getDistanceSimple({latitude: 52.518611, longitude: 13.408056}, {latitude: 51.519475, longitude: 7.46694444}, 100);
        var distance3 = geolib.getDistanceSimple({latitude: 37.774514, longitude: -122.418079}, {latitude: 51.519475, longitude: 7.46694444});

        equal(distance1, 421786, "Distance 1 should be 421786" );
        equal(distance2, 421800, "Distance 2 should be 421800" );
        equal(distance3, 8967172, "Distance 3 should be 8967172" );

    });

    test("Testing center calculation: getCenter()", function() {

        expect(5);

        var europe = geolib.getCenter([cities["Berlin"], cities["Moscow"]]);
        var pacific = geolib.getCenter([cities["Sydney"], cities["San Francisco"]]);

        var example = geolib.getCenter(cities)

        equal(europe.latitude, 54.743683, "Center of Berlin and Moscow should be near Minsk (latitude should be 54.743683)" );
        equal(europe.longitude, 25.033239, "Center of Berlin and Moscow should be near Minsk (longitude should be 25.033239)" );
        equal(pacific.latitude, 2.676493, "Center of Sydney and San-Francisco should be in the Pacific (latitude should be 2.676493)" );
        equal(pacific.longitude, -166.927225, "Center of Sydney and San-Francisco should be in the Pacific (longitude should be -166.927225)" );
        deepEqual(example, {latitude: "65.419162", longitude: "-28.013133"}, "Center of a sample set of cities is 65.419162, -28.013133");

    });

    test("Testing in line calculation: isPointInLine()", function(){
        expect(3);

        var point1 = {latitude: 0.5, longitude: 0};
        var point2 = {latitude: 0, longitude: 10};
        var point3 = {latitude: 0, longitude: 15.5};
        var start  = {latitude: 0, longitude: 0};
        var end    = {latitude: 0, longitude: 15};

        var isInLine1 = geolib.isPointInLine(point1, start, end);
        var isInLine2 = geolib.isPointInLine(point2, start, end);
        var isInLine3 = geolib.isPointInLine(point3, start, end);

        equal(isInLine1, false, "[0, 0.5] is not between [[0,0],[15,0]]");
        equal(isInLine2, true,  "[10, 0] is between [[0,0],[15,0]]");
        equal(isInLine3, false, "[15.5, 0] is not between [[0,0],[15,0]]");

    });


    test("Testing bounding box: getBounds()", function() {

        expect(12);

        var box = geolib.getBounds(polygon);

        equal(box.maxLat, 51.5177507, "maxLat should be 51.5177507");
        equal(box.minLat, 51.509831973, "minLat should be 51.509831973");
        equal(box.maxLng, 7.472909447, "maxLng should be 7.472909447");
        equal(box.minLng, 7.45518541, "minLng should be 7.45518541");
        equal(typeof box.minElev, "undefined", "minElev should be undefind");
        equal(typeof box.maxElev, "undefined", "maxElev should be undefind");

        box = geolib.getBounds(polygon2);

        equal(box.maxLat, 51.517443592, "maxLat should be 51.517443592");
        equal(box.minLat, 51.513357512, "minLat should be 51.513357512");
        equal(box.maxLng, 7.463232037, "maxLng should be 7.463232037");
        equal(box.minLng, 7.45518541, "minLng should be 7.45518541");
        equal(box.maxElev, 524.54, "maxElev should be 524.54");
        equal(box.minElev, 521.12, "minElev should be 521.12");
  });

    test("Testing bounding box center: getCenterOfBounds()", function() {

        expect(4);

        var box = geolib.getCenterOfBounds(polygon);

        equal(box.latitude, 51.513791, "latitude should be 51.513791");
        equal(box.longitude, 7.464047, "longitude should be 7.464047");

        box = geolib.getCenterOfBounds(polygon2);

        equal(box.latitude, 51.515401, "latitude should be 51.515401");
        equal(box.longitude, 7.459209, "longitude should be 7.459209");

    });

    test("Testing bounding box: getBoundsDistance()", function() {

        expect(6);

        var point = {latitude: 34.090166, longitude: -118.276736555556};
        var bounds = geolib.getBoundsOfDistance(point, 1000);
        ok(bounds[0].latitude < bounds[1].latitude);
        ok(bounds[0].longitude < bounds[1].longitude);
        var north = {latitude: bounds[1].latitude, longitude: point.longitude};
        var south = {latitude: bounds[0].latitude, longitude: point.longitude};
        var east = {latitude: point.latitude, longitude: bounds[1].longitude};
        var west = {latitude: point.latitude, longitude: bounds[0].longitude};
        nearlyEqual(geolib.getDistance(point, north), 1000, 10);
        nearlyEqual(geolib.getDistance(point, south), 1000, 10);
        nearlyEqual(geolib.getDistance(point, east), 1000, 10);
        nearlyEqual(geolib.getDistance(point, west), 1000, 10);

    });

    asyncTest("Testing elevation: getElevation()", function() {
        expect(4);

        var latsLngsElevs;
        var coords1 = [
            {"lat":33.76346,"lng":-84.43430000000001},
            {"lat":33.76418,"lng":-84.42999999999995}
        ];
        var coords2 = [
            {"lat":41.73549,"lng":-111.85842000000002},
            {"lat":41.73600999999999,"lng":-111.85572000000002}
        ];

        var doneCount = 0;
        var done = function (){
            ++doneCount;
            if (doneCount === 2) {
                start();
            }
        };

        geolib.getElevation(coords1,function(err, results) {

            if (err) {
                throw err;
            }

            latsLngsElevs = results;
            equal(latsLngsElevs[0].elev, 299.4249877929688, "1st elev should be 299.4249877929688");
            equal(latsLngsElevs[1].elev, 280.3750305175781, "2nd elev should be 280.3750305175781");
            done();

        });

        geolib.getElevation(coords2,function(err, results) {

            if (err) {
                throw err;
            }

            latsLngsElevs = results;
            equal(latsLngsElevs[0].elev, 1358.987182617188, "1st elev should be 1358.987182617188");
            equal(latsLngsElevs[1].elev, 1361.561279296875, "2nd elev should be 1361.561279296875");
            done();

        });

  });

    test("Testing grade: getGrade()", function() {

        expect(2);

        var coords1 = [{"lat":41.72977,"lng":-111.77621999999997,"elev":1702.72412109375},
                        {"lat":41.73198,"lng":-111.77636999999999,"elev":1849.7333984375}];
        var coords2 = [{"lat":40.75402,"lng":-111.75475,"elev":2209.137451171875},
                      {"lat":40.76481,"lng":-111.76778999999999,"elev":1660.49609375}];

        var grade = geolib.getGrade(coords1);
        equal(grade, 51, "grade should be 51");

        grade = geolib.getGrade(coords2);
        equal(grade, 31, "grade should be 31");

  });

    test("Testing elevation gain and loss: getTotalElevationGainAndLoss()", function() {

        expect(4);

        var coords1 = [
            {"lat":41.72975,"lng":-111.77580999999998,"elev":1707.123046875},
            {"lat":41.73298475750587,"lng":-111.77603699785413,"elev":1922.056396484375},
            {"lat":41.73517,"lng":-111.77881000000002,"elev":1893.9931640625}
        ];
        var coords2 = [
            {"lat":40.79162,"lng":-111.76560999999998,"elev":2211.202880859375},
            {"lat":40.79938945887229,"lng":-111.76680525603354,"elev":1995.89990234375},
            {"lat":40.80354,"lng":-111.77384999999998,"elev":1978.573120117188}
        ];

        var gainAndLoss = geolib.getTotalElevationGainAndLoss(coords1);
            equal(gainAndLoss.gain, 214.933349609375, "gain should be 214.933349609375");
            equal(gainAndLoss.loss, 28.063232421875, "loss should be 28.063232421875");

        gainAndLoss = geolib.getTotalElevationGainAndLoss(coords2);
            equal(gainAndLoss.gain, 0, "gain should be 0");
            equal(gainAndLoss.loss, 232.62976074218705, "loss should be 232.62976074218705");

    });

    test("Testing conversion: sexagesimal2decimal()", function() {

        expect(8);

        var dec1 = geolib.useDecimal("51° 31' 10.11\" N");
        var dec2 = geolib.useDecimal("7° 28' 01\" E");
        var dec3 = geolib.useDecimal("19°    22'   32\"      S");
        var dec4 = geolib.useDecimal("71° 3'     34\" W");
        var dec5 = geolib.useDecimal("71°3'W");
        var dec6 = geolib.useDecimal("51.519470");
        var dec7 = geolib.useDecimal("-122.418079");
        var dec8 = geolib.useDecimal("51° 31.52' 10.11\" N");

        equal(dec1, 51.519475, "Decimal value should be 51.519475" );
        equal(dec2, 7.46694444, "Decimal value should be 7.46694444" );
        equal(dec3, -19.37555556, "Decimal value should be -19.37555556" );
        equal(dec4, -71.05944444, "Decimal value should be -71.05944444" );
        equal(dec5, -71.05, "Decimal value should be -71.05" );
        equal(dec6, 51.51947, "Decimal value should be 51.51947" );
        equal(dec7, -122.418079, "Decimal value should be -122.418079" );
        equal(dec8, 51.52814167, "Decimal value should be 51.52814167");
    });

    test("Testing different useDecimal() formats", function() {

        expect(8);

        var latToCheck = "51° 31.52'";
        var latExpected = 51.52533333;
        var lngToCheck = "7° 28' 01\"";
        var lngExpected = 7.46694444;

        var dec1 = geolib.useDecimal(latToCheck);
        var dec2 = geolib.useDecimal(latExpected);
        var dec3 = geolib.useDecimal({lat: latToCheck, lng: lngToCheck});
        var dec4 = geolib.useDecimal([{lat: latToCheck, lng: lngToCheck}, {lat: latToCheck, lng: lngToCheck}]);
        var dec5 = geolib.useDecimal([latToCheck, lngToCheck]);
        var dec6 = geolib.useDecimal({example: {lat: latToCheck, lng: lngToCheck}});

        equal(dec1, latExpected, "Sexagesimal conversion of " + latToCheck);
        equal(dec2, latExpected, "Conversion of " + latExpected);
        equal(dec3.latitude, latExpected, "Sexagesimal conversion of object with lat property");
        equal(dec3.longitude, lngExpected, "Sexagesimal conversion of object with lng property");
        equal(dec4.length, 2, "Conversion of array with latlng objects returns array");
        equal(typeof dec4[0], "object", "... objects are still objects");
        equal(dec4[1].latitude, latExpected, "Array[1].latitude is converted");
        //equal(dec5[0], {lat: latExpected}, "Conversion of array returns array of decimals");
        //deepEqual(dec5[0], {"lat": 51.52533333}, "Conversion of array returns array of decimals");
        deepEqual(dec5, [51.52533333, 7.46694444], "Conversion of array returns array of decimals");



    });

    test("Testing conversion: decimal2sexagesimal()", function() {

        expect(3);
        var sexa1 = geolib.decimal2sexagesimal(51.519475);
        var sexa2 = geolib.decimal2sexagesimal(-19.37555556);
        var sexa3 = geolib.decimal2sexagesimal(50);

        equal(sexa1, '51° 31\' 10.11"', "Decimal value should be 51° 31' 10.11\"" );
        equal(sexa2, '19° 22\' 32.00"', "Decimal value should be 19° 22' 32\" S" );
        equal(sexa3, '50° 0\' 0.00"', "Decimal value should be 50° 0' 0.00\"" );

    });

    test("Testing: getCompassDirection()", function() {

        expect(2);
        var dir1 = geolib.getCompassDirection({latitude: 52.518611, longitude: 13.408056}, {latitude: 51.519475, longitude: 7.46694444});

        equal(dir1.rough, 'W', 'Should be west');
        equal(dir1.exact, 'WSW', 'Should be west-south-west');

    });


    test("Testing: findNearest()", function() {

        expect(4);
        var near1 = geolib.findNearest({latitude: 36.1168, longitude: -115.173798}, cities);

        equal(near1.key, 'San Francisco', 'Nearest city to Las Vegas from predefined set should be San Francisco');
        equal(near1.distance, 670788, 'Distance should be 670788');
        equal(near1.latitude, 37.774514, 'Latitude should be 37.774514');
        equal(near1.longitude, -122.418079, 'Latitude should be -122.418079');

    });

    test("Testing: getPathLength()", function() {

        var pathLength = geolib.getPathLength(polygon);
        equal(pathLength, 3377, 'Path length should be 3377');

    });

    test("Testing: getSpeed()", function() {

        var speedInKMH = geolib.getSpeed({lat: 51.567294, lng: 7.38896, time: 1360231200880}, {lat: 52.54944, lng: 13.468509, time: 1360245600880});
        var speedInMPH = geolib.getSpeed({lat: 51.567294, lng: 7.38896, time: 1360231200880}, {lat: 52.54944, lng: 13.468509, time: 1360245600880}, {unit: 'mi'});
        equal(speedInKMH, 107.7308, '430.923 km in 4 hours should equal 107.7308 kmh');
        equal(speedInMPH, 66.9408, '430.923 km in 4 hours should equal 66.9408 mph');

    });

    test("Testing: isPointInside()", function() {

        var isInside1 = geolib.isPointInside({latitude: 51.514252208, longitude: 7.464905736}, polygon); // Point is inside of the polygon
        var isInside2 = geolib.isPointInside({latitude: 51.510539773, longitude: 7.454691884}, polygon); // Point is not inside polygon

        ok(isInside1, "Point 1 is inside polygon");
        ok(!isInside2, "Point 2 is not inside polygon");

    });

    test("Testing: isPointInsideWithPreparedPolygon()", function() {

        geolib.preparePolygonForIsPointInsideOptimized(polygon);

        var isInside1 = geolib.isPointInsideWithPreparedPolygon({latitude: 51.514252208, longitude: 7.464905736}, polygon); // Point is inside of the polygon
        var isInside2 = geolib.isPointInsideWithPreparedPolygon({latitude: 51.510539773, longitude: 7.454691884}, polygon); // Point is not inside polygon

        ok(isInside1, "Point 1 is inside polygon");
        ok(!isInside2, "Point 2 is not inside polygon");

    });


    test("Testing: computeDestinationPoint()", function() {

        var point1 = geolib.computeDestinationPoint(cities['Berlin'], 15000, 180);
        var point2 = geolib.computeDestinationPoint(cities['Berlin'], 15000, 135);

        deepEqual(point1, {"latitude": 52.383863707382076, "longitude": 13.408055999999977});
        deepEqual(point2, {"latitude": 52.42322722672352, "longitude": 13.564299057246114});

    });

    test("Testing: orderByDistance()", function() {

        var result = geolib.orderByDistance({"latitude": 51.516241842, "longitude": 7.456494328}, polygon2);

        deepEqual(result, [
            {"latitude": 51.516241842, "longitude": 7.456494328, "elevation": 523.12, "distance": 0, "key": "2"},
            {"latitude": 51.515400598, "longitude": 7.45518541, "elevation": 524.54, "distance": 130, "key": "1"},
            {"latitude": 51.516722545, "longitude": 7.459863183, "elevation": 522.77, "distance": 240, "key": "3"},
            {"latitude": 51.513357512, "longitude": 7.45574331, "elevation": 523.92, "distance": 325, "key": "0"},
            {"latitude": 51.517443592, "longitude": 7.463232037, "elevation": 521.12, "distance": 486, "key": "4"}
        ]);

        var result2 = geolib.orderByDistance({lat: 1, lng: 1}, [{lat: 3, lng: 4}, {lat: 1, lng: 6}, {lat: 4, lng: 1}]);

        deepEqual(result2, [
            {"lat":4,"lng":1,"distance":331730,"key":"2"},
            {"lat":3,"lng":4,"distance":400362,"key":"0"},
            {"lat":1,"lng":6,"distance":556513,"key":"1"}
        ]);

    });

    test("Testing: convertUnit()", function() {

        equal(geolib.convertUnit('km', 1000), 1, 'Conversion of 1000 m to km');
        equal(geolib.convertUnit('m', 1000), 1000, 'Conversion of 1000 m to m (just to make sure)');
        equal(geolib.convertUnit('cm', 1000), 100000, 'Conversion of 1000 m to cm');
        equal(geolib.convertUnit('mm', 1000), 1000000, 'Conversion of 1000 m to mm');
        equal(geolib.convertUnit('mi', 1000), 0.6214, 'Conversion of 1000 m to miles');
        equal(geolib.convertUnit('sm', 1000), 0.5399, 'Conversion of 1000 m to seamiles');
        equal(geolib.convertUnit('ft', 1000), 3280.8399, 'Conversion of 1000 m to ft');
        equal(geolib.convertUnit('in', 1000), 39370.0787, 'Conversion of 1000 m to in');
        equal(geolib.convertUnit('yd', 1000), 1093.6133, 'Conversion of 1000 m to  yd');

    });

    test("Testing: isSexagesimal()", function() {

        ok(geolib.isSexagesimal('51° 31\''), '51° 31\'');
        ok(geolib.isSexagesimal('51° 31\' 12"'), '51° 31\' 12"');
        ok(geolib.isSexagesimal('51° 31\' 12.27"'), '51° 31\' 12.27"');
        ok(geolib.isSexagesimal('51° 31\' 12.27" N'), '51° 31\' 12.27" N');
        ok(geolib.isSexagesimal('51° 31.34\' 12.27" N'), '51° 31.34\' 12.27" N');
        ok(geolib.isSexagesimal('51° 31\' N'), '51° 31\' N');

        //ok(geolib.isSexagesimal('51° N'), '51°'); // coming soon

    });
/*global require:true describe:true it:true*/

var util = require('util'), http = require('http'), geolib = require('../geolib');

describe('Geolib', function() {
  describe('getElevationServer', function() {
    it('should getElevation for three points', function(done) {
      var coords = [
        {"lat":40.79162,"lng":-111.76560999999998},
        {"lat":40.79938945887229,"lng":-111.76680525603354},
        {"lat":40.80354,"lng":-111.77384999999998}
      ];
      geolib.getElevation(coords, function (err, results){
        if (err){
          throw new Error("Could not get elevation");
        } else {
          if (Math.floor(results[0].elev) !== 2211 ||
              Math.floor(results[1].elev) !== 2011 ||
              Math.floor(results[2].elev) !== 1978) {
            throw new Error("wrong elevation results: " + JSON.stringify(results));
          }
        }
        done();
      });
    });
  });
});
(function() {
  (function() {
    (function() {
      var slice = [].slice;

      this.ActionCable = {
        INTERNAL: {
          "message_types": {
            "welcome": "welcome",
            "ping": "ping",
            "confirmation": "confirm_subscription",
            "rejection": "reject_subscription"
          },
          "default_mount_path": "/cable",
          "protocols": ["actioncable-v1-json", "actioncable-unsupported"]
        },
        WebSocket: window.WebSocket,
        logger: window.console,
        createConsumer: function(url) {
          var ref;
          if (url == null) {
            url = (ref = this.getConfig("url")) != null ? ref : this.INTERNAL.default_mount_path;
          }
          return new ActionCable.Consumer(this.createWebSocketURL(url));
        },
        getConfig: function(name) {
          var element;
          element = document.head.querySelector("meta[name='action-cable-" + name + "']");
          return element != null ? element.getAttribute("content") : void 0;
        },
        createWebSocketURL: function(url) {
          var a;
          if (url && !/^wss?:/i.test(url)) {
            a = document.createElement("a");
            a.href = url;
            a.href = a.href;
            a.protocol = a.protocol.replace("http", "ws");
            return a.href;
          } else {
            return url;
          }
        },
        startDebugging: function() {
          return this.debugging = true;
        },
        stopDebugging: function() {
          return this.debugging = null;
        },
        log: function() {
          var messages, ref;
          messages = 1 <= arguments.length ? slice.call(arguments, 0) : [];
          if (this.debugging) {
            messages.push(Date.now());
            return (ref = this.logger).log.apply(ref, ["[ActionCable]"].concat(slice.call(messages)));
          }
        }
      };

    }).call(this);
  }).call(this);

  var ActionCable = this.ActionCable;

  (function() {
    (function() {
      var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

      ActionCable.ConnectionMonitor = (function() {
        var clamp, now, secondsSince;

        ConnectionMonitor.pollInterval = {
          min: 3,
          max: 30
        };

        ConnectionMonitor.staleThreshold = 6;

        function ConnectionMonitor(connection) {
          this.connection = connection;
          this.visibilityDidChange = bind(this.visibilityDidChange, this);
          this.reconnectAttempts = 0;
        }

        ConnectionMonitor.prototype.start = function() {
          if (!this.isRunning()) {
            this.startedAt = now();
            delete this.stoppedAt;
            this.startPolling();
            document.addEventListener("visibilitychange", this.visibilityDidChange);
            return ActionCable.log("ConnectionMonitor started. pollInterval = " + (this.getPollInterval()) + " ms");
          }
        };

        ConnectionMonitor.prototype.stop = function() {
          if (this.isRunning()) {
            this.stoppedAt = now();
            this.stopPolling();
            document.removeEventListener("visibilitychange", this.visibilityDidChange);
            return ActionCable.log("ConnectionMonitor stopped");
          }
        };

        ConnectionMonitor.prototype.isRunning = function() {
          return (this.startedAt != null) && (this.stoppedAt == null);
        };

        ConnectionMonitor.prototype.recordPing = function() {
          return this.pingedAt = now();
        };

        ConnectionMonitor.prototype.recordConnect = function() {
          this.reconnectAttempts = 0;
          this.recordPing();
          delete this.disconnectedAt;
          return ActionCable.log("ConnectionMonitor recorded connect");
        };

        ConnectionMonitor.prototype.recordDisconnect = function() {
          this.disconnectedAt = now();
          return ActionCable.log("ConnectionMonitor recorded disconnect");
        };

        ConnectionMonitor.prototype.startPolling = function() {
          this.stopPolling();
          return this.poll();
        };

        ConnectionMonitor.prototype.stopPolling = function() {
          return clearTimeout(this.pollTimeout);
        };

        ConnectionMonitor.prototype.poll = function() {
          return this.pollTimeout = setTimeout((function(_this) {
            return function() {
              _this.reconnectIfStale();
              return _this.poll();
            };
          })(this), this.getPollInterval());
        };

        ConnectionMonitor.prototype.getPollInterval = function() {
          var interval, max, min, ref;
          ref = this.constructor.pollInterval, min = ref.min, max = ref.max;
          interval = 5 * Math.log(this.reconnectAttempts + 1);
          return Math.round(clamp(interval, min, max) * 1000);
        };

        ConnectionMonitor.prototype.reconnectIfStale = function() {
          if (this.connectionIsStale()) {
            ActionCable.log("ConnectionMonitor detected stale connection. reconnectAttempts = " + this.reconnectAttempts + ", pollInterval = " + (this.getPollInterval()) + " ms, time disconnected = " + (secondsSince(this.disconnectedAt)) + " s, stale threshold = " + this.constructor.staleThreshold + " s");
            this.reconnectAttempts++;
            if (this.disconnectedRecently()) {
              return ActionCable.log("ConnectionMonitor skipping reopening recent disconnect");
            } else {
              ActionCable.log("ConnectionMonitor reopening");
              return this.connection.reopen();
            }
          }
        };

        ConnectionMonitor.prototype.connectionIsStale = function() {
          var ref;
          return secondsSince((ref = this.pingedAt) != null ? ref : this.startedAt) > this.constructor.staleThreshold;
        };

        ConnectionMonitor.prototype.disconnectedRecently = function() {
          return this.disconnectedAt && secondsSince(this.disconnectedAt) < this.constructor.staleThreshold;
        };

        ConnectionMonitor.prototype.visibilityDidChange = function() {
          if (document.visibilityState === "visible") {
            return setTimeout((function(_this) {
              return function() {
                if (_this.connectionIsStale() || !_this.connection.isOpen()) {
                  ActionCable.log("ConnectionMonitor reopening stale connection on visibilitychange. visbilityState = " + document.visibilityState);
                  return _this.connection.reopen();
                }
              };
            })(this), 200);
          }
        };

        now = function() {
          return new Date().getTime();
        };

        secondsSince = function(time) {
          return (now() - time) / 1000;
        };

        clamp = function(number, min, max) {
          return Math.max(min, Math.min(max, number));
        };

        return ConnectionMonitor;

      })();

    }).call(this);
    (function() {
      var i, message_types, protocols, ref, supportedProtocols, unsupportedProtocol,
        slice = [].slice,
        bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
        indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

      ref = ActionCable.INTERNAL, message_types = ref.message_types, protocols = ref.protocols;

      supportedProtocols = 2 <= protocols.length ? slice.call(protocols, 0, i = protocols.length - 1) : (i = 0, []), unsupportedProtocol = protocols[i++];

      ActionCable.Connection = (function() {
        Connection.reopenDelay = 500;

        function Connection(consumer) {
          this.consumer = consumer;
          this.open = bind(this.open, this);
          this.subscriptions = this.consumer.subscriptions;
          this.monitor = new ActionCable.ConnectionMonitor(this);
          this.disconnected = true;
        }

        Connection.prototype.send = function(data) {
          if (this.isOpen()) {
            this.webSocket.send(JSON.stringify(data));
            return true;
          } else {
            return false;
          }
        };

        Connection.prototype.open = function() {
          if (this.isActive()) {
            ActionCable.log("Attempted to open WebSocket, but existing socket is " + (this.getState()));
            return false;
          } else {
            ActionCable.log("Opening WebSocket, current state is " + (this.getState()) + ", subprotocols: " + protocols);
            if (this.webSocket != null) {
              this.uninstallEventHandlers();
            }
            this.webSocket = new ActionCable.WebSocket(this.consumer.url, protocols);
            this.installEventHandlers();
            this.monitor.start();
            return true;
          }
        };

        Connection.prototype.close = function(arg) {
          var allowReconnect, ref1;
          allowReconnect = (arg != null ? arg : {
            allowReconnect: true
          }).allowReconnect;
          if (!allowReconnect) {
            this.monitor.stop();
          }
          if (this.isActive()) {
            return (ref1 = this.webSocket) != null ? ref1.close() : void 0;
          }
        };

        Connection.prototype.reopen = function() {
          var error;
          ActionCable.log("Reopening WebSocket, current state is " + (this.getState()));
          if (this.isActive()) {
            try {
              return this.close();
            } catch (error1) {
              error = error1;
              return ActionCable.log("Failed to reopen WebSocket", error);
            } finally {
              ActionCable.log("Reopening WebSocket in " + this.constructor.reopenDelay + "ms");
              setTimeout(this.open, this.constructor.reopenDelay);
            }
          } else {
            return this.open();
          }
        };

        Connection.prototype.getProtocol = function() {
          var ref1;
          return (ref1 = this.webSocket) != null ? ref1.protocol : void 0;
        };

        Connection.prototype.isOpen = function() {
          return this.isState("open");
        };

        Connection.prototype.isActive = function() {
          return this.isState("open", "connecting");
        };

        Connection.prototype.isProtocolSupported = function() {
          var ref1;
          return ref1 = this.getProtocol(), indexOf.call(supportedProtocols, ref1) >= 0;
        };

        Connection.prototype.isState = function() {
          var ref1, states;
          states = 1 <= arguments.length ? slice.call(arguments, 0) : [];
          return ref1 = this.getState(), indexOf.call(states, ref1) >= 0;
        };

        Connection.prototype.getState = function() {
          var ref1, state, value;
          for (state in WebSocket) {
            value = WebSocket[state];
            if (value === ((ref1 = this.webSocket) != null ? ref1.readyState : void 0)) {
              return state.toLowerCase();
            }
          }
          return null;
        };

        Connection.prototype.installEventHandlers = function() {
          var eventName, handler;
          for (eventName in this.events) {
            handler = this.events[eventName].bind(this);
            this.webSocket["on" + eventName] = handler;
          }
        };

        Connection.prototype.uninstallEventHandlers = function() {
          var eventName;
          for (eventName in this.events) {
            this.webSocket["on" + eventName] = function() {};
          }
        };

        Connection.prototype.events = {
          message: function(event) {
            var identifier, message, ref1, type;
            if (!this.isProtocolSupported()) {
              return;
            }
            ref1 = JSON.parse(event.data), identifier = ref1.identifier, message = ref1.message, type = ref1.type;
            switch (type) {
              case message_types.welcome:
                this.monitor.recordConnect();
                return this.subscriptions.reload();
              case message_types.ping:
                return this.monitor.recordPing();
              case message_types.confirmation:
                return this.subscriptions.notify(identifier, "connected");
              case message_types.rejection:
                return this.subscriptions.reject(identifier);
              default:
                return this.subscriptions.notify(identifier, "received", message);
            }
          },
          open: function() {
            ActionCable.log("WebSocket onopen event, using '" + (this.getProtocol()) + "' subprotocol");
            this.disconnected = false;
            if (!this.isProtocolSupported()) {
              ActionCable.log("Protocol is unsupported. Stopping monitor and disconnecting.");
              return this.close({
                allowReconnect: false
              });
            }
          },
          close: function(event) {
            ActionCable.log("WebSocket onclose event");
            if (this.disconnected) {
              return;
            }
            this.disconnected = true;
            this.monitor.recordDisconnect();
            return this.subscriptions.notifyAll("disconnected", {
              willAttemptReconnect: this.monitor.isRunning()
            });
          },
          error: function() {
            return ActionCable.log("WebSocket onerror event");
          }
        };

        return Connection;

      })();

    }).call(this);
    (function() {
      var slice = [].slice;

      ActionCable.Subscriptions = (function() {
        function Subscriptions(consumer) {
          this.consumer = consumer;
          this.subscriptions = [];
        }

        Subscriptions.prototype.create = function(channelName, mixin) {
          var channel, params, subscription;
          channel = channelName;
          params = typeof channel === "object" ? channel : {
            channel: channel
          };
          subscription = new ActionCable.Subscription(this.consumer, params, mixin);
          return this.add(subscription);
        };

        Subscriptions.prototype.add = function(subscription) {
          this.subscriptions.push(subscription);
          this.consumer.ensureActiveConnection();
          this.notify(subscription, "initialized");
          this.sendCommand(subscription, "subscribe");
          return subscription;
        };

        Subscriptions.prototype.remove = function(subscription) {
          this.forget(subscription);
          if (!this.findAll(subscription.identifier).length) {
            this.sendCommand(subscription, "unsubscribe");
          }
          return subscription;
        };

        Subscriptions.prototype.reject = function(identifier) {
          var i, len, ref, results, subscription;
          ref = this.findAll(identifier);
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            subscription = ref[i];
            this.forget(subscription);
            this.notify(subscription, "rejected");
            results.push(subscription);
          }
          return results;
        };

        Subscriptions.prototype.forget = function(subscription) {
          var s;
          this.subscriptions = (function() {
            var i, len, ref, results;
            ref = this.subscriptions;
            results = [];
            for (i = 0, len = ref.length; i < len; i++) {
              s = ref[i];
              if (s !== subscription) {
                results.push(s);
              }
            }
            return results;
          }).call(this);
          return subscription;
        };

        Subscriptions.prototype.findAll = function(identifier) {
          var i, len, ref, results, s;
          ref = this.subscriptions;
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            s = ref[i];
            if (s.identifier === identifier) {
              results.push(s);
            }
          }
          return results;
        };

        Subscriptions.prototype.reload = function() {
          var i, len, ref, results, subscription;
          ref = this.subscriptions;
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            subscription = ref[i];
            results.push(this.sendCommand(subscription, "subscribe"));
          }
          return results;
        };

        Subscriptions.prototype.notifyAll = function() {
          var args, callbackName, i, len, ref, results, subscription;
          callbackName = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
          ref = this.subscriptions;
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            subscription = ref[i];
            results.push(this.notify.apply(this, [subscription, callbackName].concat(slice.call(args))));
          }
          return results;
        };

        Subscriptions.prototype.notify = function() {
          var args, callbackName, i, len, results, subscription, subscriptions;
          subscription = arguments[0], callbackName = arguments[1], args = 3 <= arguments.length ? slice.call(arguments, 2) : [];
          if (typeof subscription === "string") {
            subscriptions = this.findAll(subscription);
          } else {
            subscriptions = [subscription];
          }
          results = [];
          for (i = 0, len = subscriptions.length; i < len; i++) {
            subscription = subscriptions[i];
            results.push(typeof subscription[callbackName] === "function" ? subscription[callbackName].apply(subscription, args) : void 0);
          }
          return results;
        };

        Subscriptions.prototype.sendCommand = function(subscription, command) {
          var identifier;
          identifier = subscription.identifier;
          return this.consumer.send({
            command: command,
            identifier: identifier
          });
        };

        return Subscriptions;

      })();

    }).call(this);
    (function() {
      ActionCable.Subscription = (function() {
        var extend;

        function Subscription(consumer, params, mixin) {
          this.consumer = consumer;
          if (params == null) {
            params = {};
          }
          this.identifier = JSON.stringify(params);
          extend(this, mixin);
        }

        Subscription.prototype.perform = function(action, data) {
          if (data == null) {
            data = {};
          }
          data.action = action;
          return this.send(data);
        };

        Subscription.prototype.send = function(data) {
          return this.consumer.send({
            command: "message",
            identifier: this.identifier,
            data: JSON.stringify(data)
          });
        };

        Subscription.prototype.unsubscribe = function() {
          return this.consumer.subscriptions.remove(this);
        };

        extend = function(object, properties) {
          var key, value;
          if (properties != null) {
            for (key in properties) {
              value = properties[key];
              object[key] = value;
            }
          }
          return object;
        };

        return Subscription;

      })();

    }).call(this);
    (function() {
      ActionCable.Consumer = (function() {
        function Consumer(url) {
          this.url = url;
          this.subscriptions = new ActionCable.Subscriptions(this);
          this.connection = new ActionCable.Connection(this);
        }

        Consumer.prototype.send = function(data) {
          return this.connection.send(data);
        };

        Consumer.prototype.connect = function() {
          return this.connection.open();
        };

        Consumer.prototype.disconnect = function() {
          return this.connection.close({
            allowReconnect: false
          });
        };

        Consumer.prototype.ensureActiveConnection = function() {
          if (!this.connection.isActive()) {
            return this.connection.open();
          }
        };

        return Consumer;

      })();

    }).call(this);
  }).call(this);

  if (typeof module === "object" && module.exports) {
    module.exports = ActionCable;
  } else if (typeof define === "function" && define.amd) {
    define(ActionCable);
  }
}).call(this);
// Action Cable provides the framework to deal with WebSockets in Rails.
// You can generate new channels where WebSocket features live using the `rails generate channel` command.
//




(function() {
  this.App || (this.App = {});

  App.cable = ActionCable.createConsumer();

}).call(this);
(function() {


}).call(this);
(function() {


}).call(this);
// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, or any plugin's
// vendor/assets/javascripts directory can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// compiled file. JavaScript code in this file should be added after the last require_* statement.
//
// Read Sprockets README (https://github.com/rails/sprockets#sprockets-directives) for details
// about supported directives.
//



;
