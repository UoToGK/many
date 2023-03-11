/**给定一个排序数组和一个目标值，在数组中找到目标值，并返回其索引。如果目标值不存在于数组中，返回它将会被按顺序插入的位置
 * 输入: [1,3,5,6], 5
    输出: 2
 * @param {number[]} nums
 * @param {number} target
 * @return {number}
 */
var searchInsert = function(nums, target) {
  for (let i = 0; i < nums.length; i++) {
    if (nums[i] !== target) {
      if (target > nums[nums.length - 1]) {
        return nums.length;
      } else {
        if (target < nums[i]) {
          return i;
        }
      }
    } else {
      return nums.indexOf(target);
      break;
    }
  }
};
var nums = [1, 3, 5];
var target = 4;
console.log(searchInsert(nums, target));
