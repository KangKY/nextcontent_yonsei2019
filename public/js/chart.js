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
        console.log(this);
        console.log(this.value);
        console.log(this.data);
          // if (25 >= this.value) {
          //   return '<span style="fill: red;">' + this.value + '</span>';
          // } 
          // else if(75 <= this.value) {
          //   return '<span style="fill: red;">' + this.value + '</span>';
          // }
          // else {
          //     return this.value;
          // }
          return this.value;
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
    data: [54, 25, 60, 15, 70, 75, 30, 15],
    type:'area',
    color: '#E6E6E6',
    pointPlacement: 'on'
  },{
    showInLegend: false,   
    name: '평가값',
    data: [50, 70, 55, 10, 80, 45, 30, 45],
    type:'area',
    color:'#A3A5E4',
    pointPlacement: 'on'
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
},
function(c){

  $(".highcharts-axis:first text").each(function(i, label){
      var $label = $(label);
      if($label.children().text() === "Jun") {
          $label.css({fill: "blue"});                        
      }
  });

  // You also can to something like:
  $(".highcharts-axis:first text:eq(6)").css({fill: "green"});

}
);

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

  series: [{
    showInLegend: false,   
    name: '평가값',
    data: [10, 5, 55, 20],
    pointPlacement: 'on'
  }, {
    showInLegend: false,   
    name: '평균값',
    data: [54, 65, 60, 705],
    pointPlacement: 'on'
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