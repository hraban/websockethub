// Websockethub. Easy chatrooms for your website.
// Copyright © 2014-2017 Websockethub authors (see AUTHORS file)
// 
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
// 
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
// 
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

"use strict";

(function () {

    // got some random words didn't check these (obviously)--don't kill me if
    // there's some horrible combination here
    var adjectives = "grouchy compassionate buoyant remote required growing impeccable indolent worried pretty unique darling next impressive hard unhappy pungent scratchy elliptical ideal perfect ashamed unimportant front wrathful impossible frightening hidden glass vigilant clear actual thorny daring limited sizzling baggy expensive haunting silly delirious beneficial harmful cheery different frigid both celebrated inconsequential pleased oval improbable close profuse foolhardy flimsy fresh edible loyal sweltering weighty robust arctic testy courageous better prime striped enormous alienated nasty tangible distant hairy terrible astonishing blue acclaimed oblong supportive rusty severe golden bleak watery pesky jumpy single anguished interesting extra-small kindhearted intent tan lanky biodegradable minty polished soggy grizzled bright vibrant shy focused worthless frozen monthly windy neighboring disastrous dreary incompatible gregarious sorrowful quick-witted everlasting flawless informal snappy wiggly forsaken mealy klutzy twin discrete lustrous swift similar unnatural gross regular remorseful same pastel flashy nautical lazy sunny equatorial devoted frequent glittering talkative ringed fickle cumbersome overjoyed late flaky exemplary glossy tinted conscious classic trustworthy infinite witty trim knotty half educated medium juicy favorite female blond worldly complicated motherly tough short-term warmhearted failing delayed bite-sized vast inferior quarterly yawning sour weepy free poor tragic stylish outstanding wee mixed cool bony metallic this each odd quick assured ill-fated jaunty extraneous quarrelsome scary adolescent dizzy square palatable noisy massive rash memorable rowdy perky adept nifty super ornate teeming crowded international uncomfortable mushy petty phony profitable well-made sugary spotted appropriate melodic average distant ugly worrisome evergreen faraway circular tidy grand indelible rotating brave limp knowing gorgeous authentic vapid corrupt imperfect physical subtle humongous".split(" ");
    var nouns = "bear jail hospital babies time poison kitty airport substance peace shape crook frame work letter zebra regret lamp brass eyes respect stick pleasure representative shade form pie tax trees veil agreement holiday visitor judge bucket soap passenger government dime mouth approval cakes ice playground brain space language channel cream pipe cough hill control smash stone rings star baby head sisters lip mice land morning parent riddle stream exchange son faucet development force aunt kick love direction prose trousers neck desk breath grass guide pigs zoo father kiss pizzas gun action kettle daughter night lace punishment ghost writer nest river wing print existence prison amusement bone cushion comb throat wood back alley base profit health hobbies boot body spring advice fall spade word end brother debt account country servant apples suit cactus powder field anger grip umbrella birds brick help noise marble teeth beginner owner patch tooth cup border kittens stop transport wealth trick motion volleyball lizards cellar bread jellyfish harbor discovery dirt oven bikes yard insurance boats boy game brush spark clock women baseball stretch soup cub brothers rub order tendency alarm face vase earthquake lunch seed caption top invention eggs carriage frog fuel cover celery plants volcano ball ray flame meat cook suggestion iron event salt notebook market throne attempt pet doll nerve argument snake stomach ducks cemetery sidewalk self trains queen beef zinc flag things payment rabbit pocket canvas eggnog pail brake treatment smile sugar history rainstorm crib hose tramp rate metal rice story farm street mine bait".split(' ');

    function makeCSStext() {
        // Minified cleanslate.css for resetting host site's CSS
        // scope by class, not ID, to allow precedence from #id and tag.class
        // selectors below
        var cleanslateCSS = '.websockethub_chatroom_cleanslate,.websockethub_chatroom_cleanslate a,.websockethub_chatroom_cleanslate abbr,.websockethub_chatroom_cleanslate acronym,.websockethub_chatroom_cleanslate address,.websockethub_chatroom_cleanslate applet,.websockethub_chatroom_cleanslate article,.websockethub_chatroom_cleanslate aside,.websockethub_chatroom_cleanslate audio,.websockethub_chatroom_cleanslate b,.websockethub_chatroom_cleanslate big,.websockethub_chatroom_cleanslate blockquote,.websockethub_chatroom_cleanslate caption,.websockethub_chatroom_cleanslate cite,.websockethub_chatroom_cleanslate code,.websockethub_chatroom_cleanslate dd,.websockethub_chatroom_cleanslate del,.websockethub_chatroom_cleanslate dfn,.websockethub_chatroom_cleanslate dialog,.websockethub_chatroom_cleanslate div,.websockethub_chatroom_cleanslate dl,.websockethub_chatroom_cleanslate dt,.websockethub_chatroom_cleanslate em,.websockethub_chatroom_cleanslate fieldset,.websockethub_chatroom_cleanslate figure,.websockethub_chatroom_cleanslate font,.websockethub_chatroom_cleanslate footer,.websockethub_chatroom_cleanslate form,.websockethub_chatroom_cleanslate h1,.websockethub_chatroom_cleanslate h2,.websockethub_chatroom_cleanslate h3,.websockethub_chatroom_cleanslate h4,.websockethub_chatroom_cleanslate h5,.websockethub_chatroom_cleanslate h6,.websockethub_chatroom_cleanslate header,.websockethub_chatroom_cleanslate hgroup,.websockethub_chatroom_cleanslate hr,.websockethub_chatroom_cleanslate i,.websockethub_chatroom_cleanslate iframe,.websockethub_chatroom_cleanslate img,.websockethub_chatroom_cleanslate input,.websockethub_chatroom_cleanslate ins,.websockethub_chatroom_cleanslate kbd,.websockethub_chatroom_cleanslate label,.websockethub_chatroom_cleanslate legend,.websockethub_chatroom_cleanslate li,.websockethub_chatroom_cleanslate mark,.websockethub_chatroom_cleanslate menu,.websockethub_chatroom_cleanslate nav,.websockethub_chatroom_cleanslate object,.websockethub_chatroom_cleanslate ol,.websockethub_chatroom_cleanslate option,.websockethub_chatroom_cleanslate p,.websockethub_chatroom_cleanslate pre,.websockethub_chatroom_cleanslate q,.websockethub_chatroom_cleanslate s,.websockethub_chatroom_cleanslate samp,.websockethub_chatroom_cleanslate section,.websockethub_chatroom_cleanslate select,.websockethub_chatroom_cleanslate small,.websockethub_chatroom_cleanslate span,.websockethub_chatroom_cleanslate strike,.websockethub_chatroom_cleanslate strong,.websockethub_chatroom_cleanslate sub,.websockethub_chatroom_cleanslate sup,.websockethub_chatroom_cleanslate table,.websockethub_chatroom_cleanslate tbody,.websockethub_chatroom_cleanslate td,.websockethub_chatroom_cleanslate textarea,.websockethub_chatroom_cleanslate tfoot,.websockethub_chatroom_cleanslate th,.websockethub_chatroom_cleanslate thead,.websockethub_chatroom_cleanslate time,.websockethub_chatroom_cleanslate tr,.websockethub_chatroom_cleanslate tt,.websockethub_chatroom_cleanslate ul,.websockethub_chatroom_cleanslate var,.websockethub_chatroom_cleanslate video{background-attachment:scroll;background-color:transparent;background-image:none;background-position:0 0;background-repeat:repeat;border-color:#000;border-color:currentColor;border-radius:0;border-style:none;border-width:medium;bottom:auto;clear:none;clip:auto;color:inherit;counter-increment:none;counter-reset:none;cursor:auto;direction:inherit;display:inline;float:none;font-family:inherit;font-size:inherit;font-style:inherit;font-variant:normal;font-weight:inherit;height:auto;left:auto;letter-spacing:normal;line-height:inherit;list-style-type:inherit;list-style-position:outside;list-style-image:none;margin:0;max-height:none;max-width:none;min-height:0;min-width:0;opacity:1;outline:invert none medium;overflow:visible;padding:0;position:static;quotes:"" "";right:auto;table-layout:auto;text-align:inherit;text-decoration:inherit;text-indent:0;text-transform:none;top:auto;unicode-bidi:normal;vertical-align:baseline;visibility:inherit;white-space:normal;width:auto;word-spacing:normal;z-index:auto;-moz-border-radius:0;-webkit-border-radius:0;-moz-box-sizing:content-box;-webkit-box-sizing:content-box;box-sizing:content-box;text-shadow:none}.websockethub_chatroom_cleanslate,.websockethub_chatroom_cleanslate address,.websockethub_chatroom_cleanslate article,.websockethub_chatroom_cleanslate aside,.websockethub_chatroom_cleanslate blockquote,.websockethub_chatroom_cleanslate caption,.websockethub_chatroom_cleanslate dd,.websockethub_chatroom_cleanslate dialog,.websockethub_chatroom_cleanslate div,.websockethub_chatroom_cleanslate dl,.websockethub_chatroom_cleanslate dt,.websockethub_chatroom_cleanslate fieldset,.websockethub_chatroom_cleanslate figure,.websockethub_chatroom_cleanslate footer,.websockethub_chatroom_cleanslate form,.websockethub_chatroom_cleanslate h1,.websockethub_chatroom_cleanslate h2,.websockethub_chatroom_cleanslate h3,.websockethub_chatroom_cleanslate h4,.websockethub_chatroom_cleanslate h5,.websockethub_chatroom_cleanslate h6,.websockethub_chatroom_cleanslate header,.websockethub_chatroom_cleanslate hgroup,.websockethub_chatroom_cleanslate hr,.websockethub_chatroom_cleanslate menu,.websockethub_chatroom_cleanslate nav,.websockethub_chatroom_cleanslate ol,.websockethub_chatroom_cleanslate option,.websockethub_chatroom_cleanslate p,.websockethub_chatroom_cleanslate pre,.websockethub_chatroom_cleanslate section,.websockethub_chatroom_cleanslate select,.websockethub_chatroom_cleanslate textarea,.websockethub_chatroom_cleanslate ul{display:block}.websockethub_chatroom_cleanslate table{display:table}.websockethub_chatroom_cleanslate thead{display:table-header-group}.websockethub_chatroom_cleanslate tbody{display:table-row-group}.websockethub_chatroom_cleanslate tfoot{display:table-footer-group}.websockethub_chatroom_cleanslate tr{display:table-row}.websockethub_chatroom_cleanslate td,.websockethub_chatroom_cleanslate th{display:table-cell}.websockethub_chatroom_cleanslate nav ol,.websockethub_chatroom_cleanslate nav ul{list-style-type:none}.websockethub_chatroom_cleanslate menu,.websockethub_chatroom_cleanslate ul{list-style-type:disc}.websockethub_chatroom_cleanslate ol{list-style-type:decimal}.websockethub_chatroom_cleanslate menu menu,.websockethub_chatroom_cleanslate menu ul,.websockethub_chatroom_cleanslate ol menu,.websockethub_chatroom_cleanslate ol ul,.websockethub_chatroom_cleanslate ul menu,.websockethub_chatroom_cleanslate ul ul{list-style-type:circle}.websockethub_chatroom_cleanslate menu menu menu,.websockethub_chatroom_cleanslate menu menu ul,.websockethub_chatroom_cleanslate menu ol menu,.websockethub_chatroom_cleanslate menu ol ul,.websockethub_chatroom_cleanslate menu ul menu,.websockethub_chatroom_cleanslate menu ul ul,.websockethub_chatroom_cleanslate ol menu menu,.websockethub_chatroom_cleanslate ol menu ul,.websockethub_chatroom_cleanslate ol ol menu,.websockethub_chatroom_cleanslate ol ol ul,.websockethub_chatroom_cleanslate ol ul menu,.websockethub_chatroom_cleanslate ol ul ul,.websockethub_chatroom_cleanslate ul menu menu,.websockethub_chatroom_cleanslate ul menu ul,.websockethub_chatroom_cleanslate ul ol menu,.websockethub_chatroom_cleanslate ul ol ul,.websockethub_chatroom_cleanslate ul ul menu,.websockethub_chatroom_cleanslate ul ul ul{list-style-type:square}.websockethub_chatroom_cleanslate li{display:list-item;min-height:auto;min-width:auto}.websockethub_chatroom_cleanslate strong{font-weight:700}.websockethub_chatroom_cleanslate em{font-style:italic}.websockethub_chatroom_cleanslate code,.websockethub_chatroom_cleanslate kbd,.websockethub_chatroom_cleanslate samp{font-family:monospace}.websockethub_chatroom_cleanslate a,.websockethub_chatroom_cleanslate a *,.websockethub_chatroom_cleanslate input[type=checkbox],.websockethub_chatroom_cleanslate input[type=radio],.websockethub_chatroom_cleanslate input[type=submit],.websockethub_chatroom_cleanslate select{cursor:pointer}.websockethub_chatroom_cleanslate a:hover{text-decoration:underline}.websockethub_chatroom_cleanslate button,.websockethub_chatroom_cleanslate input[type=submit]{text-align:center}.websockethub_chatroom_cleanslate input[type=hidden]{display:none}.websockethub_chatroom_cleanslate abbr[title],.websockethub_chatroom_cleanslate acronym[title],.websockethub_chatroom_cleanslate dfn[title]{cursor:help;border-bottom-width:1px;border-bottom-style:dotted}.websockethub_chatroom_cleanslate ins{background-color:#ff9;color:#000}.websockethub_chatroom_cleanslate del{text-decoration:line-through}.websockethub_chatroom_cleanslate blockquote,.websockethub_chatroom_cleanslate q{quotes:none}.websockethub_chatroom_cleanslate blockquote:after,.websockethub_chatroom_cleanslate blockquote:before,.websockethub_chatroom_cleanslate li:after,.websockethub_chatroom_cleanslate li:before,.websockethub_chatroom_cleanslate q:after,.websockethub_chatroom_cleanslate q:before{content:""}.websockethub_chatroom_cleanslate input,.websockethub_chatroom_cleanslate select{vertical-align:middle}.websockethub_chatroom_cleanslate input,.websockethub_chatroom_cleanslate select,.websockethub_chatroom_cleanslate textarea{border:1px solid #ccc}.websockethub_chatroom_cleanslate table{border-collapse:collapse;border-spacing:0}.websockethub_chatroom_cleanslate hr{display:block;height:1px;border:0;border-top:1px solid #ccc;margin:1em 0}.websockethub_chatroom_cleanslate [dir=rtl]{direction:rtl}.websockethub_chatroom_cleanslate mark{background-color:#ff9;color:#000;font-style:italic;font-weight:700}.websockethub_chatroom_cleanslate{font-size:medium;line-height:1;direction:ltr;text-align:left;font-family:"Times New Roman",Times,serif;color:#000;font-style:normal;font-weight:400;text-decoration:none;list-style-type:disc}';

        // Everything prefixed with container ID for consistency (and to ensure
        // overriding cleanslate.css), all attribute names and inner IDs
        // prefixed with websockethub_chatroom_ to prevent styles from affecting
        // host pages
        // ... sigh, <style scoped> :(
        return cleanslateCSS + '\
#websockethub_chatroom_ { \
    position: absolute; \
    right: 50px; \
    top: 50px; \
    border: solid thin black; \
    background-color: white; \
    z-index: 1000; \
    display: flex; \
    flex-direction: column; \
    justify-content: flex-end; \
    width: 300px; \
    height: 500px; \
    font-size: 12pt; \
} \
#websockethub_chatroom_.websockethub_chatroom_mini, \
#websockethub_chatroom_ .websockethub_chatroom_minifier { \
    width: 100px; \
    height: 100px; \
    font-size: 6pt; \
} \
#websockethub_chatroom_ .websockethub_chatroom_minifier { \
    top: 0; \
    right: 0; \
    position: absolute; \
} \
#websockethub_chatroom_[data-conn-state=connected] .connMsg { \
    display: none; \
} \
#websockethub_chatroom_ #websockethub_chatroom_messages { \
    overflow-x: hidden; \
    overflow-y: auto; \
} \
#websockethub_chatroom_.websockethub_chatroom_mini #websockethub_chatroom_messages { \
    overflow-y: hidden; \
} \
#websockethub_chatroom_.websockethub_chatroom_mini > :not(#websockethub_chatroom_messages):not(.connMsg):not(.websockethub_chatroom_minifier) { \
    display: none; \
} \
#websockethub_chatroom_:not(.websockethub_chatroom_mini):hover .websockethub_chatroom_minifier { \
    background-color: rgba(151, 190, 151, 0.64); \
} \
#websockethub_chatroom_ .websockethub_chatroom_name { \
    font-weight: bold; \
} \
#websockethub_chatroom_ #websockethub_chatroom_nameForm { \
    margin-top: 100px; \
} \
#websockethub_chatroom_:not(.websockethub_chatroom_configMode) #websockethub_chatroom_config { \
    display: none; \
} \
#websockethub_chatroom_ #websockethub_chatroom_nameForm input { \
    text-align: left; \
} \
#websockethub_chatroom_ .websockethub_chatroom_advancedConfig { \
    width: 75%; \
    text-align: left; \
    margin-left: auto; \
    margin-right: auto; \
} \
#websockethub_chatroom_.websockethub_chatroom_initConfig .websockethub_chatroom_advancedConfig { \
    /* Dont scare new users */ \
    display: none; \
} \
#websockethub_chatroom_ #websockethub_chatroom_config, \
#websockethub_chatroom_ .connMsg { \
    background: white; \
    text-align: center; \
    top: 0; \
    height: 100%; \
    position: absolute; \
    width: 100%; \
} \
#websockethub_chatroom_ .connMsg { \
    z-index: 1002; \
    height: 2em; \
    color: red; \
    padding-top: 1em; \
    margin-top: 1em; \
    background-color: rgba(255, 255, 255, 0.9); \
} \
#websockethub_chatroom_ #websockethub_chatroom_messages { \
    white-space: pre-wrap; \
    font-family: sans-serif; \
    word-wrap: break-word; \
} \
#websockethub_chatroom_ .websockethub_chatroom_highlight { \
    color: rgb(165, 0, 0); \
    font-weight: bold; \
} \
#websockethub_chatroom_ #websockethub_chatroom_input { \
    width: 100%; \
} \
#websockethub_chatroom_ form { \
    flex-shrink: 0; \
} \
#websockethub_chatroom_ .websockethub_chatroom_log { \
    font-style: italic; \
} \
#websockethub_chatroom_ .websockethub_chatroom_log-error { \
    color: red; \
} \
';
    }

    // HTML id of the node and prefix for classnames and child node ids
    var id = "websockethub_chatroom_";
    var LOCALSTORAGE_KEY_NAME = "websockethub.com_name";
    var widgetNode;
    var myname;
    var onquitHandlers = [];

    function log(msg) {
        if (typeof msg === "string") {
            console.log("[chatroomwidget] " + msg);
        } else {
            console.log(msg);
        }
    }

    // create a <style> with this content
    function makeCSSnode(css) {
        var style = document.createElement('style');
        style.textContent = css;
        return style;
    }

    function getDocumentLoc() {
        var canonical = $('[rel=canonical]');
        if (canonical) {
            return canonical.href
        } else {
            // Include protocol to prevent leaking between HTTP and HTTPS.
            // Exclude querystring & anchor to normalize for sessions &c
            return window.location.origin + window.location.pathname;
        }
    }

    function getWebsocketUrl(config) {
        config = config || {};
        var useTLS = config.useTLS;
        if (useTLS === undefined) {
            useTLS = document.location.protocol === "https:";
        }
        var host = config.websockethost || "hub.websockethub.com";
        var proto = useTLS ? "wss:" : "ws:";
        var room = config.room || getDocumentLoc();
        var path = config.websocketpath || "/hub";

        return proto + "//" + host + path + "?room=" + encodeURIComponent(room);
    }

    function isScrolledToBottom(el) {
        // within 3 pixels of bottom? isok. fixes a border problem on FF, too
        // (was 1px short)
        var GRACE = 3;
        return el.scrollHeight < (el.offsetHeight + el.scrollTop + GRACE);
    }

    function scrollToBottom(el) {
        el.scrollTop = el.scrollHeight;
    }

    // callAlternating(ms, f1, f2, ...)
    // like setInterval, but every iteration calls the next function in the
    // argument list f1, f2, ... until clearInterval is called on the return
    // value
    function callAlternating(interval) {
        var funcs = Array.prototype.slice.call(arguments, 1);
        if (funcs.length === 0) {
            throw "at least one function argument required";
        }
        var i = 0;
        return setInterval(function () {
            funcs[i]();
            i = (i + 1) % funcs.length;
        }, interval);
    }

    function $(id, parent) {
        return (parent || document).querySelector(id);
    }

    function $all(selector, func, parent) {
        Array.prototype.forEach.call((parent || document).querySelectorAll(selector), func);
    }

    function getCachedName() {
        return localStorage.getItem(LOCALSTORAGE_KEY_NAME);
    }

    // Don't care about storage exceptions, return no name
    function getCachedNameSafe() {
        try {
            return getCachedName();
        } catch (e) {
            log("Error while getting cached name: " + e);
            return "";
        }
    }

    function setCachedName(name) {
        localStorage.setItem(LOCALSTORAGE_KEY_NAME, name);
    }

    // Don't crash on errors from storage facilities
    function setCachedNameSafe(name) {
        if (typeof name !== "string") {
            throw "setCachedName requires a string argument";
        }
        try {
            setCachedName(name);
        } catch (e) {
            log("Error while setting cached name: " + e);
            return;
        }
    }

    function toMini(node) {
        node.classList.add(id+'mini');
    }

    function toMaxi(node) {
        node.classList.remove(id+'mini');
        var messages = $('#' + node.id + 'messages');
        if (messages === undefined) {
            log("error: couldn't find messages container for " + node.id);
            log(node);
            return;
        }
        scrollToBottom(messages);
    }

    function createConnectionMsgNode() {
        var p = document.createElement("p");
        p.classList.add("connMsg");
        return p;
    }

    function setConnectionMsg(node, msg) {
        // also guard against forgetting node arg
        if (typeof msg !== "string") {
            throw "setConnectionMsg requires string as second argument";
        }
        $('.connMsg', node).textContent = msg;
    }

    // value function to drive home the fact that it may be overwritten
    var onMinifierClicked = function (node) {
        if (node.classList.contains(id+"mini")) {
            toMaxi(node);
            $('input.'+id+'focusMeOnMaximize', node).focus();
        } else {
            toMini(node);
        }
    };

    function makeDraggable($, node) {
        var dragged = false;
        var oldhandler = onMinifierClicked;
        onMinifierClicked = function (node) {
            // don't change size when dragging
            if (dragged) {
                dragged = false;
            } else {
                // keep right aligned
                var oldWidth = $(node).outerWidth();
                // force position, or you get weird results if never dragged
                $(node).offset($(node).offset());
                oldhandler(node);
                var newOffset = $(node).offset();
                var newWidth = $(node).outerWidth();
                $(node).offset({
                    left: newOffset.left + oldWidth - newWidth
                });
            }
        };
        $(node).draggable({
            handle: '.'+id+'minifier',
            drag: function (e) {
                dragged = true;
            }
        }).css('position', ''); // stupid jquery.ui sets position:relative blegh
    }

    function makeResizable($, node) {
        // doesn't actually work yet and I'm too tired to figure out what
        // mistake I made
        return;
        var oldSize;
        var size;
        $(node).resizable({
            handles: 'w, sw, s',
            stop: function (e, ui) {
                size = ui.size;
            }
        });
        var oldHandler = onMinifierClicked;
        onMinifierClicked = function (node) {
            oldHandler(node);
            if (oldSize !== undefined) {
                var tempWidth = $(node).width();
                $(node).width(oldSize.width).height(oldSize.height);
                // right align with old maximized size
                $(node).offset({left: $(node).offset().left + oldSize.width - tempWidth});
            }
            oldSize = size;
        };
    }

    // apply jQuery.UI's draggable plugin if it is loaded
    function tryMakeDraggable(node) {
        if (typeof jQuery === "undefined") {
            return;
        }
        if (jQuery(node).draggable === undefined) {
            return;
        }
        return makeDraggable(jQuery, node);
    }

    function tryMakeResizable(node) {
        if (typeof jQuery === "undefined") {
            return;
        }
        if (jQuery(node).resizable === undefined) {
            return;
        }
        return makeResizable(jQuery, node);
    }

    function selectRandomItem(ar) {
        return ar[Math.floor(Math.random()*ar.length)];
    }

    function suggestName() {
        return selectRandomItem(adjectives) + " " + selectRandomItem(nouns);
    }

    function setName(name) {
        setCachedNameSafe(myname = name);
    }

    // http://stackoverflow.com/a/8586564
    // murmurmurfuturesorsomething
    function loadJS(src, callback) {
        var s = document.createElement('script');
        s.src = src;
        s.async = true;
        s.onreadystatechange = s.onload = function() {
            var state = s.readyState;
            if (!callback.done && (!state || /loaded|complete/.test(state))) {
                callback.done = true;
                callback();
            }
        };
        document.getElementsByTagName('head')[0].appendChild(s);
    }

    function createConfigScreen(node) {
        var config = document.createElement("div");
        config.id = id + "config";
        // initial config mode is bare bones
        node.classList.add(id+'initConfig');

        var nameForm = document.createElement("form");
        nameForm.id = id+'nameForm';
        var bannerText = document.createElement("p");
        bannerText.textContent = "What nickname do you want?";
        nameForm.appendChild(bannerText);
        var nameInput = document.createElement("input");
        nameInput.classList.add(id+'focusMeOnMaximize');
        nameInput.value = getCachedNameSafe() || suggestName();
        nameForm.appendChild(nameInput);
        nameForm.addEventListener("submit", function(event) {
            event.preventDefault();
            setName(nameInput.value);
            node.classList.remove(id+'configMode');
            node.classList.remove(id+'initConfig');
            nameInput.classList.remove(id+'focusMeOnMaximize');
            var mesgInput = document.getElementById(id+'input');
            mesgInput.classList.add(id+'focusMeOnMaximize');
            mesgInput.focus();
        });
        var nameOk = document.createElement("button");
        nameOk.textContent = "ok";
        nameForm.appendChild(nameOk);

        config.appendChild(nameForm);

        var advanced = document.createElement('div');
        advanced.classList.add(id+'advancedConfig');
        var draggableBtn = document.createElement('button');
        draggableBtn.textContent = 'make draggable';
        draggableBtn.onclick = function () {
            draggableBtn.disabled = true;
            draggableBtn.textContent = "loading scripts...";
            var s1src = "http://code.jquery.com/jquery-2.1.1.min.js";
            var s2src = "http://code.jquery.com/ui/1.10.4/jquery-ui.min.js";
            loadJS(s1src, function () {
                loadJS(s2src, function () {
                    makeDraggable(jQuery, node);
                    draggableBtn.outerHTML = "<p>Great success!</p>";
                });
            });
        };
        advanced.appendChild(draggableBtn);

        config.appendChild(advanced);

        return config;
    }

    var sendMessage = function (txt) {
        throw "sendMessage not set to custom function yet";
    };

    function logToUser(msg, lvl) {
        var messages = document.getElementById(id+'messages');
        var el = document.createElement('div');
        el.classList.add(id+'log')
        el.classList.add(id+'log-'+lvl)
        el.textContent = msg;
        messages.appendChild(el);
        scrollToBottom(messages);
        return el;
    }

    function logInfoToUser(msg) {
        return logToUser(msg, 'info');
    }

    function logErrorToUser(msg) {
        return logToUser(msg, 'error');
    }

    function about() {
        urlify(logInfoToUser(
            "websockethub.com groupchat. It's crazy, but it works."));
    }

    function quitImmediately() {
        // wat
        onquitHandlers.forEach(Function.prototype.call.call.bind(Function.prototype.call));
        onquitHandlers = undefined;
    }

    function quitDelay(seconds) {
        if (seconds === undefined) {
            seconds = 3;
        }
        var suff = (seconds == 1 ? '' : 's');
        var msg = 'Closing groupchat in ' + seconds + ' second' + suff + '.';
        var el = logInfoToUser(msg);
        var intervalID = setInterval(function () {
            seconds -= 1;
            switch (seconds) {
            case 0:
                clearInterval(intervalID);
                quitImmediately();
                return;
            case 1:
                msg = msg.replace('seconds', 'second');
                break;
            }
            msg = msg.replace(/\d+/, seconds);
            el.textContent = msg;
        }, 1000);
    }

    var commandHandlers = {
        nick: function (newname) {
            if (newname) {
                setName(newname);
            } else {
                logInfoToUser('Your nickname: ' + myname);
            }
        },
        config: function () {
            document.getElementById(id).classList.add(id+'configMode');
        },
        about: about,
        quit: quitDelay,
        exit: quitDelay,
        help: function () {
            about();
            logInfoToUser('Available commands: /nick, /config, /about, /quit');
        }
    }

    function handleCommand(cmd, arg) {
        var h = commandHandlers[cmd];
        if (h) {
            h(arg);
        } else {
            throw "unknown command: " + cmd + " (try /help)";
        }
    }

    function handleMessageInput(txt) {
        var match = /^\/(\w+)(?: (.*))?/.exec(txt);
        if (match) {
            handleCommand(match[1], match[2]);
        } else {
            sendMessage(txt);
        }
    }

    function createWidget(id) {
        var node = document.createElement("div");
        node.id = id;
        node.dataset.connState = "connecting";
        // initially show config
        node.classList.add(id+'configMode');
        node.classList.add(id+'cleanslate');

        node.appendChild(createConnectionMsgNode());
        setConnectionMsg(node, "connecting...");

        node.appendChild(createConfigScreen(node));

        var messages = document.createElement("div");
        messages.id = id + "messages";

        node.appendChild(messages);

        // chat input
        var form = document.createElement("form");
        var mesgInput = document.createElement("input");
        mesgInput.id = id + "input";
        form.addEventListener("submit", function(event) {
            event.preventDefault();
            try {
                handleMessageInput(mesgInput.value);
            } catch (e) {
                logErrorToUser(e);
                // don't empty the input on error
                return;
            }
            mesgInput.value = "";
        });
        form.appendChild(mesgInput);

        node.appendChild(form);

        var minifier = document.createElement('div');
        minifier.classList.add(id + 'minifier');
        minifier.addEventListener("click", function(event) {
            event.preventDefault();
            // propagating this click would immediately remaximize it
            event.stopPropagation();
            return onMinifierClicked(node);
        });
        node.appendChild(minifier);

        tryMakeDraggable(node);
        tryMakeResizable(node);

        return node;
    }

    // NOP if chatroom doesn't exist
    function removeChatroom() {
        if (widgetNode !== undefined && widgetNode.parentNode !== null) {
            widgetNode.parentNode.removeChild(widgetNode);
        }
        widgetNode = undefined;
    }

    function connectWebsocket(url, node, messageHandler) {
        if (typeof messageHandler !== "function") {
            throw "handler argument must be callbacks";
        }
        function onerror(e) {
            log("websocket error");
            node.dataset.connState = 'error';
        };
        function onclose(e) {
            log(e);
            var msg = (e.reason || "disconnected") + ' [' + e.code + ']';
            // Don't set to closed on error
            if (node.dataset.connState === "connected") {
                node.dataset.connState = 'closed';
            }
            if (e.wasClean) {
                logInfoToUser(msg);
            } else {
                msg = "error: " + msg;
                logErrorToUser(msg);
            }
            setConnectionMsg(node, msg);
        };
        var ws;
        try {
            ws = new WebSocket(url);
        } catch (e) {
            e.reason = e.message;
            e.wasClean = false;
            onerror(e);
            onclose(e);
            return;
        }
        ws.onopen = function() {
            node.dataset.connState = "connected";
            setConnectionMsg(node, "connected");
        };
        ws.onmessage = function(evt) {
            messageHandler(evt.data);
        };
        ws.onerror = onerror;
        ws.onclose = onclose;
        return ws;
    }

    // stolen from android, see http://stackoverflow.com/a/19696443
    var htmlrex = /((?:(http|https|rtsp):\/\/(?:(?:[a-zA-Z0-9\$\-\_\.\+\!\*\'\(\)\,\;\?\&\=]|(?:\%[a-fA-F0-9]{2})){1,64}(?:\:(?:[a-zA-Z0-9\$\-\_\.\+\!\*\'\(\)\,\;\?\&\=]|(?:\%[a-fA-F0-9]{2})){1,25})?\@)?)?((?:(?:[a-zA-Z0-9][a-zA-Z0-9\-]{0,64}\.)+(?:(?:aero|arpa|asia|a[cdefgilmnoqrstuwxz])|(?:biz|b[abdefghijmnorstvwyz])|(?:cat|com|coop|c[acdfghiklmnoruvxyz])|d[ejkmoz]|(?:edu|e[cegrstu])|f[ijkmor]|(?:gov|g[abdefghilmnpqrstuwy])|h[kmnrtu]|(?:info|int|i[delmnoqrst])|(?:jobs|j[emop])|k[eghimnrwyz]|l[abcikrstuvy]|(?:mil|mobi|museum|m[acdghklmnopqrstuvwxyz])|(?:name|net|n[acefgilopruz])|(?:org|om)|(?:pro|p[aefghklmnrstwy])|qa|r[eouw]|s[abcdeghijklmnortuvyz]|(?:tel|travel|t[cdfghjklmnoprtvwz])|u[agkmsyz]|v[aceginu]|w[fs]|y[etu]|z[amw]))|(?:(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[1-9])\.(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[1-9]|0)\.(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[1-9]|0)\.(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[0-9])))(?:\:\d{1,5})?)(\/(?:(?:[a-zA-Z0-9\;\/\?\:\@\&\=\#\~\-\.\+\!\*\'\(\)\,\_])|(?:\%[a-fA-F0-9]{2}))*)?(?:\b|$)/gi;
    function urlify(el) {
        // hoping an escaped url is still a url
        el.innerHTML = el.innerHTML.replace(htmlrex, function (url) {
            var href = url;
            // default protocol: http://
            if (!/^[a-z]+:\/\//.test(href)) {
                href = 'http://' + href;
            }
            return '<a target=_blank href="' + href + '">' + url + '</a>';
        });
    }

    function showMessage(node) {
        var el = $("#" + id + "messages");
        var mustScrollToBottom = isScrolledToBottom(el) || $("#" + id).className === id+"mini";
        el.appendChild(node);
        if (mustScrollToBottom) {
            scrollToBottom(el);
        }
    }

    var oldTitle = document.title;
    var titleInterval;
    function handleIncomingMessage(txt) {
        var i = txt.indexOf(':');
        var name = txt.slice(0, i); // don't include the :, makes === work
        var message = txt.slice(i + 1);
        var nameEl = document.createElement("span");
        var highlight = name !== myname && (new RegExp('\\b'+myname+'\\b', 'i')).test(message);
        nameEl.textContent = name + ':';
        nameEl.classList.add(id+'name');
        var messageEl = document.createElement("div");
        messageEl.appendChild(nameEl);
        var contentEl = document.createElement('span');
        contentEl.textContent = message;
        urlify(contentEl);
        messageEl.appendChild(contentEl);
        if (highlight) {
            messageEl.classList.add(id + 'highlight');
        }
        showMessage(messageEl);

        if (document.hidden) {
            if (titleInterval === undefined) {
                oldTitle = document.title;
                titleInterval = callAlternating(1000, function () {
                    document.title = "new messages - " + oldTitle;
                }, function () {
                    document.title = oldTitle;
                });
            }
        }
    }

    // build the chat widget
    function chatroomwidget_main_aux(config) {

        var node = createWidget(id);
        widgetNode = node;
        toMini(node);
        var style = makeCSSnode(makeCSStext(id));
        document.head.appendChild(style);
        document.body.appendChild(node);

        var ws = connectWebsocket(getWebsocketUrl(config), node, handleIncomingMessage);
        if (ws === undefined) {
            return;
        }
        sendMessage = function (msg) {
            ws.send(myname + ': ' + msg);
        }
        onquitHandlers.push(function() {
            ws.close();
            ws = undefined;
            widgetNode.remove();
            widgetNode = undefined;
        });


        document.addEventListener("visibilitychange", function () {
            if (!document.hidden) {
                if (titleInterval !== undefined) {
                    clearInterval(titleInterval);
                    titleInterval = undefined;
                    document.title = oldTitle;
                }
            }
        });
    }

    // config can have three keys (all strings):
    // * websockethost: hostname of the websockethub server (default
    //   "hub.websockethub.com")
    // * websocketpath: path of the hub on the server (default "/hub")
    // * roomname: name of the chatroom (default is current document location,
    //   without query string)
    function chatroomwidget_main(config) {
        try {
            chatroomwidget_main_aux(config);
        } catch (e) {
            removeChatroom();
            log('failed to build widget: ' + e);
            throw e;
        }
    }

    function chatroomwidget_direct() {
        var config;
        if (typeof websockethub_chatroom_config !== "undefined") {
            config = websockethub_chatroom_config;
        }
        chatroomwidget_main(config);
    }

    if (typeof define === "function" && define.amd) {
        define("chatroomwidget", [], chatroomwidget_main);
    } else {
        chatroomwidget_direct();
    }

})();
