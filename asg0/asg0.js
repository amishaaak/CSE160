var ctx;
var canvas;

function drawVector(v,color){
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(canvas.width/2, canvas.height/2);
    ctx.lineTo(canvas.width/2 + 20*v.elements[0], canvas.height/2 - 20*v.elements[1], v.elements[2]*20);
    ctx.stroke();
}

function handleDrawEvent(){
    var x = document.getElementById('v1_x').value;
    var y = document.getElementById('v1_y').value;
    var x2 = document.getElementById('v2_x').value;
    var y2 = document.getElementById('v2_y').value;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(0,0,0,1.0)'; // Set color to black
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    var v1 = new Vector3([x, y, 0.0]);
    drawVector(v1, "red");
    var v2 = new Vector3([x2, y2, 0.0]);
    drawVector(v2, "blue");
}

function angleBetween(v1, v2){
    var m1 = v1.magnitude();
    var m2 = v2.magnitude();
    var d = Vector3.dot(v1, v2);

    var ang = Math.acos(d/(m1*m2)); 
    ang *= 180/Math.PI;
    console.log("Angle: " + ang);
}

function areaTriangle(v1, v2){
    let c = Vector3.cross(v1, v2).magnitude();
    console.log("Area: " + c/2);
}

function handleDrawOperationEvent(){
    var x = document.getElementById('v1_x').value;
    var y = document.getElementById('v1_y').value;
    var x2 = document.getElementById('v2_x').value;
    var y2 = document.getElementById('v2_y').value;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(0,0,0,1.0)'; // Set color to black
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    var v1 = new Vector3([x, y, 0.0]);
    drawVector(v1, "red");
    var v2 = new Vector3([x2, y2, 0.0]);
    drawVector(v2, "blue");

    let s = document.getElementById('scalar').value;
    let operation = document.getElementById('opt').value;

    if(operation == "Add") {
        var v3 = new Vector3().set(v1).add(v2);
        drawVector(v3, "green");
    } else if(operation == "Subtract") {
        var v3 = new Vector3().set(v1).sub(v2);
        drawVector(v3, "green")
    } else if(operation == "Multiply") {
        var v3 = new Vector3().set(v1).mul(s);
        var v4 = new Vector3().set(v2).mul(s);
        drawVector(v3, "green");
        drawVector(v4, "green");
    } else if(operation == "Divide") {
        var v3 = new Vector3().set(v1).div(s);
        var v4 = new Vector3().set(v2).div(s);
        drawVector(v3, "green");
        drawVector(v4, "green");
    }
    else if (operation == "Mag"){
        console.log("Magnitude v1: ", v1.magnitude());
        console.log("Magnitude v2: ", v2.magnitude());
    }
    else if(operation == "Norm"){
        var v3 = new Vector3().set(v1).normalize(v3);
        var v4 = new Vector3().set(v2).normalize(v4);
        drawVector(v3, "green");
        drawVector(v4, "green");
    }
    else if (operation == "Ang"){
        angleBetween(v1, v2);
    }
    else if(operation == "Area"){
        areaTriangle(v1, v2);
    }
}

function main() {
    // Retrieve <canvas> element
    canvas = document.getElementById('asg0');
    if (!canvas) {
      console.log('Failed to retrieve the <canvas> element');
      return false;
    }
  
    ctx = canvas.getContext('2d');
  
    // Black blackground
    ctx.fillStyle = 'rgba(0,0,0,1.0)'; // Set color to black
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    var v1 = new Vector3([2.25, 2.25, 0])
    drawVector(v1, "red");
}

