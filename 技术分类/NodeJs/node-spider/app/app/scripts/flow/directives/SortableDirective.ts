//Created by uoto on 16/3/2.

import app from "../../base/app";
import * as _ from "lodash";
import * as $ from "jquery";
/**
 * 步骤排序支持
 * <step-item sortable></step-item>
 */
app.directive("sortable", function($rootScope) {
  var dragging,
    placeholder = $('<step-item class="sortable-placeholder">');

  var $apply = _.debounce(function() {
    $rootScope.$apply();
  }, 13);
  return {
    restrict: "A",
    scope: {
      sortable: "="
    },
    link: function(scope: any, el, attr: any) {
      let isHandle;
      let handle = ".drag-handle";
      let selectorItem = ">*";

      el.on("mousedown", handle, function() {
        isHandle = true;
      }).on("mouseup", handle, function() {
        isHandle = false;
      });

      el.on("sort_remove", function(e, data) {
        _.pull(scope.sortable, data.item);
        $apply(); //流程树更新
        return false;
      }).on("sort_add", function(e, data) {
        scope.sortable.splice(data.index, 0, data.item);
        $apply();
        return false;
      });

      el.on("$destroy", function() {
        el.off("*.h5s");
        items = null;
      });

      var items;
      el.on("dragstart.h5s", selectorItem, function(e: any) {
        if (handle && !isHandle) {
          return false;
        }
        isHandle = false;
        e.originalEvent.dataTransfer.effectAllowed = "move";
        (dragging = $(this)).addClass("sortable-dragging");
        items = el.children();

        e.stopPropagation();
      })
        .on("dragend.h5s", selectorItem, function(e) {
          if (!dragging) {
            return;
          }

          let prev = placeholder.prev(),
            next = placeholder.next();

          if (!prev.is(dragging) && !next.is(dragging)) {
            let scope = dragging.scope();
            let data = {
              item: scope[attr.item] || scope,
              index: placeholder.index()
            };
            dragging.parent().trigger("sort_remove", data);
            placeholder.parent().trigger("sort_add", data);
            if (dragging.parent()[0] === placeholder.parent()[0]) {
              dragging.removeClass("sortable-dragging").show();
            }
          } else {
            dragging.removeClass("sortable-dragging").show();
          }

          placeholder.remove();
          dragging = null;

          e.stopPropagation();
        })
        .on(
          "dragover.h5s dragenter.h5s drop.h5s",
          selectorItem + ",[sortable]",
          function(e) {
            if (!dragging || e.type == "drop") {
              return false;
            }

            let $this = $(this);
            if (items && items.length && items.is($this)) {
              $this[placeholder.index() < $this.index() ? "after" : "before"](
                placeholder
              );
            } else {
              $this.append(placeholder);
            }
            dragging.hide();
            return false;
          }
        );
    }
  };
});
