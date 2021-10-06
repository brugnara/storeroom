package main

import (
	"fmt"
	"os"

	"github.com/aa-service/time-table/options"
	"github.com/brugnara/storeroom/api"
	"github.com/brugnara/storeroom/database"
	"github.com/gin-contrib/static"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

var db *gorm.DB

const defaultPort = "8888"

func main() {
	db = database.New("database.db", database.ModeDebug)
	opts, err := options.New(db)

	if err != nil {
		panic(err)
	}

	router := gin.Default()

	router.Use(static.Serve("/", static.LocalFile("./ts/build", false)))

	// serve index.html if no route is found
	router.NoRoute(func(c *gin.Context) {
		c.File("./ts/build/index.html")
	})

	_ = api.Mount(router.Group("api"), opts)

	router.Run(getPort())
}

func getPort() string {
	port := os.Getenv("PORT")
	if port == "" {
		port = defaultPort
	}
	return fmt.Sprintf(":%s", port)
}
