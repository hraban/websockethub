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

// Quick and dirty stress testing for websocket service.
// Tried some existing packages but they all... disappoint.

package main

import (
	"flag"
	"fmt"
	"log"
	"net"
	"net/url"
	"os"
	"strings"
	"sync"
	"sync/atomic"

	"github.com/gorilla/websocket"
)

var conf struct {
	addr     string
	messages int
}

type conn struct {
	raw *websocket.Conn
}

func connectWebsocket(urlstr string) (*conn, error) {
	u, err := url.Parse(urlstr)
	if err != nil {
		return nil, err
	}
	if u.Scheme != "ws" && u.Scheme != "wss" {
		return nil, fmt.Errorf("Scheme must be ws:// or wss://")
	}
	host := u.Host
	if !strings.ContainsRune(host, ':') {
		host = host + ":80"
	}
	netconn, err := net.Dial("tcp", host)
	if err != nil {
		return nil, fmt.Errorf("Couldn't connect to %s: %v", host, err)
	}
	ws, _, err := websocket.NewClient(netconn, u, nil, 1024, 1024)
	if err != nil {
		return nil, err
	}
	return &conn{raw: ws}, nil
}

func (c *conn) writeMessage(msg []byte) error {
	return c.raw.WriteMessage(websocket.TextMessage, msg)
}

func executeConnection(connid int) error {
	c, err := connectWebsocket(conf.addr)
	if err != nil {
		return err
	}
	defer c.raw.Close()
	for msgid := 0; msgid < conf.messages; msgid++ {
		msg := fmt.Sprintf("Test conn #%d, msg %d/%d", connid, msgid+1,
			conf.messages)
		err := c.writeMessage([]byte(msg))
		if err != nil {
			return err
		}
	}
	return nil
}

func worker(connectionIds <-chan int) (err error) {
	for connid := range connectionIds {
		err := executeConnection(connid)
		if err != nil {
			return err
		}
	}
	return nil
}

func main() {
	concurrent := flag.Int("C", 10, "concurrent connections")
	flag.IntVar(&conf.messages, "M", 100, "messages per connection")
	connections := flag.Int("N", 10000, "total number of connections")
	flag.Parse()
	conf.addr = flag.Arg(0)
	if conf.addr == "" {
		log.Fatal("Error: supply the websocket URL as a non-flag argument")
	}
	c := make(chan int)
	var wg sync.WaitGroup
	// if anybody encounters an error set this to 1
	var ret int32
	for i := 0; i < *concurrent; i++ {
		wg.Add(1)
		go func(id int) {
			defer wg.Done()
			err := worker(c)
			if err != nil {
				// Don't kill the entire program just the worker
				log.Println("Worker", id, "died:", err)
				atomic.StoreInt32(&ret, 1)
			}
		}(i + 1)
	}
	go func() {
		for i := 0; i < *connections; i++ {
			c <- i
		}
		close(c)
	}()
	wg.Wait()
	os.Exit(int(atomic.LoadInt32(&ret)))
}
