function chText()
{
    var str=document.getElementById("lastname");
    var regex=/[^a-z]/gi;
    str.value=str.value.replace(regex ,"");
}
// 只能输入中文,英文
// function checkChinese(e) {
// 	value = $(e).val();
// 	value = value.replace(/[^\u4e00-\u9fa5]/g,'');
// 	$(e).val(value);
// }

// 只能输入英文,数字
// function checkEnglish(e) {
// 	value = $(e).val();
// 	value = value.replace(/[^A-Za-z0-9]/g,'');
// 	$(e).val(value);
// }