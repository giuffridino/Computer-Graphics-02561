window.onload = function init()
{
    var canvas = document.getElementById("c");
    var gl = canvas.getContext("webgl");
    gl.clearColor(1, 0.5843, 0.9294, 1.0);
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);

    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    var ext = gl.getExtension('OES_element_index_uint');
    if(!ext){
        console.log('Warning: Unable to use an extension');
    }

    var pointsArray = [];
    var normalsArray = [];
    // var colorArray = [];
    // const initColor = vec4(1.0, 0.0, 1.0, 1.0);
    var va = vec4(0.0, 0.0, 1.0, 1);
    var vb = vec4(0.0, 0.942809, -0.333333, 1);
    var vc = vec4(-0.816497, -0.471405, -0.333333, 1);
    var vd = vec4(0.816497, -0.471405, -0.333333, 1);
    var Subdivis = 0;

    tetrahedron(va, vb, vc, vd, Subdivis);

    function tetrahedron(a, b, c, d, n)
    {
        divideTriangle(a, b, c, n);
        divideTriangle(d, c, b, n);
        divideTriangle(a, d, b, n);
        divideTriangle(a, c, d, n);
    }
    function divideTriangle(a, b, c, count)
    {
        if (count > 0) 
        {
            var ab = normalize(mix(a, b, 0.5), true);
            var ac = normalize(mix(a, c, 0.5), true);
            var bc = normalize(mix(b, c, 0.5), true);
            divideTriangle(a, ab, ac, count - 1);
            divideTriangle(ab, b, bc, count - 1);
            divideTriangle(bc, c, ac, count - 1);
            divideTriangle(ab, bc, ac, count - 1);
        }
        else 
        {
            triangle(a, b, c);
        }
    }
    function triangle(a, b, c)
    {
        pointsArray.push(a);
        pointsArray.push(b);
        pointsArray.push(c);
        normalsArray.push(vec4(a[0], a[1], a[2], 0.0));
        normalsArray.push(vec4(b[0], b[1], b[2], 0.0));
        normalsArray.push(vec4(c[0], c[1], c[2], 0.0));
        // colorArray.push(initColor);
        // colorArray.push(initColor);
        // colorArray.push(initColor);
    }
    console.log("completed tetrahedron")

    gl.vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);
    var vPosition = gl.getAttribLocation(program, "a_Position");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    gl.nBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);
    var nPosition = gl.getAttribLocation(program, "surface_normal");
    gl.vertexAttribPointer(nPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(nPosition);
    
    function initSphere(gl, numSubdivis)
    {
        pointsArray = [];
        colorArray = [];
        normalsArray = [];
        tetrahedron(va, vb, vc, vd, numSubdivis);
        gl.deleteBuffer(gl.vBuffer);
        gl.vBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, gl.vBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);
        // var vPosition = gl.getAttribLocation(program, "a_Position");
        gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vPosition);
        // gl.deleteBuffer(cBuffer);
        // var cBuffer = gl.createBuffer();
        // gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
        // gl.bufferData(gl.ARRAY_BUFFER, flatten(colorArray), gl.STATIC_DRAW);
        // // var vColors = gl.getAttribLocation(program, "a_Color");
        // gl.vertexAttribPointer(vColors, 4, gl.FLOAT, false, 0, 0);
        // gl.enableVertexAttribArray(vColors);
        gl.deleteBuffer(nBuffer);
        var nBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);
        gl.vertexAttribPointer(nPosition, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(nPosition);
    }

    var stopRotation = false;
    var stopRotationButton = document.getElementById("StopRotation");
    stopRotationButton.addEventListener("click", function()
    {
        if (stopRotation) 
        {
            stopRotation = false;
            render();
        }
        else
        {
            stopRotation = true;
        }
    });
    var increaseButton = document.getElementById("IncreaseSubdivisions");
    increaseButton.addEventListener("click", function()
    {
        Subdivis ++;
        initSphere(gl, Subdivis);
        console.log(Subdivis, pointsArray.length);
    });
    var decreaseButton = document.getElementById("DecreaseSubdivisions");
    decreaseButton.addEventListener("click", function()
    {
        if(Subdivis > 0)
        {
            Subdivis --;
        }
        initSphere(gl, Subdivis);
        console.log(Subdivis, pointsArray.length);
        // requestAnimationFrame(render);
    });

    var kaLoc = gl.getUniformLocation(program, "k_a");
    gl.uniform1f(kaLoc, 1.0);
    var ksLoc = gl.getUniformLocation(program, "k_s");
    gl.uniform1f(ksLoc, 1.0);
    var kdLoc = gl.getUniformLocation(program, "k_d");
    gl.uniform1f(kdLoc, 1.0);
    var LeLoc = gl.getUniformLocation(program, "L_e");
    gl.uniform3fv(LeLoc, vec3(1.0, 1.0, 1.0));
    var sLoc = gl.getUniformLocation(program, "s");
    gl.uniform1f(sLoc, 100.0);
    var kaSlider = document.getElementById("k_a")
    kaSlider.addEventListener("input", function(ev)
    {
        gl.uniform1f(kaLoc, ev.srcElement.value);
        if (stopRotation) 
        {
            render();
        }
    });
    var ksSlider = document.getElementById("k_s")
    ksSlider.addEventListener("input", function(ev)
    {
        gl.uniform1f(ksLoc, ev.srcElement.value);
        if (stopRotation) 
        {
            render();
        }
    });
    var kdSlider = document.getElementById("k_d")
    kdSlider.addEventListener("input", function(ev)
    {
        gl.uniform1f(kdLoc, ev.srcElement.value);
        if (stopRotation) 
        {
            render();
        }
    });
    var LeSlider = document.getElementById("L_e")
    LeSlider.addEventListener("input", function(ev)
    {
        gl.uniform3fv(LeLoc, vec3(ev.srcElement.value, ev.srcElement.value,ev.srcElement.value));
        if (stopRotation) 
        {
            render();
        }
    });
    var sSlider = document.getElementById("s")
    sSlider.addEventListener("input", function(ev)
    {
        gl.uniform1f(sLoc, ev.srcElement.value);
        if (stopRotation) 
        {
            render();
        }
    });

    // var cBuffer = gl.createBuffer();
    // gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    // gl.bufferData(gl.ARRAY_BUFFER, flatten(colorArray), gl.STATIC_DRAW);
    // var vColors = gl.getAttribLocation(program, "a_Color");
    // gl.vertexAttribPointer(vColors, 4, gl.FLOAT, false, 0, 0);
    // gl.enableVertexAttribArray(vColors);

    const radius = 3.0;
    var alpha = 0;

    // var view_matrix = lookAt(vec3(0.0, 0.0, 2.0), vec3(0.0, 0.0, 0.0), vec3(1.0, 0.0, 0.0));
    var view_matrix = lookAt(vec3(radius * Math.sin(alpha), 0.0, radius * Math.cos(alpha)), vec3(0.0, 0.0, 0.0), vec3(1.0, 0.0, 0.0));
    var VLoc = gl.getUniformLocation(program, "view_matrix");
    gl.uniformMatrix4fv(VLoc, false, flatten(view_matrix));

    // console.log(canvas.width, canvas.height, canvas.width / canvas.height);
    var projection_matrix = perspective(90, canvas.width / canvas.height, 0.1, 20.0);
    var PLoc = gl.getUniformLocation(program, "projection_matrix");
    gl.uniformMatrix4fv(PLoc, false, flatten(projection_matrix));

    var model_matrix = mat4();
    // var Sx = 0.5, Sy = 0.5, Sz = 0.5;
    // var xformMatrix = new Float32Array([
    //     Sx,   0.0,  0.0,  0.0,
    //     0.0,  Sy,   0.0,  0.0,
    //     0.0,  0.0,  Sz,   0.0,
    //     0.0,  0.0,  0.0,  1.0  
    // ]);
    var MLoc = gl.getUniformLocation(program, "model_matrix");
    gl.uniformMatrix4fv(MLoc, false, flatten(model_matrix));

    var normal_matrix = normalMatrix(view_matrix, true);
    var NLoc = gl.getUniformLocation(program, "normal_matrix");
    gl.uniformMatrix3fv(NLoc, false, flatten(normal_matrix));

    var EyeLoc = gl.getUniformLocation(program, "eye_pos");
    gl.uniform3fv(EyeLoc, flatten(vec3(radius * Math.sin(alpha), 0.0, radius * Math.cos(alpha))));
    function render()
    {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, pointsArray.length)
        alpha = alpha + 0.01;
        var eye_pos = vec3(radius * Math.sin(alpha), 0.0, radius * Math.cos(alpha));
        gl.uniform3fv(EyeLoc, flatten(vec3(radius * Math.sin(alpha), 0.0, radius * Math.cos(alpha))));
        view_matrix = lookAt(eye_pos, vec3(0.0, 0.0, 0.0), vec3(0.0, 1.0, 0.0));
        // view_matrix = lookAt(eye_pos, vec3(0.0, 0.0, 0.0), vec3(0.0, 1.0, 0.0));
        gl.uniformMatrix4fv(VLoc, false, flatten(view_matrix));
        if (!stopRotation) 
        {
            requestAnimationFrame(render);
        }
        // requestAnimationFrame(render);
    }
    render();
}