




// 讀取新聞資料
const uri = "https://taiwan-train-api.herokuapp.com/news/";
fetch(uri, {
    method: 'GET'
})
.then(res => {
    return res.json(); // 使用 text() 可以得到純文字 String
})
.then(result => {
    $('.loading').css('display', 'none');
    $('.navbar').css('display', 'block');
    console.log(result);
    var dataList = result.length;
    // 如果有撈到資料
    // newsFocus 焦點新聞
    // newsPolitics 政治新聞
    // newsEntertainment 娛樂新聞
    // newsFinance 金融新聞
    // newsSociety 社會新聞
    // newsGlobal 國際新聞
    // newsSport 體育新聞
    // newsGossiping 八卦版

    for (count = 0; count < dataList; count++) {
        var news = result[count];
        if(news.lable=='column'){
            $('.newsList > ul').append(
                '<li class="newsContent newsFocus">'+
                    '<p><span class="classTitle">焦點</span></p>'+
                    '<a id="linkURL" target="_parent" href="'+
                    news.url+
                    '">'+
                    news.title+
                    '</a>'+
                    '<p><span class="onTime">'+
                    news.date+
                    '</span></p>'+
                '</li>'
            );
        }
        else if(news.lable=='politics'){
            $('.newsList > ul').append(
                '<li class="newsContent newsPolitics">'+
                '<p><span class="classTitle">政治</span></p>'+
                '<a id="linkURL" target="_parent" href="'+
                news.url+
                '">'+
                news.title+
                '</a>'+
                '<p><span class="onTime">'+
                news.date+
                '</span></p>'+
                '</li>'
            );
        }
        else if(news.lable=='entertainment'){
            $('.newsList > ul').append(
                '<li class="newsContent newsEntertainment">'+
                '<p><span class="classTitle">娛樂</span></p>'+
                '<a id="linkURL" target="_parent" href="'+
                news.url+
                '">'+
                news.title+
                '</a>'+
                '<p><span class="onTime">'+
                news.date+
                '</span></p>'+
                '</li>'
            );
        }
        else if(news.lable=='politics'){
            $('.newsList > ul').append(
                '<li class="newsContent newsPolitics>'+
                '<p><span class="classTitle">政治</span></p>'+
                '<a id="linkURL" target="_parent" href="'+
                news.url+
                '">'+
                news.title+
                '</a>'+
                '<p><span class="onTime">'+
                news.date+
                '</span></p>'+
                '</li>'
            );
        }
        else if(news.lable=='finance'){
            $('.newsList > ul').append(
                '<li class="newsContent newsFinance">'+
                '<p><span class="classTitle">金融</span></p>'+
                '<a id="linkURL" target="_parent" href="'+
                news.url+
                '">'+
                news.title+
                '</a>'+
                '<p><span class="onTime">'+
                news.date+
                '</span></p>'+
                '</li>'
            );
        }
        else if(news.lable=='society'){
            $('.newsList > ul').append(
                '<li class="newsContent newsSociety">'+
                '<p><span class="classTitle">社會</span></p>'+
                '<a id="linkURL" target="_parent" href="'+
                news.url+
                '">'+
                news.title+
                '</a>'+
                '<p><span class="onTime">'+
                news.date+
                '</span></p>'+
                '</li>'
            );
        }
        else if(news.lable=='global'){
            $('.newsList > ul').append(
                '<li class="newsContent newsGlobal">'+
                '<p><span class="classTitle">國際</span></p>'+
                '<a id="linkURL" target="_parent" href="'+
                news.url+
                '">'+
                news.title+
                '</a>'+
                '<p><span class="onTime">'+
                news.date+
                '</span></p>'+
                '</li>'
            );
        }
        else if(news.lable=='sport'){
            $('.newsList > ul').append(
                '<li class="newsContent newsSport">'+
                '<p><span class="classTitle">體育</span></p>'+
                '<a id="linkURL" target="_parent" href="'+
                news.url+
                '">'+
                news.title+
                '</a>'+
                '<p><span class="onTime">'+
                news.date+
                '</span></p>'+
                '</li>'
            );
        }
        else if(news.lable=='gossiping'){
            $('.newsList > ul').append(
                '<li class="newsContent newsGossiping">'+
                '<p><span class="classTitle">八卦</span></p>'+
                '<a id="linkURL" target="_parent" href="'+
                news.url+
                '">'+
                news.title+
                '</a>'+
                '<p><span class="onTime">'+
                news.date+
                '</span></p>'+
                '</li>'
            );
        }
    }
}).catch((err) => {
    console.log('訊息:請重新嘗試連線', err);
});