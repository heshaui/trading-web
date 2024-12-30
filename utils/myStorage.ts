export default (function myStorage() {
    const ms: string = 'myStorage';
    const storage = window.localStorage;
  
    if (!window.localStorage) {
      console.warn('浏览器不支持localStorage');
      return null;
    }
  
    const init = (): void => {
      storage.setItem(ms, '{}');
    };
  
    const set = (key: string, value: unknown): Record<string, unknown> | null => {
      // 存储
      let mydata = storage.getItem(ms);
      if (!mydata) {
        init();
        mydata = storage.getItem(ms);
      }
      if (mydata) {
        const data = JSON.parse(mydata);
        data[key] = value;
        storage.setItem(ms, JSON.stringify(data));
        return data;
      }
      return null;
    };
  
    const get = (key: string): unknown | null => {
      // 读取
      const mydata = storage.getItem(ms);
      if (!mydata) return null;
      const data = JSON.parse(mydata);
      return data[key];
    };
  
    const remove = (key: string): Record<string, unknown> | null => {
      // 删除指定键
      const mydata = storage.getItem(ms);
      if (!mydata) return null;
      const data = JSON.parse(mydata);
      delete data[key];
      storage.setItem(ms, JSON.stringify(data));
      return data;
    };
  
    const clear = (): void => {
      // 清除存储对象
      storage.removeItem(ms);
    };
  
    return {
      set,
      get,
      remove,
      init,
      clear,
    };
  })();