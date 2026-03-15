from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Player, News, Tournament, UserProfile, ChatHistory, TournamentParticipation, Match, HeadToHead, SeasonStats
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


class UserSerializer(serializers.ModelSerializer):
    is_admin = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'is_admin')
    
    def get_is_admin(self, obj):
        try:
            return obj.userprofile.is_admin
        except UserProfile.DoesNotExist:
            return False

class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = UserProfile
        fields = '__all__'

class UserProfileUpdateSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(source='user.first_name', required=False)
    last_name = serializers.CharField(source='user.last_name', required=False)
    email = serializers.EmailField(source='user.email', required=False)
    
    class Meta:
        model = UserProfile
        fields = ['language', 'notifications_enabled', 'first_name', 'last_name', 'email']
    
    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', {})
        
        # Обновляем данные пользователя
        if user_data:
            user = instance.user
            for attr, value in user_data.items():
                setattr(user, attr, value)
            user.save()
        
        # Обновляем профиль
        return super().update(instance, validated_data)

# serializers.py
class AdminUserSerializer(serializers.ModelSerializer):
    # Добавляем поля из User напрямую
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)
    date_joined = serializers.DateTimeField(source='user.date_joined', read_only=True)
    last_login = serializers.DateTimeField(source='user.last_login', read_only=True)
    
    class Meta:
        model = UserProfile
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'is_admin', 'language', 'notifications_enabled', 
            'date_joined', 'last_login', 'favorite_players'
        ]


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'first_name', 'last_name')
    
    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        return user

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        return token

class PlayerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Player
        fields = '__all__'

class NewsSerializer(serializers.ModelSerializer):
    class Meta:
        model = News
        fields = '__all__'

class TournamentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tournament
        fields = '__all__'





class ChatHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatHistory
        fields = '__all__'

class TournamentParticipationSerializer(serializers.ModelSerializer):
    player_name = serializers.CharField(source='player.name', read_only=True)
    tournament_name = serializers.CharField(source='tournament.name', read_only=True)
    
    class Meta:
        model = TournamentParticipation
        fields = '__all__'
        read_only_fields = ['id']

class MatchSerializer(serializers.ModelSerializer):
    player1_name = serializers.CharField(source='player1.name', read_only=True)
    player2_name = serializers.CharField(source='player2.name', read_only=True)
    winner_name = serializers.CharField(source='winner.name', read_only=True)
    tournament_name = serializers.CharField(source='tournament.name', read_only=True)
    
    class Meta:
        model = Match
        fields = '__all__'
        read_only_fields = ['id']

class HeadToHeadSerializer(serializers.ModelSerializer):
    player1_name = serializers.CharField(source='player1.name', read_only=True)
    player2_name = serializers.CharField(source='player2.name', read_only=True)
    player1_image = serializers.CharField(source='player1.image_url', read_only=True)
    player2_image = serializers.CharField(source='player2.image_url', read_only=True)
    
    class Meta:
        model = HeadToHead
        fields = '__all__'
        read_only_fields = ['id']

class SeasonStatsSerializer(serializers.ModelSerializer):
    player_name = serializers.CharField(source='player.name', read_only=True)
    
    class Meta:
        model = SeasonStats
        fields = '__all__'
        read_only_fields = ['id']

class PlayerDetailSerializer(serializers.ModelSerializer):
    """Детальный сериализатор для игрока со всеми связанными данными"""
    tournaments = TournamentParticipationSerializer(source='tournamentparticipation_set', many=True, read_only=True)
    matches_as_player1 = MatchSerializer(many=True, read_only=True)
    matches_as_player2 = MatchSerializer(many=True, read_only=True)
    matches_won = MatchSerializer(many=True, read_only=True)
    head_to_head_as_player1 = HeadToHeadSerializer(many=True, read_only=True)
    head_to_head_as_player2 = HeadToHeadSerializer(many=True, read_only=True)
    season_stats = SeasonStatsSerializer(many=True, read_only=True)
    win_rate = serializers.FloatField(read_only=True)
    total_matches = serializers.IntegerField(read_only=True)
    surface_preference = serializers.CharField(read_only=True)
    
    class Meta:
        model = Player
        fields = '__all__'
        read_only_fields = ['id', 'created_at']