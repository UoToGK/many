// Created by uoto on 16/4/5.
import app from "../../base/app";
import "jquery.splitter";
import "../../../../node_modules/jquery.splitter/css/jquery.splitter.css";
import * as $ from "jquery";
/**
 * 设计器面板布局分割器
 */
app.directive("splitter", function($timeout) {
  return {
    link: function($scope, el: any, attr: any) {
      el.addClass("splitter_panel").css("display", "block");
      var split = el.split({
        orientation: attr.orientation,
        limit: +attr.limit,
        position: +attr.position // if there is no percentage it interpret it as pixels
      });

      $scope.$on("$destroy", function() {
        split.destroy();
        split = null;
      });
      setTimeout(function() {
        $(window).resize();
      }, 1);
    }
  };
});

app.directive("splitterPanel", function() {
  return {
    link: function(scope, el, attr) {
      el.addClass("panel").css("display", "block");
    }
  };
});
