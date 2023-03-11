// Created by uoto on 16/4/7.
import {Dialog} from "../../../../base/util";
var config = require("../../../../../resource/config.yaml");

interface Opt<T> {
    $mdDialog: any
    closeTo: any
    isCreate: boolean,
    user: T
}

export function editAddUser<T>(opt: Opt<IUserItem>): Promise<T> {
    return opt.$mdDialog.show({
        controller: AddUserDialogCtrl,
        controllerAs: 'T',
        templateUrl: `${__dirname}/addUser.html`,
        closeTo: opt.closeTo,
        locals: {
            isCreate: opt.isCreate,
            user: opt.user
        }
    });
    this.user =opt.user;
}

class AddUserDialogCtrl extends Dialog {
    constructor(public $scope,
                public $mdDialog,
                public user: IUserItem,
                public isCreate: boolean) {
        super($mdDialog);
        this.initRoleList();
    }

    public user:IUserItem;
    public  roleList =[];
    // roleList = [
    //     "1",
    //     "2",
    //     "3",
    //     "4"
    // ];
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
    public checkUnique(uid){
        jQuery.ajax({
            headers:{'Content-Type': 'application/x-www-form-urlencoded'},
            processData:false,
            dataType:"json",
            method: 'post',
            data:'uid='+uid,
            url: config.api_address+'/api/v1/user/checkUid',
            success:function(response,textStatus){
                if(Number(response.code)===20107){
                    alert("用户ID不能重复，请修改");
                }

            }
        });
    }
    public saveUser(user){
        console.log(user);
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
                    alert("新增成功");
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