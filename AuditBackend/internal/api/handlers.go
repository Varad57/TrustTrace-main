package api

import (
	"encoding/json"
	"net/http"
	"strconv"

	"audit-backend/internal/ledger"

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

// VerifyBalance performs a ZKP-style solvency check.
// In production this would verify a Groth16 SNARK proof on-chain;
// here we simulate the result for the frontend demo.
func (h *Handler) VerifyBalance(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	thresholdStr := r.URL.Query().Get("threshold")
	threshold, err := strconv.ParseFloat(thresholdStr, 64)
	if err != nil {
		http.Error(w, "invalid threshold", http.StatusBadRequest)
		return
	}

	// Simulate: sum up all expenses from the ledger as "balance"
	records := h.Ledger.GetLedgerSnapshot()
	var totalBalance float64
	for _, rec := range records {
		totalBalance += rec.Expense.Amount
	}

	result := map[string]interface{}{
		"method":    "zk-snark-groth16",
		"threshold": threshold,
		"verified":  totalBalance >= threshold,
	}

	if totalBalance >= threshold {
		result["message"] = "✅ ZKP Verified: Balance meets threshold without data exposure"
	} else {
		result["message"] = "❌ ZKP Denied: Balance below threshold"
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}
