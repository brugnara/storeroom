package models

import "gorm.io/gorm"

type Share struct {
	gorm.Model
	Store   Store `gorm:"constraints:OnDelete:CASCADE,OnUpdate:CASCADE;" json:"store"`
	StoreID uint
	User    User `gorm:"constraints:OnDelete:CASCADE,OnUpdate:CASCADE;" json:"user"`
	UserID  uint
}
