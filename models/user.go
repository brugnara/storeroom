package models

import "gorm.io/gorm"

type User struct {
	gorm.Model
	FirstName  string  `json:"firstName"`
	MiddleName string  `json:"middleName"`
	LastName   string  `json:"lastName"`
	IsActive   bool    `json:"isActive"`
	Emails     []Email `json:"emails"`
}
