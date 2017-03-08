// vue 结果页
// 
 /*养老保险（endowment insurance）
医疗保险（medical insurance）
失业保险（unemployment insurance）
工伤保险（employment injury insurance）
生育保险（maternity insurance）
住房公积金（Housing Provident Fund）*/
var utils = {
    getUrlArgs: function() {
        //取得查询字符串并去掉开头的问号
        var qs = (location.search.length > 0 ? location.search.substring(1) : ""),
            //保存数据的对象
            args = {},
            //取得每一项
            items = qs.length ? qs.split("&") : [],
            item = null,
            name = null,
            value = null,
            //在 for 循环中使用
            i = 0,
            len = items.length;
        //逐个将每一项添加到 args 对象中
        for (i = 0; i < len; i++) {
            item = items[i].split("=");
            name = decodeURI(item[0]);
            value = decodeURI(item[1]);
            if (name.length) {
                args[name] = value;
            }
        }
        return args;
    },
    //获取金额乘以百分比
    moneyMulPercent: function(salary, percent) {
        if (isNaN(salary) || salary == "0") {
            return 0;
        }
        if (typeof percent != "undefined" && typeof salary != "undefined") {
            var __percent = percent.replace("%", "");
            __percent = __percent / 100;
            var __num = salary * __percent;
            return parseFloat(__num).toFixed(2);
        }
        return 0;
    },
    //比较是否超过范围，获得最终社保&公积金基数
    getSocHosBase: function(salary, min, max) {
        switch (true) {
            case parseFloat(salary) < parseFloat(min):
                return min;
            case parseFloat(salary) > parseFloat(max):
                return max;
            default:
                return salary;
        }
    },
    // 计算百分比
    getPercentage: function(numerator, denominator) {
        return parseFloat(numerator * 100 / denominator).toFixed(2) + "%";
    },

    //计算个人所得税
    personIncomeTax: function(money) {
        var imoney = parseFloat(money);
        var __money = imoney;
        switch (true) {
            case imoney <= 1500:
                __money = __money * 0.03;
                break;
            case imoney > 1500 && imoney <= 4500:
                __money = __money * 0.1 - 105;
                break;
            case imoney > 4500 && imoney <= 9000:
                __money = __money * 0.2 - 555;
                break;
            case imoney > 9000 && imoney <= 35000:
                __money = __money * 0.25 - 1005;
                break;
            case imoney > 35000 && imoney <= 55000:
                __money = __money * 0.3 - 2755;
                break;
            case imoney > 55000 && imoney <= 80000:
                __money = __money * 0.35 - 5505;
                break;
            case imoney > 80000:
                __money = __money * 0.45 - 13505;
                break;
        }
        return parseFloat(__money).toFixed(2);
    },

    //获取年终奖个人所得税和最终年终奖
    yearEndObj: function(yearEnd, salary) {
        if (yearEnd && salary && !isNaN(yearEnd) && !isNaN(salary)) {
            var __yearEnd = parseFloat(yearEnd);
            var __salary = parseFloat(salary);
            var __tax = 0;
            switch (true) {
                case __salary >= 3500:
                    __tax = utils.personIncomeTax(__yearEnd);
                    break;
                case __salary < 3500:
                    __tax = utils.personIncomeTax(__yearEnd + __salary - 3500);
                    break;
            }
            return {
                "money": parseFloat(__yearEnd - __tax).toFixed(2),
                "tax": __tax
            }
        }
        return {
            "money": 0,
            "tax": 0
        };
    },
    //注意 obj的数据格式
    creatCanvas: function(id, obj) {
        var arr = [];
        obj.arr.map(function(v, i) {
            arr[i] = parseFloat(v.num)
        })
        var oG = document.getElementById(id);
        if (oG.getContext) {
            var lens = arr.length,
                arrRadian = [],
                arrColors = [],
                results = parseFloat(arr[0]),
                cx = 92,
                cy = 92,
                cr = 68,
                crw = 40;
            for (var i = 0; i < lens; i++) {
                if (i > 0) {
                    arrRadian.push((results * 3.6 + 270) * Math.PI / 180);
                    results = results + parseFloat(arr[i]);
                }
            }
            arrRadian.unshift(270 * Math.PI / 180);
            arrRadian.push(630 * Math.PI / 180);
            arrColors = ["#7DB0EF", "#FF7171", "#FFAE72", "#68C9BF"];
            //循环绘图
            var oGc = oG.getContext('2d');
            for (var i = 0; i < lens; i++) {
                oGc.beginPath();
                oGc.strokeStyle = arrColors[i]; //边框颜色
                oGc.lineWidth = crw; //边框宽度
                oGc.arc(cx, cy, cr, arrRadian[i], arrRadian[i + 1], false);
                oGc.stroke();
            }
        }
    }
};

