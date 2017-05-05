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
	"sync/atomic"
	"unsafe"
)

// Value types safe for concurrent use. Typechecker will help remind you not to
// use these unsafely.

type safeUint32 uint32

func (i *safeUint32) add(x uint32) uint32 {
	return atomic.AddUint32((*uint32)(i), x)
}

func (i *safeUint32) sub(x uint32) uint32 {
	return atomic.AddUint32((*uint32)(i), ^uint32(x-1))
}

func (i *safeUint32) inc() uint32 {
	return i.add(1)
}

func (i *safeUint32) dec() uint32 {
	return i.sub(1)
}

func (i *safeUint32) load() uint32 {
	return atomic.LoadUint32((*uint32)(i))
}

type safeInt64 int64

func (i *safeInt64) add(x int64) int64 {
	return atomic.AddInt64((*int64)(i), x)
}

func (i *safeInt64) sub(x int64) int64 {
	return atomic.AddInt64((*int64)(i), ^int64(x-1))
}

func (i *safeInt64) inc() int64 {
	return i.add(1)
}

func (i *safeInt64) dec() int64 {
	return i.sub(1)
}

func (i *safeInt64) load() int64 {
	return atomic.LoadInt64((*int64)(i))
}

// "safe" in the access sense
type safePointer struct {
	p unsafe.Pointer
}

func (p *safePointer) load() unsafe.Pointer {
	return atomic.LoadPointer(&p.p)
}

func (p *safePointer) cas(oldp, newp unsafe.Pointer) bool {
	return atomic.CompareAndSwapPointer(&p.p, oldp, newp)
}

func (p *safePointer) store(newp unsafe.Pointer) {
	atomic.StorePointer(&p.p, newp)
}
