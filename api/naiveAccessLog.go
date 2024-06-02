package api

import (
	"context"
	"fmt"
	"time"

	"github.com/fulldump/box"
)

func NaiveAccessLog(next box.H) box.H {
	return func(ctx context.Context) {
		t0 := time.Now()
		next(ctx)
		r := box.GetRequest(ctx)
		actionName := "< undefined >"
		if action := box.GetBoxContext(ctx).Action; action != nil {
			actionName = action.Name
		}
		fmt.Println(t0.Format(time.RFC3339Nano), "HTTP", r.Method, r.RequestURI, actionName, time.Since(t0))
	}
}
