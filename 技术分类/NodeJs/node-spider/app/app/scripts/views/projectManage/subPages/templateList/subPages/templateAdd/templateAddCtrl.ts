//Created by uoto on 16/6/20.
import {Route, Controller} from "../../../../../../base/annotations";
var config = require("../../../../../../../resource/config.yaml");

@Route({//绑定路由
    route: '/projectManage/templateList/templateAdd', // 新增模板
    templateUrl: 'scripts/views/projectManage/subPages/templateList/subPages/templateAdd/templateAdd.html',
    controllerAs: 'T'
})
@Controller
export class TemplateAddCtrl {// 所有带有 Ctrl

    constructor(
        public $scope,
        public $mdDialog,
        public $routeParams,
        public $http
    ){

    }

    public templateName="";

    save(){
        let _me=this;
        this.$http({
            method:"post",
            url: config.api_address + "/api/v1/template/save/" + this.$routeParams.pid,
            data:{name:this.templateName}
        }).success(function(response){
            if(Number(response.code)===10000){
                if(!window.confirm("模板添加已完成，是否继续添加模板？")){
                    window.location.href="#/projectManage/templateList?pid="+_me.$routeParams.pid;
                }
            }else{
                alert("添加模板失败！");
            }
        });
    }
    back() {
        window.location.href = "#/projectManage/templateList?pid="+this.$routeParams.pid;
    }

}