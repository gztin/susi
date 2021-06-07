var temp = 0;
$(".question").click(function(){
    var x =$(this).index();
    // alert("這是第"+(x-1)+"個問題");
    if(temp==0){
        $(this).find('.answer').slideDown(300).parent().siblings().find('.answer').slideUp(300);
        console.log("其他關閉，temp的值是："+temp);
        temp = temp + 1;
    }
    else{
        $(this).find('.answer').slideToggle(300);
        console.log("單獨關閉，temp的值是："+temp);
        temp = 0;
    }
});

