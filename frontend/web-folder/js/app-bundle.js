(function () {
  'use strict';

  /******************************************************************************
  Copyright (c) Microsoft Corporation.

  Permission to use, copy, modify, and/or distribute this software for any
  purpose with or without fee is hereby granted.

  THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
  REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
  AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
  INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
  LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
  OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
  PERFORMANCE OF THIS SOFTWARE.
  ***************************************************************************** */

  function __decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  }

  function __classPrivateFieldGet(receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
  }

  function __classPrivateFieldSet(receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
  }

  typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
  };

  // --------- Object Utils --------- //
  // Make sure that this obj[propName] is a js Map and returns it. 
  // Otherwise, create a new one, set it, and return it.
  function ensureMap(obj, propName) {
      return _ensure(obj, propName, Map);
  }
  // Make sure that this obj[propName] is a js Set and returns it. 
  // Otherwise, create a new one, set it, and return it.
  function ensureSet(obj, propName) {
      return _ensure(obj, propName, Set);
  }
  // same as ensureMap but for array
  function ensureArray(obj, propName) {
      return _ensure(obj, propName, Array);
  }
  function _ensure(obj, propName, type) {
      const isMap = (obj instanceof Map);
      let v = (isMap) ? obj.get(propName) : obj[propName];
      if (v == null) {
          v = (type == null) ? {} : (type === Array) ? [] : (new type);
          if (isMap) {
              obj.set(propName, v);
          }
          else {
              obj[propName] = v;
          }
      }
      return v;
  }
  const emptyArray = Object.freeze([]);
  /**
   * Returns a readonly Node array from EventTarget, NodeList, Node[], or empty readonly array for null and undefined.
   */
  function asNodeArray(value) {
      if (value != null) {
          if (value instanceof Array) {
              return value;
          }
          // If it is a nodeList, copy the elements into a real array
          else if (value.constructor && value.constructor.name === "NodeList") {
              return Array.prototype.slice.call(value);
          }
          // FIXME: Needs to handle the document fragment case. 
          // otherwise we add value
          else {
              return [value]; // Note: here we assume it the evenTarget is a node
          }
      }
      // otherwise, return an empty array (readonly, so that we can )
      return emptyArray;
  }
  // --------- /asType --------- //
  // --------- String Utils --------- //
  function splitAndTrim(str, sep) {
      if (str == null) {
          return [];
      }
      if (str.indexOf(sep) === -1) {
          return [str.trim()];
      }
      return str.split(sep).map(trim);
  }
  function trim(str) {
      return str.trim();
  }

  function on(els, types, arg1, arg2, arg3) {
      let opts;
      let listener;
      let selector;
      // arg1 is a function, then no selector, arg1 is the listener, and arg2 is the potential eventOptions
      if (arg1 instanceof Function) {
          listener = arg1;
          opts = arg2;
      }
      else {
          selector = arg1;
          listener = arg2;
          opts = arg3;
      }
      // AddEventListenerOptions	
      let eventOptions;
      if (opts && (opts.passive != null || opts.capture != null)) {
          eventOptions = {};
          if (opts.passive != null) {
              eventOptions.passive = opts.passive;
          }
          if (opts.capture != null) {
              eventOptions.capture = opts.capture;
          }
      }
      if (els == null) {
          return;
      }
      const silenceDisconnectedCtx = opts?.silenceDisconnectedCtx;
      const ctx = opts?.ctx;
      const ctxEl = (ctx instanceof HTMLElement) ? ctx : undefined;
      const typeArray = splitAndTrim(types, ",");
      typeArray.forEach(function (type) {
          const typeSelectorKey = buildTypeSelectorKey(type, selector);
          asNodeArray(els).forEach(function (el) {
              // This will the listener use for the even listener, which might differ
              // from the listener function passed in case of a selector
              let _listener = listener;
              // if we have a selector, create the wrapper listener to do the matches on the selector
              if (selector) {
                  _listener = function (evt) {
                      let tgt = null;
                      const target = evt.target;
                      const currentTarget = evt.currentTarget;
                      const ctx = (opts) ? opts.ctx : null;
                      // if the 
                      if (silenceDisconnectedCtx === true && ctxEl != null) {
                          if (!ctxEl.isConnected) {
                              return;
                          }
                      }
                      // if the target match the selector, then, easy, we call the listener
                      if (target && target.matches(selector)) {
                          // Note: While mouseEvent are readonly for its properties, it does allow to add custom properties
                          // TODO: type narrowing needed.
                          evt.selectTarget = target;
                          listener.call(ctx, evt);
                      }
                      // now, if it does not, perhaps something in between the target and currentTarget
                      // might match
                      else {
                          // TODO: type narrowing needed.
                          tgt = evt.target.parentNode;
                          // TODO: might need to check that tgt is not undefined as well. 
                          while (tgt !== null && tgt !== currentTarget && tgt !== document) {
                              if (tgt.matches(selector)) { // selector is present here (see if above)
                                  // Note: While mouseEvent are readonly for its properties, it does allow to add custom properties
                                  evt.selectTarget = tgt;
                                  listener.call(ctx, evt);
                                  tgt = null;
                                  break;
                              }
                              tgt = tgt.parentNode;
                          }
                      }
                  };
              }
              // if we do not have a selector, but still havea  opts.ctx, then, need to wrap
              else if (opts && opts.ctx) {
                  _listener = function (evt) {
                      if (silenceDisconnectedCtx === true && ctxEl != null) {
                          if (!ctxEl.isConnected) {
                              return;
                          }
                      }
                      listener.call(opts.ctx, evt);
                  };
              }
              const listenerRef = {
                  type: type,
                  listener: listener,
                  _listener: _listener, // an eventual wrap of the listener, or just point listener.
              };
              if (selector) {
                  listenerRef.selector = selector;
              }
              // If we have a namespace, they add it to the Ref, and to the listenerRefsByNs
              // TODO: need to add listenerRef in a nsDic if if there a opts.ns
              if (opts && opts.ns) {
                  listenerRef.ns = opts.ns;
                  let listenerRefSetByNs = ensureMap(el, "listenerRefsByNs");
                  let listenerRefSet = ensureSet(listenerRefSetByNs, opts.ns);
                  listenerRefSet.add(listenerRef);
              }
              // add the listenerRef as listener:listenerRef entry for this typeSelectorKey in the listenerDic
              let listenerDic = ensureMap(el, "listenerDic");
              let listenerRefByListener = ensureMap(listenerDic, typeSelectorKey);
              listenerRefByListener.set(listener, listenerRef);
              // do the binding
              // TODO: fix typing here.
              el.addEventListener(type, _listener, eventOptions);
          }); // /utils.asArray(els).forEach(function(el){
      }); // /types.forEach(function(type){
  }
  function off(els, type_or_opts, selector_or_listener, maybe_listener) {
      if (els == null) {
          return;
      }
      // for now, opts is only the first position
      const opts = (type_or_opts && type_or_opts.ns) ? type_or_opts : null;
      const type = (opts === null) ? type_or_opts : null;
      let selector = null;
      let listener;
      const tof = typeof selector_or_listener;
      if (tof === 'function') {
          selector = null;
          listener = selector_or_listener;
      }
      else if (tof === 'string') {
          selector = selector_or_listener;
          listener = maybe_listener;
      }
      // --------- off(els, {ns}) --------- //
      // if we have a .off(els,{ns:..}) then we do check only the ns
      if (opts && opts.ns) {
          const ns = opts.ns;
          asNodeArray(els).forEach(function (el) {
              const listenerDic = el.listenerDic;
              const listenerRefsByNs = el.listenerRefsByNs;
              let listenerRefSet;
              if (listenerRefsByNs && listenerDic) {
                  listenerRefSet = listenerRefsByNs.get(ns);
                  if (listenerRefSet) {
                      // if we get the set, we remove them all
                      listenerRefSet.forEach(function (listenerRef) {
                          // we remove the event listener
                          el.removeEventListener(listenerRef.type, listenerRef._listener);
                          // need to remove it from the listenerDic
                          const typeSelectorKey = buildTypeSelectorKey(listenerRef.type, listenerRef.selector);
                          const listenerRefMapByListener = listenerDic.get(typeSelectorKey);
                          if (listenerRefMapByListener && listenerRefMapByListener.has(listenerRef.listener)) {
                              listenerRefMapByListener.delete(listenerRef.listener);
                          }
                      });
                      // we remove this namespace now that all event handlers has been removed
                      listenerRefsByNs.delete(ns);
                  }
              }
          });
          return;
      }
      // --------- /off(els, {ns}) --------- //
      const typeSelectorKey = buildTypeSelectorKey(type, selector);
      asNodeArray(els).forEach(function (el) {
          // First, get the listenerRefByListener for this type/selectory
          const listenerRefMapByListener = (el.listenerDic) ? el.listenerDic.get(typeSelectorKey) : null; //val(el, ["listenerDic", typeSelectorKey]);
          // for now, if we do not have a listenerRef for this type/[selector], we throw an error
          if (!listenerRefMapByListener) {
              console.log("WARNING - Cannot do .off() since this type-selector '" + typeSelectorKey +
                  "' event was not bound with .on(). We will add support for this later.");
              return;
          }
          // if we do not have a listener function, this mean we need to remove all events for this type/selector
          if (typeof listener === "undefined" && type) {
              listenerRefMapByListener.forEach(function (listenerRef) {
                  // Note: Here, type === listenerRef.type
                  // remove the event
                  // TODO: check typing assumption
                  el.removeEventListener(type, listenerRef._listener);
              });
              el.listenerDic.delete(typeSelectorKey);
          }
          // if we have a listener, then, just remove this one.
          else {
              // check that we have the map. 
              const listenerRef = (listener) ? listenerRefMapByListener.get(listener) : null;
              if (!listenerRef) {
                  console.log("WARNING - Cannot do .off() since no listenerRef for " + typeSelectorKey +
                      " and function \n" + listener + "\n were found. Probably was not registered via on()");
                  return;
              }
              // remove the event
              // TODO: check typing assumption
              el.removeEventListener(type, listenerRef._listener);
              // remove it from the map
              // TODO: check typing ! assumption
              listenerRefMapByListener.delete(listener);
          }
      });
  }
  //#endregion ---------- /Public trigger API ---------- 
  //#region    ---------- Public bindDOMEvents API ---------- 
  /**
   * Bind a list of bindings
   *
   * @param typeAndSelector e.g., `click` or `click; button.add`
   */
  function bindOnEvents(el, eventDics, opts) {
      eventDics = (eventDics instanceof Array) ? eventDics : [eventDics]; // make we have an array of eventDic
      for (const eventDic of eventDics) {
          for (const selector in eventDic) {
              bindOnEvent(el, selector, eventDic[selector], opts);
          }
      }
  }
  /**
   * Bind one event to a el by appropriately parsing the `typeAndSelector` might contains a selector;
   *
   * @param typeAndSelector e.g., `click` or `click; button.add`
   */
  function bindOnEvent(el, typeAndSelector, fn, opts) {
      let selectorSplitted = typeAndSelector.trim().split(";"); // e.g., ["click", " button.add"]
      let type = selectorSplitted[0].trim(); // e.g., "click"
      let selector = null; // e.g., "button.add"
      if (selectorSplitted.length > 1) {
          selector = selectorSplitted[1].trim();
      }
      on(el, type, selector, fn, opts);
  }
  //#endregion ---------- /Public bindDOMEvents API ---------- 
  function buildTypeSelectorKey(type, selector) {
      return (selector) ? (type + "--" + selector) : type;
  }

  function bindHubEvents(bindings, opts) {
      const bindingList = (bindings instanceof Array) ? bindings : [bindings];
      for (const bindings of bindingList) {
          const infoList = listHubInfos(bindings);
          infoList.forEach(function (info) {
              info.hub.sub(info.topics, info.labels, info.fun, opts);
          });
      }
  }
  /**
   * Unbinding a list of bindings. For now, MUST have nsObject.
   * @param bindings
   * @param nsObject
   */
  function unbindHubEvents(bindings, nsObject) {
      const bindingList = (bindings instanceof Array) ? bindings : [bindings];
      bindingList.forEach(function (hubEvents) {
          const infoList = listHubInfos(hubEvents);
          infoList.forEach(function (info) {
              info.hub.unsub(nsObject);
          });
      });
  }
  /**
   * @param {*} hubEvents could be {"hubName; topics[; labels]": fn}
   * 											or {hubName: {"topics[; labels]": fn}}
   * @returns {hub, topics, labels}[]
   */
  function listHubInfos(hubEvents) {
      const infoList = [];
      for (const key in hubEvents) {
          const val = hubEvents[key];
          // If we have FnBySelector, then, hub name is in the selector, getHubInfo will extract it
          // "hubName; topics[; labels]": fn}
          if (val instanceof Function) {
              infoList.push(getHubInfo(key, null, val));
          }
          // otherwise, if val is an object, then, thee key is the name of the hub, so get/create it.
          // {hubName: {"topics[; labels]": fn}}
          else {
              const _hub = hub(key);
              for (const key2 in val) {
                  infoList.push(getHubInfo(key2, _hub, val[key2]));
              }
          }
      }
      return infoList;
  }
  // returns {hub, topics, labels}
  // hub is optional, if not present, assume the name will be the first item will be in the str
  function getHubInfo(str, _hub, fun) {
      const a = splitAndTrim(str, ";");
      // if no hub, then, assume it is in the str
      const topicIdx = (_hub) ? 0 : 1;
      _hub = (!_hub) ? hub(a[0]) : _hub;
      const info = {
          topics: a[topicIdx],
          fun: fun,
          hub: _hub
      };
      if (a.length > topicIdx + 1) {
          info.labels = a[topicIdx + 1];
      }
      return info;
  }
  //#endregion ---------- /Private Helpers ---------- 
  //#region    ---------- Public Factory ---------- 
  /** Singleton hub factory */
  function hub(name) {
      if (name == null) {
          throw new Error('dom-native INVALID API CALLS: hub(name) require a name (no name was given).');
      }
      let hub = hubDic.get(name);
      // if it does not exist, we create and set it. 
      if (hub === undefined) {
          hub = new HubImpl(name);
          hubDic.set(name, hub);
          // create the hubData
          hubDataDic.set(name, new HubData(name));
      }
      return hub;
  }
  // User Hub object exposing the public API
  const hubDic = new Map();
  // Data for each hub (by name)
  const hubDataDic = new Map();
  class HubImpl {
      constructor(name) {
          this.name = name;
      }
      sub(topics, labels_or_handler, handler_or_opts, opts) {
          //// Build the arguments
          let labels;
          let handler;
          // if the first arg is function, then, no labels
          if (labels_or_handler instanceof Function) {
              labels = null;
              handler = labels_or_handler;
              opts = handler_or_opts;
          }
          else {
              labels = labels_or_handler;
              handler = handler_or_opts;
              // opts = opts;
          }
          //// Normalize topic and label to arrays
          const topicArray = splitAndTrim(topics, ",");
          const labelArray = (labels != null) ? splitAndTrim(labels, ",") : null;
          //// make opts (always defined at least an emtpy object)
          opts = makeOpts(opts);
          //// add the event to the hubData
          const hubData = hubDataDic.get(this.name); // by hub(...) factory function, this is garanteed
          hubData.addEvent(topicArray, labelArray, handler, opts);
      }
      unsub(ns) {
          const hubData = hubDataDic.get(this.name); // by factory contract, this always exist.
          hubData.removeRefsForNs(ns.ns);
      }
      pub(topics, labels, data) {
          // ARG SHIFTING: if data is undefined, we shift args to the RIGHT
          if (typeof data === "undefined") {
              data = labels;
              labels = null;
          }
          //// Normalize topic and label to arrays
          const topicArray = splitAndTrim(topics, ",");
          const labelArray = (labels != null) ? splitAndTrim(labels, ",") : null;
          const hubData = hubDataDic.get(this.name);
          const hasLabels = (labels != null && labels.length > 0);
          // if we have labels, then, we send the labels bound events first
          if (hasLabels) {
              hubData.getRefs(topicArray, labelArray).forEach(function (ref) {
                  invokeRef(ref, data);
              });
          }
          // then, we send the topic only bound
          hubData.getRefs(topicArray, null).forEach(function (ref) {
              // if this send, has label, then, we make sure we invoke for each of this label
              if (hasLabels) {
                  labelArray.forEach(function (label) {
                      invokeRef(ref, data, label);
                  });
              }
              // if we do not have labels, then, just call it.
              else {
                  invokeRef(ref, data);
              }
          });
      }
      deleteHub() {
          hubDic.delete(this.name);
          hubDataDic.delete(this.name);
      }
  }
  // TODO: This was maded to have it private to the hub. Now that we are using trypescript, we might want to use private and store it in the Hub. 
  class HubData {
      constructor(name) {
          this.refsByNs = new Map();
          this.refsByTopic = new Map();
          this.refsByTopicLabel = new Map();
          this.name = name;
      }
      addEvent(topics, labels, fun, opts) {
          const refs = buildRefs(topics, labels, fun, opts);
          const refsByNs = this.refsByNs;
          const refsByTopic = this.refsByTopic;
          const refsByTopicLabel = this.refsByTopicLabel;
          refs.forEach(function (ref) {
              // add this ref to the ns dictionary
              // TODO: probably need to add an custom "ns"
              if (ref.ns != null) {
                  ensureArray(refsByNs, ref.ns).push(ref);
              }
              // if we have a label, add this ref to the topicLabel dictionary
              if (ref.label != null) {
                  ensureArray(refsByTopicLabel, buildTopicLabelKey(ref.topic, ref.label)).push(ref);
              }
              // Otherwise, add it to this ref this topic
              else {
                  ensureArray(refsByTopic, ref.topic).push(ref);
              }
          });
      }
      ;
      getRefs(topics, labels) {
          const refs = [];
          const refsByTopic = this.refsByTopic;
          const refsByTopicLabel = this.refsByTopicLabel;
          topics.forEach(function (topic) {
              // if we do not have labels, then, just look in the topic dic
              if (labels == null || labels.length === 0) {
                  const topicRefs = refsByTopic.get(topic);
                  if (topicRefs) {
                      refs.push.apply(refs, topicRefs);
                  }
              }
              // if we have some labels, then, take those in accounts
              else {
                  labels.forEach(function (label) {
                      const topicLabelRefs = refsByTopicLabel.get(buildTopicLabelKey(topic, label));
                      if (topicLabelRefs) {
                          refs.push.apply(refs, topicLabelRefs);
                      }
                  });
              }
          });
          return refs;
      }
      ;
      removeRefsForNs(ns) {
          const refsByTopic = this.refsByTopic;
          const refsByTopicLabel = this.refsByTopicLabel;
          const refsByNs = this.refsByNs;
          const refs = this.refsByNs.get(ns);
          if (refs != null) {
              // we remove each ref from the corresponding dic
              refs.forEach(function (ref) {
                  // First, we get the refs from the topic or topiclabel
                  let refList;
                  if (ref.label != null) {
                      const topicLabelKey = buildTopicLabelKey(ref.topic, ref.label);
                      refList = refsByTopicLabel.get(topicLabelKey);
                  }
                  else {
                      refList = refsByTopic.get(ref.topic);
                  }
                  // Then, for the refList array, we remove the ones that match this object
                  let idx;
                  while ((idx = refList.indexOf(ref)) !== -1) {
                      refList.splice(idx, 1);
                  }
              });
              // we remove them all form the refsByNs
              refsByNs.delete(ns);
          }
      }
      ;
  }
  // static/private
  function buildRefs(topics, labels, fun, opts) {
      let refs = [];
      topics.forEach(function (topic) {
          // if we do not have any labels, then, just add this topic
          if (labels == null || labels.length === 0) {
              refs.push({
                  topic: topic,
                  fun: fun,
                  ns: opts.ns,
                  ctx: opts.ctx
              });
          }
          // if we have one or more labels, then, we add for those label
          else {
              labels.forEach(function (label) {
                  refs.push({
                      topic: topic,
                      label: label,
                      fun: fun,
                      ns: opts.ns,
                      ctx: opts.ctx
                  });
              });
          }
      });
      return refs;
  }
  // static/private: return a safe opts. If opts is a string, then, assume is it the {ns}
  const emptyOpts = {};
  function makeOpts(opts) {
      if (opts == null) {
          opts = emptyOpts;
      }
      else {
          if (typeof opts === "string") {
              opts = { ns: opts };
          }
      }
      return opts;
  }
  // static/private
  function buildTopicLabelKey(topic, label) {
      return topic + "-!-" + label;
  }
  // static/private: call ref method (with optional label override)
  function invokeRef(ref, data, label) {
      const info = {
          topic: ref.topic,
          label: ref.label || label,
          ns: ref.ns
      };
      ref.fun.call(ref.ctx, data, info);
  }
  //#endregion ---------- /Hub Implementation ----------

  const _onEventsByConstructor = new Map();
  const _computedOnDOMEventsByConstructor = new WeakMap();
  //#region    ---------- Public onEvent Decorator ---------- 
  function onEvent(type, selector_or_opts, opts) {
      return _onDOMEvent(null, type, selector_or_opts, opts);
  }
  //#endregion ---------- /Public onEvent Decorator ---------- 
  // the decorator function
  function _onDOMEvent(evtTarget, type, selector_or_opts, opts) {
      let selector = (typeof selector_or_opts == 'string') ? selector_or_opts : null;
      opts = (selector === null) ? selector_or_opts : opts;
      // target references the element's class. It will be the constructor function for a static method or the prototype of the class for an instance member
      return function (target, propertyKey, descriptor) {
          descriptor.value;
          const clazz = target.constructor;
          // get the onEvents array for this clazz
          let onEvents = _onEventsByConstructor.get(clazz);
          if (onEvents == null) {
              onEvents = [];
              _onEventsByConstructor.set(clazz, onEvents);
          }
          // create and push the event
          const onEvent = {
              target: evtTarget,
              name: propertyKey,
              type: type,
              selector: selector,
              opts
          };
          onEvents.push(onEvent);
      };
  }
  /** Bind the element OnDOMEvent registred in the decorator _onDOMEvent  */
  function bindOnElementEventsDecorators(el) {
      const clazz = el.constructor;
      const computedOnDOMEvents = getComputeOnDOMEvents(clazz);
      if (computedOnDOMEvents != null) {
          const { elOnDOMEvents } = computedOnDOMEvents;
          if (elOnDOMEvents !== null) {
              const eventOpts = { ...el._nsObj, ctx: el };
              for (const onEvent of elOnDOMEvents) {
                  const target = (el.shadowRoot) ? el.shadowRoot : el;
                  const fn = el[onEvent.name];
                  _bindOn(target, onEvent, fn, eventOpts);
              }
          }
      }
  }
  function bindOnParentEventsDecorators(el) {
      const clazz = el.constructor;
      const computedOnDOMEvents = getComputeOnDOMEvents(clazz);
      const { docOnDOMEvents, winOnDOMEvents } = computedOnDOMEvents;
      const eventOpts = { ...el._nsObj, ctx: el, silenceDisconnectedCtx: true };
      if (docOnDOMEvents !== null) {
          for (const onEvent of docOnDOMEvents) {
              const fn = el[onEvent.name];
              _bindOn(onEvent.target, onEvent, fn, eventOpts);
          }
      }
      if (winOnDOMEvents !== null) {
          for (const onEvent of winOnDOMEvents) {
              const fn = el[onEvent.name];
              _bindOn(onEvent.target, onEvent, fn, eventOpts);
          }
      }
  }
  // Private bindOn. Here the target should be resolved before, won't take the onEvent.target
  function _bindOn(target, onEvent, fn, baseEventOpts) {
      let opts = baseEventOpts;
      if (onEvent.opts) {
          opts = { ...baseEventOpts, ...onEvent.opts };
      }
      on(target, onEvent.type, onEvent.selector, fn, opts);
  }
  // Return (and Compute if needed) the ComputedOnDOMEvents for a topClazz and store it in the 
  // Note: At this point, the parent classes will be process but their ComputedOnDOMEvents won't be computed.
  //       This could be a further optimization at some point, but not sure it will give big gain, since now this logic
  //       happen only one for the first instantiation of the class type object.
  function getComputeOnDOMEvents(clazz) {
      const alreadyComputed = _computedOnDOMEventsByConstructor.get(clazz);
      if (alreadyComputed) {
          return alreadyComputed;
      }
      const topClazz = clazz;
      const elOnDOMEvents = [];
      const docOnDOMEvents = [];
      const winOnDOMEvents = [];
      // Keep track of the `function_name` already bound by children classes to avoid double bind for the name function name.
      // This is the intuitive behavior, aligning with inheritance behavior.
      // This works because we are walking the hierarchy tree from child to parent.
      const childrenBoundFnNames = new Set();
      // --- Compute the ComputedOnDOMEvents
      do {
          const onEvents = _onEventsByConstructor.get(clazz);
          if (onEvents) {
              const clazzBoundFnNames = new Set();
              for (const onEvent of onEvents) {
                  const target = onEvent.target;
                  const fnName = onEvent.name;
                  // bind only if this function name was not already bound by a children
                  if (!childrenBoundFnNames.has(fnName)) {
                      // get the appropriate onDOMEvents list to push this event given the target
                      let onDOMEvents;
                      if (target === window) {
                          onDOMEvents = winOnDOMEvents;
                      }
                      else if (target === document) {
                          onDOMEvents = docOnDOMEvents;
                      }
                      else {
                          onDOMEvents = elOnDOMEvents;
                      }
                      onDOMEvents.push(onEvent);
                      // add the name to this class boundFnNames to be added to the childrenBoundFnNames later
                      clazzBoundFnNames.add(fnName);
                  }
              } // for onEvent of onEvents
              // add this class bound fnNames to the childrenBoudFnNames for next parent class resolution
              for (const fnName of clazzBoundFnNames) {
                  childrenBoundFnNames.add(fnName);
              }
          }
          // get the parent class
          // clazz = (<any>clazz).__proto__;
          clazz = Object.getPrototypeOf(clazz);
      } while (clazz !== HTMLElement);
      const computedOnDOMEvents = {
          elOnDOMEvents: elOnDOMEvents.length > 0 ? elOnDOMEvents : null,
          docOnDOMEvents: docOnDOMEvents.length > 0 ? docOnDOMEvents : null,
          winOnDOMEvents: winOnDOMEvents.length > 0 ? winOnDOMEvents : null,
      };
      _computedOnDOMEventsByConstructor.set(topClazz, computedOnDOMEvents);
      return computedOnDOMEvents;
  }
  function hasParentEventsDecorators(el) {
      const clazz = el.constructor;
      const computed = getComputeOnDOMEvents(clazz);
      return (computed.docOnDOMEvents != null || computed.winOnDOMEvents != null);
  }
  // only unbind docEvent and winEvent
  function unbindParentEventsDecorators(el) {
      const clazz = el.constructor;
      const computed = getComputeOnDOMEvents(clazz);
      if (computed.docOnDOMEvents != null) {
          off(document, el._nsObj);
      }
      if (computed.winOnDOMEvents != null) {
          off(window, el._nsObj);
      }
  }

  const _onHubEventByConstructor = new Map();
  const _computedOnHubEventByConstructor = new WeakMap();
  //#region    ---------- Public onEvent Decorator ---------- 
  /**
   * `onHub` decorator to bind a hub event to this instance.
   */
  function onHub(hubName, topic, label) {
      // target references the element's class. It will be the constructor function for a static method or the prototype of the class for an instance member
      return function (target, propertyKey, descriptor) {
          const clazz = target.constructor;
          // get the onEvents array for this clazz
          let onEvents = _onHubEventByConstructor.get(clazz);
          if (onEvents == null) {
              onEvents = [];
              _onHubEventByConstructor.set(clazz, onEvents);
          }
          // create and push the event
          const onEvent = {
              methodName: propertyKey,
              hubName,
              topic,
              label
          };
          onEvents.push(onEvent);
      };
  }
  //#endregion ---------- /Public onEvent Decorator ---------- 
  function hasHubEventDecorators(el) {
      return getComputedOnHubEvents(el.constructor) != null;
  }
  // For BaseHTMLElement
  function bindOnHubDecorators() {
      let clazz = this.constructor;
      const computed = getComputedOnHubEvents(clazz);
      if (computed != null) {
          const opts = { ...this._nsObj, ctx: this };
          for (const onEvent of computed) {
              const fnName = onEvent.methodName;
              const fn = this[fnName];
              const h = hub(onEvent.hubName);
              h.sub(onEvent.topic, onEvent.label, fn, opts);
          }
      }
  }
  // only unbind docEvent and winEvent
  function unbindOnHubDecorators() {
      let clazz = this.constructor;
      const computed = getComputedOnHubEvents(clazz);
      const nsObj = this._nsObj;
      if (computed != null) {
          for (const onEvent of computed) {
              const { hubName, methodName } = onEvent;
              const h = hub(hubName);
              h.unsub(nsObj);
          }
      }
  }
  function getComputedOnHubEvents(clazz) {
      const topClazz = clazz;
      const topClazzHubEvents = [];
      // keep track of the function name that were bound, to not double bind overriden parents
      // This is the intuitive behavior, aligning with inheritance behavior.
      const fnNameBoundSet = new Set();
      do {
          const onEvents = _onHubEventByConstructor.get(clazz);
          if (onEvents) {
              for (const onEvent of onEvents) {
                  const fnName = onEvent.methodName;
                  if (!fnNameBoundSet.has(fnName)) {
                      topClazzHubEvents.push(onEvent);
                      fnNameBoundSet.add(fnName);
                  }
              }
          }
          // clazz = (<any>clazz).__proto__;
          clazz = Object.getPrototypeOf(clazz);
      } while (clazz != HTMLElement);
      const computed = topClazzHubEvents.length > 0 ? topClazzHubEvents : null;
      _computedOnHubEventByConstructor.set(topClazz, computed);
      return computed;
  }

  // (c) 2019 BriteSnow, inc - This code is licensed under MIT license (see LICENSE for details)
  // component unique sequence number to allow to have cheap UID for each component
  let c_seq = 0;
  /**
   * BaseHTMLElement that all custom elements from this application should inherit from.
   *
   * SubClass Usage:
   *   - `init()` to create/modify the innerHTML/children, bind events. Must call `super.init()`
   *   - `this.uid` is the unique id for this component instance, so, can use to bind parent element events for later cleanup.
   *   - `disconnectedCallback()` to unbind any events bound to the parent of the component (document event binding). Must call `super.disconnectedCallback()`
   *
   * Important:
   *   - SubClass should/must override `init()` but never call `init()` from anywhere. Only `BaseHTMLElement.connectedCallback()` implementation should call `init()`
   *   - All calls to custom element interface `disconnectedCallback()` `connectedCallback()` `attributeChangedCallback()` MUST call their `super...` method.
   *
   */
  class BaseHTMLElement extends HTMLElement {
      constructor() {
          super();
          // lifecyle _init state
          this._init = false;
          this._parent_bindings_done = false;
          this._parent_unbindings_planned = false;
          this._hub_bindings_done = false;
          this._preDisplay_attached = false;
          this._postDisplay_attached = false;
          this.uid = 'c_uid_' + c_seq++;
          this._nsObj = { ns: this.uid };
      }
      get initialized() { return this._init; }
      /**
       * Method to override to create child elements. Will be called only once by the BaseHTMLElement `connectedCallback()` implementation.
       *
       * - Best Pratice: call `super.init()` when overriden.
       * - DO NOT call this method, this is called by BaseHTMLElement internal.
       *
       */
      init() { }
      /**
       * Base implementation of `connectedCallback` that will call `this.init()` once.
       *
       * - MUST call `super.connectedCallback()` when overriden.
       */
      connectedCallback() {
          const opts = { ns: this._nsObj.ns, ctx: this };
          if (this._has_parent_events == null) {
              this._has_parent_events = this.docEvents != null || this.winEvents != null || hasParentEventsDecorators(this);
          }
          // --- Bind the eventual parent events (document, windows)
          // Note: Parent events are silenced on when el is diconnected, and unbound when next frame still diconnected
          if (this._has_parent_events && !this._parent_bindings_done) {
              // bind the @docDoc event
              if (this.docEvents)
                  bindOnEvents(document, this.docEvents, { ...opts, silenceDisconnectedCtx: true });
              // bind the @docWin event
              if (this.winEvents)
                  bindOnEvents(window, this.winEvents, { ...opts, silenceDisconnectedCtx: true });
              bindOnParentEventsDecorators(this);
              this._parent_bindings_done = true;
          }
          // --- Bind the hub if not already done
          // Note: Hub events are bound and unbound on each connect and disconnect. 
          //       (could use the parent event optimation later)
          if (!this._hub_bindings_done) {
              if (this.hubEvents)
                  bindHubEvents(this.hubEvents, opts);
              bindOnHubDecorators.call(this);
              this._hub_bindings_done = true;
          }
          // --- Peform the init
          if (!this._init) {
              if (this.events)
                  bindOnEvents(this, this.events, opts);
              // bind the @onEvent decorated methods
              bindOnElementEventsDecorators(this);
              this.init();
              this._init = true;
          }
          // --- Register the eventual preDisplay / postDisplay
          // Note - Will pass the "firstCall" flag to both method. 
          if (this.preDisplay) {
              let firstCall = !(this._preDisplay_attached === true);
              requestAnimationFrame(() => {
                  this.preDisplay(firstCall);
                  this._preDisplay_attached = false;
              });
          }
          if (this.postDisplay) {
              let firstCall = !(this._postDisplay_attached === true);
              this._postDisplay_attached = true;
              requestAnimationFrame(() => {
                  requestAnimationFrame(() => {
                      this.postDisplay(firstCall);
                      this._postDisplay_attached = false;
                  });
              });
          }
      }
      /**
       * Empty implementation to allow `super.disconnectedCallback()` best practices on sub classes
       */
      disconnectedCallback() {
          // NOTE: Here we detached
          if (this._has_parent_events === true) {
              requestAnimationFrame(() => {
                  if (!this.isConnected) {
                      if (this.docEvents) {
                          off(document, this._nsObj);
                      }
                      if (this.winEvents) {
                          off(window, this._nsObj);
                      }
                      unbindParentEventsDecorators(this);
                      this._parent_bindings_done = false;
                  }
              });
          }
          if (this.hubEvents || hasHubEventDecorators(this)) {
              if (this.hubEvents != null) {
                  unbindHubEvents(this.hubEvents, this._nsObj);
              }
              unbindOnHubDecorators.call(this);
              this._hub_bindings_done = false;
          }
      }
  }

  // Implementation Note: Using 'String' rather than 'string' in the typing above is critical to allow to get A[K] to match TagName type. 
  function html(strings, ...values) {
      let html;
      if (typeof strings === 'string') {
          html = strings.trim();
      }
      else {
          let r = '';
          for (let i = 0; i < strings.length; i++) {
              r += strings[i] + (values[i] ?? '');
          }
          // make it null proof
          html = r;
      }
      const template = document.createElement("template");
      if (html) {
          template.innerHTML = html;
      }
      return template.content;
  }

  function process_arg_el_selectors(el_or_selectors, maybe_selectors) {
      let selectors;
      let el;
      if (typeof el_or_selectors == "string") {
          maybe_selectors.unshift(el_or_selectors);
          selectors = maybe_selectors;
          el = document;
      }
      else if (Array.isArray(el_or_selectors)) {
          selectors = el_or_selectors;
          el = document;
      }
      else {
          selectors = maybe_selectors;
          el = el_or_selectors;
      }
      return [el, selectors];
  }
  function first(el_or_selectors, ...maybe_selectors) {
      let [el, selectors] = process_arg_el_selectors(el_or_selectors, maybe_selectors);
      const l = selectors.length;
      if (l == 0 || l == 1) {
          return _first(el, selectors[0]);
      }
      else {
          return selectors.map(sel => _first(el, sel));
      }
  }
  function _first(el, selector) {
      if (el == null) {
          return null;
      }
      // We do not have a selector at all, then, this call is for firstElementChild
      if (selector == null) {
          return el.firstElementChild;
      }
      // otherwise, the call was either (selector) or (el, selector), so foward to the querySelector
      else {
          return _execQuerySelector(false, el, selector);
      }
  }
  function getChildren(el, ...names) {
      const childrenCount = el.childElementCount;
      if (childrenCount < names.length) {
          throw new Error("dom-native - getChildren - node has less children than requested names");
      }
      const result = [];
      let nameIdx = 0;
      for (const child of el.children) {
          let name = names[nameIdx].toUpperCase();
          if (child.tagName === name) {
              // Note: could do an instanceof HTMLElement (need measure perf impact vs value of the check)
              result.push(child);
              nameIdx += 1;
          }
          if (nameIdx >= childrenCount || nameIdx >= names.length) {
              break;
          }
      }
      if (result.length < names.length) {
          throw new Error("dom-native - getChildren - node has less match children than requested");
      }
      return result;
  }
  function _execQuerySelector(all, elOrSelector, selector) {
      let el = null;
      // if el is null or undefined, means we return nothing. 
      if (elOrSelector == null) {
          return null;
      }
      // if selector is undefined, it means we select from document and el is the document
      if (typeof selector === "undefined") {
          selector = elOrSelector;
          el = document;
      }
      else {
          el = elOrSelector;
      }
      return (all) ? el.querySelectorAll(selector) : el.querySelector(selector);
  }
  // #endregion --- append

  document.createElement('div');
  document.createElement('e');

  function customElement(tagName) {
      // target references the element's class. 
      return function (target) {
          customElements.define(tagName, target);
      };
  }

  /**
   * c-ico - svg icons waring the svg use
   * Note: Assume the symbol are local to the document
   */
  let Ico = class Ico extends BaseHTMLElement {
      init() {
          const name = this.getAttribute("name")?.trim();
          const htmlContent = html `<svg class="symbol">
    	<use xlink:href="#${name}"></use>
    </svg>`;
          this.append(htmlContent);
      }
  };
  Ico = __decorate([
      customElement('c-ico')
  ], Ico);

  const API_BASE_PATH = '/api';
  async function webGet(path, data) {
      return webCall("GET", path, data);
  }
  async function webPost(path, data) {
      return webCall("POST", path, data);
  }
  async function webPatch(path, data) {
      return webCall("PATCH", path, data);
  }
  async function webDelete(path, data) {
      return webCall("DELETE", path, data);
  }
  async function webCall(httpMethod, path, data) {
      const url = `${API_BASE_PATH}/${path}`;
      const response = await fetch(url, {
          method: httpMethod,
          mode: 'same-origin',
          cache: 'no-cache',
          headers: {
              'Content-Type': 'application/json',
              'X-Auth-Token': '123'
          },
          body: JSON.stringify(data)
      });
      let res = await response.json();
      return res.data;
  }

  // *** Replaces todo-mco.ts ***
  class QuoteMco {
      async list() {
          const data = await webGet("quotes");
          return data;
      }
      async create(data) {
          // guard (QUOTE - validate data)
          if (data.quote == null || data.quote.trim().length == 0) {
              throw new Error("Cannot create Quote with empty title");
          }
          // to server
          const newData = await webPost('quotes', data);
          // sending event
          hub('dataHub').pub('Quote', 'create', newData);
          return newData;
      }
      async update(id, data) {
          // TODO - validate data
          // to server
          const newData = await webPatch(`quotes/${id}`, data);
          // event
          hub('dataHub').pub('Quote', 'update', newData);
          return newData;
      }
      async delete(id) {
          // to server
          const oldData = await webDelete(`quotes/${id}`);
          // event
          hub('dataHub').pub('Quote', 'delete', oldData);
          return oldData;
      }
  }
  const quoteMco = new QuoteMco();

  var _QuoteMvc_quoteInputEl, _QuoteMvc_quoteListEl, _QuoteInput_quoteInput, _QuoteInput_authorInput, _QuoteItem_instances, _QuoteItem_quoteEl, _QuoteItem_authorEl, _QuoteItem_data, _QuoteItem_safeClass;
  // Region: Quote Model View Controller
  let QuoteMvc = class QuoteMvc extends BaseHTMLElement {
      constructor() {
          super(...arguments);
          _QuoteMvc_quoteInputEl.set(this, void 0);
          _QuoteMvc_quoteListEl.set(this, void 0);
          // #endregion
      }
      init() {
          var _a, _b;
          const htmlContent = html `
      <div class="box"></div>
      <h1>quotes</h1>
      <quote-input></quote-input>
      <quote-list></quote-list>
    `;
          _a = this, _b = this, [({ set value(_c) { __classPrivateFieldSet(_a, _QuoteMvc_quoteInputEl, _c, "f"); } }).value, ({ set value(_c) { __classPrivateFieldSet(_b, _QuoteMvc_quoteListEl, _c, "f"); } }).value] = getChildren(htmlContent, 'quote-input', 'quote-list');
          this.append(htmlContent);
          this.refresh();
      }
      async refresh() {
          try {
              const quotes = await quoteMco.list();
              const htmlContent = document.createDocumentFragment();
              for (const quote of quotes) {
                  const el = document.createElement('quote-item');
                  el.data = quote;
                  htmlContent.append(el);
              }
              __classPrivateFieldGet(this, _QuoteMvc_quoteListEl, "f").innerHTML = '';
              __classPrivateFieldGet(this, _QuoteMvc_quoteListEl, "f").append(htmlContent);
          }
          catch (err) {
              console.error('Failed to load quotes:', err);
          }
      }
      // #region --- UI Events
      async onCheckQuote(evt) {
          const quoteItem = evt.selectTarget.closest("quote-item");
          try {
              await quoteMco.delete(quoteItem.data.id);
              this.refresh();
          }
          catch (err) {
              console.error('Failed to delete quote:', err);
          }
      }
      // #endregion
      // #region --- Data Events
      onQuoteUpdate(data) {
          const quoteItem = first(`quote-item.Quote-${data.id}`);
          if (quoteItem) {
              quoteItem.data = data;
          }
      }
      onQuoteCreate(data) {
          this.refresh();
      }
  };
  _QuoteMvc_quoteInputEl = new WeakMap();
  _QuoteMvc_quoteListEl = new WeakMap();
  __decorate([
      onEvent('pointerup', 'c-check')
  ], QuoteMvc.prototype, "onCheckQuote", null);
  __decorate([
      onHub('dataHub', 'Quote', 'update')
  ], QuoteMvc.prototype, "onQuoteUpdate", null);
  __decorate([
      onHub('dataHub', 'Quote', 'create')
  ], QuoteMvc.prototype, "onQuoteCreate", null);
  QuoteMvc = __decorate([
      customElement("quote-mvc")
  ], QuoteMvc);
  /* ------------------- quote-input ------------------- */
  let QuoteInput = class QuoteInput extends BaseHTMLElement {
      constructor() {
          super(...arguments);
          _QuoteInput_quoteInput.set(this, void 0);
          _QuoteInput_authorInput.set(this, void 0);
      }
      init() {
          this.append(html `
      <input type="text" placeholder="Enter your quote here">
      <input type="text" placeholder="Who said this?">
    `);
          const inputs = this.querySelectorAll('input');
          __classPrivateFieldSet(this, _QuoteInput_quoteInput, inputs[0], "f");
          __classPrivateFieldSet(this, _QuoteInput_authorInput, inputs[1], "f");
      }
      async onInputKeyUp(evt) {
          if (evt.key === "Enter") {
              const quote = __classPrivateFieldGet(this, _QuoteInput_quoteInput, "f").value.trim();
              const author = __classPrivateFieldGet(this, _QuoteInput_authorInput, "f").value.trim();
              if (quote) {
                  try {
                      await quoteMco.create({ quote, author });
                      __classPrivateFieldGet(this, _QuoteInput_quoteInput, "f").value = '';
                      __classPrivateFieldGet(this, _QuoteInput_authorInput, "f").value = '';
                  }
                  catch (err) {
                      console.error('Failed to create quote:', err);
                  }
              }
          }
      }
  };
  _QuoteInput_quoteInput = new WeakMap();
  _QuoteInput_authorInput = new WeakMap();
  __decorate([
      onEvent('keyup', 'input')
  ], QuoteInput.prototype, "onInputKeyUp", null);
  QuoteInput = __decorate([
      customElement("quote-input")
  ], QuoteInput);
  /* ------------------- quote-item ------------------- */
  let QuoteItem = class QuoteItem extends BaseHTMLElement {
      constructor() {
          super(...arguments);
          _QuoteItem_instances.add(this);
          _QuoteItem_quoteEl.set(this, void 0);
          _QuoteItem_authorEl.set(this, void 0);
          _QuoteItem_data.set(this, void 0);
      }
      set data(data) {
          const oldData = __classPrivateFieldGet(this, _QuoteItem_data, "f");
          __classPrivateFieldSet(this, _QuoteItem_data, Object.freeze(data), "f");
          if (this.isConnected)
              this.refresh(oldData);
      }
      get data() {
          return __classPrivateFieldGet(this, _QuoteItem_data, "f");
      }
      init() {
          const htmlContent = html `
      <c-check><c-ico name="ico-done"></c-ico></c-check>
      <div class="quote-text">STATIC QUOTE</div>
      <div class="quote-author">STATIC AUTHOR</div>
      <c-ico name="del"></c-ico>
    `;
          const [quoteEl, authorEl] = getChildren(htmlContent, 'div', 'div');
          __classPrivateFieldSet(this, _QuoteItem_quoteEl, quoteEl, "f");
          __classPrivateFieldSet(this, _QuoteItem_authorEl, authorEl, "f");
          this.append(htmlContent);
          this.refresh();
      }
      refresh(old) {
          if (old) {
              this.classList.remove(`Quote-${old.id}`);
              this.classList.remove(__classPrivateFieldGet(this, _QuoteItem_instances, "m", _QuoteItem_safeClass).call(this, old.quote));
              this.classList.remove(__classPrivateFieldGet(this, _QuoteItem_instances, "m", _QuoteItem_safeClass).call(this, old.author));
          }
          const quote = __classPrivateFieldGet(this, _QuoteItem_data, "f");
          this.classList.add(`Quote-${quote.id}`);
          this.classList.add(__classPrivateFieldGet(this, _QuoteItem_instances, "m", _QuoteItem_safeClass).call(this, quote.quote));
          this.classList.add(__classPrivateFieldGet(this, _QuoteItem_instances, "m", _QuoteItem_safeClass).call(this, quote.author));
          __classPrivateFieldGet(this, _QuoteItem_quoteEl, "f").textContent = `"${quote.quote}"`;
          __classPrivateFieldGet(this, _QuoteItem_authorEl, "f").textContent = `— ${quote.author || "Unknown"}`;
      }
  };
  _QuoteItem_quoteEl = new WeakMap();
  _QuoteItem_authorEl = new WeakMap();
  _QuoteItem_data = new WeakMap();
  _QuoteItem_instances = new WeakSet();
  _QuoteItem_safeClass = function _QuoteItem_safeClass(str) {
      return str.replace(/[^\w-]/g, "_");
  };
  QuoteItem = __decorate([
      customElement('quote-item')
  ], QuoteItem);

  console.log("->> hello from main.ts");

})();
//# sourceMappingURL=app-bundle.js.map
