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

    function initObject(gl, fileName, scale, frameCounter)
    {
        var temp_model = initVertexBuffers(gl);
        var objDoc_res = readOBJFile(fileName, gl, temp_model, scale, true, frameCounter);

        return {model: temp_model, objDoc: objDoc_res};
    }
    
    a_PositionLoc = gl.getAttribLocation(program, 'a_Position');
    a_PositionNextLoc = gl.getAttribLocation(program, 'a_PositionNext');
    a_NormalLoc = gl.getAttribLocation(program, 'a_Normal');
    a_ColorLoc = gl.getAttribLocation(program, 'a_Color');
    a_TexCoordLoc = gl.getAttribLocation(program, 'a_TexCoord');

    var objectStore = {};
    var requestStore = [];
    for (let i = 1; i < 135 + 1; i++) {
        let fileStringName = "animation-michelle-colors/dancing-michelle" + i + ".obj";
        objectStore[fileStringName] = initObject(gl, fileStringName, 1, i - 1);
    }


    function initVertexBuffers(gl)
    {
        var o = new Object();

        o.vertexBuffer = gl.createBuffer();
        o.normalBuffer = gl.createBuffer();
        o.colorBuffer = gl.createBuffer();
        o.texCoordBuffer = gl.createBuffer();
        o.indexBuffer = gl.createBuffer();

        return o;
    }

    //Read a file
    
    function readOBJFile(fileName, gl, in_model, scale, reverse, frameCounter)
    {
        var objDoc = null;
        var request = new XMLHttpRequest();
        requestStore.push(request);
        requestStore[frameCounter].onreadystatechange = function(){
            if (requestStore[frameCounter].readyState === 4 && requestStore[frameCounter].status !== 404 ) {
                objDoc = onReadOBJFile(requestStore[frameCounter].responseText, fileName, gl, in_model, scale, reverse, frameCounter);
            }
        }
        requestStore[frameCounter].open('GET', fileName, true); //Create a requestStore[frameCounter] to get file
        request.send()
        return objDoc;                 //Send request
    }

    var g_objDoc = {};

    function onReadOBJFile(fileString, fileName, gl, o, scale, reverse, frameCounter)
    {
        var objDoc = new OBJDoc(fileName);
        var result = objDoc.parse(fileString, scale, reverse);
        if(!result){
            g_objDoc = null; g_drawingInfo = null;
            console.log("OBJ file parsing error.");
            return;
        }
        g_objDoc[frameCounter] = objDoc;
        objectStore[fileName].objDoc = objDoc;
        return objDoc;
    }

    function onReadComplete(gl, in_model, objDoc, current)
    {
        var drawingInfo = objDoc.getDrawingInfo();

        gl.bindBuffer(gl.ARRAY_BUFFER, in_model.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, drawingInfo.vertices, gl.STATIC_DRAW);
        if (current) {
            gl.vertexAttribPointer(a_PositionLoc, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(a_PositionLoc);
        }
        else {
            gl.vertexAttribPointer(a_PositionNextLoc, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(a_PositionNextLoc);
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, in_model.normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, drawingInfo.normals, gl.STATIC_DRAW);
        if (current) {
            gl.vertexAttribPointer(a_NormalLoc, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(a_NormalLoc);
        }
        
        gl.bindBuffer(gl.ARRAY_BUFFER, in_model.colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, drawingInfo.colors, gl.STATIC_DRAW);
        if (current) {
            gl.vertexAttribPointer(a_ColorLoc, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(a_ColorLoc);
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, in_model.texCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, drawingInfo.texCoords, gl.STATIC_DRAW);
        gl.vertexAttribPointer(a_TexCoordLoc, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_TexCoordLoc);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, in_model.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, drawingInfo.indices, gl.STATIC_DRAW);

        return drawingInfo;
    }

    var image = document.createElement("img");
    image.crossorigin = "anonymous";
    image.src = "2D_Textures/Ch03_1001_Diffuse.png";
    image.onload = function() {
        var texture = gl.createTexture();
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0 , gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        var texMapLoc = gl.getUniformLocation(program, "texMap");
        gl.uniform1i(texMapLoc, 0);
    };

    var image1 = document.createElement("img");
    image1.crossorigin = "anonymous";
    image1.src = "2D_Textures/Ch03_1001_Glossiness.png";
    image1.onload = function() {
        var texture = gl.createTexture();
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0 , gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image1);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        var texMap1Loc = gl.getUniformLocation(program, "texMap1");
        gl.uniform1i(texMap1Loc, 1);
    };
    gl.activeTexture(gl.TEXTURE0);
    
    var interpLoc = gl.getUniformLocation(program, "interp");
    gl.uniform1f(interpLoc, 0.5);
    var interpSlider = document.getElementById("interp")
    interpSlider.addEventListener("input", function(ev)
    {
        gl.uniform1f(interpLoc, ev.srcElement.value);
        if (stopRotation && stopAnimation) 
        {
            render();
        }
    });

    var sLoc = gl.getUniformLocation(program, "s");
    gl.uniform1f(sLoc, 1000.0);
    var sSlider = document.getElementById("s")
    sSlider.addEventListener("input", function(ev)
    {
        gl.uniform1f(sLoc, ev.srcElement.value);
        if (stopRotation && stopAnimation) 
        {
            render();
        }
    });

    var stopRotation = true;
    var stopRotationButton = document.getElementById("StopRotation");
    stopRotationButton.addEventListener("click", function()
    {
        if (stopRotation) 
        {
            stopRotation = false;
            if (stopAnimation) { render(); }
        }
        else
        {
            stopRotation = true;
        }
    });
    var stopAnimation = false;
    var stopAnimationButton = document.getElementById("StopAnimation");
    stopAnimationButton.addEventListener("click", function()
    {
        if (stopAnimation) 
        {
            stopAnimation = false;
            if (stopRotation) { render(); }
        }
        else
        {
            stopAnimation = true;
        }
    });

    const radius = 3.0;
    var alpha = 0;

    var view_matrix = lookAt(vec3(radius * Math.sin(alpha), 0.0, radius * Math.cos(alpha)), vec3(0.0, 0.0, 0.0), vec3(1.0, 0.0, 0.0));
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

    var animNumFrames = 135;
    var counter = 0;
    var g_drawingInfo = null;

    function render()
    {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        var eye_pos = vec3(radius * Math.sin(alpha), 1.0, radius * Math.cos(alpha));
        view_matrix = lookAt(eye_pos, vec3(0.0, 0.0, 0.0), vec3(0.0, 1.0, 0.0));
        gl.uniformMatrix4fv(VLoc, false, flatten(view_matrix));
        if (!g_drawingInfo) {
            var objDoc_current = objectStore['animation-michelle-colors/dancing-michelle135.obj'].objDoc;
        }
        if(!g_drawingInfo && objDoc_current && objDoc_current.isMTLComplete())
        {
            g_drawingInfo = onReadComplete(gl, objectStore['animation-michelle-colors/dancing-michelle135.obj'].model, objDoc_current, true);
        }
        if(!g_drawingInfo) {requestAnimationFrame(render); return;}

        var variable = Math.floor((counter / 3) % animNumFrames);
        var currentFrame = "animation-michelle-colors/dancing-michelle" + (variable + 1) + ".obj";
        var nextFrame = "animation-michelle-colors/dancing-michelle" + ((variable + 1) % animNumFrames + 1) + ".obj";
        if (counter === 0) {
            currentFrame = 'animation-michelle-colors/dancing-michelle135.obj';
            nextFrame = 'animation-michelle-colors/dancing-michelle1.obj';
        }

        gl.drawElements(gl.TRIANGLES, g_drawingInfo.indices.length, gl.UNSIGNED_INT, 0);
        if (!stopRotation | !stopAnimation) 
        {
            if (!stopRotation) {
                alpha = alpha + 0.01;
            }
            if (!stopAnimation) {
                g_drawingInfo = onReadComplete(gl, objectStore[currentFrame].model, objectStore[currentFrame].objDoc, true);
                var g_drawingInfoNext = onReadComplete(gl, objectStore[nextFrame].model, objectStore[nextFrame].objDoc, false);
                counter += 1;
            }
            requestAnimationFrame(render);
        }
    }
    render();
}