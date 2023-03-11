//Created by uoto on 16/6/20.
import {Route, Controller} from "../../../../../../base/annotations";
var config = require("../../../../../../../resource/config.yaml");

@Route({//绑定路由
    route: '/projectManage/templateList/templateEdit', // 修改模板
    templateUrl: 'scripts/views/projectManage/subPages/templateList/subPages/templateEdit/templateEdit.html',
    controllerAs: 'T'
})
@Controller
export class TemplateEditCtrl {// 所有带有 Ctrl
    public pid:string = "";
    public templateName:string = "";
    public tid:string="";
    public url:string="";
    constructor(
        public $scope,
        public $mdDialog,
        public $routeParams,
        public $http
    ){
        this.pid = $routeParams.pid;
        this.tid = $routeParams.tid;
        this.templateName = $routeParams.templateName;
        this.url=config.api_address+"/api/v1/column/save/"+this.tid;
        this.initData();
    }

    public button="增加";
    public items=[];
    public columnName="";

    initData(){
        let _me=this;
        this.$http({
            method:"get",
            url:config.api_address+"/api/v1/column/list/"+this.tid
        }).success(function(response){
            if(Number(response.code)===10000) {
                _me.items = response.data.data.data;
            }else{
                console.log("Error:",response);
            }
        });
    }
    save(){
        let _me=this;
        this.$http({
            method:"post",
            url:this.url,
            data:{desc:this.columnName}
        }).success(function(response){
            if(Number(response.code)===10000){
                _me.url=config.api_address+"/api/v1/column/save/"+_me.tid;
                _me.button="增加";
                _me.initData();
            }
        });
    }
    edit(_identify){
        this.url=config.api_address+`/api/v1/column/update/${this.tid}/${_identify}`;
        this.button="保存";
        for(let key in this.items){
            if(this.items[key]["id"]===_identify){
                this.columnName=this.items[key]["columnDesc"];
                break;
            }
        }
    }
    remove(_identify){
        if(window.confirm("您正在执行删除该字段操作，请确认！")) {
            let _me=this;
            this.$http({
                method: "delete",
                url: config.api_address + `/api/v1/column/delete/${_identify}`
            }).success(function (response) {
                //console.log(response);
                if (Number(response.code) === 10000) {
                    _me.initData();
                    alert("该字段已删除！");
                } else {
                    alert("删除字段失败！");
                }
            });
        }
    }
    back() {
        window.location.href = '#/projectManage/templateList?pid='+this.$routeParams.pid;
    }

}