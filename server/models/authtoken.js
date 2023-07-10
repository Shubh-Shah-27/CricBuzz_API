const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class AuthToken extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      AuthToken.belongsTo(models.User);

      // generates a random 15 character token and
  // associates it with a user
      AuthToken.generate = async function(UserId) {
        if (!UserId) {
          throw new Error('AuthToken requires a user ID')
        }

        let token = '';

        const possibleCharacters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' +
          'abcdefghijklmnopqrstuvwxyz0123456789';

        for (var i = 0; i < 15; i++) {
          token += possibleCharacters.charAt(
            Math.floor(Math.random() * possibleCharacters.length)
          );
        }

        return AuthToken.create({ token, UserId })
      }

      AuthToken.find = async function(req, res, next) {

        // look for an authorization header or auth_token in the cookies
        const token =
          req.cookies.auth_token || req.headers.authorization;
      
        // if a token is found we will try to find it's associated user
        // If there is one, we attach it to the req object so any
        // following middleware or routing logic will have access to
        // the authenticated user.
        if (token) {
          
          // look for an auth token that matches the cookie or header
          const authToken = await AuthToken.find(
            { where: { token }, include: User }
          );
      
          // if there is an auth token found, we attach it's associated
          // user to the req object so we can use it in our routes
          if (authToken) {
            req.user = authToken.User;
          }
        }
        next();
      }
    }
  }
  AuthToken.init({
    token: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'AuthToken',
  });
  return AuthToken;
};