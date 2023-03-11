//Created by uoto on 16/1/27.
import {Route, Controller} from "../../base/annotations";
import {editNewsUser} from "./component/newsUser/newsUser";
var config = require("../../../resource/config.yaml");
@Route({//绑定路由
    route: '/userManage', // 用戶管理
    templateUrl: 'scripts/views/userManage/userManage.html',
    controllerAs: 'T'
})
@Controller
export class UserManageCtrl {

    constructor(public $scope,
                public $mdDialog,
                public TaskManage,
                public $routeParams,
                public $http,public $filter
    ) {
        $scope.setTitle(name);

        let _me=this;
        $scope.initData=function(){
            _me.initData();
        };

        this.initRoleList();
    }

    /**
     * 该对象与页面双向绑定，当页面数据发生变化该数据也会随之更新。
     */
    public user={
        uid:"",
        name:"",
        password:"",
        mail:"",
        mobile:"",
        organization:"",
        expiredDate:null,
        roleId:"",
        createDate:"",
        delFlg:"0",
        queryTime:""
    };


    public user1={
        uid:"",
        name:"",
        password:"",
        mail:"",
        mobile:"",
        organization:"",
        expiredDate:null,
        roleId:"",
        createDate:"",
        delFlg:"0",
        queryTime:""
    };
    public userList =[];
    initData(){
        if(this.user.queryTime){
            this.user.queryTime = this.$filter('date')(Date.parse(this.user.queryTime), 'yyyy-MM-dd')
        }else{
            this.user.queryTime = "";
        }
        let _me=this;
        this.$http({
            headers:{'Content-Type': 'application/x-www-form-urlencoded'},
            method: 'get',
            url: config.api_address+`/api/v1/user/list?reload=true&current=${this.$scope.cp}&limit=${this.$scope.size}&uid=${this.user.uid||''}&name=${this.user.name||''}&organization=${this.user.organization||''}&roleId=${this.user.roleId||''}&queryTime=${this.user.queryTime}`
        }).success(function(response) {
            if(Number(response.code)===10000 && response.data) {
                _me.userList=response.data.data.data;
                if(_me.$scope.totalSize.length<1) { // 初始化分页按钮
                    //当如果$scope.totalSize.length>0表示页码值已经获取到，不再重新获取。
                    _me.$scope.initPageNumber(response.data.data);
                }
            }else{
                this.userList=[];
                alert(response.msg);
                console.log("Error:",response);
            }

        });
    }



    /**
     * 初始化用户角色下拉列表
     */
    public roleList;
    public initRoleList(){
        let _me=this;
        jQuery.ajax({
            headers:{'Content-Type': 'application/x-www-form-urlencoded'},
            processData:false,
            dataType:"json",
            method: 'post',
            data:'id=',
            url: config.api_address+'/api/v1/role/selectRoles',
            success:function(response,textStatus){
                if(Number(response.code)===10000) {
                    _me.roleList = response.data.data;
                }else{
                    alert(response.msg);
                    console.log("Error:",response);
                }
            }
        });
    }



    /**
     * 新增用户信息
     */
    addUser() {
        let _me=this;
        if(/^[a-zA-Z0-9]{6,50}$/g.test(this.user1.uid) && /^.{6,}$/g.test(this.user1.password) && /^([0-9A-Za-z\-_\.]+)@[a-z0-9-]+(\.\w+)+$/gi.test(this.user1.mail) && /^1[3,4,5,7,8]\d{9}$/g.test(this.user1.mobile)) {
            jQuery.ajax({
                headers: {'Content-Type': 'application/json'},
                processData: false,
                dataType: "json",
                method: 'post',
                data: JSON.stringify(_me.user1),
                url: config.api_address + '/api/v1/user/saveOrUpdate',
                success: function (data, textStatus) {
                    if (Number(data.code) === 10000) {
                        alert("保存成功");
                        _me.$scope.start=1;
                        _me.$scope.totalSize=[];//因为数据量发生了变化，所以重新检查分页中页码值。次数据长度为零，分页方法会自动重新检测总页码值。
                        _me.initData();
                        $(".closeb").trigger("click");
                        _me.clearUser();

                    } else if(Number(data.code) === 20107){
                        alert("用户ID已存在！请重新输入！");
                    }else if(Number(data.code)=== 20001){
                        alert("系统异常")
                    }
                }

            });
            return;
        }else{
            if(!/^[a-zA-Z0-9]{6,50}$/g.test(this.user1.uid)){
                alert("用户ID字母或者数字6位或以上");
                return;
            }
            if(!/^.{6,}$/g.test(this.user1.password)){
                alert("密码格式不正确");
                this.user.password="";
                return;
            }
            if(!/^[\w]+@[a-z0-9-]+(\.\w+)+$/gi.test(this.user1.mail)){
                alert("邮箱格式不正确");
                return;
            }
            if(!/^1[3,4,5,7,8]\d{9}$/g.test(this.user1.mobile)){
                alert("手机号码格式不正确");
                return;
            }
        }
    }

