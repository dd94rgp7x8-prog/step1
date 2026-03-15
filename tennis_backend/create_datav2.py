import os
import django
from datetime import date, timedelta
import random
from django.db import transaction
from decimal import Decimal

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tennis_backend.settings')
django.setup()

from django.contrib.auth.models import User
from api.models import Player, News, Tournament, UserProfile, TournamentParticipation, Match, HeadToHead, SeasonStats

def get_players_from_first_version():
    """Получаем игроков из первой версии заполнения"""
    atp_players = [
        {
            'name': 'Carlos Alcaraz',
            'country': 'Spain',
            'rank': 1,
            'points': 12050,
            'gender': 'ATP',
            'age': 22,
            'coach': 'Juan Carlos Ferrero',
            'wins': 250,
            'losses': 60,
            'image_url': 'https://avatars.mds.yandex.net/i?id=b72b323eed3db9e5cfc1e3803bf724ef226dd370-4274925-images-thumbs&n=13',
            'biography': 'World No. 1 ATP in 2025, French Open & US Open winner, known for powerful all‑court game.'
        },
        {
            'name': 'Jannik Sinner',
            'country': 'Italy',
            'rank': 2,
            'points': 11500,
            'gender': 'ATP',
            'age': 24,
            'coach': 'Domenico Tiso',
            'wins': 220,
            'losses': 70,
            'image_url': 'https://avatars.mds.yandex.net/i?id=f9738d3202e59b295044513828a8a90ba1c7bdcf-4937366-images-thumbs&n=13',
            'biography': 'World No. 2 with consistent Grand Slam finals appearances in 2025.'
        },
        {
            'name': 'Alexander Zverev',
            'country': 'Germany',
            'rank': 3,
            'points': 5160,
            'gender': 'ATP',
            'age': 28,
            'coach': 'David Ferrer',
            'wins': 180,
            'losses': 120,
            'image_url': 'https://avatars.mds.yandex.net/i?id=3e1f8edf1ffeb7a95c1b32d64ba07a3eddbe8c7a-4012775-images-thumbs&n=13',
            'biography': 'Top 5 ATP player, strong presence at Masters events.'
        },
        {
            'name': 'Novak Djokovic',
            'country': 'Serbia',
            'rank': 4,
            'points': 4830,
            'gender': 'ATP',
            'age': 38,
            'coach': 'Goran Ivanišević',
            'wins': 1082,
            'losses': 212,
            'image_url': 'https://avatars.mds.yandex.net/i?id=4859e56eb5eaebbe0689ab26c6e239ab9536b81b-4903160-images-thumbs&n=13',
            'biography': 'Legendary 24‑time Grand Slam champion, still competitive in 2025.'
        },
        {
            'name': 'Felix Auger‑Aliassime',
            'country': 'Canada',
            'rank': 5,
            'points': 4245,
            'gender': 'ATP',
            'age': 25,
            'coach': 'Frédéric Niemeyer',
            'wins': 160,
            'losses': 110,
            'image_url': 'https://avatars.mds.yandex.net/i?id=7fafa048a7a298eefdb8d6e0a855c86a4b1a689e-6405784-images-thumbs&n=13',
            'biography': 'Dynamic Canadian player with strong serve and baseline game.'
        },
        {
            'name': 'Taylor Fritz',
            'country': 'USA',
            'rank': 6,
            'points': 4135,
            'gender': 'ATP',
            'age': 28,
            'coach': 'Dante Bottini',
            'wins': 140,
            'losses': 100,
            'image_url': 'https://avatars.mds.yandex.net/i?id=bf8858e38ea4a6464e71dae05609229589ca18b8-9112075-images-thumbs&n=13',
            'biography': 'American contender with consistent tour results.'
        },
        {
            'name': 'Alex de Minaur',
            'country': 'Australia',
            'rank': 7,
            'points': 4135,
            'gender': 'ATP',
            'age': 26,
            'coach': 'Adrian Lewis',
            'wins': 155,
            'losses': 105,
            'image_url': 'https://avatars.mds.yandex.net/i?id=dc0fec33b45a0b5dd0a89cd4ee2bab92d56f48fb-4591973-images-thumbs&n=13',
            'biography': 'Speedy Australian known for defensive skills.'
        },
        {
            'name': 'Ben Shelton',
            'country': 'USA',
            'rank': 9,
            'points': 3970,
            'gender': 'ATP',
            'age': 23,
            'coach': 'Smyczek',
            'wins': 110,
            'losses': 80,
            'image_url': 'https://avatars.mds.yandex.net/i?id=806b9028aa1cd89d5402b02aaabe51e2cc8fdb7a-5177977-images-thumbs&n=13',
            'biography': 'Young American star with big serve and aggressive play.'
        },
    ]

    wta_players = [
        {
            'name': 'Aryna Sabalenka',
            'country': 'Belarus',
            'rank': 1,
            'points': 10870,
            'gender': 'WTA',
            'age': 27,
            'coach': 'Anton Dubrov',
            'wins': 280,
            'losses': 95,
            'image_url': 'https://avatars.mds.yandex.net/i?id=8efa7598babeca57fa5033c9de3e2e83fe82c975-11541841-images-thumbs&n=13',
            'biography': 'World No. 1 and WTA Player of the Year, multiple Slam titles in 2025 season.'
        },
        {
            'name': 'Iga Świątek',
            'country': 'Poland',
            'rank': 2,
            'points': 8395,
            'gender': 'WTA',
            'age': 24,
            'coach': 'Tomasz Wiktorowski',
            'wins': 270,
            'losses': 90,
            'image_url': 'https://avatars.mds.yandex.net/i?id=6dc734e23d6512364227479167bd31c38f522e85-10289922-images-thumbs&n=13',
            'biography': 'Former WTA No.1 and multiple Grand Slam champion.'
        },
        {
            'name': 'Coco Gauff',
            'country': 'USA',
            'rank': 3,
            'points': 6763,
            'gender': 'WTA',
            'age': 21,
            'coach': 'Bradley Gilbert',
            'wins': 240,
            'losses': 80,
            'image_url': 'https://avatars.mds.yandex.net/i?id=6c3d334661936b62000808e86816b03c27a772fa-5236434-images-thumbs&n=13',
            'biography': 'Rising star with strong baseline game and expanding brand presence.'
        },
        {
            'name': 'Amanda Anisimova',
            'country': 'USA',
            'rank': 4,
            'points': 6287,
            'gender': 'WTA',
            'age': 24,
            'coach': 'Bradley Gilbert',
            'wins': 190,
            'losses': 100,
            'image_url': 'https://avatars.mds.yandex.net/i?id=9ea335605bb5b956f6e7363103eff6d96da0752a-5234139-images-thumbs&n=13',
            'biography': 'Breakout season in 2025 with first WTA 1000 titles and deep Slam runs.'
        },
        {
            'name': 'Elena Rybakina',
            'country': 'Kazakhstan',
            'rank': 5,
            'points': 5850,
            'gender': 'WTA',
            'age': 26,
            'coach': 'Viktor Ryzhkin',
            'wins': 205,
            'losses': 95,
            'image_url': 'https://avatars.mds.yandex.net/i?id=fd0bc619035b9a0d91b44c4bc1125cae552db94b-7052560-images-thumbs&n=13',
            'biography': 'Kazakh champion with powerful serve and Slam title history.'
        },
        {
            'name': 'Mirra Andreeva',
            'country': 'Russia',
            'rank': 7,
            'points': 4335,
            'gender': 'WTA',
            'age': 17,
            'coach': 'Yuri Yusuf',
            'wins': 120,
            'losses': 65,
            'image_url': 'https://avatars.mds.yandex.net/i?id=bec47a88caffaf8ac212b702075cc4b5_l-5222119-images-thumbs&n=13',
            'biography': 'Young Russian talent making waves on the WTA Tour.'
        },
        {
            'name': 'Madison Keys',
            'country': 'USA',
            'rank': 8,
            'points': 4325,
            'gender': 'WTA',
            'age': 29,
            'coach': 'David Taylor',
            'wins': 240,
            'losses': 140,
            'image_url': 'https://avatars.mds.yandex.net/i?id=0c8fbe2ed82c0c99c65b8749fb2db677c1265930-3887998-images-thumbs&n=13',
            'biography': 'American with powerful groundstrokes and big serve.'
        },
        {
            'name': 'Victoria Mboko',
            'country': 'Canada',
            'rank': 18,
            'points': 1800,
            'gender': 'WTA',
            'age': 19,
            'coach': 'Nathalie Tauziat',
            'wins': 130,
            'losses': 50,
            'image_url': 'https://avatars.mds.yandex.net/i?id=c7c5ee868106232cddb6f9c6bfb00433_l-5236483-images-thumbs&n=13',
            'biography': 'Fast‑rising Canadian teen and breakout star.'
        },
        {
            'name': 'Marta Kostyuk',
            'country': 'Ukraine',
            'rank': 26,
            'points': 1500,
            'gender': 'WTA',
            'age': 23,
            'coach': 'Talina Beiko',
            'wins': 180,
            'losses': 120,
            'image_url': 'https://pressball.by/wp-content/uploads/entities/stories/2025/05/37079img_6408.jpeg',
            'biography': 'Experienced Ukrainian competitor with solid tour results.'
        },
    ]
    
    return atp_players + wta_players

