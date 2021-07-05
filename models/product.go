package models

import "gorm.io/gorm"

type Product struct {
	gorm.Model
	MeasurementUnitID uint
	MeasurementUnit   MeasurementUnit `gorm:"not null,constraint:OnUpdate:RESTRICT,OnDelete:RESTRICT;" json:"measurementUnit"`
	Name              string          `gorm:"not null" json:"name"`
	Units             int             `gorm:"not null" json:"units"`
	CreatedByID       uint
	CreatedBy         User   `json:"createdBy" gorm:"constraint:OnUpdate:CASCADE,OnDelete:SET NULL;"`
	Barcode           string `gorm:"not null,uniqueIndex" json:"barcode"`
}
