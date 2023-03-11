//Created by uoto on 16/1/27.
import {Route, Controller} from "../../base/annotations";
import "../../base/directives/pageDirective";

var config = require("../../../resource/config.yaml");
import {PagingOption} from "../../base/directives/paging/PagingOption";
import moment = require('moment');

@Route({//绑定路由
    route: '/proxyManage',
    templateUrl: 'scripts/views/proxyManage/proxyManage.html',
    controllerAs: 'T'
})
@Controller
export class ProxyManageCtrl {
    /**
     * 该对象与页面双向绑定，当页面数据发生变化该数据也会随之更新。
     */
        // 搜索
    public search = {
        ip: "",
        anonymous_class: "",
    };
    // 添加
    public proxy = {
        id: "",
        ip: "",
        port: "",
        anonymousClass: "",
        responseTime: "",
        address: "",
        effectiveDateStart: "",
        effectiveDateEnd: "",
        isHttp: "",
        isHttps: "",
        isSocket: ""
    };
    anonymousClass = [
        {name: "匿名", "code": "0"},
        {name: "高匿", "code": "1"},
        {name: "透明", "code": "2"},
    ];
    //验证
    test = {
        ip: "",
        port: ""
    }
    //查询状态
    statusList = [
        {name: "请选择", "code": ""},
        {name: "Http代理", "code": "0"},
        {name: "Https代理", "code": "1"},
        {name: "Socket代理", "code": "2"},

    ];

    currentTime = new Date();
    paging: PagingOption<any> = {};
    private pagingDetail: PagingOption<any> = {};

    constructor(public $scope,
                public proxyManage,
                public proxyServer,
                public $filter,
                public  $http) {
        this.paging.params = {
            orderBy: "START_TIME",
            order: "desc",
            ip: "",
            value: ""
        };

        this.paging.resource = proxyServer;

    }


    //查询功能
    public select() {
        if (this.paging.params.startTime != 'undefined' && this.paging.params.startTime != "" && this.paging.params.startTime != 'null') {
            this.paging.params.startTime = this.$filter('date')(Date.parse(this.paging.params.startTime), 'yyyy-MM-dd');
        } else {
            this.paging.params.startTime = "";
        }
        if (this.paging.params.endTime != 'undefined' && this.paging.params.endTime != "" && this.paging.params.endTime != 'null') {
            this.paging.params.endTime = this.$filter('date')(Date.parse(this.paging.params.endTime), 'yyyy-MM-dd');
        } else {
            this.paging.params.endTime = "";
        }
        this.paging.reload(true);
    }

    /**
     * 代理管理新增
     *
     *
     */

    public save() {
        //if(/(?:(?:(?:25[0-5]|2[0-4]\d|(?:(?:1\d{2})|(?:[1-9]?\d)))\.){3}(?:25[0-5]|2[0-4]\d|(?:(?:1\d{2})|(?:[1-9]?\d))))/g.test(this.proxy.ip)) {
        if (/^[0-9]{1,10}$/g.test(this.proxy.responseTime) && /^[0-9]{1,10}$/g.test(this.proxy.responseTime) && /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/g.test(this.proxy.ip)) {
            this.proxy.opt = "save";
            this.proxyManage.post(this.proxy, {}, (response) => {
                if (Number(response.code) === 10000) {
                    alert("新增保存成功！");
                    $("#myModal").modal('hide');
                    this.select();//保存完调用数据初始化方法，可以达到更新界面数据作用
                } else {
                    alert(response.msg);
                    console.log("Error:", response);
                }
            });
        } else {
            if (!/^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/g.test(this.proxy.ip)) {
                alert("ip不符合标准，请参考例子：121.232.194.71");
                return;
            }
            if (!/^[0-9]{1,10}$/g.test(this.proxy.responseTime)) {
                alert("响应时间只能为数字并且不能为空");
                return;
            }
        }
    }

    public cleans() {
        this.proxy = "";
    }

    //修改
    public toEdit(proxy) {
        this.proxy = proxy;
        console.log(this.proxy)
        if (this.proxy.effectiveDateStart && this.proxy.effectiveDateEnd) {
            this.proxy.effectiveDateStart = new Date(this.proxy.effectiveDateStart)
            this.proxy.effectiveDateEnd = new Date(this.proxy.effectiveDateEnd)
        }

    }

//更新按钮
    public update() {
        this.proxy.opt = "updateProxy";
        this.proxyManage.post(this.proxy, {}, (response) => {
            console.log(this.proxy)
            if (Number(response.code) === 10000) {
                alert("修改成功！");
                this.select();//保存完调用数据初始化方法，可以达到更新界面数据作用
            } else {
                alert(response.msg);
                console.log("Error:", response);
            }
        });
    }

    public delete(id) {
        let _me = this;
        if (window.confirm("您正在执行删除操作，请确认是否继续本次操作！")) {
            this.$http({
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                method: 'post',
                url: config.api_address + '/api/v1/proxy/delete/' + id
            }).success(function (response) {
                if (Number(response.code) === 10000) {
                    alert("删除成功");
                    _me.$scope.start = 1;
                    _me.$scope.totalSize = [];//因为数据量发生了变化，所以重新检查分页中页码值。次数据长度为零，分页方法会自动重新检测总页码值。
                    _me.select();//删除完调用数据初始化方法，可以达到更新界面数据作用
                } else {
                    alert(response.msg);
                    console.log("Error:", response);
                }
            });
        } else {
            alert("您已取消本次删除操作！");
        }
    }

    public validation(proxy) {
        this.proxy = proxy;
        let _me = this;
        if (window.confirm("您正在执行验证操作，请确认是否继续本次操作！")) {
            this.$http({
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                method: 'get',
                url: config.api_address + '/api/v1/proxy/validation/' + this.proxy.ip + "/" + this.proxy.port
            }).success(function (response) {
                if (Number(response.code) === 10000) {
                    alert("ip有效");
                    _me.$scope.start = 1;
                    // _me.$scope.totalSize = [];//因为数据量发生了变化，所以重新检查分页中页码值。次数据长度为零，分页方法会自动重新检测总页码值。
                    // _me.select();//删除完调用数据初始化方法，可以达到更新界面数据作用
                } else {
                    alert(response.msg);
                    console.log("Error:", response);
                }
            });
        } else {
            alert("您已取消本次操作！");
        }
    }

    // public validations() {
    //     let _me = this;
    //     if (window.confirm("您正在执行验证操作，请确认是否继续本次操作！")) {
    //         this.$http({
    //             headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    //             method: 'get',
    //             url: config.api_address + '/api/v1/proxy/validation/' + ips + "/" + port
    //         }).success(function (response) {
    //             if (Number(response.code) === 10000) {
    //                 alert("ip有效");
    //                 _me.$scope.start = 1;
    //                 // _me.$scope.totalSize = [];//因为数据量发生了变化，所以重新检查分页中页码值。次数据长度为零，分页方法会自动重新检测总页码值。
    //                 // _me.select();//删除完调用数据初始化方法，可以达到更新界面数据作用
    //             } else {
    //                 alert(response.msg);
    //                 console.log("Error:", response);
    //             }
    //         });
    //     } else {
    //         alert("您已取消本次操作！");
    //     }
    // }
}


