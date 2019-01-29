$(document).ready(function(){
	if (jQuery.browser.mobile == false){
		init();	
	} else {
		initMobile();
	}
});

function initMobile(){
	//alert("initMobile");
	$("#inner").css('position','static');
	$("#wrapper").css('position','static');	

	$("#mubox,#inner").localScroll({
		//target: '#wrapper', // could be a selector or a jQuery object too.
		queue:true,
		//duration:1000,
		hash:true,
		onBefore:function( e, anchor, $target ){
			// The 'this' is the settings object, can be modified
			
			//special hack
			$('#device').css('height', '1px');
		},
		onAfter:function( anchor, settings ){
			// The 'this' contains the scrolled element (#content)

			//special hack
			$('#device').css('height', '0px');
			
			//changeMenuClass(anchor.id);
		}
	});

	initMenuSwitch();
	scrollEnd();
	sliderinit();
	dotdown();
	$("#slider").height(460);
}

function init(){	
	$(".ui-loader").hide();
	$("#wrapper").css('height',$("#inner").height()); // $("#wrapper")沒給高scrollbar消失
	
	var $window = $(window), $inner = $('#inner'), $parallex = $('.parallex');	
	var buffer = 1440;	

	$(window).scroll(function() {
		var scrollPos = $(this).scrollTop(); // $(window) scroll隱藏的像素
		$inner.css('top', - scrollPos);				
		activeEvent(scrollPos); // other actions
		
		$parallex.each(function(j) {

			var $section = $(this).parents('.mainbox');
			var start = $section.position().top; 
			var sectionHeight = $section.height();
			//section相對於inner的y ex.section2=>740 (position: 此元素相對父元素的位移)； 在此每個section的start不變	

			//不同速度移動
			if ((start - buffer <= scrollPos && scrollPos <= start + sectionHeight)) {
		         $(this).children().each(function(i) {  //section 底下全部的div； i從0開始
	          		var $this = $(this);	          		
	          		var initialTop, delta = scrollPos - start, distance = this.getAttribute('data-parallex-distance');		          	
					if(distance == null){
						return; // 等於continue
					}
		          	//delta=>window到section的距離
		          	if ($.data(this, 'initialTop') === undefined) {
		          		$.data(this, 'initialTop', $this.position().top); //初始div相對於section的y
			            if (i > 0) { //無法理解ex.session2 i=2 , 80 - (1440 * (1 - 1/4)) = -1000 不知作用為何？
			              $this.css('top', $this.position().top - (distance === '0' ? 0 : buffer * (1 - 1 / distance)));
			            }
		          	}
		          	initialTop = $this.data('initialTop');
		          	//計算偷跑的距離

		          	//if(j == 5){
		          	//$("#test").append(distance+'<br>');
		          	//$("#test").append(dis+'<br>');
		          	//$("#test").append(initialTop+'/'+delta+'/'+distance+'/'+ (initialTop +(delta - (delta / distance))) +'<br>');
		          	//$("#test").append(initialTop+'/'+delta+'/'+distance+'/'+ (initialTop +(delta)) +'<br>');
		          	//$("#test").append(initialTop + (delta - (distance === '0' ? 0 : delta / distance)) +'<br>');
		          	//}		          			          	

		          	$this.stop().animate({'top': initialTop + (delta - (distance === '0' ? 0 : delta / distance))}, 0);
		          	//$this.css('top', initialTop + (delta - (distance === '0' ? 0 : delta / distance)));
				});
			}
		});
	});

	
	$("#mubox, #inner").localScroll({hash : true});
	
	initMenuSwitch();
	scrollEnd();
	sliderinit();
	dotdown();
	$("#slider").height(640);
}

var menuOpen = false;
function initMenuSwitch(){
	
	var tap = ("ontouchstart" in document.documentElement);	
	//alert("tap : " + tap);
	if(tap == true){
		$("#mubox").bind('touchstart', function(){
			$(this).stop().animate({right:0}, 100);
		});
		$("#mubox").bind('touchmove', function(){
			$(this).stop().animate({right:-130}, 100);
			$("#wrap_welcome").hide();
			$("#wrap_news").hide();
			$("#wrap_about").hide();
			$("#wrap_dishes").hide();
			$("#wrap_service").hide();
			$("#wrap_location").hide();
		});		
	}else{
		if (jQuery.browser.mobile == false){
		   $("#mubox").hover( function(){
			  $(this).stop().animate({right:0}, 100);
		   },
		   function(){
			  $(this).stop().animate({right:-130}, 100);
		   });
		}
	}
}

