// 切換項目
let data = {
  newsCategory:[
      {className:'all',title:'綜合'},
      {className:'focus',title:'焦點'},
      {className:'politics',title:'政治'},
      {className:'gossiping',title:'八卦'},
      {className:'entertainment',title:'娛樂'},
      {className:'global',title:'國際'},
      {className:'finance',title:'金融'},
      {className:'society',title:'社會'},
      {className:'sport',title:'體育'}
  ],
  title:'POKENEWS'
}
let vm = new Vue({
  el:'#news',
  data:data
});


$('.menu span').eq(0).addClass('cur');

// 叫出側邊欄位
$('.area-title > span').click(function(){
  $('.sideMenuBg').show();
  $('.sideMenu').css('left','0%');
});
// 隱藏側邊欄位
$('.sideMenuBg').click(function(){
  $('.sideMenu').css('left','-70%');
  $('.sideMenuBg').hide();
});

// 切換類別
$('.menu span').click(function(){
  var x =$(this).index();
  $('.menu span').eq(x).addClass('cur').siblings().removeClass('cur');
});

$('.all').click(function(){
  $('.popView').hide();
  $('.newsList ul > li').css('display','flex');
});

$('.focus').click(function(){
  $('.popView').hide();
  $('.newsList ul > li').hide();
  $('.newsList ul > li.newsFocus').css('display','flex');
});

$('.politics').click(function(){
  $('.popView').hide();
  $('.newsList ul > li').hide();
  $('.newsList ul > li.newsPolitics').css('display','flex');
});

$('.gossiping').click(function(){
  $('.popView').hide();
  $('.newsList ul > li').hide();
  $('.newsList ul > li.newsGossiping').css('display','flex');
});

$('.entertainment').click(function(){
  $('.popView').hide();
  $('.newsList ul > li').hide();
  $('.newsList ul > li.newsEntertainment').css('display','flex');
});

$('.gossiping').click(function(){
  $('.popView').hide();
  $('.newsList ul > li').hide();
  $('.newsList ul > li.newsGossiping').css('display','flex');
});

$('.global').click(function(){
  $('.popView').hide();
  $('.newsList ul > li').hide();
  $('.newsList ul > li.newsGlobal').css('display','flex');
});

$('.finance').click(function(){
  $('.popView').hide();
  $('.newsList ul > li').hide();
  $('.newsList ul > li.newsFinance').css('display','flex');
});

$('.society').click(function(){
  $('.popView').hide();
  $('.newsList ul > li').hide();
  $('.newsList ul > li.newsSociety').css('display','flex');
});

$('.sport').click(function(){
  $('.popView').hide();
  $('.newsList ul > li').hide();
  $('.newsList ul > li.newsSport').css('display','flex');
});

$('.sport').click(function(){
  $('.popView').hide();
  $('.newsList ul > li').hide();
  $('.newsList ul > li.newsSport').css('display','flex');
});


// 跳頁
// $('#newsGroup').on('click','li',function(){
//   var y =$(this).index();
//   var geturl = $('#newsGroup > li').eq(y).find('a').attr("href");
//   console.log(geturl);
//   document.getElementById("popView").src = geturl;
//   $('.popView').css('display','flex');
  
// });

// 複製連結
// $('#newsGroup').on('click','span.newslink',function(){
//   //  alert("aaa");
//   function copyUrl2(){
//     var urlaaa = $('.newsContent > a').attr('href');
//     urlaaa.select(); 
//     document.execCommand("Copy");
//     alert("OK。");
//   }
//   copyUrl2();
// });
