var active_rectangle = null;
var active_button = null;
var mousedown = false;
var chart = null;
var adding_giants = false;
var adding_main_sequence = false;
var giant_location = null;
var main_sequence_location = null;



var stars = [
    "O5",
    "B5",
    "A5",
    "F5",
    "G5",
    "K5",
    "M0",
    "M5",
    "G5 (Giant)",
    "K0 (Giant)",
    "K5 (Giant)",
    "M0 (Giant)",
];

var colors = {
    "O5": "#3b4cc0",
    "B5": "#6788ee",
    "A5": "#9abbff",
    "F5": "#c9d7f0",
    "G5": "#edd1c2",
    "K5": "#f7a889",
    "M0": "#e26952",
    "M5": "#b40426",
    "G5 (Giant)": "#edd1c2",
    "K0 (Giant)": "#f7a889",
    "K5 (Giant)": "#f7a889",
    "M0 (Giant)": "#e26952",
}

let original_draw = Chart.controllers.scatter.prototype.draw;
Chart.helpers.extend(Chart.controllers.scatter.prototype, {
    draw: function() {
        original_draw.apply(this, arguments);
        // text styles below
        this.chart.chart.ctx.textAlign = "center"
        this.chart.chart.ctx.font = "16px Arial";
        this.chart.chart.ctx.fillStyle = "black";

        if (main_sequence_location != null) {
            this.chart.chart.ctx.fillText("Main Sequence", main_sequence_location.x, main_sequence_location.y)
        }
        if (giant_location != null) {
            this.chart.chart.ctx.fillText("Giants", giant_location.x, giant_location.y)
        }
    }
});

const n_star = stars.length;


var data_locations = [];


function load_data_locations() {
    data_locations = [];
    var msx = load_item("ms-x");
    var msy = load_item("ms-y");
    if ((msx != null) && (msy != null)) {
        main_sequence_location = {
            x: msx,
            y: msy,
        }
    } else {
        main_sequence_location = null;
    }
    var gx = load_item("giant-x");
    var gy = load_item("giant-y");
    if ((gx != null) && (gy != null)) {
        giant_location = {
            x: gx,
            y: gy,
        }
    } else {
        giant_location = null;
    }

    for (var i = 0; i < n_star; i++) {
        var px = load_item(stars[i] + "-x");
        var py = load_item(stars[i] + "-y");
        if (px == null || py == null) {
            data_locations.push({
                x: -0.6,
                y: -6 + 2 * i
            });
        } else {

            var p = {
                x: px,
                y: py
            };
            data_locations.push(p);
        }

    }
}

function toggle_label_main_sequence() {
    if (adding_giants) {
        toggle_label_giants();
    }

    var ms = document.getElementById('main_sequence');
    var p = document.getElementById('whats_happening');
    if (adding_main_sequence) {
        adding_main_sequence = false;
        ms.style.background = null;
        p.innerHTML = "&nbsp;";

    } else {
        adding_main_sequence = true;
        ms.style.background = '#9999CC'
        p.innerHTML = "Click in the middle of the main sequence";
    }
}

function toggle_label_giants() {
    if (adding_main_sequence) {
        toggle_label_main_sequence();
    }

    var ms = document.getElementById('giants');
    var p = document.getElementById('whats_happening');
    if (adding_giants) {
        adding_giants = false;
        ms.style.background = null;
        p.innerHTML = "&nbsp;";

    } else {
        adding_giants = true;
        ms.style.background = '#9999CC'
        p.innerHTML = "Click below the giant branch";
    }
}

function reset() {

    localStorage.clear();
    load_data_locations();
    redraw_chart();
}

function write_location(xy) {
    var p = document.getElementById('what_now');
    var x = xy.x.toFixed(2);
    var y = xy.y.toFixed(2);
    p.innerHTML = `B-V = ${x},  M_V = ${y}`;
}

function clear_location() {
    var p = document.getElementById('what_now');
    p.innerHTML = "B-V = ........,  M_V = ........";
}

function canvas_xy_to_chart_xy(chart, p) {
    var yTop = chart.chartArea.top;
    var yBottom = chart.chartArea.bottom;

    var yMin = chart.scales['y-axis-1'].min;
    var yMax = chart.scales['y-axis-1'].max;
    var newY = 0;

    if (p.y <= yBottom && p.y >= yTop) {
        newY = Math.abs((p.y - yTop) / (yBottom - yTop));
        newY = (newY - 1) * -1;
        newY = newY * (Math.abs(yMax - yMin)) + yMin;
    };

    var xTop = chart.chartArea.left;
    var xBottom = chart.chartArea.right;
    var xMin = chart.scales['x-axis-1'].min;
    var xMax = chart.scales['x-axis-1'].max;
    var newX = 0;

    if (p.x <= xBottom && p.x >= xTop) {
        newX = Math.abs((p.x - xTop) / (xBottom - xTop));
        newX = newX * (Math.abs(xMax - xMin)) + xMin;
    };

    return {
        x: newX,
        y: newY,
    }
};


