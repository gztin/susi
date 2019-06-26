// JavaScript Document
$(function(){
    var current = <?php echo time(); ?>000 || 0;
		function dispTime(){
		current += 1000;
		var dateObj = new Date(current);
		var Y = dateObj.getFullYear();
		var Mh = dateObj.getMonth() + 1;
		if(Mh > 12) Mh = 01;
		if(Mh < 10) Mh = '0'+Mh;
		var D = dateObj.getDate()  < 10 ? '0'+dateObj.getDate():dateObj.getDate();
		var H = dateObj.getHours() < 10 ? '0'+dateObj.getHours():dateObj.getHours()-12;
		var M = dateObj.getMinutes() < 10 ? '0'+dateObj.getMinutes():dateObj.getMinutes();
		var S = dateObj.getSeconds() < 10 ? '0'+dateObj.getSeconds():dateObj.getSeconds();
		document.getElementById('ustime').innerHTML ='美东时间:'+Y +'-'+Mh+'-'+D+'&nbsp;&nbsp;'+H+':'+M+':'+S;
	}
		var timerID = setInterval("dispTime()",1000);
});