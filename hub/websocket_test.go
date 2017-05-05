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
	"fmt"
	"net"
	"net/http/httptest"
	"net/url"
	"runtime"
	"sync"
	"testing"
	"time"

	"github.com/gorilla/websocket"
)

func init() {
	runtime.GOMAXPROCS(GOMAXPROCS)
}

// parse URL, panic on error
func urlMustParse(s string) *url.URL {
	url, err := url.Parse(s)
	if err != nil {
		panic(err)
	}
	return url
}

var connectTimeout = time.Second

func connectToTestServer(server *httptest.Server) (net.Conn, error) {
	addr := server.Listener.Addr()
	conn, err := net.DialTimeout(addr.Network(), addr.String(), connectTimeout)
	if err != nil {
		return nil, fmt.Errorf("Couldn't connect to test server: %v", err)
	}
	return conn, nil
}

func connectWebsocket(server *httptest.Server, path string) (*websocket.Conn, error) {
	conn, err := connectToTestServer(server)
	if err != nil {
		return nil, err
	}
	url := urlMustParse(server.URL + path)
	ws, _, err := websocket.NewClient(conn, url, nil, 1024, 1024)
	if err != nil {
		return nil, err
	}
	return ws, nil
}

func getTextMessage(ws *websocket.Conn) (string, error) {
	typ, msg, err := ws.ReadMessage()
	if err != nil {
		return "", fmt.Errorf("Error reading websocket message: %v", err)
	}
	if typ != websocket.TextMessage {
		return "", fmt.Errorf("Unexpected websocket message type: %v", typ)
	}
	return string(msg), nil
}

func TestWebsocket(t *testing.T) {
	s := makeServer("", time.Second)
	ts := httptest.NewServer(s)
	defer ts.Close()
	ws, err := connectWebsocket(ts, "/hub?room=testroom")
	if err != nil {
		t.Fatal("couldn't connect as websocket client:", err)
	}
	defer ws.Close()
	err = ws.WriteMessage(websocket.TextMessage, []byte("testmsg"))
	if err != nil {
		t.Error("sending websocket message:", err)
	}
	msg, err := getTextMessage(ws)
	if err != nil {
		t.Error("receiving websocket message:", err)
	}
	if msg != "testmsg" {
		t.Errorf("received unexpected message: %q", msg)
	}
}

type syncWorkers struct {
	// worker -> master (by .Done)
	open, done sync.WaitGroup
	// master -> worker (by closing)
	startSending, closeConn chan struct{}
}

func countAllIncomingMessages(ws *websocket.Conn, timeout time.Duration) int {
	var count int
	for {
		if timeout != time.Duration(0) {
			ws.SetReadDeadline(time.Now().Add(timeout))
		}
		_, err := getTextMessage(ws)
		if err != nil {
			break
		}
		count += 1
	}
	return count
}

var CONCURRENT_CLIENTS = 100

const NUM_MESSAGES = 500

func worker(id int, t *testing.T, s *syncWorkers, ts *httptest.Server) error {
	// *ahhh dynamic vars...*
	oldTimeout := connectTimeout
	defer func() {
		connectTimeout = oldTimeout
	}()
	connectTimeout = time.Minute
	ws, err := connectWebsocket(ts, "/hub?room=testroom")
	if err != nil {
		return fmt.Errorf("connecting websocket client: %v", err)
	}
	// discard results
	go countAllIncomingMessages(ws, time.Duration(0))
	s.open.Done()
	<-s.startSending
	for i := 0; i < NUM_MESSAGES; i++ {
		msg := fmt.Sprintf("Worker #%d, message %d/%d", id, i+1, NUM_MESSAGES)
		err = ws.WriteMessage(websocket.TextMessage, []byte(msg))
		if err != nil {
			return fmt.Errorf("sending websocket message %q: %v", msg, err)
		}
	}
	s.done.Done()
	<-s.closeConn
	ws.Close()
	return nil
}