def generate_strengths(player):
    """Генерирует сильные стороны на основе биографии"""
    strengths = []
    bio_lower = player['biography'].lower()
    
    if 'serve' in bio_lower:
        strengths.append('Powerful serve')
    if 'forehand' in bio_lower or 'groundstrokes' in bio_lower:
        strengths.append('Strong groundstrokes')
    if 'defensive' in bio_lower or 'speedy' in bio_lower:
        strengths.append('Excellent court coverage')
    if 'all‑court' in bio_lower or 'all-court' in bio_lower:
        strengths.append('Versatile all-court game')
    if 'mental' in bio_lower or 'toughness' in bio_lower:
        strengths.append('Mental toughness')
    if 'powerful' in bio_lower:
        strengths.append('Powerful shots')
    if 'creative' in bio_lower or 'shot-making' in bio_lower:
        strengths.append('Creative shot-making')
    
    if not strengths:
        strengths = ['Consistency', 'Athleticism', 'Competitive spirit']
    
    return ', '.join(strengths)

def generate_weaknesses(player):
    """Генерирует слабые стороны"""
    weaknesses = []
    
    if player['age'] < 21:
        weaknesses.append('Experience in big moments')
    if 'double fault' in player.get('biography', '').lower():
        weaknesses.append('Double faults under pressure')
    if 'emotional' in player.get('biography', '').lower():
        weaknesses.append('Emotional control')
    if 'inconsistent' in player.get('biography', '').lower():
        weaknesses.append('Consistency')
    
    if not weaknesses:
        weaknesses = ['Can be inconsistent', 'Net play']
    
    return ', '.join(weaknesses)

