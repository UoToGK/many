// Created by uoto on 16/4/13.
import { BeforeConfig, BeforeRun } from "./base/annotations";
import { bootstrap } from "angular";
import "./base/filters";
import "./base/directives";
import "./base/servers";
import "./base/menu";
import "./TaskExecutor";

import requireAll = require("requireall");
import moment = require("moment");
// let config = require("../resource/config.yaml");
// requireAll('views/**/DashboardCtrl.ts', { cwd: __dirname });

requireAll("views/**/*Ctrl.ts", { cwd: __dirname }); //加载所有控制器

// const ipcRenderer = require('electron').ipcRenderer;
@BeforeConfig
class Config {
  constructor($routeProvider, $mdDateLocaleProvider) {
    //默认路由
    if (!location.hash) {
      location.href = "#/test";
    }
    // $routeProvider.otherwise('/dashboard');

    //日历本地化
    $mdDateLocaleProvider.months = [
      "一月",
      "二月",
      "三月",
      "四月",
      "五月",
      "六月",
      "七月",
      "八月",
      "九月",
      "十月",
      "十一月",
      "十二月"
    ];
    $mdDateLocaleProvider.shortMonths = [
      "一月",
      "二月",
      "三月",
      "四月",
      "五月",
      "六月",
      "七月",
      "八月",
      "九月",
      "十月",
      "十一月",
      "十二月"
    ];

    $mdDateLocaleProvider.days = [
      "星期天",
      "星期一",
      "星期二",
      "星期三",
      "星期四",
      "星期五",
      "星期六"
    ];
    $mdDateLocaleProvider.shortDays = [
      "日",
      "一",
      "二",
      "三",
      "四",
      "五",
      "六"
    ];
    // Can change week display to start on Monday.

    $mdDateLocaleProvider.firstDayOfWeek = 1;

    $mdDateLocaleProvider.formatDate = function(date) {
      return date ? moment(date).format("YYYY-MM-DD") : "";
    };
  }
}

@BeforeRun
class Boot {
  constructor(
    $rootScope,
    currentWebContents,
    currentWindow,
    menu,
    $http,
    TaskExecutor
  ) {
    //$rootScope.appName="IRIS 客户端 v2.1.8";
    // var currDate;
    // setInterval(function(){
    //     currDate=new Date();
    //     ipcRenderer.send('heartbeat', 'ping:'+currDate.getTime());
    // },60*1000);

    currentWindow.show();

    //最小化
    $rootScope.minimize = function() {
      currentWindow.minimize();
    };

    //全屏幕
    $rootScope.maximize = function() {
      currentWindow.setFullScreen(!currentWindow.isFullScreen());
    };

    //开发者工具
    $rootScope.devTools = function() {
      currentWebContents.openDevTools();
    };

    //退出
    $rootScope.closeWindow = function() {
      currentWindow.close();
    };

    //菜单注入
    $rootScope.menus = menu;
    if (JSON.parse(sessionStorage.getItem("roleList"))) {
      let _roles = JSON.parse(sessionStorage.getItem("roleList"));
      let _menu = [];
      for (let i = 0; i < menu.length; i++) {
        for (let n = 0; n < _roles.length; n++) {
          if (menu[i].route === _roles[n].resource.replace(/(\s|\n\r)*/g, "")) {
            _menu.push(menu[i]);
            break;
          }
        }
      }
      $rootScope.menus = _menu;
    }

    //设置标题
    $rootScope.setTitle = title => {
      $rootScope.pageTitle = title;
    };

    $rootScope.$on("$routeChangeStart", (e, route) => {
      $rootScope.setTitle(null);
    });

    var activeRoute = "";
    $rootScope.$on("$routeChangeSuccess", (e, route) => {
      if (route && route.$$route) {
        activeRoute = route.$$route.originalPath;
      }
    });

    //页面是否激活
    $rootScope.isActive = route => {
      return activeRoute === route;
    };

    $rootScope.logout = () => {
      if (window.confirm("您正在执行退出操作，请确认是否继续执行？")) {
        window.location.href = "login.html";
      }
    };
  }
}

bootstrap(document, ["app"]);
