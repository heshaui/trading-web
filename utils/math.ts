function add(arg1: number, arg2: number): number {
    let r1: number;
    let r2: number;
    let m = 0;
  
    try {
      r1 = arg1.toString().split('.')[1].length;
    } catch (e) {
      console.log(e);
      r1 = 0;
    }
    try {
      r2 = arg2.toString().split('.')[1].length;
    } catch (e) {
      console.log(e);
      r2 = 0;
    }
    m = 10 ** Math.max(r1, r2);
    return (arg1 * m + arg2 * m) / m;
  }
  
  function cut(arg1: number, arg2: number): string {
    let r1: number;
    let r2: number;
    let m = 0;
    let n = 0;
  
    try {
      r1 = arg1.toString().split('.')[1].length;
    } catch (e) {
      console.log(e);
      r1 = 0;
    }
    try {
      r2 = arg2.toString().split('.')[1].length;
    } catch (e) {
      console.log(e);
      r2 = 0;
    }
    m = 10 ** Math.max(r1, r2);
    n = r1 >= r2 ? r1 : r2;
    return ((arg1 * m - arg2 * m) / m).toFixed(n);
  }
  
  function nul(arg1: number, arg2: number): number {
    if (arg1 === undefined || arg1 === null || arg2 === undefined || arg2 === null) {
        return 0;
    }

    let m = 0;
    const s1 = String(arg1);
    const s2 = String(arg2);
  
    try {
      m += s1.split('.')[1]?.length || 0;
    } catch (e) {
      console.log(e);
    }
    try {
      m += s2.split('.')[1]?.length || 0;
    } catch (e) {
      console.log(e);
    }
    return (
      (Number(s1.replace('.', '')) * Number(s2.replace('.', ''))) /
      10 ** m
    );
  }
  
  function division(arg1: number, arg2: number): number {
    let t1 = 0;
    let t2 = 0;
    let r1: number;
    let r2: number;
  
    try {
      t1 = arg1.toString().split('.')[1].length;
    } catch (e) {
      console.log(e);
      // No decimal places in arg1
    }
    try {
      t2 = arg2.toString().split('.')[1].length;
    } catch (e) {
      console.log(e);
      // No decimal places in arg2
    }
    r1 = Number(arg1.toString().replace('.', ''));
    r2 = Number(arg2.toString().replace('.', ''));
    return (r1 / r2) * 10 ** (t2 - t1);
  }
  
  function lastD(num: number | string | null | undefined): string | number | null | undefined {
    if (!num) return num;
  
    const newNum: string = `${num}`;
    const str: string | undefined = newNum.split('.')[1];
    if (!str) return newNum;
  
    function substring(stri: string): string {
      const arr: string[] = stri.split('');
      for (let i = arr.length - 1; i >= 0; i -= 1) {
        if (arr[i] === '0') {
          arr.splice(i);
        } else {
          break;
        }
      }
      if (!arr.length) return newNum.split('.')[0];
      return `${newNum.split('.')[0]}.${arr.join('')}`;
    }
  
    return substring(str);
  }

  function thousandsComma(num: number | string | undefined | null): string {
    let Num: string = (num || 0).toString();
    let symbol = '';
  
    // 判断是否有正负号
    if (/^\+|^-/.test(Num)) {
      symbol = Num.substr(0, 1);
      Num = Num.substr(1);
    }
  
    let floatNum = ''; // 小数部分
    let intNum = ''; // 整数部分
  
    // 判断是否有小数位，有则截取小数点后的数字
    if (Num.indexOf('.') > 0) {
      const number = Num.indexOf('.'); // 获取小数点出现的位置
      floatNum = Num.substr(number); // 截取小数点及后续数字
      intNum = Num.substring(0, number); // 截取小数点前的数字
    } else {
      intNum = Num; // 没有小数的情况
    }
  
    const result: string[] = [];
    let counter = 0;
    const intNumArray = intNum.split(''); // 将整数部分转换为字符数组
  
    // 利用3的倍数，向数组插入','
    for (let i = intNumArray.length - 1; i >= 0; i -= 1) {
      counter += 1;
      result.unshift(intNumArray[i]); // 从尾部插入当前字符
      if (counter % 3 === 0 && i !== 0) {
        result.unshift(','); // 每3位插入一个逗号
      }
    }
  
    return symbol + result.join('') + (floatNum || ''); // 拼接正负号、整数部分和小数部分
  }

  /**
   * 四舍五入保留小数位数
   * @param num 要处理的数字
   * @param places 要保留的小数位数，默认为0
   * @returns 处理后的数字
   */
   function roundOff(num: number | string | undefined | null, places: number = 0): number {
    if (num === undefined || num === null||!num) return 0;
    
    // 将输入转换为数字
    const number = typeof num === 'string' ? parseFloat(num) : num;
    
    // 如果是NaN，返回0
    if (isNaN(number)) return 0;
    
    // 使用Math.round和Math.pow实现四舍五入
    const factor = Math.pow(10, places);
    return Math.round(number * factor) / factor;
  }

  /**
   * 去尾法保留小数位数
   * @param num 要处理的数字
   * @param places 要保留的小数位数，默认为0
   * @returns 处理后的数字
   */
   function roundDown(num: number | string | undefined | null, places: number = 0): number {
    if (num === undefined || num === null||!num) return 0;
    
    // 将输入转换为数字
    const number = typeof num === 'string' ? parseFloat(num) : num;
    
    // 如果是NaN，返回0
    if (isNaN(number)) return 0;
    
    // 使用Math.floor和Math.pow实现去尾
    const factor = Math.pow(10, places);
    return Math.floor(number * factor) / factor;
  }

    /**
   * 进一法保留小数位数
   * @param num 要处理的数字
   * @param places 要保留的小数位数，默认为0
   * @returns 处理后的数字
   */
    function roundUp(num: number | string | undefined | null, places: number = 0): number {
        if (num === undefined || num === null || !num) return 0;
        
        // 将输入转换为数字
        const number = typeof num === 'string' ? parseFloat(num) : num;
        
        // 如果是NaN，返回0
        if (isNaN(number)) return 0;
        
        // 使用Math.ceil和Math.pow实现进一法
        const factor = Math.pow(10, places);
        return Math.ceil(number * factor) / factor;
    }

  export {
    add, // 加法
    cut, // 减法
    nul, // 乘法
    division, // 除法
    lastD, // 删除小数点最后面的0
    thousandsComma, // 千位数字每三位加逗号
    roundOff, // 四舍五入
    roundDown, // 向下取整
    roundUp, // 向上取整
  };