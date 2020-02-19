// 設定預設終點車站資料
$('#end option[value=4400]').attr('selected', 'selected');

// 設定畫面上的出發日期
var dateObj = new Date();
var D = dateObj.getDate();
var H = dateObj.getHours();
var Y = dateObj.getFullYear();
var Mh = dateObj.getMonth() + 1;
if (Mh > 12) Mh = 01;
if (Mh < 10) Mh = '0' + Mh;
var weekday = new Array(7);
weekday[0] = "日";
weekday[1] = "一";
weekday[2] = "二";
weekday[3] = "三";
weekday[4] = "四";
weekday[5] = "五";
weekday[6] = "六";
var today = weekday[dateObj.getDay()];
$('#selectDay').html('<p>' + Y + '-' + Mh + '-' + D + '</p>' + '<p>' + '週' + today + '</p>');
var timeNow = H+'-00';
$('#startTime :selected').text(H+'-00');
while(H < 24){
    if(H<=9){
        $('#startTime').append('<option>0'+H+'-00</option>');
    }
    else{
        $('#startTime').append('<option>'+H+'-00</option>');
    }
    H=H+1;
}
// 設定可購票日期
function dispTime() {
    for (i = 0; i < 9; i++) {
        // 獲取今天日期
        function GetDateStr(i) {
            var dd = new Date();
            dd.setDate(dd.getDate() + i); //获取AddDayCount天后的日期
            var y = dd.getFullYear();
            var m = (dd.getMonth() + 1) < 10 ? "0" + (dd.getMonth() + 1) : (dd.getMonth() + 1); //获取当前月份的日期，不足10补0
            var d = dd.getDate() < 10 ? "0" + dd.getDate() : dd.getDate(); //获取当前几号，不足10补0
            return y + "-" + m + "-" + d;
        }
        // 獲取今天是星期幾
        function GetDayStr(i) {
            var dd = new Date();
            dd.setDate(dd.getDate() + i); //获取AddDayCount天后的日期
            var weekday = new Array(7);
            weekday[0] = "日";
            weekday[1] = "一";
            weekday[2] = "二";
            weekday[3] = "三";
            weekday[4] = "四";
            weekday[5] = "五";
            weekday[6] = "六";
            var today = weekday[dd.getDay()];
            return today;
        }
        $('.calender > div > ul').append('<li class="dayData">'+'<div>' + '<p>' + GetDateStr(i) + '</p>' + '<p>' + '週' + GetDayStr(i) + '</p>' +'</div>'+ '</li>');
    }
}
// var timerID = setInterval("dispTime()",1000);
dispTime();

// 開啟出發日期的選擇畫面
$('#selectDay > p:nth-child(1)').click(function() {
    $('.bg').css('display', 'block');
    $('.calender').css('display', 'flex');
});

// 若沒有要選擇日期，點選其他地方可關閉畫面
$('.bg').click(function() {
    $('.bg').css('display', 'none');
    $('.calender').css('display', 'none');
});

// 設定出發日期
// 如果選擇其他日期，則可以選擇所有班次時間
$('ul.list > li').click(function() {
    $('.bg').css('display', 'none');
    $('.calender').css('display', 'none');
    $('#startTime').html('');
    var x =$(this).index();
    if(x==0){
        console.log(x);
        var dateObj = new Date();
        var H = dateObj.getHours();
        while(H < 24){
            if(H<=9){
                $('#startTime').append('<option>0'+H+'-00</option>'); 
            }
            else{
                $('#startTime').append('<option>'+H+'-00</option>');
            }
            H=H+1;
        }
    }
    else{
        console.log(x);
        var index = $("ul.list > li").index(this);
        var tempDate = $('.dayData').eq(index).find("p").eq(0).text();
        var tempWeekDay = $('.dayData').eq(index).find("p").eq(1).text();
        // console.log('日期是'+tempDate);
        // console.log('禮拜幾? '+tempWeekDay);
        $('#selectDay').find("p").eq(0).html(tempDate);
        $('#selectDay').find("p").eq(1).html(tempWeekDay);
        var newStar = 6;
        while(newStar < 24){
            if(newStar <=9){
                $('#startTime').append('<option>0'+newStar+'-00</option>');
            }
            else{
                $('#startTime').append('<option>'+newStar+'-00</option>');
            }
            newStar=newStar+1;
        }
    }
});