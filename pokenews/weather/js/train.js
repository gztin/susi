let data = {
    startStation:'台北',
    endStation:'高雄',
    station:[
        {stationCode:1100,stationName:'台北'},
        {stationCode:1150,stationName:'高雄'}
    ]
}

let vm = new Vue({
    el:'#app',
    data:data;
});