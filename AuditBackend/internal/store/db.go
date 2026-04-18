package store

import "sync"

// UserData holds the user's public keys and their latest encrypted balance
type UserData struct {
	ContextBase64       string
	BalanceVectorBase64 string
}

var DB = struct {
	sync.RWMutex
	Users map[string]*UserData
}{Users: make(map[string]*UserData)}
