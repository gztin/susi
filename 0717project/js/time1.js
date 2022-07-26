
  // var DifferenceHour = -1
  // var DifferenceMinute = -1
  // var DifferenceSecond = -1
  // var Tday = new Date("July 31, 2022 23:59:59") 
  // var daysms = 24 * 60 * 60 * 1000
  // var hoursms = 60 * 60 * 1000
  // var Secondms = 60 * 1000
  // var microsecond = 1000

function clock(){
  var timer=null;
  var show=document.getElementById("show");
  function show_date_time(){   
    var target=new Date("2022/7/27");  
    var today=new Date(); 
    var timeold=(target.getTime()-today.getTime());   
    var sectimeold=timeold/1000   
    var secondsold=Math.floor(sectimeold);   
    var msPerDay=24*60*60*1000   
    var e_daysold=timeold/msPerDay   
    var daysold=Math.floor(e_daysold);   
    var e_hrsold=(e_daysold-daysold)*24;   
    var hrsold=Math.floor(e_hrsold);   
    var e_minsold=(e_hrsold-hrsold)*60;   
    var minsold=Math.floor((e_hrsold-hrsold)*60);   
    var seconds=Math.floor((e_minsold-minsold)*60);
    if(daysold<0){   
      // document.getElementById("time").innerHTML="逾期,倒數計時已經失效";  
      $(".dd").val("0");
			$(".hh").val("0");
			$(".mm").val("0");
			$(".ss").val("0");
      $(".btn-votePrice").val("");
      $(".btn-votePrice").val("活動結束，已停止出價");
      document.getElementById("sendInf").disabled = true;
      clearInterval(timer);
    }   
    else{   
      if (daysold<10) {daysold="0"+daysold}   
      if (hrsold<10) {hrsold="0"+hrsold}   
      if (minsold<10) {minsold="0"+minsold}   
      if (seconds<10) {seconds="0"+seconds}
      
      $(".dd").val(daysold);
			$(".hh").val(hrsold);
			$(".mm").val(minsold);
			$(".ss").val(seconds);

      // show.innerHTML="距離結束時間還有:"+daysold+"天"+hrsold+"小時"+minsold+"分"+seconds+"秒";     
    }   
  }   
  timer=setInterval(show_date_time,1000);
} 

