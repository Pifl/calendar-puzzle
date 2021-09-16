package main

import (
	"context"
	"crypto/rand"
	"fmt"
	"log"
	"math/big"
	"net/http"
	"os"

	repo "pifl/calendar/internal/repository"
	"pifl/calendar/internal/server"
	u "pifl/calendar/internal/user"

	"cloud.google.com/go/datastore"
	"github.com/go-chi/chi"
	"github.com/go-chi/chi/middleware"
	"github.com/gorilla/securecookie"
)

var (
	build              string
	hashKey            = os.Getenv("COOKIE_HASH_KEY")
	store              = securecookie.New([]byte(hashKey), nil)
	UserTokenCookieKey = "user-token"
)

func main() {

	fmt.Printf("Built: %s\n", build)

	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	client := GetClient()
	defer client.Close()
	userRepo := repo.UserRepo{Client: client}
	cal := server.New(u.UserService{UserRepo: &userRepo})

	r.Route("/api", func(r chi.Router) {
		r.Use(TokenCtx)
		r.Route("/v1", cal.Router())
	})
	r.Get("/", redirect())
	r.Get("/{key:[A-Za-z]{5,20}}", direct())

	r.Mount("/js", server.GetFileServer("./_frontend/"))
	r.Mount("/images", server.GetFileServer("./_frontend/"))

	http.ListenAndServe(":8080", r) // listen and serve on 0.0.0.0:8080 (for windows "localhost:8080")
}

func GetClient() *datastore.Client {
	ctx := context.Background()
	// Creates a client.
	client, err := datastore.NewClient(ctx, "")
	if err != nil {
		log.Fatalf("Failed to create client: %v", err)
	}
	return client
}

func GetCookieToken(w http.ResponseWriter, r *http.Request) (string, error) {
	cookie, err := r.Cookie(UserTokenCookieKey)
	var value string
	if err != nil {
		return value, err
	}
	err = store.Decode(UserTokenCookieKey, cookie.Value, &value)
	return value, err
}
func SetCookieToken(w http.ResponseWriter, token string) error {
	encoded, err := store.Encode(UserTokenCookieKey, token)
	if err != nil {
		return err
	}
	cookie := &http.Cookie{
		Name:     UserTokenCookieKey,
		Value:    encoded,
		Path:     "/",
		Secure:   true,
		HttpOnly: true,
	}
	http.SetCookie(w, cookie)
	return nil
}
func TokenCtx(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		userToken, err := GetCookieToken(w, r)
		if err != nil {
			log.Println(err)
			http.Error(w, http.StatusText(404), 404)
			return
		}
		ctx := context.WithValue(r.Context(), u.UserTokenContextKey, userToken)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func redirect() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userToken, err := GetCookieToken(w, r)
		if err != nil {
			userToken = NewUserToken()
			err := SetCookieToken(w, userToken)
			if err != nil {
				log.Println(err)
				http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
			}
		}
		http.Redirect(w, r, fmt.Sprintf("/%s", userToken), http.StatusFound)
	}
}

func direct() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userToken := chi.URLParam(r, "key")
		err := SetCookieToken(w, userToken)
		if err != nil {
			log.Println(err)
			http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		}
		server.ServeIndexFile().ServeHTTP(w, r)
	}
}

func NewUserToken() string {
	var letters = []rune("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ")
	s := make([]rune, 10)
	for i := range s {
		num, err := rand.Int(rand.Reader, big.NewInt(int64(len(letters))))
		if err != nil {
			return ""
		}
		s[i] = letters[num.Int64()]
	}
	return string(s)
}
