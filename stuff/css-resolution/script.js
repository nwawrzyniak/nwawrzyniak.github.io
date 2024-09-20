function onLoad() {
  const output = document.querySelector("#css-resolution-output");
  output.innerHTML += `CSS Width: ${window.innerWidth}, CSS Height: ${window.innerHeight}, Device Pixel Ratio: ${window.devicePixelRatio}`;
  console.log("done");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", onLoad);
} else {
  onLoad();
}
