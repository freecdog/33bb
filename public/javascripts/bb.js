/**
 * Created by jaric on 12.12.2014.
 */

requirejs.config({
    paths: {
        numbers: 'numbersAMD/lib/numbers',
        async: 'BB/lib/node_modules/async/lib/async',
        fs: 'BB/lib/node_modules/fsFake/fsFake',
        BB: 'BB/lib/BB',

        THREE: 'three',
        Stats: 'stats',
        dat: 'dat.gui',
        bbCompile: 'bbCompile'
    },
    shim: {
        'THREE': {
            exports: 'THREE'
        },
        'dat': {
            exports: 'dat'
        },
        'Stats': {
            exports: 'Stats'
        }
    }
});

requirejs(['BB', 'bbCompile'], function(BB, bbCompile) {
    // Don't want to start it automatically for now
    BB.BBup.run();

    setTimeout(function(){
        var d = (new BB.Datatone());
        d.breakCalculation = true;

        //localStorage.setItem('mo', JSON.stringify(d.memOut));
        d.memOut = JSON.parse( localStorage.getItem('mo') );

        bbCompile.start();
    }, 1000);
});