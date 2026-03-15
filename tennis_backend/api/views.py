from rest_framework import viewsets, status, generics
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import action
from rest_framework import permissions

from django.contrib.auth.models import User
from .models import Player, News, Tournament, UserProfile, ChatHistory, Match, HeadToHead
from .serializers import (
    UserSerializer, RegisterSerializer, PlayerSerializer,
    NewsSerializer, TournamentSerializer, UserProfileSerializer,
    ChatHistorySerializer, MatchSerializer, HeadToHeadSerializer,
    PlayerDetailSerializer, UserProfileUpdateSerializer
)
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.db.models import Q
import google.generativeai as genai
from django.conf import settings
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from .serializers import AdminUserSerializer
genai.configure(api_key=settings.GEMINI_API_KEY)

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Create user profile
        UserProfile.objects.create(user=user)
        
        # Generate tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)
class UserProfileDetailView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            profile = UserProfile.objects.get(user=request.user)
            serializer = UserProfileSerializer(profile)
            return Response(serializer.data)
        except UserProfile.DoesNotExist:
            # Создаем профиль, если его нет
            profile = UserProfile.objects.create(user=request.user)
            serializer = UserProfileSerializer(profile)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    def put(self, request):
        try:
            profile = UserProfile.objects.get(user=request.user)
        except UserProfile.DoesNotExist:
            profile = UserProfile.objects.create(user=request.user)
        
        # Обрабатываем данные пользователя
        user_data = {}
        if 'first_name' in request.data:
            user_data['first_name'] = request.data.get('first_name')
            request.data.pop('first_name', None)
        if 'last_name' in request.data:
            user_data['last_name'] = request.data.get('last_name')
            request.data.pop('last_name', None)
        if 'email' in request.data:
            user_data['email'] = request.data.get('email')
            request.data.pop('email', None)
        
        # Обновляем пользователя
        if user_data:
            user = request.user
            for key, value in user_data.items():
                setattr(user, key, value)
            user.save()
        
        # Обновляем профиль
        serializer = UserProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            
            # Возвращаем обновленные данные
            updated_profile = UserProfile.objects.get(user=request.user)
            full_serializer = UserProfileSerializer(updated_profile)
            return Response(full_serializer.data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
class UserProfileViewSet(viewsets.ModelViewSet):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action in ['update', 'partial_update']:
            return UserProfileUpdateSerializer
        return UserProfileSerializer
    
    def get_queryset(self):
        return UserProfile.objects.filter(user=self.request.user)
    
    def get_object(self):
        return self.request.user.userprofile
    
    def list(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response([serializer.data])
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return UserProfile.objects.filter(user=self.request.user)
    
    def get_object(self):
        # Получаем профиль текущего пользователя
        return self.request.user.userprofile
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        # Обрабатываем данные пользователя отдельно
        user_data = {}
        if 'first_name' in request.data:
            user_data['first_name'] = request.data.pop('first_name', '')
        if 'last_name' in request.data:
            user_data['last_name'] = request.data.pop('last_name', '')
        if 'email' in request.data:
            user_data['email'] = request.data.pop('email', '')
        
        # Обновляем пользователя
        if user_data:
            for attr, value in user_data.items():
                setattr(instance.user, attr, value)
            instance.user.save()
        
        # Обновляем профиль
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        return Response(serializer.data)
    
    def list(self, request, *args, **kwargs):
        # Возвращаем профиль текущего пользователя в виде списка из одного элемента
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response([serializer.data])
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return UserProfile.objects.filter(user=self.request.user)

class PlayerViewSet(viewsets.ModelViewSet):
    queryset = Player.objects.all()
    serializer_class = PlayerSerializer
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def atp(self, request):
        players = Player.objects.filter(gender='ATP').order_by('rank')[:100]
        serializer = self.get_serializer(players, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def wta(self, request):
        players = Player.objects.filter(gender='WTA').order_by('rank')[:100]
        serializer = self.get_serializer(players, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def top_players(self, request):
        atp_top = Player.objects.filter(gender='ATP').order_by('rank')[:10]
        wta_top = Player.objects.filter(gender='WTA').order_by('rank')[:10]
        
        atp_serializer = self.get_serializer(atp_top, many=True)
        wta_serializer = self.get_serializer(wta_top, many=True)
        
        return Response({
            'atp_top': atp_serializer.data,
            'wta_top': wta_serializer.data
        })

class PlayerDetailView(generics.RetrieveAPIView):
    """Детальное представление игрока со всей статистикой"""
    queryset = Player.objects.all()
    serializer_class = PlayerDetailSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'

class NewsViewSet(viewsets.ModelViewSet):
    queryset = News.objects.all()
    serializer_class = NewsSerializer
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def featured(self, request):
        news = News.objects.all()[:5]
        serializer = self.get_serializer(news, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def increment_views(self, request, pk=None):
        news = self.get_object()
        news.views += 1
        news.save()
        return Response({'views': news.views})

class TournamentViewSet(viewsets.ModelViewSet):
    queryset = Tournament.objects.all()
    serializer_class = TournamentSerializer
    permission_classes = [IsAuthenticated]

class MatchViewSet(viewsets.ModelViewSet):
    queryset = Match.objects.all()
    serializer_class = MatchSerializer
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def player_matches(self, request):
        player_id = request.query_params.get('player_id')
        if player_id:
            matches = Match.objects.filter(
                Q(player1_id=player_id) | Q(player2_id=player_id)
            ).order_by('-date')
            serializer = self.get_serializer(matches, many=True)
            return Response(serializer.data)
        return Response([])
    
    @action(detail=False, methods=['get'])
    def recent_matches(self, request):
        matches = Match.objects.all().order_by('-date')[:20]
        serializer = self.get_serializer(matches, many=True)
        return Response(serializer.data)

class HeadToHeadViewSet(viewsets.ModelViewSet):
    queryset = HeadToHead.objects.all()
    serializer_class = HeadToHeadSerializer
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def get_h2h(self, request):
        player1_id = request.query_params.get('player1_id')
        player2_id = request.query_params.get('player2_id')
        
        if player1_id and player2_id:
            try:
                h2h = HeadToHead.objects.get(
                    Q(player1_id=player1_id, player2_id=player2_id) |
                    Q(player1_id=player2_id, player2_id=player1_id)
                )
                serializer = self.get_serializer(h2h)
                return Response(serializer.data)
            except HeadToHead.DoesNotExist:
                return Response({'message': 'No head-to-head record found'})
        return Response({'error': 'player1_id and player2_id required'}, status=400)

class ChatBotView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        message = request.data.get('message', '')
        
        if not message:
            return Response({'error': 'Message is required'}, status=400)
        
        try:
            # Initialize Gemini model
            model = genai.GenerativeModel('gemini-2.5-flash')
            
            # Create tennis-specific prompt
            prompt = f"""You are a tennis expert AI assistant. Only answer questions related to tennis.
            If the question is not about tennis, politely decline to answer.
            
            User question: {message}
            
            Tennis-specific response:"""
            
            response = model.generate_content(prompt)
            
            # Save chat history
            ChatHistory.objects.create(
                user=request.user,
                message=message,
                response=response.text
            )
            
            return Response({
                'response': response.text
            })
            
        except Exception as e:
            return Response({'error': str(e)}, status=500)
    
    def get(self, request):
        history = ChatHistory.objects.filter(user=request.user).order_by('-created_at')[:50]
        serializer = ChatHistorySerializer(history, many=True)
        return Response(serializer.data)
    
class IsAdminUser(permissions.BasePermission):
    """Разрешение только для администраторов"""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and hasattr(request.user, 'userprofile') and request.user.userprofile.is_admin

class AdminUserListView(generics.ListAPIView):
    """Список всех пользователей (только для админов)"""
    serializer_class = AdminUserSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def get_queryset(self):
        return UserProfile.objects.select_related('user').all().order_by('-user__date_joined')

class AdminUserDetailView(generics.RetrieveUpdateAPIView):
    """Детали пользователя (только для админов)"""
    serializer_class = AdminUserSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    queryset = UserProfile.objects.all()
    
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        
        # Разрешаем админу менять is_admin статус
        if 'is_admin' in request.data:
            instance.is_admin = request.data['is_admin']
            instance.save()
        
        # Обновляем остальные поля
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        return Response(serializer.data)
    
def make_user_admin(request):
    """Функция для создания первого админа (использовать через shell)"""
    if not request.user.is_superuser:
        return Response({'error': 'Только суперпользователь может выполнить это действие'}, status=403)
    
    username = request.data.get('username')
    try:
        user = User.objects.get(username=username)
        profile, created = UserProfile.objects.get_or_create(user=user)
        profile.is_admin = True
        profile.save()
        return Response({'message': f'Пользователь {username} теперь администратор'})
    except User.DoesNotExist:
        return Response({'error': f'Пользователь {username} не найден'}, status=404)