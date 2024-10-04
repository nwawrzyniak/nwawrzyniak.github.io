// Function to update the background color of the button and adjust its text color
function updateButtonColor() {
  var r = parseInt(document.getElementById('red-value').value);
  var g = parseInt(document.getElementById('green-value').value);
  var b = parseInt(document.getElementById('blue-value').value);

  if (r >= 0 && r <= 255 && g >= 0 && g <= 255 && b >= 0 && b <= 255) {
    var red = r.toString(16).padStart(2, '0');
    var green = g.toString(16).padStart(2, '0');
    var blue = b.toString(16).padStart(2, '0');
    var colorString = `#${red}${green}${blue}`;
    
    // Update the button's background color
    var button = document.getElementById('submit-color');
    button.style.backgroundColor = colorString;

    // Adjust the text color to ensure high contrast
    button.style.color = getContrastColor(colorString);
  }
}

// Attach event listeners to the input fields to update the button color on change
document.getElementById('red-value').addEventListener('input', updateButtonColor);
document.getElementById('green-value').addEventListener('input', updateButtonColor);
document.getElementById('blue-value').addEventListener('input', updateButtonColor);

// Update the background color of the page when the button is clicked
function setBGfromRGB() {
  var r = parseInt(document.getElementById('red-value').value);
  var g = parseInt(document.getElementById('green-value').value);
  var b = parseInt(document.getElementById('blue-value').value);

  if (r >= 0 && r <= 255 && g >= 0 && g <= 255 && b >= 0 && b <= 255) {
    var red = r.toString(16).padStart(2, '0');
    var green = g.toString(16).padStart(2, '0');
    var blue = b.toString(16).padStart(2, '0');
    var colorString = `#${red}${green}${blue}`;
    
    // Set the background color of the page
    document.body.style.backgroundColor = colorString;
    document.getElementById('elements').style.visibility = 'hidden';
  }
}

function setBG(color) {
  document.body.style.backgroundColor = color;
  document.getElementById('elements').style.visibility = 'hidden';
}

// Function to calculate the contrast color based on background color
function getContrastColor(backgroundColor) {
  // Convert hex to RGB first
  let rgb = hexToRgb(backgroundColor);
  if (!rgb) {
    return '#000000'; // Default to black if invalid color
  }

  // Calculate relative luminance
  let luminance = 0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b;

  // Return black for bright colors and white for dark colors
  return luminance > 128 ? '#000000' : '#FFFFFF';
}

// Function to convert hex color to RGB
function hexToRgb(hex) {
  let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}
