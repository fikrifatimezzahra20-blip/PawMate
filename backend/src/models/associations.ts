import User from './user.model.js';
import Walker from './walker.model.js';
import Dog from './dog.model.js';
import Booking from './booking.model.js';

export const setupAssociations = () => {
  // User <-> Walker
  User.hasOne(Walker, { foreignKey: 'user_id', as: 'walker' });
  Walker.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

  // User <-> Dog
  User.hasMany(Dog, { foreignKey: 'owner_id', as: 'dogs' });
  Dog.belongsTo(User, { foreignKey: 'owner_id', as: 'owner' });

  // Walker <-> Booking
  Walker.hasMany(Booking, { foreignKey: 'walker_id', as: 'bookings' });
  Booking.belongsTo(Walker, { foreignKey: 'walker_id', as: 'walker' });

  // Dog <-> Booking
  Dog.hasMany(Booking, { foreignKey: 'dog_id', as: 'dog' });
  Booking.belongsTo(Dog, { foreignKey: 'dog_id', as: 'dog' });
};

setupAssociations();

export { User, Walker, Dog, Booking };