    /**
     * 更新用户信息。
     * 先重服务器请求数据下来后然后更新页面数据。
     */
    updateUser(uId) {
        let _me=this;
        this.$http({
            method:"get",
            url:config.web_api_host+`/api/v1/user/getUserId/${uId}`
        }).success(function(response){
            if(Number(response.code)===10000){
                console.log(response.data.data.uid)
                _me.user1.uid=response.data.data.uid;
                _me.user1.name=response.data.data.name;
                _me.user1.password=response.data.data.password;
                _me.user1.mail=response.data.data.mail;
                _me.user1.mobile=response.data.data.mobile;
                _me.user1.organization=response.data.data.organization;
                _me.user1.expiredDate=new Date(response.data.data.expiredDate);
                _me.user1.roleId=response.data.data.roleId;
                _me.user1.createDate=new Date(response.data.data.createDate);
            }else{
                alert(response.msg);
                console.log("Error:",response);
            }
        });
    }

    public flag = false;
    /**
     * 当用户ID文本框失去焦点是验证用户ID是否已存在，如果已存在给出提示；
     */
    uIdBlur(){
        let _me=this;
        this.$http({
            method:"post",
            url:config.web_api_host+`/api/v1/user/checkUid?uid=${this.user1.uid}`
        }).success(function(response){
            if(Number(response.code)!==10000){
                _me.flag = true;
            }else{
                _me.flag = false;
            }
        });
    }

    deleteUser(id){
        let _me=this;
        if(window.confirm("您正在执行删除操作，请确认是否继续本次操作！")) {
            this.$http({
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                method: 'post',
                url: config.api_address + '/api/v1/user/delete/' + id
            }).success(function (response) {
                if (Number(response.code) === 10000) {
                    alert("删除成功");
                    _me.$scope.start = 1;
                    _me.$scope.totalSize = [];//因为数据量发生了变化，所以重新检查分页中页码值。次数据长度为零，分页方法会自动重新检测总页码值。
                    _me.initData();//删除完调用数据初始化方法，可以达到更新界面数据作用
                } else {
                    alert(response.msg);
                    console.log("Error:", response);
                }
            });
        }else{
            alert("您已取消本次删除操作！");
        }
    }

    queryUser(){
        let str="";
        if(this.user){
            str+="?";
            if(this.user.uid!=''&&typeof(this.user.uid) != "undefined"){
                str+="uid="+this.user.uid;
            }
            if(this.user.name!=''&&typeof(this.user.name) != "undefined"){
                str+="&name="+this.user.name;
            }
            if(this.user.organization!=''&&typeof(this.user.organization) != "undefined"){
                str+="&organization="+this.user.organization;
            }
        }
        let _me=this;
        jQuery.ajax({
            headers:{'Content-Type': 'application/json'},
            processData:false,
            dataType:"json",
            method: 'get',
            url: config.api_address+"/api/v1/user/list"+str,
            success:function (response,stateCode) {
                if(Number(response.code)===10000) {
                    _me.userList = response.data.data.data;
                }else{
                    alert(response.msg);
                    console.log("Error:",response);
                }
            }
        });
    }

    clearUser(){
     this.user1={
            uid:"",
            name:"",
            password:"",
            mail:"",
            mobile:"",
            organization:"",
            expiredDate:null,
            roleId:"",
            createDate:"",
            delFlg:"0",
            queryTime:""
        };
    }

}

/**
 * 关闭时关联的元素
 * @param e
 */
function closeTo(e: MouseEvent) {
    if (e && e.target && e.type) {
        return e.target;
    }
    return '#newBtn';
}