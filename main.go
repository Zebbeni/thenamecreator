/**
 *
 */

package main

import (
	"fmt"
	"log"
	"net/http"
)

func init() {
	http.HandleFunc("/signin", signin)
	http.Handle("/", http.FileServer(http.Dir("./public")))
}

func signin(w http.ResponseWriter, r *http.Request) {
	user := r.FormValue("idtoken")
	fmt.Println(user)
}

func main() {
	log.Printf("About to listen on 10443")
	go http.ListenAndServe(":9999", http.RedirectHandler("https://127.0.0.1:10443/", 301))
	err := http.ListenAndServeTLS(":10443", "cert.pem", "key.pem", nil)
	if err != nil {
		log.Fatal(err)
	}
}
