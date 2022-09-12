// ==UserScript==
// @name         Dict.cc -> Anki Convertor Standalone
// @namespace    http://jimbob88.github.io/
// @version      0.1
// @description  Create Anki Cards from de/en anki
// @author       James Blackburn
// @match        https://*.dict.cc/?s=*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        GM_xmlhttpRequest
// @require https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.6.1/sql-wasm.js
// @require https://code.jquery.com/jquery-3.6.0.min.js
// @require https://cdn.jsdelivr.net/gh/infinyte7/genanki-js/dist/genanki.js
// @require https://cdnjs.cloudflare.com/ajax/libs/jszip/3.7.1/jszip.min.js
// @require https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.0/FileSaver.min.js
// @run-at context-menu
// @connect audio.dict.cc
// ==/UserScript==

var $, jQuery;
$ = jQuery = window.jQuery;
var config = {
    locateFile: filename => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.6.1/sql-wasm.wasm`
}
var SQL = await initSqlJs(config);

/**
 * An async function for getting responses (ignoring cors)
 * @param  {string} method The method, i.e. 'GET', 'POST'
 * @param  {string} url The url to get
 * @param  {string} response_type The type of response, i.e. 'arraybuffer'
 */
function get_response(method, url, response_type) {
    return new Promise(function (resolve, reject) {
        GM_xmlhttpRequest({
            url: url,
            method: method,
            responseType: response_type,
            onload: function(response) {
                 if (response.status >= 200 && response.status < 300) {
                     resolve(response);
                 } else {
                     reject({
                         status: response.status,
                         statusText: response.statusText
                     });
                 }
            },
            onabort: function(response) {
                reject({
                    status: response.status,
                    statusText: response.statusText
                });
            },
            onerror: function(response) {
                reject({
                    status: response.status,
                    statusText: response.statusText
                });
            }
        })
    });
}
/**
 * @param  {jQuery} location The button
 * @type {{first_string: string, second_string: string,
 *           first_extras: string, second_extras: string}}
 */
function get_strings(button) {
    let strings = {
        first_string: "",
        second_string: "",
        first_extras: "&nbsp;",
        second_extras: "&nbsp;",
    }

    button.closest('tr').find(".td7nl").each(function(idx){
        var temp_str = "";
        
        // Removes all text that we don't want to grab from the page.
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

        // Re-appends deleted text
        $(this).append(detached_div);
        $(this).append(detached_var);
        $(this).append(detached_dfn);

        if (idx == 0) {
           strings.first_string = temp_str;
           if ($(this).find("var").length > 0) {
               strings.first_extras = $(this).find("var").attr("title");
           }
        } else {
            strings.second_string = temp_str;
            if ($(this).find("var").length > 0) {
                strings.second_extras = $(this).find("var").attr("title");
            }
        }
    });
    return strings
}

/**
 * @type {{lang1: string, lang2: string}}
 */
function get_langs() {
    var url = window.location.href;
    let urlpattern = /https:\/\/(\w+).dict.cc/i;
    var _lang = url.match(urlpattern)[1];
    if (_lang == 'www') {
        _lang = 'ende';
    }
    if (_lang.includes("-")) {
        _lang = _lang.strip(0,2) + _lang.strip(3,5);
    }

    return {
        lang1: _lang.slice(0,2).toUpperCase(),
        lang2: _lang.slice(2,4).toUpperCase()
    }
}

/**
 * Function used by the button to download said anki card
 * @param  {Element} location The button itself
 * @param  {string} handside Which side, i.e. l or r
 */
async function download_butt(location, handside) {
    console.log(`Adding download button to ${location} on the ${handside} side`)
    var strings = get_strings(location)
    
    // ▶ Play -> Get audio
    var audio = "";
    audio = $("#speechlayer").find("#iplayer").attr("src");

    if (typeof audio === 'undefined') {
        alert('Please choose an audiofile');
        return 1;
    }

    var langs = get_langs()

    const [_deckid, anki_model] = create_model(langs.lang1, langs.lang2);

    var d = new Deck(_deckid, `Dict.cc Vocab (${langs.lang1}-${langs.lang2})`)

    console.log("FETCHING AUDIO");
    var blob;
    audio = "https:" + audio;
    let response = await get_response('GET', audio, 'arraybuffer');
    if (!(response.status >= 200 && response.status < 300)) {
        alert('Response failed check console');
        console.log(response);
        return 1;
    }
    blob = new Blob([response.response], {type: 'audio/mpeg'});
    console.log(blob);

    const id_regex = /&id=(\d+)/gm;
    var _id = id_regex.exec(audio)[1];

    var filename = `${langs.lang1}${langs.lang2}-${_id}.mp3`;
    console.log(filename);

    if (handside == 'r') {
        d.addNote(
            anki_model.note(
                [strings.first_string,
                    strings.first_extras,
                    strings.second_string,
                    strings.second_extras,
                 "",
                 `[sound:${filename}]`
                ]
            )
        )
    } else {
        d.addNote(
            anki_model.note(
                [strings.first_string,
                    strings.first_extras,
                    strings.second_string,
                    strings.second_extras,
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

function add_buttons() {
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
}

function main() {
    add_buttons();
    console.log("Added Buttons");
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
})();
