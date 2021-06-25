$( ".date-picker1" ).datepicker({
    changeMonth: true,
    changeYear: true,
    showButtonPanel: true,
    dateFormat:"yy/mm",
    yearRange:"2021:2200",
    minDate: new Date(),
    onClose: function(dateText, inst) { 
        var month = $("#ui-datepicker-div .ui-datepicker-month :selected").val();
        var year = $("#ui-datepicker-div .ui-datepicker-year :selected").val();
        $(this).datepicker('setDate', new Date(year, month, 1));
    } 
});
$('.date-picker2').datepicker( {
    changeMonth: true,
    changeYear: true,
    showButtonPanel: true,
    dateFormat:"yy/mm",
    yearRange: "2020:2200",
    minDate: new Date(),
    onClose: function(dateText, inst) { 
        var month = $("#ui-datepicker-div .ui-datepicker-month :selected").val();
        var year = $("#ui-datepicker-div .ui-datepicker-year :selected").val();
        $(this).datepicker('setDate', new Date(year, month, 1));
    }
});

printDay();


$(".count").click(function(){
    
    // 確認租金
    let rent =parseInt($('.price').val()); // 月租金
    
    // step.1 取得目前時間
    let dayStart = $('.time-start').val();
    // 將目前時間暫存到時間變數
    let tempNextTime = dayStart;

    let compound = 24;  // 分期方案，目前24個月
    let periodTime =''; // 走期
    let dataLength = 0;
    let tempDeal = 0;

    // 計算兩個時間相差幾個月
    // 確認走期
    let timeStart = $(".time-start").val();
    let timeEnd = $(".time-end").val();
    let printMonth = ''; // 要列印的月份時間資料
    
    let time1 = timeStart.replace("/","");
    let time2 = timeEnd.replace("/","");
    periodTime = (time2 - time1) % 88 + 1;
    let priceTotal = rent * periodTime; // 總費用,未加上利率
    // console.log("time1的值是："+time1);
    // console.log("走期的值是："+periodTime);

    if(time2 < time1){
        alert("提醒，日期設定錯誤");
        $(".time-start").val(timeEnd);
    }else if((rent=='') || (rent <0)){
        alert("提醒，租金設定不符合格式");
    }else{
        $(".rentTime").html("走期共"+periodTime+"個月");
        $(".rentTime").show();
        $('.table').show();

        if(periodTime>35){
            dataLength = printMonth;
        }else if(periodTime>12){
            dataLength = 35;
        }else if((periodTime>12)&&(periodTime < 35)){
            dataLength = 35;
        }else{
            dataLength = compound + periodTime-1;
        }
    
        // 前置作業，清空資料
        $('.rentData').html('');
        let dataTitle = '';
        let dealBill =[];
        let record =[];

        // 優惠資料的宣告
        let dataSize = 0;
        let couponTotal =0;
    
        // 計算租金
        for(let i=0;i<dataLength;i++){
            
            // 設定目前要處理的月份
            printMonth = tempNextTime.replace("/","");
            record = tempNextTime.split("/");
            let recordY = record[0];
            let recordM = record[1]; 

            recordY = parseInt(recordY);
            recordM = parseInt(recordM);
            // console.log("下個月的時間是："+newNexTime);
            // console.log("下個月的時間是："+recordY+"/"+recordM);
    
            // 計算費用
            let priceRecord = countPrice(rent,time1,time2,printMonth);
            dealBill[i] = priceRecord;

            // 列印資料
            dataTitle+='<tr><th>'+(i+1)+'</th><td class="time">'+recordY+'年'+recordM+'月'+'</td><td class="data-money">'+priceRecord+'</td></tr>';
            $('.rentData').html(dataTitle);
    
            // 取得未來時間
             let newNexTime = getNextTime(tempNextTime);
             tempNextTime = newNexTime;
        }
        dataSize = dealBill.length;
        for(let coupon=0;coupon<dataSize;coupon++){
            tempDeal = tempDeal + dealBill[coupon];
            console.log("dealBill存入的值為："+dealBill[coupon]);
        }
        console.log("優惠價格為："+tempDeal);
        // 列印優惠費用計算結果
        $(".price-data2").html(tempDeal);
        $('.hint').show();
        $(".hint-price").show();
        $(".price-data1").html(priceTotal);
        $('.table').show();
    }

});

