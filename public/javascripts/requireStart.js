/**
 * Created by jaric on 26.11.2014.
 */

requirejs.config({
    baseUrl: 'javascripts',
    paths: {
        numbers: 'numbersAMD/lib/numbers',
        //numbers: 'numbersAMD/index',
        async: 'async/lib/async'
    }
    /*shim: {
        'numbers': {
            exports: 'numbers'
        }
    }*/
});

requirejs([
    'numbers',
    'async',
    'FUNC2',
    'MatMult',
    'BBstart',
    'BBcount',
    'BBup'
], function(asd,dsa){
    console.log(asd, dsa);
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