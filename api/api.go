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
	fakeapi.Handle("GET", "/projectsapi/v0/projects/{projectid}", FakeProject)
	fakeapi.Handle("GET", "/filesapi/v1/buckets", FakePListBuckets)

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

func FakeProject() any {

	return JSON{
		"id":   "project-cac3dcdb-c0fd-4a5b-bc53-a3a761bc269c",
		"name": "Mi Mundo 🌍😃",
		"owners": []string{
			"user-0b654fad-8b74-4431-81d7-a016aa47e29e",
		},
		"routers": []JSON{
			{
				"type": "proxy",
				"hosts": []JSON{
					{
						"name":               "local-alpaca.holacloud.app",
						"verified":           true,
						"creation_timestamp": 1.735794204411397e+18,
					},
					{
						"name":               "mimundo.holacloud.app",
						"verified":           true,
						"creation_timestamp": 1.735794204411397e+18,
					},
				},
				"HeadersIn":  nil,
				"HeadersOut": nil,
				"config": JSON{
					"destination": "http://127.0.0.1:3003",
				},
			},
		},
		"create_timestamp": 1.7357942044106714e+18,
		"update_timestamp": 1.7357942044206715e+18,
		"auth": JSON{
			"enabled": true,
		},
	}
}

func FakePListBuckets() any {
	return []JSON{
		{
			"created_h":         "2025-05-28T01:32:53.438611Z",
			"created_timestamp": 1748395973438611000,
			"description":       "",
			"id":                "bucket-30b0a95b-1564-4526-90f6-5ed5f344264a",
			"name":              "Project-Files",
			"owners": []string{
				"user-0b654fad-8b74-4431-81d7-a016aa47e29e",
			},
		},
		{
			"created_h":         "2025-05-28T16:03:14.9537244Z",
			"created_timestamp": 1748448194953724400,
			"description":       "",
			"id":                "bucket-c1d91d63-c2e9-44e2-84e1-6904ff0be73a",
			"name":              "prueba2",
			"owners": []string{
				"user-0b654fad-8b74-4431-81d7-a016aa47e29e",
			},
		},
		{
			"created_h":         "2025-09-23T01:29:46.1007334Z",
			"created_timestamp": 1758590986100733400,
			"description":       "",
			"id":                "bucket-71ce470a-b130-4c9a-87a6-8d7717515297",
			"name":              "prueba-nuevo-server",
			"owners": []string{
				"user-0b654fad-8b74-4431-81d7-a016aa47e29e",
			},
		},
		{
			"created_h":         "2025-10-09T22:34:17.9015877Z",
			"created_timestamp": 1760049257901587700,
			"description":       "",
			"id":                "bucket-f34b9c7e-fe68-444b-bc15-737f0e281689",
			"name":              "ProjectoGo",
			"owners": []string{
				"user-0b654fad-8b74-4431-81d7-a016aa47e29e",
			},
		},
		{
			"created_h":         "2025-10-23T15:54:49.8020337Z",
			"created_timestamp": 1761234889802033700,
			"description":       "",
			"id":                "bucket-b1e76bb9-b821-4702-94f4-01d02cd7a068",
			"name":              "holacloud",
			"owners": []string{
				"user-082f6bc0-066a-415b-a776-34281210c7ea",
				"user-0b654fad-8b74-4431-81d7-a016aa47e29e",
				"user-5fea5107-948e-40a2-9860-8baac491449d",
			},
		},
	}
}
