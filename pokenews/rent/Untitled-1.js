//		1.獲取各個時間
//		2.判定是否閏年並確認該月有幾天
//		3.從星期幾開始印空白/日期/剩餘天數印空白
//		4.今天以前的數字以灰色表示，當天要有背景色標註
//		5.未來的日子以別的顏色表示

var data1 = new Date();
var theYear = data1.getFullYear();
var theMonth = data1.getMonth() + 1;
var nextMonth = data1.getMonth() + 3;
var theDay = data1.getDate();
var theWeekDay = data1.getDay();
var monthNormal = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
var monthNunian = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
let boardTime = 

// 預設選取今天
$(".timeData").html(theYear + "-" + theMonth + "-" + theDay);
let timeStart = theYear + "-" + theMonth + "-" + theDay;
let timeEnd = theYear + "-" + nextMonth + "-" + theDay;
$(".time-start").val(timeStart);
$(".time-end").val(timeEnd);

rentTime();

console.log("今天是："+timeStart);
document.getElementById('title-year').innerHTML = theYear;
document.getElementById('title-month').innerHTML = theMonth;


function rentTime(timeStart,timeEnd){
    var startDt = $(".time-start").val();
    var endDt = $(".time-end").val();
    var diff = new Date(Date.parse(endDt) - Date.parse(startDt));
    var monthTime = (((diff / 1000 / 60 / 60 / 24) + 1)/30);
    podcastTime = Math.round(monthTime);
    console.log("相差了"+podcastTime+"個月");
}

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

// 選取結束日期
$(document).on("click", "#calender02 > .block > #d-list > li", function () {
    $(".timeData").html("");
    let year = $("#title-year").text();
    let month = $("#title-month").text();
    let day = $(this).text();
    console.log("選取的結束日期是" + year + "-" + month + "-" + day);
    $(".timeData").html("結束日期是:"+year + "-" + month + "-" + day);
    $(this).addClass('toDay').siblings().removeClass('toDay');
});