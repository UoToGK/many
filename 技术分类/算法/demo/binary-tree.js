/**
 * @description 前序遍历：优先遍历当前节点，再遍历左子树 ，再遍历右子树。
 * @param treeNode
 * @returns []
 * @example
 */
var frontBinaryTree = function(treeNode) {
  let result = [];

  const traversing = node => {
    if (!node) return [];
    //优先遍历当前节点
    result.push(node.val);
    //再遍历左子树
    if (node.left) {
      result.concat(traversing(node.left));
    }
    //再遍历右子树
    if (node.right) {
      result.concat(traversing(node.right));
    }
  };

  traversing(treeNode);

  return result;
};

/**
 * @description 中序遍历：，先遍历左子树 ，再遍历当前节点，再遍历右子树。
 * @param treeNode
 * @returns []
 * @example [REFERENCE](https://cnodejs.org/topic/5c8e18657ce0df3732428da8) 
 */
var middleBinaryTree = function(treeNode) {
  let result = [];

  const traversing = node => {
    if (!node) return [];
    //先遍历左子树
    if (node.left) {
      result.concat(traversing(node.left));
    }
    //再遍历当前节点
    if (node.val) {
      result.push(node.val);
    }
    //再遍历右子树
    if (node.right) {
      result.concat(traversing(node.right));
    }
  };

  traversing(treeNode);

  return result;
};

/**
 *
 * @description 根据传入的遍历模式封装一下
 * @param treeNode
 * @param mode 可以取值0 、1、2 分别代表前序，中序，后序遍历
 * @retrun {Array}
 */
var modeBinaryTree = function(treeNode, mode) {
  var FRONT = 0; //前序遍历
  var MIDDLE = 1; //中序
  var END = 2; //后序
  let result = [];
  traversing(treeNode);

  var traversing = node => {
    if (!node) return [];
    if (mode === FRONT) {
      getCurNodeVal();
      getCurNodeLeftVal();
      getCurNodeRightVal();
    }
    if (mode === MIDDLE) {
      getCurNodeLeftVal();
      getCurNodeVal();
      getCurNodeRightVal();
    }
    if (mode === END) {
      getCurNodeRightVal();
      getCurNodeLeftVal();
      getCurNodeVal();
    }
    function getCurNodeVal() {
        if (node.val) {
          result.push(node.val);
        }
      }
      function getCurNodeLeftVal() {
        if (node.left) {
          result.concat(traversing(node.left));
        }
      }
      function getCurNodeRightVal() {
        if (node.right) {
          result.concat(traversing(node.right));
        }
      }
  };
  
};
