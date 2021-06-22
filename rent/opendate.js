
$(".time-start").click(function(){
    $("#calender01").addClass("pick-start").removeClass("pick-end");
    $(".calendarView").show();
});

$(".time-end").click(function(){ 
    $("#calender01").addClass("pick-end").removeClass("pick-start");
    $(".calendarView").show();
});

