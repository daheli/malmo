
var luaE_myChart = echarts.init(document.getElementById('onLuaError'));
var luaE_legendName = new Map();
var luaE_legendData = new Map();
var luaE_legendAvgData = [];
var luaE_legendTotalData = [];
var luaE_xAxisData = [];
var luaE_xAxisBucketName = {};
var luaE_mySeries = [];

function luaE_legendName_display() {
    var list = [];
    for (var [key, value] of luaE_legendName) {
        list.push(key);
    }
    // console.debug('luaE_legendName_display ' + list);
    return list;
};


var luaE_option = {
	title: {
		text: 'onLuaError错误数量'
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
            return p.seriesName + '<br>' + p.value;
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
        splitArea: {show: false},
        axisLabel: {
        	formatter: '{value}',
        }
    },
    series: []
};
luaE_myChart.setOption(luaE_option);
luaE_myChart.showLoading();

$(document).ready(function() {
	// console.debug(baseUrl);
	$.getJSON(baseUrl + "/onLuaError.json",function(data,status){
                        // console.log("Data: " + JSON.stringify(data) + "\nStatus: " + status);
                        buckets = data.aggregations.date_histogram.buckets;
                        console.log("buckets numbers:", JSON.stringify(buckets.length));
                        luaE_init(buckets);
                        luaE_transform(buckets);
                        luaE_myChart.hideLoading();
                    });

	function luaE_init(buckets) {
        // console.debug('value.path.s.buckets:' + JSON.stringify(buckets[0].path.s.buckets) + ' size:' + buckets.length);
        for (var i = 0; i < buckets.length; i++) {
            subBuckets = buckets[i].path.s.buckets;
            for(index in subBuckets) {
                sData = subBuckets[index];
                luaE_legendName.set(sData.key, sData.key);
            }                      
        }        
        console.log('luaE_legendName:' + luaE_legendName.size);
        for (var [key, value] of luaE_legendName) {
          console.debug(key + ' = ' + value);
          luaE_legendData.set(key, []);
      }    
  }

  function luaE_transform(buckets) {
     buckets.forEach(function(value, bucketIndex, listObj, argument) { 
        // console.log(Date.parse(value.key_as_string) + ' ' + bucketIndex);
        luaE_xAxisData.push($.format.date(value.key_as_string, "yyyy-MM-dd"));
        subBuckets = buckets[bucketIndex].path.s.buckets;
        console.log('subBuckets - ' + JSON.stringify(subBuckets));
        
        dataJson = {};

        for(subIndex in subBuckets) {
            sData = subBuckets[subIndex];            
            // console.log('sData - ' + JSON.stringify(sData));
            dataJson[sData.key] = sData.doc_count;                                   
        }
        // console.log('dataJson - ' + JSON.stringify(dataJson));            

        for (var [key, value] of luaE_legendName) {
            count = dataJson[key];
            if(count == undefined) {
                luaE_legendData.get(key).push(0);
            } else {
                luaE_legendData.get(key).push(count);
            }
        }
    }); 

     for (var [key, value] of luaE_legendData) {
      console.log('luaE_legendData:' + key + ' = ' + value);
  } 

  var i =0;
  for (var [key, value] of luaE_legendName) {
    // console.log('luaE_legendName:' + key + ' = ' + value + ' | ' + luaE_legendData.get(key));
    luaE_mySeries[i++] = 
    {            	
     name: key,
     data: luaE_legendData.get(key),
     type: 'bar',
     stack: 'one',       
     label: {
        normal: {
           show: true,
           formatter: function(p) {
              if(p.value > 5) {          
                 return p.value;        
             } else {
                 return '';
             }
         },
     }
 },   
}
};
console.log('luaE_mySeries: ' + JSON.stringify(luaE_mySeries));

luaE_myChart.setOption({
  legend: {
     data: luaE_legendName_display()    
 },
 xAxis: {
     data: luaE_xAxisData
 },
 series: luaE_mySeries
});
}

function luaE_total() {
   len = luaE_legendData[0].length;
		// console.log('lname: ' + len);
		for(var i=0; i<len; i++) {
			total = 0;
			luaE_legendName.forEach(function(lValue, key) { 				
				ldata = luaE_legendData[key][i];
				total += ldata;									
			});
			// console.log('total: ' + total);
			luaE_legendTotalData.push(total);
		}
		console.log('luaE_legendTotalData: ' + luaE_legendTotalData);
	}

	function luaE_average() {
		luaE_legendName.forEach(function(value, bucketIndex) { 
			ldata = luaE_legendData[bucketIndex];
			
			ldata.forEach(function(lValue, index) { 
				avg = (lValue/luaE_legendTotalData[index] * 100).toFixed(2) - 0;
				luaE_legendAvgData[bucketIndex][index] = avg;
				// console.log('lValue: ' + lValue + ' ' + key + ' ' + avg);				
			});
			
		});
		console.log('luaE_legendAvgData: ' + JSON.stringify(luaE_legendAvgData));
	}
});