//滾動停止 改變menu class
function scrollEnd(){
	$(window).bind('scrollstop', function(){
		//var wHeight = $(this).height()/3;
		var scrolltop = $(this).scrollTop();
		$(".mainbox.idx").each(function() {
      		var $area = $(this);
      		var mustart = $area.position().top;
      		var menumark = this.getAttribute('menumark');
      		var muend;
        	var $li = $('#li_'+ $area.attr('id'));
        	if(menumark == 'cat'){
        		muend = mustart + $area.height();
        	} else {
        		muend = mustart + $area.height() + $area.next().height();
        	}
      		
      		if (mustart <= scrolltop && scrolltop < muend) {
        		if (!$li.hasClass('active')){ $li.addClass('active'); }
      		} else {
        		$li.removeClass('active');
      		}
    	});
	});	
}


//for localScroll 目前沒使用
function changeMenuClass(anchorid){
	var id;
	if('ct' == anchorid.split("_")[1]){
		id = anchorid.split("_")[0];
	} else {
		id = anchorid;
	}

	$("[id^=li_]").removeClass('active');
	$("#li_"+id).addClass('active');	
}


function sliderinit(){
	$("#slider").easySlider({
		speed: 550,
		auto: false,
		continuous: true, //重播
		pause: 3000,
		moveSlideQty: -1,
		numeric: true
	});
	
	$("#slider2").easySlider({
		speed:550,
		auto: true,
		continuous: true,
		pause: 3000,		
		numeric: true,
		numericId: 's2controls'
	});	
	//News
	$('#slider3').bxSlider({
		auto: false,    
		pager: true,
		displaySlideQty: 3,
    	moveSlideQty: 0,
    	speed: 550
    });
	$('#slider4').bxSlider({
		auto: true,    
		pager: true,
		displaySlideQty: 5,
    	moveSlideQty: 1,
    	speed: 550
    });
	
	$('#stuffbxslider').bxSlider({
		auto: true,    
		pager: true,
		displaySlideQty: 5,
    	moveSlideQty: 1,
    	speed: 550
    });
}

function dotdown(){
	/*
	$("#dotdown1").animate({opacity:0, top:-50},0).delay(3000).animate({opacity:0.7, top:-50},0);
	for(var i=0; i<4; i++){
		$("#dotdown1").animate({opacity:0.2,top:-30},600).animate({opacity:0.7,top:-50},600);
	}
	$("#dotdown1").animate({opacity:0,top:-30},600);
	
	$("#dotdown2").animate({opacity:0, top:-50},0).delay(3000).animate({opacity:0.7, top:-50},0);
	for(var i=0; i<4; i++){
		$("#dotdown2").animate({opacity:0.2,top:-30},600).animate({opacity:0.7,top:-50},600);
	}
	$("#dotdown2").animate({opacity:0,top:-30},600);
	
	$("#dotdown3").animate({opacity:0, top:-50},0).delay(3000).animate({opacity:0.7, top:-50},0);
	for(var i=0; i<4; i++){
		$("#dotdown3").animate({opacity:0.2,top:-30},600).animate({opacity:0.7,top:-50},600);
	}
	$("#dotdown3").animate({opacity:0,top:-30},600);
	
	$("#dotdown4").animate({opacity:0, top:-30},0).delay(3000).animate({opacity:0.7, top:-30},0);
	for(var i=0; i<4; i++){
		$("#dotdown4").animate({opacity:0.2,top:-15},600).animate({opacity:0.7,top:-30},600);
	}
	$("#dotdown4").animate({opacity:0,top:-15},600);
	
	$("#dotdown5").animate({opacity:0, top:-30},0).delay(3000).animate({opacity:0.7, top:-30},0);
	for(var i=0; i<4; i++){
		$("#dotdown5").animate({opacity:0.2,top:-15},600).animate({opacity:0.7,top:-30},600);
	}
	$("#dotdown5").animate({opacity:0,top:-15},600);
	
	$("#dotdown6").animate({opacity:0, top:265},0).delay(3000).animate({opacity:0.7, top:265},0);
	for(var i=0; i<4; i++){
		$("#dotdown6").animate({opacity:0.2,top:240},600).animate({opacity:0.7,top:265},600);
	}
	$("#dotdown6").animate({opacity:0,top:240},600);
	*/
}

function activeEvent(scrollPos) {
	if (scrollPos > 13033 && scrollPos < 15590){
		fadinFadout(scrollPos);
	}
	return false;
}
