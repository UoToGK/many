// Created by uoto on 16/4/5.
import app from "../app";
import {echarts} from 'echarts';
var config = require("../../../resource/config.yaml");


app.directive('echartsCommunication', function ($http,$routeParams) {
    return {
        restrict: 'E',
        link: function ($scope, el, attr:any) {
            // 指定图表的配置项和数据

            var option = {
                title: {
                    text: '通信状况历史变化图',
                    subtext: '服务器IP:'+$routeParams.sip,
                    left: 'center'
                },
                tooltip: {
                    trigger: 'axis'
                },
                legend: {
                    data:['正常','异常'],
                    x: 'right'
                },
                xAxis:  {
                    name: '时间',
                    type: 'category',
                    boundaryGap: false,
                    data: []
                },
                yAxis: [
                    {
                        type: 'category',
                        boundaryGap: false,
                        data: ['','通信异常','通信正常']
                    },
                ],
                series: [
                    {
                        name:'正常',
                        type:'line',
                        data:[],
                    }
                ]
            };
            function formatDate(){
                var _date=new Date();
                return _date.getFullYear()+"/"+(_date.getMonth()+1)+"/"+_date.getDate()+" "+_date.getHours()+":"+_date.getMinutes();
            }
            function drawLine(){
                var myChart = echarts.init(document.getElementById('main2'));
                jQuery.ajax({
                    url:config.api_address+`/api/v1/monitor/listServerInfo?reload=true`,
                    method:"post",
                    data:{
                        pageNo:1,
                        pageSize:10
                    },
                    success:function(response,textStatus){
                        if(Number(response.code)===10000){
                            option.series[0].data.push(2);
                            option.xAxis.data.push(formatDate());
                        }else{
                            option.series[0].data.push(1);
                            option.xAxis.data.push(formatDate());
                        }
                    }
                });
                myChart.setOption(option);
                var _timer=window.setTimeout(function(){
                    window.clearTimeout(_timer);
                    drawLine();
                },1000*60);
                // 使用刚指定的配置项和数据显示图表。
            }
            drawLine();
        },
        replace: true,
        template: '<div style="width: 800px;height:400px; margin:20px  auto"></div>'
    }
});