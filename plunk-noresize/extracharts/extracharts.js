(function(){
    'use strict'

    angular.module('extraCharts', [])
        .directive('extracharts',['radialUtils',function(radialUtils){
            return {
                restrict: 'AE',
                scope: {
                    data: '=',      //chart data, [required]
                    options: '=',   //chart options, according to nvd3 core api, [required]
                    api: '=?',      //directive global api, [optional]
                    events: '=?',   //global events that directive would subscribe to, [optional]
                    config: '=?',    //global directive configuration, [optional]
                    onReady: '&?' //callback function that is called with internal scope when directive is created [optional]
                },
                link:function(scope,element,attrs){
                    var  _currentArc= 0, _currentArc2= 0, _currentValue=0;
                    var _arc = d3.svg.arc()
                        .startAngle(0 * (Math.PI/180)); //just radians
                    var _arc2 = d3.svg.arc()
                        .startAngle(0 * (Math.PI/180))
                        .endAngle(0); //just radians
                    var _selection = null;
                    var defaultOptions = {
                        type: 'radialChart',
                        margin : {
                            top: 0,
                            right: 0,
                            bottom: 0,
                            left: 0
                        },
                        diameter:150,
                        value:78,
                        minValue:0,
                        maxValue:100,
                        label:'Radial',
                        width:400,
                        height:400,
                        duration:1000,
                        fontSize:10
                    };
                    var defaultConfig = {
                        visible:true
                    };
                    var defaultConfigEventDrops = {
                        lineHeight: 45,
                        start: new Date(0),
                        end: new Date(),
                        minScale: 0,
                        maxScale: Infinity,
                        width: 1000,
                        margin: {
                            top: 60,
                            left: 200,
                            bottom: 40,
                            right: 50,
                        },
                        locale: null,
                        axisFormat: null,
                        tickFormat: [
                            ['.%L', (d) => d.getMilliseconds()],
                            [':%S', (d) => d.getSeconds()],
                            ['%I:%M', (d) => d.getMinutes()],
                            ['%I %p', (d) => d.getHours()],
                            ['%a %d', (d) => d.getDay() && d.getDate() !== 1],
                            ['%b %d', (d) => d.getDate() !== 1],
                            ['%B', (d) => d.getMonth()],
                            ['%Y', () => true],
                        ],
                        eventHover: null,
                        eventZoom: null,
                        eventClick: null,
                        hasDelimiter: true,
                        hasTopAxis: true,
                        hasBottomAxis: (d) => d.length >= 10,
                        eventLineColor: 'black',
                        eventColor: null,
                        metaballs: true
                    };
                    var parent = null;
                    if(scope.options.type === "radial"){
                        scope.options = angular.extend(defaultOptions, scope.options);
                    }
                    else{
                        scope.options = angular.extend(defaultConfigEventDrops, scope.options);
                    }
                    scope.config = angular.extend(defaultConfig,scope.config);
                    scope.api = {
                        update:function(){
                            parent = document.getElementById(scope.options.type);
                            _selection = d3.select(parent);
                            _selection.datum(scope.data);
                            if(scope.options.type === "radialChart"){
                                scope.api.measure();
                                scope.api.component();
                            }
                            else{
                                scope.api.updateEventDrops();
                            }
                        },
                        measure:function() {
                            var options = scope.options;
                            var margin = options.margin;
                            var diameter = options.diameter;
                            if(parent){
                                diameter = parent.clientWidth > parent.clientHeight ? parent.clientHeight : parent.clientWidth;
                            }
                            options.diameter = diameter;
                            var width=options.diameter - margin.right - margin.left - margin.top - margin.bottom;
                            options.height = options.width = width;
                            // var width = options.width;
                            options.fontSize=width*.2;
                            _arc.outerRadius(width/2);
                            _arc.innerRadius(width/2 * .85);
                            _arc2.outerRadius(width/2 * .85);
                            _arc2.innerRadius(width/2 * .85 - (width/2 * .15));
                        },
                        component:function(){
                            function onMouseClick(d) {
                                console.log("mouse clicked");
                            }
                            _selection.each(function (data) {

                                // Select the svg element, if it exists.
                                var svg = d3.select(this).selectAll("svg").data([data]);
                                if(!svg.size()){
                                    svg.enter().append("svg")
                                    .attr("class","radial-svg");
                                }
                                var enter = svg.select("g");
                                if(!enter.size()){
                                    enter = svg.append("g");
                                }
                                // var enter = svg.enter().append("svg").attr("class","radial-svg").append("g");

                                scope.api.measure();

                                var options = scope.options;
                                var width = options.width;
                                var margin = options.margin;
                                var height = options.height;
                                var fontSize = options.fontSize;
                                var value = scope.data[0];
                                var minValue = options.minValue;
                                var maxValue = options.maxValue;
                                var label = options.label;
                                var duration = options.duration;
                                var svgWidth = width + margin.right + margin.left;
                                var svgHeight = height + margin.top + margin.bottom;
                                var translateCss = "transform:translate(" + width/2+"px ,"+width/2+"px )";
                                svg.attr("width", svgWidth)
                                    .attr("height", svgHeight);

                                var background = enter.select("g");
                                if(!background.size()){
                                    background = enter.append("g").attr("class","component")
                                        .attr("cursor","pointer")
                                        .attr("click",onMouseClick);
                                }
                                background.attr("width",width)
                                        .attr("height",height);

                                _arc.endAngle(360 * (Math.PI/180))
                                var rect = background.select("rect");
                                if(!rect.size()){
                                    rect = background.append("rect");
                                }
                                rect.attr("class","background")
                                    .attr("width", width)
                                    .attr("height", height);
                                var bgPath = background.select("path");
                                if(!bgPath.size()){
                                    bgPath = background.append("path");
                                }
                                bgPath.attr("style", translateCss)
                                    .attr("d", _arc);
                                var g = svg.select("g")
                                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                                _arc.endAngle(_currentArc);
                                if(!enter.select(".arcs").size()){
                                    enter.append("g").attr("class","arcs");
                                }
                                var path = svg.select(".arcs").selectAll(".arc").data(data);
                                if(!path.size()){
                                    path.enter().append("path");
                                }
                                // path.enter()
                                path.attr("class","arc")
                                    .attr("style", translateCss)
                                    .attr("d", _arc);

                                //Another path in case we exceed 100%
                                var path2 = svg.select(".arcs").selectAll(".arc2").data(data);
                                if(!path2.size()){
                                    path2.enter().append("path");
                                }
                                path2.attr("class","arc2")
                                    .attr("style",translateCss)
                                    .attr("d", _arc2);

                                if(!enter.select(".labels").size()){
                                    enter.append("g").attr("class","labels");
                                }
                                var label = svg.select(".labels").selectAll(".label").data(data);
                                if(!label.size()){
                                    label.enter().append("text")
                                        .attr("class","label")
                                        .attr("cursor","pointer")
                                        .on("click",onMouseClick);;
                                }
                                label.attr("y",width/2+fontSize/3)
                                    .attr("x",width/2)
                                    .attr("width",width)
                                    .text(function (d) { return Math.round((value-minValue)/(maxValue-minValue)*100) + "%" })
                                    .style("font-size",fontSize+"px")
                                    

                                path.exit().transition().duration(500).attr("x",1000).remove();

                                function layout(svg) {
                                    var ratio=(value-minValue)/(maxValue-minValue);
                                    var endAngle=Math.min(360*ratio,360);
                                    endAngle=endAngle * Math.PI/180;

                                    path.datum(endAngle);
                                    path.transition().duration(duration)
                                        .attrTween("d",scope.api.arcTween);

                                    if (ratio > 1) {
                                        path2.datum(Math.min(360*(ratio-1),360) * Math.PI/180);
                                        path2.transition().delay(duration).duration(duration)
                                            .attrTween("d",scope.api.arcTween2);
                                    }

                                    label.datum(Math.round(ratio*100));
                                    label.transition().duration(duration)
                                        .tween("text",scope.api.labelTween);

                                }

                                layout(svg);
                            });
                        },
                        labelTween:function(a) {
                            var i = d3.interpolate(_currentValue, a);
                            _currentValue = i(0);

                            return function(t) {
                                _currentValue = i(t);
                                this.textContent = Math.round(i(t)) + "%";
                            }
                        },
                        arcTween:function(a) {
                            var i = d3.interpolate(_currentArc, a);

                            return function(t) {
                                _currentArc=i(t);
                                return _arc.endAngle(i(t))();
                            };
                        },
                        arcTween2:function(a) {
                            var i = d3.interpolate(_currentArc2, a);

                            return function(t) {
                                return _arc2.endAngle(i(t))();
                            };
                        },
                        updateEventDrops:function(){
                            var height = parent.clientHeight;
                            var width = parent.clientWidth;
                            var finalConfiguration = scope.options;
                            const yScale = (data) => {
                                const scale = d3.scale.ordinal();

                                return scale
                                    .domain(data.map((d) => d.name))
                                    .range(data.map((d, i) => i * 40));
                            };

                            const xScale = (width, timeBounds) => {
                                return d3.time.scale()
                                    .range([0, width])
                                    .domain(timeBounds);
                            };
                            _selection.each(function (data) {
                                const height = data.length * 40;
                                const dimensions = {
                                    width: finalConfiguration.width - finalConfiguration.margin.right - finalConfiguration.margin.left,
                                    height,
                                    outer_height: height + finalConfiguration.margin.top + finalConfiguration.margin.bottom,
                                };

                                const scales = {
                                    x: xScale(dimensions.width, [finalConfiguration.start, finalConfiguration.end]),
                                    y: yScale(data),
                                };

                                var svg = d3.select(this).select('svg');
                                if(!svg.size()){
                                    svg = d3.select(this).append('svg');
                                }
                                svg.attr({
                                    width:dimensions.width + 210,
                                    height:dimensions.outer_height,
                                    style:"margin-top:"+finalConfiguration.margin.top+"px;margin-left:"+finalConfiguration.margin.left + "px"
                                });

                                const draw = scope.api.drawer(svg, dimensions, scales, finalConfiguration).bind(_selection);
                                draw(data);

                                scope.api.zoom(d3.select('.drops-container'), dimensions, scales, finalConfiguration, data, draw);
                            });
                        },
                        zoom:function(container, dimensions, scales, configuration, data, callback){
                            // we need an intermediary element to prevent shaky behavior
                            var zoomArea = container.select('.zoom-area');
                            if(!zoomArea.size()){
                                zoomArea = container.append('rect')
                                        .classed('zoom-area',true);
                            }
                            // const zoomArea = container.append('rect')
                            //     .classed('zoom-area', true)
                            //     .attr('width', dimensions.width)
                            //     .attr('height', dimensions.outer_height)
                            //     .attr('transform', `translate(${configuration.margin.left},35)`);
                            zoomArea.attr('width', dimensions.width)
                                .attr('height', dimensions.outer_height)
                                .attr('transform', `translate(210,35)`);

                            const zoom = d3.behavior.zoom()
                                .size([dimensions.width, dimensions.height])
                                .scaleExtent([configuration.minScale, configuration.maxScale])
                                .x(scales.x)
                                .on('zoom', () => {
                                    requestAnimationFrame(() => callback(data));
                                });

                            return zoomArea.call(zoom);
                        },
                        drawer:function (svg, dimensions, scales, configuration) {
                            var defs = svg.select('defs');
                            if(!defs.size()){
                                defs = svg.append('defs');
                                defs.append('svg:clipPath')
                                    .attr('id','drops-container')
                                    .append('svg:rect')
                                    .attr('id','drops-container-rect')
                                    .attr('x', 210)
                                    .attr('y', 0)
                                    .attr('width', dimensions.width)
                                    .attr('height', dimensions.outer_height);
                            }
                            d3.select("#drops-container-rect")
                                .attr('x',210)
                                .attr('y',0)
                                .attr('width',dimensions.width)
                                .attr('height',dimensions.outer_height);
                            var labelsContainer = svg.select(".labels");
                            if(!labelsContainer.size()){
                                labelsContainer = svg.append('g')
                                    .classed('labels',true)
                                    .attr('transform','translate(0,45)');
                            }
                            var axesContainer = svg.select(".axes");
                            if(!axesContainer.size()){
                                axesContainer = svg.append('g')
                                   .classed('axes', true)
                                   .attr('transform', 'translate(210, 55)');
                            }
                            var dropsContainer = svg.select('.drops-container');
                            if(!dropsContainer.size()){
                                dropsContainer = svg.append('g')
                                .classed('drops-container', true)
                                .style('filter', 'url(#metaballs)');
                            }

                            var extremaContainer = svg.select('.extremum');
                            if(!extremaContainer.size()){
                                extremaContainer = svg.append('g')
                                .classed('extremum', true);
                            }
                            extremaContainer.attr('width', dimensions.width)
                                .attr('height', 30)
                                .attr('transform', `translate(210, ${configuration.margin.top - 45})`);

                            configuration.metaballs && scope.api.metaballs(defs);

                            const lineSeparator = scope.api.lineSeparator(axesContainer, scales, configuration, dimensions);
                            const axes = scope.api.axis(axesContainer, scales, configuration, dimensions);
                            const labels = scope.api.label(labelsContainer, scales, configuration);
                            const drops = scope.api.drops(dropsContainer, scales, configuration);

                            return data => {
                                lineSeparator(data);
                                scope.api.delimiters(svg, scales, configuration.dateFormat);
                                drops(data);
                                labels(data);
                                axes(data);
                            };
                        },
                        metaballs:function(defs){
                            var filters = defs.select('#metaballs');
                            if(!filters.size()){
                                filters = defs.append('filter');
                                filters.attr('id', 'metaballs');
                                filters.append('feGaussianBlur')
                                    .attr('in', 'SourceGraphic')
                                    .attr('stdDeviation', 10)
                                    .attr('result', 'blur');

                                filters.append('feColorMatrix')
                                    .attr('in', 'blur')
                                    .attr('mode', 'matrix')
                                    .attr('values', '1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 50 -10')
                                    .attr('result', 'contrast');

                                filters.append('feBlend')
                                    .attr('in', 'SourceGraphic')
                                    .attr('in2', 'contrast');
                            }

                            return filters;
                        },
                        delimiters:function(svg, scales, dateFormat){
                            const extremum = svg.select('.extremum')

                            extremum.selectAll('.minimum').remove();
                            extremum.selectAll('.maximum').remove();

                            const domain = scales.x.domain();
                            extremum.append('text')
                                .text(dateFormat(domain[0]))
                                .classed('minimum', true);

                            extremum.append('text')
                                .text(dateFormat(domain[1]))
                                .classed('maximum', true)
                                .attr('transform', `translate(${scales.x.range()[1] - 211})`)
                                .attr('text-anchor', 'end');
                        },
                        lineSeparator:function(axesContainer, scales, configuration, dimensions){
                            return function(data){
                                var separators = axesContainer.selectAll('.line-separator').data(data);
                                if(!separators.size()){
                                    separators.enter()
                                        .append('g')
                                        .classed('line-separator', true)
                                        .append('line');
                                }
                                separators
                                    .attr('transform', (d, i) => `translate(0, ${scales.y(i) + configuration.lineHeight})`);
                                separators.select('line').attr('x1',0).attr('x2',dimensions.width);
                                separators.exit().remove();
                            }
                        },
                        xAxis:function(xScale, configuration, where) {
                            const tickFormatData = configuration.tickFormat.map(t => t.slice(0));
                            const tickFormat = configuration.locale ? configuration.locale.timeFormat.multi(tickFormatData) : d3.time.format.multi(tickFormatData);

                            const axis = d3.svg.axis()
                                .scale(xScale)
                                .orient(where)
                                .tickFormat(tickFormat);

                            if (typeof configuration.axisFormat === 'function') {
                                configuration.axisFormat(axis);
                            }

                            return axis;
                        },
                        drawAxis:function(svg, xScale, configuration, orientation, y){
                            var drawAxisFun = function(svg,xScale,configuration,orientation,y){
                                var gOrientation = svg.select('.x-axis,.'+orientation);
                                if(!gOrientation.size()){
                                    gOrientation = svg.append('g')
                                        .classed('x-axis', true)
                                        .classed(orientation, true);
                                }
                                gOrientation
                                    .attr('transform', `translate(${configuration.margin.left}, ${y})`)
                                    .call(scope.api.xAxis(xScale, configuration, orientation));
                            }
                            return{
                                drawTopAxis : (svg, xScale, configuration, dimensions) => drawAxisFun(svg, xScale, configuration, 'top', configuration.margin.top - 40),
                                drawBottomAxis : (svg, xScale, configuration, dimensions) => drawAxisFun(svg, xScale, configuration, 'bottom', +dimensions.height - 21)
                            }
                        },
                        boolOrReturnValue:function(x, data){
                            return (typeof x === 'function' ? x(data) : x);
                        },
                        axis:function(axesContainer, scales, configuration, dimensions){
                            return function(data){
                                var axisFun = function(orientation){
                                    var selection = axesContainer.selectAll(`.x-axis.${orientation}`).data([{}]);
                                    if(!selection.size()){
                                        selection.enter()
                                            .append('g')
                                            .classed('x-axis', true)
                                            .classed(orientation, true)
                                            .call(scope.api.xAxis(scales.x, configuration, orientation));
                                    }
                                    selection.attr('transform', `translate(0,${orientation === 'bottom' ? dimensions.height + 5 : 0})`)
                                        .call(scope.api.xAxis(scales.x, configuration, orientation));

                                    selection.exit().remove();
                                };

                                if (scope.api.boolOrReturnValue(configuration.hasTopAxis, data)) {
                                    axisFun('top');
                                }

                                if (scope.api.boolOrReturnValue(configuration.hasBottomAxis, data)) {
                                    axisFun('bottom');
                                }
                            }
                        },
                        filterData:function(data, scale) {
                            // const [min, max] = scale.domain();
                            var minMax = scale.domain();
                            return data.filter(d => d >= minMax[0] && d <= minMax[1]);
                        },
                        label:function(container, scales, config){
                            return function(data){
                                const labels = container.selectAll('.label').data(data);

                                const text = d => {
                                    const count = scope.api.filterData(d.dates, scales.x).length;
                                    return d.name + (count > 0 ? ` (${count})` : '');
                                };

                                labels.text(text);
                                if(!labels.size()){
                                    labels.enter()
                                        .append('text')
                                        .classed('label', true)
                                        .attr('x', 180)
                                }
                                labels
                                    .attr('x', 180)
                                    .attr('transform', (d, idx) => `translate(0, ${40 + scales.y(idx)})`)
                                    .attr('text-anchor', 'end')
                                    .text(text);

                                labels.exit().remove();
                            }
                        },
                        createColor:function(id){
                            var color = ['blue','lightblue','red','violet','coral','lightcoral','gray','lightgray','brown','burlywood']
                            id = id%10;
                            return color[id];
                        },
                        drops:function(svg, scales, configuration){
                            return function(data){
                                const dropLines = svg.selectAll('.drop-line').data(data);
                                if(!dropLines.size()){
                                    dropLines.enter()
                                        .append('g')
                                        .classed('drop-line', true);
                                }
                                dropLines.attr('transform', (d, idx) => `translate(10, ${40 + configuration.lineHeight + scales.y(idx)})`)
                                    .attr('fill',(d, idx) => scope.api.createColor(idx));
                                dropLines.each(function (drop) {
                                    const drops = d3.select(this).selectAll('.drop').data(drop.dates);

                                    drops.attr('cx', d => scales.x(d) + 200);
                                    if(!drops.size()){
                                        drops.enter()
                                            .append('circle')
                                            .classed('drop', true);
                                    }
                                    drops.attr('r', 5)
                                            .attr('cx', d => scales.x(d) + 200)
                                            .attr('cy', -5)
                                            .attr('fill', configuration.eventColor);
                                    drops.exit().remove();
                                });

                                dropLines.exit().remove();
                            }
                        }
                    };
                    angular.forEach(scope.events, function(eventHandler, event){
                        scope.$on(event, function(e, args){
                            return eventHandler(e, scope, args);
                        });
                    });
                    scope.$watch('config', function(newConfig, oldConfig){
                        if (newConfig !== oldConfig){
                            scope.config = angular.extend(defaultConfig, newConfig);
                            scope.api.update();
                        }
                    }, true);
                }
            }
        }])

        .factory('radialUtils',function(){
            return {};
        })
})();