let data = {
    // startStation:'臺北',
    // endStation:'高雄',
    // selectedStart: '臺北',
    // selectedEnd: '高雄',
    station:[
        {stationNumber:'1',stationName:'南港'},
        {stationNumber:'2',stationName:'台北'},
        {stationNumber:'3',stationName:'板橋'},
        {stationNumber:'4',stationName:'桃園'},
        {stationNumber:'5',stationName:'新竹'},
        {stationNumber:'6',stationName:'苗栗'},
        {stationNumber:'7',stationName:'台中'},
        {stationNumber:'8',stationName:'彰化'},
        {stationNumber:'9',stationName:'雲林'},
        {stationNumber:'10',stationName:'嘉義'},
        {stationNumber:'11',stationName:'台南'},
        {stationNumber:'12',stationName:'左營'}
    ]
}

let vm = new Vue({
    el:'#app',
    data:data
});

$('.close').click(function(){
    $('.listView').slideToggle();
    $('.listView ul').html("");
});

