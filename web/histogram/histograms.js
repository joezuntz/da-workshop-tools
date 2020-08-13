const xmin = 0.0
const xmax = 10.0
const dx = 1.0

function split_lines(t) { return t.split(/\r\n|\r|\n/); }
// https://stackoverflow.com/questions/21895233/how-in-node-to-split-string-by-newline-n

function make_histogram(){

    var txt = document.getElementById("numbers");
    var lines = split_lines(txt.value);

    var x = [];
    lines.forEach(function(line){
        var y = parseFloat(line);
        if (!isNaN(y)){
            x.push(y);
        }

    });


    var trace = {
        x: x,
        type: 'histogram',
        xaxis: {title: "Value"}, 
        yaxis: {title: "Count"},
        xbins: { 
            start: xmin,
            end: xmax,
            size: dx, 
        }
    };

    var layout = {
        xaxis: {
            ticks: 'inside',
            range: [xmin, xmax],
        },
        yaxis: {
            ticks: 'inside',
        }
    };

    var data = [trace];

    Plotly.newPlot('my_histogram', data, layout);

}