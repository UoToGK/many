// Created by uoto on 16/4/15.

declare interface IStepOption {
    name: string
    behavior: string
    id?: string
    [key: string]: any
    isCycle?: boolean
    isPaging?: boolean
    isCapture?: boolean
    selector?: string
    type?: string
    steps?: IStepOption[]
    autoActive?: boolean,
    //新增下拉分页功能
    isAutoPaging?: boolean
}

// 循环节点接口
declare interface ICycleStep extends IStepOption {
    filters?: INodeFilters
    expert?: boolean
    selector_sour?: string
    custom_selector?: string
    delay?: number
}

// 自定义循环
declare interface ICustomCycleStep extends IStepOption {
    data?: any[]
}

// 循环节点过滤器
declare interface INodeFilters {
    ignoreNodes?: string[]
    ignoreText?: string
    includeText?: string
}

// 抓取节点过滤器
declare interface ICaptureStep extends IStepOption {
    captures?: ICapture[]
}

declare interface ICapture {
    isTransitionGprs?: any,
    selector?: string
    unique?: boolean
    paths?: string[]
    behavior?: string
    preview?: string
    columnName?: string
    columnDesc?: string
    match?: {
        type?: string

        // type = 0
        dateEq?: string
        dateLike?: string
        date?: any
        dateReplace?: boolean

        // type = 1
        include?: string
        noInclude?: string

        // type = 2
        regexpText?: string
        regexpMode?: string[]

        // type = 3
        //type 4
        function?: string
    }
}

// 链接节点
declare interface ILinkStep extends IStepOption {
    url?: string
    demoUrl?: string
    charset?: string
}

// 新链接节点
declare interface ILinkBlankStep extends IStepOption {
    paths?: string[]
    demoUrl?: string
}

// 分支节点
declare interface IBranchStep extends IStepOption {
    right?: IStepOption[]
    fault?: IStepOption[]
}

// 分页节点
declare interface IPagingStep extends IStepOption {
    limit?: number
}

// 选择select节点
declare interface ISelectStep extends IStepOption {
    value?: string
}