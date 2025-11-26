const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Nome é obrigatório'],
    trim: true,
    maxlength: [50, 'Nome não pode ter mais de 50 caracteres']
  },
  email: {
    type: String,
    required: [true, 'Email é obrigatório'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Por favor, insira um email válido'
    ]
  },
  password: {
    type: String,
    required: [true, 'Senha é obrigatória'],
    minlength: [6, 'Senha deve ter pelo menos 6 caracteres'],
    select: false // Não retorna senha nas queries
  },
  profile: {
    avatar: {
      type: String,
      default: ''
    },
    bio: {
      type: String,
      maxlength: [500, 'Bio não pode ter mais de 500 caracteres'],
      default: ''
    },
    location: {
      type: String,
      default: ''
    },
    website: {
      type: String,
      default: ''
    }
  },
  fitness: {
    level: {
      type: String,
      enum: ['iniciante', 'intermediario', 'avancado'],
      default: 'iniciante'
    },
    goals: [{
      type: String,
      enum: ['perda-peso', 'ganho-massa', 'condicionamento', 'saude', 'forca']
    }],
    height: {
      type: Number, // em cm
      min: [50, 'Altura deve ser maior que 50cm'],
      max: [250, 'Altura deve ser menor que 250cm']
    },
    weight: {
      type: Number, // em kg
      min: [20, 'Peso deve ser maior que 20kg'],
      max: [300, 'Peso deve ser menor que 300kg']
    },
    birthDate: {
      type: Date
    }
  },
  subscription: {
    plan: {
      type: String,
      enum: ['basico', 'premium', 'black'],
      default: 'basico'
    },
    status: {
      type: String,
      enum: ['ativo', 'inativo', 'cancelado', 'expirado'],
      default: 'inativo'
    },
    startDate: Date,
    endDate: Date,
    autoRenew: {
      type: Boolean,
      default: true
    }
  },
  stats: {
    workoutsCompleted: {
      type: Number,
      default: 0
    },
    totalTime: {
      type: Number, // em minutos
      default: 0
    },
    streak: {
      type: Number,
      default: 0
    },
    lastWorkout: Date
  },
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      workoutReminders: { type: Boolean, default: true }
    },
    privacy: {
      profileVisible: { type: Boolean, default: true },
      showStats: { type: Boolean, default: true }
    },
    units: {
      weight: { type: String, enum: ['kg', 'lbs'], default: 'kg' },
      height: { type: String, enum: ['cm', 'ft'], default: 'cm' }
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual para idade
userSchema.virtual('age').get(function() {
  if (!this.fitness.birthDate) return null;
  return Math.floor((Date.now() - this.fitness.birthDate) / (365.25 * 24 * 60 * 60 * 1000));
});

// Virtual para IMC
userSchema.virtual('bmi').get(function() {
  if (!this.fitness.height || !this.fitness.weight) return null;
  const heightInMeters = this.fitness.height / 100;
  return (this.fitness.weight / (heightInMeters * heightInMeters)).toFixed(1);
});

// Índices
userSchema.index({ email: 1 });
userSchema.index({ 'fitness.level': 1 });
userSchema.index({ 'subscription.status': 1 });
userSchema.index({ createdAt: -1 });

// Middleware para hash da senha
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Método para comparar senha
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Método para gerar token JWT
userSchema.methods.generateAuthToken = function() {
  const jwt = require('jsonwebtoken');
  return jwt.sign(
    { id: this._id, email: this.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

// Método para atualizar streak
userSchema.methods.updateStreak = function() {
  const now = new Date();
  const lastWorkout = this.stats.lastWorkout;

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
};

module.exports = mongoose.model('User', userSchema);
