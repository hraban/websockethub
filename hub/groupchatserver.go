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

package main

import (
	"encoding/json"
	"flag"
	"log"
	"net/http"
	"regexp"
	"runtime"
	"time"

	"github.com/deckarep/golang-set"
	"github.com/gorilla/websocket"
	"github.com/hraban/lrucache"
	"github.com/icub3d/httpauth"
)

const DEFAULT_WRITE_TIMEOUT = time.Minute

// in bytes
var BACKLOG_SIZE int64 = 5000

// when maximum is reached, room with least recent activity is purged
var NUM_ROOMS int64 = 100

var GOMAXPROCS int = 2

// https://soundcloud.com/testa-jp/mask-on-mask-re-edit-free-dl
var verbose bool
var files http.Handler

type server struct {
	*http.ServeMux
	rooms *lrucache.Cache
	// best-effort syncing, all write access is deferred to goroutines
	roomNames mapset.Set
	// Timeout for writes to a websocket client
	writeTimeout time.Duration
}

// Fuck yeah lrucache
func (cr *chatroom) OnPurge(lrucache.PurgeReason) {
	go cr.server.roomNames.Remove(cr.name)
	cr.Close()
}

func (s *server) handleWebsocket(roomname string, ws *websocket.Conn) {
	obj, err := s.rooms.Get(roomname)
	if err != nil {
		log.Fatalf("Unexpected error from lrucache.Get(%q): %v", roomname, err)
	}
	cr := obj.(*chatroom)
	c := makeClient(ws)
	c.writeTimeout = s.writeTimeout
	id := cr.l_addClient(c)
	for {
		msg, err := c.readMessage()
		if err != nil {
			if verbose {
				log.Printf("Client #%d disconnected, read error: %v", id, err)
			}
			c.Close()
			cr.l_delClient(id, c)
			return
		}
		cr.handleNewMsg(msg)
		// back off to give other clients time to step in
		time.Sleep(10 * time.Millisecond)
	}
}

func (s *server) handleHub(w http.ResponseWriter, r *http.Request) {
	// I don't care about errors here
	r.ParseForm()
	roomname := r.FormValue("room")
	if roomname == "" {
		http.Error(w, "room parameter missing", 400)
	}
	ws, err := websocket.Upgrade(w, r, nil, 1024, 1024)
	if _, ok := err.(websocket.HandshakeError); ok {
		http.Error(w, "Illegal websocket handshake", 400)
		return
	} else if err != nil {
		log.Println(err)
		http.Error(w, "internal server error", 500)
		return
	}
	go s.handleWebsocket(roomname, ws)
}

var linkre = regexp.MustCompile(`^https?://`)

func (s *server) handleRooms(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("content-type", "application/json")
	names := make([]string, 0, s.roomNames.Cardinality()) // append deals w race
	for namei := range s.roomNames.Iter() {
		name := namei.(string)
		if linkre.MatchString(name) {
			names = append(names, name)
		}
	}
	// I don't care about the error don't ask me why---I just don't care
	json.NewEncoder(w).Encode(names)
}

func passwordProtect(h http.Handler, realm, user, password string) http.Handler {
	return httpauth.Basic(realm, h, func(u, p string) bool {
		return u == user && p == password
	})
}

func makeServer(password string, writeTimeout time.Duration) *server {
	s := &server{
		ServeMux:     http.NewServeMux(),
		rooms:        lrucache.New(NUM_ROOMS),
		roomNames:    mapset.NewSet(),
		writeTimeout: DEFAULT_WRITE_TIMEOUT,
	}
	s.rooms.OnMiss(func(roomname string) (lrucache.Cacheable, error) {
		go s.roomNames.Add(roomname)
		return newChatroom(s, roomname, BACKLOG_SIZE), nil
	})
	s.HandleFunc("/hub", s.handleHub)
	s.HandleFunc("/rooms", s.handleRooms)
	return s
}

func main() {
	addr := flag.String("l", "localhost:8181", "listen address")
	passwd := flag.String("p", "", "admin password for /config")
	timeoutSecs := flag.Uint("timeout", 60, "network timeout in seconds")
	flag.BoolVar(&verbose, "v", false, "verbose")
	flag.Int64Var(&NUM_ROOMS, "rooms", NUM_ROOMS, "maximum number of open rooms")
	flag.Int64Var(&BACKLOG_SIZE, "backlog", BACKLOG_SIZE,
		"size of backlog (in bytes)")
	flag.IntVar(&GOMAXPROCS, "gomaxprocs", GOMAXPROCS, "max parallel threads")
	runtime.GOMAXPROCS(GOMAXPROCS)
	flag.Parse()
	timeout := time.Duration(*timeoutSecs) * time.Second
	h := makeServer(*passwd, timeout)
	if verbose {
		log.Print("Starting websocket groupchat server on ", *addr)
	}
	err := http.ListenAndServe(*addr, h)
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}
