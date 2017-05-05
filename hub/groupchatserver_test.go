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
	"testing"
)

func BenchmarkHandleMessageFullBacklog(b *testing.B) {
	cr := newChatroom(nil, "test room", 100)
	defer cr.Close()
	// fill up the backlog
	for i := 0; i < 100; i++ {
		cr.handleNewMsg([]byte("test message"))
	}
	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		cr.handleNewMsg([]byte("test message"))
	}
}

func BenchmarkHandleMessageNoBacklog(b *testing.B) {
	cr := newChatroom(nil, "test room", 0)
	defer cr.Close()
	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		cr.handleNewMsg([]byte("test message"))
	}
}
