

var Modules = function(mTitle, mAnswerCnt, mYesCnt, mPoint) {
  this.mTitle = mTitle;
  this.mAnswerCnt = mAnswerCnt;
  this.mYesCnt = mYesCnt;
  this.mPoint = mPoint;
  this.underScore = function() {
    return (this.mPoint <= 20);
  };

  this.middleOverScore = function() {
    return (this.mPoint >= 50);
  };

  this.overScore = function() {
    return (this.mPoint >= 80);
  }
}

var moduleText = ["유용성", "안전성", "심미성", "표준성", "편의성"];
var propertyText = ["콘텐츠","공간 유형" , "조작방식", "표현방식"];
var propertyValue = ["content", "space", "manual", "expression"];

var totalList = new Array();
var moduleList = new Array();
var propertyList = new Array();


var sendModuleList = new Array();
var sendPropertyList = new Array();


$(document).ready(function(){
  $(".modal-trigger-custom").click(function() {
    var target = $(this).attr('href');
    if(target == 'btnAgree' && localStorage.getItem('agree')) {
      $("#btnAgree").trigger('click');
    } else {
      $(".modal-overlay").show();
      $(target).addClass('active');
    }
  });
  $(".modal-close").click(function() {
    var target = $(this).parents('.modal')[0];
    $(".modal-overlay").hide();
    $(target).removeClass('active');
  });

  $(".modal-overlay").click(function() {
    if($('.modal.active').attr('id') == "modalGraph")
      return;

    $(".modal-overlay").hide();
    $('.modal.active').removeClass('active');
  });


  

});

function sendInit() {
  $(".preloading").show();
  for(var i = 0 ; i < moduleText.length ; i++) {
    sendModuleList.push(new Modules(moduleText[i], 0, 0, 0));
  }
}

function ListInit( dataModule, dataProperty) {
  var avgModule = [];
  var avgProperty = [];

  var ref = firebase.database().ref('averages');
  ref.once('value').then(function(snapshot) {
    console.log(snapshot.val());

    
    var avgProperties = snapshot.val().Properties;
    var avgModules = snapshot.val().Modules;
    if(snapshot.val().Count > 0) {
      avgModule = [
        avgModules['유용성'], 
        avgModules['안전성'], 
        avgModules['심미성'], 
        avgModules['표준성'], 
        avgModules['편의성']
      ].map(function(item) { return parseInt(item)} );
      avgProperty = [avgProperties.content, avgProperties.space, avgProperties.manual, avgProperties.expression].map(function(property) { return parseInt(property)} );
    }
    

    //console.log(avgModule);
    //console.log(avgProperty);

    var prosModule = [];
    var consModule = [];
    var prosProperty = [];
    var consProperty = [];
    var middleOverProperty = [];

    for(var i = 0 ; i < moduleText.length ; i++) {
      var mPoint = dataModule[i];
      moduleList.push(new Modules(moduleText[i], 0, 0, mPoint));
      if(mPoint <= 20)
        consModule.push(moduleText[i]);
      else if(mPoint >= 80)
        prosModule.push(moduleText[i]);

      
    }

    for(var i = 0 ; i < propertyText.length ; i++) {
      var mPoint = parseInt(dataProperty[i]);
      propertyList.push(new Modules(propertyText[i], 0, 0, mPoint));
      if(mPoint <= 20)
        consProperty.push(propertyText[i]);
      else if(mPoint >= 80)
        prosProperty.push(propertyText[i]);

      if(mPoint >= 50)
        middleOverProperty.push(propertyText[i]);
    }

    $.getJSON('./js/property.json', function(data) {    
      console.log(middleOverProperty);
      console.log(middleOverProperty.sort());
      var _property = data.property;
      $("#property .description .description_title").empty();
      $("#property .description .description_desc").empty();
      for(var i = 0 ; i < _property.length ; i++) {
        if( JSON.stringify(middleOverProperty.sort()) == JSON.stringify(_property[i].property.sort()) ) {
          $("#property .description .description_title").text(_property[i].result_title);
          $("#property .description .description_desc").text(_property[i].result_desc);
          if(consProperty.length > 0) {
            var _text = "<br>특히, "+consProperty.join(', ')+"을(를) 중심으로 콘텐츠를 향상시키는 것을 권장한다.";
            $("#property .description .description_desc").append(_text);
          }
            
          break;
        }  
      }
    });

    $("#module .pros-cons.pros span").text(prosModule.join(', ') == ''?'없음':prosModule.join(', '));
    $("#module .pros-cons.cons span").text(consModule.join(', ') == ''?'없음':consModule.join(', '));
    $("#property .pros-cons.pros span").text(prosProperty.join(', ') == ''?'없음':prosProperty.join(', '));
    $("#property .pros-cons.cons span").text(consProperty.join(', ') == ''?'없음':consProperty.join(', '));

    drawingChart(avgModule, avgProperty, dataModule, dataProperty );
  });
}




