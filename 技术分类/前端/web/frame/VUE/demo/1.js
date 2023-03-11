var vm = new Vue({
  el: "#example",
  data: {
    message: "Hello",
    isActive: true,
    hasError: false
    /**data: {
        classObject: {
          active: true,
          'text-danger': false
        }
      } */
  },
  computed: {
    // 计算属性的 getter
    reversedMessage: function() {
      // `this` 指向 vm 实例
      return this.message
        .split("")
        .reverse()
        .join("");
    }
  },
  // 在组件中
  methods: {
    reversedMessageFun: function() {
      return this.message
        .split("")
        .reverse()
        .join("");
    },
    changeColor: function() {
      this.isActive = !this.isActive;
    },
    doThis: function(event) {
      event.preventDefault();
      event.stopPropagation(); //或者加上.stop操作符
      alert("doThis");
    },
    doParent: function() {
      alert("doParent");
    }
  }
});

new Vue({
  el: "#example-6",
  data: {
    selected: []
  }
});
