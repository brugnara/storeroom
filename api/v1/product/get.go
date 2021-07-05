package product

import (
	"net/http"

	"github.com/aa-service/time-table/options"
	"github.com/brugnara/storeroom/models"
	"github.com/gin-gonic/gin"
)

func get(opts *options.Options) gin.HandlerFunc {
	return func(c *gin.Context) {
		var product models.Product

		result := opts.DB().First(&product, c.GetString("id"))

		if result == nil || result.Error != nil || result.RowsAffected == 0 {
			c.JSON(
				http.StatusNotFound,
				gin.H{
					"status": "ko",
					"error":  "not found",
				},
			)
			return
		}

		c.JSON(
			http.StatusOK,
			gin.H{
				"status": "ok",
				"data":   product,
			},
		)
	}
}
