var app = angular.module('plunker', ['nvd3','extraCharts', 'gridster', 'plunker.services']);

app
.controller('MainCtrl', function($scope, $timeout, DataService,$http) {
	function successRequest(eventDropsData){
	  //Convert date's string to date object.
	  var minDate = convertDate(eventDropsData);
	  $scope.gridsterOptions = {
			margins: [20, 20],
			columns: 4,
			mobileModeEnabled: false,
			draggable: {
				handle: 'h3'
			},
			resizable: {
	     		enabled: true,
	     		handles: ['n', 'e', 's', 'w', 'ne', 'se', 'sw', 'nw'],
	     
			     // optional callback fired when resize is started
			     start: function(event, $element, widget) {},
			     
			     // optional callback fired when item is resized,
			     resize: function(event, $element, widget) {
			       if (widget.chart.api) widget.chart.api.update();
			     }, 
	    
	      		// optional callback fired when item is finished resizing 
			     stop: function(event, $element, widget) {
			       $timeout(function(){
			         if (widget.chart.api) widget.chart.api.update();
			       },400)
			     } 
	    	},
		};
		
		$scope.dashboard = {
			widgets: [{
				col: 0,
				row: 0,
				sizeY: 2,
				sizeX: 2,
				name: "Discrete Bar Chart",
				chart: {
				  options: DataService.discreteBarChart.options(),
				  data: DataService.discreteBarChart.data(),
				  api: {
				  	updateWithOptions:function(){
				  		console.debug("update with options");
				  	}
				  } 
				}
			}, {
				col: 2,
				row: 0,
				sizeY: 2,
				sizeX: 2,
				name: "Candlestick Bar Chart",
				chart: {
				  options: DataService.candlestickBarChart.options(),
				  data: DataService.candlestickBarChart.data(),
				  api: {} 
				}
			}, {
				col: 0,
				row: 2,
				sizeY: 2,
				sizeX: 3,
				name: "Line Chart",
				chart: {
				  options: DataService.lineChart.options(),
				  data: DataService.lineChart.data(),
				  api: {} 
				}
			}, {
				col: 4,
				row: 2,
				sizeY: 1,
				sizeX: 1,
				name: "Pie Chart",
				chart: {
				  options: DataService.pieChart.options(),
				  data: DataService.pieChart.data(),
				  api: {} 
				}
			}]
		};
		var eventDropsOptions = DataService.eventDrops.options();
		eventDropsOptions.start = minDate;
		$scope.extraDashboard = {
			widgets:[{
				col: 0,
				row: 5,
				sizeY: 2,
				sizeX: 2,
				name: "Radial Chart",
				chart: {
				  options: DataService.radialChart.options(),
				  data: DataService.radialChart.data(),
				  api: {} 
				}
			},
			{
				col: 0,
				row: 6,
				sizeY: 2,
				sizeX: 4,
				name: "Event Drops",
				chart: {
				  options: eventDropsOptions,
				  data: eventDropsData,
				  api: {} 
				},
				resizable:false
			}]
		};
	  
	  // We want to manually handle `window.resize` event in each directive.
	  // So that we emulate `resize` event using $broadcast method and internally subscribe to this event in each directive
	  // Define event handler
	  $scope.events = {
	    resize: function(e, scope){
	      $timeout(function(){
	        scope.api.update()
	      },200)
	    }
	  };
	  angular.element(window).on('resize', function(e){
	    $scope.$broadcast('resize');
	  });
	  
	  // We want to hide the charts until the grid will be created and all widths and heights will be defined.
	  // So that use `visible` property in config attribute
	  $scope.config = {
	    visible: false
	  };
	  $timeout(function(){
	    $scope.config.visible = true;
	    $scope.$broadcast('resize');
	  }, 200);
	}

	//Request for the event drops data.
	$http.get('http://127.0.0.1:9999/data_event_drops.json').success(function(data){
      successRequest(data);
    });
    function convertDate(eventDropsData){
    	var minDate = new Date();
    	for(var i in eventDropsData){
    		var dates = eventDropsData[i].dates;
    		for(var dateIndex in dates){
    			dates[dateIndex] = new Date(dates[dateIndex]);
    			if(minDate > dates[dateIndex]){
    				minDate = dates[dateIndex];
    			}
    		}
    	}
    	return minDate;
    }
});