function getQuestion(callback) {
 

  var selections = JSON.parse(localStorage.getItem('questions'));
  var content = selections.content;
  var expression = selections.expression;
  var manual = selections.manual;
  var space = selections.space;
  var userType = selections.userType;
  var questionNo = 1;
  var callCount = 0;

  var contentRef = firebase.database().ref('questions/content');
  var spaceRef = firebase.database().ref('questions/space');
  var expressionRef = firebase.database().ref('questions/expression');
  var manualRef = firebase.database().ref('questions/manual');
  //localStorage.removeItem('questions');

  $("#cardList").empty();

  contentRef.once('value').then(function(snapshot) {
    var _AnswerCnt = 0;
    console.log('1');
    snapshot.forEach(function(data) {
      if($.inArray(data.key, content) != -1) {
        _AnswerCnt += data.val().length;
        $.each(data.val(), function(index, item) {
          var questionItem = item;
          var template = $("#cardTemplate").children().clone();
          template.attr("data-type","content").attr('data-category',questionItem.category);
          template.find('div.evaluate-num').prepend(questionNo);
          template.find('div.card.custom').attr('data-num',questionNo);
          template.find('div.card-content p').text(questionItem.guideline);
          template.find('div.helper-description').text(questionItem.description);
          $("#cardList").append(template);
          questionNo++;
        })
      }
    });
    console.log('2');
    sendPropertyList.push(new Modules('content', _AnswerCnt, 0, 0));
    callCount++;
  });

  expressionRef.once('value').then(function(snapshot) {
    var _AnswerCnt = 0;
    console.log('3');
    snapshot.forEach(function(data) {
      if($.inArray(data.key, expression) != -1) {
        _AnswerCnt += data.val().length;
        $.each(data.val(), function(index, item) {
          var questionItem = item;
          var template = $("#cardTemplate").children().clone();
          template.attr("data-type","expression").attr('data-category',questionItem.category);
          template.find('div.evaluate-num').prepend(questionNo);
          template.find('div.card.custom').attr('data-num',questionNo);
          template.find('div.card-content p').text(questionItem.guideline);
          template.find('div.helper-description').text(questionItem.description);
          
          $("#cardList").append(template);
          questionNo++;
        })
      }
    });
    console.log('4');
    sendPropertyList.push(new Modules('expression', _AnswerCnt, 0, 0));
    callCount++;
  });

  spaceRef.once('value').then(function(snapshot) {
    var _AnswerCnt = 0;
    console.log('5');
    snapshot.forEach(function(data) {
      if($.inArray(data.key, space) != -1) {
        _AnswerCnt += data.val().length;
        $.each(data.val(), function(index, item) {
          var questionItem = item;
          var template = $("#cardTemplate").children().clone();
          template.attr("data-type","space").attr('data-category',questionItem.category);
          template.find('div.evaluate-num').prepend(questionNo);
          template.find('div.card.custom').attr('data-num',questionNo);
          template.find('div.card-content p').text(questionItem.guideline);
          template.find('div.helper-description').text(questionItem.description);
          $("#cardList").append(template);
          questionNo++;
        })
      }
    });
    console.log('6');
    sendPropertyList.push(new Modules('space', _AnswerCnt, 0, 0));
    callCount++;
  });

  manualRef.once('value').then(function(snapshot) {
    var _AnswerCnt = 0;
    
    snapshot.forEach(function(data) {
      if($.inArray(data.key, manual) != -1) {
        _AnswerCnt += data.val().length;
        $.each(data.val(), function(index, item) {
          var questionItem = item;
          var template = $("#cardTemplate").children().clone();
          template.attr("data-type","manual").attr('data-category',questionItem.category);
          template.find('div.evaluate-num').prepend(questionNo);
          template.find('div.card.custom').attr('data-num',questionNo);
          template.find('div.card-content p').text(questionItem.guideline);
          template.find('div.helper-description').text(questionItem.description);
          $("#cardList").append(template);
          questionNo++;
        })
      }
    });
    sendPropertyList.push(new Modules('manual', _AnswerCnt, 0, 0));
    callCount++;
  });
 
  var timer = setInterval(function() { 
    if(callCount == 4) { 
      clearInterval(timer);
      $(".preloading").hide(); 
      $("#cardLoading").hide();
      document.addEventListener('scroll', function() {
        //var currentPercent = (window.scrollY) / $(".evaluate-wrap").height() * 100;
        var currentPercent = $(window).scrollTop() / ($(document).height() - $(window).height()) * 100

        currentPercent = parseInt(currentPercent);
        $(".determinate").css("width",currentPercent+"%");
        
        if(currentPercent > 95) {
          $("#complete-button").removeClass('hide');
        }
        else {
          $("#complete-button").addClass('hide');
        }
      });

      if(typeof callback === 'function')
        callback(); 
    }
  }, 500);
}

