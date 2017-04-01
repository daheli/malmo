var baseUrl = "http://localhost:8080/fake";
var myChart = echarts.init(document.getElementById('measureOutcome'));
var legendName = ['*-0.0','0.0-50.0','50.0-100.0','100.0-150.0','150.0-200.0','200.0-*'];
var legendData = [];
var legendAvgData = [];
var legendTotalData = [];

var option = {
	title: {
		text: 'measure百分比'
	},
	tooltip: {
		show: true,
		backgroundColor: '#fff',
		borderColor: '#ddd',
		borderWidth: 1,
		textStyle: {
			color: '#3c3c3c',
			fontSize: 13
		},
		formatter: function(p) {
            // console.log(p);            
            return p.seriesName + '<br>' + p.value + '%';
        },
        extraCssText: 'box-shadow: 0 0 5px rgba(0, 0, 0, 0.1)'
    },
    legend: {
    	data: legendName,
    },
    xAxis: {
    	data: ['2016年','2017年'],
    	name: '时间',
        //silent: false,
        //axisLine: {onZero: true},
        // splitLine: {show: false},
        //splitArea: {show: false}
    },
    yAxis: {
        //inverse: true,
        max:100,
        splitArea: {show: false},
        axisLabel: {
        	formatter: '{value}%',
        }
    },
    series: [
    {
    	name: legendName[0],
    	type: 'bar',
    	stack: 'one',    	
    	label: {
    		normal: {
    			show: true,
    			formatter: function(p) {
    				console.log(p);  
    				if(p.value > 5) {          
    					return p.value + '%';        
    				} else {
    					return '';
    				}
    			}
    		}
    	},
    },
    {
    	name: legendName[1],
    	type: 'bar',
    	stack: 'one',
    	label: {
    		normal: {
    			show: true,
    			formatter: function(p) {
    				console.log(p);  
    				if(p.value > 5) {          
    					return p.value + '%';        
    				} else {
    					return '';
    				}
    			}   
    		},
    	}
    },
    {
    	name: legendName[2],
    	type: 'bar',
    	stack: 'one',
    	label: {
    		normal: {
    			show: true,
    			formatter: function(p) {
    				console.log(p);  
    				if(p.value > 5) {          
    					return p.value + '%';        
    				} else {
    					return '';
    				}
    			}
    		}
    	},
    },
    {
    	name: legendName[3],
    	type: 'bar',
    	stack: 'one',
    	label: {
    		normal: {
    			show: true,
    			formatter: function(p) {
    				console.log(p);  
    				if(p.value > 5) {          
    					return p.value + '%';        
    				} else {
    					return '';
    				}
    			}
    		}
    	},
    },
    {
    	name: legendName[4],
    	type: 'bar',
    	stack: 'one',
    	label: {
    		normal: {
    			show: true,
    			formatter: function(p) {
    				console.log(p);  
    				if(p.value > 5) {          
    					return p.value + '%';        
    				} else {
    					return '';
    				}
    			}
    		}
    	},
    },
    {
    	name: legendName[5],
    	type: 'bar',
    	stack: 'one',
    	label: {
    		normal: {
    			show: true,
    			formatter: function(p) {
    				console.log(p);  
    				if(p.value > 5) {          
    					return p.value + '%';        
    				} else {
    					return '';
    				}
    			}
    		}
    	},
    },
    ]
};
myChart.setOption(option);
myChart.showLoading();

$(document).ready(function() {
	$.getJSON(baseUrl + "/measureOutcome.js",function(data,status){
                        // console.log("Data: " + JSON.stringify(data) + "\nStatus: " + status);
                        buckets = data.aggregations.date_histogram.buckets;
                        console.log("buckets numbers:", JSON.stringify(buckets.length));
                        init();
                        transform(buckets);
                        myChart.hideLoading();
                    });

	function init() {
		legendName.forEach(function(value, key) {
			legendData[key] = [];
			legendAvgData[key] = [];		
		});
		xAxisData = [];
		xAxisBucketName = [];
		// console.log('legend init: ' + legendData);
	}

	function transform(buckets) {		
		buckets.forEach(function(value, bucketIndex, listObj, argument) { 
				// console.log(Date.parse(value.key_as_string) + ' ' + key);
				xAxisData.push($.format.date(value.key_as_string, "yyyy-MM-dd"));
				xAxisBucketName.push(value.measureOutcome.accessDelay.buckets);
				legendName.forEach(function(lValue, index, listObj, argument) { 
					lname = legendName[index];
					doc_count = JSON.stringify(value.measureOutcome.accessDelay['buckets'][lname]['doc_count'])					
					// console.log('legend: ' + doc_count + ' ' + index + '|' + bucketIndex);
					legendData[index][bucketIndex] = parseInt(doc_count);
				});
			}); 

		console.log('legendData: ' + JSON.stringify(legendData));
		total();
		average();

		mySeries = [];
		legendName.forEach(function(lValue, key) { 				
			mySeries[key] = {data: legendAvgData[key], name: legendName[key]};
		});
		console.log('mySeries: ' + JSON.stringify(mySeries));

		myChart.setOption({
			xAxis: {
				data: xAxisData
			},
			series: mySeries
		});
	}

	function total() {
		len = legendData[0].length;
		// console.log('lname: ' + len);
		for(var i=0; i<len; i++) {
			total = 0;
			legendName.forEach(function(lValue, key) { 				
				ldata = legendData[key][i];
				total += ldata;									
			});
			// console.log('total: ' + total);
			legendTotalData.push(total);
		}
		console.log('legendTotalData: ' + legendTotalData);
	}

	function average() {
		legendName.forEach(function(value, bucketIndex) { 
			ldata = legendData[bucketIndex];
			
			ldata.forEach(function(lValue, index) { 
				avg = (lValue/legendTotalData[index] * 100).toFixed(2) - 0;
				legendAvgData[bucketIndex][index] = avg;
				// console.log('lValue: ' + lValue + ' ' + key + ' ' + avg);				
			});
			
		});
		console.log('legendAvgData: ' + JSON.stringify(legendAvgData));
	}
});