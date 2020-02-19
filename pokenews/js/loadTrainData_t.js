// // JSON
$('.sendMsg').click(function() {
    
    // var startStation = $('.start').val();
    var startStation = $('.start option:selected').text();
    // var endStation = $('.end ').val();
    var endStation = $('.end option:selected').text();
    console.log(startStation);
    console.log(endStation);
    var startTime = $('#startTime').val();
    var endTime = "23-59";
    console.log(endTime);
    var rideDate = $('#selectDay').find("p").text();
    if(startStation == endStation ){
        alert('起站跟終點站不得相同，請重新選擇');
    }
    else{
        $('.waiting').css('display','flex');
        const uri = "https://taiwan-train-api.herokuapp.com/train_api_t/" + startStation + "/" + endStation + "/" + rideDate + "/" + startTime + "/" + endTime;
        // const uri = "https://ptx.transportdata.tw/MOTC/v2/Bus/RealTimeByFrequency/Streaming/City/Hsinchu?$top=30&$format=JSON"
        fetch(uri, {
            method: 'GET'
        })
        .then(res => {
            return res.json(); // 使用 text() 可以得到純文字 String
        })
        .then(result => {
            $('.waiting').slideUp();
            console.log(result);
            var tripDay =  $('#selectDay').find("p").eq(1).text();
            var startStation = $('.start').find('option:selected').text();
            var endStation = $('.end').find('option:selected').text();
            var tripDate = $('#selectDay').find("p").eq(0).text();
            var tripTime = $('#startTime').find('option:selected').text();
            console.log(tripDay);
            $('.tripStart').html(startStation);
            $('.tripEnd').html(endStation);
            $('.tripDate').html(tripDate);
            $('.tripDay').html(tripDay);
            $('.tripTime').html(tripTime + '出發');
    
            var dataList = result[0].complete_info.length;
            var count = 0;
            console.log(dataList);
            // 如果有撈到資料
            if(dataList > 0){
                for (count = 0; count < dataList; count++) {
                    var car = result[0].complete_info[count];
                    if((car.blockName=='區間')||(car.blockName=='區間快')){
                        $('.listView > ul').append(
                        '<li class="carInf speed1">' +
                            '<span class="carBlock">' +
                            '<span class="carName car1">' + car.blockName + '</span>' +
                            '</span>' +
                            '<span class="carBlock">' +
                            '<span class="carWay">' + car.start + '</span>' + '<span class="arrow"></span>' + '<span class="carWay">' + car.end + '</span>' +
                            '<span class="carDrivertime">' + car.driver_time + '</span>' +
                            '</span>' +
                            '</li>'
                        );
                    }
                    else if(car.blockName=='莒光'){
                        $('.listView > ul').append(
                        '<li class="carInf speed2">' +
                            '<span class="carBlock">' +
                            '<span class="carName car2">' + car.blockName + '</span>' +
                            '</span>' +
                            '<span class="carBlock">' +
                            '<span class="carWay">' + car.start + '</span>' + '<span class="arrow"></span>' + '<span class="carWay">' + car.end + '</span>' +
                            '<span class="carDrivertime">' + car.driver_time + '</span>' +
                            '</span>' +
                            '</li>'
                        );
                    }
                    else if(car.blockName=='自強'){
                        $('.listView > ul').append(
                        '<li class="carInf speed3">' +
                            '<span class="carBlock">' +
                            '<span class="carName car3">' + car.blockName + '</span>' +
                            '</span>' +
                            '<span class="carBlock">' +
                            '<span class="carWay">' + car.start + '</span>' + '<span class="arrow"></span>' + '<span class="carWay">' + car.end + '</span>' +
                            '<span class="carDrivertime">' + car.driver_time + '</span>' +
                            '</span>' +
                            '</li>'
                        );
                    }
                    else if(car.blockName=='普悠瑪'){
                        $('.listView > ul').append(
                        '<li class="carInf speed4">' +
                            '<span class="carBlock">' +
                            '<span class="carName car4">' + car.blockName + '</span>' +
                            '</span>' +
                            '<span class="carBlock">' +
                            '<span class="carWay">' + car.start + '</span>' + '<span class="arrow"></span>' + '<span class="carWay">' + car.end + '</span>' +
                            '<span class="carDrivertime">' + car.driver_time + '</span>' +
                            '</span>' +
                            '</li>'
                        );
                    }
                    else if(car.blockName=='太魯閣'){
                        $('.listView > ul').append(
                        '<li class="carInf speed5">' +
                            '<span class="carBlock">' +
                            '<span class="carName car5">' + car.blockName + '</span>' +
                            '</span>' +
                            '<span class="carBlock">' +
                            '<span class="carWay">' + car.start + '</span>' + '<span class="arrow"></span>' + '<span class="carWay">' + car.end + '</span>' +
                            '<span class="carDrivertime">' + car.driver_time + '</span>' +
                            '</span>' +
                            '</li>'
                        );
                    }
                }
                $('.listView').slideToggle();
            }
            else{
                var tripDay = $('#selectDay').find("p").eq(1).text();
                var startStation = $('.start').find('option:selected').text();
                var endStation = $('.end').find('option:selected').text();
                var tripDate = $('#selectDay').find("p").eq(0).text();
                var tripTime = $('#startTime').find('option:selected').text();
                $('.tripStart').html(startStation);
                $('.tripEnd').html(endStation);
                $('.tripDate').html(tripDate);
                $('.tripDay').html(tripDay);
                $('.tripTime').html(tripTime + '出發');
    
                $('.listView > ul').append(
                    '<li class="carInf speed1 speed2 speed3 speed4">' +
                    '<span class="msg">沒有班次</span>'+
                    '</span>' +
                    '</li>'
                );
                $('.listView').slideToggle();
            }
        }).catch((err) => {
            console.log('訊息:請重新嘗試連線', err);
        });
    }
});