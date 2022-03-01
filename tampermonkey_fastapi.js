// ==UserScript==
// @name         Dict.cc -> Anki Convertor FastAPI Edition
// @namespace    http://jimbob88.github.io/
// @version      0.3
// @description  Create Anki Cards from de/en anki
// @author       James Blackburn
// @match        https://*.dict.cc/?s=*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// @require https://code.jquery.com/jquery-3.6.0.min.js
// @run-at context-menu
// ==/UserScript==

var $, jQuery;
$ = jQuery = window.jQuery;

// http://audio.dict.cc/speak.audio.v2.php?error_as_text=1&type=mp3&id=63745&lang=de_rec_ip&lp=DEEN
// https://ankidictccmaker.jimbob888.repl.co/get-anki/?first_language=EN&second_language=DE&first_string=soon&second_string=bald&first_extras=adv&second_extras=adv&second_audio=//audio.dict.cc/speak.audio.v2.php%3Ferror_as_text%3D1%26type%3Dmp3%26id%3D1468372%26lang%3Dde_rec_ip%26lp%3DDEEN

function download_butt(location, handside) {
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
        //$(this).find("a").each(function(){
        //        if ($(this).find("kbd").length == 0) {
        //            temp_str += $(this).text() + " "
        //        }
        //});
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
    console.log(url);
    console.log(_lang);

    var lang1 = _lang.slice(0,2).toUpperCase();
    var lang2 = _lang.slice(2,4).toUpperCase();
    console.log(lang1, lang2);

    var custom_url = "https://ankidictccmaker.jimbob888.repl.co/get-anki/?first_language=" + lang1;
    custom_url += "&second_language=" + lang2;
    custom_url += "&first_string=" + first_string;
    custom_url += "&second_string=" + second_string;
    custom_url += "&first_extras=" + first_extras;
    custom_url += "&second_extras=" + second_extras;
    custom_url += "&second_extras=" + second_extras;
    if (handside == "r") {
        custom_url += "&second_audio=" + encodeURIComponent(audio);
    } else {
        custom_url += "&first_audio=" + encodeURIComponent(audio);
    }
    console.log(custom_url);
    window.open(custom_url, '_blank');
}

function main() {
    $(".td7cmr").each(function(){
        var test = $('<button/>',
        {
            text: 'Anki Right',
            class: "jamesbutton",
            click: function () { download_butt($(ths), "r"); }
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

(function() {
    'use strict';
     main();

    // Your code here...
})();

