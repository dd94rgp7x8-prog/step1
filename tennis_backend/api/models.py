from django.db import models
from django.contrib.auth.models import User
import uuid
from django.db.models.signals import post_save
from django.dispatch import receiver

class Player(models.Model):
    GENDER_CHOICES = [
        ('ATP', 'ATP'),
        ('WTA', 'WTA'),
    ]
    
    SURFACE_CHOICES = [
        ('Hard', 'Hard'),
        ('Clay', 'Clay'),
        ('Grass', 'Grass'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    country = models.CharField(max_length=100)
    rank = models.IntegerField()
    points = models.IntegerField()
    gender = models.CharField(max_length=3, choices=GENDER_CHOICES)
    age = models.IntegerField(null=True, blank=True)
    coach = models.CharField(max_length=200, null=True, blank=True)
    wins = models.IntegerField(default=0)
    losses = models.IntegerField(default=0)
    tournaments_played = models.IntegerField(default=0)  # Изменяем на Integer
    image_url = models.URLField(max_length=500)
    biography = models.TextField(null=True, blank=True)
    
    # Дополнительные статистические поля
    height = models.IntegerField(null=True, blank=True, help_text="Height in cm")
    weight = models.IntegerField(null=True, blank=True, help_text="Weight in kg")
    plays = models.CharField(max_length=100, null=True, blank=True, help_text="Playing style")
    turned_pro = models.IntegerField(null=True, blank=True)
    career_prize_money = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    
    # Статистика
    ace_count = models.IntegerField(default=0)
    double_faults = models.IntegerField(default=0)
    break_points_saved = models.FloatField(default=0.0)
    first_serve_percentage = models.FloatField(default=0.0)
    
    # Победы по покрытиям
    hard_wins = models.IntegerField(default=0)
    clay_wins = models.IntegerField(default=0)
    grass_wins = models.IntegerField(default=0)
    
    # Достижения
    best_ranking = models.IntegerField(null=True, blank=True)
    weeks_at_no1 = models.IntegerField(default=0)
    grand_slam_titles = models.IntegerField(default=0)
    masters_titles = models.IntegerField(default=0)
    atp_finals_titles = models.IntegerField(default=0)
    
    # Интересные факты
    strengths = models.TextField(null=True, blank=True)
    weaknesses = models.TextField(null=True, blank=True)
    favorite_tournament = models.CharField(max_length=200, null=True, blank=True)
    career_highlights = models.TextField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['rank']
    
    def __str__(self):
        return f"{self.name} ({self.gender}) - Rank {self.rank}"
    
    @property
    def win_rate(self):
        total_matches = self.wins + self.losses
        if total_matches == 0:
            return 0
        return (self.wins / total_matches) * 100
    
    @property
    def total_matches(self):
        return self.wins + self.losses
    
    @property
    def surface_preference(self):
        surfaces = {
            'Hard': self.hard_wins,
            'Clay': self.clay_wins,
            'Grass': self.grass_wins
        }
        return max(surfaces, key=surfaces.get) if any(surfaces.values()) else 'N/A'

class News(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=300)
    content = models.TextField()
    summary = models.TextField()
    image_url = models.URLField(max_length=500)
    category = models.CharField(max_length=100)
    author = models.CharField(max_length=200)
    published_date = models.DateField()
    views = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-published_date']
    
    def __str__(self):
        return self.title

class Tournament(models.Model):
    SURFACE_CHOICES = [
        ('Hard', 'Hard'),
        ('Clay', 'Clay'),
        ('Grass', 'Grass'),
        ('Carpet', 'Carpet'),
    ]
    
    CATEGORY_CHOICES = [
        ('Grand Slam', 'Grand Slam'),
        ('ATP Finals', 'ATP Finals'),
        ('WTA Finals', 'WTA Finals'),
        ('Masters 1000', 'Masters 1000'),
        ('WTA 1000', 'WTA 1000'),
        ('ATP 500', 'ATP 500'),
        ('WTA 500', 'WTA 500'),
        ('ATP 250', 'ATP 250'),
        ('WTA 250', 'WTA 250'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    location = models.CharField(max_length=200)
    start_date = models.DateField()
    end_date = models.DateField()
    surface = models.CharField(max_length=100, choices=SURFACE_CHOICES)
    prize_money = models.DecimalField(max_digits=12, decimal_places=2)
    category = models.CharField(max_length=100, choices=CATEGORY_CHOICES)
    winner = models.ForeignKey(Player, on_delete=models.SET_NULL, null=True, blank=True, related_name='tournament_wins')
    participants = models.ManyToManyField(Player, through='TournamentParticipation', related_name='tournaments_participated')
    image_url = models.URLField(max_length=500, null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    capacity = models.IntegerField(null=True, blank=True)
    total_matches = models.IntegerField(default=0)
    
    def __str__(self):
        return self.name
    
    @property
    def duration_days(self):
        return (self.end_date - self.start_date).days + 1

class TournamentParticipation(models.Model):
    """Промежуточная модель для участия в турнире"""
    tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE)
    player = models.ForeignKey(Player, on_delete=models.CASCADE)
    position = models.IntegerField(null=True, blank=True, help_text="Final position in tournament")
    prize_money_earned = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    points_earned = models.IntegerField(default=0)
    matches_won = models.IntegerField(default=0)
    matches_lost = models.IntegerField(default=0)
    notes = models.TextField(null=True, blank=True)
    
    class Meta:
        unique_together = ['tournament', 'player']
        ordering = ['position']
    
    def __str__(self):
        return f"{self.player.name} in {self.tournament.name}"

class Match(models.Model):
    """Модель для отдельных матчей"""
    SURFACE_CHOICES = [
        ('Hard', 'Hard'),
        ('Clay', 'Clay'),
        ('Grass', 'Grass'),
    ]
    
    ROUND_CHOICES = [
        ('Final', 'Final'),
        ('Semifinal', 'Semifinal'),
        ('Quarterfinal', 'Quarterfinal'),
        ('Round of 16', 'Round of 16'),
        ('Round of 32', 'Round of 32'),
        ('Round of 64', 'Round of 64'),
        ('Round of 128', 'Round of 128'),
        ('Qualifying', 'Qualifying'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE, related_name='matches')
    player1 = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='matches_as_player1')
    player2 = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='matches_as_player2')
    winner = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='matches_won', null=True, blank=True)
    
    date = models.DateField()
    round = models.CharField(max_length=50, choices=ROUND_CHOICES)
    surface = models.CharField(max_length=50, choices=SURFACE_CHOICES)
    
    # Счет
    sets = models.JSONField(default=list, help_text="List of set scores, e.g., [6-4, 7-5]")
    duration_minutes = models.IntegerField(null=True, blank=True)
    total_points = models.IntegerField(default=0)
    
    # Статистика
    player1_aces = models.IntegerField(default=0)
    player2_aces = models.IntegerField(default=0)
    player1_double_faults = models.IntegerField(default=0)
    player2_double_faults = models.IntegerField(default=0)
    player1_break_points = models.IntegerField(default=0)
    player2_break_points = models.IntegerField(default=0)
    player1_first_serve_percentage = models.FloatField(default=0.0)
    player2_first_serve_percentage = models.FloatField(default=0.0)
    
    highlights = models.TextField(null=True, blank=True)
    attendance = models.IntegerField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-date', 'tournament']
    
    def __str__(self):
        return f"{self.player1.name} vs {self.player2.name} - {self.tournament.name} ({self.round})"
    
    @property
    def score_summary(self):
        if not self.sets:
            return "Not played"
        return ", ".join([str(score) for score in self.sets])
    
    @property
    def is_completed(self):
        return self.winner is not None

class HeadToHead(models.Model):
    """Статистика встреч между двумя игроками"""
    player1 = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='head_to_head_as_player1')
    player2 = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='head_to_head_as_player2')
    total_matches = models.IntegerField(default=0)
    player1_wins = models.IntegerField(default=0)
    player2_wins = models.IntegerField(default=0)
    last_meeting = models.ForeignKey(Match, on_delete=models.SET_NULL, null=True, blank=True)
    
    class Meta:
        unique_together = ['player1', 'player2']
        verbose_name_plural = "Head to Head stats"
    
    def __str__(self):
        return f"{self.player1.name} vs {self.player2.name}: {self.player1_wins}-{self.player2_wins}"
    
    @property
    def player1_win_percentage(self):
        if self.total_matches == 0:
            return 0
        return (self.player1_wins / self.total_matches) * 100
    
    @property
    def player2_win_percentage(self):
        if self.total_matches == 0:
            return 0
        return (self.player2_wins / self.total_matches) * 100

