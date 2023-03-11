// Created by uoto on 16/4/14.
/**
 * 返回唯一id
 * @param prefix
 * @example
 * 请看例子
 * <example>
 * <file name="test.ts">
 *     var id:string = uuid(); // => 'uuid_adf123lkj'
 *     var id2:string = uuid('fix'); // => 'fix_asdflkj'
 * </file>
 * </example>
 */
export function uuid(prefix:string = 'uuid'):string {
    return `${prefix}_${Math.random().toString(32).slice(2)}`;
}

/**
 * 对话框通用方法实现
 */
export class Dialog {
    public isCancel: string;
    constructor(public $mdDialog) {
    }

    hide() {
        this.$mdDialog.hide();
    }

    cancel() {
        this.isCancel="Y";
        this.$mdDialog.hide(false);
    }

    answer(answer) {
        this.$mdDialog.hide(answer);
    }
}

/**
 * 获取step的父亲
 * @param steps
 * @param step
 * @return arr
 */
export function getStepParent(steps:IStepOption[], step:IStepOption):IStepOption[] {
    if (!steps.length) {
        // 如果是空的steps,哪就返回它
        return steps;
    }
    return queryStep(steps, step);
}

function queryStep(steps:IStepOption[], step:IStepOption) {
    var len = steps.length, ret, _step;
    for (let i = 0; i < len; i++) {
        _step = steps[i];
        if (_step.id === step.id) {
            return steps;
        }
        if (_step.steps && (ret = queryStep(_step.steps, step))) {
            return ret;
        }
        if (_step.right && (ret = queryStep(_step.right, step))) {
            return ret;
        }
        if (_step.fault && (ret = queryStep(_step.fault, step))) {
            return ret;
        }
    }
    return null;
}

export function mdConfirm($mdDialog, msg?, title?) {
    var confirm = $mdDialog.confirm()
        .title(title || '确认执行此操作?')
        .textContent(msg)
        .ariaLabel('Lucky day')
        .ok('确定')
        .cancel('取消');
    return $mdDialog.show(confirm);
}

export function mdDeleteConfirm($mdDialog) {
    return mdConfirm($mdDialog, `确认删除此记录？`);
}

export function delay(time) {
    return new Promise(function (resolve, reject) {
        setTimeout(resolve, time || 0);
    })
}

// 全角转半角
export function CtoH(str:string):string {
    var result = "";
    for (var i = 0; i < str.length; i++) {
        if (str.charCodeAt(i) == 12288) {
            result += String.fromCharCode(str.charCodeAt(i) - 12256);
            continue;
        }
        if (str.charCodeAt(i) > 65280 && str.charCodeAt(i) < 65375) result += String.fromCharCode(str.charCodeAt(i) - 65248);
        else result += String.fromCharCode(str.charCodeAt(i));
    }
    return result;
}