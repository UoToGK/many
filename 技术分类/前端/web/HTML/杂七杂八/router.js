(function () {
  history.replaceState(null, null, "");
  $("#router").html("<p>初始化</p>");
  $("a").on("click", function () {
    console.log(this.text);
    var text = this.text;
    $("#router").html("<p>" + text + "</p>");
    history.pushState(null, text, "#/" + text);
  });
})();

