$( "#datepicker1" ).datepicker({
    dateFormat: "yy/mm/dd", //修改顯示順序
    changeYear: true,
    yearRange: "1990:2050",
});
$( "#datepicker2" ).datepicker({
    dateFormat: "yy/mm/dd", //修改顯示順序
    changeYear: true,
    yearRange: "1990:2050",
});
printDay();

$( "#datepicker1" ).click(function(){
    let time1 = $(".time-start").val();
    let time2 = $(".time-end").val();
    checkTime(time1,time2);
});
$( "#datepicker2" ).click(function(){
    let time1 = $(".time-start").val();
    let time2 = $(".time-end").val();
    checkTime(time1,time2);
});


function printDay(){
    let day = new Date();
    let timeY = day.getFullYear();
    let timeM = day.getMonth()+1;
    let nextM = day.getMonth()+2;
    let timeD = day.getDate();
    let start = timeY+'/'+timeM+'/'+timeD;
    let end = timeY+'/'+nextM+'/'+timeD;
    $(".time-start").val(start);
    $(".time-end").val(end);
}
function checkTime(time1,time2){
   
    var begintime_ms = Date.parse(new Date(time1.replace(/-/g, "/"))); //begintime 為開始時間
    var endtime_ms = Date.parse(new Date(time2.replace(/-/g, "/")));   // endtime 為結束時間

    let duringTime = endtime_ms - begintime_ms;
    let postTime = (((duringTime / 1000 / 60 / 60 / 24) + 1)/30);
    $(".rentTime").html("計算後走期一共"+postTime+"個月");
}
