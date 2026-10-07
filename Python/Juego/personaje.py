import pygame
import os
import math
import random
from constantes import ASSETS_PATH, LASER_SPEED, ENEMY_SPEED, STRONG_ENEMY_SPEED, ENEMY_BULLET_SPEED


class Personaje:
    PLAYER_SIZE = (90, 76)
    HITBOX_SIZE = (20, 20)

    def __init__(self, x, y):
        raw = pygame.image.load(os.path.join(ASSETS_PATH, 'images', 'Player 119x100.png')).convert_alpha()
        self.image = pygame.transform.scale(raw, self.PLAYER_SIZE)
        self.shape = self.image.get_rect(center=(x, y))
        self.hitbox = pygame.Rect(0, 0, *self.HITBOX_SIZE)
        self.hitbox.center = self.shape.center
        self.lasers = []
        self.energia = 100

    def mover(self, dx, dy):
        self.shape.x += dx
        self.shape.y += dy
        self.hitbox.center = self.shape.center

    def update_hitbox(self):
        self.hitbox.center = self.shape.center

    def lanzar_laser(self):
        self.lasers.append(Laser(self.shape.centerx, self.shape.top))

    def recibir_dano(self):
        self.energia -= 10
        if self.energia <= 0:
            self.energia = 0
            return False
        return True

    def dibujar(self, screen):
        screen.blit(self.image, self.shape.topleft)
        for laser in self.lasers:
            laser.dibujar(screen)
            laser.mover()

        barra_fondo = pygame.Rect(10, 10, 100, 10)
        barra_vida = pygame.Rect(10, 10, self.energia, 10)
        pygame.draw.rect(screen, (180, 30, 30), barra_fondo)
        pygame.draw.rect(screen, (50, 220, 80), barra_vida)


class BalaEnemiga:
    SIZE = (16, 16)
    
    def __init__(self, x, y, target_x, target_y, is_triple=False):
        image_name = 'Enemy-Bullet2.png' if is_triple else 'Enemy-Bullet.png'
        raw = pygame.image.load(os.path.join(ASSETS_PATH, 'images', 'bullets', image_name)).convert_alpha()
        self.image = pygame.transform.scale(raw, self.SIZE)
        self.rect = self.image.get_rect(center=(x, y))
        
        vec = pygame.math.Vector2(target_x - x, target_y - y)
        if vec.length() != 0:
            vec.normalize_ip()
        else:
            vec = pygame.math.Vector2(0, 1)
            
        self.velocity = vec * ENEMY_BULLET_SPEED

    def mover(self):
        self.rect.x += self.velocity.x
        self.rect.y += self.velocity.y

    def dibujar(self, screen):
        screen.blit(self.image, self.rect.topleft)


class Enemigo:
    ENEMY_SIZE = (76, 64)

    def __init__(self, x, y):
        raw = pygame.image.load(os.path.join(ASSETS_PATH, 'images', 'Enemy 119x100.png')).convert_alpha()
        self.image = pygame.transform.scale(raw, self.ENEMY_SIZE)
        self.rect = self.image.get_rect(topleft=(x, y))
        self.hp = 1
        self.puntos = 10
        self.is_strong = False

    def recibir_dano(self):
        self.hp -= 1
        return self.hp <= 0

    def mover(self):
        self.rect.y += ENEMY_SPEED

    def update(self, player_x, player_y):
        self.mover()
        return []

    def dibujar(self, screen):
        screen.blit(self.image, self.rect.topleft)


class EnemigoFuerte(Enemigo):
    STRONG_SIZE = (91, 77)

    def __init__(self, x, y):
        super().__init__(x, y)
        raw = pygame.image.load(os.path.join(ASSETS_PATH, 'images', 'Enemy 119x100.png')).convert_alpha()
        base = pygame.transform.scale(raw, self.STRONG_SIZE)
        tint = pygame.Surface(base.get_size(), pygame.SRCALPHA)
        tint.fill((220, 60, 60, 90))
        base.blit(tint, (0, 0))
        self.image = base
        self.rect = self.image.get_rect(topleft=(x, y))
        self.hp = 3
        self.puntos = 30
        self.is_strong = True
        self.target_y = random.randint(80, 250)
        self.cooldown_disparo = random.randint(80, 140)

    def mover(self):
        if self.rect.y < self.target_y:
            self.rect.y += STRONG_ENEMY_SPEED

    def update(self, player_x, player_y):
        self.mover()
        balas = []
        if self.rect.y >= self.target_y:
            self.cooldown_disparo -= 1
            if self.cooldown_disparo <= 0:
                is_triple = random.choice([True, False])
                if is_triple:
                    vec_center = pygame.math.Vector2(player_x - self.rect.centerx, player_y - self.rect.bottom)
                    if vec_center.length() != 0:
                        vec_center.normalize_ip()
                    else:
                        vec_center = pygame.math.Vector2(0, 1)
                        
                    angles = [-15, 0, 15]
                    for angle in angles:
                        vec_rotated = vec_center.rotate(angle)
                        target_bx = self.rect.centerx + vec_rotated.x * 100
                        target_by = self.rect.bottom + vec_rotated.y * 100
                        balas.append(BalaEnemiga(self.rect.centerx, self.rect.bottom, target_bx, target_by, True))
                else:
                    balas.append(BalaEnemiga(self.rect.centerx, self.rect.bottom, player_x, player_y, False))
                self.cooldown_disparo = random.randint(90, 150)
        return balas


class Laser:
    LASER_SIZE = (16, 16)

    def __init__(self, x, y):
        raw = pygame.image.load(os.path.join(ASSETS_PATH, 'images', 'bullets', 'Player-Bullet.png')).convert_alpha()
        self.image = pygame.transform.scale(raw, self.LASER_SIZE)
        self.rect = self.image.get_rect(center=(x, y))

    def mover(self):
        self.rect.y -= LASER_SPEED

    def dibujar(self, screen):
        screen.blit(self.image, self.rect.topleft)


class Explosion:
    FRAME_COUNT = 9
    FRAMES_PER_IMAGE = 4
    EXPLOSION_SIZE = (96, 96)

    def __init__(self, x, y):
        self.images = [
            pygame.transform.scale(
                pygame.image.load(os.path.join(ASSETS_PATH, 'images', 'explosion', f'{i}.png')).convert_alpha(),
                self.EXPLOSION_SIZE
            )
            for i in range(1, self.FRAME_COUNT + 1)
        ]
        self.index = 0
        self.image = self.images[self.index]
        self.rect = self.image.get_rect(center=(x, y))
        self.frame_timer = 0

    def actualizar(self):
        self.frame_timer += 1
        if self.frame_timer >= self.FRAMES_PER_IMAGE:
            self.frame_timer = 0
            self.index += 1
            if self.index >= len(self.images):
                return False
            self.image = self.images[self.index]
        return True

    def dibujar(self, screen):
        screen.blit(self.image, self.rect.topleft)