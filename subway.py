import pygame
import random
import os
import json
import time

# Initialisation de Pygame
pygame.init()

# Dimensions de la fenêtre
WIDTH, HEIGHT = 600, 436
win = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("Runner de Quêtes")

# Couleurs
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
RED = (255, 0, 0)
GREEN = (0, 255, 0)
BLUE = (0, 0, 255)

# Charger les images
player_imgs = [pygame.image.load(f'player_{i}.png') for i in range(1, 5)]
obstacle_img = pygame.image.load('obstacle.png')
coin_img = pygame.image.load('coin.png')
background_imgs = [pygame.image.load(f'background_{i}.png') for i in range(1, 4)]
powerup_imgs = {
    'invincibility': pygame.image.load('powerup_invincibility.png'),
    'magnet': pygame.image.load('powerup_magnet.png'),
    'double_jump': pygame.image.load('powerup_double_jump.png')
}

# Charger les sons
pygame.mixer.music.load('background_music.mp3')
pygame.mixer.music.play(-1)
collision_sound = pygame.mixer.Sound('collision.wav')
coin_sound = pygame.mixer.Sound('coin.wav')
powerup_sound = pygame.mixer.Sound('powerup.wav')
achievement_sound = pygame.mixer.Sound('achievement.mp3')
jump_sound = pygame.mixer.Sound('jump.mp3')
level_up_sound = pygame.mixer.Sound('level_up.wav')
slide_sound = pygame.mixer.Sound('slide.mp3')

