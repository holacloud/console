package api

import (
	"net/http"
)

func Write(value string) any {
	return func(w http.ResponseWriter) {
		w.Write([]byte(value))
	}
}