def generate_career_highlights(player):
    """Генерирует карьерные достижения"""
    highlights = []
    
    if player['rank'] == 1:
        highlights.append(f"World No. 1 in {date.today().year}")
    elif player['rank'] <= 3:
        highlights.append(f"Top 3 player in {date.today().year}")
    elif player['rank'] <= 10:
        highlights.append(f"Top 10 player in {date.today().year}")
    
    if player['wins'] > 200:
        highlights.append(f"Over {player['wins']} career match wins")
    
    if 'grand slam' in player['biography'].lower() or 'slam' in player['biography'].lower():
        highlights.append("Grand Slam champion")
    elif 'final' in player['biography'].lower():
        highlights.append("Grand Slam finalist")
    
    if player['age'] < 25 and player['rank'] <= 10:
        highlights.append("Youngest player in top 10")
    
    if not highlights:
        highlights = [f"Career-high ranking #{player['rank']}", 
                     f"Represented {player['country']} in international competitions"]
    
    return '; '.join(highlights)

def enhance_player_data(base_player_data):
    """Дополняем базовые данные игроков дополнительной статистикой"""
    enhanced_data = []
    
    # Определяем дополнительные поля для каждого игрока
    for player in base_player_data:
        enhanced_player = player.copy()
        
        # Добавляем обязательные поля для модели
        enhanced_player['tournaments_played'] = random.randint(30, 100)
        
        # Добавляем детальную статистику
        enhanced_player['height'] = random.randint(175, 200) if player['gender'] == 'ATP' else random.randint(165, 185)
        enhanced_player['weight'] = random.randint(70, 85) if player['gender'] == 'ATP' else random.randint(55, 70)
        enhanced_player['plays'] = random.choice(['Right-handed (two-handed backhand)', 
                                                 'Right-handed (one-handed backhand)',
                                                 'Left-handed (two-handed backhand)',
                                                 'Left-handed (one-handed backhand)'])
        enhanced_player['turned_pro'] = player['age'] - random.randint(3, 8)
        enhanced_player['career_prize_money'] = Decimal(str(random.randint(1000000, 50000000)))
        
        # Статистика по матчам
        enhanced_player['ace_count'] = random.randint(200, 2500)
        enhanced_player['double_faults'] = random.randint(50, 1000)
        enhanced_player['break_points_saved'] = round(random.uniform(50, 80), 1)
        enhanced_player['first_serve_percentage'] = round(random.uniform(55, 75), 1)
        
        # Победы по покрытиям (с учетом реальных сильных сторон)
        total_wins = player['wins']
        
        # Определяем предпочтительное покрытие на основе биографии
        bio_lower = player['biography'].lower()
        if 'clay' in bio_lower or 'french' in bio_lower:
            clay_wins = int(total_wins * 0.5)
            hard_wins = int(total_wins * 0.3)
            grass_wins = total_wins - clay_wins - hard_wins
        elif 'hard' in bio_lower or 'us open' in bio_lower or 'australian' in bio_lower:
            hard_wins = int(total_wins * 0.6)
            clay_wins = int(total_wins * 0.2)
            grass_wins = total_wins - hard_wins - clay_wins
        elif 'grass' in bio_lower or 'wimbledon' in bio_lower:
            grass_wins = int(total_wins * 0.5)
            hard_wins = int(total_wins * 0.3)
            clay_wins = total_wins - grass_wins - hard_wins
        else:
            hard_wins = int(total_wins * 0.4)
            clay_wins = int(total_wins * 0.4)
            grass_wins = int(total_wins * 0.2)
        
        enhanced_player['hard_wins'] = max(1, hard_wins)
        enhanced_player['clay_wins'] = max(1, clay_wins)
        enhanced_player['grass_wins'] = max(1, grass_wins)
        
        # Достижения (на основе рейтинга)
        if player['rank'] <= 3:
            enhanced_player['best_ranking'] = 1
            enhanced_player['weeks_at_no1'] = random.randint(10, 100)
            enhanced_player['grand_slam_titles'] = random.randint(1, 5)
        elif player['rank'] <= 10:
            enhanced_player['best_ranking'] = random.randint(2, 5)
            enhanced_player['weeks_at_no1'] = 0
            enhanced_player['grand_slam_titles'] = random.randint(0, 2)
        else:
            enhanced_player['best_ranking'] = random.randint(6, player['rank'])
            enhanced_player['weeks_at_no1'] = 0
            enhanced_player['grand_slam_titles'] = random.randint(0, 1)
        
        enhanced_player['masters_titles'] = random.randint(0, 10)
        enhanced_player['atp_finals_titles'] = random.randint(0, 2) if player['gender'] == 'ATP' else 0
        
        # Интересные факты
        enhanced_player['strengths'] = generate_strengths(player)
        enhanced_player['weaknesses'] = generate_weaknesses(player)
        enhanced_player['favorite_tournament'] = random.choice(['Australian Open', 'French Open', 
                                                               'Wimbledon', 'US Open', 'Indian Wells'])
        enhanced_player['career_highlights'] = generate_career_highlights(player)
        
        enhanced_data.append(enhanced_player)
    
    return enhanced_data

