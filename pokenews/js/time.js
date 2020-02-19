//      萬年曆
//		1.獲取各個時間
//		2.判定是否閏年並確認該月有幾天
//		3.從星期幾開始印空白/日期/剩餘天數印空白
//		4.今天以前的數字以灰色表示，當天要有背景色標註
//		5.未來的日子以別的顏色表示

var data1 = new Date();
var theYear = data1.getFullYear();
var theMonth = data1.getMonth()+1;
var theDay = data1.getDate(); // 目前日期
var theWeekDay = data1.getDay(); // 星期幾
var monthNormal=[31,28,31,30,31,30,31,31,30,31,30.31];
var monthNunian=[31,29,31,30,31,30,31,31,30,31,30.31];
// document.getElementById('prev').innerHTML = '<';
$('#prev').html('<');
// document.getElementById('next').innerHTML = '>';
$('#next').html('>');
// document.getElementById('title-year').innerHTML = theYear+'年';
$('#title-year').html(theYear+'年');
// document.getElementById('title-month').innerHTML = theMonth+'月';
$('#title-month').html(theMonth+'月');
function findFirstDay(year,month){
    var first = new Date(''+theYear+','+theMonth+',1');
    return (first.getDay());
}
function checkDays(year,month){
    var rule1 = year%4;
    var rule2 = year%100;
    var rule3 = year%400;
    
    if(((rule1==0) && ( rule2 !=0) )|| (rule3 ==0) ){
        return (monthNunian[month-1]);
    }else{
        return (monthNormal[month-1]);
    }
}
function printDays(){
    var dayInf='';
    var dayclass;
    var daysTotal = checkDays(theYear,theMonth);
    var firstday = findFirstDay(theYear,theMonth);
    var emptyDay = document.getElementById('d-list');
    for(var empty1=1;empty1<=firstday;empty1++ ){
        dayInf+="<li></li>";
        emptyDay.innerHTML = dayInf;
    }
    for(var days=1;days<=daysTotal;days++ ){
        if( (theYear == data1.getFullYear() && theMonth < data1.getMonth()+1) || (days < theDay && theYear == data1.getFullYear() && theMonth == data1.getMonth()+1) ||(theYear < data1.getFullYear())){
            dayClass = 'class="passDay"'
        }else if( days == theDay && theYear == data1.getFullYear() && theMonth == data1.getMonth()+1){
            dayClass = 'class="toDay"'
        }else{
            dayClass = 'class="future"'
        }
        dayInf += "<li"+' '+dayClass+">"+"<a>"+days+"</a>"+"</li>";
        emptyDay.innerHTML = dayInf;
    }
    var empty2 = 42 - firstday - daysTotal;
    for(var last=1;last<=empty2;last++){
        dayInf+="<li></li>";
        emptyDay.innerHTML = dayInf;
    }
}
printDays();

$('#prev').click(function(){
    theMonth = theMonth - 1 ;
    if(theMonth==0){
        theMonth = theMonth + 12;
        theYear = theYear - 1;
    }
    document.getElementById('title-year').innerHTML = +theYear+'年';
    document.getElementById('title-month').innerHTML = +theMonth+'月';
    console.log(theYear);
    console.log(theMonth);
    var bbb = checkDays(theYear,theMonth);
    console.log(bbb);
    printDays();
});
$('#next').click(function(){
    theMonth = theMonth + 1 ;
    if(theMonth > 12){
        theMonth = theMonth - 12;
        theYear = theYear + 1;
    }
    document.getElementById('title-year').innerHTML = +theYear+'年';
    document.getElementById('title-month').innerHTML = +theMonth+'月';
    console.log(theYear);
    console.log(theMonth);
    var ddd = checkDays(theYear,theMonth);
    console.log(ddd);
    printDays();
});


