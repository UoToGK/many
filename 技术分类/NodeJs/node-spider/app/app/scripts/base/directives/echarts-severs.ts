// Created by uoto on 16/4/5.
import app from "../app";
var echarts=require('echarts')
var config = require("../../../resource/config.yaml");

app.directive('echart1', function ($http,$routeParams) {
    return {
        restrict: 'E',
        link: function ($scope, el, attr:any) {
            $scope.initECharts=function(){
                $http({
                    headers:{'Content-Type': 'application/x-www-form-urlencoded'},
                    method: 'post',
                    url: config.api_address+'/api/v1/monitor/getHistoryByRunning?reload=true',
                    data: {
                        pageNo: 1, pageSize: 20,ip:$routeParams.sip,ip2:$routeParams.sip
                    }
                }).success(function(response){

                    // 指定图表的配置项和数据
                    var option = {
                        title: {
                            text: '服务器资源使用率历史变化图',
                            subtext: '服务器IP:'+$routeParams.sip,
                            left: 'center'
                        },
                        tooltip: {
                            trigger: 'axis'
                        },
                        legend: {
                            data:['硬盘','内存','CPU'],
                            x: 'right'
                        },
                        xAxis:  {
                            type: 'category',
                            boundaryGap: false,
                            data: ['2017-07-08 9:00','2017-07-08 9:05','2017-07-08 9:10',
                                '2017-07-08 9:15','2017-07-08 9:20','2017-07-08 9:25',
                                '2017-07-08 9:30',
                            ]
                        },
                        yAxis: [
                            {
                                name: '使用率(%)',
                                type: 'value',
                                max: 100
                            },
                            {
                                max: 5,
                                type: 'value',
                                inverse: true
                            }
                        ],
                        series: [
                            {
                                name:'硬盘',
                                type:'line',
                                data:[20, 32, 31, 14, 20, 30, 10],
                                markLine: {
                                    data: [
                                        {
                                            name: '预警线',
                                            yAxis: 80
                                        },
                                    ]
                                },
                                itemStyle : {
                                    normal : {
                                        lineStyle:{
                                            color:'#f40'
                                        }
                                    }
                                },
                            },
                            {
                                name:'CPU',
                                type:'line',
                                data:[30, 42, 51, 34, 60, 40, 32]
                            },
                            {
                                name:'内存',
                                type:'line',
                                data:[10, 22, 31, 24, 20, 20, 42]
                            }
                        ]
                    };

                    let _total=0;
                    let _list=null;
                    let _totalDiskVolume=0;
                    for(let i=0;i<response.data.Page.data.length;i++){
                        _list=JSON.parse(response.data.Page.data[i].totalDiskVolume);
                        for(let n=0;n<_list.length;n++){
                            _total+=_list[n].used;
                            _totalDiskVolume+=_list[n].total;
                        }
                        response.data.Page.data[i].usedDiskVolume=_total;
                        response.data.Page.data[i].tdv=_totalDiskVolume;
                        _totalDiskVolume=0;
                        _total=0;
                    }//算出硬盘总使用量


                    for(let i=0;i<response.data.Page.data.length;i++){
                        // _list=JSON.parse(this.serverList[i].totalDiskVolume);
                        option.xAxis.data.push(response.data.Page.data[i].createTime);
                        option.series[0].data.push(response.data.Page.data[i].usedDiskVolume/response.data.Page.data[i].tdv*100);
                        option.series[1].data.push(response.data.Page.data[i].usageOfCpu);//CPU
                        option.series[2].data.push(response.data.Page.data[i].usedMemoryVolume/response.data.Page.data[i].totalMemoryVolume*100);
                    }

                    //初始化并格式化数据
                    var myChart = echarts.init(document.getElementById('main'));
                    myChart.setOption(option);
                });


                // 使用刚指定的配置项和数据显示图表。
                // var myChart = echarts.init(document.getElementById('main'));
                // myChart.setOption(option);
            };
            $scope.initECharts();
        },
        replace: true,
        template: '<div style="width: 800px;height:400px; margin:20px  auto"></div>'
    }
});