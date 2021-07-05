package v1

import (
	"github.com/aa-service/time-table/options"
	"github.com/brugnara/storeroom/api/v1/product"
	"github.com/brugnara/storeroom/api/v1/user"
	"github.com/gin-gonic/gin"
)

func Mount(router *gin.RouterGroup,
	opts *options.Options) (groups map[string]*gin.RouterGroup) {
	groups = map[string]*gin.RouterGroup{
		"product": router.Group("product"),
		"user":    router.Group("user"),
	}

	product.Mount(groups["product"], opts, authenticator(opts))
	user.Mount(groups["user"], opts, authenticator(opts))

	return
}

func authenticator(opts *options.Options) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Next()
	}
}
