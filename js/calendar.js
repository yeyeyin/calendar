//农历y年的总天数
function lYearDays(y) {
   var i, sum = 348;
   for(i=0x8000; i>0x8; i>>=1) sum += (lunarInfo[y-1900] & i)? 1: 0;
   return(sum+leapDays(y));
}

//农历y年闰月的天数
function leapDays(y) {
   if(leapMonth(y))  return((lunarInfo[y-1900] & 0x10000)? 30: 29);
   else return(0);
}

//农历y年闰哪个月 1-12 , 没闰返回 0
function leapMonth(y) {
   return(lunarInfo[y-1900] & 0xf);
}

//农历 y年m月的总天数
function monthDays(y,m) {
   return( (lunarInfo[y-1900] & (0x10000>>m))? 30: 29 );
}


//农历计算，传入公历日期对象，返回农历日期对象
function Lunar(objDate) {							
	var m = "";
	var i, leap=0, temp=0;// 属性有 .year .month .day .isLeap .yearCyl .dayCyl .monCyl
	var baseDate = new Date(1900,0,31);//返回基础时间1900年1月31日
	var offset   = Math.floor((objDate.getTime() + 2206425600000)/86400000);//86400000=1000ms*60s*60min*24h
	m += "objDate="+objDate.getTime()+", new Date(1900,0,31)="+baseDate.getTime();
	m += "offset="+offset;   
	this.dayCyl = offset + 40;
	this.monCyl = 14;
   	for(i=1900; i<2050 && offset>0; i++) {
		temp = lYearDays(i);//返回农历总天数
		offset -= temp;
		this.monCyl += 12;
    }
   
	if(offset<0) {
		offset += temp;
		i--;
		this.monCyl -= 12;
	}

	this.year = i;
	this.yearCyl = i-1864;
	leap = leapMonth(i);//闰哪个月
	this.isLeap = false;

	for(i=1; i<13 && offset>0; i++) {
		//闰月
		if(leap>0 && i==(leap+1) && this.isLeap==false){
			--i; this.isLeap = true; temp = leapDays(this.year); 
		}else { 
			temp = monthDays(this.year, i); 
		}

		//解除闰月
		if(this.isLeap==true && i==(leap+1)) {
			this.isLeap = false;
		}

		offset -= temp;
		if(this.isLeap == false) {
			this.monCyl ++;
		}
	}

	if(offset==0 && leap>0 && i==leap+1)
		if(this.isLeap){ 
			this.isLeap = false; 
		}else{ 
			this.isLeap = true; --i; --this.monCyl;
		}

		if(offset<0){ 
			offset += temp; --i; --this.monCyl; 
		}

	this.month = i;
	this.day = offset + 1;

	m += "\noffset="+offset+", year="+this.year+", yearCyl="+this.yearCyl+", month="+this.month+",\n monthCyl="+this.monthCyl+", day="+this.day+", dayCyl="+this.dayCyl;
}

//公历y年m+1月的天数
function solarDays(y,m) {     
   if(m==1)
      return(((y%4 == 0) && (y%100 != 0) || (y%400 == 0))? 29: 28);
   else
      return(solarMonth[m]); //只有公历要判断闰平年，阴历2月都是29天。如果是2月，判断闰年否，否则从数组里获取该月的天数 
}

//农历年份 十二地支
function cyclical(num) {
   return(Gan[num%10]+Zhi[num%12]);
}

//属性声明
function calElement(sYear,sMonth,sDay,week,lYear,lMonth,lDay,isLeap,cYear,cMonth,cDay) {

      this.isToday    = false;
      this.sYear      = sYear;
      this.sMonth     = sMonth;
      this.sDay       = sDay;
      this.week       = week;
      this.lYear      = lYear;
      this.lMonth     = lMonth;
      this.lDay       = lDay;
      this.isLeap     = isLeap;
      this.cYear      = cYear;
      this.cMonth     = cMonth;
      this.cDay       = cDay;
      this.color      = '';
      this.lunarFestival = '';
      this.solarFestival = '';
      this.solarTerms    = '';

}


//二十四节气
function sTerm(y,n) {
   var offDate = new Date( ( 31556925974.7*(y-1900) + sTermInfo[n]*60000  ) -2208549300000 );
   return(offDate.getUTCDate());
}

