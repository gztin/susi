// // JSON
$(function() {
    const uri = "https://opensheet.vercel.app/1hp4ysRpU2wBq3hRTOlWH_9CSkn4Jw_gd7YjAGFItca0/A1:B81";
        
    fetch(uri, {
        method: 'GET'
    })
    .then(res => {
        return res.json(); // 使用 text() 可以得到純文字 String
    })
    .then(result => {
        $('.waiting').slideUp();
        var dataList = result.length;
        var count = 0;
        // 如果有撈到資料
        if(dataList > 0){
            for (count = 0; count < dataList; count++) {
                var car = result[count];
                $('tbody').append(
                    '<tr>' +
                    '<td>'+ '<img class="bookPic" src='+ result[count].data_pic +'>' + '</td>'+
                    '<td>'+ result[count].data_setName + '</td>'+
                    '<td>'+ result[count].data_price + '</td>'+
                    '</tr>'
                );
            }
        }
        else{
            alert("沒有資料");
        }
    });
    
});