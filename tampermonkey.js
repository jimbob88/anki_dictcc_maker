// ==UserScript==
// @name         Dict.cc -> Anki Convertor
// @namespace    http://jimbob88.github.io/
// @version      0.1
// @description  Create Anki Cards from de/en anki
// @author       James Blackburn
// @match        https://www.dict.cc/?s=*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// @require https://code.jquery.com/jquery-3.6.0.min.js
// @run-at context-menu
// ==/UserScript==

var $, jQuery;
$ = jQuery = window.jQuery;

// http://audio.dict.cc/speak.audio.v2.php?error_as_text=1&type=mp3&id=63745&lang=de_rec_ip&lp=DEEN

function download_butt(location) {
    console.log("hello there budd");
    console.log(location);
    console.log(location.parent());
    console.log("spacer");
    var eng_string = "";
    var de_string = "";
    var de_gender = "";
    var en_extra = "";

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
           eng_string = temp_str;
           if ($(this).find("var").length > 0) {
               en_extra = $(this).find("var").attr("title");
           }
        } else {
            de_string = temp_str;
            if ($(this).find("var").length > 0) {
                de_gender = $(this).find("var").attr("title");
            }
        }
    });
    // ▶ Play
    let botpattern = /speak_nopop\((\d+),('\w+'),('\w+')\)/i
    var audiofile = "";
    // Default to using a robot
    //$('div.amenu').find("input.inp3").filter(function(){
    //    return ($(this).attr("value") == "▶ Play") & (botpattern.test($(this).attr("onclick")))
    //}).each(function(){
    //    audiofile = $(this).attr("onclick");
    //});
    // Prefer using a human voice
    //$('div.amenu').find("input.inp3").filter(function(){
    //   return ($(this).attr("value") == "▶ Play") //& (!botpattern.test($(this).attr("onclick")))
    //}).each(function(){
    //    audiofile = $(this).attr("onclick");
    //});
    //if (botpattern.test(audiofile)) {
    //    var match = audiofile.match(botpattern)
    //    var id = match[0]
    //    var
    //}
    audiofile = $("#speechlayer").find("#iplayer").attr("src");
    console.log(eng_string);
    console.log(de_string);
    console.log(de_gender);
    console.log(audiofile);
    alert([eng_string, en_extra, de_string, de_gender, audiofile].join('¬'));

}

function main() {
    $(".td7cmr").each(function(){
        //console.log($(this));
        var test = $('<button/>',
        {
            text: 'Anki',
            class: "jamesbutton",
            click: function () { download_butt($(this)); }
        });

        $(this).append(test);
        //console.log("Appended button");
        $(this).append(test);
    });

    console.log("Hello there bud");
}

(function() {
    'use strict';
     main();

    // Your code here...
})();
