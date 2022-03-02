// // JSON
$(function() {
    const uri = "https://opensheet.vercel.app/1-iH-YGEgyEkjrV2bM_sWR2MytqcfJf0ySiCugaiAgJw/A1:Z5532";
        
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
                    '<td><img src="'+result[count].bookLink + '"></td>'+
                    '<td>'+ result[count].bookName + '</td>'+
                    '<td>'+ result[count].bookISBN+ '</td>'+
                    '</tr>'
                );
            }
        }
        else{
            alert("沒有資料");
        }
    });
    
});