"""
Скрипт для создания администратора
Использование: python create_admin.py <username> [password]
"""

import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tennis_backend.settings')
django.setup()

from django.contrib.auth.models import User
from api.models import UserProfile

def create_admin(username, password=None):
    """Создает или обновляет пользователя как администратора"""
    
    try:
        # Пытаемся найти существующего пользователя
        user = User.objects.get(username=username)
        print(f"Найден существующий пользователь: {username}")
        
        if password:
            user.set_password(password)
            user.save()
            print(f"Пароль обновлен для {username}")
            
    except User.DoesNotExist:
        # Создаем нового пользователя
        if not password:
            print("Для нового пользователя требуется пароль!")
            print("Использование: python create_admin.py <username> <password>")
            sys.exit(1)
        
        user = User.objects.create_user(
            username=username,
            email=f'{username}@example.com',
            password=password
        )
        print(f"Создан новый пользователь: {username}")
    
    # Создаем или обновляем профиль
    profile, created = UserProfile.objects.get_or_create(user=user)
    profile.is_admin = True
    profile.save()
    
    if created:
        print(f"Создан новый профиль для {username}")
    
    print(f"Пользователь {username} назначен администратором")
    print(f"Email: {user.email}")
    if password:
        print(f"Пароль: {password}")
    
    return user

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Использование: python create_admin.py <username> [password]")
        print("\nПримеры:")
        print("  python create_admin.py admin_user admin123")  # новый пользователь
        print("  python create_admin.py existing_user")  # существующий пользователь
        sys.exit(1)
    
    username = sys.argv[1]
    password = sys.argv[2] if len(sys.argv) > 2 else None
    
    create_admin(username, password)