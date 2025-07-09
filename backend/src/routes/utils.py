from flask import Blueprint, jsonify
from src.models.user import User, UserSession, db
from src.utils.auth_utils import cleanup_expired_sessions
from datetime import datetime
import os

utils_bp = Blueprint('utils', __name__)


@utils_bp.route('/health', methods=['GET'])
def health_check():
    """Health check da API"""
    try:
        # Testar conexão com banco
        db.session.execute('SELECT 1')
        db_status = 'healthy'
    except Exception as e:
        db_status = 'unhealthy'
    
    # Informações do sistema
    health_data = {
        'status': 'healthy' if db_status == 'healthy' else 'unhealthy',
        'timestamp': datetime.utcnow().isoformat(),
        'version': os.getenv('APP_VERSION', '1.0.0'),
        'app_name': os.getenv('APP_NAME', 'Capivara AI Backend'),
        'database': {
            'status': db_status,
            'type': 'SQLite'
        },
        'environment': os.getenv('FLASK_ENV', 'development')
    }
    
    status_code = 200 if health_data['status'] == 'healthy' else 503
    
    return jsonify(health_data), status_code


@utils_bp.route('/stats', methods=['GET'])
def get_api_stats():
    """Estatísticas gerais da API"""
    try:
        # Contar usuários
        total_users = User.query.count()
        active_users = User.query.filter_by(is_active=True).count()
        
        # Contar sessões ativas
        active_sessions = UserSession.query.filter_by(is_active=True).filter(
            UserSession.expires_at > datetime.utcnow()
        ).count()
        
        # Usuários criados hoje
        today = datetime.utcnow().date()
        users_today = User.query.filter(
            db.func.date(User.created_at) == today
        ).count()
        
        # Usuários criados esta semana
        from datetime import timedelta
        week_ago = datetime.utcnow() - timedelta(days=7)
        users_this_week = User.query.filter(
            User.created_at >= week_ago
        ).count()
        
        stats = {
            'users': {
                'total': total_users,
                'active': active_users,
                'inactive': total_users - active_users,
                'created_today': users_today,
                'created_this_week': users_this_week
            },
            'sessions': {
                'active': active_sessions
            },
            'timestamp': datetime.utcnow().isoformat()
        }
        
        return jsonify({
            'success': True,
            'stats': stats
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': 'Internal Server Error',
            'message': 'Erro ao obter estatísticas'
        }), 500


@utils_bp.route('/cleanup', methods=['POST'])
def cleanup_database():
    """Limpeza de dados expirados (endpoint administrativo)"""
    try:
        # Limpar sessões expiradas
        cleaned_sessions = cleanup_expired_sessions()
        
        return jsonify({
            'success': True,
            'message': 'Limpeza realizada com sucesso',
            'cleaned': {
                'expired_sessions': cleaned_sessions
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': 'Internal Server Error',
            'message': 'Erro durante limpeza'
        }), 500


@utils_bp.route('/info', methods=['GET'])
def get_api_info():
    """Informações da API"""
    info = {
        'name': os.getenv('APP_NAME', 'Capivara AI Backend'),
        'version': os.getenv('APP_VERSION', '1.0.0'),
        'description': 'API REST para sistema de autenticação Capivara AI',
        'environment': os.getenv('FLASK_ENV', 'development'),
        'endpoints': {
            'auth': [
                'POST /api/auth/register',
                'POST /api/auth/login',
                'POST /api/auth/logout',
                'POST /api/auth/refresh',
                'GET /api/auth/verify',
                'GET /api/auth/me'
            ],
            'user': [
                'GET /api/user/profile',
                'PUT /api/user/profile',
                'GET /api/user/preferences',
                'PUT /api/user/preferences',
                'GET /api/user/stats',
                'DELETE /api/user/account',
                'GET /api/user/sessions',
                'POST /api/user/sessions/revoke-all'
            ],
            'utils': [
                'GET /api/utils/health',
                'GET /api/utils/stats',
                'POST /api/utils/cleanup',
                'GET /api/utils/info'
            ]
        },
        'features': [
            'JWT Authentication',
            'User Registration & Login',
            'User Profile Management',
            'User Preferences',
            'Session Management',
            'Password Hashing (bcrypt)',
            'Input Validation',
            'CORS Support',
            'Error Handling',
            'Database Models',
            'API Documentation'
        ],
        'timestamp': datetime.utcnow().isoformat()
    }
    
    return jsonify(info), 200


@utils_bp.route('/test', methods=['GET'])
def test_endpoint():
    """Endpoint de teste simples"""
    return jsonify({
        'success': True,
        'message': 'API funcionando corretamente!',
        'timestamp': datetime.utcnow().isoformat()
    }), 200


# Handler de erro para rotas não encontradas
@utils_bp.errorhandler(404)
def handle_not_found(e):
    return jsonify({
        'error': 'Not Found',
        'message': 'Endpoint não encontrado',
        'available_endpoints': [
            '/api/utils/health',
            '/api/utils/stats',
            '/api/utils/info',
            '/api/utils/test'
        ]
    }), 404