function getResultDateFromDB() {
  $(".preloading").show();
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      var ref = firebase.database().ref('users/' + user.uid).child('Result');
      ref.once('value').then(function(snapshot) {
        
        //console.log(snapshot.numChildren());
        //console.log(snapshot.val());

        if(snapshot.val() == null) {
          M.toast({html: '평가 기록이 없습니다.', classes: 'custom', displayLength:2000});
          setTimeout(function(){
            location.href="index.html";
          },2000);
          return;
        }


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

        var chartModules = [
          Modules['유용성'], 
          Modules['안전성'], 
          Modules['심미성'], 
          Modules['표준성'], 
          Modules['편의성']
        ].map(function(item) { return parseInt(item)} );
        var chartProperties = [Properties.content, Properties.space, Properties.manual, Properties.expression].map(function(property) { return parseInt(property)} );


        ListInit(chartModules,chartProperties);
        $(".preloading").hide();

        drawHistoryTabs(regiDates, getTranlateTimestamp(regiDates));
       
        //console.log(getTranlateTimestamp(regiDates));
        //ListInit(Object.values(Modules), Object.values(Properties));
        
        $(".history_loading").hide();
        $(".chart").removeClass('hidden');
        $('.history-info-wrap').removeClass('hidden');
      });
    } else {
      console.log("not login");
      var item = JSON.parse(localStorage.getItem('Result'));

      if(item == null) {
        M.toast({html: '평가 기록이 없습니다.', classes: 'custom', displayLength:2000});
        setTimeout(function(){
          location.href="index.html";
        },2000);
        return;
      }

      var Modules = item.Modules;
      var Properties = item.Properties;
      var Selections = item.Selections;

      console.log(Properties);
      console.log(Selections);

      $(".history_balloon #content").text(Selections.content);
      $(".history_balloon #space").text(Selections.space);
      $(".history_balloon #manual").text(Selections.manual);
      $(".history_balloon #expression").text(Selections.expression);
      $(".history_balloon #userType").text(Selections.userType);

      var chartModules = [
        Modules['유용성'], 
        Modules['안전성'], 
        Modules['심미성'], 
        Modules['표준성'], 
        Modules['편의성']
      ].map(function(item) { return parseInt(item)} );
      var chartProperties = [Properties.content, Properties.space, Properties.manual, Properties.expression].map(function(property) { return parseInt(property)} );
      drawTodayTab();
      ListInit(chartModules,chartProperties);
      $(".no-login").show();
      $(".preloading").hide();
      
      $(".history_loading").hide();
      $(".chart").removeClass('hidden');
      $('.history-info-wrap').removeClass('hidden');
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

function drawTodayTab() {
  var tab = $("#historyListTemplate").children().clone();
  tab.find('a').text('오늘');
  tab.find('a').attr('data-time',new Date().getTime());
  tab.find('a').addClass('active');
  $("#history_list").prepend(tab);
  $("#history_list").css('right', 'calc(50% - 37px)');
}

function drawHistoryTabs(timestamps, historyText) {
  for(var i = 0 ; i < historyText.length ; i++) {
    var tab = $("#historyListTemplate").children().clone();
    tab.find('a').text(historyText[i]);
    tab.find('a').attr('data-time',timestamps[i]);
    //tab.find('a').data('time', timestamps[i]);
    if(i==(historyText.length-1)) tab.find('a').addClass('active');
    $("#history_list").prepend(tab);
  }

  var element = $("div.custom-tabs")[0];
  var w = $("#history_list span:first-child").outerWidth() / 2;
  if(element.offsetWidth < element.scrollWidth) 
    $("#history_list").css('width','auto');


  $("#history_list").css('right', 'calc(50% - '+w+'px)');

  $(".custom-tabs .custom-tab a").on('click', function() {     
    var a = $(".custom-tabs span:first-child a").offset().left + $(".custom-tabs span:first-child a").outerWidth() / 2;
    var n = $(this).offset().left + $(this).outerWidth() / 2;
    var right = 'calc(50% - '+ w +'px - ' + Math.abs(a - n) +'px)'; 

    $("#history_list").css({'right':right});

    $('.custom-tab a.active').removeClass('active');
    $(this).addClass('active');
    moduleList = new Array();
    propertyList = new Array();
    getSpecificDateFromDB($(this).data('time'));
  });
}


function getSpecificDateFromDB(RegiDate) {
  $(".preloading").show();
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      var ref = firebase.database().ref('users/' + user.uid).child('Result');
      ref.orderByChild('RegiDate').equalTo(RegiDate).once('value').then(function(snapshot) {
        $(".history-top-menu span.submenu[data-panel='module']").trigger('click');
        //console.log(snapshot.val());
        snapshot.forEach(function(childSnapshot) {
  
          var Modules;
          var Properties;
          var Selections;

          Modules = childSnapshot.val().Modules;
          Properties = childSnapshot.val().Properties;
          Selections = childSnapshot.val().Selections;

          $(".history_balloon #content").text(Selections.content);
          $(".history_balloon #space").text(Selections.space);
          $(".history_balloon #manual").text(Selections.manual);
          $(".history_balloon #expression").text(Selections.expression);
          $(".history_balloon #userType").text(Selections.userType);

          var chartModules = [
            Modules['유용성'], 
            Modules['안전성'], 
            Modules['심미성'], 
            Modules['표준성'], 
            Modules['편의성']
          ].map(function(item) { return parseInt(item)} );
          var chartProperties = [Properties.content, Properties.space, Properties.manual, Properties.expression].map(function(property) { return parseInt(property)} );
  
  
          ListInit(chartModules,chartProperties);
        });
        $(".preloading").hide();
      });
    } else {
      console.log("log out");
    }
  });
}


