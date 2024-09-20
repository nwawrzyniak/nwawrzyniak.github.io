function setBGfromRGB() {
  var red, green, blue = "";
  var r = parseInt(document.getElementById('red-value').value);
  var g = parseInt(document.getElementById('green-value').value);
  var b = parseInt(document.getElementById('blue-value').value);
  if(r >= 0 && r <= 255 && g >= 0 && g <= 255 && b >= 0 && b <= 255) {
    red = r.toString(16);
    green = g.toString(16);
    blue = b.toString(16);
    if (red.toString().length == 1) {
      red = "0" + red;
    }
    if (green.toString().length == 1) {
      green = "0" + green;
    }
    if (blue.toString().length == 1) {
      blue = "0" + blue;
    }
    var colorString = "#" + red + green + blue;
    document.body.style.backgroundColor = colorString;
    document.getElementById('elements').style.visibility = 'hidden';
  }
}

function setBG(color) {
  document.body.style.backgroundColor = color;
  document.getElementById('elements').style.visibility = 'hidden';
}
