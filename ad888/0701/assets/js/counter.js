$(function(){
	var community={
		el:$(".community"),
		max:"14331",
		start:13500//增加开始的初始值
	}
	var device={
		el:$(".device"),
		max:"18027",
		start:17800//减少到最小的值
	}
	var family={
		el:$(".family"),
		max:"550649",
		start:550100//减少到最小的值
	}
	up01(community);
	up02(device);
	up03(family);
});
function up01(community){
	let item=community.el;
	let num=community.max;
	let start=community.start;
	time1=setInterval(function(){
		start++;
		if(start>num){
			start=num;
			clearInterval(time1);
		}
		item.text(start)
	},1);
}
function up02(device){
	let item=device.el;
	let num=device.max;
	let start=device.start;
	time2=setInterval(function(){
		start++;
		if(start>num){
			start=num;
			clearInterval(time2);
		}
		item.text(start);
	},1)
}
function up03(family){
	let item=family.el;
	let num=family.max;
	let start=family.start;
	time3=setInterval(function(){
		start++;
		if(start>num){
			start=num;
			clearInterval(time3);
		}
		item.text(start);
	},1)
}

  
	//   降低
	// function down(obj){
	// 	let item=obj.el;
	// 	let num=obj.max;
	// 	let min=obj.end;
	// 	time1=setInterval(function(){
	// 	num--;
	// 	if(num<min){
	// 		num=min;
	// 		clearInterval(time1)
	// 	}
	// 	item.text(num)
	// 	},1)
	// }