const jwt = require('jsonwebtoken');
const User = require('../models/UserMySQL');

// Middleware para verificar token JWT
const authenticate = async (req, res, next) => {
  try {
    let token;

    // Verificar se token existe no header Authorization
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Verificar se token existe
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Acesso negado. Token não fornecido.'
      });
    }

    try {
      // Verificar token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Buscar usuário
      const user = await User.findByPk(decoded.id);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Token inválido. Usuário não encontrado.'
        });
      }

      // Adicionar usuário ao request
      req.user = user;
      next();

    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido ou expirado.'
      });
    }

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Middleware para verificar se usuário é dono do recurso ou admin
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Acesso negado. Usuário não autenticado.'
      });
    }

    // Por enquanto, sem sistema de roles avançado
    // Futuramente pode ser expandido para diferentes níveis de acesso
    if (roles.length > 0 && !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado. Permissões insuficientes.'
      });
    }

    next();
  };
};

// Middleware opcional - usuário pode estar autenticado ou não
const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.id);

        if (user) {
          req.user = user;
        }
      } catch (error) {
        // Token inválido, mas continua sem usuário
      }
    }

    next();
  } catch (error) {
    next();
  }
};

module.exports = {
  authenticate,
  authorize,
  optionalAuth
};
