package api

import (
	"github.com/aa-service/time-table/options"
	v1 "github.com/brugnara/storeroom/api/v1"
	"github.com/gin-gonic/gin"
)

func Mount(router *gin.RouterGroup,
	opts *options.Options) (groups map[string]*gin.RouterGroup) {
	if router == nil || opts == nil {
		panic("Invalid input")
	}

	groups = map[string]*gin.RouterGroup{
		"v1": router.Group("v1"),
	}

	v1.Mount(groups["v1"], opts)

	return
}
