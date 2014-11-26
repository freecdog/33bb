/**
 * Created by jaric on 26.11.2014.
 */

requirejs.config({
    baseUrl: 'javascripts',
    paths: {
        numbers: 'numbers/src/numbers',
        async: 'async/lib/async'
    }
});

requirejs([
    //'BBup'
    'numbers'
], function(numbers){
    console.log(numbers);
});

/*
requirejs([
    'numbers',
    'FUNC2',
    'async',
    'MatMult',
    'BBstart',
    'BBcount',
    'BBup'
]);*/