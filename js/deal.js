/**
 * Created by Administrator on 2017/4/26 0026.
 */

function getTitle() {
    return $('#titleName').val();
}


function getWidth() {
    return $('#patternWidth').val();
}


function getHeight() {
    return $('#patternHeight').val();
}

var ColorDy=[];
/*  累加器，设置itemid最大值 */
var count = 0;
/*  向表格中添加监控itemid*/
$("#add").click(function () {
    count ++;
    if(count == 5){
        alert("不可以再增加了！");
        return 0;
    }
    var itemid = $('#itemid').find('option:selected').val();
    var spanitem="spanColor"+itemid
    var colordef = randomColor();

    $('#table').append("<tr><td class='first'>"+itemid+"</td><td><select name='direct' id='direct'><option value='left'>左侧</option><option value='right'>右侧</option></select></td><td><div class='color-picker-rgb "+spanitem+" ' style='background-color:;' ></div></td><td><button class='endelete' onclick='del(this)'>移除</button></td></tr>");

    /*  将已添加到监控项的itemid和颜色从下拉单中移除 */
    $('#itemid').find('option:selected').remove();

    $("."+spanitem+" ").colorpicker({
        color: String(colordef),
        colorSpace: 'rgb'
    });

    $("."+spanitem+" ").css('background-color',String(colordef));
    var vaolr=$("."+spanitem+" ").css("background-color");

   /* ColorDy.push(vaolr)*/
});
/*  点击移除后，将该行的itemid加入下拉单中 */
function del(this_row){
    count--;
    var str = $(this_row).parent().siblings('.first').text();
    select_add(str);
    $(this_row).parents('tr').remove();
}

/*  itemid加入下拉单中 */
function select_add(strI) {
    var selObj = $("#itemid");
    selObj.append("<option value='"+strI+"'>"+strI+"</option>");
}



/*颜色随机数*/
  function randomColor(){
            var r = Math.floor(Math.random()*256);
            var g = Math.floor(Math.random()*256);
            var b = Math.floor(Math.random()*256);
            return "rgb("+r+","+g+","+b+")";
        }


/*  点击移除后，将该行的itemid加入下拉单中 */
function del(this_row){
    count--;
    var str = $(this_row).parent().siblings('.first').text();
    select_add(str);
    $(this_row).parents('tr').remove();
}

/*  itemid加入下拉单中 */
function select_add(strI) {
    var selObj = $("#itemid");
    selObj.append("<option value='"+strI+"'>"+strI+"</option>");
}



function getDirect() {
    var direct = [];
    var rows = getRows()+1;
    for(var i = 1; i < rows.length; i ++) {
        direct[i-1] = table.rows[i].cells[1].innerHTML;
    }
    return direct;
}


function getColor() {
    var color = [];
    var rows = getRows()+1;
    for(var i = 1; i < rows.length; i ++) {
        color[i-1] = table.rows[i].cells[2].innerHTML;
    }
    return color;
}


function getGraph_type() {
    return $('#graph_type').find('option:selected').val();
}


function getItemid() {
    var itemid = [];
    var rows = getRows()+1;
    for(var i = 1; i < rows; i ++) {
        itemid[i-1] = table.rows[i].cells[0].innerHTML;
    }
    return itemid;
}


function getRows() {
    var rows = $("#table").find('tr').length;
    return rows-1;
}


function timeStamp(stringTime) {
    var timestamp = Date.parse(new Date(stringTime));
    timestamp = timestamp / 1000;
    return timestamp;
}


function isGraph() {
    /* 获取图的类型 */
    var graph_type = getGraph_type();
    /* 用于判断图的类型 */
    var temp = 0;
    switch (graph_type){
        case 'pie':
            temp = 1;
            break;
        case 'line':
            temp = 2;
            break;
        // case 'bar':
        //     temp = 3;
        //     break;
        default:
    }
    return temp;
}
/* ajax解析 */
function analysis_common(result, temp) {

    /* 获取itemid个数*/
    var rows = getRows();
    var itemid = getItemid();
    /* 获取json解析结果中的value值 */
    var data_info = [];
    /* 获取折线图的clock值 */
    var clock = [];
   
    var line_value = [];
    
    /* 累加器，当其值等于itemid个数时跳转myEcharts函数 */
    var j = 0;
    /* 对每一个itemid进行ajax解析 */
    for(var i = 0;i < rows; i++) {

        $.ajax({
            type: "post",
            url: "http://106.39.160.226/zabbix/api_jsonrpc.php",
            data: JSON.stringify(data_common(result,i,temp,itemid)),
            dataType: "json",
            contentType: "application/json;",
            success:function(data) {
                if(temp == 1){
                    data_info[j] = data.result[0].value;
                }

                if(temp == 2){
                    var tempC = [];
                    var tempV = [];
                    $.each(data.result,function (index) {
                        tempC.push(data.result[index].clock);
                        tempV.push(bytesToSize(data.result[index].value));
                    });
                    clock[j] = tempC;
                    line_value[j] = tempV;
                }
                j++;
                if(j == rows) {
                    myEcharts(data_info,clock,line_value,temp);
                }
            },
            error:function(){
                alert('数据加载失败');
            }
        });

    }

}