//阳历对象（y年，m+1月），因为Date对象中，月份从0开始数
function calendar(y,m) { //传入年、月
	var sDObj, lDObj, lY, lM, lD=1, lL, lX=0, tmp1, tmp2;
	var lDPOS = new Array(3);
	var n = 0;
	var firstLM = 0;
	sDObj = new Date(y,m,1); //创建了日期对象，传入了年、月及该月的1号	     
	this.length    = solarDays(y,m);//阳历当月的天数
    this.firstWeek = sDObj.getDay();//getDay  返回日期中星期的星期几
	for(var i=0;i<this.length;i++) {	  
		if(lD>lX) {
			sDObj = new Date(y,m,i+1);//当月一日日期
			lDObj = new Lunar(sDObj);	//返回对应公历该年月的农历对象					
			lY    = lDObj.year;         //农历对象的年月日等属性
			lM    = lDObj.month;
			lD    = lDObj.day;
			lL    = lDObj.isLeap;//是否闰月
			lX    = lL? leapDays(lY): monthDays(lY,lM);//农历当月最后一天	       
			if(n==0) firstLM = lM;
			lDPOS[n++] = i-lD+1;
	  	}
		this[i] = new calElement(y, m+1, i+1, nStr1[(i+this.firstWeek)%7],lY, lM, lD++, lL,cyclical(lDObj.yearCyl) ,cyclical(lDObj.monCyl), cyclical(lDObj.dayCyl++) );	  
		if((i+this.firstWeek)%7==0)   this[i].color = '#ff5f07';//周日颜色
		if((i+this.firstWeek)%7==6) this[i].color = '#ff5f07';//周六颜色
    }
	//节气
		tmp1=sTerm(y,m*2  )-1;
		tmp2=sTerm(y,m*2+1)-1;
		this[tmp1].solarTerms = solarTerm[m*2];
	    this[tmp2].solarTerms = solarTerm[m*2+1];
		if(m==3) this[tmp1].color = '#ff5f07';//清明颜色
	//公历节日
		for(i in sFtv)
			if(sFtv[i].match(/^(\d{2})(\d{2})([\s\*])(.+)$/)) 
				if(Number(RegExp.$1)==(m+1)) {
					this[Number(RegExp.$2)-1].solarFestival += RegExp.$4 + ' ';
					if(RegExp.$3=='*') this[Number(RegExp.$2)-1].color = '#ff5f07';
		       		}
 	//月周节日
		for(i in wFtv)
			if(wFtv[i].match(/^(\d{2})(\d)(\d)([\s\*])(.+)$/))
				if(Number(RegExp.$1)==(m+1)) {
					tmp1=Number(RegExp.$2);
					tmp2=Number(RegExp.$3);
					this[((this.firstWeek>tmp2)?7:0) + 7*(tmp1-1) + tmp2 - this.firstWeek].solarFestival += RegExp.$5 + ' ';
		       		}
	//农历节日
		for(i in lFtv) 
			if(lFtv[i].match(/^(\d{2})(.{2})([\s\*])(.+)$/)) {
				tmp1=Number(RegExp.$1)-firstLM;
				if(tmp1==-11) tmp1=1;
				if(tmp1 >=0 && tmp1<n) {
					tmp2 = lDPOS[tmp1] + Number(RegExp.$2) -1;
					if( tmp2 >= 0 && tmp2<this.length) {           
						this[tmp2].lunarFestival += RegExp.$4 + ' ';
						if(RegExp.$3=='*') this[tmp2].color = '#ff5f07';
					}
				}
	  		}
	//黑色星期五
		if((this.firstWeek+12)%7==5)
			this[12].solarFestival += '黑色星期五 ';
	//今日
		if(y==tY && m==tM) {
			this[tD-1].isToday = true;
		}
}


//农历的显示样式
function cDay(d){
	var s;
	switch (d) {
		case 10:
			s = '初十'; 
			break;
		case 20:
			s = '二十'; 
			break;
		case 30:
			s = '三十';
			break;
		default :
			s = nStr2[Math.floor(d/10)];
			s += nStr1[d%10];
	}
	return(s);
}


