module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Products', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING
      },
      description: {
        type: Sequelize.TEXT
      },
      price: {
        allowNull: false,
        type: Sequelize.DOUBLE
      },
      image: {
        type: Sequelize.STRING
      },
      order: {
        type: Sequelize.INTEGER
      },
      availability: {
        type: Sequelize.BOOLEAN
      },
      restaurantId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: {
            tableName: 'Restaurants'
          },
          key: 'id'
        },
        onDelete: 'cascade'
      },
      productCategoryId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: {
            tableName: 'ProductCategories'
          },
          key: 'id'
        }
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: new Date()
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: new Date()
      },
      // solution: añadimos las nuevas propiedades
      grasas: {
        type: Sequelize.DOUBLE
      },
      proteinas: {
        type: Sequelize.DOUBLE
      },
      carbohidratos: {
        type: Sequelize.DOUBLE
      },
      calorias: {
        type: Sequelize.DOUBLE
      }
    })
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Products')
  }
}
