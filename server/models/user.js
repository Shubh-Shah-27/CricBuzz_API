const {
  Model
} = require('sequelize');
const bcrypt = require('bcrypt');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.hasMany(models.AuthToken);

      User.authenticate = async function(username, password) {

        const user = await User.findOne({ where: { username } });
    
        if (bcrypt.compareSync(password, user.password)) {
          return user.authorize();
        }
    
        throw new Error('invalid password');
      };

      User.prototype.authorize = async function () {
        const { AuthToken } = sequelize.models;
        const user = this
    
        // create a new auth token associated to 'this' user
        // by calling the AuthToken class method we created earlier
        // and passing it the user id
        const authToken = await AuthToken.generate(this.id);
    
        // addAuthToken is a generated method provided by
        // sequelize which is made for any 'hasMany' relationships
        await user.addAuthToken(authToken);
    
        return {user, authToken};
      };

      User.prototype.logout = async function (token) {

        // destroy the auth token record that matches the passed token
        sequelize.models.AuthToken.destroy({ where: { token } });
      };
    }
  }
  User.init({
    email: DataTypes.STRING,
    username: DataTypes.STRING,
    password: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};