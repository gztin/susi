$( "#datepicker1" ).datepicker({
    dateFormat: "yy/mm/dd", //修改顯示順序
    changeYear: true,
    yearRange: "1990:2200",
});
$( "#datepicker2" ).datepicker({
    dateFormat: "yy/mm/dd", //修改顯示順序
    changeYear: true,
    yearRange: "1990:2200",
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
    $(".rentTime").html("走期共"+total+"個月");
    // 計算租金
    countPrice(total);
    $('.table').show();
});

let countPrice = function (total){
    
    // 規則:
    // 分期固定 2 年，24個月
    // 合約走期看 total的值
    // 利率為1.033，滿一年後就不再收，費用固定
    // ----
    // 如果合約是 6 個月 ( total = 6 )
    // 費用分期固定 2 年(24個月)
    // 這樣總共要還 24 + 6 - 1 個月 ( totaltime = 29 ) 

    let price = $('.price').val(); // 月租金
    let staging = Math.round(price*1.033/24); // 每個月分期款
    let priceTotal = price * total; // 總費用,未加上利率
    let part = 24;
    let totalTime = part * total - 1;
    
    // 列印資料
    let dataTitle = ''; 

    for(let i =0;i<totalTime;i++){

        let dayStart = $('.time-start').val();
        let parstime = new Date(Date.parse(dayStart));
        let nextTime =new Date(parstime.setMonth(parstime.getMonth()+(i+1)));
        
        let timeY = nextTime.getFullYear();
        let timeM = nextTime.getMonth();
        let timeD = nextTime.getDate();

        if(timeM==0){
            timeM=12;
            dataTitle+='<tr><th>'+(i+1)+'</th><td class="time">'+timeY+'-'+timeM+'-'+timeD+'</td><td class="data-money">'+staging+'</td></tr>';
            $('.rentData').html(dataTitle);
        }else{
            dataTitle+='<tr><th>'+(i+1)+'</th><td class="time">'+timeY+'-'+timeM+'-'+timeD+'</td><td class="data-money">'+staging+'</td></tr>';
            $('.rentData').html(dataTitle);
        }

        
    }

    console.log("總金額是："+ priceTotal);
    
    console.log("月租是："+staging);
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
