
  var DifferenceHour = -1
  var DifferenceMinute = -1
  var DifferenceSecond = -1
  var Tday = new Date("July 20, 2022 23:59:59") 
  var daysms = 24 * 60 * 60 * 1000
  var hoursms = 60 * 60 * 1000
  var Secondms = 60 * 1000
  var microsecond = 1000

function clock()
{
  var time = new Date()
  var hour = time.getHours()
  var minute = time.getMinutes()
  var second = time.getSeconds()
  var timevalue = ""+((hour > 12) ? hour-12:hour)
  timevalue +=((minute < 10) ? ":0":":")+minute
  timevalue +=((second < 10) ? ":0":":")+second
  timevalue +=((hour >12 ) ? " PM":" AM")
//  document.formnow.now.value = timevalue
  var convertHour = DifferenceHour
  var convertMinute = DifferenceMinute
  var convertSecond = DifferenceSecond
  var Diffms = Tday.getTime() - time.getTime()
  DifferenceHour = Math.floor(Diffms / daysms)
  Diffms -= DifferenceHour * daysms
  DifferenceMinute = Math.floor(Diffms / hoursms)
  Diffms -= DifferenceMinute * hoursms
  DifferenceSecond = Math.floor(Diffms / Secondms)
  Diffms -= DifferenceSecond * Secondms
  var dSecs = Math.floor(Diffms / microsecond)
  if(convertHour != DifferenceHour) document.formnow.dd.value=DifferenceHour
  if(convertMinute != DifferenceMinute) document.formnow.hh.value=DifferenceMinute
  if(convertSecond != DifferenceSecond) document.formnow.mm.value=DifferenceSecond
  document.formnow.ss.value=dSecs
//  document.formnow.Tnow.value= DifferenceHour  DifferenceMinute + DifferenceSecond + dSecs
  setTimeout("clock()",1000)
} 

