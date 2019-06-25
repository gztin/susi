// JavaScript Document
 $(function(){
     $('.closead').click(function(){
            $('.adleft').css("display","none");
        });
        $('.adleft').hover(function(){
            $('.adleftlink').slideToggle();
        });
        $('.adright').click(function(){
            $('.adrightlink').slideToggle();
        });
 });