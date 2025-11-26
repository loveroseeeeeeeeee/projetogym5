const User = require('../models/UserMySQL');
const { validationResult } = require('express-validator');

// @desc    Registrar novo usuário
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }

    const { name, email, password, confirmPassword } = req.body;

    // Verificar se senhas coincidem
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'As senhas não coincidem'
      });
    }

    // Verificar se usuário já existe
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email já cadastrado'
      });
    }

    // Criar usuário
    const user = await User.create({
      name,
      email,
      password
    });

    // Gerar token
    const token = user.generateAuthToken();

    // Remover senha da resposta
    user.password = undefined;

    res.status(201).json({
      success: true,
      message: 'Usuário registrado com sucesso',
      data: {
        user,
        token
      }
    });

  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Login de usuário
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Verificar se usuário existe e incluir senha na busca
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email ou senha incorretos'
      });
    }

    // Verificar senha
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Email ou senha incorretos'
      });
    }

    // Gerar token
    const token = user.generateAuthToken();

    // Remover senha da resposta
    user.password = undefined;

    res.status(200).json({
      success: true,
      message: 'Login realizado com sucesso',
      data: {
        user,
        token
      }
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Obter perfil do usuário logado
// @route   GET /api/auth/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    res.status(200).json({
      success: true,
      data: {
        user
      }
    });

  } catch (error) {
    console.error('Erro ao obter perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Atualizar perfil do usuário
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }

    const allowedFields = [
      'name',
      'profile.bio',
      'profile.location',
      'profile.website',
      'fitness.level',
      'fitness.goals',
      'fitness.height',
      'fitness.weight',
      'fitness.birthDate',
      'preferences'
    ];

    const updates = {};

    // Filtrar apenas campos permitidos
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Atualizar campos
    Object.keys(updates).forEach(key => {
      if (key.includes('.')) {
        // Campos aninhados (profile, fitness, preferences)
        const [parent, child] = key.split('.');
        if (!user[parent]) user[parent] = {};
        user[parent][child] = updates[key];
        user.changed(parent, true);
      } else {
        user[key] = updates[key];
      }
    });

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Perfil atualizado com sucesso',
      data: {
        user
      }
    });

  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Alterar senha
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }

    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    // Verificar se nova senha e confirmação coincidem
    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({
        success: false,
        message: 'A nova senha e a confirmação não coincidem'
      });
    }

    // Buscar usuário
    const user = await User.findByPk(req.user.id);

    // Verificar senha atual
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Senha atual incorreta'
      });
    }

    // Atualizar senha
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Senha alterada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Logout (cliente remove token)
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
  try {
    // Em uma implementação mais avançada, poderíamos
    // adicionar o token a uma blacklist, mas por enquanto
    // apenas retornamos sucesso (cliente remove token)

    res.status(200).json({
      success: true,
      message: 'Logout realizado com sucesso'
    });

  } catch (error) {
    console.error('Erro no logout:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  logout
};
