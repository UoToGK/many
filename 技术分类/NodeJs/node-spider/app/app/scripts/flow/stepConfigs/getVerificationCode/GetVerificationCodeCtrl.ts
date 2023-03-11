import {Controller} from "../../../base/annotations";

@Controller
export class StepGetVerificationCodeCtrl {
    public step;
    public captchaTypeList;
    public captchaChdTypeList;
    public currCaptchaType;
    public currCaptchaChdType;

    constructor(public flow:IFlow) {
        this.step = flow.currentStep;
        this.getVerificationCode();
        this.captchaTypeList = [{
            code: "1",
            name: "纯数字",
            chds: [{code: '1000', name: '任意长度数字(不推荐)'},
                {code: '1010', name: '1位纯数字'},
                {code: '1020', name: '2位纯数字'},
                {code: '1030', name: '3位纯数字'},
                {code: '1040', name: '4位纯数字'},
                {code: '1050', name: '5位纯数字'},
                {code: '1060', name: '6位纯数字'},
                {code: '1070', name: '7位纯数字'},
                {code: '1080', name: '8位纯数字'},
                {code: '1090', name: '9位纯数字'},
                {code: '1100', name: '10位纯数字'}
            ]
        }, {
            code: "2",
            name: "纯英文",
            chds: [{code: '2000', name: '任意长度字母(不推荐)'},
                {code: '2010', name: '1位纯字母'},
                {code: '2020', name: '2位纯字母'},
                {code: '2030', name: '3位纯字母'},
                {code: '2040', name: '4位纯字母'},
                {code: '2050', name: '5位纯字母'},
                {code: '2060', name: '6位纯字母'},
                {code: '2070', name: '7位纯字母'},
                {code: '2080', name: '8位纯字母'},
                {code: '2090', name: '9位纯字母'},
                {code: '2100', name: '10位纯字母'}
            ]
        }, {
            code: "3",
            name: "英文数字混合",
            chds: [{code: '3000', name: '任意长度英数混合(不推荐)'},
                {code: '3010', name: '1位英数混合'},
                {code: '3020', name: '2位英数混合'},
                {code: '3030', name: '3位英数混合'},
                {code: '3040', name: '4位英数混合'},
                {code: '3050', name: '5位英数混合'},
                {code: '3060', name: '6位英数混合'},
                {code: '3070', name: '7位英数混合'},
                {code: '3080', name: '8位英数混合'},
                {code: '3090', name: '9位英数混合'},
                {code: '3100', name: '10位英数混合'}
            ]
        }, {
            code: "4",
            name: "纯汉字",
            chds: [{code: '4000', name: '任意长度汉字(不推荐)'},
                {code: '4010', name: '1位汉字'},
                {code: '4020', name: '2位汉字'},
                {code: '4030', name: '3位汉字'},
                {code: '4040', name: '4位汉字'},
                {code: '4050', name: '5位汉字'},
                {code: '4060', name: '6位汉字'},
                {code: '4070', name: '7位汉字'},
                {code: '4080', name: '8位汉字'},
                {code: '4090', name: '9位汉字'},
                {code: '4100', name: '10位汉字'}
            ]
        }, {
            code: "5",
            name: "数字英文汉字混合",
            chds: [{code: '5000', name: '任意长度中英数三混(不推荐)'}]
        }];
        this.captchaChdTypeList = this.captchaTypeList[2].chds;
        //
        if (!this.step.captchaType) {
            this.step.captchaType = "3";
        }
        if (!this.step.captchaLen) {
            this.step.captchaLen = "3040";
        }
    }

    typeChange() {
        let ind = parseInt(this.step.captchaType);
        ind = ind - 1;
        this.captchaChdTypeList = this.captchaTypeList[ind].chds;
        this.step.captchaLen = this.captchaChdTypeList[0].code;
        this.getVerificationCode();
    }

    async getVerificationCode() {
        let vercode = await this.flow.currentDesigner.executor(this.step,this.flow.locals);
        this.flow.locals['verificationCode']=vercode['verificationCode'];
    }

}