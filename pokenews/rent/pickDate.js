$( "#datepicker1" ).datepicker({
    dateFormat: "yy/mm", 
    changeYear: true,
    changeMonth: true, // 月下拉選單
    yearRange: "2020:2200",
});

$( "#datepicker2" ).datepicker({
    dateFormat: "yy/mm", //修改顯示順序
    changeYear: true,
    changeMonth: true, // 月下拉選單
    yearRange: "2020:2200",
    monthRange:""
});



printDay();

// 檢查欄位是否為數字
// onkeyup='checkInput()'
function checkInput() { 
    var a=document.getElementById('zhi').value;
	if(isNaN(a)==true)
	{
		alert('不是數字哦');
		document.getElementById('zhi').value='';
	}
}

$(".count").click(function(){
    // 確認走期
    let time1 = $(".time-start").val();
    let time2 = $(".time-end").val();
    let detectPrice = $(".price").val();
    
    let a1 = time1.replace("/","");
    let a2 = time2.replace("/","");
    periodTime = (a2 - a1) % 88 + 1;
    console.log("a1= "+a1);
    console.log("a2= "+a2);


    if(a2 < a1){
        alert("提醒，日期設定錯誤");
        $(".time-start").val(time2);
    }else if((detectPrice=='') || (detectPrice <0)){
        alert("提醒，租金設定不符合格式");
    }else{
        $(".rentTime").html("走期共"+periodTime+"個月");
        $(".rentTime").show();
        // 計算租金
        countPrice(periodTime);
        $('.table').show();
    }
});

let countPrice = function (periodTime){
    
    // 規則:
    // 分期固定 2 年，24個月
    // 合約走期看 total的值
    // 利率為1.033，滿一年後就不再收，費用固定
    // ----
    // 如果合約是 6 個月 ( total = 6 )
    // 費用分期固定 2 年(24個月)
    // 這樣總共要還 24 + 6 - 1 個月 ( totaltime = 29 ) 
    
    // 列印html
    // 清空
    $('.rentData').html('');
    let dataTitle = '';
    let price =parseInt($('.price').val()); // 月租金
    let tempBill = 0;
    let countData = 0;
    let tempDeal = 0;
    let compound = 24; // 目前固定分期24
    let staging = Math.round(price*1.033/24); // 每個月分期款
    let priceTotal = price * periodTime; // 總費用,未加上利率
    let dealTotal = 0; // 總費用,未加上利率
    let totalTime = 0;

    if(periodTime>35){
        totalTime = periodTime;
    }else if(periodTime>12){
        totalTime = 35;
    }else if((periodTime>12)&&(periodTime < 35)){
        totalTime = 35;
    }else{
        totalTime = compound + periodTime-1;
    }

    console.log("總共有："+totalTime+"筆資料");
    
    $('.hint').show();
    $(".hint-price").show();
    $(".price-data1").html(priceTotal);
    
    // 費用總筆數
    let billData = new Array(totalTime);
    
    // console.log(billGroup);

    // 設定表單起始時間
    // step.1 取得目前時間
    let dayStart = $('.time-start').val();
    // 將目前時間暫存到時間變數
    let tempNextTime = dayStart;

    for(let n=0;n<totalTime;n++){
         
        // 取得未來時間
        let newNexTime = getNextTime(tempNextTime);
        tempNextTime = newNexTime;

        let record = tempNextTime.split("/");
        let recordY = record[0];
        let recordM = record[1]; 
        // let parstime = new Date(Date.parse(dayStart));
        // let nextTime =new Date(parstime.setMonth(parstime.getMonth()+(n+1)));
        // let timeY = nextTime.getFullYear();
        // let timeM = nextTime.getMonth();
        console.log("下個月的時間是："+newNexTime);
        console.log("下個月的時間是："+recordY+"/"+recordM);
        // let fixY = parseInt(timeY);
        // let fixM = parseInt(timeM);

        // var timeBlock = [100];

        // console.log("timeM:"+timeM);
        // 待刪除
        
        
        if((countData < 12)&&(countData < periodTime)){

            tempBill = staging + staging*countData;
            billData[n] = tempBill;
            countData++;

        }else if( (n>=36) && ( periodTime >= 35 ) && (n < periodTime) ){
            
            tempBill = tempBill+price;
            billData[n] = tempBill;
            tempBill = tempBill-price;

        }else if( (n>=24) && ( periodTime >= 25 ) && (n < periodTime) ){
            
            tempBill = tempBill - staging;
            tempBill = tempBill+price;
            billData[n] = tempBill;
            tempBill = tempBill-price;

        }else if((n<= (periodTime-1) && (n>11))){
            tempBill = tempBill+price;
            billData[n] = tempBill;
            tempBill = tempBill-price;
            
        }else if(((n>23)&&(n<35))){
            tempBill = tempBill - staging;
            billData[n] = tempBill;
        }else{
            billData[n] = tempBill;
        }
        dataTitle+='<tr><th>'+(n+1)+'</th><td class="time">'+recordY+'/'+recordM+'</td><td class="data-money">'+billData[n]+'</td></tr>';
        $('.rentData').html(dataTitle);
        // if(recordM==0){
        //     recordM=12;
        //     dataTitle+='<tr><th>'+(n+1)+'</th><td class="time">'+recordY+'/'+recordM+'</td><td class="data-money">'+billData[n]+'</td></tr>';
        //     $('.rentData').html(dataTitle);
        // }else if(recordM<10){
        //     dataTitle+='<tr><th>'+(n+1)+'</th><td class="time">'+recordY+'/'+'0'+recordM+'</td><td class="data-money">'+billData[n]+'</td></tr>';
        //     $('.rentData').html(dataTitle);
        // }else{
        //     dataTitle+='<tr><th>'+(n+1)+'</th><td class="time">'+recordY+'/'+recordM+'</td><td class="data-money">'+billData[n]+'</td></tr>';
        //     $('.rentData').html(dataTitle);
        // }
    }
    // 計算優惠
    for(let d=0;d<totalTime;d++){
        tempDeal = tempDeal + billData[d];
    }
    $(".price-data2").html(tempDeal);
}

function printDay(){
    let day = new Date();
    let timeY = day.getFullYear();
    let timeM = day.getMonth()+1;
    let nextM = day.getMonth()+2;
    let end = '';
    let start = '';

    timeY = parseInt(timeY);
    timeM = parseInt(timeM);


    // 小於零補0
    if(timeM < 10){
        start = timeY+'/'+'0'+timeM;
        end = timeY+'/'+'0'+nextM;
    }else{
        start = timeY+'/'+timeM;
        end = timeY+'/'+nextM;
    }
    if(nextM <10){
        start = timeY+'/'+'0'+timeM;
        end = timeY+'/'+'0'+nextM;
    }else{
        start = timeY+'/'+timeM;
        end = timeY+'/'+nextM;
    }
    $(".time-start").val(start);
    $(".time-end").val(end);
}

let getNextTime = function (dayStart){
    let inDate = new Date(dayStart);
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