$( ".date-picker1" ).datepicker({
    changeMonth: true,
    changeYear: true,
    showButtonPanel: true,
    dateFormat:"yy/mm/dd",
    yearRange:"2020:2200",
    minDate: new Date("2021/06"),
});
$('.date-picker2').datepicker( {
    changeMonth: true,
    changeYear: true,
    showButtonPanel: true,
    dateFormat:"yy/mm/dd",
    yearRange: "2020:2200",
    minDate: new Date("2021/06"),
});

// 行事曆月份中文化
$.datepicker.regional['zh-TW']={
    monthNames:["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"],
    monthNamesShort:["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"],
    closeText: "選擇並關閉",
};
$.datepicker.setDefaults($.datepicker.regional["zh-TW"]);
// 列印日期資料，預設是今天
printDay();

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

$('.count').click(function(){
    let timeStart = $(".time-start").val();
    let timeEnd = $(".time-end").val();
    let time1 = timeStart.replace("/","");
    let time2 = timeEnd.replace("/","");
    // 檢查是否符合格式，並給予提示訊息
    if(time2 < time1){
        alert("提醒：日期設定錯誤，起始日期不能晚於結束日期");
        $(".time-start").val(timeEnd);
    }else{
        countData();
    }
});

function countData(){

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
    let printM2 = day.getMonth()+1;
    let printD = day.getDate();
    let printD2 = day.getDate();
    let start = '';
    let end = '';
    
    
    if((printD<10)&&(printD2<10)&&(printM<10)&&(printM2<10)){
        start = printY+'/'+'0'+printM+'/'+'0'+printD;
        end = printY+'/'+'0'+printM2+'/'+'0'+printD2;
    }else if((printD<10)&&(printD2<10)&&(printM<10)){
        start = printY+'/'+'0'+printM+'/'+'0'+printD;
        end = printY+'/'+printM2+'/'+'0'+printD2;
    }else if((printD<10)&&(printD2<10)&&(printM2<10)){
        start = printY+'/'+printM+'/'+'0'+printD;
        end = printY+'/'+'0'+printM2+'/'+'0'+printD2;
    }else if((printD2<10)&&(printM<10)&&(printM2<10)){
        start = printY+'/'+'0'+printM+'/'+printD;
        end = printY+'/'+'0'+printM2+'/'+'0'+printD2;
    }else if((printD<10)&&(printM<10)&&(printM2<10)){
        start = printY+'/'+'0'+printM+'/'+'0'+printD;
        end = printY+'/'+'0'+printM2+'/'+printD2;
    }else if((printD<10)&&(printD2<10)){
        start = printY+'/'+printM+'/'+'0'+printD;
        end = printY+'/'+printM2+'/'+'0'+printD2;
    }else if((printM<10)&&(printM2<10)){
        start = printY+'/'+'0'+printM+'/'+printD;
        end = printY+'/'+'0'+printM2+'/'+printD2;
    }else if((printD<10)&&(printM<10)){
        start = printY+'/'+'0'+printM+'/'+'0'+printD;
        end = printY+'/'+printM2+'/'+printD2;
    }else if((printD2<10)&&(printM2<10)){
        start = printY+'/'+printM+'/'+printD;
        end = printY+'/'+'0'+printM2+'/'+'0'+printD2;
    }else if((printD<10)&&(printM2<10)){
        start = printY+'/'+printM+'/'+'0'+printD;
        end = printY+'/'+'0'+printM2+'/'+printD2;
    }else if((printD2<10)&&(printM<10)){
        start = printY+'/'+'0'+printM+'/'+printD;
        end = printY+'/'+printM2+'/'+'0'+printD2;
    }else if(printM<10){
        start = printY+'/'+'0'+printM+'/'+printD;
        end = printY+'/'+printM2+'/'+printD2;
    }else if(printM2<10){
        start = printY+'/'+printM+'/'+printD;
        end = printY+'/'+'0'+printM2+'/'+printD2;
    }else if(printD<10){
        start = printY+'/'+printM+'/'+'0'+printD;
        end = printY+'/'+printM2+'/'+printD2;
    }else if(printD2<10){
        start = printY+'/'+printM+'/'+printD;
        end = printY+'/'+printM2+'/'+'0'+printD2;
    }else{
        start = printY+'/'+printM+'/'+printD;
        end = printY+'/'+printM2+'/'+printD2;
    }
    $(".time-start").val(start);
    $(".time-end").val(end);
}
