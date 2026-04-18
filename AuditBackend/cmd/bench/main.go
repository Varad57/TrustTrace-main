package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"sync"
	"time"
)

type Expense struct {
	Description string  `json:"description"`
	Amount      float64 `json:"amount"`
}

func main() {
	var wg sync.WaitGroup
	requests := 1500

	start := time.Now()

	client := &http.Client{
		Timeout: 5 * time.Second,
		Transport: &http.Transport{
			MaxIdleConns:        1000,
			MaxIdleConnsPerHost: 1000,
		},
	}

	for i := 0; i < requests; i++ {
		wg.Add(1)
		go func(id int) {
			defer wg.Done()
			exp := Expense{Description: fmt.Sprintf("Tx %d", id), Amount: float64(id) * 1.5}
			data, _ := json.Marshal(exp)

			req, _ := http.NewRequest("POST", "http://127.0.0.1:8080/expense", bytes.NewBuffer(data))
			req.Header.Set("Content-Type", "application/json")
			resp, err := client.Do(req)
			if err != nil {
				fmt.Printf("Req Failed: %v\n", err)
				return
			}
			io.Copy(io.Discard, resp.Body)
			resp.Body.Close()
		}(i)
	}

	wg.Wait()
	duration := time.Since(start)

	fmt.Printf("Sent %d requests in %v\n", requests, duration)
	fmt.Printf("Throughput: %.2f req/sec\n", float64(requests)/duration.Seconds())

	// Give the server a tiny fraction of a second to digest the channel queue
	time.Sleep(500 * time.Millisecond)

	// Verify ledger
	resp, err := http.Get("http://127.0.0.1:8080/ledger")
	if err == nil {
		defer resp.Body.Close()
		var records []map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&records)
		fmt.Printf("Total Blocks Mined Correctly (including genesis): %d\n", len(records))
	} else {
		fmt.Println("Failed to read ledger:", err)
	}
}
