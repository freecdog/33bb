/**
 * Created by jaric on 15.10.2014.
 */

TestMatMult = TestCase("TestMatMult");

// actually it is MatMult.equals
var eps = 1e-8;

TestMatMult.prototype.testPlus = function() {
    var tests = [
        {
            c1: new MatMult.Complex(4,-3),
            c2: new MatMult.Complex(3,-2),
            answer: new MatMult.Complex(7, -5)
        },
        {
            c1: new MatMult.Complex(4,-3),
            c2: new MatMult.Complex(3,-22),
            answer: new MatMult.Complex(7, -25)
        },
        {
            c1: new MatMult.Complex(4,-3),
            c2: 3,
            answer: new MatMult.Complex(7, -3)
        }
    ];
    for (var i = 0; i < tests.length; i++) {
        var c1 = tests[i].c1;
        var c2 = tests[i].c2;
        var ans = c1.plus(c2);
        assertEqualsDelta("real", tests[i].answer.real(), ans.real(), eps);
        assertEqualsDelta("imaginary", tests[i].answer.imaginary(), ans.imaginary(), eps);
    }
};

TestMatMult.prototype.testMinus = function() {
    var tests = [
        {
            c1: new MatMult.Complex(4,-3),
            c2: new MatMult.Complex(3,-2),
            answer: new MatMult.Complex(1, -1)
        },
        {
            c1: new MatMult.Complex(4,-3),
            c2: new MatMult.Complex(3,-22),
            answer: new MatMult.Complex(1, 19)
        },
        {
            c1: new MatMult.Complex(4,-3),
            c2: 3,
            answer: new MatMult.Complex(1, -3)
        }
    ];
    for (var i = 0; i < tests.length; i++) {
        var c1 = tests[i].c1;
        var c2 = tests[i].c2;
        var ans = c1.minus(c2);
        assertEqualsDelta("real", tests[i].answer.real(), ans.real(), eps);
        assertEqualsDelta("imaginary", tests[i].answer.imaginary(), ans.imaginary(), eps);
    }
};

TestMatMult.prototype.testTimes = function() {
    var tests = [
        {
            c1: new MatMult.Complex(4,-3),
            c2: new MatMult.Complex(3,-2),
            answer: new MatMult.Complex(6, -17)
        },
        {
            c1: new MatMult.Complex(4,-3),
            c2: new MatMult.Complex(3,-22),
            answer: new MatMult.Complex(-54, -97)
        },
        {
            c1: new MatMult.Complex(4,-3),
            c2: 3,
            answer: new MatMult.Complex(12, -9)
        }
    ];
    for (var i = 0; i < tests.length; i++) {
        var c1 = tests[i].c1;
        var c2 = tests[i].c2;
        var ans = c1.times(c2);
        assertEqualsDelta("real", tests[i].answer.real(), ans.real(), eps);
        assertEqualsDelta("imaginary", tests[i].answer.imaginary(), ans.imaginary(), eps);
    }
};

TestMatMult.prototype.testDivide = function() {
    var tests = [
        {
            c1: new MatMult.Complex(4,-3),
            c2: new MatMult.Complex(3,-2),
            answer: new MatMult.Complex(1.3846153846153846, -0.07692307692307693)
        },
        {
            c1: new MatMult.Complex(4,-3),
            c2: new MatMult.Complex(3,-22),
            answer: new MatMult.Complex(0.15821501014198783, 0.16024340770791076)
        },
        {
            c1: new MatMult.Complex(7,-4),
            c2: new MatMult.Complex(3,2),
            answer: new MatMult.Complex(1, -2)
        },
        {
            c1: new MatMult.Complex(7,-4),
            c2: 3,
            answer: new MatMult.Complex(2.3333333333333335, -1.3333333333333333)
        }
    ];
    for (var i = 0; i < tests.length; i++) {
        var c1 = tests[i].c1;
        var c2 = tests[i].c2;
        var ans = c1.divide(c2);
        assertEqualsDelta("real", tests[i].answer.real(), ans.real(), eps);
        assertEqualsDelta("imaginary", tests[i].answer.imaginary(), ans.imaginary(), eps);
    }

};