function generateModulePoints() {

  $("#cardList .card.custom.selected").each(function() { 
    //var mobj = sendModuleList.find(x => $(this).parent().data('category').indexOf(x.mTitle) != -1);
    var pobj = sendPropertyList.find(x => x.mTitle == $(this).parent().data('type'));
    //mobj.mYesCnt++;
    pobj.mYesCnt++;
  });

  console.log(sendModuleList);
  $("#cardList .card.custom").each(function() { 
    try {
      var mobj = sendModuleList.find(x => $(this).parent().data('category').indexOf(x.mTitle) != -1);
      //console.log(mobj);
      mobj.mAnswerCnt++;
      if($(this).hasClass('selected'))
        mobj.mYesCnt++;
    } catch(e) {
      console.log($(this).parent().data('category'));
    }
  });

  for(var i=0 ; i < sendModuleList.length ; i++) {
    if(sendModuleList[i].mAnswerCnt != 0)
      sendModuleList[i].mPoint = parseInt(sendModuleList[i].mYesCnt * 100 / sendModuleList[i].mAnswerCnt);
  }
    
  
  for(var j=0 ; j < sendPropertyList.length ; j++) {
    if(sendPropertyList[j].mAnswerCnt != 0)
      sendPropertyList[j].mPoint = parseInt(sendPropertyList[j].mYesCnt * 100 / sendPropertyList[j].mAnswerCnt);
  }
  console.log(sendModuleList);
  console.log(sendPropertyList);
  setResultDataToDB();
}

