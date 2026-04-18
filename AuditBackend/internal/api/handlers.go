package api

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
	"strconv"

	"audit-backend/internal/ledger"
	"audit-backend/internal/store"

	"github.com/google/uuid"
)

type Handler struct {
	Ledger *ledger.Ledger
}

// CreateExpense accepts a POST request, decodes it, and pushes to ledger queue
func (h *Handler) CreateExpense(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req struct {
		Description string  `json:"description"`
		Amount      float64 `json:"amount"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Bad request", http.StatusBadRequest)
		return
	}

	exp := ledger.Expense{
		ID:          uuid.New().String(),
		Description: req.Description,
		Amount:      req.Amount,
	}

	// Dispatch to channel instead of hashing synchronously
	h.Ledger.AddExpenseAsynchronously(exp)

	// Return 202 Accepted to offload I/O immediately (High Throughput optimization)
	w.WriteHeader(http.StatusAccepted)
	json.NewEncoder(w).Encode(map[string]string{"status": "queued", "id": exp.ID})
}

// GetLedger returns the entire history via GET
func (h *Handler) GetLedger(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	records := h.Ledger.GetLedgerSnapshot()
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(records)
}

func (h *Handler) RegisterUser(w http.ResponseWriter, r *http.Request) {
	var req struct {
		UserID        string `json:"user_id"`
		ContextBase64 string `json:"context"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	store.DB.Lock()
	if store.DB.Users[req.UserID] == nil {
		store.DB.Users[req.UserID] = &store.UserData{}
	}
	store.DB.Users[req.UserID].ContextBase64 = req.ContextBase64
	store.DB.Unlock()

	w.WriteHeader(http.StatusOK)
}

func (h *Handler) UpdateBalance(w http.ResponseWriter, r *http.Request) {
	var req struct {
		UserID        string `json:"user_id"`
		BalanceBase64 string `json:"balance"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	store.DB.Lock()
	if store.DB.Users[req.UserID] == nil {
		store.DB.Users[req.UserID] = &store.UserData{}
	}
	store.DB.Users[req.UserID].BalanceVectorBase64 = req.BalanceBase64
	store.DB.Unlock()

	w.WriteHeader(http.StatusOK)
}

func (h *Handler) VerifyBalance(w http.ResponseWriter, r *http.Request) {
	userID := r.URL.Query().Get("user_id")
	threshold, err := strconv.ParseFloat(r.URL.Query().Get("threshold"), 64)
	if err != nil || userID == "" {
		http.Error(w, "invalid params", http.StatusBadRequest)
		return
	}

	store.DB.RLock()
	userData := store.DB.Users[userID]
	store.DB.RUnlock()

	if userData == nil || userData.ContextBase64 == "" || userData.BalanceVectorBase64 == "" {
		http.Error(w, "user data incomplete", http.StatusNotFound)
		return
	}

	proxyBody, _ := json.Marshal(map[string]interface{}{
		"context":   userData.ContextBase64,
		"balance":   userData.BalanceVectorBase64,
		"threshold": threshold,
	})

	resp, err := http.Post("http://127.0.0.1:5000/compute_diff", "application/json", bytes.NewBuffer(proxyBody))
	if err != nil {
		http.Error(w, "microservice unavailable", http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(resp.StatusCode)
	io.Copy(w, resp.Body)
}
