$( "#datepicker1" ).datepicker({
    dateFormat: "yy/mm", 
    changeYear: true,
    changeMonth: true, // 月下拉選單
    yearRange: "1990:2200",
});

$( "#datepicker2" ).datepicker({
    dateFormat: "yy/mm", //修改顯示順序
    changeYear: true,
    changeMonth: true, // 月下拉選單
    yearRange: "1990:2200",
});



printDay();

// 檢查欄位是否為數字
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
    $('.rentData').html('');
    let dataTitle = '';
    let price =parseInt($('.price').val()); // 月租金
    let tempBill = 0;
    let countData = 1;
    let tempDeal = 0;
    let compound = 24; // 目前固定分期24
    let staging = Math.round(price*1.033/24); // 每個月分期款
    let priceTotal = price * periodTime; // 總費用,未加上利率
    let dealTotal = 0; // 總費用,未加上利率
    let totalTime = 0;

    if(periodTime>12){
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

    // 將收集到的費用資料，依序存入陣列中
    // 需要注意的是規則:
    // 第1筆是第1個billDetail的第1筆資料
    // 第2筆是第1個billDetail的第2筆資料、第2個billDetail的第1筆資料
    // 第3筆是第1個billDetail的第3筆資料、第2個billDetail的第2筆資料、第3個billDetail的第1筆資料

    for(let n=0;n<totalTime;n++){
        // 設定表單起始時間
        let dayStart = $('.time-start').val();
        let parstime = new Date(Date.parse(dayStart));
        let nextTime =new Date(parstime.setMonth(parstime.getMonth()+(n+1)));
        
        let timeY = nextTime.getFullYear();
        let timeM = nextTime.getMonth();

        if((countData < 13)&&(countData <= periodTime)){

            tempBill = staging*countData;
            billData[n] = tempBill;
            countData++;

        }else if((n>11) && ( n < periodTime)){
            
            // 大於一年的時候，就不用算複利了
            // 僅需支付月租
            tempBill = tempBill + price;
            billData[n] = tempBill;
            tempBill = tempBill - price;
            
        }else if((n>=24)){
            tempBill = tempBill - staging;
            console.log("第 "+(n+1)+" 月付款資料如下："+tempBill);
            billData[n] = tempBill;
        }else{
            billData[n] = tempBill;
        }
        if(timeM==0){
            timeM=12;
            dataTitle+='<tr><th>'+(n+1)+'</th><td class="time">'+timeY+'/'+timeM+'</td><td class="data-money">'+billData[n]+'</td></tr>';
            $('.rentData').html(dataTitle);
        }else{
            dataTitle+='<tr><th>'+(n+1)+'</th><td class="time">'+timeY+'/'+timeM+'</td><td class="data-money">'+billData[n]+'</td></tr>';
            $('.rentData').html(dataTitle);
        }
       
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

    // 小於零補0
    if(timeM <10){
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
