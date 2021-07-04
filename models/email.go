package models

import "gorm.io/gorm"

type Email struct {
	gorm.Model
	UserID     uint
	Email      string `gorm:"uniqueIndex" json:"email"`
	IsVerified bool   `json:"isVerified"`
	IsPrimary  bool   `json:"isPrimary"`
}
