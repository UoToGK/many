//Created by uoto on 16/6/20.
import {Route, Controller} from "../../../../../../base/annotations";
var config = require("../../../../../../../resource/config.yaml");

@Route({ //绑定路由
    route: '/projectManage/templateList/templateUpdate', //
    templateUrl: 'scripts/views/projectManage/subPages/templateList/subPages/templateUpdate/templateUpdate.html',
    controllerAs: 'T'
})
@Controller
export class TemplateUpdateCtrl {// 所有带有 Ctrl

    constructor(
        public $scope,
        public $mdDialog,
        public $routeParams,
        public $http
    ){
        this.initData();
    }

    public templateName="";
    public currentName="";
    public pid="";
    public tid="";

    initData(){
        this.templateName=this.$routeParams.templateName;
        this.pid=this.$routeParams.pid;
        this.tid=this.$routeParams.tid;
    }
    save(){
        let _me=this;
        this.$http({
            method:"post",
            url: config.api_address+`/api/v1/template/update/${this.pid}/${this.tid}`,
            data:{name: this.currentName}
        }).success(function(response){
            if(Number(response.code)===10000){
                alert("模板名称修改完成！");
                window.location.href="#/projectManage/templateList?pid="+_me.pid;
            }else{
                if(response.data.count){
                    alert("模板名称重复，请重新修改。");
                    window.location.href="#/projectManage/templateList?pid="+_me.pid;
                }
            }
        });
    }
    back() {
        window.location.href="#/projectManage/templateList?pid="+this.pid;
    }
}