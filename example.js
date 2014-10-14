var colorMode = "HSV";
var hScale = 5;
var sScale = 1;
var vScale = 5;

var width = 600;
var height = 600;
var xOff = width / 2;
var yOff = height /2;
var scale = 60;
var defaultXRange = [-10,10];
var defaultYRange = [-10,10];

function Complex(a, b) {
    this.a = a;
    this.b = b;
}

Object.prototype.map = function() {
    var args = [];
    args.push.apply(args, arguments);
    var f = args.shift();
    var ret = {};
    for(var k in this) {
        if(this.hasOwnProperty(k)) {
            var newArgs = [];
            if(args.length > 0) {
                newArgs.push.apply(newArgs, args);
            } else {
                newArgs.push(k, this);
            }
            ret[k]=f.apply(this[k], newArgs);
        }
    }
    return ret;
};

var mathFuncs = ["round", "floor", "ceil", "max", "min", "tan", "atan", "sin", "asin", "cos", "acos"];

mathFuncs.forEach(function(k) {
    Number.prototype[k] = function() {
        var args = [this];
        args.push.apply(args, arguments);
        return Math[k].apply(window, args);
    }
});

Number.prototype.toHex = function(len) {
    len = len || 2;
    var ret = this.toString(16);
    while(ret.length < len) ret = "0" + ret;
    return ret;
}

Number.prototype.toComplex = function(b) {
    return new Complex(this, b || 0);
};

Number.prototype.toImaginary = function() {
    return new Complex(0, this);
};

var MMAX = { r: -1000, g: -1000, b: -1000 };
var MMIN = { r: 1000, g: 1000, b: 1000 };
var SSUM = { r: 0, g: 0, b: 0 };
var NNUM = 0

Complex.prototype = {
    toComplex: function() { return this; },
    toString: function () {
        return this.a + " + " + this.b + "i";
    },
    plus: function(other) {
        other = other.toComplex();
        return new Complex(this.a + other.a, this.b + other.b);
    },
    add: function(other) {
        this.a += other.a;
        this.b += other.b;
    },
    negative: function() {
        return new Complex(-this.a, -this.b);
    },
    minus: function(other) {
        other = other.toComplex();
        return this.plus(other.negative());
    },
    subtract: function(other) {
        other = other.toComplex();
        this.a -= other.a;
        this.b -= other.b;
    },
    conjugate: function() {
        return new Complex(this.a, -this.b);
    },
    times: function(other) {
        other = other.toComplex();
        /* (a + bi)(c + di) = ac + adi + bci + bdii = (ac - bd) + (ad + bc)i */
        return new Complex(this.a * other.a - this.b * other.b, this.a * other.b + this.b * other.a);
    },
    real: function() { return this.a; },
    imaginary: function() { return this.b; },
    multiply: function(other) {
        other = other.toComplex();
        this.a = this.a * other.a - this.b * other.b;
        this.b = this.a * other.b + this.b * other.a;
    },
    modulus: function() {
        return Math.sqrt(this.mod2());
    },
    mod2: function() {
        return this.a * this.a + this.b * this.b;
    },
    angle: function() {
        return Math.atan2(this.b, this.a);
    },
    toRGB_cube: function() {
        var r = this.modulus();
        var a = Math.sqrt(6) / 6 * this.a;
        var b = Math.sqrt(2) / 2 * this.b;
        var d = 1 / (1 + this.mod2());

        var R = 0.5 + Math.sqrt(6)/3 * this.a * d;
        var G = 0.5 - d * (a - b);
        var B = 0.5 - d * (a + b);

        d = 0.5 - r * d;
        if(r < 1) d = -d;
        R += d;
        G += d;
        B += d;

        return {
            r: R * 255,
            g: G * 255,
            b: B * 255
        };
    },
    toRGB_HSV: function() {
        var h = ((this.angle() + Math.PI) * hScale % (2 * Math.PI)) / (2 * Math.PI);
        var s = sScale;
        var v = this.modulus() / vScale;
        return HSV2RGB(h, s, v).map(Number.prototype.min, 255);
    },
    toRGB: function() {
        if(colorMode == "HSV") return this.toRGB_HSV();
        return this.toRGB_cube();
    },
    toColor: function() {
        var rgb = this.toRGB();
        return "#" + rgb.r.floor().toHex() + rgb.g.floor().toHex() + rgb.b.floor().toHex();
    },
    equals: function(other, acc) {
        acc = acc || Math.pow(10, -4);
        var d = this.minus(other.toComplex());
        return d.mod2() < acc * acc;
    },
    divide: function(other) {
        other = other.toComplex();
        return new Complex((this.a * other.a + this.b * other.b) / other.mod2(), (this.b * other.a - this.a * other.b) / other.mod2());
    },
    exp: function()
    {
        /* e^(x + iy) = e^x * e^(iy) = e^x(cos(y) + isin(y) */
        var scale = Math.exp(this.a);
        var r = scale * Math.cos(this.b);
        var i = scale * Math.sin(this.b);
        return new Complex(r, i);
    },
    pow: function(pow, k)
    {
        if(arguments.length == 1) k = 0;
        /*
         this^(pow) = (|this|exp(i*this.angle()))^pow
         = |this|^pow * exp(i*this.angle()*pow)
         */
        var r = Math.pow(this.modulus(), pow);
        var th = (this.angle() + 2 * k * Math.PI) * pow;
        return new Complex(r * Math.cos(th), r * Math.sin(th));
    },
    log: function(k)
    {
        if(arguments.length == 0) k = 0;
        /* log(|this|*exp(this.angle())) = log(|this|) + i*(this.angle() + 2PI*k) */
        return new Complex(Math.log(this.modulus()), this.angle() + 2 * Math.PI * k);
    }
};

