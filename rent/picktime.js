//		1.獲取各個時間
//		2.判定是否閏年並確認該月有幾天
//		3.從星期幾開始印空白/日期/剩餘天數印空白
//		4.今天以前的數字以灰色表示，當天要有背景色標註
//		5.未來的日子以別的顏色表示

var data1 = new Date();
var theYear = data1.getFullYear();
var theMonth = data1.getMonth() + 1;
var nextMonth = data1.getMonth() + 2;
var theDay = data1.getDate();
var theWeekDay = data1.getDay();
var monthNormal = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
var monthNunian = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];


// 預設選取今天
let timeStart = theYear + "-" + theMonth + "-" + theDay;
let timeEnd = theYear + "-" + nextMonth + "-" + theDay;

$(".time-start").val(timeStart);
$(".time-end").val(timeEnd);

console.log("今天是："+timeStart);
document.getElementById('title-year').innerHTML = theYear;
document.getElementById('title-month').innerHTML = theMonth;


function findFirstDay(year, month) {
    var first = new Date('' + theYear + ',' + theMonth + ',1');
    return (first.getDay());
}
function checkDays(year, month) {
    var rule1 = year % 4;
    var rule2 = year % 100;
    var rule3 = year % 400;

    if (((rule1 == 0) && (rule2 != 0)) && (rule3 == 0)) {
        console.log("今年是閏年，month的值是:" + month);
        return (monthNunian[month - 1]);
    } else {
        console.log("今年不是閏年，month的值:" + month);
        return (monthNormal[month - 1]);
    }
}
function printDays() {
    var dayInf = '';
    var dayclass;
    var daysTotal = checkDays(theYear, theMonth);
    var firstday = findFirstDay(theYear, theMonth);
    var emptyDay = document.getElementById('d-list');
    for (var empty1 = 1; empty1 <= firstday; empty1++) {
        dayInf += "<li></li>";
        emptyDay.innerHTML = dayInf;
    }
    for (var days = 1; days <= daysTotal; days++) {
        // 過去時間
        if ((theYear == data1.getFullYear() && theMonth < data1.getMonth() + 1) || (days < theDay && theYear == data1.getFullYear() && theMonth == data1.getMonth() + 1) || (theYear < data1.getFullYear())) {
            dayClass = 'class="passDay"'
        } else if (days == theDay && theYear == data1.getFullYear() && theMonth == data1.getMonth() + 1) {
            dayClass = 'class="toDay"'
        } else {
            dayClass = 'class="future"'
        }
        dayInf += "<li" + ' ' + dayClass + ">" + "<a>" + days + "</a>" + "</li>";
        emptyDay.innerHTML = dayInf;
    }
    var empty2 = 42 - firstday - daysTotal;
    for (var last = 1; last <= empty2; last++) {
        dayInf += "<li></li>";
        emptyDay.innerHTML = dayInf;
    }
}
printDays();

$('#prev').click(function () {
    theMonth = theMonth - 1;
    if (theMonth == 0) {
        theMonth = theMonth + 12;
        theYear = theYear - 1;
    }
    document.getElementById('title-year').innerHTML = theYear;
    document.getElementById('title-month').innerHTML = theMonth;
    console.log(theYear);
    console.log(theMonth);
    var bbb = checkDays(theYear, theMonth);
    printDays();
});
$('#next').click(function () {
    theMonth = theMonth + 1;
    if (theMonth > 12) {
        theMonth = theMonth - 12;
        theYear = theYear + 1;
    }
    document.getElementById('title-year').innerHTML = theYear;
    document.getElementById('title-month').innerHTML = theMonth;
    var ddd = parseInt(checkDays(theYear, theMonth));
    console.log(theYear);
    console.log(theMonth);
    console.log(ddd);
    printDays();
});

// 選取起始日期
$(document).on("click", ".pick-start > .block > #d-list > li", function () {
    $(".timeData").html("");
    let year = $("#title-year").text();
    let month = $("#title-month").text();
    
    let day = $(this).text();
    let blockStart = year + "-" + month + "-" + day;
    $(".time-start").val(blockStart);
    console.log("選取的起始日期是" + year + "-" + month + "-" + day);
    $(this).addClass('toDay').siblings().removeClass('toDay');
    $(".calendarView").hide();
    rentTime();
});

// 選取結束日期
$(document).on("click", ".pick-end > .block > #d-list > li", function () {
    let year = $("#title-year").text();
    let month = $("#title-month").text();
    let day = $(this).text();
    let blockEnd = year + "-" + month + "-" + day;
    $(".time-end").val(blockEnd);
    console.log("選取的結束日期是" + year + "-" + month + "-" + day);
    $(this).addClass('toDay').siblings().removeClass('toDay');
    $(".calendarView").hide();
    rentTime();
});

// 算走期以及租金
function rentTime(timeStart,timeEnd){
    var startDt = $(".time-start").val();
    let parstime = new Date(Date.parse(startDt));
    console.log("起始日期是"+parstime);
    var endDt = $(".time-end").val();
    var diff = new Date(Date.parse(endDt) - Date.parse(startDt));
    var monthTime = (((diff / 1000 / 60 / 60 / 24) + 1)/30);
    
    let dataTitle = '';
    let price = $('.price').val();
    let staging = Math.round(price*1.033/24);
    podcastTime = Math.round(monthTime);
    if(podcastTime ==0){
        $(".rentTime").html("最小走期為1個月，所以一共是"+parseInt(podcastTime+1)+"個月");
        countPrice();
    }
    else if(podcastTime < 0){
        alert("日期有錯誤，須重新選擇");
        $(".time-start").val(timeStart2);
        $(".time-end").val(timeEnd2);
    }
    else{
        $(".rentTime").html("走期一共"+podcastTime+"個月");
        $(".staging").html("每個月攤提租金為"+staging+"元");
        for(var i = 1;i<=35;i++){
            let timeY = parstime.getFullYear();
            let timeM = parstime.getMonth()+i;
            let timeD = parstime.getDate();
            let totlePrice = staging+staging*i;
            console.log("i="+i+"，timeM="+timeM);
            dataTitle+="<tr><th>"+i+"</th><td>"+timeY+"-"+timeM+"-"+timeD+"</td><td>"+staging+"</td><td>"+totlePrice+"</td></tr>";
            $('.bbb').html(dataTitle);
        }
    }
}

$('.count').click(function(){
    if($('.price').val()==""){
        alert("請填寫租金金額");
    }else{
        rentTime();
    }
});