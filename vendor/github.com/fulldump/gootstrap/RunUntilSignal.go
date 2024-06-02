package gootstrap

import (
	"log"
	"os"
	"os/signal"
)

// RunUntilSignal start a runner and wait for specified signals to stop
func RunUntilSignal(run Runner, s ...os.Signal) {
	start, stop := run()

	sigs := make(chan os.Signal, 1)
	signal.Notify(sigs, s...)
	go func() {
		<-sigs
		if err := stop(); err != nil {
			log.Println("ERROR: stop:", err.Error())
		}
	}()

	err := start()
	if err != nil {
		log.Println("ERROR: start:", err.Error())
	}
}