function HSV2RGB(h, s, v)
{
    var RGB = {};
    if (s == 0) {
        RGB.r = v * 255;
        RGB.g = v * 255;
        RGB.b = v * 255;
    } else {
        var_h = h * 6;
        var_i = Math.floor(var_h);
        var_1 = v * (1 - s);
        var_2 = v * (1 - s * (var_h - var_i));
        var_3 = v * (1 - s * (1 - (var_h - var_i)));
        if (var_i == 0) {
            var_r = v;
            var_g = var_3;
            var_b = var_1;
        } else if (var_i == 1) {
            var_r = var_2;
            var_g = v;
            var_b = var_1;
        } else if (var_i == 2) {
            var_r = var_1;
            var_g = v;
            var_b = var_3;
        } else if (var_i == 3) {
            var_r = var_1;
            var_g = var_2;
            var_b = v;
        } else if (var_i == 4) {
            var_r = var_3;
            var_g = var_1;
            var_b = v;
        } else {
            var_r = v;
            var_g = var_1;
            var_b = var_2;
        }
        RGB.r = var_r * 255;
        RGB.g = var_g * 255;
        RGB.b = var_b * 255;
    }
    return RGB;
}

function getCanvas() {
    return document.getElementById("graph").getContext("2d");
}


function toScreen(x, y) {
    return { x: x * scale + xOff, y: yOff - y * scale };
}

function drawAxes(xRange, yRange) {
    var ctx = getCanvas();
    xRange = xRange || defaultXRange;
    yRange = yRange || defaultYRange;
    var bottom = toScreen(0, yRange[0]);
    var top = toScreen(0, yRange[1]);
    var left = toScreen(xRange[0], 0);
    var right = toScreen(xRange[1], 0);
    ctx.strokeStyle = "black";
    ctx.moveTo(bottom.x, bottom.y);
    ctx.lineTo(top.x, top.y);
    ctx.stroke();
    ctx.moveTo(left.x, left.y);
    ctx.lineTo(right.x, right.y);
    ctx.stroke();
}

