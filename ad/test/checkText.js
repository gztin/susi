// 只能输入中文,英文
function checkChinese(e) {
	value = $(e).val();
	value = value.replace(/[^\u4E00-\u9FA5A-Za-z]/g,'');
	$(e).val(value);
}

// 只能输入英文,数字
// function checkEnglish(e) {
// 	value = $(e).val();
// 	value = value.replace(/[^A-Za-z0-9]/g,'');
// 	$(e).val(value);
// }