function redraw_chart() {
    if (chart) {
        chart.destroy();
    }

    var ctx = document.getElementById('main-canvas').getContext('2d');
    load_data_locations()
    ctx.clearRect(0, 0, ctx.width, ctx.height);
    var datasets = [];

    for (var i = 0; i < stars.length; i++) {
        var dataset = {
            label: stars[i],
            borderColor: colors[stars[i]],
            backgroundColor: colors[stars[i]],
            pointStyle: "circle",
            radius: "6",
            hoverRadius: 10,
            data: [data_locations[i]],
        };
        datasets.push(dataset);
    }

    var data = {
        datasets: datasets,
    };


    var axis_choices = {
        xAxes: [{
            scaleLabel: {
                display: true,
                labelString: "B - V",
                fontSize: 16,
            },
            ticks: {
                suggestedMin: -0.5,
                suggestedMax: 2,
                stepSize: 0.2,
                fontSize: 16,
            },
            type: 'linear'
        }],
        yAxes: [{
            scaleLabel: {
                display: true,
                labelString: "M_V",
                fontSize: 16,
            },
            ticks: {
                reverse: true,
                suggestedMin: -10,
                suggestedMax: 15,
                stepSize: 2.0,
                fontSize: 16,
            },
            type: 'linear'
        }]
    };

    var chart_config = {
        type: 'scatter',
        data: data,
        options: {
            animation: {
                duration: 0
            },
            tooltips: {
                enabled: true,
                callbacks: {
                    label: function(tooltipItem, data) {
                        return data.datasets[tooltipItem.datasetIndex].label;
                    }
                }
            },
            onClick: handle_down,
            hover: {
                mode: null
            },
            responsive: true,
            maintainAspectRatio: false,
            title: {
                display: false,
                text: 'Chart.js Scatter Chart'
            },
            layout: {
                padding: {
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0
                }
            },
            legend: {
                display: false
            },
            scales: axis_choices,
            dragData: true,
            dragX: true,
            dragOptions: {
                showTooltip: true,
            },
            onDragStart: function(event, element) {},
            onDrag: function(event, datasetIndex, index, value) {
                // change cursor style to grabbing during drag action
                event.target.style.cursor = 'grabbing'
                // where e = event
                write_location(value);
            },
            onDragEnd: function(event, datasetIndex, index, value) {
                // restore default cursor style upon drag release
                event.target.style.cursor = 'default'

                data_locations[datasetIndex] = value;
                save_item(stars[datasetIndex] + "-x", value.x);
                save_item(stars[datasetIndex] + "-y", value.y);
                clear_location();

            },
            hover: {
                onHover: function(e) {
                    // indicate that a datapoint is draggable by showing the 'grab' cursor when hovered
                    const point = this.getElementAtEvent(e)
                    if (point.length) e.target.style.cursor = 'grab'
                    else e.target.style.cursor = 'default'
                }
            },
        },

    }

    chart = new Chart(ctx, chart_config);

}

function get_canvas_location(event) {
    var canvas = document.getElementById('main-canvas');
    const rect = canvas.getBoundingClientRect()
    var x = event.clientX - rect.left
    var y = event.clientY - rect.top
    return {
        x: x,
        y: y,
    }
}

function handle_down(event) {
    var canvas = document.getElementById('main-canvas');
    var canvas_xy = get_canvas_location(event);

    if (adding_giants) {
        var ctx = canvas.getContext('2d');
        // Draw the text
        toggle_label_giants();
        giant_location = canvas_xy;
        save_item("giant-x", canvas_xy.x);
        save_item("giant-y", canvas_xy.y);
        redraw_chart();
    } else if (adding_main_sequence) {
        toggle_label_main_sequence();
        main_sequence_location = canvas_xy;
        save_item("ms-x", canvas_xy.x);
        save_item("ms-y", canvas_xy.y);
        redraw_chart();
    }
}



function save_item(name, value) {
    localStorage.setItem(name, value);
}

function load_item(name) {
    return localStorage.getItem(name);
}



window.onload = function() {
    redraw_chart();
}