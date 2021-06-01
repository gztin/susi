/*
    * startNum  代表要跳動的初始數字
    * targetNum 代表要跳動到的數字
    * time      代表要跳動需要花費的時間
    * selector  代表要跳動元素的選擇器
    */
const $setJumpNumber = (startNum, targetNum, time = 1, selector) => {
	let dom = document.querySelector(selector);
	let originNum = startNum;
	let stepNum = 0;
	let timeNum = time; 
	dom.innerHTML = startNum;

	let timeId = setInterval(() => {
	  if (originNum < targetNum) {
		timeNum -= 0.001;
		let strNum = originNum.toString();
		// 數字比較少的時候直接用 + 1; 數字很大直接 +1 要很久才能調到最對應的數字，所有後三位數隨機跳動的方式進行模擬生成
		if (targetNum.toString().length < 6) {
		  stepNum += 1; // 這樣纔可以實現越跳越快的效果
		  originNum = originNum +","+ stepNum;
		  dom.innerHTML = originNum;
		} else {
		  stepNum += 500; // 這樣纔可以實現越跳越快的效果
		  originNum = originNum + stepNum;
		  dom.innerHTML = strNum.substr(0, strNum.length - 3) + Math.floor(Math.random()*10) + Math.floor(Math.random()*10) + Math.floor(Math.random()*10);
		}
	  } else {
		dom.innerHTML = targetNum;
		clearInterval(timeId);
	  }
	}, timeNum);
  };

  function start () {
	$setJumpNumber(11, 218983423, 1, 'h1');
  };
  