class SeasonStats(models.Model):
    """Статистика игрока за сезон"""
    player = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='season_stats')
    season_year = models.IntegerField()
    
    # Общая статистика
    matches_played = models.IntegerField(default=0)
    wins = models.IntegerField(default=0)
    losses = models.IntegerField(default=0)
    
    # По покрытиям
    hard_wins = models.IntegerField(default=0)
    hard_losses = models.IntegerField(default=0)
    clay_wins = models.IntegerField(default=0)
    clay_losses = models.IntegerField(default=0)
    grass_wins = models.IntegerField(default=0)
    grass_losses = models.IntegerField(default=0)
    
    # Турниры
    tournaments_played = models.IntegerField(default=0)
    titles_won = models.IntegerField(default=0)
    finals_reached = models.IntegerField(default=0)
    semifinals_reached = models.IntegerField(default=0)
    quarterfinals_reached = models.IntegerField(default=0)
    
    # Дополнительно
    prize_money = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    points_earned = models.IntegerField(default=0)
    career_high_ranking = models.IntegerField(null=True, blank=True)
    
    class Meta:
        unique_together = ['player', 'season_year']
        ordering = ['-season_year']
    
    def __str__(self):
        return f"{self.player.name} - {self.season_year}"
    
    @property
    def win_rate(self):
        if self.matches_played == 0:
            return 0
        return (self.wins / self.matches_played) * 100

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    favorite_players = models.ManyToManyField(Player, blank=True)
    language = models.CharField(max_length=10, default='en')
    notifications_enabled = models.BooleanField(default=True)
    is_admin = models.BooleanField(default=False)
    
    def __str__(self):
        return self.user.username

class ChatHistory(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    message = models.TextField()
    response = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']

# Signal to create user profile automatically
@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    try:
        instance.userprofile.save()
    except UserProfile.DoesNotExist:
        UserProfile.objects.create(user=instance)