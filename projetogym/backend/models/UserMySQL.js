const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Nome é obrigatório' },
      len: { args: [1, 50], msg: 'Nome não pode ter mais de 50 caracteres' }
    }
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: { msg: 'Email é obrigatório' },
      isEmail: { msg: 'Por favor, insira um email válido' }
    }
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Senha é obrigatória' },
      len: { args: [6, 255], msg: 'Senha deve ter pelo menos 6 caracteres' }
    }
  },
  profile: {
    type: DataTypes.JSON,
    defaultValue: {},
    allowNull: false
  },
  fitness: {
    type: DataTypes.JSON,
    defaultValue: {},
    allowNull: false
  },
  subscription: {
    type: DataTypes.JSON,
    defaultValue: { plan: 'basico', status: 'inativo', autoRenew: true },
    allowNull: false
  },
  stats: {
    type: DataTypes.JSON,
    defaultValue: { workoutsCompleted: 0, totalTime: 0, streak: 0 },
    allowNull: false
  },
  preferences: {
    type: DataTypes.JSON,
    defaultValue: {
      notifications: { email: true, push: true, workoutReminders: true },
      privacy: { profileVisible: true, showStats: true },
      units: { weight: 'kg', height: 'cm' }
    },
    allowNull: false
  }
}, {
  tableName: 'users',
  timestamps: true,
  indexes: [
    { fields: ['email'] },
    { fields: ['createdAt'] }
  ],
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(12);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(12);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

// Métodos de instância
User.prototype.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

User.prototype.generateAuthToken = function() {
  const jwt = require('jsonwebtoken');
  return jwt.sign(
    { id: this.id, email: this.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

User.prototype.updateStreak = function() {
  const now = new Date();
  const lastWorkout = this.stats.lastWorkout ? new Date(this.stats.lastWorkout) : null;

  if (!lastWorkout) {
    this.stats.streak = 1;
  } else {
    const daysDiff = Math.floor((now - lastWorkout) / (1000 * 60 * 60 * 24));

    if (daysDiff === 1) {
      this.stats.streak += 1;
    } else if (daysDiff > 1) {
      this.stats.streak = 1;
    }
    // Se daysDiff === 0, mantém o streak atual
  }

  this.stats.lastWorkout = now;
  this.changed('stats', true);
};

// Virtuals (getters)
User.prototype.getAge = function() {
  if (!this.fitness.birthDate) return null;
  const birthDate = new Date(this.fitness.birthDate);
  return Math.floor((Date.now() - birthDate) / (365.25 * 24 * 60 * 60 * 1000));
};

User.prototype.getBmi = function() {
  if (!this.fitness.height || !this.fitness.weight) return null;
  const heightInMeters = this.fitness.height / 100;
  return (this.fitness.weight / (heightInMeters * heightInMeters)).toFixed(1);
};

module.exports = User;
