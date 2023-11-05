window.onload = function init()
{
    var canvas = document.getElementById("c");
    var gl = canvas.getContext("webgl");
    gl.clearColor(0.1, 0.3, 0.6, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
}