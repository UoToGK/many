// Created by uoto on 16/4/13.
import app from "./app";
import _ = require("lodash");
var menu = require("../../resource/menu.yaml");

/**
 * 菜单必须包含此三项参数
 * @prop {string} name  菜单名称
 * @prop {string} icon  菜单icon
 * @prop {string} route 路由名称
 * @prop {MenuItem[]} childs 子菜单
 */
interface MenuItem {
  icon: string;
  name: string;
  route: string;
  childs?: MenuItem[];
}

// interface MenuList extends Array<any> {
//   $promise?: Promise<any>;
// }

app.provider(
  "menu",
  class Menu {
    _query(list, route) {
      for (var i = 0; i < list.length; i++) {
        var item = list[i];
        var path = item.route;
        if (path) {
          var path2 =
            path[path.length - 1] == "/"
              ? path.substr(0, path.length - 1)
              : path + "/";
          if (path === route || path2 === route) {
            return true;
          }
        }

        if (item.childs && this._query(item.childs, route)) {
          return true;
        }
      }
      return false;
    }

    _format(list, routes) {
      _.forEach(routes, (option, route) => {
        if (!this._query(list, route)) {
          delete routes[route];
        }
      });
    }

    $get($route): MenuItem[] {
      //提供给angular调用的方法,用来返回值
      var ret: Array<any> = [];

      interface Res {
        menus: MenuItem[];
        others?: MenuItem[];
      }

      var res: Res = menu;

      if (res.menus) {
        res.menus.forEach(item => {
          ret.push(item);
        });
      }

      var other = [];
      if (res.others) {
        res.others.forEach(item => {
          other.push(item);
        });
      }

      this._format([].concat(other, ret), $route.routes);

      // $http().success(function(){});
      return ret;
    }
  }
);