function drawGrid(xRange, yRange) {
    var ctx = getCanvas();
    xRange = xRange || defaultXRange;
    yRange = yRange || defaultYRange;
    for(var i = -10; i < 10; i++) {
        var bottom = toScreen(i, yRange[0]);
        var top = toScreen(i, yRange[1]);
        var left = toScreen(xRange[0], i);
        var right = toScreen(xRange[1], i);
        ctx.strokeStyle = "red";
        ctx.moveTo(bottom.x, bottom.y);
        ctx.lineTo(top.x, top.y);
        ctx.stroke();
        ctx.moveTo(left.x, left.y);
        ctx.lineTo(right.x, right.y);
        ctx.stroke();
    }
}

function drawPoint(ctx, res, x, y, z)
{
    ctx.fillStyle = z.toColor();
    var c = toScreen(x, y);
    ctx.fillRect(c.x - scale * res/2 - 1, c.y - scale * res/2 - 1, scale * res + 2, scale * res + 2);
}

function graph(f, res, xRange, yRange) {
    xRange = xRange || defaultXRange;
    yRange = yRange || defaultYRange;
    res = res || 1;
    var ctx = getCanvas();
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, width, height);

    for(var y = yRange[0]; y <= yRange[1]; y+=res) {
        ctx.moveTo(xRange[0], y);
        ctx.beginPath();
        for(var x = xRange[0]; x <= xRange[1]; x+=res) {
            var _z = new Complex(x, y);
            var z = f(_z, x, y);
            var mod2 = z.mod2();
            drawPoint(ctx, res, x, y, z);
            /*
             if(mod2 > colorScale) {
             colorScale = mod2;
             }
             ctx.strokeStyle = z.toColor();
             var c = toScreen(x, y);
             ctx.lineTo(c.x, c.y);
             ctx.stroke();
             */
        }
    }
}

Math.I = new Complex(0, 1);

function $(id) { return document.getElementById(id); }

function getNumber(id) {
    var el = $(id);
    var ret = parseFloat(el.value);
    if(isNaN(ret)) {
        el.focus();
        throw new Error("Invalid input");
    }
    return ret;
}

function isChecked(id) {
    return $(id).checked;
}

function redraw()
{
    defaultXRange = [ getNumber("xMin"), getNumber("xMax") ];
    defaultYRange = [ getNumber("yMin"), getNumber("yMax") ];
    scale = (width / (defaultXRange[1] - defaultXRange[0])) * 2
    var sEquation = $("equation").value;
    var func;
    try {
        func = new Function("z, x, y", sEquation);
    } catch(e) {
        $("equation").focus();
        throw new Error("Invalid equation");
    }
    var res = getNumber("res");
    hScale = getNumber("hsvH");
    sScale = getNumber("hsvS");
    vScale = getNumber("hsvV");

    graph(func, res);
    if(isChecked("axes")) {
        drawAxes();
    }
    if(isChecked("grid")) {
        drawGrid();
    }
}

function setupAdvanced()
{
    var advanced = $("advanced");
    $("colorMode").onchange = function() {
        var mode = this.value;
        advanced.getElementsByTagName("input").map(function() {
            colorMode = mode;
            if(this.className == "HSV") {
                if(mode == "HSV") {
                    this.removeAttribute("disabled");
                } else {
                    this.disabled = true;
                }
            }
        });
    };
    $("redraw").onclick = function() {
        redraw();
    };
}

function init()
{
    /*
     graph(function(z, x, y) {
     //var ret = c.pow(3);
     //return z.minus(1).pow(-1).minus(z.negative().plus(1));
     //return z.plus(1).pow(-1).minus(z.minus(1).pow(-1));
     //return z.minus(1).pow(2).plus(z.plus(1).pow(-2));
     var zz = z.log();
     return z.minus(new Complex(1,1)).pow(-1).plus(z.minus(new Complex(-1,-1)).pow(-1)).exp();
     }, 0.1);
     drawGrid();
     drawAxes();
     */
    setupAdvanced();
    $("doGraph").onclick = function() { redraw(); };
    redraw();
}