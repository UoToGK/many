// Created by uoto on 16/4/15.

declare interface ElectronWebView extends Electron.WebViewElement {
    debug:boolean
    progress:any

    charset:string

    allowpopups:string

    eventEmitter:any //事件封装的对象

    executor(obj, locals?:Object):Promise<any>

    redirect:boolean;
    
}
declare interface Window {
    _ajaxCount;
    mozRequestAnimationFrame:any;
    msRequestAnimationFrame;
}

declare interface KvObj {
    [name: string]: any;
}