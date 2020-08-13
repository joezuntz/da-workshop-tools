var currentImage = null;
var point1 = null;
var point2 = null;
var nextPoint = 1;


window.onload = function() {
    var c = document.getElementById("main_canvas");
    c.addEventListener('click', handleClick, false);

}

// Converts click location to canvas location
function getMousePosition(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}

function handleClick(x){
    var c = document.getElementById("main_canvas");
    p = getMousePosition(c, x);
    if (nextPoint == 1){
        point1 = p;
    }
    else{
        point2 = p;
    }

    nextPoint = 1 - nextPoint;
    redrawImage(currentImage);

}

function draw_arrow(context, fromx, fromy, tox, toy) {
  var headlen = 10; // length of head in pixels
  var dx = tox - fromx;
  var dy = toy - fromy;
  var angle = Math.atan2(dy, dx);

  context.moveTo(fromx, fromy);

  // start arrowhead
  context.lineTo(fromx + headlen * Math.cos(angle - Math.PI / 2), fromy + headlen * Math.sin(angle - Math.PI / 2));
  context.moveTo(fromx, fromy);
  context.lineTo(fromx + headlen * Math.cos(angle + Math.PI / 2), fromy + headlen * Math.sin(angle + Math.PI / 2));

  // main line
  context.moveTo(fromx, fromy);
  context.lineTo(tox, toy);

  // end arrowhead
  context.lineTo(tox - headlen * Math.cos(angle - Math.PI / 6), toy - headlen * Math.sin(angle - Math.PI / 6));
  context.moveTo(tox, toy);
  context.lineTo(tox - headlen * Math.cos(angle + Math.PI / 6), toy - headlen * Math.sin(angle + Math.PI / 6));
}

function update_lengths(point1, point2){
    var d2 = Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2);
    var d = Math.sqrt(d2).toFixed(1);
    var theta = (-Math.atan2(point2.y - point1.y, point2.x - point1.x) * 180.0 / Math.PI).toFixed(1);
    length_text = document.getElementById("length_text");
    length_text.innerHTML  = `Line length (pix): ${d}`;
    angle_text = document.getElementById("angle_text");
    angle_text.innerHTML  = `Line angle (deg): ${theta}`;
}


function redrawImage(image){

    // If the image is not yet loaded, nothing to draw
    if (!image){
        return;
    }
    console.log("Redraw");
    var c = document.getElementById("main_canvas");
    var ctx = c.getContext("2d");

    // Draw the b/g image
    ctx.beginPath();
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.drawImage(image, 0, 0, image.width, image.height);
    ctx.stroke();

    dim_text = document.getElementById("dim_text")
    w = image.width.toString();
    h = image.height.toString();
    dim_text.innerHTML = `Image dimensions (pix): ${w} x ${h}`;

    // If points are set draw them too
    if (point1 && point2){
        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#ff0000';
        draw_arrow(ctx, point1.x, point1.y, point2.x, point2.y);
        ctx.stroke();
        update_lengths(point1, point2);
    }
}

function loadAndDrawImage(url){
    // Create an image object. This is not attached to the DOM and is not part of the page.
    var image = new Image();

    // When the image has loaded, draw it to the canvas.
    image.onload = function(){
        redrawImage(image);
    }

    // Now set the source of the image that we want to load
    image.src = url;
    currentImage = image;
}



function handleFileSelect(event) {
    file = document.getElementById('fileChooser').files[0];

    // Check that the file is an image
    if(file.type !== '' && !file.type.match('image.*')) {
        alert("Invalid file type");
        return;
    }

    window.URL = window.URL || window.webkitURL;

    // Create a data URL from the image file
    var imageURL = window.URL.createObjectURL(file);

    loadAndDrawImage(imageURL);
}