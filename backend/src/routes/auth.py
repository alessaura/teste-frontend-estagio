from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from marshmallow import ValidationError
from src.models.user import User, UserPreferences, db
from src.schemas.auth_schemas import (
    RegisterSchema, LoginSchema, RefreshTokenSchema,
    LoginResponseSchema, MessageResponseSchema, ErrorResponseSchema
)
from src.utils.auth_utils import create_user_session, revoke_user_session, get_client_ip
from datetime import timedelta
import os

auth_bp = Blueprint('auth', __name__)

# Schemas
register_schema = RegisterSchema()
login_schema = LoginSchema()
refresh_schema = RefreshTokenSchema()
login_response_schema = LoginResponseSchema()
message_response_schema = MessageResponseSchema()
error_response_schema = ErrorResponseSchema()


@auth_bp.route('/register', methods=['POST'])
def register():
    """Endpoint para registro de usuário"""
    try:
        # Validar dados de entrada
        data = register_schema.load(request.json)
        
        # Verificar se as senhas coincidem
        if data['password'] != data['confirm_password']:
            return jsonify({
                'error': 'Validation Error',
                'message': 'Senhas não coincidem',
                'details': {'confirm_password': ['Senhas não coincidem']}
            }), 400
        
        # Verificar se username já existe
        if User.find_by_username(data['username']):
            return jsonify({
                'error': 'Conflict',
                'message': 'Nome de usuário já existe',
                'details': {'username': ['Este nome de usuário já está em uso']}
            }), 409
        
        # Verificar se email já existe
        if User.find_by_email(data['email']):
            return jsonify({
                'error': 'Conflict',
                'message': 'Email já está cadastrado',
                'details': {'email': ['Este email já está em uso']}
            }), 409
        
        # Criar novo usuário
        user = User(
            username=data['username'],
            email=data['email']
        )
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.flush()  # Para obter o ID do usuário
        
        # Criar preferências padrão
        preferences = UserPreferences(user_id=user.id)
        db.session.add(preferences)
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Usuário cadastrado com sucesso',
            'user': user.to_public_dict()
        }), 201
        
    except ValidationError as e:
        return jsonify({
            'error': 'Validation Error',
            'message': 'Dados inválidos',
            'details': e.messages
        }), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': 'Internal Server Error',
            'message': 'Erro interno do servidor'
        }), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    """Endpoint para login de usuário"""
    try:
        # Validar dados de entrada
        data = login_schema.load(request.json)
        
        # Buscar usuário por username ou email
        user = User.find_by_username_or_email(data['username'])
        
        if not user or not user.check_password(data['password']):
            return jsonify({
                'error': 'Unauthorized',
                'message': 'Credenciais inválidas'
            }), 401
        
        if not user.is_active:
            return jsonify({
                'error': 'Forbidden',
                'message': 'Conta desativada'
            }), 403
        
        # Configurar tempo de expiração baseado em "remember_me"
        remember_me = data.get('remember_me', False)
        if remember_me:
            expires_delta = timedelta(days=7)  # 7 dias
            expires_in_seconds = 7 * 24 * 60 * 60
        else:
            expires_delta = timedelta(hours=1)  # 1 hora
            expires_in_seconds = 60 * 60
        
        # Criar tokens
        access_token = create_access_token(
            identity=user.id,
            expires_delta=expires_delta
        )
        refresh_token = create_refresh_token(identity=user.id)
        
        # Criar sessão no banco
        create_user_session(user.id, access_token, expires_in_seconds)
        
        # Atualizar preferências de remember_me
        if user.preferences:
            user.preferences.remember_me = remember_me
        else:
            preferences = UserPreferences(user_id=user.id, remember_me=remember_me)
            db.session.add(preferences)
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Login realizado com sucesso',
            'access_token': access_token,
            'refresh_token': refresh_token,
            'user': user.to_public_dict(),
            'expires_in': expires_in_seconds,
            'remember_me': remember_me
        }), 200
        
    except ValidationError as e:
        return jsonify({
            'error': 'Validation Error',
            'message': 'Dados inválidos',
            'details': e.messages
        }), 400
    except Exception as e:
        return jsonify({
            'error': 'Internal Server Error',
            'message': 'Erro interno do servidor'
        }), 500


@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    """Endpoint para logout de usuário"""
    try:
        current_user_id = get_jwt_identity()
        
        # Obter token do header
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
            
            # Revogar sessão
            revoke_user_session(current_user_id, token)
        
        return jsonify({
            'success': True,
            'message': 'Logout realizado com sucesso'
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': 'Internal Server Error',
            'message': 'Erro interno do servidor'
        }), 500


@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """Endpoint para renovar token de acesso"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or not user.is_active:
            return jsonify({
                'error': 'Unauthorized',
                'message': 'Usuário inválido ou inativo'
            }), 401
        
        # Criar novo token de acesso
        new_access_token = create_access_token(identity=current_user_id)
        
        # Criar nova sessão
        create_user_session(current_user_id, new_access_token)
        
        return jsonify({
            'success': True,
            'message': 'Token renovado com sucesso',
            'access_token': new_access_token,
            'user': user.to_public_dict()
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': 'Internal Server Error',
            'message': 'Erro interno do servidor'
        }), 500


@auth_bp.route('/verify', methods=['GET'])
@jwt_required()
def verify_token():
    """Endpoint para verificar se o token é válido"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or not user.is_active:
            return jsonify({
                'error': 'Unauthorized',
                'message': 'Token inválido ou usuário inativo'
            }), 401
        
        return jsonify({
            'success': True,
            'message': 'Token válido',
            'user': user.to_public_dict()
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': 'Unauthorized',
            'message': 'Token inválido'
        }), 401


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Endpoint para obter dados do usuário atual"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or not user.is_active:
            return jsonify({
                'error': 'Unauthorized',
                'message': 'Usuário inválido ou inativo'
            }), 401
        
        return jsonify({
            'success': True,
            'user': user.to_public_dict()
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': 'Internal Server Error',
            'message': 'Erro interno do servidor'
        }), 500


# Handlers de erro
@auth_bp.errorhandler(ValidationError)
def handle_validation_error(e):
    return jsonify({
        'error': 'Validation Error',
        'message': 'Dados inválidos',
        'details': e.messages
    }), 400


@auth_bp.errorhandler(404)
def handle_not_found(e):
    return jsonify({
        'error': 'Not Found',
        'message': 'Endpoint não encontrado'
    }), 404


@auth_bp.errorhandler(405)
def handle_method_not_allowed(e):
    return jsonify({
        'error': 'Method Not Allowed',
        'message': 'Método não permitido para este endpoint'
    }), 405

