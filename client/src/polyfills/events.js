function EventEmitter() {
  this._events = this._events || Object.create(null);
}

EventEmitter.prototype.on = function on(event, listener) {
  this._events = this._events || Object.create(null);
  const listeners = this._events[event] || [];
  listeners.push(listener);
  this._events[event] = listeners;
  return this;
};

EventEmitter.prototype.addListener = EventEmitter.prototype.on;

EventEmitter.prototype.once = function once(event, listener) {
  const wrapped = (...args) => {
    this.removeListener(event, wrapped);
    listener.apply(this, args);
  };
  wrapped.listener = listener;
  return this.on(event, wrapped);
};

EventEmitter.prototype.emit = function emit(event, ...args) {
  const listeners = this._events?.[event];
  if (!listeners || listeners.length === 0) return false;
  listeners.slice().forEach((listener) => listener.apply(this, args));
  return true;
};

EventEmitter.prototype.removeListener = function removeListener(event, listener) {
  const listeners = this._events?.[event];
  if (!listeners) return this;
  this._events[event] = listeners.filter(
    (item) => item !== listener && item.listener !== listener
  );
  return this;
};

EventEmitter.prototype.off = EventEmitter.prototype.removeListener;

EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
  if (!this._events) return this;
  if (event) delete this._events[event];
  else this._events = Object.create(null);
  return this;
};

EventEmitter.prototype.listeners = function listeners(event) {
  return this._events?.[event]?.slice() || [];
};

EventEmitter.prototype.listenerCount = function listenerCount(event) {
  return this.listeners(event).length;
};

EventEmitter.listenerCount = function listenerCount(emitter, event) {
  return emitter.listenerCount(event);
};

export { EventEmitter };
export default { EventEmitter };
