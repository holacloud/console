package api

import (
	"github.com/fulldump/box"

	"github.com/holacloud/console/statics"
)

type JSON = map[string]any

func Build(staticsDir, version string) *box.B {

	b := box.NewBox()

	b.WithInterceptors(
		NaiveAccessLog,
		PrettyErrorInterceptor,
	)

	// Version
	b.Handle("GET", "/version", Write(version))

	// Fake api
	fakeapi := b.Group("/fakeapi")
	fakeapi.Handle("GET", "/authapi/auth/me", FakeAuthMe)
	fakeapi.Handle("GET", "/inceptionapi/v1/databases", FakeListDatabases)
	fakeapi.Handle("GET", "/inceptionapi/v1/databases/{databaseid}/collections", FakeListCollections)
	fakeapi.Handle("GET", "/lambdasapi/api/v0/lambdas", FakeListLambdas)
	fakeapi.Handle("GET", "/projectsapi/v0/projects", FakeListProjects)

	// Static files
	b.Handle("GET", "/*", statics.ServeStatics(staticsDir)).
		WithInterceptors(IfModifiedSince())

	return b
}

func FakeAuthMe() any {
	return JSON{
		"email":   "fulanez@gmail.com",
		"id":      "user-1234",
		"nick":    "fulanez",
		"picture": "https://lh3.googleusercontent.com/a-/ACNPEu8h8e8wfcL1Hsk4JbFsROFXIBNIllOFLLPnWEDWV2s=s96-c",
		// "error":   "unauthorized", // TODO: uncomment this to simulate sign-out user
	}
}

func FakeListDatabases() any {
	return []JSON{
		{
			"id":            "00000000-0000-0000-0000-000000000001",
			"name":          "db1",
			"owners_length": 1,
		},
		{
			"id":            "00000000-0000-0000-0000-000000000002",
			"name":          "db2",
			"owners_length": 2,
		},
	}
}

func FakeListCollections() any {
	return []JSON{
		{
			"name":     "users",
			"total":    101,
			"indexes":  3,
			"defaults": JSON{"id": "uuid()"},
		},
		{
			"name":     "products",
			"total":    281,
			"indexes":  0,
			"defaults": JSON{"id": "uuid()"},
		},
		{
			"name":     "pricings",
			"total":    0,
			"indexes":  1,
			"defaults": JSON{"id": "uuid()"},
		},
	}
}

func FakeListLambdas() any {
	return []JSON{
		{
			"id":     "a663e1f1-e5cb-4fc2-b846-53f2cc7574c9",
			"method": "GET",
			"name":   "Index",
			"path":   "/",
		},
		{
			"id":     "8949ee94-ff8d-437a-815f-8c984013cf41",
			"method": "POST",
			"name":   "CreatePepino",
			"path":   "/pepinos",
		},
		{
			"id":     "094f94e1-ae1d-4ea3-a3c9-c533a9b1560c",
			"method": "GET",
			"name":   "ListPepinos",
			"path":   "/pepinos",
		},
		{
			"id":     "f5f49e1c-0a75-491f-8b2d-50ab9eee1ec2",
			"method": "GET",
			"name":   "GetPepino",
			"path":   "/pepinos/{pepino_id}",
		},
	}
}

func FakeListProjects() any {
	return []JSON{
		{
			"id":     "project-00000000-0000-0000-0000-000000000001",
			"name":   "Hello",
			"host":   "red-pepper.holacloud.app",
			"owners": []string{"user1"},
		},
		{
			"id":   "project-00000000-0000-0000-0000-000000000002",
			"name": "Hello",
		},
		{
			"id":     "project-00000000-0000-0000-0000-000000000003",
			"name":   "Hello",
			"owners": []string{"user1", "user2"},
		},
		{
			"id":     "project-00000000-0000-0000-0000-000000000004",
			"name":   "Hello",
			"host":   "big-fish.holacloud.app",
			"owners": []string{"user1"},
		},
	}
}
