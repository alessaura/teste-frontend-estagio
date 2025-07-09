from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import ValidationError
from src.models.user import User, UserPreferences, db
from src.schemas.user_schemas import (
    UpdateProfileSchema, UpdatePreferencesSchema, DeleteAccountSchema,
    UserProfileResponseSchema, UserPreferencesResponseSchema
)
from src.utils.auth_utils import token_required, get_user_stats, revoke_all_user_sessions

user_bp = Blueprint('user', __name__)

# Schemas
update_profile_schema = UpdateProfileSchema()
update_preferences_schema = UpdatePreferencesSchema()
delete_account_schema = DeleteAccountSchema()
user_profile_response_schema = UserProfileResponseSchema()
user_preferences_response_schema = UserPreferencesResponseSchema()


@user_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    """Obter perfil completo do usuário"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or not user.is_active:
            return jsonify({
                'error': 'Unauthorized',
                'message': 'Usuário inválido ou inativo'
            }), 401
        
        # Obter ou criar preferências
        if not user.preferences:
            preferences = UserPreferences(user_id=user.id)
            db.session.add(preferences)
            db.session.commit()
            user.preferences = preferences
        
        # Obter estatísticas
        stats = get_user_stats(user)
        
        profile_data = {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'created_at': user.created_at,
            'updated_at': user.updated_at,
            'is_active': user.is_active,
            'preferences': user.preferences.to_dict() if user.preferences else None,
            'stats': stats
        }
        
        return jsonify({
            'success': True,
            'user': profile_data
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': 'Internal Server Error',
            'message': 'Erro interno do servidor'
        }), 500


@user_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    """Atualizar perfil do usuário"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or not user.is_active:
            return jsonify({
                'error': 'Unauthorized',
                'message': 'Usuário inválido ou inativo'
            }), 401
        
        # Validar dados de entrada
        data = update_profile_schema.load(request.json)
        
        # Verificar se username já existe (se foi fornecido e é diferente do atual)
        if 'username' in data and data['username'] != user.username:
            existing_user = User.find_by_username(data['username'])
            if existing_user:
                return jsonify({
                    'error': 'Conflict',
                    'message': 'Nome de usuário já existe',
                    'details': {'username': ['Este nome de usuário já está em uso']}
                }), 409
            user.username = data['username']
        
        # Verificar se email já existe (se foi fornecido e é diferente do atual)
        if 'email' in data and data['email'] != user.email:
            existing_user = User.find_by_email(data['email'])
            if existing_user:
                return jsonify({
                    'error': 'Conflict',
                    'message': 'Email já está cadastrado',
                    'details': {'email': ['Este email já está em uso']}
                }), 409
            user.email = data['email']
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Perfil atualizado com sucesso',
            'user': user.to_public_dict()
        }), 200
        
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


@user_bp.route('/preferences', methods=['GET'])
@jwt_required()
def get_preferences():
    """Obter preferências do usuário"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or not user.is_active:
            return jsonify({
                'error': 'Unauthorized',
                'message': 'Usuário inválido ou inativo'
            }), 401
        
        # Obter ou criar preferências
        if not user.preferences:
            preferences = UserPreferences(user_id=user.id)
            db.session.add(preferences)
            db.session.commit()
        else:
            preferences = user.preferences
        
        return jsonify({
            'success': True,
            'preferences': preferences.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': 'Internal Server Error',
            'message': 'Erro interno do servidor'
        }), 500


@user_bp.route('/preferences', methods=['PUT'])
@jwt_required()
def update_preferences():
    """Atualizar preferências do usuário"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or not user.is_active:
            return jsonify({
                'error': 'Unauthorized',
                'message': 'Usuário inválido ou inativo'
            }), 401
        
        # Validar dados de entrada
        data = update_preferences_schema.load(request.json)
        
        # Obter ou criar preferências
        if not user.preferences:
            preferences = UserPreferences(user_id=user.id)
            db.session.add(preferences)
        else:
            preferences = user.preferences
        
        # Atualizar campos fornecidos
        if 'theme' in data:
            preferences.theme = data['theme']
        if 'notifications_enabled' in data:
            preferences.notifications_enabled = data['notifications_enabled']
        if 'remember_me' in data:
            preferences.remember_me = data['remember_me']
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Preferências atualizadas com sucesso',
            'preferences': preferences.to_dict()
        }), 200
        
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


@user_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_user_stats():
    """Obter estatísticas do usuário"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or not user.is_active:
            return jsonify({
                'error': 'Unauthorized',
                'message': 'Usuário inválido ou inativo'
            }), 401
        
        stats = get_user_stats(user)
        
        return jsonify({
            'success': True,
            'stats': stats
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': 'Internal Server Error',
            'message': 'Erro interno do servidor'
        }), 500


@user_bp.route('/account', methods=['DELETE'])
@jwt_required()
def delete_account():
    """Deletar conta do usuário"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or not user.is_active:
            return jsonify({
                'error': 'Unauthorized',
                'message': 'Usuário inválido ou inativo'
            }), 401
        
        # Validar dados de entrada
        data = delete_account_schema.load(request.json)
        
        # Verificar senha
        if not user.check_password(data['password']):
            return jsonify({
                'error': 'Unauthorized',
                'message': 'Senha incorreta'
            }), 401
        
        # Revogar todas as sessões
        revoke_all_user_sessions(user.id)
        
        # Marcar usuário como inativo (soft delete)
        user.is_active = False
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Conta deletada com sucesso'
        }), 200
        
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


@user_bp.route('/sessions', methods=['GET'])
@jwt_required()
def get_user_sessions():
    """Obter sessões ativas do usuário"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or not user.is_active:
            return jsonify({
                'error': 'Unauthorized',
                'message': 'Usuário inválido ou inativo'
            }), 401
        
        # Obter sessões ativas
        from src.models.user import UserSession
        from datetime import datetime
        
        active_sessions = UserSession.query.filter_by(
            user_id=user.id,
            is_active=True
        ).filter(UserSession.expires_at > datetime.utcnow()).all()
        
        sessions_data = [session.to_dict() for session in active_sessions]
        
        return jsonify({
            'success': True,
            'sessions': sessions_data,
            'count': len(sessions_data)
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': 'Internal Server Error',
            'message': 'Erro interno do servidor'
        }), 500


@user_bp.route('/sessions/revoke-all', methods=['POST'])
@jwt_required()
def revoke_all_sessions():
    """Revogar todas as sessões do usuário (exceto a atual)"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or not user.is_active:
            return jsonify({
                'error': 'Unauthorized',
                'message': 'Usuário inválido ou inativo'
            }), 401
        
        # Revogar todas as sessões
        revoked_count = revoke_all_user_sessions(user.id)
        
        return jsonify({
            'success': True,
            'message': f'{revoked_count} sessões revogadas com sucesso'
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': 'Internal Server Error',
            'message': 'Erro interno do servidor'
        }), 500


# Handlers de erro
@user_bp.errorhandler(ValidationError)
def handle_validation_error(e):
    return jsonify({
        'error': 'Validation Error',
        'message': 'Dados inválidos',
        'details': e.messages
    }), 400


@user_bp.errorhandler(404)
def handle_not_found(e):
    return jsonify({
        'error': 'Not Found',
        'message': 'Endpoint não encontrado'
    }), 404


@user_bp.errorhandler(405)
def handle_method_not_allowed(e):
    return jsonify({
        'error': 'Method Not Allowed',
        'message': 'Método não permitido para este endpoint'
    }), 405

