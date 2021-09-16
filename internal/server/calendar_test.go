package server

import "testing"

func TestConvert(t *testing.T) {
	path := "/test/abc"
	prefix := "/test"
	t.Fatal(path[len(prefix):], prefix)
}
