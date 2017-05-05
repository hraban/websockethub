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
	"log"
	"sync"
)

type chatroom struct {
	name   string
	server *server
	// Only used in verbose mode
	numclients       safeUint32
	connectedclients safeUint32
	backlog          *messageQueue
	// unsafe for concurrent use. methods beginning with a l_ acquire one of
	// these locks (so don't call them with an acquired lock)
	l struct {
		clientsL sync.RWMutex
		clients  map[uint32]*client
	}
}

func (cr *chatroom) l_addClient(c *client) uint32 {
	id := cr.numclients.inc()
	cr.l.clientsL.Lock()
	cr.l.clients[id] = c
	cr.l.clientsL.Unlock()
	msgs := make(chan []byte)
	quit := make(chan struct{})
	go func() {
		c.WaitUntilClosed()
		close(quit)
	}()
	go func() {
		defer c.Close()
		for msg := range msgs {
			if msg == nil {
				panic("nil message from listener")
			}
			err := cr.l_sendToClient(id, c, msg)
			if err != nil {
				log.Printf("Client send error: %v", err)
				return
			}
		}
		log.Printf("Client %d out of sync", id)
	}()
	cr.backlog.Listen(msgs, quit)
	if verbose {
		total := cr.connectedclients.inc()
		log.Printf("Client joined: #%d (now: %d)", id, total)
	}
	return id
}

// NOP if already deleted
func (cr *chatroom) l_delClient(id uint32, c *client) {
	cr.l.clientsL.Lock()
	// Lock is held longer than strictly necessary. Profile before optimizing.
	defer cr.l.clientsL.Unlock()
	if _, ok := cr.l.clients[id]; !ok {
		return
	}
	c.raw.Close()
	delete(cr.l.clients, id)
	if verbose {
		total := cr.connectedclients.dec()
		log.Printf("Client left: #%d (now: %d)", id, total)
	}
}

func (cr *chatroom) l_sendToClient(id uint32, c *client, msg []byte) (err error) {
	defer func() {
		if err != nil {
			cr.l_delClient(id, c)
		}
	}()
	err = c.writeMessage(msg)
	return
}

func (cr *chatroom) handleNewMsg(msg []byte) {
	cr.backlog.Append(msg)
}

func (cr *chatroom) Close() error {
	cr.l.clientsL.RLock()
	for id, c := range cr.l.clients {
		// must be goroutine because l_delClient wants the lock
		go cr.l_delClient(id, c)
	}
	cr.l.clientsL.RUnlock()
	if verbose {
		log.Printf("Chatroom closed: %q", cr.name)
	}
	return nil
}

func newChatroom(server *server, name string, backlogsize int64) *chatroom {
	cr := &chatroom{
		server:  server,
		backlog: newQueue(backlogsize),
	}
	cr.name = name
	cr.l.clients = map[uint32]*client{}
	if verbose {
		log.Printf("Created room %q", name)
	}
	return cr
}
