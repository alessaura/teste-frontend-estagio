#!/usr/bin/env python3
"""
Script de teste para a API Capivara AI Backend
"""
import requests
import json
import sys

BASE_URL = "http://localhost:5000"

def test_health():
    """Testa o health check"""
    print("🔍 Testando Health Check...")
    response = requests.get(f"{BASE_URL}/api/utils/health")
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    return response.status_code == 200

def test_info():
    """Testa endpoint de informações"""
    print("\n📋 Testando API Info...")
    response = requests.get(f"{BASE_URL}/api/utils/info")
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    return response.status_code == 200

def test_register():
    """Testa registro de usuário"""
    print("\n👤 Testando Registro de Usuário...")
    data = {
        "username": "testuser",
        "email": "test@example.com",
        "password": "test123456",
        "confirm_password": "test123456"
    }
    response = requests.post(f"{BASE_URL}/api/auth/register", json=data)
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    return response.status_code == 201

def test_login():
    """Testa login de usuário"""
    print("\n🔐 Testando Login...")
    data = {
        "username": "admin",
        "password": "admin123"
    }
    response = requests.post(f"{BASE_URL}/api/auth/login", json=data)
    print(f"Status: {response.status_code}")
    result = response.json()
    print(f"Response: {json.dumps(result, indent=2)}")
    
    if response.status_code == 200:
        return result.get('access_token')
    return None

def test_profile(token):
    """Testa endpoint de perfil"""
    print("\n👤 Testando Perfil do Usuário...")
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/api/user/profile", headers=headers)
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    return response.status_code == 200

def test_preferences(token):
    """Testa endpoint de preferências"""
    print("\n⚙️ Testando Preferências do Usuário...")
    headers = {"Authorization": f"Bearer {token}"}
    
    # GET preferences
    response = requests.get(f"{BASE_URL}/api/user/preferences", headers=headers)
    print(f"GET Status: {response.status_code}")
    print(f"GET Response: {json.dumps(response.json(), indent=2)}")
    
    # PUT preferences
    data = {
        "theme": "dark",
        "notifications_enabled": False
    }
    response = requests.put(f"{BASE_URL}/api/user/preferences", json=data, headers=headers)
    print(f"PUT Status: {response.status_code}")
    print(f"PUT Response: {json.dumps(response.json(), indent=2)}")
    
    return response.status_code == 200

def test_stats():
    """Testa estatísticas da API"""
    print("\n📊 Testando Estatísticas da API...")
    response = requests.get(f"{BASE_URL}/api/utils/stats")
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    return response.status_code == 200

def main():
    """Executa todos os testes"""
    print("🚀 Iniciando testes da API Capivara AI Backend\n")
    
    tests_passed = 0
    total_tests = 0
    
    # Teste 1: Health Check
    total_tests += 1
    if test_health():
        tests_passed += 1
        print("✅ Health Check passou")
    else:
        print("❌ Health Check falhou")
    
    # Teste 2: API Info
    total_tests += 1
    if test_info():
        tests_passed += 1
        print("✅ API Info passou")
    else:
        print("❌ API Info falhou")
    
    # Teste 3: Registro
    total_tests += 1
    if test_register():
        tests_passed += 1
        print("✅ Registro passou")
    else:
        print("❌ Registro falhou")
    
    # Teste 4: Login
    total_tests += 1
    token = test_login()
    if token:
        tests_passed += 1
        print("✅ Login passou")
    else:
        print("❌ Login falhou")
        token = None
    
    # Testes que requerem autenticação
    if token:
        # Teste 5: Perfil
        total_tests += 1
        if test_profile(token):
            tests_passed += 1
            print("✅ Perfil passou")
        else:
            print("❌ Perfil falhou")
        
        # Teste 6: Preferências
        total_tests += 1
        if test_preferences(token):
            tests_passed += 1
            print("✅ Preferências passou")
        else:
            print("❌ Preferências falhou")
    
    # Teste 7: Estatísticas
    total_tests += 1
    if test_stats():
        tests_passed += 1
        print("✅ Estatísticas passou")
    else:
        print("❌ Estatísticas falhou")
    
    # Resultado final
    print(f"\n📊 Resultado dos Testes:")
    print(f"✅ Passou: {tests_passed}/{total_tests}")
    print(f"❌ Falhou: {total_tests - tests_passed}/{total_tests}")
    
    if tests_passed == total_tests:
        print("\n🎉 Todos os testes passaram! API funcionando perfeitamente!")
        return 0
    else:
        print(f"\n⚠️ {total_tests - tests_passed} teste(s) falharam. Verifique os logs acima.")
        return 1

if __name__ == "__main__":
    sys.exit(main())

