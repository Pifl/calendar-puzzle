package repository

import (
	"context"
	"fmt"
	"pifl/calendar/internal/piece"
	"strconv"
	"strings"

	"cloud.google.com/go/datastore"
	"google.golang.org/api/iterator"
)

type UserRepo struct {
	Client *datastore.Client
}

func (u *UserRepo) GetUserSummary(ctx context.Context, token string) (map[string][]bool, error) {
	userKey := datastore.NameKey("User", token, nil)
	months := []string{"Jan", "Feb", "Mar", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Des"}
	resp := make(map[string][]bool, 12)
	for i := 0; i < len(months); i++ {
		resp[months[i]] = make([]bool, 31)
	}
	query := datastore.NewQuery("Solution").Ancestor(userKey).KeysOnly()
	it := u.Client.Run(ctx, query)
	for {
		key, err := it.Next("")
		if err == iterator.Done {
			break
		}
		if err != nil {
			return resp, err
		}
		sections := strings.Split(key.Name, "_")
		day, err := strconv.Atoi(sections[0])
		if err != nil {
			return resp, err
		}
		month := sections[1]
		resp[month][day-1] = true
	}
	return resp, nil
}

func (u *UserRepo) GetSolution(ctx context.Context, token, month string, day int) (piece.Solution, error) {
	userKey := datastore.NameKey("User", token, nil)
	solutionName := fmt.Sprintf("%d_%s", day, month)
	solutionKey := datastore.NameKey("Solution", solutionName, userKey)
	var fetched piece.Solution
	err := u.Client.Get(ctx, solutionKey, &fetched)
	return fetched, err
}

func (u *UserRepo) StoreSolution(ctx context.Context, token string, solution piece.Solution) error {
	userKey := datastore.NameKey("User", token, nil)
	solutionName := fmt.Sprintf("%d_%s", solution.Day, solution.Month)
	solutionKey := datastore.NameKey("Solution", solutionName, userKey)
	_, err := u.Client.Put(ctx, solutionKey, &solution)
	return err
}
