

function getLocalTime(nS) {
    return new Date(parseInt(nS) * 1000).toLocaleString().replace(/年|月/g, "-").replace(/日/g, " ");
};

// bytestosize
function bytesToSize(bytes) {
    if (bytes === 0) return 0;
    var k = 1024;
    sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toPrecision(3);
};
// bytestosize
function bytesToSizes(bytes) {
    if (bytes === 0) return '0 B';
    var k = 1024;
    sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toPrecision(3)+ ' ' + sizes[i];
};


function readWrite(rurl, wurl, title, id) {
	var mychart = echarts.init(document.getElementById(id))
    mychart.showLoading({text: '数据正在载入中......',});
  var option = {
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
             text: title,
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
        xAxis: [
            {
                type: 'category',
                boundaryGap: false,
                data: []
            }
        ],
        yAxis:[
             {
                type: 'value',
                boundaryGap: [0, '100%'],
                axisLabel: {
                    formatter: '{value} MB/s'
                }
            }
        ],
        grid: {
        	left: '80px',
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
                    color: 'rgb(0, 0, 255)'
                }
            },
            areaStyle: {
                normal: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                        offset: 0,
                        color: 'rgb(0, 0, 255)'
                    }, {
                        offset: 1,
                        color: 'rgb(255, 255, 255)'
                    }])
                }
            },
            data: []
        }, {
            name: 'ceph.wrbps',
            type: 'line',
            smooth: true,
            symbol: 'none',
            sampling: 'average',
            itemStyle: {
                normal: {
                    color: 'rgb(0, 255, 0)'
                }
            },
            areaStyle: {
                normal: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                        offset: 0,
                        color: 'rgb(0, 255, 0)'
                    }, {
                        offset: 1,
                        color: 'rgb(255, 255, 255)'
                    }])
                }
            },
            data: []
        }]
    };
    //mychart.setOption(option,true,true);
    $.ajax({
        type: "get",
        url: rurl,
        dataType: "json",
        contentType: "application/json;",
        async:false,
        success: function(result) {
           var timedata=[];
           var readdata=[];
            for (var i=0;i<result.length;i++) {
                var times = getLocalTime(result[i].clock);
                timedata.push(times);
                var readat = bytesToSize(parseInt(result[i].value));
                readdata.push(readat);
            };
           // console.log(timedata);
            option.xAxis[0].data=timedata;
            option.series[0]['data']= readdata;
        },
        error: function() {
            alert('数据加载失败');
        }
    });
    var times=null;
        times = setTimeout(function(){

        $.ajax({
           type: "get",
           url: wurl,
           dataType: "json",
           contentType: "application/json;",
           async:false,
           success: function(data) {
             var writedata=[];
               for (var i=0;i<data.length;i++) {
                   var writedat = bytesToSize(parseInt(data[i].value));
                   writedata.push(writedat);
               };
                option.series[1]['data']= writedata;
                mychart.hideLoading();
                mychart.setOption(option,true,true);
                clearTimeout(times);
           },
           error: function() {
               alert('数据加载失败');
               clearTimeout(times);
           }
        });
    }, Math.floor(Math.random()*(6000-10+1)+10));
}

function pieEcharts(url, title, id ) {
	var mychart = echarts.init(document.getElementById(id));
    mychart.showLoading({text: '数据正在载入中......',});
	//mychart.showLoading('数据正在载入中......');
    var option = {
            title: [
                {
                    text: title,
                    subtext: '',
                    x: 'center'
                }
            ],
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
                    value:'',
                    name: ''
                }, {
                    value: '',
                    name: ''
                }],
                itemStyle: {
                    emphasis: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
            }]
         };
    var times=null;
        times = setTimeout(function(){
        $.get(url, function(data,status){
            if(status=="success"){
                //mychart.hideLoading();
                option.title[0]['subtext'] = bytesToSizes(data.total);
                option.series[0]['data'][0]['value'] =  data.used;
                option.series[0]['data'][1]['value'] =  data.total-data.used;
                option.series[0]['data'][0]['name'] =  'Ceph  used '+bytesToSizes(data.used);
                option.series[0]['data'][1]['name'] =  'Ceph free '+bytesToSizes(data.total-data.used);
                mychart.hideLoading();
                mychart.setOption(option,true,true);
                clearTimeout(times);
            }else{
                 alert('数据加载失败');
                 clearTimeout(times);
            }
        },"json");
    }, Math.floor(Math.random()*(6000-10+1)+10));

};

function randomTime(fn){
    var speed = Math.floor(Math.random()*(6000-10+1)+10);
    var timer = setTimeout(function(){fn;clearTimeout(timer);}, speed);
};

$(function(){
    randomTime(pieEcharts("http://cdn.i3box.cn/api/v1/zabbix/ceph/bjstat", "北京ceph存储", 'bjpie'));
    randomTime(pieEcharts("http://cdn.i3box.cn/api/v1/zabbix/ceph/njstat", "南京ceph存储", 'njpie'));
    randomTime(pieEcharts("http://cdn.i3box.cn/api/v1/zabbix/ceph/gzstat", "广州ceph存储", 'gzpie'));

    randomTime(readWrite("http://cdn.i3box.cn/api/v1/zabbix/ceph/bjread", "http://cdn.i3box.cn/api/v1/zabbix/ceph/bjwrite", '北京ceph读写图', 'bjline'));
    randomTime(readWrite("http://cdn.i3box.cn/api/v1/zabbix/ceph/njread", "http://cdn.i3box.cn/api/v1/zabbix/ceph/njwrite", "南京ceph读写图", 'njline'));   
    randomTime(readWrite("http://cdn.i3box.cn/api/v1/zabbix/ceph/gzread", "http://cdn.i3box.cn/api/v1/zabbix/ceph/gzwrite", "广州ceph读写图", 'gzline'));

});



