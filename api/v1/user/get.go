package user

import (
	"net/http"

	"github.com/aa-service/time-table/options"
	"github.com/gin-gonic/gin"
)

func get(opts *options.Options) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.JSON(
			http.StatusOK,
			gin.H{
				"status": "ok",
				"data":   "no-data",
			},
		)
	}
}
