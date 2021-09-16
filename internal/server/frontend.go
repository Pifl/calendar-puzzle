package server

import (
	"fmt"
	"net/http"
	"strings"
)

func GetFileServer(directory string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if len(r.URL.Path) > 1 && !strings.ContainsRune(r.URL.Path, '.') {
			r.URL.Path = fmt.Sprintf("%s.html", r.URL.Path)
		}
		http.FileServer(http.Dir(directory)).ServeHTTP(w, r)
	}
}

func ServeIndexFile() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "./_frontend/index.html")
	}
}