function setResultDataToDB() {

  var user = firebase.auth().currentUser;
  var selections = JSON.parse(localStorage.getItem('selections'));

  var sendModule ={};
  var sendProperty ={};

  var nowDate = new Date();

  for(var i = 0 ; i < sendModuleList.length ; i++) {
    var title = sendModuleList[i].mTitle;
    var point = parseInt(sendModuleList[i].mPoint);
    sendModule[title] = point;
  }

  for(var j = 0 ; j < sendPropertyList.length ; j++) {
    var title = sendPropertyList[j].mTitle;
    var point = parseInt(sendPropertyList[j].mPoint);
    sendProperty[title] = point;
  }  

  var resultObj = {
    "Selections" : selections,
    "Modules": sendModule,
    "Properties" : sendProperty,
    "RegiDate":nowDate.getTime()
  };

  var ref = firebase.database().ref('averages');
  ref.once('value').then(function(snapshot) {
    //console.log(snapshot.val());
    var avgProperties = snapshot.val().Properties;
    var avgModules = snapshot.val().Modules;
    var avgCount = parseInt(snapshot.val().Count);

    if(avgCount != 0) {
      for( var key in avgProperties ) {
        //console.log( key + '=>' + avgProperties[key] );
        avgProperties[key] = (sendProperty[key] + parseInt(avgProperties[key])) / (avgCount + 1);
      }
      for( var key in avgModules ) {
        //console.log( key + '=>' + avgModules[key] );
        avgModules[key] = (sendModule[key] + parseInt(avgModules[key])) / (avgCount + 1);
      }

      var avgObj = {
        "Modules":avgModules,
        "Properties":avgProperties,
        "Count": avgCount + 1
      };

      firebase.database().ref('averages').set(avgObj).then(()=> {
        console.log("avg set! 1");
      });
    }
    else {
      var avgObj = {
        "Modules":sendModule,
        "Properties":sendProperty,
        "Count": 1
      }
      firebase.database().ref('averages').set(avgObj).then(()=> {
        console.log("avg set! 2");
      });
    }
  });

  console.log(resultObj);
  if(user != null) {
    
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
        //localStorage.removeItem('selections');
        //location.href="history.html";
        location.replace("history.html");
      }
    });
  } 
  else {
    
    localStorage.setItem("Result", JSON.stringify(resultObj));
    //localStorage.removeItem('selections');
    //location.href="history.html";
    location.replace("history.html");
  }
}



/*
* Account 페이지에서 추가 정보 변경
*/
function updateRegisterInfoToDB(info, type, callback) {
  firebase.auth().onAuthStateChanged(function(user) {
    console.log(user);
    if (user) {
      //var user = firebase.auth().currentUser;
      if(type=="industry_main") {
        firebase.database().ref('users/' + user.uid).update({
          industry: info
        }).then(()=> {
          callback('산업 설정이 변경되었습니다.')
        });
      } else if(type =="technic_main") {
        firebase.database().ref('users/' + user.uid).update({
          technic : info
        }).then(()=> {
          callback('기술 설정이 변경되었습니다.')
        });
      }
    }
  });
}





/*
* 콘텐츠 가이드 관련
*/

