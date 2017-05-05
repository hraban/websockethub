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

// proxy for chatroomwidget.js, + customizing code
(function () {

    function setDefaultName(name) {
        var LOCALSTORAGE_KEY_NAME = "websockethub.com_name";
        name = localStorage.getItem(LOCALSTORAGE_KEY_NAME) || name;
        if (name) {
            localStorage.setItem(LOCALSTORAGE_KEY_NAME, name);
        }
    }

    // document wide css is async with element existing in dom that's why better
    // than getelementbyid.
    function setCSS(css) {
        var style = document.createElement('style');
        style.textContent = css;
        document.head.appendChild(style);
    }

    // try/catch every error, including future API changes of these sites
    // causing "can't read property foo of undefined"
    try {
        if (typeof Imgur !== "undefined") {
            setDefaultName(Imgur.Environment.auth.url);
        } else if (typeof r !== "undefined") {
            setDefaultName(r.config.logged || undefined);
        }
    } catch (e) {
        // who cares
    }

    var s = document.createElement('script');
    s.src = 'https://static.websockethub.com/chatroomwidget.js';
    document.head.appendChild(s);
    // assume bookmarklet user actually wants this chatroom
    setCSS('#websockethub_chatroom_ { position: fixed; }');
})();

