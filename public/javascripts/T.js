/**
 * Created by jaric on 01.12.2014.
 */

requirejs.config({
    //baseUrl: 'javascripts',
    paths: {
        numbers: 'numbersAMD/lib/numbers',
        async: 'BB/lib/node_modules/async/lib/async',
        fs: 'BB/lib/node_modules/fsFake/fsFake',
        BB: 'BB/lib/BB',

        THREE: 'three',
        Stats: 'stats',
        dat: 'dat.gui',
        threeProbe: 'threeProbe'
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

requirejs(['BB', 'threeProbe'], function(BB, threeProbe) {
    // Don't want to start it automatically for now
    //BB.BBup.run();

    threeProbe.start();
});