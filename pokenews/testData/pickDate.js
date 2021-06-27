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
    
    let compound = 24;  // 分期方案，目前24個月
    let periodTime = 0; // 走期

    // 計算兩個時間相差幾個月
    // 確認走期
    let timeStart = $(".time-start").val();
    let timeEnd = $(".time-end").val();
    let printMonth = ''; // 要列印的月份時間資料
    let rentCost = parseInt($('.price').val()); // 月租金

    let time1 = timeStart.replace("/","");
    let time2 = timeEnd.replace("/","");
    time1 = parseInt(time1);
    time2 = parseInt(time2);
    periodTime = (time2 - time1) % 88 + 1;
    periodTime = parseInt(periodTime);
    let priceTotal = rentCost * periodTime; // 總費用,未加上利率

    // console.log("方案的價格是："+priceTotal);

    // 測試宣告
    // 測試區 end 
    
    // 檢查是否輸入中文，如果輸入，顯示提示
    let checkCT = CheckMyForm();

    // 檢查是否符合格式
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
        $(".rentTime").html("走期共"+" "+periodTime+""+"個月");
        $(".rentTime").show();
        $('.table').show();

        if(periodTime>35){
            dataLength = periodTime;
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
        
        $(".hint").hide().removeClass("ff");
        $(".hint-price").hide().removeClass("ff");
        $('.table').hide();
        // let record =[];

        // 優惠資料的宣告
        let dataSize = 0;

        // step.1 取得目前時間
        let dayStart = $('.time-start').val();
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
    
        // 計算租金
        for(let i=0;i<dataLength;i++){
            
            // 設定目前要處理的月份
            tempNextTime = tempNextTime.toString();
            printMonth = tempNextTime.replace("/","");

            // 繳月租費（不分期）
            fullPeriod = (printMonth - time1) % 88 ;
            // console.log("printMonth目前是:"+printMonth);
    
            // 計算費用
            if ( time2 <= 202205 ){

                if( (i <= compound) && ( printMonth <= time2 )  ){
                    // 如果付款的時間還沒超過time2，走期遞增
                    periodTime = ( printMonth  - time1 ) % 88 + 1;
                }else if ( (printMonth > time2) && ( i < compound) ){
                    // 如果付款時間超過time2，且還沒付完分期，走期固定為time2-time1
                    periodTime = (time2 - time1) % 88 + 1;
                }else if( (printMonth > time2) && ( i >= compound) ){
                    // 第一期後費用會開始遞減
                    periodTime =( ( time2 - time1 ) % 88 + 1 ) +( compound - (i+1) );
                } 
                FinalPrice = periodTime * monthPrice;
            
            }else if((time2 > 202205)){

                if((i > 11) && ( printMonth <= time2 ) && (i == fullPeriod) ){
                    // 如果時間是該月份以及剛好滿一年，費用直接+3000
                    
                    countPeriod = 12;                    
                    if((i>35)){
                        // 如果費用超過 202204，費用固定 3000
                        tempPrice = 3000;
                    }else if((i>23) && (i<=35)){
                        countPeriod = countPeriod + (compound - (i+1));
                        tempPrice = countPeriod * monthPrice+3000;
                    }else {
                        tempPrice = countPeriod * monthPrice+3000;
                    }
                    FinalPrice = tempPrice;
                    tempPrice = 0;

                }else if((i <= compound) && ( printMonth < time2 ) ){
                    // 如果付款的時間還沒到，費用計算照舊
                    periodTime = ( printMonth - time1 ) % 88 + 1 ;
                    FinalPrice = periodTime * monthPrice;
                }else if((i < compound) && ( printMonth > time2 ) ){
                    // 如果付款的時間還沒到，費用計算照舊
                    countPeriod = 12;
                    FinalPrice = countPeriod * monthPrice;
                }else if(( i >= compound) && (printMonth > time2)){
                    // 第一期繳費結束後，費用開始遞減，走期遞增
                    countPeriod = 12;
                    countPeriod = countPeriod + (compound - (i+1));
                    FinalPrice = countPeriod * monthPrice;
                }
            }else{
                // 超過35個月
                FinalPrice = 3000;
            }
            
            
            FinalPrice = parseInt(FinalPrice);
            totalPrice = totalPrice + FinalPrice;
           
            // 列印資料
            dataTitle+=`<tr><th>${i+1}</th><td class="time">${tempNextTime}</td><td class="data-money">${FinalPrice}</td></tr>`;
            $('.rentData').html(dataTitle);
            
            // 轉換時間格式
            let tempData = new Date(tempNextTime);
            let Y = tempData.getFullYear() ;
            let M = tempData.getMonth() + 1;
            Y=parseInt(Y);
            M=parseInt(M);
            if(M==12){
                Y=Y+1;
                M=1;
            }else{
                M++;
            }
            if(M<10){
                tempNextTime = Y+"/0"+M;
                tempNextTime = tempNextTime.toString();
            }else{
                tempNextTime = Y+"/"+M;
                tempNextTime = tempNextTime.toString();
            }
            
            // 取得未來時間
            // var tempM = new Date();
            // var bbb = new Date(tempNextTime);
            // tempNextTime = bbb.setMonth(bbb.getMonth() + 1);
            // console.log("tempM是："+tempM);
            // console.log("tempNextTime是："+tempNextTime);
            // console.log("bbb是："+bbb);
            // console.log("tempNextTime:"+tempNextTime);

        }

        totalPrice = toCurrency(totalPrice);
        priceTotal = toCurrency(priceTotal);
        $(".price-data2").html(totalPrice+"元");
        $('.hint').show().addClass("ff");
        $(".hint-price").show().addClass("ff");
        $(".price-data1").html(priceTotal+"元");
        $('.table').show();
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

// 轉換千分位

let toCurrency = function (FinalPrice){
    var parts = FinalPrice.toString().split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
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
