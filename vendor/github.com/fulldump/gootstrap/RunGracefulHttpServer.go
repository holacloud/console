package gootstrap

import (
	"context"
	"fmt"
	"net"
	"net/http"
	"time"
)

// RunGracefulHttpServer is an example of HTTP server with graceful shutdown
func RunGracefulHttpServer(server *http.Server) Runner {
	return func() (start func() error, stop func() error) {

		start = func() error {
			addr := server.Addr
			ln, err := net.Listen("tcp", addr)
			if err != nil {
				return err
			}
			fmt.Println("Listen on address", addr)

			err = server.Serve(ln)
			if err == http.ErrServerClosed {
				return nil
			}

			return err
		}

		stop = func() error {

			server.Handler = http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				w.WriteHeader(http.StatusServiceUnavailable)
				w.Write([]byte("Shutting down, new connections will not be allowed health endpoint, just graceful period to serve /health\n"))
			})

			gracefulDelay := 5 * time.Second
			fmt.Println("Graceful shutdown...", gracefulDelay)
			time.Sleep(gracefulDelay)

			return server.Shutdown(context.Background())
		}

		return start, stop
	}
}
