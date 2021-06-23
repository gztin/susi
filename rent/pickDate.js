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


$(".count").click(function(){
    // 確認走期
    let time1 = $(".time-start").val();
    let time2 = $(".time-end").val();
    
    var begintime_ms = Date.parse(new Date(time1.replace(/-/g, "/"))); //begintime 為開始時間
    var endtime_ms = Date.parse(new Date(time2.replace(/-/g, "/")));   // endtime 為結束時間
    
    let duringTime = endtime_ms - begintime_ms;
    let postTime = (((duringTime / 1000 / 60 / 60 / 24) + 1)/30);
    let total = parseInt(Math.round(postTime));
    $(".rentTime").html("走期一共"+total+"個月");

    // 計算租金
    countPrice(total);
});

function countPrice(){

    // 規則:
    // 分期固定兩年
    // 合約走期看 total
    let price = $('.price').val();
    let staging = Math.round(price*1.033/24);

    
}

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
