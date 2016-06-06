/**
 * This file provided by Facebook is for non-commercial testing and evaluation
 * purposes only. Facebook reserves all rights not expressly granted.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * FACEBOOK BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
 * ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
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
	http.Handle("/", http.FileServer(http.Dir("./public")))
}

// func welcome(w http.ResponseWriter, r *http.Request) {
// 	w.Header().Set("Content-type", "text/html; charset=utf-8")
// 	ctx := appengine.NewContext(r)
// 	u := user.Current(ctx)
// 	if u == nil {
// 		url, _ := user.LoginURL(ctx, "/")
// 		fmt.Fprintf(w, `<a href="%s">Sign in or register</a>`, url)
// 		return
// 	}
// 	url, _ := user.LogoutURL(ctx, "/")
// 	fmt.Fprintf(w, `Welcome, %s! <br><a href="%s">sign out</a> <a href="/root">guestbook</a>`, u, url)
// }
