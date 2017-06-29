/* 
 * @Author: anchen
 * @Date:   2017-04-20 17:49:54
 * @Last Modified by:   anchen
 * @Last Modified time: 2017-05-16 15:54:48
 */
function bytesToSize(bytes) {
    if (bytes === 0) return '0 B';
    var k = 1024;
    sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toPrecision(3);
};

/* 设置时间样式*/
function setTimeType() {
var oDate = new Date();
     year = oDate.getFullYear();
     month = oDate.getMonth() + 1;
     day = oDate.getDate();
     hour = oDate.getHours();
     minute = oDate.getMinutes();
    return (year + '-' + month + "-" + day +' ' + hour + ':' + minute );    
}

var itecolor=['#6c65f5','#f90','#000']

var itemdpie = ["46223", "46222"];
function pieJsonData() {
    var json = {
        "jsonrpc": "2.0",
        "method": "history.get",
        "params": {
            "output": "extend",
            "itemids": itemdpie,
            "history": 3,
            "hostids": "10374",
            "sortfield": "clock",
            "sortorder": "DESC",
            "limit": 10
        },
        "auth": "ad4850656fc325d2958e93b52eca02c5",
        "id": 1
    };
    return json;
};

var itemdread = ["46224", "46233"];
function readJsonData() {
    var json ={
    "jsonrpc": "2.0",
    "method": "history.get",
    "params": {
        "output":  "extend",  
        "itemids":itemdread,
        "history":3,
        "hostids": "10374",
        "time_from":"1493228853",
        "time_till":"1493264853"
       
    },
    "auth": "ad4850656fc325d2958e93b52eca02c5",
    "id": 1
};
    return json;
};

  

function readWrite(id) { 
   var myChart = echarts.init(document.getElementById(id));
    var totaldata = [];
    var useddata = [];
    var iesdata = [];    
    $.ajax({
        type: "post",
        url: "http://106.39.160.226/zabbix/api_jsonrpc.php",
        data: JSON.stringify(readJsonData()),
        dataType: "json",
        contentType: "application/json;",
        success: function(data) {    
            myChart.hideLoading();
            if (data) {
                $.each(data.result, function(index, val) {
                    if (data.result[index].itemid == 46224) {
                        var times = setTimeType(val.clock);
                          
                           totaldata.push(times);
                        var usefigure = bytesToSize(val.value);
                        useddata.push(usefigure);
                    } else if (data.result[index].itemid == 46233) {
                            var timest = setTimeType(val.clock);
                           console.log(timest);
                        var usefigure = bytesToSize(val.value);
                        iesdata.push(usefigure);
                    }
                });
                myChart.setOption({
                    tooltip: {
                        trigger: 'axis',
                        position: function(pt) {
                            return [pt[0], '10%'];
                        }
                    },
                    legend: {
                        data: ['ceph.rdbps', 'ceph.wrbps']
                    },
                    title: {
                        left: 'left',
                        text: '流量图',
                    },
                    legend: {
                        data: ['ceph.rdbps', 'ceph.wrbps']
                    },
                    toolbox: {
                        feature: {
                            dataZoom: {
                                yAxisIndex: 'none'
                            },
                            dataView: {
                                readOnly: true
                            },
                            restore: {
                                show: true
                            },
                            saveAsImage: {
                                show: true
                            }
                        }
                    },
                    xAxis: {
                        type: 'category',
                        boundaryGap: false,
                        data: totaldata
                    },
                    yAxis: {
                        type: 'value',
                        boundaryGap: [0, '100%'],
                        axisLabel: {
                            formatter: '{value} MB/s'
                        }
                    },
                    dataZoom: [{
                        type: 'inside',
                        start: 0,
                        end: 100
                    }, {
                        start: 0,
                        end: 100,
                        handleStyle: {
                            color: '#fff',
                            shadowBlur: 3,
                            shadowColor: 'rgba(0, 0, 0, 0.6)',
                            shadowOffsetX: 2,
                            shadowOffsetY: 2
                        }
                    }],
                    series: [{
                        name: 'ceph.rdbps',
                        type: 'line',
                        smooth: true,
                        symbol: 'none',
                        sampling: 'average',
                        itemStyle: {
                            normal: {
                                 color: 'rgb(255, 70, 131)'
                            }
                        },
                        areaStyle: {
                            normal: {
                                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                                    offset: 0,
                                    color: 'rgb(255, 158, 68)'
                                }, {
                                    offset: 1,
                                    color: 'rgb(255, 70, 131)'
                                }])
                            }
                        },
                        data: useddata
                    }, {
                        name: 'ceph.wrbps',
                        type: 'line',
                        smooth: true,
                        symbol: 'none',
                        sampling: 'average',
                        itemStyle: {
                            normal: {
                                color: '#ffde33'
                            }
                        },
                        areaStyle: {
                            normal: {
                                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                                    offset: 0,
                                    color: 'rgb(60, 225, 64)'
                                }, {
                                    offset: 1,
                                    color: 'rgb(31, 205, 35)'
                                }])
                            }
                        },
                        data: iesdata
                    }]

                },true,true);
            }
        },
        error: function() {
            alert('数据加载失败');
        }
    });
};

function pieEcharts(id) {
     var myChart = echarts.init(document.getElementById(id));
    var totadata;
    var usedata;
    $.ajax({
        type: "post",
        url: "http://106.39.160.226/zabbix/api_jsonrpc.php",
        data: JSON.stringify(pieJsonData()),
        dataType: "json",
        contentType: "application/json;",
        success: function(data) {
            myChart.hideLoading();
            if (data) {
                x = 0;
                y = 0;
                $.each(data.result, function(index, val) {
                    if (x == 0 || y == 0) {
                        if (data.result[index].itemid == 46223) {
                            if (x == 0) {
                                x++;
                                var totadat = data.result[index].value;
                                var totafigure = bytesToSize(totadat);
                                totadata = parseInt(totafigure);
                            }
                        } else if (data.result[index].itemid == 46222) {
                            if (y == 0) {
                                y++;
                                var usedat = data.result[index].value;
                                var totafigur = bytesToSize(usedat);
                                usedata = parseInt(totafigur);
                            }
                        }
                    }
                   
                    myChart.setOption({
                        title: {
                            text: '流量',
                            subtext: '',
                            x: 'center'
                        },
                        tooltip: {
                            trigger: 'item',
                            formatter: "{a} <br/>{b} : {c} ({d}%)"
                        },
                        legend: {
                            orient: 'vertical',
                            left: 'left',
                            data: ['Ceph rados total space', 'Ceph rados used space']
                        },
                        toolbox: {
                            show: true,
                            feature: {
                                mark: true,
                                dataView: {
                                    readOnly: true
                                },
                                restore: true,
                                magicType: {},
                                saveAsImage: {
                                    show: true
                                }
                            }
                        },
                        series: [{
                            name: '流量',
                            type: 'pie',
                            radius: '55%',
                            center: ['50%', '60%'],
                            data: [{
                                value: totadata,
                                name: 'Ceph rados total space'
                            }, {
                                value: usedata,
                                name: 'Ceph rados used space'
                            }],
                            itemStyle: {
                                emphasis: {
                                    shadowBlur: 10,
                                    shadowOffsetX: 0,
                                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                                }
                            }
                        }]
                    } ,true,true);
                });
            }
        },
        error: function() {
            alert('数据加载失败');
        }
    });
};

$(function(){
   pieEcharts('one'); 
   pieEcharts('tow'); 
   pieEcharts('there'); 
   readWrite('four'); 
   readWrite('five'); 
   readWrite('sixe'); 


});

