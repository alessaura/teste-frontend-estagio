from functools import wraps
from flask import request, jsonify, current_app
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity, get_jwt
import hashlib
from datetime import datetime, timedelta
from src.models.user import User, UserSession, db

def token_required(f):
    """Decorator para rotas que requerem autenticação"""
    @wraps(f)
    def decorated(*args, **kwargs):
        try:
            verify_jwt_in_request()
            current_user_id = get_jwt_identity()
            current_user = User.query.get(current_user_id)
            
            if not current_user or not current_user.is_active:
                return jsonify({
                    'error': 'Unauthorized',
                    'message': 'Token inválido ou usuário inativo'
                }), 401
                
            return f(current_user, *args, **kwargs)
        except Exception as e:
            return jsonify({
                'error': 'Unauthorized',
                'message': 'Token inválido ou expirado'
            }), 401
    
    return decorated


def admin_required(f):
    """Decorator para rotas que requerem privilégios de admin"""
    @wraps(f)
    def decorated(*args, **kwargs):
        try:
            verify_jwt_in_request()
            current_user_id = get_jwt_identity()
            current_user = User.query.get(current_user_id)
            
            if not current_user or not current_user.is_active:
                return jsonify({
                    'error': 'Unauthorized',
                    'message': 'Token inválido ou usuário inativo'
                }), 401
            
            # Aqui você pode adicionar lógica para verificar se é admin
            # Por exemplo, verificar um campo 'is_admin' no modelo User
            
            return f(current_user, *args, **kwargs)
        except Exception as e:
            return jsonify({
                'error': 'Forbidden',
                'message': 'Acesso negado'
            }), 403
    
    return decorated


def hash_token(token):
    """Gera hash de um token para armazenamento seguro"""
    return hashlib.sha256(token.encode()).hexdigest()


def create_user_session(user_id, token, expires_in_seconds=3600):
    """Cria uma nova sessão de usuário"""
    try:
        # Remove sessões expiradas do usuário
        cleanup_expired_sessions(user_id)
        
        # Cria nova sessão
        expires_at = datetime.utcnow() + timedelta(seconds=expires_in_seconds)
        token_hash = hash_token(token)
        
        session = UserSession(
            user_id=user_id,
            token_hash=token_hash,
            expires_at=expires_at
        )
        
        db.session.add(session)
        db.session.commit()
        
        return session
    except Exception as e:
        db.session.rollback()
        raise e


def cleanup_expired_sessions(user_id=None):
    """Remove sessões expiradas do banco"""
    try:
        query = UserSession.query.filter(UserSession.expires_at < datetime.utcnow())
        
        if user_id:
            query = query.filter(UserSession.user_id == user_id)
        
        expired_sessions = query.all()
        
        for session in expired_sessions:
            db.session.delete(session)
        
        db.session.commit()
        return len(expired_sessions)
    except Exception as e:
        db.session.rollback()
        raise e


def revoke_user_session(user_id, token):
    """Revoga uma sessão específica do usuário"""
    try:
        token_hash = hash_token(token)
        session = UserSession.query.filter_by(
            user_id=user_id,
            token_hash=token_hash
        ).first()
        
        if session:
            session.is_active = False
            db.session.commit()
            return True
        
        return False
    except Exception as e:
        db.session.rollback()
        raise e


def revoke_all_user_sessions(user_id):
    """Revoga todas as sessões de um usuário"""
    try:
        sessions = UserSession.query.filter_by(user_id=user_id).all()
        
        for session in sessions:
            session.is_active = False
        
        db.session.commit()
        return len(sessions)
    except Exception as e:
        db.session.rollback()
        raise e


def get_user_stats(user):
    """Calcula estatísticas do usuário"""
    try:
        # Conta total de sessões (logins)
        total_logins = UserSession.query.filter_by(user_id=user.id).count()
        
        # Última sessão ativa
        last_session = UserSession.query.filter_by(
            user_id=user.id
        ).order_by(UserSession.created_at.desc()).first()
        
        last_login = last_session.created_at if last_session else None
        
        # Idade da conta em dias
        account_age = datetime.utcnow() - user.created_at
        account_age_days = account_age.days
        
        # Sessões ativas
        active_sessions = UserSession.query.filter_by(
            user_id=user.id,
            is_active=True
        ).filter(UserSession.expires_at > datetime.utcnow()).count()
        
        return {
            'total_logins': total_logins,
            'last_login': last_login,
            'account_age_days': account_age_days,
            'sessions_count': active_sessions
        }
    except Exception as e:
        return {
            'total_logins': 0,
            'last_login': None,
            'account_age_days': 0,
            'sessions_count': 0
        }


def validate_password_strength(password):
    """Valida a força da senha e retorna feedback"""
    feedback = {
        'score': 0,
        'feedback': [],
        'is_strong': False
    }
    
    # Critérios de validação
    if len(password) >= 8:
        feedback['score'] += 1
    else:
        feedback['feedback'].append('Pelo menos 8 caracteres')
    
    if any(c.isupper() for c in password):
        feedback['score'] += 1
    else:
        feedback['feedback'].append('Uma letra maiúscula')
    
    if any(c.islower() for c in password):
        feedback['score'] += 1
    else:
        feedback['feedback'].append('Uma letra minúscula')
    
    if any(c.isdigit() for c in password):
        feedback['score'] += 1
    else:
        feedback['feedback'].append('Um número')
    
    if any(c in '!@#$%^&*()_+-=[]{}|;:,.<>?' for c in password):
        feedback['score'] += 1
    else:
        feedback['feedback'].append('Um caractere especial')
    
    # Considera forte se tem pelo menos 4 dos 5 critérios
    feedback['is_strong'] = feedback['score'] >= 4
    
    return feedback


def rate_limit_key(identifier, endpoint):
    """Gera chave para rate limiting"""
    return f"rate_limit:{endpoint}:{identifier}"


def get_client_ip():
    """Obtém IP do cliente considerando proxies"""
    if request.headers.get('X-Forwarded-For'):
        return request.headers.get('X-Forwarded-For').split(',')[0].strip()
    elif request.headers.get('X-Real-IP'):
        return request.headers.get('X-Real-IP')
    else:
        return request.remote_addr

