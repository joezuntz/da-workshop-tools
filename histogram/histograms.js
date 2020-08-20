const xmin = 1.0
const xmax = 6.0
const dx = 0.25

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
        width: 800,
        hwight: 600,
        xaxis: {
            ticks: 'inside',
            range: [xmin, xmax],
                showline: true,
        },
        yaxis: {
            ticks: 'inside',
            showline: true,
            range: [0,null]
        }
    };

    var data = [trace];

    Plotly.newPlot('my_histogram', data, layout, width=800, height=600);

}