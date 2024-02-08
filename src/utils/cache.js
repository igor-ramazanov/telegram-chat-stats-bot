const cache = ({ maxValues = 1000 } = {}) => {
  let idx0 = 0;
  let idx1 = 0;
  let store = {};
  let keys = {};
  return {
    set(key, value, { ttl = 1e10 } = {}) {
      const expire = Date.now() + ttl;
      const exists = Boolean(store[key]);
      const entry = { value, expire, idx: idx1 };
      store[key] = entry;
      if (!exists) keys[idx1++] = key;
      if (idx1 - idx0 > maxValues) {
        for (let i = idx0; i < idx1 - maxValues; i++) {
          delete store[keys[i]];
          delete keys[i];
        }
        idx0 = idx1 - maxValues;
      }
    },
    get(key) {
      if (store[key]?.expire < Date.now()) {
        delete store[key];
      }
      return key in store ? store[key].value : null;
    },
    has(key) {
      return Boolean(store[key]);
    }
  };
};

module.exports = { cache };