# Classe pour le Joueur
class Player:
    def __init__(self):
        self.images = [pygame.transform.scale(img, (50, 50)) for img in player_imgs]
        self.index = 0
        self.image = self.images[self.index]
        self.rect = self.image.get_rect()
        self.rect.center = (WIDTH // 2, HEIGHT - 60)
        self.speed = 5
        self.jump_speed = 10
        self.is_jumping = False
        self.gravity = 1
        self.coins_collected = 0
        self.powered_up = None
        self.powerup_time = 0
        self.lives = 3
        self.score_multiplier = 1
        self.achievements = set()
        self.can_double_jump = False
        self.double_jump_used = False
        self.customization = {
            'color': 'default',
            'hat': None,
            'outfit': None
        }

    def move(self, dx=0):
        self.rect.x += dx
        if self.rect.left < 0:
            self.rect.left = 0
        if self.rect.right > WIDTH:
            self.rect.right = WIDTH

    def jump(self):
        if not self.is_jumping:
            jump_sound.play()
            self.is_jumping = True
            self.jump_speed = -15
        elif self.can_double_jump and not self.double_jump_used:
            jump_sound.play()
            self.double_jump_used = True
            self.jump_speed = -15

    def apply_gravity(self):
        if self.is_jumping:
            self.rect.y += self.jump_speed
            self.jump_speed += self.gravity
            if self.rect.bottom >= HEIGHT - 60:
                self.rect.bottom = HEIGHT - 60
                self.is_jumping = False
                self.double_jump_used = False

    def update(self):
        self.index = (self.index + 1) % len(self.images)
        self.image = self.images[self.index]
        if self.powered_up and pygame.time.get_ticks() > self.powerup_time:
            self.powered_up = None
            self.can_double_jump = False
        if self.powered_up == 'magnet':
            for coin in game.coins:
                if self.rect.colliderect(coin.rect):
                    coin_sound.play()
                    self.coins_collected += 1
                    game.coins.remove(coin)
                    game.coins.append(Coin())

    def draw(self, win):
        win.blit(self.image, self.rect)

    def slide(self):
        self.rect.height = 25
        slide_sound.play()
        pygame.time.set_timer(pygame.USEREVENT + 1, 1000)

    def restore_height(self):
        self.rect.height = 50

    def customize(self, attribute, value):
        if attribute in self.customization:
            self.customization[attribute] = value

# Classe pour les Objets (Obstacles)
class Obstacle:
    def __init__(self):
        self.image = pygame.transform.scale(obstacle_img, (50, 50))
        self.rect = self.image.get_rect()
        self.rect.x = random.randint(0, WIDTH - self.rect.width)
        self.rect.y = random.randint(-100, -40)
        self.speed = random.randint(4, 8)

    def move(self):
        self.rect.y += self.speed
        if self.rect.top > HEIGHT:
            self.rect.x = random.randint(0, WIDTH - self.rect.width)
            self.rect.y = random.randint(-100, -40)
            self.speed = random.randint(4, 8)

    def draw(self, win):
        win.blit(self.image, self.rect)

# Classe pour les objets collectables (Coins)
class Coin:
    def __init__(self):
        self.image = pygame.transform.scale(coin_img, (30, 30))
        self.rect = self.image.get_rect()
        self.rect.x = random.randint(0, WIDTH - self.rect.width)
        self.rect.y = random.randint(-100, -40)
        self.speed = random.randint(4, 8)

    def move(self):
        self.rect.y += self.speed
        if self.rect.top > HEIGHT:
            self.rect.x = random.randint(0, WIDTH - self.rect.width)
            self.rect.y = random.randint(-100, -40)
            self.speed = random.randint(4, 8)

    def draw(self, win):
        win.blit(self.image, self.rect)

# Classe pour les power-ups
class PowerUp:
    def __init__(self, type):
        self.type = type
        self.image = pygame.transform.scale(powerup_imgs[type], (30, 30))
        self.rect = self.image.get_rect()
        self.rect.x = random.randint(0, WIDTH - self.rect.width)
        self.rect.y = random.randint(-100, -40)
        self.speed = random.randint(4, 8)

    def move(self):
        self.rect.y += self.speed
        if self.rect.top > HEIGHT:
            self.rect.x = random.randint(0, WIDTH - self.rect.width)
            self.rect.y = random.randint(-100, -40)
            self.speed = random.randint(4, 8)

    def draw(self, win):
        win.blit(self.image, self.rect)

# Classe pour les quêtes
class Quest:
    def __init__(self, description, goal, reward):
        self.description = description
        self.goal = goal
        self.reward = reward
        self.progress = 0
        self.completed = False

    def update_progress(self, amount):
        if not self.completed:
            self.progress += amount
            if self.progress >= self.goal:
                self.completed = True

    def draw(self, win, x, y):
        quest_text = f'{self.description} ({self.progress}/{self.goal}) - Reward: {self.reward}'
        font = pygame.font.SysFont(None, 24)
        text = font.render(quest_text, True, BLACK)
        win.blit(text, (x, y))

# Classe pour gérer le jeu
class Game:
    def __init__(self):
        self.clock = pygame.time.Clock()
        self.player = Player()
        self.obstacles = [Obstacle() for _ in range(5)]
        self.coins = [Coin() for _ in range(3)]
        self.powerups = [PowerUp(random.choice(['invincibility', 'magnet', 'double_jump'])) for _ in range(1)]
        self.quests = [
            Quest('Collect 10 coins', 10, 100),
            Quest('Run 1000 meters', 1000, 500)
        ]
        self.score = 0
        self.font = pygame.font.SysFont(None, 36)
        self.high_score = self.load_high_score()
        self.level = 1
        self.background_index = 0
        self.weather_effect = random.choice(['none', 'rain', 'snow'])
        self.tutorial_shown = False
        self.running = True
        self.paused = False
        self.shields = 1

    def save_high_score(self):
        with open('high_score.json', 'w') as f:
            json.dump({'high_score': self.high_score}, f)

    def load_high_score(self):
        if os.path.exists('high_score.json'):
            with open('high_score.json', 'r') as f:
                return json.load(f)['high_score']
        return 0

    def save_online_score(self):
        # Simuler l'enregistrement du score en ligne
        pass

    def load_online_scores(self):
        # Simuler le chargement des scores en ligne
        pass

    def draw_background(self):
        win.blit(background_imgs[self.background_index], (0, 0))

    def draw_score(self):
        score_text = self.font.render(f'Score: {self.score}', True, BLACK)
        high_score_text = self.font.render(f'High Score: {self.high_score}', True, BLACK)
        coins_text = self.font.render(f'Coins: {self.player.coins_collected}', True, BLACK)
        shields_text = self.font.render(f'Shields: {self.shields}', True, BLACK)
        win.blit(score_text, (10, 10))
        win.blit(high_score_text, (10, 50))
        win.blit(coins_text, (10, 90))
        win.blit(shields_text, (10, 130))

    def draw_quests(self):
        y = 10
        for quest in self.quests:
            quest.draw(win, WIDTH - 300, y)
            y += 40

    def check_collisions(self):
        for obstacle in self.obstacles:
            if self.player.rect.colliderect(obstacle.rect):
                if self.player.powered_up == 'invincibility':
                    continue
                collision_sound.play()
                self.player.lives -= 1
                if self.player.lives <= 0 and self.shields > 0:
                    self.shields -= 1
                    self.player.lives = 3
                elif self.player.lives <= 0 and self.shields <= 0:
                    self.running = False
        for coin in self.coins:
            if self.player.rect.colliderect(coin.rect):
                coin_sound.play()
                self.player.coins_collected += 1
                for quest in self.quests:
                    if quest.description == 'Collect 10 coins':
                        quest.update_progress(1)
                self.coins.remove(coin)
                self.coins.append(Coin())
        for powerup in self.powerups:
            if self.player.rect.colliderect(powerup.rect):
                powerup_sound.play()
                self.player.powered_up = powerup.type
                if powerup.type == 'double_jump':
                    self.player.can_double_jump = True
                self.player.powerup_time = pygame.time.get_ticks() + 5000
                self.powerups.remove(powerup)
                self.powerups.append(PowerUp(random.choice(['invincibility', 'magnet', 'double_jump'])))

    def increase_difficulty(self):
        for obstacle in self.obstacles:
            obstacle.speed += 0.01
        for coin in self.coins:
            coin.speed += 0.01
        for powerup in self.powerups:
            powerup.speed += 0.01

    def next_level(self):
        self.level += 1
        self.background_index = (self.background_index + 1) % len(background_imgs)
        for obstacle in self.obstacles:
            obstacle.speed += 1
        for coin in self.coins:
            coin.speed += 1
        for powerup in self.powerups:
            powerup.speed += 1
        level_up_sound.play()

    def apply_weather_effects(self):
        if self.weather_effect == 'rain':
            # Dessiner des gouttes de pluie
            pass
        elif self.weather_effect == 'snow':
            # Dessiner des flocons de neige
            pass

    def toggle_pause(self):
        self.paused = not self.paused

    def main_menu(self):
        menu_font = pygame.font.SysFont(None, 72)
        title_text = menu_font.render('Subway Surfers', True, BLACK)
        start_text = self.font.render('Press ENTER to Start', True, BLACK)

        while True:
            win.fill(WHITE)
            win.blit(title_text, (WIDTH // 2 - title_text.get_width() // 2, HEIGHT // 2 - 100))
            win.blit(start_text, (WIDTH // 2 - start_text.get_width() // 2, HEIGHT // 2))

            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    pygame.quit()
                    quit()
                if event.type == pygame.KEYDOWN:
                    if event.key == pygame.K_RETURN:
                        return

            pygame.display.update()
            self.clock.tick(15)

    def game_over_screen(self):
        over_font = pygame.font.SysFont(None, 72)
        over_text = over_font.render('Game Over', True, BLACK)
        restart_text = self.font.render('Press ENTER to Restart', True, BLACK)

        if self.score > self.high_score:
            self.high_score = self.score
            self.save_high_score()
            self.save_online_score()

        while True:
            win.fill(WHITE)
            win.blit(over_text, (WIDTH // 2 - over_text.get_width() // 2, HEIGHT // 2 - 100))
            win.blit(restart_text, (WIDTH // 2 - restart_text.get_width() // 2, HEIGHT // 2))

            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    pygame.quit()
                    quit()
                if event.type == pygame.KEYDOWN:
                    if event.key == pygame.K_RETURN:
                        self.__init__()
                        return

            pygame.display.update()
            self.clock.tick(15)

    def show_tutorial(self):
        if not self.tutorial_shown:
            tutorial_font = pygame.font.SysFont(None, 48)
            tutorial_text = tutorial_font.render('Use Arrow Keys to Move, Space to Jump, and Down to Slide', True, BLACK)
            win.fill(WHITE)
            win.blit(tutorial_text, (WIDTH // 2 - tutorial_text.get_width() // 2, HEIGHT // 2))
            pygame.display.update()
            pygame.time.wait(3000)
            self.tutorial_shown = True

    def achievement_unlocked(self, achievement):
        if achievement not in self.player.achievements:
            self.player.achievements.add(achievement)
            achievement_sound.play()
            print(f'Achievement unlocked: {achievement}')

    def shop_menu(self):
        shop_font = pygame.font.SysFont(None, 48)
        shop_text = shop_font.render('Shop - Buy Upgrades', True, BLACK)
        coin_text = self.font.render(f'Coins: {self.player.coins_collected}', True, BLACK)

        while True:
            win.fill(WHITE)
            win.blit(shop_text, (WIDTH // 2 - shop_text.get_width() // 2, HEIGHT // 2 - 100))
            win.blit(coin_text, (10, 10))
            # Ajouter les éléments de la boutique ici

            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    pygame.quit()
                    quit()
                if event.type == pygame.KEYDOWN:
                    if event.key == pygame.K_ESCAPE:
                        return

            pygame.display.update()
            self.clock.tick(15)

    def main_loop(self):
        self.main_menu()
        self.show_tutorial()
        self.load_online_scores()

        while self.running:
            if not self.paused:
                self.clock.tick(30)
                for event in pygame.event.get():
                    if event.type == pygame.QUIT:
                        self.running = False
                    if event.type == pygame.KEYDOWN:
                        if event.key == pygame.K_SPACE:
                            self.player.jump()
                        if event.key == pygame.K_DOWN:
                            self.player.slide()
                        if event.key == pygame.K_p:
                            self.toggle_pause()
                        if event.key == pygame.K_s:
                            self.shop_menu()

                keys = pygame.key.get_pressed()
                if keys[pygame.K_LEFT]:
                    self.player.move(-self.player.speed)
                if keys[pygame.K_RIGHT]:
                    self.player.move(self.player.speed)

                self.player.apply_gravity()
                self.player.update()

                for obstacle in self.obstacles:
                    obstacle.move()
                for coin in self.coins:
                    coin.move()
                for powerup in self.powerups:
                    powerup.move()

                self.check_collisions()

                self.score += 1 * self.player.score_multiplier
                self.increase_difficulty()

                if self.score % 1000 == 0:
                    self.next_level()

                self.draw_background()
                self.player.draw(win)
                for obstacle in self.obstacles:
                    obstacle.draw(win)
                for coin in self.coins:
                    coin.draw(win)
                for powerup in self.powerups:
                    powerup.draw(win)
                self.draw_score()
                self.apply_weather_effects()
                self.draw_quests()

            else:
                pause_text = self.font.render('Paused', True, BLACK)
                win.blit(pause_text, (WIDTH // 2 - pause_text.get_width() // 2, HEIGHT // 2))

            pygame.display.update()

        self.game_over_screen()
        pygame.quit()

if __name__ == "__main__":
    game = Game()
    game.main_loop()
