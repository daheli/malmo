var baseUrl = "http://localhost:8080/fake";
var myChart = echarts.init(document.getElementById('measureOutcome'));
var legendName = ['*-0.0','0.0-50.0','50.0-100.0','100.0-150.0','150.0-200.0','200.0-*'];
var legendData = {};
var legendAvgData = {};

var option = {
	xAxis: {
		data: ['2016年','2017年'],
		name: '日期',
        //silent: false,
        //axisLine: {onZero: true},
        //splitLine: {show: false},
        //splitArea: {show: false}
    },
    yAxis: {
        //inverse: true,
        max:100,
        splitArea: {show: false}
    },
};
myChart.setOption(option);
myChart.showLoading();

$(document).ready(function() {
	$.getJSON(baseUrl + "/measureOutcome.js",function(data,status){
                        // console.log("Data: " + JSON.stringify(data) + "\nStatus: " + status);
                        buckets = data.aggregations.date_histogram.buckets;
                        console.log("buckets :", JSON.stringify(buckets.length));                        
                        transform(buckets);
                        myChart.hideLoading();
                    });

	function transform(data) {
		xAxisData = [];
		xAxisBucketName = [];
		buckets.forEach(function(value, key, listObj, argument) { 
				// console.log(Date.parse(value.key_as_string) + ' ' + key);
				xAxisData.push($.format.date(value.key_as_string, "yyyy-MM-dd"));
				xAxisBucketName.push(value.measureOutcome.accessDelay.buckets);
				legendName.forEach(function(lValue, key, listObj, argument) { 
					lname = legendName[key];
					ldata = legendData[lname];
					if(ldata == null) {
						ldata = [];
					}
					ldata.push(value.measureOutcome.accessDelay['buckets'][lname]['doc_count']);
					legendData[lname] = ldata;					
				});
			}); 
		
		console.log('legendData: ' + JSON.stringify(legendData));
		myChart.setOption({
			xAxis: {
				data: xAxisData
			},
			series: [
			{
				name: '25岁以下',
				type: 'bar',
				stack: 'one',
            //itemStyle: itemStyle,
            label: {
            	normal: {
            		show: true,
            		formatter: '{c} %'
            	}
            },
            data: legendData[legendName[5]],            
        },
        ]
    });
	}

	function average() {
		for (var i = 0, len = legendName.length; i < len; i++) {
			_datamax[i] = _max;
			_data1[i] = _max - 240;
			_data2[i] = _max - 140 - 80 - 90;
			_data3[i] = i % 2 == 0 ? _max - _data1[i] - _data2[i] : _max - _data1[i] - _data2[i] - 40;
		}
	}
});