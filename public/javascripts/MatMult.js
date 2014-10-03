/**
 * Created by jaric on 19.09.2014.
 */

(function(exports){

    var listOfLanguages = [];

    var englishLanguage = {
        "name": "en",
        "Play": {
            "Buttons": {
                "restart": "restart",
                "reroll": "reroll",
                "accept": "accept"
            },
            "Statuses": {
                "20": "game in progress",
                "90": "game is finished, touch [restart] to play again",
                "-1": "game is abandoned, touch [restart] to play again",
                "undefined": "searching for a game, if nothing is happening for too long touch [restart]",
                "other": "unknown state, touch [restart] to play again"
            },
            "Combinations": {
                "ones": "Ones",
                "twos": "Twos",
                "threes": "Threes",
                "fours": "Fours",
                "fives": "Fives",
                "sixes": "Sixes",
                "3ofaKind": "3 of a kind",
                "4ofaKind": "4 of a kind",
                "fullHouse": "Full house",
                "smallStraight": "Small straight",
                "largeStraight": "Large straight",
                "yatzy": "Yatzy",
                "chance": "Chance"
            },
            "Winners": {
                "winner": "Winner is",
                "results": "Results:"
            },
            "Other": {
                "playersSearching": ", players searching now: ",
                "total": "total: "
            }
        },
        "Menu": {
            "menu": "Menu",
            "play": "Play",
            "singleplayer": "Singleplayer",
            "multiplayer": "Multiplayer",
            "onlineStatistics": "Statistics",
            "rules": "Rules",
            "settings": "Settings",
            "about": "About",
            "searching": "searching:"
        },
        "About": {
            "text1": "Hi, I'm Jaric, the author of this app, nice to meet you! Thank you so much for being here. I hope you enjoy it!",
            "text2": "Windows Phone app by Andrey is coming soon.",
            "text3": "Feel free to contact me at mm1000@list.ru",
            "text4": "Inspired by Pavel, and Ann, and Elena."
        },
        "Rules": {
            "bonus": "If in the end of game sum of 1er, 2er, 3er, 4er, 5er, 6er is more or equal 63, you will get additional 35 points."
        },
        "Settings": {
            "name": "Name:",
            "multiplayer": "Multiplayer",
            "playerNumbers": "Number of players:",
            "style": "Style:",
            "language": "Language:"
        }
    };
    var russianLanguage = {
        "name": "ru",
        "Play": {
            "Buttons": {
                "restart": "рестарт",
                "reroll": "перекинуть",
                "accept": "принять"
            },
            "Statuses": {
                "20": "игра идет",
                "90": "игра закончилась, нажмите [рестарт] чтобы начать заново",
                "-1": "игра заброшена, нажмите [рестарт] чтобы начать заново",
                "undefined": "поиск игры, если долго ничего не происходит — нажмите [рестарт]",
                "other": "неизвестное состояние, нажмите [рестарт]"
            },
            "Combinations": {
                "ones": "Единицы",
                "twos": "Двойки",
                "threes": "Тройки",
                "fours": "Четверки",
                "fives": "Пятерки",
                "sixes": "Шестерки",
                "3ofaKind": "Сет",
                "4ofaKind": "Каре",
                "fullHouse": "Фул-хаус",
                "smallStraight": "Маленькая улица",
                "largeStraight": "Большая улица",
                "yatzy": "Язь",
                "chance": "Шанс"
            },
            "Winners": {
                "winner": "Победитель",
                "results": "Результаты:"
            },
            "Other": {
                "playersSearching": ", количество игроков ищуших игру: ",
                "total": "итого: "
            }
        },
        "Menu": {
            "menu": "Меню",
            "play": "Играть",
            "singleplayer": "Одиночная игра",
            "multiplayer": "Мультиплеер",
            "onlineStatistics": "Статистика игр",
            "rules": "Правила",
            "settings": "Настройки",
            "about": "О проекте",
            "searching": "ищут игру:"
        },
        "About": {
            "text1": "Привет, меня зовут Ярик, я автор этого приложения, рад вас видеть! Спасибо, что вы здесь. Надеюсь, вам здесь нравится!",
            "text2": "Андрей готовит версию для Windows Phone",
            "text3": "По всем вопросам вы можете обращаться по адресу mm1000@list.ru",
            "text4": "Под влиянием Паши, Ани и Лены."
        },
        "Rules": {
            "bonus": "Если к концу игры сумма единичек, двоек, троек, четверок, пятерок и шестерок больше либо равна 64, вы получите дополнительные 35 очков."
        },
        "Settings": {
            "name": "Имя:",
            "multiplayer": "Мультиплеер",
            "playerNumbers": "Количество игроков:",
            "style": "Стиль:",
            "language": "Язык:"
        }
    };
    var deutschLanguage = {
        "name": "de",
        "Play": {
            "Combinations": {
                "ones": "1er",
                "twos": "2er",
                "threes": "3er",
                "fours": "4er",
                "fives": "5er",
                "sixes": "6er",
                "3ofaKind": "Dreir pasch",
                "4ofaKind": "Vierer pasch",
                "fullHouse": "Full house",
                "smallStraight": "Kleine straße",
                "largeStraight": "Große straße",
                "yatzy": "Yazzee",
                "chance": "Chance"
            }
        }
    };

    var deepCloneStopper = 100000, deepCloneIterator = 0;  // to prevent infinite
    function deepClone(obj1, obj2, elem){
        if (deepCloneStopper-- < 0) return;
        deepCloneIterator++;

        var objType = typeof(obj1);
        if (objType == 'string' || objType == 'number' || objType == 'boolean'){
            obj2[elem] = obj1;
        } else if(objType == 'object') {
            var toStr = Object.prototype.toString.call( obj1 );
            var nextObj;
            if( toStr === '[object Array]' ) {
                if (obj2 == null) {
                    obj2 = [];
                    nextObj = obj2;
                } else {
                    obj2[elem] = [];
                    nextObj = obj2[elem];
                }
            }
            if( toStr === '[object Object]' ) {
                if (obj2 == null) {
                    obj2 = {};
                    nextObj = obj2;
                } else {
                    obj2[elem] = {};
                    nextObj = obj2[elem];
                }
            }
            for (var element in obj1){
                if (obj1.hasOwnProperty(element)){
                    deepClone(obj1[element], nextObj, element);
                }
            }
        }
        deepCloneIterator--;
        if (deepCloneIterator == 0) {
            return obj2;
        }
    }
    var cloneElementsStopper = 100000, cloneTemplateIterator = 0;  // to prevent infinite recursion
    // clone element by template, obj1 is template, obj2 object with new values
    // if obj2 has objects with same keys then obj1 values will be overwritten
    function cloneElementsByTemplate(level, obj1, obj2, parent1, parent2, parentElement, elementName){
        if (cloneElementsStopper-- < 0) return;
        cloneTemplateIterator++;

        if (parent1 == null) parent1 = obj1;
        if (parent2 == null) parent2 = obj2;

        var objType = typeof(obj1);
        if (objType == 'string' || objType == 'number' || objType == 'boolean'){
            parentElement[elementName] = obj2;
        } else if (objType == 'object'){
            for (var element in obj1) {
                if (obj1.hasOwnProperty(element)){
                    if (obj2.hasOwnProperty(element)){
                        cloneElementsByTemplate(level+1, obj1[element], obj2[element], parent1, parent2, obj1, element);
                    }
                }
            }
            if (Object.keys(obj2).length > Object.keys(obj1).length) {
                for (var extraElement in obj2) {
                    if (obj2.hasOwnProperty(extraElement) && obj1.hasOwnProperty(extraElement) == false) {
                        console.warn(parent2.name, 'has extra param:', extraElement);
                    }
                }
            }
        } else {
            console.error('different type ', obj1, obj2, level, 'type:', objType);
        }

        cloneTemplateIterator--;
        if (cloneTemplateIterator == 0) {
            //action on exit
        }
    }
    function jsonToLanguagePack(language){
        // load base(english) values, to fill all objects (if language isn't full), underscore sucks here because clone(expand) doesn't clone arrays in array only links
        var lp = deepClone(englishLanguage);
        cloneElementsByTemplate(0, lp, language);
        //console.warn('new', lp);

        return lp;
    }
    var loadedPacks = [];
    function importLanguage(language){
        var languageName = language.name;
        listOfLanguages.push(languageName);
        exports[languageName] = jsonToLanguagePack(language);

        loadedPacks.push(language);
    }
    importLanguage(englishLanguage);
    importLanguage(russianLanguage);
    importLanguage(deutschLanguage);

    exports.importLanguage = importLanguage;
    exports.loadedPacks = loadedPacks;

    var defaultLanguage = function(){return 'en';};
    exports.defaultLanguage = defaultLanguage;
    exports.listOfLanguages = listOfLanguages;

    // Test section
    var compareElementsStopper = 100000;  // to prevent infinite recursion
    // compare recursively ethalon object with other
    function compareElements(level, obj1, obj2, parent1, parent2){
        if (compareElementsStopper-- < 0) return;

        if (parent1 == null) parent1 = obj1;
        if (parent2 == null) parent2 = obj2;

        var objType = typeof(obj1);
        if (objType == 'object'){
            for (var element in obj1) {
                if (obj1.hasOwnProperty(element)){
                    //var str = ''; for (var i = 0; i < level; i++) str += '  ';
                    //console.log(str, element, obj2[element], obj1[element]);
                    if (obj2.hasOwnProperty(element)){
                        // don't need to compare strings, obviously they are different
                        if (typeof(obj1[element]) == 'object') {
                            //console.log('going to compare:', element);
                            //console.log(JSON.stringify(obj1[element]));
                            //console.log(JSON.stringify(obj2[element]));
                            compareElements(level+1, obj1[element], obj2[element], parent1, parent2);
                        }
                    } else {
                        console.warn(parent2.name, 'does not have param:', element, ', priority:', level+1);
                    }
                }
            }
            if (Object.keys(obj2).length > Object.keys(obj1).length) {
                for (var extraElement in obj2) {
                    if (obj2.hasOwnProperty(extraElement) && obj1.hasOwnProperty(extraElement) == false) {
                        console.warn(parent2.name, 'has extra param:', extraElement);
                    }
                }
            }
        } else {
            console.error('different type ', obj1, obj2, level);
        }
    }

    exports.runTestOfCoverage = function(){
        var ethalon;
        for (var ei = 0; ei < loadedPacks.length; ei++) {
            if (loadedPacks[ei].name == defaultLanguage()) {
                ethalon = loadedPacks[ei];
                break;
            }
        }

        console.log('Ethalon language is', ethalon.name);
        for (var i = 0; i < loadedPacks.length; i++){
            var name = loadedPacks[i].name;
            if (ethalon.name == name) continue;

            console.log('going to compare with', name);
            //console.log(JSON.stringify(ethalon));
            //console.log(JSON.stringify(Localization[name]));
            compareElements(0, ethalon, loadedPacks[i]);
        }
    }

})(typeof exports === 'undefined'? this['Localization']={} : exports);