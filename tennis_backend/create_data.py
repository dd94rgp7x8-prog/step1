import os
import django
from datetime import date, timedelta
import random

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tennis_backend.settings')
django.setup()

from django.contrib.auth.models import User
from api.models import Player, News, Tournament, UserProfile

def create_players():
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
            'image_url': 'https://static.flashscore.com/res/image/data/OfjQEPjl-EZcCkAic.png',
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
            'image_url': 'https://static.flashscore.com/res/image/data/zsxlv1jl-dEXkR0Wq.png',
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
            'image_url': 'https://static.flashscore.com/res/image/data/tO5cePjl-KATGX1RA.png',
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
            'image_url': 'https://static.flashscore.com/res/image/data/tSfwGCdM-KKWyfaNo.png',
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
            'image_url': 'https://static.flashscore.com/res/image/data/tSfwGCdM-KKWyfaNo.png',
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
            'image_url': 'https://static.flashscore.com/res/image/data/vDLwcnCa-8AMTtzu5.png',
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
            'image_url': 'https://static.flashscore.com/res/image/data/jcP2ujzB-CID30mRm.png',
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
            'image_url': 'https://static.flashscore.com/res/image/data/UBXM3cXg-fgTOwTv9.png',
            'biography': 'Young American star with big serve and aggressive play.' 
        },
        # дополнительные ATP игроки можно добавить аналогично...
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
            'image_url': 'https://static.flashscore.com/res/image/data/xhwEtyEa-I9HZAz1R.png',
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
            'image_url': 'https://static.flashscore.com/res/image/data/S2NdWdWg-tOt4Rhy2.png',
            'biography': 'Former WTA No.1 and multiple Grand Slam champion.' 
        },
        {
            'name': 'Coco Gauff',
            'country': 'USA',
            'rank': 3,
            'points': 6763,
            'gender': 'WTA',
            'age': 21,
            'coach': 'Bradley Gilbert',
            'wins': 240,
            'losses': 80,
            'image_url': 'https://cdn.tennisstats.com/img/players/coco-gauff.png',
            'biography': 'Rising star with strong baseline game and expanding brand presence.' 
        },
        {
            'name': 'Amanda Anisimova',
            'country': 'USA',
            'rank': 4,
            'points': 6287,
            'gender': 'WTA',
            'age': 24,
            'coach': 'Bradley Gilbert',
            'wins': 190,
            'losses': 100,
            'image_url': 'https://static.flashscore.com/res/image/data/Cfqk4yBr-SxjHCXS2.png',
            'biography': 'Breakout season in 2025 with first WTA 1000 titles and deep Slam runs.' 
        },
        {
            'name': 'Elena Rybakina',
            'country': 'Kazakhstan',
            'rank': 5,
            'points': 5850,
            'gender': 'WTA',
            'age': 26,
            'coach': 'Viktor Ryzhkin',
            'wins': 205,
            'losses': 95,
            'image_url': 'https://static.flashscore.com/res/image/data/nwc71xXg-2wyL104C.png',
            'biography': 'Kazakh champion with powerful serve and Slam title history.' 
        },
        {
            'name': 'Mirra Andreeva',
            'country': 'Russia',
            'rank': 7,
            'points': 4335,
            'gender': 'WTA',
            'age': 17,
            'coach': 'Yuri Yusuf',
            'wins': 120,
            'losses': 65,
            'image_url': 'https://static.flashscore.com/res/image/data/ncDnFmzB-xE40e4KN.png',
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
            'image_url': 'https://static.flashscore.com/res/image/data/I3KQvBYA-nqGgcXEd.png',
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
            'image_url': 'https://static.flashscore.com/res/image/data/hMQb5nWg-fPXtvMaL.png',
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
            'image_url': 'https://static.flashscore.com/res/image/data/4tS2p3YA-UcIohdpM.png',
            'biography': 'Experienced Ukrainian competitor with solid tour results.' 
        },
    ]

    for player_data in atp_players + wta_players:
        Player.objects.create(**player_data)

    print(f"Created {len(atp_players)} ATP and {len(wta_players)} WTA players")

def create_news():
    news_items = [
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
    ]

    for news_data in news_items:
        News.objects.create(**news_data)

    print(f"Created {len(news_items)} news articles")

def create_tournaments():
    tournaments = [
        {
            'name': 'Australian Open 2025',
            'location': 'Melbourne, Australia',
            'start_date': date(2025, 1, 15),
            'end_date': date(2025, 1, 28),
            'surface': 'Hard',
            'prize_money': 80000000,
            'category': 'Grand Slam'
        },
        {
            'name': 'French Open 2025',
            'location': 'Paris, France',
            'start_date': date(2025, 5, 25),
            'end_date': date(2025, 6, 8),
            'surface': 'Clay',
            'prize_money': 43000000,
            'category': 'Grand Slam'
        },
        {
            'name': 'Wimbledon 2025',
            'location': 'London, UK',
            'start_date': date(2025, 7, 1),
            'end_date': date(2025, 7, 14),
            'surface': 'Grass',
            'prize_money': 45000000,
            'category': 'Grand Slam'
        },
        {
            'name': 'US Open 2025',
            'location': 'New York, USA',
            'start_date': date(2025, 8, 26),
            'end_date': date(2025, 9, 8),
            'surface': 'Hard',
            'prize_money': 60000000,
            'category': 'Grand Slam'
        }
    ]

    for tournament_data in tournaments:
        Tournament.objects.create(**tournament_data)

    print(f"Created {len(tournaments)} tournaments")

if __name__ == '__main__':
    print("Creating initial data...")
    create_players()
    create_news()
    create_tournaments()
    print("Data creation complete!")
