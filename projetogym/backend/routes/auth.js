const express = require('express');
const { body } = require('express-validator');
const {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  logout
} = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Validações para registro
const registerValidations = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Nome deve ter entre 2 e 50 caracteres'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Senha deve ter pelo menos 6 caracteres'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Confirmação de senha não coincide');
      }
      return true;
    })
];

// Validações para login
const loginValidations = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido'),
  body('password')
    .notEmpty()
    .withMessage('Senha é obrigatória')
];

// Validações para atualização de perfil
const profileValidations = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Nome deve ter entre 2 e 50 caracteres'),
  body('profile.bio')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Bio não pode ter mais de 500 caracteres'),
  body('fitness.height')
    .optional()
    .isFloat({ min: 50, max: 250 })
    .withMessage('Altura deve estar entre 50cm e 250cm'),
  body('fitness.weight')
    .optional()
    .isFloat({ min: 20, max: 300 })
    .withMessage('Peso deve estar entre 20kg e 300kg'),
  body('fitness.birthDate')
    .optional()
    .isISO8601()
    .withMessage('Data de nascimento inválida')
];

// Validações para alteração de senha
const changePasswordValidations = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Senha atual é obrigatória'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('Nova senha deve ter pelo menos 6 caracteres'),
  body('confirmNewPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Confirmação da nova senha não coincide');
      }
      return true;
    })
];

// Rotas públicas
router.post('/register', registerValidations, register);
router.post('/login', loginValidations, login);

// Rotas protegidas
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, profileValidations, updateProfile);
router.put('/change-password', authenticate, changePasswordValidations, changePassword);
router.post('/logout', authenticate, logout);

module.exports = router;
