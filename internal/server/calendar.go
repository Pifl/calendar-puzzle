package server

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"pifl/calendar/internal/piece"
	"strconv"

	"github.com/go-chi/chi"
)

type UserService interface {
	GetUserToken(context.Context) (string, bool)
	GetUserSummary(context.Context, string) (map[string][]bool, error)
	GetSolution(context.Context, string, string, int) (piece.Solution, error)
	StoreSolution(context.Context, string, piece.Solution) error
}

type Calendar struct {
	userService UserService
}

func New(u UserService) *Calendar {
	return &Calendar{u}
}

func (c *Calendar) Router() func(r chi.Router) {
	return func(r chi.Router) {
		r.Get("/summary", c.GetSummary())
		r.Get("/{month}/{day}", c.GetSolution())
		r.Post("/{month}/{day}", c.PostSolution())
	}
}

func (c *Calendar) GetSummary() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		token, _ := c.userService.GetUserToken(r.Context())
		summary, err := c.userService.GetUserSummary(r.Context(), token)
		if err != nil {
			log.Println(err)
			http.Error(w, http.StatusText(http.StatusBadRequest), http.StatusBadRequest)
			return
		}
		jsonResp, err := json.Marshal(summary)
		if err != nil {
			log.Println(err)
			http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
			return
		}
		w.Write(jsonResp)
	}
}

func (c *Calendar) GetSolution() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		month := chi.URLParam(r, "month")
		day, err := strconv.Atoi(chi.URLParam(r, "day"))
		if err != nil {
			log.Println(err)
			http.Error(w, http.StatusText(http.StatusBadRequest), http.StatusBadRequest)
			return
		}
		token, _ := c.userService.GetUserToken(r.Context())
		solution, err := c.userService.GetSolution(r.Context(), token, month, day)
		if err != nil {
			log.Println(err)
			http.Error(w, http.StatusText(http.StatusNotFound), http.StatusNotFound)
			return
		}
		jsonResp, err := json.Marshal(solution)
		if err != nil {
			log.Println(err)
			http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
			return
		}
		w.Write(jsonResp)
	}
}

func (c *Calendar) PostSolution() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		month := chi.URLParam(r, "month")
		day, err := strconv.Atoi(chi.URLParam(r, "day"))
		if err != nil {
			log.Println(err)
			http.Error(w, http.StatusText(http.StatusBadRequest), http.StatusBadRequest)
			return
		}
		token, _ := c.userService.GetUserToken(r.Context())
		pieces := &[]piece.Piece{}
		decoder := json.NewDecoder(r.Body)
		err = decoder.Decode(pieces)
		if err != nil {
			log.Println(err)
			http.Error(w, http.StatusText(http.StatusBadRequest), http.StatusBadRequest)
			return
		}
		solution := piece.Solution{Pieces: *pieces, Day: day, Month: month}
		err = c.userService.StoreSolution(r.Context(), token, solution)
		if err != nil {
			log.Println(err)
			http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
			return
		}
	}
}
