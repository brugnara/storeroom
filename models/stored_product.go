package models

import (
	"time"

	"gorm.io/gorm"
)

type StoredProduct struct {
	gorm.Model
	Store          Store `gorm:"constraints:OnDelete:CASCADE,OnUpdate:CASCADE;" json:"store"`
	StoreID        uint
	Product        Product `gorm:"constraints:OnDelete:CASCADE,OnUpdate:CASCADE;" json:"product"`
	ProductID      uint
	ExpirationDate time.Time `json:"expirationDate"`
	Quantity       float64   `json:"quantity"`
}