func TestWebsocketConcurrentClients(t *testing.T) {
	if testing.Short() {
		CONCURRENT_CLIENTS = 10
	} else {
		BACKLOG_SIZE = 1 << 22
	}
	s := makeServer("", time.Second)
	ts := httptest.NewServer(s)
	var wg sync.WaitGroup
	var sy = syncWorkers{
		startSending: make(chan struct{}),
		closeConn:    make(chan struct{}),
	}
	sy.open.Add(CONCURRENT_CLIENTS)
	sy.done.Add(CONCURRENT_CLIENTS)
	allconnected := make(chan struct{})
	go func() {
		sy.open.Wait()
		close(allconnected)
	}()
	cancel := make(chan struct{})
	if testing.Verbose() {
		fmt.Printf("Waiting for %d workers to connect...\n", CONCURRENT_CLIENTS)
	}
	for i := 0; i < CONCURRENT_CLIENTS; i++ {
		wg.Add(1)
		go func(id int) {
			defer wg.Done()
			err := worker(id, t, &sy, ts)
			if err != nil {
				t.Errorf("Worker #%d: %v", id, err)
				select {
				// notify the main loop about this error
				case cancel <- struct{}{}:
				// but only if it's still listening for these errors
				case <-allconnected:
				}
			}
		}(i + 1)
		// give the operating system some time to deal with the request
		time.Sleep(10 * time.Millisecond)
	}
	select {
	case <-allconnected:
		// good
	case <-cancel:
		return
	}
	// background counter client
	countchan := make(chan int)
	go func() {
		counterconn, err := connectWebsocket(ts, "/hub?room=testroom")
		if err != nil {
			t.Fatal("couldn't connect as websocket client:", err)
		}
		defer counterconn.Close()
		countchan <- countAllIncomingMessages(counterconn, 5*time.Second)
	}()
	// @golang-dev: t.Log should flush immediately. waiting for the test to
	// complete makes it useless for long running or blocking tests.
	if testing.Verbose() {
		fmt.Printf("%d workers connected\n", CONCURRENT_CLIENTS)
	}
	// when everyone is opened give the server some time to process
	time.Sleep(100 * time.Millisecond)
	close(sy.startSending)
	sy.done.Wait()
	if testing.Verbose() {
		fmt.Printf("%d messages sent, per worker\n", NUM_MESSAGES)
	}
	count := <-countchan
	if count != NUM_MESSAGES*CONCURRENT_CLIENTS {
		t.Errorf("Got %d incoming messages, expected %d", count,
			NUM_MESSAGES*CONCURRENT_CLIENTS)
	}
	close(sy.closeConn)
	ts.Close()
	wg.Wait()
}

func bmwsfb(b *testing.B, numClients int) {
	s := makeServer("", time.Second)
	ts := httptest.NewServer(s)
	defer ts.Close()
	// fill up the backlog (_SIZE is in bytes & a msg is at least 1 byte)
	ws, err := connectWebsocket(ts, "/hub?room=testroom")
	if err != nil {
		panic("couldn't connect as websocket client:" + err.Error())
	}
	for i := BACKLOG_SIZE; i > 0; i-- {
		msg := []byte(fmt.Sprint(i))
		err := ws.WriteMessage(websocket.TextMessage, msg)
		if err != nil {
			panic("sending websocket message: " + err.Error())
		}
	}
	// Let the server process all the messages
	time.Sleep(100 * time.Millisecond)
	// TODO: Feels dirty: why does .WriteMessage return before the server
	// acknowledged the message?
	err = ws.Close()
	if err != nil {
		panic("closing client: " + err.Error())
	}
	clientRunner := func() {
		ws, err := connectWebsocket(ts, "/hub?room=testroom")
		if err != nil {
			panic("couldn't connect as websocket client: " + err.Error())
		}
		defer ws.Close()
		// read the entire backlog
		var msg string
		for msg != fmt.Sprint(BACKLOG_SIZE) {
			msg, err = getTextMessage(ws)
			if err != nil {
				panic("reading websocket message: " + err.Error())
			}
		}
	}
	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		var wg sync.WaitGroup
		for i := 0; i < numClients; i++ {
			wg.Add(1)
			go func() {
				defer wg.Done()
				clientRunner()
			}()
		}
		wg.Wait()
	}
}

func BenchmarkWebsocketFullBacklog1Client(b *testing.B) {
	bmwsfb(b, 1)
}

func BenchmarkWebsocketFullBacklog2ClientsConcurrent(b *testing.B) {
	bmwsfb(b, 2)
}

func BenchmarkWebsocketFullBacklog10ClientsConcurrent(b *testing.B) {
	bmwsfb(b, 10)
}

func BenchmarkWebsocketFullBacklog100ClientsConcurrent(b *testing.B) {
	bmwsfb(b, 100)
}

func BenchmarkWebsocketFullBacklog1000ClientsConcurrent(b *testing.B) {
	bmwsfb(b, 1000)
}
