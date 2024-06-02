# Gootstrap: Professional Grade Service Bootstrapping for Go

Welcome to Gootstrap! This elegant and powerful tool, inspired in an Operating System's process lifecycle, helps you bootstrap your application, simplifying the process. With Gootstrap, you can manage multiple servers, gracefully handle shutdowns, establish watchdog mechanisms, and so much more, all with ease and confidence.


<!-- TOC -->
* [Gootstrap: Professional Grade Service Bootstrapping for Go](#gootstrap-professional-grade-service-bootstrapping-for-go)
  * [Unleash the Power of Gootstrap](#unleash-the-power-of-gootstrap)
  * [Build Powerful Background Processes](#build-powerful-background-processes)
  * [Manage HTTP Servers with Ease](#manage-http-servers-with-ease)
  * [Combine Multiple Processes Seamlessly](#combine-multiple-processes-seamlessly)
  * [Easily Adapt Existing Processes](#easily-adapt-existing-processes)
  * [Built-In Signal Handling](#built-in-signal-handling)
  * [Compatibility and Requirements](#compatibility-and-requirements)
  * [Getting Started](#getting-started)
  * [Contribute](#contribute)
  * [Support](#support)
  * [Ready to Bootstrap Your Go Services Like a Pro?](#ready-to-bootstrap-your-go-services-like-a-pro)
<!-- TOC -->

## Unleash the Power of Gootstrap

At the heart of Gootstrap is the robust yet simple concept of start and stop functions. Just provide these two functions, and Gootstrap will breathe life into your services:


```go
func BootstrapMyApp() (start, stop func() error) {
	
	start = func() error {
		// ...
		return nil
    }
	
	stop = func() error {
		// ...
		return nil
    }
	
	return
}
```

Note: Both start and stop functions should be blocking to maintain control flow.


## Build Powerful Background Processes

You can easily create background processes that perform tasks at set intervals. Here's an example where the process does something every 3 seconds:

```go
func myBackgroundProcess() (start func() error, stop func() error) {

	shouldStop := false

	start = func() error {
		i := 0
		for !shouldStop {
			i++
			time.Sleep(3 * time.Second)
			fmt.Println("Processed batch", i)
		}
		return nil
	}

	stop = func() error {
		shouldStop = true
		return nil
	}

	return
}
```

To run this, simply use `gootstrap.Run(myBackgroundProcess)` in your `main.go`.


## Manage HTTP Servers with Ease

With Gootstrap, setting up and managing an HTTP server is a breeze. Here's a simple example:


```go
package main

import (
	"http"

	"github.com/fulldump/gootstrap"
)

func main() {

	s := &http.Server{
		Addr: ":8080",
		Handler: http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Insert your API logic here
		}),
	}

	gootstrap.Run(RunHTTPServer(s))

}
```

## Combine Multiple Processes Seamlessly

Gootstrap shines when you need to run multiple processes, ensuring all of them are managed effectively:


```go
package main

import (
	"http"

	"github.com/fulldump/gootstrap"
)

func main() {
	gootstrap.Run(RunHTTPServer(s), myBackgroundProcess)
}
```

## Easily Adapt Existing Processes

Adapting an existing process to work with Gootstrap is easy. Here's an example:


```go
package main

import (
	"fmt"

	"github.com/fulldump/gootstrap"
)

type MyConfig struct {
	HTTPAddr           string
	DatabaseConnection string
	// Other configuration elements...
}

func MyApplication(config *MyConfig) gootstrap.Runner {
	return func() (start, stop func() error) {

		start = func() error {
			fmt.Println("use your", config, "here")
			// Insert service start-up operations here

			return nil
		}

		stop = func() error {
			// Insert graceful service shutdown operations here:
			// - wait for outstanding requests
			// - close open files
			// - flush buffers

			return nil
		}

		return
	}
}

func main() {
	
	config := &MyConfig{} // parse your config (fulldump/goconfig highgly recommended)
	
	gootstrap.Run(MyApplication(config)) // just run
	
}
```

## Built-In Signal Handling

Gootstrap's built-in signal handling ensures that your service will respond appropriately to OS signals like `SIGINT` and `SIGTERM`. The `Run` function will block until a signal is received, at which point it will call the stop function provided by your service, allowing for a graceful shutdown process.


## Compatibility and Requirements

Gootstrap is compatible with any Go services or applications. To use Gootstrap, all you need is a Go environment configured with Go 1.15 or later.

## Getting Started

Getting started with Gootstrap is as easy as running a `go get` command:

```bash
go get github.com/fulldump/gootstrap
```

After that, you just need to include Gootstrap in your application and start enjoying its features.

## Contribute
We love contributions from the community! If you'd like to contribute, feel free to submit a pull request on our [GitHub page](https://github.com/fulldump/gootstrap).


## Support
If you encounter any issues or have questions about Gootstrap, don't hesitate to open an issue on our GitHub page. We are dedicated to improving Gootstrap and supporting our users.

## Ready to Bootstrap Your Go Services Like a Pro?

Don't wait any longer. Start using Gootstrap today and elevate your Go service management to the next level!
