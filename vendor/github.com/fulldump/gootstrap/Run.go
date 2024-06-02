package gootstrap

import (
	"syscall"
)

// Run is just a shortcut for the most common configuration
func Run(runners ...Runner) {
	RunUntilSignal(RunAll(runners...), syscall.SIGTERM, syscall.SIGINT)
}
