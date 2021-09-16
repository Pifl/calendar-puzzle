package user

import (
	"context"
	"pifl/calendar/internal/piece"
)

var (
	UserTokenContextKey = ContextKey{}
)

type ContextKey struct{}
type UserService struct {
	UserRepo UserRepository
}

type UserRepository interface {
	GetSolution(context.Context, string, string, int) (piece.Solution, error)
	GetUserSummary(context.Context, string) (map[string][]bool, error)
	StoreSolution(context.Context, string, piece.Solution) error
}

func (u UserService) GetUserToken(ctx context.Context) (string, bool) {
	userToken, ok := ctx.Value(UserTokenContextKey).(string)
	return userToken, ok
}

func (u UserService) GetUserSummary(ctx context.Context, token string) (map[string][]bool, error) {
	return u.UserRepo.GetUserSummary(ctx, token)
}

func (u UserService) GetSolution(ctx context.Context, token string, month string, day int) (piece.Solution, error) {
	return u.UserRepo.GetSolution(ctx, token, month, day)
}

func (u UserService) StoreSolution(ctx context.Context, token string, solution piece.Solution) error {
	return u.UserRepo.StoreSolution(ctx, token, solution)
}
