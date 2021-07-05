package product

import (
	"net/http"

	"github.com/aa-service/time-table/options"
	"github.com/brugnara/storeroom/models"
	"github.com/gin-gonic/gin"
)

func list(opts *options.Options) gin.HandlerFunc {
	return func(c *gin.Context) {
		var products []models.Product

		_ = opts.DB().Limit(10).Find(&products)

		c.JSON(
			http.StatusOK,
			gin.H{
				"status": "ok",
				"data":   products,
			},
		)
	}
}
