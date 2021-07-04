package v1

import (
	"github.com/aa-service/time-table/options"
	"github.com/brugnara/storeroom/api/v1/user"
	"github.com/gin-gonic/gin"
)

func Mount(router *gin.RouterGroup,
	opts *options.Options, authenticator gin.HandlerFunc) (groups map[string]*gin.RouterGroup) {
	groups = map[string]*gin.RouterGroup{
		"user": router.Group("user"),
	}
	user.Mount(groups["user"], opts, authenticator)
	return
}
