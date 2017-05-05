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
	"errors"
	"sync"
	"unsafe"
)

type queueEntry struct {
	next  safePointer
	msg   []byte
	valid sync.WaitGroup
}

var QUEUE_ENTRY_OVERHEAD = int64(unsafe.Sizeof(queueEntry{}))

var staleEntry = &queueEntry{}

var errOutOfSync = errors.New("Queue was GC'ed fast than map completed")

func (q *queueEntry) Size() int64 {
	return QUEUE_ENTRY_OVERHEAD + int64(len(q.msg))
}

func newQueueEntry() *queueEntry {
	var q queueEntry
	q.valid.Add(1)
	return &q
}

type messageQueue struct {
	oldest, newest safePointer
	size           safeInt64
	maxsize        int64
}

// bring backlog storage back below limit. safe for concurrent calls.
func (q *messageQueue) trim() {
	for int64(q.size.load()) > q.maxsize {
		var oldoldest, newoldest unsafe.Pointer
		oldoldest = q.oldest.load()
		e := (*queueEntry)(oldoldest)
		newoldest = e.next.load()
		if !q.oldest.cas(oldoldest, newoldest) {
			// the q.oldest pointer was updated since the .load() call just
			// above, but since it is only modified right here in this function
			// it must mean that another trimBacklog call is running
			// concurrently. That's fine, but in that case there's no use in me
			// continuing here. Let him do the rest.
			return
		}
		// I am taking responsibility for removing this message from backlog
		q.size.sub(e.Size())
		// Prevent anyone holding on to old references from keeping the GC
		e.next.store(unsafe.Pointer(staleEntry))
	}
}

func (q *messageQueue) Append(msg []byte) {
	if msg == nil {
		panic("Appending nil message")
	}
	// container for the next message, not this one
	prepared := newQueueEntry()
	newp := unsafe.Pointer(prepared)
	var oldnewest unsafe.Pointer
	for {
		oldnewest = q.newest.load()
		if q.newest.cas(oldnewest, newp) {
			break
		}
	}
	// the container that was prepared for this message...
	e := (*queueEntry)(oldnewest)
	e.next.store(newp)
	e.msg = msg
	q.size.add(e.Size())
	// ... is now ready for consumption
	e.valid.Done()
	q.trim()
}

func listener(q *messageQueue, c chan<- []byte, quit <-chan struct{}) {
	var p safePointer = q.oldest
	for {
		e := (*queueEntry)(p.load())
		if e == staleEntry {
			close(c)
			return
		}
		e.valid.Wait()
		if e.msg == nil {
			panic("nil message in queue")
		}
		select {
		case <-quit:
			return
		case c <- e.msg:
		}
		p = e.next
	}
}

func (q *messageQueue) Listen(c chan<- []byte, quit <-chan struct{}) {
	go listener(q, c, quit)
}

func newQueue(maxsize int64) *messageQueue {
	initial := newQueueEntry()
	p := unsafe.Pointer(initial)
	return &messageQueue{
		maxsize: maxsize,
		// initial entry
		oldest: safePointer{p},
		newest: safePointer{p},
	}
}
