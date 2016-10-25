
package main

import (
	"fmt"
	"net/http"
)

type comment struct {
	ID     int64  `json:"id"`
	Author string `json:"author"`
	Text   string `json:"text"`
}

func init() {
	http.HandleFunc("/signin", signin)
	http.Handle("/", http.FileServer(http.Dir("./public")))
}

func signin(w http.ResponseWriter, r *http.Request) {
	user := r.FormValue("idtoken")
	fmt.Println(user)
}
