package models

import "gorm.io/gorm"

type Product struct {
	gorm.Model
	MeasurementUnitID uint
	MeasurementUnit   MeasurementUnit `gorm:"constraint:OnUpdate:RESTRICT,OnDelete:RESTRICT;" json:"measurementUnit"`
	Name              string          `json:"name"`
	Units             int             `json:"units"`
	CreatedByID       uint
	CreatedBy         User   `json:"createdBy" gorm:"constraint:OnUpdate:CASCADE,OnDelete:SET NULL;"`
	Barcode           string `gorm:"uniqueIndex" json:"barcode"`
}