/* json解析 */
function data_common(result,i,temp,itemid) {
    // var itemid = getItemid();
    if(temp == 1){
        var json = {
            "jsonrpc": "2.0",
            "method": "history.get",
            "params": {
                "output": "extend",
                "itemids": itemid[i],
                "history": 3,
                "hostids": "10374",
                "limit": 1,
                "sortfield": "clock",
                "sortorder": "DESC"
            },
            "auth": result,
            "id": 1
        }

    }
    else{
        if(temp == 2){
            var json = {
                "jsonrpc": "2.0",
                "method": "history.get",
                "params": {
                    "output": "extend",
                    "itemids": itemid[i],
                    "history": 3,
                    "hostids": "10374",
                    "time_from": timeStamp(getBeforeTime()),
                    "time_till": timeStamp(getNowTime())
                },
                "auth": result,
                "id": 1
            }
        }
    }
    return json;
}

/*Echarts制图*/
function myEcharts(data_info,clock,line_value,temp) {
    var myChart = echarts.init(document.getElementById('achieve'));
    /* 获取itemid */
    var itemid = getItemid();
    /* 获取itemid个数 */
    var rows = getRows();
    /* 获取设置的颜色 */
    var color = getColor();
    /* 保存series中data数据 */
    var end_data = [];
    /*实现饼图*/
    if(temp == 1){
        myChart.setOption({
            title: {
                text: getTitle(),
                subtext: '',
                left: 'center'
            },
            color:ColorDy,
            tooltip: {
                trigger: 'item',
                formatter: "{a} <br/>{b} : {c} ({d}%)"
            },
            legend: {
                orient: 'vertical',
                left: 'left',
                data: itemid
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
                name: getTitle(),
                type: 'pie',
                radius: '55%',
                data: (function () {
                    for(i = 0; i < rows; i++ ){
                        end_data.push({
                            value: data_info[i],
                            name: itemid[i]


                        })
                    }
                    return end_data;
                })(),
                itemStyle: {
                    emphasis: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    },
                    label:{
                        show: true,
                        position: 'top',
                        formatter: '{b}\n{c}'
                    }
                }
            }]
        } ,true,true);
    }
    else if(temp == 2){
        var xAx = [];
        var all_value = [];
        if(rows > 1){
            var xClock = dealClock(rows, clock);
            for(var n = 0; n < xClock.length; n ++){
                xAx[n] = setTimeType(new Date(parseInt(xClock[n]) * 1000));
            }
            console.log(xAx);
            for(n = 0; n < rows; n ++){
                all_value[n] = dealValue(xClock, line_value[n], clock[n]);
                console.log(all_value[n]);
            }
            
        }
        else{
            for(n = 0; n < clock[0].length; n ++){
                xAx[n] = setTimeType(new Date(parseInt(clock[0][n]) * 1000) );
            }
        // for(var n = 0; n < rows; n ++){
        //     for(var nn = 0; nn < clock[n].length; nn ++){
        //         xAx.push(setTimeType(new Date(parseInt(clock[n]) * 1000))) ;
        //     }
         }

        myChart.setOption({
            tooltip: {
                trigger: 'axis',
                position: function(pt) {
                    return [pt[0], '10%'];
                }
            },
            color:ColorDy,
            title: {
                left: 'center',
                text: getTitle()
            },
            legend: {
                left: 'left',
                data: itemid
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
                data: xAx
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
            },
                {
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
            series:(function () {

                for(var i = 0; i < rows; i ++){
                    end_data.push({
                        name: itemid[i],
                        type: 'line',
                        data: all_value[i]
                    })
                }
                return end_data;
            })()
        },true,true);
    }
}

