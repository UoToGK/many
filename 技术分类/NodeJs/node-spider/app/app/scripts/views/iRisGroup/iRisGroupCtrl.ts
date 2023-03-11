//Created by uoto on 16/1/27.

import {Route, Controller} from "../../base/annotations";
import moment = require('moment');
var config = require("../../../resource/config.yaml");


@Route({
    route: '/iRisGroup', //
    templateUrl: `${__dirname}/iRisGroup.html`,
    controllerAs: 'T'
})
@Controller
export class IRisGroupCtrl {
    constructor(public $scope,public $mdDialog,public $routeParams,public TaskExecutor,public $filter,public $http) {
        // this.queryList();
        // this.createTemplate();
        this.queryTemplate();
    }
    addProject(){
        this.$http({
            headers:{'Content-Type': 'application/x-www-form-urlencoded'},
            method: 'post',
            url: config.api_address+'/api/v1/project/save/zhangsan',
            data: {name:"This is a project for testing3"}
        }).success(function(response) {
            console.log(response);
        });
    }
    queryList(){
        this.$http({
            headers:{'Content-Type': 'application/x-www-form-urlencoded'},
            method: 'get',
            url: config.api_address+'/api/v1/project/list/user'
        }).success(function(response) {
            console.log(response);
        });
    }
    createTemplate(){///返回20001，data为null
        this.$http({
            headers:{'Content-Type': 'application/x-www-form-urlencoded'},
            method: 'post',
            url: config.api_address+'/api/v1/template/save/PROJECT20170818000002',
            data: {name:"Template for PROJECT20170818000002"}
        }).success(function(response) {
            console.log(response);
        });
    }
    queryTemplate(){
        let _me=this;
        this.$http({
            headers:{'Content-Type': 'application/x-www-form-urlencoded'},
            method: 'get',
            url: config.api_address+'/api/v1/template/list/PROJECT20170818000002'
        }).success(function(response) {
            console.log(response);
            //_me.addColumnToTemplate(response);
            _me.queryTemplateColumns(response);
        });
    }
    addColumnToTemplate(data){
        this.$http({
            headers:{'Content-Type': 'application/x-www-form-urlencoded'},
            method: 'post',
            url: config.api_address+'/api/v1/column/save/TEMPLATE20170818000002',
            data: {
                templateId: "TEMPLATE20170818000002",
                desc:"标题"
            }
        }).success(function(response) {
            console.log(response);
        });
    }
    queryTemplateColumns(data){
        this.$http({
            headers:{'Content-Type': 'application/x-www-form-urlencoded'},
            method: 'get',
            url: config.api_address+'/api/v1/column/list/TEMPLATE20170818000002'
        }).success(function(response) {
            console.log(response);
            //_me.addColumnToTemplate(response);
        });
    }
    groupList=[
        {name:'联想政府采购招投标',date:'2017-07-18'},
        {name:'IDEADATA产品招投标信息采集',date:'2017-07-18'},
        {name:'iris1.0联想标讯',date:'2017-07-18'},
        {name:'CCGP-中国政府采购网',date:'2017-07-18'},
        {name:'CCGP-中国政府采购网',date:'2017-07-18'},
        {name:'CCGP-中国政府采购网',date:'2017-07-18'},
    ]

}
