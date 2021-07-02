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

// 行事曆月份中文化
// $.datepicker.setDefaults( $.datepicker.regional[ "zh-TW" ] );
$.datepicker.regional['zh-TW']={
    // dayNames:["星期日","星期一","星期二","星期三","星期四","星期五","星期六"],
    // dayNamesMin:["日","一","二","三","四","五","六"],
    monthNames:["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"],
    monthNamesShort:["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"],
    // prevText:"上月",
    // nextText:"次月",
    // weekHeader:"週"
    closeText: "選擇並關閉",
};
$.datepicker.setDefaults($.datepicker.regional["zh-TW"]);
// 列印日期資料，預設是今天
printDay();

$(".count").click(function(){

    // 計算兩個時間相差幾個月
    // 確認走期
    let timeStart = $(".time-start").val();
    let timeEnd = $(".time-end").val();
    let printMonth = ''; // 要列印的月份資料
    let nowPrint = ''; // 要用來計算的正在列印的月份資料
    let rentCost = parseInt($('.price').val()); // 月租金

    // step.1 取得目前時間
    let dayStart = $('.time-start').val();
    // console.log("dayStart:"+dayStart);
    // 將目前時間暫存到時間變數
    let tempNextTime = dayStart;
    
    // 租金、分期換算費用
    let monthPrice = Math.round(rentCost * 1.033 / 24);
    // 該月總費用
    let tempPrice = 0;
    let FinalPrice = 0;
    let totalPrice = 0;

    // 費用滿期
    let countPeriod = 12;
    let fullPeriod ='';

    // 下一個時間資料的相關變數宣告
    let compound = 24;  // 分期方案，目前24個月
    let periodTime = 0; // 走期
    let newY = 0;
    let newM = 0;
    let sY = '';
    let sM='';
    let date =[];
    
    let time1 = timeStart.replace("/","");
    let time2 = timeEnd.replace("/","");
    
    time1 = parseInt(time1);
    time2 = parseInt(time2);
    
    // periodTime = (time2 - time1) % 88 + 1;
    periodTime = datemonth(timeStart,timeEnd) + 1;
    periodTime = parseInt(periodTime);
    let priceTotal = rentCost * periodTime; // 總費用,未加上利率
    
    // 檢查是否輸入中文，如果輸入，顯示提示
    let checkCT = CheckMyForm();

    // 檢查是否符合格式，並給予提示訊息
    if(time2 < time1){
        alert("提醒：日期設定錯誤，起始日期不能晚於結束日期");
        $(".time-start").val(timeEnd);
    }else if( checkCT === false){
        alert("提醒，租金格式錯誤，請輸入正確的價格。");
        $('.price').val(''); 
    }else if(($('.price').val()=='')){
        alert("提醒：租金是必填欄位。");
    }else if(($('.price').val() <= 0)){
        alert("提醒：租金不得小於0或等於0。");
        $('.price').val('');
    }else{
        $(".rentTime").html("走期共"+" "+periodTime+" "+"個月");
        $(".rentTime").show();
        $('.table').show();
        if( time1 > 202205 ){
            // 合約在202205之後,不用在乎分期,僅需計算月分之間的差距
            dataLength = periodTime;
        }else if( ( time1 <= 202205 ) && ( time2 > 202205 ) && ( time2 <= 202404 ) ){
            // 合約跨過202205
            dataLength = compound + ( (202205 - time1));
        }else if ( ( time1 <= 202205 ) && ( time2 > 202205 ) && ( time2 > 202404 ) ){
            dataLength = periodTime;
        }else{
            dataLength = compound + periodTime-1;
        }
    
        // 前置作業，清空資料
        $('.rentData').html('');
        let dataTitle = '';
        let hintTitle = '';
        
        $(".hint").hide().removeClass("ff");
        $(".hint-price").hide().removeClass("ff");
        // $('.hintInf').hide().removeClass("rowClass");
        $('.table').hide();
        // let record =[];
    
        // 計算租金
        for(let i=0;i<dataLength;i++){
            
            // 設定目前要處理的月份
            tempNextTime = tempNextTime.toString();
            nowPrint = tempNextTime.replace("/","");
            printMonth = tempNextTime;
            nowPrint = parseInt(nowPrint);

            // 繳月租費（不分期）
            // fullPeriod = (printMonth - time1) % 88 ;
            fullPeriod = datemonth(timeStart,printMonth);
            // console.log("printMonth目前是:"+printMonth);
    
            if ( time2 <= 202205 ){
                // 在202205以前的費用，採分期複利的方式付款
                if((i <= compound-1) && ( nowPrint <= time2 )){
                    // 如果付款的時間還沒超過time2，走期遞增
                    periodTime = datemonth(timeStart,printMonth) + 1;
                }else if (( i <= compound-1) && (nowPrint > time2) ){
                    // 如果還沒付完分期，後面繳交的費用固定
                    periodTime = datemonth(timeStart,timeEnd) + 1;
                }else if(( i > compound-1) && (nowPrint > time2) ){
                    // 第一期的費用繳清之後，每個月需支付的分期費用會開始遞減
                    periodTime =( datemonth(timeStart,timeEnd) + 1 ) +( compound - (i+1) );
                } 
                FinalPrice = periodTime * monthPrice;
            }else if( time1 > 202205 ){
                // 在202205以後的費用，費用固定
                tempPrice = rentCost;
                FinalPrice = tempPrice;
                tempPrice = 0;
            }else if( ( time1 <= 202205 ) && ( time2 > 202205 )){
                // 如果走期有跨過202205
                if( nowPrint > 202404 ){
                    tempPrice = rentCost;
                }else if( (nowPrint > 202205) && (i <= compound-1) && (nowPrint <= time2) ){
                    // 在time2之前，且時間是202205以後，繳固定月費
                    periodTime = (202205 - time1)+1;
                    tempPrice = periodTime * monthPrice + rentCost;
                }else if( (nowPrint > 202205) && (i <= compound-1) && (nowPrint > time2) ){
                    // 如果第一期費用還沒繳完
                    // 該月不需繳time2的分期，所以少了一筆分期的費用
                    periodTime = ( 202205 - time1 ) + 1;
                    tempPrice = periodTime * monthPrice;
                }else if( (nowPrint > 202205) && (i > compound-1) && (nowPrint <= time2) ){
                    // 第一期的費用繳清之後，每個月需支付的分期費用會開始遞減
                    periodTime = ( 202205 - time1 + 1 ) + ( compound - ( i + 1 ) );
                    tempPrice = periodTime * monthPrice + rentCost;
                }else if( (nowPrint > 202205) && (i > compound-1) && (nowPrint > time2) ){
                    // 第一期的費用繳清之後，每個月需支付的分期費用會開始遞減
                    periodTime = ( 202205 - time1 + 1 ) + ( compound - ( i + 1 ) );
                    tempPrice = periodTime * monthPrice;
                }else if ( nowPrint <= 202205 ){
                    // 計算起始時間到202205之間總共需繳交幾個月的分期費用
                    periodTime = datemonth(timeStart,printMonth) + 1;
                    tempPrice = periodTime * monthPrice;
                }   
                FinalPrice = tempPrice;
                tempPrice = 0;
            }else{
                // 超過35個月
                FinalPrice = rentCost;
            }
            
            FinalPrice = parseInt(FinalPrice);
            totalPrice = totalPrice + FinalPrice;
           
            // 列印資料
            dataTitle+=`<tr><th>${i+1}</th><td class="time">${tempNextTime}</td><td class="data-money">${FinalPrice}</td></tr>`;
            // 轉換時間格式
             // 取得未來時間
            date = tempNextTime.split("/");
            sY = date[0];
            sM = date[1];

            // console.log(" date 是：" + date);
            // console.log(" sY 是：" + sY);
            sM = parseInt(sM);
            sY = parseInt(sY);
            if(sM==12){
                sY=sY+1;
                sM=1;
            }else{
                sM++;
            }
            if(sM<10){
                tempNextTime = sY+"/0"+sM;
                tempNextTime = tempNextTime.toString();
                console.log("tempNextTime 進位處理完後的結果是:"+tempNextTime);
            }else{
                tempNextTime = sY+"/"+sM;
                tempNextTime = tempNextTime.toString();
                console.log("tempNextTime 處理完後的結果是:"+tempNextTime);
            }
        }
        $('.rentData').html(dataTitle);
        totalPrice = toCurrency(totalPrice);
        priceTotal = toCurrency(priceTotal);
        $(".price-data2").html(totalPrice+"元");
        // $('.hint').show();
        $(".hint-price").show().addClass("ff");
        $(".price-data1").html(priceTotal+"元");
        $('.table').show();
        // $('.hintInf').show().addClass("rowClass");
        editvfput();
    }
});