function getContentGuide() {
  var items = JSON.parse(localStorage.getItem('guide_selections'));

  $.getJSON('./js/guide.json', function(data) {         
    

    data = data.guides;
    //console.log(data);
    //console.log(items);
    $.each(items.content, function(idx, item) {
      //console.log(item)
      var category = items.content[idx];
      var _content = data[item];
      
      $.each(items.space, function(idx, item) {
        var _space = _content[item];
        //console.log(_space);

        $.each(items.age, function(idx, item) {
          var resultData = _space[item];

          var guideTemplate = $("#guideTemplate").children().clone();
          
          
          guideTemplate.find('div.guideline').text(resultData.guideline);
          for(var i = 0 ; i < resultData.recommend_title.length; i++) {
            var recommendTemplate = $("#recommendTemplate").children().clone();
            recommendTemplate.find('div.guide-title').text(resultData.recommend_title[i]);
            recommendTemplate.find('div.guide-desc').text(resultData.recomment_desc[i]);

            for(var j = 0 ; j < resultData.image.length; j++) {
              if(resultData.recommend_title.length > 1 && i == 0) 
                break;
              recommendTemplate.find('div.guide-image img').attr('src',"img/guide/"+category+"/"+resultData.image[j]);
              recommendTemplate.find('div.guide-image span.source').text(resultData.source[j]);
            }

            guideTemplate.find('div#recommendList').append(recommendTemplate);
          }
          
          $("#guideList").append(guideTemplate);
        });

        console.log(_space['none']);
        if(_space['none']) {
          var resultData = _space['none'];

          var guideTemplate = $("#guideTemplate").children().clone();
          
          
          guideTemplate.find('div.guideline').text(resultData.guideline);
          for(var i = 0 ; i < resultData.recommend_title.length; i++) {
            var recommendTemplate = $("#recommendTemplate").children().clone();
            recommendTemplate.find('div.guide-title').text(resultData.recommend_title[i]);
            recommendTemplate.find('div.guide-desc').text(resultData.recomment_desc[i]);

            for(var j = 0 ; j < resultData.image.length; j++) {
              if(resultData.recommend_title.length > 1 && i == 0) 
                break;
              recommendTemplate.find('div.guide-image img').attr('src',"img/guide/"+category+"/"+resultData.image[j]);
              recommendTemplate.find('div.guide-image span.source').text(resultData.source[j]);
            }

            guideTemplate.find('div#recommendList').append(recommendTemplate);
          }
          
          $("#guideList").append(guideTemplate);
        }
      });
    });

    
  });
}


function setGuideSelections() {
  localStorage.removeItem('guide_selections');


  if($("#content-body").find('a.btn.selected').length == 0 &&
    $("#space-body").find('a.btn.selected').length == 0 &&
    $("#age-body").find('a.btn.selected').length == 0) {

    M.toast({html: '콘텐츠, 공간 유형, 연령을 선택해주세요.', classes: 'custom', displayLength:2000});
    return;
  }

  var content = [];
  if($("#content-body").find('a.btn.selected').length != 0)
    $("#content-body").find('a.btn.selected').each(function(){ content.push($(this).data('category')) });
  else
    $("#content-body").find('a.btn').each(function(){ content.push($(this).data('category')) });
  

  var space = []; 
  if($("#space-body").find('a.btn.selected').length != 0)
    $("#space-body").find('a.btn.selected').each(function(){ space.push($(this).data('category')) });
  else
    $("#space-body").find('a.btn').each(function(){ space.push($(this).data('category')) });

  var age = [];
  if($("#age-body").find('a.btn.selected').length != 0)
    $("#age-body").find('a.btn.selected').each(function(){ age.push($(this).data('category')) });
  else
    $("#age-body").find('a.btn').each(function(){ age.push($(this).data('category')) });

  var selectedItem = {
    'content': content, 
    'space':space, 
    'age':age
  };

  localStorage.setItem('guide_selections', JSON.stringify(selectedItem));
  location.href="guide_detail.html";
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
      type: 'line',
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
      categories: moduleText,
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
    legend: {
      align: 'right',
      verticalAlign: 'middle'
    },
    plotOptions: {
      series: {
          fillOpacity: 0.5,
          borderWidth: 2,
          borderColor: 'black'
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
      borderColor:'#000',
      borderWidth: 2,
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
      categories: propertyText,
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
      name: '평균값',
      type:'area',
      color: '#E6E6E6',
      data: avgProperty,
      pointPlacement: 'on',
      marker: {
        enabled: false
      }
    }, {
      showInLegend: false,   
      name: '평가값',
      data: dataProperty,
      type:'area',
      color:'#A3A5E4',
      borderColor:'#ffffff',
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