// Created by uoto on 16/5/6.
/// <reference path="./IStepOption.d.ts" />
declare interface IFlow {
  currentStep: IStepOption;
  currentDesigner: Designer;
  designerMain: any;
  currentTask: any;
  locals: any;
  setting?: any;
}

declare class Designer {
  executor: (step, locals?) => any;
  src: string;
  charset: string;
  addStep: (step: IStepOption, tag?) => any;

  static getColsNum(steps): number;

  webview;
  steps;
  $mdDialog;
}
