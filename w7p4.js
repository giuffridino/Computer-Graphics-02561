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

    var image1 = document.createElement("img");
    image1.crossorigin = "anonymous";
    image1.src = "textures/normalmap.png";
    image1.onload = function(){
        var texture1 = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture1);
        gl.texImage2D(gl.TEXTURE_2D, 0 , gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image1);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture1);
        var texMap2DLoc = gl.getUniformLocation(program, "texMap2D");
        gl.uniform1i(texMap2DLoc, 0);
    };
    

    var g_tex_ready = 0;
    function initTexture(gl)
    {
        var cubemap = ["textures/cm_left.png",
                       "textures/cm_right.png",
                       "textures/cm_top.png",
                       "textures/cm_bottom.png",
                       "textures/cm_back.png",
                       "textures/cm_front.png"];
        gl.activeTexture(gl.TEXTURE1);
        var texture2 = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture2);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        for (let i = 0; i < 6; i++) {
            var image = document.createElement("img");
            image.crossOrigin = "anonymous";
            image.textarget = gl.TEXTURE_CUBE_MAP_POSITIVE_X + i;
            image.onload = function(event)
            {
                var image = event.target;
                gl.activeTexture(gl.TEXTURE1);
                gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
                gl.texImage2D(image.textarget, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, event.target);
                ++g_tex_ready;
            };
            image.src = cubemap[i];
        }
        var texMapLoc = gl.getUniformLocation(program, "texMap");
        gl.uniform1i(texMapLoc, 1);
    }

    var pointsArray = [];
    var normalsArray = [];
    var va = vec4(0.0, 0.0, 1.0, 1);
    var vb = vec4(0.0, 0.942809, -0.333333, 1);
    var vc = vec4(-0.816497, -0.471405, -0.333333, 1);
    var vd = vec4(0.816497, -0.471405, -0.333333, 1);
    var Subdivis = 7;

    // tetrahedron(va, vb, vc, vd, Subdivis);

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
    }

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
    
    function BGQuad(pointsArray)
    {
        pointsArray.push(vec4(-1, -1, 0.99999, 1), vec4(1, -1, 0.99999, 1), vec4(-1, 1, 0.99999, 1), vec4(1, -1, 0.99999, 1), vec4(1, 1, 0.99999, 1), vec4(-1, 1, 0.99999, 1));
    }

    function initSphereAndQuad(gl, numSubdivis)
    {
        pointsArray = [];
        colorArray = [];
        normalsArray = [];
        tetrahedron(va, vb, vc, vd, numSubdivis);
        BGQuad(pointsArray);
        gl.deleteBuffer(gl.vBuffer);
        gl.vBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, gl.vBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);
        gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vPosition);
        gl.deleteBuffer(nBuffer);
        var nBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);
        gl.vertexAttribPointer(nPosition, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(nPosition);
    }
    initSphereAndQuad(gl, Subdivis);

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

    const radius = 3.0;
    var alpha = 0;

    var view_matrix = lookAt(vec3(radius * Math.sin(alpha), 0.0, radius * Math.cos(alpha)), vec3(0.0, 0.0, 0.0), vec3(0.0, 1.0, 0.0));
    var VLoc = gl.getUniformLocation(program, "view_matrix");
    gl.uniformMatrix4fv(VLoc, false, flatten(view_matrix));

    var projection_matrix = perspective(90, canvas.width / canvas.height, 0.1, 20.0);
    var PLoc = gl.getUniformLocation(program, "projection_matrix");
    gl.uniformMatrix4fv(PLoc, false, flatten(projection_matrix));

    var model_matrix = mat4();
    var MLoc = gl.getUniformLocation(program, "model_matrix");
    gl.uniformMatrix4fv(MLoc, false, flatten(model_matrix));

    var normal_matrix = normalMatrix(view_matrix, true);
    var NLoc = gl.getUniformLocation(program, "normal_matrix");
    gl.uniformMatrix3fv(NLoc, false, flatten(normal_matrix));

    var texture_matrix = mat4();
    var TLoc = gl.getUniformLocation(program, "tex_matrix");
    gl.uniformMatrix4fv(TLoc, false, flatten(texture_matrix));

    var EyeLoc = gl.getUniformLocation(program, "eye_pos");
    gl.uniform3fv(EyeLoc, flatten(vec3(radius * Math.sin(alpha), 0.0, radius * Math.cos(alpha))));

    var RLoc = gl.getUniformLocation(program, "reflective");
    gl.uniform1i(RLoc, false, 1);

    function render()
    {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.uniformMatrix4fv(TLoc, false, flatten(mat4()));
        gl.uniformMatrix4fv(PLoc, false, flatten(projection_matrix));
        gl.uniformMatrix4fv(VLoc, false, flatten(view_matrix));
        gl.uniform1i(RLoc, 1);

        gl.drawArrays(gl.TRIANGLES, 0, pointsArray.length - 6);

        var view_inverse = inverse(view_matrix);
        view_inverse[0][3] = view_inverse[1][3] = view_inverse[2][3] = view_inverse[3][3] = 0.0;
        texture_matrix = mult(view_inverse, inverse(projection_matrix));
        gl.uniformMatrix4fv(TLoc, false, flatten(texture_matrix));
        gl.uniformMatrix4fv(PLoc, false, flatten(mat4()));
        gl.uniformMatrix4fv(VLoc, false, flatten(mat4()));
        gl.uniform1i(RLoc, 0);
        gl.drawArrays(gl.TRIANGLES, pointsArray.length - 6, 6);


        alpha = alpha - 0.005;
        var eye_pos = vec3(radius * Math.sin(alpha), 0.0, radius * Math.cos(alpha));
        gl.uniform3fv(EyeLoc, flatten(vec3(radius * Math.sin(alpha), 0.0, radius * Math.cos(alpha))));
        view_matrix = lookAt(eye_pos, vec3(0.0, 0.0, 0.0), vec3(0.0, 1.0, 0.0));
        gl.uniformMatrix4fv(VLoc, false, flatten(view_matrix));
        if (!stopRotation || g_tex_ready < 6) 
        {
            requestAnimationFrame(render);
        }
    }
    initTexture(gl);
    render();
}