/**
 *
 */

package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"appengine"
	"appengine/datastore"
)

type comment struct {
	ID     int64  `json:"id"`
	Author string `json:"author"`
	Text   string `json:"text"`
}

// commentKey returns the key used for all guestbook entries.
func commentKey(c appengine.Context) *datastore.Key {
	// The string "default_guestbook" here could be varied to have multiple guestbooks.
	return datastore.NewKey(c, "comment", "comment_thread", 0, nil)
}

// Handle comments
func handleComments(w http.ResponseWriter, r *http.Request) {

	c := appengine.NewContext(r)
	switch r.Method {
	case "GET":
		// Decode the JSON data
		query := datastore.NewQuery("comment").Order("ID").Limit(10)
		// query := datastore.NewQuery("comment").Limit(10)
		comments := make([]comment, 0, 10)
		if _, err := query.GetAll(c, &comments); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		// Marshal the comments to indented json.
		commentData, err := json.MarshalIndent(comments, "", "    ")
		if err != nil {
			http.Error(w, fmt.Sprintf("Unable to marshal comments to json: %s", err), http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Cache-Control", "no-cache")
		w.Header().Set("Access-Control-Allow-Origin", "*")
		io.Copy(w, bytes.NewReader(commentData))

	case "POST":
		newcomment := comment{
			ID:     time.Now().UnixNano() / 1000000,
			Author: r.FormValue("author"),
			Text:   r.FormValue("text"),
		}
		key := datastore.NewIncompleteKey(c, "comment", commentKey(c))
		_, err := datastore.Put(c, key, &newcomment)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		return

	default:
		http.Error(w, fmt.Sprintf("Unsupported method: %s", r.Method), http.StatusMethodNotAllowed)
	}
}

func init() {
	http.HandleFunc("/api/comments", handleComments)
	http.HandleFunc("/signin", signin)
	http.Handle("/", http.FileServer(http.Dir("./public")))
}

func signin(w http.ResponseWriter, r *http.Request) {
	user := r.FormValue("idtoken")
	fmt.Println(user)
}

// func handleLogin(w http.ResponseWriter, r *http.Request) {
// 	w.Header().Set("Content-type", "text/html; charset=utf-8")
// 	ctx := appengine.NewContext(r)
// 	u := user.Current(ctx)
// 	if u == nil {
// 		url, _ := user.LoginURL(ctx, "/")
// 		fmt.Fprintf(w, `%s`, url)
// 		return
// 	}
// 	url, _ := user.LogoutURL(ctx, "/")
// 	fmt.Fprintf(w, `%s`, u, url)
// }
