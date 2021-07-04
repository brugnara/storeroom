package database

import (
	"github.com/brugnara/storeroom/models"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

const (
	ModeDefault = 0
	ModeDebug   = 1
)

func New(url string, mode int) *gorm.DB {
	db, err := gorm.Open(sqlite.Open(url), &gorm.Config{})
	if err != nil {
		panic("failed to connect database")
	}

	// prepare the db
	_ = db.AutoMigrate(
		&models.Email{},
		&models.MeasurementUnit{},
		&models.Product{},
		&models.Share{},
		&models.Store{},
		&models.StoredProduct{},
		&models.User{},
	)

	if mode == ModeDebug {
		return db.Debug()
	}

	return db
}