//绘制日历	
function drawCld(SY,SM) {   //传入了当前的年份月份
        
	var i,sD,s,size;
	cld = new calendar(SY,SM);
	
	//动态写入农历信息
	document.getElementById("cn_year").innerHTML = '&nbsp;&nbsp;农历' + cyclical(SY-1900+36) + '年 &nbsp;【'+Animals[(SY-4)%12]+'】';
	
	//遍历具体填充日期的id   如：sd0，即为日期部分坐标（1,1） 42=6*7
	for(i=1;i<43;i++) {	  
		sObj = document.getElementById('d'+i+'_gre');//阳历
		lObj = document.getElementById('d'+i+'_cn');//阴历
		sObj.style.background = '';
	  	lObj.style.background = '';	  
		sD = i-1 - cld.firstWeek;  //该月份1号的星期
		//日期内	  
		if(sD>-1 && sD<cld.length) {        
			sObj.innerHTML = sD+1;
			//设置今天的背景色
			if(cld[sD].isToday){				
				sObj.style.background = '#ffc5da';
			}
			//国定假日颜色
			sObj.style.color = cld[sD].color; 
	        //显示农历月
			if(cld[sD].lDay==1)
				lObj.innerHTML = '<b>'+(cld[sD].isLeap?'闰':'') 
					+ cld[sD].lMonth + '月' 
					+ (monthDays(cld[sD].lYear,cld[sD].lMonth)==29?'小':'大')+'</b>';
			else//显示农历日
		    	lObj.innerHTML = cDay(cld[sD].lDay);
	       
			s=cld[sD].lunarFestival;
			if(s.length>0) {
				//农历节日
				//农历节日名称大于5个字截去
				if(s.length>7) s = s.substr(0, 5)+'…';
				s = s.fontcolor('#ff5f07');
			}
			else {
				//公历节日
				s=cld[sD].solarFestival;
				if(s.length>0) {
					//阳历节日名称截去			
					size = (s.charCodeAt(0)>0 && s.charCodeAt(0)<128)?9:5;
			 		if(s.length>size+1) s = s.substr(0, size-1)+'…';
					s = s.fontcolor('#0168ea');
				}
				else {
					//廿四节气
					s=cld[sD].solarTerms;
					if(s.length>0) s = s.fontcolor('#44d7cf');
				}
			}

			if(s.length>0) lObj.innerHTML = s;
		}
		else {
			sObj.innerHTML = ' ';
			lObj.innerHTML = ' ';
		}
    }
}


//年份下拉表
function changeCld() {
	var y,m;
	y = document.getElementById("changeYear").selectedIndex + 1900;
	m = document.getElementById("changeMonth").selectedIndex;
    drawCld(y,m);
}


//年份加减变化
function pushBtm(K) {
	switch (K){
		case 'YU' :
			if(document.getElementById("changeYear").selectedIndex > 0)
			       	document.getElementById("changeYear").selectedIndex--;
			break;
		case 'YD' :
			if(document.getElementById("changeYear").selectedIndex < 149) 
				document.getElementById("changeYear").selectedIndex++;
	       		break;
		case 'MU' :
			if(document.getElementById("changeMonth").selectedIndex > 0) {      
				document.getElementById("changeMonth").selectedIndex--;
			}
			else {
				document.getElementById("changeMonth").selectedIndex = 11;
				if(document.getElementById("changeYear").selectedIndex > 0) 
					document.getElementById("changeYear").selectedIndex--;
			}
			break;
		case 'MD' :
			if(document.getElementById("changeMonth").selectedIndex < 11) {
				document.getElementById("changeMonth").selectedIndex++;
			}
			else {
				document.getElementById("changeMonth").selectedIndex = 0;
				if(document.getElementById("changeYear").selectedIndex < 149) 
					document.getElementById("changeYear").selectedIndex++;
			}
			break;
		default :
			document.getElementById("changeYear").selectedIndex = tY - 1900;
			document.getElementById("changeMonth").selectedIndex = tM;
	}
	changeCld();
}

var Today = new Date();
var tY = Today.getFullYear();//当前日期的具体值
var tM = Today.getMonth();
var tD = Today.getDate();


//保存添加备注日期信息
function todayNote(v) {
	var sObj = document.getElementById('d'+ v+'_gre');
	var d = sObj.innerHTML - 1;
	if( sObj.innerHTML != '' ) {
		var datedetails = cld[d].sYear +'.'+ cld[d].sMonth
		+ '.'+cld[d].sDay +'：';
		console.log(datedetails);
		localStorage.setItem("timemessage",datedetails);
	} 
}

//查看备注表
function note() {
	window.open('note.html');
}

//界面初始化
function initial() {
	document.getElementById("changeYear").selectedIndex=tY-1900;//设置或返回下拉列表中被选选项的索引号  1910年的索引为10
	document.getElementById("changeMonth").selectedIndex=tM;
	drawCld(tY,tM);	//传入当前年份月份
}

