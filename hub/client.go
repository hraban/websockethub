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
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

// connection with a client, unsafe for concurrent use
type clientConnection interface {
	ReadMessage() (typ int, data []byte, err error)
	WriteMessage(typ int, data []byte) error
	Close() error
	SetWriteDeadline(t time.Time) error
}

type client struct {
	raw          clientConnection
	writeTimeout time.Duration
	// only one read op at a time, same for write ops, but concurrent read &
	// write is fine.
	// @golang-dev: go needs typ annotations for concurrency safety
	readop, writeop sync.Mutex
	closed          chan struct{}
}

func (c *client) Close() error {
	select {
	case <-c.closed:
		return fmt.Errorf("client already closed")
	default:
	}
	close(c.closed)
	return nil
}

func (c *client) WaitUntilClosed() {
	<-c.closed
	return
}

func (c *client) writeMessage(msg []byte) error {
	c.writeop.Lock()
	defer c.writeop.Unlock()
	if c.writeTimeout != time.Duration(0) {
		err := c.raw.SetWriteDeadline(time.Now().Add(c.writeTimeout))
		if err != nil {
			return err
		}
	}
	return c.raw.WriteMessage(websocket.TextMessage, msg)
}

func (c *client) readMessage() ([]byte, error) {
	c.readop.Lock()
	defer c.readop.Unlock()
	typ, data, err := c.raw.ReadMessage()
	if err == nil && typ != websocket.TextMessage {
		return nil, fmt.Errorf("incoming message unexpected type: %v", typ)
	}
	return data, err
}

func makeClient(conn clientConnection) *client {
	return &client{
		raw:    conn,
		closed: make(chan struct{}),
	}
}
