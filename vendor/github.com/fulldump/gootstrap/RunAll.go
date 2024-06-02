package gootstrap

import (
	"log"
	"sync"
)

// RunAll accept a list of runners and return a new one that start all the
// runners on start and stop all of them on stop
func RunAll(runners ...Runner) Runner {
	return func() (start func() error, stop func() error) {

		wgStart := sync.WaitGroup{}
		stops := []func() error{}

		start = func() error {

			for i, run := range runners {
				wgStart.Add(1)

				start, stop := run()

				stops = append(stops, stop)

				go func(i int, start func() error) {
					// TODO: handle panics
					defer wgStart.Done()
					err := start() // should be a blocking call
					if err != nil {
						log.Println("start:", err.Error())
					}
				}(i, start)
			}

			wgStart.Wait()

			return nil
		}

		wgStop := sync.WaitGroup{}
		stop = func() error {
			for i, stop := range stops {
				wgStop.Add(1)
				go func(i int, stop func() error) {
					defer wgStop.Done()
					err := stop()
					if err != nil {
						log.Println("stop:", err.Error())
					}
				}(i, stop)
			}

			wgStop.Wait()

			return nil
		}

		return start, stop
	}
}
