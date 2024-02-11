const cache = ({ maxValues = 1000, checkInterval = -1 } = {}) => {
  const store = new Map();

  if (checkInterval > 0) {
    setInterval(() => {
      const now = Date.now();
      for (const [key, { expire }] of store.entries()) {
        if (expire < now) {
          store.delete(key);
        }
      }
    }, checkInterval);
  }

  return {
    set(key, value, { ttl = Infinity } = {}) {
      if (store.size >= maxValues) {
        const oldestKey = store.keys().next().value;
        store.delete(oldestKey);
      }
      const expire = Date.now() + ttl;
      store.set(key, { value, expire });
    },

    get(key) {
      const entry = store.get(key);
      if (entry && entry.expire < Date.now()) {
        store.delete(key);
        return null;
      }
      return entry ? entry.value : null;
    },

    has(key) {
      const entry = store.get(key);
      if (entry && entry.expire >= Date.now()) {
        return true;
      }
      store.delete(key);
      return false;
    }
  };
};

module.exports = { cache };