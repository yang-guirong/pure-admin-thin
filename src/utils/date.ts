// 扩展 Date 原型方法
Date.prototype.format = function (pattern: string): string {
  return formatDate(this, pattern);
};

/**
 * 日期格式化
 * @param date 日期
 * @param pattern 格式化字符串
 * @returns 格式化后的日期字符串
 */
export const formatDate = (date: Date, pattern: string): string => {
  const opt = {
    "y+": date.getFullYear().toString(), // 年
    "M+": (date.getMonth() + 1).toString(), // 月
    "d+": date.getDate().toString(), // 日
    "H+": date.getHours().toString(), // 时
    "m+": date.getMinutes().toString(), // 分
    "s+": date.getSeconds().toString(), // 秒
    "S+": date.getMilliseconds().toString() // 毫秒
  };
  let ret;
  let result = pattern;
  for (let k in opt) {
    ret = new RegExp("(" + k + ")").exec(result);
    if (ret) {
      result = result.replace(
        ret[1],
        ret[1].length === 1 ? opt[k] : opt[k].padStart(ret[1].length, "0")
      );
    }
  }
  return result;
};