/* 处理得到横坐标clock */
function dealClock(rows, clock) {
    var xClock = clock[0];
    for( i = 1; i < rows; i ++){
        var tempClock = [];
        var k = 0;
        var j = 0;
        while(j < clock[i].length || k < xClock.length){
            if(parseInt(clock[i][j]) < parseInt(xClock[k])){
                tempClock.push(clock[i][j]);
                j++;
            }
            else if(parseInt(clock[i][j]) > parseInt(xClock[k])){
                tempClock.push(xClock[k]);
                k++;
            }
            else{
                tempClock.push(xClock[k]);
                j++;
                k++;
            }
        }
        for(;j < clock[i].length; j ++){
            tempClock.push(clock[i][j]);
        }
        for(; k < xClock.length; k ++){
            tempClock.push(xClock[k]);
        }
        xClock = tempClock;
    }
    return xClock;
}


/* 处理得到纵坐标value */
function dealValue(xClock, line_value, clock) {
    var value = [];
    var k = 0;
    var j = 0;
    while(j < clock.length ){
        if(parseInt(clock[j]) == parseInt(xClock[k])){
            value.push(line_value[j]);
            j++;
            k++;
        }
        else if(parseInt(clock[j]) > parseInt(xClock[k])){
            value.push(line_value[j-1]);
            k++;
        }
        else{
            value.push(line_value[j+1]);
            j++;
        }
    }
    for(;j < clock.length; j ++){
        value.push(line_value[j]);
    }
    for(; k < xClock.length; k ++){
        value.push(line_value[j-1]);
    }
    return value;
}


/* 点击预览时跳转 */
$("#preview").click(function() {
      ColorDy = [];
    $(document).find(".display").each(function(index, el) {
        ColorDy.push($(el).css("background-color"));
    });
    /* 获取图形类型*/
    var isFinish = 0;
    var temp = isGraph();
    if(temp == 2){
        $('.zoom').css('display','block');
        setNowTime();
        setStaticTime();
        setTimeout(getDivTime,100);
    }
    /* 设置div的宽和高 */
    $("#achieve").css({'height':getHeight(),'width':getWidth()});
  TimeAjax(temp);
});


function TimeAjax(temp){
      /* 静态解析用户名和密码 */
    var potJsonData = {
        "jsonrpc": "2.0",
        "method": "user.login",
        "params": {
            "user": 'yunwei',
            "password": 'NneBFBRbiOij-!+*'
        },
        "id": 0
    };
    $.ajax({
        type: "post",
        url: "http://106.39.160.226/zabbix/api_jsonrpc.php",
        data: JSON.stringify(potJsonData),
        async: true,
        dataType: "json",
        contentType: "application/json;",
        success: function(data) {
            analysis_common(data.result, temp);
        },
        error: function() {
            alert('数据加载失败');
        }
    });
}
$('#patterning').click(function(){
    $('.zoom').hide();
});

/* 选择时间*/
$('.link-action').click(function(){
    clearTimeout(getDivTime());
    setNowTime();
    setBeforeTime(this);
    setTimeout(getDivTime,100);
    var temp= isGraph();
    TimeAjax(temp)
});

 
/* 设置之前时间*/
function setBeforeTime(timeData){
    /* 将选择的时间截点赋予select类，其他的同胞移除select类*/
    $(timeData).addClass('current').siblings('.current').removeClass('current');
    /* 得到select的值*/
    var zoom = $('.current');
    /* 获取select的zoom值 */
    var zoomVal = zoom.data('zoom');
    /* 得到之前时间的毫秒值 */
    var timeB = new Date(getNowTime()).getTime() - parseInt(zoomVal)*1000;
    var beforetime = setTimeType(new Date(timeB));
    $('.beforeTime').html(beforetime);
}


/* 设置时间样式*/
function setTimeType(date) {
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var hour = date.getHours();
    var minute = date.getMinutes();
    return (year + '-' + month + "-" + day +' ' + hour + ':' + minute );
}


/* 设置当前时间*/
function setNowTime() {
    var date = new Date();
    $('.nowTime').text(setTimeType(date));
}

/* 获得当前时间 */
function getNowTime() {
    return $('.nowTime').text();
}

/*  获得之前时间 */
function getBeforeTime() {
    return $('.beforeTime').text();
}


function bytesToSize(bytes) {
    if (bytes === 0) return '0 B';
    var k = 1024;
    sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toPrecision(3);
}

function setStaticTime() {
    var timeB = new Date(getNowTime()).getTime() - 7200*1000;
    var beforetime = setTimeType(new Date(timeB));
    $('.beforeTime').text(beforetime);
}

function getDivTime() {
    setNowTime();
    setBeforeTime();
    getNowTime();
    getBeforeTime();
}




