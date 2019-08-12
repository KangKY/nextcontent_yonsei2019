var GuidelineManager = function() {
  this.mModules = [];
  this.mProperties = [];
}

var Modules = function(mTitle, mAnswerCnt, mYesCnt, mPoint) {
  this.mTitle = mTitle;
  this.mAnswerCnt = mAnswerCnt;
  this.mYesCnt = mYesCnt;
  this.mPoint = mPoint;
  this.underScore = function() {
    return (this.mPoint <= 25);
  };
  this.overScore = function() {
    return (this.mPoint >= 75);
  }
}

var moduleText = ["사용성", "심미성", "공공성", "기능성", "설계성", "표준성", "안전성", "정보성"];
var propertyText = ["콘텐츠", "공간 유형", "조작방식", "표현방식"];

var totalList = new Array();
var moduleList = new Array();
var propertyList = new Array();


(function onInit() {
  getResultDateFromDB();
  
 
})();


function TestInit() {
  var avgModule = [54, 25, 60, 15, 70, 75, 30, 15];
  var avgProperty = [70, 75, 30, 15];
  var dataModule = [50, 70, 55, 10, 80, 45, 30, 45];
  var dataProperty = [10, 80, 45, 30];
  var prosModule = [];
  var consModule = [];
  var prosProperty = [];
  var consProperty = [];

  for(var i = 0 ; i < moduleText.length ; i++) {
    moduleList.push(new Modules(moduleText[i], 0, 0, dataModule[i]));
    if(dataModule[i] <= 25)
      consModule.push(moduleText[i]);
    else if(dataModule[i] >= 75)
      prosModule.push(moduleText[i]);
  }
  for(var i = 0 ; i < propertyText.length ; i++) {
    propertyList.push(new Modules(propertyText[i], 0, 0, dataProperty[i]));
    if(dataProperty[i] <= 25)
      consProperty.push(propertyText[i]);
    else if(dataProperty[i] >= 75)
      prosProperty.push(propertyText[i]);
  }

  
  $("#module .pros-cons.pros span").text(prosModule.join(', '));
  $("#module .pros-cons.cons span").text(consModule.join(', '));
  $("#property .pros-cons.pros span").text(prosProperty.join(', '));
  $("#property .pros-cons.cons span").text(consProperty.join(', '));

  drawingChart(avgModule, avgProperty, dataModule, dataProperty );
}




function ListInit( dataModule, dataProperty) {
  var avgModule = [54, 25, 60, 15, 70, 75, 30, 15];
  var avgProperty = [70, 75, 30, 15];

  var prosModule = [];
  var consModule = [];
  var prosProperty = [];
  var consProperty = [];

  for(var i = 0 ; i < moduleText.length ; i++) {
    moduleList.push(new Modules(moduleText[i], 0, 0, dataModule[i]));
    if(dataModule[i] <= 25)
      consModule.push(moduleText[i]);
    else if(dataModule[i] >= 75)
      prosModule.push(moduleText[i]);
  }
  for(var i = 0 ; i < propertyText.length ; i++) {
    propertyList.push(new Modules(propertyText[i], 0, 0, dataProperty[i]));
    if(dataProperty[i] <= 25)
      consProperty.push(propertyText[i]);
    else if(dataProperty[i] >= 75)
      prosProperty.push(propertyText[i]);
  }

  
  $("#module .pros-cons.pros span").text(prosModule.join(', '));
  $("#module .pros-cons.cons span").text(consModule.join(', '));
  $("#property .pros-cons.pros span").text(prosProperty.join(', '));
  $("#property .pros-cons.cons span").text(consProperty.join(', '));

  drawingChart(avgModule, avgProperty, dataModule, dataProperty );
}


function getQuestion() {
  firebase.database().ref('questions').limitToLast(10).once('value').then(function(snapshot) {
    snapshot.forEach(function(data) {
      console.log("The " + data.key + " dinosaur's score is " + data.val());
    });
    // var template = $("#cardTemplate").children().clone();
    // template.find('div.evaluate-num').append();
  });
}



