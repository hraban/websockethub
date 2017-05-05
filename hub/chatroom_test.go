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
	"testing"
	"time"
)

type connectionMock struct {
	messages chan<- []byte
}

func (c connectionMock) ReadMessage() (typ int, data []byte, err error) {
	return 0, nil, nil
}
func (c connectionMock) WriteMessage(typ int, data []byte) error {
	if c.messages != nil {
		c.messages <- data
	}
	return nil
}
func (c connectionMock) Close() error {
	return nil
}
func (c connectionMock) SetWriteDeadline(t time.Time) error {
	return nil
}

func newTestChatroom() *chatroom {
	s := makeServer("", time.Second)
	return newChatroom(s, "test room", 100)
}

func TestClientCount(t *testing.T) {
	oldverbose := verbose
	// client count only tracked in verbose mode
	verbose = true
	defer func() {
		verbose = oldverbose
	}()
	cr := newTestChatroom()
	defer cr.Close()
	id := cr.l_addClient(makeClient(connectionMock{}))
	if id != 1 {
		t.Errorf("Unexpected id for first client: #%d", id)
	}
	c2 := makeClient(connectionMock{})
	id = cr.l_addClient(c2)
	if id != 2 {
		t.Errorf("Unexpected id for second client: #%d", id)
	}
	cr.l_delClient(id, c2)
	if i := cr.numclients.load(); i != 2 {
		t.Error("Unexpected total number of clients:", i)
	}
	if i := cr.connectedclients.load(); i != 1 {
		t.Error("Unexpected number of connected clients:", i)
	}
}

func TestBacklog(t *testing.T) {
	// arbitrary backlog size
	const backlogLimit = 733
	cr := newTestChatroom()
	defer cr.Close()
	cr.backlog.maxsize = backlogLimit
	makeMsg := func(i int) []byte {
		return []byte(fmt.Sprintf("%d", i))
	}
	// Every message is three characters
	for i := 100; i < 1000; i++ {
		cr.handleNewMsg(makeMsg(i))
	}
	var msgSize = 3 + QUEUE_ENTRY_OVERHEAD
	// backlog is synced in a goroutine, give it some time
	time.Sleep(5 * time.Millisecond)
	// Collect the backlog
	msgchan := make(chan []byte)
	conn := connectionMock{msgchan}
	c := makeClient(conn)
	var msgs [][]byte
	var wg sync.WaitGroup
	wg.Add(1)
	go func() {
		defer wg.Done()
		for msg := range msgchan {
			msgs = append(msgs, msg)
		}
	}()
	cr.l_addClient(c)
	// allow some (arbitrarily chosen) time to send the backlog
	time.Sleep(500 * time.Millisecond)
	close(msgchan)
	wg.Wait()
	// Assumptions about the backlog at this point
	expectedNumMsgs := backlogLimit / msgSize
	expectedSize := expectedNumMsgs * msgSize
	expectedStart := 1000 - expectedNumMsgs
	// Verify the assumptions
	size := int64(cr.backlog.size.load())
	if size != expectedSize {
		t.Error("Backlog size =", size, ", expected", expectedSize)
	}
	for i, msg := range msgs {
		id := int(expectedStart) + i
		expectedMsg := string(makeMsg(id))
		if expectedMsg != string(msg) {
			t.Errorf("Backlog %d: expected %q, got %q", id, expectedMsg, msg)
		}
	}
	if len(msgs) != int(expectedNumMsgs) {
		t.Error(len(msgs), "messages in backlog, expected", expectedNumMsgs)
	}
}
