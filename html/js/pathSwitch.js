
var ps_myChart = echarts.init(document.getElementById('pathSwitch'));
var ps_legendName = [];
var ps_legendData = [];
var ps_legendAvgData = [];
var ps_legendTotalData = [];
var ps_xAxisData = [];
var ps_xAxisBucketName = {};
var ps_mySeries = [];

var ps_option = {
	title: {
		text: 'Link中切换了主副路径的比例'
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
    xAxis: {
    	data: ['2016年','2017年'],
    	name: '',
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
    series: []
};
ps_myChart.setOption(ps_option);
ps_myChart.showLoading();

$(document).ready(function() {
    console.debug(baseUrl);
	$.getJSON(baseUrl + "/pathSwitch.json",function(data,status){
                        // console.log("Data: " + JSON.stringify(data) + "\nStatus: " + status);
                        buckets = data.aggregations.date_histogram.buckets;
                        console.log("buckets numbers:", JSON.stringify(buckets.length));
                        ps_init(buckets);
                        ps_transform(buckets);
                        ps_myChart.hideLoading();
                    });

	function ps_init(buckets) {
        keys = Object.keys(buckets[0].path.s.buckets);
        // console.debug('value.path.s.buckets:' + keys);
        keys.forEach(function(value, key){
            ps_legendName.push(value);
        })
		ps_legendName.forEach(function(value, key) {
			ps_legendData[key] = [];
			ps_legendAvgData[key] = [];		
		});	
		console.debug('legend init: ' + ps_legendName);
	}

	function ps_transform(buckets) {

		buckets.forEach(function(value, bucketIndex, listObj, argument) { 
				// console.log(Date.parse(value.key_as_string) + ' ' + key);
				ps_xAxisData.push($.format.date(value.key_as_string, "yyyy-MM-dd"));
				ps_legendName.forEach(function(lValue, index, listObj, argument) { 
					lname = ps_legendName[index];
					doc_count = JSON.stringify(value.path.s.buckets[lname]['doc_count'])					
					// console.log('legend: ' + doc_count + ' ' + index + '|' + bucketIndex);
					ps_legendData[index][bucketIndex] = parseInt(doc_count);
				});
			}); 
		console.log('ps_legendData: ' + JSON.stringify(ps_legendData));        

		ps_total();
		ps_average();
		
		ps_legendName.forEach(function(lValue, key) { 				
			ps_mySeries[key] = 
            {
                name: ps_legendName[key],
                data: ps_legendAvgData[key],
                type: 'bar',
                stack: 'one',       
                label: {
                    normal: {
                        show: true,
                        formatter: function(p) {
                            if(p.value > 5) {          
                                return p.value + '%';        
                            } else {
                                return '';
                            }
                        },
                    }
                },   
            }
		});
		console.log('ps_mySeries: ' + JSON.stringify(ps_mySeries));

		ps_myChart.setOption({
            legend: {
                data: ps_legendName,
            },
			xAxis: {
				data: ps_xAxisData
			},
			series: ps_mySeries
		});
	}

	function ps_total() {
		len = ps_legendData[0].length;
		// console.log('lname: ' + len);
		for(var i=0; i<len; i++) {
			total = 0;
			ps_legendName.forEach(function(lValue, key) { 				
				ldata = ps_legendData[key][i];
				total += ldata;									
			});
			// console.log('total: ' + total);
			ps_legendTotalData.push(total);
		}
		console.log('ps_legendTotalData: ' + ps_legendTotalData);
	}

	function ps_average() {
		ps_legendName.forEach(function(value, bucketIndex) { 
			ldata = ps_legendData[bucketIndex];
			
			ldata.forEach(function(lValue, index) { 
				avg = (lValue/ps_legendTotalData[index] * 100).toFixed(2) - 0;
				ps_legendAvgData[bucketIndex][index] = avg;
				// console.log('lValue: ' + lValue + ' ' + key + ' ' + avg);				
			});
			
		});
		console.log('ps_legendAvgData: ' + JSON.stringify(ps_legendAvgData));
	}
});