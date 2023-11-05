window.onload = function init()
{
    var canvas = document.getElementById("c");
    var gl = canvas.getContext("webgl");
    gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);

    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    var max_verts = 1000;
    var index = 0; var numPoints = 0;
    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, max_verts * sizeof['vec2'], gl.STATIC_DRAW);
    var vPosition = gl.getAttribLocation(program, "a_Position");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    
    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, max_verts * sizeof['vec4'], gl.STATIC_DRAW);
    var vColors = gl.getAttribLocation(program, "a_Color");
    gl.vertexAttribPointer(vColors, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColors);

    canvas.addEventListener("click", function (ev)
    {
        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
        var bbox = ev.target.getBoundingClientRect();
        var mousepos = vec2(2 * (ev.clientX - bbox.left) / canvas.width - 1, 2 * (canvas.height - ev.clientY + bbox.top - 1) / canvas.height - 1);
        gl.bufferSubData(gl.ARRAY_BUFFER, index * sizeof['vec2'], flatten(mousepos));
        gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, index * sizeof['vec4'], flatten(colors[colorMenu.selectedIndex]));
        numPoints = Math.max(numPoints, ++index); index %= max_verts;
        window.requestAnimationFrame(render, canvas);
    });

    var clearMenu = document.getElementById("clearMenu");
    var clearButton = document.getElementById("clearButton");
    var colorMenu = document.getElementById("colorMenu");
    var colors = [vec4(0.0, 0.0, 0.0, 1.0), vec4(1.0, 0.0, 0.0, 1.0), vec4(1.0, 1.0, 0.0, 1.0), vec4(0.0, 1.0, 0.0, 1.0),
        vec4(0.0, 0.0, 1.0, 1.0), vec4(1.0, 0.0, 1.0, 1.0), vec4(0.0, 1.0, 1.0, 1.0), vec4(0.3921, 0.5843, 0.9294, 1.0)];

    clearButton.addEventListener("click", function()
    {
        clear_index = clearMenu.selectedIndex;
        var bgcolor = colors[clearMenu.selectedIndex];
        gl.clearColor(bgcolor[0], bgcolor[1], bgcolor[2], bgcolor[3]);
        numPoints = 0;
        index = 0;
        window.requestAnimationFrame(render, canvas);
    });

    function render()
    {
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.POINTS, 0, numPoints);
    }
    render();
    
}