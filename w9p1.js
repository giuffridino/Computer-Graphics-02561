    window.onload = function init()
{
    var canvas = document.getElementById("c");
    // var gl = canvas.getContext("webgl");
    var gl = WebGLUtils.setupWebGL(canvas, {alpha: false});
    gl.clearColor(0.5, 0.7, 1.0, 1.0);
    gl.enable(gl.BLEND);
    // gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);

    var groundProgram = initShaders(gl, "vertex-shader", "fragment-shader");
    var objProgram = initShaders(gl, "vertex-shader-obj", "fragment-shader-obj");
    gl.useProgram(groundProgram);

    // should I differentiate between the Element buffer and array buffer?
    function initAttributeVariable(gl, attribute, buffer)
    {
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.vertexAttribPointer(attribute, buffer.num, buffer.type, false, 0, 0);
        gl.enableVertexAttribArray(attribute);
    }

    var ext = gl.getExtension('OES_element_index_uint');
    if(!ext){
        console.log('Warning: Unable to use an extension');
    }

    function initObject(gl, fileName, scale)
    {
        objProgram.a_Position = gl.getAttribLocation(objProgram, 'a_Position');
        objProgram.a_Normal = gl.getAttribLocation(objProgram, 'a_Normal');
        objProgram.a_Color = gl.getAttribLocation(objProgram, 'a_Color');

        var model = initVertexBuffers(gl, objProgram);
        readOBJFile(fileName, gl, model, scale, true);

        return model;
    }
    
    var model = initObject(gl, '3D_Meshes/teapot.obj', 0.25);

    function initVertexBuffers(gl, objProgram)
    {
        var o = new Object();

        o.vertexBuffer = createEmptyArrayBuffer(gl, objProgram.a_Position, 3, gl.FLOAT);
        o.normalBuffer = createEmptyArrayBuffer(gl, objProgram.a_Normal, 3, gl.FLOAT);
        o.colorBuffer = createEmptyArrayBuffer(gl, objProgram.a_Color, 4, gl.FLOAT);
        o.indexBuffer = gl.createBuffer();

        return o;
    }

    function createEmptyArrayBuffer(gl, a_attribute, num, type)
    {
        var buffer = gl.createBuffer();
        buffer.num = num;
        buffer.type = type;

        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.vertexAttribPointer(a_attribute, buffer.num, buffer.type, false, 0, 0);
        gl.enableVertexAttribArray(a_attribute);

        return buffer;
    }

    //Read a file
    function readOBJFile(fileName, gl, model, scale, reverse)
    {
        var request = new XMLHttpRequest();
        request.onreadystatechange = function(){
            if (request.readyState === 4 && request.status !== 404 ) {
                onReadOBJFile(request.responseText, fileName, gl, model, scale, reverse);
            }
        }
        request.open('GET', fileName, true); //Create a request to get file
        request.send()                       //Send request
    }

    var g_objDoc = null;
    var g_drawingInfo = null;

    function onReadOBJFile(fileString, fileName, gl, o, scale, reverse)
    {
        var objDoc = new OBJDoc(fileName);
        var result = objDoc.parse(fileString, scale, reverse);
        if(!result){
            g_objDoc = null; g_drawingInfo = null;
            console.log("OBJ file parsing error.");
            return;
        }
        g_objDoc = objDoc;
    }

    function onReadComplete(gl, model, objDoc)
    {
        var drawingInfo = objDoc.getDrawingInfo();

        gl.bindBuffer(gl.ARRAY_BUFFER, model.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, drawingInfo.vertices, gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, model.normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, drawingInfo.normals, gl.STATIC_DRAW);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, model.colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, drawingInfo.colors, gl.STATIC_DRAW);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, drawingInfo.indices, gl.STATIC_DRAW);

        return drawingInfo;
    }

    var vertices = [     
        //Ground
        vec3(-2.0, -1.0, -1.0),     
        vec3(2.0, -1.0, -1.0),  
        vec3(2.0, -1.0, -5.0),     
        vec3(-2.0, -1.0, -5.0),
        vec3(-2.0, -1.0, -1.0),
        vec3(2.0, -1.0, -5.0), 
        // // Quad parallel
        // vec3(0.25, -0.5, -1.25),     
        // vec3(0.75, -0.5, -1.25),  
        // vec3(0.75, -0.5, -1.75),     
        // vec3(0.25, -0.5, -1.75),
        // vec3(0.25, -0.5, -1.25),
        // vec3(0.75, -0.5, -1.75),
        // // Quad perpendicular
        // vec3(-1.0, 0.0, -2.5),  
        // vec3(-1.0, -1.0, -2.5),     
        // vec3(-1.0, 0.0, -3.0),     
        // vec3(-1.0, -1.0, -3.0),
        // vec3(-1.0, 0.0, -3.0), 
        // vec3(-1.0, -1.0, -2.5),
    ];
    var vBuffer = gl.createBuffer();
    vBuffer.num = 3;
    vBuffer.type = gl.FLOAT;
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
    var vPosition = gl.getAttribLocation(groundProgram, "a_Position");
    gl.vertexAttribPointer(vPosition, vBuffer.num, vBuffer.type, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    var texCoords = [     
        vec2(0.0, 0.0),     
        vec2(1.0, 0.0),  
        vec2(0.0, 1.0),   
        vec2(1.0, 0.0),  
        vec2(0.0, 1.0),     
        vec2(1.0, 1.0),

        // vec2(0.0, 0.0),     
        // vec2(1.0, 0.0),  
        // vec2(0.0, 1.0),   
        // vec2(1.0, 0.0),  
        // vec2(0.0, 1.0),     
        // vec2(1.0, 1.0),

        // vec2(0.0, 0.0),     
        // vec2(1.0, 0.0),  
        // vec2(0.0, 1.0),   
        // vec2(1.0, 0.0),  
        // vec2(0.0, 1.0),     
        // vec2(1.0, 1.0), 
    ];
    var tBuffer = gl.createBuffer();
    tBuffer.num = 2;
    tBuffer.type = gl.FLOAT;
    gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoords), gl.STATIC_DRAW);
    var tPosition = gl.getAttribLocation(groundProgram, "a_TexCoord");
    gl.vertexAttribPointer(tPosition, tBuffer.num, tBuffer.type, false, 0, 0);
    gl.enableVertexAttribArray(tPosition);

    // var indices = new Uint32Array([
    //     0, 1, 2, 1, 2, 3
    // ]);

    // var iBuffer = gl.createBuffer();
    // gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
    // gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(indices), gl.STATIC_DRAW);

    var colors = [
        vec4(1.0, 1.0, 1.0, 1.0), 
        vec4(1.0, 1.0, 1.0, 1.0), 
        vec4(1.0, 1.0, 1.0, 1.0), 
        vec4(1.0, 1.0, 1.0, 1.0),
        vec4(1.0, 1.0, 1.0, 1.0),
        vec4(1.0, 1.0, 1.0, 1.0),
    ];


    var cBuffer = gl.createBuffer();
    cBuffer.num = 4;
    cBuffer.type = gl.FLOAT;
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);
    var vColors = gl.getAttribLocation(groundProgram, "a_Color");
    gl.vertexAttribPointer(vColors, cBuffer.num, cBuffer.type, false, 0, 0);
    gl.enableVertexAttribArray(vColors);

    var image = document.createElement("img");
    image.crossorigin = "anonymous";
    image.src = "2D_Textures/xamp23.png";

    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0 , gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    
    var texMapLoc = gl.getUniformLocation(groundProgram, "texMap");
    gl.uniform1i(texMapLoc, 0);

    var texture1 = gl.createTexture();
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, texture1);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, 1, 1, 0, gl.RGB, gl.UNSIGNED_BYTE, new Uint8Array([255, 0, 0]));

    // All the locs of the ground
    gl.useProgram(groundProgram);
    var view_matrix = mat4();
    var VLoc = gl.getUniformLocation(groundProgram, "view_matrix");
    gl.uniformMatrix4fv(VLoc, false, flatten(view_matrix));

    var projection_matrix = perspective(90, canvas.width / canvas.height, 0.1, 20.0);
    var PLoc = gl.getUniformLocation(groundProgram, "projection_matrix");
    gl.uniformMatrix4fv(PLoc, false, flatten(projection_matrix));

    var model_matrix = mat4();
    var MLoc = gl.getUniformLocation(groundProgram, "model_matrix");
    gl.uniformMatrix4fv(MLoc, false, flatten(model_matrix));
    var view_matrix = mat4();

    var ShadowLoc = gl.getUniformLocation(groundProgram, "notShadow");

    // All the locs of the obj
    gl.useProgram(objProgram);
    var view_matrix_obj = mat4();
    var VLoc_obj = gl.getUniformLocation(objProgram, "view_matrix");
    gl.uniformMatrix4fv(VLoc_obj, false, flatten(view_matrix_obj));

    var projection_matrix_obj = perspective(90, canvas.width / canvas.height, 0.1, 20.0);
    var PLoc_obj = gl.getUniformLocation(objProgram, "projection_matrix");
    gl.uniformMatrix4fv(PLoc_obj, false, flatten(projection_matrix_obj));

    var model_matrix_obj = mat4();
    model_matrix_obj[1][3] = -1;
    model_matrix_obj[2][3] = -3;
    var MLoc_obj = gl.getUniformLocation(objProgram, "model_matrix");
    gl.uniformMatrix4fv(MLoc_obj, false, flatten(model_matrix_obj));

    const center = vec3(0.0, 2.0, -2.0)
    const radius = 2.0;
    var alpha = 0;

    var rotatingLight = true;
    var stopRotationButton = document.getElementById("StopRotation");
    stopRotationButton.addEventListener("click", function()
    {
        if (rotatingLight) 
        {
            rotatingLight = false;
        }
        else
        {
            rotatingLight = true;
            if (!MovingObj) {
                render();
            }
            // render();
        }
    });

    var MovingObj = false;
    var MovingObjButton = document.getElementById("StopMovingObj");
    MovingObjButton.addEventListener("click", function()
    {
        if (MovingObj) 
        {
            MovingObj = false;
        }
        else
        {
            MovingObj = true;
            if (!rotatingLight) {
                render();
            }
            // render();
        }
    });
    
    var dir = 1;
    function render()
    {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        if(!g_drawingInfo && g_objDoc && g_objDoc.isMTLComplete())
        {
            g_drawingInfo = onReadComplete(gl, model, g_objDoc);
        }
        if(!g_drawingInfo) {requestAnimationFrame(render); return;}

        var light_pos = vec4(center[0] + radius * Math.sin(alpha), center[1] + 0.0, center[2] + radius * Math.cos(alpha), 1.0);

        gl.useProgram(groundProgram);
        initAttributeVariable(gl, vPosition, vBuffer);
        initAttributeVariable(gl, tPosition, tBuffer);
        initAttributeVariable(gl, vColors, cBuffer);
        model_matrix = mat4();
        gl.uniformMatrix4fv(MLoc, false, flatten(model_matrix));
        gl.depthFunc(gl.LESS);
        // Draw Ground
        gl.uniform1i(texMapLoc, 0);
        gl.uniform1i(ShadowLoc, 1);
        gl.drawArrays(gl.TRIANGLES, 0, 6);

        // Draw obj
        gl.useProgram(objProgram);
        if (model_matrix_obj[1][3] > 0.5 | model_matrix_obj[1][3] < -1)
        {
            dir *= -1;
        }
        initAttributeVariable(gl, objProgram.a_Position, model.vertexBuffer);
        initAttributeVariable(gl, objProgram.a_Color, model.colorBuffer);
        initAttributeVariable(gl, objProgram.a_Normal, model.normalBuffer);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.indexBuffer);
        gl.drawElements(gl.TRIANGLES, g_drawingInfo.indices.length, gl.UNSIGNED_INT, 0);
        
        // temp_matrix = mat4();
        // temp_matrix[3][3] = 0;
        // var d = -(light_pos[1] - (-1) + 1e-4);
        // temp_matrix[3][1] = 1 / d;
        // model_matrix = mult(translate(light_pos[0], light_pos[1], light_pos[2]), mult(temp_matrix, mult(translate(-light_pos[0], -light_pos[1], -light_pos[2]), model_matrix)));
        // gl.uniformMatrix4fv(MLoc, false, flatten(model_matrix));
        // gl.depthFunc(gl.GREATER);
        // // Draw shadows
        // gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        // gl.uniform1i(texMapLoc, 1);
        // gl.uniform1i(ShadowLoc, 0);
        // gl.drawArrays(gl.TRIANGLES, 6, 12);

        // model_matrix = mat4();
        // gl.uniformMatrix4fv(MLoc, false, flatten(model_matrix));
        // gl.depthFunc(gl.LESS);
        // //Draw normal quads
        // gl.uniform1i(texMapLoc, 1);
        // gl.uniform1i(ShadowLoc, 1);
        // gl.drawArrays(gl.TRIANGLES, 6, 12);

        if (MovingObj) 
        {
            model_matrix_obj[1][3] += dir * 0.009; 
            gl.uniformMatrix4fv(MLoc_obj, false, flatten(model_matrix_obj));
        }
        if (rotatingLight | MovingObj) 
        {
            alpha = alpha + 0.01;
            // model_matrix_obj[1][3] += dir * 0.009; 
            // gl.uniformMatrix4fv(MLoc_obj, false, flatten(model_matrix_obj));
            requestAnimationFrame(render);
        }
        // requestAnimationFrame(render);
    }
    render();
}