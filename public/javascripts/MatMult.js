/**
 * Created by jaric on 19.09.2014.
 */

(function(exports){

    //!
    function oINV() {
        return -1;
    }

    function oTR() {
        return -1;
    }

    function ox() {
        return -1;
    }

    // CONTAINS

    // A, B [] of REAL
    function VectorTimesVector(A,B){
        return DOT_PRODUCT(A,B);
    }

    // A, B [][] of REAL
    function MatTimesMat(A,B){
        //REAL, DIMENSION( SIZE(A,1), SIZE(B,2) ) :: MatTimesMat
        return MATMUL(A,B);
    }

    // A, B [][] of COMPLEX
    function MatTimesMatC(A,B){
        //COMPLEX, DIMENSION( SIZE(A,1), SIZE(B,2) ) :: MatTimesMat
        return MATMUL(A,B);
    }

    // A [][] of real, X [] of real
    function MatTimesVector(A,X){
        // http://mephi-v05.narod.ru/files/infa1.pdf
        //  real a(3, 6, *), b(0:*)
        //  print *, size(a, 2) ! 6
        var a = A[1];
        return MATMUL(a,X);
    }

    // _j

    function bootstrap(){
        var cmplx1 = new Complex(4,-3);
        var cmplx2 = new Complex(3,-2);
        var ans = cmplx1.times(cmplx2);
        console.log(ans.toString());
        return -1;
    }
    exports.bootstrap = bootstrap;

    // expand Number class, so we can operate
    Number.prototype.toComplex = function(b) {
        return new Complex(this, b || 0);
    };
    Number.prototype.toImaginary = function() {
        return new Complex(0, this);
    };

    function Complex(a, b) {
        this.a = a;
        this.b = b;
    }

    Complex.prototype = {
        toComplex: function() { return this; },
        toString: function () {
            //return this.a + " + " + this.b + "i";
            return this.a + (this.b >= 0 ? "+" : "") + this.b + "i";
        },
        real: function() { return this.a; },
        imaginary: function() { return this.b; },
        negative: function() {
            return new Complex(-this.a, -this.b);
        },
        conjugate: function() {
            return new Complex(this.a, -this.b);
        },
        plus: function(other) {
            other = other.toComplex();
            return new Complex(this.a + other.a, this.b + other.b);
        },
        add: function(other) {
            other = other.toComplex();
            this.a += other.a;
            this.b += other.b;
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
        times: function(other) {
            other = other.toComplex();
            /* (a + bi)(c + di) = ac + adi + bci + bdii = (ac - bd) + (ad + bc)i */
            return new Complex(this.a * other.a - this.b * other.b, this.a * other.b + this.b * other.a);
        },
        multiply: function(other) {
            other = other.toComplex();
            this.a = this.a * other.a - this.b * other.b;
            this.b = this.a * other.b + this.b * other.a;
            //var r = this.a * other.a - this.b * other.b;
            //var i = this.a * other.b + this.b * other.a;
            //this.a = r;
            //this.b = i;
            //return new Complex(r, i);
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
        equals: function(other, acc) {
            acc = acc || Math.pow(10, -4);
            var d = this.minus(other.toComplex());
            return d.mod2() < acc * acc;
        },
        divide: function(other) {
            other = other.toComplex();
            return new Complex((this.a * other.a + this.b * other.b) / other.mod2(), (this.b * other.a - this.a * other.b) / other.mod2());
        },
        exp: function(){
            /* e^(x + iy) = e^x * e^(iy) = e^x(cos(y) + isin(y) */
            var scale = Math.exp(this.a);
            var r = scale * Math.cos(this.b);
            var i = scale * Math.sin(this.b);
            var c = new Complex(r, i);
            return c;
        },
        pow: function(pow, k){
            if(arguments.length == 1) k = 0;
            /*
             this^(pow) = (|this|exp(i*this.angle()))^pow
             = |this|^pow * exp(i*this.angle()*pow)
             */
            var r = Math.pow(this.modulus(), pow);
            var th = (this.angle() + 2 * k * Math.PI) * pow;
            return new Complex(r * Math.cos(th), r * Math.sin(th));
        },
        log: function(k){
            if(arguments.length == 0) k = 0;
            /* log(|this|*exp(this.angle())) = log(|this|) + i*(this.angle() + 2PI*k) */
            return new Complex(Math.log(this.modulus()), this.angle() + 2 * Math.PI * k);
        }
    };

    //function importLanguage(language){ return -1; }
    //exports.importLanguage = importLanguage;

})(typeof exports === 'undefined'? this['MatMult']={} : exports);

/* links

1) fortran to c++ converter FABLE, http://cci.lbl.gov/fable/
2) JavaScript complex function graphing tool, http://www.fortwain.com/complex.html (especially http://www.fortwain.com/complex.js)
3) УНИВЕРСАЛЬНЫЙ КАЛЬКУЛЯТОР КОМПЛЕКСНЫХ ЧИСЕЛ ОНЛАЙН, http://abak.pozitiv-r.ru/math/68-kulyator-complex

*/
