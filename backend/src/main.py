import os
import sys
# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, send_from_directory, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv

# Carregar variáveis de ambiente
load_dotenv()

# Importar modelos e rotas
from src.models.user import db
from src.routes.user import user_bp
from src.routes.auth import auth_bp
from src.routes.utils import utils_bp

def create_app():
    """Factory function para criar a aplicação Flask"""
    app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))
    
    # Configurações
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'capivara-ai-super-secret-key-2024')
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'jwt-secret-key-capivara-ai-2024')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = int(os.getenv('JWT_ACCESS_TOKEN_EXPIRES', 3600))
    
    # Configuração do banco de dados
    database_path = os.path.join(os.path.dirname(__file__), 'database', 'app.db')
    app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{database_path}"
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Inicializar extensões
    db.init_app(app)
    jwt = JWTManager(app)
    
    # Configurar CORS
    cors_origins = os.getenv('CORS_ORIGINS', 'http://localhost:3000').split(',')
    CORS(app, origins=cors_origins, supports_credentials=True)
    
    # Registrar blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(user_bp, url_prefix='/api/user')
    app.register_blueprint(utils_bp, url_prefix='/api/utils')
    
    # Criar tabelas do banco
    with app.app_context():
        db.create_all()
        
        # Criar usuário admin padrão se não existir
        from src.models.user import User, UserPreferences
        admin_user = User.find_by_username('admin')
        if not admin_user:
            admin_user = User(
                username='admin',
                email='admin@capivara.ai'
            )
            admin_user.set_password('admin123')
            db.session.add(admin_user)
            db.session.flush()
            
            # Criar preferências para o admin
            admin_preferences = UserPreferences(user_id=admin_user.id)
            db.session.add(admin_preferences)
            
            db.session.commit()
            print("✅ Usuário admin criado: admin / admin123")
    
    # Handlers JWT
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({
            'error': 'Token Expired',
            'message': 'Token expirado'
        }), 401
    
    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify({
            'error': 'Invalid Token',
            'message': 'Token inválido'
        }), 401
    
    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return jsonify({
            'error': 'Authorization Required',
            'message': 'Token de acesso necessário'
        }), 401
    
    # Rota principal para servir frontend
    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve(path):
        static_folder_path = app.static_folder
        if static_folder_path is None:
            return jsonify({
                'message': 'Capivara AI Backend API',
                'version': '1.0.0',
                'status': 'running',
                'endpoints': {
                    'auth': '/api/auth/*',
                    'user': '/api/user/*',
                    'utils': '/api/utils/*'
                }
            }), 200

        if path != "" and os.path.exists(os.path.join(static_folder_path, path)):
            return send_from_directory(static_folder_path, path)
        else:
            index_path = os.path.join(static_folder_path, 'index.html')
            if os.path.exists(index_path):
                return send_from_directory(static_folder_path, 'index.html')
            else:
                return jsonify({
                    'message': 'Capivara AI Backend API',
                    'version': '1.0.0',
                    'status': 'running',
                    'endpoints': {
                        'auth': '/api/auth/*',
                        'user': '/api/user/*',
                        'utils': '/api/utils/*'
                    }
                }), 200
    
    # Handler global de erro
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            'error': 'Not Found',
            'message': 'Endpoint não encontrado',
            'available_endpoints': [
                '/api/auth/register',
                '/api/auth/login',
                '/api/user/profile',
                '/api/utils/health'
            ]
        }), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({
            'error': 'Internal Server Error',
            'message': 'Erro interno do servidor'
        }), 500
    
    return app

# Criar aplicação
app = create_app()

if __name__ == '__main__':
    print("🚀 Iniciando Capivara AI Backend...")
    print("📍 Endpoints disponíveis:")
    print("   • POST /api/auth/register - Cadastro")
    print("   • POST /api/auth/login - Login")
    print("   • GET /api/user/profile - Perfil")
    print("   • GET /api/utils/health - Health Check")
    print("   • GET /api/utils/info - Informações da API")
    print("🌐 CORS habilitado para:", os.getenv('CORS_ORIGINS', 'http://localhost:3000'))
    print("👤 Usuário padrão: admin / admin123")
    
    app.run(
        host='0.0.0.0', 
        port=int(os.getenv('PORT', 5000)), 
        debug=os.getenv('FLASK_ENV') == 'development'
    )

