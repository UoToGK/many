// Created by uoto on 16/4/7.
import {Dialog} from "../../../../base/util";
var config = require("../../../../../resource/config.yaml");

interface Opt<T> {
    $mdDialog: any
    closeTo: any
    isCreate: boolean,
    user: T
}

export function editNewsUser<T>(opt: Opt<IUserItem>): Promise<T> {
    return opt.$mdDialog.show({
        controller: NewsUserDialogCtrl,
        controllerAs: 'T',
        templateUrl: `${__dirname}/newsUser.html`,
        closeTo: opt.closeTo,
        locals: {
            isCreate: opt.isCreate,
            user: opt.user
        }
    });
}

class NewsUserDialogCtrl extends Dialog {
    constructor(public $scope,
                public $mdDialog,
                public user: IUserItem,
                public isCreate: boolean,
                public $http) {
        super($mdDialog);
        this.initRoleList();
    }


    public  roleList=[];
    organize = [
        "1",
        "2",
        "3",
        "4"
    ];
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
                _me.roleList =response.data.data;
            }
        });
    }
    public updateUser(user){
        delete user.$$hashKey;
        jQuery.ajax({
            headers:{'Content-Type': 'application/json'},
            processData:false,
            dataType:"json",
            method: 'post',
            data:JSON.stringify(user),
            url: config.api_address+'/api/v1/user/saveOrUpdate',
            success:function(data,textStatus){
                if(Number(data.code)===10000){
                    alert("修改成功");
                }else if(Number(data.code)===20001){
                    alert("程序异常");
                }else if(Number(data.code)===20103){
                    alert("用户id为空，请检查参数");
                }else if(Number(data.code)===20104){
                    alert("姓名为空，请检查参数");
                }else if(Number(data.code)===20105){
                    alert("密码为空，请检查参数");
                }else if(Number(data.code)===20106){
                    alert("角色为空，请检查参数");
                }
            }
        });
    }



}