// 檢查是否輸入中文
let CheckMyForm = function() { 
    var txt = $('.price').val(); 
    if(checknumber(txt)) 
    { 
        return false; 
    } 
    return true; 
} 
function checknumber() { 
    let string = $('.price').val();
    let Letters = "1234567890"; 
    let i; 
    let c; 
    for( i = 0; i < string.length; i ++ ) 
    { 
        c = string.charAt( i ); 
        if (Letters.indexOf( c ) ==-1) 
        { 
            return true; 
        } 
    } 
    return false; 
} 
// 倒數顯示後消失



// 轉換千分位
let toCurrency = function (FinalPrice){
    var parts = FinalPrice.toString().split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
}

function editvfput() {
    let count = 5;
    let down = setInterval(CountDown, 1000);//每秒執行一次，賦值
    $('.timeHint').css('display','block');
    $('.hintInf').css('display','flex');
    $('.hintInf').css('justify-content','center');
    $('.table').css('margin-top','0px');
    function CountDown() {
        $('.timeHint').text( count);//寫入
        console.log("count=" + count);
        if (count == 0) {
            // $('.timeHint').hide();//修改狀態
            $('.timeHint').css('display','none');
            $('.hintInf').css('display','none');
            $('.table').css('margin-top','15px');
            clearInterval(down);//銷燬計時器
            $('.timeHint').html('');
            return;
        }
    count--;
    }
}

// 計算兩個日期的時間差
let datemonth = function (date1,date2){
    // 拆分年月日
    date1 = date1.split('/');
    // 得到月数
    date1 = parseInt(date1[0]) * 12 + parseInt(date1[1]);
    // 拆分年月日
    date2 = date2.split('/');
    // 得到月数
    date2 = parseInt(date2[0]) * 12 + parseInt(date2[1]);
    var m = Math.abs(date1 - date2);
    return m;
}

// 列印日期
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
