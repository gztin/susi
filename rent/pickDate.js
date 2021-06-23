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
    
    var begintime_ms = Date.parse(new Date(time1.replace(/-/g, "/"))); //begintime 為開始時間
    var endtime_ms = Date.parse(new Date(time2.replace(/-/g, "/")));   // endtime 為結束時間
    
    let duringTime = endtime_ms - begintime_ms;
    if(endtime_ms < begintime_ms){
        alert("提醒，日期設定錯誤");
        $(".time-start").val(time2);
    }else if((detectPrice=='') || (detectPrice <=0)){
        alert("提醒，租金設定不符合格式");
    }else{
        let postTime = (((duringTime / 1000 / 60 / 60 / 24))/30);
        // 這邊直接取最大整數
        // 以範例的2021/06/15 - 2022/05/15，相差了11.3333個月
        // 但是計算上會被視同為12個月，因為是在該月的同一天。
        let total = Math.ceil(postTime);
        $(".rentTime").html("走期共"+total+"個月");
        $(".rentTime").show();
        
        // 計算租金
        countPrice(total);
        $('.table').show();
    }

    
    
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
    
    let price =parseInt($('.price').val()); // 月租金
    let tempBill = 0;
    let tempDeal = 0;
    let compound = 24;
    let staging = Math.round(price*1.033/24); // 每個月分期款
    let priceTotal = price * total; // 總費用,未加上利率
    let dealTotal = 0; // 總費用,未加上利率
    let totalTime = 0;
    if(total >= compound){
        totalTime = compound + 11;
        console.log("合約大於等於兩年總共有："+totalTime);
    }else{
        totalTime = compound + total-1;
        console.log("合約小於兩年，總共有："+totalTime);
    }
    
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

    for(let count=0;count< totalTime;count++){
        // 假設兩年約，total=24
        if( (count < 12)){
            tempBill = staging + staging*count;
            billData[count] = tempBill;
        }else if((count >= 12) && (count<=23)){        
            // 第12月的時候，剛好滿一年
            // 不需要繳交月費利息
            billData[count] = tempBill+3000;

        }else if((count >23) && ((tempBill - staging)>0)){
            
            // 第24個月的時候，第一個月的費用剛好繳完
            //後面月份需要繳交的費用每次繳交都會少分期的月租費
            tempBill = tempBill - staging;
            billData[count] = tempBill;
            
        }else{
            billData[count] = tempBill;
        }
        console.log("第 "+(count+1)+" 月付款資料如下："+tempBill);
    }
    for(let n=0;n<totalTime;n++){
        tempDeal = tempDeal + parseInt(billData[n]);
    }
    dealTotal = tempDeal;
    $(".price-data2").html(dealTotal);
    // console.log("billData陣列資料如下："+billData);
    // console.log("共有："+totalTime+"筆資料");

    // 列印html
    let dataTitle = '';
    for(let i =0;i<totalTime;i++){
        // 設定表單起始時間
        let dayStart = $('.time-start').val();
        let parstime = new Date(Date.parse(dayStart));
        let nextTime =new Date(parstime.setMonth(parstime.getMonth()+(i+1)));
        
        let timeY = nextTime.getFullYear();
        let timeM = nextTime.getMonth();
        let timeD = nextTime.getDate();

        if(timeM==0){
            timeM=12;
            dataTitle+='<tr><th>'+(i+1)+'</th><td class="time">'+timeY+'/'+timeM+'/'+timeD+'</td><td class="data-money">'+billData[i]+'</td></tr>';
            $('.rentData').html(dataTitle);
        }else{
            dataTitle+='<tr><th>'+(i+1)+'</th><td class="time">'+timeY+'/'+timeM+'/'+timeD+'</td><td class="data-money">'+billData[i]+'</td></tr>';
            $('.rentData').html(dataTitle);
        }
    }
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
