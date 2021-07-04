package models

import "gorm.io/gorm"

type Store struct {
	gorm.Model
	Name      string `json:"name"`
	IsStarred bool   `json:"isStarred"`
	Owner     User   `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"owner"`
	OwnerID   uint
}