function getResultDateFromDB() {
  $(".preloading").show();
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      var ref = firebase.database().ref('users/' + user.uid).child('Result');
      ref.once('value').then(function(snapshot) {
        
        //console.log(snapshot.numChildren());
        //console.log(snapshot.val());
        var regiDates = [];
        var resultObj = [];
        var Modules;
        var Properties;
        var Selections;

        snapshot.forEach(function(childSnapshot) {
          regiDates.push(childSnapshot.val().RegiDate);   
          resultObj.push(childSnapshot.val());
        });

  
        $.each(resultObj, function(index, item){ 
          if(index != snapshot.numChildren()-1) { 
            return;
          }
          else {
            Modules = item.Modules;
            Properties = item.Properties;
            Selections = item.Selections;

            $(".history_balloon #content").text(Selections.content);
            $(".history_balloon #space").text(Selections.space);
            $(".history_balloon #manual").text(Selections.manual);
            $(".history_balloon #expression").text(Selections.expression);
            $(".history_balloon #userType").text(Selections.userType);
          }
        }); 

        //TestInit();
        ListInit(Object.values(Modules), Object.values(Properties));
        $(".preloading").hide();


       
        //console.log(getTranlateTimestamp(regiDates));
        //ListInit(Object.values(Modules), Object.values(Properties));
        
        
      });
    } else {
      console.log("suing");
    }
  });
}

function isToday(timestamp) {
  var today = new Date();
  var inputDate = new Date(timestamp);
  if(today.setHours(0,0,0,0) == inputDate.setHours(0,0,0,0) ) { return true; }
  else { return false; }  
}

function getTranlateTimestamp(regiDates) {
  var result = regiDates.map((v, idx) => {
    var _date = new Date(v);
    if(isToday(v)) return "오늘("+(idx+1)+"차)";
    return (_date.getMonth()+1)+"월"+_date.getDate()+"일("+(idx+1)+"차)";
  });
  return result;
}

function getSpecificDateFromDB(RegiDate) {
  $(".preloading").show();
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      var ref = firebase.database().ref('users/' + user.uid).child('Result');
      ref.orderByChild('RegiDate').equalTo(1564558672599).once('value').then(function(snapshot) {
        
        console.log(snapshot.numChildren());
        snapshot.forEach(function(childSnapshot) {
          console.log(childSnapshot.val());
        });
        $(".preloading").hide();
      });
    } else {
      console.log("log out");
    }
  });
}

function setResultDataToDB() {

  var user = firebase.auth().currentUser;
  var selections = JSON.parse(localStorage.getItem('selections'));
  if(user != null) {

    var sendSelection = {};
    var sendModule ={};
    var sendProperty ={};

    var nowDate = new Date();

    for(var i = 0 ; i < moduleList.length ; i++) {
      var title = moduleList[i].mTitle;
      var point = moduleList[i].mPoint;
      sendModule[title] = point;
    }

    for(var j = 0 ; j < propertyList.length ; j++) {
      var title = propertyList[j].mTitle;
      var point = propertyList[j].mPoint;
      sendProperty[title] = point;
    }  

    var resultObj = {
      "Selections" : selections,
      "Modules": sendModule,
      "Properties" : sendProperty,
      "RegiDate":nowDate.getTime()
    };

    console.log(resultObj);

    var resultListRef = firebase.database().ref('users/' + user.uid).child('Result');
    resultListRef.push(
      resultObj
    , function(error) {
      if (error) {
        // The write failed...
        console.log(error);
      } else {
        // Data saved successfully!
        console.log("DATA SAVED!");
      }
    });

  } 
}

function generateModulePoints() {
  for(var i ; i < GuidelineManager.mModules.length ; i++)
    GuidelineManager.mModules[i].mPoint = GuidelineManager.mModules[i].mYesCnt * 100 / GuidelineManager.mModules[i].mAnswerCnt;
  
  for(var j ; j < GuidelineManager.mProperties.length ; j++)
    GuidelineManager.mProperties[j].mPoint = GuidelineManager.mProperties[j].mYesCnt * 100 / GuidelineManager.mProperties[j].mAnswerCnt;
}

function getUrlParams() {
  var params = {};
  window.location.search.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(str, key, value) { params[key] = value; });
  return params;
} 


