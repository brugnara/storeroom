package product

import (
	"github.com/aa-service/time-table/options"
	"github.com/gin-gonic/gin"
)

func Mount(
	router *gin.RouterGroup,
	opts *options.Options,
	authenticator gin.HandlerFunc,
) {
	router.POST("/", authenticator, post(opts))
	router.GET("/", list(opts))
	router.GET("/:id", get(opts))
	// router.DELETE("/:id", auth, delete(opts))
}
