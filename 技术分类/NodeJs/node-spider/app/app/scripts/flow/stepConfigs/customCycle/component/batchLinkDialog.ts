import {Dialog} from "../../../../base/util";

interface Opt {
    $mdDialog:any,
    batchLink:any
}

export function batchLinkDialog(opt:Opt):Promise<any> {
    return opt.$mdDialog.show({
        controller: SetBatchLinkDialog,
        controllerAs: 'T',
        templateUrl: `${__dirname}/batchLinkDialog.html`,
        locals: {
            batchLink: opt.batchLink
        }
    });
}

class SetBatchLinkDialog extends Dialog {


    constructor(public $scope,
                public $mdDialog,
                public batchLink) {
        super($mdDialog);

    }

    addBatchLink (batchLink){
        batchLink.datas.push({type:0})
        let dex = batchLink.linkName.indexOf('/[地址参数');
        if(dex!=-1){
            batchLink.linkName = batchLink.linkName.toString().substring(0,dex);
        }
        if(batchLink.datas.length>0){
            for(let i =0;i<batchLink.datas.length;i++){
                let num = i+1;
                batchLink.linkName+='/[地址参数'+num+']';
            }
        }
    }

    delBatchLink(batchLink,index){
        batchLink.datas.splice(index, 1);
        let dex = batchLink.linkName.indexOf('/[地址参数');
        batchLink.linkName = batchLink.linkName.toString().substring(0,dex);
        if(batchLink.datas.length>0){
            for(let i =0;i<batchLink.datas.length;i++){
                let num = i+1;
                batchLink.linkName+='/[地址参数'+num+']';
            }
        }
    }

}

interface numData {
    startNum:string,
    increment:string,
    count:string,
    isDesc?:any,
    addZero?:any
}
interface letterData {
    startLetter:string,
    endLetter:string,
    isDesc?:any
}
interface timeData {
    increment:number,
    startTime:string,
    endTime:string,
    formatStr:string
}