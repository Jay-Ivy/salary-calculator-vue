//index.js  use vue
//空的 Vue 实例作为中央事件总线：
var bus = new Vue();
var vm_article=new Vue({
	el:"#articleWrap",
	data:{
		confg:___jsonCityConfig,
		isShowMore:false,
		salaryShow:true,
		userInput:{
			city:"bj",
			tabindex:0
		}
	},
	computed:{
		citySelect:function(){
			return this.confg[this.userInput.city].name
		},
		personalHosingCoef:function(){
			return this.confg[this.userInput.city].housing.person
		},
		companyHosingCoef:function(){
			return this.confg[this.userInput.city].housing.company
		}
	},
	methods:{
		showMore:function(){
            this.isShowMore? this.isShowMore=false:this.isShowMore=true
		},
        changeTabEvent:function(index){ 
            this.userInput.tabindex=index;   	
        	index==0? this.salaryShow=true:this.salaryShow=false
        },
        getNumber:function(name,val){
        	this.userInput[name]=val;
        },
        changeConfgCity:function(val){
           this.userInput.city=val;
        }
	},
	components:{
		"tab-element":{
			props:["myTab"],
			template:'<ul class="tap"><li v-for="tab in tabs" v-bind:class="{active:tab.isActive}"  v-on:click="setCur($index)">{{tab.name}}</li></ul>',
		    data: function() {
			    return {
			        tabs: [
			            { name: "月薪", isActive: true },
			            { name: "年终奖", isActive: false }
			        ],
			    }
			},
			methods: {
			    setCur: function(index) {
			    	var This=this;
			        This.tabs.map(function(v, i) {
				         if(i == index){
	                        v.isActive = true;
	                        This.$emit('changetab',index);
				         }else{
	                         v.isActive = false
				         }
			        });
			        
			    }
		    }
		},
		"input-element":{
		  props:['myText','myFlag'],
          template:'<li><span>{{myText}}</span><div><input type="number" v-model.trim="getValue" v-on:input="setValue" :placeholder="placeholderText"><em>元<em></div></li>',
          data:function(){
               return {
               	getValue:"",
               	placeholderText:'请输入'+this.myText
               }
          },
          created:function(){
               this.$emit('number',this.myFlag,this.getValue);//组件一旦创建就将数据挂载到父组件
          },
          methods:{
          	setValue:function(){
          		this.$emit('number',this.myFlag,this.getValue)
          	}
          }
		},
		"city-element":{
           props:['myText','myCity'],
           template:'<li class="triangle rt" @click="showCityList"><span>{{myText}}</span><div>{{myCity}}</div><ul class="citylist" v-show="isShow"><li class="cityback" @click.stop="cityBack">返回上一级</li><li v-for="val in cityConf" @click.stop="selectCity(val.dirname)">{{val.name}}</li></ul></li>',
           data:function(){
           	return {
           		cityConf:___jsonCityConfig,
           		isShow:false
           	} 
           },
           methods:{
           	showCityList:function(){
           		this.isShow=true;
           	},
           	selectCity:function(dirname){
           		this.$emit('confgcity',dirname)
           		this.isShow=false;
           	},
           	cityBack:function(){
           		this.isShow=false;
           	}
           }
		},
		"ratio-element":{
           props:['myText','myRatio','myFlag'],
           template:'<li class="triangle rt" v-on:click="changeCoefEvent(myFlag)"><span>{{myText}}</span><div>{{myRatio}}</div></li>',
           /*data:function(){
             return {
             	isShow:false,
             }
           },*/
           created:function(){
           	var self=this;
           	self.$emit("number",self.myFlag,self.myRatio);//组件一旦创建就将数据挂载到父组件，在用户不选择更多时，获得默认数据
           	bus.$on('ratio-selected',function(val,flag){
           		if(self.myFlag==flag){ //根据flag区分到底是哪个组件需要更新数据，解决联动问题
           		 self.myRatio=val;//从系数组件获取数据，更新视图
           	    }
           	 })
           },
           methods:{
            changeCoefEvent:function(myFlag){
           	   	bus.$emit('id-selected',myFlag)
           	   }
           },
           watch:{
           	myRatio:function(){ //监听系数变化
		   	 	this.$emit('number',this.myFlag,this.myRatio);//将数据挂载到父组件上
		   	 }
           }	 
		},
		"ratio-select":{
          template:'<div v-show="isSeleShow"><div class="pageWrap"></div><div class="selectWrap"><div class="selectTop"><span>公积金系数</span><span @click="cancel">取消</span></div><div class="selectCon"><ul @click="hasSelected($event.target)"><li v-for="key in arr">{{key}}</li></ul></div></div></div>',
		   data:function(){
		   	 var arr=[];
		   	 for(var k=13;k>-1;k--){
		   	 	arr.push(k+"%")
		   	 }
		   	return {
		   		arr:arr,
		   		isSeleShow:false,
		   		flag:""
		   	}
		   },
			created:function(){
                var self=this;
                bus.$on('id-selected', function (myFlag) {
                    self.isSeleShow=true;
                    self.flag=myFlag;
                })
			},
		   methods:{
		   	 hasSelected:function(targ){
		   	 	this.isSeleShow=false;
		   	 	bus.$emit('ratio-selected',targ.innerHTML,this.flag)
		   	 },
		   	 cancel:function(){
		   	 	this.isSeleShow=false;
		   	 }
		   }
		},
		"show-more-element":{
			template:'<li class="triangle up"><span>更多</span><div><a href="javascript:;"></a></div></li>'
		}
	}
});
var vm_foot=new Vue({
	el:"#footWrap",
	data:{
		tipMessage:"别调皮哦,请输入准确的工资吧~",
		tipShow:false
	},
    methods:{
     submit:function(){
     	 var This=this;
     	 var __data=vm_article.userInput;
     	 if(!__data||!__data.salary||parseInt(__data.salary)<600||(__data.tabindex && !__data.yearend)){
     	 	This.tipShow=true;
     	 	setTimeout(function(){
              This.tipShow=false;
     	 	},1000)
     	 }else {
     	 	var __arg=[];
     	 	for( key in __data){
              __arg.push(key+"="+encodeURI(__data[key]))
     	 	}
     	 	window.location="result.html?"+__arg.join("&");
     	 }
     	 
     }
    }
})
