package ledger

import (
	"encoding/json"
	"sync"
)

// Expense represents a single financial transaction
type Expense struct {
	ID          string  `json:"id"`
	Description string  `json:"description"`
	Amount      float64 `json:"amount"`
}

// Record holds the expense and its chained hash
type Record struct {
	Expense      Expense `json:"expense"`
	PreviousHash string  `json:"previousHash"`
	CurrentHash  string  `json:"currentHash"`
}

type Ledger struct {
	records []Record
	mu      sync.RWMutex
	queue   chan Expense
}

func NewLedger(bufferSize int) *Ledger {
	l := &Ledger{
		records: make([]Record, 0),
		queue:   make(chan Expense, bufferSize),
	}
	
	// Genesis Block creation
	genesis := Record{
		Expense: Expense{ID: "genesis", Description: "Genesis Block", Amount: 0},
		PreviousHash: "0000000000000000000000000000000000000000000000000000000000000000",
		CurrentHash: "genesis_hash_init",
	}
	l.records = append(l.records, genesis)

	// Start the background hashing worker (ensures sequential hashing capability off main thread)
	go l.processQueue()

	return l
}

// AddExpenseAsynchronously pushes the expense to the channel for processing
func (l *Ledger) AddExpenseAsynchronously(e Expense) {
	l.queue <- e
}

// processQueue processes expenses sequentially to guarantee perfect hash chaining
func (l *Ledger) processQueue() {
	for exp := range l.queue {
		// Serialize expense for hashing
		data, _ := json.Marshal(exp)
		
		l.mu.Lock()
		prevHash := l.records[len(l.records)-1].CurrentHash
		
		newRecord := Record{
			Expense:      exp,
			PreviousHash: prevHash,
			CurrentHash:  CalculateHash(prevHash, string(data)),
		}
		
		l.records = append(l.records, newRecord)
		l.mu.Unlock()
	}
}

// GetLedgerSnapshot returns a copy of the current ledger state
func (l *Ledger) GetLedgerSnapshot() []Record {
	l.mu.RLock()
	defer l.mu.RUnlock()
	
	// Return a deep copy to avoid read-write race conditions when json marshaling inside HTTP handlers
	snapshot := make([]Record, len(l.records))
	copy(snapshot, l.records)
	return snapshot
}

// LatestHash safely gets the most recent block hash for external systems
func (l *Ledger) LatestHash() string {
	l.mu.RLock()
	defer l.mu.RUnlock()
	return l.records[len(l.records)-1].CurrentHash
}
