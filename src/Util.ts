export default {
  /**
   * 循环
   * @param limit
   * @param n
   * @param delta
   * @returns {number}
   */
  rotation: function(limit: number, n: number, delta: number) {
    let r = (n + delta) % limit
    return r + (r < 0 ? limit : 0)
  },
  /**
   * 对称
   * @param limit
   * @param n
   * @returns {number}
   */
  symmetric: function(limit: number, n: number) {
    return limit - n - 1
  },
  matrix: function(len: number, arr: number[]) {
    let r = []
    for (let i = 0; i < len; i++) {
      r.push(arr.slice(i * len, (i + 1) * len))
    }
    return r
  }
}
