package gootstrap

// Runner just the runner interface
type Runner func() (start, stop func() error)
