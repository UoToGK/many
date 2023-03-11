//Created by uoto on 16/6/12.

import app from "../app";

app.directive('groupItemOption', function () {
    return {
        template: `
            <md-grid-tile-footer>
                    <div layout="row" layout-align="center center">
                        <span flex class="text-center">{{item.name}}</span>
                        <md-menu>
                            <md-button class="md-icon-button" ng-click="$mdOpenMenu($event)">
                                <md-icon md-menu-origin>menu</md-icon>
                            </md-button>
                            <md-menu-content width="3" class="md-dense">
                                <md-menu-item>
                                    <md-button ng-click="preview({$event:$event})">
                                        <md-icon>art_track</md-icon>
                                        查看
                                    </md-button>
                                </md-menu-item>
                                <md-menu-item>
                                    <md-button ng-click="edit({$event:$event})">
                                        <md-icon>mode_edit</md-icon>
                                        修改
                                    </md-button>
                                </md-menu-item>
                                <md-menu-item>
                                    <md-button ng-click="remove({$event:$event})">
                                        <md-icon>delete</md-icon>
                                        删除
                                    </md-button>
                                </md-menu-item>
                                <md-menu-divider></md-menu-divider>
                                <md-menu-item>
                                    <md-button ng-click="exports({$event:$event})">
                                        <md-icon>archive</md-icon>
                                        导出任务配置
                                    </md-button>
                                </md-menu-item>
                            </md-menu-content>
                        </md-menu>
                    </div>
                </md-grid-tile-footer>
                `,

        scope: {
            item: '=',
            preview: '&',
            edit: '&',
            remove: '&',
            exports: '&'
        }
    }
});


app.directive('taskItemOption', function () {
    return {
        template: `
            <md-grid-tile-footer>
                    <div layout="row" layout-align="center center">
                        <span flex class="text-center">{{item.name}}</span>
                        <md-menu>
                            <md-button class="md-icon-button" ng-click="$mdOpenMenu($event)">
                                <md-icon md-menu-origin>menu</md-icon>
                            </md-button>
                            <md-menu-content width="3" class="md-dense">
                                <md-menu-item>
                                    <md-button ng-click="run({$event:$event})">
                                        <md-icon>play_arrow</md-icon>
                                        立即运行
                                    </md-button>
                                </md-menu-item><md-menu-item>
                                    <md-button ng-click="preview({$event:$event})">
                                        <md-icon>art_track</md-icon>
                                        查看数据
                                    </md-button>
                                </md-menu-item>
                                <md-menu-item>
                                    <md-button ng-click="edit({$event:$event})">
                                        <md-icon>mode_edit</md-icon>
                                        修改
                                    </md-button>
                                </md-menu-item>
                                <md-menu-item>
                                    <md-button ng-click="remove({$event:$event})">
                                        <md-icon>delete</md-icon>
                                        删除
                                    </md-button>
                                </md-menu-item>
                                <md-menu-divider></md-menu-divider>
                                <md-menu-item>
                                    <md-button ng-click="exports({$event:$event})">
                                        <md-icon>archive</md-icon>
                                        导出任务配置
                                    </md-button>
                                </md-menu-item>
                            </md-menu-content>
                        </md-menu>
                    </div>
                </md-grid-tile-footer>
                `,
        scope: {
            item: '=',
            run: '&',
            preview: '&',
            edit: '&',
            remove: '&',
            exports: '&'
        }
    }
});
