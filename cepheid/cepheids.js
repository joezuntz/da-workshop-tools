var margin = {
        top: 60,
        right: 60,
        bottom: 60,
        left: 60
    },
    width = 600 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;


var cepheids = [
    'CEP3874',
    'CEP1391',
    'CEP2944',
    'CEP0871',
    'CEP0648',
    'CEP3158',
    'CEP0328',
    'CEP3396',
    'CEP4501',
    'CEP2694'
];

const inlineStyles = target => {
  const selfCopyCss = elt => {
    const computed = window.getComputedStyle(elt);
    const css = {};
    for (let i = 0; i < computed.length; i++) {
      css[computed[i]] = computed.getPropertyValue(computed[i]);
    }

    for (const key in css) {
      elt.style[key] = css[key];
    }
    return css;
  };

  const root = document.querySelector(target);
  selfCopyCss(root);
  root.querySelectorAll('*').forEach(elt => selfCopyCss(elt));
};


function copyToCanvas(target) {
    var svg = document.querySelector(target);
    var svgData = new XMLSerializer().serializeToString(svg);
    var canvas = document.createElement('canvas');
    var svgSize = svg.getBoundingClientRect();

    //Resize can break shadows
    canvas.width = svgSize.width;
    canvas.height = svgSize.height;
    canvas.style.width = svgSize.width;
    canvas.style.height = svgSize.height;

    var ctxt = canvas.getContext('2d');

    var img = document.createElement('img');
    var b64 = btoa(unescape(encodeURIComponent(svgData)));
    img.setAttribute('src', 'data:image/svg+xml;base64,' + b64);
    ctxt.drawImage(img, 0, 0);

    var element = document.getElementById("space_for_plot");
    element.appendChild(img);
    return b64;
}

function array_mean(elmt){
    var sum = 0;
    for( var i = 0; i < elmt.length; i++ ){
        sum += elmt[i];
    }

    var avg = sum / elmt.length;
    return avg;
}

function fit_data(data){
    if (data.length < 3){
        return [NaN, NaN];
    }

    var x = [];
    var y = [];
    for ( var i = 0; i < data.length; i++){
        x.push(data[i][0]);
        y.push(data[i][1]);
    }

    xbar = array_mean(x);
    ybar = array_mean(y);

    var b1 = 0.0;
    var b2 = 0.0;

    for ( var i = 0; i < data.length; i++){
        b1 += (x[i] - xbar) * (y[i] - ybar);
        b2 += (x[i] - xbar) * (x[i] - xbar);
    }
    b = b1 / b2;
    a = ybar - b * xbar;

    return [b, a];
}



function plot_data(){

    d3.select("svg").remove();
    d3.select("img").remove();

    var x = d3.scale.linear()
        .range([0, width])
        .domain([0.0, 2.0]);

    var y = d3.scale.linear()
        .range([height, 0])
        .domain([10.0, 20.0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");

    var svg = d3.select("body").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg.selectAll("line.horizontalGrid").data(y.ticks(8)).enter()
        .append("line")
            .attr(
            {
                "class":"horizontalGrid",
                "x1" : 0,
                "x2" : width,
                "y1" : function(d){ return y(d);},
                "y2" : function(d){ return y(d);},
                "fill" : "none",
                "shape-rendering" : "crispEdges",
                "stroke" : "gray",
                "stroke-width" : "1px"
            });

    svg.selectAll("line.verticalGrid").data(x.ticks(10)).enter()
        .append("line")
            .attr(
            {
                "class":"verticalGrid",
                "y1" : 0,
                "y2" : height,
                "x1" : function(d){ return x(d);},
                "x2" : function(d){ return x(d);},
                "fill" : "none",
                "shape-rendering" : "crispEdges",
                "stroke" : "gray",
                "stroke-width" : "1px"
            });




    let apparent_magnitudes = new Map();
    apparent_magnitudes.set('CEP3874', 14.782);
    apparent_magnitudes.set('CEP1391', 13.796);
    apparent_magnitudes.set('CEP2944', 13.336);
    apparent_magnitudes.set('CEP0871', 14.298);
    apparent_magnitudes.set('CEP0648', 13.696);
    apparent_magnitudes.set('CEP3158', 12.678);
    apparent_magnitudes.set('CEP0328', 12.088);
    apparent_magnitudes.set('CEP3396', 13.178);
    apparent_magnitudes.set('CEP4501', 14.171);
    apparent_magnitudes.set('CEP2694', 14.739);

    var data = [];

    function add_data_point(name){
        var v = d3.select('#' + name).property("value")
        if (v == ""){
            return;
        }
        var f = parseFloat(v);

        if (isNaN(f)){
            return;
        }

        data.push([Math.log10(f), apparent_magnitudes.get(name)]);
    }

    

    cepheids.forEach(add_data_point);



    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .append("text")
        .attr("class", "label")
        .attr("x", width/2+50)
        .attr("y", 50)
        .style("text-anchor", "end")
        .text("log10(Period)");

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("class", "label")
        .attr("transform", "rotate(-90)")
        .attr("x", -120)
        .attr("y", -60)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Apparent Magnitude (m_app)")


    svg.selectAll(".dot")
        .data(data)
        .enter().append("circle")
        .attr("class", "dot")
        .attr("r", 3.5)
        .attr("cx", function(d) {
            return x(d[0]);
        })
        .attr("cy", function(d) {
            return y(d[1]);
        });

    line_fit = fit_data(data);

    if (!isNaN(line_fit[0])){

        var line = d3.svg.line()
            .x(function(d) {
                return x(d);
            })
            .y(function(d) {
                return y(line_fit[0] * d + line_fit[1]);
            });            

        svg.append("path")
            .datum([0.0, 2.0])
            .attr("class", "line")
            .attr("d", line); 
    }
    inlineStyles("svg");
    var b64 = copyToCanvas("svg");
    d3.select("svg").remove();
    return b64;
}



var items = cepheids.concat([
    "slope",
    "intercept",
    "mu",
    "b1",
    "Mabs",
    "dist",
    "uun"
    ])
    
function save_item(name){
    var x = d3.select('#' + name).property("value");
    if (x !== null) localStorage.setItem(name,  x);
}
function load_item(name){
    var x = localStorage.getItem(name);
    if (x !== null) d3.select('#' + name).property("value", x);
}

window.pagehide = function() {
    items.forEach(save_item);
}

window.onload = function() {
    items.forEach(load_item);
}

