package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"

	"github.com/fulldump/goconfig"
	"github.com/fulldump/gootstrap"

	"github.com/holacloud/console/api"
)

var VERSION = "dev"

var BANNER = ` THIS IS THE CONSOLE ` + VERSION

type Config struct {
	Addr    string `usage:"address to listen on"`
	Statics string `usage:"Define statics folder, if empty embedded files will be used"`

	ShowBanner bool `usage:"Print banner"`
	ShowConfig bool `usage:"Print configuration and exit"`
	Version    bool `usage:"Print version and exit"`
}

func main() {

	// Default config
	c := &Config{
		Addr:       ":8080",
		ShowBanner: true,
	}

	// Load config
	goconfig.Read(c)

	if c.Version {
		fmt.Println(VERSION)
		os.Exit(0)
	}

	if c.ShowConfig {
		e := json.NewEncoder(os.Stdout)
		e.SetIndent("", "  ")
		e.Encode(c)
		os.Exit(0)
	}

	if c.ShowBanner {
		fmt.Println(BANNER)
	}

	// Build api and server
	h := api.Build(c.Statics, VERSION)
	s := &http.Server{
		Addr:    c.Addr,
		Handler: h,
	}

	// Run!
	gootstrap.Run(
		gootstrap.RunHTTPServer(s),
	)

}
