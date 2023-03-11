// Created by uoto on 16/4/5.
import {Dialog} from "../../../../base/util";
import {TimerCtrl} from "../../TimerCtrl";

interface Opt {
    closeTo:any,
    plan:IPlan,
    $mdDialog:any,
    isCreate:any
}

export function setTimer<T>(opt:Opt):Promise<T> {
    return opt.$mdDialog.show({
        controller: SetTimerCtrl,
        controllerAs: 'T',
        templateUrl: `${__dirname}/setTimer.html`,
        closeTo: opt.closeTo,
        locals: {
            plan: _.cloneDeep(opt.plan)
        },
        isCreate:opt.isCreate
    });
}

class SetTimerCtrl extends Dialog {
    weeks = [
        ['2', '周一'],
        ['3', '周二'],
        ['4', '周三'],
        ['5', '周四'],
        ['6', '周五'],
        ['7', '周六'],
        ['1', '周日']
    ];

    constructor(public $scope,
                public $mdDialog,
                public plan:IPlan,
                public isCreate) {
        super($mdDialog);
        this.plan = TimerCtrl.formatPlan(plan,isCreate);

        // $scope.$watch('T.plan.frequencyType', function () {
        //     plan.timer.days = [];
        //     plan.timer.weeks = [];
        //     plan.timer.months = [];
        // });
        // $scope.$watch('T.plan.timer.type', function () {
        //     plan.timer.weekDays = [];
        //     plan.timer.days = [];
        //     plan.timer.weeks = [];
        // });

    }

    exists(item, arr) {
        return arr.includes(item);
    }

    toggle(item, arr) {
        const idx = arr.indexOf(item);
        if (idx > -1) {
            _.pull(arr, item);
        } else {
            arr.push(item);
        }
    }

    testValid(plan:IPlan) {
        try {
            let timer = plan.timer;
            let name = plan.name;
            let startDate = !!plan.startTime;
            let date = startDate && !!plan.endTime;
            let bootTime = timer.bootTime.length;
            let days = timer.days.length;
            let weeks = timer.weeks.length;
            let weekDays = timer.weekDays.length;
            let months = timer.months.length;


            switch (plan.frequencyType) {
                case 0:// 一次
                    return name && bootTime && startDate;
                case 1:// 每天
                    return name && bootTime && date;
                case 2://每周
                    return name && bootTime && weekDays && date;
                case 3://每月
                    if (timer.type == 0) {// 天
                        return name && bootTime && months && days && date;
                    }

                    // 在某一周的某一天
                    return name && bootTime && months && weeks && weekDays && date;
            }
        } catch (e) {
            return false;
        }
    }

    getMsg() {
        return TimerCtrl.formatMsg(this.plan);
    }
    groupChange(plan){
        if(plan.timer.type ==0){
            plan.timer.weekDays = [];
            plan.timer.weeks = [];
        }else{
            plan.timer.days = [];
        }
    }
}

