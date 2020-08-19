var annotation_locations = new Map();
var active_button = null;
var colors = {
    "O5": "#3b4cc0",
    "B5": "#6788ee",
    "A5": "#9abbff",
    "F5": "#c9d7f0",
    "G5": "#edd1c2",
    "K5": "#f7a889",
    "M0": "#e26952",
    "M5": "#b40426",
    "M5": "#b40426",
    "Turn-off": "#00ff00"
}


window.onload = function() {
    var c = document.getElementById("main_canvas");
    c.addEventListener('click', handle_click, false);
    trigger_redraw();
}

// Converts click location to canvas location
function getMousePosition(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}


function reset(){
    if (active_button){
        active_button.style.background=null;
    }
    annotation_locations.clear();
    active_button = null;
    trigger_redraw();
}

function handle_click(x){

    if (!active_button){
        return;
    }
    var c = document.getElementById("main_canvas");
    p = getMousePosition(c, x);

    annotation_locations.set(active_button.id, p);
    trigger_redraw();
}

function set_active_button(button){
    // toggle current button to off
    if (button == active_button){
        button.style.background=null;
        active_button = null;
    }
    else{
        if (active_button){
            active_button.style.background=null;
            // change color back of previous button
        }
        // set colour of current button
        button.style.background=colors[button.id];
        active_button = button;
    }

}

function get_text_width(context, text, fontSize, fontFace) {
    context.font = fontSize + 'px ' + fontFace;
    return context.measureText(text).width;
}

function click_button(button){
    set_active_button(button);

}

function trigger_redraw(){
    var image = new Image();
    image.src = "NGC188_HRdiagram.png";

    // When the image has loaded, draw it to the canvas.
    image.onload = function(){
        redraw_image(image);
    }

}


function redraw_image(image){

    var c = document.getElementById("main_canvas");
    var ctx = c.getContext("2d");

    // Draw the b/g image
    ctx.beginPath();
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.drawImage(image, 0, 0, image.width, image.height);
    ctx.stroke();
    ctx.font = "12px Verdana";
    for (kv of annotation_locations){
        var text = kv[0];
        var p = kv[1];
        var width = ctx.measureText(text).width + 5
        // Draw the dot
        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.arc(p.x, p.y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = colors[text];
        ctx.fill();
        // Draw the label b/g
        ctx.fillStyle = "white";
        ctx.fillRect(p.x + 1, p.y - 16, width, 17);
        // Draw the label outline
        ctx.lineWidth = 3;
        ctx.strokeStyle = colors[text];
        ctx.strokeRect(p.x + 1, p.y - 16, width, 17);
        // Draw the text
        ctx.fillStyle = "black";
        ctx.fillText(text, p.x+3, p.y - 3);
    }

    // Draw the annotations
}