var __userData=utils.getUrlArgs();
//大于600 才执行渲染
if(parseFloat(__userData.salary)>=600){

//空的 Vue 实例作为中央事件总线：
var bus= new Vue();
var vm_salsry = new Vue({
    el: "#result",
    data: {
        userData: __userData,
        defConfg: ___jsonCityConfig[__userData.city]
    },
    computed: {
        tabindex: function() {
            return this.userData.tabindex == "0" ? true : false;
        },
        classObject:function(){
          return {
          	 bgActive: !this.tabindex
          }
        },
        userRadix: function() {
            //获取用户公积金&&社保基数，用户不输入下取默认值，否则取用户输入值
            return {
                house: this.userData.house ? this.userData.house : this.userData.salary,
                social: this.userData.social ? this.userData.social : this.userData.salary,
            }
        },
        finalRadix: function() {
            //根据每个城市规定，获取最终的公积金&&社保基数
            return {
                house: utils.getSocHosBase(this.userRadix.house, this.defConfg.houseNum.min, this.defConfg.houseNum.max),
                social: utils.getSocHosBase(this.userRadix.social, this.defConfg.socialNum.min, this.defConfg.socialNum.max)
            }
        },
        housing: function() {
            // 住房公积金所有
            return {
                name: "住房公积金",
                perCoef: this.userData.percoef,
                comCoef: this.defConfg.housing.company,
                perMoney: utils.moneyMulPercent(this.finalRadix.house, this.userData.percoef),
                comMoney: utils.moneyMulPercent(this.finalRadix.house, this.defConfg.housing.company)
            }
        },
        "endowment": function() {
            return {
                name: "养老保险",
                perCoef: this.defConfg.endowment.person,
                comCoef: this.defConfg.endowment.company,
                perMoney: utils.moneyMulPercent(this.finalRadix.social, this.defConfg.endowment.person),
                comMoney: utils.moneyMulPercent(this.finalRadix.social, this.defConfg.endowment.company)
            }

        },
        medical: function() {
            return {
                name: "医疗保险",
                perCoef: this.defConfg.medical.person,
                comCoef: this.defConfg.medical.company,
                perMoney: utils.moneyMulPercent(this.finalRadix.social, this.defConfg.medical.person),
                comMoney: utils.moneyMulPercent(this.finalRadix.social, this.defConfg.medical.company)
            }
        },
        unemployment: function() {
            return {
                name: "失业保险",
                perCoef: this.defConfg.unemployment.person,
                comCoef: this.defConfg.unemployment.company,
                perMoney: utils.moneyMulPercent(this.finalRadix.social, this.defConfg.unemployment.person),
                comMoney: utils.moneyMulPercent(this.finalRadix.social, this.defConfg.unemployment.company)
            }
        },
        injury: function() {
            return {
                name: "工伤保险",
                perCoef: 0,
                comCoef: this.defConfg.injury.company,
                perMoney: 0,
                comMoney: utils.moneyMulPercent(this.finalRadix.social, this.defConfg.injury.company)
            }
        },
        maternity: function() {
            return {
                name: "生育保险",
                perCoef: 0,
                comCoef: this.defConfg.maternity.company,
                perMoney: 0,
                comMoney: utils.moneyMulPercent(this.finalRadix.social, this.defConfg.maternity.company)
            }
        },
        personSocialTotal: function() {
            return {
                name: "社会保险",
                perMoney: (parseFloat(this.endowment.perMoney) + parseFloat(this.medical.perMoney) + parseFloat(this.unemployment.perMoney)).toFixed(2)
            }
        },
        personIncomeTax: function() {
            var per_hand_money = parseFloat(this.userData.salary) - parseFloat(this.housing.perMoney) - parseFloat(this.personSocialTotal.perMoney) - 3500;
            var per_need_tax = per_hand_money > 0 ? per_hand_money.toFixed(2) : 0;
            return {
                name: "个人所得税",
                perMoney: utils.personIncomeTax(per_need_tax)
            }
        },
        previewList: function() {
            return {
                arr: [
                    this.personIncomeTax,
                    this.housing,
                    this.personSocialTotal
                ]
            }
        },
        finalSalary: function() {
            return (parseFloat(this.userData.salary) - parseFloat(this.personIncomeTax.perMoney) - parseFloat(this.housing.perMoney) - parseFloat(this.personSocialTotal.perMoney)).toFixed(2)
        },
        diagramList: function() {
            var percent_house = utils.getPercentage(this.housing.perMoney, this.userData.salary);
            var percent_tax = utils.getPercentage(this.personIncomeTax.perMoney, this.userData.salary);
            var percent_social = utils.getPercentage(this.personSocialTotal.perMoney, this.userData.salary);
            var percent_salary = (100 - parseFloat(percent_house) - parseFloat(percent_tax) - parseFloat(percent_social)).toFixed(2) + "%";
            return {
                arr: [
                    { text: "税后工资剩余", color: "blues", num: percent_salary },
                    { text: "住房公积金", color: "reds", num: percent_house },
                    { text: "个人所得税", color: "yellows", num: percent_tax },
                    { text: "社会保险", color: "greens", num: percent_social }

                ]
            }
        },
        detailList: function() {
            return {
                arr: [
                    this.housing,
                    this.endowment,
                    this.medical,
                    this.unemployment,
                    this.injury,
                    this.maternity
                ]
            }
        },
        yearEndMoney: function() {
            var __yearEnd = utils.yearEndObj(this.userData.yearend, this.userData.salary);
            return {
                name: "税后年终奖",
                perMoney: __yearEnd.money
            }
        },
        yearEndPersonIncomeTax: function() {
            var __yearEnd = utils.yearEndObj(this.userData.yearend, this.userData.salary);
            return {
                name: "个人所得税",
                perMoney: __yearEnd.tax
            }
        },
        yearEndPreviewList: function() {
            return {
                arr: [
                    this.yearEndMoney,
                    this.yearEndPersonIncomeTax
                ]
            }
        },
        diagramListYearEnd: function() {
            var percent_yearend = utils.getPercentage(this.yearEndMoney.perMoney, this.userData.yearend);
            var percent_tax = (100 - parseFloat(percent_yearend)).toFixed(2) + "%";
            return {
                arr: [
                    { text: "税后年终奖", color: "blues", num: percent_yearend },
                    { text: "个人所得税", color: "reds", num: percent_tax },
                ]
            }
        }
    },
    components: {
        "preview-element": {
            props: ['mySalary', 'myPreview'],
            template: '<div class="pretop">\
	 	<div class="title"><span>税后月薪</span><em @click="showInfo"><i>?</i></em></div>\
	 	<p>￥{{mySalary}}</p></div>\
	 	<ul class="prebtm">\
		 	<li v-for="key in myPreview.arr">\
			 	<div>{{key.name}}</div>\
			 	<p>{{key.perMoney}}</p>\
		 	</li>\
	 	</ul>',
         methods:{
            showInfo:function(){
                    //和兄弟组件浮层通信，$emit：触发事件
                    bus.$emit('wrap-show')
                }
         }
        },
        "diagram-element": {
            props: ['myDiagram'],
            template: '<canvas id="canv" width="184" height="184"></canvas><ul class="captions"><li v-for="key in myDiagram.arr"><span><i :class="key.color"></i>{{key.text}}</span><em>{{key.num}}</em></li></ul>',
            ready: function() {
                this.drawing()
            },
            watch: {
                myDiagram: function() {
                    this.drawing()
                }
            },
            methods: {
                drawing: function() {
                    utils.creatCanvas("canv", this.myDiagram)
                }
            }

        },
        "detail-element": {
            props: ['myDetail'],
            template: '<div class="title">工资明细</div><ul><li><em v-for="val in titles">{{val}}</em></li><li v-for="key in myDetail.arr"><em>{{key.name}}</em><template v-if="key.perMoney"><em><b>{{key.perMoney}}</b><i>({{key.perCoef}})</i></em></template><template v-else><em><span>/</span></em></template><em><b>{{key.comMoney}}</b><i>({{key.comCoef}})</i></em></li><li><em v-for="val in totals()">{{val}}</em></li></ul>',
            data: function() {

                return {
                    titles: ["类型", "个人缴纳(元)", "公司缴纳(元)"]
                }
            },

            methods: {
                totals: function() {
                    var nums = this.myDetail.arr;
                    var tolPerMoney = 0,
                        tolComMoney = 0;
                    for (key in nums) {
                        tolPerMoney += parseFloat(nums[key].perMoney);
                        tolComMoney += parseFloat(nums[key].comMoney);
                    }
                    return ["总计", parseFloat(tolPerMoney).toFixed(2), parseFloat(tolComMoney).toFixed(2)]

                }
            }
        },
        "yearend-preview-element": {
            props: ['myPreview'],
            template: '<ul>\
     	<li v-for="key in myPreview.arr">\
	     	<h4>{{key.name}}</h4>\
	     	<p>￥{{key.perMoney}}</p>\
     	</li>\
     	</ul>'
        },
        "info-wrap-element":{
        template:'<div v-show="infoShow" class="info_wrap">\
                <h3>{{infoHead}}</h3>\
                <h4>{{infoTitle}}</h4>\
                <div class="info_cont">\
                <p v-for="val in infoCont">{{val}}</p>\
                </div>\
                <h4>{{infoFujian}}</h4>\
                <div class="info_excel"><ul>\
                <li v-for="key in infoList"><em v-for="arr in key">{{arr}}</em></li>\
                </ul></div><i @click="hideWrap"></i></div>',
        data:function(){
           return {
             infoShow:false,
             infoHead:'个人所得税怎么计算',
             infoTitle:'个税计算公式',
             infoCont:["个税 = 应纳税额*适用税率 - 速算扣除数","应纳税额 = 工资总额 - 五险一金 - 免征税","年终奖个 = 年终奖 * (年终奖/12的适用税率) - 速算扣除数"],
             infoFujian:'附：七级超额累积进税率表',
             infoList:{
                list0:["级数","应纳税所得额","税率(%)","速算扣除数"],
                list1:["1","小于1500","3","0"],
                list2:["2","超过1500-4500","10","105"],
                list3:["3","超过4500-9000","20","555"],
                list4:["4","超过9000-35000","25","1005"],
                list5:["5","超过35000-55000","30","2755"],
                list6:["6","超过55000-80000","35","5505"],
                list7:["7","超过80000","45","13505"]
              }
           }
        },
        created:function(){
            var self=this;
             //和兄弟组件问号按钮通信，$on：绑定事件
            bus.$on('wrap-show',function(){
                 self.infoShow=true;
            })
        },
        methods:{
            hideWrap:function(){
               this.infoShow=false;
            }
        }
        } 
    }
});

}