function drawingChart(avgModule, avgProperty, dataModule, dataProperty) {

  if(typeof Highcharts == 'undefined')
    return;

  Highcharts.chart('moduleChart', {
    chart: {
      polar: true,
      type: 'line'
    },
    title: {
      text:null
    },
    exporting: { enabled: false },
    credits: {
        enabled: false
    },
    pane: {
      size: '80%'
    },
    xAxis: {
      categories: ['사용성', '심미성','공공성', '기능성','설계성', '표준성','안정성','정보성' ],
      labels: {
        formatter: function () {
          if (this.pos < moduleList.length && moduleList[this.pos].underScore()) {
            return '<span style="fill: #ed4733;">' + this.value + '</span>';
          } 
          else if(this.pos < moduleList.length && moduleList[this.pos].overScore()) {
            return '<span style="fill: #1117d0;">' + this.value + '</span>';
          }
          else {
              return this.value;
          }
        },
        style: {
          fontSize:'12px',
          fontFamily: 'Noto Sans KR'
        }
      },
      tickmarkPlacement: 'on',
      lineWidth: 0
    },
  
    yAxis: {
      gridLineInterpolation: 'polygon',
      lineWidth: 0,
      min: 0
    },
  
    // tooltip: {
    //   shared: true,
    //   pointFormat: '<span style="color:{series.color}">{series.name}: <b>${point.y:,.0f}</b><br/>'
    // },
  
    legend: {
      align: 'right',
      verticalAlign: 'middle'
    },
  
    plotOptions: {
      series: {
          fillOpacity: 0.5,
          borderWidth: 0
      }
    },
  
    series: [{
      showInLegend: false,   
      name: '평균값',
      data: avgModule,
      type:'area',
      color: '#E6E6E6',
      pointPlacement: 'on',
      marker: {
        enabled: false
      }
    },{
      showInLegend: false,   
      name: '평가값',
      data: dataModule,
      type:'area',
      color:'#A3A5E4',
      pointPlacement: 'on',
      marker: {
        enabled: false
      }
    }],
  
    responsive: {
      rules: [{
        condition: {
          maxWidth: 500
        },
        chartOptions: {
          legend: {
            align: 'center',
            verticalAlign: 'bottom'
          },
          pane: {
            size: '70%'
          }
        }
      }]
    }
  });
  
  Highcharts.chart('propertyChart', {
    chart: {
      polar: true,
      type: 'line'
    },
  
    title: {
      text:null
    },
    exporting: { enabled: false },
    credits: {
        enabled: false
    },
    pane: {
      size: '80%'
    },
  
    xAxis: {
      categories: ['콘텐츠', '공간 유형','조작방식', '표현방식' ],
      labels: {
        formatter: function () {
          if (this.pos < propertyList.length && propertyList[this.pos].underScore()) {
            return '<span style="fill: #ed4733;">' + this.value + '</span>';
          } 
          else if(this.pos < propertyList.length && propertyList[this.pos].overScore()) {
            return '<span style="fill: #1117d0;">' + this.value + '</span>';
          }
          else {
              return this.value;
          }
        },
        style: {
          fontSize:'12px',
          fontFamily: 'Noto Sans KR'
        }
      },
      tickmarkPlacement: 'on',
      lineWidth: 0
    },
    yAxis: {
      gridLineInterpolation: 'polygon',
      lineWidth: 0,
      min: 0
    },
    legend: {
      align: 'right',
      verticalAlign: 'middle'
    },
    series: [{
      showInLegend: false,   
      name: '평가값',
      type:'area',
      color: '#E6E6E6',
      data: avgProperty,
      pointPlacement: 'on',
      marker: {
        enabled: false
      }
    }, {
      showInLegend: false,   
      name: '평균값',
      data: dataProperty,
      type:'area',
      color:'#A3A5E4',
      pointPlacement: 'on',
      marker: {
        enabled: false
      }
    }],
  
    responsive: {
      rules: [{
        condition: {
          maxWidth: 500
        },
        chartOptions: {
          legend: {
            align: 'center',
            verticalAlign: 'bottom'
          },
          pane: {
            size: '70%'
          }
        }
      }]
    }
  });
}