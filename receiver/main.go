package main

import (
	"crypto/subtle"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	// "path/filepath"
)

func main() {
	// home, err := os.UserHomeDir()
	// if err != nil {
	// 	log.Fatal(err)
	// }

	token := "af79848bb6d5b2a1ee7114033ba52a4788daa41bf9103144736a47f6a3e5e047"

	output := "/tmp/main.go"
	// if err := os.MkdirAll(filepath.Dir(output), 0755); err != nil {
	// 	log.Fatal(err)
	// }

	http.HandleFunc("/code", func(w http.ResponseWriter, r *http.Request) {
		provided := r.Header.Get("X-Sync-Token")

		if subtle.ConstantTimeCompare(
			[]byte(provided),
			[]byte(token),
		) != 1 {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			log.Println("[Go Sync] Rejected request: invalid token")
			return
		}

		if r.Method != http.MethodPost {
			http.Error(w, "POST required", http.StatusMethodNotAllowed)
			return
		}

		log.Printf("[Go Sync] Request origin: %q", r.Header.Get("Origin"))

		code, err := io.ReadAll(http.MaxBytesReader(w, r.Body, 1<<20))
		if err != nil {
			http.Error(w, "Invalid or oversized code", http.StatusBadRequest)
			return
		}

		if len(code) == 0 {
			http.Error(w, "Empty code", http.StatusBadRequest)
			return
		}


		if err := os.WriteFile(output, code, 0644); err != nil {
			http.Error(w, "Could not write file", http.StatusInternalServerError)
			log.Println("[Go Sync] File write failed:", err)
			return
		}

		log.Printf("[Go Sync] Code updated: %s (%d bytes)", output, len(code))
		fmt.Fprintln(w, "OK")


		fmt.Fprintf(w, "Updated %s\n", output)
		log.Printf("Updated %s (%d bytes)", output, len(code))
	})

	log.Println("Listening on http://127.0.0.1:8765")
	log.Fatal(http.ListenAndServe("127.0.0.1:8765", nil))
}
