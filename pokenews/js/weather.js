function loadData(){
    fetch('https://opendata.cwb.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=CWB-157944DE-8E78-4585-8F55-6BFD77881E42&format=JSON', {})
    .then((response) => {
        // 可以透過 blob(), json(), text() 轉成可用的資訊
        return response.json(); 
    }).then((jsonData) => {
        console.log(jsonData);
        var dataTotal = jsonData.records.location.length;
        var dataCount = 0;
        var data = jsonData.records;
        
        // 顯示縣市資料
        while(dataCount<dataTotal){
            $('.place').append('<option value="'+dataCount+'">'+data.location[dataCount].locationName+'</option>');
            dataCount++;
        }
        
        // day1 晴天
        // day2 陰天
        // day3 雨天
        // day4 雷雨
        // day5 雪
        
        $('#place option[value=5]').attr('selected', 'selected');
        
        if(data.location[5].weatherElement[0].time[0].parameter.parameterValue < 4){
            $('.weatherIcon').append('<p>目前天氣</p>'+'<span class="day1"></span> ');
        }
        else if((data.location[5].weatherElement[0].time[0].parameter.parameterValue >= 4)||(data.location[5].weatherElement[0].time[0].parameter.parameterValue <= 8)){
            $('.weatherIcon').append('<p>目前天氣</p>'+'<span class="day2"></span> ');
        }
        else if((data.location[5].weatherElement[0].time[0].parameter.parameterValue > 8)||(data.location[5].weatherElement[0].time[0].parameter.parameterValue <= 14)){
            $('.weatherIcon').append('<p>目前天氣</p>'+'<span class="day3"></span> ');
        }
        else if((data.location[5].weatherElement[0].time[0].parameter.parameterValue > 15)||(data.location[5].weatherElement[0].time[0].parameter.parameterValue < 23)){
            $('.weatherIcon').append('<p>目前溫度</p>'+'<span class="day4"></span> ');
        }
        $('.chanceRain').append('<p>降雨機率</p>'+'<p class="pop">'+data.location[5].weatherElement[1].time[0].parameter.parameterName+'%</p>');
        $('.tempInf').append('<p>目前溫度</p>'+'<div>'+'<p>'+data.location[5].weatherElement[2].time[0].parameter.parameterName+'</p>'+'<span class="cUnit">°C</span>'+'</div>');
        $('.tempContent').append('<p>'+data.location[5].weatherElement[0].time[0].parameter.parameterName+'</p>');
        $('.status').append('<p>'+data.location[5].weatherElement[3].time[0].parameter.parameterName+'</p>');
    }).catch((err) => {
        console.log('錯誤:', err);
    });
}
function changeLocation(){
    $('.chanceRain').html("");
    $('.tempInf').html("");
    $('.status').html("");
    $('.tempContent').html("");
    var choice = $('#place').val();
    fetch('https://opendata.cwb.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=CWB-157944DE-8E78-4585-8F55-6BFD77881E42&format=JSON', {})
    .then((response) => {
        // 可以透過 blob(), json(), text() 轉成可用的資訊
        return response.json(); 
    }).then((jsonData) => {
        var data = jsonData.records;
        $('.weatherIcon').html('');
        // 顯示溫度資訊
        // 天氣描述
        // 溫度
        // 氣溫狀態
        if(data.location[choice].weatherElement[0].time[0].parameter.parameterValue < 4){
            $('.weatherIcon').append('<p>目前天氣</p>'+'<span class="day1"></span> ');
        }
        else if((data.location[choice].weatherElement[0].time[0].parameter.parameterValue >= 4)||(data.location[choice].weatherElement[0].time[0].parameter.parameterValue <= 8)){
            $('.weatherIcon').append('<p>目前天氣</p>'+'<span class="day2"></span> ');
        }
        else if((data.location[choice].weatherElement[0].time[0].parameter.parameterValue > 8)||(data.location[choice].weatherElement[0].time[0].parameter.parameterValue <= 14)){
            $('.weatherIcon').append('<p>目前天氣</p>'+'<span class="day3"></span> ');
        }
        else if((data.location[choice].weatherElement[0].time[0].parameter.parameterValue > 15)||(data.location[choice].weatherElement[0].time[0].parameter.parameterValue < 23)){
            $('.weatherIcon').append('<p>目前天氣</p>'+'<span class="day4"></span> ');
        }
        $('.chanceRain').append('<p>降雨機率</p>'+'<p class="pop">'+data.location[choice].weatherElement[1].time[0].parameter.parameterName+'%</p>');
        $('.tempInf').append('<p>目前溫度</p>'+'<div>'+'<p>'+data.location[choice].weatherElement[2].time[0].parameter.parameterName+'</p>'+'<span class="cUnit">°C</span>'+'</div>');
        $('.tempContent').append('<p>'+data.location[choice].weatherElement[0].time[0].parameter.parameterName+'</p>');
        $('.status').append('<p>'+data.location[choice].weatherElement[3].time[0].parameter.parameterName+'</p>');
    }).catch((err) => {
        console.log('錯誤:', err);
    });
}  
// function change
loadData();