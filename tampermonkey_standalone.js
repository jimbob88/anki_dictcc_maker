// ==UserScript==
// @name         Dict.cc -> Anki Convertor Standalone
// @namespace    http://jimbob88.github.io/
// @version      0.1
// @description  Create Anki Cards from de/en anki
// @author       James Blackburn
// @match        https://*.dict.cc/?s=*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// @require https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.6.1/sql-wasm.js
// @require https://code.jquery.com/jquery-3.6.0.min.js
// @require https://cdn.jsdelivr.net/gh/infinyte7/genanki-js/dist/genanki.js
// @require https://cdnjs.cloudflare.com/ajax/libs/jszip/3.7.1/jszip.min.js
// @require https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.0/FileSaver.min.js
// @run-at context-menu
// ==/UserScript==

var $, jQuery;
$ = jQuery = window.jQuery;
//const initSqlJs = window.initSqlJs;

// @require https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.6.1/sql-wasm.js
// @require https://raw.githubusercontent.com/krmanik/genanki-js/main/sample/js/sql/sql.js
// @require https://cdnjs.cloudflare.com/ajax/libs/require.js/2.3.6/require.min.js
// http://audio.dict.cc/speak.audio.v2.php?error_as_text=1&type=mp3&id=63745&lang=de_rec_ip&lp=DEEN
// https://ankidictccmaker.jimbob888.repl.co/get-anki/?first_language=EN&second_language=DE&first_string=soon&second_string=bald&first_extras=adv&second_extras=adv&second_audio=//audio.dict.cc/speak.audio.v2.php%3Ferror_as_text%3D1%26type%3Dmp3%26id%3D1468372%26lang%3Dde_rec_ip%26lp%3DDEEN

var config = {
        locateFile: filename => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.6.1/sql-wasm.wasm`
    }
var SQL = await initSqlJs(config);

async function download_butt(location, handside) {
    console.log("hello there budd");
    console.log(location);
    console.log(location.parent());
    console.log("spacer");
    var first_string = "";
    var second_string = "";
    var first_extras = "";
    var second_extras = "";

    location.parent().parent().find(".td7nl").each(function(idx){
        var temp_str = "";

        var detached_div, detached_var, detached_dfn;
        $(this).find("div").each(function(){
            detached_div = $(this).detach();
            console.log(detached_div);
        });
        $(this).find("var").each(function(){
            detached_var= $(this).detach();
            console.log(detached_var);
        });
        $(this).find("dfn").each(function(){
            detached_dfn= $(this).detach();
            console.log(detached_dfn);
        });


        temp_str = $(this).text();
        $(this).append(detached_div);
        $(this).append(detached_var);
        $(this).append(detached_dfn);
        if (idx == 0) {
           first_string = temp_str;
           if ($(this).find("var").length > 0) {
               first_extras = $(this).find("var").attr("title");
           }
        } else {
            second_string = temp_str;
            if ($(this).find("var").length > 0) {
                second_extras = $(this).find("var").attr("title");
            }
        }
    });
    // ▶ Play
    let botpattern = /speak_nopop\((\d+),('\w+'),('\w+')\)/i
    var audio = "";
    audio = $("#speechlayer").find("#iplayer").attr("src");

    if (typeof audio === 'undefined') {
        alert('Please choose an audiofile');
        return 0;
    }

    var url = window.location.href;
    let urlpattern = /https:\/\/(\w+).dict.cc/i;
    var _lang = url.match(urlpattern)[1];
    if (_lang == 'www') {
        _lang = 'ende';
    }
    if (_lang.includes("-")) {
        _lang = _lang.strip(0,2) + _lang.strip(3,5);
    }

    var lang1 = _lang.slice(0,2).toUpperCase();
    var lang2 = _lang.slice(2,4).toUpperCase();

    

    const [_deckid, anki_model] = create_model(lang1, lang2);

    var d = new Deck(_deckid, `Dict.cc Vocab (${lang1}-${lang2})`)

    console.log("FETCHING AUDIO");
    var blob;
    audio = "https:" + audio;
    let headers = new Headers({
        "User-Agent"   : "Mozilla/5.0 (X11; Linux armv7l) AppleWebKit/537.36 (KHTML, like Gecko) Raspbian Chromium/74.0.3729.157 Chrome/74.0.3729.157 Safari/537.36",
        "Content-Type" : "audio/mpeg"
    });
    await fetch(
        audio, { headers: headers}
      ).then(resp => resp.arrayBuffer()).then(resp => {
        // set the blog type to final pdf
        blob = new Blob([resp], {type: 'audio/mpeg'});
        //console.log(blob);
    });
    console.log(blob);

    const id_regex = /&id=(\d+)/gm;
    var _id = id_regex.exec(audio)[1];

    var filename = `${lang1}${lang2}-${_id}.mp3`;
    console.log(filename);

    if (handside == 'r') {
        d.addNote(
            anki_model.note(
                [first_string,
                 first_extras,
                 second_string,
                 second_extras,
                 "",
                 `[sound:${filename}]`
                ]
            )
        )
    } else {
        d.addNote(
            anki_model.note(
                [first_string,
                 first_extras,
                 second_string,
                 second_extras,
                 `[sound:${filename}]`,
                 ""
                ]
            )
        )
    }



    var p = new Package()
    p.addDeck(d)
    p.addMedia(blob, filename);

    p.writeToFile('deck.apkg')

    console.log("opened");


    

}

function main() {
    $(".td7cmr").each(function(){
        var test = $('<button/>',
        {
            text: 'Anki Right',
            class: "jamesbutton",
            click: function () { download_butt($(this), "r"); }
        });
        $(this).append(test);
    });

    $(".td7cml").each(function(){
        var test = $('<button/>',
        {
            text: 'Anki Left',
            class: "jamesbutton",
            click: function () { download_butt($(this), "l"); }
        });
        $(this).append(test);
    });

    console.log("Hello there bud");
}

function create_model(lang1, lang2) {
    var _id = "";
    for (const c of (lang1 + lang2)) {
        console.log(c)
        _id += c.charCodeAt()
    }

    console.log(_id);

    //_id = int("".join([str(ord(lett)) for lett in lang1 + lang2]))
     var m = new Model({
        name: `Dictcc Vocab Model (${lang1}/${lang2})`,
        id: _id,
        flds: [
            {name: `${lang1}`},
            {name: `${lang1}_extras`},
            {name: `${lang2}`},
            {name: `${lang2}_extras`},
            {name: "first_audiofile"},
            {name: "second_audiofile"},
        ],
        req: [
            [ 0, "all", [ 0 ] ],
            [ 1, "all", [ 1 ] ]
        ],
        tmpls: [
            {
                name: "Card 1",
                qfmt: `{{${lang1}}}<br/>{{${lang1}_extras}}<br/>{{first_audiofile}}`,
                afmt: `{{FrontSide}}<br/><hr id=answer><br/>{{${lang2}}}<br/>{{${lang2}_extras}}<br/>{{second_audiofile}}`,
            },
            {
                name: "Card 2",
                qfmt: `{{${lang2}}}<br/>{{${lang2}_extras}}<br/>{{second_audiofile}}`,
                afmt: `{{FrontSide}}<br/><hr id=answer><br/>{{${lang1}}}<br/>{{${lang1}_extras}}<br/>{{first_audiofile}}`,
            }
        ],
    });

    return [_id, m];
}

(async function() {
    'use strict';



     main();

    // Your code here...
})();