def create_players():
    print("Creating players from both versions with detailed statistics...")
    
    # Очистка старых данных
    Match.objects.all().delete()
    TournamentParticipation.objects.all().delete()
    HeadToHead.objects.all().delete()
    SeasonStats.objects.all().delete()
    Player.objects.all().delete()
    
    # Получаем игроков из первой версии
    first_version_players = get_players_from_first_version()
    
    # Дополняем их данными для второй версии
    enhanced_players = enhance_player_data(first_version_players)
    
    # Создаем игроков в базе данных
    created_players = []
    for player_data in enhanced_players:
        try:
            player = Player.objects.create(**player_data)
            created_players.append(player)
            print(f"Created player: {player.name} ({player.gender}) - Rank {player.rank}")
        except Exception as e:
            print(f"Error creating player {player_data['name']}: {str(e)}")
    
    print(f"\nTotal players created: {len(created_players)}")
    return created_players

def create_tournaments_and_matches(players):
    print("\nCreating tournaments and matches...")    
    tournaments_data = [
        {
            'name': 'Australian Open 2025',
            'location': 'Melbourne, Australia',
            'start_date': date(2025, 1, 15),
            'end_date': date(2025, 1, 28),
            'surface': 'Hard',
            'prize_money': Decimal('80000000'),
            'category': 'Grand Slam',
            'description': 'The first Grand Slam of the year, played on hard courts at Melbourne Park.',
            'capacity': 15000,
            'image_url': 'https://fmf.md/cdn/news/spectacol-total-la-australian-open-12093-1736888971.jpg'
        },
        {
            'name': 'French Open 2025',
            'location': 'Paris, France',
            'start_date': date(2025, 5, 25),
            'end_date': date(2025, 6, 8),
            'surface': 'Clay',
            'prize_money': Decimal('43000000'),
            'category': 'Grand Slam',
            'description': 'The premier clay court tournament played at Roland Garros.',
            'capacity': 15000,
            'image_url': 'https://avatars.mds.yandex.net/i?id=fc51ca4a6991d3a6fa83b378550611e0a4483f5a-3643797-images-thumbs&n=13'
        },
        {
            'name': 'Wimbledon 2025',
            'location': 'London, UK',
            'start_date': date(2025, 7, 1),
            'end_date': date(2025, 7, 14),
            'surface': 'Grass',
            'prize_money': Decimal('45000000'),
            'category': 'Grand Slam',
            'description': 'The oldest and most prestigious tennis tournament in the world.',
            'capacity': 15000,
            'image_url': 'https://i.ytimg.com/vi/YYjpcJEQ9EI/maxresdefault.jpg?sqp=-oaymwEmCIAKENAF8quKqQMa8AEB-AH-CYAC0AWKAgwIABABGFggSihlMA8=&rs=AOn4CLAqLmSZr7Y3SFiJwcljapDaY_4FMA'
        },
        {
            'name': 'US Open 2025',
            'location': 'New York, USA',
            'start_date': date(2025, 8, 26),
            'end_date': date(2025, 9, 8),
            'surface': 'Hard',
            'prize_money': Decimal('60000000'),
            'category': 'Grand Slam',
            'description': 'The final Grand Slam of the year, known for its energetic atmosphere.',
            'capacity': 23771,
            'image_url': 'https://avatars.mds.yandex.net/i?id=95d165c7f94d5ff6204c59d28db597051974e742-8339915-images-thumbs&n=13'
        }
    ]
    
    tournaments = []
    for tournament_data in tournaments_data:
        tournament = Tournament.objects.create(**tournament_data)
        tournaments.append(tournament)
        
        # Разделяем игроков по гендеру для соответствующих турниров
        gender_filter = 'ATP' if 'ATP' in tournament.name or tournament.category == 'Grand Slam' else 'WTA'
        participants = [p for p in players if p.gender == gender_filter]
        
        # Берем топ-32 игрока по рейтингу
        sorted_participants = sorted(participants, key=lambda p: p.rank)[:32]
        
        # Создаем записи об участии
        for i, player in enumerate(sorted_participants):
            position = i + 1
            if position == 1:
                prize_money = tournament.prize_money * Decimal('0.15')
                points_earned = 2000
            elif position == 2:
                prize_money = tournament.prize_money * Decimal('0.075')
                points_earned = 1200
            elif position <= 4:
                prize_money = tournament.prize_money * Decimal('0.04')
                points_earned = 720
            elif position <= 8:
                prize_money = tournament.prize_money * Decimal('0.025')
                points_earned = 360
            elif position <= 16:
                prize_money = tournament.prize_money * Decimal('0.015')
                points_earned = 180
            else:
                prize_money = tournament.prize_money * Decimal('0.01')
                points_earned = 90
            
            TournamentParticipation.objects.create(
                tournament=tournament,
                player=player,
                position=position,
                prize_money_earned=prize_money,
                points_earned=points_earned,
                matches_won=min(6, 7 - position // 2),
                matches_lost=1 if position <= 2 else random.randint(1, 3)
            )
        
        print(f"Created tournament: {tournament.name} with {len(sorted_participants)} participants")
    
    # Создаем матчи между игроками
    print("\nCreating matches between players...")
    
    for tournament in tournaments:
        # Получаем участников турнира
        participants = list(tournament.participants.all())
        
        if len(participants) < 2:
            continue
        
        # Создаем финальный матч (между топ-2 игроками)
        if len(participants) >= 2:
            final_players = sorted(participants, key=lambda p: p.rank)[:2]
            create_match(final_players[0], final_players[1], tournament, 'Final')
        
        # Создаем полуфиналы (между следующими топ-игроками)
        if len(participants) >= 4:
            semifinal_players = sorted(participants, key=lambda p: p.rank)[2:4]
            create_match(semifinal_players[0], semifinal_players[1], tournament, 'Semifinal')
        
        # Создаем четвертьфиналы
        if len(participants) >= 8:
            quarter_players = sorted(participants, key=lambda p: p.rank)[4:8]
            for i in range(0, len(quarter_players), 2):
                if i + 1 < len(quarter_players):
                    create_match(quarter_players[i], quarter_players[i + 1], tournament, 'Quarterfinal')
    
    print(f"Total matches created: {Match.objects.count()}")

def create_match(player1, player2, tournament, round_name):
    """Создает матч между двумя игроками"""
    # Определяем победителя (обычно игрок с более высоким рейтингом, но с небольшим шансом на сенсацию)
    if random.random() > 0.3:  # 70% шанс что победит более высокий рейтинг
        winner = player1 if player1.rank < player2.rank else player2
    else:
        winner = player2 if player1.rank < player2.rank else player1
    
    # Генерируем счет
    sets = []
    if round_name == 'Final':
        num_sets = 5 if player1.gender == 'ATP' else 3
    else:
        num_sets = 3
    
    for set_num in range(num_sets):
        # Создаем реалистичный счет
        if set_num < 2 or (winner == player1 and random.random() > 0.5):
            # Победитель выигрывает большинство сетов
            winner_games = random.randint(6, 7)
            loser_games = random.randint(3, 5)
        else:
            # Проигравший выигрывает один сет
            winner_games = random.randint(4, 6)
            loser_games = 6
        
        sets.append(f"{winner_games}-{loser_games}")
    
    match = Match.objects.create(
        tournament=tournament,
        player1=player1,
        player2=player2,
        winner=winner,
        date=tournament.start_date + timedelta(days=random.randint(0, tournament.duration_days - 1)),
        round=round_name,
        surface=tournament.surface,
        sets=sets,
        duration_minutes=random.randint(90, 240),
        total_points=random.randint(120, 280),
        player1_aces=random.randint(3, 15),
        player2_aces=random.randint(3, 15),
        player1_double_faults=random.randint(1, 6),
        player2_double_faults=random.randint(1, 6),
        player1_break_points=random.randint(2, 8),
        player2_break_points=random.randint(2, 8),
        player1_first_serve_percentage=round(random.uniform(55, 75), 1),
        player2_first_serve_percentage=round(random.uniform(55, 75), 1),
        attendance=random.randint(5000, tournament.capacity) if tournament.capacity else random.randint(5000, 15000),
        highlights=f"Exciting {round_name.lower()} match between {player1.name} and {player2.name}."
    )
    
    # Обновляем статистику Head-to-Head
    update_head_to_head(player1, player2, winner, match)
    
    return match

def update_head_to_head(player1, player2, winner, match):
    """Обновляет статистику встреч между двумя игроками"""
    # Проверяем существующую запись
    h2h = HeadToHead.objects.filter(player1=player1, player2=player2).first()
    if not h2h:
        h2h = HeadToHead.objects.filter(player1=player2, player2=player1).first()
        if h2h:
            # Меняем местами если найдено в обратном порядке
            player1, player2 = player2, player1
        else:
            # Создаем новую запись
            h2h = HeadToHead.objects.create(
                player1=player1,
                player2=player2,
                total_matches=0,
                player1_wins=0,
                player2_wins=0
            )
    
    h2h.total_matches += 1
    if winner == player1:
        h2h.player1_wins += 1
    else:
        h2h.player2_wins += 1
    h2h.last_meeting = match
    h2h.save()

def create_season_stats(players):
    print("\nCreating season statistics...")
    
    for player in players:
        # Создаем статистику за последние 3 сезона
        for year in [2023, 2024, 2025]:
            # Рассчитываем статистику на основе данных игрока
            total_wins = player.wins
            total_losses = player.losses
            
            # Распределяем победы по сезонам
            if year == 2025:
                wins = int(total_wins * 0.4)
                losses = int(total_losses * 0.4)
            elif year == 2024:
                wins = int(total_wins * 0.35)
                losses = int(total_losses * 0.35)
            else:  # 2023
                wins = total_wins - int(total_wins * 0.4) - int(total_wins * 0.35)
                losses = total_losses - int(total_losses * 0.4) - int(total_losses * 0.35)
            
            # Проверяем, существует ли уже статистика для этого сезона
            existing_stats = SeasonStats.objects.filter(player=player, season_year=year).first()
            if existing_stats:
                continue
            
            stats = SeasonStats.objects.create(
                player=player,
                season_year=year,
                matches_played=wins + losses,
                wins=wins,
                losses=losses,
                hard_wins=int(wins * (player.hard_wins / max(1, player.wins))),
                hard_losses=int(losses * 0.4),
                clay_wins=int(wins * (player.clay_wins / max(1, player.wins))),
                clay_losses=int(losses * 0.3),
                grass_wins=int(wins * (player.grass_wins / max(1, player.wins))),
                grass_losses=int(losses * 0.3),
                tournaments_played=player.tournaments_played // 3,
                titles_won=random.randint(0, 3),
                finals_reached=random.randint(1, 5),
                semifinals_reached=random.randint(2, 8),
                quarterfinals_reached=random.randint(3, 12),
                prize_money=player.career_prize_money / Decimal('3'),
                points_earned=player.points // 3,
                career_high_ranking=min(player.best_ranking or player.rank, player.rank)
            )
        
        print(f"Created season stats for {player.name}")

def create_interesting_facts():
    print("\nCreating interesting facts and features...")
    
    players = Player.objects.all()
    
    print("\n🎾 INTERESTING TENNIS FACTS 🎾")
    print("=" * 50)
    if players.exists():
        most_aces = max(players, key=lambda p: p.ace_count)
        best_serve_percentage = max(players, key=lambda p: p.first_serve_percentage)
        highest_win_rate = max(players, key=lambda p: p.win_rate)
        youngest_player = min(players, key=lambda p: p.age)
        oldest_player = max(players, key=lambda p: p.age)
        
        print(f"\n📊 Statistical Leaders:")
        print(f"  Most aces: {most_aces.name} - {most_aces.ace_count} aces")
        print(f"  Best first serve: {best_serve_percentage.name} - {best_serve_percentage.first_serve_percentage:.1f}%")
        print(f"  Highest win rate: {highest_win_rate.name} - {highest_win_rate.win_rate:.1f}%")
        print(f"  Youngest player: {youngest_player.name} - {youngest_player.age} years")
        print(f"  Oldest player: {oldest_player.name} - {oldest_player.age} years")
    
    print(f"\n🤝 Notable Rivalries:")
    h2h_records = HeadToHead.objects.all().order_by('-total_matches')[:5]
    for h2h in h2h_records:
        print(f"  {h2h.player1.name} vs {h2h.player2.name}: {h2h.player1_wins}-{h2h.player2_wins} ({h2h.player1_win_percentage:.1f}%)")
    
    print(f"\n🏆 Tournament Winners:")
    tournaments = Tournament.objects.all()
    for tournament in tournaments:
        # Проверяем, есть ли победитель
        participations = TournamentParticipation.objects.filter(tournament=tournament, position=1)
        if participations.exists():
            winner = participations.first().player
            print(f"  {tournament.name}: {winner.name}")
    
    return True

def create_news():
    print("\nCreating news articles...")
    
    News.objects.all().delete()
    
    players = Player.objects.order_by('rank')[:2] 
    
    news_items = []
    
    for player in players:
        news_items.append({
            'title': f'{player.name} Dominates {date.today().year} Season',
            'content': f'{player.name} from {player.country} has been one of the standout players of the {date.today().year} season. With a win rate of {player.win_rate:.1f}%, they have demonstrated exceptional skill and consistency. {player.biography}',
            'summary': f'{player.name} shows exceptional form in {date.today().year}.',
            'image_url': player.image_url,
            'category': player.gender,
            'author': 'Tennis Reporter',
            'published_date': date.today() - timedelta(days=random.randint(1, 30)),
            'views': random.randint(500, 3000)
        })
    
    # Добавляем общие новости
    news_items.extend([
        {
            'title': 'Tennis Season 2025 Kicks Off with Exciting Matches',
            'content': 'The 2025 tennis season has started with thrilling matches and surprising upsets. Players are showing exceptional form early in the season.',
            'summary': 'Exciting start to the 2025 tennis season.',
            'image_url': 'https://livesport-ott-images.ssl.cdn.cra.cz/r900xfq60/3a7a9ddf-13ab-4d52-97ce-fb133a03b71f.jpeg',
            'category': 'General',
            'author': 'Sports Journalist',
            'published_date': date.today() - timedelta(days=2),
            'views': random.randint(1000, 5000)
        },
        {
            'title': 'New Generation of Tennis Stars Emerges',
            'content': 'Young players are making their mark on the tour, challenging established champions and bringing fresh energy to the sport.',
            'summary': 'Young talents shine on ATP and WTA tours.',
            'image_url': 'https://www.puntodebreak.com/sites/default/files/styles/epsa_detail_thumbail/public/2025-01/nueva-generacion-tenistas.jpg?h=f0fe448e&itok=zGluY0-o',
            'category': 'General',
            'author': 'Tennis Analyst',
            'published_date': date.today() - timedelta(days=7),
            'views': random.randint(800, 2500)
        },
        {
            'title': 'Carlos Alcaraz Dominates 2025 Season, Reclaims World No.1',
            'content': 'Carlos Alcaraz finished the 2025 season ranked No.1 with multiple major titles including the US Open and French Open...',
            'summary': 'Alcaraz ends 2025 as ATP World No.1 with stellar results.',
            'image_url': 'https://avatars.mds.yandex.net/i?id=c3653a428bd0b00d559b5bec6846a18df7259dd5-7998976-images-thumbs&n=13',
            'category': 'ATP',
            'author': 'Tennis Reporter',
            'published_date': date.today() - timedelta(days=5),
            'views': random.randint(800, 1500)
        },
        {
            'title': 'Sabalenka Named WTA Player of the Year',
            'content': 'Aryna Sabalenka was named WTA Player of the Year for a second straight season, leading the tour in match wins and titles...',
            'summary': 'Sabalenka dominates WTA in 2025.',
            'image_url': 'https://avatars.mds.yandex.net/i?id=673da5cbf185365256027a6cc82f8c69b724bd6a-5236752-images-thumbs&n=13',
            'category': 'WTA',
            'author': 'Tennis Insider',
            'published_date': date.today() - timedelta(days=1),
            'views': random.randint(1500, 3000)
        }
    ])
    
    for news_data in news_items:
        News.objects.create(**news_data)
    
    print(f"Created {len(news_items)} news articles")

def main():
    print("=" * 60)
    print("🎾 COMPREHENSIVE TENNIS DATA CREATION (COMBINED VERSION) 🎾")
    print("=" * 60)
    
    try:
        print("\n🗑️  Cleaning old data...")
        
        Match.objects.all().delete()
        HeadToHead.objects.all().delete()
        TournamentParticipation.objects.all().delete()
        SeasonStats.objects.all().delete()
        News.objects.all().delete()
        Tournament.objects.all().delete()
        Player.objects.all().delete()
        
        print("Database cleared successfully!")
        
        players = create_players()
        create_tournaments_and_matches(players)
        create_season_stats(players)
        create_interesting_facts()
        create_news()
        
        print("\n" + "=" * 60)
        print("✅ DATA CREATION COMPLETE!")
        print("=" * 60)
        print("\n📊 Summary:")
        print(f"  Players: {Player.objects.count()}")
        print(f"  Tournaments: {Tournament.objects.count()}")
        print(f"  Matches: {Match.objects.count()}")
        print(f"  Head-to-Head records: {HeadToHead.objects.count()}")
        print(f"  Season Stats: {SeasonStats.objects.count()}")
        print(f"  News articles: {News.objects.count()}")
        
        # Демонстрация некоторых фишек
        print("\n✨ DEMO FEATURES:")
        demo_player = Player.objects.first()
        if demo_player:
            print(f"\nSample Player: {demo_player.name}")
            print(f"  Rank: #{demo_player.rank}")
            print(f"  Country: {demo_player.country}")
            print(f"  Age: {demo_player.age}")
            print(f"  Win Rate: {demo_player.win_rate:.1f}%")
            print(f"  Surface Preference: {demo_player.surface_preference}")
            print(f"  Career Highlights: {demo_player.career_highlights}")
            print(f"  Strengths: {demo_player.strengths}")
            print(f"  Weaknesses: {demo_player.weaknesses}")
        
        print("\n🎉 Data is ready! You now have:")
        print("  1. Players with detailed statistics from both versions")
        print("  2. Tournament participation records")
        print("  3. Match history with realistic scores")
        print("  4. Head-to-Head rivalries")
        print("  5. Season-by-season stats")
        print("  6. Interesting facts and records")
        print("  7. Latest news articles")
        
    except Exception as e:
        print(f"\n❌ Error occurred: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    with transaction.atomic():
        main()