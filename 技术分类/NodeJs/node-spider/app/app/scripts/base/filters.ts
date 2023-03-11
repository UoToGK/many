// Created by uoto on 16/4/13.
import app from "./app";

app.filter('test', function () {
    return function (input) {
        return '!' + input
    }
});

app.filter('statusName', function () {
    return function (status) {
        var statusName = "";
        switch (status)
        {
            case '0' :
                statusName = "创建";
                break;
            case '1' :
                statusName = "开始";
                break;
            case '2' :
                statusName = "成功结束";
                break;
            case '3' :
                statusName = "部分失败";
            case '4' :
                statusName = "失败";
                break;
            default :
                break;
        }
        return statusName;
    }
});

app.filter('proxyAnonymousClass', function () {
    return function (status) {
        var proxyAnonymousClass = "";
        switch (status)
        {
            case '0' :
                proxyAnonymousClass = "匿名";
                break;
            case '1' :
                proxyAnonymousClass = "高匿";
                break;
            case '2' :
                proxyAnonymousClass = "透明";
                break;
            default :
                break;
        }
        return proxyAnonymousClass;
    }
});

app.filter('proxyStyle', function () {
    return function (status) {
        var proxyStyle = "";
        switch (status)
        {
            case 'Y' :
                proxyStyle = "支持";
                break;
            case 'N' :
                proxyStyle = "不支持";
                break;
            default :
                break;
        }
        return proxyStyle;
    }
});
app.filter('overflow', function () {
    return function (input:string, max) {
        if (input && typeof input === 'string' && input.length > max) {
            return input.slice(0, max) + '...';
        }
        return input;
    };
});

app.filter("templateFilter",function () {
    return function (templateId,templateList) {
        function isEqu(template){
            if(template.id==templateId){
                return template;
            }
        }
        let template = templateList.find(isEqu);
        if(template){
            return template.name;
        }else{
            return "";
        }
    }
})