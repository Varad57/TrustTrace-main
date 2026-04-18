package ledger

import (
	"crypto/sha256"
	"encoding/hex"
)

// CalculateHash computes the SHA-256 hash of the previous hash and current data
func CalculateHash(prevHash string, data string) string {
	record := prevHash + data
	h := sha256.New()
	h.Write([]byte(record))
	return hex.EncodeToString(h.Sum(nil))
}
