package main

import (
	"fmt"
	"log"
	"net/http"

	"audit-backend/internal/api"
	"audit-backend/internal/ledger"
)

func main() {
	// Create ledger with a buffered channel of 2048 for high-throughput async processing
	l := ledger.NewLedger(2048)

	handler := &api.Handler{Ledger: l}
	mux := api.SetupRoutes(handler)

	addr := ":8080"
	fmt.Printf("🚀 AuditBackend server starting on %s\n", addr)
	log.Fatal(http.ListenAndServe(addr, mux))
}