let countPrice = function (rent, time1, time2, printMonth) {
    var FinalPrice = 0;
    var MonthPrice = Math.round(rent * 1.033 / 24);
    var PeriodCount = 0;

    if (time2 <= 202205) {
        if (printMonth >= parseInt(time1) + 200) {
            PeriodCount = (time2 - (parseInt(printMonth) - 200) - 1) % 88 + 1;
            console.log("PeriodCount是："+PeriodCount);
        } else if (printMonth > time2){
            PeriodCount = (time2 - time1) % 88 + 1;
            console.log("PeriodCount是："+PeriodCount);
        } else {
            PeriodCount = (printMonth - time1) % 88 + 1;
            console.log("PeriodCount是："+PeriodCount);
        }
    } else if (printMonth <= 202205) {
            PeriodCount = (printMonth - time1) % 88 + 1;
            console.log("PeriodCount是："+PeriodCount);
    } else if (printMonth > 202205) {
        if (printMonth >= parseInt(time1) + 200) {
            PeriodCount = (202205 - (parseInt(printMonth) - 200) - 1) % 88 + 1;
            console.log("PeriodCount是："+PeriodCount);
        }
        else{
            PeriodCount = (202205 - time1) % 88 + 1;
            console.log("PeriodCount是："+PeriodCount);
        }
    }

    if (PeriodCount < 0) {
        PeriodCount = 0;
    }

    FinalPrice = PeriodCount * MonthPrice;
    console.log("費用資訊是："+FinalPrice);

    if (printMonth > 202205 && printMonth <= time2) {
        FinalPrice += parseInt(rent);
    }
    return FinalPrice;            
};


let getNextTime = function (dayStart){
    let inDate = new Date(dayStart.replace(/\-/g, "/"));
    //                     1   2   3   4   5   6   7   8   9  10  11  12月
    let daysInMonth = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    let strYear = inDate.getFullYear();
    let strMonth = inDate.getMonth() + 1;
    let strDay = inDate.getDate();
    //一、解決閏年平年的二月份天數 //平年28天、閏年29天//能被4整除且不能被100整除的為閏年,或能被100整除且能被400整除
    if (((strYear % 4) === 0) && ((strYear % 100) !== 0) || ((strYear % 400) === 0)) {
        daysInMonth[2] = 29;
    }
    //二、解決跨年問題
    if (strMonth + 1 === 13)
    {
        strYear += 1;
        strMonth = 1;
    }
    else {
        strMonth += 1;
    }
    //三、解決當月最後一日，例如2.28的下一個月日期是3.31；6.30下一個月日期是7.31；3.31下一個月是4.30
    if (strMonth == 2 || strMonth == 4 || strMonth == 6 || strMonth == 9 || strMonth == 11) {
        strDay = Math.min(strDay, daysInMonth[strMonth]);
    }
    else {
        if (strDay >= 28) {
            strDay = Math.max(strDay, daysInMonth[strMonth]);
        }
        else {
            strDay = Math.min(strDay, daysInMonth[strMonth]);
        }
    }

    //四、給個位數的月、日補零
    if (strMonth < 10)
    {
        strMonth = "0" + strMonth;
    }
    if (strDay < 10) {
        strDay = "0" + strDay;
    }
    let datastr = strYear + "/" + strMonth;
    return datastr;
}

function printDay(){
    let day = new Date();
    let printY = day.getFullYear();
    let printM = day.getMonth()+1;
    let printM2 = day.getMonth()+2;
    let start = '';
    let end = '';
    if(printM<10){
        start = printY+'/'+'0'+printM;
        end = printY+'/'+'0'+printM2;
    }else if(printM==0){
        printM = 12;
        start = printY+'/'+'0'+printM;
        end = printY+'/'+printM2;
    }else{
        start = printY+'/'+printM;
        end = printY+'/'+printM2;
    }
    $(".time-start").val(start);
    $(".time-end").val(end);
}
