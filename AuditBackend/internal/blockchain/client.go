package blockchain

import (
	"log"
	"time"
)

type HashProvider interface {
	LatestHash() string
}

// StartSimulatedClient starts a background worker that periodically pulls the latest hash
func StartSimulatedClient(provider HashProvider, interval time.Duration) {
	go func() {
		ticker := time.NewTicker(interval)
		for range ticker.C {
			hash := provider.LatestHash()
			log.Printf("[BLOCKCHAIN] Successfully pushed latest hash to simulated smart contract: %s", hash)
		}
	}()
}
