package api

import (
	"net/http"
)

// SetupRoutes registers handlers and returns the multiplexer
func SetupRoutes(h *Handler) *http.ServeMux {
	mux := http.NewServeMux()
	
	mux.HandleFunc("/expense", h.CreateExpense)
	mux.HandleFunc("/ledger", h.GetLedger)
	mux.HandleFunc("/register", h.RegisterUser)
	mux.HandleFunc("/balance", h.UpdateBalance)
	mux.HandleFunc("/verify_balance", h.VerifyBalance)
	
	return mux
}
